import { useEffect, useState } from "react";
import { FaCalendarCheck, FaCheck, FaPen, FaTrash } from "react-icons/fa";
import api from "../services/api";

interface Task { id: number; title: string; due_at?: string | null; completed: number; created_at: string }

function formatDue(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function localDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function Tasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueAt, setEditingDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<Task[]>("/automation/");
      setItems(data);
    } catch {
      setError("Could not load tasks. Check the backend connection.");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const add = async () => {
    const value = title.trim();
    if (!value) return;
    setError(null);
    try {
      await api.post("/automation/", { title: value, due_at: dueAt ? new Date(dueAt).toISOString() : null });
      setTitle("");
      setDueAt("");
      await load();
    } catch {
      setError("Could not save the task. Check the backend connection.");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDueAt(localDateTime(task.due_at));
    setError(null);
  };

  const saveEdit = async () => {
    const value = editingTitle.trim();
    if (!editingId || !value) return;
    setError(null);
    try {
      await api.put(`/automation/${editingId}`, { title: value, due_at: editingDueAt ? new Date(editingDueAt).toISOString() : null });
      setEditingId(null);
      setEditingTitle("");
      setEditingDueAt("");
      await load();
    } catch {
      setError("Could not update the task. Please try again.");
    }
  };

  const done = async (id: number) => {
    setError(null);
    try {
      await api.post(`/automation/${id}/complete`);
      await load();
    } catch {
      setError("Could not complete the task. Please try again.");
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await api.delete(`/automation/${id}`);
      if (editingId === id) setEditingId(null);
      await load();
    } catch {
      setError("Could not delete the task. Please try again.");
    }
  };

  return (
    <section className="page">
      <div className="page-head"><div><h1><FaCalendarCheck /> Tasks</h1><p>Tasks AURA can keep track of.</p></div></div>
      <div className="memory-add">
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a task…" onKeyDown={event => { if (event.key === "Enter") void add(); }} />
        <input type="datetime-local" value={dueAt} onChange={event => setDueAt(event.target.value)} aria-label="Task due date" />
        <button onClick={() => void add()} disabled={!title.trim()}>Add</button>
      </div>
      {error && <div className="error-card">{error}</div>}
      <div className="task-list">
        {items.length ? items.map(task => (
          <div className={task.completed ? "task done" : "task"} key={task.id}>
            {editingId === task.id ? (
              <div className="task-edit">
                <input value={editingTitle} onChange={event => setEditingTitle(event.target.value)} aria-label="Task title" autoFocus />
                <input type="datetime-local" value={editingDueAt} onChange={event => setEditingDueAt(event.target.value)} aria-label="Task due date" />
                <div><button onClick={() => void saveEdit()} disabled={!editingTitle.trim()}>Save</button><button onClick={() => setEditingId(null)}>Cancel</button></div>
              </div>
            ) : (
              <>
                <div><span>{task.title}</span>{formatDue(task.due_at) && <small>Due {formatDue(task.due_at)}</small>}</div>
                <div className="task-actions">
                  {!task.completed && <button onClick={() => void done(task.id)} aria-label="Complete task" title="Complete"><FaCheck /></button>}
                  {!task.completed && <button onClick={() => startEdit(task)} aria-label="Edit task" title="Edit"><FaPen /></button>}
                  <button onClick={() => void remove(task.id)} aria-label="Delete task" title="Delete"><FaTrash /></button>
                </div>
              </>
            )}
          </div>
        )) : <div className="empty-card">No tasks yet.</div>}
      </div>
    </section>
  );
}
