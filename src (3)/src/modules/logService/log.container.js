import { asClass, createContainer } from 'awilix';

import { CrmLogRepository } from './log.repository.js';
import { CrmLogService } from './log.service.js';
import { CrmLogController } from './log.controller.js';

const container = createContainer();

container.register({
  crmLogRepository: asClass(CrmLogRepository).singleton(),
  crmLogService: asClass(CrmLogService).singleton(),
  crmLogController: asClass(CrmLogController).singleton(),
});

export default container;
