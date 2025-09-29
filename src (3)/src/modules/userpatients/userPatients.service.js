// src/modules/userpatients/userPatients.service.js
import { BaseService } from '../base/base.service.js';

export class UserPatientsService extends BaseService {
  constructor({ userPatientsRepository }) {
    super(userPatientsRepository);
  }

  async assignAdmin(id, data) {
    const { userSystemId } = data;
    if (!userSystemId) throw new Error('userSystemId gerekli');

    return this.repository.update(id, { userSystemId });
  }
}
