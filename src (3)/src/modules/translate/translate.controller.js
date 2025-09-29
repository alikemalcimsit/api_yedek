import { BaseController } from "../base/base.controller.js";
import { asyncHandler } from "../../middleware/index.js";

function setCORS(res) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=UTF-8",
  });
}

export class TranslateController extends BaseController {
  constructor({ translateService }) {
    super(translateService);
  }

  // OPTIONS (preflight)
  options = asyncHandler(async (req, res) => {
    setCORS(res);
    return res.sendStatus(204);
  });

  // PHP’deki POST handler’ın birebir karşılığı
  translate = asyncHandler(async (req, res) => {
    setCORS(res);

    if (req.method !== "POST") {
      res.status(405);
      return res.json({ success: false, error: "Sadece POST istekleri desteklenmektedir" });
    }

    const body = req.body || {};
    const text = body.text;
    const targetLanguage = body.targetLanguage;
    const sourceLanguage = body.sourceLanguage; // opsiyonel

    if (!text) {
      res.status(400);
      return res.json({ success: false, error: "'text' parametresi gereklidir" });
    }
    if (!targetLanguage) {
      res.status(400);
      return res.json({ success: false, error: "'targetLanguage' parametresi gereklidir" });
    }

    try {
      const result = await this.service.translateOne({
        text,
        targetLanguage,
        sourceLanguage,
      });
      return res.json(result);
    } catch (e) {
      const status = e?.statusCode && e.statusCode >= 400 && e.statusCode < 600 ? e.statusCode : 500;
      res.status(status);
      return res.json({ success: false, error: e?.message || "Bilinmeyen hata" });
    }
  });
}
