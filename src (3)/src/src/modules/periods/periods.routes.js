import { Router } from 'express';
import container from './periods.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const periodsController = container.resolve('periodsController');

// API dokümantasyonu
router.get('/info', (req, res) => {
    res.json({
        endpoint: 'periods',
        routes: [
            { method: 'GET', path: '/', auth: false, sliding: true, description: 'userPatientId veya stage ile veri getirir' },
            { method: 'PUT', path: '/', auth: false, sliding: true, description: 'Kayıt ekle/güncelle veya toplu status taşıma' },
            { method: 'DELETE', path: '/', auth: false, sliding: true, description: 'Period siler (body: { id })' }
        ]
    });
});

// GET /periods
router.get('/', domainMiddleware, slidingSession, periodsController.getPeriods);

// PUT /periods
router.put('/', authenticateToken, slidingSession, periodsController.saveOrChangeStatusPeriods);

// DELETE /periods
router.delete('/', authenticateToken, slidingSession, periodsController.deletePeriods);

export default router;
