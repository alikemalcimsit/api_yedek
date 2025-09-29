import { prisma } from '../../utils/prisma.js';
import { BaseRepository } from '../base/base.repository.js';

export class MailRepository extends BaseRepository {
  constructor() {
    super();
    // Prisma model adları schema.prisma’daki @@map adlarıyla eşleşir
    this._modelName = 'mailmessage';
      this.prisma = prisma; // Bunu ekle!

  }

  // Prisma client'ı BaseRepository'de this.prisma olarak geliyor olmalı
  createMailbox(data) {
    return this.prisma.mailbox.create({ data });
  }

  updateMailbox(id, data) {
    return this.prisma.mailbox.update({ where: { id: BigInt(id) }, data });
  }

  getMailbox(id) {
    return this.prisma.mailbox.findUnique({ where: { id: BigInt(id) } });
  }

  listMails({ mailboxId, folder, q, skip, take }) {
    const where = {
      mailboxId: BigInt(mailboxId),
      folder,
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: 'insensitive' } },
              { fromAddr: { contains: q, mode: 'insensitive' } },
              { toAddrs: { contains: q, mode: 'insensitive' } },
              { bodyText: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.mailMessage.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take,
      select: {
        id: true,
        subject: true,
        fromAddr: true,
        toAddrs: true,
        date: true,
        snippet: true,
        flags: true,
        size: true,
      },
    });
  }

  countMails({ mailboxId, folder, q }) {
    const where = {
      mailboxId: BigInt(mailboxId),
      folder,
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: 'insensitive' } },
              { fromAddr: { contains: q, mode: 'insensitive' } },
              { toAddrs: { contains: q, mode: 'insensitive' } },
              { bodyText: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return this.prisma.mailMessage.count({ where });
  }

  getMail(id) {
    return this.prisma.mailMessage.findUnique({
      where: { id: BigInt(id) },
      include: { attachments: true, mailbox: true },
    });
  }

  getAttachment(attId, mailId) {
    return this.prisma.mailAttachment.findFirst({
      where: { id: BigInt(attId), message: { id: BigInt(mailId) } },
    });
  }

  async getMailboxes() {
    return this.prisma.mailbox.findMany();
  }

  
  async getMailboxesBySmtpHost(smtpHost) {
    return this.prisma.mailbox.findMany({
      where: {
        smtp_host: {
          contains: smtpHost,
        },
      },
      select: {
        id: true,
        label: true,
        email: true,
        smtp_host: true,
        smtp_port: true,
        smtp_secure: true,
        imap_host: true,
        imap_port: true,
        imap_secure: true,
        folders: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getMailboxByExactSmtpHost(smtpHost) {
    return this.prisma.mailbox.findFirst({
      where: {
        smtp_host: smtpHost,
      },
      select: {
        id: true,
        label: true,
        email: true,
        smtp_host: true,
        smtp_port: true,
        smtp_secure: true,
        imap_host: true,
        imap_port: true,
        imap_secure: true,
        folders: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getDistinctSmtpHosts() {
    const result = await this.prisma.mailbox.findMany({
      select: {
        smtp_host: true,
      },
      distinct: ['smtp_host'],
    });

    return result.map((item) => item.smtp_host);
  }

  // Mail message için userSystemId güncelleme
  async updateMailMessageUserSystem(mailMessageId, userSystemId) {
    return this.prisma.mailMessage.update({
      where: { id: BigInt(mailMessageId) },
      data: { userSystemId: parseInt(userSystemId) }
    });
  }
}
