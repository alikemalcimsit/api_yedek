import { Router } from 'express';
import container from './reports.container.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const reportsController = container.resolve('reportsController');

router.get('/new-dialogs',domainMiddleware, reportsController.newDialogs.bind(reportsController));



router.get('/task-status-distribution', reportsController.taskStatusDistribution.bind(reportsController));
router.get('/message-counts', reportsController.messageCounts.bind(reportsController));
router.get('/response-time-analysis', reportsController.responseTimeAnalysis.bind(reportsController));
router.get('/user-patient-registrations', reportsController.userPatientRegistrations.bind(reportsController));
router.get('/appointment-counts', reportsController.appointmentCounts.bind(reportsController));
router.get('/user-label-details', reportsController.userLabelDetails.bind(reportsController));
router.get('/user-note-details', reportsController.userNoteDetails.bind(reportsController));
router.get('/total-offers', reportsController.totalOffers.bind(reportsController));
router.get('/offers-unified', reportsController.offersUnified.bind(reportsController));
router.get('/user-departments', reportsController.userDepartments.bind(reportsController));
router.get('/chat-types', reportsController.chatTypes.bind(reportsController));
router.get('/user-patient-by-channel', reportsController.userPatientByChannel.bind(reportsController));

export default router;
