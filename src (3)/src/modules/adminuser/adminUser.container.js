// adminUser.container.js
import { createContainer, asClass } from 'awilix';
import { AdminUserRepository } from './adminUser.repository.js';
import { AdminUserService } from './adminUser.service.js';
import { AdminUserController } from './adminUser.controller.js';

const container = createContainer();

container.register({
  adminUserRepository: asClass(AdminUserRepository).singleton(),
  adminUserService: asClass(AdminUserService).singleton(),
  adminUserController: asClass(AdminUserController).singleton(),
});

export default container;
