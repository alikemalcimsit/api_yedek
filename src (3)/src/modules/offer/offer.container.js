import { createContainer, asClass } from 'awilix';

import { OfferRepository } from './offer.repository.js';
import { OfferService } from './offer.service.js';
import { OfferController } from './offer.controller.js';

const container = createContainer();

container.register({
  offerRepository: asClass(OfferRepository).singleton(),
  offerService: asClass(OfferService).singleton(),
  offerController: asClass(OfferController).singleton(),
});

export default container;
