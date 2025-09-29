// src/modules/labels/labels.route.js

import { Router } from 'express';
import container from './labels.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const labelsController = container.resolve('labelsController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'labels',
    description: 'Kişi etiketleri (label) işlemleri',
    routes: [
      { method: 'GET', path: '/', auth: false, sliding: true, description: 'Tüm etiketleri listeler' },
      { method: 'POST', path: '/', auth: false, sliding: true, description: 'Yeni etiket ekler' },
      { method: 'PUT', path: '/:id', auth: false, sliding: true, description: 'Etiketi günceller' },
      { method: 'DELETE', path: '/:id', auth: false, sliding: true, description: 'Etiketi siler' },
      { method: 'POST', path: '/bulk', auth: false, sliding: true, description: 'Toplu etiket ekleme' }
    ]
  });
});

// ✅ Routes
router.get('/', domainMiddleware, slidingSession, labelsController.list);
router.post('/', authenticateToken, slidingSession, labelsController.create);
router.put('/:id', authenticateToken, slidingSession, labelsController.update);
router.delete('/:id', authenticateToken, slidingSession, labelsController.delete);
router.post('/bulk', authenticateToken, slidingSession, labelsController.bulkInsert);

export default router;
