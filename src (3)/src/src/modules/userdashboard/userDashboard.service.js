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
  async getUsersWithStoredProcedure({ userId, userRole, scenario, page, limit }) {
    const offset = (page - 1) * limit;

    try {
      const result = await this.repository.callSpUserDashboard({
        userId,
        userRole, 
        scenario,
        limit,
        offset
      });

      // Debug: Stored procedure sonucunu logla
      console.log('🔍 Stored procedure ham sonucu:', JSON.stringify(result, null, 2));
      console.log('🔍 İlk kayıt yapısı:', result?.[0] ? Object.keys(result[0]) : 'Kayıt yok');

      // Stored procedure sonucunu formatla
      const formattedResult = this.formatStoredProcedureResult(result);

      console.log('🔍 Formatlanmış sonuç:', JSON.stringify(formattedResult, null, 2));

      return { 
        success: true, 
        totalRecords: formattedResult.length, 
        users: formattedResult 
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

   return rawResult.map(row => ({
      id: row.f4, // userPatientId
      userSystemId: row.f3, // userSystemId
      profileName: row.f5, // profileName
      systemUsername: row.f0, // username
      name: row.f6 || '', // name
      surname: row.f7 || '', // surname
      phoneNumber: row.f8 || '', // phoneNumber
      dateTime: row.f15, // dateTime
      currentStatus: row.f11 ?? 1, // currentStatus
      chatType: row.f9, // chatType
      ustAdminId: row.f1, // UstAdminId
      role: row.f2, // role
      isEcho: row.f10, // isEcho
      amount: row.f12, // amount
      amount_paid: row.f13, // amount_paid
      currency: row.f14, // currency
    }));
  }
}
