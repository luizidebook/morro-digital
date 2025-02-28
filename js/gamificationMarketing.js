"use strict";

/**
 * @file gamificationMarketing.js
 * @description Funções para gamificação e marketing, incluindo verificação de proximidade e recompensa.
 */

import { globals } from './globals.js';
import { showNotification } from "./notifications.js";

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 * @returns {number} Distância em metros.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica se o usuário está próximo de um parceiro.
 * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 * @returns {boolean} true se próximo, false caso contrário.
 */
export function checkNearbyPartners(userLat, userLon) {
  const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.9140 };
  const PARTNER_CHECKIN_RADIUS = 50; // metros
  const distance = calculateDistance(userLat, userLon, TOCA_DO_MORCEGO_COORDS.lat, TOCA_DO_MORCEGO_COORDS.lon);
  console.log(`checkNearbyPartners: Distância: ${distance} metros.`);
  return distance <= PARTNER_CHECKIN_RADIUS;
}

/**
 * Lida com a chegada do usuário a um parceiro.
 * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 */
export function handleUserArrivalAtPartner(userLat, userLon) {
  if (checkNearbyPartners(userLat, userLon)) {
    showNotification("Você chegou ao parceiro! Ganhou um drink e 10 pontos!", "success");
    awardPointsToUser("Toca do Morcego", 10);
    console.log("handleUserArrivalAtPartner: Parceria concluída.");
  }
}

/**
 * Concede pontos ao usuário e atualiza o total no localStorage.
 * @param {string} partnerName - Nome do parceiro.
 * @param {number} points - Pontos a conceder.
 */
export function awardPointsToUser(partnerName, points) {
  let currentPoints = parseInt(localStorage.getItem("userPoints") || "0", 10);
  currentPoints += points;
  localStorage.setItem("userPoints", currentPoints);
  showNotification(`Ganhou ${points} ponto(s) em ${partnerName}! Total: ${currentPoints}`, "success");
  console.log("awardPointsToUser: Pontos atualizados:", currentPoints);
}

/**
 * Processa a reserva do destino selecionado.
 * @param {string} buttonId - ID do botão.
 * @param {string} url - URL do destino.
 */
export function handleReservation(buttonId, url) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", () => {
      if (globals.selectedDestination && globals.selectedDestination.url) {
        openDestinationWebsite(url);
      } else {
        alert("Por favor, selecione um destino primeiro.");
      }
    });
    console.log(`handleReservation: Listener configurado para "${buttonId}".`);
  } else {
    console.error(`handleReservation: Botão "${buttonId}" não encontrado.`);
  }
}

/**
 * Exibe um popup de marketing com uma mensagem personalizada.
 * @param {string} message - Mensagem.
 */
export function showMarketingPopup(message) {
  showNotification(message, "info", 8000);
  console.log("showMarketingPopup: Popup exibido:", message);
}

/**
 * Abre a URL de um destino em uma nova aba.
 * @param {string} url - URL do destino.
 */
function openDestinationWebsite(url) {
  window.open(url, '_blank');
}
