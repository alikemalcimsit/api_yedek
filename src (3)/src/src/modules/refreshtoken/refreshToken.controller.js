import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class RefreshTokenController extends BaseController {
  constructor({ refreshTokenService }) {
    super(refreshTokenService);
  }


 getByUserId = asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId gerekli' });
    }

    const tokens = await this.service.getByUserId(userId);
    res.json({ success: true, data: tokens });
  });
  // Ek controller işlemleri burada override edilebilir
}
