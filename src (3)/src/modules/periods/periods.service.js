

import { PeriodsRepository } from './periods.repository.js';
import { BaseService } from '../base/base.service.js';

export class PeriodsService extends BaseService {
  constructor({ periodsRepository }) {
    super(periodsRepository);
    this.periodsRepository = periodsRepository;
  }

  // Controller'da kullanılan fonksiyonlar
  async getPeriods(query) {
    return this.periodsRepository.getPeriods(query);
  }

  async saveOrChangeStatusPeriods(data) {
    return this.periodsRepository.saveOrChangeStatusPeriods(data);
  }

  async deletePeriods(data) {
    return this.periodsRepository.deletePeriods(data);
  }

  async updateCurrentStatusByUserPatientId({ userPatientId, currentStatus }) {
    const uid = Number(userPatientId);
    const status = Number(currentStatus);

    // 1) Güncellenecek kayıtların ID'lerini al
    const targets = await this.repository.model.findMany({
      where: { userPatientId: uid, currentStatus: { not: status } },
      select: { id: true } // <-- PK alanın farklıysa burayı değiştir
    });

    if (!targets.length) {
      return { count: 0, updatedData: [] };
    }

    const ids = targets.map(t => t.id);

    // 2) Güncelleme: ID listesine göre (race condition önlemek için)
    const updateResult = await this.repository.model.updateMany({
      where: { id: { in: ids } },
      data: { currentStatus: status },
    });

    const count = typeof updateResult === 'number' ? updateResult : (updateResult?.count ?? 0);

    // 3) Güncellenmiş veriyi tekrar çek (yeni currentStatus ile)
    const updatedData = await this.repository.model.findMany({
      where: { id: { in: ids } }
    });

    return { count, updatedData };
  }

  async bulkUptadePeriodsWithStoredProcedure({ beforeDate, currentStatus, newStatus }) {
    try {
      const result = await this.repository.callSpUpdatePeriods({
        beforeDate,
        currentStatus: parseInt(currentStatus),
        newStatus: parseInt(newStatus)
      });
 
      return {
        success: true,
        data: result,
      }
    }
    catch (error) {
      console.error('bulkUptadePeriodsWithStoredProcedure hatası:', error);
      throw new Error(`Stored procedure ile period güncelleme hatası: ${error.message}`);
    }
  }

  // create method'unun var olduğundan emin olun
  async create(data) {
    console.log("periodsService.create çağrılıyor:", data);
    return await this.repository.create(data);
  }
}
