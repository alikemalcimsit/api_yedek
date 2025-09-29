import { BaseService } from '../base/base.service.js';


const toInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const NUM = (v) => (v === undefined || v === null || v === '' ? undefined : Number(v));

function parseRelativeInput(body = {}) {
  // Esnek giriş:
  // { amount: 5, unit: 'month' } | { month: 5 } | { day: 10 } | { year: 1 } | { ay/gün/yıl: ... }
  const raw = {
    amount: NUM(body.amount),
    unit: (body.unit || body.Unit || '').toString().toLowerCase(),
    day: NUM(body.day ?? body.days ?? body.gun ?? body['gün']),
    month: NUM(body.month ?? body.months ?? body.ay),
    year: NUM(body.year ?? body.years ?? body.yil ?? body['yıl']),
    dryRun: String(body.dryRun ?? body.dryrun ?? 'false').toLowerCase() === 'true'
  };

  let amount;
  let unit;

  if (raw.day) { amount = raw.day; unit = 'day'; }
  if (raw.month) { amount = raw.month; unit = 'month'; }
  if (raw.year) { amount = raw.year; unit = 'year'; }

  if (!amount && raw.amount) amount = raw.amount;
  if (!unit && raw.unit) {
    if (['day', 'days', 'gun', 'gün'].includes(raw.unit)) unit = 'day';
    else if (['month', 'months', 'ay'].includes(raw.unit)) unit = 'month';
    else if (['year', 'years', 'yil', 'yıl'].includes(raw.unit)) unit = 'year';
  }

  if (!amount || !unit) {
    const e = new Error('Geçersiz giriş. Örnek: { "month": 5 } veya { "amount": 5, "unit": "month" } veya { "day": 10 }');
    e.status = 400;
    throw e;
  }
  if (amount <= 0) {
    const e = new Error('amount/day/month/year 0’dan büyük olmalı');
    e.status = 400;
    throw e;
  }
  return { amount, unit, dryRun: raw.dryRun };
}

function subRelativeFromNow(amount, unit) {
  const now = new Date();
  const d = new Date(now);
  switch (unit) {
    case 'day':
      d.setDate(d.getDate() - amount);
      d.setHours(0, 0, 0, 0);
      return d;
    case 'month': {
      const dayOfMonth = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() - amount);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(dayOfMonth, lastDay));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'year': {
      const m = d.getMonth();
      const day = d.getDate();
      d.setFullYear(d.getFullYear() - amount);
      if (m === 1 && day === 29 && d.getMonth() !== 1) d.setDate(28); // 29 Şubat düzeltmesi
      d.setHours(0, 0, 0, 0);
      return d;
    }
    default:
      throw new Error('Desteklenmeyen birim: ' + unit);
  }
}




export class CrmLogService extends BaseService {
  constructor({ crmLogRepository }) {
    super(crmLogRepository);
  }

