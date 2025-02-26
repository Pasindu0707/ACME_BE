import express from 'express';
import {handleLogout} from '../controllers/logoutController.js'; // Use .js extension

const router = express.Router();

router.get('/',handleLogout);

export default router;
