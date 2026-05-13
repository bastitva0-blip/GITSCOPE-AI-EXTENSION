import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, Download, RefreshCw } from "lucide-react";

let initialized = false;

function initMermaid() {
  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      darkMode: true,
      securityLevel: "loose",
      themeVariables: {
        background: "#0d1526",
        primaryColor: "#1a2844",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#06b6d4",
        lineColor: "#06b6d4",
        secondaryColor: "#121e34",
        fontFamily: "monospace",
        fontSize: "12px",
      },
      flowchart: { curve: "basis", htmlLabels: false },
    });
    initialized = true;
  }
}

function sanitizeChart(chart) {
  if (!chart) return "";
  let c = chart.trim();

  if (c.includes("```mermaid")) {
    const start = c.indexOf("```mermaid") + 10;
    const end = c.indexOf("```", start);
    c = end > start ? c.slice(start, end).trim() : c.slice(start).trim();
  } else if (c.startsWith("```")) {
    c = c.replace(/^```\w*\n?/, "").replace(/```$/, "").trim();
  }

  c = c.replace(/<[^>]+>/g, "");

  const validStarts = ["graph ", "flowchart ", "sequenceDiagram", "classDiagram",
    "stateDiagram", "erDiagram", "gantt", "pie", "gitGraph", "mindmap"];
  if (!validStarts.some(s => c.startsWith(s))) {
    const match = c.match(/(graph\s+(?:TD|LR|TB|BT|RL)[\s\S]*)/);
    if (match) c = match[1].trim();
    else return "graph TD\n    A[Repository Analyzed] --> B[Results Below]";
  }

  return c;
}

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawChart, setRawChart] = useState("");

  useEffect(() => {
    if (!chart) return;
    const clean = sanitizeChart(chart);
    setRawChart(clean);
    initMermaid();
    renderChart(clean);
  }, [chart]);

  async function renderChart(chartStr) {
    if (!chartStr || !containerRef.current) return;
    setLoading(true);
    setError(null);

    const id = "mm" + Math.random().toString(36).slice(2);

    try {
      const { svg } = await mermaid.render(id, chartStr);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.width = "100%";
          svgEl.style.height = "auto";
          svgEl.removeAttribute("width");
          svgEl.removeAttribute("height");
        }
      }
      setError(null);
    } catch (e) {
      console.error("Mermaid error:", e, "\nChart:\n", chartStr);
      try {
        const fbId = "mmfb" + Math.random().toString(36).slice(2);
        const fallback = "graph TD\n    A[Repository Analyzed] --> B[Check Results Below]";
        const { svg } = await mermaid.render(fbId, fallback);
        if (containerRef.current) containerRef.current.innerHTML = svg;
        setError("Diagram had syntax issues — showing simplified version.");
      } catch {
        setError("Could not render architecture diagram.");
        if (containerRef.current) containerRef.current.innerHTML = "";
      }
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml" }));
    a.download = "gitscope-flowchart.svg";
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
            className="p-1.5 rounded-lg bg-surface-700/50 hover:bg-surface-600 transition-colors text-gray-400 hover:text-white">
            <ZoomOut size={13} />
          </button>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))}
            className="p-1.5 rounded-lg bg-surface-700/50 hover:bg-surface-600 transition-colors text-gray-400 hover:text-white">
            <ZoomIn size={13} />
          </button>
          <span className="text-xs font-mono text-gray-600 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => renderChart(rawChart)}
            className="p-1.5 rounded-lg bg-surface-700/50 hover:bg-surface-600 transition-colors text-gray-400 hover:text-white">
            <RefreshCw size={13} />
          </button>
        </div>
        <button onClick={download}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-medium transition-colors">
          <Download size={12} /> Export SVG
        </button>
      </div>

      <div className="overflow-auto rounded-xl bg-surface-900/80 border border-white/5 p-4 min-h-40">
        {loading && (
          <div className="flex justify-center items-center h-40 gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {error && !loading && (
          <div className="text-yellow-400 text-xs mb-2 px-1">⚠️ {error}</div>
        )}
        <div
          ref={containerRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            display: loading ? "none" : "block",
          }}
        />
      </div>

      <details className="mt-2">
        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">
          View Mermaid source
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-surface-900 border border-white/5 text-xs font-mono text-gray-500 overflow-auto max-h-36">
          {rawChart}
        </pre>
      </details>
    </div>
  );
}