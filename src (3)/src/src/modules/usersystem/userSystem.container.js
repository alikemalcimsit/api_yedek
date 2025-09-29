import { createContainer, asClass } from 'awilix';

import { UserSystemRepository } from './userSystem.repository.js';
import { UserSystemService } from './userSystem.service.js';
import { UserSystemController } from './userSystem.controller.js';

const container = createContainer();

container.register({
  userSystemRepository: asClass(UserSystemRepository).singleton(),
  userSystemService: asClass(UserSystemService).singleton(),
  userSystemController: asClass(UserSystemController).singleton(),
});

export default container;