import { Router } from 'express';
import container from './fileUpload.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';

import { uploadSingleFile,uploadErrorHandler,mountUploadStatic } from '../../middleware/upload/fileUploader.middleware.js';

const router = Router();
const fileUploadController = container.resolve('fileUploadController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'fileupload',
    description: 'Dosya yükleme işlemleri',
    routes: [
      { method: 'POST', path: '/:folder', auth: true, sliding: true, description: 'Dosya yükler' },
    ],
  });
});

// POST /api/fileUpload/:folder
router.post(
  '/:folder',
  
  authenticateToken,
  slidingSession,
  uploadSingleFile,
  fileUploadController.upload,
  uploadErrorHandler
);

export default router;
