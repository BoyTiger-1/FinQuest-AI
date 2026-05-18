"use client";
import { useState } from "react";

type AnalysisType = "personal" | "business" | "custom";

export default function AnalyzePage() {
  const [type, setType] = useState<AnalysisType>("personal");
  const [customData, setCustomData] = useState(JSON.stringify({
    revenue: 500000, expenses: 350000, netIncome: 100000,
    assets: 800000, liabilities: 300000, cashFlow: 120000
  }, null, 2));
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setAnalysis("");
    try {
      let body: any = { type };
      if (type === "custom") {
        body = { type: "custom", data: JSON.parse(customData) };
      }
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAnalysis(d.analysis);
    } catch (err: any) {
      setError(err.message.includes("API key") ? "Add your Anthropic API key in .env.local to enable AI analysis" : err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatAnalysis(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} style={{ fontSize: "1.375rem", fontWeight: 800, color: "#f8fafc", margin: "1.25rem 0 0.5rem" }}>{line.replace("# ", "")}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.125rem", fontWeight: 700, color: "#38bdf8", margin: "1rem 0 0.375rem" }}>{line.replace("## ", "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "1rem", fontWeight: 700, color: "#a78bfa", margin: "0.75rem 0 0.25rem" }}>{line.replace("### ", "")}</h3>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ display: "flex", gap: "0.5rem", margin: "0.2rem 0", paddingLeft: "0.5rem" }}><span style={{ color: "#0ea5e9" }}>•</span><span style={{ color: "#cbd5e1", fontSize: "0.9375rem" }}>{line.replace(/^[-•] /, "")}</span></div>;
      if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.9375rem", margin: "0.25rem 0" }}>{line.replace(/\*\*/g, "")}</div>;
      if (line === "") return <div key={i} style={{ height: "0.5rem" }} />;
      return <p key={i} style={{ color: "#cbd5e1", fontSize: "0.9375rem", lineHeight: 1.7, margin: "0.2rem 0" }}>{line}</p>;
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: "0.25rem" }}>🤖 AI Financial Analysis</h1>
        <p style={{ color: "#94a3b8" }}>Powered by Gemini AI — get instant ratio analysis, trend insights, and recommendations</p>
      </div>

      {/* Type selector */}
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1.0625rem" }}>Select Analysis Type</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
          {([
            { id: "personal" as const, label: "Personal Finance", icon: "🏠", desc: "From your Personal Finance Sandbox" },
            { id: "business" as const, label: "Business Finance", icon: "🏢", desc: "From your Business Simulator" },
            { id: "custom" as const, label: "Custom Data", icon: "📊", desc: "Paste your own financial data" },
          ]).map(opt => (
            <button key={opt.id} onClick={() => setType(opt.id)}
              style={{ background: type === opt.id ? "rgba(14,165,233,0.12)" : "#0f172a", border: `2px solid ${type === opt.id ? "#0ea5e9" : "#334155"}`, borderRadius: 12, padding: "1rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: type === opt.id ? "#38bdf8" : "#f8fafc" }}>{opt.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {type === "custom" && (
          <div style={{ marginTop: "1.25rem" }}>
            <label style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Financial Data (JSON)</label>
            <textarea
              value={customData}
              onChange={e => setCustomData(e.target.value)}
              rows={8}
              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#f8fafc", borderRadius: 10, padding: "0.875rem 1rem", fontSize: "0.8125rem", fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#0ea5e9"}
              onBlur={e => e.target.style.borderColor = "#334155"}
            />
          </div>
        )}

        <button onClick={runAnalysis} disabled={loading}
          style={{ marginTop: "1.25rem", background: loading ? "#334155" : "linear-gradient(135deg,#0ea5e9,#8b5cf6)", color: "white", border: "none", borderRadius: 10, padding: "0.875rem 2rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Analyzing with Claude AI...
            </>
          ) : "🔍 Run AI Analysis"}
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {analysis && (
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #334155" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem" }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>Gemini AI Financial Analysis</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Powered by gemini-2.5-flash</div>
            </div>
          </div>
          <div style={{ lineHeight: 1.7 }}>
            {formatAnalysis(analysis)}
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
          <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>AI Analysis Ready</h3>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Select a data source above and click &quot;Run AI Analysis&quot; to get Claude&apos;s comprehensive financial analysis including ratios, trends, and recommendations.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
            {["📊 Ratio Analysis", "📈 Trend Insights", "⚠️ Risk Flags", "💡 Recommendations", "🎯 Health Score"].map((f, i) => (
              <span key={i} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 9999, padding: "0.375rem 0.875rem", fontSize: "0.8125rem", color: "#94a3b8" }}>{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
