import { logEvents } from './logger.js';
import allowedOrigins from '../config/allowedOrigins.js';

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    // Set CORS headers even on errors
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    res.json({ message: err.message })
}

export default errorHandler 