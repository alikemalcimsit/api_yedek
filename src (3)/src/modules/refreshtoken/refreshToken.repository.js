import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class RefreshTokenRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'refreshtokens';
  }

  // Belirli bir kullanıcıya ait refresh tokenları getir
  async getByUserId(userId) {
    return prisma.refreshtokens.findMany({ where: { userId } });
  }
}
