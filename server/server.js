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
// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
  // Check if product exists
    const existingProduct = await dbOperations.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    await dbOperations.deleteProduct(id);
    
    res.json({
      success: true,
      data: existingProduct,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    })
  }
});                                                                                                                                                                                                                                                                                                                                    
// DELETE /api/products - Delete all products
app.delete('/api/products', async (req, res) => {
  try {
    const countResult = await dbOperations.getProductsCount();
    await dbOperations.deleteAllProducts();
    await dbOperations.resetIdCounter(); // Reset ID counter to start from 1
    
    res.json({
      success: true,
      message: `All ${countResult.count} products deleted successfully`
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all products',
      message: error.message
    });
  }
});                                                
// GET /api/next-id - Get next available ID
app.get('/api/next-id', async (req, res) => {
  try {
    const result = await dbOperations.getNextId();
    res.json({
      success: true,
      data: { nextId: result.nextId }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get next ID',
      message: error.message
    });
  }
});
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const countResult = await dbOperations.getProductsCount();
    res.json({
      success: true,
      message: 'API server is running',
      timestamp: new Date().toISOString(),
      productsCount: countResult.count
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});
// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '../src')));
// Serve JavaScript files from the js directory
app.use('/js', express.static(path.join(__dirname, '../js')));
// Default route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/Index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});
 // 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});
