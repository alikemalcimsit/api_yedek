import { BaseService } from '../base/base.service.js';

export class HospitalsInfoService extends BaseService {
  constructor({ hospitalsInfoRepository }) {
    super(hospitalsInfoRepository);
  }


  
  async getByDomain(domain) {
    return this.repository.getByDomain(domain);
  }

    // İsteğe bağlı ek sorgular buraya yazılabilir

  // Ek servis metodları buraya eklenebilir
}
