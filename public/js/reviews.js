// Reviews Module - Corregido y funcional
(() => {
  // Abrir modal de reseña
  function openReviewModal(type, itemId) {
    if (!window.FoodieRank.auth.isAuthenticated()) {
      window.FoodieRank.utils.showNotification("Debes iniciar sesión para escribir una reseña", "error");
      return;
    }

    const modalHTML = `
      <div id="reviewModal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="window.FoodieRank.utils.closeModal('reviewModal')">&times;</span>
          <h2>Escribir Reseña</h2>
          <form id="reviewForm">
            <div class="form-group">
              <label>Calificación:</label>
              <div class="rating-input">
                <input type="radio" name="rating" value="1" id="star1">
                <label for="star1">★</label>
                <input type="radio" name="rating" value="2" id="star2">
                <label for="star2">★</label>
                <input type="radio" name="rating" value="3" id="star3">
                <label for="star3">★</label>
                <input type="radio" name="rating" value="4" id="star4">
                <label for="star4">★</label>
                <input type="radio" name="rating" value="5" id="star5">
                <label for="star5">★</label>
              </div>
            </div>
            <div class="form-group">
              <label for="reviewComment">Comentario:</label>
              <textarea id="reviewComment" rows="4" placeholder="Comparte tu experiencia..." required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('reviewModal')">Cancelar</button>
              <button type="submit" class="btn-primary">Enviar Reseña</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Remover modal existente si existe
    const existingModal = document.getElementById("reviewModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar modal al body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Agregar event listener al formulario
    document.getElementById("reviewForm").addEventListener("submit", (e) => {
      e.preventDefault();
      handleReviewSubmit(type, itemId);
    });

    // Agregar estilos para las estrellas
    addStarRatingStyles();
  }

  // Manejar envío de reseña
  async function handleReviewSubmit(type, itemId) {
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById("reviewComment").value.trim();

    if (!rating) {
      window.FoodieRank.utils.showNotification("Por favor selecciona una calificación", "error");
      return;
    }

    if (!comment) {
      window.FoodieRank.utils.showNotification("Por favor escribe un comentario", "error");
      return;
    }

    try {
      const reviewData = {
        rating: parseInt(rating),
        comment,
        visitDate: new Date().toISOString().split('T')[0]
      };

      // Agregar el campo correcto según el tipo
      if (type === "restaurant") {
        reviewData.restaurant = itemId;
      } else if (type === "dish") {
        reviewData.dish = itemId;
      }

      await window.FoodieRank.api.createReview(reviewData);
      window.FoodieRank.utils.showNotification("Reseña creada exitosamente", "success");
      window.FoodieRank.utils.closeModal("reviewModal");

      // Refrescar el modal de detalles
      if (type === "restaurant") {
        window.FoodieRank.restaurants.showRestaurantDetails(itemId);
      } else if (type === "dish") {
        window.FoodieRank.restaurants.showDishDetails(itemId);
      }
    } catch (error) {
      console.error("Error creating review:", error);
      window.FoodieRank.utils.showNotification(error.message || "Error al crear la reseña", "error");
    }
  }

  // Cargar reseñas del usuario actual
  async function loadUserReviews() {
    const currentUser = window.FoodieRank.auth.getCurrentUser();
    if (!currentUser) return;

    try {
      const reviews = await window.FoodieRank.api.getReviews({ user: currentUser._id });
      const reviewsContainer = document.getElementById("userReviews");
      
      if (!reviewsContainer) return;

      const reviewsList = reviews.reviews || [];

      if (reviewsList.length === 0) {
        reviewsContainer.innerHTML = '<div class="text-center">No has escrito reseñas aún</div>';
        return;
      }

      reviewsContainer.innerHTML = reviewsList
        .map(
          (review) => `
            <div class="review-item">
              <div class="review-header">
                <span class="review-target">${review.restaurant?.name || review.dish?.name}</span>
                <span class="review-rating">${window.FoodieRank.utils.generateStars(review.rating)}</span>
                <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p class="review-comment">${review.comment}</p>
              <div class="review-actions">
                <button class="btn-small btn-secondary" onclick="window.FoodieRank.reviews.editReview('${review._id}')">Editar</button>
                <button class="btn-small btn-danger" onclick="window.FoodieRank.reviews.deleteReview('${review._id}')">Eliminar</button>
              </div>
            </div>
          `
        )
        .join("");
    } catch (error) {
      console.error("Error loading user reviews:", error);
    }
  }

  // Eliminar reseña
  async function deleteReview(reviewId) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return;

    try {
      await window.FoodieRank.api.deleteReview(reviewId);
      window.FoodieRank.utils.showNotification("Reseña eliminada exitosamente", "success");
      loadUserReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      window.FoodieRank.utils.showNotification(error.message || "Error al eliminar la reseña", "error");
    }
  }

  // Editar reseña (funcionalidad básica)
  async function editReview(reviewId) {
    try {
      const review = await window.FoodieRank.api.getReviewById(reviewId);
      
      // Crear modal de edición
      const modalHTML = `
        <div id="editReviewModal" class="modal" style="display: block;">
          <div class="modal-content">
            <span class="close" onclick="window.FoodieRank.utils.closeModal('editReviewModal')">&times;</span>
            <h2>Editar Reseña</h2>
            <form id="editReviewForm">
              <div class="form-group">
                <label>Calificación:</label>
                <div class="rating-input">
                  <input type="radio" name="editRating" value="1" id="editStar1" ${review.rating === 1 ? 'checked' : ''}>
                  <label for="editStar1">★</label>
                  <input type="radio" name="editRating" value="2" id="editStar2" ${review.rating === 2 ? 'checked' : ''}>
                  <label for="editStar2">★</label>
                  <input type="radio" name="editRating" value="3" id="editStar3" ${review.rating === 3 ? 'checked' : ''}>
                  <label for="editStar3">★</label>
                  <input type="radio" name="editRating" value="4" id="editStar4" ${review.rating === 4 ? 'checked' : ''}>
                  <label for="editStar4">★</label>
                  <input type="radio" name="editRating" value="5" id="editStar5" ${review.rating === 5 ? 'checked' : ''}>
                  <label for="editStar5">★</label>
                </div>
              </div>
              <div class="form-group">
                <label for="editReviewComment">Comentario:</label>
                <textarea id="editReviewComment" rows="4" required>${review.comment}</textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="window.FoodieRank.utils.closeModal('editReviewModal')">Cancelar</button>
                <button type="submit" class="btn-primary">Actualizar Reseña</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Agregar modal al body
      document.body.insertAdjacentHTML("beforeend", modalHTML);

      // Event listener para el formulario de edición
      document.getElementById("editReviewForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const rating = document.querySelector('input[name="editRating"]:checked')?.value;
        const comment = document.getElementById("editReviewComment").value.trim();

        if (!rating || !comment) {
          window.FoodieRank.utils.showNotification("Por favor completa todos los campos", "error");
          return;
        }

        try {
          await window.FoodieRank.api.updateReview(reviewId, {
            rating: parseInt(rating),
            comment
          });
          
          window.FoodieRank.utils.showNotification("Reseña actualizada exitosamente", "success");
          window.FoodieRank.utils.closeModal("editReviewModal");
          loadUserReviews();
        } catch (error) {
          console.error("Error updating review:", error);
          window.FoodieRank.utils.showNotification(error.message || "Error al actualizar la reseña", "error");
        }
      });

      addStarRatingStyles();
    } catch (error) {
      console.error("Error loading review for edit:", error);
      window.FoodieRank.utils.showNotification("Error al cargar la reseña", "error");
    }
  }

  // Agregar estilos para el sistema de estrellas
  function addStarRatingStyles() {
    if (document.getElementById("starRatingStyles")) return;

    const style = document.createElement("style");
    style.id = "starRatingStyles";
    style.textContent = `
      .rating-input {
        display: flex;
        gap: 5px;
        margin: 10px 0;
      }
      
      .rating-input input[type="radio"] {
        display: none;
      }
      
      .rating-input label {
        font-size: 24px;
        color: #ddd;
        cursor: pointer;
        transition: color 0.2s;
      }
      
      .rating-input label:hover,
      .rating-input label:hover ~ label,
      .rating-input input[type="radio"]:checked ~ label {
        color: #ffd700;
      }
      
      .rating-input input[type="radio"]:checked + label,
      .rating-input input[type="radio"]:checked + label ~ label {
        color: #ffd700;
      }
      
      .review-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      
      .btn-small {
        padding: 5px 10px;
        font-size: 12px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
      
      .btn-small.btn-secondary {
        background-color: #6c757d;
        color: white;
      }
      
      .btn-small.btn-danger {
        background-color: #dc3545;
        color: white;
      }
      
      .btn-small:hover {
        opacity: 0.8;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Exponer módulo globalmente
  window.FoodieRank = window.FoodieRank || {};
  window.FoodieRank.reviews = {
    openReviewModal,
    loadUserReviews,
    deleteReview,
    editReview
  };
})();