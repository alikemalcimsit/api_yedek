import { Router } from 'express';
import container from './task.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const taskController = container.resolve('taskController');

router.get('/', (req, res) => {
  res.json({
    endpoint: 'task',
    description: 'Görev işlemleri',
    routes: [
      { method: 'POST', path: '/create', auth: true, sliding: true, description: 'Yeni görev oluşturur' },
      { method: 'GET', path: '/list', auth: false, description: 'userPatientId ile görev listeler' },
      { method: 'POST', path: '/by-user', auth: false, description: 'userSystemId ile görev listeler' },
      { method: 'GET', path: '/all', auth: false, description: 'Tüm görevleri listeler' },
      { method: 'POST', path: '/upcoming-by-admin', auth: false, description: 'Admin için yaklaşan görevleri listeler' }
    ]
  });
});

router.post('/create', authenticateToken, slidingSession, taskController.createWithValidation);
router.get('/list', domainMiddleware,taskController.getTasksByUserPatientId);
router.post('/by-user', taskController.getTasksByUserSystemId);
router.get('/all', taskController.getAllTasks);
router.post('/upcoming-by-admin', taskController.getUpcomingTasksByAdmin);

export default router;
