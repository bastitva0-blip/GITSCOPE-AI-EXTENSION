export default function ScoreIndicator({ score }) {
  const num = parseFloat(score?.split("/")[0]) || 0;
  const max = parseFloat(score?.split("/")[1]) || 10;
  const pct = Math.min(100, (num / max) * 100);
  const r = 44, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  const col = pct >= 80 ? ["#22c55e","text-emerald-400","Excellent"] : pct >= 60 ? ["#eab308","text-yellow-400","Good"] : pct >= 40 ? ["#f97316","text-orange-400","Fair"] : ["#ef4444","text-red-400","Needs Work"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
          <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          <circle cx="54" cy="54" r={r} fill="none" stroke={col[0]} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 6px ${col[0]}80)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${col[1]}`}>{num}</span>
          <span className="text-xs text-gray-600 font-mono">/{max}</span>
        </div>
      </div>
      <div className={`text-xs font-semibold ${col[1]}`}>{col[2]}</div>
    </div>
  );
}
