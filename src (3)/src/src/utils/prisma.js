import { PrismaClient } from '../../generated/prisma/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Tek veritabanı konfigürasyonu
const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL
};

// Tek Prisma client - artık multi-tenant değil
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: DATABASE_CONFIG.url,
    },
  },
});

// Hospitals için ayrı client artık gerekli değil - aynı veritabanında
export const hospitalsPrisma = prisma; // Geriye dönük uyumluluk için

// Database bağlantı ayarlarını export ediyoruz
export { DATABASE_CONFIG };