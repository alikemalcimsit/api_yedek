import { Router } from "express";
import fs from 'fs';
import path from 'path';
import axios from 'axios'; 
import { FacebookService } from "../services/facebook/facebook.service.js";
import { FACEBOOK_CONFIG } from "../config/fbConfig.js";
import { FileLoggerService } from "../services/log/fileLogger.service.js";
import { WebhookService } from "../services/facebook/webhook.service.js";
import { MessageTransformer } from "../utils/messageTransformer.js";

const router = Router();
const facebookService = new FacebookService();
const webhookService = new WebhookService(FACEBOOK_CONFIG.WEBHOOK_URL, FACEBOOK_CONFIG.TIMEOUT);
const logger = new FileLoggerService();

router.get('/', (req, res) => {
  const mode      = req.query.hub_mode      || req.query['hub.mode'];
  const token     = req.query.hub_verify_token || req.query['hub.verify_token'];
  const challenge = req.query.hub_challenge || req.query['hub.challenge'];

  if (mode === 'subscribe' && token === FACEBOOK_CONFIG.VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Doğrulama başarısız');
  }
});

// POST handler: Incoming messages
router.post('/', async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.messaging?.[0];
    if (!entry) {
      return res.sendStatus(400);
    }

    await processMessage(entry, req.body);
    res.status(200).send('OK');
  } catch (error) {
    logger.logError(`Message processing failed: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/message_send', async (req, res) => {
  try {
    // Request'ten parametreleri al
    const { senderId, messageText, crmUserId } = req.body;
    
    // Validation
    if (!senderId || !messageText) {
      return res.status(400).json({ 
        error: 'senderId ve messageText parametreleri gerekli' 
      });
    }

    // FacebookService kullanarak mesaj gönder
    const messageData = {
      recipient: { id: senderId },
      message: {
        text: messageText,
        metadata: JSON.stringify({ crmUserId: crmUserId || '0' })
      }
    };

    // FacebookService'i kullan
    const response = await facebookService.sendMessage(messageData);

    // Başarılı işlemi logla
    logger.logSuccess(`Mesaj gönderildi - Alıcı: ${senderId}, Mesaj: ${messageText}`);
    
    res.status(200).json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: response
    });

  } catch (error) {
    // Hata logla
    logger.logError(`Message send failed for ${req.body.senderId}: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: 'Mesaj gönderilemedi',
      details: error.response?.data || error.message
    });
  }
});

async function processMessage(entry, body) {
  const senderId = entry.sender.id;
  const channelId = body.entry[0].id || '';
  
  // Get user info and extract CRM user ID
  const userName = await facebookService.getNameById(senderId);
  const crmUserId = MessageTransformer.extractCrmUserId(entry);

  // Transform message to required format
  const transformedData = MessageTransformer.transformToWazzupFormat(
    entry, 
    channelId, 
    userName, 
    crmUserId
  );

  // Send to webhook
  try {
    const webhookRes = await webhookService.sendToWebhook(transformedData);
    logger.logWebhookResponse(webhookRes.status, '', body);
  } catch (error) {
    logger.logError(`Webhook sending failed: ${error.message}`);
  }
}

export default router;