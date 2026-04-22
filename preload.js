/**
 * preload.js — Puente seguro. CERO require de Node aquí.
 * Todo via ipcRenderer → main.js
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Auth — main process hace el trabajo
  login:     (id, pass) => ipcRenderer.invoke('login', id, pass),
  getAgents: ()         => ipcRenderer.invoke('get-agents'),

  // Navegació
  openLibro:  (tipo) => ipcRenderer.invoke('open-libro', tipo),
  goSelector: ()     => ipcRenderer.invoke('go-selector'),
})
