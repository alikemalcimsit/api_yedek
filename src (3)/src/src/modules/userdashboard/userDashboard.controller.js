import { asyncHandler } from "../../middleware/index.js";
import { BaseController } from "../base/base.controller.js";

export class UserDashboardController extends BaseController {
  constructor({ userDashboardService }) {
    super(userDashboardService);
  }

  getUsers = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { aranan, surec, tarih, page = 1, limit = 500, adminId } = req.query;

      if (!adminId) {
        return res.status(400).json({ success: false, message: 'adminId is required' });
      }

      const data = await this.service.getUsersService({
        aranan,
        surec,
        tarih,
        page: parseInt(page),
        limit: parseInt(limit),
        currentAdminId: parseInt(adminId),
      });

      res.json(data);
    })
  );

  /**
   * spUserDashboard stored procedure'ünü kullanarak kullanıcıları getirir
   * GET /api/userdashboard/users-sp?userId=50&userRole=1&scenario=5&page=1&limit=10
   */
  getUsersWithStoredProcedure = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { userId, userRole, scenario, page = 1, limit = 10 } = req.query;

      // Gerekli parametreleri kontrol et
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId parametresi gereklidir' 
        });
      }

      if (!userRole) {
        return res.status(400).json({ 
          success: false, 
          message: 'userRole parametresi gereklidir' 
        });
      }

      if (!scenario) {
        return res.status(400).json({ 
          success: false, 
          message: 'scenario parametresi gereklidir' 
        });
      }

      try {
        const data = await this.service.getUsersWithStoredProcedure({
          userId: parseInt(userId),
          userRole: parseInt(userRole),
          scenario: parseInt(scenario),
          page: parseInt(page),
          limit: parseInt(limit),
        });

        res.json(data);
      } catch (error) {
        console.error('getUsersWithStoredProcedure controller hatası:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Stored procedure ile kullanıcı getirme işleminde hata oluştu',
          error: error.message 
        });
      }
    })
  );
}
