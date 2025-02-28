"use strict";

/**
 * @file notifications.js
 * @description Gerencia a exibição de notificações na interface.
 */

/**
 * Exibe uma notificação para o usuário.
 * @param {string} message - Mensagem.
 * @param {string} type - Tipo ("error", "warning", "success", "info").
 * @param {number} [duration=3000] - Duração em milissegundos.
 */
export function showNotification(message, type, duration = 3000) {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
  }
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.marginBottom = "10px";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "4px";
  notification.style.color = "#fff";
  switch (type) {
    case "error":
      notification.style.backgroundColor = "#e74c3c";
      break;
    case "warning":
      notification.style.backgroundColor = "#f39c12";
      break;
    case "success":
      notification.style.backgroundColor = "#27ae60";
      break;
    default:
      notification.style.backgroundColor = "#3498db";
  }
  container.appendChild(notification);
  setTimeout(() => notification.remove(), duration);
  console.log(`showNotification: [${type}] ${message}`);
}
