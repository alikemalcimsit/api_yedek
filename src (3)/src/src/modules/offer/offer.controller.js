import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class OfferController extends BaseController {
  constructor({ offerService }) {
    super(offerService);
  }

  getOffersByPatientId = asyncHandler(async (req, res) => {

    const userPatientId = Number(req.query.userPatientId);
    const offers = await this.service.getByPatientId(userPatientId);
    res.json({ success: true, data: offers });
  });
}