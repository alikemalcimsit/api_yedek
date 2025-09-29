import { createContainer, asClass } from 'awilix';

import { OpportunitiesRepository } from './opportunities.repository.js';
import { OpportunitiesService } from './opportunities.service.js';
import { OpportunitiesController } from './opportunities.controller.js';

const container = createContainer();

container.register({
  opportunitiesRepository: asClass(OpportunitiesRepository).singleton(),
  opportunitiesService: asClass(OpportunitiesService).singleton(),
  opportunitiesController: asClass(OpportunitiesController).singleton(),
});

export default container;
