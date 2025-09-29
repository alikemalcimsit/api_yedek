import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';

export class ChatListController extends BaseController {
  constructor({ chatListService }) {
    super(chatListService);
  }

  // Controller'daki helper metodlar
  async markByMessageId({ messageId, value = 1 }) {
    return this.service.repository.prisma.chatlist.updateMany({
      where: { messageId: String(messageId) },
      data: { messageRead: Number(value) },
    });
  }

  async markAllByChatId({ chatId, value = 1 }) {
    return this.service.repository.prisma.chatlist.updateMany({
      where: { chatId: String(chatId) },
      data: { messageRead: Number(value) },
    });
  }

  async getMessagesByChatId({ chatId, order = 'desc', page, limit }) {
    return this.service.getMessagesByChatId({ chatId, order, page, limit });

    if (!dbClient || !modelAccess) {
      console.error('Prisma client veya model erişimi eksik:', {
        hasPrisma: !!prisma,
        hasDbClient: !!dbClient,
        hasModel: !!modelAccess,
      });
      throw new Error('Database client or model not available');
    }

    const ord = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';

    console.log('Repository parameters:', { chatId, order: ord, page, limit });

    const baseQuery = {
      where: { chatId: String(chatId) },
      select: {
        id: true,
        userSystemId: true,
        userPatientId: true,
        messageId: true,
        quotedMessageId: true,
        editedMessageId: true,
        channelId: true,
        chatType: true,
        isEcho: true,
        chatId: true,
        authorName: true,
        groupSender: true,
        groupChatId: true,
        dateTime: true,
        type: true,
        status: true,
        text: true,
        instPostSrc: true,
        contentUri: true,
        messageRead: true,
        // 👈 YENİ: userSystem join eklendi
        userSystem: {
          select: {
            username: true
          }
        }
      },
    };

    const finalPage = page && +page > 0 ? +page : 1;
    const finalLimit = limit && +limit > 0 ? Math.min(+limit, 500) : 20;

    const totalCount = await modelAccess.count({ where: baseQuery.where });

    const skip = (finalPage - 1) * finalLimit;
    const data = await modelAccess.findMany({
      ...baseQuery,
      orderBy: { dateTime: ord },
      skip,
      take: finalLimit,
    });

    const totalPages = Math.ceil(totalCount / finalLimit);
    const pagination = {
      currentPage: finalPage,
      pageSize: finalLimit,
      totalCount,
      totalPages,
      hasNextPage: finalPage < totalPages,
      hasPreviousPage: finalPage > 1,
    };

    const formattedData = data.map(r => {
      let wazzObj = {};
      try {
        if (r.wazz) {
          const parsed = JSON.parse(r.wazz);
          wazzObj = Array.isArray(parsed) ? parsed[0] : parsed;
        }
      } catch (e) {
        console.error('wazz parse hatası:', e);
      }
      console.log(" // debug // Formatted message:", r);

      return {
        // 👈 DEĞİŞTİRİLDİ: username artık userSystem'den geliyor
        username: r.userSystem?.username || '',
        language: 'TR',
        profileName: wazzObj?.contact?.name || '',
        id: r.id,
        messageId: r.messageId,
        quotedMessageId: r.quotedMessageId || '',
        editedMessageId: r.editedMessageId || '',
        channelId: r.channelId,
        chatId: r.chatId,
        groupSender: r.groupSender || '',
        groupChatId: r.groupChatId || '',
        isEcho: r.isEcho ? "1" : "0",
        chatType: r.chatType,
        dateTime: r.dateTime,
        type: r.type || 'text',
        status: r.status || '',
        text: r.text || '',
        instPostSrc: r.instPostSrc || '',
        contentUri: r.contentUri || null,
        messageRead: r.messageRead ?? 0,
      };
    });

    return { data: formattedData, pagination };
  }

  // ROUTE HANDLERlar - Bu metodlar eksikti!

  // GET /api/chat/users-sp
  getChatUsersWithStoredProcedure = asyncHandler(async (req, res) => {
      const userSystemId = req.query.userSystemId !== undefined ? Number(req.query.userSystemId) : null;
      const userRole = req.query.userRole !== undefined ? Number(req.query.userRole) : 0;
      const role = Number.isFinite(userRole) ? userRole : 0;
      const p = Number.parseInt(req.query.page, 10) || 1;
      const l = Math.min(Number.parseInt(req.query.limit, 10) || 20, 500);

      try {
        const data = await this.service.getChatUsersWithStoredProcedure({
          userSystemId,
          userRole: role,
          page: p,
          limit: l,
        });

        // Her chat için mesajları getir
        const dataWithMessages = await Promise.all(
          data.data.map(async item => {
            try {
              const messages = await this.service.getMessagesByChatId({
                chatId: String(item.chatId).trim(),
                order: 'desc',
                page: 1,
                limit: 20,
              });

              return {
                ...item,
                messages: messages
              };
            } catch (msgError) {
              console.error(`Chat ${item.chatId} mesajları getirilirken hata:`, msgError);
              return {
                ...item,
                messages: { success: false, data: [], pagination: null, error: msgError.message }
              };
            }
          })
        );

        res.json(dataWithMessages);
      } catch (error) {
        console.error('getChatUsersWithStoredProcedure controller hatası:', error);
        res.status(500).json({
          success: false,
          message: 'Stored procedure ile kullanıcı getirme işleminde hata oluştu',
          error: error.message
        });
      }
    });

  // PATCH /api/chat/read - Mesajları okundu olarak işaretle
  markMessagesRead = asyncHandler(async (req, res) => {
      const { messageId, chatId, read = true } = req.body;

      try {
        let result;

        if (messageId) {
          // Tek mesajı işaretle
          result = await this.service.markByMessageId({ messageId, read });
        } else if (chatId) {
          // Chat altındaki tüm mesajları işaretle
          result = await this.service.markAllByChatId({ chatId, read });
        } else {
          return res.status(400).json({
            success: false,
            message: 'messageId veya chatId gerekli'
          });
        }

        res.json({
          success: true,
          message: 'Mesajlar başarıyla güncellendi',
          ...result
        });
      } catch (error) {
        console.error('markMessagesRead hatası:', error);
        res.status(500).json({
          success: false,
          message: 'Mesaj güncelleme işleminde hata oluştu',
          error: error.message
        });
      }
    });

  // POST /api/chat/messages-by-chatid - ChatId'ye göre mesajları getir  
  getMessagesByChatIdHandler = asyncHandler(async (req, res) => {
      const {  order = 'desc', page, limit } = req.query;
      const { chatId } = req.body;
      if (!chatId) {
        return res.status(400).json({
          success: false,
          message: 'chatId gerekli'
        });
      }

      try {
        const messages = await this.service.getMessagesByChatId({
          chatId: String(chatId).trim(),
          order,
          page,
          limit
        });

        res.json(messages);
      } catch (error) {
        console.error('getMessagesByChatId hatası:', error);
        res.status(500).json({
          success: false,
          message: 'Mesajları getirme işleminde hata oluştu',
          error: error.message
        });
      }
    });

}
