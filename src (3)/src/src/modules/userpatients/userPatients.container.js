// src/modules/userpatients/userPatients.container.js
import { asClass, createContainer } from 'awilix';
import { UserPatientsController } from './userPatients.controller.js';
import { UserPatientsService } from './userPatients.service.js';
import { UserPatientsRepository } from './userPatients.repository.js';

const container = createContainer();

container.register({
  userPatientsController: asClass(UserPatientsController).singleton(),
  userPatientsService: asClass(UserPatientsService).singleton(),
  userPatientsRepository: asClass(UserPatientsRepository).singleton(),
});

export default container;
