"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, request, type Ping, type SharedState } from "@/lib/api";

type Entry = { id: number; method: string; path: string; status: number | null; duration: number; data: unknown };

export default function Home() {
  const [data, setData] = useState<SharedState | null>(null);
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("Connexion…");
  const [pong, setPong] = useState(false);
  const pending = useRef(false);
  const nextId = useRef(0);

  const call = useCallback(async (path: string, method = "GET", body?: unknown) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(path);
    setError("");
    const start = performance.now();
    try {
      const result = await request<SharedState | Ping>(path, method, body);
      setConnection("API connectée");
      if ("counter" in result.data) {
        setData(result.data);
        if (path === "/api/message" || path === "/api/reset") setDraft(result.data.message);
      } else setPong(true);
      setEntries((previous) => [{ id: ++nextId.current, path, method, ...result }, ...previous].slice(0, 12));
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "Une erreur est survenue.";
      setError(message);
      setConnection("Échec du dernier appel");
      setEntries((previous) => [{ id: ++nextId.current, path, method, status: null, duration: Math.round(performance.now() - start), data: { error: message } }, ...previous].slice(0, 12));
    } finally {
      pending.current = false;
      setBusy(null);
    }
  }, []);

  useEffect(() => { void call("/api/state"); }, [call]);

  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Ping Pong, accueil"><span className="brand-icon">↔</span> ping / pong<span className="tag">PLAYGROUND</span></a>
        <a className="docs-link" href={API_URL ? `${API_URL}/docs` : "#configuration"} target={API_URL ? "_blank" : undefined} rel="noreferrer">Explorer l’API ↗</a>
      </header>

      <section className="intro">
        <div><p className="eyebrow">DEUX SERVICES. UNE CONVERSATION.</p><h1>Un clic ici.<br /><span>Une réponse là-bas.</span></h1><p className="subtitle">Teste les échanges entre ton front Next.js et ton API Python.</p></div>
        <div className={`connection ${connection === "API connectée" ? "online" : ""}`} role="status"><span />{connection}</div>
      </section>

      <section className="route" aria-label="Architecture de l’application">
        <div><span className="service-icon">▲</span><div><strong>Next.js</strong><small>FRONT · VERCEL</small></div></div>
        <div className="route-line"><span>HTTP / JSON</span><i>↔</i></div>
        <div><span className="service-icon python">Py</span><div><strong>FastAPI</strong><small>BACK · RAILWAY</small></div></div>
      </section>

      {error && <div className="error" role="alert">{error}</div>}

      <div className="workspace">
        <section className="actions" aria-label="Actions API">
          <article className="card ping-card">
            <div className="card-heading"><span className="number">01</span><span className="method">GET</span><code>/api/ping</code></div>
            <h2>Allô, le back ?</h2><p>Envoie un ping. Python te répond pong.</p>
            <div className="ping-action"><button disabled={!!busy} onClick={() => { setPong(false); void call("/api/ping"); }}>{busy === "/api/ping" ? "Envoi…" : "Envoyer un ping"}<span>↗</span></button><span className={`pong ${pong ? "received" : ""}`} aria-live="polite">{pong ? "pong !" : "···"}</span></div>
          </article>

          <article className="card">
            <div className="card-heading"><span className="number">02</span><span className="method post">POST</span><code>/api/counter</code></div>
            <h2>Un compteur partagé</h2><p>La valeur est conservée côté Python.</p>
            <div className="counter"><button className="square" aria-label="Diminuer le compteur" disabled={!!busy || !data} onClick={() => void call("/api/counter", "POST", { delta: -1 })}>−</button><output aria-label="Valeur du compteur">{data?.counter ?? "—"}</output><button className="square" aria-label="Augmenter le compteur" disabled={!!busy || !data} onClick={() => void call("/api/counter", "POST", { delta: 1 })}>+</button></div>
          </article>

          <article className="card message-card">
            <div className="card-heading"><span className="number">03</span><span className="method patch">PATCH</span><code>/api/message</code></div>
            <h2>Un message qui voyage</h2><p>Modifie le texte, puis relis-le depuis l’API.</p>
            <blockquote>{data ? data.message : "En attente de l’API…"}</blockquote>
            <form onSubmit={(event) => { event.preventDefault(); if (draft.trim()) void call("/api/message", "PATCH", { message: draft.trim() }); }}>
              <label htmlFor="message">Nouveau message</label>
              <div className="input-row"><input id="message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={200} required placeholder="Bonjour depuis Next.js !" /><button disabled={!!busy || !draft.trim()} type="submit">Enregistrer ↗</button></div>
            </form>
          </article>
          <div className="secondary-actions"><button className="text-button" disabled={!!busy} onClick={() => void call("/api/state")}>↻ Relire les données</button><button className="text-button muted" disabled={!!busy || !data} onClick={() => void call("/api/reset", "POST")}>Réinitialiser la démo</button></div>
        </section>

        <aside className="console" aria-label="Journal des requêtes">
          <div className="console-heading"><h2><span>⌁</span> Les échanges</h2><span className="console-count">{entries.length} / 12</span></div>
          <p className="console-description">Les vraies réponses de ton API, au fil des clics.</p>
          <div className="requests" aria-live="polite" aria-relevant="additions">
            {entries.length === 0 && <p className="empty">La première requête arrive…</p>}
            {entries.map((entry, index) => <details className="request" key={entry.id} open={index === 0}>
              <summary><span className={`request-status ${entry.status ? "success" : "failed"}`}>{entry.status ?? "ERR"}</span><span className="request-path"><b>{entry.method}</b> {entry.path}</span><span className="duration">{entry.duration} ms</span></summary>
              <pre>{JSON.stringify(entry.data, null, 2)}</pre>
            </details>)}
          </div>
          <div className="console-footer"><span>↳</span> Navigateur → API Python → JSON</div>
        </aside>
      </div>

      <footer id="configuration"><p><span className="footer-label">API CIBLE</span> <code>{API_URL || "NEXT_PUBLIC_API_URL non configurée"}</code></p><p>Démo en mémoire · données partagées, remises à zéro au redémarrage du back.</p></footer>
    </main>
  );
}
