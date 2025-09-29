// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { LabelsRepository } from './labels.repository.js';
import { LabelsService } from './labels.service.js';
import { LabelsController } from './labels.controller.js';

const container = createContainer();

container.register({
  labelsRepository: asClass(LabelsRepository).singleton(),
  labelsService: asClass(LabelsService).singleton(),
  labelsController: asClass(LabelsController).singleton(),
});

export default container;
