import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../utils/prisma.js'; // Tek prisma client
import bcrypt from 'bcryptjs';
export class AdminMaintenanceService {
  async hashPasswordsForDomain(domain) {
    // 1️⃣ Hospital bilgisi al
    const hospital = await prisma.crm_hospitals.findFirst({
      where: { domain },
    });

    if (!hospital) {
      throw new Error(`Hospital not found for domain: ${domain}`);
    }

    console.log(`🔍 Processing domain: ${hospital.domain}`);

    // Artık tek veritabanı kullanıyoruz, multi-tenant değil
    console.log('🌐 Tek veritabanı modunda çalışıyor');

    // 3️⃣ Kullanıcıları çek (tek veritabanından)
    const users = await prisma.usersystem.findMany();

    // 4️⃣ Backup klasörünü oluştur
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    // 5️⃣ Backup dosyası yolu
    const backupFileName = `${hospital.domain}.json`; // her domain için sabit dosya
    const backupPath = path.join(backupDir, backupFileName);

    // 6️⃣ Önceki backup varsa oku
    let existingData = {
      domain: hospital.domain,
      db_name: hospital.db_name,
      backups: []
    };

    try {
      const fileExists = await fs.access(backupPath).then(() => true).catch(() => false);

      if (fileExists) {
        const content = await fs.readFile(backupPath, 'utf-8');
        existingData = JSON.parse(content);
      }
    } catch (err) {
      console.error('❌ Backup dosyası okunurken hata:', err);
    }

    // 7️⃣ Yeni veriyi ekle
    existingData.backups.push({
      timestamp: new Date().toISOString(),
      users: users.map(user => ({
        ...user,
        originalPassword: user.password
      }))
    });

    // 8️⃣ Backup dosyasını güncelle
    try {
      await fs.writeFile(backupPath, JSON.stringify(existingData, null, 2));
      console.log(`📦 Backup updated at: ${backupPath}`);
    } catch (err) {
      console.error('❌ Backup yazılırken hata:', err);
    }

    // 9️⃣ Şifreleri hashle
    let updatedCount = 0;
    for (const user of users) {
      if (user.password && !user.password.startsWith('$2b$')) {
        const hashed = await bcrypt.hash(user.password, 10);
        await prisma.usersystem.update({
          where: { id: user.id },
          data: { password: hashed },
        });
        updatedCount++;
      }
    }

    console.log(`✅ ${hospital.domain}: ${updatedCount} user password(s) updated`);

    return {
      success: true,
      domain: hospital.domain,
      db: hospital.db_name,
      updatedUsers: updatedCount,
      backupPath: backupPath
    };
  }
}
