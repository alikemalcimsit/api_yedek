import { BaseRepository } from "../base/base.repository.js";
import { prisma } from "../../utils/index.js";
import ApiError from "../../middleware/error/ApiError.js";

export class UserClosingAssessmentRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = "userclosingassessment";
    this.prisma = prisma;
  }

  async create({ data, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    
    const model = dbClient[this._modelName];
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    if (data?.userSystemId==null || data?.userPatientId==null || data?.labelsId==null) {
      throw new ApiError(400, 'validation.REQUIRED_FIELDS', {
        required: ['userSystemId', 'userPatientId', 'labelsId']
      });
    }

    try {
      const result = await model.create({
        data: {
          userSystemId: Number(data.userSystemId),
          userPatientId: Number(data.userPatientId),
          labelsId: Number(data.labelsId)
        }
      });

      if (!result) {
        throw new ApiError(500, 'database.CREATE_FAILED');
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.code) {
        switch (error.code) {
          case 'P2002':
            throw new ApiError(409, 'database.UNIQUE_CONSTRAINT', {
              fields: error.meta?.target
            });
          case 'P2003':
            throw new ApiError(400, 'database.FOREIGN_KEY_VIOLATION', {
              field: error.meta?.field_name
            });
          default:
            throw new ApiError(500, 'database.UNKNOWN_ERROR', {
              code: error.code
            });
        }
      }

      throw new ApiError(500, 'database.CREATE_FAILED', {
        details: error.message
      });
    }
  }

  async findWithRelations({ where = {}, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    
    const model = dbClient[this._modelName];
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    try {
      return await model.findMany({
        where,
        include: {
          closingstatuses: true,
          userpatient: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'database.READ_FAILED', {
        details: error.message
      });
    }
  }

  async update({ id, data, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    const model = dbClient[this._modelName];
    
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    try {
      return await model.update({
        where: { id: Number(id) },
        data
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'database.RECORD_NOT_FOUND');
      }
      
      throw new ApiError(500, 'database.UPDATE_FAILED', {
        details: error.message
      });
    }
  }

  async delete({ id, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    const model = dbClient[this._modelName];
    
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    try {
      return await model.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'database.RECORD_NOT_FOUND');
      }
      
      throw new ApiError(500, 'database.DELETE_FAILED', {
        details: error.message
      });
    }
  }

  async findMany({ where = {}, skip, take, orderBy, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    
    const model = dbClient[this._modelName];
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    try {
      return await model.findMany({
        where,
        skip,
        take,
        orderBy
      });
    } catch (error) {
      throw new ApiError(500, 'database.READ_FAILED', {
        details: error.message
      });
    }
  }

  async count({ where = {}, prisma: txPrisma = null }) {
    const dbClient = txPrisma || this.prisma;
    
    const model = dbClient[this._modelName];
    if (!model) {
      throw new ApiError(500, 'database.MODEL_NOT_FOUND', { model: this._modelName });
    }

    try {
      return await model.count({
        where
      });
    } catch (error) {
      throw new ApiError(500, 'database.READ_FAILED', {
        details: error.message
      });
    }
  }
}