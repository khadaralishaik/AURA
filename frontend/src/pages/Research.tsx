import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../services/api";

interface Result { title: string; url: string; snippet: string }

export default function Research() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const value = query.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Result[] }>("/research/search", { params: { q: value } });
      setResults(data.results);
    } catch {
      setError("Research is unavailable right now. Check the backend connection and try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="page-head"><div><h1><FaSearch /> Research</h1><p>Search Wikipedia from inside AURA.</p></div></div>
      <div className="memory-add">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for a topic…" onKeyDown={event => { if (event.key === "Enter") void search(); }} />
        <button onClick={() => void search()} disabled={loading || !query.trim()}>{loading ? "Searching…" : "Search"}</button>
      </div>
      {error && <div className="error-card">{error}</div>}
      <div className="memory-list">
        {results.length ? results.map(result => (
          <article className="memory-card" key={result.url}>
            <div><a href={result.url} target="_blank" rel="noreferrer"><strong>{result.title}</strong></a><p>{result.snippet}</p></div>
          </article>
        )) : !error && <div className="empty-card">Search for a topic to see results.</div>}
      </div>
    </section>
  );
}
