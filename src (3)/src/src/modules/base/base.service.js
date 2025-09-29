import { getPaginationParams, getPaginationMeta } from '../../utils/pagination.js';

export class BaseService {
  constructor(repository) {
    console.log('🏗️ BaseService constructor çağrıldı');
    console.log('🏗️ Repository:', !!repository);
    this.repository = repository;
  }

  setPrismaClient(prismaClient) {
    console.log('🔧 BaseService setPrismaClient çağrıldı');
    console.log('🔧 Gelen prismaClient:', !!prismaClient);
    console.log('🔧 this.repository:', !!this.repository);
    
    if (this.repository) {
      if (typeof this.repository.setPrismaClient === 'function') {
        this.repository.setPrismaClient(prismaClient);
        console.log('✅ BaseService: Repository setPrismaClient çağrıldı');
      } else {
        console.log('❌ BaseService: Repository setPrismaClient methodu yok!');
        console.log('❌ Repository methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.repository)));
      }
    } else {
      console.warn('⚠️ BaseService: Repository yok!');
    }
  }

  async getAll(queryParams = {}, req = null) {
    const { page, limit, skip } = getPaginationParams(queryParams);
    return this.repository.findAll({ skip, take: limit });
  }

  async getById(id, options = {}) {
    console.log('🔍 BaseService getById çağrıldı, id:', id);
    return this.repository.findById(id, options);
  }

  async create(data) {
    console.log('🔍 BaseService create çağrıldı');
    return this.repository.create(data);
  }

  async update(id, data) {
    console.log('🔍 BaseService update çağrıldı, id:', id);
    if (!data || Object.keys(data).length === 0) {
        throw new Error('Güncelleme verisi eksik');
    }
    return this.repository.update(id, data); // BaseRepository'deki update çağrılıyor
  }

  async delete(id) {
    console.log('🔍 BaseService delete çağrıldı, id:', id);
    return this.repository.delete(id);
  }
}