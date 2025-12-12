/**
 * Módulo de Controles Unificados do Mapa
 * Integra controles para mapa 2D (Leaflet) e 3D (Mapbox GL)
 */

import { getMapInstance } from "./map-init.js";
import {
  clearMarkers,
  showLocationOnMap,
  showAllLocationsOnMap,
} from "./map-markers.js";
import { addRotationControl } from "./map-controls.js";

// Importar funcionalidades do modo 3D
import {
  initMapbox3D,
  enable3DMode,
  disable3DMode,
  getMapbox3DInstance,
  addMarker3D,
  clearMarkers3D,
  updateRouteIn3D,
  flyToLocation,
  is3DModeActive,
} from "./map-3d/map-3d.js";

// Importar controles de satélite
import {
  initSatelliteControls,
  toggleSatelliteControlPanel,
} from "./map-3d/satelite-controls/satellite-imagery-controls.js";

import {
  initSatelliteEnhancer,
  setSatelliteSource,
} from "./map-3d/satelite-controls/satellite-imagery-enhancer.js";

// Estado do módulo
let isInitialized = false;
let is3DEnabled = false;
let isSatelliteActive = false;
let currentSatelliteSource = "streets";
let is3DControlsVisible = false;

/**
 * Inicializa os controles unificados do mapa
 * @returns {Promise<boolean>} Sucesso da inicialização
 */
export async function initUnifiedControls() {
  if (isInitialized) {
    console.log("[map-unified-controls] Controles já inicializados");
    return true;
  }

  try {
    // Obter instância de mapa global se não fornecida
    // CORREÇÃO: Usar window.map se getMapInstance() não retornar um valor
    let mapInstance = getMapInstance();
    if (!mapInstance && window.map) {
      console.log("[map-unified-controls] Usando window.map como fallback");
      mapInstance = window.map;
    }

    if (!mapInstance) {
      console.error(
        "[map-unified-controls] Instância de mapa não encontrada. Tentando novamente em 1 segundo..."
      );
      // Tentar novamente após um intervalo
      return new Promise((resolve) => {
        setTimeout(() => {
          initUnifiedControls().then(resolve);
        }, 1000);
      });
    }

    console.log(
      "[map-unified-controls] Mapa encontrado, inicializando controles unificados"
    );

    // 1. Adicionar container para os controles unificados
    addControlsContainer();

    // 2. Carregar scripts do Mapbox GL de forma assíncrona
    await loadMapboxGLScripts();

    // 3. Pré-inicializar o módulo 3D (sem exibição)
    await preInitialize3DMode();

    // 4. Inicializar recursos de satélite (somente infraestrutura, sem opções na UI)
    initSatelliteEnhancer();
    initSatelliteControls({
      initialSource: "streets",
      addControlButton: false,
      sources: ["streets"], // Removidas opções de satélite para ocultar no painel
    });

    // 5. Adicionar controles à interface
    addMapControlButtons();

    isInitialized = true;
    console.log(
      "[map-unified-controls] Controles unificados inicializados com sucesso"
    );
    return true;
  } catch (error) {
    console.error(
      "[map-unified-controls] Erro ao inicializar controles unificados:",
      error
    );
    return false;
  }
}

/**
 * Carrega os scripts do Mapbox GL de forma assíncrona
 * @returns {Promise<void>}
 */
async function loadMapboxGLScripts() {
  if (window.mapboxgl) return;

  return new Promise((resolve, reject) => {
    // Carregar CSS do Mapbox GL
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
    document.head.appendChild(link);

    // Carregar JavaScript do Mapbox GL
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
    script.async = true;
    script.onload = () => {
      console.log("[map-unified-controls] Mapbox GL carregado com sucesso");
      resolve();
    };
    script.onerror = (err) => {
      console.error("[map-unified-controls] Erro ao carregar Mapbox GL:", err);
      reject(new Error("Falha ao carregar Mapbox GL"));
    };
    document.head.appendChild(script);
  });
}

/**
 * Adiciona container para os controles unificados
 */
function addControlsContainer() {
  // Verificar se o container já existe
  if (document.getElementById("unified-map-controls")) return;

  // Criar container para os controles
  const container = document.createElement("div");
  container.id = "unified-map-controls";
  container.className = "unified-map-controls";

  // Adicionar ao mapa
  const mapContainer =
    document.getElementById("map-container") || document.getElementById("map");
  if (mapContainer) {
    mapContainer.appendChild(container);
  } else {
    document.body.appendChild(container);
  }

  // Adicionar estilos
  addControlStyles();
}

/**
 * Adiciona estilos CSS para os controles unificados
 */
