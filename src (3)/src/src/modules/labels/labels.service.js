// src/services/labels.service.js

import { BaseService } from '../base/base.service.js';

export class LabelsService extends BaseService {
  constructor({ labelsRepository }) {
    super(labelsRepository);
  }

  // Toplu etiket ekleme işlemi
  async bulkInsert(labels) {
    if (!Array.isArray(labels) || labels.length === 0) {
      throw new Error('Etiket listesi boş veya geçersiz');
    }

    return this.repository.bulkInsert(labels);
  }

  // Gerekirse ilave özel servis metotları buraya eklenebilir
}
