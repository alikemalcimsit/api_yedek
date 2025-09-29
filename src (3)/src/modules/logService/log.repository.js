import { prisma } from '../../utils/prisma.js';
import { BaseRepository } from '../base/base.repository.js';
export class CrmLogRepository extends BaseRepository {
  constructor() {
    super(prisma);           // merkezi log DB
    this._modelName = 'crmlogs';
    this.setPrismaClient(prisma);
  }

  async findById(id) {
    return this.model.findUnique({ where: { id: Number(id) } });
  }

  async search(where, { skip = 0, take = 20 }, orderBy) {
    return this.model.findMany({ where, skip, take, orderBy });
  }

  async count(where) {
    return this.model.count({ where });
  }


  async domainsAggregate(where = {}, { page = 1, limit = 50, orderBy = 'total', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;
    const conds = ['1=1'];
    const params = [];
    let i = 1;

    // createdAt aralığı
    if (where?.createdAt?.gte) { conds.push(`"createdAt" >= $${i++}`); params.push(where.createdAt.gte); }
    if (where?.createdAt?.lte) { conds.push(`"createdAt" <= $${i++}`); params.push(where.createdAt.lte); }

    // http_status tek/range
    if (typeof where?.http_status === 'number') {
      conds.push(`"http_status" = $${i++}`); params.push(where.http_status);
    } else if (where?.httpStatus && typeof where.httpStatus === 'object') {
      if (where.httpStatus.gte !== undefined) { conds.push(`"httpStatus" >= $${i++}`); params.push(where.httpStatus.gte); }
      if (where.httpStatus.lte !== undefined) { conds.push(`"httpStatus" <= $${i++}`); params.push(where.httpStatus.lte); }
    }

    // userSystemId
    if (typeof where?.userSystemId === 'number') {
      conds.push(`"userSystemId" = $${i++}`); params.push(where.userSystemId);
    }

    // host contains
    if (where?.host?.contains && typeof where.host.contains === 'string') {
      conds.push(`"host" ILIKE $${i++}`); params.push(`%${where.host.contains}%`);
    }

    // action filtreleri (method/path)
    if (where?.action?.startsWith && typeof where.action.startsWith === 'string') {
      conds.push(`"action" ILIKE $${i++}`); params.push(`${where.action.startsWith}%`);
    }
    if (where?.action?.contains && typeof where.action.contains === 'string') {
      conds.push(`"action" ILIKE $${i++}`); params.push(`%${where.action.contains}%`);
    }

    const whereSQL = conds.join(' AND ');
    const sortCol = orderBy === 'host' ? 'host' : 'total';
    const sortDir = (String(order).toLowerCase() === 'asc') ? 'ASC' : 'DESC';

    const sql = `
      SELECT
        host,
        COUNT(*)::int AS total,
        MAX(createdAt) AS lastAt,
        SUM(CASE WHEN httpStatus BETWEEN 200 AND 299 THEN 1 ELSE 0 END)::int AS _2xx,
        SUM(CASE WHEN httpStatus BETWEEN 300 AND 399 THEN 1 ELSE 0 END)::int AS _3xx,
        SUM(CASE WHEN httpStatus BETWEEN 400 AND 499 THEN 1 ELSE 0 END)::int AS _4xx,
        SUM(CASE WHEN httpStatus >= 500 THEN 1 ELSE 0 END)::int AS _5xx
      FROM "crmlogs"
      WHERE ${whereSQL}
      GROUP BY host
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${i++} OFFSET $${i++}
    `;

    const rows = await this.prisma.$queryRawUnsafe(sql, ...params, Number(limit), Number(offset));

    // toplam domain sayısı (sayfalama)
    const countSql = `
      SELECT COUNT(*)::int AS cnt FROM (
        SELECT 1 FROM "crmlogs" WHERE ${whereSQL} GROUP BY host
      ) t
    `;
    const cnt = await this.prisma.$queryRawUnsafe(countSql, ...params);
    const total = cnt?.[0]?.cnt ?? 0;

    return {
      items: rows,
      meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    };
  }


  async distinctDomains() {
    return this.model.findMany({
      distinct: ['host'],
      select: { host: true },
      orderBy: { host: 'asc' }
    });
  }

async stats(where) {
  // 1) HTTP status kırılımı (doğrudan kolon)
  const byStatus = await this.model.groupBy({
    by: ['httpStatus'],
    where,
    _count: { _all: true },
    orderBy: { httpStatus: 'asc' }
  });

  // 2) Method kırılımı: action -> ilk kelime
  const grpAction = await this.model.groupBy({
    by: ['action'],
    where,
    _count: { _all: true }
  });
  const methodMap = new Map();
  for (const row of grpAction) {
    const method = String(row.action || '').split(' ')[0]?.toUpperCase() || 'UNKNOWN';
    methodMap.set(method, (methodMap.get(method) || 0) + (row._count?._all || 0));
  }
  const byMethod = [...methodMap.entries()]
    .map(([method, count]) => ({ method, _count: { _all: count } }))
    .sort((a, b) => a.method.localeCompare(b.method));

  // 3) Top paths: action -> ikinci kısım
  const pathMap = new Map();
  for (const row of grpAction) {
    const parts = String(row.action || '').split(' ');
    const path = parts.slice(1).join(' ') || '/';
    pathMap.set(path, (pathMap.get(path) || 0) + (row._count?._all || 0));
  }
  const topPaths = [...pathMap.entries()]
    .map(([path, count]) => ({ path, _count: { _all: count } }))
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);

  return { byStatus, byMethod, topPaths };
}


