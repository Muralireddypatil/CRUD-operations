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
