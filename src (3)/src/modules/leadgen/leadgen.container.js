// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { LeadgenRepository } from './leadgen.repository.js';
import { LeadgenService } from './leadgen.service.js';
import { LeadgenController } from './leadgen.controller.js';

const container = createContainer();

container.register({
  leadgenRepository: asClass(LeadgenRepository).singleton(),
  leadgenService: asClass(LeadgenService).singleton(),
  leadgenController: asClass(LeadgenController).singleton(),
});

export default container;
