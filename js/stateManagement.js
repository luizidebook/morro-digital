"use strict";

/**
 * @file stateManagement.js
 * @description Gerencia o estado global da navegação, salvando e restaurando o estado da aplicação.
 */

import { globals } from "./globals.js";
import { showNotification } from "./notifications.js";

/**
 * Reinicializa o estado de navegação.
 */
export function initNavigationState() {
  console.log("[stateManagement.js] Reinicializando estado de navegação...");
  globals.navigationState.isActive = false;
  globals.navigationState.isPaused = false;
  globals.navigationState.currentStepIndex = 0;
  globals.navigationState.instructions = [];
  globals.navigationState.selectedDestination = null;
  globals.navigationState.currentHeading = 0;
  globals.navigationState.headingBuffer = [];
  globals.navigationState.lastRotationTime = 0;
  console.log("[stateManagement.js] Estado reinicializado.");
}

/**
 * Salva o estado atual da navegação no sessionStorage.
 * @param {Object} state - Objeto de estado.
 */
export function saveNavigationState(state) {
  try {
    if (!state || typeof state !== "object") {
      console.warn("[stateManagement.js] Estado inválido.");
      return;
    }
    sessionStorage.setItem("navState", JSON.stringify(state));
    console.log("[stateManagement.js] Estado salvo:", state);
    showNotification("Estado de navegação salvo.", "success", 3000);
  } catch (error) {
    console.error("[stateManagement.js] Erro ao salvar estado.", error);
    showNotification("Erro ao salvar estado de navegação.", "error", 5000);
  }
}

/**
 * Restaura o estado salvo no sessionStorage.
 * @returns {Object|null} Estado restaurado ou null.
 */
export function restoreNavigationState() {
  try {
    const stateStr = sessionStorage.getItem("navState");
    if (!stateStr) {
      console.warn("[stateManagement.js] Estado não encontrado.");
      return null;
    }
    const state = JSON.parse(stateStr);
    console.log("[stateManagement.js] Estado restaurado:", state);
    return state;
  } catch (error) {
    console.error("[stateManagement.js] Erro ao restaurar estado.", error);
    showNotification("Erro ao restaurar o estado de navegação.", "error", 5000);
    return null;
  }
}

/**
 * Envia o estado ao Service Worker para persistência.
 */
export function sendStateToServiceWorker() {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn("[stateManagement.js] Service Worker não disponível.");
    return;
  }
  try {
    const state = { navigationState: globals.navigationState };
    navigator.serviceWorker.controller.postMessage({
      action: "saveState",
      payload: state,
    });
    console.log("[stateManagement.js] Estado enviado ao Service Worker.");
  } catch (error) {
    console.error("[stateManagement.js] Erro ao enviar estado ao Service Worker.", error);
  }
}

/**
 * Solicita restauração automática do estado via Service Worker.
 */
export function autoRestoreState() {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'RESTORE_STATE' });
      console.log("[stateManagement.js] Solicitação de restauração automática enviada.");
    } catch (error) {
      console.error("[stateManagement.js] Erro ao solicitar restauração automática.", error);
    }
  } else {
    console.warn("[stateManagement.js] Service Worker indisponível para restauração.");
  }
}
