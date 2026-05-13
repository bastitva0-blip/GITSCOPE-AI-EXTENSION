import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react";

const SEV = {
  critical: { icon: AlertCircle, cls: "badge-critical", border: "border-red-500/20", bg: "bg-red-500/5 hover:bg-red-500/10", dot: "bg-red-400" },
  warning:  { icon: AlertTriangle, cls: "badge-warning", border: "border-amber-500/20", bg: "bg-amber-500/5 hover:bg-amber-500/10", dot: "bg-amber-400" },
  info:     { icon: Info, cls: "badge-info", border: "border-blue-500/20", bg: "bg-blue-500/5 hover:bg-blue-500/10", dot: "bg-blue-400" },
};

export default function IssuesPanel({ issues }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  if (!issues?.length) return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
      <span className="text-2xl">✅</span>
      <div><div className="font-semibold">No issues found!</div><div className="text-sm opacity-70">This repo looks healthy.</div></div>
    </div>
  );

  const counts = { critical: 0, warning: 0, info: 0 };
  issues.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });
  const filtered = filter === "all" ? issues : issues.filter(i => i.severity === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {[["all", issues.length, ""], ["critical", counts.critical, "red"], ["warning", counts.warning, "amber"], ["info", counts.info, "blue"]]
          .filter(([id, c]) => c > 0 || id === "all")
          .map(([id, count, color]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${filter === id ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-white/5 hover:bg-white/5"}`}>
              {id} <span className="opacity-60">{count}</span>
            </button>
          ))}
      </div>

      <div className="space-y-2">
        {filtered.map(issue => {
          const cfg = SEV[issue.severity] || SEV.info;
          const Icon = cfg.icon;
          const isOpen = expanded === issue.id;
          return (
            <div key={issue.id} className={`rounded-xl border transition-all ${cfg.border} ${cfg.bg}`}>
              <button className="w-full flex items-center gap-3 p-3.5 text-left" onClick={() => setExpanded(isOpen ? null : issue.id)}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <Icon size={14} className="flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{issue.title}</div>
                  {issue.file && <div className="text-xs font-mono text-gray-600 truncate">{issue.file}</div>}
                </div>
                <span className={`flex-shrink-0 ${cfg.cls}`}>{issue.severity}</span>
                {isOpen ? <ChevronDown size={13} className="opacity-40" /> : <ChevronRight size={13} className="opacity-40" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
                  <p className="text-sm text-gray-300 leading-relaxed">{issue.description}</p>
                  {issue.suggestion && (
                    <div className="flex gap-2 p-2.5 rounded-lg bg-surface-800/60">
                      <span>💡</span>
                      <p className="text-xs text-gray-400">{issue.suggestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
