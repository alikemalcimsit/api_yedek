import { BaseService } from "../base/base.service.js";
import  ApiError from "../../middleware/error/ApiError.js";

export class ClosingStatusesService extends BaseService {
  constructor({ closingStatusesRepository }) {
    super(closingStatusesRepository);
  }

  async delete(id) {
    if (!id) {
      throw new ApiError(400, 'validation.REQUIRED_ID');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw error; // ApiError'ları yukarı ilet
    }
  }
}