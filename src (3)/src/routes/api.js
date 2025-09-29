import { Router } from 'express';
import { analyzeRequestDomain, getEnvironmentFromDomain } from '../utils/index.js';
import { validateId, validateChatMessage } from '../middleware/index.js';
import { getExchangeRates } from '../services/exchange/exchangeRateService.js';

const router = Router();

/**
 * Genel API bilgisi
 */
router.get('/', (req, res) => {
    
    res.json({
        endpoint: 'api',
        description: 'CRM API routes',
        routes: [
            {
                method: 'GET',
                path: '/usersystem',
                auth: true,
                sliding: true,
                description: 'UserSystem bilgilerini getirir'
            },
            {
                method: 'GET',
                path: '/usersystem/profile',
                auth: true,
                sliding: true,
                description: 'UserSystem profil bilgilerini getirir'
            },
            {
                method: 'GET',
                path: '/services',
                auth: true,
                sliding: true,
                description: 'Hizmetleri getirir'
            },
            {
                method: 'GET',
                path: '/leadgen',
                auth: true,
                sliding: true,
                description: 'Leadleri getirir'
            }
        ]
    });
});


// --------------------------------  sonrası socket işleri için. Taşınacak -------------------------------

/**
 * Domain bilgilerini getirir
 */
router.get('/domain-info', (req, res) => {
    const domainInfo = analyzeRequestDomain(req);
    const environment = getEnvironmentFromDomain(domainInfo.cleanDomain);

    res.json({
        ...domainInfo,
        environment
    });
});


/**
 * Socket durumu
 */
router.get('/socket-status', (req, res) => {
    // Socket.IO instance'ına erişim için req.app.get() kullanabiliriz
    const io = req.app.get('socketio');

    res.json({
        socketConnected: io ? io.engine.clientsCount : 0,
        rooms: io ? Object.keys(io.sockets.adapter.rooms) : [],
        timestamp: new Date().toISOString()
    });
});


/**
 * Chat mesajı almak ve socket'e yayınlamak için endpoint
 */
router.post('/chat-message', validateChatMessage, (req, res) => {
    try {
        const { chatData } = req.body;

        if (!chatData) {
            return res.status(400).json({
                success: false,
                message: 'Chat verisi gerekli'
            });
        }

        // Development ortamında detaylı log
        if (process.env.NODE_ENV === 'development') {
            console.log('Gelen Chat Data:', JSON.stringify(chatData, null, 2));
        }

        // Socket.IO instance'ına erişim
        const io = req.app.get('socketio');

        if (io) {
            // adminId kullanarak room'u belirle (gerçek hedef kullanıcı)
            const { adminId } = chatData;
            const userRoomName = `user_system_${adminId}`;

            // Development ortamında detaylı analiz
            if (process.env.NODE_ENV === 'development') {
                console.log('Chat Data Analizi:', {
                    adminId: chatData.adminId,
                    userSystemId: chatData.userSystemId,
                    hedefRoom: userRoomName,
                    messageId: chatData.messageId
                });
            }

            // Sadece ilgili kullanıcının room'una mesajı gönder
            io.to(userRoomName).emit('new-chat-message', {
                messageId: chatData.messageId,
                userSystemId: chatData.adminId,
                userPatientId: chatData.userPatientId,
                authorName: chatData.authorName,
                text: chatData.text,
                chatType: chatData.chatType,
                dateTime: chatData.dateTime,
                status: chatData.status,
                chatId: chatData.chatId,
                channelId: chatData.channelId,
                type: chatData.type,
                timestamp: new Date().toISOString()
            });

            // Development ortamında başarı log'u
            if (process.env.NODE_ENV === 'development') {
                console.log(`Mesaj room'a gönderildi: ${userRoomName}, MessageID: ${chatData.messageId}`);
            }
        }

        res.json({
            success: true,
            message: 'Mesaj başarıyla socket\'e gönderildi',
            messageId: chatData.messageId,
            adminId: chatData.adminId,
            userSystemId: chatData.userSystemId,
            roomName: `user_system_${chatData.adminId}`
        });

    } catch (error) {
        console.error('Chat mesajı gönderilirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

/**
 * Belirli userSystemId için bağlı kullanıcı sayısı
 */
router.get('/connected-users/:userSystemId', validateId, (req, res) => {
    const { userSystemId } = req.params;
    const io = req.app.get('socketio');

    if (!io) {
        return res.json({ connectedCount: 0 });
    }

    const userRoomName = `user_system_${userSystemId}`;
    const room = io.sockets.adapter.rooms.get(userRoomName);
    const connectedCount = room ? room.size : 0;

    res.json({
        userSystemId: parseInt(userSystemId),
        roomName: userRoomName,
        connectedCount: connectedCount,
        timestamp: new Date().toISOString()
    });
});



// routes/exchangeRoutes.js




export default router; 