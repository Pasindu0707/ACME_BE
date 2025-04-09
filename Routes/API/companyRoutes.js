import express from 'express';
import {addCompany,deleteCompany,addRecord,deleteRecord,updateCompany,getAllCompanyNames,getCompanyById,updateRecord} from '../../controllers/CRUD/companyController.js'; // Use .js extension

const router = express.Router();

// Add a new company
router.post('/add', addCompany);

// Add a new record to an existing company
router.post('/:id/records/add', addRecord);

// Delete a company by ID
router.delete('/delete/:id', deleteCompany);

// Update a company by ID
router.put('/update/:id', updateCompany);

// Get all company names
router.get('/names', getAllCompanyNames);

// Get company details by ID
router.get('/:id', getCompanyById);

// Update a record within a company
router.put('/:companyId/records/:recordId', updateRecord);

// Delete a record from a company
router.delete('/:companyId/records/:recordId', deleteRecord);


export default router;
