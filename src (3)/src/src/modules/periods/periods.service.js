

import { PeriodsRepository } from './periods.repository.js';
import { BaseService } from '../base/base.service.js';

export class PeriodsService extends BaseService {
  constructor({ periodsRepository }) {
    super(periodsRepository);
  }


}
