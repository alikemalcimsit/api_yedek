import { BaseService } from "../base/base.service.js";
import { deeplTranslateOne } from "../../utils/deepl.js";

export class TranslateService extends BaseService {
  constructor({ translateRepository }) { super(translateRepository); }

  async translateOne({ text, targetLanguage, sourceLanguage }) {
    const { translatedText, detectedLanguage } = await deeplTranslateOne(
      text,
      targetLanguage,
      sourceLanguage
    );

    return {
      success: true,
      originalText: text,
      translatedText,
      targetLanguage,
      detectedSourceLanguage: detectedLanguage,
    };
  }
}
