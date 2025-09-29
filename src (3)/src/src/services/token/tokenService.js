import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/index.js';

/**
 * OTP'yi hash'ler
 * @param {string} otpCode - Hash'lenecek OTP kodu
 * @returns {string} Hash'lenmiş OTP
 */
const hashOtp = async (otpCode) => {
    const saltRounds = 10;
    return await bcrypt.hash(otpCode, saltRounds);
};

/**
 * OTP doğrulama için JWT token oluşturur
 * @param {number} userId - Kullanıcı ID
 * @param {string} hashedOtp - Hash'lenmiş OTP kodu
 * @returns {string} OTP doğrulama token'ı
 */
const generateOtpToken = (userId, hashedOtp) => {
    const otpTokenPayload = {
        userId,
        hashedOtp,
        type: 'otp_verification'
    };

    return jwt.sign(otpTokenPayload,
        process.env.JWT_SECRET || 'iNNCQi6KpuTuIIXwPqIpFbZq2eEI0L', {
        expiresIn: '3m', // 3 dakika
        issuer: process.env.JWT_ISSUER || 'crm-api',
        audience: process.env.JWT_AUDIENCE || 'crm-clients'
    });
};

/**
 * OTP token'ını doğrular
 * @param {string} token - Doğrulanacak OTP token
 * @returns {Object} Token payload'u
 */
const verifyOtpToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'iNNCQi6KpuTuIIXwPqIpFbZq2eEI0L';
        const decoded = jwt.verify(token, secret, {
            issuer: process.env.JWT_ISSUER || 'crm-api',
            audience: process.env.JWT_AUDIENCE || 'crm-clients'
        });

        if (decoded.type !== 'otp_verification') {
            throw new Error('Geçersiz token tipi');
        }

        return decoded;
    } catch (error) {
        console.error('TokenService - verifyOtpToken hatası:', error);
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Geçersiz OTP token');
        } else if (error.name === 'TokenExpiredError') {
            throw new Error('OTP token süresi dolmuş');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('OTP token henüz aktif değil');
        }
        throw new Error(`OTP token doğrulanamadı: ${error.message}`);
    }
};

/**
 * OTP kodunu doğrular
 * @param {string} otpInput - Kullanıcının girdiği OTP
 * @param {string} hashedOtp - Hash'lenmiş OTP
 * @returns {boolean} OTP geçerliliği
 */
const verifyOtpCode = async (otpInput, hashedOtp) => {
    try {
        return await bcrypt.compare(otpInput, hashedOtp);
    } catch (error) {
        console.error('TokenService - verifyOtpCode hatası:', error);
        throw new Error('OTP doğrulama hatası');
    }
};


/**
 * JWT Access ve Refresh Token üretir
 * @param {Object} payload - Token'a embed edilecek data
 * @returns {Object} Access ve Refresh Token
 */
const generateTokens = (payload) => {
    const accessTokenPayload = {
        ...payload,
        type: 'access'
    };

    const refreshTokenPayload = {
        ...payload,
        type: 'refresh'
    };

    const accessToken = jwt.sign(accessTokenPayload,
        process.env.JWT_SECRET || 'iNNCQi6KpuTuIIXwPqIpFbZq2eEI0L', {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '1h', // 1 saat
        issuer: process.env.JWT_ISSUER || 'crm-api',
        audience: process.env.JWT_AUDIENCE || 'crm-clients'
    });

    const refreshToken = jwt.sign(refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET || 'QarXZkeYmtflsk09j7m0kdsGiXEzm5', {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '30d', // 30 gün
        issuer: process.env.JWT_ISSUER || 'crm-api',
        audience: process.env.JWT_AUDIENCE || 'crm-clients'
    });

    return { accessToken, refreshToken };
};
/**
 * Refresh token'ı doğrular (JWT seviyesinde)
 * @param {string} token - Doğrulanacak token
 * @returns {Object} Token payload'u
 */
const verifyRefreshToken = (token) => {
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET || 'QarXZkeYmtflsk09j7m0kdsGiXEzm5';
        const decoded = jwt.verify(token, secret, {
            issuer: process.env.JWT_ISSUER || 'crm-api',
            audience: process.env.JWT_AUDIENCE || 'crm-clients'
        });

        if (decoded.type !== 'refresh') {
            throw new Error('Geçersiz token tipi');
        }

        return decoded;
    } catch (error) {
        throw new Error('Refresh token geçersiz');
    }
};

