import { Router } from 'express';
import { listHospitalServices } from './services.controller.js';
import { authenticateToken } from '../../middleware/index.js';

const router = Router();

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
router.post('/list', authenticateToken, listHospitalServices);

export default router; 