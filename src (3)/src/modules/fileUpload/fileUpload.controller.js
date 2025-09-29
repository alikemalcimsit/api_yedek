import { BaseController } from "../base/base.controller.js";
import { asyncHandler } from "../../middleware/index.js";

export class FileUploadController extends BaseController {
    constructor({fileUploadService}){
        super(fileUploadService);
    }

    upload = asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Dosya yüklenmedi' });
        }
        const folder = req.params.folder || 'general';
        const fileUrl =`/upload/${folder}/${req.file.filename}`
            console.log("------", req.dbClient)
        await this.service.saveFileRecord({
            fileName: req.file.originalname,
            fileUrl,
            mimeType: req.file.mimetype,
            size: req.file.size,
            folder
        },   req.dbClient || prisma   // ✅ fallback
);

        res.json({
            success: true,
            message: 'Dosya yüklendi',
            fileUrl,
        })

    })


}