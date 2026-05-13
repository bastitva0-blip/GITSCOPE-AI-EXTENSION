import { useState } from "react";

export default function SummarySection({ summary }) {
  const [tab, setTab] = useState("beginner");
  if (!summary) return null;

  return (
    <div className="space-y-4">
      {summary.one_liner && <p className="text-base text-gray-200 leading-relaxed italic">&ldquo;{summary.one_liner}&rdquo;</p>}

      <div className="flex gap-2 p-1 rounded-xl bg-surface-900/60 w-fit">
        {["beginner", "expert"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${tab === t ? "bg-brand-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {t === "beginner" ? "🌱 Beginner" : "🔬 Expert"}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{summary[tab]}</p>

      {summary.use_cases?.length > 0 && (
        <div>
          <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">Use Cases</div>
          <div className="space-y-1.5">
            {summary.use_cases.map((uc, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 rounded-lg bg-surface-800/50 border border-white/5">
                <span className="text-brand-400 text-xs font-mono font-bold mt-0.5">{String(i+1).padStart(2,"0")}</span>
                <p className="text-xs text-gray-300">{uc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.getting_started && (
        <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/20">
          <div className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-1.5">Getting Started</div>
          <p className="text-xs text-gray-300 leading-relaxed">{summary.getting_started}</p>
        </div>
      )}
    </div>
  );
}
