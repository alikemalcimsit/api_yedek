import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';

export class ChannelController extends BaseController {
  constructor({ channelService }) {
    super(channelService);
  }

  getByDomain = asyncHandler(async (req, res) => {
    const host = req.headers['x-domain'];
    if (!host) {
      return res.status(400).json({ success: false, message: 'Domain header eksik' });
    }

    const channel = await this.service.getChannelByDomain(host);
    res.json({ success: true, data: channel });
  });

  getAllDomains = asyncHandler(async (req, res) => {
    const host = await this.service.getAllChannelDomains();
    res.json({ success: true, data: host });
  });
}
