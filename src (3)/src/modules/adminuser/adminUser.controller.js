// adminUser.controller.js
import { BaseController } from '../base/base.controller.js';

export class AdminUserController extends BaseController {
  constructor({ adminUserService }) {
    super(adminUserService); // ✅ doğru servisi gönder
  }

  // Özel action eklemek istersen buraya ekleyebilirsin
}
