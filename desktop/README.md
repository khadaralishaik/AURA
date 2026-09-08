# AURA Desktop

AURA Desktop packages the web assistant as a Windows Electron app.

## Runtime

- Starts with Windows login on installed Windows builds.
- Keeps AURA alive in the system tray when the main window is closed.
- `Ctrl+Shift+A` restores/focuses AURA from anywhere while the desktop process is running.
- The tray menu can open or quit AURA.
- Windows uses a native background wake-word listener based on the installed Windows Speech/SAPI recognition stack.
- The native listener recognizes only `Hey AURA`, then hands the microphone to the visible command recognizer and resumes after the response.
- The web speech layer remains available as a fallback outside the Windows native desktop runtime.

## Native wake word

On Windows, AURA starts a hidden Windows PowerShell 5.1 helper at startup. The helper uses `System.Speech.Recognition.SpeechRecognitionEngine` with a constrained `Hey AURA` grammar, so wake detection does not depend on the browser tab remaining active. Windows PowerShell 5.1 is included with supported Windows client versions, and the speech API uses the system microphone and installed speech recognizer.

Audio is processed locally by the Windows speech engine. AURA does not save the wake audio.

## Build

From `desktop/`:

```bash
npm install
npm run dist
```

The Windows installer is generated under `desktop/dist/`.

## Limitation

AURA still needs its Electron tray process running for the native listener to be active. Closing the window is enough; choosing **Quit AURA** stops the process and microphone listener. This is the normal desktop-assistant architecture for an app-owned background wake word.
