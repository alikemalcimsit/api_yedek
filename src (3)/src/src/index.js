import express from 'express';
import cookieParser from 'cookie-parser';
import { globalErrorHandler, notFoundHandler, requestLogger } from './middleware/index.js';
import { createServer, startServer } from './core/server.js';
import { registerRoutes } from './routes/index.js';
import { config } from './config/config.js';
import { helmetConfig, limiter, corsConfig, bodyParserConfig } from './config/middleware/index.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

//Security Middleware
app.use(helmetConfig);// Güvenlik başlıkları
app.use(limiter);// Rate limiting

//CORS Middleware
app.use(corsConfig);// CORS yapılandırması

app.use(requestLogger); // Loglama middleware

// Body Parsing Middleware'lerini aktif et
app.use(express.json()); // JSON parsing için
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL encoding için
app.use(bodyParserConfig); // Eğer özel bir bodyParser yapılandırmanız varsa
app.use(cookieParser());// Cookie parsing middleware
registerRoutes(app);

// // Socket.IO'yu başlat
const server = createServer(app);
// const io = initializeSocketIO(server);
// app.set('socketio', io);
// // Error handling middleware (en sonda olmalı)
app.use(notFoundHandler);
app.use(globalErrorHandler);


// Server'ı başlat
startServer(server, config.PORT, config.HOST)
    .then(() => {
        console.log('🎉 Server başarıyla başlatıldı!');
    })
    .catch((error) => {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    });

export default app;