// Restaurants Module - Fixed dish ID passing
;(() => {
  // Variables del módulo
  let currentRestaurants = []
  let currentDishes = []

  // Cargar categorías para filtros
  async function loadCategoriesForFilters() {
    try {
      const categories = await window.FoodieRank.api.getCategories()
      return categories || []
    } catch (error) {
      console.error("Error loading categories for filters:", error)
      return []
    }
  }

  // Cargar y mostrar categorías
  async function loadCategories() {
    console.log("Loading categories")
    const grid = document.getElementById("categoriesGrid")
    if (!grid) return

    try {
      window.FoodieRank.utils.showLoading(grid)

      // ADAPTACIÓN: Asegurar que categories sea un array
      let categories = await window.FoodieRank.api.getCategories({ active: true })
      console.log("Categories response:", categories)

      // Si categories es un objeto con propiedad data, extraerla
      if (categories && typeof categories === "object" && categories.data) {
        categories = categories.data
      }

      // Asegurar que sea un array
      categories = Array.isArray(categories) ? categories : []

      displayCategories(categories)
    } catch (error) {
      console.error("Error loading categories:", error)
      window.FoodieRank.utils.showError(grid, "Error al cargar categorías")
    }
  }

  function displayCategories(categories) {
    const grid = document.getElementById("categoriesGrid")
    if (!grid) return

    const categoriesArray = Array.isArray(categories) ? categories : []

    if (!categories || categories.length === 0) {
      grid.innerHTML = '<p class="no-data">No hay categorías disponibles</p>'
      return
    }

    grid.innerHTML = categories
      .map(
        (category) => `
      <div class="category-card" data-category-id="${category._id}">
        <div class="category-icon">${category.icon || "🍽️"}</div>
        <h3>${category.name}</h3>
        <p>${category.description || ""}</p>
      </div>
    `,
      )
      .join("")

    // Add click listeners to category cards
    grid.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        const categoryId = card.dataset.categoryId
        filterByCategory(categoryId)
      })
    })
  }

  // Cargar y mostrar restaurantes
  async function loadRestaurants(filters = {}) {
    console.log("Loading restaurants with filters:", filters)
    const grid = document.getElementById("restaurantsGrid")
    if (!grid) return

    try {
      window.FoodieRank.utils.showLoading(grid)

      const params = {
        page: filters.page || window.FoodieRank.utils.getCurrentPage(),
        limit: 12,
        ...filters,
      }

      const response = await window.FoodieRank.api.getRestaurants(params)
      console.log("Restaurants response:", response)

      // ADAPTACIÓN: Extraer restaurantes de response.data
      const restaurantsData = response.data || response.restaurants || []
      currentRestaurants = Array.isArray(restaurantsData) ? restaurantsData : []

      displayRestaurants(currentRestaurants)

      if (response.pagination) {
        window.FoodieRank.utils.updatePagination(response.pagination)
      }
    } catch (error) {
      console.error("Error loading restaurants:", error)
      window.FoodieRank.utils.showError(grid, "Error al cargar restaurantes")
    }
  }

  function displayRestaurants(restaurants) {
    const grid = document.getElementById("restaurantsGrid")
    if (!grid) return

    if (!restaurants || restaurants.length === 0) {
      grid.innerHTML = '<p class="no-data">No hay restaurantes disponibles</p>'
      return
    }

    grid.innerHTML = restaurants
      .map(
        (restaurant) => `
      <div class="restaurant-card" data-restaurant-id="${restaurant._id}">
        <div class="restaurant-image">
          <img src="${restaurant.image || "/images/default-restaurant.jpg"}" 
               alt="${restaurant.name}" loading="lazy">
        </div>
        <div class="restaurant-info">
          <h3>${restaurant.name}</h3>
          <p class="restaurant-cuisine">${Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(", ") : restaurant.cuisine || "Cocina variada"}</p>
          <p class="restaurant-address">${restaurant.address?.street || ""}</p>
          <div class="restaurant-rating">
            <span class="stars">${window.FoodieRank.utils.generateStars(restaurant.averageRating || 0)}</span>
            <span class="rating-text">${(restaurant.averageRating || 0).toFixed(1)}/5</span>
          </div>
          <div class="restaurant-price">
            <span class="price-range">${restaurant.priceRange || "$"}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    // Add click listeners to restaurant cards
    grid.querySelectorAll(".restaurant-card").forEach((card) => {
      card.addEventListener("click", () => {
        const restaurantId = card.dataset.restaurantId
        showRestaurantDetails(restaurantId)
      })
    })
  }

  // Cargar y mostrar platos
  async function loadDishes(filters = {}) {
    const grid = document.getElementById("dishesGrid")
    if (!grid) return

    try {
      window.FoodieRank.utils.showLoading(grid)

      const params = {
        limit: 8,
        available: true,
        ...filters,
      }

      const response = await window.FoodieRank.api.getDishes(params)

      // ADAPTACIÓN: Extraer platos de response.data
      const dishesData = response.data || response.dishes || []
      currentDishes = Array.isArray(dishesData) ? dishesData : []

      displayDishes(currentDishes)
    } catch (error) {
      console.error("Error loading dishes:", error)
      window.FoodieRank.utils.showError(grid, "Error al cargar platos")
    }
  }

  function displayDishes(dishes) {
    const grid = document.getElementById("dishesGrid")
    if (!grid) return

    if (!dishes || dishes.length === 0) {
      grid.innerHTML = '<p class="no-data">No hay platos disponibles</p>'
      return
    }

    grid.innerHTML = dishes
      .map(
        (dish) => `
      <div class="dish-card" data-dish-id="${dish._id}">
        <div class="dish-image">
          <img src="${dish.image || "/images/default-dish.jpg"}" 
               alt="${dish.name}" loading="lazy">
        </div>
        <div class="dish-info">
          <p class="dish-description">${window.FoodieRank.utils.truncateText(dish.description || "", 100)}</p>
          <div class="dish-price">${window.FoodieRank.utils.formatPrice(dish.price || 0)}</div>
          <div class="dish-rating">
            <span class="stars">${window.FoodieRank.utils.generateStars(dish.averageRating || 0)}</span>
            <span class="rating-text">${(dish.averageRating || 0).toFixed(1)}/5</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    // Add click listeners to dish cards
    grid.querySelectorAll(".dish-card").forEach((card) => {
      card.addEventListener("click", () => {
        const dishId = card.dataset.dishId
        showDishDetails(dishId)
      })
    })
  }

  // Mostrar detalles del restaurante
  async function showRestaurantDetails(restaurantId) {
    try {
      const restaurant = await window.FoodieRank.api.getRestaurantById(restaurantId)
      const reviewsResponse = await window.FoodieRank.api.getReviews({ restaurant: restaurantId, limit: 10 })

      // Extract restaurant data
      const restaurantData = restaurant.data || restaurant

      const reviews = reviewsResponse.data?.reviews || reviewsResponse.reviews || []
      console.log("Restaurant reviews response:", reviewsResponse) // Debug
      console.log("Restaurant reviews extracted:", reviews) // Debug

      displayRestaurantModal(restaurantData, reviews, restaurantId)
      window.FoodieRank.utils.openModal("restaurantModal")
    } catch (error) {
      console.error("Error loading restaurant details:", error)
      window.FoodieRank.utils.showNotification("Error al cargar detalles del restaurante", "error")
    }
  }

  // Mostrar detalles del plato
  async function showDishDetails(dishId) {
    try {
      console.log("[v0] Fetching dish details for ID:", dishId) // Debug

      const dish = await window.FoodieRank.api.getDishById(dishId)
      const reviewsResponse = await window.FoodieRank.api.getReviews({ dish: dishId, limit: 10 })

      console.log("[v0] Dish data received:", dish) // Debug
      console.log("[v0] Reviews API response:", reviewsResponse) // Debug

      // Extract dish data
      const dishData = dish.data || dish

      const reviews = reviewsResponse.data?.reviews || reviewsResponse.reviews || []
      console.log("[v0] Extracted reviews for dish:", reviews) // Debug
      console.log("[v0] Number of reviews found:", reviews.length) // Debug

      const filteredReviews = reviews.filter((review) => {
        const reviewDishId = review.dishId || review.dish?._id || review.dish
        console.log("[v0] Comparing review dish ID:", reviewDishId, "with target dish ID:", dishId)
        return reviewDishId === dishId
      })

      console.log("[v0] Filtered reviews for this dish:", filteredReviews) // Debug

      displayDishModal(dishData, filteredReviews, dishId)
      window.FoodieRank.utils.openModal("dishModal")
    } catch (error) {
      console.error("Error loading dish details:", error)
      window.FoodieRank.utils.showNotification("Error al cargar detalles del plato", "error")
    }
  }

  function displayRestaurantModal(restaurant, reviews, restaurantId) {
    const container = document.getElementById("restaurantDetails")
    if (!container) return

    // Extract restaurant data properly
    const restaurantData = restaurant.data || restaurant

    const reviewsArray = Array.isArray(reviews) ? reviews : []
    const reviewCount = reviewsArray.length

    // VERIFICACIÓN MÁS ROBUSTA DE AUTENTICACIÓN
    const isAuthenticated =
      window.FoodieRank.auth && window.FoodieRank.auth.isAuthenticated && window.FoodieRank.auth.isAuthenticated()

    console.log("Display restaurant modal - authenticated:", isAuthenticated) // Debug
    console.log("Restaurant reviews to display:", reviewsArray) // Debug

    container.innerHTML = `
      <div class="restaurant-detail" data-restaurant-id="${restaurantId}">
        <div class="restaurant-header">
          <img src="${restaurantData.image || "/images/default-restaurant.jpg"}" 
               alt="${restaurantData.name}" class="restaurant-detail-image">
          <div class="restaurant-detail-info">
            <h2>${restaurantData.name}</h2>
            <p class="cuisine-type">${Array.isArray(restaurantData.cuisine) ? restaurantData.cuisine.join(", ") : restaurantData.cuisine || "Cocina variada"}</p>
            <p class="address">${restaurantData.address?.street || ""}, ${restaurantData.address?.city || ""}</p>
            <div class="rating">
              <span class="stars">${window.FoodieRank.utils.generateStars(restaurantData.averageRating || 0)}</span>
              <span class="rating-text">${(restaurantData.averageRating || 0).toFixed(1)}/5 (${reviewCount} reseñas)</span>
            </div>
            <div class="price-range">Rango de precios: ${restaurantData.priceRange || "$"}</div>
            <div class="contact-info">
              ${restaurantData.contact?.phone ? `<p>📞 ${restaurantData.contact.phone}</p>` : ""}
              ${restaurantData.contact?.email ? `<p>✉️ ${restaurantData.contact.email}</p>` : ""}
            </div>
          </div>
        </div>

        <div class="restaurant-description">
          <h3>Descripción</h3>
          <p>${restaurantData.description || "Sin descripción disponible"}</p>
        </div>

        ${
          isAuthenticated
            ? `
          <div class="review-form-section">
            <h3>Escribir una reseña</h3>
            <button class="btn-primary" onclick="window.FoodieRank.reviews.openReviewModal('restaurant', '${restaurantId}')">
              Escribir Reseña
            </button>
          </div>
        `
            : '<p class="login-prompt">Inicia sesión para escribir una reseña</p>'
        }

        <div class="reviews-section">
          <h3>Reseñas (${reviewCount})</h3>
          <div class="reviews-list">
            ${
              reviewCount > 0
                ? reviewsArray
                    .map(
                      (review) => `
              <div class="review-item">
                <div class="review-header">
                  <span class="reviewer-name">${review.userId?.name || review.user?.name || "Usuario anónimo"}</span>
                  <span class="review-rating">${window.FoodieRank.utils.generateStars(review.rating)}</span>
                  <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
              </div>
            `,
                    )
                    .join("")
                : '<p class="no-reviews">No hay reseñas aún</p>'
            }
          </div>
        </div>
      </div>
    `
  }

  function displayDishModal(dish, reviews, dishId) {
    const container = document.getElementById("dishDetails")
    if (!container) return

    // Verificar autenticación de manera segura
    const isAuthenticated = window.FoodieRank.auth && window.FoodieRank.auth.isAuthenticated()

    // FIXED: Extract dish data properly
    const dishData = dish.data || dish
    const actualDishId = dishId || dishData._id

    const reviewsArray = Array.isArray(reviews) ? reviews : []
    const reviewCount = reviewsArray.length

    console.log("Displaying dish modal with ID:", actualDishId) // Debug
    console.log("Dish reviews to display:", reviewsArray) // Debug

    container.innerHTML = `
      <div class="dish-detail" data-dish-id="${actualDishId}">
        <div class="dish-header">
          <img src="${dishData.image || "/images/default-dish.jpg"}" 
               alt="${dishData.name}" class="dish-detail-image">
          <div class="dish-detail-info">
            <h2>${dishData.name}</h2>
            <p class="dish-price">${window.FoodieRank.utils.formatPrice(dishData.price || 0)}</p>
            <div class="rating">
              <span class="stars">${window.FoodieRank.utils.generateStars(dishData.averageRating || 0)}</span>
              <span class="rating-text">${(dishData.averageRating || 0).toFixed(1)}/5 (${reviewCount} reseñas)</span>
            </div>
            <p class="restaurant-info">En: ${dishData.restaurant?.name || dishData.restaurantId?.name || "Restaurante"}</p>
          </div>
        </div>

        <div class="dish-description">
          <h3>Descripción</h3>
          <p>${dishData.description || "Sin descripción disponible"}</p>

          ${
            dishData.ingredients && dishData.ingredients.length > 0
              ? `
            <div class="ingredients">
              <h4>Ingredientes:</h4>
              <p>${dishData.ingredients.join(", ")}</p>
            </div>
          `
              : ""
          }
          
          ${
            dishData.allergens && dishData.allergens.length > 0
              ? `
            <div class="allergens">
              <h4>Alérgenos:</h4>
              <p>${dishData.allergens.join(", ")}</p>
            </div>
          `
              : ""
          }
        </div>

        ${
          isAuthenticated
            ? `
          <div class="review-form-section">
            <h3>Escribir una reseña</h3>
            <button class="btn-primary" onclick="window.FoodieRank.reviews.openReviewModal('dish', '${actualDishId}')">
              Escribir Reseña
            </button>
          </div>
        `
            : '<p class="login-prompt">Inicia sesión para escribir una reseña</p>'
        }

        <div class="reviews-section">
          <h3>Reseñas (${reviewCount})</h3>
          <div class="reviews-list">
            ${
              reviewCount > 0
                ? reviewsArray
                    .map(
                      (review) => `
              <div class="review-item">
                <div class="review-header">
                  <span class="reviewer-name">${review.userId?.name || review.user?.name || "Usuario anónimo"}</span>
                  <span class="review-rating">${window.FoodieRank.utils.generateStars(review.rating)}</span>
                  <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
              </div>
            `,
                    )
                    .join("")
                : '<p class="no-reviews">No hay reseñas aún</p>'
            }
          </div>
        </div>
      </div>
    `
  }

  // Filtrar por categoría
  function filterByCategory(categoryId) {
    const filters = {
      category: categoryId,
      page: 1,
    }

    window.FoodieRank.utils.setCurrentPage(1)
    loadDishes(filters)
    loadRestaurants(filters)

    // Scroll to restaurants section
    document.getElementById("restaurantes").scrollIntoView({ behavior: "smooth" })
  }

  // Configurar filtros de restaurantes
  async function setupRestaurantFilters() {
    try {
      const categories = await loadCategoriesForFilters()
      const cuisineFilter = document.getElementById("cuisineFilter")

      if (cuisineFilter && categories.length > 0) {
        // Agregar opciones de cocina basadas en categorías
        const cuisineOptions = categories.map((cat) => `<option value="${cat.name}">${cat.name}</option>`).join("")
        cuisineFilter.innerHTML = '<option value="">Todos los tipos de cocina</option>' + cuisineOptions
      }
    } catch (error) {
      console.error("Error setting up filters:", error)
    }
  }

  // Exponer módulo globalmente
  window.FoodieRank = window.FoodieRank || {}
  window.FoodieRank.restaurants = {
    loadCategories,
    loadRestaurants,
    loadDishes,
    showRestaurantDetails,
    showDishDetails,
    filterByCategory,
    setupRestaurantFilters,
  }
})()
