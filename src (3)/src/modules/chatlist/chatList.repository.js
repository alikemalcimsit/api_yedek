import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class ChatListRepository extends BaseRepository {
   constructor() {
    super();
    this._modelName = 'chatlist';
  }


  async markByMessageId({ messageId, value = 1 }) {
    return this.prisma.chatlist.updateMany({
      where: { messageId: String(messageId) },
      data: { messageRead: Number(value) },
    });
  }

  // DÜZELTME: adminUsername için userSystem join eklendi
  // src/modules/chatlist/chatList.repository.js
  async getMessagesByChatId({ chatId, order = 'desc', page, limit }) {
    console.time('Total Query Time'); // Toplam süre başlangıç
    
    const modelAccess = this.prisma.chatlist;
    if (!modelAccess) {
      throw new Error('Database model not available');
    }

    // ✅ ORDER
    const ord = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';

    // ✅ SAYFALAMA (scope en üstte!)
    const finalPage = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const finalLimit = Number.isFinite(+limit) && +limit > 0 ? Math.min(+limit, 500) : 20;
    const skip = (finalPage - 1) * finalLimit;
    const take = finalLimit;

    // ✅ QUERY
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
        messageRead: true
      },
    };

    try {
      // 1) COUNT işlemi süresi
      console.time('Count Query');
      const totalCount = await modelAccess.count({ where: baseQuery.where });
      console.timeEnd('Count Query');

      // 2) DATA çekme süresi
      console.time('Find Messages Query');
      const rows = await modelAccess.findMany({
        ...baseQuery,
        orderBy: { dateTime: 'desc' },
        skip,
        take,
      });
      console.timeEnd('Find Messages Query');

      // 2.5) USERNAME batch lookup süresi
      console.time('Username Lookup');
      const rawIds = rows
        .map(r => r.userSystemId)
        .filter(v => v !== null && v !== undefined);

      let userMap = new Map();
      if (rawIds.length) {
        const idsNum = [...new Set(
          rawIds.map(v => {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }).filter(v => v !== null)
        )];

        const userRows = await this.prisma.usersystem.findMany({
          where: { id: { in: idsNum } },
          select: { id: true, username: true },
        });


 
        // Map'i Number key ile kur → 0 da eşleşir
        userMap = new Map(userRows.map(u => [Number(u.id), u.username]));
      }
      console.timeEnd('Username Lookup');

      // 3) PAGINATION hesaplama süresi
      console.time('Pagination Calculation');
      const totalPages = Math.max(1, Math.ceil(totalCount / finalLimit));
      const messagesPagination = {
        currentPage: finalPage,
        pageSize: finalLimit,
        totalCount,
        totalPages,
        hasNextPage: finalPage < totalPages,
        hasPreviousPage: finalPage > 1,
      };
      console.timeEnd('Pagination Calculation');

      // 4) FORMAT işlemi süresi
      console.time('Data Formatting');
      const formattedData = rows.map(r => {
        let wazzObj = {};
        try {
          if (r.wazz) {
            const parsed = JSON.parse(r.wazz);
            wazzObj = Array.isArray(parsed) ? parsed[0] : parsed;
          }
        } catch { /* ignore */ }

        return {
          username: userMap.get(Number(r.userSystemId)) || '',
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
          isEcho: r.isEcho ? '1' : '0',
          chatType: r.chatType,
          dateTime: r.dateTime,
          type: r.type || 'text',
          status: r.status || '',
          text: r.text || '',
          instPostSrc: r.instPostSrc || '',
          contentUri: r.contentUri || null,
          message_read: r.message_read ?? 0,
        };
      });


      return {
        data: formattedData.reverse(),
        pagination: messagesPagination,
      };
    } catch (dbError) {
      console.timeEnd('Total Query Time'); // Hata durumunda da toplam süreyi göster
      throw new Error(`Database query failed: ${dbError.message}`);
    }
  }


  // yeni: chatId altındaki TÜM mesajları güncelle
  async markAllByChatId({ chatId, value = 1 }) {
    return this.prisma.chatlist.updateMany({
      where: { chatId: String(chatId) },
      data: { messageRead: Number(value) },
    });
  }

  /**
   * spChatUsers(userSystemId, userRole, limit, offset) çağrısı
   */
  async callSpChatUsers({ userSystemId, userRole, limit, offset }) {
    const uid = (userSystemId === undefined || userSystemId === null || Number(userSystemId) === 0)
      ? null
      : Number(userSystemId);

    const role = Number.isFinite(Number(userRole)) ? Number(userRole) : 0;

    const raw = await this.prisma.$queryRaw`
      CALL spChatUsers(${uid}, ${role}, ${limit}, ${offset})
    `;
    return raw;
  }
}
