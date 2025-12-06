// src/js/api.js  (or js/api.js — replace whichever file your index.html loads)

// Use relative base in production, keep localhost in dev
const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// API Service Class
class ProductAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making HTTP requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });

      // if response has no body (204) return empty object
      if (response.status === 204) return {};

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const body = text || response.statusText;
        throw new Error(`HTTP ${response.status} - ${body}`);
      }

      // attempt to parse json, fallback to text
      try {
        return await response.json();
      } catch {
        return await response.text();
      }
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // CREATE - Add new product
  async createProduct(productData) {
    const options = {
      method: 'POST',
      body: JSON.stringify(productData)
    };

    try {
      const result = await this.makeRequest('/products', options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // READ - Get all products
  async getAllProducts() {
    try {
      const result = await this.makeRequest('/products');
      // if your server returns { success: true, data: [...] } normalize:
      if (result && result.success && result.data) return result.data;
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // UPDATE - Update existing product
  async updateProduct(id, productData) {
    const options = {
      method: 'PUT',
      body: JSON.stringify(productData)
    };
    try {
      const result = await this.makeRequest(`/products/${id}`, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // DELETE - Delete a product
  async deleteProduct(id) {
    const options = {
      method: 'DELETE'
    };

    try {
      const result = await this.makeRequest(`/products/${id}`, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // DELETE ALL - Clear all products
  async deleteAllProducts() {
    const options = {
      method: 'DELETE'
    };

    try {
      const result = await this.makeRequest('/products', options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get next available ID
  async getNextId() {
    try {
      const result = await this.makeRequest('/next-id');
      // server returns { success: true, data: { nextId: N } }
      if (result && result.success && result.data && typeof result.data.nextId === 'number') {
        return result.data.nextId;
      }
      // fallback: if server returned raw { nextId: N }
      if (result && typeof result.nextId === 'number') return result.nextId;
      return 1;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return 1;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.makeRequest('/health');
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export API service instance
const apiService = new ProductAPIService();

// Support both module import and old-school global access (safe)
if (typeof window !== 'undefined') window.apiService = apiService;
export default apiService;
