import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class UserSystemRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'userSystem';
  }

 
 

  async findById(id) {
    return await this.model.findUnique({ where: { id: Number(id) } });
  }



  async findByUsername(username) {
  return await this.model.findFirst({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      sourceId:false,
      role: true,
      password: true,   // ŞİFREYİ GETİR!
      phoneNumber: true // OTP için lazım olabilir
    }
  });
}

}
