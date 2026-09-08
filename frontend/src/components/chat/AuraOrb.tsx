import { useEffect, useState } from "react";

const VOICE_EVENT = "aura:voice-state";
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const labels: Record<VoiceState, string> = {
  idle: "AURA",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

export default function AuraOrb() {
  const [state, setState] = useState<VoiceState>("idle");

  useEffect(() => {
    const handleState = (event: Event) => {
      const customEvent = event as CustomEvent<VoiceState>;
      if (customEvent.detail) setState(customEvent.detail);
    };

    window.addEventListener(VOICE_EVENT, handleState);
    return () => window.removeEventListener(VOICE_EVENT, handleState);
  }, []);

  return (
    <div
      aria-label={`AURA ${labels[state].toLowerCase()}`}
      style={{
        position: "fixed",
        right: 26,
        bottom: 26,
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 112,
          height: 112,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          filter: state === "speaking" ? "drop-shadow(0 0 28px rgba(125, 211, 252, .45))" : "drop-shadow(0 0 18px rgba(96, 165, 250, .25))",
          transition: "filter .35s ease",
        }}
      >
        <div
          className={`aura-orb aura-orb-${state}`}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ffffff 0, #a5f3fc 8%, #60a5fa 28%, #6366f1 55%, #111827 78%, #020617 100%)",
            boxShadow: "inset 0 0 28px rgba(255,255,255,.22), inset -14px -18px 32px rgba(2,6,23,.58)",
            transform: state === "listening" ? "scale(1.06)" : state === "thinking" ? "scale(1.02)" : "scale(1)",
            transition: "transform .35s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 13,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.34)",
            boxShadow: state === "listening" ? "0 0 0 10px rgba(96,165,250,.10), 0 0 0 22px rgba(96,165,250,.05)" : "none",
            transition: "box-shadow .35s ease",
          }}
        />
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,.9)",
            boxShadow: "0 0 24px rgba(255,255,255,.8)",
            opacity: state === "idle" ? 0.82 : 1,
          }}
        />
      </div>
      <div
        style={{
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(2, 6, 23, .78)",
          border: "1px solid rgba(148,163,184,.18)",
          color: "rgba(255,255,255,.86)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          backdropFilter: "blur(12px)",
        }}
      >
        {labels[state]}
      </div>
      <style>{`
        .aura-orb { animation: auraFloat 5s ease-in-out infinite; }
        .aura-orb-listening { animation: auraListen 1.15s ease-in-out infinite; }
        .aura-orb-thinking { animation: auraThink 1.8s linear infinite; }
        .aura-orb-speaking { animation: auraSpeak .9s ease-in-out infinite; }
        @keyframes auraFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.015); } }
        @keyframes auraListen { 0%,100% { transform: scale(1.02); } 50% { transform: scale(1.09); } }
        @keyframes auraThink { to { transform: rotate(360deg) scale(1.035); } }
        @keyframes auraSpeak { 0%,100% { transform: scale(1.01); } 50% { transform: scale(1.12); } }
        @media (prefers-reduced-motion: reduce) { .aura-orb, .aura-orb-listening, .aura-orb-thinking, .aura-orb-speaking { animation: none; } }
      `}</style>
    </div>
  );
}
