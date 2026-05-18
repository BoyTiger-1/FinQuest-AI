"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

interface BusinessState {
  cash: number; revenue: number; expenses: number;
  employees: number; productPrice: number; unitsSold: number;
  marketingBudget: number; rdBudget: number; period: number;
  history: any[];
  statements: any;
}

export default function BusinessSimPage() {
  const [state, setState] = useState<BusinessState | null>(null);
  const [decisions, setDecisions] = useState({ productPrice: 99, marketingBudget: 5000, rdBudget: 3000, employees: 5 });
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [periodResult, setPeriodResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "statements">("overview");

  async function loadState() {
    const r = await fetch("/api/simulate/business");
    const d = await r.json();
    setState(d);
    setDecisions({ productPrice: d.productPrice, marketingBudget: d.marketingBudget, rdBudget: d.rdBudget, employees: d.employees });
    setLoading(false);
  }

  useEffect(() => { loadState(); }, []);

  async function advancePeriod() {
    setAdvancing(true);
    const r = await fetch("/api/simulate/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance_period", decisions }),
    });
    const d = await r.json();
    setState(d);
    setPeriodResult(d.periodResult);
    setAdvancing(false);
  }

  async function reset() {
    const r = await fetch("/api/simulate/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const d = await r.json();
    setState(d);
    setPeriodResult(null);
    setDecisions({ productPrice: 99, marketingBudget: 5000, rdBudget: 3000, employees: 5 });
  }

  if (loading || !state) return <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Loading simulation...</div>;

  const chartData = state.history.slice(-12).map((h: any) => ({
    period: `P${h.period}`,
    Revenue: h.revenue,
    "Net Income": h.netIncome,
    Cash: h.cash,
  }));

  const stmt = state.statements;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: "0.25rem" }}>🏢 Business Finance Simulator</h1>
          <p style={{ color: "#94a3b8" }}>Period {state.period} · Set decisions, then advance to see results</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={advancePeriod} disabled={advancing} style={{ background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", color: "white", border: "none", borderRadius: 10, padding: "0.75rem 1.5rem", fontWeight: 700, cursor: advancing ? "not-allowed" : "pointer" }}>
            {advancing ? "Processing..." : "⏭ Next Period"}
          </button>
          <button onClick={reset} style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 10, padding: "0.75rem 1.25rem", cursor: "pointer", fontWeight: 600 }}>Reset</button>
        </div>
      </div>

      {/* Period Result */}
      {periodResult && (
        <div style={{ background: periodResult.netIncome >= 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${periodResult.netIncome >= 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
          <span style={{ color: periodResult.netIncome >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>Period Result: </span>
          <span style={{ color: "#94a3b8" }}>Revenue ${periodResult.revenue?.toLocaleString()} · Sold {periodResult.unitsSold} units · Net Income </span>
          <span style={{ color: periodResult.netIncome >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>${periodResult.netIncome?.toLocaleString()}</span>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Cash", value: `$${state.cash.toLocaleString()}`, icon: "💵", color: "#22c55e" },
          { label: "Revenue", value: `$${state.revenue.toLocaleString()}`, icon: "📊", color: "#0ea5e9" },
          { label: "Net Margin", value: stmt ? `${stmt.incomeStatement.netMargin}%` : "—", icon: "📈", color: "#8b5cf6" },
          { label: "Units Sold", value: state.unitsSold.toLocaleString(), icon: "📦", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "1.125rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.375rem" }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Decisions panel */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Next Period Decisions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { key: "productPrice", label: "Product Price ($)", min: 10, max: 500, step: 5, icon: "💰" },
              { key: "marketingBudget", label: "Marketing Budget ($)", min: 0, max: 50000, step: 1000, icon: "📣" },
              { key: "rdBudget", label: "R&D Budget ($)", min: 0, max: 30000, step: 1000, icon: "🔬" },
              { key: "employees", label: "Employees", min: 1, max: 50, step: 1, icon: "👥" },
            ].map(field => (
              <div key={field.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                  <span style={{ color: "#94a3b8" }}>{field.icon} {field.label}</span>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>{field.key === "employees" ? decisions[field.key as keyof typeof decisions] : `$${Number(decisions[field.key as keyof typeof decisions]).toLocaleString()}`}</span>
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step}
                  value={decisions[field.key as keyof typeof decisions]}
                  onChange={e => setDecisions(d => ({ ...d, [field.key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: "#0ea5e9" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569" }}>
                  <span>{field.key === "employees" ? field.min : `$${field.min}`}</span>
                  <span>{field.key === "employees" ? field.max : `$${field.max.toLocaleString()}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Statements */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {(["overview", "statements"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ background: activeTab === t ? "rgba(14,165,233,0.15)" : "transparent", border: `1px solid ${activeTab === t ? "#0ea5e9" : "#334155"}`, color: activeTab === t ? "#38bdf8" : "#64748b", borderRadius: 8, padding: "0.4rem 0.875rem", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>

          {activeTab === "overview" ? (
            stmt ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { label: "Revenue", val: `$${stmt.incomeStatement.revenue.toLocaleString()}`, color: "#4ade80" },
                  { label: "Gross Profit", val: `$${stmt.incomeStatement.grossProfit.toLocaleString()} (${stmt.incomeStatement.grossMargin}%)`, color: "#4ade80" },
                  { label: "Operating Expenses", val: `$${stmt.incomeStatement.operatingExpenses.toLocaleString()}`, color: "#f87171" },
                  { label: "EBITDA", val: `$${stmt.incomeStatement.ebitda.toLocaleString()}`, color: stmt.incomeStatement.ebitda >= 0 ? "#4ade80" : "#f87171" },
                  { label: "Net Income", val: `$${stmt.incomeStatement.netIncome.toLocaleString()} (${stmt.incomeStatement.netMargin}%)`, color: stmt.incomeStatement.netIncome >= 0 ? "#4ade80" : "#f87171" },
                  { label: "Cash", val: `$${stmt.balanceSheet.cash.toLocaleString()}`, color: "#38bdf8" },
                  { label: "Operating Cash Flow", val: `$${stmt.cashFlow.operating.toLocaleString()}`, color: "#38bdf8" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #334155" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 700, fontSize: "0.875rem" }}>{row.val}</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>Advance to see statements</div>
          ) : (
            stmt ? (
              <div style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "#94a3b8", lineHeight: 1.7 }}>
                <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "0.5rem" }}>INCOME STATEMENT</div>
                <div>Revenue: ${stmt.incomeStatement.revenue.toLocaleString()}</div>
                <div>COGS: (${stmt.incomeStatement.cogs.toLocaleString()})</div>
                <div style={{ color: "#4ade80" }}>Gross Profit: ${stmt.incomeStatement.grossProfit.toLocaleString()} ({stmt.incomeStatement.grossMargin}%)</div>
                <div>Payroll: (${stmt.incomeStatement.payroll.toLocaleString()})</div>
                <div>Marketing: (${stmt.incomeStatement.marketingExpense.toLocaleString()})</div>
                <div>R&D: (${stmt.incomeStatement.rdExpense.toLocaleString()})</div>
                <div style={{ color: stmt.incomeStatement.ebitda >= 0 ? "#4ade80" : "#f87171" }}>EBITDA: ${stmt.incomeStatement.ebitda.toLocaleString()}</div>
                <div>Depreciation: (${stmt.incomeStatement.depreciation.toLocaleString()})</div>
                <div>Taxes: (${stmt.incomeStatement.taxes.toLocaleString()})</div>
                <div style={{ color: stmt.incomeStatement.netIncome >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>Net Income: ${stmt.incomeStatement.netIncome.toLocaleString()}</div>
                <div style={{ color: "#38bdf8", fontWeight: 700, marginTop: "0.75rem", marginBottom: "0.5rem" }}>BALANCE SHEET</div>
                <div>Cash: ${stmt.balanceSheet.cash.toLocaleString()}</div>
                <div>Total Assets: ${stmt.balanceSheet.totalAssets.toLocaleString()}</div>
                <div>Total Liabilities: ${stmt.balanceSheet.totalLiabilities.toLocaleString()}</div>
                <div>Equity: ${stmt.balanceSheet.equity.toLocaleString()}</div>
                <div>D/E Ratio: {stmt.balanceSheet.debtToEquity}</div>
              </div>
            ) : <div style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>Advance to see statements</div>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Performance History</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="period" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="Revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
