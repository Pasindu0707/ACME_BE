import express from 'express';
import {handleRefreshToken} from '../controllers/refreshTokenController.js'; // Use .js extension

const router = express.Router();

router.get('/', handleRefreshToken);

export default router;
