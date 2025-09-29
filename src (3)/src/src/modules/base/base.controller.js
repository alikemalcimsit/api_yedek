import { asyncHandler } from "../../middleware/index.js";

export class BaseController {
  constructor(service) {
    console.log('🏗️ BaseController constructor çağrıldı');
    console.log('🏗️ service:', !!service);
    this.service = service;
  }

  get model() {
    if (!this._modelName || !this.prisma) return null;
    if (!this.prisma[this._modelName]) {
      console.error('⚠️ Prisma client içinde model yok:', this._modelName);
      return null;
    }
    return this.prisma[this._modelName];
  }

  withDynamicClient = (handler) => {
    return async (req, res, next) => {
      try {
        console.log('🔧 withDynamicClient çağrıldı (tek veritabanı modunda artık gereksiz)');
        
        // Artık multi-tenant olmadığı için req.dbClient kontrolü yapmıyoruz
        // Tüm service'ler zaten tek prisma client kullanıyor
        
        console.log('🔧 Handler çağrılıyor...');
        return await handler(req, res, next);
      } catch (error) {
        console.error('❌ withDynamicClient hatası:', error);
        console.error('❌ Error stack:', error.stack);
        next(error);
      }
    };
  };

  list = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      console.log('🔍 BaseController list çağrıldı');
      const items = await this.service.getAll(req.query, req);
      res.json({ success: true, data: items });
    })
  );

  detail = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      console.log('🔍 BaseController detail çağrıldı');
      const id = Number(req.params.id);
      const item = await this.service.getById(id);
      res.json({ success: true, data: item });
    })
  );

  create = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      console.log('🔍 BaseController create çağrıldı');
      const item = await this.service.create(req.body);
      res.status(201).json({ success: true, data: item });
    })
  );

update = this.withDynamicClient(
  asyncHandler(async (req, res) => {
    console.log('🔍 BaseController update çağrıldı');
    const id = Number(req.params.id);
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Güncelleme verisi eksik');
    }

    const result = await this.service.update(id, data);
    res.json({ success: true, data: result });
  })
);

  delete = this.withDynamicClient(
    asyncHandler(async (req, res) => {
      console.log('🔍 BaseController delete çağrıldı');
      const id = Number(req.params.id);
      await this.service.delete(id);
      res.json({ success: true, message: 'Deleted' });
    })
  );
}