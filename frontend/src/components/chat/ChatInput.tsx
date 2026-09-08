import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPaperPlane, FaStop } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

type RecognitionResult = { results: { [index: number]: { [index: number]: { transcript?: string } } } };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((e: RecognitionResult) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type RecognitionCtor = new () => Recognition;
type SpeechWindow = Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };

export default function ChatInput() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const { sendMessage, isTyping } = useChat();

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Ctor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) setText(value => `${value} ${transcript}`.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      return;
    }
    setListening(true);
    try { recognition.start(); } catch { setListening(false); }
  };

  const send = async () => {
    const value = text.trim();
    if (!value || isTyping) return;
    setText("");
    await sendMessage(value);
  };

  const speechWindow = window as SpeechWindow;
  const voiceSupported = Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);

  return (
    <div className="input-shell">
      <textarea
        value={text}
        onChange={event => setText(event.target.value)}
        disabled={isTyping}
        onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void send();
          }
        }}
        placeholder={listening ? "Listening…" : "Message AURA…"}
        rows={1}
      />
      <button className={listening ? "icon-button active" : "icon-button"} onClick={toggleVoice} disabled={!voiceSupported} aria-label={listening ? "Stop voice input" : "Voice input"} title={voiceSupported ? (listening ? "Stop listening" : "Speak to AURA") : "Voice input is not supported in this browser"}>
        {listening ? <FaStop /> : <FaMicrophone />}
      </button>
      <button className="send-button" onClick={() => void send()} disabled={isTyping || !text.trim()} aria-label="Send message">
        <FaPaperPlane />
      </button>
    </div>
  );
}
