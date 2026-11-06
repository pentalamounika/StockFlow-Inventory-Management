
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.send('StockFlow API is running!');
});

// Database health check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'StockFlow API is working',
            database: 'Connected',
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed'
        });
    }
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