  buildWhere(query = {}) {
    const {
      q,
      domain,                 // => host
      method,                 // GET/POST...
      minStatus, maxStatus,   // -> http_status
      statusCode,             // -> http_status
      path,                   // path equals
      pathContains,           // path içinde
      ip,                     // ip_adress (varsa)
      userSystemId,           // -> usersystemid
      from, to,               // -> created_at
      success                 // (kolon yoksa kullanma)
    } = query;

    const where = {};

    // host/domain
    if (domain) where.host = { contains: domain, mode: 'insensitive' };

    // method: action "GET /x" gibi başlıyorsa
    // Not: path ve method aynı anda gelirse AND yapmak istersen:
    // where.AND = [{ action: { startsWith: method + ' ' } }, { action: { contains: ' ' + path } }]
    if (method) where.action = { startsWith: String(method).toUpperCase() + ' ' };

    // path: action'ın ikinci kısmı
    if (path) where.action = { contains: ' ' + path, mode: 'insensitive' };
    if (pathContains) where.action = { contains: pathContains, mode: 'insensitive' };

    // status
    if (statusCode) where.httpStatus = Number(statusCode);
    if (minStatus || maxStatus) {
      where.httpStatus = {
        ...(minStatus ? { gte: Number(minStatus) } : {}),
        ...(maxStatus ? { lte: Number(maxStatus) } : {}),
      };
    }

    // ip (varsa)
    if (ip) where.ip_adress = { equals: ip };

    // userSystemId
    if (userSystemId !== undefined && userSystemId !== null && userSystemId !== '') {
      where.userSystemId = Number(userSystemId);
    }

    // tarih
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // full text (action/details/error/request/response)
    if (q) {
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { details: { contains: q, mode: 'insensitive' } },
        { errorMessage: { contains: q, mode: 'insensitive' } },
        { requestBody: { contains: q, mode: 'insensitive' } },
        { responseBody: { contains: q, mode: 'insensitive' } },
        { header: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  buildOrder(query = {}) {
    const map = (f) => {
      switch (f) {
        case 'statusCode': return 'httpStatus';
        case 'createdAt': return 'createdAt';
        case 'userSystemId': return 'userSystemId';
        case 'durationMs': return 'responseTime';
        case 'method': return 'action'; // ayrı method kolonu yok
        default: return f || 'id';
      }
    };
    const sortBy = map(query.sortBy);
    const sortDir = (query.sortDir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return [{ [sortBy]: sortDir }];
  }

  async list(query = {}) {
    const page = Math.max(toInt(query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(query.limit, 20), 1), 200);
    const skip = (page - 1) * limit;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrder(query);

    const [items, total] = await Promise.all([
      this.repository.search(where, { skip, take: limit }, orderBy),
      this.repository.count(where)
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async detail(id) {
    return this.repository.findById(id);
  }
  async domains(query = {}) {
    const where = this.buildWhere(query);

    // host tam eşitlik istiyorsan:
    if (query.host) {
      where.host = { equals: query.host };
    }
    // sadece domain parametresi geldiyse contains uygula (buildWhere zaten yapıyordu;
    // ama burada açıkça override etmek istersen kullan)
    else if (query.domain) {
      where.host = { contains: query.domain, mode: 'insensitive' };
    }

    // ÖZET (domain aggregate) sayfalama/sıralama
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 200);
    const orderBy = query.orderBy || 'total';           // 'total' | 'host'
    const order = (query.order || 'desc');            // 'asc' | 'desc'

    const summary = await this.repository.domainsAggregate(where, {
      page, limit, orderBy, order
    });

    // LOG LİSTESİ (opsiyonel)
    const includeLogs = String(query.includeLogs || '').toLowerCase() === 'true';
    let logs;

    if (includeLogs) {
      const logsPage = Math.max(parseInt(query.logsPage) || 1, 1);
      const logsLimit = Math.min(Math.max(parseInt(query.logsLimit) || 20, 1), 200);
      const skip = (logsPage - 1) * logsLimit;

      const logsSortBy = query.logsSortBy || 'createdAt'; // buildOrder map: createdAt -> created_at
      const logsSortDir = query.logsSortDir || 'desc';

      const [items, total] = await Promise.all([
        this.repository.search(
          where,
          { skip, take: logsLimit },
          this.buildOrder({ sortBy: logsSortBy, sortDir: logsSortDir })
        ),
        this.repository.count(where),
      ]);

      logs = {
        items,
        meta: {
          page: logsPage,
          limit: logsLimit,
          total,
          pages: Math.ceil(total / logsLimit),
        }
      };
    }

    return { items: summary.items, meta: summary.meta, logs };
  }


  async stats(query = {}) {
    const where = this.buildWhere(query);
    return this.repository.stats(where);
  }

  async timeseries(query = {}) {
    const granularity = (query.granularity || 'day').toLowerCase(); // 'day' | 'hour'
    const where = this.buildWhere(query);
    // where.$raw gibi jsonb kaçıran alan EKLEME!
    return this.repository.timeSeries(where, granularity);
  }

  async remove(id) {
    return this.repository.deleteById(id);
  }

  async bulkDelete(query = {}) {
    const where = this.buildWhere(query);
    return this.repository.bulkDelete(where);
  }

  // ---- yeni: relative purge ----
  async purgeOlderRelative(body = {}) {
    const { amount, unit, dryRun } = parseRelativeInput(body);
    const cutoff = subRelativeFromNow(amount, unit); // cutoff’tan eski olanlar silinecek

    const where = { createdAt: { lt: cutoff } };

    const total = await this.repository.count(where);

    if (dryRun) {
      return { dryRun: true, deletedCount: total, cutoff, unit, amount };
    }

    const result = await this.repository.bulkDelete(where);
    const deletedCount = typeof result === 'number' ? result : (result?.count ?? 0);

    return { dryRun: false, deletedCount, cutoff, unit, amount };
  }
}