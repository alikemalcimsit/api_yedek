import {  prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class LeadgenRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'leadgen';
  }


    async getByLeadId(leadgenId) {
        return this.model.findMany({
        where: { leadgenId: leadgenId }
        });
    }

    
    async getByUserPatientId(userPatientId) {
        return this.model.findMany({
        where: { userPatientId: userPatientId }
        });
    }

  // İsteğe bağlı ek sorgular buraya yazılabilir
}
