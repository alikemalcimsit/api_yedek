import { BaseService } from '../base/base.service.js';

export class HospitalService extends BaseService {
  constructor({ hospitalRepository }) {
    super(hospitalRepository);
  }

  async getHospitalByDomain(domain) {
    const hospital = await this.repository.findByDomain(domain);
    if (!hospital) {
      throw new Error('Hastane bulunamadı');
    }
    return hospital;
  }


    async getHospitalByDomainWithInfos(domain) {
    const hospital = await this.repository.findByDomainWithInfos(domain); // findByDomainWithInfos kullanılıyor
    if (!hospital) {
      throw new Error('Hastane bulunamadı');
    }
    return hospital;
  }

  async getAllHospitalsWithCount() {
    return this.repository.findAllWithCount();
  }


}
// Ek servis metodları buraya eklenebilir