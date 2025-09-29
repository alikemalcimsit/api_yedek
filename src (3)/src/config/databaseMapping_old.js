// ÖNCEKİ MULTI-TENANT YAPISI - ARTIK KULLANILMIYOR
// TEK VERİTABANI KULLANIYOR, DOMAIN MAPPING GEREKLİ DEĞİL

/**
 * @deprecated Multi-tenant yapısı kaldırıldı
 * Artık tek veritabanı kullanıyoruz
 */
export const DOMAIN_DATABASE_MAPPING = {
  // Artık kullanılmıyor - geriye dönük uyumluluk için tutuldu
  deprecated: true
};

/**
 * @deprecated Artık tek veritabanı kullanıyoruz
 */
export const DEFAULT_DATABASE_CONFIG = {
  deprecated: true,
  message: 'Tek veritabanı kullanıyoruz, bu mapping gereksiz'
};

/**
 * @deprecated Hospitals da aynı veritabanında
 */
export const HOSPITALS_DATABASE_CONFIG = {
  deprecated: true,
  message: 'Hospitals da ana veritabanında'
};

/**
 * @deprecated Domain'e göre veritabanı seçimi artık yok
 */
export const getDatabaseConfigByDomain = (domain) => {
  console.log('⚠️ getDatabaseConfigByDomain: Artık multi-tenant değil');
  return {
    deprecated: true,
    message: 'Tek veritabanı kullanıyoruz'
  };
};
  
  if (!config) {
    console.warn(`⚠️ '${domain}' domaini için mapping bulunamadı, varsayılan kullanılıyor`);
    return DEFAULT_DATABASE_CONFIG;
  }
  return config;
};

// Tüm domain'leri listeleme (debug için)
export const getAllDomains = () => {
  return Object.keys(DOMAIN_DATABASE_MAPPING);
}; 