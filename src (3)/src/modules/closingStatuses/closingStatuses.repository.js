// src/modules/userlabels/patientLabels.repository.js
import { BaseRepository } from "../base/base.repository.js";
import ApiError from "../../middleware/error/ApiError.js";
import { prisma } from "../../utils/index.js"; // Add prisma import

export class ClosingStatusesRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = "closingstatuses";
    this.prisma = prisma; // Initialize prisma client
  }

  async checkForRelatedRecords(id) {
    // Check if prisma client exists
    if (!this.prisma) {
      throw new ApiError(500, 'database.CLIENT_NOT_AVAILABLE');
    }

    try {
      const relatedRecords = await this.prisma.userclosingassessment.findFirst({
        where: {
          labelsId: Number(id)
        }
      });

      return !!relatedRecords;
    } catch (error) {
      throw new ApiError(500, 'database.QUERY_FAILED', {
        details: error.message
      });
    }
  }

  async delete(id) {
    // Check if prisma client exists
    if (!this.prisma) {
      throw new ApiError(500, 'database.CLIENT_NOT_AVAILABLE');
    }

    const hasRelatedRecords = await this.checkForRelatedRecords(id);
    
    if (hasRelatedRecords) {
      throw new ApiError(409, 'closingStatuses.HAS_RELATED_RECORDS', {
        id,
        entity: 'userclosingassessment'
      });
    }

    try {
      const result = await this.prisma[this._modelName].delete({
        where: { id: Number(id) }
      });

      if (!result) {
        throw new ApiError(404, 'closingStatuses.NOT_FOUND');
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error.code === 'P2025') {
        throw new ApiError(404, 'closingStatuses.NOT_FOUND');
      }

      throw new ApiError(500, 'database.DELETE_FAILED', {
        details: error.message
      });
    }
  }
}