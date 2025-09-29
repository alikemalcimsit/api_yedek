import { prisma } from '../../utils/index.js';

/**
 * Hastane servislerini getirir
 * @param {string} type - "all", "insurance", "operation", "transfer", "medicine"
 * @returns {Promise<Array>} Servis listesi
 */
const getHospitalServices = async (type, queryParams = {}) => {
    try {
        // Service'te tüm parsing ve validation
        const {
            page = 1,
            limit = 20,
            role,
            username,
            name,
            sortBy = 'id',
            sortOrder = 'desc'
        } = queryParams;

        // Güvenlik ve validation
        const safeLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const safePage = Math.max(1, parseInt(page));
        const skip = (safePage - 1) * safeLimit;

        // Filtreleme koşulları
        const whereClause = {
            status: true,
        };
        if (role !== undefined) whereClause.role = parseInt(role);
        if (username) whereClause.username = { contains: username };
        if (name) whereClause.name = { contains: name };

        // 
        if (type && type !== 'all') {
            whereClause.type = type;
        }

        // Toplam kayıt sayısı
        const totalCount = await prisma.hospital_service_details.count({ where: whereClause });

        // Servisleri getir
        const servicesList = await prisma.hospital_service_details.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                price: true,
                type: true,
                status: true,
                currency: true
            },
            orderBy: { [sortBy]: sortOrder },
            skip: skip,
            take: safeLimit
        });

        console.log(servicesList, 'servicesList');

        // return servicesList;
        return {
            services: servicesList,
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(totalCount / safeLimit),
                totalCount,
                limit: safeLimit,
                hasNextPage: skip + safeLimit < totalCount,
                hasPrevPage: safePage > 1
            }
        };
    } catch (error) {
        console.error('servicesService - getHospitalServices hatası:', error);
        throw new Error(`Servisler getirilirken hata oluştu: ${error.message}`);
    }
}

export {
    getHospitalServices,
}