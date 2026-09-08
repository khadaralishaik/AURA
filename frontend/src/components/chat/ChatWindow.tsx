import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "../../context/ChatContext";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ onPrompt }: { onPrompt: (text: string) => void }) {
  const { messages, isTyping } = useChat();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages, isTyping]);

  useEffect(() => {
    if (localStorage.getItem("aura.voiceOutput") === "false" || !messages.length || !("speechSynthesis" in window)) return;
    const last = messages[messages.length - 1];
    if (last.sender !== "assistant") return;
    window.speechSynthesis.cancel();
    const clean = last.text
      .replace(/```[\s\S]*?```/g, "code omitted")
      .replace(/[#*_`>]/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(clean));
  }, [messages]);

  if (!messages.length && !isTyping) return (
    <main className="chat-window empty-state">
      <div className="aura-orb">A</div>
      <h1>What can I help you with?</h1>
      <p>Ask AURA to explain, build, research, plan, remember, or automate.</p>
      <div className="prompt-grid">
        <button onClick={() => onPrompt("Explain quantum computing simply")}>Explain something</button>
        <button onClick={() => onPrompt("Help me plan my day")}>Plan my day</button>
        <button onClick={() => onPrompt("Write a Python function for a REST API")}>Write code</button>
      </div>
    </main>
  );

  return (
    <main className="chat-window">
      <div className="message-list">
        {messages.map(m => (
          <article className={`message ${m.sender}`} key={m.id}>
            <div className="message-avatar">{m.sender === "user" ? "K" : "A"}</div>
            <div className="message-body">
              <div className="message-meta">{m.sender === "user" ? "You" : "AURA"}</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
            </div>
          </article>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottom} />
      </div>
    </main>
  );
}
