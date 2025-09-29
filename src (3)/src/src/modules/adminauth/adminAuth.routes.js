import { Router } from 'express';
import container from './adminAuth.container.js';
import { authenticateToken, authorizeRoles } from '../../middleware/auth/authMiddleware.js';
import { validateLoginInput, validateUpdatePassword } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const authController = container.resolve('adminAuthController');

router.get('/', (req, res) => {
  res.json({
    endpoint: 'admin-auth',
    description: 'Authentication routes',
    routes: [
      { method: 'POST', path: '/refresh', description: 'Refresh token yenileme' },
  
      { method: 'POST', path: '/login', description: 'Login' },
      { method: 'POST', path: '/logout', description: 'Logout' },
      { method: 'GET', path: '/verify', description: 'Token doğrulama' },

    ]
  });
});

// Refresh token
router.post('/refresh', authController.refreshTokens);

// Login
router.post('/login', validateLoginInput, authController.login);


// Logout
router.post('/logout', authenticateToken, authController.logout);


export default router;
