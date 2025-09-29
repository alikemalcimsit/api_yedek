import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class QuickMessagesRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'quickMessages';
  }

 

  // İsteğe bağlı ek sorgular buraya yazılabilir
}
