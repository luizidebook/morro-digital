"use strict";

/**
 * translationController.js - Versão Otimizada e Refatorada
 * 
 * Objetivo: Gerenciar a tradução dos textos da interface, garantindo que as chaves sejam recuperadas
 * do dicionário de traduções e aplicadas conforme o idioma selecionado. Integra com o estado global (appGlobals)
 * para definir o idioma padrão.
 */

import { updateInterfaceLanguage } from './config.js';
import { showNotification } from './notifications.js';
import appGlobals from './globals.js';

/**
 * Traduz uma instrução utilizando um dicionário simples.
 * @param {string} instruction - Instrução original.
 * @param {string} [lang=appGlobals.selectedLanguage || "pt"] - Código do idioma.
 * @returns {string} Instrução traduzida.
 */
export const translateInstruction = (instruction, lang = appGlobals.selectedLanguage || "pt") => {
  const dictionary = {
    pt: {
      "Turn right": "Vire à direita",
      "Turn left": "Vire à esquerda",
      "Continue straight": "Continue em frente"
    },
    en: {
      "Vire à direita": "Turn right",
      "Vire à esquerda": "Turn left",
      "Continue em frente": "Continue straight"
    }
    // Adicione outros idiomas conforme necessário
  };
  if (!dictionary[lang]) return instruction;
  return dictionary[lang][instruction] || instruction;
};

/**
 * Atualiza todos os elementos da interface que possuem o atributo data-i18n,
 * substituindo seu conteúdo pelo texto traduzido.
 * @param {string} lang - Código do idioma a ser aplicado.
 */
export const translatePageContent = (lang) => {
  try {
    const elements = document.querySelectorAll("[data-i18n]");
    let missingCount = 0;
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = getGeneralText(key, lang);
      if (translation.startsWith("⚠️")) {
        missingCount++;
        console.warn(`translatePageContent: Tradução ausente para "${key}" em ${lang}.`);
      }
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translation;
      } else if (el.hasAttribute("title")) {
        el.title = translation;
      } else {
        el.textContent = translation;
      }
    });
    if (missingCount > 0) {
      console.warn(`translatePageContent: ${missingCount} traduções ausentes.`);
    } else {
      console.log(`translatePageContent: Interface traduzida para ${lang}.`);
    }
  } catch (error) {
    console.error("translatePageContent: Erro ao traduzir a interface:", error);
  }
};

/**
 * Verifica se todas as chaves de tradução estão definidas para o idioma especificado.
 * @param {string} lang - Código do idioma.
 */
export const validateTranslations = (lang) => {
  try {
    const elements = document.querySelectorAll("[data-i18n]");
    const missingKeys = [];
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = getGeneralText(key, lang);
      if (translation.startsWith("⚠️")) {
        missingKeys.push(key);
      }
    });
    if (missingKeys.length > 0) {
      console.warn(`validateTranslations: Faltam traduções para ${lang}:`, missingKeys);
    } else {
      console.log(`validateTranslations: Todas as traduções definidas para ${lang}.`);
    }
  } catch (error) {
    console.error("validateTranslations: Erro durante a validação das traduções:", error);
  }
};

/**
 * Aplica o idioma na interface:
 * - Valida as traduções.
 * - Atualiza os textos da interface.
 * - Atualiza o idioma no estado global.
 * @param {string} lang - Código do idioma.
 */
export const applyLanguage = (lang) => {
  try {
    validateTranslations(lang);
    updateInterfaceLanguage(lang);
    appGlobals.selectedLanguage = lang;
    console.log(`applyLanguage: Idioma aplicado: ${lang}`);
  } catch (error) {
    console.error("applyLanguage: Erro ao aplicar idioma:", error);
    showNotification("Erro ao aplicar idioma.", "error");
  }
};

/**
 * Retorna o texto traduzido para uma chave específica.
 * Se a tradução não existir, retorna a própria chave e emite um aviso.
 * @param {string} key - Chave de tradução.
 * @param {string} [lang="pt"] - Código do idioma.
 * @returns {string} Texto traduzido ou a chave original.
 */
export const getGeneralText = (key, lang = "pt") => {
  try {
    if (!translationsData[lang] || !translationsData[lang][key]) {
      console.warn(`getGeneralText: Tradução ausente para: '${key}' em '${lang}'.`);
      return key; // Retorna a chave original como fallback
    }
    return translationsData[lang][key];
  } catch (error) {
    console.error(`getGeneralText: Erro ao recuperar a tradução para '${key}':`, error);
    return key;
  }
};

// Dicionário de traduções para os idiomas suportados
const translationsData = {
    pt: {
      // Traduções em português...
    },
    en: {
      // Traduções em inglês...
    }
    // Adicione outros idiomas conforme necessário
};
