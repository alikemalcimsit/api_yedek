import { BaseService } from "../base/base.service.js";
import { prisma } from "../../utils/index.js";
import ApiError from "../../middleware/error/ApiError.js";

export class UserClosingAssessmentService extends BaseService {
  constructor({ userClosingAssessmentRepository, userNotesRepository }) {
    super(userClosingAssessmentRepository);
    this.userNotesRepository = userNotesRepository;
  }

  async create({ data, prisma: txPrisma = null }) {
    
    if (data?.userSystemId==null || data?.userPatientId==null || data?.labelsId==null) {
     
     
      console.log('⚠️ Eksik zorunlu alanlar:', {
        userSystemId: data?.userSystemId,
        userPatientId: data?.userPatientId,
        labelsId: data?.labelsId,
      });
      throw new ApiError(400, 'validation.REQUIRED_FIELDS', {
        required: ['userSystemId', 'userPatientId', 'labelsId']
      });
    }

    try {
      const assessmentData = {
        userSystemId: Number(data.userSystemId),
        userPatientId: Number(data.userPatientId),
        labelsId: Number(data.labelsId),
      };

      const hasDetails = data.details != null && data.details !== "";

      const dbClient = txPrisma || prisma;

      return await dbClient.$transaction(async (tx) => {
        const createdAssessment = await this.repository.create({
          data: assessmentData,
          prisma: tx,
        });

        if (hasDetails) {
          // Directly use the tx client for usernotes since BaseRepository doesn't support prisma parameter
          const createdNote = await tx.usernotes.create({
            data: {
              userSystemId: Number(data.userSystemId),
              userPatientId: Number(data.userPatientId),
              notes: typeof data.details === "string" ? data.details : JSON.stringify(data.details),
            },
          });

          return {
            assessment: createdAssessment,
            note: createdNote,
          };
        }

        return {
          assessment: createdAssessment,
        };
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'service.TRANSACTION_FAILED', {
        details: error.message
      });
    }
  }

  async findWithRelations({ filter = {}, prisma: txPrisma = null }) {
    try {
      const dbClient = txPrisma || prisma;
      return await this.repository.findWithRelations({
        where: filter,
        prisma: dbClient,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'service.READ_FAILED', {
        details: error.message
      });
    }
  }

  // BaseService metodlarını override etmek için
  async findMany({ filter = {}, page = 1, limit = 10, prisma: txPrisma = null }) {
    try {
      const dbClient = txPrisma || prisma;
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.repository.findMany({
          where: filter,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          prisma: dbClient,
        }),
        this.repository.count({
          where: filter,
          prisma: dbClient,
        })
      ]);

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'service.READ_FAILED', {
        details: error.message
      });
    }
  }

  async update({ id, data, prisma: txPrisma = null }) {
    try {
      const dbClient = txPrisma || prisma;
      return await this.repository.update({
        id,
        data,
        prisma: dbClient,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'service.UPDATE_FAILED', {
        details: error.message
      });
    }
  }

  async delete({ id, prisma: txPrisma = null }) {
    try {
      const dbClient = txPrisma || prisma;
      return await this.repository.delete({
        id,
        prisma: dbClient,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'service.DELETE_FAILED', {
        details: error.message
      });
    }
  }
}