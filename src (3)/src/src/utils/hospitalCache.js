import { prisma } from './prisma.js'; // Artık tek prisma client

const hospitalCache = new Map();

// Hastaneye özel ek bilgiler (hala kullanılabilir)
const additionalInfoMap = {
  "drm.crmpanel.tr": {
    title: "Özel DRM Hastanesi",
    logo: "https://drm.crmpanel.tr/images/logo/drm.png",
    hospitalListId: "0",
    appId: "0",
    fb_page_id: "[123456789012345]",
  },
  "example.com": {
    title: "Test Hastanesi",
    logo: "https://medicine.crmpanel.tr/images/logo/pratik_test.png",
    hospitalListId: "1",
    appId: "1",
    fb_page_id: "[304155929444155,117703931283953]",
  },
};

/**
 * Hospitals tablosunu cache'e yükler (artık tek veritabanından)
 */
export const loadHospitalCache = async () => {
  console.log('🔄 Hospitals bilgileri cache\'e yükleniyor... (tek veritabanından)');
  const hospitals = await prisma.crm_hospitals.findMany(); // Yeni model adı
  hospitals.forEach((hospital) => {
    hospitalCache.set(hospital.domain, hospital);
  });
  console.log('✅ Hospitals bilgileri cache\'e yüklendi.');
};

/**
 * Domain'e göre hospital bilgisi alır
 * @param {string} domain
 * @returns {Object|null}
 */
export const getHospitalByDomain = (domain) => {
  return hospitalCache.get(domain) || null;
};

/**
 * Cache'deki hospital bilgilerini ek bilgilerle birleştirir
 * @param {string} domain
 * @returns {Object|null}
 */
export const getHospitalWithAdditionalInfo = (domain) => {
  const hospital = getHospitalByDomain(domain);

  if (!hospital) {
    console.log(`⚠️ Cache'de ${domain} için hospital bilgisi bulunamadı.`);
    return null;
  }

  // Ek bilgileri al
  const additionalInfo = additionalInfoMap[domain] || {};

  // Cache'deki bilgilerle birleştir
  const mergedHospital = { ...hospital, ...additionalInfo };

  console.log('✅ Birleştirilmiş hospital bilgisi:', mergedHospital);

  return mergedHospital;
};

/**
 * Cache'i manuel olarak temizler ve yeniden yükler
 */
export const refreshHospitalCache = async () => {
  hospitalCache.clear();
  await loadHospitalCache();
};