import { sendError } from '../../utils/response.js';

// 404 Not Found Handling
export const notFound = (req, res, next) => {
    const message = `Not Found - ${req.originalUrl}`;
    const error = new Error(message);
    res.status(404);
    next(error);
};

// General Express Error Handler
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    console.error(`[Error] ${err.message}`);
    if(err.stack) console.error(err.stack);

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
