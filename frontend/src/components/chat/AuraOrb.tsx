import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaStop } from "react-icons/fa";

type RecognitionResult = { results: { [index: number]: { [index: number]: { transcript?: string } } } };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((e: RecognitionResult) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type RecognitionCtor = new () => Recognition;
type SpeechWindow = Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };

export default function AuraOrb({ onTranscript, compact = false }: { onTranscript: (text: string) => void; compact?: boolean }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Ctor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (transcript) onTranscript(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch {} recognitionRef.current = null; };
  }, [onTranscript]);

  const toggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) { recognition.stop(); return; }
    setListening(true);
    try { recognition.start(); } catch { setListening(false); }
  };

  const size = compact ? 62 : 150;

  return <div className={compact ? "orb-wrap compact" : "orb-wrap"}>
    <motion.button
      className={listening ? "aura-orb-live listening" : "aura-orb-live"}
      style={{ width: size, height: size }}
      onClick={toggle}
      disabled={!supported}
      aria-label={supported ? (listening ? "Stop listening" : "Talk to AURA") : "Voice input is not supported"}
      title={supported ? (listening ? "Stop listening" : "Talk to AURA") : "Voice input is not supported in this browser"}
      animate={listening ? { scale: [1, 1.07, 1], boxShadow: ["0 0 25px rgba(54,200,244,.25)", "0 0 65px rgba(54,200,244,.8)", "0 0 25px rgba(54,200,244,.25)"] } : { scale: [1, 1.025, 1] }}
      transition={{ duration: listening ? 1.1 : 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="orb-ring ring-one" />
      <span className="orb-ring ring-two" />
      <span className="orb-core">{listening ? <FaStop /> : <FaMicrophone />}</span>
    </motion.button>
    {!compact && <div className="orb-label">{supported ? (listening ? "Listening…" : "Talk to AURA") : "Voice unavailable"}</div>}
  </div>;
}
