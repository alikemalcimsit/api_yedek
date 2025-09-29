import { createContainer, asClass } from 'awilix';

import { UsernotesRepository } from './usernotes.repository.js';
import {UsernotesService} from './usernotes.service.js'
import {UsernotesController } from './usernotes.controller.js';

const container = createContainer();

container.register({
  usernotesRepository: asClass(UsernotesRepository).singleton(),
  usernotesService: asClass(UsernotesService).singleton(),
  usernotesController: asClass(UsernotesController).singleton(),
});

export default container;