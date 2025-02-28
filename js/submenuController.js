"use strict";

/**
 * @file submenuController.js
 * @description Gerencia as interações e carregamento dos submenus.
 */

import { clearMarkers, adjustMapWithLocation } from "./mapVisualizations.js";
import { showControlButtonsTouristSpots, showControlButtonsTour, showControlButtonsBeaches, showControlButtonsNightlife, showControlButtonsRestaurants, showControlButtonsShops, showControlButtonsEmergencies, showControlButtonsEducation, showControlButtonsInns, showControlButtonsTips, showMenuButton } from "./uiController.js";
import { saveDestinationToCache } from "./cache.js";
import { showNotification } from "./notifications.js";

export let currentSubMenu = null;

/**
 * Carrega o submenu específico.
 * @param {string} subMenuId - ID do submenu.
 * @param {string} feature - Nome da feature.
 */
export function loadSubMenu(subMenuId, feature) {
  try {
    const subMenu = document.getElementById(subMenuId);
    if (!subMenu) {
      console.error(`loadSubMenu: Submenu "${subMenuId}" não encontrado.`);
      return;
    }
    console.log(`loadSubMenu: Carregando submenu "${subMenuId}" para "${feature}".`);
    subMenu.style.display = 'block';
    switch (feature) {
      case 'pontos-turisticos':
        displayCustomTouristSpots();
        break;
      case 'passeios':
        displayCustomTours();
        break;
      case 'praias':
        displayCustomBeaches();
        break;
      case 'festas':
        displayCustomNightlife();
        break;
      case 'restaurantes':
        displayCustomRestaurants();
        break;
      case 'pousadas':
        displayCustomInns();
        break;
      case 'lojas':
        displayCustomShops();
        break;
      case 'emergencias':
        displayCustomEmergencies();
        break;
      case 'dicas':
        displayCustomTips();
        break;
      case 'sobre':
        displayCustomAbout();
        break;
      case 'ensino':
        displayCustomEducation();
        break;
      default:
        console.error(`loadSubMenu: Feature "${feature}" não reconhecida.`);
        break;
    }
    currentSubMenu = subMenuId;
  } catch (error) {
    console.error("loadSubMenu: Erro ao carregar submenu:", error);
  }
}

/**
 * Função genérica para lidar com cliques em botões de submenu.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} name - Nome.
 * @param {string} description - Descrição.
 * @param {Array} images - Imagens.
 * @param {string} feature - Feature.
 */
export function handleSubmenuButtons(lat, lon, name, description, images, feature) {
  window.selectedDestination = { lat, lon, name, description, images, feature };
  clearMarkers();
  adjustMapWithLocation(lat, lon, name, description, 15, -10);
  saveDestinationToCache(window.selectedDestination)
    .then(() => {
      if (typeof clearCurrentRoute === "function") clearCurrentRoute();
    })
    .catch(error => console.error("handleSubmenuButtons: Erro ao salvar destino no cache.", error));
  switch (feature) {
    case "passeios":
      showControlButtonsTour();
      break;
    case "festas":
      showControlButtonsNightlife();
      break;
    case "restaurantes":
      showControlButtonsRestaurants();
      break;
    case "pousadas":
      showControlButtonsInns();
      break;
    case "lojas":
      showControlButtonsShops();
      break;
    case "emergencias":
      showControlButtonsEmergencies();
      break;
    case "dicas":
      showControlButtonsTips();
      break;
    case "pontos-turisticos":
      showControlButtonsTouristSpots();
      break;
    case "praias":
      showControlButtonsBeaches();
      break;
    case "ensino":
      showControlButtonsEducation();
      break;
    default:
      showMenuButton();
      console.warn(`handleSubmenuButtons: Feature "${feature}" não reconhecida.`);
      break;
  }
  console.log(`handleSubmenuButtons: Processado para "${feature}".`);
}

/**
 * Configura os listeners para cliques nos botões de submenu.
 */
export function setupSubmenuClickListeners() {
  const submenuButtons = document.querySelectorAll(".submenu-item");
  submenuButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      const lat = parseFloat(button.getAttribute("data-lat"));
      const lon = parseFloat(button.getAttribute("data-lon"));
      const name = button.getAttribute("data-name");
      const description = button.getAttribute("data-description");
      const feature = button.getAttribute("data-feature");
      handleSubmenuButtons(lat, lon, name, description, [], feature);
      event.stopPropagation();
    });
  });
  console.log("setupSubmenuClickListeners: Listeners configurados.");
}
