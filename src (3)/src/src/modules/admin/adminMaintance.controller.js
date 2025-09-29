import { asyncHandler } from '../../middleware/index.js';

export class AdminMaintenanceController {
  constructor({ adminMaintenanceService }) {
    this.service = adminMaintenanceService;
  }

  hashPasswordsForDomain = asyncHandler(async (req, res) => {
    const domain = req.headers['x-domain'];
    if (!domain) {
      return res.status(400).json({ success: false, message: 'x-domain header is required' });
    }

    const result = await this.service.hashPasswordsForDomain(domain);
    res.json({ success: true, data: result });
  });
}
