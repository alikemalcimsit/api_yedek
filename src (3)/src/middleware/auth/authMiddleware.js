import { verifyAccessToken, generateTokens } from '../../services/token/tokenService.js';
import { ROLE_NAMES } from '../../constants/roleConstants.js';

/**
 * JWT Token doğrulama middleware'i
 */
const authenticateToken = (req, res, next) => {
    try {
        let token = null;

        // 1. Cookie'den token al
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        
        // 2. Authorization header'dan token al (fallback)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // "Bearer " kısmını çıkar
            }
        }

        // Token yoksa unauthorized
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Erişim token\'ı gerekli'
            });
        }

        // Token'ı doğrula
        const decoded = verifyAccessToken(token);
        
        // Kullanıcı bilgilerini req.user'a yerleştir
        req.user = {
            id: decoded.id,
            userSystemId: decoded.userSystemId,
            username: decoded.username,
            role: decoded.role,
            name: decoded.name,
            iat: decoded.iat,
            exp: decoded.exp
        };

        next();

    } catch (error) {
        console.error('AuthMiddleware - authenticateToken hatası:', error);
        
        // Token süresi dolmuş veya geçersiz
        if (error.message.includes('süresi dolmuş') || 
            error.message.includes('Geçersiz token') ||
            error.message.includes('Token doğrulanamadı')) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token doğrulama hatası'
        });
    }
};

/**
 * Sliding Session Middleware
 * Token'ın son 20 dakikasında otomatik yenileme yapar
 */
const slidingSession = (req, res, next) => {
    try {
        // Sadece authenticated user'lar için çalışır
        if (!req.user?.exp) {
            return next();
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = req.user.exp - currentTime;
        
        // Token'ın son 20 dakikasında yenileme yap (1200 saniye = 20 dakika)
        const REFRESH_THRESHOLD = 20 * 60; // 20 dakika
        
        if (timeUntilExpiry < REFRESH_THRESHOLD && timeUntilExpiry > 0) {
            try {
                // Yeni access token üret
                const { accessToken } = generateTokens({
                    id: req.user.id,
                    userSystemId: req.user.userSystemId,
                    username: req.user.username,
                    role: req.user.role,
                    name: req.user.name
                });

                // Cookie settings'i merkezi fonksiyondan al
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 1000 // 1 saat
                };

                // Yeni token'ı cookie'ye set et
                res.cookie('accessToken', accessToken, cookieOptions);

                // Frontend için header'a yeni token'ı ekle
                res.set('X-New-Access-Token', accessToken);
                
                // Development ortamında log
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔄 Token otomatik yenilendi - User: ${req.user.username}, Kalan süre: ${Math.floor(timeUntilExpiry/60)} dakika`);
                }
                
            } catch (tokenError) {
                console.error('Sliding session token yenileme hatası:', tokenError);
                // Hata olsa da devam et, mevcut token hala geçerli
            }
        }
        
        next();
    } catch (error) {
        console.error('SlidingSession middleware hatası:', error);
        next(); // Hata olsa da devam et
    }
};

/**
 * Rol tabanlı yetkilendirme middleware'i
 * Database rol değerleri: "0" = agent, "1" = admin, "2" = super_admin
 * @param {Array} allowedRoles - İzin verilen roller (örn: ["1", "2"] admin ve super admin için)
 */
const authorizeRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            // Önce token doğrulama yapılmalı
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Kimlik doğrulama gerekli'
                });
            }

            const userRole = String(req.user.role); // Role'ü string'e çevir

            // Eğer izin verilen roller belirtilmemişse, sadece kimlik doğrulama yeterli
            if (allowedRoles.length === 0) {
                return next();
            }

            // allowedRoles array'ini string'e çevir
            const allowedRolesStr = allowedRoles.map(role => String(role));

            // Kullanıcının rolü izin verilen roller arasında mı?
            if (!allowedRolesStr.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Bu işlem için yetkiniz bulunmuyor. Mevcut yetki: ${ROLE_NAMES[userRole] || 'Bilinmeyen'}`
                });
            }

            next();

        } catch (error) {
            console.error('AuthMiddleware - authorizeRoles hatası:', error);
            return res.status(500).json({
                success: false,
                message: 'Yetkilendirme hatası'
            });
        }
    };
};

/**
 * Opsiyonel auth middleware - token varsa doğrula, yoksa devam et
 */
const optionalAuth = (req, res, next) => {
    try {
        let token = null;

        // Cookie'den token al
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        
        // Authorization header'dan token al
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // Token yoksa, user olmadan devam et
        if (!token) {
            req.user = null;
            return next();
        }

        // Token varsa doğrula
        try {
            const decoded = verifyAccessToken(token);
            req.user = {
                id: decoded.id,
                userSystemId: decoded.userSystemId,
                username: decoded.username,
                role: decoded.role,
                name: decoded.name,
                iat: decoded.iat,
                exp: decoded.exp
            };
        } catch (tokenError) {
            // Token geçersizse, user null olarak devam et
            req.user = null;
        }

        next();

    } catch (error) {
        console.error('AuthMiddleware - optionalAuth hatası:', error);
        req.user = null;
        next();
    }
};

export {
    authenticateToken,
    authorizeRoles,
    optionalAuth,
    slidingSession
}; 