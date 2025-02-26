import express from 'express';
import {getIncomingPDFReport,getOutgoingPDFReport} from '../../controllers/CRUD/pdfGen.js'; // Use .js extension

const router = express.Router();

// Get PDF report of incoming items
router.get('/incoming', getIncomingPDFReport);

// Get PDF report of outgoing items
router.get('/outgoing', getOutgoingPDFReport);

export default router;
