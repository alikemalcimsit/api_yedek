// src/modules/userpatients/userPatients.repository.js
import { BaseRepository } from '../base/base.repository.js';

export class UserPatientsRepository extends BaseRepository {
  constructor() {
     console.log('🏗️ UserPatient constructor çağrıldı');
    super();
    this._modelName = 'userpatient'; // Model adı düzeltildi
    console.log('🏗️ UserPatient _modelName set edildi:', this._modelName);
  }

  // Ek sorgular gerekiyorsa buraya eklenebilir
}
