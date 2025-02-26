// models/Inventory.js
import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    details: [{ type: String }],
    price: { type: Number, required: true }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    subcategories: [subcategorySchema]
});

const inventorySchema = new mongoose.Schema({
    type: { type: String, enum: ['incoming', 'outgoing'], required: true },
    categories: [categorySchema],
    date: { type: Date, default: Date.now }
});


export const Inventory = mongoose.model('Inventory', inventorySchema);
