const { app, BrowserWindow, Menu, Tray, globalShortcut, nativeImage, session, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

const isDev = !app.isPackaged;
let mainWindow = null;
let tray = null;
let isQuitting = false;
let wakeProcess = null;
let wakeRestartTimer = null;
let nativeWakeEnabled = false;

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

function wakeScriptPath() {
  return isDev
    ? path.join(__dirname, "native", "wake-word.ps1")
    : path.join(process.resourcesPath, "wake-word.ps1");
}

function stopNativeWakeWord() {
  if (wakeRestartTimer) {
    clearTimeout(wakeRestartTimer);
    wakeRestartTimer = null;
  }
  if (wakeProcess) {
    wakeProcess.removeAllListeners();
    try { wakeProcess.kill(); } catch { /* already stopped */ }
    wakeProcess = null;
  }
}

function scheduleNativeWakeWordRestart(delay = 2500) {
  if (!nativeWakeEnabled || isQuitting || wakeRestartTimer) return;
  wakeRestartTimer = setTimeout(() => {
    wakeRestartTimer = null;
    startNativeWakeWord();
  }, delay);
}

function startNativeWakeWord() {
  if (!nativeWakeEnabled || isQuitting || wakeProcess) return;
  const script = wakeScriptPath();
  const powershell = process.env.SystemRoot
    ? path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
    : "powershell.exe";

  const child = spawn(powershell, [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    script,
  ], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });

  wakeProcess = child;
  let stdoutBuffer = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk;
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("WAKE|")) continue;
      const [, phrase = "hey aura", confidence = "0"] = line.split("|");
      stopNativeWakeWord();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send("aura-native-wake", {
          phrase,
          confidence: Number(confidence),
        });
      }
      break;
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    console.warn(`[AURA native wake] ${chunk.trim()}`);
  });
  child.on("error", (error) => {
    console.warn(`[AURA native wake] ${error.message}`);
    if (wakeProcess === child) wakeProcess = null;
    scheduleNativeWakeWordRestart();
  });
  child.on("close", () => {
    if (wakeProcess === child) wakeProcess = null;
    scheduleNativeWakeWordRestart();
  });
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
      nativeWakeEnabled = true;
    }

    ipcMain.on("aura-resume-wake", () => {
      if (nativeWakeEnabled) startNativeWakeWord();
    });

    mainWindow = createWindow();
    createTray();
    globalShortcut.register("CommandOrControl+Shift+A", showAURA);
    startNativeWakeWord();

    app.on("activate", showAURA);
  });

  app.on("will-quit", () => {
    isQuitting = true;
    nativeWakeEnabled = false;
    stopNativeWakeWord();
    globalShortcut.unregister("CommandOrControl+Shift+A");
    tray?.destroy();
  });

  app.on("window-all-closed", () => {
    // AURA stays alive in the tray with its native wake-word listener active.
  });
}
