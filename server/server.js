// server/server.js
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

// Serve static assets: src/ as root, and js/ at /js (so you don't need to move UI files)
app.use(express.static(path.join(__dirname, '..', 'src')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));

// --- API routes ---

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    dbOperations.getAllProducts((err, products) => {
      if (err) {
        console.error('DB error', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch products', message: err.message });
      }
      dbOperations.getProductsCount((err2, countResult) => {
        if (err2) {
          console.error('DB error', err2);
          return res.status(500).json({ success: false, error: 'Failed to fetch count', message: err2.message });
        }
        res.json({ success: true, data: products, count: countResult.count });
      });
    });
  } catch (error) {
    console.error('Unexpected error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products', message: error.message });
  }
});

// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    dbOperations.getProductById(id, (err, product) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to fetch product', message: err.message });
      if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, data: product });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product', message: error.message });
  }
});

// POST /api/products - Create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, seller, price } = req.body;
    if (!name || seller === undefined || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, seller, and price are required' });
    }
    dbOperations.createProduct({ name, seller, price }, (err, result) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to create product', message: err.message });
      dbOperations.getProductById(result.id, (err2, newProduct) => {
        if (err2) return res.status(500).json({ success: false, error: 'Failed to fetch new product', message: err2.message });
        res.status(201).json({ success: true, data: newProduct, message: 'Product created successfully' });
      });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to create product', message: error.message });
  }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, seller, price } = req.body;

    dbOperations.getProductById(id, (err, existingProduct) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to fetch product', message: err.message });
      if (!existingProduct) return res.status(404).json({ success: false, error: 'Product not found' });

      if (!name || seller === undefined || price === undefined) {
        return res.status(400).json({ success: false, error: 'Name, seller, and price are required' });
      }

      dbOperations.updateProduct(id, { name, seller, price }, (err2) => {
        if (err2) return res.status(500).json({ success: false, error: 'Failed to update product', message: err2.message });
        dbOperations.getProductById(id, (err3, updatedProduct) => {
          if (err3) return res.status(500).json({ success: false, error: 'Failed to fetch updated product', message: err3.message });
          res.json({ success: true, data: updatedProduct, message: 'Product updated successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product', message: error.message });
  }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    dbOperations.getProductById(id, (err, existingProduct) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to fetch product', message: err.message });
      if (!existingProduct) return res.status(404).json({ success: false, error: 'Product not found' });

      dbOperations.deleteProduct(id, (err2) => {
        if (err2) return res.status(500).json({ success: false, error: 'Failed to delete product', message: err2.message });
        res.json({ success: true, data: existingProduct, message: 'Product deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product', message: error.message });
  }
});

// DELETE /api/products - Delete all products
app.delete('/api/products', async (req, res) => {
  try {
    dbOperations.getProductsCount((err, countResult) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to get count', message: err.message });
      dbOperations.deleteAllProducts((err2) => {
        if (err2) return res.status(500).json({ success: false, error: 'Failed to delete all products', message: err2.message });
        dbOperations.resetIdCounter(() => { /* ignore error */ });
        res.json({ success: true, message: `All ${countResult.count} products deleted successfully` });
      });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete all products', message: error.message });
  }
});

// GET /api/next-id - Get next available ID
app.get('/api/next-id', async (req, res) => {
  try {
    dbOperations.getNextId((err, result) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to get next ID', message: err.message });
      res.json({ success: true, data: { nextId: result.nextId } });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to get next ID', message: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    dbOperations.getProductsCount((err, countResult) => {
      if (err) return res.status(500).json({ success: false, error: 'DB error', message: err.message });
      res.json({ success: true, message: 'API server is running', timestamp: new Date().toISOString(), productsCount: countResult.count });
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Database connection failed', message: error.message });
  }
});

// Serve index.html for root explicitly (ensure lowercase file name)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
