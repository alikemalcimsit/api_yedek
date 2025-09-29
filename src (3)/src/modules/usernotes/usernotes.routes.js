import { Router } from 'express';
import container from './usernotes.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const usernotesController = container.resolve('usernotesController');

router.get('/info', (req, res) => {
    res.json({
        endpoint: 'usernotes',
        description: 'Kullanıcı notları işlemleri',
        routes: [
            { method: 'GET', path: '/', auth: false, sliding: true, description: 'Yeni randevu oluşturur' },
            { method: 'POST', path: '/', auth: false, description: 'Randevuları listeler (body içinde userRole, userId vb.)' },
            { method: 'PUT', path: '/:id', auth: false, description: 'Randevu günceller (body içinde appointmentId ve güncellenecek alanlar)' },
            { method: 'DELETE', path: '/:id', auth: false, description: 'Randevu siler (body içinde appointmentId)' },
        ]
    })
})

router.get('/', domainMiddleware,authenticateToken, slidingSession, usernotesController.list);
router.post('/', authenticateToken, slidingSession, usernotesController.create);
router.put('/:id', authenticateToken, slidingSession, usernotesController.update);
router.delete('/:id', authenticateToken, slidingSession, usernotesController.delete);

export default router;