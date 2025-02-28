"use strict";

/**
 * @file routeCreation.js
 * @description Funções para criação e plotagem de rotas, integrando a API OpenRouteService.
 */

import { API_KEYS } from "./config.js";
import { showNotification } from "./notifications.js";

/**
 * Inicia o processo de criação de rota, validando destino e obtendo localização do usuário.
 */
export async function startRouteCreation() {
  try {
    if (!window.selectedDestination || typeof window.selectedDestination.lat !== "number") {
      showNotification("Por favor, selecione um destino válido.", "error", 5000);
      return;
    }
    if (typeof window.getCurrentLocation !== "function") {
      showNotification("Função de localização não encontrada.", "error", 5000);
      return;
    }
    const userLocation = await window.getCurrentLocation();
    if (!userLocation) {
      showNotification("Não foi possível obter sua localização.", "error", 5000);
      return;
    }
    const routeData = await createRoute(userLocation);
    if (!routeData) {
      showNotification("Erro ao criar a rota.", "error", 5000);
      return;
    }
    await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      window.selectedDestination.lat,
      window.selectedDestination.lon,
      "foot-walking"
    );
    showNotification("Rota criada com sucesso.", "success", 3000);
  } catch (error) {
    console.error("[routeCreation.js] Erro:", error);
    showNotification("Erro ao iniciar a criação da rota.", "error", 5000);
  }
}

/**
 * Cria a rota com base na localização do usuário e destino selecionado.
 * @param {Object} userLocation - Objeto com latitude e longitude.
 * @returns {Promise<Object|null>} Dados da rota ou null.
 */
export async function createRoute(userLocation) {
  try {
    if (!window.selectedDestination || typeof window.selectedDestination.lat !== "number") {
      showNotification("Destino inválido.", "error", 5000);
      return null;
    }
    const profile = "foot-walking";
    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      window.selectedDestination.lat,
      window.selectedDestination.lon,
      profile
    );
    return routeData;
  } catch (error) {
    console.error("[routeCreation.js] Erro:", error);
    showNotification("Erro ao criar a rota.", "error", 5000);
    return null;
  }
}

/**
 * Consulta a API OpenRouteService para obter e plotar a rota no mapa.
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [profile="foot-walking"] - Perfil de rota.
 * @returns {Promise<Object|null>} Dados da rota ou null.
 */
export async function plotRouteOnMap(startLat, startLon, destLat, destLon, profile = "foot-walking") {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${API_KEYS.ORS}` +
                `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    const data = await response.json();
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    if (window.currentRoute) {
      window.map.removeLayer(window.currentRoute);
    }
    window.currentRoute = L.polyline(latLngs, { color: "blue", weight: 5, dashArray: "10,5" }).addTo(window.map);
    window.map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log("[routeCreation.js] Rota plotada com sucesso.");
    return data;
  } catch (error) {
    console.error("[routeCreation.js] Erro ao plotar rota:", error);
    showNotification("Erro ao plotar a rota.", "error", 5000);
    return null;
  }
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 * @returns {number} Distância em metros.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
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
 * Calcula o rumo (bearing) entre dois pontos.
 * @returns {number} Rumo em graus (0-360).
 */
export function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const dLon = (lon2 - lon1) * toRad;
  const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
  const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
            Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * toDeg;
  return (bearing + 360) % 360;
}

/**
 * Calcula a distância de um ponto a um segmento.
 * @returns {number} Distância em metros.
 */
export function pointToSegmentDistance(latA, lonA, lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const Ax = R * lonA * rad * Math.cos(latA * rad);
  const Ay = R * latA * rad;
  const x1 = R * lon1 * rad * Math.cos(lat1 * rad);
  const y1 = R * lat1 * rad;
  const x2 = R * lon2 * rad * Math.cos(lat2 * rad);
  const y2 = R * lat2 * rad;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const segLenSq = dx * dx + dy * dy;
  if (segLenSq === 0) return Math.hypot(Ax - x1, Ay - y1);
  let t = ((Ax - x1) * dx + (Ay - y1) * dy) / segLenSq;
  t = Math.max(0, Math.min(1, t));
  const projx = x1 + t * dx;
  const projy = y1 + t * dy;
  return Math.hypot(Ax - projx, Ay - projy);
}

/**
 * Calcula a menor distância entre um ponto e uma polyline.
 * @returns {number} Distância em metros.
 */
export function distanceToPolyline(userLat, userLon, polylineCoords) {
  let minDistance = Infinity;
  for (let i = 0; i < polylineCoords.length - 1; i++) {
    const p1 = polylineCoords[i];
    const p2 = polylineCoords[i + 1];
    const dist = pointToSegmentDistance(userLat, userLon, p1[0], p1[1], p2[0], p2[1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}
