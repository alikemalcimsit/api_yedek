import { createContainer, asClass, asValue } from 'awilix';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

const container = createContainer(); // <<< BU SATIR EKSİKTİ!


container.register({
  authRepository: asClass(AuthRepository).singleton(),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
});



export default container;
