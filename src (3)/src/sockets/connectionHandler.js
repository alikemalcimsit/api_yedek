import { processMessage } from '../routes/socket.js';

export const setupConnectionHandlers = (io) => {
    const users = {}; // socketId -> userId eşleştirmesi
    const userTimestamps = {}; // socketId -> last activity timestamp

    // Periyodik temizlik ayarları
    const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 dakika
    const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 dakika inaktif süre


    // Aktif olmayan kullanıcıları temizle
    const cleanupInactiveUsers = () => {
        try {
            const now = Date.now();
            const socketsToRemove = [];

            Object.keys(users).forEach(socketId => {
                const lastActivity = userTimestamps[socketId] || now;

                // Socket gerçekten bağlı mı kontrol et
                const socket = io.sockets.sockets.get(socketId);
                const isInactive = (now - lastActivity) > MAX_INACTIVE_TIME;

                if (!socket || isInactive) {
                    socketsToRemove.push(socketId);
                }
            });

            // Temizleme işlemi
            socketsToRemove.forEach(socketId => {
                delete users[socketId];
                delete userTimestamps[socketId];
            });

            if (socketsToRemove.length > 0) {
                console.log(`🧹 Cleanup completed: Removed ${socketsToRemove.length} inactive connections`);
                console.log(`📊 Active users: ${Object.keys(users).length}`);
            }

        } catch (error) {
            console.error('❌ Cleanup error:', error);
        }
    };

    // Kullanıcı aktivitesini güncelle
    const updateUserActivity = (socketId) => {
        userTimestamps[socketId] = Date.now();
    };

    // Periyodik temizlik başlat
    const cleanupInterval = setInterval(cleanupInactiveUsers, CLEANUP_INTERVAL);
    console.log(`🔄 Periyodik temizlik başlatıldı (${CLEANUP_INTERVAL / 1000}s aralık)`);

    // Room yönetimi için yardımcı fonksiyonlar
    const joinUserRooms = (socket, userId, role, domain) => {
        try {
            // Basitleştirilmiş room sistemi
            // Süper adminler tüm mesajları okuyacağı için ayrı bir oda oluşturdum
            // diğer tüm kullanıcılar kendi odalarına katılacak
            if (role === 2) {
                // Süper admin: tüm mesajları görebilir
                socket.join(`${domain}_superadmin`);
            } else {
                socket.join(`${domain}_user_${userId}`);
            }

            console.log(`User ${userId} (Role: ${role}) joined rooms:`, Array.from(socket.rooms));
            socket.emit('joinSuccess', {
                message: `Joined rooms successfully: ${Array.from(socket.rooms).join(', ')}`,
                domain
            });
        } catch (error) {
            console.error(`Error joining rooms for user ${userId} (Role: ${role}):`, error);
            socket.emit('error', {
                message: 'Room join failed',
                error: error.message,
                domain
            });
        }
    };

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);
        updateUserActivity(socket.id);

        // Kullanıcı giriş yaptığında
        socket.on('login', (userId, role, domain) => {
            try {
                console.log('*********** login')
                console.log(typeof userId, userId);
                console.log(typeof role, role);
                if (userId === undefined || userId === null) {
                    throw new Error('User ID is required for login');
                }
                if (role === undefined || role === null) {
                    throw new Error('User role is required for login');
                }
                if (!domain) {
                    throw new Error('Domain is required for login');
                }
                users[socket.id] = {
                    userId,
                    domain,
                    role,
                    fullId: `${domain}-${userId}`
                };

                updateUserActivity(socket.id);

                console.log(`****** User ${userId} logged in with role ${role} on domain ${domain}`);

                // Optimized room joining
                joinUserRooms(socket, userId, role, domain);

                // Başarılı login bilgisi gönder
                socket.emit('loginSuccess', {
                    userId,
                    role,
                    domain,
                    rooms: Array.from(socket.rooms)
                });

                console.log(`Active users after login: ${Object.keys(users).length}`);

            } catch (error) {
                console.error(`Login error for user ${userId}:`, error);
                socket.emit('loginError', {
                    message: 'Login failed',
                    domain,
                    error: error.message
                });
            }
        });

        // Mesaj geldiğinde
        socket.on('sendMessage', (data) => {
            try {
                updateUserActivity(socket.id);

                // mesaj işleme fonksiyonu
                const result = processMessage(io, data);


                // Mesaj başarıyla gönderildi bilgisi
                socket.emit('messageSent', result);

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('messageError', {
                    message: 'Failed to send message',
                    error: error.message,
                    domain: data.domain
                });
            }
        });

        // Disconnect handling
        socket.on('disconnect', (reason) => {
            try {
                const userInfo = users[socket.id];
                if (userInfo) {
                    delete users[socket.id];
                    delete userTimestamps[socket.id];
                    console.log(`User ${userInfo.fullId} disconnected: ${reason}`);
                }
            } catch (error) {
                console.error('Disconnect handling error:', error);
            }
        });

        // Global error handler for socket
        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
            socket.emit('socketError', {
                message: 'Socket error occurred',
                error: error.message
            });
        });
    });


    // Cleanup function 
    const cleanup = () => {
        try {
            // Interval'ı temizle
            if (cleanupInterval) {
                clearInterval(cleanupInterval);
                console.log('Periyodik temizlik durduruldu');
            }

            // Tüm kullanıcıları temizle
            Object.keys(users).forEach(socketId => {
                delete users[socketId];
                delete userTimestamps[socketId];
            });

            console.log('Socket handlers cleaned up');
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };
    // Anlık durum bilgisi için yardımcı fonksiyon
    const getStats = () => {
        const userList = Object.entries(users).map(([socketId, userInfo]) => ({
            socketId,
            ...userInfo,
            lastActivity: userTimestamps[socketId]
        }));

        return {
            activeUsers: Object.keys(users).length,
            connectedSockets: io.sockets.sockets.size,
            users: userList
        };
    };

    return { cleanup, getStats, cleanupInactiveUsers };
};