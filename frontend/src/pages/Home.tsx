import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  );
}
