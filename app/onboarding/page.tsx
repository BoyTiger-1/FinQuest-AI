"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GOALS = [
  { id: "emergency_fund", label: "Build an Emergency Fund", icon: "🛡️", desc: "Create a safety net for unexpected costs" },
  { id: "debt_payoff",    label: "Pay Off Debt",            icon: "🔓", desc: "Tackle credit cards, loans, and more" },
  { id: "investing",      label: "Start Investing",         icon: "📈", desc: "Put your money to work for you" },
  { id: "stocks",         label: "Learn Stock Trading",     icon: "💹", desc: "Understand markets and build a portfolio" },
  { id: "budgeting",      label: "Master Budgeting",        icon: "📊", desc: "Take control of every dollar" },
  { id: "business",       label: "Business Finance",        icon: "🏢", desc: "Understand P&L, cash flow, and more" },
  { id: "credit",         label: "Improve Credit Score",    icon: "💳", desc: "Boost your score and access better rates" },
  { id: "taxes",          label: "Navigate Taxes",          icon: "📋", desc: "Minimize what you owe, legally" },
  { id: "retirement",     label: "Plan for Retirement",     icon: "🎯", desc: "Build long-term wealth and security" },
];

const EXP_LEVELS = [
  { id: "beginner",     label: "Just getting started",  desc: "I'm new to personal finance",          icon: "🌱" },
  { id: "basic",        label: "Know the basics",        desc: "I budget and save, but want to do more", icon: "📚" },
  { id: "intermediate", label: "Getting serious",        desc: "I invest and track my finances",        icon: "📈" },
  { id: "advanced",     label: "Advanced investor",      desc: "I understand complex financial topics",  icon: "🎓" },
];

interface FinanceData {
  income: string; rent: string; food: string; transport: string;
  utilities: string; insurance: string; other: string;
  savings: string; investments: string; debt: string; creditScore: string;
}

