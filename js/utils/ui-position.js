/**
 * UI Position Utility
 * Mantém o posicionamento correto entre elementos da UI
 */

// Corrigir a função updateQuickActionsPosition

function updateQuickActionsPosition() {
  const inputArea = document.getElementById("assistant-input-area");
  const quickActions = document.querySelector(".quick-actions");

  if (!inputArea || !quickActions) return;

  // Observar mudanças
  const observer = new ResizeObserver(() => {
    // Manter posição fixa e simples
    quickActions.style.left = "10px";

    // Posição fixa acima da área de input
    quickActions.style.bottom = "85px";

    // Em telas pequenas, ajustar
    if (window.innerWidth <= 480) {
      quickActions.style.left = "5px";
      quickActions.style.bottom = "75px";
    }

    // Se o teclado estiver visível
    if (document.body.classList.contains("keyboard-visible")) {
      quickActions.style.bottom = "100px";
    }

    console.log("[UI Position] Quick actions reposicionado: ", {
      inputAreaTop: inputArea.getBoundingClientRect().top,
      quickActionsBottom: quickActions.style.bottom,
    });
  });

  // Iniciar observação
  observer.observe(inputArea);
  observer.observe(document.body); // Observar também o body para detectar classe keyboard-visible

  // Primeira atualização
  quickActions.style.left = window.innerWidth <= 480 ? "5px" : "10px";
  quickActions.style.bottom = window.innerWidth <= 480 ? "75px" : "85px";
}

// Ajuste para iOS
function fixIOSPositioning() {
  // Verificar se é dispositivo iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS) {
    const quickActions = document.querySelector(".quick-actions");
    const assistantInputArea = document.getElementById("assistant-input-area");

    if (quickActions && assistantInputArea) {
      // Em iOS, garantir posições fixas para evitar problemas com teclado virtual
      quickActions.style.position = "fixed";
      quickActions.style.bottom = "85px";

      assistantInputArea.style.position = "fixed";
      assistantInputArea.style.bottom = "0";
      assistantInputArea.style.left = "0";
      assistantInputArea.style.width = "100%";
    }
  }
}

// Aplicar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  updateQuickActionsPosition();
  fixIOSPositioning();
  setupAssistantModalGrowthMonitor(); // Configurar monitoramento de crescimento do modal

  // Adicionar listeners para eventos que podem afetar o layout
  window.addEventListener("resize", updateQuickActionsPosition);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateQuickActionsPosition, 300); // Tempo para o sistema se ajustar
    setTimeout(fixIOSPositioning, 300);
  });

  // Atualizar também quando o teclado aparecer/desaparecer
  document.addEventListener(
    "focus",
    function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        setTimeout(updateQuickActionsPosition, 300);
      }
    },
    true
  );

  document.addEventListener(
    "blur",
    function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        setTimeout(updateQuickActionsPosition, 300);
      }
    },
    true
  );
});

/**
 * Ajusta os elementos da UI para evitar sobreposição com o banner de navegação
 * Esta função deve ser chamada quando o estado de navegação mudar
 * @param {boolean} isNavigationActive - Se a navegação está ativa
 */
export function adjustUIForNavigation(isNavigationActive) {
  // Obter referências aos elementos
  const banner = document.getElementById("instruction-banner");

  // Verificar se o banner existe para calcular seu tamanho
  if (!banner && isNavigationActive) {
    console.warn(
      "[adjustUIForNavigation] Banner não encontrado, adiando ajustes"
    );
    // Tentar novamente após um breve intervalo, caso o banner esteja sendo criado
    setTimeout(() => adjustUIForNavigation(isNavigationActive), 300);
    return;
  }

  // Calcular altura do banner quando estiver visível
  let bannerHeight = 0;
  if (isNavigationActive && banner) {
    const bannerRect = banner.getBoundingClientRect();
    bannerHeight = bannerRect.height;

    // Se o banner estiver minimizado, usar apenas a altura da seção primária
    if (banner.classList.contains("minimized")) {
      const primarySection = banner.querySelector(".instruction-primary");
      bannerHeight = primarySection ? primarySection.offsetHeight : 70; // Valor de fallback
    }

    // Adicionar margem de segurança
    bannerHeight + 1;
  }

  console.log(
    `[adjustUIForNavigation] Navegação ativa: ${isNavigationActive}, Altura do banner: ${bannerHeight}px`
  );

  // NOTA: Removidas as seções que ajustavam o weatherWidget e os controles do Leaflet
}

