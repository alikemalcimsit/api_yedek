import { Router } from 'express';
import container from './offer.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const offerController = container.resolve('offerController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'offer',
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


router.get('/', domainMiddleware, offerController.list);
router.get('/detail/:id', offerController.detail);
router.post('/', slidingSession, offerController.create);
router.put('/:id', offerController.update);
router.delete('/:id', offerController.delete);
router.post('/by-patient', authenticateToken, slidingSession, offerController.getByPatientId);

export default router;
