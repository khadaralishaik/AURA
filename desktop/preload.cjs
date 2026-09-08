const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("auraDesktop", {
  isDesktop: true,
});
