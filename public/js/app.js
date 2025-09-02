// Main Application Module - Corregido y funcional
(() => {
  // Variables globales de la aplicación
  let isAppInitialized = false;

  // Inicializar la aplicación
  function initApp() {
    if (isAppInitialized) return;
  
    console.log("🍽️ Inicializando FoodieRank...");
  
    try {
      // 1. Inicializar autenticación PRIMERO
      if (window.FoodieRank.auth) {
        window.FoodieRank.auth.initAuth();
        console.log('Auth initialized'); // Debug
      }
    
      // 2. Configurar event listeners generales
      setupGlobalEventListeners();
      console.log('Event listeners setup'); // Debug
    
      // 3. Cargar datos iniciales
      loadInitialData();
      console.log('Initial data loaded'); // Debug
    
      isAppInitialized = true;
      console.log("✅ FoodieRank inicializado correctamente");
    
    } catch (error) {
      console.error("❌ Error al inicializar FoodieRank:", error);
      window.FoodieRank.utils.showNotification("Error al inicializar la aplicación", "error");
    }
  }

  // Configurar event listeners globales
  function setupGlobalEventListeners() {
    // Event listeners para modales
    setupModalEventListeners();

    // Event listeners para búsqueda
    setupSearchEventListeners();

    // Event listeners para filtros
    setupFilterEventListeners();

    // Event listeners para navegación
    setupNavigationEventListeners();
  }

  // Configurar event listeners para modales
  function setupModalEventListeners() {
    // Cerrar modales con el botón X
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("close")) {
        const modal = e.target.closest(".modal");
        if (modal) {
          modal.style.display = "none";
        }
      }
    });

    // Cerrar modales haciendo clic fuera
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });

    // Cerrar modales con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal[style*='display: block']");
        if (openModal) {
          openModal.style.display = "none";
        }
      }
    });
  }

  // Configurar event listeners para búsqueda
  function setupSearchEventListeners() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn) {
      searchBtn.addEventListener("click", window.FoodieRank.utils.handleSearch);
    }

    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          window.FoodieRank.utils.handleSearch();
        }
      });

      // Búsqueda en tiempo real (opcional, con debounce)
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (e.target.value.length >= 3 || e.target.value.length === 0) {
            window.FoodieRank.utils.handleSearch();
          }
        }, 500);
      });
    }
  }

  // Configurar event listeners para filtros
  function setupFilterEventListeners() {
    const cuisineFilter = document.getElementById("cuisineFilter");
    const priceFilter = document.getElementById("priceFilter");

    if (cuisineFilter) {
      cuisineFilter.addEventListener("change", window.FoodieRank.utils.handleCuisineFilter);
    }

    if (priceFilter) {
      priceFilter.addEventListener("change", window.FoodieRank.utils.handlePriceFilter);
    }
  }

  // Configurar navegación suave
  function setupNavigationEventListeners() {
    // Navegación suave para enlaces ancla
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  }

  // Cargar datos iniciales
  async function loadInitialData() {
  try {
    // Verificar conectividad de forma más robusta
    let isConnected = false;
    
    // Intentar verificar conexión si la función existe
    if (window.FoodieRank.api && typeof window.FoodieRank.api.testConnection === 'function') {
      isConnected = await window.FoodieRank.api.testConnection();
    } else {
      // Si no existe la función, intentar una conexión básica
      try {
        const response = await fetch('http://localhost:3000/api/v1/categories?limit=1', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        isConnected = response.ok;
      } catch (error) {
        isConnected = false;
      }
    }
    
    if (!isConnected) {
      console.error("Backend no disponible en http://localhost:3000/api");
      window.FoodieRank.utils.showNotification(
        "Error: Backend no disponible. Verifica que el servidor esté corriendo en puerto 3000.", 
        "error"
      );
      
      // Mostrar datos de ejemplo o mensaje de error
      showOfflineMode();
      return;
    }

    // Cargar datos en paralelo para mejor performance
    const loadPromises = [];

    if (window.FoodieRank.restaurants) {
      loadPromises.push(window.FoodieRank.restaurants.loadCategories());
      loadPromises.push(window.FoodieRank.restaurants.loadRestaurants());
      loadPromises.push(window.FoodieRank.restaurants.loadDishes());
    }

    await Promise.all(loadPromises.map(p => p.catch(e => {
      console.error("Error loading data:", e);
      return null;
    })));
  } catch (error) {
    console.error("Error loading initial data:", error);
    window.FoodieRank.utils.showNotification("Error al cargar datos iniciales", "error");
  }
}

// Función para mostrar modo offline
function showOfflineMode() {
  const grids = ["categoriesGrid", "restaurantsGrid", "dishesGrid"];
  grids.forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (grid) {
      grid.innerHTML = `
        <div class="error" style="text-align: center; padding: 2rem;">
          <h3>Servicio no disponible</h3>
          <p>El backend no está disponible. Verifica que el servidor esté ejecutándose en http://localhost:3000</p>
          <button class="btn-primary" onclick="window.FoodieRank.app.retryConnection()">
            Reintentar conexión
          </button>
        </div>
      `;
    }
  });
}

