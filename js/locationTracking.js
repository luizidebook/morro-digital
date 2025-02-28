"use strict";

/**
 * @file locationTracking.js
 * @description Funções para obter e rastrear a localização do usuário.
 */

import { DEFAULT_CONFIG } from "./config.js";
import { showNotification } from "./notifications.js";
import { globals } from "./globals.js";

/**
 * Obtém a localização atual do usuário.
 * @param {Object} [options=DEFAULT_CONFIG.GEOLOCATION_OPTIONS] - Opções de geolocalização.
 * @returns {Promise<Object|null>} Objeto com latitude, longitude, accuracy e heading ou null.
 */
export async function getCurrentLocation(options = DEFAULT_CONFIG.GEOLOCATION_OPTIONS) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      console.error("[locationTracking.js] Geolocalização não suportada.");
      showNotification("Geolocalização não suportada.", "error", 5000);
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading } = position.coords;
        console.log("[locationTracking.js] Localização obtida:", { latitude, longitude, accuracy, heading });
        resolve({ latitude, longitude, accuracy, heading });
      },
      (error) => {
        console.error("[locationTracking.js] Erro ao obter localização:", error);
        showNotification("Erro ao obter localização.", "error", 5000);
        resolve(null);
      },
      options
    );
  });
}

/**
 * Inicia o rastreamento contínuo da posição do usuário.
 * @param {Object} [options=DEFAULT_CONFIG.GEOLOCATION_OPTIONS] - Opções para rastreamento.
 * @returns {number|null} watchId do rastreamento ou null.
 */
export function startPositionTracking(options = DEFAULT_CONFIG.GEOLOCATION_OPTIONS) {
  if (!("geolocation" in navigator)) {
    console.error("[locationTracking.js] Geolocalização não suportada.");
    showNotification("Geolocalização não suportada.", "error", 5000);
    return null;
  }
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy, heading } = position.coords;
      console.log("[locationTracking.js] Posição atualizada:", { latitude, longitude, accuracy, heading });
      // Atualize o estado global ou chame funções para atualizar a interface aqui.
    },
    (error) => {
      console.error("[locationTracking.js] Erro no rastreamento:", error);
      showNotification("Erro no rastreamento de localização.", "error", 5000);
    },
    options
  );
  console.log("[locationTracking.js] Rastreamento iniciado, watchId:", watchId);
  return watchId;
}

/**
 * Centraliza o mapa na localização atual do usuário.
 */
export async function useCurrentLocation() {
  const location = await getCurrentLocation();
  if (!location) {
    console.warn("[locationTracking.js] Localização indisponível.");
    return;
  }
  if (!globals.map) {
    console.warn("[locationTracking.js] Mapa não inicializado.");
    return;
  }
  globals.map.setView([location.latitude, location.longitude], DEFAULT_CONFIG.MAP_DEFAULT_ZOOM, { animate: true });
  console.log("[locationTracking.js] Mapa centralizado.");
  showNotification("Mapa centralizado na sua localização.", "info", 3000);
}

/**
 * Monitora eventos de movimento do dispositivo.
 */
export function detectMotion() {
  if ("DeviceMotionEvent" in window) {
    window.addEventListener("devicemotion", (event) => {
      const acceleration = event.acceleration;
      if (acceleration && (Math.abs(acceleration.x) > 5 || Math.abs(acceleration.y) > 5 || Math.abs(acceleration.z) > 5)) {
        console.log("[locationTracking.js] Movimento detectado:", acceleration);
      }
    });
    console.log("[locationTracking.js] Listener de movimento configurado.");
  } else {
    console.warn("[locationTracking.js] DeviceMotionEvent não suportado.");
  }
}
