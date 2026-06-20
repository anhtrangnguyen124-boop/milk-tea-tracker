import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onNewEntry: (callback: () => void) => {
    ipcRenderer.on('menu:new-entry', callback)
    return () => {
      ipcRenderer.removeAllListeners('menu:new-entry')
    }
  },
})
