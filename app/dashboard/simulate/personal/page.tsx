"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from "recharts";

interface FinState {
  cash: number; income: number; rent: number; food: number;
  transport: number; utilities: number; insurance: number; other: number;
  savings: number; investments: number; debt: number; creditScore: number;
  month: number; setupComplete: boolean;
  history: { month: number; cash: number; investments: number; debt: number; creditScore: number }[];
}

const PIE_COLORS = ["#4f6ef5", "#00d4ff", "#ffb020", "#ff4466", "#a855f7", "#00e676"];

function SetupForm({ onDone }: { onDone: (state: FinState) => void }) {
  const [form, setForm] = useState({
    income: "", rent: "", food: "", transport: "", utilities: "",
    insurance: "", other: "", savings: "", investments: "", debt: "", creditScore: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const income = Number(form.income) || 0;
  const totalExpenses = (Number(form.rent) + Number(form.food) + Number(form.transport) + Number(form.utilities) + Number(form.insurance) + Number(form.other)) || 0;
  const surplus = income - totalExpenses;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.income) { setError("Monthly income is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/simulate/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", value: form }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Error"); setSaving(false); return; }
    onDone(data);
  }

  const field = (key: keyof typeof form, label: string, required = false) => (
    <div>
      <label htmlFor={`pf-${key}`} style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.375rem" }}>
        {label}{required && <span style={{ color: "var(--red)" }}> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.875rem", pointerEvents: "none" }}>$</span>
        <input
          id={`pf-${key}`}
          type="number"
          min={0}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder="0"
          required={required}
          className="input-sharp"
          style={{ width: "100%", boxSizing: "border-box", paddingLeft: "1.75rem" }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.5rem" }}>PERSONAL FINANCE</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Setup Your Budget</h1>
        <p style={{ color: "var(--text-2)", margin: 0 }}>Enter your real financial data. No preset values — this is your life, your numbers.</p>
      </div>

      {error && (
        <div role="alert" style={{ background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.25)", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem" }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Income */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--green)", marginBottom: "1rem" }}>Income</div>
          {field("income", "Monthly Take-Home Income", true)}
        </div>

        {/* Expenses */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--red)", marginBottom: "1rem" }}>Monthly Expenses</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {field("rent", "Rent / Mortgage")}
            {field("food", "Food & Groceries")}
            {field("transport", "Transport")}
            {field("utilities", "Utilities")}
            {field("insurance", "Insurance")}
            {field("other", "Other Expenses")}
          </div>
        </div>

        {/* Assets & Liabilities */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>Assets & Liabilities</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {field("savings", "Savings Balance")}
            {field("investments", "Investment Balance")}
            {field("debt", "Total Debt")}
            <div>
              <label htmlFor="pf-creditScore" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.375rem" }}>Credit Score</label>
              <input id="pf-creditScore" type="number" min={300} max={850} value={form.creditScore} onChange={e => setForm(f => ({ ...f, creditScore: e.target.value }))} placeholder="300–850" className="input-sharp" style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
        </div>

        {/* Live budget summary */}
        {income > 0 && (
          <div style={{ background: surplus >= 0 ? "rgba(0,230,118,0.05)" : "rgba(255,68,102,0.05)", border: `1px solid ${surplus >= 0 ? "rgba(0,230,118,0.2)" : "rgba(255,68,102,0.2)"}`, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>Monthly Balance</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: surplus >= 0 ? "var(--green)" : "var(--red)" }}>
                  {surplus >= 0 ? "+" : ""}{surplus < 0 ? "-$" : "$"}{Math.abs(surplus).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Income: <span style={{ color: "var(--green)", fontWeight: 700 }}>${income.toLocaleString()}</span></div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Expenses: <span style={{ color: "var(--red)", fontWeight: 700 }}>${totalExpenses.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem", opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Setting up..." : "Start Simulation →"}
        </button>
      </form>
    </div>
  );
}

function SimulatorView({ state: initialState }: { state: FinState }) {
  const [state, setState] = useState<FinState>(initialState);
  const [advancing, setAdvancing] = useState(false);
  const [event, setEvent] = useState("");
  const [investAmount, setInvestAmount] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  async function doAction(actionType: string, value?: unknown) {
    setAdvancing(true);
    const res = await fetch("/api/simulate/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionType, value }),
    });
    const data = await res.json();
    setState(data);
    setEvent(data.event ?? "");
    setAdvancing(false);
  }

  const totalExpenses = state.rent + state.food + state.transport + state.utilities + (state.insurance ?? 0) + (state.other ?? 0);
  const monthlyNet = state.income - totalExpenses;
  const savingsRate = state.income > 0 ? (monthlyNet / state.income * 100) : 0;
  const netWorth = state.cash + state.savings + state.investments - state.debt;

  const creditColor = state.creditScore >= 750 ? "var(--green)" : state.creditScore >= 650 ? "var(--amber)" : "var(--red)";
  const creditLabel = state.creditScore >= 750 ? "Excellent" : state.creditScore >= 700 ? "Very Good" : state.creditScore >= 650 ? "Good" : state.creditScore >= 580 ? "Fair" : "Poor";

  const chartData = state.history.slice(-18).map(h => ({
    month: `M${h.month}`,
    Cash: Math.max(0, h.cash),
    Investments: Math.max(0, h.investments),
    Debt: Math.max(0, h.debt),
    NetWorth: h.cash + h.investments - h.debt,
  }));

  const pieData = [
    { name: "Rent", value: state.rent },
    { name: "Food", value: state.food },
    { name: "Transport", value: state.transport },
    { name: "Utilities", value: state.utilities },
    { name: "Insurance", value: state.insurance ?? 0 },
    { name: "Other", value: state.other ?? 0 },
  ].filter(d => d.value > 0);

  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 0, fontSize: "0.75rem", color: "var(--text)" };

  return (
    <div style={{ padding: "2rem", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.375rem" }}>MONTH {state.month}</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Personal Finance Sandbox</h1>
          <p style={{ color: "var(--text-2)", margin: 0 }}>Make decisions, advance months, and track your financial growth.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => doAction("advance_month")} disabled={advancing} className="btn-primary" style={{ padding: "0.75rem 1.5rem", opacity: advancing ? 0.6 : 1, cursor: advancing ? "not-allowed" : "pointer" }}>
            {advancing ? "Processing..." : "Advance Month →"}
          </button>
          <button onClick={() => setShowResetConfirm(true)} style={{ background: "transparent", border: "1px solid var(--red)", color: "var(--red)", padding: "0.75rem 1.25rem", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 600 }}>
            Reset
          </button>
        </div>
      </div>

      {/* Reset confirm */}
      {showResetConfirm && (
        <div style={{ background: "rgba(255,68,102,0.06)", border: "1px solid rgba(255,68,102,0.25)", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>This will delete all simulation history. Are you sure?</span>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={() => { doAction("reset"); setShowResetConfirm(false); }} style={{ background: "var(--red)", color: "#fff", border: "none", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Confirm Reset</button>
            <button onClick={() => setShowResetConfirm(false)} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Event notification */}
      {event && (
        <div role="status" aria-live="polite" style={{ background: "rgba(79,110,245,0.06)", border: "1px solid rgba(79,110,245,0.25)", padding: "0.75rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.9375rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>◈</span> {event}
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Cash", value: `$${state.cash.toLocaleString("en", { maximumFractionDigits: 0 })}`, color: "var(--green)" },
          { label: "Net Worth", value: netWorth >= 0 ? `$${netWorth.toLocaleString("en", { maximumFractionDigits: 0 })}` : `-$${Math.abs(netWorth).toLocaleString("en", { maximumFractionDigits: 0 })}`, color: netWorth >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Monthly Net", value: `${monthlyNet >= 0 ? "+" : ""}$${monthlyNet.toLocaleString("en", { maximumFractionDigits: 0 })}`, color: monthlyNet >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Investments", value: `$${state.investments.toLocaleString("en", { maximumFractionDigits: 0 })}`, color: "var(--primary)" },
          { label: "Total Debt", value: `$${state.debt.toLocaleString("en", { maximumFractionDigits: 0 })}`, color: state.debt > 0 ? "var(--red)" : "var(--green)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1rem", position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color }} />
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.375rem" }}>{label}</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 900, color, letterSpacing: "-0.02em" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Budget breakdown */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1.25rem" }}>Monthly Budget</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0.75rem", background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)" }}>
              <span style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Income</span>
              <span style={{ color: "var(--green)", fontWeight: 700 }}>${state.income.toLocaleString()}</span>
            </div>
            {[
              { label: "Rent", val: state.rent },
              { label: "Food", val: state.food },
              { label: "Transport", val: state.transport },
              { label: "Utilities", val: state.utilities },
              ...(state.insurance ? [{ label: "Insurance", val: state.insurance }] : []),
              ...(state.other ? [{ label: "Other", val: state.other }] : []),
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem" }}>
                <span style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>{label}</span>
                <span style={{ color: "var(--red)", fontSize: "0.875rem", fontWeight: 600 }}>-${val.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.625rem", display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span style={{ color: "var(--text)" }}>Monthly Net</span>
              <span style={{ color: monthlyNet >= 0 ? "var(--green)" : "var(--red)" }}>{monthlyNet >= 0 ? "+" : ""}${monthlyNet.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Savings Rate: <span style={{ color: savingsRate >= 20 ? "var(--green)" : savingsRate >= 10 ? "var(--amber)" : "var(--red)", fontWeight: 700 }}>{savingsRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Credit score + actions */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1.25rem" }}>Credit Score & Actions</div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontWeight: 900, color: creditColor, lineHeight: 1 }}>{state.creditScore}</div>
              <div style={{ fontSize: "0.75rem", color: creditColor, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{creditLabel}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: "var(--border)", marginBottom: "0.25rem" }}>
                <div style={{ height: "100%", width: `${((state.creditScore - 300) / 550) * 100}%`, background: creditColor, transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--text-muted)" }}>
                <span>Poor 300</span><span>850 Excellent</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.375rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Invest amount</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.875rem" }}>$</span>
                  <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} placeholder="Amount" min={0} max={state.cash} className="input-sharp" style={{ width: "100%", boxSizing: "border-box", paddingLeft: "1.5rem" }} />
                </div>
                <button onClick={() => { doAction("invest", Number(investAmount)); setInvestAmount(""); }} disabled={!investAmount || Number(investAmount) > state.cash} className="btn-accent" style={{ padding: "0 1rem", whiteSpace: "nowrap", opacity: !investAmount || Number(investAmount) > state.cash ? 0.5 : 1, cursor: !investAmount || Number(investAmount) > state.cash ? "not-allowed" : "pointer" }}>
                  Invest →
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.375rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pay debt</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.875rem" }}>$</span>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Amount" min={0} max={Math.min(state.debt, state.cash)} className="input-sharp" style={{ width: "100%", boxSizing: "border-box", paddingLeft: "1.5rem" }} disabled={state.debt === 0} />
                </div>
                <button onClick={() => { doAction("pay_debt", Number(payAmount)); setPayAmount(""); }} disabled={state.debt === 0 || !payAmount} className="btn-primary" style={{ padding: "0 1rem", whiteSpace: "nowrap", opacity: state.debt === 0 || !payAmount ? 0.5 : 1, cursor: state.debt === 0 || !payAmount ? "not-allowed" : "pointer" }}>
                  Pay →
                </button>
              </div>
              {state.debt === 0 && <div style={{ fontSize: "0.6875rem", color: "var(--green)", marginTop: "0.25rem", fontWeight: 700 }}>Debt free!</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* History area chart */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)" }}>Financial History</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Last 18 months</div>
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="cashG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="invG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6ef5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f6ef5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debtG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4466" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ff4466" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4a5280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#4a5280" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={48} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                <Area type="monotone" dataKey="Cash" stroke="#00e676" strokeWidth={2} fill="url(#cashG)" dot={false} />
                <Area type="monotone" dataKey="Investments" stroke="#4f6ef5" strokeWidth={2} fill="url(#invG)" dot={false} />
                <Area type="monotone" dataKey="Debt" stroke="#ff4466" strokeWidth={1.5} fill="url(#debtG)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
              <div>No history yet</div>
              <div style={{ fontSize: "0.8125rem" }}>Advance a month to start tracking</div>
            </div>
          )}
        </div>

        {/* Expense pie */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1.25rem" }}>Expense Split</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={64} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.5rem" }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem" }}>
                    <div style={{ width: 8, height: 8, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: "var(--text-2)" }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>${d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No expenses set</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PersonalFinancePage() {
  const [state, setState] = useState<FinState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulate/personal").then(r => r.json()).then(d => {
      setState(d.error ? null : d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} aria-hidden />
        <div style={{ color: "var(--text-2)", fontSize: "0.8125rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading simulator...</div>
      </div>
    );
  }

  if (!state || !state.setupComplete) {
    return <SetupForm onDone={d => setState(d)} />;
  }

  return <SimulatorView state={state} />;
}
