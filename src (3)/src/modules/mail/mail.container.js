import { MailRepository } from './mail.repository.js';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';
import { asClass, createContainer } from 'awilix';

const container = createContainer();
container.register({
  mailRepository: asClass(MailRepository).singleton(),
  mailService: asClass(MailService).singleton(),   // prisma beklemiyor artık
  mailController: asClass(MailController).singleton(),
});
export default container;