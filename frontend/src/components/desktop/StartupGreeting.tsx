import { useEffect, useState } from "react";

type DesktopWindow = Window & {
  auraDesktop?: { isDesktop?: boolean };
};

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export default function StartupGreeting() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const desktopWindow = window as DesktopWindow;
    if (!desktopWindow.auraDesktop?.isDesktop) return;

    const name = localStorage.getItem("aura.userName")?.trim() || "Ali";
    const greeting = greetingForHour(new Date().getHours());
    const text = `${greeting}, ${name}. What are we going to accomplish today?`;
    const timer = window.setTimeout(() => {
      setMessage(text);
      setVisible(true);
      if (localStorage.getItem("aura.voiceOutput") !== "false") speak(text);
    }, 900);

    const hideTimer = window.setTimeout(() => setVisible(false), 8500);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 1000,
        maxWidth: 420,
        padding: "16px 20px",
        borderRadius: 16,
        background: "rgba(15, 23, 42, 0.96)",
        color: "white",
        boxShadow: "0 16px 45px rgba(0,0,0,.3)",
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}
