# 🔍 Debug Checklist - Modo 3D em Navegação

**Data:** December 12, 2025  
**Problema:** Mapa 3D não ativa + rotação não funciona durante navegação

---

## 📋 Issues Identificados

### Issue 1: enable3DMode retorna Promise, mas não há await adequado

**Localização:** `js/navigation/navigationController/navigationController.js` (linhas ~493)
**Problema:**

```javascript
if (typeof enable3DMode === "function") {
  await enable3DMode({ mapInstance: map }); // ← Precisa de await
}
```

**Status:** ✅ Await está presente, OK

---

### Issue 2: map-rotation-monitor não está ativando modo 3D

**Localização:** `js/map/map-rotation-monitor.js`
**Problema:** Apenas rotaciona elementos 2D com CSS transforms, não ativa mapa 3D Mapbox GL
**Solução Necessária:** Integrar chamada para enable3DMode quando rotação for necessária

---

### Issue 3: Posição do container 3D pode estar errada

**Localização:** `js/map/map-3d.js` (linhas ~75-80)
**Problema:** Container está com z-index: 399, pode estar abaixo de outros elementos
**Verificação:** Conferir CSS de sobreposição

---

### Issue 4: mapbox3dInstance pode não estar criado com sucesso

**Localização:** `js/map/map-3d.js` função initMapbox3D
**Problema:** initMapbox3D pode retornar null se houver erro
**Solução:** Adicionar tratamento melhorado de erros

---

### Issue 5: startRotationMonitor não faz rotação real do mapa 3D

**Localização:** `js/map/map-rotation-monitor.js`
**Problema:** Apenas adiciona classe CSS, não chama métodos reais de rotação
**Solução:** Chamar setBearing no mapa Mapbox GL ao invés de transformar 2D

---

## ✅ Checklist de Ações

- [ ] **1.1** Verificar se enable3DMode está sendo chamada sem erros
- [ ] **1.2** Verificar se mapbox3dInstance foi criado com sucesso
- [ ] **1.3** Verificar z-index e visibilidade do container 3D
- [ ] **2.1** Modificar startRotationMonitor para chamar enable3DMode se necessário
- [ ] **2.2** Adicionar lógica para chamar setBearing no mapa 3D
- [ ] **2.3** Adicionar setPitch para melhorar perspectiva first-person
- [ ] **3.1** Adicionar console.log para debug de cada etapa
- [ ] **3.2** Testar chamadas sequenciais de enable3DMode
- [ ] **4.1** Criar teste de navegação com 3D
- [ ] **4.2** Verificar console para erros/warnings
- [ ] **5.1** Validar funcionamento em diferentes navegadores

---

## 🔧 Ações a Executar

### Fase 1: Diagnóstico

1. ✅ Identificar exatamente onde 3D não está sendo ativado
2. ✅ Verificar logs do console durante navegação
3. ✅ Confirmar que enable3DMode está sendo chamada

### Fase 2: Correção de map-rotation-monitor.js

1. Importar enable3DMode
2. Importar disable3DMode
3. Chamar enable3DMode quando rotação começar
4. Usar setBearing e setPitch ao invés de CSS transforms
5. Chamar disable3DMode quando navegação terminar

### Fase 3: Integração com navigationController

1. Garantir que startRotationMonitor chame os métodos certos
2. Passar informações de heading para setMapRotation
3. Coordenar enable3DMode + startRotationMonitor

### Fase 4: Testes

1. Iniciar navegação
2. Verificar ativação de 3D
3. Verificar rotação em tempo real
4. Verificar desativação ao cancelar

---

**Status Geral:** 🔴 **PROBLEMA CONFIRMADO - PRECISA CORREÇÃO**
