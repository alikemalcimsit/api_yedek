

import { OfferRepository } from './offer.repository.js';
import { BaseService } from '../base/base.service.js';

export class OfferService extends BaseService {
  constructor({ offerRepository }) {
    super(offerRepository);
  }

  async getByPatientId(userPatientId) {
    return this.repository.model.findMany({
      where: { userPatientId },
      orderBy: { date: 'desc' },
      include: {
        userPatient: true
      }
    });
  }



    
  async createWithValidation(data) {
    if (!data.userPatientId || !data.amount || !data.currency) {
      throw new Error('Zorunlu alanlar eksik');
    }
    data.date = new Date();
    return this.repository.create(data);
  }
}