/**
 * Observa mudanças no banner de navegação e ajusta a UI conforme necessário
 */
export function setupNavigationUIObserver() {
  // Configurar observer para detectar quando o banner é adicionado/removido
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        // Verificar se o banner foi adicionado ou removido
        const banner = document.getElementById("instruction-banner");
        const isNavigationActive =
          banner && !banner.classList.contains("hidden");

        // Ajustar UI baseado na presença do banner
        adjustUIForNavigation(isNavigationActive);
      }
    }
  });

  // Observar o body para detectar adição/remoção do banner
  observer.observe(document.body, { childList: true, subtree: true });

  // Observar mudanças de classe no banner existente
  const bannerObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const banner = document.getElementById("instruction-banner");
        if (banner) {
          const isNavigationActive = !banner.classList.contains("hidden");
          adjustUIForNavigation(isNavigationActive);
        }
      }
    }
  });

  // Tentar encontrar o banner existente para observá-lo
  const existingBanner = document.getElementById("instruction-banner");
  if (existingBanner) {
    bannerObserver.observe(existingBanner, { attributes: true });
  }

  // Também verificar o estado de navegação atual
  const isCurrentlyNavigating =
    existingBanner && !existingBanner.classList.contains("hidden");
  adjustUIForNavigation(isCurrentlyNavigating);

  // REMOVER o seguinte listener de clique:
  // document.addEventListener("click", function (e) { ... });

  // REMOVER o seguinte observer:
  // const bannerTransitionObserver = (banner) => { ... };
  // bannerCreationObserver.observe(document.body, { ... });

  return {
    observer,
    bannerObserver,
  };
}

/**
 * Monitoramento manual do estado de navegação
 * @param {boolean} isActive - Se a navegação está ativa
 */
export function setNavigationStatus(isActive) {
  adjustUIForNavigation(isActive);
}

// Adicionar ao arquivo existente

/**
 * Reposiciona a área de mensagens do assistente com transição suave e precisa
 * @param {boolean} reposition - Se deve reposicionar (true) ou restaurar (false)
 * @param {boolean} animate - Se deve animar a transição
 * @returns {boolean} Sucesso da operação
 */
