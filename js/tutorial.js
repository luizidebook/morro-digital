"use strict";

/**
 * @file tutorial.js
 * @description Gerencia o fluxo interativo do tutorial, controlando início, avanço e finalização.
 */

import { showNotification } from './notifications.js';
import { getGeneralText } from './translationController.js';
import { hideAllControlButtons } from './menuController.js';
import { updateAssistantModalContent } from './uiController.js';

export let tutorialIsActive = false;
export let currentStepIndex = null;
export let tutorialSteps = [];

/**
 * Inicia o tutorial interativo.
 */
export function startTutorial() {
  tutorialIsActive = true;
  currentStepIndex = 0;
  showTutorialStep("start-tutorial");
  console.log("startTutorial: Tutorial iniciado.");
}

/**
 * Finaliza o tutorial.
 */
export function endTutorial() {
  tutorialIsActive = false;
  currentStepIndex = null;
  hideAllControlButtons();
  const assistantModal = document.getElementById("assistant-modal");
  if (assistantModal) assistantModal.style.display = "none";
  console.log("endTutorial: Tutorial finalizado.");
}

/**
 * Avança para o próximo passo.
 */
export function nextTutorialStep() {
  if (currentStepIndex === null) {
    console.warn("nextTutorialStep: Tutorial não iniciado.");
    return;
  }
  if (currentStepIndex < tutorialSteps.length - 1) {
    currentStepIndex++;
    showTutorialStep(tutorialSteps[currentStepIndex].step);
    console.log(`nextTutorialStep: Avançado para o passo ${currentStepIndex}.`);
  } else {
    endTutorial();
  }
}

/**
 * Retorna ao passo anterior.
 */
export function previousTutorialStep() {
  if (currentStepIndex === null || currentStepIndex === 0) {
    console.warn("previousTutorialStep: Já no primeiro passo ou não iniciado.");
    return;
  }
  currentStepIndex--;
  showTutorialStep(tutorialSteps[currentStepIndex].step);
  console.log(`previousTutorialStep: Retornado para o passo ${currentStepIndex}.`);
}

/**
 * Exibe o passo do tutorial com base no ID.
 * @param {string} stepId - Identificador do passo.
 */
export function showTutorialStep(stepId) {
  const stepConfig = tutorialSteps.find(s => s.step === stepId);
  if (!stepConfig) {
    console.error(`showTutorialStep: Passo "${stepId}" não encontrado.`);
    return;
  }
  updateAssistantModalContent(stepId, stepConfig.message);
  if (typeof hideAllControlButtons === "function") hideAllControlButtons();
  if (typeof stepConfig.action === "function") stepConfig.action();
  console.log(`showTutorialStep: Exibindo passo "${stepId}".`);
}

/**
 * Armazena a resposta do usuário e avança para o próximo passo.
 * @param {string} interest - Interesse selecionado.
 */
export function storeAndProceed(interest) {
  try {
    localStorage.setItem('userInterest', interest);
    const specificStep = tutorialSteps.find(s => s.step === interest);
    if (specificStep) {
      currentStepIndex = tutorialSteps.indexOf(specificStep);
      showTutorialStep(specificStep.step);
      console.log(`storeAndProceed: Avançando para o passo "${interest}".`);
    } else {
      console.error("storeAndProceed: Passo para o interesse não encontrado.");
    }
  } catch (error) {
    console.error("storeAndProceed: Erro ao armazenar interesse:", error);
  }
}

/**
 * Gera os passos personalizados do tutorial.
 * @returns {Array<Object>} Array de passos.
 */
export function generateInterestSteps() {
  const interests = [
    { id: 'pousadas', label: "Pousadas", message: getGeneralText("pousadasMessage") },
    { id: 'pontos-turisticos', label: "Pontos Turísticos", message: getGeneralText("touristSpotsMessage") },
    { id: 'praias', label: "Praias", message: getGeneralText("beachesMessage") },
    { id: 'passeios', label: "Passeios", message: getGeneralText("toursMessage") },
    { id: 'restaurantes', label: "Restaurantes", message: getGeneralText("restaurantsMessage") },
    { id: 'festas', label: "Festas", message: getGeneralText("partiesMessage") },
    { id: 'lojas', label: "Lojas", message: getGeneralText("shopsMessage") },
    { id: 'emergencias', label: "Emergências", message: getGeneralText("emergenciesMessage") }
  ];
  const steps = interests.flatMap(interest => ([
    {
      step: interest.id,
      message: interest.message,
      action: () => {
        const btn = document.querySelector(`.menu-btn[data-feature="${interest.id}"]`);
        if (btn) btn.classList.add("highlight");
        if (typeof window[`showControlButtons${interest.id.charAt(0).toUpperCase() + interest.id.slice(1)}`] === "function") {
          window[`showControlButtons${interest.id.charAt(0).toUpperCase() + interest.id.slice(1)}`]();
        }
        console.log(`generateInterestSteps: Interesse "${interest.label}" selecionado.`);
      }
    },
    {
      step: 'submenu-example',
      message: getGeneralText("submenuInstruction") || "Escolha uma opção do submenu para continuar.",
      action: () => {
        const submenu = document.querySelector('.submenu');
        if (submenu) submenu.style.display = 'block';
        endTutorial();
        console.log("generateInterestSteps: Submenu exibido.");
      }
    }
  ]));
  return steps;
}

/**
 * Remove os destaques visuais.
 */
export function removeExistingHighlights() {
  document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
  console.log("removeExistingHighlights: Destaques removidos.");
}

/**
 * Função auxiliar para capitalizar a primeira letra.
 * @param {string} str - Texto.
 * @returns {string} Texto capitalizado.
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