function addControlStyles() {
  if (document.getElementById("unified-controls-styles")) return;

  const style = document.createElement("style");
  style.id = "unified-controls-styles";
  style.textContent = `
    .unified-map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .map-control-button {
      width: 40px;
      height: 40px;
      background: white;
      border: none;
      border-radius: 4px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .map-control-button:hover {
      background: #f0f0f0;
    }
    
    .map-control-button.active {
      background: #3b82f6;
      color: white;
    }
    
    .map-control-button svg {
      width: 24px;
      height: 24px;
    }
    
    .control-tooltip {
      position: absolute;
      right: 50px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    
    .map-control-button:hover .control-tooltip {
      opacity: 1;
    }
    
    /* Estilos para os controles 3D */
    .mode-3d-buttons {
      display: flex;
      flex-direction: column;
      gap: 5px;
      overflow: hidden;
      max-height: 210px;
      transition: max-height 0.3s ease;
    }
    
    .mode-3d-buttons.hidden {
      max-height: 0;
    }
    
    /* Botão 3D com texto */
    .button-3d-text {
      font-weight: bold;
      font-size: 14px;
    }
    
    /* Estilos para o painel de satélite */
    .satellite-control-panel {
      position: absolute;
      top: 70px;
      right: 10px;
      width: 300px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      z-index: 999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
    }
    
    .panel-header {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0 5px;
    }
    
    .control-section {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .source-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    
    .source-button {
      padding: 10px;
      border: 1px solid #ccc;
      background: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    
    .source-button:hover {
      background: #e5e5e5;
    }
    
    .source-button.active {
      background: #3b82f6;
      color: white;
      border-color: #2563eb;
    }
    
    /* Animação para clique nos botões 3D */
    @keyframes buttonClick {
      0% { transform: scale(1); }
      50% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    
    .map-control-button.clicked {
      animation: buttonClick 0.3s ease;
    }
    
    @media (max-width: 768px) {
      .unified-map-controls {
        top: auto;
        bottom: 20%;
        right: 10px;
      }
      
      .satellite-control-panel {
        width: 250px;
        top: auto;
        bottom: 170px;
        max-height: 300vh;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Pré-inicializa o modo 3D sem exibi-lo
 * @returns {Promise<boolean>}
 */
async function preInitialize3DMode() {
  try {
    if (!window.mapboxgl) {
      console.warn(
        "[map-unified-controls] Mapbox GL não disponível para pré-inicialização 3D"
      );
      return false;
    }

    // Obter a instância do mapa Leaflet atual
    const mapInstance = getMapInstance() || window.map;
    if (!mapInstance) return false;

    // Obter o centro e zoom atuais
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();

    // Pré-inicializar o mapa 3D sem exibi-lo
    const mapbox3D = await initMapbox3D({
      center: [center.lng, center.lat],
      zoom: zoom,
      containerId: "map",
      originalMapInstance: mapInstance,
      visible: false,
    });

    if (mapbox3D) {
      console.log(
        "[map-unified-controls] Mapa 3D pré-inicializado com sucesso"
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "[map-unified-controls] Erro ao pré-inicializar modo 3D:",
      error
    );
    return false;
  }
}

/**
 * Adiciona os botões de controle do mapa
 */
function addMapControlButtons() {
  const container = document.getElementById("unified-map-controls");
  if (!container) return;

  // Limpar controles existentes
  container.innerHTML = "";

  // 1. Botão de camadas do mapa (substituindo o de satélite)
  const buttonLayers = document.createElement("button");
  buttonLayers.className = "map-control-button";
  buttonLayers.id = "toggle-map-layers";
  buttonLayers.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
    <span class="control-tooltip">Camadas do Mapa</span>
  `;
  buttonLayers.title = "Camadas do Mapa";
  buttonLayers.addEventListener("click", toggleMapLayersPanel);
  container.appendChild(buttonLayers);

  // 2. Botão de modo 3D removido da interface (ativação automática controlada por navegação)

  // 3. Botão de localização
  const buttonLocation = document.createElement("button");
  buttonLocation.className = "map-control-button";
  buttonLocation.id = "locate-user";
  buttonLocation.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    <span class="control-tooltip">Minha Localização</span>
  `;
  buttonLocation.title = "Encontrar minha localização";
  buttonLocation.addEventListener("click", locateUser);
  container.appendChild(buttonLocation);

  // 4. Botão de resetar mapa
  const buttonReset = document.createElement("button");
  buttonReset.className = "map-control-button";
  buttonReset.id = "reset-map";
  buttonReset.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
    <span class="control-tooltip">Resetar Mapa</span>
  `;
  buttonReset.title = "Resetar visualização do mapa";
  buttonReset.addEventListener("click", resetMapView);
  container.appendChild(buttonReset);

  // Criar um painel de camadas personalizado para o botão de camadas
  createMapLayersPanel();
}

/**
 * Cria um botão de controle com o estilo padrão
 * @param {string} id - ID do botão
 * @param {string} title - Título do botão (tooltip)
 * @param {string} innerHTML - HTML interno do botão
 * @returns {HTMLButtonElement} Botão criado
 */
function createControlButton(id, title, innerHTML) {
  const button = document.createElement("button");
  button.className = "map-control-button";
  button.id = id;
  button.title = title;
  button.innerHTML = innerHTML;
  return button;
}

/**
 * Updates CSS styles for satellite controls with modern design - no scrollbar version
 */