export function repositionMessagesArea(reposition = true, animate = true) {
  const messagesArea = document.getElementById("assistant-messages");
  if (!messagesArea) {
    console.error(
      "[repositionMessagesArea] Elemento assistant-messages não encontrado"
    );
    return false;
  }

  // Obter o contêiner de mensagens
  const messagesContainer = messagesArea.querySelector(".messages-area");
  if (!messagesContainer) {
    console.error(
      "[repositionMessagesArea] Elemento messages-area não encontrado"
    );
    return false;
  }

  // Obter referência ao ícone de humor para posicionamento
  const moodIcon = document.querySelector(".mood-icon");

  // Salvar posição original apenas na primeira vez
  if (reposition && !messagesArea.hasAttribute("data-original-position")) {
    try {
      const style = window.getComputedStyle(messagesArea);
      messagesArea.setAttribute(
        "data-original-position",
        JSON.stringify({
          top: style.top,
          left: style.left,
          right: style.right,
          bottom: style.bottom, // Adicionando bottom para preservação
          transform: style.transform,
          maxWidth: style.maxWidth,
          position: style.position,
          zIndex: style.zIndex,
          opacity: style.opacity,
        })
      );
      console.log("[repositionMessagesArea] Posição original salva:", {
        top: style.top,
        left: style.left,
        bottom: style.bottom, // Log para bottom também
        maxWidth: style.maxWidth,
      });
    } catch (error) {
      console.warn("[repositionMessagesArea] Erro ao salvar posição:", error);
    }
  }

  if (reposition) {
    // POSICIONAMENTO ATUALIZADO: left: 70% e max-width: 90%
    if (animate) {
      // Preparação para a animação
      messagesArea.style.transition = "none";
      void messagesArea.offsetWidth; // Forçar reflow

      // Configuração inicial
      messagesArea.style.position = "fixed";
      messagesArea.style.zIndex = "1050";
      messagesArea.style.display = "flex";
      messagesArea.style.flexDirection = "column";
      messagesArea.style.opacity = "0";
      messagesArea.style.transform = "scale(0.95)"; // Importante: Definir left e bottom adequadamente
      messagesArea.style.left = "44%";
      messagesArea.style.right = "auto";
      messagesArea.style.top = "auto"; // Remover definição de top

      // Verificar se há alguma interação com o mapa (navegação, carrossel, etc)
      const isMapInteraction =
        document.body.classList.contains("navigation-active") ||
        document.body.classList.contains("map-interaction") ||
        messagesArea.classList.contains("showing-carousel");

      // Ajustar posição conforme tipo de interação
      messagesArea.style.bottom = isMapInteraction ? "20%" : "40%";

      messagesArea.style.maxWidth = "100%"; // Largura máxima fixa
      messagesArea.style.width = "80%";
      // Configurar altura para se ajustar ao conteúdo
      messagesArea.style.height = "auto";
      // Configurar para crescer apenas para cima com origem no centro da borda inferior
      messagesArea.style.transformOrigin = "bottom center";

      // Aplicar transição e animar
      requestAnimationFrame(() => {
        messagesArea.style.transition =
          "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
        messagesArea.style.opacity = "1";
        messagesArea.style.transform = "scale(1)";

        setTimeout(() => {
          messagesArea.classList.add("repositioned");
          // Removido ajuste de altura
          console.log(
            "[repositionMessagesArea] Reposicionamento animado concluído para left: 70%, max-width: 90%"
          );
        }, 350);
      });
    } else {
      // Aplicação imediata sem animação
      messagesArea.style.position = "fixed";
      messagesArea.style.zIndex = "1050";
      messagesArea.style.left = "44%";
      messagesArea.style.right = "auto";
      messagesArea.style.top = "auto";
      messagesArea.style.bottom = "20%";
      messagesArea.style.maxWidth = "100%"; // 90% em vez de 70%
      messagesArea.style.width = "80%";
      messagesArea.style.opacity = "1";
      messagesArea.style.transform = "none";
      messagesArea.style.height = "auto"; // Deixar altura como auto

      messagesArea.classList.add("repositioned");
      // Removido ajuste de altura

      console.log(
        "[repositionMessagesArea] Reposicionamento imediato concluído para left: 70%, max-width: 90%"
      );
    }

    return true;
  } else {
    // Restaurar posição original
    if (messagesArea.hasAttribute("data-original-position")) {
      try {
        const originalPosition = JSON.parse(
          messagesArea.getAttribute("data-original-position")
        );

        if (animate) {
          // Animação para restaurar posição
          messagesArea.style.transition =
            "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
          messagesArea.style.opacity = "0.7";

          setTimeout(() => {
            messagesArea.classList.remove("repositioned");
            messagesArea.style.top = "auto"; // Manter top como auto
            messagesArea.style.left = originalPosition.left || "44%";
            messagesArea.style.right = "auto";
            messagesArea.style.bottom = originalPosition.bottom || "20%"; // Usar bottom em vez de top
            messagesArea.style.transform =
              originalPosition.transform || "translateX(-50%)";
            messagesArea.style.maxWidth = originalPosition.maxWidth || "95%";
            messagesArea.style.width = "80%"; // Ajustar largura para 80%
            messagesArea.style.height = "auto"; // Voltar para auto
            messagesArea.style.opacity = "1";
            messagesArea.style.transformOrigin = "bottom left"; // Manter a origem da transformação

            // Restaurar outros estilos
            resetMessagesContainerStyles(messagesContainer);

            console.log(
              "[repositionMessagesArea] Posição original restaurada com animação"
            );
          }, 50);
        } else {
          // Restauração imediata
          messagesArea.classList.remove("repositioned");
          messagesArea.style.transition = "none";
          messagesArea.style.top = "auto";
          messagesArea.style.left = originalPosition.left || "44%";
          messagesArea.style.right = "auto";
          messagesArea.style.bottom = originalPosition.bottom || "20%";
          messagesArea.style.transform =
            originalPosition.transform || "translateX(-50%)";
          messagesArea.style.maxWidth = originalPosition.maxWidth || "95%";
          messagesArea.style.width = "80%";
          messagesArea.style.height = "auto"; // Voltar para auto
          messagesArea.style.position = originalPosition.position || "fixed";
          messagesArea.style.opacity = "1";
          messagesArea.style.transformOrigin = "bottom left";

          // Restaurar outros estilos
          resetMessagesContainerStyles(messagesContainer);

          console.log(
            "[repositionMessagesArea] Posição original restaurada imediatamente"
          );
        }

        return true;
      } catch (error) {
        console.error(
          "[repositionMessagesArea] Erro ao restaurar posição:",
          error
        );
        return false;
      }
    } else {
      // Posição padrão se não houver dados salvos
      messagesArea.classList.remove("repositioned");
      messagesArea.style.position = "fixed";
      messagesArea.style.top = "auto";
      messagesArea.style.left = "44%";
      messagesArea.style.right = "auto";
      messagesArea.style.bottom = "20%";
      messagesArea.style.transform = "translateX(-50%)";
      messagesArea.style.maxWidth = "100%";
      messagesArea.style.width = "80%";
      messagesArea.style.height = "auto"; // Deixar altura como auto

      resetMessagesContainerStyles(messagesContainer);

      return true;
    }
  }
}

