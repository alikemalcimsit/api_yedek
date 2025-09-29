import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class LeadgenController extends BaseController {
  constructor({ leadgenService }) {
    super(leadgenService);
  }



  getByLeadId = this.withDynamicClient(asyncHandler(async (req, res) => {
    const leadgenId = req.body.leadgenId;
    if (!leadgenId) {
      return res.status(400).json({ success: false, message: 'id gerekli' });
    }

    const data = await this.service.getByLeadId(leadgenId);
    res.json({ success: true, data: data });
  }));



  getByUserPatientId = asyncHandler(async (req, res) => {
    const userPatientId = req.body.userPatientId;
    if (!userPatientId) {
      return res.status(400).json({ success: false, message: 'user patient id  gerekli' });
    }

    const data = await this.service.getByUserPatientId(userPatientId);
    res.json({ success: true, data: data });
  });


  // Ek controller işlemleri burada override edilebilir
}
