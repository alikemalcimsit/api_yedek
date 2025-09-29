/**
 * Domain analiz utility fonksiyonları
 * ÖNCEKİ MULTI-TENANT SİSTEMİ İÇİN KULLANILIYORDU
 * ARTIK TEK VERİTABANI KULLANDIĞIMIZ İÇİN GEREKSIZ
 */

/**
 * HTTP request'inden domain bilgilerini çıkarır
 * @param {Object} req - Express request object
 * @returns {Object} Domain analiz bilgileri (artık sadece log amaçlı)
 */
export const analyzeRequestDomain = (req) => {
    console.log('⚠️ analyzeRequestDomain: Artık multi-tenant değil, sadece bilgi amaçlı');
    
    return {
        // Temel bilgileri log amaçlı tutuyoruz
        host: req.headers.host,
        hostname: req.hostname,
        origin: req.headers.origin,
        
        // Artık domain bazlı veritabanı seçimi yapmıyoruz
        deprecated: true,
        message: 'Multi-tenant yapısı kaldırıldı, tek veritabanı kullanılıyor'
    };
};
        
        // İsteğin tam URL'i
        fullUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        
        // Sadece domain adı (port olmadan)
        cleanDomain: req.hostname || req.headers.host?.split(':')[0]
    };
};

/**
 * Socket.IO bağlantısından domain bilgilerini çıkarır
 * @param {Object} socket - Socket.IO socket object
 * @returns {Object} Socket domain analiz bilgileri
 */
export const analyzeSocketDomain = (socket) => {
    const headers = socket.handshake.headers;
    
    return {
        host: headers.host,
        origin: headers.origin,
        referer: headers.referer,
        userAgent: headers['user-agent'],
        xRealIp: headers['x-real-ip'],
        xForwardedFor: headers['x-forwarded-for'],
        
        // Socket özel bilgileri
        socketId: socket.id,
        remoteAddress: socket.handshake.address,
        time: socket.handshake.time,
        
        // Temiz domain
        cleanDomain: headers.host?.split(':')[0]
    };
};

/**
 * Domain'in development ortamında olup olmadığını kontrol eder
 * @param {string} domain - Domain adı
 * @returns {boolean} Development ortamı mı?
 */
export const isDevelopmentDomain = (domain) => {
    const devDomains = ['localhost', '127.0.0.1', 'api.crmpanel.tr'];
    return devDomains.includes(domain);
};

/**
 * Domain'in production ortamında olup olmadığını kontrol eder
 * @param {string} domain - Domain adı
 * @returns {boolean} Production ortamı mı?
 */
export const isProductionDomain = (domain) => {
    return domain?.includes('crmpanel.tr') && !domain.includes('api.') && !domain.includes('test.');
};

/**
 * Domain bazlı environment bilgisi döner
 * @param {string} domain - Domain adı
 * @returns {Object} Environment bilgisi
 */
export const getEnvironmentFromDomain = (domain) => {
    const isDev = isDevelopmentDomain(domain);
    const isProd = isProductionDomain(domain);
    
    return {
        isDevelopment: isDev,
        isProduction: isProd,
        isStaging: domain?.includes('test.') || domain?.includes('staging.'),
        environmentType: isDev ? 'development' : isProd ? 'production' : 'unknown'
    };
}; 