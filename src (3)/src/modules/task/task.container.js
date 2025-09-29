import { createContainer, asClass } from 'awilix';
import { TaskRepository } from './task.repository.js';
import { TaskService } from './task.service.js';
import { TaskController } from './task.controller.js';

const container = createContainer();

container.register({
  taskRepository: asClass(TaskRepository).singleton(),
  taskService: asClass(TaskService).singleton(),
  taskController: asClass(TaskController).singleton(),
});

export default container;
