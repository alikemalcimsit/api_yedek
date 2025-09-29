// adminUser.service.js
import { BaseService } from '../base/base.service.js';

export class AdminUserService extends BaseService {
  constructor({ adminUserRepository }) {
    super(adminUserRepository);
  }

  // Özel metod ekleyebilirsin, örn. sadece aktif admin kullanıcıları getir
  async getActiveAdmins() {
    return this.repository.findAll({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    });
  }
}
