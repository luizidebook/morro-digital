/**
 * Monitor de rotação do mapa
 * Garante que a rotação seja mantida durante a navegação
 * Integrado com modo 3D Mapbox GL para experiência first-person
 */

// Importar funções de modo 3D
import { enable3DMode, disable3DMode, getMapbox3DInstance } from "./map-3d.js";

let rotationMonitorInterval = null;
let is3DModeActivatedByMonitor = false;

/**
 * Inicia o monitor de rotação do mapa
 * Ativa modo 3D Mapbox GL e mantém rotação em tempo real
 */
export function startRotationMonitor() {
  if (rotationMonitorInterval) {
    clearInterval(rotationMonitorInterval);
  }

  console.log("[map-rotation-monitor] startRotationMonitor chamado");
  console.log(
    "[map-rotation-monitor] enable3DMode é função?",
    typeof enable3DMode === "function"
  );

  // Ativar modo 3D quando rotação monitor inicia (se não estiver ativo)
  (async () => {
    try {
      if (!is3DModeActivatedByMonitor && typeof enable3DMode === "function") {
        console.log(
          "[map-rotation-monitor] Ativando modo 3D para navegação first-person..."
        );
        await enable3DMode();
        is3DModeActivatedByMonitor = true;
        console.log(
          "[map-rotation-monitor] ✅ Modo 3D ativado pelo monitor de rotação"
        );
      }
    } catch (error) {
      console.error("[map-rotation-monitor] Erro ao ativar modo 3D:", error);
    }
  })();

  // Configurar intervalo para atualizar rotação
  rotationMonitorInterval = setInterval(() => {
    const navigationActive =
      window.navigationState && window.navigationState.isActive;

    if (navigationActive) {
      // Aplicar rotação ao mapa 3D em tempo real
      const userLocation = window.userLocation;
      if (
        userLocation &&
        typeof userLocation.heading === "number" &&
        !isNaN(userLocation.heading)
      ) {
        applyRotationTo3D(userLocation.heading);
      }
    }
  }, 100); // Atualizar rotação a cada 100ms para fluidez

  console.log("[map-rotation-monitor] Monitor de rotação iniciado com 3D");
}

/**
 * Aplica rotação (bearing) ao mapa 3D Mapbox, suavemente.
 * @param {number} heading - Ângulo em graus
 * @param {Object} options - { duration }
 */
function applyRotationTo3D(heading, options = {}) {
  try {
    const mapbox = getMapbox3DInstance();
    if (!mapbox || typeof mapbox.easeTo !== "function") return false;

    const normalized = ((heading % 360) + 360) % 360;
    const duration = options.duration !== undefined ? options.duration : 120;

    // Usar easeTo para transição suave do bearing
    mapbox.easeTo({ bearing: normalized, duration });
    return true;
  } catch (error) {
    console.warn("[map-rotation-monitor] applyRotationTo3D erro:", error);
    return false;
  }
}

/**
 * Para o monitor de rotação do mapa
 * Desativa modo 3D quando navegação termina
 */
export function stopRotationMonitor() {
  if (rotationMonitorInterval) {
    clearInterval(rotationMonitorInterval);
    rotationMonitorInterval = null;
    console.log("[map-rotation-monitor] Monitor de rotação parado");
  }

  // Desativar modo 3D quando parar a rotação
  if (is3DModeActivatedByMonitor && typeof disable3DMode === "function") {
    try {
      console.log(
        "[map-rotation-monitor] Desativando modo 3D ao parar monitor..."
      );
      disable3DMode();
      is3DModeActivatedByMonitor = false;
      console.log("[map-rotation-monitor] ✅ Modo 3D desativado");
    } catch (error) {
      console.warn("[map-rotation-monitor] Erro ao desativar modo 3D:", error);
    }
  }
}

/**
 * Garante que todos os elementos do mapa estejam corretamente rotacionados
 */
function ensureMapElementsAreRotated() {
  const tilePane = document.querySelector(".leaflet-tile-pane");
  const mapPane = document.querySelector(".leaflet-map-pane");
  const controlPane = document.querySelector(".leaflet-control-container");

  if (tilePane) {
    tilePane.style.transform = "rotate(180deg) scale(-1, -1)";
    tilePane.style.transformOrigin = "center center";
  }

  if (mapPane) {
    mapPane.style.transformOrigin = "center center";
    mapPane.style.transform = "scale(-1, -1)";
  }

  if (controlPane) {
    controlPane.style.transformOrigin = "center center";
    controlPane.style.transform = "rotate(-180deg) scale(-1, -1)";
  }
}

// Exportar método para uso direto
export function ensureRotation() {
  if (window.navigationState && window.navigationState.isActive) {
    document.body.classList.add("map-rotated");
    ensureMapElementsAreRotated();
    return true;
  }
  return false;
}
