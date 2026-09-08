# AURA Desktop

AURA Desktop packages the web assistant as a Windows Electron app.

## Behavior

- Starts with Windows login on installed Windows builds.
- Keeps AURA available in the system tray when the main window is closed.
- `Ctrl+Shift+A` restores/focuses AURA from anywhere while the desktop process is running.
- The tray menu can show AURA or quit it completely.
- The main AURA window contains the animated assistant orb and global voice agent.

## Build

From `desktop/`:

```bash
npm install
npm run dist
```

The installer is generated under `desktop/dist/`.

> Browser speech recognition still depends on Chromium/OS microphone support. A truly closed-process hotword engine requires a native wake-word service; the desktop shell keeps AURA alive in the background so the voice layer can remain available.
