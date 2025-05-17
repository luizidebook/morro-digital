/**
 * Gerencia a interação dos botões de ação rápida com o assistant-messages
 */

import { minimizeCarousel } from "./carousel.js";
import {
  saveCarouselState,
  clearCarouselState,
  restoreCarousel,
  getCarouselState,
} from "./carousel-state.js";

// Função para configurar os eventos de clique nos botões de ação rápida
export function setupQuickActionButtonsEvents() {
  // Selecionar todos os botões de ação rápida
  const quickActionButtons = document.querySelectorAll(
    ".quick-actions .action-button"
  );

  // Referência ao modal do assistente
  const assistantModal = document.getElementById("assistant-messages");

  // ADICIONAR LOGS DE DIAGNÓSTICO
  console.log("[quick-actions] Elementos encontrados:", {
    botões: quickActionButtons.length,
    modal: assistantModal ? "encontrado" : "não encontrado",
    modalClassList: assistantModal ? assistantModal.classList.value : "N/A",
  });

  if (!assistantModal) {
    console.error("[quick-actions] Modal do assistente não encontrado.");
    return;
  }

  // IMPORTANTE: Remover todos os event listeners existentes para evitar duplicação
  quickActionButtons.forEach((button) => {
    // Armazenar o evento atual para remoção
    const oldClickEvent = button._quickActionClickHandler;
    if (oldClickEvent) {
      button.removeEventListener("click", oldClickEvent);
      console.log("[quick-actions] Evento antigo removido");
    }
  });

  // Variável para rastrear o último botão clicado
  let lastClickedButton = null;

  // Variável para rastrear o último estado do carrossel
  let lastCarouselState = {
    active: false,
    locationName: null,
  };

  // Adicionar flag para evitar múltiplas chamadas em rápida sucessão
  let isProcessingClick = false;

  // Função para manipular o clique nos botões
  function handleQuickActionClick(event) {
    // Evitar múltiplas chamadas em rápida sucessão
    if (isProcessingClick) {
      console.log("[quick-actions] Clique já está sendo processado, ignorando");
      return;
    }

    isProcessingClick = true;
    setTimeout(() => {
      isProcessingClick = false;
    }, 500);

    console.log("[quick-actions] Botão de ação rápida clicado");

    // Obter o estado atual do modal (oculto ou visível)
    const isHidden = assistantModal.classList.contains("hidden");
    console.log(
      `[quick-actions] Estado atual do modal: ${
        isHidden ? "oculto" : "visível"
      }`
    );

    // Verificar se tem um carrossel ativo antes de fechar
    const hasCarousel = assistantModal.classList.contains("showing-carousel");
    console.log(
      `[quick-actions] Modal tem carrossel: ${hasCarousel ? "sim" : "não"}`
    );

    // Salvar o conteúdo atual do modal antes de fechar
    const messagesArea = assistantModal.querySelector(".messages-area");
    let savedContent = null;

    // Se o modal estiver visível e tiver um carrossel, salvar o conteúdo
    if (!isHidden && hasCarousel && messagesArea) {
      savedContent = messagesArea.innerHTML;
      localStorage.setItem("assistantMessagesContent", savedContent);
      console.log(
        "[quick-actions] Conteúdo do assistantMessages salvo antes de fechar"
      );

      // Salvar localização do carrossel
      const carouselContainer = assistantModal.querySelector(
        ".carousel-container"
      );
      if (carouselContainer) {
        const infoText = carouselContainer.querySelector(".carousel-info-text");
        if (infoText && infoText.textContent) {
          const locationName = infoText.textContent.split("\n")[0].trim();
          console.log(
            "[quick-actions] Salvando estado do carrossel para:",
            locationName
          );
          saveCarouselState(locationName);
        }
      }
    }

    // Alternar a visibilidade
    if (isHidden) {
      showAssistantModal(this);
    } else {
      hideAssistantModal();
    }

    // Atualizar o estado dos botões de ação rápida
    quickActionButtons.forEach((button) => {
      button.classList.toggle("active");
      button.setAttribute(
        "aria-expanded",
        button.classList.contains("active").toString()
      );
    });
  }

  // Adicionar o handler a cada botão e armazenar referência para remoção futura
  quickActionButtons.forEach((button) => {
    button._quickActionClickHandler = handleQuickActionClick;
    button.addEventListener("click", handleQuickActionClick);
    console.log("[quick-actions] Novo evento de clique adicionado ao botão");

    // Adicionar atributos para acessibilidade
    button.setAttribute("aria-controls", "assistant-messages");
    button.setAttribute("aria-expanded", "false");
  });

  // Função para mostrar o assistente
  // Modificação na função showAssistantModal

  function showAssistantModal(button) {
    console.log("[quick-actions] Chamada para showAssistantModal()");

    // IMPORTANTE: Remover classe hidden para mostrar o modal
    assistantModal.classList.remove("hidden");
    console.log("[quick-actions] Classe 'hidden' removida do modal");

    // Verificar se temos conteúdo salvo para restaurar
    const savedContent = localStorage.getItem("assistantMessagesContent");

    // Verificar se devemos restaurar um carrossel
    const carouselState = getCarouselState();

    // IMPORTANTE: Verificar se o carrossel foi minimizado explicitamente pelo usuário
    const wasForciblyMinimized =
      localStorage.getItem("carouselForciblyMinimized") === "true";

    // Verificar se temos conteúdo salvo
    if (savedContent) {
      const messagesArea = assistantModal.querySelector(".messages-area");
      if (messagesArea) {
        // Restaurar o conteúdo salvo
        messagesArea.innerHTML = savedContent;
        console.log("[quick-actions] Conteúdo do assistantMessages restaurado");

        // Limpar o conteúdo salvo após restaurar
        localStorage.removeItem("assistantMessagesContent");

        // Garantir que o carrossel seja exibido se existir no conteúdo restaurado
        const hasCarousel =
          messagesArea.querySelector(".carousel-container") !== null;
        if (hasCarousel) {
          assistantModal.classList.add("showing-carousel");

          // Reinicializar o Swiper se necessário
          import("./carousel.js").then((module) => {
            if (module.syncCarouselDimensions) {
              module.syncCarouselDimensions();
            }
          });

          return; // Sair da função após restauração bem-sucedida
        }
      }
    } else if (carouselState.active && !wasForciblyMinimized) {
      console.log(
        "[quick-actions] Estado de carrossel ativo encontrado para:",
        carouselState.locationName
      );

      // Tentar restaurar o carrossel
      if (restoreCarousel()) {
        console.log("[quick-actions] Carrossel restaurado com sucesso");

        // Atualizar classe do botão e foco
        quickActionButtons.forEach((btn) => {
          btn.classList.add("active");
          btn.setAttribute("aria-expanded", "true");
        });

        return; // Sair da função após restauração bem-sucedida
      }
    } else if (wasForciblyMinimized) {
      // Limpar o flag quando o usuário abrir o assistente novamente
      localStorage.removeItem("carouselForciblyMinimized");
      console.log(
        "[quick-actions] Carrossel foi minimizado pelo usuário, não restaurando"
      );
    }

    // Focar no input para melhor experiência do usuário
    setTimeout(() => {
      const input = document.getElementById("assistantInput");
      if (input) input.focus();
    }, 100);
  }

  // Função para esconder o assistente
  function hideAssistantModal() {
    console.log("[quick-actions] Chamada para hideAssistantModal()");

    // Verificar se tem um carrossel ativo e minimizá-lo primeiro
    if (assistantModal.classList.contains("showing-carousel")) {
      // Usar o minimizeCarousel sem esconder o assistente (vamos fazer isso depois)
      import("./carousel.js").then((module) => {
        module.minimizeCarousel(false);

        // IMPORTANTE: Adicionar classe hidden para esconder o modal
        assistantModal.classList.add("hidden");
        console.log("[quick-actions] Classe 'hidden' adicionada ao modal");
      });
    } else {
      // IMPORTANTE: Adicionar classe hidden para esconder o modal
      assistantModal.classList.add("hidden");
      console.log("[quick-actions] Classe 'hidden' adicionada ao modal");
    }

    // Remover classe ativa do botão
    quickActionButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    });

    // Remover classe do body
    document.body.classList.remove("assistant-modal-open");
  }

  // Configurar o botão de minimizar no modal
  const minimizeButton = assistantModal.querySelector(".minimize-button");
  if (minimizeButton) {
    minimizeButton.removeEventListener("click", minimizeButton._hideHandler);

    minimizeButton._hideHandler = () => {
      // Verificar se tem um carrossel ativo
      if (assistantModal.classList.contains("showing-carousel")) {
        console.log("[quick-actions] Botão minimizar com carrossel ativo");
        // Importar e usar minimizeCarousel com true para esconder assistente
        import("./carousel.js").then((module) => {
          module.minimizeCarousel(true);
        });
      } else {
        hideAssistantModal();
      }
    };

    minimizeButton.addEventListener("click", minimizeButton._hideHandler);
  }

  // Permitir fechar com Escape
  function handleEscape(event) {
    if (
      event.key === "Escape" &&
      !assistantModal.classList.contains("hidden")
    ) {
      hideAssistantModal();
    }
  }

  // Remover handler anterior e adicionar novo
  document.removeEventListener("keydown", document._escapeHandler);
  document._escapeHandler = handleEscape;
  document.addEventListener("keydown", document._escapeHandler);

  console.log(
    "[quick-actions] Eventos de quick action buttons configurados com sucesso"
  );

  // Disponibilizar funções publicamente
  window.assistantControls = {
    show: showAssistantModal,
    hide: hideAssistantModal,
    toggle: () => {
      const isHidden = assistantModal.classList.contains("hidden");
      if (isHidden) {
        showAssistantModal();
      } else {
        hideAssistantModal();
      }
    },
  };

  // Retornar as funções para uso externo
  return {
    show: (button) => showAssistantModal(button || lastClickedButton),
    hide: hideAssistantModal,
    toggle: (button) => {
      const isHidden = assistantModal.classList.contains("hidden");
      if (isHidden) {
        showAssistantModal(button || lastClickedButton);
      } else {
        hideAssistantModal();
      }
      return !isHidden; // retorna o novo estado
    },
  };
}