function updateSatelliteControlStyles() {
  if (document.getElementById("satellite-control-styles")) {
    document.getElementById("satellite-control-styles").remove();
  }

  const style = document.createElement("style");
  style.id = "satellite-control-styles";
  style.textContent = `
    .satellite-control-panel {
      position: absolute;
      top: 70px;
      right: 10px;
      width: 330px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      z-index: 999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333;
      /* Removed max-height and overflow-y to eliminate scrollbar */
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.08);
    }
    
    /* Compact layout to reduce overall panel height */
    .panel-header {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header-content i {
      font-size: 16px;
      color: #3b82f6;
    }
    
    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #6B7280;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      transition: all 0.2s;
    }
    
    .control-section {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .section-title i {
      color: #3b82f6;
      font-size: 14px;
    }
    
    .section-title h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    
    /* More compact source cards */
    .source-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    
    .source-card {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 8px;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      gap: 10px;
    }
    
    .source-card:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }
    
    .source-card.active {
      border-color: #3b82f6;
      background: #EFF6FF;
    }
    
    .card-icon {
      width: 32px; /* Smaller icon */
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .card-content {
      flex-grow: 1;
    }
    
    .card-title {
      font-weight: 600;
      font-size: 13px;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .card-description {
      font-size: 11px;
      color: #6B7280;
      line-height: 1.3;
    }
    
    /* Tabbed layout for options to save vertical space */
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: 0;
    }
    
    .option-tabs {
      display: flex;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 12px;
      padding-bottom: 0;
    }
    
    .option-tab {
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      color: #6B7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .option-tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }
    
    .option-content {
      display: none;
    }
    
    .option-content.active {
      display: block;
    }
    
    /* Compact sliders */
    .option-sliders {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 10px;
    }
    
    .option-slider {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .slider-header label {
      font-weight: 500;
      font-size: 13px;
      color: #4B5563;
    }
    
    .slider-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 3px;
    }
    
    .slider-value {
      background: #EFF6FF;
      color: #3b82f6;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    /* Other styles remain the same but more compact */
    .min-value, .max-value {
      font-size: 11px;
      color: #6B7280;
    }
    
    input[type="range"] {
      -webkit-appearance: none;
      flex: 1;
      height: 5px;
      border-radius: 5px;
      background: #E5E7EB;
      outline: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    
    /* Control items for satellite enhancement */
    .satellite-enhancement-controls {
      display: grid;
      gap: 10px;
    }
    
    .enhancement-control-item {
      margin-bottom: 8px;
    }
    
    .control-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }
    
    .control-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .control-label i {
      color: #3b82f6;
      font-size: 14px;
    }
    
    .control-label label {
      font-size: 13px;
      font-weight: 500;
    }
    
    .control-description {
      font-size: 11px;
      color: #6B7280;
      margin: 2px 0 6px 22px;
      line-height: 1.3;
    }
    
    /* Toggle switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #CBD5E1;
      border-radius: 34px;
      transition: .3s;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: .3s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    input:checked + .toggle-slider {
      background-color: #3b82f6;
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }
    
    /* Loading indicator */
    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;
      gap: 8px;
      color: #6B7280;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #E5E7EB;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .satellite-control-panel {
        width: 290px;
        top: auto;
        bottom: 170px;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Creates a tab-based panel layout to eliminate scrolling
 */
function createMapLayersPanel() {
  // Remove previous panel if it exists
  const existingPanel = document.getElementById("map-layers-panel");
  if (existingPanel) {
    existingPanel.parentNode.removeChild(existingPanel);
  }

  // Create new panel with improved design
  const panel = document.createElement("div");
  panel.id = "map-layers-panel";
  panel.className = "satellite-control-panel";
  panel.style.display = "none"; // Initially hidden

  // Enhanced header with icon
  const header = document.createElement("div");
  header.className = "panel-header";
  header.innerHTML = `
    <div class="header-content">
      <i class="fas fa-layer-group"></i>
      <h3>Camadas do Mapa</h3>
    </div>
    <button class="close-button" aria-label="Fechar painel">
      <i class="fas fa-times"></i>
    </button>
  `;

  header
    .querySelector(".close-button")
    .addEventListener("click", toggleMapLayersPanel);
  panel.appendChild(header);

  // Main content area with tabs
  const mainContent = document.createElement("div");
  mainContent.className = "options-container";

  // Create tabs
  const tabs = document.createElement("div");
  tabs.className = "option-tabs";
  tabs.innerHTML = `
    <div class="option-tab active" data-tab="sources">Visualização</div>
  `;

  // Add tab click handlers
  tabs.querySelectorAll(".option-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and content
      tabs
        .querySelectorAll(".option-tab")
        .forEach((t) => t.classList.remove("active"));
      mainContent
        .querySelectorAll(".option-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const tabName = tab.dataset.tab;
      mainContent
        .querySelector(`.option-content[data-content="${tabName}"]`)
        .classList.add("active");
    });
  });

  mainContent.appendChild(tabs);

  // Create tab content containers
  const sourcesContent = document.createElement("div");
  sourcesContent.className = "option-content active";
  sourcesContent.dataset.content = "sources";

  // Create sources section
  sourcesContent.innerHTML = `
    <div class="control-section no-border">
      <div class="source-cards">
        <!-- Sources will be added here -->
      </div>
    </div>
  `;

  // Add sources to the sources tab
  const sourceCards = sourcesContent.querySelector(".source-cards");

  // Array of available sources
  const sources = [
    {
      id: "streets",
      label: "Mapa Padrão",
      description: "Mapa de ruas detalhado",
      icon: "fas fa-road",
      color: "#3498db",
    },
  ];

  // Create cards for each source
  sources.forEach((source) => {
    const card = document.createElement("div");
    card.className = `source-card ${
      source.id === currentSatelliteSource ? "active" : ""
    }`;
    card.dataset.source = source.id;

    card.innerHTML = `
      <div class="card-icon" style="background-color: ${source.color}">
        <i class="${source.icon}"></i>
      </div>
      <div class="card-content">
        <div class="card-title">${source.label}</div>
        <div class="card-description">${source.description}</div>
      </div>
      <div class="card-check">
        <i class="fas fa-check-circle"></i>
      </div>
    `;

    card.addEventListener("click", () => changeMapSource(source.id));
    sourceCards.appendChild(card);
  });

  // Add tab contents to main content
  mainContent.appendChild(sourcesContent);

  // Create 3D options content container so later references won't fail
  const options3DContent = document.createElement("div");
  options3DContent.className = "option-content";
  options3DContent.dataset.content = "3d";
  options3DContent.innerHTML = `
    <div class="control-section">
      <div class="control-row">
        <label>Altura dos edifícios: <span class="slider-value">1.0</span></label>
        <input type="range" id="building-height" min="0" max="3" step="0.1" value="1">
      </div>
      <div class="control-row">
        <label>Exagero de terreno: <span class="slider-value">1.0</span></label>
        <input type="range" id="terrain-exaggeration" min="0" max="3" step="0.1" value="1">
      </div>
      <div class="control-row">
        <label for="shadows-toggle">Sombras 3D</label>
        <input type="checkbox" id="shadows-toggle">
      </div>
    </div>
  `;

  panel.appendChild(mainContent);

  // Add to DOM
  document.body.appendChild(panel);

  // Add updated styles
  updateSatelliteControlStyles();

  // Add events for the 3D control sliders
  options3DContent.querySelectorAll('input[type="range"]').forEach((slider) => {
    slider.addEventListener("input", (e) => {
      if (!is3DEnabled) return;

      // Update display value
      const valueDisplay =
        e.target.parentElement.parentElement.querySelector(".slider-value");
      if (valueDisplay) {
        valueDisplay.textContent = parseFloat(e.target.value).toFixed(1);
      }

      const mapbox3D = getMapbox3DInstance();
      if (!mapbox3D) return;

      if (e.target.id === "building-height") {
        // Adjust building height
        adjustBuildingHeight(parseFloat(e.target.value));
      } else if (e.target.id === "terrain-exaggeration") {
        // Adjust terrain exaggeration
        adjustTerrainExaggeration(parseFloat(e.target.value));
      }
    });
  });

  // Add event for shadows toggle
  const shadowsToggle = options3DContent.querySelector("#shadows-toggle");
  if (shadowsToggle) {
    shadowsToggle.addEventListener("change", (e) => {
      const mapbox3D = getMapbox3DInstance();
      if (mapbox3D) {
        toggleMapShadows(e.target.checked);
      }
    });
  }

  // Nota: opções de satélite removidas do painel. A infraestrutura permanece disponível.
}

/**
 * Loads satellite enhancement controls dynamically
 * @param {HTMLElement} container - The container element for controls
 */
function loadSatelliteControls(container) {
  import("./map-3d/satelite-controls/satellite-imagery-enhancer.js")
    .then((module) => {
      if (typeof module.getSatelliteEnhancementControls === "function") {
        // Remove loading indicator
        const loading = container.querySelector(".loading-indicator");
        if (loading) loading.remove();

        // Get controls adapted to capabilities
        const satelliteControls = module.getSatelliteEnhancementControls();

        // Create control elements
        const controlsContainer = document.createElement("div");
        controlsContainer.className = "satellite-enhancement-controls";

        // Process each control - only show essential controls to save space
        const essentialControls = satelliteControls.filter(
          (control) => control.isEssential !== false
        );

        essentialControls.forEach((control) => {
          const controlItem = document.createElement("div");
          controlItem.className = "enhancement-control-item";

          if (control.type === "toggle") {
            // Create toggle switch
            controlItem.innerHTML = `
              <div class="control-header">
                <div class="control-label">
                  <i class="fas ${control.icon || "fa-sliders-h"}"></i>
                  <label for="${control.id}">${control.label}</label>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="${control.id}" ${
              control.defaultValue ? "checked" : ""
            }>
                  <span class="toggle-slider"></span>
                </div>
              </div>
            `;

            // Add event
            const toggle = controlItem.querySelector(`#${control.id}`);
            toggle.addEventListener("change", (e) => {
              if (typeof control.onChange === "function") {
                control.onChange(e.target.checked);
              }
            });
          } else if (control.type === "slider") {
            // Create slider
            controlItem.innerHTML = `
              <div class="control-header">
                <div class="control-label">
                  <i class="fas ${control.icon || "fa-sliders-h"}"></i>
                  <label for="${control.id}">${control.label}</label>
                </div>
                <span class="slider-value">${control.defaultValue}</span>
              </div>
              <div class="slider-container">
                <input type="range" id="${control.id}" 
                  min="${control.min}" max="${control.max}" 
                  step="${control.step}" value="${control.defaultValue}">
              </div>
            `;

            // Add event
            const slider = controlItem.querySelector(`#${control.id}`);
            slider.addEventListener("input", (e) => {
              // Update displayed value
              controlItem.querySelector(".slider-value").textContent =
                parseFloat(e.target.value).toFixed(1);

              if (typeof control.onChange === "function") {
                control.onChange(e.target.value);
              }
            });
          }

          controlsContainer.appendChild(controlItem);
        });

        // Add controls to container
        container.appendChild(controlsContainer);
      }
    })
    .catch((error) => {
      console.warn(
        "[map-unified-controls] Error loading satellite controls:",
        error
      );

      // Add fallback message
      const loading = container.querySelector(".loading-indicator");
      if (loading) {
        loading.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <span>Opções avançadas não disponíveis</span>
        `;
      }
    });
}

/**
 * Alterna a exibição do painel de camadas do mapa
 */
function toggleMapLayersPanel() {
  const panel = document.getElementById("map-layers-panel");
  if (!panel) {
    createMapLayersPanel();
    setTimeout(toggleMapLayersPanel, 10);
    return;
  }

  const isVisible = panel.style.display === "block";
  panel.style.display = isVisible ? "none" : "block";

  // Atualizar estado do botão
  const button = document.getElementById("toggle-map-layers");
  if (button) {
    button.classList.toggle("active", !isVisible);
  }

  // Atualizar seção de opções 3D com base no estado atual
  const options3DSection = panel.querySelector(".options-3d");
  if (options3DSection) {
    options3DSection.style.display = is3DEnabled ? "block" : "none";
  }

  // Atualizar botões ativos
  const sourceButtons = panel.querySelectorAll(".source-button");
  sourceButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.source === currentSatelliteSource
    );
  });
}

/**
 * Alterna o modo 3D e exibe/oculta os botões de controle 3D
 * NOTA: Este botão foi removido da interface unificada.
 * A navegação 3D é agora ativada automaticamente ao iniciar navegação.
 * Esta função é mantida como legacy code e não deve ser chamada.
 */
function toggle3DMode() {
  console.warn(
    "[map-unified-controls] toggle3DMode() foi chamada mas o botão toggle-3d-mode foi removido da interface."
  );
  const button = document.getElementById("toggle-3d-mode");
  const buttons3dContainer = document.getElementById("mode-3d-buttons");

  // Se o botão não existe, não fazer nada (foi removido intencionalmente)
  if (!button) {
    console.warn(
      "[map-unified-controls] Botão toggle-3d-mode não encontrado. Navegação 3D é ativada automaticamente."
    );
    return;
  }

  // Verifica se os botões 3D estão atualmente visíveis
  const areControlsVisible =
    buttons3dContainer && !buttons3dContainer.classList.contains("hidden");

  if (!is3DEnabled) {
    // Ativar modo 3D
    toggleMode3D();
    button.classList.add("active");

    // Mostrar botões de controle 3D
    if (buttons3dContainer) {
      buttons3dContainer.classList.remove("hidden");
      is3DControlsVisible = true;
    }
  } else {
    if (areControlsVisible) {
      // Se os controles estão visíveis, apenas ocultá-los mantendo o modo 3D ativo
      if (buttons3dContainer) {
        buttons3dContainer.classList.add("hidden");
        is3DControlsVisible = false;
      }
    } else {
      // Se os controles já estão ocultos e clicou novamente, desativar o modo 3D
      toggleMode3D();
      button.classList.remove("active");

      // Garantir que os botões de controle 3D estejam ocultos
      if (buttons3dContainer) {
        buttons3dContainer.classList.add("hidden");
        is3DControlsVisible = false;
      }
    }
  }
}

/**
 * Altera a fonte do mapa
 * @param {string} source - ID da fonte (streets, google, nasa)
 */
async function changeMapSource(source) {
  try {
    // Esconder o painel após selecionar
    toggleMapLayersPanel();

    // Mostrar indicador de carregamento
    const loadingIndicator = showLoadingIndicator(
      `Carregando visualização ${source}...`
    );

    // Atualizar estado
    currentSatelliteSource = source;
    isSatelliteActive = source !== "streets";

    // Atualizar botão de camadas
    const layersButton = document.getElementById("toggle-map-layers");
    if (layersButton) {
      layersButton.classList.toggle("active", isSatelliteActive);
    }

    // Aplicar a fonte selecionada com tratamento de erro e timeout
    try {
      await Promise.race([
        applyMapSource(source),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout ao carregar fonte")),
            10000
          )
        ),
      ]);

      console.log(
        `[map-unified-controls] Fonte do mapa alterada para: ${source}`
      );
    } catch (error) {
      console.error("[map-unified-controls] Erro ao carregar fonte:", error);
      // Mostrar notificação de erro
      showNotification(
        "Erro ao carregar visualização. Tente novamente.",
        "error"
      );
    } finally {
      // Esconder indicador de carregamento
      hideLoadingIndicator(loadingIndicator);
    }
  } catch (error) {
    console.error(
      "[map-unified-controls] Erro ao alterar fonte do mapa:",
      error
    );
  }
}

/**
 * Aplica a fonte do mapa selecionada
 * @param {string} source - ID da fonte
 * @returns {Promise<void>}
 */
function applyMapSource(source) {
  return new Promise((resolve, reject) => {
    try {
      if (is3DEnabled) {
        // Modo 3D - usar API do Mapbox
        if (source === "nasa") {
          // Para NASA, usar função específica
          import("./map-3d/satelite-controls/satellite-imagery-enhancer.js")
            .then((module) => {
              if (typeof module.initNasaGibsMap === "function") {
                module.initNasaGibsMap().then(resolve).catch(reject);
              } else {
                setSatelliteSource(source).then(resolve).catch(reject);
              }
            })
            .catch(reject);
        } else {
          setSatelliteSource(source).then(resolve).catch(reject);
        }
      } else {
        // Modo 2D - usar Leaflet
        const leafletMap = getMapInstance() || window.map;
        if (!leafletMap) {
          return reject(new Error("Mapa Leaflet não encontrado"));
        }

        // Remover camadas existentes
        leafletMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            leafletMap.removeLayer(layer);
          }
        });

        // Adicionar camada apropriada
        if (source === "streets") {
          // Mapa padrão OpenStreetMap
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(leafletMap);
        } else if (source === "google") {
          // Satélite Google (ESRI)
          L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { attribution: "&copy; ESRI" }
          ).addTo(leafletMap);
        } else if (source === "nasa") {
          // Para NASA em 2D, podemos usar o GIBS NASA
          L.tileLayer(
            "https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/250m/{z}/{y}/{x}.jpg",
            {
              attribution:
                "&copy; NASA Earth Observing System Data and Information System",
              subdomains: ["a", "b", "c"],
              time: getTodayDateString(),
              maxZoom: 8,
            }
          ).addTo(leafletMap);
        }

        // Resolver a Promise após um pequeno delay para garantir que os ladrilhos comecem a carregar
        setTimeout(resolve, 300);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Mostra indicador de carregamento
 * @param {string} message - Mensagem a exibir
 * @returns {HTMLElement} - Elemento do indicador
 */
function showLoadingIndicator(message) {
  const indicator = document.createElement("div");
  indicator.className = "map-loading-indicator";
  indicator.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">${message}</div>
  `;

  // Aplicar estilos
  Object.assign(indicator.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "15px 20px",
    borderRadius: "8px",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });

  // Adicionar ao DOM
  document.body.appendChild(indicator);
  return indicator;
}

/**
 * Esconde indicador de carregamento
 * @param {HTMLElement} indicator - Elemento do indicador
 */
function hideLoadingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    // Fade out
    indicator.style.opacity = "0";
    indicator.style.transition = "opacity 0.3s";

    // Remover após transição
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }
}

