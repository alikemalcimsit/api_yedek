// src/controllers/labels.controller.js

import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';

export class LabelsController extends BaseController {
  constructor({ labelsService }) {
    super(labelsService);
  }

  // Toplu etiket ekleme işlemi
  bulkInsert = asyncHandler(async (req, res) => {
    const { labels } = req.body;
    if (!Array.isArray(labels) || labels.length === 0) {
      throw new Error('Etiket listesi boş veya geçersiz');
    }

    const inserted = await this.service.bulkInsert(labels);
    res.status(201).json({ success: true, data: inserted });
  });
}
