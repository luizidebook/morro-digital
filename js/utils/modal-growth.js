/**
 * modal-growth.js
 *
 * Utilitário para controlar o comportamento de crescimento do modal do assistente
 * Garante que o modal cresça apenas para cima quando o conteúdo aumentar
 */

export function adjustModalGrowthUpward(modal, isMapInteraction = false) {
  if (!modal) return;

  // Remover qualquer posicionamento top
  modal.style.top = "auto";

  // Definir posição bottom baseada no tipo de interação
  if (isMapInteraction) {
    modal.style.bottom = "25%"; // Posição durante interações com mapa
    modal.classList.add("map-interaction");
  } else {
    modal.style.bottom = "40%"; // Posição padrão
    modal.classList.remove("map-interaction");
  }

  // Adicionar classes que controlam o crescimento
  modal.classList.add("grow-upward");
  modal.classList.add("auto-size");

  // Definir transformOrigin para garantir que a animação ocorra a partir da parte inferior
  modal.style.transformOrigin = "bottom center";

  // Configurar para ajuste automático ao conteúdo
  modal.style.height = "auto";

  // Ajustar a área de mensagens
  const messagesArea = modal.querySelector(".messages-area");
  if (messagesArea) {
    messagesArea.style.overflow = "visible";
    messagesArea.style.maxHeight = "none";

    // Verificar se há conteúdo e ajustar tamanho
    if (messagesArea.children.length > 0) {
      requestAnimationFrame(() => {
        const contentHeight = Array.from(messagesArea.children).reduce(
          (height, child) => height + child.offsetHeight,
          0
        );

        // Adicionar padding
        const totalHeight = contentHeight + 40; // 20px de padding superior e inferior

        // Limitar altura para evitar sobreposição com outros elementos
        const maxAllowedHeight = window.innerHeight * 0.7;
        const finalHeight = Math.min(totalHeight, maxAllowedHeight);

        // Apenas definir altura se houver conteúdo
        if (finalHeight > 40) {
          messagesArea.style.height = finalHeight + "px";

          if (totalHeight > maxAllowedHeight) {
            messagesArea.style.overflowY = "auto";
          } else {
            messagesArea.style.overflowY = "visible";
          }
        }
      });
    }
  }

  console.log(
    `[adjustModalGrowthUpward] Modal configurado para crescer para cima (${
      isMapInteraction ? "interação com mapa" : "padrão"
    })`
  );
}

/**
 * Aplica o comportamento de crescimento para cima quando uma nova mensagem é adicionada
 * @param {string} messageText - O texto da mensagem sendo adicionada
 * @param {string} sender - O remetente da mensagem ('user' ou 'assistant')
 * @param {boolean} isMapInteraction - Indica se é uma interação relacionada ao mapa
 */
export function handleNewMessage(
  messageText,
  sender,
  isMapInteraction = false
) {
  const modal = document.getElementById("assistant-messages");
  if (!modal) return;

  // Aplicar configuração de crescimento para cima
  adjustModalGrowthUpward(modal, isMapInteraction);

  console.log(
    `[handleNewMessage] Nova mensagem de ${sender}, ajustando crescimento do modal (${
      isMapInteraction ? "interação com mapa" : "padrão"
    })`
  );
}

/**
 * Configura monitoramento para detectar quando mensagens são adicionadas
 */
export function setupMessageMonitoring() {
  const modal = document.getElementById("assistant-messages");
  if (!modal) return;

  const messagesArea = modal.querySelector(".messages-area");
  if (!messagesArea) return;

  // Observar mudanças na área de mensagens
  const observer = new MutationObserver((mutations) => {
    // Verificar se houve adição de mensagens
    const messageAdded = mutations.some(
      (mutation) =>
        mutation.type === "childList" &&
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(
          (node) => node.nodeType === 1 && node.classList.contains("message")
        )
    );

    if (messageAdded) {
      // Verificar se é uma interação com mapa
      const isMapInteraction =
        document.body.classList.contains("map-interaction") ||
        document.body.classList.contains("navigation-active") ||
        modal.classList.contains("showing-carousel");

      // Garantir que o modal cresça para cima
      adjustModalGrowthUpward(modal, isMapInteraction);
    }
  });

  // Iniciar observação
  observer.observe(messagesArea, {
    childList: true,
    subtree: false,
  });

  console.log(
    "[setupMessageMonitoring] Monitoramento de mensagens configurado"
  );
}

export function setupMapInteractionMonitoring() {
  // Lista de classes que indicam interação com o mapa
  const mapInteractionClasses = [
    "navigation-active",
    "showing-carousel",
    "route-summary-visible",
    "map-point-selected",
  ];

  // Monitorar mudanças nas classes do body
  const bodyObserver = new MutationObserver(() => {
    const modal = document.getElementById("assistant-messages");
    if (!modal) return;

    // Verificar se alguma classe de interação com mapa está presente
    const hasMapInteraction = mapInteractionClasses.some(
      (className) =>
        document.body.classList.contains(className) ||
        modal.classList.contains(className)
    );

    // Only adjust if the current state is different from the previous one
    if (hasMapInteraction !== modal.classList.contains("map-interaction")) {
      adjustModalGrowthUpward(modal, hasMapInteraction);
    }
  });

  // Iniciar observação das classes do body
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Monitorar também as classes do modal
  const modal = document.getElementById("assistant-messages");
  if (modal) {
    const modalObserver = new MutationObserver(() => {
      const hasMapInteraction = mapInteractionClasses.some(
        (className) =>
          document.body.classList.contains(className) ||
          modal.classList.contains(className)
      );

      // Only adjust if the current state is different from the previous one
      if (hasMapInteraction !== modal.classList.contains("map-interaction")) {
        adjustModalGrowthUpward(modal, hasMapInteraction);
      }
    });

    modalObserver.observe(modal, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  console.log(
    "[setupMapInteractionMonitoring] Monitoramento de interações configurado"
  );
}

// Iniciar monitoramentos quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  setupMessageMonitoring();
  setupMapInteractionMonitoring();

  // Ajustar modal para posição inicial correta
  const modal = document.getElementById("assistant-messages");
  if (modal) {
    adjustModalGrowthUpward(modal, false);
  }
});
