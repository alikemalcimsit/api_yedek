// src/modules/userlabels/userLabels.controller.js
import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class UserLabelsController extends BaseController {
  constructor({ userLabelsService }) {
    super(userLabelsService);
  }

  getLabelsByUserPatientId = this.withDynamicClient(asyncHandler(async (req, res) => {
    const userPatientId = req.body.userPatientId || req.query.userPatientId;
    const labelsParam = req.body.labels || req.query.labels;

    if (!userPatientId) throw new Error('Geçersiz userPatientId');

    const result = await this.service.getLabelsByUserPatientId(userPatientId, labelsParam);
    res.json({ success: true, labels: result });
  }));

  createWithValidation = asyncHandler(async (req, res) => {
    const result = await this.service.createWithValidation(req.body);
    res.status(201).json({ success: true, data: result });
  });

 updateWithValidation = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const result = await this.service.updateUserLabels(id, req.body);

  res.json({
    success: true,
    message: 'Etiket güncellendi.',
    data: result,
  });
});

}
