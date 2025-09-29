// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { GoogleSheetsRepository } from './googleSheets.repository.js';
import { GoogleSheetsService } from './googleSheets.service.js';
import { GoogleSheetsController } from './googleSheets.controller.js';

const container = createContainer();

container.register({
  googleSheetsRepository: asClass(GoogleSheetsRepository).singleton(),
  googleSheetsService: asClass(GoogleSheetsService).singleton(),
  googleSheetsController: asClass(GoogleSheetsController).singleton(),
});

export default container;
