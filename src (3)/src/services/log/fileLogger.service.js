import fs from 'fs';
import path from 'path';

export class FileLoggerService {
  constructor() {
     this.baseLogDir = 'logs';
  }
  getLogFilePath(channelID) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const dateStr = `${year}_${month}_${day}`;
    const logDir = path.join(this.baseLogDir, channelID);
    const fileName = `${dateStr}_messenger.log`;
    
    return path.join(logDir, fileName);
  }
  ensureLogFileExists(logFilePath) {
    const logDir = path.dirname(logFilePath);
    // Dizin yoksa oluştur
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Dosya yoksa veya bozuksa yeni JSON array ile oluştur
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '[\n]');
    } else {
      // Mevcut dosyanın JSON formatında olup olmadığını kontrol et
      try {
        const content = fs.readFileSync(logFilePath, 'utf8');
        JSON.parse(content);
      } catch (error) {
        // Dosya bozuksa yeni JSON array ile değiştir
        console.log('Log dosyası bozuk, yeniden oluşturuluyor...');
        fs.writeFileSync(logFilePath, '[\n]');
      }
    }
  }

  logWebhookResponse(status, responseText, body, channelID = null) {
    try {
       const finalChannelID = channelID || body?.entry?.[0]?.id || "unknown";
      const logFilePath = this.getLogFilePath(finalChannelID);
      
      this.ensureLogFileExists(logFilePath);

      // Mevcut dosyayı oku
      let logs = [];
      const fileContent = fs.readFileSync(logFilePath, 'utf8');

      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
      }

      // Yeni log entry'si oluştur
      const logEntry = {
        channelID: finalChannelID,
        timestamp: new Date().toISOString(),
        response: `HTTP ${status}`,
        message: body
      };

      // Array'e ekle
      logs.push(logEntry);

      // Dosyaya yaz
      fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));

    } catch (error) {
      console.error('Log yazma hatası:', error);
    }
  }


  logSuccess(message, channelID = "success") {
    const logEntry = {
      channelID: channelID,
      timestamp: new Date().toISOString(),
      response: "SUCCESS",
      message: message
    };
    this.addLogEntry(logEntry, channelID);
  }

  logError(error, channelID = "error") {
    const logEntry = {
      channelID: channelID,
      timestamp: new Date().toISOString(),
      response: "ERROR",
      message: error.toString()
    };
    this.addLogEntry(logEntry, channelID);
  }

  addLogEntry(logEntry, channelID) {
    try {
      const logFilePath = this.getLogFilePath(channelID);
      this.ensureLogFileExists(logFilePath);

      let logs = [];
      const fileContent = fs.readFileSync(logFilePath, 'utf8');

      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
      }

      logs.push(logEntry);
      fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Log yazma hatası:', error);
    }
  }
}