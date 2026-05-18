"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StockData {
  symbol: string; name: string; sector: string;
  price: number; change: number; changePercent: number;
  history: { date: string; price: number; volume: number }[];
  holding: { shares: number; avgCost: number; value: number; gain: number; gainPercent: number } | null;
}

interface Portfolio {
  cash: number;
  holdings: any[];
  metrics: { totalValue: number; totalCost: number; totalGain: number; gainPercent: number; beta: number; sharpeRatio: number };
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [selected, setSelected] = useState<StockData | null>(null);
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadData() {
    const r = await fetch("/api/simulate/stocks");
    const d = await r.json();
    setStocks(d.stocks ?? []);
    setPortfolio(d.portfolio);
    if (selected) setSelected(d.stocks.find((s: StockData) => s.symbol === selected.symbol) ?? null);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function trade(action: "buy" | "sell") {
    if (!selected) return;
    setTrading(true);
    const r = await fetch("/api/simulate/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, symbol: selected.symbol, shares }),
    });
    const d = await r.json();
    if (d.error) { setMessage(`❌ ${d.error}`); }
    else { setMessage(`✅ ${action === "buy" ? "Bought" : "Sold"} ${shares} shares of ${selected.symbol} at $${d.price}`); }
    await loadData();
    setTrading(false);
    setTimeout(() => setMessage(""), 4000);
  }

  const sectors = ["all", ...Array.from(new Set(stocks.map(s => s.sector)))];
  const filteredStocks = filter === "all" ? stocks : stocks.filter(s => s.sector === filter);

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Loading market data...</div>;

