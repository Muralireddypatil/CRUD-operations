// api.js — works locally & on Render

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "/api";

class ProductAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  // CRUD API calls
  createProduct(productData) {
    return this.makeRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  getAllProducts() {
    return this.makeRequest("/products");
  }

  updateProduct(id, data) {
    return this.makeRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteProduct(id) {
    return this.makeRequest(`/products/${id}`, { method: "DELETE" });
  }

  deleteAllProducts() {
    return this.makeRequest("/products", { method: "DELETE" });
  }

  getNextId() {
    return this.makeRequest("/next-id");
  }

  healthCheck() {
    return this.makeRequest("/health");
  }
}

// Make available globally
window.apiService = new ProductAPIService();
