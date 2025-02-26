import express from 'express';
import {
  addMainCategory,
  addSubCategory,
  deleteMainCategory,
  deleteSubCategory,
  editSubCategory,
  getInventory,
  getMainCategories
} from '../../controllers/CRUD/inventoryController.js'; // Use .js extension

const router = express.Router();

// Route to add a main category to incoming or outgoing
router.post('/add-main-category', addMainCategory);

// Route to add a subcategory to a main category in incoming or outgoing
router.post('/add-subcategory', addSubCategory);

// Route to delete a main category
router.post('/delete-main-category', deleteMainCategory);

// Route to delete a subcategory
router.post('/delete-subcategory', deleteSubCategory);

// Route to edit a subcategory
router.put('/edit-subcategory', editSubCategory);

// Route to get all inventory items
router.get('/', getInventory);

// Route to get all main items
router.get('/categories', getMainCategories);

export default router;
