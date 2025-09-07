// Admin Module - Corregido y funcional
;(() => {
  // Mostrar modal para crear restaurante
  function showCreateRestaurantModal() {
    if (!window.FoodieRank.auth.isAdmin()) {
      window.FoodieRank.utils.showNotification("No tienes permisos para realizar esta acción", "error")
      return
    }

    const modalHTML = `
      <div id="createRestaurantModal" class="modal" style="display: flex;">
        <div class="modal-content modal-large">
          <span class="close" onclick="window.FoodieRank.utils.closeModal('createRestaurantModal')">&times;</span>
          <h2>Crear Restaurante</h2>
          <form id="createRestaurantForm">
            <div class="form-group">
              <label for="restaurantName">Nombre:</label>
              <input type="text" id="restaurantName" required>
            </div>
            <div class="form-group">
              <label for="restaurantDescription">Descripción:</label>
              <textarea id="restaurantDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="restaurantStreet">Dirección:</label>
              <input type="text" id="restaurantStreet" placeholder="Calle y número" required>
            </div>
            <div class="form-group">
              <label for="restaurantCity">Ciudad:</label>
              <input type="text" id="restaurantCity" required>
            </div>
            <div class="form-group">
              <label for="restaurantState">Estado:</label>
              <input type="text" id="restaurantState" required>
            </div>
            <div class="form-group">
              <label for="restaurantPhone">Teléfono:</label>
              <input type="tel" id="restaurantPhone" required>
            </div>
            <div class="form-group">
              <label for="restaurantEmail">Email:</label>
              <input type="email" id="restaurantEmail">
            </div>
            <div class="form-group">
              <label for="restaurantCuisine">Tipos de Cocina:</label>
              <input type="text" id="restaurantCuisine" placeholder="Ej: Italiana, Mediterránea" required>
            </div>
            <div class="form-group">
              <label for="restaurantPriceRange">Rango de Precios:</label>
              <select id="restaurantPriceRange" required>
                <option value="">Seleccionar...</option>
                <option value="$">$ - Económico</option>
                <option value="$$">$$ - Moderado</option>
                <option value="$$$">$$$ - Caro</option>
                <option value="$$$$">$$$$ - Muy Caro</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('createRestaurantModal')">Cancelar</button>
              <button type="submit" class="btn-primary">Crear Restaurante</button>
            </div>
          </form>
        </div>
      </div>
    `

    // Remover modal existente si existe
    const existingModal = document.getElementById("createRestaurantModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar modal al body
    document.body.insertAdjacentHTML("beforeend", modalHTML)

    // Agregar event listener al formulario
    document.getElementById("createRestaurantForm").addEventListener("submit", handleCreateRestaurant)
  }

  // Manejar creación de restaurante
  async function handleCreateRestaurant(event) {
    event.preventDefault()

    const restaurantData = {
      name: document.getElementById("restaurantName").value,
      description: document.getElementById("restaurantDescription").value,
      address: {
        street: document.getElementById("restaurantStreet").value,
        city: document.getElementById("restaurantCity").value,
        state: document.getElementById("restaurantState").value,
        country: "México",
      },
      contact: {
        phone: document.getElementById("restaurantPhone").value,
        email: document.getElementById("restaurantEmail").value,
      },
      cuisine: document
        .getElementById("restaurantCuisine")
        .value.split(",")
        .map((c) => c.trim()),
      priceRange: document.getElementById("restaurantPriceRange").value,
    }

    try {
      await window.FoodieRank.api.createRestaurant(restaurantData)
      window.FoodieRank.utils.showNotification("Restaurante creado exitosamente", "success")
      window.FoodieRank.utils.closeModal("createRestaurantModal")

      // Recargar la lista de restaurantes
      if (window.FoodieRank.restaurants) {
        window.FoodieRank.restaurants.loadRestaurants()
      }
    } catch (error) {
      console.error("Error creating restaurant:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al crear el restaurante", "error")
    }
  }

  // Mostrar modal para crear plato
  function showCreateDishModal() {
    if (!window.FoodieRank.auth.isAdmin()) {
      window.FoodieRank.utils.showNotification("No tienes permisos para realizar esta acción", "error")
      return
    }

    // Cargar restaurantes y categorías para el modal
    loadRestaurantsAndCategoriesForDish()
  }

  // Cargar restaurantes y categorías para crear plato
  async function loadRestaurantsAndCategoriesForDish() {
    try {
      const [restaurantsResponse, categoriesResponse] = await Promise.all([
        window.FoodieRank.api.getRestaurants({ limit: 100 }),
        window.FoodieRank.api.getCategories(),
      ])

      const restaurants = restaurantsResponse.restaurants || []
      const categories = categoriesResponse || []

      const modalHTML = `
        <div id="createDishModal" class="modal" style="display: flex;">
          <div class="modal-content modal-large">
            <span class="close" onclick="window.FoodieRank.utils.closeModal('createDishModal')">&times;</span>
            <h2>Crear Plato</h2>
            <form id="createDishForm">
              <div class="form-group">
                <label for="dishName">Nombre:</label>
                <input type="text" id="dishName" required>
              </div>
              <div class="form-group">
                <label for="dishDescription">Descripción:</label>
                <textarea id="dishDescription" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label for="dishPrice">Precio:</label>
                <input type="number" id="dishPrice" step="0.01" min="0" required>
              </div>
              <div class="form-group">
                <label for="dishRestaurant">Restaurante:</label>
                <select id="dishRestaurant" required>
                  <option value="">Seleccionar restaurante...</option>
                  ${restaurants
                    .map((restaurant) => `<option value="${restaurant._id}">${restaurant.name}</option>`)
                    .join("")}
                </select>
              </div>
              <div class="form-group">
                <label for="dishCategory">Categoría:</label>
                <select id="dishCategory" required>
                  <option value="">Seleccionar categoría...</option>
                  ${categories.map((category) => `<option value="${category._id}">${category.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label for="dishIngredients">Ingredientes:</label>
                <textarea id="dishIngredients" rows="2" placeholder="Separados por comas"></textarea>
              </div>
              <div class="form-group">
                <label for="dishAllergens">Alérgenos:</label>
                <textarea id="dishAllergens" rows="2" placeholder="Separados por comas"></textarea>
              </div>
              <div class="form-group">
                <label for="dishPreparationTime">Tiempo de preparación (minutos):</label>
                <input type="number" id="dishPreparationTime" min="1">
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('createDishModal')">Cancelar</button>
                <button type="submit" class="btn-primary">Crear Plato</button>
              </div>
            </form>
          </div>
        </div>
      `

      // Remover modal existente si existe
      const existingModal = document.getElementById("createDishModal")
      if (existingModal) {
        existingModal.remove()
      }

      // Agregar modal al body
      document.body.insertAdjacentHTML("beforeend", modalHTML)

      // Agregar event listener al formulario
      document.getElementById("createDishForm").addEventListener("submit", handleCreateDish)
    } catch (error) {
      console.error("Error loading data for dish creation:", error)
      window.FoodieRank.utils.showNotification("Error al cargar datos necesarios", "error")
    }
  }

  // Manejar creación de plato
  async function handleCreateDish(event) {
    event.preventDefault()

    const ingredientsValue = document.getElementById("dishIngredients").value
    const allergensValue = document.getElementById("dishAllergens").value
    const preparationTime = document.getElementById("dishPreparationTime").value

    const dishData = {
      name: document.getElementById("dishName").value,
      description: document.getElementById("dishDescription").value,
      price: Number.parseFloat(document.getElementById("dishPrice").value),
      restaurant: document.getElementById("dishRestaurant").value,
      category: document.getElementById("dishCategory").value,
      ingredients: ingredientsValue ? ingredientsValue.split(",").map((i) => i.trim()) : [],
      allergens: allergensValue ? allergensValue.split(",").map((a) => a.trim()) : [],
      preparationTime: preparationTime ? Number.parseInt(preparationTime) : undefined,
    }

    try {
      await window.FoodieRank.api.createDish(dishData)
      window.FoodieRank.utils.showNotification("Plato creado exitosamente", "success")
      window.FoodieRank.utils.closeModal("createDishModal")

      // Recargar la lista de platos
      if (window.FoodieRank.restaurants) {
        window.FoodieRank.restaurants.loadDishes()
      }
    } catch (error) {
      console.error("Error creating dish:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al crear el plato", "error")
    }
  }

  // Cargar usuarios para administración
  async function loadUsersAdmin() {
    if (!window.FoodieRank.auth.isAdmin()) return

    try {
      const users = await window.FoodieRank.api.getUsers()
      const usersContainer = document.getElementById("adminUsers")

      if (!usersContainer) return

      usersContainer.innerHTML = `
        <div class="admin-section">
          <h3>Gestión de Usuarios</h3>
          <div class="users-list">
            ${users
              .map(
                (user) => `
              <div class="user-item">
                <div class="user-info">
                  <span class="user-name">${user.name}</span>
                  <span class="user-email">${user.email}</span>
                  <span class="user-role ${user.role}">${user.role}</span>
                </div>
                <div class="user-actions">
                  <button class="btn-small btn-secondary" onclick="window.FoodieRank.admin.editUser('${user._id}')">Editar</button>
                  <button class="btn-small btn-danger" onclick="window.FoodieRank.admin.deleteUser('${user._id}')">Eliminar</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
    } catch (error) {
      console.error("Error loading users:", error)
      window.FoodieRank.utils.showNotification("Error al cargar usuarios", "error")
    }
  }

  // Eliminar usuario
  async function deleteUser(userId) {
    if (!window.FoodieRank.auth.isAdmin()) {
      window.FoodieRank.utils.showNotification("No tienes permisos para realizar esta acción", "error")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

    try {
      await window.FoodieRank.api.deleteUser(userId)
      window.FoodieRank.utils.showNotification("Usuario eliminado exitosamente", "success")
      loadUsersAdmin()
    } catch (error) {
      console.error("Error deleting user:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al eliminar el usuario", "error")
    }
  }

  // Editar usuario (funcionalidad básica)
  async function editUser(userId) {
    if (!window.FoodieRank.auth.isAdmin()) {
      window.FoodieRank.utils.showNotification("No tienes permisos para realizar esta acción", "error")
      return
    }

    try {
      const user = await window.FoodieRank.api.getUserById(userId)

      const modalHTML = `
        <div id="editUserModal" class="modal" style="display: flex;">
          <div class="modal-content">
            <span class="close" onclick="window.FoodieRank.utils.closeModal('editUserModal')">&times;</span>
            <h2>Editar Usuario</h2>
            <form id="editUserForm">
              <div class="form-group">
                <label for="editUserName">Nombre:</label>
                <input type="text" id="editUserName" value="${user.name}" required>
              </div>
              <div class="form-group">
                <label for="editUserPhone">Teléfono:</label>
                <input type="tel" id="editUserPhone" value="${user.phone || ""}">
              </div>
              <div class="form-group">
                <label for="editUserRole">Rol:</label>
                <select id="editUserRole" required>
                  <option value="user" ${user.role === "user" ? "selected" : ""}>Usuario</option>
                  <option value="admin" ${user.role === "admin" ? "selected" : ""}>Administrador</option>
                </select>
              </div>
              <div class="form-group">
                <label for="editUserActive">Estado:</label>
                <select id="editUserActive" required>
                  <option value="true" ${user.active !== false ? "selected" : ""}>Activo</option>
                  <option value="false" ${user.active === false ? "selected" : ""}>Inactivo</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('editUserModal')">Cancelar</button>
                <button type="submit" class="btn-primary">Actualizar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      `

      // Agregar modal al body
      document.body.insertAdjacentHTML("beforeend", modalHTML)

      // Event listener para el formulario
      document.getElementById("editUserForm").addEventListener("submit", async (e) => {
        e.preventDefault()

        const userData = {
          name: document.getElementById("editUserName").value,
          phone: document.getElementById("editUserPhone").value,
          role: document.getElementById("editUserRole").value,
          active: document.getElementById("editUserActive").value === "true",
        }

        try {
          await window.FoodieRank.api.updateUser(userId, userData)
          window.FoodieRank.utils.showNotification("Usuario actualizado exitosamente", "success")
          window.FoodieRank.utils.closeModal("editUserModal")
          loadUsersAdmin()
        } catch (error) {
          console.error("Error updating user:", error)
          window.FoodieRank.utils.showNotification(error.message || "Error al actualizar el usuario", "error")
        }
      })
    } catch (error) {
      console.error("Error loading user for edit:", error)
      window.FoodieRank.utils.showNotification("Error al cargar los datos del usuario", "error")
    }
  }

  // Mostrar modal para crear categoría
  function showCreateCategoryModal() {
    if (!window.FoodieRank.auth.isAdmin()) {
      window.FoodieRank.utils.showNotification("No tienes permisos para realizar esta acción", "error")
      return
    }

    const modalHTML = `
      <div id="createCategoryModal" class="modal" style="display: flex;">
        <div class="modal-content">
          <span class="close" onclick="window.FoodieRank.utils.closeModal('createCategoryModal')">&times;</span>
          <h2>Crear Categoría</h2>
          <form id="createCategoryForm">
            <div class="form-group">
              <label for="categoryName">Nombre:</label>
              <input type="text" id="categoryName" required>
            </div>
            <div class="form-group">
              <label for="categoryDescription">Descripción:</label>
              <textarea id="categoryDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="categoryIcon">Icono (emoji):</label>
              <input type="text" id="categoryIcon" placeholder="🍕" maxlength="2" required>
            </div>
            <div class="form-group">
              <label for="categoryColor">Color:</label>
              <div class="color-picker-container">
                <input type="color" id="categoryColor" class="color-picker" value="#FF6B6B" required>
                <span>Selecciona un color para la categoría</span>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('createCategoryModal')">Cancelar</button>
              <button type="submit" class="btn-primary">Crear Categoría</button>
            </div>
          </form>
        </div>
      </div>
    `

    // Remover modal existente si existe
    const existingModal = document.getElementById("createCategoryModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Agregar modal al body
    document.body.insertAdjacentHTML("beforeend", modalHTML)

    // Agregar event listener al formulario
    document.getElementById("createCategoryForm").addEventListener("submit", handleCreateCategory)
  }

  // Manejar creación de categoría
  async function handleCreateCategory(event) {
    event.preventDefault()

    const categoryData = {
      name: document.getElementById("categoryName").value,
      description: document.getElementById("categoryDescription").value,
      icon: document.getElementById("categoryIcon").value,
      color: document.getElementById("categoryColor").value,
    }

    try {
      await window.FoodieRank.api.createCategory(categoryData)
      window.FoodieRank.utils.showNotification("Categoría creada exitosamente", "success")
      window.FoodieRank.utils.closeModal("createCategoryModal")

      // Recargar las categorías si existe la función
      if (window.FoodieRank.restaurants && window.FoodieRank.restaurants.loadCategories) {
        window.FoodieRank.restaurants.loadCategories()
      }
    } catch (error) {
      console.error("Error creating category:", error)
      window.FoodieRank.utils.showNotification(error.message || "Error al crear la categoría", "error")
    }
  }

  // Agregar estilos CSS para los componentes de administración
  function addAdminStyles() {
    if (document.getElementById("adminStyles")) return

    const style = document.createElement("style")
    style.id = "adminStyles"
    style.textContent = `
      .admin-section {
        margin: 20px 0;
      }
      
      .users-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .user-name {
        font-weight: bold;
        font-size: 16px;
      }
      
      .user-email {
        color: #666;
        font-size: 14px;
      }
      
      .user-role {
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        color: white;
      }
      
      .user-role.admin {
        background-color: #dc3545;
      }
      
      .user-role.user {
        background-color: #28a745;
      }
      
      .user-actions {
        display: flex;
        gap: 10px;
      }

      .btn-small {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
      }
    `

    document.head.appendChild(style)
  }

  // Inicializar estilos cuando se carga el módulo
  addAdminStyles()

  // Exponer módulo globalmente
  window.FoodieRank = window.FoodieRank || {}
  window.FoodieRank.admin = {
    showCreateRestaurantModal,
    showCreateDishModal,
    showCreateCategoryModal,
    loadUsersAdmin,
    deleteUser,
    editUser,
  }
})()
