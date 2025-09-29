// src/modules/userpatients/userPatients.route.js
import { Router } from 'express';
import container from './userPatients.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const userPatientsController = container.resolve('userPatientsController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'userpatients',
    description: 'Kullanıcı hastalarıyla ilgili işlemler',
    routes: [
      { method: 'GET', path: '/', description: 'Tüm hastaları getirir' },
      { method: 'GET', path: '/:id', description: 'Belirli hastayı getirir' },
      { method: 'POST', path: '/', description: 'Yeni hasta oluşturur' },
      { method: 'PUT', path: '/:id', description: 'Hasta bilgilerini günceller' },
      { method: 'PUT', path: '/:id/assign-admin', description: 'Hastaya admin ataması yapar' },
      { method: 'DELETE', path: '/:id', description: 'Hastayı siler' },
    ],
  });
});

router.get('/', domainMiddleware,userPatientsController.list);
router.get('/:id', userPatientsController.detail);
router.post('/', authenticateToken, userPatientsController.create);
router.put('/:id', authenticateToken, userPatientsController.update);
router.put('/:id/assign-admin', authenticateToken, userPatientsController.assignAdmin);
router.delete('/:id', authenticateToken, userPatientsController.delete);

export default router;
