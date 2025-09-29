import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class UsernotesRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'user_notes';
  }
}