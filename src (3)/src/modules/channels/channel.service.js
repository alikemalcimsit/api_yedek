import { BaseService } from '../base/base.service.js';

export class ChannelService extends BaseService {
  constructor({ channelRepository }) {
    super(channelRepository);
  }

  async getChannelByDomain(host) {
    const channel = await this.repository.findByDomain(host);
    if (!channel) {
      throw new Error('Channel bulunamadı');
    }
    return channel;
  }

  async getAllChannelDomains() {
    return this.repository.findAllDomains();
  }
}
