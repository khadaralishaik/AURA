import { useState } from "react";
import { FaBrain, FaCalendarCheck, FaComments, FaCog, FaPlus, FaSearch } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

export type View = "chat" | "memory" | "tasks" | "research" | "settings";
export default function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { newChat, conversations, loadConversation } = useChat();
  const [query, setQuery] = useState("");
  const visible = conversations.filter(c => c.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);
  return <aside className="sidebar">
    <div className="brand"><span className="brand-orb">A</span><span>AURA</span></div>
    <button className="new-chat" onClick={() => { newChat(); setView("chat"); }}><FaPlus/> New chat</button>
    <nav>
      <button className={view === "chat" ? "nav-item selected" : "nav-item"} onClick={() => setView("chat")}><FaComments/> Chats</button>
      <button className={view === "memory" ? "nav-item selected" : "nav-item"} onClick={() => setView("memory")}><FaBrain/> Memory</button>
      <button className={view === "tasks" ? "nav-item selected" : "nav-item"} onClick={() => setView("tasks")}><FaCalendarCheck/> Tasks</button>
      <button className={view === "research" ? "nav-item selected" : "nav-item"} onClick={() => setView("research")}><FaSearch/> Research</button>
      <button className={view === "settings" ? "nav-item selected" : "nav-item"} onClick={() => setView("settings")}><FaCog/> Settings</button>
    </nav>
    <div className="recent-title"><FaSearch/> Recent</div>
    <input className="recent-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a chat…" aria-label="Find a chat" />
    <div className="recent-list">{visible.map(c => <button key={c.id} onClick={() => { void loadConversation(c.id); setView("chat"); }}>{c.title || "New conversation"}</button>)}</div>
  </aside>;
}
