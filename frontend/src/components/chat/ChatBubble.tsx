import type { Message } from "../../types/chat";
import MarkdownMessage from "./MarkdownMessage";

interface Props { message: Message; }

export default function ChatBubble({ message }: Props) {
  const isUser = message.sender === "user";
  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-5 py-4 shadow-lg ${isUser ? "bg-cyan-500 text-white" : "bg-slate-800 text-white"}`}>
        <div className="text-xs opacity-70 mb-2">{isUser ? "👤 You" : "🤖 AURA"}</div>
        <MarkdownMessage text={message.text} />
      </div>
    </div>
  );
}
