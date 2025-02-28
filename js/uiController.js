"use strict";

/**
 * @file uiController.js
 * @description Gerencia a interface do usuário, incluindo exibição de modais, notificações e atualização de elementos.
 */

/**
 * Exibe a mensagem de boas-vindas.
 */
export function showWelcomeMessage() {
  const welcomeModal = document.getElementById("welcome-modal");
  if (welcomeModal) {
    welcomeModal.style.display = "block";
    console.log("showWelcomeMessage: Modal de boas-vindas exibido.");
  } else {
    console.warn("showWelcomeMessage: 'welcome-modal' não encontrado.");
  }
}

/**
 * Exibe a barra de navegação.
 */
export function showNavigationBar() {
  const navBar = document.getElementById("navigation-bar");
  if (navBar) {
    navBar.style.display = "block";
    console.log("showNavigationBar: Barra de navegação exibida.");
  } else {
    console.warn("showNavigationBar: 'navigation-bar' não encontrado.");
  }
}

/**
 * Exibe o resumo da rota.
 * @param {Object} routeData - Dados da rota.
 * @param {string} [lang='pt'] - Código do idioma.
 */
export function displayRouteSummary(routeData, lang = 'pt') {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    console.error("displayRouteSummary: Dados inválidos.");
    return;
  }
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);
  const summaryContainer = document.getElementById("route-summary");
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <h3>Resumo da Rota</h3>
      <p>Distância: <strong>${distanceKm} km</strong></p>
      <p>Tempo: <strong>${etaMinutes} min</strong></p>
    `;
    summaryContainer.style.display = "block";
    summaryContainer.classList.remove("hidden");
    console.log("displayRouteSummary: Resumo exibido.");
  } else {
    console.error("displayRouteSummary: 'route-summary' não encontrado.");
  }
}

/**
 * Destaca uma instrução crítica na interface.
 * @param {string} instruction - Instrução.
 */
export function highlightCriticalInstruction(instruction) {
  const element = document.getElementById("critical-instruction");
  if (element) {
    element.innerHTML = `<strong>${instruction}</strong>`;
    console.log("highlightCriticalInstruction: Instrução destacada.");
  } else {
    console.warn("highlightCriticalInstruction: 'critical-instruction' não encontrado.");
  }
}

/**
 * Oculta todos os controles.
 */
export function hideAllControls() {
  const controls = document.querySelectorAll(".control");
  controls.forEach(control => (control.style.display = "none"));
  console.log("hideAllControls: Controles ocultados.");
}

/**
 * Exibe a pré-visualização da rota.
 * @param {Object} routeData - Dados da rota.
 */
export function showRoutePreview(routeData) {
  const previewContainer = document.getElementById("route-preview");
  if (previewContainer) {
    previewContainer.innerHTML = `<div>Pré-visualização da rota ativada.</div>`;
    previewContainer.style.display = "block";
    previewContainer.classList.remove("hidden");
    console.log("showRoutePreview: Pré-visualização exibida.");
  } else {
    console.error("showRoutePreview: 'route-preview' não encontrado.");
  }
}

/**
 * Atualiza o conteúdo do modal do assistente.
 * @param {string} stepId - Identificador do passo.
 * @param {string|Object} message - Mensagem.
 */
export function updateAssistantModalContent(stepId, message) {
  const modal = document.getElementById("assistant-modal");
  if (!modal) {
    console.error("updateAssistantModalContent: 'assistant-modal' não encontrado.");
    return;
  }
  const content = modal.querySelector(".modal-content");
  if (!content) {
    console.error("updateAssistantModalContent: Conteúdo do modal não encontrado.");
    return;
  }
  const lang = window.selectedLanguage || 'pt';
  const text = typeof message === "object" ? (message[lang] || message["pt"] || "") : message;
  content.innerHTML = `<p>${text}</p>`;
  modal.style.display = "block";
  console.log(`updateAssistantModalContent: Conteúdo atualizado para o passo "${stepId}".`);
}

/**
 * Fecha o modal do assistente.
 */
export function closeAssistantModal() {
  const modal = document.getElementById("assistant-modal");
  if (modal) {
    modal.style.display = "none";
    console.log("closeAssistantModal: Modal fechado.");
  } else {
    console.error("closeAssistantModal: 'assistant-modal' não encontrado.");
  }
}
