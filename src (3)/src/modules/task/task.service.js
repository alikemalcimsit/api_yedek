import { BaseService } from '../base/base.service.js';

export class TaskService extends BaseService {
  constructor({ taskRepository }) {
    super(taskRepository);
  }

  async createWithValidation(data) {
    const {
      taskName,
      userPatientId,
      taskDetail,
      userSystemId,
      taskFinishDate,
      taskFinishTime,
    } = data;

    if (
      !taskName ||
      !userPatientId ||
      !taskDetail ||
      !userSystemId ||
      !taskFinishDate ||
      !taskFinishTime
    ) {
      throw new Error('Zorunlu alanlar eksik');
    }

    data.taskStartDate = new Date().toISOString().split('T')[0];
    data.taskResult = 0;

    return this.repository.create(data);
  }

  getTasksByUserPatientId(userPatientId) {
    return this.repository.findByUserPatientId(userPatientId);
  }

  getTasksByUserSystemId(userSystemId) {
    return this.repository.findByUserSystemId(userSystemId);
  }

  getActiveTasksByUserSystemId(userSystemId) {
    return this.repository.findActiveByUserSystemId(userSystemId);
  }

  getAllTasks() {
    return this.repository.findAllWithRelations();
  }

  getUpcomingTasksByAdmin(userSystemId) {
    return this.repository.findUpcomingByAdmin(userSystemId);
  }
}
