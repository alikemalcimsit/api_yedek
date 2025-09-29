import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import fs from 'node:fs/promises';
import path from 'node:path';
import dns from 'node:dns/promises';
import { dec } from '../../utils/secret.js';

export class MailSyncService {
  constructor({ prisma, storageRoot = process.env.MAIL_STORAGE || '/var/maildata' }) {
    this.prisma = prisma;
    this.storageRoot = storageRoot;
  }

  async sync(mailboxId, { folder = 'INBOX', limit = 400 } = {}) {
    const mb = await this.prisma.mailbox.findUnique({ where: { id: Number(mailboxId) } });
    if (!mb) throw new Error('Mailbox not found');

    // --- Guardlar ---
    if (!mb.password_enc) throw new Error(`Mailbox ${mb.email} has no password_enc stored`);
    const pass = dec(mb.password_enc);

    const imapHost = String(mb.imap_host || '').trim();
    if (!imapHost || imapHost.includes('@')) {
      throw new Error(`Invalid IMAP host: "${mb.imap_host}"`);
    }

    // DNS ön kontrol (daha anlaşılır hata için)
    try {
      await dns.lookup(imapHost);
    } catch (e) {
      throw new Error(`IMAP host DNS çözülmedi: ${imapHost} (${e.code || e.message})`);
    }

    const client = new ImapFlow({
      host: imapHost,
      port: mb.imap_port,
      secure: mb.imap_secure,
      auth: { user: mb.email, pass },
      logger: false,
      // TESTTE gerekirse aç, prod'da kapalı kalsın:
      // tls: { rejectUnauthorized: false, servername: imapHost },
    });

    try {
      await client.connect();

      const lock = await client.getMailboxLock(folder);
      try {
        // Son senkron UID'ine göre aralık belirle
        const last = await this.prisma.mailMessage.findFirst({
          where: { mailbox_id: mb.id, folder },
          orderBy: { uid: 'desc' },
          select: { uid: true },
        });
        const range = last?.uid ? `${last.uid + 1}:*` : '1:*';

        let count = 0;

        // 🔧 ÖNEMLİ DÜZELTME:
        // UID ile fetch ederken 1. argüman range STRING olmalı,
        // 3. argüman olarak { uid: true } geçilmeli.
        for await (const msg of client.fetch(
          range,
          { envelope: true, flags: true, size: true, source: true },
          { uid: true }
        )) {
          if (count >= limit) break;
          count++;

          const parsed = await simpleParser(msg.source);
          const from = (parsed.from?.value || []).map(a => a.address).join(', ');
          const to = (parsed.to?.value || []).map(a => a.address).join(', ');
          const cc = (parsed.cc?.value || []).map(a => a.address).join(', ');
          const flags = Array.from(msg.flags || []);
          const snippet = (parsed.text || parsed.html || '')?.slice(0, 300) || null;

        const saved = await this.prisma.mailMessage.upsert({
  where: {
    // BURASI DÜZELDİ:
    uniq_mailbox_folder_uid: {
      mailbox_id: mb.id,    // Int
      folder,              // string
      uid: msg.uid,        // number/int
    }
  },
  update: {
    subject: parsed.subject || null,
    from_addr: from || null,
    to_addrs: to || null,
    cc_addrs: cc || null,
    date: parsed.date || null,          // Date
    snippet,
    body_html: parsed.html || null,
    body_text: parsed.text || null,
    flags: JSON.stringify(flags),       // String olarak JSON stringify
    size: msg.size || null,             // Int
  },
  create: {
    mailbox_id: mb.id,
    folder,
    uid: msg.uid,
    subject: parsed.subject || null,
    from_addr: from || null,
    to_addrs: to || null,
    cc_addrs: cc || null,
    date: parsed.date || null,
    snippet,
    body_html: parsed.html || null,
    body_text: parsed.text || null,
    flags: JSON.stringify(flags),       // String olarak JSON stringify
    size: msg.size || null,
  },
});
          // Ekleri kaydet
          for (const att of parsed.attachments || []) {
            const dir = path.join(this.storageRoot, String(mb.id), String(saved.id));
            await fs.mkdir(dir, { recursive: true });
            const filename = att.filename || `att-${Date.now()}`;
            const fpath = path.join(dir, filename);
            await fs.writeFile(fpath, att.content);
            await this.prisma.mailAttachment.create({
              data: {
                mail_message_id: saved.id,
                filename,
                mime_type: att.contentType || null,
                size: att.size || null,
                storage_type: 'local',
                storage_path: fpath,
              },
            });
          }
        }

        return { success: true, synced: count };
      } finally {
        lock.release();
      }
    } catch (err) {
      // Sunucu cevabını yüzeye çıkar
      const detail = err?.response || err?.message || String(err);
      throw new Error(`IMAP sync failed on ${imapHost} (${folder}): ${detail}`);
    } finally {
      try { await client.logout(); } catch {}
    }
  }
}
