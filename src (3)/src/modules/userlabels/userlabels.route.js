// src/modules/userlabels/userLabels.route.js
import { Router } from 'express';
import container from './userLabels.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const userLabelsController = container.resolve('userLabelsController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'user-labels',
    description: 'Kullanıcıya özel etiket işlemleri',
    routes: [
      { method: 'GET', path: '/', auth: false, description: 'userPatientId ile kullanıcıya ait etiketleri listeler' },
      { method: 'POST', path: '/', auth: true, description: 'Yeni kullanıcı etiketi oluşturur' },
      { method: 'PUT', path: '/:id', auth: true, description: 'Etiketi günceller' },
      { method: 'DELETE', path: '/:id', auth: true, description: 'Etiketi siler' },
    ]
  });
});

router.post('/list', domainMiddleware,userLabelsController.getLabelsByUserPatientId);
router.post('/', authenticateToken, slidingSession, userLabelsController.createWithValidation);
router.put('/:id', authenticateToken, slidingSession, userLabelsController.updateWithValidation);
router.delete('/:id', authenticateToken, slidingSession, userLabelsController.delete);

export default router;
