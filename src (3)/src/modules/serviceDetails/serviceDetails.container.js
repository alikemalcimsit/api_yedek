// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { ServiceDetailsRepository } from './serviceDetails.repository.js';
import { ServiceDetailsService } from './serviceDetails.service.js';
import { ServiceDetailsController } from './serviceDetails.controller.js';

const container = createContainer();

container.register({
  serviceDetailsRepository: asClass(ServiceDetailsRepository).singleton(),
  serviceDetailsService: asClass(ServiceDetailsService).singleton(),
  serviceDetailsController: asClass(ServiceDetailsController).singleton(),
});

export default container;