/**
 * Mostra uma notificação na interface
 * @param {string} message - Mensagem
 * @param {string} type - Tipo de notificação (success, error, warning)
 */
function showNotification(message, type = "info") {
  // Verificar se já existe uma função global
  if (typeof window.showNotification === "function") {
    window.showNotification(message, type);
    return;
  }

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `map-notification ${type}`;
  notification.textContent = message;

  // Aplicar estilos
  Object.assign(notification.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background:
      type === "error"
        ? "#f44336"
        : type === "success"
        ? "#4caf50"
        : type === "warning"
        ? "#ff9800"
        : "#2196f3",
    color: "white",
    padding: "10px 20px",
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.3s",
  });

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  // Remover após alguns segundos
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Obtém a data atual no formato YYYY-MM-DD para uso com APIs da NASA
 * @returns {string} - Data formatada
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Alterna entre o modo 2D e 3D
 * NOTA: Este função é legacy code. O botão toggle-3d-mode foi removido da interface.
 * A navegação 3D é agora ativada automaticamente ao iniciar navegação.
 */
async function toggleMode3D() {
  const button = document.getElementById("toggle-3d-mode");

  // Se o botão não existe, não fazer nada
  if (!button) {
    console.warn(
      "[map-unified-controls] toggleMode3D() chamada mas botão toggle-3d-mode foi removido."
    );
    return;
  }

  if (is3DEnabled) {
    // Desativar modo 3D
    try {
      await disable3DMode();
      is3DEnabled = false;
      button.classList.remove("active");
      console.log("[map-unified-controls] Modo 3D desativado");

      // Restaurar marcadores e rotas no mapa 2D
      restoreMarkersAndRoutes();

      // Importante: Sincronizar referências de mapa após desativar 3D
      const leafletMap = getMapInstance() || window.map;
      if (leafletMap) {
        window.map = leafletMap;
        import("./map-mode-adapter.js")
          .then((module) => {
            if (typeof module.syncMapReferences === "function") {
              module.syncMapReferences(leafletMap);
            }
          })
          .catch((err) =>
            console.error("[toggleMode3D] Erro ao importar adaptador:", err)
          );
      }

      // Ocultar botões de controle 3D
      const mode3DButtons = document.getElementById("mode-3d-buttons");
      if (mode3DButtons) {
        mode3DButtons.classList.add("hidden");
        is3DControlsVisible = false;
      }
    } catch (error) {
      console.error("[map-unified-controls] Erro ao desativar modo 3D:", error);
    }
  } else {
    // Ativar modo 3D
    try {
      // Obter estado atual do mapa (marcadores, rotas, etc)
      const mapState = captureCurrentMapState();

      // Ativar modo 3D
      await enable3DMode();
      is3DEnabled = true;
      button.classList.add("active");
      console.log("[map-unified-controls] Modo 3D ativado");

      // Transferir marcadores e rotas para o mapa 3D
      transferMarkersAndRoutesTo3D(mapState);

      // Importante: Sincronizar referências de mapa após ativar 3D
      const mapbox3D = getMapbox3DInstance();
      if (mapbox3D) {
        import("./map-mode-adapter.js")
          .then((module) => {
            if (typeof module.syncMapReferences === "function") {
              module.syncMapReferences(mapbox3D);
            }
          })
          .catch((err) =>
            console.error("[toggleMode3D] Erro ao importar adaptador:", err)
          );
      }
    } catch (error) {
      console.error("[map-unified-controls] Erro ao ativar modo 3D:", error);
    }
  }
}

