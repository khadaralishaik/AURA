import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import type { Conversation, Message } from "../types/chat";

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  conversationId: number | null;
  isTyping: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  newChat: () => void;
  clearChat: () => void;
  loadConversation: (id: number) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const STORAGE_KEY = "aura.chat.history";
const ID_KEY = "aura.conversation.id";
const ChatContext = createContext<ChatContextType | null>(null);

function loadMessages(): Message[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m): m is Message => {
      if (!m || typeof m !== "object") return false;
      const x = m as Partial<Message>;
      return typeof x.id === "number" && (x.sender === "user" || x.sender === "assistant") && typeof x.text === "string" && typeof x.timestamp === "string";
    });
  } catch { return []; }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [conversationId, setConversationId] = useState<number | null>(() => {
    const value = Number(localStorage.getItem(ID_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (conversationId) localStorage.setItem(ID_KEY, String(conversationId)); else localStorage.removeItem(ID_KEY); }, [conversationId]);

  const refreshConversations = useCallback(async () => {
    try { const { data } = await api.get<Conversation[]>("/chat/conversations"); setConversations(data); } catch { /* offline is handled by chat itself */ }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshConversations(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshConversations]);

  const sendMessage = useCallback(async (text: string) => {
    const value = text.trim();
    if (!value || isTyping) return;
    setError(null);
    const userMessage: Message = { id: Date.now(), sender: "user", text: value, timestamp: new Date().toISOString() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setIsTyping(true);
    try {
      const { data } = await api.post<{ reply: string; conversation_id: number }>("/chat/", { message: value, history: updated, conversation_id: conversationId });
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "assistant", text: data.reply, timestamp: new Date().toISOString() }]);
      await refreshConversations();
    } catch {
      setError("AURA could not reach the backend. Check that the API is running.");
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: "assistant", text: "⚠️ I couldn't reach the AURA backend. Please check the API connection and try again.", timestamp: new Date().toISOString() }]);
    } finally { setIsTyping(false); }
  }, [conversationId, isTyping, messages, refreshConversations]);

  const newChat = useCallback(() => { setMessages([]); setConversationId(null); setError(null); localStorage.removeItem(STORAGE_KEY); }, []);
  const clearChat = useCallback(() => { newChat(); }, [newChat]);

  const loadConversation = useCallback(async (id: number) => {
    const { data } = await api.get<Message[]>(`/chat/conversations/${id}`);
    setConversationId(id);
    setMessages(data.map((m, i) => ({ ...m, id: i + 1 })));
    setError(null);
  }, []);

  const value = useMemo(() => ({ messages, conversations, conversationId, isTyping, error, sendMessage, newChat, clearChat, loadConversation, refreshConversations }), [messages, conversations, conversationId, isTyping, error, sendMessage, newChat, clearChat, loadConversation, refreshConversations]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
