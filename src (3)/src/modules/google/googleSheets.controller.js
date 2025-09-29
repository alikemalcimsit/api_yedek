import { BaseController } from "../base/base.controller.js";

export class GoogleSheetsController extends BaseController {
  constructor({ googleSheetsService }) {
    super(googleSheetsService);
  }

  handleWebhook = async (req, res) => {
    const startTime = Date.now();
    const { hospitalCode } = req.params;

    try {
      const payload = req.body;
      payload.hospitalCode = hospitalCode;

      console.log(`\n🏥 ===== WEBHOOK ALINDI =====`);
      console.log(`🎯 Hospital Code: ${hospitalCode}`);
      console.log(`📦 Payload:\n${JSON.stringify(payload, null, 2)}`);

      const result = await this.service.handleWebhook(payload);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Webhook işlendi - ${processingTime}ms`);

      res.json({
        success: true,
        message: 'Webhook alındı ve kaydedildi',
        hospitalCode,
        data: result,
        processingTime
      });
    } catch (error) {
      console.error('❌ Webhook işleme hatası:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
