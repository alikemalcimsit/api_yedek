import { createContainer, asClass } from 'awilix';

import { HospitalRepository } from './hospital.repository.js';
import { HospitalService } from './hospitals.service.js';
import { HospitalController } from './hospitals.controller.js';

const container = createContainer(); 

container.register({
  hospitalRepository: asClass(HospitalRepository).singleton(),
  hospitalService: asClass(HospitalService).singleton(),
  hospitalController: asClass(HospitalController).singleton(),
});

export default container;
