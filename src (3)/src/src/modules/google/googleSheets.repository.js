import { prisma } from '../../utils/prisma.js';
import { BaseRepository } from '../base/base.repository.js';

export class GoogleSheetsRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'sheets';
    this.setPrismaClient(prisma); // bu satır modeli ayarlıyor

  }
  async createSheetRecord(data) {
    return this.model.create({ data });
  }
}
