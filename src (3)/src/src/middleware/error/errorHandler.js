/**
 * Global Error Handler Middleware
 */

/**
 * 404 - Route bulunamadı handler'ı
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route bulunamadı: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

/**
 * Global error handler
 */
export const globalErrorHandler = (err, req, res, next) => {
    // Default error status
    const status = err.status || err.statusCode || 500;
    
    // Error logla
    console.error('🚨 Sunucu hatası:', {
        message: err.message,
        status: status,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Error response'u
    const errorResponse = {
        error: true,
        status: status,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : status === 500 
                ? 'Sunucu hatası oluştu' 
                : err.message,
        timestamp: new Date().toISOString()
    };

    // Development'ta stack trace ekle
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = {
            url: req.originalUrl,
            method: req.method,
            headers: req.headers
        };
    }

    res.status(status).json(errorResponse);
};

/**
 * Async error yakalama wrapper'ı
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: true,
            status: 400,
            message: 'Validation hatası',
            details: errors
        });
    }
    next(err);
}; 