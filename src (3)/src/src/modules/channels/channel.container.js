import { asClass, createContainer } from 'awilix';
import { ChannelRepository } from './channel.repository.js';
import { ChannelService } from './channel.service.js';
import { ChannelController } from './channel.controller.js';

const container = createContainer();

container.register({
  channelRepository: asClass(ChannelRepository).singleton(),
  channelService: asClass(ChannelService).singleton(),
  channelController: asClass(ChannelController).singleton(),
});

export default container;
