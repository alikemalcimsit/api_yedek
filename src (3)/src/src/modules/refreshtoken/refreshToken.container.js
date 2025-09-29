// src/container/appointment.container.js
import { createContainer, asClass } from 'awilix';

import { RefreshTokenRepository } from './refreshToken.repository.js';
import { RefreshTokenService } from './refreshToken.service.js';
import { RefreshTokenController } from './refreshToken.controller.js';

const container = createContainer();

container.register({
  refreshTokenRepository: asClass(RefreshTokenRepository).singleton(),
  refreshTokenService: asClass(RefreshTokenService).singleton(),
  refreshTokenController: asClass(RefreshTokenController).singleton(),
});

export default container;
