import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "../../context/ChatContext";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ onPrompt }: { onPrompt: (text: string) => void }) {
  const { messages, isTyping, error } = useChat();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (localStorage.getItem("aura.voiceOutput") === "false" || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.sender !== "assistant" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = last.text
      .replace(/```[\s\S]*?```/g, "code omitted")
      .replace(/[#*_`>]/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(clean));
  }, [messages]);

  if (!messages.length && !isTyping) {
    return (
      <main className="chat-window empty-state">
        <div className="aura-orb">A</div>
        <h1>What can I help you with?</h1>
        <p>Ask AURA to explain, build, research, plan, remember, or automate.</p>
        {error && <div className="error-banner">{error}</div>}
        <div className="prompt-grid">
          <button onClick={() => onPrompt("Explain quantum computing simply")}>Explain something</button>
          <button onClick={() => onPrompt("Help me plan my day")}>Plan my day</button>
          <button onClick={() => onPrompt("Write a Python function for a REST API")}>Write code</button>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-window">
      <div className="message-list">
        {messages.map(message => (
          <article className={`message ${message.sender}`} key={message.id}>
            <div className="message-avatar">{message.sender === "user" ? "K" : "A"}</div>
            <div className="message-body">
              <div className="message-meta">{message.sender === "user" ? "You" : "AURA"}</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
          </article>
        ))}
        {isTyping && <TypingIndicator />}
        {error && <div className="error-banner">{error}</div>}
        <div ref={bottom} />
      </div>
    </main>
  );
}
