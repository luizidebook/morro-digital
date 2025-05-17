/**
 * carousel-modal.js
 *
 * Módulo que gerencia o modal independente do carrossel
 */

/**
 * Mostra o modal do carrossel
 */
export function showCarouselModal() {
  const carouselModal = document.getElementById("carousel-modal");
  if (!carouselModal) {
    console.error("[carousel-modal] Modal do carrossel não encontrado");
    return;
  }

  // Remover classe para exibir o modal
  carouselModal.classList.remove("hidden");
  console.log("[carousel-modal] Modal do carrossel exibido");
}

/**
 * Esconde o modal do carrossel
 */
export function hideCarouselModal() {
  const carouselModal = document.getElementById("carousel-modal");
  if (!carouselModal) {
    console.error("[carousel-modal] Modal do carrossel não encontrado");
    return;
  }

  // Adicionar classe para esconder o modal
  carouselModal.classList.add("hidden");
  console.log("[carousel-modal] Modal do carrossel escondido");

  // Se existir uma instância do swiper, destruir para liberar recursos
  if (
    window.assistantSwiper &&
    typeof window.assistantSwiper.destroy === "function"
  ) {
    window.assistantSwiper.destroy(true, true);
    window.assistantSwiper = null;
  }
}

/**
 * Alterna a visibilidade do modal do carrossel
 */
export function toggleCarouselModal() {
  const carouselModal = document.getElementById("carousel-modal");
  if (!carouselModal) {
    console.error("[carousel-modal] Modal do carrossel não encontrado");
    return false;
  }

  const isHidden = carouselModal.classList.contains("hidden");
  if (isHidden) {
    showCarouselModal();
  } else {
    hideCarouselModal();
  }

  return !isHidden; // Retorna o novo estado (true = visível)
}

/**
 * Atualiza o texto de informação do carrossel
 * @param {string} text - Texto a ser exibido
 */
export function updateCarouselInfoText(text) {
  const infoTextElement = document.querySelector(
    "#carousel-modal .carousel-info-text"
  );
  if (!infoTextElement) {
    console.error(
      "[carousel-modal] Elemento de texto de informação não encontrado"
    );
    return;
  }

  infoTextElement.textContent = text;
  console.log("[carousel-modal] Texto de informação atualizado:", text);
}

/**
 * Inicializa os eventos do modal do carrossel
 */
export function initCarouselModalEvents() {
  const carouselModal = document.getElementById("carousel-modal");
  if (!carouselModal) {
    console.error("[carousel-modal] Modal do carrossel não encontrado");
    return;
  }

  // Configurar botão de minimizar
  const minimizeButton = carouselModal.querySelector(".minimize-button");
  if (minimizeButton) {
    // Remover event listeners antigos para evitar duplicação
    minimizeButton.replaceWith(minimizeButton.cloneNode(true));

    // Obter a nova referência
    const newMinimizeButton = carouselModal.querySelector(".minimize-button");

    // Adicionar novo event listener
    newMinimizeButton.addEventListener("click", () => {
      hideCarouselModal();
    });

    console.log("[carousel-modal] Evento do botão de minimizar configurado");
  }

  // Permitir fechar o carrossel com a tecla Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!carouselModal.classList.contains("hidden")) {
        hideCarouselModal();
      }
    }
  });
}

// Inicializar eventos quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  initCarouselModalEvents();
  console.log("[carousel-modal] Eventos do modal do carrossel inicializados");
});
