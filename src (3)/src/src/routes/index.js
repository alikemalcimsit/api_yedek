
import apiRoutes from './api.js';
import fbMessengerRoutes from './fbMessenger.js';
import authRoutes from '../modules/auth/auth.routes.js';
import hospitalRoutes from '../modules/hospital/hospital.routes.js';
import taskRoutes from "../modules/task/task.routes.js";
import appointmentRoutes from "../modules/appointment/appointment.routes.js"
import offerRoutes from "../modules/offer/offer.routes.js"
import opportunitiesRoutes from "../modules/opportunities/opportunities.routes.js";
import departmentsRoutes from "../modules/departments/departments.routes.js";
import refreshTokenRoutes from '../modules/refreshtoken/refreshToken.routes.js';
import hospitalsInfoRoutes from '../modules/hospitalsinfo/hospitalsInfo.routes.js';
import chatListRoutes from '../modules/chatlist/chatList.routes.js';
import quickMessagesRoutes from '../modules/quickmessages/quickMessages.routes.js';
import leadgenRoutes from '../modules/leadgen/leadgen.routes.js';
import serviceDetailsRoutes from '../modules/servicedetails/serviceDetails.routes.js';
import usernotesRoutes from '../modules/usernotes/usernotes.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';
import userSystemRoutes from '../modules/usersystem/userSystem.routes.js';
import periodsRoutes from '../modules/periods/periods.routes.js';
import labelsRoutes from '../modules/labels/labels.routes.js';
import userlabelsRoutes from '../modules/userlabels/userLabels.route.js'
import userPatientRoutes from '../modules/userpatients/userPatients.route.js'
import reportsRoutes from '../modules/reports/reports.routes.js'
import adminMaintenanceRoutes from "../modules/admin/adminMaintance.routes.js"
import userDashboardRoutes from '../modules/userdashboard/userDashboard.routes.js';
import adminAuthRoutes from '../modules/adminauth/adminAuth.routes.js';
import googleSheetsRoutes from '../modules/google/googleSheets.route.js';   
const registerRoutes = (app) => {
    // API routes
    app.use('/hospital', hospitalRoutes);//hastahaneler db

    app.use('/api', apiRoutes);
    app.use('/auth', authRoutes);
    app.use('/appointment', appointmentRoutes);
    app.use('/chatlist', chatListRoutes);
    app.use('/departments', departmentsRoutes);
    app.use('/hospitalsinfo', hospitalsInfoRoutes);
    app.use('/leadgen', leadgenRoutes);
    app.use('/offer', offerRoutes);
    app.use('/opportunities', opportunitiesRoutes);
    app.use('/periods', periodsRoutes);
    app.use('/quickmessages', quickMessagesRoutes);
    app.use('/refreshtoken', refreshTokenRoutes);
    app.use('/settings', settingsRoutes);
    app.use('/task', taskRoutes);
    app.use('/usersystem', userSystemRoutes);
    app.use('/servicedetails', serviceDetailsRoutes);
    app.use('/usernotes', usernotesRoutes);
    app.use('/labels', labelsRoutes);
    app.use('/userlabels', userlabelsRoutes)
    app.use('/userpatient', userPatientRoutes)
    app.use('/reports', reportsRoutes)
    app.use('/admin', adminMaintenanceRoutes);
    app.use('/fb-messenger', fbMessengerRoutes);
    app.use('/userdashboard', userDashboardRoutes);
    app.use('/admin-auth', adminAuthRoutes);
    app.use('/google-sheets',googleSheetsRoutes);

    app.get('/', (req, res) => {
        res.status(200).json({
            endpoint: 'CRMPanel API',
            description: 'CRMPanel API çalışıyor'
        });
    });


    // 404 Handler 
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint bulunamadı',
            message: `${req.method} ${req.originalUrl} endpoint'i mevcut değil`,
            timestamp: new Date().toISOString(),
        });
    });





};





export { registerRoutes }; 