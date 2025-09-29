import { BaseService } from '../base/base.service.js';
import { MailSyncService } from './mail.sync.service.js';

export class MailService extends BaseService {
  constructor({ mailRepository }) {
    super(mailRepository);
    this.repo = mailRepository;
  }

  createMailbox(input) { return this.repo.createMailbox(input); }
  updateMailbox(id, input) { return this.repo.updateMailbox(id, input); }
  getMailbox(id) { return this.repo.getMailbox(id); }

  async listMails(params) {
    const { mailboxId, folder = 'INBOX', page = 1, limit = 50, q } = params;
    const p = Math.max(1, +page || 1);
    const l = Math.min(200, Math.max(1, +limit || 50));
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      this.repo.listMails({ mailboxId, folder, q, skip, take: l }),
      this.repo.countMails({ mailboxId, folder, q }),
    ]);

    return { page: p, limit: l, total, data };
  }

  getMail(id) { return this.repo.getMail(id); }
  getAttachment(attId, mailId) { return this.repo.getAttachment(attId, mailId); }

  // 🔴 ÖNEMLİ: prisma'yı controller'dan alıyoruz (req.dbClient)
  syncMailbox(id, opts, prisma) {
    const syncSvc = new MailSyncService({ prisma });
    return syncSvc.sync(id, opts);
  }

  async getMailboxesBySmtpHost(smtpHost) {
    if (!smtpHost) {
      throw new Error('SMTP host parametresi gerekli');
    }
    
    return this.repo.getMailboxesBySmtpHost(smtpHost);
  }

  async getMailboxByExactSmtpHost(smtpHost) {
    if (!smtpHost) {
      throw new Error('SMTP host parametresi gerekli');
    }
    
    const result = await this.repo.getMailboxByExactSmtpHost(smtpHost);
    if (!result) {
      throw new Error(`SMTP host '${smtpHost}' için mailbox bulunamadı`);
    }
    
    return result;
  }

  async getDistinctSmtpHosts() {
    return this.repo.getDistinctSmtpHosts();
  }

  async getMailboxes() {
    return this.repo.getMailboxes();
  }

  async assignMailToUser({ mailMessageId, userSystemId }, prisma) {
    try {
      // 1. Mail mesajını güncelle - userSystemId'yi ata
      const mailMessage = await prisma.mailMessage.findUnique({
        where: { id: Number(mailMessageId) }
      });

      if (!mailMessage) {
        throw new Error(`Mail message not found with id: ${mailMessageId}`);
      }

      // Mail message'ı güncelle
      const updatedMailMessage = await prisma.mailMessage.update({
        where: { id: Number(mailMessageId) },
        data: { userSystemId: Number(userSystemId) }
      });

      // 2. from_addr ile userPatient tablosundaki chatId'yi karşılaştır
      const fromAddr = mailMessage.from_addr;
      
      if (!fromAddr) {
        throw new Error('Mail message has no from_addr');
      }

      // Mevcut userPatient kaydını kontrol et
      let userPatient = await prisma.userPatient.findFirst({
        where: {
          chatId: fromAddr
        }
      });

      let userPatientCreated = false;

      if (!userPatient) {
        // Kayıt yoksa oluştur
        userPatient = await prisma.userPatient.create({
          data: {
            userSystemId: Number(userSystemId),
            identityId: null,
            fileNumber: null,
            profileName: fromAddr, // from_addr'ı profileName olarak kullan
            avatar: null,
            name: null,
            surname: null,
            channelId: 'email',
            chatId: fromAddr,
            chatType: 'email',
            phoneNumber: '0000000000', // Default phone number
            countryCode: null,
            mail: fromAddr,
            gender: null,
            birthDate: null,
            language: 'tr',
            registerDate: new Date(),
          }
        });
        userPatientCreated = true;
      } else {
        // Kayıt varsa userSystemId her zaman güncellenir
        userPatient = await prisma.userPatient.update({
          where: { id: userPatient.id },
          data: { userSystemId: Number(userSystemId) }
        });
        userPatientCreated = false;
      }

      // 4. Periods kaydı kontrol et ve oluştur/güncelle (userPatient oluşturulduysa)
      let periodsRecord = null;
      let periodsCreated = false;
      if (userPatientCreated) {
        // Bu userPatientId'ye ait herhangi bir periods kaydı var mı?
        const existingPeriods = await prisma.periods.findFirst({
          where: {
            userPatientId: userPatient.id
          }
        });
        if (existingPeriods) {
          // Sadece userSystemId'yi güncelle
          periodsRecord = await prisma.periods.update({
            where: { id: existingPeriods.id },
            data: { userSystemId: Number(userSystemId) }
          });
          periodsCreated = false;
        } else {
          // Yeni periods kaydı oluştur
          periodsRecord = await prisma.periods.create({
            data: {
              opportunityId: 1, // Default opportunity ID
              periotName: 'Mail Assign',
              periotDetail: `Mail assigned from: ${fromAddr}`,
              userSystemId: Number(userSystemId),
              userPatientId: userPatient.id,
              currentStatus: 1, // Default status
              messageType: 1, // Email message type
            }
          });
          periodsCreated = true;
        }
      }

      return {
        success: true,
        mailMessage: {
          id: updatedMailMessage.id,
          userSystemId: updatedMailMessage.userSystemId,
          fromAddr: updatedMailMessage.fromAddr
        },
        userPatient: {
          id: userPatient.id,
          created: userPatientCreated,
          chatId: userPatient.chatId,
          profileName: userPatient.profileName
        },
        periods: periodsRecord ? {
          id: periodsRecord.id,
          created: periodsCreated,
          periotName: periodsRecord.periotName,
          message: periodsCreated ? "New periods record created" : "Existing periods record found and used"
        } : {
          created: false,
          message: 'Periods record not created - userPatient already existed'
        }
      };

    } catch (error) {
      console.error('Mail assign error:', error);
      throw new Error(`Mail assign failed: ${error.message}`);
    }
  }



    async deleteMail(id) {
    const existingMail = await this.repo.getMail(id);
    if (!existingMail) {
      throw new Error(`ID ${id} ile mail bulunamadı`);
    }
    
    return this.repo.deleteMail(id);
  }
 async replyToMail(mailId, replyData) {
    if (!replyData.bodyText || !replyData.fromAddr) {
      throw new Error('Cevap için bodyText ve fromAddr gerekli');
    }

    return this.repo.replyToMail(mailId, replyData);
  }
}
