# 🎯 Plano de Ação - Ativar Modo 3D e Rotação em Navegação

**Data:** December 12, 2025  
**Objetivo:** Fazer mapa 3D ativar e rotacionar durante navegação para experiência first-person

---

## 🔴 Problemas Identificados

### Problema Principal 1: setMapRotation só funciona em mapa 2D

- **Causa:** setMapRotation rotaciona elementos Leaflet com CSS transforms
- **Impacto:** Não afeta mapa 3D Mapbox GL
- **Solução:** Precisa chamar setBearing/setPitch no mapa Mapbox GL

### Problema Principal 2: map-rotation-monitor não coordena com Mapbox 3D

- **Causa:** startRotationMonitor apenas manipula CSS de mapa 2D
- **Impacto:** Mesmo que 3D ative, não rotaciona em tempo real
- **Solução:** Integrar chamadas para mapbox3dInstance.setBearing()

### Problema Principal 3: Falta de sincronização entre enable3DMode e navegação

- **Causa:** enable3DMode é chamado mas sem verificação de sucesso
- **Impacto:** Pode falhar silenciosamente
- **Solução:** Adicionar callbacks e verificação de sucesso

---

## ✅ Checklist Completo de Ações

### **FASE 1: Diagnosticar Problemas (2 itens)**

- [ ] **1.1** Adicionar logs de debug detalhados em navigationController

  - Local: `js/navigation/navigationController/navigationController.js` função `startNavigation`
  - Ação: Adicionar console.log antes e depois de enable3DMode
  - Verificar: Se function existe, se resolve corretamente

- [ ] **1.2** Verificar se Mapbox GL JS está carregado
  - Local: index.html e js/map/map-3d.js
  - Ação: Confirmar que script Mapbox está sendo carregado
  - Verificar: window.mapboxgl está definido

---

### **FASE 2: Corrigir map-rotation-monitor.js (5 itens)**

- [ ] **2.1** Adicionar imports necessários

  - Adicionar: `enable3DMode`, `disable3DMode` de map-3d.js
  - Adicionar: `getMapbox3DInstance` para acessar mapa 3D

- [ ] **2.2** Modificar `startRotationMonitor()` para ativar 3D

  - Quando navegação ativa: chamar `enable3DMode()`
  - Adicionar flag para rastrear se 3D já foi ativado

- [ ] **2.3** Adicionar função para rotacionar mapa 3D

  - Nova função: `applyRotationTo3D(heading)`
  - Chamar: `mapbox3dInstance.setBearing(heading)`
  - Chamar: `mapbox3dInstance.setPitch(70)` para perspectiva

- [ ] **2.4** Integrar rotação real no loop de monitoramento

  - Modificar: setInterval para chamar applyRotationTo3D
  - Usar: window.userLocation.heading para ângulo

- [ ] **2.5** Adicionar lógica de cleanup
  - Modificar: `stopRotationMonitor()` para chamar `disable3DMode()`
  - Resetar: Pitch e bearing para padrão

---

### **FASE 3: Melhorar navigationController.js (3 itens)**

- [ ] **3.1** Adicionar melhor tratamento de promise em enable3DMode

  - Adicionar: .catch() para capturar erros
  - Log: Erro detalhado se 3D falhar

- [ ] **3.2** Coordenar enable3DMode com startRotationMonitor

  - Certificar: Que enable3DMode completa antes de startRotationMonitor
  - Adicionar: Pequeno delay se necessário

- [ ] **3.3** Adicionar lógica de fallback para 3D
  - Se 3D falhar: Log e continua em 2D
  - Não bloqueia: Navegação continua mesmo sem 3D

---

### **FASE 4: Adicionar Suporte para setBearing/setPitch (2 itens)**

- [ ] **4.1** Criar função setMapbox3DRotation em map-3d.js

  - Parâmetros: heading, pitch
  - Validação: Conferir se mapbox3dInstance existe
  - Chamadas: `setBearing()` e `setPitch()`

- [ ] **4.2** Exportar função para uso em map-rotation-monitor
  - Export: setMapbox3DRotation
  - Import: Em map-rotation-monitor.js

---

### **FASE 5: Sincronizar com User Location (2 itens)**

- [ ] **5.1** Capturar heading em tempo real

  - Usar: window.userLocation.heading
  - Atualizar: A cada nova posição
  - Chamar: setMapbox3DRotation com novo heading

- [ ] **5.2** Garantir atualização em tempo real
  - Hook: Em updateUserMarker ou similar
  - Frequência: Máximo a cada 100-200ms

---

### **FASE 6: Testar e Validar (3 itens)**

- [ ] **6.1** Teste manual de ativação 3D

  - Iniciar navegação
  - Verificar: Console logs
  - Verificar: Mapa muda para 3D (inclinado)

- [ ] **6.2** Teste manual de rotação

  - Durante navegação
  - Virar: Dispositivo ou simular movimento
  - Verificar: Mapa rotaciona com heading

- [ ] **6.3** Teste de cancelamento
  - Clicar: "Encerrar navegação"
  - Verificar: Mapa volta ao normal 2D
  - Verificar: Sem erros no console

---

## 📊 Dependências Entre Tarefas

```
1.1 → 1.2 (diagnosticar primeiro)
        ↓
2.1 → 2.2 → 2.3 → 2.4 → 2.5 (sequencial)
        ↓
3.1 → 3.2 → 3.3 (sequencial)
        ↓
4.1 → 4.2 (4.2 depende de 4.1)
        ↓
5.1 → 5.2 (sequencial)
        ↓
6.1 → 6.2 → 6.3 (testes na ordem)
```

---

## 📝 Notas Importantes

1. **enable3DMode retorna Promise** - Deve usar await ou .then()
2. **mapbox3dInstance é global** - Acessível em window.mapbox3dInstance
3. **setMapRotation é para Leaflet 2D** - Não funciona com Mapbox 3D
4. **Pitch ideal para first-person** - Recomendado 60-80 graus
5. **Bearing é em graus** - 0 = norte, 90 = leste, etc

---

**Total de Tarefas:** 18 itens  
**Tempo Estimado:** 2-3 horas  
**Complexidade:** Média

---

**Próximo Passo:** Iniciar FASE 1 - Diagnosticar Problemas
