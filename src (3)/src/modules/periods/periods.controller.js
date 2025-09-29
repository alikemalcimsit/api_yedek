import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class PeriodsController extends BaseController {
  constructor({ periodsService }) {
    super(periodsService);
  }
  // Custom method for getting periods with specific logic
  getPeriods = asyncHandler(async (req, res) => {
    const result = await this.service.getPeriods(req.query);
    res.json({ success: true, data: result });
  });

  // Custom method for saving or changing status of periods
  saveOrChangeStatusPeriods = asyncHandler(async (req, res) => {
    const result = await this.service.saveOrChangeStatusPeriods(req.body);
    res.json({ success: true, data: result });
  });

  // Custom method for deleting periods
  deletePeriods = asyncHandler(async (req, res) => {
    const result = await this.service.deletePeriods(req.body);
    res.json({ success: true, message: 'Periods deleted successfully', data: result });
  });

  updateCurrentStatusByUserPatientId = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { userPatientId, currentStatus } = req.body || {};
      if (!userPatientId && userPatientId !== 0) {
        return res.status(400).json({ success: false, message: 'userPatientId gerekli' });
      }
      if (currentStatus === undefined || currentStatus === null) {
        return res.status(400).json({ success: false, message: 'currentStatus gerekli' });
      }

      const result = await this.service.updateCurrentStatusByUserPatientId({ userPatientId, currentStatus }, req);

      res.json({
        success: true,
        message: "currentStatus güncellendi",
        updatedCount: result.count,
        updatedData: result.updatedData || []
      });
    })
  );

  bulkUptadePeriodsWithStoredProcedure = this.withDynamicClient(asyncHandler(async (req, res) => {
    const { toMySqlDateTime } = await import('../../utils/date.js');
    
    const beforeDateRaw = req.body.beforeDate;
    const beforeDate = toMySqlDateTime(beforeDateRaw, 'end'); // gün sonu dahil
    if (!beforeDate) {
      return res.status(400).json({ success: false, message: 'Geçersiz beforeDate' });
    }

    const currentStatus = Number(req.body.currentStatus);
    const newStatus = Number(req.body.newStatus);

    try {
      const data = await this.service.bulkUptadePeriodsWithStoredProcedure({
        beforeDate, // 'YYYY-MM-DD HH:MM:SS'
        currentStatus,
        newStatus
      });
      res.json({ success: true });
    } catch (error) {
      console.error('bulkUptadePeriodsWithStoredProcedure controller hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Stored procedure ile period güncelleme işleminde hata oluştu',
        error: error.message
      });
    }
  }));
}