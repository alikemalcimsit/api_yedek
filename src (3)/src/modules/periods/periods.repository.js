
import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class PeriodsRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'periods';
  }

  // Periods listesini getir
  async getPeriods(query) {
    // Örnek: filtreye göre periods tablosundan veri çek
    return prisma.periods.findMany({ where: { ...query } });
  }

  // Periods kaydet veya durumunu değiştir
  async saveOrChangeStatusPeriods(data) {
    // Örnek: id varsa güncelle, yoksa oluştur
    if (data.id) {
      return prisma.periods.update({ where: { id: data.id }, data });
    } else {
      return prisma.periods.create({ data });
    }
  }

  // Periods sil
  async deletePeriods(data) {
    // Örnek: id ile silme
    return prisma.periods.delete({ where: { id: data.id } });
  }

  /**
   * spUpdatePeriods stored procedure'ünü çağırır
   * @param {string} beforeDate - Tarih (YYYY-MM-DD HH:MM:SS formatında)
   * @param {number} currentStatus - Mevcut durum
   * @param {number} newStatus - Yeni durum
   * @returns {Promise<Array>} Stored procedure sonucu
   */
  async callSpUpdatePeriods({ beforeDate, currentStatus, newStatus }) {
    try {
      const result = await this.prisma.$queryRaw`
        CALL spUpdatePeriods(${beforeDate}, ${currentStatus}, ${newStatus})
      `;
      return result;
    } catch (error) {
      console.error('spUpdatePeriods stored procedure hatası:', error);
      throw new Error(`Stored procedure çağrısında hata: ${error.message}`);
    }
  }
}
