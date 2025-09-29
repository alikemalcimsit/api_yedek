import { Router } from 'express';
import container from './hospital.container.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';
import { refreshHospitalCache } from '../../utils/hospitalCache.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';

const router = Router();
const controller = container.resolve('hospitalController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'hospital',
    routes: [
      { method: 'POST', path: '/domain', description: 'Domain’e göre hastane getirir' },
      { method: 'GET', path: '/', description: 'Tüm hastaneleri getirir (toplamla birlikte)' },
      { method: 'PUT', path: '/:id', description: 'Hastane günceller' },
      { method: 'DELETE', path: '/:id', description: 'Hastane siler' },
      { method: 'GET', path: '/title', description: 'Hastane bilgilerini getirir' },
      { method: 'GET', path: '/domains', description: 'Domainleri getirir' },



    ]
  });
});

router.get('/count', authenticateToken, slidingSession, controller.listWithCount);
router.get('/title', domainMiddleware, controller.getByDomainWithInfos);
router.get('/', authenticateToken, slidingSession, controller.list);
router.post('/', authenticateToken, slidingSession, controller.create);

router.post('/domain', authenticateToken, slidingSession, domainMiddleware, controller.getByDomain);
router.put('/:id', authenticateToken, slidingSession, controller.update, refreshHospitalCache);
router.delete('/:id', authenticateToken, slidingSession, refreshHospitalCache, controller.delete);

export default router;
