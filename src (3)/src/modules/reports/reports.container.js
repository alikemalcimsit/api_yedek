// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { ReportsRepository } from './reports.repository.js';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';

const container = createContainer();

container.register({
  reportsRepository: asClass(ReportsRepository).singleton(),
  reportsService: asClass(ReportsService).singleton(),
  reportsController: asClass(ReportsController).singleton(),
});

export default container;
