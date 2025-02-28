"use strict";

/**
 * @file menuController.js
 * @description Gerencia as interações com os menus e submenus.
 */

import { globals } from './globals.js';
import { clearMarkers } from "./mapVisualizations.js";
import { loadSubMenu } from "./submenuController.js";

/**
 * Fecha o menu lateral.
 */
export function closeSideMenu() {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.style.display = "none";
    console.log("closeSideMenu: Menu fechado.");
  } else {
    console.warn("closeSideMenu: 'menu' não encontrado.");
  }
}

/**
 * Lida com a seleção de uma funcionalidade a partir do menu.
 * @param {string} feature - Feature selecionada.
 */
export function handleFeatureSelection(feature) {
  globals.lastSelectedFeature = feature;
  const featureMappings = {
    "pontos-turisticos": "touristSpots-submenu",
    "passeios": "tours-submenu",
    "praias": "beaches-submenu",
    "festas": "nightlife-submenu",
    "restaurantes": "restaurants-submenu",
    "pousadas": "inns-submenu",
    "lojas": "shops-submenu",
    "emergencias": "emergencies-submenu",
    "dicas": "tips-submenu",
    "sobre": "about-submenu",
    "ensino": "education-submenu"
  };
  const subMenuId = featureMappings[feature];
  if (!subMenuId) {
    console.error(`handleFeatureSelection: Feature "${feature}" não reconhecida.`);
    return;
  }
  console.log(`handleFeatureSelection: Feature "${feature}" selecionada, Submenu: "${subMenuId}".`);
  const allSubmenus = document.querySelectorAll("#menu .submenu");
  allSubmenus.forEach((submenu) => {
    submenu.style.display = "none";
  });
  clearMarkers();
  const menu = document.getElementById("menu");
  if (globals.currentSubMenu === subMenuId) {
    if (menu) menu.style.display = "none";
    globals.currentSubMenu = null;
    console.log("handleFeatureSelection: Submenu ativo, fechando menu.");
  } else {
    loadSubMenu(subMenuId, feature);
    if (menu) menu.style.display = "block";
    globals.currentSubMenu = subMenuId;
    console.log("handleFeatureSelection: Submenu aberto.");
  }
}
