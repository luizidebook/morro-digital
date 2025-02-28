"use strict";

/**
 * @file mapInitialization.js
 * @description Inicializa o mapa e configura as camadas de tiles.
 */

import { DEFAULT_CONFIG } from './config.js';
import { globals } from './globals.js';

/**
 * Inicializa o mapa usando Leaflet.
 * 
 * A função verifica se o elemento com ID "map" está disponível no DOM.
 * Caso não esteja, registra um erro e interrompe a execução.
 */
export function initializeMap() {
  // Verifica se o elemento com ID "map" existe no DOM
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Elemento 'map' não encontrado no DOM. Verifique o carregamento do DOM.");
    return;
  }

  // Evita reinicialização se o mapa já foi criado
  if (globals.map) {
    console.warn("Mapa já inicializado.");
    return;
  }
  
  console.log("Inicializando mapa...");

  const tileLayers = {
    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: DEFAULT_CONFIG.MAX_ZOOM,
    }),
    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "© Esri",
      maxZoom: DEFAULT_CONFIG.MAX_ZOOM,
    }),
  };

  globals.map = L.map("map", {
    layers: [tileLayers.streets],
    zoomControl: false,
    maxZoom: DEFAULT_CONFIG.MAX_ZOOM,
    minZoom: DEFAULT_CONFIG.MIN_ZOOM,
  }).setView([-13.378, -38.918], DEFAULT_CONFIG.MAP_DEFAULT_ZOOM);

  L.control.layers(tileLayers).addTo(globals.map);
  console.log("Mapa inicializado.");

  if (L.control.rotate) {
    const rotateControl = L.control.rotate({
      position: 'topright',
      angle: 0,
    });
    rotateControl.addTo(globals.map);
    console.log("Controle de rotação adicionado.");
  } else {
    console.warn("Plugin de rotação não encontrado. Usando fallback via CSS.");
  }
}

/**
 * Retorna uma camada de tile padrão.
 * @returns {L.TileLayer} Camada de tile.
 */
export function getTileLayer() {
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  });
}
