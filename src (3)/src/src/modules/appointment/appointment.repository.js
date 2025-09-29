import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class AppointmentRepository extends BaseRepository {
  constructor() {
    super(); // sabit client
    this._modelName = 'appointments';
  }
}
