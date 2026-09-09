import { useState } from "react";
import ChatInput from "./components/chat/ChatInput";
import ChatWindow from "./components/chat/ChatWindow";
import AuraOrb from "./components/chat/AuraOrb";
import Navbar from "./components/layout/Navbar";
import Sidebar, { type View } from "./components/layout/Sidebar";
import Memory from "./pages/Memory";
import Research from "./pages/Research";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import { useChat } from "./context/ChatContext";

export default function App() {
  const [view, setView] = useState<View>("home");
  const { sendMessage } = useChat();

  const openChat = (prompt?: string) => {
    setView("chat");
    if (prompt) void sendMessage(prompt);
  };

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />
      <div className="main-shell">
        <Navbar onHome={() => setView("home")} />
        {view === "home" ? (
          <main className="aura-home">
            <div className="home-copy">
              <div className="eyebrow">YOUR PERSONAL AI</div>
              <h1>What can I do for you?</h1>
              <p>Talk to AURA, ask a question, or choose an action below.</p>
            </div>
            <AuraOrb onTranscript={(text) => openChat(text)} />
            <div className="orb-hint">Click the orb to talk</div>
            <div className="quick-actions">
              <button onClick={() => openChat("Help me plan my day")}>Plan my day</button>
              <button onClick={() => openChat("Explain quantum computing simply")}>Explain something</button>
              <button onClick={() => openChat("Write a Python function for a REST API")}>Write code</button>
              <button onClick={() => setView("research")}>Research</button>
            </div>
          </main>
        ) : view === "chat" ? (
          <>
            <ChatWindow onPrompt={(text) => void sendMessage(text)} />
            <ChatInput />
            <div className="floating-orb"><AuraOrb compact onTranscript={(text) => void sendMessage(text)} /></div>
          </>
        ) : view === "memory" ? (
          <Memory />
        ) : view === "tasks" ? (
          <Tasks />
        ) : view === "research" ? (
          <Research />
        ) : (
          <Settings />
        )}
      </div>
    </div>
  );
}
