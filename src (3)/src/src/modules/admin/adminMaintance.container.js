import { createContainer, asClass } from 'awilix';
import { AdminMaintenanceService } from './adminMaintance.service.js';
import { AdminMaintenanceController } from './adminMaintance.controller.js';

const container = createContainer();

container.register({
  adminMaintenanceService: asClass(AdminMaintenanceService).singleton(),
});

container.register({
  adminMaintenanceController: asClass(AdminMaintenanceController).singleton(),
});

export default container;
