// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { QuickMessagesRepository } from './quickMessages.repository.js';
import { QuickMessagesService } from './quickMessages.service.js';
import { QuickMessagesController } from './quickMessages.controller.js';

const container = createContainer();

container.register({
  quickMessagesRepository: asClass(QuickMessagesRepository).singleton(),
  quickMessagesService: asClass(QuickMessagesService).singleton(),
  quickMessagesController: asClass(QuickMessagesController).singleton(),
});

export default container;
