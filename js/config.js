"use strict";

/**
 * @file config.js
 * @description Gerencia o carregamento de recursos e a configuração do idioma, com tratamento de erros e feedback de desempenho.
 */

import { getGeneralText } from './translationController.js';
import { showNotification } from './notifications.js';

/**
 * Atualiza os elementos da interface com as traduções conforme o idioma selecionado.
 * @param {string} lang - Código do idioma (ex: "pt", "en", "es", "he").
 */
function updateInterfaceLanguage(lang) {
  try {
    const elements = document.querySelectorAll("[data-i18n]");
    let missingTranslations = 0;
    elements.forEach(element => {
      const key = element.getAttribute("data-i18n");
      let translation = getGeneralText(key, lang);
      if (!translation || translation.startsWith("⚠️")) {
        missingTranslations++;
        console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
        translation = key; // fallback
      }
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else if (element.hasAttribute("title")) {
        element.title = translation;
      } else {
        element.textContent = translation;
      }
    });
    if (missingTranslations > 0) {
      console.warn(`Total de traduções ausentes: ${missingTranslations}`);
    } else {
      console.log(`Traduções aplicadas com sucesso para o idioma: ${lang}`);
    }
  } catch (error) {
    console.error("Erro ao atualizar a interface:", error);
  }
}

/**
 * Define e aplica o idioma selecionado.
 * @param {string} lang - Código do idioma (ex: "pt", "en", "es", "he").
 */
function setLanguage(lang) {
  try {
    const availableLanguages = ["pt", "en", "es", "he"];
    const defaultLanguage = "pt";
    if (!availableLanguages.includes(lang)) {
      console.warn(`Idioma ${lang} não disponível. Utilizando ${defaultLanguage}.`);
      lang = defaultLanguage;
    }
    if (typeof Storage !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    } else {
      console.warn("localStorage não disponível. A configuração não será persistida.");
    }
    updateInterfaceLanguage(lang);
    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) welcomeModal.style.display = "none";
    console.log(`Idioma definido para: ${lang}`);
  } catch (error) {
    console.error("Erro ao definir idioma:", error);
    showNotification(getGeneralText("routeError", "pt"), "error");
  }
}

/**
 * Carrega recursos iniciais e fornece feedback visual.
 * @param {Function} [callback] - Função a ser executada após o carregamento.
 */
async function loadResources(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
  try {
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const elapsedTime = performance.now() - startTime;
    console.log(`Recursos carregados em ${elapsedTime.toFixed(2)}ms.`);
    if (loader) loader.style.display = "none";
    if (typeof callback === "function") callback();
  } catch (error) {
    if (loader) loader.style.display = "none";
    console.error("Falha ao carregar recursos:", error);
    showNotification(getGeneralText("loaderFail", "pt"), "error");
  }
}

export { loadResources, setLanguage, updateInterfaceLanguage };