const EMPTY: FinanceData = {
  income: "", rent: "", food: "", transport: "", utilities: "",
  insurance: "", other: "", savings: "", investments: "", debt: "", creditScore: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [finance, setFinance] = useState<FinanceData>(EMPTY);
  const [virtualCash, setVirtualCash] = useState("10000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("there");

  const TOTAL_STEPS = 5;

  useEffect(() => {
    fetch("/api/auth/me").then(r => {
      if (r.status === 401) { router.replace("/login"); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      if (d.onboarded) { router.replace("/dashboard"); return; }
      setUserName(d.name?.split(" ")[0] || "there");
    });
  }, [router]);

  function toggleGoal(id: string) {
    setGoals(g => g.includes(id) ? g.filter(x => x !== id) : g.length >= 5 ? g : [...g, id]);
  }

  const num = (key: keyof FinanceData) => parseFloat(finance[key]) || 0;
  const totalExpenses = num("rent") + num("food") + num("transport") + num("utilities") + num("insurance") + num("other");
  const surplus = num("income") - totalExpenses;

  async function complete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals, experience,
          finance: {
            income:      num("income"),
            rent:        num("rent"),
            food:        num("food"),
            transport:   num("transport"),
            utilities:   num("utilities"),
            insurance:   num("insurance"),
            other:       num("other"),
            savings:     num("savings"),
            investments: num("investments"),
            debt:        num("debt"),
            creditScore: parseInt(finance.creditScore) || 0,
          },
          virtualCash: parseFloat(virtualCash) || 10000,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Setup failed"); }
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  const canProceed = [true, goals.length >= 1, !!experience, num("income") > 0, true][step - 1];
  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepLabels = ["Welcome", "Your Goals", "Your Level", "Your Finances", "Review"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", padding: "0 2rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "var(--surface)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: "var(--primary)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8125rem", color: "#fff" }}>FQ</div>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text)" }}>FinQuest AI</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{stepLabels[step - 1]}</span>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "inherit" }}
          >
            Skip for now →
          </button>
        </div>
      </header>

      {/* Step progress */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 2rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0.75rem 0", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < stepLabels.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i < step ? "var(--primary)" : i === step - 1 ? "var(--primary)" : "var(--surface-3)",
                  border: i === step - 1 ? "2px solid var(--primary)" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6875rem", fontWeight: 700, color: i < step ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "0.75rem", color: i + 1 <= step ? "var(--text-2)" : "var(--text-muted)", display: "none", whiteSpace: "nowrap" }}
                  className="step-label"
                >{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i + 1 < step ? "var(--primary)" : "var(--surface-3)", borderRadius: 99, transition: "background 0.4s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "3rem 2rem 2rem" }}>
        <div style={{ width: "100%", maxWidth: 600 }} className="onboard-step" key={step}>

          {/* ── Step 1: Welcome ─────────────────────────────── */}
          {step === 1 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem", lineHeight: 1 }}>👋</div>
              <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
                Welcome, <span className="gradient-text">{userName}</span>!
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 440, margin: "0 auto 2.5rem" }}>
                We'll personalize your experience in about 3 minutes. Answer a few quick questions and we'll build a financial education plan just for you.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "var(--border)", borderRadius: "8px", overflow: "hidden", marginBottom: "2.5rem" }}>
                {[
                  { val: "3 min", desc: "To set up" },
                  { val: "100%", desc: "Private & secure" },
                  { val: "Free", desc: "No credit card" },
                ].map(({ val, desc }, i) => (
                  <div key={i} style={{ background: "var(--surface-2)", padding: "1.25rem 1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>{val}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="btn-primary" style={{ fontSize: "1rem", padding: "0.875rem 2.25rem" }}>
                Get Started →
              </button>

              <p style={{ marginTop: "1.25rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Already know what you want?{" "}
                <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}>
                  Skip to dashboard
                </button>
              </p>
            </div>
          )}

          {/* ── Step 2: Goals ──────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                What do you want to achieve?
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: "1.75rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Pick up to 5 goals. We'll customize your lessons and tools around what matters most to you.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }} role="group" aria-label="Financial goals">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`goal-chip ${goals.includes(g.id) ? "goal-chip-active" : ""}`}
                    aria-pressed={goals.includes(g.id)}
                    style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem" }}
                  >
                    <span style={{ fontSize: "1.25rem", flexShrink: 0 }} aria-hidden>{g.icon}</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.125rem" }}>{g.label}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{g.desc}</div>
                    </div>
                    {goals.includes(g.id) && (
                      <div style={{ width: 20, height: 20, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {goals.length === 0 ? "Select at least one goal to continue" : `${goals.length} of 5 goals selected`}
              </div>
            </div>
          )}

          {/* ── Step 3: Experience ─────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                Where are you starting from?
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: "1.75rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                No wrong answers here. This helps us pitch lessons at the right level — not too basic, not overwhelming.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} role="radiogroup" aria-label="Experience level">
                {EXP_LEVELS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setExperience(e.id)}
                    className={`exp-card ${experience === e.id ? "exp-card-active" : ""}`}
                    role="radio"
                    aria-checked={experience === e.id}
                    style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                  >
                    <span style={{ fontSize: "1.625rem", flexShrink: 0 }} aria-hidden>{e.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.2rem" }}>{e.label}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.desc}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${experience === e.id ? "var(--primary)" : "var(--border-2)"}`,
                      background: experience === e.id ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {experience === e.id && <div style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%" }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Finances ───────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                Your financial picture
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: "0.75rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Enter your actual numbers to power your personal finance simulator. This stays 100% private.
              </p>
              <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "var(--radius)", padding: "0.75rem 1rem", marginBottom: "1.75rem", fontSize: "0.8125rem", color: "var(--text-2)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span>🔒</span>
                <span>Your data is stored securely, used only for your simulation, and never shared.</span>
              </div>

              {/* Income */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>Monthly Income</div>
                <div className="auth-input-group">
                  <label htmlFor="income">Take-home pay after tax *</label>
                  <div className="input-currency">
                    <input id="income" type="number" min="0" step="100" placeholder="3,500" required value={finance.income}
                      onChange={e => setFinance(f => ({ ...f, income: e.target.value }))} className="input-sharp" />
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>Monthly Expenses</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { id: "rent",      label: "Rent / Mortgage", ph: "1,200" },
                    { id: "food",      label: "Food & Groceries", ph: "400" },
                    { id: "transport", label: "Transportation",   ph: "200" },
                    { id: "utilities", label: "Utilities",        ph: "150" },
                    { id: "insurance", label: "Insurance",        ph: "100" },
                    { id: "other",     label: "Other Expenses",   ph: "200" },
                  ].map(({ id, label, ph }) => (
                    <div key={id} className="auth-input-group">
                      <label htmlFor={id}>{label}</label>
                      <div className="input-currency">
                        <input id={id} type="number" min="0" step="10" placeholder={ph}
                          value={finance[id as keyof FinanceData]}
                          onChange={e => setFinance(f => ({ ...f, [id]: e.target.value }))} className="input-sharp" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live budget summary */}
                {num("income") > 0 && (
                  <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                      <span style={{ color: "var(--text-2)" }}>Monthly income</span>
                      <span style={{ fontWeight: 600, color: "var(--green)" }}>+${num("income").toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.625rem" }}>
                      <span style={{ color: "var(--text-2)" }}>Total expenses</span>
                      <span style={{ fontWeight: 600, color: "var(--red)" }}>-${totalExpenses.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 1, background: "var(--border)", marginBottom: "0.625rem" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.9375rem" }}>
                      <span>Monthly {surplus >= 0 ? "surplus" : "deficit"}</span>
                      <span style={{ color: surplus >= 0 ? "var(--green)" : "var(--red)" }}>
                        {surplus >= 0 ? "+" : ""}{surplus < 0 ? "-" : ""}${Math.abs(surplus).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Assets & debts */}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>Assets & Liabilities (optional)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.75rem" }}>
                  {[
                    { id: "savings",     label: "Savings Account", ph: "5,000" },
                    { id: "investments", label: "Investments",      ph: "0" },
                    { id: "debt",        label: "Total Debt",       ph: "10,000" },
                    { id: "creditScore", label: "Credit Score",     ph: "680" },
                  ].map(({ id, label, ph }) => (
                    <div key={id} className="auth-input-group">
                      <label htmlFor={id}>{label}</label>
                      <div className={id !== "creditScore" ? "input-currency" : ""}>
                        <input id={id} type="number" min="0" placeholder={ph}
                          value={finance[id as keyof FinanceData]}
                          onChange={e => setFinance(f => ({ ...f, [id]: e.target.value }))} className="input-sharp" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Review & launch ─────────────────────── */}
          {step === 5 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1.25rem", lineHeight: 1 }}>🚀</div>
              <h2 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                Almost there!
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: "2rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Choose your starting virtual cash for the stock trading simulator. You can change this anytime.
              </p>

              <div style={{ textAlign: "left", maxWidth: 340, margin: "0 auto 1.75rem" }}>
                <div className="auth-input-group" style={{ marginBottom: "0.75rem" }}>
                  <label htmlFor="vcash">Starting Virtual Cash</label>
                  <div className="input-currency">
                    <input id="vcash" type="number" min="1000" max="1000000" step="1000" value={virtualCash}
                      onChange={e => setVirtualCash(e.target.value)} className="input-sharp" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["5000", "10000", "25000", "50000"].map(v => (
                    <button
                      key={v}
                      onClick={() => setVirtualCash(v)}
                      style={{
                        padding: "0.375rem 0.875rem",
                        background: virtualCash === v ? "var(--primary-dim)" : "var(--surface-2)",
                        border: `1px solid ${virtualCash === v ? "var(--primary)" : "var(--border-2)"}`,
                        color: virtualCash === v ? "var(--text)" : "var(--text-muted)",
                        fontSize: "0.8125rem", fontWeight: 500,
                        cursor: "pointer", borderRadius: "var(--radius)",
                        transition: "all 0.12s",
                        fontFamily: "inherit",
                      }}
                    >
                      ${parseInt(v).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", textAlign: "left", marginBottom: "1.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Your setup summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {[
                    { l: "Goals selected", v: `${goals.length} goal${goals.length !== 1 ? "s" : ""}` },
                    { l: "Experience level", v: EXP_LEVELS.find(e => e.id === experience)?.label || "—" },
                    { l: "Monthly income", v: num("income") > 0 ? `$${num("income").toLocaleString()}` : "—" },
                    { l: "Monthly surplus", v: num("income") > 0 ? `${surplus >= 0 ? "+" : ""}$${Math.abs(surplus).toLocaleString()}` : "—" },
                    { l: "Virtual cash", v: `$${parseFloat(virtualCash || "10000").toLocaleString()}` },
                  ].map(({ l, v }, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", alignItems: "center" }}>
                      <span style={{ color: "var(--text-2)" }}>{l}</span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius)", padding: "0.75rem 1rem", color: "var(--red)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              <button
                onClick={complete}
                disabled={loading}
                className="btn-primary"
                style={{ fontSize: "1rem", padding: "0.875rem 2.25rem", width: "100%", justifyContent: "center", opacity: loading ? 0.75 : 1 }}
              >
                {loading ? "Setting up your account…" : "Launch My Dashboard →"}
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ fontSize: "0.9375rem" }}>
                ← Back
              </button>
              {step < TOTAL_STEPS && (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed}
                  className="btn-primary"
                  style={{ fontSize: "0.9375rem", padding: "0.625rem 1.5rem", opacity: canProceed ? 1 : 0.4, cursor: canProceed ? "pointer" : "not-allowed" }}
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media (min-width: 640px) {
          .step-label { display: inline !important; }
        }
      `}</style>
    </div>
  );
}
