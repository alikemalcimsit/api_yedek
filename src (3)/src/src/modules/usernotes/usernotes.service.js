// src/services/usernotes.service.js

import { BaseService } from '../base/base.service.js';

export class UsernotesService extends BaseService {
  constructor({ usernotesRepository }) {
    super(usernotesRepository);
  }

  // ✅ Not oluştururken kontrol yap
  async createWithValidation(data) {
    const { userPatientId, userSystemId, notes } = data;

    if (!userPatientId || !userSystemId || !notes) {
      throw new Error('Zorunlu alanlar eksik');
    }

    const isValid = await this.repository.checkUserPatientAndSystem(userPatientId, userSystemId);
    if (!isValid) {
      throw new Error('Kullanıcı veya sistem bulunamadı');
    }

    return this.repository.create(data);
  }

  // ✅ Hasta ID ile notları getir
  getNotesByUserPatientId(userPatientId) {
    if (!userPatientId) throw new Error('userPatientId gerekli');
    return this.repository.findByUserPatientIdWithSystemName(userPatientId);
  }

  // ✅ Sistem kullanıcısına ait notları getir (varsa)
  getNotesByUserSystemId(userSystemId) {
    if (!userSystemId) throw new Error('userSystemId gerekli');
    return this.repository.findByUserSystemId(userSystemId);
  }

  // ✅ Notu güncelle
  async updateWithValidation(id, data) {
    const { userPatientId, userSystemId, notes } = data;

    if (!id || !userPatientId || !userSystemId || !notes) {
      throw new Error('Zorunlu alanlar eksik');
    }

    const isValid = await this.repository.checkUserPatientAndSystem(userPatientId, userSystemId);
    if (!isValid) {
      throw new Error('Kullanıcı veya sistem bulunamadı');
    }

    return this.repository.update(id, data);
  }

  // ✅ Notu sil
  async deleteNote(id) {
    if (!id) throw new Error('Silinecek ID eksik');
    return this.repository.delete(id);
  }
}
