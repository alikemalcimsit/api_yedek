import { createContainer, asClass } from 'awilix';
import { SettingsRepository } from './settings.repository.js';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';

const container = createContainer();

container.register({
  settingsRepository: asClass(SettingsRepository).singleton(),
  settingsService: asClass(SettingsService).singleton(),
  settingsController: asClass(SettingsController).singleton(),
});

export default container;
