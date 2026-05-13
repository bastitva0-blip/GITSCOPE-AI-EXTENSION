import { useState, useCallback, useRef } from "react";

const API_BASE = "/api";

export const STAGES = [
  { id: "fetch",      label: "Fetching repository",   icon: "🔍" },
  { id: "analyze",    label: "Analyzing with Llama3",  icon: "🧠" },
  { id: "flowchart",  label: "Building flowchart",     icon: "🗺️" },
  { id: "tech_stack", label: "Detecting tech stack",   icon: "⚙️" },
  { id: "issues",     label: "Scanning issues",        icon: "🔎" },
  { id: "summary",    label: "Writing summaries",      icon: "✍️" },
];

export function useAnalysis() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);
  const [progress, setProgress] = useState(null);
  const [cached, setCached]     = useState(false);
  const abortRef = useRef(null);

  const analyze = useCallback(async (repoUrl) => {
    setLoading(true); setError(null); setResult(null); setProgress(null); setCached(false);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "progress") setProgress({ stage: event.stage, message: event.message });
            else if (event.type === "complete") { const { type, cached, ...data } = event; setCached(!!cached); setResult(data); }
            else if (event.type === "error") throw new Error(event.message);
          } catch (e) { if (e.message && !e.message.includes("JSON")) throw e; }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false); setProgress(null);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false); setError(null); setResult(null); setProgress(null); setCached(false);
  }, []);

  return { analyze, reset, loading, error, result, progress, cached };
}
