import { createContainer, asClass } from 'awilix';

import { ChatListRepository } from './chatList.repository.js';
import { ChatListService } from './chatList.service.js';
import { ChatListController } from './chatList.controller.js';

const container = createContainer();

container.register({
  chatListRepository: asClass(ChatListRepository).singleton(),
  chatListService: asClass(ChatListService).singleton(),
  chatListController: asClass(ChatListController).singleton(),
});

export default container;
