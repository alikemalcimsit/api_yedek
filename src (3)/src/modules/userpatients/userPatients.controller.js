// src/modules/userpatients/userPatients.controller.js
import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class UserPatientsController extends BaseController {
  constructor({ userPatientsService }) {
    super(userPatientsService);
  }

  assignAdmin = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await this.service.assignAdmin(id, req.body);
    res.json({ success: true, data: updated });
  });
}
