import https from 'https';
import http from 'http';
import fs from 'fs';
import { gracefulShutdown } from './gracefulShutdown.js';
/**
 * HTTP/HTTPS server oluşturur
 * @param {Object} app - Express app instance
 * @returns {Object} HTTP veya HTTPS server instance
 */
export const createServer = (app) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // SSL sertifikası kontrol et
    const sslKeyPath = process.env.SSL_KEY_PATH;
    const sslCertPath = process.env.SSL_CERT_PATH;
    
    if (isProduction && sslKeyPath && sslCertPath) {
        try {
            const SSL_OPTIONS = {
                key: fs.readFileSync(sslKeyPath),
                cert: fs.readFileSync(sslCertPath)
            };
            
            console.log('🔒 HTTPS server başlatılıyor...');
            console.log(`   📜 SSL Sertifika: ${SSL_OPTIONS.cert ? 'Yüklendi' : 'Bulunamadı'}`);
            return https.createServer(SSL_OPTIONS, app);
        } catch (error) {
            console.warn('⚠️  Production ortamında SSL sertifikası yüklenemedi:', error.message);
            console.log('🌐 HTTP server başlatılıyor...');
            return http.createServer(app);
        }
    } else {
        console.log('🌐 HTTP server başlatılıyor...');
        if (!isProduction) {
            console.log('   🛠️  Development modu - SSL devre dışı');
        }
        return http.createServer(app);
    }
};

/**
 * Server'ı başlatır ve error handling yapar
 * @param {Object} server - HTTP/HTTPS server instance
 * @param {number} port - Port numarası
 * @param {string} host - Host adresi
 * @returns {Promise} Server başlatma promise'i
 */
export const startServer = (server, port, host = 'localhost') => {
    return new Promise((resolve, reject) => {
        server.listen(port, host, (err) => {
            if (err) {
                console.error('❌ Server başlatılamadı:', err);
                reject(err);
                return;
            }

            const protocol = server.key ? 'https' : 'http';
            console.log(`🚀 Sunucu ${protocol}://${host}:${port} portta çalışıyor`);
            console.log(`📡 Mod: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 SSL: ${server.key ? 'Etkin' : 'Devre dışı'}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV === 'development' ? 'Development' : process.env.NODE_ENV === 'production' ? 'Production' : 'Unknown'}`);
            
            resolve(server);
        });

        // Server error handling
        server.on('error', (err) => {
            console.error('❌ Server hatası:', err);
            reject(err);
        });

        // Signal handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
        process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
    });
};