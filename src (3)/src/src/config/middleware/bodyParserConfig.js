import express from 'express';
const bodyParserConfig = express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // JSON bomb saldırılarını engelle
        if (buf.length > 10 * 1024 * 1024) { // 10MB
            throw new Error('Request entity too large');
        }
    }
});

export { bodyParserConfig };