

import { OfferRepository } from './offer.repository.js';
import { BaseService } from '../base/base.service.js';

export class OfferService extends BaseService {
  constructor({ offerRepository }) {
    super(offerRepository);
        this.prisma = null;  }





    
  async createWithValidation(data) {
    if (!data.userPatientId || !data.amount || !data.currency) {
      throw new Error('Zorunlu alanlar eksik');
    }
    data.date = new Date();
    return this.repository.create(data);
  }
}
