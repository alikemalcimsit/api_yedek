import { BaseController } from '../base/base.controller.js';
import { asyncHandler } from '../../middleware/index.js';

export class CrmLogController extends BaseController {
  constructor({ crmLogService }) {
    super(crmLogService);
  }

  // GET /crmlogs
  list = asyncHandler(async (req, res) => {
    const data = await this.service.list(req.query);
    res.json({ success: true, ...data });
  });

  // GET /crmlogs/:id
  detail = asyncHandler(async (req, res) => {
    const item = await this.service.detail(Number(req.params.id));
    res.json({ success: true, data: item });
  });

  // GET /crmlogs/domains
// GET /crmlogs/domains
domains = asyncHandler(async (req, res) => {
  const data = await this.service.domains(req.query);

  // Yeni: yalnızca log detaylarını döndürmek için
  // ?flattenLogs=true  veya  ?only=logs
  const wantsOnlyLogs =
    String(req.query.flattenLogs || '').toLowerCase() === 'true' ||
    String(req.query.only || '').toLowerCase() === 'logs';

  if (wantsOnlyLogs) {
    const items = data?.logs?.items ?? [];
    const meta  = data?.logs?.meta  ?? { page: 1, limit: 0, total: 0, pages: 0 };
    return res.json({ success: true, items, meta });
  }

  // Eski davranış (özet + opsiyonel logs)
  res.json({ success: true, ...data });
});

  // GET /crmlogs/stats
  stats = asyncHandler(async (req, res) => {
    const data = await this.service.stats(req.query);
    res.json({ success: true, data });
  });

  // GET /crmlogs/timeseries
  timeseries = asyncHandler(async (req, res) => {
    const data = await this.service.timeseries(req.query);
    res.json({ success: true, data });
  });

  // DELETE /crmlogs/:id
  delete = asyncHandler(async (req, res) => {
    const data = await this.service.remove(Number(req.params.id));
    res.json({ success: true, message: 'Deleted', data });
  });

  // DELETE /crmlogs (query ile toplu silme)
  bulkDelete = asyncHandler(async (req, res) => {
    const data = await this.service.bulkDelete(req.query);
    res.json({ success: true, message: 'Bulk deleted', data });
  });

  // GET /crmlogs/export (CSV)
  exportCsv = asyncHandler(async (req, res) => {
    const { items } = await this.service.list({ ...req.query, limit: 2000 }); // limit: 2000
    const rows = Array.isArray(items) ? items : [];
    const header = [
      'id', 'usersystemid', 'action', 'http_status', 'response_time',
      'host', 'details', 'error_message', 'created_at'
    ];
    const csv = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.usersystemid ?? '',
        (r.action || '').replaceAll(',', ' '),
        r.http_status ?? '',
        r.response_time ?? '',
        r.host ?? '',
        (r.details || '').replaceAll(',', ' '),
        (r.error_message || '').replaceAll(',', ' '),
        r.created_at ? new Date(r.created_at).toISOString() : ''
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="crmlogs_${Date.now()}.csv"`);
    res.status(200).send(csv);
  });



    purgeOlderRelative = asyncHandler(async (req, res) => {
    const result = await this.service.purgeOlderRelative(req.body || {});
    res.json({
      success: true,
      message: result.dryRun
        ? `DRY-RUN: ${result.deletedCount} kayıt silinecek (cutoff: ${result.cutoff.toISOString()})`
        : `${result.deletedCount} kayıt silindi (cutoff: ${result.cutoff.toISOString()})`,
      ...result
    });
  });
}
