// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './chatList.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const chatListController = container.resolve('chatListController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'chatList',
    description: 'chatList işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'chatList oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'chatList listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'chatList siler' },
    ]
  });
});

router.post('/',  slidingSession, chatListController.create);
router.get('/list', authenticateToken, domainMiddleware, chatListController.list);
router.delete('/delete/:id', authenticateToken, chatListController.delete);

export default router;
