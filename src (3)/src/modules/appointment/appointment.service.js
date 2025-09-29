// src/services/appointment.service.js
import { BaseService } from '../base/base.service.js';

export class AppointmentService extends BaseService {
  constructor({ appointmentRepository }) {
    super(appointmentRepository);
        this.prisma = null;  }




 async getFilteredAppointments(filters) {
    return this.repository.findAll({
      where: filters
    });
  }

  // Ek servis metodları buraya eklenebilir
}