/**
 * Captura o estado atual do mapa 2D (marcadores, rotas, etc)
 * @returns {Object} Estado do mapa
 */
function captureCurrentMapState() {
  const leafletMap = getMapInstance() || window.map;
  if (!leafletMap) return {};

  // Capturar centro e zoom
  const center = leafletMap.getCenter();
  const zoom = leafletMap.getZoom();

  // Capturar marcadores
  const currentMarkers = [];
  leafletMap.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      const position = layer.getLatLng();
      const popup = layer._popup ? layer._popup.getContent() : null;
      const options = layer.options || {};

      currentMarkers.push({
        lat: position.lat,
        lng: position.lng,
        popup: popup,
        options: options,
      });
    }
  });

  // Capturar rotas
  const currentRoutes = [];
  leafletMap.eachLayer((layer) => {
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      const latlngs = layer.getLatLngs();
      const options = layer.options || {};

      // Converter para formato simples
      const routePoints = latlngs.map((latlng) => ({
        lat: latlng.lat,
        lng: latlng.lng,
      }));

      currentRoutes.push({
        points: routePoints,
        options: options,
      });
    }
  });

  return {
    center: { lat: center.lat, lng: center.lng },
    zoom: zoom,
    markers: currentMarkers,
    routes: currentRoutes,
  };
}

