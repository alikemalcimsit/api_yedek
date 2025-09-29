import { BaseService } from '../base/base.service.js';
import bcrypt from 'bcryptjs';

export class AdminAuthService extends BaseService {
  constructor({ adminAuthRepository }) {
    console.log('🧠 AdminAuthService constructor çağrıldı');
    super(adminAuthRepository);
  }

  async authenticateUser(username, password) {
    console.log(`🧠 authenticateUser çağrıldı: ${username}`);
    const user = await this.repository.findByUsername(username);
    if (!user) throw new Error('Kullanıcı bulunamadı');
console.log('🔍 Gelen user nesnesi:', user);

console.log('🔐 Gelen şifre:', password);
console.log('🔐 Gelen hash:', user.password);
const isValid = await bcrypt.compare(password, user.password);
console.log('✅ bcrypt sonucu:', isValid);

    if (!isValid) throw new Error('Geçersiz şifre');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserPassword(id, newPassword) {
    console.log(`🧠 updateUserPassword çağrıldı: ${id}`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.repository.updatePasswordById(id, hashedPassword);
  }
}
