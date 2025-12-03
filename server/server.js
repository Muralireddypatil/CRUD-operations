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
// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await dbOperations.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});
// POST /api/products - Create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, seller, price } = req.body;
    
    // Validation
    if (!name || !seller || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name, seller, and price are required'
      });
    }
    
    const result = await dbOperations.createProduct({ name, seller, price });
    const newProduct = await dbOperations.getProductById(result.id);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});
// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, seller, price } = req.body;
    
    // Check if product exists
    const existingProduct = await dbOperations.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Validation
    if (!name || !seller || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name, seller, and price are required'
      });
    }
    
    // Update product
    await dbOperations.updateProduct(id, { name, seller, price });
    const updatedProduct = await dbOperations.getProductById(id);
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});