/**
 * Transfere marcadores e rotas do mapa 2D para o mapa 3D
 * @param {Object} mapState - Estado do mapa 2D
 */
function transferMarkersAndRoutesTo3D(mapState) {
  if (!is3DModeActive() || !mapState) return;

  const mapbox3D = getMapbox3DInstance();
  if (!mapbox3D) return;

  try {
    // Limpar marcadores existentes no mapa 3D
    clearMarkers3D();

    // Adicionar marcadores ao mapa 3D
    mapState.markers.forEach((marker) => {
      addMarker3D(marker.lat, marker.lng, {
        popupContent: marker.popup,
        className: marker.options.className,
        title: marker.options.title,
      });
    });

    // Adicionar rotas ao mapa 3D
    mapState.routes.forEach((route) => {
      // Converter para formato esperado pelo mapa 3D
      const coordinates = route.points.map((point) => [point.lng, point.lat]);

      updateRouteIn3D(coordinates, {
        routeColor: route.options.color || "#3b82f6",
        routeWidth: route.options.weight || 5,
        routeOpacity: route.options.opacity || 0.8,
      });
    });

    console.log(
      "[map-unified-controls] Marcadores e rotas transferidos para o mapa 3D"
    );
  } catch (error) {
    console.error(
      "[map-unified-controls] Erro ao transferir marcadores e rotas para 3D:",
      error
    );
  }
}

