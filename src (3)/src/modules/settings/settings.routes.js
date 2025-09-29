import { Router } from 'express';
import container from './settings.container.js';
import { authenticateToken, slidingSession} from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const settingsController = container.resolve('settingsController');

router.get('/info', (req, res) => {
    res.json({
        endpoint: 'settings',
        description: 'Yönetici ayarları işlemleri',
        routes: [
            { method: 'GET', path: '/', auth: false, sliding: true, description: 'Tüm ayarları veya belirli bir ayarı getirir (query: name)' },
            { method: 'POST', path: '/', auth: false, sliding: true, description: 'Bir ayarın değerini günceller (body: { name, value })' },
        ]
    })
})


router.get('/', domainMiddleware, settingsController.list);
router.post('/',domainMiddleware, settingsController.create);

export default router;