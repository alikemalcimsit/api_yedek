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

/**
 * Socket.IO bağlantısından domain bilgilerini çıkarır (deprecated)
 * @param {Object} socket - Socket.IO socket object
 * @returns {Object} Socket domain analiz bilgileri
 */
export const analyzeSocketDomain = (socket) => {
    console.log('⚠️ analyzeSocketDomain: Artık multi-tenant değil');
    
    return {
        deprecated: true,
        message: 'Multi-tenant yapısı kaldırıldı'
    };
};

/**
 * Environment kontrolü (hala gerekli olabilir)
 * @param {string} domain - Domain adı
 * @returns {boolean} Development ortamı mı?
 */
export const isDevelopmentDomain = (domain) => {
    const devDomains = ['localhost', '127.0.0.1', 'api.crmpanel.tr'];
    return devDomains.includes(domain);
};

/**
 * Production ortamı kontrolü
 * @param {string} domain - Domain adı  
 * @returns {boolean} Production ortamı mı?
 */
export const isProductionDomain = (domain) => {
    return domain?.includes('crmpanel.tr') && !domain.includes('api.') && !domain.includes('test.');
};

/**
 * Domain'den environment bilgisini döndürür
 * @param {string} domain - Domain adı
 * @returns {string} Environment ('development' veya 'production')
 */
export const getEnvironmentFromDomain = (domain) => {
    if (isDevelopmentDomain(domain)) {
        return 'development';
    }
    return 'production';
};