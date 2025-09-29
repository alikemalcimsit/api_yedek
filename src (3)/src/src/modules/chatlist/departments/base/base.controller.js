
import { asyncHandler } from "../../middleware/index.js";


// base.controller.js
export class BaseController {
  constructor(service) {
    this.service = service;
  }


 withDynamicClient = (handler) => {
  return async (req, res, next) => {
    try {

      console.log('⚙️ withDynamicClient: service var mı?', !!this.service);
      console.log('⚙️ withDynamicClient: setPrismaClient var mı?', typeof this.service.setPrismaClient);

      // Artık tek prisma client kullanıyoruz, req.dbClient kontrolü gereksiz
      console.log('🌐 Tek veritabanı modunda çalışıyor');

      return await handler(req, res, next);
    } catch (error) {
      console.error('❌ withDynamicClient hatası:', error);
      next(error);
    }
  };
};

 list = this.withDynamicClient(
  asyncHandler(async (req, res) => {
    const items = await this.service.getAll();
    res.json({ success: true, data: items });
  })
);


  detail =this.withDynamicClient( asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const item = await this.service.getById(id);
    res.json({ success: true, data: item });
  })
  )
  create =this.withDynamicClient( asyncHandler(async (req, res) => {
    const item = await this.service.create(req.body);
    res.status(201).json({ success: true, data: item });
  }))

  update = this.withDynamicClient( asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await this.service.update(id, req.body);
    res.json({ success: true, data: updated });
  }))

  delete = this.withDynamicClient( asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await this.service.delete(id);
    res.json({ success: true, message: 'Deleted' });
  }))
}
