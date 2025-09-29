import { asyncHandler } from "../../middleware/index.js";
import { BaseController } from "../base/base.controller.js";

export class UserClosingAssessmentController extends BaseController {
  constructor({ userClosingAssessmentService }) {
    super(userClosingAssessmentService);
    this.service = userClosingAssessmentService;
  }

  create = asyncHandler(async (req, res) => {
    const result = await this.service.create({
      data: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Kayıtlar başarıyla oluşturuldu",
      data: result,
    });
  });

  list = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userPatientId } = req.query;
    
    const filter = {};
    if (userPatientId) {
      filter.userPatientId = Number(userPatientId);
    }

    const result = await this.service.findMany({
      filter,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      message: "Kayıtlar başarıyla getirildi",
      data: result,
    });
  });

  findWithRelations = asyncHandler(async (req, res) => {
    const { userPatientId } = req.query;
    
    const filter = {};
    if (userPatientId) {
      filter.userPatientId = Number(userPatientId);
    }

    const result = await this.service.findWithRelations({
      filter,
    });

    return res.status(200).json({
      success: true,
      message: "Kayıtlar ilişkili verilerle birlikte getirildi",
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await this.service.update({
      id,
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Kayıt başarıyla güncellendi",
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await this.service.delete({ id });

    return res.status(200).json({
      success: true,
      message: "Kayıt başarıyla silindi",
    });
  });
}