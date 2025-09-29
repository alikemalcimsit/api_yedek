import { PrismaClient } from '../../generated/prisma/index.js'
import { getDatabaseConfigByDomain } from '../config/databaseMapping.js'
import dotenv from 'dotenv';
dotenv.config();  
export const createClient = (dbName,domain = null) => {
  let databaseUrl;
  if (domain) {
    // Domain'e göre veritabanı konfigürasyonu al
    const dbConfig = getDatabaseConfigByDomain(domain);
    databaseUrl = dbConfig.url;
    console.log(`PrismaClient oluşturuluyor: Domain=${domain}, DB=${dbConfig.database}`);
  } else {
    // Eski yöntem (geriye uyumluluk için)
    databaseUrl = `mysql://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.HOST2}:${process.env.DBPORT}/${dbName}`;
    console.log(`PrismaClient oluşturuluyor: DB=${dbName}`);
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
}

// Domain'e göre client oluşturma (yeni fonksiyon)
export const createClientByDomain = (domain) => {
  const dbConfig = getDatabaseConfigByDomain(domain);
 
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbConfig.url
      }
    }
  });
  return client;
};