import { prisma } from './prisma.js';

/**
 * Artık multi-tenant olmadığı için tek client döndürür
 * Geriye dönük uyumluluk için bu fonksiyon korunuyor
 * @param {string} dbName - Artık kullanılmıyor 
 * @param {string} dbUser - Artık kullanılmıyor
 * @param {string} dbPass - Artık kullanılmıyor
 * @param {string} dbHost - Artık kullanılmıyor
 * @returns {PrismaClient}
 */
export const getOrCreateClient = (dbName, dbUser, dbPass, dbHost) => {
  console.log(`🌐 Tek veritabanı modunda çalışıyor - multi-tenant kaldırıldı`);
  return prisma;
};
