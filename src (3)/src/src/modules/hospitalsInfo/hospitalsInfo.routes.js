// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './hospitalsInfo.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const hospitalsInfoController = container.resolve('hospitalsInfoController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'hospitalsInfo',
    description: 'hospitalsInfo işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: false, sliding: true, description: 'hospitalsInfo oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'hospitalsInfo listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'hospitalsInfo siler' },
      { method: 'POST', path: '/list', auth: true, description: 'domain hospitalsInfo listeler' },
    ]
  });
});

router.post('/',  slidingSession, hospitalsInfoController.create);
router.get('/list', hospitalsInfoController.list);
router.delete('/delete/:id', authenticateToken, hospitalsInfoController.delete);
router.post('/list', domainMiddleware,hospitalsInfoController.getByDomain);


export default router;
