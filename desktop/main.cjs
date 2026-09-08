const { app, BrowserWindow, Menu, Tray, globalShortcut, nativeImage, session } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged;
let mainWindow = null;
let tray = null;
let isQuitting = false;

function trayIcon() {
  // Small transparent icon keeps the tray item valid without shipping binary assets.
  return nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
}

function showAURA() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip("AURA — AI desktop assistant");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open AURA", click: showAURA },
    { label: "Quit AURA", click: () => { isQuitting = true; app.quit(); } },
  ]));
  tray.on("double-click", showAURA);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#0b0f19",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());
  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  if (isDev) {
    win.loadURL(process.env.AURA_URL || "http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  }

  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", showAURA);

  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      callback(permission === "media" || permission === "microphone");
    });

    if (process.platform === "win32") {
      app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
    }

    mainWindow = createWindow();
    createTray();
    globalShortcut.register("CommandOrControl+Shift+A", showAURA);

    app.on("activate", showAURA);
  });

  app.on("will-quit", () => {
    isQuitting = true;
    globalShortcut.unregister("CommandOrControl+Shift+A");
    tray?.destroy();
  });

  app.on("window-all-closed", () => {
    // AURA stays alive in the tray so its renderer can keep the voice layer available.
  });
}
