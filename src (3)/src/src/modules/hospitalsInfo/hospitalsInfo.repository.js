import { BaseRepository } from '../base/base.repository.js';

export class HospitalsInfoRepository extends BaseRepository {
  constructor() {
    super(); // Tek prisma client kullanıyor
    this._modelName = 'crm_hospitals'; // Model adı güncellendi
  }

   async getByDomain(domain) {
    return this.model.findMany({
      where: { domain: domain }
    });
  }

  // İsteğe bağlı ek sorgular buraya yazılabilir
}
