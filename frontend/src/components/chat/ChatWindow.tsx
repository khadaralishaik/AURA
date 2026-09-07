import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "../../context/ChatContext";

export default function ChatWindow() {
  const { messages, isTyping } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
      {messages.length === 0 && !isTyping ? (
        <div className="h-full flex flex-col justify-center items-center">
          <h1 className="text-5xl font-bold text-cyan-400">Welcome to AURA</h1>
          <p className="mt-4 text-slate-400 text-lg">Ask me anything...</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
