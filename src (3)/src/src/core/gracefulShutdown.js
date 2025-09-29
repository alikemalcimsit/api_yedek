/**
 * Graceful shutdown handler
 * @param {string} signal - Signal type (SIGTERM, SIGINT)
 * @param {Object} server - Server instance
 */
const gracefulShutdown = (signal, server) => {
    console.log(`\n⚡ ${signal} sinyali alındı. Server kapatılıyor...`);

    server.close((err) => {
        if (err) {
            console.error('❌ Server kapatılırken hata:', err);
            process.exit(1);
        }

        console.log('✅ Server başarıyla kapatıldı');
        process.exit(0);
    });

    // Zorla kapatma (10 saniye sonra)
    setTimeout(() => {
        console.error('⏰ Server 10 saniye içinde kapanmadı, zorla kapatılıyor...');
        process.exit(1);
    }, 10000);
};
export { gracefulShutdown };