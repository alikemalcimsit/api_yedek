import { Router, json } from "express";
import container from "./translate.container.js";
// İstersen aç:
// import { domainMiddleware } from "../../config/middleware/domainMiddleware.js";
// import { authenticateToken, slidingSession } from "../../middleware/index.js";

const router = Router();
const ctrl = container.resolve("translateController");

// CORS/OPTIONS
router.options("/", ctrl.options);

// Düz endpoint (PHP gibi, auth’suz). Auth isterse aşağıdakini aç:
// router.post("/",
//   domainMiddleware, authenticateToken, slidingSession,
//   json(), ctrl.translate
// );
router.post("/", json(), ctrl.translate);

router.get("/info", (req, res) => {
  res.json({
    endpoint: "translate",
    description: "DeepL çeviri",
    routes: [
      { method: "POST", path: "/", description: "Türkçe PHP sürümü gibi çeviri yapar (text/targetLanguage)" },
    ],
  });
});

export default router;