 // src/modules/crmlog/crmLog.repository.js


async timeSeries(where = {}, granularity = 'day') {
  // Bucket ifadesi (TR saati). created_at: TIMESTAMP WITHOUT TIME ZONE
  const bucketExpr =
    granularity === 'hour'
      ? `date_trunc('hour', ("createdAt" AT TIME ZONE 'Europe/Istanbul'))`
      : `date_trunc('day',  ("createdAt" AT TIME ZONE 'Europe/Istanbul'))`;

  const conds = ['1=1'];
  const params = [];
  let i = 1;

  // ---- SADECE PRİMİTİFLERİ EKLE ----
  // createdAt aralığı
  if (where?.createdAt?.gte) { conds.push(`"createdAt" >= $${i++}`); params.push(where.createdAt.gte); }
  if (where?.createdAt?.lte) { conds.push(`"createdAt" <= $${i++}`); params.push(where.createdAt.lte); }

  // httpStatus tek/aray
  if (typeof where?.httpStatus === 'number') {
    conds.push(`"httpStatus" = $${i++}`); params.push(where.httpStatus);
  } else if (where?.httpStatus && typeof where.httpStatus === 'object') {
    if (where.httpStatus.gte !== undefined) { conds.push(`"httpStatus" >= $${i++}`); params.push(where.httpStatus.gte); }
    if (where.httpStatus.lte !== undefined) { conds.push(`"httpStatus" <= $${i++}`); params.push(where.httpStatus.lte); }
  }

  // userSystemId
  if (typeof where?.userSystemId === 'number') {
    conds.push(`"userSystemId" = $${i++}`); params.push(where.userSystemId);
  }

  // host contains
  if (where?.host?.contains && typeof where.host.contains === 'string') {
    conds.push(`"host" ILIKE $${i++}`); params.push(`%${where.host.contains}%`);
  }

  // action startsWith / contains
  if (where?.action?.startsWith && typeof where.action.startsWith === 'string') {
    conds.push(`"action" ILIKE $${i++}`); params.push(`${where.action.startsWith}%`);
  }
  if (where?.action?.contains && typeof where.action.contains === 'string') {
    conds.push(`"action" ILIKE $${i++}`); params.push(`%${where.action.contains}%`);
  }

  const whereSQL = conds.join(' AND ');

  const sql = `
    SELECT ${bucketExpr} AS bucket, COUNT(*)::int AS count
    FROM "crmlogs"
    WHERE ${whereSQL}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

  // Dikkat: burada bilerek $queryRawUnsafe kullanıyoruz ama SADECE primitif paramlar var.
  return this.prisma.$queryRawUnsafe(sql, ...params);
}

  async deleteById(id) {
    return this.model.delete({ where: { id: Number(id) } });
  }

  async bulkDelete(where) {
    return this.model.deleteMany({ where });
  }
}
