// Authentication Module - Fixed login response handling
;(() => {
  // Variables privadas del módulo
  let currentUser = null
  let authToken = null

  function getElements() {
    return {
      loginBtn: document.getElementById("loginBtn"),
      registerBtn: document.getElementById("registerBtn"),
      logoutBtn: document.getElementById("logoutBtn"),
      userMenu: document.getElementById("userMenu"),
      userName: document.getElementById("userName"),
      loginForm: document.getElementById("loginForm"),
      registerForm: document.getElementById("registerForm"),
      loginEmail: document.getElementById("loginEmail"),
      loginPassword: document.getElementById("loginPassword"),
      registerName: document.getElementById("registerName"),
      registerEmail: document.getElementById("registerEmail"),
      registerPassword: document.getElementById("registerPassword"),
      registerPhone: document.getElementById("registerPhone"),
    }
  }

  function updateAuthUI() {
    const elements = getElements()

    if (currentUser && authToken) {
      // Mostrar menú de usuario logueado
      if (elements.loginBtn) elements.loginBtn.style.display = "none"
      if (elements.registerBtn) elements.registerBtn.style.display = "none"
      if (elements.userMenu) elements.userMenu.style.display = "block"
      if (elements.userName) elements.userName.textContent = currentUser.name

      // Mostrar funciones de administrador si es admin
      if (currentUser.role === "admin") {
        showAdminFeatures()
      }

      // AGREGAR ESTO: Actualizar modales abiertos
      updateModalsForAuthenticatedUser()
    } else {
      // Mostrar botones de login/register
      if (elements.loginBtn) elements.loginBtn.style.display = "block"
      if (elements.registerBtn) elements.registerBtn.style.display = "block"
      if (elements.userMenu) elements.userMenu.style.display = "none"
      hideAdminFeatures()
    }
  }

  function updateModalsForAuthenticatedUser() {
    // Si hay un modal de restaurante o plato abierto, actualizarlo
    const restaurantModal = document.getElementById("restaurantModal")
    const dishModal = document.getElementById("dishModal")

    if (restaurantModal && restaurantModal.style.display === "block") {
      const restaurantId = restaurantModal.querySelector(".restaurant-detail")?.dataset?.id
      if (restaurantId) {
        window.FoodieRank.restaurants.showRestaurantDetails(restaurantId)
      }
    }

    if (dishModal && dishModal.style.display === "block") {
      const dishId = dishModal.querySelector(".dish-detail")?.dataset?.id
      if (dishId) {
        window.FoodieRank.restaurants.showDishDetails(dishId)
      }
    }
  }

  function showAdminFeatures() {
    // Agregar botón de administrador en la sección de categorías
    const categoriesSection = document.querySelector(".categories-section .container h2")
    if (categoriesSection && !document.getElementById("addCategoryBtn")) {
      const addCategoryBtn = document.createElement("button")
      addCategoryBtn.id = "addCategoryBtn"
      addCategoryBtn.className = "btn-primary"
      addCategoryBtn.textContent = "+ Agregar Categoría"
      addCategoryBtn.style.marginLeft = "10px"
      addCategoryBtn.onclick = () => {
        if (window.FoodieRank && window.FoodieRank.admin) {
          window.FoodieRank.admin.showCreateCategoryModal()
        }
      }
      categoriesSection.parentNode.insertBefore(addCategoryBtn, categoriesSection.nextSibling)
    }

    // Agregar botones de administrador en la sección de restaurantes
    const restaurantsSection = document.querySelector(".restaurants-section .section-header")
    if (restaurantsSection && !document.getElementById("addRestaurantBtn")) {
      const addRestaurantBtn = document.createElement("button")
      addRestaurantBtn.id = "addRestaurantBtn"
      addRestaurantBtn.className = "btn-primary"
      addRestaurantBtn.textContent = "+ Agregar Restaurante"
      addRestaurantBtn.style.marginLeft = "10px"
      addRestaurantBtn.onclick = () => {
        if (window.FoodieRank && window.FoodieRank.admin) {
          window.FoodieRank.admin.showCreateRestaurantModal()
        }
      }
      restaurantsSection.appendChild(addRestaurantBtn)
    }

    // Agregar botones de administrador en la sección de platos
    const dishesSection = document.querySelector(".dishes-section .container h2")
    if (dishesSection && !document.getElementById("addDishBtn")) {
      const addDishBtn = document.createElement("button")
      addDishBtn.id = "addDishBtn"
      addDishBtn.className = "btn-primary"
      addDishBtn.textContent = "+ Agregar Plato"
      addDishBtn.style.marginLeft = "10px"
      addDishBtn.onclick = () => {
        if (window.FoodieRank && window.FoodieRank.admin) {
          window.FoodieRank.admin.showCreateDishModal()
        }
      }
      dishesSection.parentNode.insertBefore(addDishBtn, dishesSection.nextSibling)
    }
  }

  function hideAdminFeatures() {
    const addCategoryBtn = document.getElementById("addCategoryBtn")
    const addRestaurantBtn = document.getElementById("addRestaurantBtn")
    const addDishBtn = document.getElementById("addDishBtn")
    if (addCategoryBtn) addCategoryBtn.remove()
    if (addRestaurantBtn) addRestaurantBtn.remove()
    if (addDishBtn) addDishBtn.remove()
  }

  async function handleLogin(event) {
    event.preventDefault()
    console.log("Handle login initiated") // Debug

    const elements = getElements()
    const email = elements.loginEmail.value.trim()
    const password = elements.loginPassword.value

    if (!email || !password) {
      window.FoodieRank.utils.showNotification("Por favor completa todos los campos", "error")
      return
    }

    try {
      const response = await window.FoodieRank.api.login(email, password)
      console.log("Login API response:", response) // Debug

      // FIXED: Handle different response structures from backend
      let token = null
      let user = null

      if (response.token && response.user) {
        // Direct structure
        token = response.token
        user = response.user
      } else if (response.token && response.data) {
        // Backend returns user in response.data
        token = response.token
        user = response.data
      } else if (response.success && response.token && response.data) {
        // Backend returns with success flag
        token = response.token
        user = response.data
      }

      if (token && user) {
        authToken = token
        currentUser = user

        // Guardar en localStorage
        localStorage.setItem("authToken", authToken)
        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        console.log("User authenticated:", currentUser) // Debug

        // ACTUALIZAR LA UI INMEDIATAMENTE
        updateAuthUI()

        // Cerrar modal y mostrar notificación
        window.FoodieRank.utils.closeModal("loginModal")
        window.FoodieRank.utils.showNotification("¡Inicio de sesión exitoso!", "success")

        // Limpiar formulario
        elements.loginForm.reset()

        // FORZAR ACTUALIZACIÓN DE MODALES ABIERTOS
        setTimeout(() => {
          refreshOpenModals()
        }, 100)

        // Redirect to restaurants
        window.location.hash = "#restaurantes"
        document.getElementById("restaurantes").scrollIntoView({ behavior: "smooth" })
      } else {
        throw new Error("Respuesta de login inválida del servidor")
      }
    } catch (error) {
      console.error("Login error:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al iniciar sesión", "error")
    }
  }

  // AGREGAR ESTA NUEVA FUNCIÓN
  function refreshOpenModals() {
    console.log("Refreshing open modals...") // Debug

    // Actualizar modal de restaurante si está abierto
    const restaurantModal = document.getElementById("restaurantModal")
    if (restaurantModal && restaurantModal.style.display === "block") {
      const restaurantId = restaurantModal.querySelector(".restaurant-card")?.dataset?.restaurantId
      if (restaurantId) {
        console.log("Refreshing restaurant modal:", restaurantId)
        window.FoodieRank.restaurants.showRestaurantDetails(restaurantId)
      }
    }

    // Actualizar modal de plato si está abierto
    const dishModal = document.getElementById("dishModal")
    if (dishModal && dishModal.style.display === "block") {
      const dishId = dishModal.querySelector(".dish-card")?.dataset?.dishId
      if (dishId) {
        console.log("Refreshing dish modal:", dishId)
        window.FoodieRank.restaurants.showDishDetails(dishId)
      }
    }
  }

  async function handleRegister(event) {
    event.preventDefault()

    const elements = getElements()
    const name = elements.registerName.value.trim()
    const email = elements.registerEmail.value.trim()
    const password = elements.registerPassword.value
    const phone = elements.registerPhone.value.trim()

    if (!name || !email || !password || !phone) {
      window.FoodieRank.utils.showNotification("Por favor completa todos los campos", "error")
      return
    }

    if (password.length < 6) {
      window.FoodieRank.utils.showNotification("La contraseña debe tener al menos 6 caracteres", "error")
      return
    }

    const userData = { name, email, password, phone }

    try {
      const response = await window.FoodieRank.api.register(userData)

      // Handle different response structures for register too
      let token = null
      let user = null

      if (response.token && response.user) {
        token = response.token
        user = response.user
      } else if (response.token && response.data) {
        token = response.token
        user = response.data
      } else if (response.success && response.token && response.data) {
        token = response.token
        user = response.data
      }

      if (token && user) {
        authToken = token
        currentUser = user

        // Guardar en localStorage
        localStorage.setItem("authToken", authToken)
        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        updateAuthUI()
        window.FoodieRank.utils.closeModal("registerModal")
        window.FoodieRank.utils.showNotification("¡Registro exitoso!", "success")

        // Limpiar formulario
        elements.registerForm.reset()

        // Redirect to restaurants
        window.location.hash = "#restaurantes"
        document.getElementById("restaurantes").scrollIntoView({ behavior: "smooth" })
      } else {
        throw new Error("Respuesta de registro inválida del servidor")
      }
    } catch (error) {
      console.error("Register error:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al registrarse", "error")
    }
  }

  function handleLogout() {
    authToken = null
    currentUser = null
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    updateAuthUI()
    window.FoodieRank.utils.showNotification("Sesión cerrada", "info")

    window.location.hash = "#inicio"
    document.getElementById("inicio").scrollIntoView({ behavior: "smooth" })
  }

  function initAuth() {
    // Cargar datos guardados con validación
    const savedToken = localStorage.getItem("authToken")
    const savedUser = localStorage.getItem("currentUser")

    if (savedToken && savedUser) {
      try {
        // Validar que savedUser no sea "undefined" como string
        if (savedUser === "undefined") {
          throw new Error("Invalid user data")
        }

        authToken = savedToken
        currentUser = JSON.parse(savedUser)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        // Limpiar datos corruptos
        localStorage.removeItem("authToken")
        localStorage.removeItem("currentUser")
        authToken = null
        currentUser = null
      }
    }

    updateAuthUI()
    setupAuthEventListeners()
  }

  function setupAuthEventListeners() {
    const elements = getElements()

    console.log("Setting up auth event listeners...") // Debug

    // Event listeners para botones
    if (elements.loginBtn) {
      console.log("Login button found") // Debug
      elements.loginBtn.addEventListener("click", () => {
        console.log("Login button clicked") // Debug
        window.FoodieRank.utils.openModal("loginModal")
      })
    } else {
      console.log("Login button NOT found") // Debug
    }

    if (elements.registerBtn) {
      elements.registerBtn.addEventListener("click", () => {
        window.FoodieRank.utils.openModal("registerModal")
      })
    }

    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener("click", handleLogout)
    }

    // Event listeners para formularios - ¡ESTOS SON LOS IMPORTANTES!
    if (elements.loginForm) {
      console.log("Login form found") // Debug
      elements.loginForm.addEventListener("submit", handleLogin)
    } else {
      console.log("Login form NOT found") // Debug
    }

    if (elements.registerForm) {
      elements.registerForm.addEventListener("submit", handleRegister)
    }

    // También agrega event listeners para los botones de cerrar modal
    const closeLogin = document.getElementById("closeLogin")
    const closeRegister = document.getElementById("closeRegister")

    if (closeLogin) {
      closeLogin.addEventListener("click", () => {
        window.FoodieRank.utils.closeModal("loginModal")
      })
    }

    if (closeRegister) {
      closeRegister.addEventListener("click", () => {
        window.FoodieRank.utils.closeModal("registerModal")
      })
    }
  }

  // Funciones públicas
  function getCurrentUser() {
    return currentUser
  }

  function getAuthToken() {
    return authToken
  }

  function isAuthenticated() {
    const isAuth = !!authToken && !!currentUser
    console.log("isAuthenticated check:", { hasToken: !!authToken, hasUser: !!currentUser, result: isAuth }) // Debug
    return isAuth
  }

  function isAdmin() {
    return currentUser && currentUser.role === "admin"
  }

  // Exponer módulo globalmente
  window.FoodieRank = window.FoodieRank || {}
  window.FoodieRank.auth = {
    handleLogin,
    handleRegister,
    handleLogout,
    initAuth,
    getCurrentUser,
    getAuthToken,
    isAuthenticated,
    isAdmin,
    updateAuthUI,
  }
})()
