// src/routes/appointment.routes.js
import { Router } from 'express';
import container from './refreshToken.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const refreshTokenController = container.resolve('refreshTokenController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'refreshtoken',
    description: 'refreshtoken işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'refreshtoken oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'refreshtoken listeler ' },
      { method: 'DELETE', path: '/delete', auth: true, description: 'refreshtoken siler' },
      { method: 'GET', path: '/list/:userId', auth: true, description: 'kullanıcıya göre refreshtoken listeler' },
    ]
  });
});

router.post('/',  slidingSession, refreshTokenController.create);
router.get('/list',domainMiddleware, refreshTokenController.list);
router.delete('/delete/:id', authenticateToken, refreshTokenController.delete);
router.get('/list/:userId', authenticateToken, refreshTokenController.getByUserId);


export default router;
