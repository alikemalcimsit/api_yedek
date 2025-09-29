
import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class OfferRepository extends BaseRepository {
constructor() {
    super();
    this._modelName = 'offers';
  }

  async findAllWithRelations() {
    return this.model.findMany({
      orderBy: { date: 'desc' },
      include: { userPatient: true },
    });
  }
}
