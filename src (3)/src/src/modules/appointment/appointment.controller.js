// src/controllers/appointment.controller.js
import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class AppointmentController extends BaseController {
  constructor({ appointmentService }) {
    super(appointmentService);
  }


    list = this.withDynamicClient(asyncHandler(async (req, res) => {
      
    const filters = req.body; // Örnek: { userPatientId: 1296 }

    const items = await this.service.getFilteredAppointments(filters);
    res.json({ success: true, data: items });
  }));

  // Ek controller işlemleri burada override edilebilir
}
