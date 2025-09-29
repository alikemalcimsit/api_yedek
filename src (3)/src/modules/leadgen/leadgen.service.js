import { BaseService } from '../base/base.service.js';

export class LeadgenService extends BaseService {
  constructor({ leadgenRepository }) {
    super(leadgenRepository);
  }


    async getByLeadId(leadgenId) {
        return this.repository.getByLeadId(leadgenId);
    }

    
    async getByUserPatientId(userPatientId) {
        return this.repository.getByUserPatientId(userPatientId);
    }

}
