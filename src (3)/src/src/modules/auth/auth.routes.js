import { Router } from 'express';
import container from './auth.container.js';
import { authenticateToken, authorizeRoles } from '../../middleware/auth/authMiddleware.js';
import { validateLoginInput, validateUpdatePassword } from '../../middleware/index.js';
import { USER_ROLES, ROLE_GROUPS } from '../../constants/roleConstants.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const authController = container.resolve('authController');

router.get('/', (req, res) => {
  res.json({
    endpoint: 'auth',
    description: 'Authentication routes',
    routes: [
      { method: 'POST', path: '/refresh', description: 'Refresh token yenileme' },
      { method: 'POST', path: '/otp', description: 'OTP gönderme' },
      { method: 'POST', path: '/verify-otp', description: 'OTP kontrol' },

      { method: 'POST', path: '/login', description: 'Login' },
      { method: 'POST', path: '/logout', description: 'Logout' },
      { method: 'GET', path: '/verify', description: 'Token doğrulama' },

      { method: 'GET', path: '/profile', description: 'Profil bilgisi' },
      { method: 'POST', path: '/update-password', description: 'Şifre güncelleme' },
      { method: 'GET', path: '/admin-only', description: 'Admin only' },
      { method: 'GET', path: '/super-admin-only', description: 'Super Admin only' },
      { method: 'GET', path: '/agent-only', description: 'Agent only' }
    ]
  });
});

// Refresh token
router.post('/refresh', domainMiddleware, authController.refreshTokens);
// OTP doğrulama
router.post('/verify-otp', domainMiddleware, authController.verifyOtp);

// Login
router.post('/login', domainMiddleware, validateLoginInput, authController.login);

// OTP gönderme
router.post('/otp', authController.sendOtp);

// Logout
router.post('/logout', domainMiddleware, authenticateToken, authController.logout);

// Token doğrulama
router.get('/verify', domainMiddleware, authenticateToken, authController.verifyToken);

// Profil bilgisi
router.get('/profile', domainMiddleware, authenticateToken, authController.getProfile);

// Şifre güncelleme
router.post('/update-password', domainMiddleware, authenticateToken, validateUpdatePassword, authController.updatePassword);

// Admin yetkisi isteyen endpoint
router.get('/admin-only',
  authenticateToken,
  authorizeRoles(ROLE_GROUPS.ADMINS_ONLY),
  (req, res) => {
    res.json({ success: true, message: 'Admin yetkisi ile erişildi', user: req.user });
  }
);

// Super Admin yetkisi isteyen endpoint
router.get('/super-admin-only',
  authenticateToken,
  authorizeRoles(ROLE_GROUPS.SUPER_ADMINS_ONLY),
  (req, res) => {
    res.json({ success: true, message: 'Super Admin yetkisi ile erişildi', user: req.user });
  }
);

// Agent yetkisi isteyen endpoint
router.get('/agent-only',
  authenticateToken,
  authorizeRoles([USER_ROLES.AGENT]),
  (req, res) => {
    res.json({ success: true, message: 'Agent yetkisi ile erişildi', user: req.user });
  }
);

export default router;
