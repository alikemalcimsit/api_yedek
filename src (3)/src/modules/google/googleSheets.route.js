import { Router } from 'express';
import container from './googleSheets.container.js';

const router = Router();
const controller = container.resolve('googleSheetsController');

router.post('/webhook/:hospitalCode', controller.handleWebhook);

export default router;
