# Browser Testing Guide

## Quick Setup

1. **Server is already running** at `http://localhost:3000`
2. **Open the app** in your browser
3. **Open DevTools Console** to check for JavaScript errors

---

## Test Scenarios

### Scenario 1: Verify UI Changes (No Navigation)

**What to check:**

- [ ] Open the map
- [ ] Click on the map to open the map layers/options panel
- [ ] Verify NO "3D" toggle button is visible anywhere on the map controls
- [ ] Verify the panel shows ONLY "Visualização" tab (no "Opções 3D" or "Satélite" tabs)
- [ ] If you can access satellite view, verify there's NO satellite option in the dropdown

**Expected Result:**

- 3D button completely hidden ✓
- Only street map view option available ✓

---

### Scenario 2: Initiate Navigation

**What to do:**

1. Click on a location marker or search for a destination
2. Click "Iniciar Navegação" or similar button to start navigation
3. Allow geolocation permission

**What to check:**

- [ ] The instruction banner appears
- [ ] The map automatically enters 3D mode (you'll see a tilted, isometric view)
- [ ] The map starts rotating based on your heading (first-person perspective)
- [ ] A **RED button labeled "Encerrar navegação"** appears at the bottom-right corner
- [ ] **NO errors appear in the browser console**

**Expected Result:**

- Map automatically switches to 3D ✓
- First-person perspective enabled ✓
- "Encerrar navegação" button visible and accessible ✓

---

### Scenario 3: Test End Navigation Button

**What to do:**

1. While navigation is active, click the red "Encerrar navegação" button
2. Confirm the cancellation if prompted

**What to check:**

- [ ] A confirmation dialog appears (optional, depends on `confirmCancelNavigation` function)
- [ ] Navigation stops
- [ ] The instruction banner disappears
- [ ] The map returns to normal 2D view
- [ ] The red button disappears
- [ ] The map is still centered on your current location

**Expected Result:**

- Navigation cleanly cancelled ✓
- 3D mode disabled ✓
- Button removed from DOM ✓

---

### Scenario 4: Test Button Responsiveness

**What to do:**

1. Start navigation again
2. Hover over the "Encerrar navegação" button

**What to check:**

- [ ] The button color changes on hover (darker red)
- [ ] The button has a subtle shadow that becomes more prominent on hover
- [ ] The button is clearly clickable and responsive

**Expected Result:**

- Visual feedback on hover ✓
- Button is accessible and intuitive ✓

---

### Scenario 5: Console Verification

**What to do:**

1. Open DevTools (F12)
2. Go to the Console tab
3. Start navigation and monitor the console

**What to check:**

- [ ] NO error messages appear
- [ ] You should see info logs like:
  - `[startNavigation] Modo 3D ativado automaticamente para navegação`
  - `[startNavigation] Monitor de rotação iniciado para navegação`
  - `[addNavigationControls] Botão 'Encerrar navegação' criado com sucesso`
- [ ] NO references to removed functions like `toggle3DMode()`

**Expected Result:**

- Console is clean (no errors) ✓
- 3D activation logs visible ✓

---

## Success Criteria

All of the following must be true for implementation to be considered successful:

1. ✓ **No 3D toggle button** visible on the map interface
2. ✓ **No satellite/3D tabs** in map layers modal
3. ✓ **3D mode auto-activates** when navigation starts
4. ✓ **"Encerrar navegação" button** appears during navigation
5. ✓ **Button is red** and positioned at bottom-right
6. ✓ **Button is clickable** and cancels navigation
7. ✓ **No JavaScript errors** in console
8. ✓ **First-person perspective** enabled (map rotation active)
9. ✓ **3D mode disables** when navigation ends
10. ✓ **Button removes itself** from DOM when navigation ends

---

## Troubleshooting

### If 3D button still appears:

- Check browser cache: Ctrl+Shift+Delete → Clear browsing data → Hard refresh
- Check if `map-unified-controls.js` was properly saved
- Verify `toggle-3d-mode` button ID doesn't exist in the HTML

### If "Encerrar navegação" button doesn't appear:

- Open DevTools Console and check for errors
- Verify `addNavigationControls()` is being called
- Check if JavaScript is enabled

### If 3D mode doesn't activate:

- Verify browser supports Mapbox GL JS (Chrome, Firefox, Safari, Edge)
- Check if Mapbox GL JS library is loaded in the page
- Open Console and search for "mapbox" errors
- Verify `enable3DMode()` is being called from `map-3d.js`

### If button doesn't respond to clicks:

- Open DevTools and check the click event listeners
- Verify `cancelNavigation()` or `confirmCancelNavigation()` function exists
- Check if z-index is preventing clicks (press F12 and inspect the button)

---

## Notes

- The implementation uses **automatic feature detection** - if 3D isn't supported, navigation still works in 2D
- The **red button color** (`#ef4444`) was chosen for high visibility and quick access
- The button uses **accessible attributes** for screen readers and keyboard navigation
- All changes are **non-breaking** - existing functionality remains intact

---

**Testing Date:** December 12, 2025  
**Status:** Ready for manual browser testing
