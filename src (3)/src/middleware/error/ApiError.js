export default class ApiError extends Error {
  constructor(statusCode, messageKey, details = null) {
    super(messageKey);
    this.statusCode = statusCode;
    this.messageKey = messageKey; // i18n anahtarı
    this.details = details;       // validation vb. ek bilgiler
    this.name = 'ApiError';
  }
}