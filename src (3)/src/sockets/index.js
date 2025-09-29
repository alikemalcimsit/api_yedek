import { Server } from 'socket.io';
import { config } from '../config/config.js';
import { setupConnectionHandlers } from './connectionHandler.js';

export const initializeSocketIO = (server) => {
    const io = new Server(server, config.socket);
    
    console.log('Socket.IO server başlatıldı');
    
    // Connection event'lerini setup et
    setupConnectionHandlers(io);
    
    return io;
};