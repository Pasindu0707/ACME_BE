import allowedOrigins from '../config/allowedOrigins.js';

const credentials = (req, res, next) => {
    const origin = req.headers.origin;

    // Always set credentials header if origin is allowed
    // CORS middleware will handle the actual origin check
    if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
};

export default credentials;
