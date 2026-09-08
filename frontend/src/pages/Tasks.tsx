import { useEffect, useState } from "react";
import { FaCalendarCheck, FaCheck } from "react-icons/fa";
import api from "../services/api";

interface Task { id: number; title: string; due_at?: string | null; completed: number; created_at: string }

export default function Tasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const { data } = await api.get<Task[]>("/automation/");
    setItems(data);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const add = async () => {
    const value = title.trim();
    if (!value) return;
    await api.post("/automation/", { title: value });
    setTitle("");
    await load();
  };

  const done = async (id: number) => {
    await api.post(`/automation/${id}/complete`);
    await load();
  };

  return (
    <section className="page">
      <div className="page-head"><div><h1><FaCalendarCheck /> Tasks</h1><p>Simple tasks AURA can keep track of.</p></div></div>
      <div className="memory-add">
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a task…" onKeyDown={event => { if (event.key === "Enter") void add(); }} />
        <button onClick={() => void add()}>Add</button>
      </div>
      <div className="task-list">
        {items.length ? items.map(task => (
          <div className={task.completed ? "task done" : "task"} key={task.id}>
            <span>{task.title}</span>
            {!task.completed && <button onClick={() => void done(task.id)} aria-label="Complete task"><FaCheck /></button>}
          </div>
        )) : <div className="empty-card">No tasks yet.</div>}
      </div>
    </section>
  );
}
