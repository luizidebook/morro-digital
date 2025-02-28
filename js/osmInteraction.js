"use strict";

/**
 * @file osmInteraction.js
 * @description Funções para interação com a API Overpass do OpenStreetMap.
 */

import { showNotification } from "./notifications.js";

/**
 * Busca dados do OSM usando a API Overpass.
 * @param {string} query - Query Overpass.
 * @returns {Promise<Array>} Array de elementos ou vazio.
 */
export async function fetchOSMData(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn("[osmInteraction.js] Nenhum dado encontrado para a query.");
      return [];
    }
    console.log("[osmInteraction.js] Dados obtidos:", data.elements);
    return data.elements;
  } catch (error) {
    console.error("[osmInteraction.js] Erro ao buscar dados:", error);
    showNotification("Erro ao buscar dados OSM.", "error", 5000);
    return [];
  }
}

/**
 * Exibe os dados OSM no submenu.
 * @param {Array} data - Elementos do OSM.
 * @param {string} subMenuId - ID do submenu.
 * @param {string} feature - Nome da funcionalidade.
 */
export function displayOSMData(data, subMenuId, feature) {
  const subMenu = document.getElementById(subMenuId);
  if (!subMenu) {
    console.warn("[osmInteraction.js] Submenu não encontrado:", subMenuId);
    return;
  }
  subMenu.innerHTML = "";
  data.forEach(element => {
    if (element.type === 'node' && element.tags && element.tags.name) {
      const btn = document.createElement('button');
      btn.className = 'submenu-item submenu-button';
      btn.textContent = element.tags.name;
      btn.dataset.lat = element.lat;
      btn.dataset.lon = element.lon;
      btn.dataset.name = element.tags.name;
      btn.dataset.description = element.tags.description || "Descrição não disponível";
      btn.dataset.feature = feature;
      btn.addEventListener('click', () => {
        if (typeof window.handleSubmenuButtons === "function") {
          window.handleSubmenuButtons(
            parseFloat(element.lat),
            parseFloat(element.lon),
            element.tags.name,
            element.tags.description || "Descrição não disponível",
            element.tags.images || [],
            feature
          );
        }
      });
      subMenu.appendChild(btn);
      if (window.map && typeof window.map.addLayer === "function") {
        const marker = L.marker([element.lat, element.lon]).addTo(window.map);
        marker.bindPopup(`<b>${element.tags.name}</b><br>${element.tags.description || "Descrição não disponível"}`);
        if (window.markers && Array.isArray(window.markers)) {
          window.markers.push(marker);
        }
      }
    }
  });
  console.log(`[osmInteraction.js] Dados exibidos no submenu "${subMenuId}" para "${feature}".`);
}
