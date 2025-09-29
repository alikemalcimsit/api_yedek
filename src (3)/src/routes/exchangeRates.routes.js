import { Router } from 'express';
import { getExchangeRates } from '../services/exchange/exchangeRateService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await getExchangeRates();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
