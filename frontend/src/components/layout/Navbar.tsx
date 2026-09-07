import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-8">
      <h2 className="text-2xl font-semibold">Welcome Back 👋</h2>
      <div className="flex items-center gap-6 text-xl" aria-label="Navigation actions">
        <button type="button" aria-label="Search"><FaSearch /></button>
        <button type="button" aria-label="Notifications"><FaBell /></button>
        <button type="button" aria-label="Profile"><FaUserCircle size={28} /></button>
      </div>
    </div>
  );
}
