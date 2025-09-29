import { createContainer, asClass, asValue } from 'awilix';
import { UserDashboardRepository } from './userDashboard.repository.js';
import { UserDashboardService } from './userDashboard.service.js';
import { UserDashboardController } from './userDashboard.controller.js';

const container = createContainer();
container.register({
  userDashboardRepository: asClass(UserDashboardRepository).singleton(),
  userDashboardService: asClass(UserDashboardService).singleton(),
  userDashboardController: asClass(UserDashboardController).singleton(),
});


export default container;
