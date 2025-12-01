const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'products.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});
// Initialize database tables
const initializeDatabase = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      seller TEXT NOT NULL,
      price TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('✅ Products table created/verified');
    }
  });
};
// Helper function to get single row
const getRow = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
// Helper function to get multiple rows
const getAllRows = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
// Database operations
const dbOperations = {
  // Get all products
  getAllProducts: () => {
    return getAllRows('SELECT * FROM products ORDER BY id ASC');
  },

  // Get product by ID
  getProductById: (id) => {
    return getRow('SELECT * FROM products WHERE id = ?', [id]);
  },

  // Create new product
  createProduct: (productData) => {
    const { name, seller, price } = productData;
    return runQuery(
      'INSERT INTO products (name, seller, price) VALUES (?, ?, ?)',
      [name.trim(), seller.trim(), price.toString()]
    );
  }, 