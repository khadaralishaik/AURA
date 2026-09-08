import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";

type RecognitionResult = {
  resultIndex?: number;
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      [index: number]: { transcript?: string };
    };
  };
};

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionResult) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type RecognitionCtor = new () => Recognition;
type NativeWakePayload = { phrase?: string; confidence?: number };
type DesktopBridge = {
  isDesktop?: boolean;
  nativeWakeWord?: boolean;
  onNativeWakeWord?: (callback: (payload: NativeWakePayload) => void) => () => void;
  resumeWakeWord?: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionCtor;
  webkitSpeechRecognition?: RecognitionCtor;
  auraDesktop?: DesktopBridge;
};

const WAKE_WORD = "hey aura";
const VOICE_EVENT = "aura:voice-state";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

function setVoiceState(state: VoiceState) {
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail: state }));
}

function speak(text: string) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ");
}

function commandFromTranscript(transcript: string, nativeWakeMode: boolean) {
  if (nativeWakeMode) return transcript.trim();
  const normalized = normalize(transcript);
  const wakeIndex = normalized.indexOf(WAKE_WORD);
  if (wakeIndex < 0) return null;
  const original = transcript.trim().replace(/[.,!?]/g, " ").replace(/\s+/g, " ");
  const originalWakeIndex = original.toLowerCase().indexOf(WAKE_WORD);
  return original.slice(originalWakeIndex + WAKE_WORD.length).trim();
}

export default function GlobalVoiceAgent() {
  const { messages, sendMessage } = useChat();
  const sendMessageRef = useRef(sendMessage);
  const recognitionRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const commandModeRef = useRef(false);
  const nativeWakeRef = useRef(false);
  const spokenMessageRef = useRef<string | number | null>(null);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Ctor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Ctor) return;

    const nativeWake = Boolean(
      speechWindow.auraDesktop?.isDesktop &&
      speechWindow.auraDesktop.nativeWakeWord &&
      speechWindow.auraDesktop.onNativeWakeWord,
    );
    nativeWakeRef.current = nativeWake;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";

    const restart = () => {
      if (!activeRef.current || speakingRef.current || nativeWakeRef.current) return;
      try {
        recognition.start();
        setVoiceState("listening");
      } catch {
        // Recognition is already running.
      }
    };

    recognition.onresult = (event) => {
      const start = event.resultIndex ?? 0;
      for (let index = start; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result?.isFinal) continue;
        const command = commandFromTranscript(result[0]?.transcript || "", nativeWakeRef.current);
        if (command === null) continue;

        speakingRef.current = true;
        setVoiceState(command ? "thinking" : "speaking");
        try {
          recognition.stop();
        } catch {
          // Already stopped.
        }

        commandModeRef.current = false;
        if (command) {
          void sendMessageRef.current(command).finally(() => {
            speakingRef.current = false;
            if (nativeWakeRef.current) {
              setVoiceState("idle");
              speechWindow.auraDesktop?.resumeWakeWord?.();
            } else {
              restart();
            }
          });
        } else {
          speak("Yes, I'm listening.");
          window.setTimeout(() => {
            speakingRef.current = false;
            restart();
          }, 1800);
        }
        break;
      }
    };

    recognition.onend = () => {
      if (commandModeRef.current && nativeWakeRef.current && !speakingRef.current) {
        commandModeRef.current = false;
        setVoiceState("idle");
        speechWindow.auraDesktop?.resumeWakeWord?.();
        return;
      }
      restart();
    };
    recognition.onerror = () => {
      if (commandModeRef.current && nativeWakeRef.current) {
        commandModeRef.current = false;
        setVoiceState("idle");
        speechWindow.auraDesktop?.resumeWakeWord?.();
        return;
      }
      restart();
    };
    recognitionRef.current = recognition;

    let removeNativeWakeListener: (() => void) | undefined;
    if (nativeWake) {
      activeRef.current = true;
      setVoiceState("idle");
      removeNativeWakeListener = speechWindow.auraDesktop?.onNativeWakeWord?.(() => {
        if (speakingRef.current) return;
        commandModeRef.current = true;
        setVoiceState("listening");
        try {
          recognition.start();
        } catch {
          // Recognition is already running.
        }
      });
    } else {
      activeRef.current = true;
      restart();
    }

    return () => {
      activeRef.current = false;
      speakingRef.current = false;
      commandModeRef.current = false;
      setVoiceState("idle");
      removeNativeWakeListener?.();
      try {
        recognition.stop();
      } catch {
        // Already stopped.
      }
      recognitionRef.current = null;
      if (nativeWake) speechWindow.auraDesktop?.resumeWakeWord?.();
    };
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.sender !== "assistant" || spokenMessageRef.current === last.id) return;
    spokenMessageRef.current = last.id;
    if (localStorage.getItem("aura.voiceOutput") === "false") return;

    speakingRef.current = true;
    setVoiceState("speaking");
    try {
      recognitionRef.current?.stop();
    } catch {
      // Already stopped.
    }
    speak(last.text.replace(/```[\s\S]*?```/g, "code omitted").replace(/[#*_`>\x5b\x5d]/g, ""));
    const duration = Math.min(Math.max(last.text.length * 45, 2500), 15000);
    window.setTimeout(() => {
      speakingRef.current = false;
      if (nativeWakeRef.current) {
        setVoiceState("idle");
        (window as SpeechWindow).auraDesktop?.resumeWakeWord?.();
      } else {
        setVoiceState("listening");
        try {
          recognitionRef.current?.start();
        } catch {
          // Already listening.
        }
      }
    }, duration);
  }, [messages]);

  return null;
}
