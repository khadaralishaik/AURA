const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("auraDesktop", {
  isDesktop: true,
  nativeWakeWord: process.platform === "win32",
  onNativeWakeWord: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("aura-native-wake", listener);
    return () => ipcRenderer.removeListener("aura-native-wake", listener);
  },
  resumeWakeWord: () => ipcRenderer.send("aura-resume-wake"),
});
