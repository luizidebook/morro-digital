"use strict";

/**
 * @file globals.js
 * @description Armazena as variáveis globais e o estado do aplicativo.
 * 
 * Foram adicionadas funções auxiliares para validação de objetos críticos,
 * como o destino selecionado e a localização do usuário.
 */

import { DEFAULT_CONFIG } from './config.js';

export const globals = {
  map: null,
  selectedLanguage: DEFAULT_CONFIG?.DEFAULT_LANGUAGE || "pt",
  navigationState: {
    isActive: false,
    isPaused: false,
    watchId: null,
    currentStepIndex: 0,
    instructions: [],
    selectedDestination: null, // Inicializado como null para facilitar a validação
    lang: DEFAULT_CONFIG?.DEFAULT_LANGUAGE || "pt",
    isRotationEnabled: true,
    quietMode: true,
    rotationInterval: 1000, // ms
    speed: 0,
    manualOverride: false,
    manualAngle: 0,
    tilt: 10,
    rotationMode: 'compass',
    headingBuffer: [],
    minRotationDelta: 2,
    alpha: 0.2,
    currentHeading: 0,
    lastRotationTime: 0
  },
  markers: [],
  currentRoute: null,
  userMarker: null,
  destinationMarker: null,
  // Removido: selectedDestination duplicado
  userLocation: null,
  currentSubMenu: null,
  currentLocation: null,
  currentStep: null,
  tutorialIsActive: false,
  searchHistory: [],
  achievements: [],
  favorites: [],
  routingControl: null,
  speechSynthesisUtterance: null,
  voices: [],
  currentMarker: null,
  swiperInstance: null,
  selectedProfile: 'foot-walking',
  userLocationMarker: null,
  userCurrentLocation: null,
  currentRouteData: null,
  isNavigationActive: false,
  isnavigationPaused: false,
  currentRouteSteps: [],
  navigationWatchId: null,
  cachedLocation: null,
  locationPermissionGranted: false,
  instructions: [],
  lastRecalculationTime: 0,
  lastDeviationTime: 0,
  currentStepIndex: 0,
  debounceTimer: null,
  trackingActive: false,
  watchId: null,
  userPosition: null,
  lastUserUpdateTimestamp: Date.now(),
  positionWatcher: null,
  lastSelectedFeature: null,
};

/**
 * Valida se o destino fornecido é válido.
 * O destino deve ser um objeto que contenha as propriedades numéricas "lat" e "lon".
 *
 * @param {Object} dest - Objeto destino.
 * @returns {boolean} - true se o destino for válido, false caso contrário.
 */
export function isValidDestination(dest) {
  return dest && typeof dest.lat === "number" && typeof dest.lon === "number";
}

/**
 * Valida se a localização do usuário é válida.
 * O objeto de localização deve conter as propriedades numéricas "latitude" e "longitude".
 *
 * @param {Object} loc - Objeto de localização.
 * @returns {boolean} - true se a localização for válida, false caso contrário.
 */
export function isValidUserLocation(loc) {
  return loc && typeof loc.latitude === "number" && typeof loc.longitude === "number";
}

export default globals;
