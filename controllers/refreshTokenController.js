import {User} from '../models/User.js'; // Ensure to add .js extension for ESM
import jwt from 'jsonwebtoken';

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log(cookies);
    
    if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized if no refresh token

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        return res.status(403).json({ "Message": "Forbidden" });
    }

    console.log(foundUser + ' this is the found user');
    
    // Evaluate JWT
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || foundUser.username !== decoded.username) {
            return res.status(403).json({ "Message": "Something went wrong" }); // Changed to 403 for consistency
        }

        const accessToken = jwt.sign(
            {
                "UserInformation": {
                    "username": decoded.username,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' } // 30 seconds
        );

        res.json({ accessToken });
    });
};

export { handleRefreshToken }; // Exporting using named export
