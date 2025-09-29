// src/modules/userlabels/userLabels.service.js

import { BaseService } from '../base/base.service.js';

export class UserLabelsService extends BaseService {
  constructor({ userLabelsRepository }) {
    super(userLabelsRepository);
  }

  // Belirli bir userPatientId'ye ait etiketleri getir
  getLabelsByUserPatientId(userPatientId, labelsParam) {
    if (!userPatientId) throw new Error('userPatientId gerekli');
    return this.repository.findByUserPatientId(userPatientId, labelsParam);
  }

  // Yeni etiket kaydı oluştur
  async createUserLabels(data) {
    const { userPatientId, labels, userSystemId } = data;
    if (!userPatientId || !labels || typeof userSystemId === 'undefined') {
      throw new Error('Eksik veri: userPatientId, labels, userSystemId gerekli');
    }

    return this.repository.create(data);
  }

  // Etiketleri güncelle
async updateUserLabels(id, data) {
  if (!id || !data.labels || !data.userPatientId || !data.userSystemId) {
    throw new Error('ID, userPatientId, userSystemId ve labels gereklidir');
  }

  // Kayıt var mı kontrolü
  const existing = await this.repository.findUserPatientAndSystem(
    data.userPatientId,
    data.userSystemId
  );
  if (!existing || !existing.userSystem) {
    throw new Error('Güncellenecek kullanıcı veya admin bulunamadı');
  }

  // Güncelleme
  const updated = await this.repository.updateLabels(id, {
    userSystemId: Number(data.userSystemId),
    userPatientId: Number(data.userPatientId),
    labels: data.labels,
    updatedAt: new Date(),
  });

  return updated;
}


  // Etiketi sil
  async deleteUserLabels(id) {
    if (!id) throw new Error('Silinecek ID eksik');
    return this.repository.delete(id);
  }
}
