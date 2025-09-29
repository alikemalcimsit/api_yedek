import { prisma } from '../../utils/prisma.js';

export class BaseRepository {
  constructor() {
    // Artık tek prisma client kullanıyoruz
    this.prisma = prisma;
    this._modelName = null;
    console.log('🔧 BaseRepository: Tek veritabanı modunda initialized');
  }

  // Bu method artık gereksiz ama geriye dönük uyumluluk için tutuyoruz
  setPrismaClient(prismaClient) {
    console.log('🔧 BaseRepository setPrismaClient çağrıldı (tek veritabanı modunda bu gereksiz)');
    // Artık her zaman aynı prisma client kullanıyoruz
    this.prisma = prisma;
  }

  get model() {
    if (!this._modelName) {
      console.log('❌ BaseRepository: _modelName tanımlı değil!');
      return null;
    }
    
    if (!this.prisma[this._modelName]) {
      console.error('❌ BaseRepository: Model bulunamadı:', this._modelName);
      console.error('❌ Mevcut modeller:', Object.keys(this.prisma).filter(key => 
        typeof this.prisma[key] === 'object' && 
        this.prisma[key] !== null && 
        !key.startsWith('_') && 
        !key.startsWith('$')
      ));
      return null;
    }
    
    return this.prisma[this._modelName];
  }

  async findAll(options) {
    console.log('🔍 BaseRepository findAll çağrıldı');
    return this.model.findMany(options);
  }

  async findById(id, options = {}) {
    console.log('🔍 BaseRepository findById çağrıldı, id:', id);
    return this.model.findUnique({ where: { id }, ...options });
  }

  async create(data) {
    console.log('🔍 BaseRepository create çağrıldı');
    return this.model.create({ data });
  }

  async update(id, data) {
    console.log('🔍 BaseRepository update çağrıldı, id:', id);
    if (!data || Object.keys(data).length === 0) {
        throw new Error('Güncelleme verisi eksik');
    }
    return this.model.update({ where: { id }, data });
  }

  async delete(id) {
    console.log('🔍 BaseRepository delete çağrıldı, id:', id);
    return this.model.delete({ where: { id } });
  }
}