"use strict";

/**
 * @file cache.js
 * @description Contém funções para manipulação de cache e localStorage.
 */

import { showNotification } from './notifications.js';

/**
 * Salva dados de rota no cache local.
 * @param {Array} routeInstructions - Instruções da rota.
 * @param {Array} routeLatLngs - Coordenadas da rota.
 */
export function cacheRouteData(routeInstructions, routeLatLngs) {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return;
  }
  try {
    const data = {
      instructions: routeInstructions,
      route: routeLatLngs,
      timestamp: Date.now()
    };
    localStorage.setItem('cachedRoute', JSON.stringify(data));
    console.log("[cache.js] Rota salva no cache.");
    showNotification("Rota salva em cache para uso offline.", "success");
  } catch (err) {
    console.error("[cache.js] Erro ao salvar rota:", err);
    showNotification("Erro ao salvar rota no cache.", "error");
  }
}

/**
 * Carrega dados de rota do cache.
 * @returns {Object|null} Dados da rota ou null.
 */
export function loadRouteFromCache() {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return null;
  }
  try {
    const dataStr = localStorage.getItem('cachedRoute');
    if (!dataStr) {
      console.warn("[cache.js] Nenhuma rota encontrada no cache.");
      return null;
    }
    const data = JSON.parse(dataStr);
    console.log("[cache.js] Rota carregada do cache:", data);
    showNotification("Rota carregada do cache com sucesso.", "info");
    return data;
  } catch (err) {
    console.error("[cache.js] Erro ao carregar rota:", err);
    showNotification("Erro ao carregar rota do cache.", "error");
    return null;
  }
}

// Outras funções de cache (getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem, saveDestinationToCache, etc.) seguem o mesmo padrão de tratamento.
