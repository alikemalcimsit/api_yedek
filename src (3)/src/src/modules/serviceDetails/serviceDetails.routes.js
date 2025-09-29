// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './serviceDetails.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const serviceDetailsController = container.resolve('serviceDetailsController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'servicedetails',
    description: 'serviceDetails işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'serviceDetails oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'serviceDetails listeler ' },
      { method: 'GET', path: '/list/:id', auth: true, description: 'serviceDetails id ye göre listeler ' },

      { method: 'DELETE', path: '/delete', auth: true, description: 'serviceDetails siler' },
    ]
  });
});

router.post('/', slidingSession, serviceDetailsController.create);
router.get('/list',domainMiddleware, serviceDetailsController.list);
router.get('/list/:id', serviceDetailsController.detail);

router.delete('/delete/:id', authenticateToken, serviceDetailsController.delete);

export default router;