/**
 * Restaura marcadores e rotas do mapa 3D para o mapa 2D
 */
function restoreMarkersAndRoutes() {
  console.log(
    "[map-unified-controls] Restaurando marcadores e rotas para o mapa 2D"
  );

  // Garantir que temos uma instância válida do mapa
  const leafletMap = getMapInstance() || window.map;
  if (!leafletMap) {
    console.error(
      "[map-unified-controls] Não foi possível obter instância do mapa para restauração"
    );
    return;
  }

  // Importante: Atualizar a referência global para o mapa
  window.map = leafletMap;

  // Carregar módulos necessários para trabalhar com o mapa 2D
  Promise.all([import("./map-markers.js"), import("./map-init.js")])
    .then(([markersModule, initModule]) => {
      // Verificar se temos funções necessárias
      if (
        typeof markersModule.clearMarkers === "function" &&
        typeof markersModule.showAllLocationsOnMap === "function"
      ) {
        try {
          // Limpar marcadores existentes no mapa 2D
          markersModule.clearMarkers();

          // Recuperar dados de localização (isso depende da estrutura do seu aplicativo)
          import("../locations/locations.js")
            .then((locationsModule) => {
              if (locationsModule.getAllLocations) {
                const locations = locationsModule.getAllLocations();

                // Adicionar pequeno atraso para garantir que o mapa 2D esteja pronto
                setTimeout(() => {
                  try {
                    markersModule.showAllLocationsOnMap(locations);
                    console.log(
                      "[map-unified-controls] Marcadores restaurados com sucesso no mapa 2D"
                    );
                  } catch (error) {
                    console.error(
                      "[map-unified-controls] Erro ao mostrar localizações:",
                      error
                    );
                  }
                }, 100);
              }
            })
            .catch((err) => {
              console.warn(
                "[map-unified-controls] Não foi possível carregar localizações:",
                err
              );
            });
        } catch (error) {
          console.error(
            "[map-unified-controls] Erro ao limpar marcadores:",
            error
          );
        }
      }
    })
    .catch((err) => {
      console.error(
        "[map-unified-controls] Erro ao importar módulos para restauração:",
        err
      );
    });
}

