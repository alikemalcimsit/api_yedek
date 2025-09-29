import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';

export class HospitalController extends BaseController {
  constructor({ hospitalService }) {
    super(hospitalService);
  }

  getByDomain = asyncHandler(async (req, res) => {
    const domain = req.headers['x-domain'];
    const hospital = await this.service.getHospitalByDomain(domain);
    res.json({ success: true, data: hospital });
  });


  getByDomainWithInfos = asyncHandler(async (req, res) => {
    const domain = req.headers['x-domain']; // Header'dan domain bilgisi alınıyor
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain header is required' });
    }

    const hospital = await this.service.getHospitalByDomainWithInfos(domain);
    res.json({ success: true, data: hospital });
  });


  listWithCount = asyncHandler(async (req, res) => {
    const result = await this.service.getAllHospitalsWithCount();
    res.json({ success: true, ...result });
  });
}
