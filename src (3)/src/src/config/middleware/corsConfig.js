import cors from 'cors';
/**
 * CORS (Cross-Origin Resource Sharing) yapılandırması
 * Bu yapılandırma, crmpanel.tr ve tüm alt domain'lerinden gelen istekleri kabul eder
 */
const corsConfig = cors({
  origin: function (origin, callback) {
    // Geliştirme ortamında origin undefined olabilir (localhost)
    if (!origin) return callback(null, true);

    // crmpanel.tr ve tüm alt domain'lerini kontrol et
    const allowedDomains = [
      /^https?:\/\/(.+\.)?crmpanel\.tr$/,  // *.crmpanel.tr pattern
      'http://localhost:3000'              // Geliştirme için
    ];
       /**
     * Gelen origin'in izin verilen domain'ler arasında olup olmadığını kontrol eder
     * String değerler için doğrudan karşılaştırma
     * RegExp değerler için pattern matching yapar
     */
    const isAllowed = allowedDomains.some(domain => {
      if (typeof domain === 'string') {
        return domain === origin; // Tam eşleşme kontrolü
      }
      // RegExp ise test et (*.crmpanel.tr pattern'i için)
      return domain.test(origin);
    });

    // İzin verilen domain'den geliyorsa erişim izni ver
    if (isAllowed) {
      callback(null, true);
    } else {
      // İzin verilmeyen domain'den geliyorsa hata döndür
      callback(new Error('CORS tarafından engellenmiştir'));
    }
  },
  credentials: true, // COOKIE ve authorization header taşıyabilmesi için
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

export { corsConfig };
