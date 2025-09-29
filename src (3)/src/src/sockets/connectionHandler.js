// Kullanıcının alt rollerindeki ID'leri getiren fonksiyon
// Gerçek uygulamada bu database'den gelecek
const getSubordinateIds = (userSystemId, userRole) => {
    // Örnek hiyerarşi: Admin(2) -> Agent(4), SuperAdmin -> herkes
    const hierarchy = {
        2: [4, 5, 6], // Admin 2, Agent'lar 4,5,6'yı yönetir
        3: [7, 8],    // Admin 3, Agent'lar 7,8'i yönetir
        // super_admin tüm kullanıcıları görebilir
    };
    
    if (userRole === 'super_admin') {
        // SuperAdmin tüm kullanıcıları görebilir
        return [2, 3, 4, 5, 6, 7, 8]; // Örnek tüm kullanıcı ID'leri
    }
    
    return hierarchy[userSystemId] || [];
};

export const setupConnectionHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 Socket bağlantısı - ID:', socket.id);

        // Socket'e kullanıcı bilgisini kaydet
        socket.userSystemId = null;
        socket.userRole = null;

        // User System room'a katılma (ChatMessageHandler'dan gelen mesajlar için)
        socket.on('join-user-room', (data) => {
            const { userSystemId, userPatientId, userRole } = data;
            
            // Socket'e kullanıcı ID'sini kaydet
            socket.userSystemId = userSystemId;
            socket.userRole = userRole || 'user';
            
            // Önce kendi room'una katıl
            const userRoomName = `user_system_${userSystemId}`;
            socket.join(userRoomName);
            
            let joinedRooms = [userRoomName];
            
            // Eğer admin ise, alt rollerin room'larına da katıl
            if (userRole === 'admin' || userRole === 'super_admin') {
                const subordinateIds = getSubordinateIds(userSystemId, userRole);
                
                subordinateIds.forEach(subordinateId => {
                    const subordinateRoom = `user_system_${subordinateId}`;
                    socket.join(subordinateRoom);
                    joinedRooms.push(subordinateRoom);
                });
            }
            
            console.log(`👤 Kullanıcı ${userSystemId} (${userRole}) katıldığı room'lar:`, joinedRooms);
            
            // Kullanıcıya onay gönder
            socket.emit('joined-user-room', {
                success: true,
                rooms: joinedRooms,
                userSystemId: userSystemId,
                userRole: userRole,
                socketId: socket.id
            });
        });

        // User System room'dan ayrılma
        socket.on('leave-user-room', (data) => {
            const { userSystemId } = data;
            
            // Tüm room'lardan ayrıl (kendi + alt roller)
            const userRole = socket.userRole;
            const userRoomName = `user_system_${userSystemId}`;
            
            socket.leave(userRoomName);
            
            if (userRole === 'admin' || userRole === 'super_admin') {
                const subordinateIds = getSubordinateIds(userSystemId, userRole);
                subordinateIds.forEach(subordinateId => {
                    socket.leave(`user_system_${subordinateId}`);
                });
            }
            
            console.log(`👤 Kullanıcı ${userSystemId} tüm room'lardan ayrıldı`);
        });
        
        // Chat room'a katılma
        socket.on('join-chat-room', (data) => {
            const { userId, chatId } = data;
            const roomName = `chat_${chatId}`;
            
            socket.join(roomName);
            console.log(`Kullanıcı ${userId} chat odasına katıldı: ${roomName}`);
            
            // Kullanıcıya onay gönder
            socket.emit('joined-room', {
                success: true,
                room: roomName,
                userId: userId
            });
        });

        // Chat room'dan ayrılma
        socket.on('leave-chat-room', (data) => {
            const { userId, chatId } = data;
            const roomName = `chat_${chatId}`;
            
            socket.leave(roomName);
            console.log(`Kullanıcı ${userId} chat odasından ayrıldı: ${roomName}`);
        });

        // Kullanıcıdan kullanıcıya mesaj gönderme
        socket.on('send-message', (data) => {
            const { text, targetUserSystemId, chatId } = data;
            
            // Gönderen kullanıcının ID'sini socket'ten al
            const fromUserSystemId = socket.userSystemId;
            
            if (!text || !targetUserSystemId || !fromUserSystemId) {
                socket.emit('error', { 
                    message: 'Geçersiz mesaj verisi',
                    missing: {
                        text: !text,
                        targetUserSystemId: !targetUserSystemId,
                        fromUserSystemId: !fromUserSystemId
                    }
                });
                return;
            }

            const targetRoomName = `user_system_${targetUserSystemId}`;
            
            // Mesaj verisini hazırla
            const messageData = {
                messageId: Date.now(), // Geçici ID
                userSystemId: targetUserSystemId, // Hedef kullanıcı ID'si
                fromUserSystemId: fromUserSystemId, // Gönderen kullanıcı ID'si
                text: text,
                authorName: `User ${fromUserSystemId}`, // Gönderen kullanıcı adı
                dateTime: new Date().toISOString(),
                chatId: chatId || 1,
                type: 'user_message',
                timestamp: new Date().toISOString()
            };

            // Hedef kullanıcının room'una mesajı gönder
            io.to(targetRoomName).emit('new-chat-message', messageData);
            
            // Gönderen kullanıcıya onay gönder
            socket.emit('message-sent', {
                success: true,
                targetUserSystemId: targetUserSystemId,
                fromUserSystemId: fromUserSystemId,
                messageId: messageData.messageId,
                timestamp: new Date().toISOString()
            });

            console.log(`Mesaj gönderildi - Gönderen: ${fromUserSystemId}, Hedef: ${targetUserSystemId}, Room: ${targetRoomName}`);
        });

        // Mesaj okundu işaretleme
        socket.on('mark-message-read', (data) => {
            const { messageId, userSystemId } = data;
            
            // Mesaj okundu bilgisini yayınla
            io.to(`user_system_${userSystemId}`).emit('message-read-status', {
                messageId,
                readAt: new Date().toISOString(),
                readBy: userSystemId
            });
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            const userSystemId = socket.userSystemId;
            if (userSystemId) {
                console.log(`Socket ayrıldı - ID: ${socket.id}, UserSystemId: ${userSystemId}`);
                // Room'dan otomatik olarak ayrılır, manuel işlem gerekmez
            } else {
                console.log(`Socket ayrıldı - ID: ${socket.id} (UserSystemId kayıtlı değil)`);
            }
        });
    });
};