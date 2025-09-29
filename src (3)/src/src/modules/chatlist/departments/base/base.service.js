export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

setPrismaClient(prismaClient) {
  this.prisma = prismaClient;

  if (this.repository && typeof this.repository.setPrismaClient === 'function') {
    this.repository.setPrismaClient(prismaClient);
  } else {
    console.warn('⚠️ Repository setPrismaClient yok!');
  }
}


  async getAll(options = {}) {
    return this.repository.findAll(options);
  }

  async getById(id, options = {}) {
    return this.repository.findById(id, options);
  }

  
  async create(data) {
    return this.repository.create(data);
  }

  async update(id, data) {
    return this.repository.update(id, data);
  }

  async delete(id) {
    return this.repository.delete(id);
  }
}
