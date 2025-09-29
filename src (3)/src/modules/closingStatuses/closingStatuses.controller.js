import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';
import  ApiError  from "../../middleware/error/ApiError.js";

export class ClosingStatusesController extends BaseController {
  constructor({ closingStatusesService }) {
    super(closingStatusesService);
  }

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'validation.REQUIRED_ID');
    }

    await this.service.delete(id);

    return res.json({
      success: true,
      message: req.t('closingStatuses.DELETED_SUCCESS') || 'Deleted successfully'
    });
  });
}


