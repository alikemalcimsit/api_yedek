import { Router } from 'express';

const router = Router();




const processMessage = (io, data) => {
    const { fromId, role, adminId, message, domain } = data;

    console.log(`🔍 **** Debug - Received message from ${fromId} (Role: ${role}) on domain ${domain}`);

    if (fromId == null) {
        throw new Error(`Invalid sender ID: ${fromId}`);
    }
    // Message validation ve type kontrolü
    if (!message) {
        throw new Error('Message is required');
    }

    const messageData = {
        id: Date.now() + Math.random(), // Unique message ID
        data,
        timestamp: (() => {
  const now = new Date();
  const offsetMs = 3 * 60 * 60 * 1000;
  const turkishTime = new Date(now.getTime() + offsetMs);
  return turkishTime.toISOString().replace("Z", "+03:00");
})()

    };

    // Tüm mesajları süper admin görmeli
    io.to(`${domain}_superadmin`).emit('newMessage', messageData);

    if (role === 1) {
        io.to(`${domain}_user_${fromId}`).emit('newMessage', messageData);
    }
    if (role === 0) {
        io.to(`${domain}_user_${fromId}`).emit('newMessage', messageData);
        // Agente gelen her mesajı ilgili admine de gönder
        io.to(`${domain}_user_${adminId}`).emit('newMessage', messageData);
    }

    const result = `Message from superadmin, ${domain}_user_${fromId} ${role === 0 ? 'and user_' + adminId : ''} sent successfully`;

    console.log(result);

    return {
        messageId: messageData.id,
        timestamp: messageData.timestamp,
        result,
        domain
    };
};

// PHP'den gelen emit isteklerini handle et
router.post('/send-message', (req, res) => {
    try {
        const { data } = req.body;


        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data parameter is required'
            });
        }

        const io = req.app.get('socketio');

        if (!io) {
            console.log('Socket.IO instance not found in app');
            return res.status(500).json({
                success: false,
                error: 'Socket.IO instance not available',
                debug: {
                    appExists: !!req.app,
                    appGetType: typeof req.app.get
                }
            });
        }

        console.log('✅ Socket.IO instance found, emitting message...');
        console.log(`Emitting event: sendMessage`, data);

        // mesaj işleme fonksiyonunu 
        const result = processMessage(io, data);

        res.json({
            success: true,
            message: `Event sendMessage emitted successfully`,
            ...result
        });
    } catch (error) {
        console.error('Emit error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});
// connectionHandler'da da kullanılabilmek için export ediyoruz
export { processMessage };
export default router; 