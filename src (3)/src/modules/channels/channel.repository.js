import { BaseRepository } from '../base/base.repository.js';

export class ChannelRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'crmchannels'; // Model adı güncellendi
  }

  async findByDomain(host) {
    return this.model.findFirst({
      where: { host },
    });
  }

  async findAllDomains() {
    return this.model.findMany({
      select: { host: true }
    });
  }
}
