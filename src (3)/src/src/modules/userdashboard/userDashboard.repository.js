import { BaseRepository } from '../base/base.repository.js';

export class UserDashboardRepository extends BaseRepository {
    constructor() {
        super();
        this._modelName = 'userPatient';
    }

    async findAdminById(adminId) {
        return this.prisma.userSystem.findUnique({
            where: { id: adminId },
        });
    }

async findUsers({ aranan, surec, tarih, offset, limit, currentAdminId, currentScenario }) {
  const whereConditions = {
    AND: []
  };

  if (aranan) {
    whereConditions.AND.push({
      OR: [
        { phoneNumber: { contains: aranan } },
        { profileName: { contains: aranan } }
      ]
    });
  }

  if (surec) {
    whereConditions.AND.push({
      periods: { some: { currentStatus: Number(surec) } }
    });
  }

  if (tarih) {
    whereConditions.AND.push({
      chatListTwo: {
        some: {
          dateTime: {
            gte: new Date(`${tarih}T00:00:00Z`),
            lt: new Date(`${tarih}T23:59:59Z`)
          }
        }
      }
    });
  }

  if (currentScenario === 8) {
    // Senaryoya göre userSystemId=0 olanlar
    whereConditions.OR = [{ userSystemId: 0 }];
  }

  return this.model.findMany({
    where: whereConditions,
    skip: offset,
    take: limit,
    orderBy: { id: 'desc' },
    include: {
      userSystem: { select: { username: true } },
      periods: {
        where: { NOT: { currentStatus: 9 } },
        orderBy: { id: 'desc' },
        take: 1,
        include: {
          opportunity: true // ⚠️ dikkat! buradan opportunity çekiyoruz
        }
      },
      offers: {
        orderBy: { id: 'desc' },
        take: 1
      },
      chatListTwo: {
        where: { isEcho: { not: '1' } }, // dikkat: isEcho STRING
        orderBy: { dateTime: 'desc' },
        take: 1
      }
    }
  });
}

  /**
   * spUserDashboard stored procedure'ünü çağırır
   * @param {number} userId - Kullanıcı ID'si (50)
   * @param {number} userRole - Kullanıcı rolü (1)
   * @param {number} scenario - Senaryo (5)
   * @param {number} limit - Limit (10)
   * @param {number} offset - Offset (0)
   * @returns {Promise<Array>} Stored procedure sonucu
   */
  async callSpUserDashboard({ userId, userRole, scenario, limit, offset }) {
    try {
      
      const result = await this.prisma.$queryRaw`
        CALL spUserDashboard(${userId}, ${userRole}, ${scenario}, ${limit}, ${offset})
      `;
      return result;
    } catch (error) {
      console.error('spUserDashboard stored procedure hatası:', error);
      throw new Error(`Stored procedure çağrısında hata: ${error.message}`);
    }
  }

}
