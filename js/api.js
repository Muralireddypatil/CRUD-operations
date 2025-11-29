// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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