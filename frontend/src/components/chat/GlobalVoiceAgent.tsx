import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";

type RecognitionResult = {
  resultIndex?: number;
  results: {
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
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionCtor;
  webkitSpeechRecognition?: RecognitionCtor;
};

const WAKE_WORD = "hey aura";

function speak(text: string) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function commandFromTranscript(transcript: string) {
  const normalized = transcript.trim().toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ");
  const wakeIndex = normalized.indexOf(WAKE_WORD);
  if (wakeIndex < 0) return null;
  return normalized.slice(wakeIndex + WAKE_WORD.length).trim();
}

export default function GlobalVoiceAgent() {
  const { messages, sendMessage } = useChat();
  const recognitionRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const spokenMessageRef = useRef<string | number | null>(null);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Ctor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";

    const restart = () => {
      if (!activeRef.current || speakingRef.current) return;
      try { recognition.start(); } catch { /* already listening */ }
    };

    recognition.onresult = (event) => {
      const start = event.resultIndex ?? 0;
      for (let index = start; index < Object.keys(event.results).length; index += 1) {
        const result = event.results[index];
        if (!result?.isFinal) continue;
        const transcript = result[0]?.transcript || "";
        const command = commandFromTranscript(transcript);
        if (command === null) continue;

        speakingRef.current = true;
        try { recognition.stop(); } catch { /* already stopped */ }

        if (command) {
          void sendMessage(command).finally(() => {
            speakingRef.current = false;
            restart();
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

    recognition.onend = () => restart();
    recognition.onerror = () => restart();
    recognitionRef.current = recognition;
    activeRef.current = true;
    restart();

    return () => {
      activeRef.current = false;
      speakingRef.current = false;
      try { recognition.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    };
  }, [sendMessage]);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.sender !== "assistant" || spokenMessageRef.current === last.id) return;
    spokenMessageRef.current = last.id;
    if (localStorage.getItem("aura.voiceOutput") === "false") return;

    speakingRef.current = true;
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    speak(last.text.replace(/```[\s\S]*?```/g, "code omitted").replace(/[#*_`>\[\]]/g, ""));
    const duration = Math.min(Math.max(last.text.length * 45, 2500), 15000);
    window.setTimeout(() => {
      speakingRef.current = false;
      try { recognitionRef.current?.start(); } catch { /* already listening */ }
    }, duration);
  }, [messages]);

  return null;
}
