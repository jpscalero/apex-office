const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apexNative', {
  isNativeWindows: true,
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
});
