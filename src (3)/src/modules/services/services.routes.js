import { Router } from 'express';
import container from './services.container.js';
import { authenticateToken } from '../../middleware/index.js';

const router = Router();
const servicesController = container.resolve('servicesController');

// API dokümantasyonu
router.get('/info', (req, res) => {
    res.json({
        endpoint: 'services',
        routes: [
            { method: 'POST', path: '/list', auth: true, description: 'Hastane servislerini listeler' }
        ]
    });
});

// POST /services/list
router.post('/list', authenticateToken, servicesController.list);

export default router;