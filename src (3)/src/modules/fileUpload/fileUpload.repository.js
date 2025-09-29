import { BaseRepository } from "../base/base.repository.js";

export class FileUploadRepository extends BaseRepository {

constructor() {
    super();
    this._modelName = 'fileuploads';
  }

async create({ data }, prisma) {
    return prisma.fileUpload.create({ data });
}

}