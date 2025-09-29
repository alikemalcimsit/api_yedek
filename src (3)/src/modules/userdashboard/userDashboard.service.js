import { BaseService } from "../base/base.service.js";

export class UserDashboardService extends BaseService {
  constructor({ userDashboardRepository }) {
    super(userDashboardRepository);
  }

  async getUsersService({ aranan, surec, tarih, page, limit, currentAdminId }) {
    const offset = (page - 1) * limit;

    //Kontrol Yapısı
    // const admin = await this.repository.findAdminById(currentAdminId);
    // if (!admin) {
    //   throw new Error('Unauthorized');
    // }

    const setting = await this.repository.prisma.settings.findFirst({ where: { name: 'current_scenario' } });
    const currentScenario = Number(setting?.value || 1);

    // Stored procedure'ü kullanmak istiyorsanız aşağıdaki satırları aktif edin:
    // return this.getUsersWithStoredProcedure({
    //   userId: currentAdminId,
    //   userRole: 1, // Admin rolü varsayımı
    //   scenario: currentScenario,
    //   page,
    //   limit
    // });

    const users = await this.repository.findUsers({
      aranan, surec, tarih, offset, limit, currentAdminId, currentScenario,
    });

    const result = users.map(u => ({
      id: u.id,
      userSystemId: u.userSystemId,
      avatar: u.avatar,
      identityId: u.identityId,
      fileNumber: u.fileNumber,
      profileName: u.profileName,
      systemUsername: u.userSystem?.username,
      name: u.name,
      surname: u.surname,
      chatId: u.chatId,
      channelId: u.channelId,
      phoneNumber: u.phoneNumber,
      countryCode: u.countryCode,
      opportunityName: u.opportunities?.opportunityName,
      opportunityId: u.opportunityId,
      mail: u.mail,
      gender: u.gender,
      birthDate: u.birthDate,
      language: u.language,
      registerDate: u.registerDate,
      dateTime: u.chatListTwo?.[0]?.dateTime || null,
      currentStatus: u.periods?.[0]?.currentStatus ?? 1,
      chatType: u.chatType,
      amount: u.offers?.[0]?.amount,
      currency: u.offers?.[0]?.currency,
      paid_amount: u.offers?.[0]?.amount_paid,
      offer_date: u.offers?.[0]?.date,
    }));

    return { success: true, totalRecords: result.length, users: result };
  }

  /**
   * spUserDashboard stored procedure'ünü kullanarak kullanıcıları getirir
   * @param {number} userId - Kullanıcı ID'si
   * @param {number} userRole - Kullanıcı rolü  
   * @param {number} scenario - Senaryo
   * @param {number} page - Sayfa numarası
   * @param {number} limit - Sayfa başına kayıt sayısı
   */
  async getUsersWithStoredProcedure({ userId, userRole, page, limit }) {
    const offset = (page - 1) * limit;

    try {
      const result = await this.repository.callSpUserDashboard({
        userId,
        userRole, 
        limit,
        offset
      });

      // BigInt serialization için replacer fonksiyonu
      const bigIntReplacer = (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
      };

  
      // Stored procedure sonucunu formatla
      const formattedResult = this.formatStoredProcedureResult(result);


      return {
        success: true,
        meta: {
          page,
          limit,
          total: formattedResult.length,
          totalPages: Math.ceil(formattedResult.length / limit),
          hasPrev: page > 1,
          hasNext: page < Math.ceil(formattedResult.length / limit)
        },
        data: formattedResult
      };
    } catch (error) {
      console.error('getUsersWithStoredProcedure hatası:', error);
      throw new Error(`Stored procedure ile kullanıcı getirme hatası: ${error.message}`);
    }
  }

  /**
   * Stored procedure sonucunu frontend için formatlar
   * @param {Array} rawResult - Ham stored procedure sonucu
   * @returns {Array} Formatlanmış sonuç
   */
  formatStoredProcedureResult(rawResult) {
    if (!Array.isArray(rawResult) || rawResult.length === 0) {
      return [];
    }

    // BigInt değerleri güvenli şekilde Number'a çeviren helper fonksiyon
    const convertBigInt = (value) => {
      return typeof value === 'bigint' ? Number(value) : value;
    };

   return rawResult.map(row => ({
      id: convertBigInt(row.f4), // userPatientId
      userSystemId: convertBigInt(row.f3), // userSystemId
      profileName: row.f5, // profileName
      systemUsername: row.f0, // username
      name: row.f6 || '', // name
      surname: row.f7 || '', // surname
      phoneNumber: row.f8 || '', // phoneNumber
      dateTime: row.f15, // dateTime
      currentStatus: convertBigInt(row.f11) ?? 1, // currentStatus
      chatType: row.f9, // chatType
      ustAdminId: convertBigInt(row.f1), // UstAdminId
      role: convertBigInt(row.f2), // role
      isEcho: row.f10, // isEcho
      amount: row.f12 ? convertBigInt(row.f12).toString() : null, // amount as string
      amount_paid: row.f13 ? convertBigInt(row.f13).toString() : null, // amount_paid as string
      currency: row.f14, // currency
      todayTask: Number(convertBigInt(row.f16)) || 0, // todayTask as integer
      totalTask: Number(convertBigInt(row.f17)) || 0, // totalTask as integer
      f18: convertBigInt(row.f18), // f18
      unreadCount: Number(convertBigInt(row.f19)) || 0, // unreadCount as integer
      chatId: row.f20 // chatId
    }));
  }
}
