"use strict";

/**
 * @file mapVisualizations.js
 * @description Contém funções para manipulação de visualizações do mapa, incluindo ajustes, remoção de marcadores e exibição de rotas.
 */

import { showNotification } from './notifications.js';
import { getGeneralText } from './translationController.js';
import { globals } from './globals.js';
import { clearMarkers as clearUtilsMarkers } from './utils.js';

/**
 * Restaura a visualização original do mapa.
 */
export function resetMapView() {
  const defaultView = { lat: -13.4125, lon: -38.9131, zoom: 13 };
  if (!globals.map) {
    console.warn("resetMapView: Mapa não inicializado.");
    return;
  }
  globals.map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
  console.log("resetMapView: Visualização restaurada.");
}

/**
 * Centraliza o mapa na localização do usuário e adiciona um marcador.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 */
export function adjustMapWithLocationUser(lat, lon) {
  if (!globals.map) {
    console.warn("adjustMapWithLocationUser: Mapa não inicializado.");
    return;
  }
  globals.map.setView([lat, lon], 18);
  const marker = L.marker([lat, lon]).addTo(globals.map)
    .bindPopup(getGeneralText("youAreHere") || "Você está aqui!")
    .openPopup();
  globals.markers.push(marker);
  console.log("adjustMapWithLocationUser: Mapa centralizado no usuário.");
}

/**
 * Ajusta o mapa para uma localização específica com offset.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} name - Nome do local.
 * @param {string} description - Descrição.
 * @param {number} zoom - Nível de zoom.
 * @param {number} offsetYPercent - Offset vertical percentual.
 */
export function adjustMapWithLocation(lat, lon, name = '', description = '', zoom = 15, offsetYPercent = 10) {
  if (!globals.map) {
    console.warn("adjustMapWithLocation: Mapa não inicializado.");
    return;
  }
  try {
    clearMarkers();
    const marker = L.marker([lat, lon]).addTo(globals.map)
      .bindPopup(`<b>${name}</b><br>${description || 'Localização selecionada'}`)
      .openPopup();
    globals.markers.push(marker);
    const mapSize = globals.map.getSize();
    const offsetY = (mapSize.y * Math.min(offsetYPercent, 100)) / 100;
    const projectedPoint = globals.map.project([lat, lon], zoom).subtract([0, offsetY]);
    const adjustedLatLng = globals.map.unproject(projectedPoint, zoom);
    globals.map.setView(adjustedLatLng, zoom, { animate: true, pan: { duration: 0.5 } });
    console.log(`adjustMapWithLocation: Mapa ajustado para (${lat}, ${lon}) com zoom ${zoom}.`);
  } catch (error) {
    console.error("adjustMapWithLocation: Erro:", error);
  }
}

/**
 * Remove todos os marcadores do mapa.
 * @param {Function} [filterFn] - Função para filtrar marcadores a serem removidos.
 */
export function clearMarkers(filterFn) {
  if (!globals.map || !globals.markers) {
    console.warn("clearMarkers: Mapa ou marcadores não inicializados.");
    return;
  }
  if (typeof filterFn === "function") {
    globals.markers = globals.markers.filter(marker => {
      if (filterFn(marker)) {
        globals.map.removeLayer(marker);
        return false;
      }
      return true;
    });
  } else {
    globals.markers.forEach(marker => globals.map.removeLayer(marker));
    globals.markers = [];
  }
  console.log("clearMarkers: Marcadores removidos.");
}

/**
 * Exibe uma rota na pré-visualização.
 * @param {Object} route - Objeto de rota contendo waypoints.
 */
export function visualizeRouteOnPreview(route) {
  if (!route || !route.waypoints || route.waypoints.length === 0) {
    showNotification("Nenhuma rota disponível para visualização.", "warning");
    return;
  }
  clearMarkers();
  route.waypoints.forEach(point => {
    const marker = L.marker([point.lat, point.lon]).addTo(globals.map)
      .bindPopup(`Parada: ${point.name}`);
    globals.markers.push(marker);
  });
  const latLngs = route.waypoints.map(p => [p.lat, p.lon]);
  globals.currentRoute = L.polyline(latLngs, { color: 'blue', weight: 4 }).addTo(globals.map);
  globals.map.fitBounds(globals.currentRoute.getBounds());
  console.log("visualizeRouteOnPreview: Rota exibida na pré-visualização.");
}

/**
 * Recentraliza o mapa na localização do usuário.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} [zoom=18] - Nível de zoom.
 */
export function recenterMapOnUser(lat, lon, zoom = 18) {
  if (!globals.map) {
    console.warn("recenterMapOnUser: Mapa não inicializado.");
    return;
  }
  globals.map.setView([lat, lon], zoom);
  console.log("recenterMapOnUser: Mapa centralizado no usuário.");
}

/**
 * Remove todas as camadas visuais do mapa.
 */
export function clearMapLayers() {
  if (!globals.map) {
    console.warn("clearMapLayers: Mapa não inicializado.");
    return;
  }
  globals.map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
      globals.map.removeLayer(layer);
    }
  });
  console.log("clearMapLayers: Todas as camadas removidas.");
}

/**
 * Adiciona uma seta ao mapa em uma coordenada.
 * @param {Object|Array} coordinate - Objeto com lat e lon ou array [lat, lon].
 */
export function addArrowToMap(coordinate) {
  if (!globals.map) {
    console.warn("addArrowToMap: Mapa não inicializado.");
    return;
  }
  const arrowIcon = L.divIcon({
    className: "direction-arrow-icon",
    html: "➡️",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  const coords = Array.isArray(coordinate) ? coordinate : [coordinate.lat, coordinate.lon];
  L.marker(coords, { icon: arrowIcon }).addTo(globals.map);
  console.log("addArrowToMap: Seta adicionada em", coords);
}
