import axios from 'axios';

export class WebhookService {
  constructor(webhookUrl, timeout = 30000) {
    this.webhookUrl = webhookUrl;
    this.timeout = timeout;
  }

  async sendToWebhook(data) {
    return await axios.post(this.webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    });
  }
}