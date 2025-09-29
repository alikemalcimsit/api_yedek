import { prisma } from '../../utils/index.js';

export class ServicesService {
    constructor({ servicesRepository }) {
        this.servicesRepository = servicesRepository;
    }

    async getHospitalServices(type, queryParams = {}) {
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

        const safeLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const safePage = Math.max(1, parseInt(page));
        const skip = (safePage - 1) * safeLimit;

        const whereClause = {
            status: true,
        };
        if (role !== undefined) whereClause.role = parseInt(role);
        if (username) whereClause.username = { contains: username };
        if (name) whereClause.name = { contains: name };
        if (type && type !== 'all') {
            whereClause.type = type;
        }

        const totalCount = await prisma.hospitalservice.count({ where: whereClause });
        const servicesList = await prisma.hospitalservice.findMany({
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

        return {
            services: servicesList,
            pagination: {
                total: totalCount,
                page: safePage,
                limit: safeLimit
            }
        };
    }
}