/**
 * Restaura os estilos originais do container de mensagens
 * @param {HTMLElement} messagesContainer - Container de mensagens
 */
function resetMessagesContainerStyles(messagesContainer) {
  if (!messagesContainer) return;

  // Limpar estilos aplicados
  messagesContainer.style.maxHeight = "";
  messagesContainer.style.height = "auto";
  messagesContainer.style.overflowY = "";

  // Restaurar estilos das mensagens
  const messages = messagesContainer.querySelectorAll(".message");
  messages.forEach((message) => {
    message.style.width = "";
    message.style.maxWidth = "";
    message.style.overflowWrap = "";
    message.style.wordBreak = "";
  });
}

/**
 * Ajusta a altura da área de mensagens para não sobrepor o mood-icon
 * @param {HTMLElement} messagesArea - O elemento do assistant-messages
 */
function adjustMessagesHeightForMoodIcon(messagesArea) {
  if (!messagesArea) return;

  // Obter referência ao ícone de humor
  const moodIcon = document.querySelector(".mood-icon");
  if (!moodIcon) return;

  const messagesContainer = messagesArea.querySelector(".messages-area");
  if (!messagesContainer) return;

  // Obter posições e dimensões
  const moodIconRect = moodIcon.getBoundingClientRect();
  const inputArea = document.getElementById("assistant-input-area");
  const inputAreaRect = inputArea
    ? inputArea.getBoundingClientRect()
    : { top: window.innerHeight - 80 };

  // Calcular a posição correta em relação ao mood-icon
  if (messagesArea.classList.contains("repositioned")) {
    // Remover classes que podem estar causando problemas de altura
    messagesContainer.classList.remove("height-adjusted-for-mood-icon");

    // Posicionar ao lado do mood-icon com distância igual à do input-area
    const moodIconBottom = moodIconRect.bottom;
    const distanceFromInput = window.innerHeight - inputAreaRect.top;

    // AJUSTE: Aumentar a margem à direita para 35px (antes era 15px) para afastar mais
    // E adicionar cálculo para evitar que fique fora da tela
    const availableSpace = window.innerWidth - moodIconRect.right;
    const idealDistance = 35; // Aumentado de 15px para 35px
    const safeDistance = Math.min(idealDistance, availableSpace - 10);

    messagesArea.style.position = "fixed";
    messagesArea.style.bottom = `${distanceFromInput + 20}px`;
    messagesArea.style.left = `44%`; // Aumentado o espaçamento
    messagesArea.style.right = "auto";
    messagesArea.style.top = "auto"; // Definir uma largura apropriada para que o elemento não ocupe muito espaço
    messagesArea.style.width = "80%";
    messagesArea.style.maxWidth = `${Math.min(
      450,
      window.innerWidth - moodIconRect.right - safeDistance - 0
    )}px`;

    // Verificar tipo de interação para posicionar corretamente
    const isMapInteraction =
      document.body.classList.contains("navigation-active") ||
      document.body.classList.contains("map-interaction") ||
      messagesArea.classList.contains("showing-carousel");

    // Ajustar posição conforme tipo de interação
    messagesArea.style.bottom = isMapInteraction ? "25%" : "40%";

    // Calcular altura com base no conteúdo
    const messagesHeight = Array.from(messagesContainer.children).reduce(
      (height, child) => height + child.offsetHeight,
      0
    );

    // Adicionar padding e limitar altura máxima
    const totalHeight = messagesHeight + 40; // 20px padding no topo e na base
    const maxAllowedHeight = window.innerHeight * 0.7;
    const finalHeight = Math.min(totalHeight, maxAllowedHeight);

    // Aplicar altura apenas se houver conteúdo relevante
    if (finalHeight > 60) {
      messagesContainer.style.height = `${finalHeight}px`;

      // Configurar scrolling apenas se necessário
      messagesContainer.style.overflowY =
        totalHeight > maxAllowedHeight ? "auto" : "visible";
    } else {
      messagesContainer.style.height = "auto";
    }

    messagesContainer.style.display = "block";
    messagesContainer.style.width = "100%";
    messagesContainer.style.opacity = "1";

    // Adicionar classe de controle personalizada
    messagesContainer.classList.add("fully-visible");

    console.log(
      `[adjustMessagesHeightForMoodIcon] Reposicionado à direita do mood-icon com espaçamento aumentado`
    );
  } else {
    // Restaurar configurações originais
    messagesContainer.classList.remove("fully-visible");
    messagesContainer.style.maxHeight = "";
    messagesContainer.style.overflowY = "";
  }

  // Garantir que todas as mensagens sejam completamente visíveis
  const messages = messagesContainer.querySelectorAll(".message");
  if (messages.length > 0 && messagesArea.classList.contains("repositioned")) {
    messages.forEach((message) => {
      message.style.maxWidth = "100%";
      message.style.width = "auto";
      message.style.overflowWrap = "break-word";
      message.style.wordBreak = "break-word";
      message.style.display = "block";
      message.style.opacity = "1";
    });
  }

  return messagesArea;
}

