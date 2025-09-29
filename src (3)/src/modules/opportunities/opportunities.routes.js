import { Router } from 'express';
import container from './opportunities.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const opportunitiesController = container.resolve('opportunitiesController');


router.get('/info', (req, res) => {
  res.json({
    endpoint: 'opportunities',
    description: 'Teklif işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'Yeni teklif oluşturur' },
      { method: 'GET', path: '/:id', auth: true, description: 'Teklif detayı' },
      { method: 'GET', path: '/', auth: true, description: 'Teklifleri listeler' },
      { method: 'PUT', path: '/:id', auth: true, description: 'Teklif günceller' },
      { method: 'DELETE', path: '/:id', auth: true, description: 'Teklif siler' },
    ],
  });
});

router.get('/', domainMiddleware,opportunitiesController.list);
router.get('/:id', authenticateToken, opportunitiesController.detail);
router.post('/', authenticateToken, slidingSession, opportunitiesController.create);
router.put('/:id', authenticateToken, opportunitiesController.update);
router.delete('/:id', opportunitiesController.delete);

export default router;
