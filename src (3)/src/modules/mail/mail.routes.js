import { Router } from 'express';
import container from './mail.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';

const router = Router();
const mailController = container.resolve('mailController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'mail',
    routes: [
      { method: 'POST', path: '/mailboxes', desc: 'Mailbox oluştur' },
      { method: 'POST', path: '/mailboxes/:id/sync', desc: 'IMAP senkron' },
      { method: 'GET',  path: '/mails', desc: 'Mailleri listele' },
      { method: 'GET',  path: '/mails/:id', desc: 'Mail detayı' },
      { method: 'GET',  path: '/mails/:id/attachments/:attId/download', desc: 'Ek indir' },
      // Domain header bazlı endpoint'ler
      { method: 'GET',  path: '/mailboxes/by-domain', desc: 'x-domain header\'ına göre mailbox\'ları listele (contains)' },
      { method: 'GET',  path: '/mailboxes/by-domain-exact', desc: 'x-domain header\'ına göre tam eşleşme' },
      // Query parameter veya header
      { method: 'GET',  path: '/mailboxes/by-smtp-host?host=<smtp_host>', desc: 'SMTP host\'a göre mailbox\'ları listele (query veya header)' },
      { method: 'GET',  path: '/mailboxes/by-smtp-host-exact?host=<smtp_host>', desc: 'Tam SMTP host eşleşmesi' },
      { method: 'GET',  path: '/mailboxes/smtp-hosts', desc: 'Tüm SMTP host\'ları listele' },
      { method: 'POST', path: '/assign', desc: 'Mail\'i kullanıcıya ata' },
    ],
  });
});


router.get('/mailboxes', 
  
  authenticateToken, 
  slidingSession, 
  mailController.getMailboxes
);
router.delete('/mails/:id', authenticateToken, slidingSession, mailController.deleteMail);

router.post('/mails/reply', authenticateToken, slidingSession, mailController.replyToMail);
router.get('/mails/:id/attachments/:attId/download', authenticateToken, slidingSession, mailController.downloadAttachment);

// Mevcut endpoint'ler (güncellenmiş)
router.post('/mailboxes', authenticateToken, slidingSession, mailController.createMailbox);
router.post('/mailboxes/:id/sync', authenticateToken, slidingSession, mailController.syncMailbox);

router.get('/mails', authenticateToken, slidingSession, mailController.listMails);
router.get('/mails/:id', authenticateToken, slidingSession, mailController.getMail);
router.get('/mails/:id/attachments/:attId/download', authenticateToken, slidingSession, mailController.downloadAttachment);

// SMTP host bazlı sorgular
router.get('/mailboxes/by-smtp-host', 
   
  authenticateToken, 
  slidingSession, 
  mailController.getMailboxesBySmtpHost
);

router.get('/mailboxes/by-smtp-host-exact', 
  
  authenticateToken, 
  slidingSession, 
  mailController.getMailboxByExactSmtpHost
);

router.get('/mailboxes/smtp-hosts', 
  
  authenticateToken, 
  slidingSession, 
  mailController.getDistinctSmtpHosts
);

// Mail assignment endpoint
router.post('/assign', 

  authenticateToken, 
  slidingSession, 
  mailController.assignMail
);

export default router;
