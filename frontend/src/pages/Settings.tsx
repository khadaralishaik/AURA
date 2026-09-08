import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";

export default function Settings() {
  const [voice, setVoice] = useState(() => localStorage.getItem("aura.voiceOutput") !== "false");
  const [compact, setCompact] = useState(() => localStorage.getItem("aura.compactChat") === "true");

  useEffect(() => {
    document.documentElement.dataset.compact = String(compact);
    localStorage.setItem("aura.compactChat", String(compact));
    return () => { delete document.documentElement.dataset.compact; };
  }, [compact]);

  return (
    <section className="page">
      <div className="page-head"><div><h1><FaCog /> Settings</h1><p>Control how AURA behaves in this browser.</p></div></div>
      <div className="settings-card">
        <label><span>Voice responses</span><input type="checkbox" checked={voice} onChange={event => { setVoice(event.target.checked); localStorage.setItem("aura.voiceOutput", String(event.target.checked)); }} /></label>
        <label><span>Compact chat</span><input type="checkbox" checked={compact} onChange={event => setCompact(event.target.checked)} /></label>
        <div className="info">Voice input uses your browser's speech recognition. Voice output uses the browser speech engine when enabled.</div>
      </div>
    </section>
  );
}
