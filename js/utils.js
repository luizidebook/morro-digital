"use strict";

/**
 * @file utils.js
 * @description Funções utilitárias para animação, prompts e fallback de navegação.
 */

/**
 * Anima a transição de um marker do ponto inicial ao final.
 * @param {L.Marker} marker - Marker a ser animado.
 * @param {L.LatLng} startPos - Posição inicial.
 * @param {Array<number>} endPos - Posição final [lat, lon].
 * @param {number} duration - Duração da animação em milissegundos.
 */
export function animateMarker(marker, startPos, endPos, duration) {
  const startTime = performance.now();
  const [endLat, endLon] = endPos;
  const startLat = startPos.lat;
  const startLon = startPos.lng;
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLon = startLon + (endLon - startLon) * progress;
    marker.setLatLng([currentLat, currentLon]);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

/**
 * Exibe um modal para o usuário escolher entre opções de rota.
 * @param {Array<Object>} routeOptions - Opções de rota.
 * @returns {Promise<Object|null>} Opção escolhida ou null.
 */
export function promptUserToChooseRoute(routeOptions) {
  return new Promise((resolve) => {
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.zIndex = "9999";
    const modalContainer = document.createElement("div");
    modalContainer.style.backgroundColor = "#fff";
    modalContainer.style.padding = "20px";
    modalContainer.style.borderRadius = "8px";
    modalContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    modalContainer.style.maxWidth = "400px";
    modalContainer.style.width = "80%";
    modalContainer.style.textAlign = "center";
    const title = document.createElement("h3");
    title.textContent = "Escolha uma opção de rota:";
    title.style.marginBottom = "20px";
    modalContainer.appendChild(title);
    routeOptions.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.textContent = `${index + 1}: ${option.profile}`;
      btn.style.margin = "10px";
      btn.style.padding = "10px 20px";
      btn.style.border = "none";
      btn.style.borderRadius = "4px";
      btn.style.backgroundColor = "#007BFF";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.onclick = () => {
        document.body.removeChild(modalOverlay);
        resolve(option);
      };
      modalContainer.appendChild(btn);
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancelar";
    cancelBtn.style.margin = "10px";
    cancelBtn.style.padding = "10px 20px";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.backgroundColor = "#dc3545";
    cancelBtn.style.color = "#fff";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve(null);
    };
    modalContainer.appendChild(cancelBtn);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
  });
}

/**
 * Enriquecer instruções com dados do OSM.
 * @param {Array<Object>} instructions - Instruções.
 * @param {string} [lang="pt"] - Código do idioma.
 * @returns {Promise<Array<Object>>} Instruções enriquecidas.
 */
export async function enrichInstructionsWithOSM(instructions, lang = "pt") {
  async function fakeFetchPOIsNearby(lat, lon) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([{ name: "POI Exemplo", lat, lon }]);
      }, 500);
    });
  }
  const enriched = await Promise.all(
    instructions.map(async (step) => {
      const pois = await fakeFetchPOIsNearby(step.lat, step.lon);
      step.enrichedInfo = pois && pois.length > 0 ? `Existem ${pois.length} POIs próximos.` : null;
      return step;
    })
  );
  console.log("enrichInstructionsWithOSM: Instruções enriquecidas.");
  return enriched;
}

/**
 * Retorna a URL associada a um local.
 * @param {string} locationName - Nome do local.
 * @returns {string|null} URL ou null.
 */
export function getUrlsForLocation(locationName) {
  const urlDatabase = {
    "Toca do Morcego": "https://www.tocadomorcego.com.br/"
  };
  return urlDatabase[locationName] || null;
}

/**
 * Retorna imagens associadas a um local.
 * @param {string} locationName - Nome do local.
 * @returns {Array<string>} Array de URLs.
 */
export function getImagesForLocation(locationName) {
  const basePath = 'img/';
  const imageDatabase = {
    'Farol do Morro': [
      `${basePath}farol_do_morro1.jpg`,
      `${basePath}farol_do_morro2.jpg`,
      `${basePath}farol_do_morro3.jpg`
    ],
    // ... Adicione outras entradas conforme necessário
  };
  return imageDatabase[locationName] || [];
}

/**
 * Retorna um ícone apropriado para uma manobra de navegação.
 * @param {string} maneuverKey - Chave da manobra.
 * @returns {string} Ícone (emoji).
 */
export function getDirectionIcon(maneuverKey) {
  const iconMap = {
    head_north: "⬆️",
    head_south: "⬇️",
    head_east:  "➡️",
    head_west:  "⬅️",
    turn_left:  "⬅️",
    turn_right: "➡️",
    turn_sharp_left: "↰",
    turn_sharp_right: "↱",
    turn_slight_left: "↲",
    turn_slight_right: "↳",
    continue_straight: "⬆️",
    keep_left: "↰",
    keep_right:"↱",
    u_turn: "↩️",
    enter_roundabout: "🔄",
    exit_roundabout: "🔄",
    ferry: "⛴️",
    arrive_destination: "✅"
  };
  if (maneuverKey.startsWith("exit_roundabout_")) {
    const exitNum = maneuverKey.replace("exit_roundabout_", "");
    return `🔄${exitNum}`;
  }
  if (iconMap[maneuverKey]) return iconMap[maneuverKey];
  console.warn(`getDirectionIcon: Manobra "${maneuverKey}" não reconhecida.`);
  return "⬆️";
}
