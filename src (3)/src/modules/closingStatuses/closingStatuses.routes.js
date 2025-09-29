// src/modules/userlabels/userLabels.route.js
import { Router } from 'express';
import container from './closingStatuses.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';

const router = Router();
const closingStatusesController = container.resolve('closingStatusesController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: ' closing-statuses',
    description: 'Kullanıcıya özel etiket işlemleri',
    routes: [
      { method: 'GET', path: '/', auth: true, description: 'Hasta etiketi getirir' },

      { method: 'POST', path: '/', auth: true, description: 'Yeni hastaya etiketi oluşturur' },
      { method: 'PUT', path: '/:id', auth: true, description: 'Etiketi günceller' },
      { method: 'DELETE', path: '/:id', auth: true, description: 'Etiketi siler' },
    ]
  });
});

router.get('/',  authenticateToken, slidingSession, closingStatusesController.list);

router.post('/',  authenticateToken, slidingSession, closingStatusesController.create);
router.put('/:id',  authenticateToken, slidingSession, closingStatusesController.update);
router.delete('/:id',  authenticateToken, slidingSession, closingStatusesController.delete);

export default router;