/**
 * Verifica se a área de mensagens está reposicionada
 * @returns {boolean} Se a área está reposicionada
 */
export function isMessagesAreaRepositioned() {
  const messagesArea = document.getElementById("assistant-messages");
  return messagesArea && messagesArea.classList.contains("repositioned");
}

/**
 * Alterna o estado de posicionamento da área de mensagens
 * @param {boolean} animate - Se deve animar a transição
 */
export function toggleMessagesAreaPosition(animate = true) {
  const isRepositioned = isMessagesAreaRepositioned();
  repositionMessagesArea(!isRepositioned, animate);
  return !isRepositioned;
}

export { updateQuickActionsPosition, fixIOSPositioning };

/**
 * Configura o monitoramento de redimensionamento do modal do assistente
 * para garantir que ele cresça apenas para cima quando o conteúdo aumentar
 */
export function setupAssistantModalGrowthMonitor() {
  const assistantModal = document.getElementById("assistant-messages");
  if (!assistantModal) return;

  // Observador para monitorar alterações no conteúdo
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === assistantModal) {
        // Adicionar classe para crescimento para cima
        assistantModal.classList.add("grow-upward");

        // Log para debug
        console.log(
          "[setupAssistantModalGrowthMonitor] Modal redimensionado, aplicando crescimento para cima"
        );
      }
    }
  });

  // Observar o elemento do modal
  resizeObserver.observe(assistantModal);

  // Observar também a área de mensagens para detectar novos conteúdos
  const messagesArea = assistantModal.querySelector(".messages-area");
  if (messagesArea) {
    // Monitorar alterações no DOM dentro da área de mensagens
    const messageObserver = new MutationObserver(() => {
      assistantModal.classList.add("grow-upward");
    });

    messageObserver.observe(messagesArea, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  console.log(
    "[setupAssistantModalGrowthMonitor] Monitoramento de crescimento configurado"
  );
}

// Adicione este trecho no final de cada função que deve reposicionar a área de mensagens
export function dispatchActionEvent(action) {
  document.dispatchEvent(
    new CustomEvent("navigation:action", {
      detail: { action },
    })
  );
}

// Adicionar ao final do arquivo ou após as funções relacionadas

/**
 * Configura observador para manter o ajuste de altura atualizado
 */
export function setupMessagesHeightObserver() {
  // Observador para ajuste de altura quando o conteúdo muda
  const observer = new MutationObserver((mutations) => {
    const messagesArea = document.getElementById("assistant-messages");
    if (messagesArea && messagesArea.classList.contains("repositioned")) {
      adjustMessagesHeightForMoodIcon(messagesArea);
    }
  });

  // Observar quando mensagens são adicionadas/removidas
  const messagesContainer = document.querySelector(
    "#assistant-messages .messages-area"
  );
  if (messagesContainer) {
    observer.observe(messagesContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // Também observar quando a janela é redimensionada
  window.addEventListener("resize", () => {
    const messagesArea = document.getElementById("assistant-messages");
    if (messagesArea && messagesArea.classList.contains("repositioned")) {
      adjustMessagesHeightForMoodIcon(messagesArea);
    }
  });

  // Iniciar o observador ao carregar a página
  document.addEventListener("DOMContentLoaded", () => {
    const messagesArea = document.getElementById("assistant-messages");
    if (messagesArea && messagesArea.classList.contains("repositioned")) {
      adjustMessagesHeightForMoodIcon(messagesArea);
    }
  });

  // Retornar função para desconectar quando necessário
  return () => observer.disconnect();
}
