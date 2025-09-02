// API Module - Funcional con tu backend
(() => {
  // Configuración de la API
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  
  // Función auxiliar para obtener headers con autenticación
  function getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Función auxiliar para manejar respuestas
  async function handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', response.url, data); // ← Debug
    return data;
  }

  // API object
  const api = {
    // Autenticación
    async login(email, password) {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    async testConnection() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: getHeaders(),
          timeout: 5000 // Timeout de 5 segundos
        });
        return response.ok;
      } catch (error) {
        console.error("Connection test failed:", error);
        return false;
      }
    },
    
    async register(userData) {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    async getProfile() {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    // Usuarios
    async getUsers(params = {}) {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    async getUserById(userId) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    async updateUser(userId, userData) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    async deleteUser(userId) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    // Categorías
    async getCategories(params = {}) {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/categories?${queryParams}`, {
        headers: getHeaders(),
      });

      const data = await handleResponse(response);

      // ADAPTACIÓN: Tu backend devuelve categorías en data.data
      return data.data || []; // ← Aquí está el cambio
    },


    async getCategoryById(categoryId) {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    async createCategory(categoryData) {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    },

    async updateCategory(categoryId, categoryData) {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    },

    async deleteCategory(categoryId) {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    // Restaurantes

    async getRestaurants(params = {}) {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
    
      const response = await fetch(`${API_BASE_URL}/restaurants?${queryParams}`, {
        headers: getHeaders(),
      });

      const data = await handleResponse(response);

      // ADAPTACIÓN: Tu backend devuelve los restaurantes en data.data
      return {
        restaurants: data.data || [], // ← Aquí está el cambio
        pagination: data.pagination || {
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 12,
          total: data.data ? data.data.length : 0
        }
      };
    },    

    async getRestaurantById(restaurantId) {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    async createRestaurant(restaurantData) {
      const response = await fetch(`${API_BASE_URL}/restaurants`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(restaurantData),
      });
      return handleResponse(response);
    },

    async updateRestaurant(restaurantId, restaurantData) {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(restaurantData),
      });
      return handleResponse(response);
    },

    async deleteRestaurant(restaurantId) {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    async getRestaurantStats(restaurantId) {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/stats`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    // Platos
    async getDishes(params = {}) {
      const queryParams = new URLSearchParams();
        
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
    
      const response = await fetch(`${API_BASE_URL}/dishes?${queryParams}`, {
        headers: getHeaders(),
      });

      const data = await handleResponse(response);

      // ADAPTACIÓN: Tu backend devuelve los platos en data.data
      return {
        dishes: data.data || [], // ← Aquí está el cambio
        pagination: data.pagination || {
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 8,
          total: data.data ? data.data.length : 0
        }
      };
    },

    async getDishById(dishId) {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    async createDish(dishData) {
      const response = await fetch(`${API_BASE_URL}/dishes`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(dishData),
      });
      return handleResponse(response);
    },

    async updateDish(dishId, dishData) {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(dishData),
      });
      return handleResponse(response);
    },

    async deleteDish(dishId) {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    async getDishStats(dishId) {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}/stats`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    // Reseñas
    async getReviews(params = {}) {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/reviews?${queryParams}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    async getReviewById(reviewId) {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    async createReview(reviewData) {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(reviewData),
      });
      return handleResponse(response);
    },

    async updateReview(reviewId, reviewData) {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(reviewData),
      });
      return handleResponse(response);
    },

    async deleteReview(reviewId) {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    }
  };

  // Exponer API globalmente
  window.FoodieRank = window.FoodieRank || {};
  window.FoodieRank.api = api;
})();