import { BaseController } from '../base/base.controller.js';
import { generateTokens, revokeRefreshToken, saveRefreshToken, validateRefreshToken } from '../../services/token/tokenService.js';
import { sendOtpSms } from '../../services/sms/smsService.js';
import { asyncHandler } from '../../middleware/index.js';

export class AuthController extends BaseController {
  constructor({ authService }) {
    super(authService);
    // ❌ bind gereksiz, class field syntax kullanıyoruz
  }

  login = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
      }

      const user = await this.service.authenticateUser(username, password);
      const tokens = generateTokens(user);
      await saveRefreshToken(user.id, tokens.refreshToken, req);

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

      res.status(200).json({ success: true, message: 'Giriş başarılı', user, tokens });
    })
  );

  sendOtp = asyncHandler(async (req, res) => {
    const phoneNumber = req.body.sect;
    const domain = req.headers['x-domain'];

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Telefon numarası gerekli' });
    }

    const testNumbers = ['5541158818'];
    const otpCode = testNumbers.includes(phoneNumber)
      ? '12345'
      : Math.floor(100000 + Math.random() * 900000).toString();

    if (!testNumbers.includes(phoneNumber)) {
      await sendOtpSms(phoneNumber, otpCode, domain);
    }

    res.json({ success: true, message: 'OTP SMS gönderildi' });
  });

  logout = this.withDynamicClient(
    asyncHandler(async (req, res) => {
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

  verifyToken = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Token geçerli',
        user: req.user,
      });
    })
  );

  getProfile = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { id } = req.user;
      const user = await this.service.getById(id);
      res.status(200).json({ success: true, user });
    })
  );

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
      await saveRefreshToken(user.id, tokens.refreshToken, req);

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
}
