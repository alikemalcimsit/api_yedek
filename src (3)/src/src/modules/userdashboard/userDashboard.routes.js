import { Router } from 'express';
import container from './userDashboard.container.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const userDashboardController = container.resolve('userDashboardController');

router.get('/', domainMiddleware, userDashboardController.getUsers.bind(userDashboardController));
router.get('/users-sp', domainMiddleware, userDashboardController.getUsersWithStoredProcedure.bind(userDashboardController));

export default router;
