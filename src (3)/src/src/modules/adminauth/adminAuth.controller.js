import { BaseController } from '../base/base.controller.js';
import {
  generateTokens,
  revokeRefreshToken,
  saveRefreshToken,
  validateRefreshToken
} from '../../services/token/tokenService.js';
import { asyncHandler } from '../../middleware/index.js';
import { prisma } from '../../utils/prisma.js'; // Tek prisma client

export class AdminAuthController extends BaseController {
  constructor({ adminAuthService }) {
    console.log('🎮 AdminAuthController constructor çağrıldı');
    super(adminAuthService);
  }

  login = asyncHandler(async (req, res) => {
    console.log('🎮 login endpoint çağrıldı');
    const { username, password } = req.body;
    console.log('📦 typeof password:', typeof password);
    console.log('📦 password raw:', password);
    console.log('📦 password bytes:', [...password]);
    if (!username || !password) {
      console.log('🎮 login: Eksik username/password');
      return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
    }

    try {
      const user = await this.service.authenticateUser(username, password);
      const { password: _, sourceId: __, phoneNumber: ___, ...returnUser } = user;

      //ip adress kontrolü
      // const ipAdres =
      //   req.headers['x-forwarded-for'] ||
      //   req.connection.remoteAddress ||
      //   req.socket.remoteAddress ||
      //   req.ip;

      // console.log('🎮 login: Kullanıcı IP kontrolü', ipAdres);

      // if (user.ip_adress !== "1" && user.ip_adress !== ipAdres) {
      //   console.log('🎮 login: IP adresi uyuşmuyor');
      //   return res.status(401).json({ success: false, message: 'IP adresi eşleşmiyor' });
      // }

      const tokens = generateTokens(user);

      await saveRefreshToken(prisma, user.id, tokens.refreshToken, req);
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

      return res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        user: returnUser,
        tokens,
      });

    } catch (err) {
      console.error('🎮 login hatası:', err.message);
      return res.status(401).json({ success: false, message: err.message || 'Giriş başarısız' });
    }
  });

  logout = asyncHandler(async (req, res) => {
    console.log('🎮 logout endpoint çağrıldı');
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
  });

  verifyToken = asyncHandler(async (req, res) => {
    console.log('🎮 verifyToken endpoint çağrıldı');
    res.status(200).json({
      success: true,
      message: 'Token geçerli',
      user: req.user,
    });
  });

  refreshTokens = asyncHandler(async (req, res) => {
    console.log('🎮 refreshTokens endpoint çağrıldı');
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      console.log('🎮 refreshTokens: Refresh token yok');
      return res.status(401).json({ success: false, message: 'Refresh token gerekli' });
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
  });

  getProfile = asyncHandler(async (req, res) => {
    console.log('🎮 getProfile endpoint çağrıldı');
    const { id } = req.user;
    const user = await this.service.getById(id);
    res.status(200).json({ success: true, user });
  });

  updatePassword = asyncHandler(async (req, res) => {
    console.log('🎮 updatePassword endpoint çağrıldı');
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
  });
}
