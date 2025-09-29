import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class PeriodsController extends BaseController {
  constructor({ periodsService }) {
    super(periodsService);
  }
  // Custom method for getting periods with specific logic
  getPeriods = asyncHandler(async (req, res) => {
    const result = await this.service.getPeriods(req.query);
    res.json({ success: true, data: result });
  });

  // Custom method for saving or changing status of periods
  saveOrChangeStatusPeriods = asyncHandler(async (req, res) => {
    const result = await this.service.saveOrChangeStatusPeriods(req.body);
    res.json({ success: true, data: result });
  });

  // Custom method for deleting periods
  deletePeriods = asyncHandler(async (req, res) => {
    const result = await this.service.deletePeriods(req.body);
    res.json({ success: true, message: 'Periods deleted successfully', data: result });
  });
}