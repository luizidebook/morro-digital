"use strict";

/**
 * @file voiceInteractionController.js
 * @description Gerencia o reconhecimento e processamento de comandos de voz.
 */

import { showNotification } from './notifications.js';
import { handleFeatureSelection } from './utils.js';
import appGlobals from './globals.js';

/**
 * Inicia o reconhecimento de voz.
 */
export function startVoiceRecognition() {
  try {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      console.warn("startVoiceRecognition: Reconhecimento de voz não suportado.");
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = appGlobals.selectedLanguage === "pt" ? "pt-BR" : appGlobals.selectedLanguage;
    recognition.start();
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      console.log("startVoiceRecognition: Comando reconhecido:", command);
      interpretCommand(command);
      confirmCommandFeedback(command);
    };
    recognition.onerror = (event) => {
      console.error("startVoiceRecognition: Erro:", event.error);
      showNotification("Erro ao processar comando de voz.", "error");
    };
    console.log("startVoiceRecognition: Reconhecimento iniciado.");
  } catch (error) {
    console.error("startVoiceRecognition: Erro:", error);
  }
}

/**
 * Exibe efeito visual indicando captação de voz.
 */
export function visualizeVoiceCapture() {
  try {
    const micIcon = document.getElementById("mic-icon");
    if (micIcon) {
      micIcon.classList.add("listening");
      setTimeout(() => micIcon.classList.remove("listening"), 3000);
    }
    console.log("visualizeVoiceCapture: Efeito aplicado.");
  } catch (error) {
    console.error("visualizeVoiceCapture: Erro:", error);
  }
}

/**
 * Interpreta o comando de voz e aciona a funcionalidade correspondente.
 * @param {string} command - Comando reconhecido.
 */
export function interpretCommand(command) {
  try {
    const lowerCmd = command.toLowerCase();
    if (lowerCmd.includes("praia")) {
      handleFeatureSelection("praias");
    } else if (lowerCmd.includes("restaurante")) {
      handleFeatureSelection("restaurantes");
    } else if (lowerCmd.includes("tour")) {
      handleFeatureSelection("passeios");
    } else {
      showNotification("Comando não reconhecido. Tente novamente.", "warning");
    }
    console.log(`interpretCommand: Comando interpretado: "${command}"`);
  } catch (error) {
    console.error("interpretCommand: Erro:", error);
  }
}

/**
 * Fornece feedback textual do comando reconhecido.
 * @param {string} command - Comando reconhecido.
 */
export function confirmCommandFeedback(command) {
  try {
    showNotification(`Você disse: ${command}`, "info");
    console.log("confirmCommandFeedback: Feedback enviado.");
  } catch (error) {
    console.error("confirmCommandFeedback: Erro:", error);
  }
}

/**
 * Confirma o comando de voz com efeito visual.
 */
export function confirmAudioCommand() {
  try {
    showNotification("Comando recebido. Processando...", "info");
    visualizeVoiceCapture();
    console.log("confirmAudioCommand: Comando confirmado.");
  } catch (error) {
    console.error("confirmAudioCommand: Erro:", error);
  }
}

/**
 * Converte texto em áudio utilizando SpeechSynthesis.
 * @param {string} message - Texto a ser falado.
 */
export function giveVoiceFeedback(message) {
  try {
    if (!("speechSynthesis" in window)) {
      console.warn("giveVoiceFeedback: SpeechSynthesis não suportado.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = appGlobals.selectedLanguage === "pt" ? "pt-BR" : "en-US";
    window.speechSynthesis.speak(utterance);
    console.log("giveVoiceFeedback: Mensagem falada:", message);
  } catch (error) {
    console.error("giveVoiceFeedback: Erro:", error);
  }
}

/**
 * Fala uma instrução utilizando SpeechSynthesis.
 * @param {string} text - Instrução.
 * @param {string} [voiceLang="pt-BR"] - Código do idioma.
 */
export function speakInstruction(text, voiceLang = "pt-BR") {
  try {
    if (!("speechSynthesis" in window)) {
      console.warn("speakInstruction: SpeechSynthesis não suportado.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    window.speechSynthesis.speak(utterance);
    console.log("speakInstruction: Instrução falada:", text);
  } catch (error) {
    console.error("speakInstruction: Erro:", error);
  }
}
