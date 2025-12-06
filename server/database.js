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

// Helper: Get single row
const getRow = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper: Get multiple rows
const getAllRows = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ✅ FIXED: Missing runQuery()
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Database operations
const dbOperations = {
  getAllProducts: () => {
    return getAllRows('SELECT * FROM products ORDER BY id ASC');
  },

  getProductById: (id) => {
    return getRow('SELECT * FROM products WHERE id = ?', [id]);
  },

  createProduct: (productData) => {
    const { name, seller, price } = productData;
    return runQuery(
      'INSERT INTO products (name, seller, price) VALUES (?, ?, ?)',
      [name.trim(), seller.trim(), price.toString()]
    );
  },

  updateProduct: (id, productData) => {
    const { name, seller, price } = productData;
    return runQuery(
      'UPDATE products SET name = ?, seller = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), seller.trim(), price.toString(), id]
    );
  },

  deleteProduct: (id) => {
    return runQuery('DELETE FROM products WHERE id = ?', [id]);
  },

  deleteAllProducts: () => {
    return runQuery('DELETE FROM products');
  },

  resetIdCounter: () => {
    return runQuery('DELETE FROM sqlite_sequence WHERE name = "products"');
  },

  getNextId: () => {
    return getRow('SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM products');
  },

  getProductsCount: () => {
    return getRow('SELECT COUNT(*) as count FROM products');
  }
};

module.exports = { db, dbOperations };
