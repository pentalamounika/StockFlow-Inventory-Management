
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Protect all product routes
router.use(authMiddleware);

// Add a product
router.post('/', addProduct);

// Get all products
router.get('/', getProducts);

// Update a product
router.put('/:id', updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
