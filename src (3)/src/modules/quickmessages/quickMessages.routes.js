// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './quickMessages.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const quickMessagesController = container.resolve('quickMessagesController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'qucikMessages',
    description: 'qucikMessages işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'qucikMessages oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'qucikMessages listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'qucikMessages siler' },
    ]
  });
});

router.post('/',  slidingSession, quickMessagesController.create);
router.get('/list', domainMiddleware,quickMessagesController.list);
router.delete('/delete/:id', authenticateToken, quickMessagesController.delete);


export default router;
