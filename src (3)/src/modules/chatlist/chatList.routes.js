import { Router } from 'express';
import container from './chatList.container.js';
import { authenticateToken, slidingSession } from '../../middleware/index.js';
import { domainMiddleware } from '../../config/middleware/domainMiddleware.js';

const router = Router();
const chatListController = container.resolve('chatListController');

router.get('/info', (req, res) => {
  res.json({
    endpoint: 'chatList',
    description: 'chatList işlemleri',
    routes: [
      { method: 'POST', path: '/', auth: true, sliding: true, description: 'chatList oluşturur' },
      { method: 'GET', path: '/list', auth: true, description: 'chatList listeler ' },
      { method: 'GET', path: '/chat-users-sp', auth: true, description: 'SP ile chat users' },
      { method: 'PATCH', path: '/read', auth: true, description: 'Mesajları okundu/okunmadı yapar' },
      { method: 'POST', path: '/messages-by-chatid', auth: true, description: 'chatId altındaki tüm mesajları getirir' },
    ]
  });
});

router.post('/', domainMiddleware, authenticateToken, slidingSession, chatListController.create);
router.get('/list', domainMiddleware, authenticateToken, slidingSession, chatListController.list);
router.get('/chat-users-sp', domainMiddleware, authenticateToken, slidingSession, chatListController.getChatUsersWithStoredProcedure);
router.patch('/read', domainMiddleware, authenticateToken, slidingSession, chatListController.markMessagesRead);
router.post('/messages-by-chatid', domainMiddleware, authenticateToken, slidingSession, chatListController.getMessagesByChatIdHandler);

export default router;