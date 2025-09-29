// Configuration management with environment-specific settings
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';

// Environment-specific dotenv loading
const loadEnvironmentConfig = () => {
    const environment = process.env.NODE_ENV || 'development';
    
    // Önce genel .env dosyasını yükle
    dotenvConfig();
    
    // Sonra environment-specific dosyayı yükle (varsa)
    const envFile = `.env.${environment}`;
    if (fs.existsSync(envFile)) {
        dotenvConfig({ path: envFile });
    }
};

// SSL sertifikalarını yükle (production için)
const loadSSLOptions = () => {
    try {
        const keyPath = process.env.SSL_KEY_PATH;
        const certPath = process.env.SSL_CERT_PATH;
        
        if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            return {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
        }
        return null;
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            console.error('SSL sertifikaları yüklenemedi:', error);
        }
        return null;
    }
};

// Environment config'i yükle
loadEnvironmentConfig();

// Ana configuration objesi
export const config = {
    // Server ayarları
    PORT: parseInt(process.env.PORT || '5002'),
    HOST: process.env.HOST || 'localhost',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    
    // JWT Settings
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    
    // CORS ayarları
    CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    
    // SSL (production için)
    SSL_OPTIONS: loadSSLOptions(),
    
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 dakika
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Request limiti
    
    // Diğer ayarlar
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret'
};