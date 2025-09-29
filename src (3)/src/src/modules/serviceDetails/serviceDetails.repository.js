import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class ServiceDetailsRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'service_details';
  }
  // İsteğe bağlı ek sorgular buraya yazılabilir
}
