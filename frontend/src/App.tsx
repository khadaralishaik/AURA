import { useState } from "react";
import ChatInput from "./components/chat/ChatInput";
import ChatWindow from "./components/chat/ChatWindow";
import Navbar from "./components/layout/Navbar";
import Sidebar, { type View } from "./components/layout/Sidebar";
import Memory from "./pages/Memory";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import { useChat } from "./context/ChatContext";

export default function App() {
  const [view, setView] = useState<View>("chat");
  const { sendMessage } = useChat();

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />
      <div className="main-shell">
        <Navbar />
        {view === "chat" ? (
          <>
            <ChatWindow onPrompt={(text) => void sendMessage(text)} />
            <ChatInput />
          </>
        ) : view === "memory" ? <Memory /> : view === "tasks" ? <Tasks /> : <Settings />}
      </div>
    </div>
  );
}
