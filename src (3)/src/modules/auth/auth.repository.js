import { BaseRepository } from '../base/base.repository.js';

export class AuthRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'usersystem'; // Model adı düzeltildi
  }

  async findByUsername(username) {
    console.log('🔍 AuthRepository findByUsername çağrıldı, username:', username);
    return this.model.findFirst({ where: { username } });
  }

  async updatePasswordById(id, hashedPassword) {
    console.log('🔍 AuthRepository updatePasswordById çağrıldı, id:', id);
    return this.model.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}