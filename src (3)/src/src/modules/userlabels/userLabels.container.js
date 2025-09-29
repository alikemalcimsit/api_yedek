// src/modules/userlabels/userLabels.container.js

import { asClass, createContainer } from 'awilix';
import { UserLabelsController } from './userLabels.controller.js';
import { UserLabelsService } from './userLabels.service.js';
import { UserLabelsRepository } from './userLabels.repository.js';

const container = createContainer();

container.register({
  userLabelsController: asClass(UserLabelsController).singleton(),
  userLabelsService: asClass(UserLabelsService).singleton(),
  userLabelsRepository: asClass(UserLabelsRepository).singleton(),
});

export default container;
