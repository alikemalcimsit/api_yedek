import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class TaskController extends BaseController {
  constructor({ taskService }) {
    super(taskService);
  }

  createWithValidation = asyncHandler(async (req, res) => {
    const task = await this.service.createWithValidation(req.body);
    res.status(201).json({ success: true, data: task });
  });

  getTasksByUserPatientId = asyncHandler(async (req, res) => {
    const userPatientId = Number(req.query.userPatientId);
    if (!userPatientId) throw new Error('Geçersiz userPatientId');
    const tasks = await this.service.getTasksByUserPatientId(userPatientId);
    res.json({ success: true, data: tasks });
  });

  getTasksByUserSystemId = asyncHandler(async (req, res) => {
    const { userSystemId } = req.body;
    if (!userSystemId) throw new Error('Geçersiz userSystemId');
    const tasks = await this.service.getTasksByUserSystemId(Number(userSystemId));
    res.json({ success: true, data: tasks });
  });

  getActiveTasksByUserSystemId = asyncHandler(async (req, res) => {
    const { userSystemId } = req.body;
    if (!userSystemId) throw new Error('Geçersiz userSystemId');
    const tasks = await this.service.getActiveTasksByUserSystemId(Number(userSystemId));
    res.json({ success: true, data: tasks });
  });

  getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await this.service.getAllTasks();
    res.json({ success: true, data: tasks });
  });

  getUpcomingTasksByAdmin = asyncHandler(async (req, res) => {
    const { userSystemId } = req.body;
    if (!userSystemId) throw new Error('Geçersiz userSystemId');
    const tasks = await this.service.getUpcomingTasksByAdmin(Number(userSystemId));
    res.json({ success: true, data: tasks });
  });
}
