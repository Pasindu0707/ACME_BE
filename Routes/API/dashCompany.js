import express from 'express';
import {
  addCompany,
  addRecord,
  deleteRecordById,
  editRecord,
  getAllCompanies,
  getCompanyByName,
  deleteCompany,
  generateCompanyDetailReport,
  generateFullCompanyReport
} from '../../controllers/CRUD/dashboardCompanyController.js'; 
const router = express.Router();

router.post('/add-company', addCompany);
router.post('/add-record', addRecord);
router.delete('/delete-record', deleteRecordById);
router.put('/edit-record', editRecord);
router.get('/get-all-companies', getAllCompanies);
router.get('/by-name', getCompanyByName);
router.delete('/delete-company', deleteCompany);
router.get('/generate-report/:companyId', generateCompanyDetailReport);
router.get('/generate-full-report', generateFullCompanyReport);

export default router;
