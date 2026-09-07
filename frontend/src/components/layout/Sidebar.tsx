import { FaComments, FaBrain, FaFolder, FaRobot, FaCog, FaPlus } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

const menu = [
  { icon: <FaPlus />, text: "New Chat" },
  { icon: <FaComments />, text: "Chats" },
  { icon: <FaBrain />, text: "Memory" },
  { icon: <FaFolder />, text: "Projects" },
  { icon: <FaRobot />, text: "Agents" },
  { icon: <FaCog />, text: "Settings" },
];

export default function Sidebar() {
  const { clearChat } = useChat();
  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-700 h-screen p-5">
      <h1 className="text-3xl font-bold text-cyan-400 mb-10">🤖 AURA</h1>
      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.text}
            type="button"
            onClick={item.text === "New Chat" ? clearChat : undefined}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-left"
          >
            {item.icon}{item.text}
          </button>
        ))}
      </nav>
    </aside>
  );
}
