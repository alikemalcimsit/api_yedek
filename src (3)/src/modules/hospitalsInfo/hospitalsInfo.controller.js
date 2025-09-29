import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class HospitalsInfoController extends BaseController {
  constructor({ hospitalsInfoService }) {
    super(hospitalsInfoService);
  }


  
   getByDomain = asyncHandler(async (req, res) => {
      const domain = req.body.domain;
      if (!domain) {
        return res.status(400).json({ success: false, message: 'domain gerekli' });
      }
  
      const data = await this.service.getByDomain(domain);
      res.json({ success: true, data: data });
    });


  // Ek controller işlemleri burada override edilebilir
}
