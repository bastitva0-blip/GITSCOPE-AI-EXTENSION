import { useState } from "react";
import { Github, Search, X, RefreshCw, ChevronDown, ExternalLink, Zap } from "lucide-react";
import { useAnalysis } from "./hooks/useAnalysis";
import MermaidDiagram from "./components/MermaidDiagram";
import TechStackGrid from "./components/TechStackGrid";
import IssuesPanel from "./components/IssuesPanel";
import SummarySection from "./components/SummarySection";
import ScoreIndicator from "./components/ScoreIndicator";
import LoadingState from "./components/LoadingState";

const EXAMPLES = [
  "https://github.com/tiangolo/fastapi",
  "https://github.com/facebook/react",
  "https://github.com/vercel/next.js",
  "https://github.com/django/django",
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const { analyze, reset, loading, error, result, progress, cached } = useAnalysis();

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (repoUrl.trim()) analyze(repoUrl.trim());
  }

  const meta = result?.metadata;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-surface-900/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500/40 to-indigo-500/30 border border-brand-500/30 flex items-center justify-center">
              <Github size={14} className="text-brand-400" />
            </div>
            <span className="font-bold text-white">GitScope<span className="text-brand-400"> AI</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Groq + Llama3
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        {!result && !loading && (
          <div className="text-center space-y-5 py-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium font-mono">
              <Zap size={11} /> Free • Fast • Powered by Groq
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Understand any repo<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">in seconds</span>
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
              Paste a GitHub URL. Get architecture diagrams, tech stack, issue detection, and AI summaries — powered by Groq's free Llama3 API.
            </p>
          </div>
        )}

        {/* Search */}
        <div className={result ? "sticky top-14 z-40" : ""}>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl glass border border-white/8 focus-within:border-brand-500/40 transition-all">
              <Github size={16} className="text-gray-600 flex-shrink-0" />
              <input
                type="url" value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-700 font-mono text-sm"
                disabled={loading}
              />
              {repoUrl && (
                <button type="button" onClick={() => { setRepoUrl(""); reset(); }} className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
                  <X size={13} />
                </button>
              )}
              <button type="submit" disabled={loading || !repoUrl.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all active:scale-95 flex-shrink-0">
                {loading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </form>

          {!result && !loading && (
            <div className="flex items-center gap-2 mt-3 justify-center flex-wrap">
              <span className="text-xs text-gray-700 font-mono">Try:</span>
              {EXAMPLES.map(url => (
                <button key={url} onClick={() => { setRepoUrl(url); analyze(url); }}
                  className="text-xs px-3 py-1 rounded-full bg-surface-700/50 hover:bg-surface-600/50 text-gray-500 hover:text-gray-200 border border-white/5 transition-all font-mono">
                  {url.split("github.com/")[1]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-up">
            <strong>Error:</strong> {error}
            {error.includes("backend") && <div className="mt-1 text-xs text-red-500">Make sure you ran: <code className="font-mono">python -m uvicorn main:app --reload --port 8000</code></div>}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingState progress={progress} />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5 animate-fade-up">

            {/* Repo meta bar */}
            {meta && (
              <div className="card flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{meta.name}</h2>
                    {cached && <span className="badge bg-purple-500/15 text-purple-400 border border-purple-500/20">⚡ Cached</span>}
                    <a href={`https://github.com/${meta.full_name}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-brand-400 transition-colors"><ExternalLink size={13} /></a>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{meta.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 font-mono">
                    <span>⭐ {meta.stars?.toLocaleString()}</span>
                    <span>🍴 {meta.forks?.toLocaleString()}</span>
                    <span>🔴 {meta.open_issues} issues</span>
                    {meta.license && <span>📄 {meta.license}</span>}
                    {meta.language && <span>🔵 {meta.language}</span>}
                  </div>
                </div>
                <ScoreIndicator score={result.score} />
              </div>
            )}

            {/* Content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <Section title="Architecture Flowchart" icon="🗺️" defaultOpen>
                  <MermaidDiagram chart={result.flowchart} />
                </Section>
                <Section title="Summary" icon="📝" defaultOpen>
                  <SummarySection summary={result.summary} />
                </Section>
              </div>
              <div className="space-y-5">
                <Section title="Tech Stack" icon="⚙️" defaultOpen>
                  <TechStackGrid techStack={result.tech_stack} />
                </Section>
                <Section title="Issues" icon="🔍" badge={result.issues?.length} defaultOpen>
                  <IssuesPanel issues={result.issues} />
                </Section>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button onClick={() => { reset(); setRepoUrl(""); window.scrollTo({top:0,behavior:"smooth"}); }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/8 text-gray-500 hover:text-white hover:border-white/15 text-sm transition-all">
                <RefreshCw size={13} /> Analyze another repo
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-5 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-700 font-mono">
          GitScope AI — Groq + LangGraph + Llama3 · Free & Open Source
        </div>
      </footer>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen, badge }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="card">
      <button className="w-full flex items-center justify-between mb-4 group" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h3 className="font-bold text-white text-sm group-hover:text-brand-400 transition-colors">{title}</h3>
          {badge > 0 && <span className="px-2 py-0.5 rounded-full bg-surface-600 text-gray-500 text-xs font-mono">{badge}</span>}
        </div>
        <ChevronDown size={14} className={`text-gray-600 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && children}
    </div>
  );
}
