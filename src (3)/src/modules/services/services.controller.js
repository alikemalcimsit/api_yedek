import { asyncHandler } from '../../middleware/index.js';

export class ServicesController {
    constructor({ servicesService }) {
        this.servicesService = servicesService;
    }

    list = asyncHandler(async (req, res) => {
        const { type } = req.body;
        const result = await this.servicesService.getHospitalServices(type, req.query);
        res.status(200).json({
            success: true,
            message: 'hizmet sayfası verileri başarıyla getirildi',
            services: result.services,
            pagination: result.pagination
        });
    });
}