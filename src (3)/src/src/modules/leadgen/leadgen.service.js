import { BaseService } from '../base/base.service.js';

export class LeadgenService extends BaseService {
  constructor({ leadgenRepository }) {
    super(leadgenRepository);
  }


    async getByLeadId(leadgen_id) {
        return this.repository.getByLeadId(leadgen_id);
    }

    
    async getByUserPatientId(userPatientId) {
        return this.repository.getByUserPatientId(userPatientId);
    }

}