// Agregar función de reintento
function retryConnection() {
  window.FoodieRank.app.showLoadingState();
  setTimeout(() => {
    window.FoodieRank.app.loadInitialData();
  }, 1000);
}

  // Configurar filtros
  async function setupFilters() {
    try {
      if (window.FoodieRank.restaurants) {
        await window.FoodieRank.restaurants.setupRestaurantFilters();
      }
    } catch (error) {
      console.error("Error setting up filters:", error);
    }
  }

  // Manejar errores globales
  function setupGlobalErrorHandling() {
    // Manejar errores de JavaScript
    window.addEventListener("error", (e) => {
      console.error("Error global:", e.error);
      window.FoodieRank.utils.showNotification("Ha ocurrido un error inesperado", "error");
    });

    // Manejar promesas rechazadas
    window.addEventListener("unhandledrejection", (e) => {
      console.error("Promesa rechazada:", e.reason);
      window.FoodieRank.utils.showNotification("Error de conexión", "error");
    });
  }

  // Funciones de utilidad para la aplicación
  function refreshData() {
    if (window.FoodieRank.restaurants) {
      window.FoodieRank.restaurants.loadRestaurants();
      window.FoodieRank.restaurants.loadDishes();
    }
  }

  function showLoadingState() {
    const grids = ["categoriesGrid", "restaurantsGrid", "dishesGrid"];
    grids.forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (grid) {
        window.FoodieRank.utils.showLoading(grid);
      }
    });
  }

  // Función para reinicializar la aplicación (si es necesario)
  function reinitializeApp() {
    isAppInitialized = false;
    initApp();
  }

  // Configurar manejo de estado de conexión
  function setupConnectionHandling() {
    window.addEventListener("online", () => {
      window.FoodieRank.utils.showNotification("Conexión restaurada", "success");
      refreshData();
    });

    window.addEventListener("offline", () => {
      window.FoodieRank.utils.showNotification("Sin conexión a internet", "error");
    });
  }

  // Configurar lazy loading para imágenes
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      // Observar imágenes con lazy loading
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Event listener principal para inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Configurar otros manejadores
  setupGlobalErrorHandling();
  setupConnectionHandling();

  // Exponer funciones globalmente si es necesario
  window.FoodieRank = window.FoodieRank || {};
  window.FoodieRank.app = {
    initApp,
    refreshData,
    showLoadingState,
    reinitializeApp,
    loadInitialData, // Agregar esta línea
    retryConnection 
  };

  // Hacer algunas funciones disponibles globalmente para compatibilidad
  window.changePage = window.FoodieRank.utils.changePage;
})();

// Asegurar que la aplicación se inicialice
console.log("🚀 FoodieRank cargando...");