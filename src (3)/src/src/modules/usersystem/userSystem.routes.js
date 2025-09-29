import { Router } from 'express';
import container from './userSystem.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const userSystemController = container.resolve('userSystemController');

router.get('/info', (req, res) => {
    res.json({
        endpoint: 'userSystem',
        description: 'Sistem kullanıcı işlemleri',
        routes: [
            { method: 'GET', path: '/', auth: false, sliding: true, description: 'Sistem kullanıcılarını listeler' },
            { method: 'POST', path: '/', auth: false, description: 'Sistem kullanıcısı oluşturur' },
            { method: 'PUT', path: '/:id', auth: false, description: 'Sistem kullanıcısını günceller' },
            { method: 'DELETE', path: '/:id', auth: false, description: 'Sistem kullanıcısını siler' },
            { method: 'GET', path: '/profile', auth: false, sliding: true, description: 'Sistem kullanıcı profil bilgilerini getirir' },
        ]
    })
})

router.get('/', domainMiddleware, authenticateToken, slidingSession, userSystemController.list);
router.post('/',domainMiddleware, authenticateToken, slidingSession, userSystemController.create);
router.put('/:id', domainMiddleware, authenticateToken, slidingSession, userSystemController.updateWithValidation );
router.delete('/:id', domainMiddleware, authenticateToken, slidingSession, userSystemController.delete);
router.get('/profile', domainMiddleware,authenticateToken, slidingSession, userSystemController.profile);

export default router;