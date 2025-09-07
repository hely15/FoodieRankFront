// Utilities Module - Corregido y funcional
;(() => {
  // Variables globales
  let currentFilters = {}
  let currentPage = 1

  // DOM Elements getter
  function getElements() {
    return {
      // Auth elements
      loginBtn: document.getElementById("loginBtn"),
      registerBtn: document.getElementById("registerBtn"),
      logoutBtn: document.getElementById("logoutBtn"),
      userMenu: document.getElementById("userMenu"),
      userName: document.getElementById("userName"),
      loginForm: document.getElementById("loginForm"),
      registerForm: document.getElementById("registerForm"),

      // Search elements
      searchInput: document.getElementById("searchInput"),
      searchBtn: document.getElementById("searchBtn"),

      // Filter elements
      cuisineFilter: document.getElementById("cuisineFilter"),
      priceFilter: document.getElementById("priceFilter"),

      // Content grids
      categoriesGrid: document.getElementById("categoriesGrid"),
      restaurantsGrid: document.getElementById("restaurantsGrid"),
      dishesGrid: document.getElementById("dishesGrid"),
      pagination: document.getElementById("pagination"),
    }
  }

  // Utility Functions
  function showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="loading">Cargando...</div>'
    }
  }

  function showError(element, message) {
    if (element) {
      element.innerHTML = `<div class="error">Error: ${message}</div>`
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price)
  }

  function generateStars(rating) {
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStar

    let starsHTML = ""

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star filled">★</span>'
    }

    // Add half star if needed
    if (halfStar) {
      starsHTML += '<span class="star half">★</span>'
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="star empty">☆</span>'
    }

    return starsHTML
  }

  function truncateText(text, maxLength) {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // Modal Functions
  function openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      console.log("Modal opened:", modalId) // Debug
    } else {
      console.log("Modal not found:", modalId) // Debug
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
      console.log("Modal closed:", modalId) // Debug
    } else {
      console.log("Modal not found for closing:", modalId) // Debug
    }
  }

  // Notification Function
  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification")
    existingNotifications.forEach((n) => n.remove())

    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `

    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px;">&times;</button>
    `

    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  // Search and Filter Functions
  function handleSearch() {
    const elements = getElements()
    const searchTerm = elements.searchInput.value.trim()

    if (searchTerm) {
      currentFilters.search = searchTerm
    } else {
      delete currentFilters.search
    }

    currentPage = 1

    if (window.FoodieRank && window.FoodieRank.restaurants) {
      window.FoodieRank.restaurants.loadRestaurants(currentFilters)
    }
  }

  function handleCuisineFilter() {
    const elements = getElements()
    const cuisine = elements.cuisineFilter.value

    if (cuisine) {
      currentFilters.cuisine = cuisine
    } else {
      delete currentFilters.cuisine
    }

    currentPage = 1

    if (window.FoodieRank && window.FoodieRank.restaurants) {
      window.FoodieRank.restaurants.loadRestaurants(currentFilters)
    }
  }

  function handlePriceFilter() {
    const elements = getElements()
    const priceRange = elements.priceFilter.value

    if (priceRange) {
      currentFilters.priceRange = priceRange
    } else {
      delete currentFilters.priceRange
    }

    currentPage = 1

    if (window.FoodieRank && window.FoodieRank.restaurants) {
      window.FoodieRank.restaurants.loadRestaurants(currentFilters)
    }
  }

  // Pagination Functions
  function updatePagination(paginationInfo) {
    const elements = getElements()

    if (!paginationInfo || !elements.pagination) return

    const { total, page, limit } = paginationInfo
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) {
      elements.pagination.innerHTML = ""
      return
    }

    let paginationHTML = ""

    // Previous button
    if (page > 1) {
      paginationHTML += `<button class="pagination-btn" onclick="window.FoodieRank.utils.changePage(${page - 1})">Anterior</button>`
    }

    // Page numbers
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        paginationHTML += `<button class="pagination-btn active">${i}</button>`
      } else {
        paginationHTML += `<button class="pagination-btn" onclick="window.FoodieRank.utils.changePage(${i})">${i}</button>`
      }
    }

    // Next button
    if (page < totalPages) {
      paginationHTML += `<button class="pagination-btn" onclick="window.FoodieRank.utils.changePage(${page + 1})">Siguiente</button>`
    }

    elements.pagination.innerHTML = paginationHTML
  }

  function changePage(page) {
    currentPage = page

    if (window.FoodieRank && window.FoodieRank.restaurants) {
      window.FoodieRank.restaurants.loadRestaurants({
        ...currentFilters,
        page: currentPage,
      })
    }
  }

  // Get current filters and page
  function getCurrentFilters() {
    return { ...currentFilters }
  }

  function getCurrentPage() {
    return currentPage
  }

  function setCurrentPage(page) {
    currentPage = page
  }

  function setCurrentFilters(filters) {
    currentFilters = { ...filters }
  }

  // CSS para animación de notificaciones
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)

  // Exponer utilidades globalmente
  window.FoodieRank = window.FoodieRank || {}
  window.FoodieRank.utils = {
    getElements,
    showLoading,
    showError,
    formatPrice,
    generateStars,
    truncateText,
    openModal,
    closeModal,
    showNotification,
    handleSearch,
    handleCuisineFilter,
    handlePriceFilter,
    updatePagination,
    changePage,
    getCurrentFilters,
    getCurrentPage,
    setCurrentPage,
    setCurrentFilters,
  }
})()