  const totalPortfolioValue = (portfolio?.cash ?? 0) + (portfolio?.metrics?.totalValue ?? 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: "0.25rem" }}>📈 Stock Market Simulation</h1>
        <p style={{ color: "#94a3b8" }}>GBM-powered realistic pricing · Virtual money only</p>
      </div>

      {/* Portfolio summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.875rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Portfolio Value", value: `$${totalPortfolioValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#38bdf8" },
          { label: "Cash Available", value: `$${(portfolio?.cash ?? 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#4ade80" },
          { label: "Invested Value", value: `$${(portfolio?.metrics?.totalValue ?? 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#a78bfa" },
          { label: "Total Gain/Loss", value: `${(portfolio?.metrics?.totalGain ?? 0) >= 0 ? "+" : ""}$${(portfolio?.metrics?.totalGain ?? 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: (portfolio?.metrics?.totalGain ?? 0) >= 0 ? "#4ade80" : "#f87171" },
          { label: "Portfolio Beta", value: portfolio?.metrics?.beta?.toFixed(2) ?? "—", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 13, padding: "1rem" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: message.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${message.startsWith("✅") ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "0.75rem 1.25rem", marginBottom: "1.25rem", fontSize: "0.9375rem", color: message.startsWith("✅") ? "#4ade80" : "#f87171" }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "1.5rem" }}>
        {/* Stock list */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
          {/* Sector filter */}
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #334155", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {sectors.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? "rgba(14,165,233,0.15)" : "#0f172a", border: `1px solid ${filter === s ? "#0ea5e9" : "#334155"}`, color: filter === s ? "#38bdf8" : "#94a3b8", borderRadius: 8, padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
                {s}
              </button>
            ))}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Symbol", "Name", "Price", "Change", "Holding", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.75rem 1.25rem", textAlign: i === 0 ? "left" : i === 5 ? "center" : "right", fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => (
                <tr key={stock.symbol} onClick={() => setSelected(stock)} style={{ borderBottom: "1px solid #1e293b", cursor: "pointer", background: selected?.symbol === stock.symbol ? "rgba(14,165,233,0.06)" : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (selected?.symbol !== stock.symbol) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { if (selected?.symbol !== stock.symbol) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <span style={{ fontWeight: 700, color: "#38bdf8", fontSize: "0.875rem" }}>{stock.symbol}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.8125rem", color: "#94a3b8" }}>{stock.name}</td>
                  <td style={{ padding: "0.75rem 1.25rem", textAlign: "right", fontWeight: 700, fontSize: "0.9375rem" }}>${stock.price.toFixed(2)}</td>
                  <td style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: stock.change >= 0 ? "#4ade80" : "#f87171", fontSize: "0.8125rem", fontWeight: 600 }}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem", textAlign: "right", fontSize: "0.8125rem" }}>
                    {stock.holding ? <span style={{ color: stock.holding.gain >= 0 ? "#4ade80" : "#f87171" }}>{stock.holding.shares}sh · {stock.holding.gainPercent >= 0 ? "+" : ""}{stock.holding.gainPercent.toFixed(1)}%</span> : <span style={{ color: "#334155" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b", background: "#334155", padding: "0.15rem 0.5rem", borderRadius: 4 }}>{stock.sector}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock detail panel */}
        {selected && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.5rem", color: "#38bdf8" }}>{selected.symbol}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>{selected.name}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>${selected.price.toFixed(2)}</div>
              <div style={{ color: selected.change >= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                {selected.change >= 0 ? "▲" : "▼"} {Math.abs(selected.change).toFixed(2)} ({Math.abs(selected.changePercent).toFixed(2)}%)
              </div>
            </div>

            {/* Mini chart */}
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>30-Day Price History</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={selected.history.slice(-30)}>
                  <Line type="monotone" dataKey="price" stroke={selected.change >= 0 ? "#4ade80" : "#f87171"} strokeWidth={2} dot={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: "0.75rem" }} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Price"]} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Holdings */}
            {selected.holding && (
              <div style={{ background: "#0f172a", borderRadius: 12, padding: "1rem", border: "1px solid #334155" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.625rem", fontWeight: 600 }}>YOUR POSITION</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#94a3b8" }}>Shares</span><span style={{ fontWeight: 700 }}>{selected.holding.shares}</span>
                  <span style={{ color: "#94a3b8" }}>Avg Cost</span><span>${selected.holding.avgCost.toFixed(2)}</span>
                  <span style={{ color: "#94a3b8" }}>Current Value</span><span style={{ color: "#38bdf8", fontWeight: 700 }}>${selected.holding.value.toFixed(2)}</span>
                  <span style={{ color: "#94a3b8" }}>Gain/Loss</span><span style={{ color: selected.holding.gain >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>{selected.holding.gain >= 0 ? "+" : ""}${selected.holding.gain.toFixed(2)} ({selected.holding.gainPercent >= 0 ? "+" : ""}{selected.holding.gainPercent.toFixed(2)}%)</span>
                </div>
              </div>
            )}

            {/* Trade */}
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.625rem", fontWeight: 600 }}>TRADE</div>
              <div style={{ marginBottom: "0.625rem" }}>
                <label style={{ fontSize: "0.8125rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Shares</label>
                <input type="number" min={1} max={100} value={shares} onChange={e => setShares(Math.max(1, Number(e.target.value)))} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#f8fafc", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.875rem" }}>
                Cost: <span style={{ color: "#38bdf8", fontWeight: 700 }}>${(selected.price * shares).toFixed(2)}</span>
                {" "}· Cash: <span style={{ color: "#4ade80" }}>${portfolio?.cash?.toFixed(2)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button onClick={() => trade("buy")} disabled={trading || (portfolio?.cash ?? 0) < selected.price * shares} style={{ background: trading ? "#334155" : "#22c55e", color: "white", border: "none", borderRadius: 8, padding: "0.75rem", fontWeight: 700, cursor: trading ? "not-allowed" : "pointer" }}>
                  Buy
                </button>
                <button onClick={() => trade("sell")} disabled={trading || !selected.holding || selected.holding.shares < shares} style={{ background: trading || !selected.holding ? "#334155" : "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "0.75rem", fontWeight: 700, cursor: trading || !selected.holding ? "not-allowed" : "pointer" }}>
                  Sell
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
