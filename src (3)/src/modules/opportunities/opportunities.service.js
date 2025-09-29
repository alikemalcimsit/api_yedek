

import { OpportunitiesRepository } from './opportunities.repository.js';
import { BaseService } from '../base/base.service.js';

export class OpportunitiesService extends BaseService {
  constructor({ opportunitiesRepository }) {
    super(opportunitiesRepository); // ✅ doğru inject edilen repository
  }
}