/**
 * Alterna a visualização de satélite (função mantida para compatibilidade)
 */
function toggleSatelliteView() {
  const button = document.getElementById("toggle-satellite");

  if (isSatelliteActive) {
    // Desativar visualização de satélite
    changeMapSource("streets");
  } else {
    // Ativar visualização de satélite
    // Abrir o painel de camadas
    toggleMapLayersPanel();
  }
}

/**
 * Localiza o usuário no mapa
 */
function locateUser() {
  const buttonLocation = document.getElementById("locate-user");
  buttonLocation.classList.add("active");

  // Exibir indicador de carregamento
  buttonLocation.innerHTML = `
    <div class="location-spinner"></div>
  `;

  if (is3DEnabled) {
    // Modo 3D - usar API do browser e mover o mapa 3D
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Adicionar marcador e mover o mapa
        flyToLocation(latitude, longitude, {
          zoom: 16,
          pitch: 60,
          bearing: 0,
          duration: 2000,
        });

        // Adicionar marcador se necessário
        addMarker3D(latitude, longitude, {
          title: "Sua localização",
          popupContent: "<h3>Sua localização</h3>",
          className: "user-location-marker",
          isUserMarker: true,
        });

        // Restaurar botão
        restoreLocationButton(buttonLocation);
      },
      (error) => {
        console.error(
          "[map-unified-controls] Erro ao obter localização:",
          error
        );
        restoreLocationButton(buttonLocation);
        showLocationError();
      }
    );
  } else {
    // Modo 2D - usar API do Leaflet para localização
    const leafletMap = getMapInstance() || window.map;
    if (leafletMap) {
      import("./map-controls.js")
        .then((module) => {
          if (typeof module.setupGeolocation === "function") {
            module.setupGeolocation(leafletMap);
            setTimeout(() => restoreLocationButton(buttonLocation), 2000);
          } else if (typeof module.requestAndTrackUserLocation === "function") {
            module.requestAndTrackUserLocation(
              () => restoreLocationButton(buttonLocation),
              () => {
                restoreLocationButton(buttonLocation);
                showLocationError();
              }
            );
          } else {
            // Fallback usando API do navegador
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;

                // Mover mapa e adicionar marcador
                leafletMap.setView([latitude, longitude], 16);

                // Adicionar marcador
                L.marker([latitude, longitude], {
                  title: "Sua localização",
                  icon: L.divIcon({
                    html: `<i class="fas fa-dot-circle" style="color: #3b82f6; font-size: 24px;"></i>`,
                    className: "user-location-marker",
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  }),
                })
                  .addTo(leafletMap)
                  .bindPopup("<h3>Sua localização</h3>")
                  .openPopup();

                restoreLocationButton(buttonLocation);
              },
              (error) => {
                console.error(
                  "[map-unified-controls] Erro ao obter localização:",
                  error
                );
                restoreLocationButton(buttonLocation);
                showLocationError();
              }
            );
          }
        })
        .catch((err) => {
          console.error(
            "[map-unified-controls] Erro ao importar módulo de controles:",
            err
          );
          restoreLocationButton(buttonLocation);
        });
    }
  }
}

/**
 * Restaura o botão de localização ao estado original
 * @param {HTMLElement} button - Botão de localização
 */
function restoreLocationButton(button) {
  setTimeout(() => {
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span class="control-tooltip">Minha Localização</span>
    `;
    button.classList.remove("active");
  }, 1000);
}

/**
 * Mostra erro ao obter localização
 */
function showLocationError() {
  alert(
    "Não foi possível obter sua localização. Verifique se você permitiu o acesso à localização no navegador."
  );
}

/**
 * Reseta a visualização do mapa para o estado inicial
 */
function resetMapView() {
  if (is3DEnabled) {
    // Resetar mapa 3D
    const mapbox3D = getMapbox3DInstance();
    if (mapbox3D) {
      mapbox3D.flyTo({
        center: [-38.9159969, -13.3775457],
        zoom: 15,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      });
    }
  } else {
    // Resetar mapa 2D
    const leafletMap = getMapInstance() || window.map;
    if (leafletMap) {
      leafletMap.setView([-13.3775457, -38.9159969], 15, { animate: true });
    }
  }

  console.log("[map-unified-controls] Visualização do mapa resetada");
}

// Exportar funções públicas
export { toggleMode3D, toggleSatelliteView, locateUser, resetMapView };
