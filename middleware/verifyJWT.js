import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
        
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error('ACCESS_TOKEN_SECRET is not defined');
            return res.status(500).json({ "Message": "Server configuration error" });
        }
        
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.sendStatus(403); //invalid token
                req.user = decoded.UserInformation.username;
                next();
            }
        );
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(500).json({ "Message": "Internal server error" });
    }
}

export default verifyJWT