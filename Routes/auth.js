import express from 'express';
import {handleLogin} from '../controllers/authController.js'; // Use .js extension

const router = express.Router();

router.post('/', handleLogin);

export default router;
