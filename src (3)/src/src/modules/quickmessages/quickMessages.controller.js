import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class QuickMessagesController extends BaseController {
  constructor({ quickMessagesService }) {
    super(quickMessagesService);
  }



  // Ek controller işlemleri burada override edilebilir
}
