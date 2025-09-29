import { Router } from 'express';
import container from './channel.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const controller = container.resolve('channelController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'channel',
    routes: [
      { method: 'POST', path: '/domain', description: 'Domain’e göre kanal getirir' },
      { method: 'GET', path: '/domains', description: 'Tüm domainleri getirir' },
    ]
  });
});

router.post('/domain', domainMiddleware,authenticateToken, slidingSession, controller.getByDomain);
router.get('/domains' ,authenticateToken, slidingSession, controller.getAllDomains);

export default router;
