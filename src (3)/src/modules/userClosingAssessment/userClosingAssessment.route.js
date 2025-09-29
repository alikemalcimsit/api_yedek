import { Router } from "express";
import container from "./userClosingAssessment.container.js";
import {
    authenticateToken,
    slidingSession,
} from "../../middleware/index.js";

const router = Router();
const patientAssessmentController = container.resolve(
    "userClosingAssessmentController"
);

router.get("/info", (req, res) => {
    res.json({
        endpoint: "user-closing-assessment", // route path'ini korudum (geriye dönük uyum için)
        description: "hastaya özel etiket/değerlendirme işlemleri",
        routes: [
            { method: "GET", path: "/", auth: true, description: "Kayıtları getirir" },

            { method: "POST", path: "/", auth: true, description: "Yeni kayıt oluşturur" },
            { method: "PUT", path: "/:id", auth: true, description: "Kaydı günceller" },
            { method: "DELETE", path: "/:id", auth: true, description: "Kaydı siler" },
        ],
    });
});



// CRUD (BaseController üzerinden)
router.post(
    "/",
    
    authenticateToken,
    slidingSession,
    patientAssessmentController.create
);


router.get(
    "/",
    
    authenticateToken,
    slidingSession,
    patientAssessmentController.list
);
router.put(
    "/:id",
    
    authenticateToken,
    slidingSession,
    patientAssessmentController.update
);
router.delete(
    "/:id",
    
    authenticateToken,
    slidingSession,
    patientAssessmentController.delete
);


router.get(
  "/with-relations",
  
  authenticateToken,
  slidingSession,
  patientAssessmentController.findWithRelations
);
export default router;
