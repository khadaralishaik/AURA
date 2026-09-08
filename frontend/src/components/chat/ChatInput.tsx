import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

type SpeechRecognitionResultEvent = Event & { results: SpeechRecognitionResultList };
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type SpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export default function ChatInput() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { sendMessage } = useChat();
  const speechWindow = window as SpeechWindow;
  const voiceSupported = Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);

  useEffect(() => {
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) setText((current) => `${current} ${transcript}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      return;
    }
    setIsListening(true);
    try { recognition.start(); } catch { setIsListening(false); }
  };

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    await sendMessage(value);
  };

  return (
    <div className="bg-slate-900 p-5 border-t border-slate-700">
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={isListening ? "Listening..." : "Ask AURA anything..."}
          className="flex-1 bg-slate-800 rounded-xl p-4 outline-none text-white placeholder-slate-400"
        />
        <button
          type="button"
          onClick={toggleVoice}
          disabled={!voiceSupported}
          aria-label={voiceSupported ? "Voice input" : "Voice input is not supported in this browser"}
          title={voiceSupported ? (isListening ? "Stop listening" : "Speak to AURA") : "Voice input is not supported in this browser"}
          className={`p-4 rounded-xl transition ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <FaMicrophone />
        </button>
        <button type="button" onClick={() => void handleSend()} aria-label="Send message" className="bg-cyan-500 hover:bg-cyan-600 p-4 rounded-xl transition">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
