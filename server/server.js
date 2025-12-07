// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { db, dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'src')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));

// Helper to send internal server error
function internalError(res, err, msg = 'Internal server error') {
  console.error(msg, err);
  return res.status(500).json({ success: false, error: msg, message: err?.message || '' });
}

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbOperations.getAllProducts();
    const countRow = await dbOperations.getProductsCount();
    const count = countRow && typeof countRow.count === 'number' ? countRow.count : 0;
    return res.json({ success: true, data: products, count });
  } catch (err) {
    return internalError(res, err, 'Failed to fetch products');
  }
});

// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await dbOperations.getProductById(id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (err) {
    return internalError(res, err, 'Failed to fetch product');
  }
});

// POST /api/products - Create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, seller, price } = req.body;
    if (!name || seller === undefined || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, seller, and price are required' });
    }

    const result = await dbOperations.createProduct({ name, seller, price });
    // result from runQuery is { id: lastID, changes: ... }
    const newProduct = await dbOperations.getProductById(result.id);
    return res.status(201).json({ success: true, data: newProduct, message: 'Product created successfully' });
  } catch (err) {
    return internalError(res, err, 'Failed to create product');
  }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, seller, price } = req.body;

    const existing = await dbOperations.getProductById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found' });

    if (!name || seller === undefined || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, seller, and price are required' });
    }

    await dbOperations.updateProduct(id, { name, seller, price });
    const updated = await dbOperations.getProductById(id);
    return res.json({ success: true, data: updated, message: 'Product updated successfully' });
  } catch (err) {
    return internalError(res, err, 'Failed to update product');
  }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await dbOperations.getProductById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found' });

    await dbOperations.deleteProduct(id);
    return res.json({ success: true, data: existing, message: 'Product deleted successfully' });
  } catch (err) {
    return internalError(res, err, 'Failed to delete product');
  }
});

// DELETE /api/products - Delete all products
app.delete('/api/products', async (req, res) => {
  try {
    const countRow = await dbOperations.getProductsCount();
    const count = countRow && typeof countRow.count === 'number' ? countRow.count : 0;
    await dbOperations.deleteAllProducts();
    await dbOperations.resetIdCounter();
    return res.json({ success: true, message: `All ${count} products deleted successfully` });
  } catch (err) {
    return internalError(res, err, 'Failed to delete all products');
  }
});

// GET /api/next-id - Get next available ID
app.get('/api/next-id', async (req, res) => {
  try {
    const row = await dbOperations.getNextId();
    const nextId = row && (row.nextId || (row.data && row.data.nextId)) ? (row.nextId || row.data.nextId) : 1;
    return res.json({ success: true, data: { nextId } });
  } catch (err) {
    return internalError(res, err, 'Failed to get next ID');
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const countRow = await dbOperations.getProductsCount();
    const count = countRow && typeof countRow.count === 'number' ? countRow.count : 0;
    return res.json({ success: true, message: 'API running', timestamp: new Date().toISOString(), productsCount: count });
  } catch (err) {
    return internalError(res, err, 'Database connection failed');
  }
});

// Serve main index explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

// Error handlers
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ success: false, error: 'Something went wrong!', message: err?.message || '' });
});
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
