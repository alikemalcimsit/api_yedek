import crypto from 'node:crypto';
const key = Buffer.from(process.env.MAIL_CRED_KEY, 'hex');

export const enc = (plain='') => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const buf = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return `${iv.toString('base64')}.${buf.toString('base64')}.${tag.toString('base64')}`;
};

export const dec = (payload='') => {
  const [ivB64, dataB64, tagB64] = payload.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString('utf8');
};
