export class BaseRepository {
  constructor() {
      this.prisma = null; // ya middleware’den gelir, ya patlar
    this._modelName = null;
    }

setPrismaClient(prismaClient) {
  this.prisma = prismaClient;

  if (this.repository && typeof this.repository.setPrismaClient === 'function') {
    this.repository.setPrismaClient(prismaClient);
  } else {
    console.warn(`⚠️ Repository'de setPrismaClient metodu yok!`);
  }
}


  get model() {
        if (!this.prisma) throw new Error('❌ Prisma client tanımlı değil!');
        if (!this._modelName) throw new Error('❌ _modelName tanımlı değil!');
        if (!this.prisma[this._modelName]) {
            console.error('⚠️ Prisma client içinde model yok:', this._modelName);
            throw new Error(`❌ Model yok: ${this._modelName}`);
        }
        return this.prisma[this._modelName];
    }

  async findAll(options) {
    return this.model.findMany(options);
  }


  async findById(id, options = {}) {
    return this.model.findUnique({ where: { id }, ...options });
  }

  async create(data) {
    return this.model.create({ data });
  }

  async update(id, data) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id) {
    return this.model.delete({ where: { id } });
  }
}
