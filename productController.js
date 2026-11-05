
const pool = require('../config/db');

// Add Product
const addProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            quantity,
            price,
            low_stock_threshold,
            description
        } = req.body;

        if (!name || !sku || !category || quantity === undefined || price === undefined) {
            return res.status(400).json({
                message: 'Please provide all required product details'
            });
        }

        const result = await pool.query(
            `INSERT INTO products
            (user_id, name, sku, category, quantity, price,
             low_stock_threshold, description)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [
                req.user.id,
                name,
                sku,
                category,
                quantity,
                price,
                low_stock_threshold ?? 5,
                description || null
            ]
        );

        res.status(201).json({
            message: 'Product added successfully',
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This SKU already exists'
            });
        }

        res.status(500).json({
            message: 'Failed to add product'
        });
    }
};

// View Products
const getProducts = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE user_id = $1 ORDER BY id DESC',
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to fetch products'
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            quantity,
            price,
            low_stock_threshold,
            description
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET name=$1, sku=$2, category=$3, quantity=$4,
                 price=$5, low_stock_threshold=$6,
                 description=$7, updated_at=CURRENT_TIMESTAMP
             WHERE id=$8 AND user_id=$9
             RETURNING *`,
            [
                name,
                sku,
                category,
                quantity,
                price,
                low_stock_threshold ?? 5,
                description || null,
                req.params.id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.json({
            message: 'Product updated successfully',
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This SKU already exists'
            });
        }

        res.status(500).json({
            message: 'Failed to update product'
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id=$1 AND user_id=$2 RETURNING *',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to delete product'
        });
    }
};

module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
};