/**
 * JWT Token'ı doğrular ve payload'u döner
 * @param {string} token - Doğrulanacak token
 * @returns {Object} Token payload'u
 */
const verifyAccessToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'iNNCQi6KpuTuIIXwPqIpFbZq2eEI0L';
        const decoded = jwt.verify(token, secret, {
            issuer: process.env.JWT_ISSUER || 'crm-api',
            audience: process.env.JWT_AUDIENCE || 'crm-clients'
        });

        return decoded;
    } catch (error) {
        console.error('TokenService - verifyAccessToken hatası:', error);
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Geçersiz token');
        } else if (error.name === 'TokenExpiredError') {
            throw new Error('Token süresi dolmuş');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token henüz aktif değil');
        }
        throw new Error(`Token doğrulanamadı: ${error.message}`);
    }
};

/**
 * Token'dan sadece payload'u çıkarır (doğrulama yapmaz)
 * @param {string} token - Decode edilecek token
 * @returns {Object} Token payload'u
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('TokenService - decodeToken hatası:', error);
        throw new Error(`Token decode edilemedi: ${error.message}`);
    }
};

/**
 * Cookie ayarlarını döner
 * @returns {Object} Cookie seçenekleri
 */
const getCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true, // XSS koruması
        secure: isProduction, // HTTPS zorunlu (production)
        sameSite: 'strict', // CSRF koruması
        maxAge: 24 * 60 * 60 * 1000, // 24 saat (milisaniye)
        path: '/' // Tüm path'lerde geçerli
    };
};

/**
 * Refresh token'ı database'e kaydeder
 * @param {number} userId - Kullanıcı ID
 * @param {string} refreshToken - Oluşturulan refresh token
 * @param {Object} req - Express request objesi
 */
 const saveRefreshToken = async (prismaClient, userId, refreshToken, req) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  console.log('prismaClient:', prismaClient);


  if (prismaClient.user_tokens) {
    await prismaClient.user_tokens.create({
      data: {
        user_id: userId,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });
  
    }

    else if (prismaClient.refreshtokens) {
  console.log("✅ refreshtokens tablosu bulundu");

  await prismaClient.refreshtokens.create({
    data: {
      userId: userId,
      token: refreshToken,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      expiresAt: expiresAt,
    },
  });
} else {
  throw new Error('❌ refreshtokens modeli Prisma client içinde bulunamadı!');
}


};


/**
 * Refresh token'ı database'den doğrular
 * @param {string} refreshToken - Doğrulanacak token
 * @returns {Object} Kullanıcı bilgileri
 */
const validateRefreshToken = async (refreshToken) => {
    // Önce JWT olarak doğrula
    const decoded = verifyRefreshToken(refreshToken);

    // Sonra database'den kontrol et
    const tokenRecord = await prisma.refreshtokens.findFirst({
        where: {
            token: refreshToken,
            isActive: true,
            expiresAt: {
                gt: new Date()
            }
        },
        include: {
            userSystem: {
                select: {
                    id: true,
                    userSystemId: true,
                    username: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    if (!tokenRecord) {
        throw new Error('Refresh token geçersiz veya süresi dolmuş');
    }

    // Son kullanım zamanını güncelle
    await prisma.refreshtokens.update({
        where: { id: tokenRecord.id },
        data: { lastUsed: new Date() }
    });

    return tokenRecord.userSystem;
};

/**
 * Refresh token'ı iptal eder
 * @param {string} refreshToken - İptal edilecek token
 */
const revokeRefreshToken = async (refreshToken) => {
    await prisma.refreshtokens.updateMany({
        where: { token: refreshToken },
        data: { isActive: false }
    });
};

/**
 * Kullanıcının tüm refresh token'larını iptal eder
 * @param {number} userId - İptal edilecek kullanıcı ID
 */
const revokeAllUserTokens = async (userId) => {
    await prisma.refreshtokens.updateMany({
        where: { userId: userId },
        data: { isActive: false }
    });
};

export {
    generateTokens,
    verifyRefreshToken,
    verifyAccessToken,
    decodeToken,
    getCookieSettings,
    saveRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    hashOtp,
    generateOtpToken,
    verifyOtpToken,
    verifyOtpCode
};