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
   * GET /api/userdashboard/users-sp?page=1&limit=20
   */
  getUsersWithStoredProcedure = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      try {
        console.log("reqqqqqqqq ------------------" , req.query)
        console.log("req.body ------------------" , req.body)
        
        // user[id] ve user[role] değerlerini query'den al (body undefined olduğu için)
        const userId = parseInt(req.query['user[id]'], 10);
        const userRole = parseInt(req.query['user[role]'], 10);
        
        if (userId===undefined || userId ===null || userRole === undefined || userRole === null) {
          return res.status(400).json({
            success: false,
            message: 'user[id] ve user[role] parametreleri gereklidir'
          });
        }

        const p = parseInt(req.query.page, 10) || 1;
        const l = Math.min(parseInt(req.query.limit, 10) || 20, 500);

        const data = await this.service.getUsersWithStoredProcedure({
          userId,
          userRole,
          page: p,
          limit: l,
        });

        res.json(data);
        console.log("dataaa ------------------" , data)
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










