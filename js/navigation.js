"use strict";

/**
 * @file navigation.js
 * @description Gerencia o início, pausa, retomada e finalização da navegação, atualizando a interface e o estado em tempo real.
 */

import { globals } from './globals.js';
import { showNotification } from './notifications.js';
import { getGeneralText } from './translationController.js';
import { initNavigationState, updateNavigationState } from './stateManagement.js';
import { fetchMultipleRouteOptions, plotRouteOnMap, finalizeRouteMarkers } from './routeCreation.js';
import { startUserTracking } from './locationTracking.js';
import { setMapRotation, autoRotationAuto, stopRotationAuto } from './navigation.js'; // Certifique-se de que essas funções estejam definidas

/**
 * Inicia a navegação.
 * @param {Object|null} savedState - Estado salvo para retomar a navegação.
 */
export async function startNavigation(savedState = null) {
  try {
    showRouteLoadingIndicator();
    if (!validateDestination(globals.selectedDestination)) {
      hideRouteLoadingIndicator();
      return;
    }
    if (!globals.userLocation) {
      showNotification(getGeneralText("selectDestinationFirst"), "error");
      hideRouteLoadingIndicator();
      return;
    }
    initNavigationState();
    globals.navigationState.isActive = true;
    globals.navigationState.isPaused = false;
    globals.navigationState.currentStepIndex = 0;
    const routeOptions = await fetchMultipleRouteOptions(
      globals.userLocation.latitude,
      globals.userLocation.longitude,
      globals.selectedDestination.lat,
      globals.selectedDestination.lon
    );
    if (!routeOptions || routeOptions.length === 0) {
      showNotification(getGeneralText("noInstructions"), "error");
      hideRouteLoadingIndicator();
      return;
    }
    const selectedRoute = routeOptions[0];
    if (!selectedRoute) {
      hideRouteLoadingIndicator();
      return;
    }
    globals.navigationState.instructions = selectedRoute.routeData.properties.segments[0].steps.map((step, index) => ({
      id: index + 1,
      raw: step.instruction,
      text: step.instruction,
      distance: Math.round(step.distance),
      lat: step.start_location ? step.start_location.lat : 0,
      lon: step.start_location ? step.start_location.lon : 0
    }));
    startUserTracking();
    autoRotationAuto();
    const routeData = await plotRouteOnMap(
      globals.userLocation.latitude,
      globals.userLocation.longitude,
      globals.selectedDestination.lat,
      globals.selectedDestination.lon
    );
    finalizeRouteMarkers(globals.userLocation.latitude, globals.userLocation.longitude, globals.selectedDestination);
    hideRouteLoadingIndicator();
    showNotification(getGeneralText("navigationStarted"), "info");
    globals.positionWatcher = navigator.geolocation.watchPosition(
      (pos) => {
        if (globals.navigationState.isPaused) return;
        const { latitude, longitude, heading } = pos.coords;
        globals.userLocation = { latitude, longitude, heading };
        if (typeof updateUserMarker === 'function') {
          updateUserMarker(latitude, longitude, heading);
        }
        globals.map.panTo([latitude, longitude], { animate: true, duration: 0.5 });
        if (typeof heading === "number") setMapRotation(heading);
        updateRealTimeNavigation(latitude, longitude, globals.navigationState.instructions, globals.selectedDestination.lat, globals.selectedDestination.lon, globals.navigationState.lang, heading);
        if (shouldRecalculateRoute(latitude, longitude, globals.navigationState.instructions)) {
          notifyDeviation();
          recalcRouteOnDeviation(latitude, longitude, globals.selectedDestination.lat, globals.selectedDestination.lon);
        }
      },
      (error) => {
        console.error("startNavigation: Erro no watchPosition:", error);
        showNotification(getGeneralText("trackingError"), "error");
      },
      { enableHighAccuracy: true }
    );
    console.log("startNavigation: Navegação iniciada.");
  } catch (err) {
    console.error("startNavigation: Erro inesperado:", err);
    hideRouteLoadingIndicator();
    showNotification("Erro ao iniciar a navegação. Tente novamente.", "error");
  }
}

/**
 * Encerra a navegação.
 */
export function endNavigation() {
  console.log("endNavigation: Encerrando navegação...");
  globals.navigationState.isActive = false;
  globals.navigationState.isPaused = false;
  stopRotationAuto();
  if (globals.positionWatcher !== undefined) {
    navigator.geolocation.clearWatch(globals.positionWatcher);
    globals.positionWatcher = undefined;
  }
  clearCurrentRoute();
  clearMarkers();
  hideInstructionBanner();
  hideRouteFooter();
  initNavigationState();
  setMapRotation(0);
  showNotification(getGeneralText("navEnded"), "info");
  console.log("endNavigation: Navegação encerrada.");
}

/**
 * Pausa a navegação.
 */
export function pauseNavigation() {
  if (!globals.navigationState.isActive) {
    console.warn("pauseNavigation: Navegação não está ativa.");
    return;
  }
  if (globals.navigationState.isPaused) {
    console.log("pauseNavigation: Navegação já pausada.");
    return;
  }
  globals.navigationState.isPaused = true;
  if (globals.positionWatcher) {
    navigator.geolocation.clearWatch(globals.positionWatcher);
    globals.positionWatcher = null;
  }
  showNotification(getGeneralText("navPaused"), "info");
  console.log("pauseNavigation: Navegação pausada.");
}

/**
 * Alterna a pausa da navegação.
 */
export function toggleNavigationPause() {
  if (globals.navigationState.isPaused) {
    globals.navigationState.isPaused = false;
    showNotification(getGeneralText("navResumed"), "success");
    globals.positionWatcher = navigator.geolocation.watchPosition(
      (pos) => {
        updateRealTimeNavigation(pos.coords.latitude, pos.coords.longitude, globals.navigationState.instructions, globals.selectedDestination.lat, globals.selectedDestination.lon, globals.navigationState.lang, pos.coords.heading);
      },
      (err) => {
        console.error("toggleNavigationPause: Erro ao retomar watchPosition:", err);
        showNotification(getGeneralText("trackingError"), "error");
      },
      { enableHighAccuracy: true }
    );
    console.log("toggleNavigationPause: Navegação retomada.");
  } else {
    pauseNavigation();
  }
}

/**
 * Atualiza a navegação em tempo real.
 */
export function updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading) {
  if (globals.lastRealTimePosition) {
    const movedDistance = calculateDistance(globals.lastRealTimePosition.lat, globals.lastRealTimePosition.lon, lat, lon);
    if (movedDistance < 1) return;
  }
  if (typeof updateUserMarker === 'function') updateUserMarker(lat, lon, heading);
  autoRotationAuto();
  if (instructions && instructions.length > 0) {
    const currentInstruction = instructions[globals.navigationState.currentStepIndex];
    if (currentInstruction && typeof updateInstructionBanner === 'function') {
      updateInstructionBanner(currentInstruction, lang);
    }
  }
}
