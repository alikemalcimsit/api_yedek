import { createContainer, asClass } from 'awilix';

import { AdminAuthRepository } from './adminAuth.repository.js';
import { AdminAuthService } from './adminAuth.service.js';
import { AdminAuthController } from './adminAuth.controller.js';

console.log('📦 adminAuth.container: Container oluşturuluyor');

const container = createContainer();

container.register({
  adminAuthRepository: asClass(AdminAuthRepository).singleton(),
  adminAuthService: asClass(AdminAuthService).singleton(),
  adminAuthController: asClass(AdminAuthController).singleton(),
});

console.log('✅ adminAuth.container: Container kayıtları tamamlandı');

export default container;
