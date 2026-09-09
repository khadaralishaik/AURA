import { FaCircle, FaHome } from "react-icons/fa";

export default function Navbar({ onHome }: { onHome: () => void }) {
  return <header className="navbar">
    <div className="navbar-status">
      <span className="online"><FaCircle/> Online</span>
      <span className="model-label">AURA 2.0</span>
    </div>
    <div className="navbar-right">
      <span className="navbar-title">Personal AI Assistant</span>
      <button className="home-icon" onClick={onHome} aria-label="Go to AURA home" title="AURA Home"><FaHome /></button>
    </div>
  </header>;
}
