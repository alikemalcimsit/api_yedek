import axios from 'axios';
import { prisma } from '../../utils/prisma.js'; // Tek prisma client

export async function sendOtpSms(phoneNumber, otpCode, domain) {
  console.log(domain, 'domain---------------------------------------');

  const hospital = await prisma.crm_hospitals.findFirst({
    where: { domain },
  });

  console.log(hospital);

  if (!hospital) {
    throw new Error(`Hastane bulunamadı: ${domain}`);
  }

 

  const payload = {
    type: 1,
    sendingType: 0,
    title: hospital.sms_title || 'PRATIK SMS',
    content: `CRM giriş için SMS doğrulama kodu: ${otpCode} Bu kodu kimse ile paylaşmayınız.`,
    number: phoneNumber,
    encoding: 0,
    commercial: false,
    sender: hospital.sms_sender || 'PRATIK SMS',
    periodicSettings: null,
    sendingDate: null,
    validity: 60,
    pushSettings: null,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${hospital.sms_kullanici_adi}:${hospital.sms_sifre}`).toString('base64')}`,
  };

const smsApiUrl =  process.env.SMS_API_URL;

if (!smsApiUrl) {
  throw new Error(`Hastane için SMS API URL bulunamadı veya SMS_API_URL tanımlı değil: ${domain}`);
}

  const response = await axios.post(smsApiUrl, payload, { headers });
  return response.data;
}
