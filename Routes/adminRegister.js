import express from 'express';
import { adminRegisterController } from '../controllers/CRUD/adminRegisterController.js';

const router = express.Router();

router.post('/', adminRegisterController); // Correct usage

export default router;
