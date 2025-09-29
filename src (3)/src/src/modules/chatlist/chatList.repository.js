import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class ChatListRepository extends BaseRepository {
   constructor() {
    super();
    this._modelName = 'chatlisttwo';
  }

  // İsteğe bağlı ek sorgular buraya yazılabilir

  async findChatList({ userRole, userSystemId, limit, offset }) {
    if (!this.prisma) {
      throw new Error('Prisma client is not initialized');
    }

    // Parametreleri normalize et
    const roleParam = Number.isFinite(Number(userRole)) ? Number(userRole) : 0;
    const userSystemParam = userSystemId === null || userSystemId === undefined || userSystemId === ''
      ? null
      : Number(userSystemId);
    const take = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    const skip = Number.isFinite(Number(offset)) ? Number(offset) : 0;

    const rows = await this.prisma.$queryRaw`
      SELECT 
        up.id, 
        up.chatType, 
        up.chatId, 
        up.userSystemId, 
        up.profileName, 
        up.name, 
        up.surname, 
        clt.dateTime, 
        clt.type, 
        clt.contentUri, 
        clt.text, 
        clt.channelId, 
        up.avatar, 
        up.countryCode, 
        up.phoneNumber, 
        up.profileName, 
        up.language, 
        clt.message_read_count, 
        p.currentStatus, 
        p.opportunityId, 
        o.opportunityName
      FROM (
        SELECT 
          c.*, 
          ROW_NUMBER() OVER (PARTITION BY chatId ORDER BY dateTime DESC) AS rn,
          COUNT(CASE WHEN message_read = 0 THEN 1 END) OVER (PARTITION BY chatId) AS message_read_count
        FROM chatlisttwo c
      ) AS clt
      LEFT JOIN userpatient AS up ON clt.chatId = up.chatId
      LEFT JOIN periods AS p ON p.userPatientId = up.id
      LEFT JOIN opportunities AS o ON o.id = p.opportunityId
      CROSS JOIN (
          SELECT CAST(value AS UNSIGNED) AS scenario
          FROM settings
          WHERE name = 'current_scenario'
          LIMIT 1
      ) s
      WHERE clt.rn = 1
        AND p.currentStatus <> 9
        AND (${roleParam} = 2 OR ${userSystemParam} IS NULL OR up.userSystemId = ${userSystemParam})
        AND (s.scenario <> 8 OR (s.scenario = 8 AND up.userSystemId = 0 AND p.currentStatus <> 9))
      GROUP BY up.chatId
      ORDER BY 
        CASE WHEN clt.message_read_count > 0 THEN 0 ELSE 1 END,
        clt.dateTime DESC
      LIMIT ${take} OFFSET ${skip};
    `;

    return rows;
  }
}
