import { Router } from 'express';
import container from './adminMaintance.container.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const adminMaintenanceController = container.resolve('adminMaintenanceController');

// ✅ Middleware: x-admin-secret kontrolü
const adminSecretMiddleware = (req, res, next) => {
  const providedSecret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!providedSecret) {
    return res.status(401).json({ success: false, message: 'x-admin-secret header is required' });
  }

  if (providedSecret !== expectedSecret) {
    return res.status(401).json({ success: false, message: 'Invalid admin secret' });
  }

  next();
};

router.post(
  '/hash-passwords',
  adminSecretMiddleware,   // ✅ Secret check middleware
  domainMiddleware,        // 🌐 Domain-to-DB middleware
  adminMaintenanceController.hashPasswordsForDomain
);

export default router;
