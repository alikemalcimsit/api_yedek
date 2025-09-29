import { BaseService } from "../base/base.service.js";

export class GoogleSheetsService extends BaseService {
  constructor({ googleSheetsRepository }) {
    super(googleSheetsRepository);
  }

  async handleWebhook(payload) {
    const requiredFields = ['sheetId', 'sheetName', 'formResponse'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      throw new Error(`Eksik alanlar: ${missingFields.join(', ')}`);
    }

    const messageId = payload.formResponse.responseId;
    const messageData = JSON.stringify(payload.formResponse.namedValues || {});
    const userSystemId = payload.userSystemId || 0;

    return await this.repository.createSheetRecord({
      sheetId: payload.sheetId,
      sheetName: payload.sheetName,
      messageId,
      messageData,
      createdDate: new Date(payload.timestamp || Date.now()),
      userSystemId
    });
  }
}
