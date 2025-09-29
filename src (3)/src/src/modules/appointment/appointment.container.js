// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { AppointmentRepository } from './appointment.repository.js';
import { AppointmentService } from './appointment.service.js';
import { AppointmentController } from './appointment.controller.js';

const container = createContainer();

container.register({
  appointmentRepository: asClass(AppointmentRepository).singleton(),
  appointmentService: asClass(AppointmentService).singleton(),
  appointmentController: asClass(AppointmentController).singleton(),
});

export default container;
