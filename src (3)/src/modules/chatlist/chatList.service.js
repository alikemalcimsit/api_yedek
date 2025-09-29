import { BaseService } from '../base/base.service.js';
import { getPaginationParams } from '../../utils/pagination.js';

export class ChatListService extends BaseService {
  constructor({ chatListRepository }) {
    super(chatListRepository);
  }
  async getChatUsersWithStoredProcedure({ userSystemId, userRole, page, limit }) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const lRaw = Number.isFinite(+limit) && +limit > 0 ? +limit : 20;
    const l = Math.min(lRaw, 500);
    const offset = (p - 1) * l;

    try {
      const raw = await this.repository.callSpChatUsers({
        userSystemId, userRole, limit: l, offset
      });

      const rows = Array.isArray(raw?.[0]) ? raw[0] : (Array.isArray(raw) ? raw : []);
      console.log('🔍 rows.len:', rows.length);

      const users = this.formatStoredProcedureResult(rows);

      let total = 0;
      if (rows.length && (rows[0].totalRecords !== undefined)) {
        total = Number(rows[0].totalRecords) || 0;
      } else if (rows.length && (rows[0].f99 !== undefined)) {
        total = Number(rows[0].f99) || 0;
      } else {
        total = (p > 1 ? (p - 1) * l + users.length : users.length);
      }

      const totalPages = Math.max(1, Math.ceil(total / l));

      return {
        success: true,
        meta: {
          page: p,
          limit: l,
          total,
          totalPages,
          hasPrev: p > 1,
          hasNext: p < totalPages,
        },
        data: users
      };
    } catch (error) {
      console.error('getChatUsersWithStoredProcedure hatası:', error);
      throw new Error(`Stored procedure ile chat kullanıcıları getirme hatası: ${error.message}`);
    }
  }

  // ChatId'ye göre mesajları getir
  async getMessagesByChatId({ chatId, order = 'desc', page, limit }) {
    console.log('Service getMessagesByChatId çağrıldı:', { chatId, order, page, limit });
    
    const result = await this.repository.getMessagesByChatId({
      chatId, order, page, limit
    });


    return result;
  }

  // Tek mesajı işaretle
  async markByMessageId({ messageId, read = true }) {
    const { count } = await this.repository.markByMessageId({
      messageId,
      value: read ? 1 : 0,
    });
    return { updated: count, messageId };
  }

  // Chat altındaki tüm mesajları işaretle
  async markAllByChatId({ chatId, read = true }) {
    const { count } = await this.repository.markAllByChatId({
      chatId,
      value: read ? 1 : 0,
    });
    return { updated: count, chatId };
  }

  /**
   * SP satırlarını frontend modeliyle eşle
   */
 formatStoredProcedureResult(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) return [];

  return rawRows.map(row => ({
    id: row.f0,                    // up.id veya userPatientId
    chatType: row.f1,              // c.chatType
    chatId: row.f2,                // c.chatId
    userSystemId: row.f3,          // up.userSystemId
    profileName: row.f4,           // up.profileName
    name: row.f5,                  // up.name
    surname: row.f6,               // up.surname
    dateTime: row.f7,              // clt.dateTime
    type: row.f8,                  // clt.type
    contentUri: row.f9,            // clt.contentUri
    text: row.f10,                 // clt.text
    channelId: row.f11,            // clt.channelId
    avatar: row.f12,               // up.avatar
    countryCode: row.f13,          // up.countryCode
    phoneNumber: row.f14,          // up.phoneNumber
    profileName2: row.f15,         // (varsa) up.profileName (tekrar)
    language: row.f16,             // up.language
    message_read_count: Number(row.f17 ?? 0), // okunmamış mesaj sayısı
    currentStatus: row.f18,        // p.currentStatus
    opportunityId: row.f19,        // o.opportunityId
    opportunityName: row.f20,      // o.opportunityName
    message_read: Number(row.f21 ?? 0),       // clt.message_read
    messageId: row.f22,            // clt.messageId
    adminUsername: row.f23 || '',  // 👈 YENİ ALAN: us.username
  }));
}
  // Ek servis metodları buraya eklenebilir
}
