// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './departments.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const departmentsController = container.resolve('departmentsController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'departments',
    description: 'Departman işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'departman oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'departmanları listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'departmanı siler' },
    ]
  });
});

router.post('/',  slidingSession, departmentsController.create);
router.get('/list',domainMiddleware, departmentsController.list);
router.delete('/delete/:id', authenticateToken, departmentsController.delete);

export default router;
