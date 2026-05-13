import { STAGES } from "../hooks/useAnalysis";

export default function LoadingState({ progress }) {
  const currentIdx = progress ? STAGES.findIndex(s => s.id === progress.stage) : -1;

  return (
    <div className="card animate-fade-up">
      <div className="flex flex-col items-center py-10 gap-7">
        {/* Animated icon */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 animate-pulse">
              <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2z" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 13l6-6 6 6M16 7v11M10 22h12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl" style={{boxShadow:"0 0 20px rgba(6,182,212,0.3)", animation:"pulse 2s ease-in-out infinite"}} />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-white">{progress?.message || "Initializing..."}</p>
          <p className="text-xs text-gray-600 mt-1">Powered by Groq + Llama3 + LangGraph</p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          {STAGES.map((stage, idx) => {
            const done = currentIdx > idx, active = currentIdx === idx;
            return (
              <div key={stage.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${active ? "bg-brand-500/10 border border-brand-500/20" : "opacity-30"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${done ? "bg-emerald-500/20 text-emerald-400" : active ? "bg-brand-500/20 text-brand-400" : "bg-surface-600/50 text-gray-600"}`}>
                  {done ? "✓" : stage.icon}
                </div>
                <span className={`text-xs font-medium ${active ? "text-white" : "text-gray-500"}`}>{stage.label}</span>
                {active && <div className="ml-auto flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1 h-1 rounded-full bg-brand-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
