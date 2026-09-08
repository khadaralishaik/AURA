import { useEffect, useState } from "react";
import { FaBrain, FaTrash } from "react-icons/fa";
import api from "../services/api";
import type { Memory as MemoryType } from "../types/memory";

export default function Memory() {
  const [items, setItems] = useState<MemoryType[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await api.get<MemoryType[]>("/memory/");
    setItems(data);
  };

  useEffect(() => { void load(); }, []);

  const add = async () => {
    const value = text.trim();
    if (!value) return;
    await api.post("/memory/", { content: value });
    setText("");
    await load();
  };

  const del = async (id: number) => {
    await api.delete(`/memory/${id}`);
    await load();
  };

  return (
    <section className="page">
      <div className="page-head"><div><h1><FaBrain /> Memory</h1><p>Facts you choose to keep available to AURA.</p></div></div>
      <div className="memory-add">
        <input value={text} onChange={event => setText(event.target.value)} placeholder="Remember that…" onKeyDown={event => { if (event.key === "Enter") void add(); }} />
        <button onClick={() => void add()}>Save</button>
      </div>
      <div className="memory-list">
        {items.length ? items.map(memory => (
          <div className="memory-card" key={memory.id}>
            <span>{memory.content}</span>
            <button onClick={() => void del(memory.id)} aria-label="Delete memory"><FaTrash /></button>
          </div>
        )) : <div className="empty-card">No saved memories yet.</div>}
      </div>
    </section>
  );
}
