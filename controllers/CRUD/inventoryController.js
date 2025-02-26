import { Inventory } from '../../models/Inventory.js'; // Ensure to add .js extension for ESM

// Add main category to incoming or outgoing
export const addMainCategory = async (req, res) => {
  try {
    const { type, name } = req.body;
    const newCategory = { name, subcategories: [] };

    const inventory = await Inventory.findOne({ type });
    if (inventory) {
      inventory.categories.push(newCategory);
      await inventory.save();
    } else {
      await Inventory.create({ type, categories: [newCategory] });
    }

    res.status(201).json({ message: 'Main category added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add subcategory to a main category in incoming or outgoing
export const addSubCategory = async (req, res) => {
  try {
    const { type, mainCategoryName, subCategoryName, details, price } = req.body;
    console.log(type, mainCategoryName, subCategoryName, details, price);
    
    const inventory = await Inventory.findOne({ type });
    if (inventory) {
      const mainCategory = inventory.categories.find(category => category.name === mainCategoryName);
      if (mainCategory) {
        mainCategory.subcategories.push({ name: subCategoryName, details, price });
        await inventory.save();
        res.status(201).json({ message: 'Subcategory added successfully' });
      } else {
        res.status(404).json({ message: 'Main category not found' });
      }
    } else {
      res.status(404).json({ message: 'Inventory type not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a main category
export const deleteMainCategory = async (req, res) => {
  try {
    const { type, mainCategoryName } = req.body;

    const inventory = await Inventory.findOne({ type });
    if (inventory) {
      const categoryIndex = inventory.categories.findIndex(category => category.name === mainCategoryName);
      if (categoryIndex > -1) {
        inventory.categories.splice(categoryIndex, 1);
        await inventory.save();
        res.status(200).json({ message: 'Main category deleted successfully' });
      } else {
        res.status(404).json({ message: 'Main category not found' });
      }
    } else {
      res.status(404).json({ message: 'Inventory type not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a subcategory
export const deleteSubCategory = async (req, res) => {
  try {
    const { type, mainCategoryName, subCategoryName } = req.body;

    const inventory = await Inventory.findOne({ type });
    if (inventory) {
      const mainCategory = inventory.categories.find(category => category.name === mainCategoryName);
      if (mainCategory) {
        const subCategoryIndex = mainCategory.subcategories.findIndex(sub => sub.name === subCategoryName);
        if (subCategoryIndex > -1) {
          mainCategory.subcategories.splice(subCategoryIndex, 1);
          await inventory.save();
          res.status(200).json({ message: 'Subcategory deleted successfully' });
        } else {
          res.status(404).json({ message: 'Subcategory not found' });
        }
      } else {
        res.status(404).json({ message: 'Main category not found' });
      }
    } else {
      res.status(404).json({ message: 'Inventory type not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a subcategory
export const editSubCategory = async (req, res) => {
  try {
    const { type, mainCategoryName, subCategoryName, newSubCategoryName, details, price } = req.body;

    const inventory = await Inventory.findOne({ type });
    if (inventory) {
      const mainCategory = inventory.categories.find(category => category.name === mainCategoryName);
      if (mainCategory) {
        const subCategory = mainCategory.subcategories.find(sub => sub.name === subCategoryName);
        if (subCategory) {
          subCategory.name = newSubCategoryName || subCategory.name;
          subCategory.details = details || subCategory.details;
          subCategory.price = price !== undefined ? price : subCategory.price;
          await inventory.save();
          res.status(200).json({ message: 'Subcategory edited successfully' });
        } else {
          res.status(404).json({ message: 'Subcategory not found' });
        }
      } else {
        res.status(404).json({ message: 'Main category not found' });
      }
    } else {
      res.status(404).json({ message: 'Inventory type not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all the main categories 
export const getMainCategories = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type || (type !== 'incoming' && type !== 'outgoing')) {
      return res.status(400).json({ message: 'Invalid or missing type parameter' });
    }

    const inventory = await Inventory.findOne({ type });
    if (!inventory) {
      return res.status(404).json({ message: 'No categories found for the specified type' });
    }

    res.status(200).json(inventory.categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
