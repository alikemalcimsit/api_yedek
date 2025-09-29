import { Router } from 'express';
import container from './adminUser.container.js';
import { authenticateToken, slidingSession } from '../../middleware/auth/authMiddleware.js';
import { validateLoginInput } from '../../middleware/index.js';

const router = Router();
const adminUserController = container.resolve('adminUserController');

router.get('/', (req, res) => {
  res.json({
    endpoint: 'admin-user',
    description: 'Admin User routes',
    routes: [
        { method: 'GET', path: '/list', auth: true, description: 'Tüm admin kullanıcıları listeler' },
        { method: 'POST', path: '/create', auth: true, description: 'Yeni admin kullanıcı oluşturur' },
        { method: 'PUT', path: '/update/:id', auth: true, description: 'Admin kullanıcıyı günceller' },
        { method: 'DELETE', path: '/delete/:id', auth: true, description: 'Admin kullanıcıyı siler' },
    ]
  });
});

router.get('/list',authenticateToken,slidingSession, adminUserController.list);

router.post('/create',authenticateToken,slidingSession, adminUserController.create);

router.put('/update/:id', authenticateToken,validateLoginInput, adminUserController.update);


router.delete('/delete/:id', authenticateToken,slidingSession, adminUserController.delete);


export default router;
