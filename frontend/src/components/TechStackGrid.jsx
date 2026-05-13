const COLORS = {
  language: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-300",
  framework: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-300",
  database: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-300",
  infrastructure: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-300",
  ci_cd: "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-300",
  testing: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-300",
  tooling: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-300",
  other: "from-gray-500/20 to-gray-600/5 border-gray-500/20 text-gray-300",
};

export default function TechStackGrid({ techStack }) {
  if (!techStack?.length) return <p className="text-gray-600 text-sm">No tech stack detected.</p>;

  const grouped = techStack.reduce((acc, item) => {
    const cat = (item.category || "other").toLowerCase();
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">{cat}</div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br border text-sm font-medium transition-transform hover:scale-105 cursor-default ${COLORS[cat] || COLORS.other}`}>
                <span>{item.icon || "⚙️"}</span>
                <span>{item.name}</span>
                {item.version && <span className="text-xs opacity-50 font-mono">{item.version}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
