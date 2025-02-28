import { initializeMap } from './mapInitialization.js';
import { showWelcomeMessage, loadResources } from './uiController.js';
import { initializeTutorialListeners, setupSubmenuClickListeners } from './submenuController.js';

// Removida a linha que importava setupEventListeners recursivamente
// import { setupEventListeners } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeMap();
    showWelcomeMessage();
    setupEventListeners(); // Chamada da função definida abaixo
    initializeTutorialListeners();
    setupSubmenuClickListeners();
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});

/**
 * Configura event listeners adicionais para botões e interações.
 */
export function setupEventListeners() {
  // Modal Geral - Fechar modal do assistente
  const closeModal = document.querySelector('.close-btn');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      try {
        closeAssistantModal();
      } catch (error) {
        console.error("Erro ao fechar o modal do assistente:", error);
      }
    });
  }

  // Menu Toggle - Alternar visibilidade do menu flutuante
  const menuToggle = document.getElementById('menu-btn');
  const floatingMenu = document.getElementById('floating-menu');
  if (menuToggle && floatingMenu) {
    menuToggle.style.display = 'none';
    menuToggle.addEventListener('click', () => {
      floatingMenu.classList.toggle('hidden');
      // Se o tutorial estiver ativo e o passo atual for "menu-toggle", avança para o próximo passo
      if (window.tutorialIsActive && window.tutorialSteps && typeof window.currentStep === 'number') {
        if (typeof window.nextTutorialStep === "function") {
          window.nextTutorialStep();
        }
      }
    });
  }

  // Botão "start-navigation-rodape-btn" - Inicia a navegação
  const startNavigationRodapeBtn = document.getElementById('start-navigation-rodape-btn');
  if (startNavigationRodapeBtn) {
    startNavigationRodapeBtn.addEventListener('click', () => {
      console.log("Botão 'start-navigation-rodape-btn' clicado!");
      startNavigation();
    });
  }

  // Botão "menu-details-btn" - Restaura a interface para a última feature selecionada
  const menuDetailsBtn = document.getElementById("menu-details-btn");
  if (menuDetailsBtn) {
    menuDetailsBtn.addEventListener("click", () => {
      console.log("Botão 'menu-details-btn' clicado!");
      if (typeof hideControlButtons === "function") {
        hideControlButtons();
      }
      if (typeof restoreFeatureUI === "function") {
        restoreFeatureUI(window.Feature);
      }
    });
  }

  // Botão "about-more-btn" - Inicia o carrossel com mais informações sobre o destino
  const aboutMoreBtn = document.getElementById('about-more-btn');
  if (aboutMoreBtn) {
    aboutMoreBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.name) {
        if (typeof window.startCarousel === 'function') {
          window.startCarousel(window.selectedDestination.name);
        }
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Botão "buy-ticket-btn" - Abre o site do destino para compra de ingressos
  const buyTicketBtn = document.getElementById('buy-ticket-btn');
  if (buyTicketBtn) {
    buyTicketBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Botão "cancel-route-btn" - Encerra a navegação e restaura a interface
  const cancelRouteBtn = document.getElementById("cancel-route-btn");
  if (cancelRouteBtn) {
    cancelRouteBtn.addEventListener("click", () => {
      console.log("Botão 'cancel-route-btn' clicado!");
      endNavigation();
      if (typeof restoreFeatureUI === "function") {
        restoreFeatureUI(window.Feature);
      }
    });
  }

  // Botões de Reserva - Para cadeiras, restaurantes e pousadas
  const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
  if (reserveChairsBtn) {
    reserveChairsBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }
  const reserveRestaurantsBtn = document.getElementById('reserve-restaurants-btn');
  if (reserveRestaurantsBtn) {
    reserveRestaurantsBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }
  const reserveInnsBtn = document.getElementById('reserve-inns-btn');
  if (reserveInnsBtn) {
    reserveInnsBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Botão "speak-attendent-btn" - Ação semelhante para atendimento por voz
  const speakAttendentBtn = document.getElementById('speak-attendent-btn');
  if (speakAttendentBtn) {
    speakAttendentBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Botão "call-btn" - Para iniciar uma chamada relacionada ao destino
  const callBtn = document.getElementById('call-btn');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.url) {
        openDestinationWebsite(window.selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Configuração para mudança de idioma com integração ao tutorial do assistente
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (typeof window.setLanguage === "function" && typeof window.updateInterfaceLanguage === "function") {
        window.setLanguage(lang);
        window.updateInterfaceLanguage(lang);
      }
      const welcomeModal = document.getElementById('welcome-modal');
      if (welcomeModal) {
        welcomeModal.style.display = 'none';
      }
      const assistantModal = document.getElementById('assistant-modal');
      const sendAudioBtn = document.getElementById('send-audio-btn');
      const navigateManualBtn = document.getElementById('navigate-manually-btn');
      if (assistantModal && sendAudioBtn && navigateManualBtn) {
        assistantModal.style.display = 'block';
        sendAudioBtn.style.display = 'block';
        navigateManualBtn.style.display = 'block';
        sendAudioBtn.addEventListener('click', () => {
          if (typeof window.startVoiceRecognition === "function") {
            window.startVoiceRecognition();
          }
          assistantModal.style.display = 'none';
        });
        navigateManualBtn.addEventListener('click', () => {
          if (typeof window.showTutorialStep === "function") {
            window.showTutorialStep('ask-interest');
          }
          assistantModal.style.display = 'none';
        });
      }
      console.log(`Idioma alterado para: ${lang}`);
    });
  });

  // Configuração para botões do menu flutuante (features)
  document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', event => {
      const feature = btn.getAttribute('data-feature');
      console.log(`Feature selecionada: ${feature}`);
      handleFeatureSelection(feature);
      if (typeof closeCarouselModal === "function") {
        closeCarouselModal();
      }
      event.stopPropagation();
    });
  });
}
