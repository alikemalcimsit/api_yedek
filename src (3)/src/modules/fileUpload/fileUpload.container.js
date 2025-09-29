import { createContainer, asClass } from 'awilix';

import { FileUploadRepository } from './fileUpload.repository.js';
import { FileUploadService } from './fileUpload.service.js';
import { FileUploadController } from './fileUpload.controller.js';

const container = createContainer();

container.register({
  fileUploadRepository: asClass(FileUploadRepository).singleton(),
  fileUploadService: asClass(FileUploadService).singleton(),
  fileUploadController: asClass(FileUploadController).singleton(),
});

export default container;
