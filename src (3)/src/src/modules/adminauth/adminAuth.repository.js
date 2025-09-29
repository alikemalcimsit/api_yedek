import { BaseRepository } from '../base/base.repository.js';

export class AdminAuthRepository extends BaseRepository {
  constructor() {
 super(); // Tek prisma client kullanıyor
  this._modelName = 'admin_users'; // Model adı güncellendi
  }

  async findByUsername(username) {
    console.log(`📁 findByUsername çağrıldı: ${username}`);
    return this.model.findFirst({ where: { username } });
  }

  async updatePasswordById(id, hashedPassword) {
    console.log(`📁 updatePasswordById çağrıldı: ${id}`);
    return this.model.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
