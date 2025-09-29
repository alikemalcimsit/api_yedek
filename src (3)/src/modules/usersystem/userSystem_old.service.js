import { prisma } from '../../utils/index.js';
import bcrypt from 'bcryptjs';
import { BaseService } from '../base/base.service.js';
import { getPaginationParams, getPaginationMeta } from '../../utils/pagination.js';

export class UserSystemService extends BaseService {
    constructor({ userSystemRepository }) {
        super(userSystemRepository);
    }

    /**
     * Tüm admin'leri getirir (Sayfalama ile)
     * @param {Object} options - Sayfalama seçenekleri
     * @param {number} options.page - Sayfa numarası (varsayılan: 1)
     * @param {number} options.limit - Sayfa başına kayıt (varsayılan: 20, max: 100)
     * @param {Object} options.filters - Filtreleme seçenekleri
     * @returns {Promise<Object>} Admin listesi ve meta bilgiler
     */

    //paginationlı hale getirdik
async getAllUserSystem(queryParams = {}, req = null) {
  try {
    // Artık tek prisma client kullanıyoruz
    console.log('🌐 Tek veritabanı kullanılıyor');

    // Parametreleri al (undefined olma durumlarına karşı varsayılan değer ver)
    const {
      page = 1,
      limit = 100,
      role,
      username,
      name,
      sortBy = 'id',
      sortOrder = 'desc'
    } = queryParams;

    // Sayfalama güvenliği
    const safeLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const safePage = Math.max(1, parseInt(page));
    const skip = (safePage - 1) * safeLimit;

    // Filtreleme koşulları
    const whereClause = {};
    if (role !== undefined) whereClause.role = parseInt(role);
    if (username) whereClause.username = { contains: username };
    if (name) whereClause.name = { contains: name };

    // Toplam kayıt sayısı
    const totalCount = await prismaClient.userSystem.count({ where: whereClause });

    // Kullanıcıları çek
    const users = await prismaClient.userSystem.findMany({
      where: whereClause,
      select: {
        id: true,
        userSystemId: true,
        channelId: true,
        phoneNumber: true,
        name: true,
        username: true,
        role: true,
        ip_adress: true
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: safeLimit
    });

    // Sonuç döndür
    return {
      users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / safeLimit)
      }
    };
  } catch (error) {
    console.error('UserSystemService - getAllUserSystem hatası:', error);
    throw error;
  }
}

    /**
     * ID'si verilen admin'i getirir
     * @param {number} userId - Admin ID
     * @returns {Promise<Object>} Admin detayları
     */
    async getUserSystemById(userId) {
        try {
            const user = await this.prisma.userSystem.findUnique({
                where: { id: parseInt(userId) },
                select: {
                    id: true,
                    userSystemId: true,
                    channelId: true,
                    phoneNumber: true,
                    name: true,
                    username: true,
                    role: true,
                    ip_adress: true
                }
            });

            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            return user;
        } catch (error) {
            console.error('UserSystemService - getUserSystemById hatası:', error);
            throw error;
        }
    }


    async createUserSystem(userData, req = null) {
        try {
            // Tek prisma client kullanıyoruz
            console.log('🌐 Tek veritabanı kullanılıyor');
            
            // Domain veritabanı için userSystem tablosu
            const dataToCreate = {
                userSystemId: userData.userSystemId,
                channelId: userData.channelId,
                phoneNumber: userData.phoneNumber,
                name: userData.name,
                username: userData.username,
                role: userData.role,
                ip_adress: userData.ip_adress
            };

            // Şifre varsa hashle
                if (typeof userData.password === 'string' && userData.password.trim()) {
                    const saltRounds = 10;
                    dataToCreate.password = await bcrypt.hash(userData.password, saltRounds);
                }

                console.log('📦 Oluşturulacak veri:', dataToCreate);

                const newUser = await prismaClient.userSystem.create({
                    data: dataToCreate,
                    select: {
                        id: true,
                        userSystemId: true,
                        channelId: true,
                        phoneNumber: true,
                        name: true,
                        username: true,
                        role: true,
                        ip_adress: true
                    }
                });

                return newUser;
            } else {
                console.log('🔍 CRM veritabanı için userSystem tablosu kullanılıyor');
                
                // CRM veritabanı için userSystem tablosu
                const dataToCreate = {
                    userSystemId: userData.userSystemId,
                    channelId: userData.channelId,
                    phoneNumber: userData.phoneNumber,
                    name: userData.name,
                    username: userData.username,
                    role: userData.role,
                    ip_adress: userData.ip_adress
                };

                // Şifre varsa hashle
                if (typeof userData.password === 'string' && userData.password.trim()) {
                    const saltRounds = 10;
                    dataToCreate.password = await bcrypt.hash(userData.password, saltRounds);
                }

                const newUser = await prismaClient.userSystem.create({
                    data: dataToCreate,
                    select: {
                        id: true,
                        userSystemId: true,
                        channelId: true,
                        phoneNumber: true,
                        name: true,
                        username: true,
                        role: true,
                        ip_adress: true
                    }
                });

                return newUser;
            }
        } catch (error) {
            console.error('UserSystemService - createUserSystem hatası:', error);
            console.error('🔍 Hata detayları:', {
                error: error.message,
                stack: error.stack,
                req: req ? {
                    hasDbClient: !!req.dbClient,
                    dbConfig: req.dbConfig
                } : 'req yok'
            });
            throw new Error(`Kullanıcı oluşturulurken hata oluştu: ${error.message}`);
        }
    }



    async update(id, data) {
        console.log('🛠️ UserSystemService.update override çalıştı:', id, data);
        return await this.updateUserSystem(id, data);
    }

    async updateUserSystem(userId, updateData, req = null) {
        console.log('📦 Gelen updateData:', updateData);

        try {
            // Domain'den gelen veritabanı client'ını kullan
            let prismaClient = prisma;
            let isDomainDb = false;
            
            if (req && req.dbClient) {
                console.log('🌐 Domain veritabanı kullanılıyor:', req.dbConfig?.dbName);
                prismaClient = req.dbClient;
                isDomainDb = true;
            } else {
                console.log('⚠️ Domain veritabanı bulunamadı, varsayılan CRM veritabanı kullanılıyor');
            }

            if (isDomainDb) {
                // Domain veritabanı için userSystem tablosu
                const existingUser = await prismaClient.userSystem.findUnique({
                    where: { id: userId }
                });

                if (!existingUser) {
                    throw new Error('Kullanıcı bulunamadı');
                }

                // Şifre özel kontrol: varsa hashle, boşsa eski şifre kalsın
                if ('password' in updateData) {
                    if (typeof updateData.password === 'string' && updateData.password.trim()) {
                        const saltRounds = 10;
                        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
                    } else {
                        // Şifre boşsa mevcut şifreyi koru
                        delete updateData.password;
                    }
                }

                if (Object.keys(updateData).length === 0) {
                    throw new Error('Güncellenecek geçerli veri yok');
                }

                const updatedUser = await prismaClient.userSystem.update({
                    where: { id: userId },
                    data: updateData,
                    select: {
                        id: true,
                        userSystemId: true,
                        channelId: true,
                        phoneNumber: true,
                        name: true,
                        username: true,
                        role: true,
                        ip_adress: true
                    }
                });

                return updatedUser;
            } else {
                // CRM veritabanı için userSystem tablosu
                const existingUser = await prismaClient.userSystem.findUnique({
                    where: { id: userId }
                });

                if (!existingUser) {
                    throw new Error('Kullanıcı bulunamadı');
                }

                // Şifre özel kontrol: varsa hashle, boşsa eski şifre kalsın
                if ('password' in updateData) {
                    if (typeof updateData.password === 'string' && updateData.password.trim()) {
                        const saltRounds = 10;
                        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
                    } else {
                        // Şifre boşsa mevcut şifreyi koru
                        delete updateData.password;
                    }
                }

                if (Object.keys(updateData).length === 0) {
                    throw new Error('Güncellenecek geçerli veri yok');
                }

                const updatedUser = await prismaClient.userSystem.update({
                    where: { id: userId },
                    data: updateData,
                    select: {
                        id: true,
                        userSystemId: true,
                        channelId: true,
                        phoneNumber: true,
                        name: true,
                        username: true,
                        role: true,
                        ip_adress: true
                    }
                });

                return updatedUser;
            }
        } catch (error) {
            console.error('UserSystemService - updateUserSystem hatası:', error);
            throw new Error(`Kullanıcı güncellenirken hata oluştu: ${error.message}`);
        }
    }



    async deleteUserSystem(userId, req = null) {
        try {
            // Domain'den gelen veritabanı client'ını kullan
            let prismaClient = prisma;
            let isDomainDb = false;
            
            if (req && req.dbClient) {
                console.log('🌐 Domain veritabanı kullanılıyor:', req.dbConfig?.dbName);
                prismaClient = req.dbClient;
                isDomainDb = true;
            } else {
                console.log('⚠️ Domain veritabanı bulunamadı, varsayılan CRM veritabanı kullanılıyor');
            }

            if (isDomainDb) {
                await prismaClient.userSystem.delete({
                    where: { id: userId }
                });
            } else{
                throw new Error('Domain veritabanı zorunlu!');
            }

            return { message: 'Kullanıcı başarıyla silindi' };
        } catch (error) {
            console.error('UserSystemService - deleteUserSystem hatası:', error);
            throw new Error(`Kullanıcı silinirken hata oluştu: ${error.message}`);
        }
    }

    /**
     * Kullanıcı login doğrulaması yapar
     * @param {string} username - Kullanıcı adı
     * @param {string} password - Şifre
     * @returns {Promise<Object>} Doğrulanan kullanıcının bilgileri
     */
    async authenticateUser(username, password) {

        try {
            if (!username || !password) {
                throw new Error('Kullanıcı adı ve şifre gerekli');
            }

            // Kullanıcıyı bul
            const user = await this.repository.findByUsername(username);


            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new Error('Geçersiz şifre');
            }

            //Şifreyi response'dan çıkar
            const { password: _, sourceId: __, phoneNumber: ___, ...returnUser } = user;

            return returnUser;
        } catch (error) {
            console.error('UserSystemService - authenticateUser hatası:', error);
            throw error;
        }
    };

    /**
     * Kullanıcının şifresini günceller (Development/Test amaçlı)
     * @param {string} username - Kullanıcı adı
     * @param {string} newPassword - Yeni şifre (plain text)
     * @returns {Promise<Object>} Güncellenen kullanıcının bilgileri
     */
    async updateUserPassword(username, newPassword) {
        try {
            if (!username || !newPassword) {
                throw new Error('Kullanıcı adı ve yeni şifre gerekli');
            }

            // Önce kullanıcıyı bul
            const existingUser = await prisma.userSystem.findFirst({
                where: { username: username },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    role: true,
                    userSystemId: true,
                    phoneNumber: true,
                    channelId: true,
                    ip_adress: true
                }
            });

            if (!existingUser) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Şifreyi hash'le
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // ID ile şifreyi güncelle
            await prisma.userSystem.update({
                where: { id: existingUser.id }, // ID kullanarak güncelle
                data: { password: hashedPassword }
            });

            // Güncellenmiş kullanıcı bilgilerini döndür (şifre olmadan)
            return {
                id: existingUser.id,
                userSystemId: existingUser.userSystemId,
                username: existingUser.username,
                name: existingUser.name,
                role: existingUser.role,
                phoneNumber: existingUser.phoneNumber,
                channelId: existingUser.channelId,
                ip_adress: existingUser.ip_adress,
                passwordUpdated: true,
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('UserSystemService - updateUserPassword hatası:', error);
            throw error;
        }
    };

    async getUserSystemProfile(userId, req = null) {
        try {
            // Domain'den gelen veritabanı client'ını kullan
            let prismaClient = prisma;
            let isDomainDb = false;
            
            if (req && req.dbClient) {
                console.log('🌐 Domain veritabanı kullanılıyor:', req.dbConfig?.dbName);
                prismaClient = req.dbClient;
                isDomainDb = true;
            } else {
                console.log('⚠️ Domain veritabanı bulunamadı, varsayılan CRM veritabanı kullanılıyor');
            }

            if (isDomainDb) {
                // Domain veritabanı için userSystem tablosu
                const user = await prismaClient.userSystem.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                        userSystemId: true,
                        phoneNumber: true,
                        channelId: true,
                        ip_adress: true
                    }
                });

                if (!user) {
                    throw new Error('Kullanıcı bulunamadı');
                }

                return user;
            } else {
                // CRM veritabanı için userSystem tablosu
                const user = await prismaClient.userSystem.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                        userSystemId: true,
                        phoneNumber: true,
                        channelId: true,
                        ip_adress: true
                    }
                });

                if (!user) {
                    throw new Error('Kullanıcı bulunamadı');
                }

                return user;
            }
        } catch (error) {
            console.error('UserSystemService - getUserSystemProfile hatası:', error);
            throw error;
        }
    };


}