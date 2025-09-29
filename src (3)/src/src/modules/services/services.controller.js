import { asyncHandler } from '../../middleware/index.js';
import { getHospitalServices } from '../services/services.service.js';

/**
 * Hastane servislerini listeler
 * @route POST /hospital-services/list
 * @body { type: "all" | "operation" | "insurance" | "medicine" | ... }
 */
const listHospitalServices = asyncHandler(async (req, res, next) => {
    try {
        const { type } = req.body;

        const result = await getHospitalServices(type, req.query);

        res.status(200).json({
            success: true,
            message: 'hizmet sayfası verileri başarıyla getirildi',
            services: result.services,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('HospitalServicesController - listHospitalServices hatası:', error);
        next(error);
    }

});

export {
    listHospitalServices
};