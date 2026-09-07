import { createContext, useContext, useState } from "react";
import api from "../services/api";
import type { Message } from "../types/chat";

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  async function sendMessage(text: string) {
    const value = text.trim();
    if (!value || isTyping) return;

    const userMessage: Message = {
      id: Date.now(), sender: "user", text: value, timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const res = await api.post<{ reply: string }>("/chat/", {
        message: value,
        history: updatedMessages,
      });
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 2,
        sender: "assistant",
        text: "❌ I couldn't reach the AURA backend. Make sure the API is running on port 8000.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearChat: () => setMessages([]) }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
