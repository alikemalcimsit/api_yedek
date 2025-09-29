import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';
import { enc } from '../../utils/secret.js';
import { safeStringify } from '../../utils/json.js';

export class MailController extends BaseController {
  constructor({ mailService }) {
    super(mailService);
    this.service = mailService;
  }

  // POST /mail/mailboxes
  createMailbox = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const {
        label, email, password_enc,
        imap_host, imap_port , imap_secure,
        smtp_host, smtp_port, smtp_secure,
        folders = 'INBOX',
        
      } = req.body || {};

      if (!label || !email || !password_enc || !imap_host || !smtp_host ) {
        return res.status(400).json({ success: false, message: 'label, email, password_enc, imap_host, smtp_host zorunlu' });
      }

      const data = {
        label,
        email,
        password_enc: enc(password_enc),
        imap_host: imap_host,
        imap_port: Number(imap_port) || 993,
        imap_secure: !!imap_secure,
        smtp_host: smtp_host,
        smtp_port: Number(smtp_port) || 465,
        smtp_secure: !!smtp_secure,
        folders,
    
      };

      const saved = await this.service.createMailbox(data, req);
      res.send(safeStringify({ success: true, data: saved }));
    })
  );

  // POST /mail/mailboxes/:id/sync
  syncMailbox = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const result = await this.service.syncMailbox(
        req.params.id,
        {
          folder: req.body?.folder || 'INBOX',
          limit: req.body?.limit || 400,
        },
        req.dbClient // 🔴 PRISMA'YI BURADAN PASLIYORUZ
      );
      res.send(safeStringify({ success: true, ...result }));
    })
  );

  // GET /mail/mails
  listMails = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const out = await this.service.listMails(req.query, req);
      res.send(safeStringify({ success: true, ...out }));
    })
  );

  // GET /mail/mails/:id
  getMail = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const item = await this.service.getMail(req.params.id, req);
      if (!item) return res.status(404).json({ success: false, message: 'Mail bulunamadı' });
      res.send(safeStringify({ success: true, data: item }));
    })
  );

  // GET /mail/mails/:id/attachments/:attId/download
  downloadAttachment = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const att = await this.service.getAttachment(req.params.attId, req.params.id, req);
      if (!att) return res.status(404).json({ success: false, message: 'Ek bulunamadı' });
      res.download(att.storagePath, att.filename || 'attachment');
    })
  );

  // GET /mail/mailboxes/by-smtp-host?host=smtp.gmail.com
  getMailboxesBySmtpHost = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      // Önce query parameter'a bak, yoksa x-domain header'ını kullan
      const host = req.query.host || req.headers['x-domain'];
      
      if (!host) {
        return res.status(400).json({ 
          success: false, 
          message: 'host query parametresi veya x-domain header\'ı gerekli' 
        });
      }

      const mailboxes = await this.service.getMailboxesBySmtpHost(host);
      
      res.json({
        success: true,
        data: mailboxes,
        count: mailboxes.length,
        source: req.query.host ? 'query' : 'header'
      });
    })
  );

  // GET /mail/mailboxes/by-smtp-host-exact?host=smtp.gmail.com
  getMailboxByExactSmtpHost = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { host } = req.query;
      
      if (!host) {
        return res.status(400).json({ 
          success: false, 
          message: 'host query parametresi gerekli' 
        });
      }

      try {
        const mailbox = await this.service.getMailboxByExactSmtpHost(host);
        res.json({
          success: true,
          data: mailbox
        });
      } catch (error) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      }
    })
  );

  // GET /mail/mailboxes/smtp-hosts
  getDistinctSmtpHosts = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const hosts = await this.service.getDistinctSmtpHosts();
      
      res.json({
        success: true,
        data: hosts,
        count: hosts.length
      });
    })
  );

  deleteMail = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const mailId = req.params.id;
      
      if (!mailId) {
        return res.status(400).json({
          success: false,
          message: 'mailId URL parametresi gerekli'
        });
      }
      
      try {
        const deletedMail = await this.service.deleteMail(mailId);
        res.json({
          success: true,
          message: 'Mail başarıyla silindi (hem IMAP hem veritabanından)',
          data: deletedMail
        });
      } catch (error) {
        // IMAP hatası olsa da başarı durumu göster (veritabanından silindiyse)
        if (error.message.includes('IMAP\'tan silme başarısız')) {
          res.json({
            success: true,
            message: 'Mail veritabanından silindi ancak IMAP\'tan silinemedi',
            warning: error.message,
            data: null
          });
        } else {
          res.status(404).json({
            success: false,
            message: error.message
          });
        }
      }
    })
  );
  getMailboxes = this.withDynamicClient(
    asyncHandler(async (req, res) => {
    
    
      const mailboxes = await this.service.getMailboxes();
      
      // ID'leri string'e çevir (artık Int kullandığımız için gerekli değil ama tutarlılık için)
      const serializedMailboxes = mailboxes.map(mb => ({
        ...mb,
        id: mb.id
      }));
      
      res.send(safeStringify({
        success: true,
        data: serializedMailboxes,
        count: mailboxes.length,
    
      }));
    })
  );

  // POST /mail/assign
  assignMail = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { mailMessageId, userSystemId } = req.body;

      if (!mailMessageId || !userSystemId) {
        return res.status(400).json({ 
          success: false, 
          message: 'mailMessageId and userSystemId are required' 
        });
      }

      try {
        const result = await this.service.assignMailToUser({ mailMessageId, userSystemId }, req.dbClient);
        res.json(result);
      } catch (error) {
        console.error('Mail assign controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    })
  );


 replyToMail = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      const { mailId, fromAddr, bodyText, bodyHtml, ccAddrs } = req.body;
      
      if (!mailId || !fromAddr || !bodyText) {
        return res.status(400).json({
          success: false,
          message: 'mailId, fromAddr ve bodyText zorunlu alanlar'
        });
      }

      try {
        const replyMail = await this.service.replyToMail(mailId, {
          fromAddr,
          bodyText,
          bodyHtml,
          ccAddrs
        });

        res.json({
          success: true,
          message: 'Cevap başarıyla gönderildi (SMTP + veritabanı)',
          data: replyMail
        });
      } catch (error) {
        // SMTP hatası olsa da veritabanına kaydetmeye devam ediyoruz
        if (error.message.includes('SMTP')) {
          res.json({
            success: true,
            message: 'Cevap veritabanına kaydedildi ancak SMTP gönderimi başarısız',
            warning: error.message,
            data: null
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }
    })
  );



}
