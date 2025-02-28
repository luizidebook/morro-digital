"use strict";

/**
 * @file permissions.js
 * @description Gerencia permissões de acesso, como a de geolocalização.
 */

import { showNotification } from './notifications.js';
import { getGeneralText } from './translationController.js';

/**
 * Solicita a permissão de geolocalização e retorna um booleano.
 * @param {string} [lang='pt'] - Código do idioma para mensagens.
 * @returns {Promise<boolean>} true se a permissão for concedida, false caso contrário.
 */
export async function requestLocationPermission(lang = 'pt') {
  console.log("[permissions.js] Checando permissão de localização...");
  if (!navigator.geolocation) {
    console.error("[permissions.js] Geolocalização não suportada.");
    showNotification(getGeneralText("geolocationUnsupported", lang) || "Geolocation not supported.", "error");
    return false;
  }
  try {
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
    });
    console.log("[permissions.js] Permissão concedida.");
    return true;
  } catch (err) {
    console.warn("[permissions.js] Permissão negada ou timeout.", err);
    showNotification(getGeneralText("noLocationPermission", lang) || "Location permission denied.", "warning");
    return false;
  }
}
