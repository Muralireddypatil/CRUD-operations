const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbOperations.getAllProducts();
    const countResult = await dbOperations.getProductsCount();
    
    res.json({
      success: true,
      data: products,
      count: countResult.count
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});
