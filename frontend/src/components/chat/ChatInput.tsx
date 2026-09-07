import { useState } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

export default function ChatInput() {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    await sendMessage(value);
  };

  return (
    <div className="bg-slate-900 p-5 border-t border-slate-700">
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ask AURA anything..."
          className="flex-1 bg-slate-800 rounded-xl p-4 outline-none text-white placeholder-slate-400"
        />
        <button type="button" aria-label="Voice input" className="bg-cyan-500 hover:bg-cyan-600 p-4 rounded-xl transition">
          <FaMicrophone />
        </button>
        <button type="button" onClick={() => void handleSend()} aria-label="Send message" className="bg-cyan-500 hover:bg-cyan-600 p-4 rounded-xl transition">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
