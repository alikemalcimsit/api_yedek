import { BaseService } from '../base/base.service.js';
import { getPaginationParams } from '../../utils/pagination.js';

export class ChatListService extends BaseService {
  constructor({ chatListRepository }) {
    super(chatListRepository);
  }

  // İsteğe bağlı ek sorgular buraya yazılabilir

  async getAll(queryParams = {}, req = null) {
    const { page, limit, skip } = getPaginationParams(queryParams);

    const userRole = req?.user?.role ?? 0;
    const userSystemId = req?.user?.userSystemId ?? null;

    const result = await this.repository.findChatList({
      userRole,
      userSystemId,
      limit,
      offset: skip,
    });

    return result;
  }

  // Ek servis metodları buraya eklenebilir
}
