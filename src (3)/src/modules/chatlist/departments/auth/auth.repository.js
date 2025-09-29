import { BaseRepository } from '../base/base.repository.js';

export class AuthRepository extends BaseRepository {
    constructor() {
        super();  // boş geç, super'e prisma verme
        this._modelName = 'userSystem';
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


    async findByUsername(username) {
        return this.model.findFirst({ where: { username } });
    }

    async updatePasswordById(id, hashedPassword) {
        return this.model.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
}
