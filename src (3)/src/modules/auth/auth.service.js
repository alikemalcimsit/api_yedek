import { BaseService } from '../base/base.service.js';
import { prisma } from '../../utils/prisma.js'; // Tek client
import bcrypt from 'bcryptjs';

export class AuthService extends BaseService {
  constructor({ authRepository }) {
    super(authRepository);
  }

  async authenticateUser(username, password) {
    const user = await this.repository.findByUsername(username);
    if (!user) throw new Error('Kullanıcı bulunamadı');

     const isValid = await bcrypt.compare(password, user.password);
     if (!isValid) throw new Error('Geçersiz şifre');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserPassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.repository.updatePasswordById(id, hashedPassword);
  }

  async logout(refreshToken, req) {
    if (refreshToken) {
      // Artık tek prisma client kullanıyoruz
      await prisma.refreshtokens.updateMany({
        where: { token: refreshToken },
        data: { isActive: false }
      });
    }
  }
}
