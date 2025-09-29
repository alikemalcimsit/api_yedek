import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class OfferController extends BaseController {
  constructor({ offerService }) {
    super(offerService);
  }

  getByPatientId = asyncHandler(async (req, res) => {
    const { userPatientId } = req.body;
    if (!userPatientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userPatientId gerekli' 
      });
    }
    
    const offers = await this.service.getByPatientId(Number(userPatientId));
    res.json({ success: true, data: offers });
  });

}