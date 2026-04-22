/**
 * main.js — Proceso principal Electron
 * Auth y DB solo aquí. El renderer no toca Node.
 */
const { app, BrowserWindow, ipcMain } = require('electron')
const path  = require('node:path')
const auth  = require('./services/auth')

const RUTAS = {
  AA: 'renderer/AA.html',
  SC: 'renderer/SC.html',
  NI: 'renderer/NI.html',
  VA: 'renderer/VA.html',
  IV: 'renderer/IV.html',
  SS: 'renderer/SS.html',
  OB: 'renderer/OB.html',
  DP: 'renderer/DP.html',
  TI: 'renderer/TI.html',
  LC: 'renderer/LC.html',
  EV: 'renderer/EV.html',
}

// ── IPC handlers ───────────────────────────────────────
ipcMain.handle('login', (_e, id, pass) => auth.login(id, pass))
ipcMain.handle('get-agents', () => auth.getAgents())
ipcMain.handle('open-libro', (_e, tipo) => {
  const win = BrowserWindow.getFocusedWindow()
  if (win && RUTAS[tipo]) win.loadFile(RUTAS[tipo])
})
ipcMain.handle('go-selector', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.loadFile('renderer/selector.html')
})

// ── Ventana ─────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 900, minHeight: 600,
    title: "i-ACTES · Policia Local de l'Arboç",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })
  win.maximize()
  win.loadFile('renderer/selector.html')
  // DevTools solo en desarrollo:
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
