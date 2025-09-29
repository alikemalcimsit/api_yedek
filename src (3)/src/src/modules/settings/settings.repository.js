// src/repositories/settings.repository.js

import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class SettingsRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'settings';
  }

  // name'e göre ayar getir
  async findByName(name) {
    if (!name) throw new Error('Ayar adı (name) zorunludur');

    return this.model.findUnique({
      where: { name }
    });
  }

  // name'e göre value güncelle
  async updateByName(name, value) {
    if (!name || typeof value === 'undefined') {
      throw new Error('Ayar adı ve değeri zorunludur');
    }

    return this.model.update({
      where: { name },
      data: { value }
    });
  }
}
