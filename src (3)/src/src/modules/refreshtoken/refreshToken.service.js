import { BaseService } from '../base/base.service.js';

export class RefreshTokenService extends BaseService {
  constructor({ refreshTokenRepository }) {
    super(refreshTokenRepository);
  }


  
  async getByUserId(userId) {
    return this.repository.getByUserId(userId);
  }

    // İsteğe bağlı ek sorgular buraya yazılabilir

  // Ek servis metodları buraya eklenebilir
}
