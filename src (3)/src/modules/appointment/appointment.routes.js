// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './appointment.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const appointmentController = container.resolve('appointmentController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'appointment',
    description: 'Randevu işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'Yeni randevu oluşturur' },
      { method: 'POST', path: '/list', auth: true, description: 'Randevuları listeler (body içinde userRole, userId vb.)' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'Randevu siler (body içinde ""appointmentId"")' },
    ]
  });
});

router.post('/', domainMiddleware, slidingSession, appointmentController.create);
router.get('/list',domainMiddleware, appointmentController.list);
router.delete('/delete', authenticateToken, appointmentController.delete);

export default router;
