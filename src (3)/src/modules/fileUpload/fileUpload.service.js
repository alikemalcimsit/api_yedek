import { BaseService } from "../base/base.service.js";

export class FileUploadService extends BaseService {
    constructor({ fileUploadRepository }) {
        super(fileUploadRepository); // fileUploadRepository burada doğru set edilmeli
    }

    async saveFileRecord({ fileName, fileUrl, mimeType, size, folder }, prisma) {
        await this.repository.create({
            data: {
                fileName,
                fileUrl,
                mimeType,
                size,
                folder,
            },
        }, prisma);
    }
}