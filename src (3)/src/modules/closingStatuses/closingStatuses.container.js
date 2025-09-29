import { createContainer,asClass } from "awilix";
import { ClosingStatusesRepository } from "./closingStatuses.repository.js";
import { ClosingStatusesService } from "./closingStatuses.service.js";
import { ClosingStatusesController } from "./closingStatuses.controller.js";

const container = createContainer();

container.register({
    closingStatusesRepository: asClass(ClosingStatusesRepository).singleton(),
    closingStatusesService: asClass(ClosingStatusesService).singleton(),
    closingStatusesController: asClass(ClosingStatusesController).singleton(),
})

export default container;
