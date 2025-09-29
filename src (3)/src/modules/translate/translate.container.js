import { createContainer, asClass } from "awilix";
import { TranslateRepository } from "./translate.repository.js";
import { TranslateService } from "./translate.service.js";
import { TranslateController } from "./translate.controller.js";

const container = createContainer();

container.register({
  translateRepository: asClass(TranslateRepository).singleton(),
  translateService: asClass(TranslateService).singleton(),
  translateController: asClass(TranslateController).singleton(),
});

export default container;
