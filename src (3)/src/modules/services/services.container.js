import { ServicesRepository } from './services.repository.js';
import { ServicesService } from './services.service.js';
import { ServicesController } from './services.controller.js';

import { createContainer, asClass } from 'awilix';

const container = createContainer();

container.register({
  servicesRepository: asClass(ServicesRepository).singleton(),
  servicesService: asClass(ServicesService).singleton(),
  servicesController: asClass(ServicesController).singleton(),
});

export default container;
