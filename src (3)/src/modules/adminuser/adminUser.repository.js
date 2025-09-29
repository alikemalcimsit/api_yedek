import { BaseRepository } from '../base/base.repository.js';

export class AdminUserRepository extends BaseRepository {
  constructor() {
 super();
  this._modelName = 'crmusers';
  }

}
