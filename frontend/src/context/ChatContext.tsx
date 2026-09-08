import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import type { Message } from "../types/chat";

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const STORAGE_KEY = "aura.chat.history";
const ChatContext = createContext<ChatContextType | null>(null);

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((message): message is Message => {
      if (typeof message !== "object" || message === null) return false;
      const candidate = message as Partial<Message>;
      return (
        typeof candidate.id === "number" &&
        (candidate.sender === "user" || candidate.sender === "assistant") &&
        typeof candidate.text === "string" &&
        typeof candidate.timestamp === "string"
      );
    });
  } catch {
    return [];
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }, [messages]);

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

  function clearChat() {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
