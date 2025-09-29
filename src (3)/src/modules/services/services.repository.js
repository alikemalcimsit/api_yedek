import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class ServicesRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'hospitalservice';
  }
  // Ek sorgular buraya eklenebilir
}
