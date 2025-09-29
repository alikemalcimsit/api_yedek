import { createContainer, asClass, asValue } from 'awilix';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SettingsRepository } from '../settings/settings.repository.js';
import { SettingsService } from '../settings/settings.service.js';

const container = createContainer(); // <<< BU SATIR EKSİKTİ!


container.register({
  authRepository: asClass(AuthRepository).singleton(),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),

  settingsRepository: asClass(SettingsRepository).singleton(),
  settingsService: asClass(SettingsService).singleton(),
});




export default container;
