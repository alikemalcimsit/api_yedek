import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Environment variables yükle
dotenv.config();

// Debug için DATABASE_URL'i kontrol et
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'LOADED' : 'NOT FOUND');

// Eğer DATABASE_URL yoksa, manuel olarak set et
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://vatanpratikcrm:pratik-zxc025*@localhost:3306/vatanpratikcrm_db';
  console.log('DATABASE_URL manually set');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn']
});

export { prisma };
export default prisma;