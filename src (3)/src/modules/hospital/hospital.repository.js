import { BaseRepository } from '../base/base.repository.js';

export class HospitalRepository extends BaseRepository {
  constructor() {
    super(); // Artık tek prisma client kullanıyor
    this._modelName = 'crmhospitals'; // Model adı güncellendi
  }

  async findByDomain(domain) {
    return this.model.findFirst({
      where: { domain }
    });
  }

  async findByDomainWithInfos(domain) {
    return this.model.findFirst({
      where: { domain },
      select: {
        title: true,
        logo: true,
        hospitalListId: true,
        appId: true,
        fbPageId: true,
        status: true,
      },
    });
  }

  async findAllDomains() {
    return this.model.findMany({
      select: { domain: true }
    });
  }

  async findAllWithCount() {
    const data = await this.model.findMany();
    const totalCount = await this.model.count();
    return { hospitals: data, totalCount };
  }
}
