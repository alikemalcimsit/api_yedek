// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './leadgen.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const leadgenController = container.resolve('leadgenController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'leadgen',
    description: 'leadgen işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'leadgen oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'leadgen listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'leadgen siler' },
      { method: 'POST', path: '/list', auth: true, description: 'leadgen id yegöre listeler listeler' },
      { method: 'POST', path: '/listbyuser', auth: true, description: 'leadgen getByUserPatientId ye göre listeler ' },

    ]
  });
});

router.post('/',  slidingSession, leadgenController.create);
router.get('/list',domainMiddleware, leadgenController.list);
router.delete('/delete/:id', authenticateToken, leadgenController.delete);
router.post('/list', leadgenController.getByLeadId);
router.post('/listbyuser', leadgenController.getByUserPatientId);


export default router;
