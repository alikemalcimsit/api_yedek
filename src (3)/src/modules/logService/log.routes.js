import { Router } from 'express';
import container from './log.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';

const router = Router();
const crmLogController = container.resolve('crmLogController');

// Merkezi log DB olduğu için domainMiddleware gerekmez
router.get('/info', (req, res) => {
  res.json({
    endpoint: 'log',
    routes: [
      { method: 'GET', path: '/', auth: true, description: 'Log kayıtlarını listeler' },
      { method: 'GET', path: '/domains', auth: true, description: 'Domain bazında özet: toplam, son log, 2xx/3xx/4xx/5xx' },
      { method: 'GET', path: '/stats', auth: true, description: 'Log istatistiklerini getirir' },
      { method: 'GET', path: '/timeseries', auth: true, description: 'Zaman serisi log verilerini getirir' },
      { method: 'GET', path: '/export', auth: true, description: 'Log verilerini CSV olarak dışa aktarır' },
      { method: 'GET', path: '/:id', auth: true, description: 'Belirli bir log kaydını getirir' },
      { method: 'DELETE', path: '/:id', auth: true, description: 'Belirli bir log kaydını siler' },
      { method: 'DELETE', path: '/', auth: true, description: 'Birden fazla log kaydını siler' },

    ]
  });
});
router.get('/', authenticateToken, slidingSession, crmLogController.list);

// Tüm domain özetleri:
// GET /log/domains

// Domain içinde “medicine”:
// GET /log/domains?domain=medicine

// Tam host eşitliği:
// GET /log/domains?host=crmtest.crmpanel.tr

// Tarih aralığı:
// GET /log/domains?from=2025-08-06&to=2025-08-13

// HTTP status tek değer:
// GET /log/domains?statusCode=500

// HTTP status aralığı:
// GET /log/domains?minStatus=400&maxStatus=499

// Yalnızca method (action başı):
// GET /log/domains?method=POST

// Path içerir:
// GET /log/domains?pathContains=/auth/login

// Belirli kullanıcı:
// GET /log/domains?userSystemId=123

// Sayfalama + sıralama (özet):
// GET /log/domains?page=2&limit=50&orderBy=total&order=desc

// Özet + log kayıtlarını da getir (opsiyonel):
// GET /log/domains?domain=medicine&from=2025-08-06&to=2025-08-13&orderBy=total&order=desc&includeLogs=true&logsPage=1&logsLimit=50&logsSortBy=createdAt&logsSortDir=desc

// Sadece tek hostun logları (en net):
// GET /log/domains?host=crmtest.crmpanel.tr&from=2025-08-06&to=2025-08-13&includeLogs=true&logsLimit=100

router.get('/domains', authenticateToken, slidingSession, crmLogController.domains);
router.get('/stats', authenticateToken, slidingSession, crmLogController.stats);
router.get('/timeseries', authenticateToken, slidingSession, crmLogController.timeseries);
router.get('/export', authenticateToken, slidingSession, crmLogController.exportCsv);

router.get('/:id', authenticateToken, slidingSession, crmLogController.detail);
// router.delete('/:id', authenticateToken, crmLogController.delete);
// router.delete('/', authenticateToken, crmLogController.bulkDelete);

// day || month || year değeri verilir ve şuanki tarihten itibaren o kadar süre önceki logları siler
router.delete('/purge', authenticateToken, slidingSession, crmLogController.purgeOlderRelative);

export default router;
