// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { DepartmentsRepository } from './departments.repository.js';
import { DepartmentsService } from './departments.service.js';
import { DepartmentsController } from './departments.controller.js';

const container = createContainer();

container.register({
  departmentsRepository: asClass(DepartmentsRepository).singleton(),
  departmentsService: asClass(DepartmentsService).singleton(),
  departmentsController: asClass(DepartmentsController).singleton(),
});

export default container;
