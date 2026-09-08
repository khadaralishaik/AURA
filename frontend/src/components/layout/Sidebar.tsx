import { FaBrain, FaCalendarCheck, FaComments, FaCog, FaPlus, FaSearch } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

export type View = "chat" | "memory" | "tasks" | "settings";
export default function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { newChat, conversations, loadConversation } = useChat();
  return <aside className="sidebar"><div className="brand"><span className="brand-orb">A</span><span>AURA</span></div><button className="new-chat" onClick={() => { newChat(); setView("chat"); }}><FaPlus/> New chat</button><nav>
    <button className={view === "chat" ? "nav-item selected" : "nav-item"} onClick={() => setView("chat")}><FaComments/> Chats</button>
    <button className={view === "memory" ? "nav-item selected" : "nav-item"} onClick={() => setView("memory")}><FaBrain/> Memory</button>
    <button className={view === "tasks" ? "nav-item selected" : "nav-item"} onClick={() => setView("tasks")}><FaCalendarCheck/> Tasks</button>
    <button className={view === "settings" ? "nav-item selected" : "nav-item"} onClick={() => setView("settings")}><FaCog/> Settings</button>
  </nav><div className="recent-title"><FaSearch/> Recent</div><div className="recent-list">{conversations.slice(0, 8).map(c => <button key={c.id} onClick={() => { void loadConversation(c.id); setView("chat"); }}>{c.title || "New conversation"}</button>)}</div></aside>;
}
