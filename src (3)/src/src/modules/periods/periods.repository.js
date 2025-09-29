
import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class PeriodsRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'periods';
  }
  
}
