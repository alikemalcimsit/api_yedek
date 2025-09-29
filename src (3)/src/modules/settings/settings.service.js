// src/services/settings.service.js

import { BaseService } from '../base/base.service.js';

export class SettingsService extends BaseService {
  constructor({ settingsRepository }) {
    super(settingsRepository);
  }

  // Tüm ayarları getir
  getAllSettings() {
    return this.repository.findAll();
  }

  // Tek bir ayarı getir
  getSettingByName(name) {
    if (!name) throw new Error('Ayar adı (name) zorunludur');
    return this.repository.findByName(name);
  }

  // Ayar güncelle (adı ve yeni değeri)
  async updateSetting(name, value) {
    if (!name || typeof value === 'undefined') {
      throw new Error('Ayar adı ve değeri zorunludur');
    }

    const existing = await this.repository.findByName(name);
    if (!existing) {
      return { success: false, message: 'Ayar bulunamadı' };
    }

    await this.repository.updateByName(name, value);

    return {
      success: true,
      message: `${name} ayarı başarıyla güncellendi`,
    };
  }
}
