// src/repositories/labels.repository.js

import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class LabelsRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'labels';
  }

  // Toplu etiket ekleme
  async bulkInsert(labels) {
    return this.model.createMany({
      data: labels,
      skipDuplicates: true, // varsa aynı veriyi tekrar eklemez
    });
  }

  // Gerekirse özel sorgular buraya eklenebilir
}
