// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { HospitalsInfoRepository } from './hospitalsInfo.repository.js';
import { HospitalsInfoService } from './hospitalsInfo.service.js';
import { HospitalsInfoController } from './hospitalsInfo.controller.js';

const container = createContainer();

container.register({
  hospitalsInfoRepository: asClass(HospitalsInfoRepository).singleton(),
  hospitalsInfoService: asClass(HospitalsInfoService).singleton(),
  hospitalsInfoController: asClass(HospitalsInfoController).singleton(),
});

export default container;
