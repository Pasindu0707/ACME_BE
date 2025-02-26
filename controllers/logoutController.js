import { User } from '../models/User.js'; // Ensure to add .js extension for ESM
import jwt from 'jsonwebtoken'; // If you're not using jwt in this function, you can remove this import

const handleLogout = async (req, res) => {
    // User should delete the accessToken from front end
    // localStorage.setItem('token', '');

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // Success, but no content to send

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.status(403).send('Forbidden'); // Optional: Send a message for clarity
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
};

export { handleLogout }; // Exporting using named export
