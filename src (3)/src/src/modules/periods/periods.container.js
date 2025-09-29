import { createContainer, asClass } from 'awilix';

import { PeriodsRepository } from './periods.repository.js';
import { PeriodsService } from './periods.service.js';
import { PeriodsController } from './periods.controller.js';

const container = createContainer();

container.register({
  periodsRepository: asClass(PeriodsRepository).singleton(),
  periodsService: asClass(PeriodsService).singleton(),
  periodsController: asClass(PeriodsController).singleton(),
});

export default container;
