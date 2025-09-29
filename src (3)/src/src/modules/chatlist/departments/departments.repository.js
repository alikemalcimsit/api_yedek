import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class DepartmentsRepository extends BaseRepository {

  constructor() {
    super();
    this._modelName = 'departments';
  }

  // İsteğe bağlı ek sorgular buraya yazılabilir
}
