// Authentication Module - Corregido y funcional
(() => {
  // Variables privadas del módulo
  let currentUser = null;
  let authToken = null;

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
    };
  }

  function updateAuthUI() {
    const elements = getElements();

    if (currentUser && authToken) {
      // Mostrar menú de usuario logueado
      if (elements.loginBtn) elements.loginBtn.style.display = "none";
      if (elements.registerBtn) elements.registerBtn.style.display = "none";
      if (elements.userMenu) elements.userMenu.style.display = "block";
      if (elements.userName) elements.userName.textContent = currentUser.name;

      // Mostrar funciones de administrador si es admin
      if (currentUser.role === "admin") {
        showAdminFeatures();
      }

      // ← AGREGAR ESTO: Actualizar modales abiertos
      updateModalsForAuthenticatedUser();
    } else {
      // Mostrar botones de login/register
      if (elements.loginBtn) elements.loginBtn.style.display = "block";
      if (elements.registerBtn) elements.registerBtn.style.display = "block";
      if (elements.userMenu) elements.userMenu.style.display = "none";
      hideAdminFeatures();
    }
  }

    function updateModalsForAuthenticatedUser() {
    // Si hay un modal de restaurante o plato abierto, actualizarlo
    const restaurantModal = document.getElementById("restaurantModal");
    const dishModal = document.getElementById("dishModal");
    
    if (restaurantModal && restaurantModal.style.display === "block") {
      const restaurantId = restaurantModal.querySelector(".restaurant-detail")?.dataset?.id;
      if (restaurantId) {
        window.FoodieRank.restaurants.showRestaurantDetails(restaurantId);
      }
    }
    
    if (dishModal && dishModal.style.display === "block") {
      const dishId = dishModal.querySelector(".dish-detail")?.dataset?.id;
      if (dishId) {
        window.FoodieRank.restaurants.showDishDetails(dishId);
      }
    }
  }

  function showAdminFeatures() {
    // Agregar botones de administrador en la sección de restaurantes
    const restaurantsSection = document.querySelector(".restaurants-section .section-header");
    if (restaurantsSection && !document.getElementById("addRestaurantBtn")) {
      const addRestaurantBtn = document.createElement("button");
      addRestaurantBtn.id = "addRestaurantBtn";
      addRestaurantBtn.className = "btn-primary";
      addRestaurantBtn.textContent = "+ Agregar Restaurante";
      addRestaurantBtn.style.marginLeft = "10px";
      addRestaurantBtn.onclick = () => {
        if (window.FoodieRank && window.FoodieRank.admin) {
          window.FoodieRank.admin.showCreateRestaurantModal();
        }
      };
      restaurantsSection.appendChild(addRestaurantBtn);
    }

    // Agregar botones de administrador en la sección de platos
    const dishesSection = document.querySelector(".dishes-section .container h2");
    if (dishesSection && !document.getElementById("addDishBtn")) {
      const addDishBtn = document.createElement("button");
      addDishBtn.id = "addDishBtn";
      addDishBtn.className = "btn-primary";
      addDishBtn.textContent = "+ Agregar Plato";
      addDishBtn.style.marginLeft = "10px";
      addDishBtn.onclick = () => {
        if (window.FoodieRank && window.FoodieRank.admin) {
          window.FoodieRank.admin.showCreateDishModal();
        }
      };
      dishesSection.parentNode.insertBefore(addDishBtn, dishesSection.nextSibling);
    }
  }

  function hideAdminFeatures() {
    const addRestaurantBtn = document.getElementById("addRestaurantBtn");
    const addDishBtn = document.getElementById("addDishBtn");
    if (addRestaurantBtn) addRestaurantBtn.remove();
    if (addDishBtn) addDishBtn.remove();
  }

  async function handleLogin(event) {
    event.preventDefault();

    const elements = getElements();
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;

    if (!email || !password) {
      window.FoodieRank.utils.showNotification("Por favor completa todos los campos", "error");
      return;
    }

    try {
      const response = await window.FoodieRank.api.login(email, password);

      if (response.token && response.user) {
        authToken = response.token;
        currentUser = response.user;

        // Guardar en localStorage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        updateAuthUI();

        // Cerrar modal y mostrar notificación
        window.FoodieRank.utils.closeModal("loginModal");
        window.FoodieRank.utils.showNotification("¡Inicio de sesión exitoso!", "success");

        // Limpiar formulario
        elements.loginForm.reset();

        // Redirect to restaurants
        window.location.hash = "#restaurantes";
        document.getElementById("restaurantes").scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Login error:", error);
      window.FoodieRank.utils.showNotification(error.message || "Error al iniciar sesión", "error");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    const elements = getElements();
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const phone = elements.registerPhone.value.trim();

    if (!name || !email || !password || !phone) {
      window.FoodieRank.utils.showNotification("Por favor completa todos los campos", "error");
      return;
    }

    if (password.length < 6) {
      window.FoodieRank.utils.showNotification("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    const userData = { name, email, password, phone };

    try {
      const response = await window.FoodieRank.api.register(userData);
      
      if (response.token && response.user) {
        authToken = response.token;
        currentUser = response.user;

        // Guardar en localStorage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        updateAuthUI();
        window.FoodieRank.utils.closeModal("registerModal");
        window.FoodieRank.utils.showNotification("¡Registro exitoso!", "success");

        // Limpiar formulario
        elements.registerForm.reset();

        // Redirect to restaurants
        window.location.hash = "#restaurantes";
        document.getElementById("restaurantes").scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Register error:", error);
      window.FoodieRank.utils.showNotification(error.message || "Error al registrarse", "error");
    }
  }

  function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    updateAuthUI();
    window.FoodieRank.utils.showNotification("Sesión cerrada", "info");

    window.location.hash = "#inicio";
    document.getElementById("inicio").scrollIntoView({ behavior: "smooth" });
  }

  function initAuth() {
    // Cargar datos guardados con validación
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (savedToken && savedUser) {
      try {
        // Validar que savedUser no sea "undefined" como string
        if (savedUser === "undefined") {
          throw new Error("Invalid user data");
        }

        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        // Limpiar datos corruptos
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        authToken = null;
        currentUser = null;
      }
    }

    updateAuthUI();
    setupAuthEventListeners();
  }

  function setupAuthEventListeners() {
    const elements = getElements();

    // Event listeners para botones
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener("click", () => {
        window.FoodieRank.utils.openModal("loginModal");
      });
    }

    if (elements.registerBtn) {
      elements.registerBtn.addEventListener("click", () => {
        window.FoodieRank.utils.openModal("registerModal");
      });
    }

    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener("click", handleLogout);
    }

    // Event listeners para formularios
    if (elements.loginForm) {
      elements.loginForm.addEventListener("submit", handleLogin);
    }

    if (elements.registerForm) {
      elements.registerForm.addEventListener("submit", handleRegister);
    }
  }

  // Funciones públicas
  function getCurrentUser() {
    return currentUser;
  }

  function getAuthToken() {
    return authToken;
  }

  function isAuthenticated() {
    return !!authToken && !!currentUser;
  }

  function isAdmin() {
    return currentUser && currentUser.role === "admin";
  }

  // Exponer módulo globalmente
  window.FoodieRank = window.FoodieRank || {};
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
  };
})();