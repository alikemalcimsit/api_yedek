import { createContainer, asClass } from "awilix";
import { UserClosingAssessmentRepository } from "./userClosingAssessment.repository.js";
import { UserClosingAssessmentService } from "./userClosingAssessment.service.js";
import { UserClosingAssessmentController } from "./userClosingAssessment.controller.js";
import { UsernotesRepository } from "../usernotes/usernotes.repository.js";
const container = createContainer();

container.register({
 userClosingAssessmentRepository: asClass(UserClosingAssessmentRepository).singleton(),
userNotesRepository: asClass(UsernotesRepository).singleton(),
 userClosingAssessmentService: asClass(UserClosingAssessmentService).singleton(),
  userClosingAssessmentController: asClass(UserClosingAssessmentController).singleton(),
});

export default container;