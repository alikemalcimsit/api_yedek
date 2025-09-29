import { BaseController } from '../base/base.controller.js';
import {
  generateTokens, revokeRefreshToken, saveRefreshToken, validateRefreshToken,
  hashOtp, generateOtpToken, verifyOtpToken, verifyOtpCode
} from '../../services/token/tokenService.js';
import { sendOtpSms } from '../../services/sms/smsService.js';
import { asyncHandler } from '../../middleware/index.js';
import { prisma } from '../../utils/prisma.js';

export class AuthController extends BaseController {
  constructor({ authService, settingsService }) {
    super(authService);
    this.settingsService = settingsService;
  }

  //login endpoint
  login = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const domain = req.headers['x-domain'];
      const { username, password } = req.body;
        console.log('Login isteği alındı:', { domain, username });

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
      }

      try {
        console.log('Kullanıcı adı:', username);
        const user = await this.service.authenticateUser(username, password);
        const { password: _, sourceId: __, phoneNumber: ___, ...returnUser } = user;
console.log('Kullanıcı doğrulandı:', returnUser);
        // //ip adresi
        // const ipAdres = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
        // console.log('IP Adresi:', ipAdres);
        // if (user.ip_adress !== "1" && user.ip_adress !== ipAdres) {
        //   return res.status(401).json({ success: false, message: 'IP adresi eşleşmiyor' });
        // }


        console.log('OTP ayarları kontrol ediliyor...');
        const otpSetting = await this.settingsService.getSettingByName('factor_authentication');
        let isOtpEnabled = otpSetting?.value === '1';

        //Eğer OTP etkinse, OTP kodu oluştur ve SMS gönder
        if (isOtpEnabled) {
          const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log('OTP kodu oluşturuluyor:', otpCode);


            try {
               await sendOtpSms(user.phoneNumber, otpCode, domain);
            } catch (error) {
              console.error('❌ OTP SMS gönderilirken hata:', error);
              return res.status(500).json({ success: false, message: 'OTP SMS gönderilirken hata oluştu' });
              
            }
         

          const otpHash = await hashOtp(otpCode);
          const otpToken = generateOtpToken(user.id, otpHash);


          return res.status(200).json({
            success: true,
            message: 'SMS gönderildi, lütfen kodu giriniz',
            otp: otpSetting.value,
            otpToken: otpToken,
            user: returnUser
          });

        } else {
          const tokens = generateTokens(user);
          console.log("🧪 Generated tokens:", tokens);
          await saveRefreshToken(prisma, user.id, tokens.refreshToken, req); // Tek prisma client
          console.log('Giriş başarılı, tokenlar oluşturuluyor...');
          res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
          });
          console.log('Access token cookie ayarlandı');
          res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });

          return res.status(200).json({
            success: true,
            message: 'Giriş başarılı',
            otp: otpSetting.value,
            user: returnUser,
            tokens,
          });
        }

      
      } catch (err) {
        console.error('Login hatası:', err.message);
        return res.status(401).json({ success: false, message: err.message || 'Giriş başarısız' });
      }
    })
  );

  // logout endpoint
  logout = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        // Artık tek prisma client kullanıyoruz
        await prisma.refreshtokens.updateMany({
          where: { token: refreshToken },
          data: { isActive: false }
        });
      }

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({ success: true, message: 'Çıkış başarılı' });
    })
  );

  //sendOtp endpoint
  sendOtp = asyncHandler(async (req, res) => {
    const phoneNumber = req.body.sect;
    const domain = req.headers['x-domain'];

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Telefon numarası gerekli' });
    }

    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOtpSms(phoneNumber, otpCode, domain);

      res.json({
        success: true,
        message: 'OTP SMS gönderildi',
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
      });

    } catch (error) {
      console.error('❌ OTP gönderme hatası:', error);
      res.status(500).json({ success: false, message: 'OTP gönderilirken hata oluştu' });
    }
  });

  // verifyOtp endpoint
  verifyOtp = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { otpInput, otpToken } = req.body;

      if (!otpInput || !otpToken) {
        return res.status(400).json({
          success: false,
          message: 'SMS kodu ve token gerekli'
        });
      }
      try {
        // Token'ı doğrula ve decode et
        const decoded = verifyOtpToken(otpToken);

        // OTP'yi doğrula
        const isOtpValid = await verifyOtpCode(otpInput, decoded.hashedOtp);

        if (!isOtpValid) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz SMS kodu'
          });
        }

        const user = await this.service.getById(decoded.userId);
        if (!user) {
          return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }


        //Şifreyi response'dan çıkar
        const { password: _, sourceId: __, phoneNumber: ___, ...returnUser } = user;

        const tokens = generateTokens(user);
        console.log("🧪 Generated tokens:", tokens);

        await saveRefreshToken(prisma, user.id, tokens.refreshToken, req);

        res.cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000 // 1 saat
        });

        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 gün
        });

        res.status(200).json({
          success: true,
          message: 'SMS doğrulandı, giriş başarılı',
          user: returnUser,
          tokens,
        });
      } catch (error) {
        console.error('❌ OTP doğrulama hatası:', error);
        return res.status(400).json({
          success: false,
          message: error.message || 'SMS doğrulama başarısız. Lütfen tekrar deneyin.'
        });
      }
    })
  );

  // verifyToken endpoint
  verifyToken = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Token geçerli',
        user: req.user,
      });
    })
  );

  // refreshTokens endpoint
  refreshTokens = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      let refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token gerekli',
        });
      }

      const user = await validateRefreshToken(refreshToken);
      const tokens = generateTokens(user);

      await revokeRefreshToken(refreshToken);
      await saveRefreshToken(prisma,user.id, tokens.refreshToken, req);

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Token yenilendi',
        tokens,
      });
    })
  );

  // getProfile endpoint
  getProfile = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { id } = req.user;
      const user = await this.service.getById(id);
      res.status(200).json({ success: true, user });
    })
  );

  // updatePassword endpoint
  updatePassword = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { username, newPassword } = req.body;

      if (!username || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı adı ve yeni şifre gerekli',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır',
        });
      }

      const updatedUser = await this.service.updateUserPassword(username, newPassword);

      res.status(200).json({
        success: true,
        message: 'Şifre başarıyla güncellendi',
        user: updatedUser,
      });
    })
  );
} 