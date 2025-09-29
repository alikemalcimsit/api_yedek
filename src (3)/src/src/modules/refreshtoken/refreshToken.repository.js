import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class RefreshTokenRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'refreshTokens';
  }

  // İsteğe bağlı ek sorgular buraya yazılabilir
}
