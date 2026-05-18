"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface UserData {
  name: string;
  xp: number;
  level: number;
  streak: number;
  virtualCash: number;
  badges: { id: string; name: string; icon: string; rarity: string }[];
  completedLessons: number;
  nextLevel: { current: number; needed: number; progress: number };
}

interface Module {
  id: string;
  title: string;
  icon: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  category: string;
  difficulty: string;
}

interface FinanceState {
  cash: number;
  income: number;
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  insurance: number;
  other: number;
  savings: number;
  investments: number;
  debt: number;
  creditScore: number;
  month: number;
  setupComplete: boolean;
  history: { month: number; cash: number; investments: number; debt: number; creditScore: number }[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser: boolean;
}

const RARITY_COLOR: Record<string, string> = {
  common: "var(--text-muted)",
  rare: "var(--primary)",
  epic: "#a855f7",
  legendary: "var(--amber)",
};

const PIE_COLORS = ["var(--primary)", "var(--accent)", "var(--amber)", "var(--red)", "#a855f7", "var(--green)"];

function StatCard({ label, value, sub, color, prefix = "" }: { label: string; value: string | number; sub?: string; color: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color }} />
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.625rem", fontWeight: 900, color, letterSpacing: "-0.02em" }}>{prefix}{typeof value === "number" ? value.toLocaleString() : value}</div>
      {sub && <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

const customTooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: "0.75rem",
  color: "var(--text)",
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [finance, setFinance] = useState<FinanceState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/learn/modules").then(r => r.json()),
      fetch("/api/simulate/personal").then(r => r.json()),
      fetch("/api/leaderboard").then(r => r.json()),
    ]).then(([u, m, f, lb]) => {
      setUser(u);
      setModules(Array.isArray(m) ? m : []);
      setFinance(f.error ? null : f);
      setLeaderboard(Array.isArray(lb) ? lb.slice(0, 5) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} aria-hidden />
        <div style={{ color: "var(--text-2)", fontSize: "0.8125rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Loading dashboard...</div>
      </div>
    );
  }

  // --- Derived data ---
  const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
  const completedLessons = modules.reduce((s, m) => s + m.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Net worth history chart data
  const netWorthData = finance?.history?.map(h => ({
    month: `M${h.month}`,
    cash: h.cash,
    investments: h.investments,
    netWorth: h.cash + h.investments - h.debt,
    debt: h.debt,
  })) ?? [];

  // Current month as first point if no history
  if (netWorthData.length === 0 && finance) {
    netWorthData.push({ month: "Now", cash: finance.cash, investments: finance.investments, netWorth: finance.cash + finance.investments - finance.debt, debt: finance.debt });
  }

  // Expense breakdown for pie chart
  const expenseData = finance ? [
    { name: "Rent", value: finance.rent },
    { name: "Food", value: finance.food },
    { name: "Transport", value: finance.transport },
    { name: "Utilities", value: finance.utilities },
    { name: "Insurance", value: finance.insurance },
    { name: "Other", value: finance.other },
  ].filter(d => d.value > 0) : [];

  // Financial health radar
  const totalExpenses = finance ? finance.rent + finance.food + finance.transport + finance.utilities + finance.insurance + finance.other : 0;
  const savingsRate = finance && finance.income > 0 ? Math.max(0, (finance.income - totalExpenses) / finance.income) : 0;
  const debtToIncome = finance && finance.income > 0 ? Math.max(0, 1 - finance.debt / (finance.income * 12)) : 1;
  const creditHealth = finance ? (finance.creditScore - 300) / (850 - 300) : 0;
  const investmentHealth = finance && finance.income > 0 ? Math.min(1, finance.investments / (finance.income * 6)) : 0;

  const radarData = [
    { metric: "Savings", value: Math.round(savingsRate * 100) },
    { metric: "Debt", value: Math.round(debtToIncome * 100) },
    { metric: "Credit", value: Math.round(creditHealth * 100) },
    { metric: "Investing", value: Math.round(investmentHealth * 100) },
    { metric: "Learning", value: overallProgress },
  ];

  // XP level chart (last 5 levels worth of progress)
  const xpBarData = modules.slice(0, 7).map(m => ({
    name: m.title.length > 10 ? m.title.slice(0, 10) + "…" : m.title,
    progress: m.progress,
    completed: m.completedLessons,
    total: m.totalLessons,
  }));

  const netWorth = finance ? finance.cash + finance.savings + finance.investments - finance.debt : 0;
  const monthlyNet = finance ? finance.income - totalExpenses : 0;

  return (
    <div style={{ padding: "2rem", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.375rem" }}>DASHBOARD</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
            {user?.name?.split(" ")[0]}&apos;s Command Center
          </h1>
          <p style={{ color: "var(--text-2)", margin: 0, fontSize: "0.9375rem" }}>
            Level {user?.level} · {user?.xp?.toLocaleString()} XP · {user?.streak} day streak
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/dashboard/learn" className="btn-primary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", textDecoration: "none" }}>Continue Learning →</Link>
          <Link href="/dashboard/analyze" className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", textDecoration: "none" }}>AI Analysis</Link>
        </div>
      </div>

      {/* Top stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }} role="region" aria-label="Key metrics">
        <StatCard label="Net Worth" value={Math.abs(netWorth)} prefix={netWorth < 0 ? "-$" : "$"} color={netWorth >= 0 ? "var(--green)" : "var(--red)"} sub={`${monthlyNet >= 0 ? "+" : ""}$${monthlyNet.toLocaleString()}/mo surplus`} />
        <StatCard label="Total XP" value={user?.xp ?? 0} color="var(--primary)" sub={`Level ${user?.level} · ${user?.nextLevel?.progress ?? 0}% to next`} />
        <StatCard label="Learning" value={`${overallProgress}%`} color="var(--accent)" sub={`${completedLessons}/${totalLessons} lessons complete`} />
        <StatCard label="Virtual Cash" value={(user?.virtualCash ?? 0).toFixed(2)} prefix="$" color="var(--amber)" sub={`Available for trading`} />
      </div>

      {/* Second stats row */}
      {finance && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="Monthly Income" value={finance.income} prefix="$" color="var(--green)" />
          <StatCard label="Monthly Expenses" value={totalExpenses} prefix="$" color="var(--red)" />
          <StatCard label="Credit Score" value={finance.creditScore} color={finance.creditScore >= 750 ? "var(--green)" : finance.creditScore >= 650 ? "var(--amber)" : "var(--red)"} sub={finance.creditScore >= 750 ? "Excellent" : finance.creditScore >= 650 ? "Good" : "Needs work"} />
          <StatCard label="Savings Rate" value={`${Math.round(savingsRate * 100)}%`} color={savingsRate >= 0.2 ? "var(--green)" : savingsRate >= 0.1 ? "var(--amber)" : "var(--red)"} sub={savingsRate >= 0.2 ? "On track" : "Improve savings"} />
        </div>
      )}

      {/* Charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Net worth over time */}
        <ChartCard
          title="Net Worth History"
          action={<Link href="/dashboard/simulate/personal" style={{ fontSize: "0.6875rem", color: "var(--primary)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Simulate →</Link>}
        >
          {netWorthData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={netWorthData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6ef5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f6ef5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4a5280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#4a5280" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={48} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                <Area type="monotone" dataKey="netWorth" stroke="#4f6ef5" strokeWidth={2} fill="url(#gwGrad)" name="Net Worth" dot={false} />
                <Area type="monotone" dataKey="investments" stroke="#00e676" strokeWidth={1.5} fill="url(#invGrad)" name="Investments" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "0.875rem" }}>No history yet</div>
              <Link href="/dashboard/simulate/personal" style={{ color: "var(--primary)", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 700 }}>Start simulating →</Link>
            </div>
          )}
        </ChartCard>

        {/* Expense breakdown pie */}
        <ChartCard
          title="Expense Breakdown"
          action={<Link href="/dashboard/simulate/personal" style={{ fontSize: "0.6875rem", color: "var(--primary)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Edit →</Link>}
        >
          {expenseData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {expenseData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                    <div style={{ width: 10, height: 10, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, color: "var(--text-2)" }}>{d.name}</div>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>${d.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Complete onboarding to see expenses
            </div>
          )}
        </ChartCard>

        {/* Financial health radar */}
        <ChartCard title="Financial Health Score">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#4a5280", fontWeight: 700 }} />
              <Radar name="Health" dataKey="value" stroke="#4f6ef5" fill="#4f6ef5" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: "#4f6ef5" }} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: any) => [`${v}%`, "Score"]} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Module progress bar chart */}
        <ChartCard
          title="Module Progress"
          action={<Link href="/dashboard/learn" style={{ fontSize: "0.6875rem", color: "var(--primary)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>View Map →</Link>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={xpBarData} margin={{ top: 4, right: 0, bottom: 20, left: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#4a5280" }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={48} />
              <YAxis tick={{ fontSize: 9, fill: "#4a5280" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} width={36} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: any) => [`${v}%`, "Progress"]} />
              <Bar dataKey="progress" fill="#4f6ef5" radius={0}>
                {xpBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.progress === 100 ? "#00e676" : entry.progress > 0 ? "#4f6ef5" : "#1e2040"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
        {/* Quick actions */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1rem" }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { href: "/dashboard/learn", label: "Learning Map", icon: "◈", color: "var(--primary)" },
              { href: "/dashboard/simulate/stocks", label: "Trade Stocks", icon: "▲", color: "var(--green)" },
              { href: "/dashboard/simulate/business", label: "Run Business", icon: "◆", color: "var(--amber)" },
              { href: "/dashboard/tutor", label: "AI Tutor", icon: "◉", color: "var(--accent)" },
              { href: "/dashboard/analyze", label: "AI Analysis", icon: "◎", color: "#a855f7" },
            ].map(({ href, label, icon, color }) => (
              <Link key={href} href={href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
              >
                <span style={{ color, fontSize: "0.75rem", flexShrink: 0 }}>{icon}</span>
                {label}
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.75rem" }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1rem" }}>Leaderboard</div>
          {leaderboard.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "1rem 0" }}>No entries yet. Start learning to claim the top spot.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {leaderboard.map((entry, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem", background: entry.isCurrentUser ? "rgba(79,110,245,0.06)" : "transparent", border: entry.isCurrentUser ? "1px solid rgba(79,110,245,0.2)" : "1px solid transparent" }}>
                  <div style={{ width: 24, height: 24, background: i === 0 ? "var(--amber)" : i === 1 ? "#8892c0" : i === 2 ? "#cd7c32" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.6875rem", color: i < 3 ? "#000" : "var(--text-2)", flexShrink: 0 }}>{entry.rank}</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: entry.isCurrentUser ? "var(--primary)" : "var(--text)" }}>{entry.name}</div>
                    <div style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>Lv {entry.level} · {entry.streak}d streak</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--primary)" }}>{entry.xp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "1rem" }}>
            Badges {user?.badges?.length ? `(${user.badges.length})` : ""}
          </div>
          {!user?.badges?.length ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "0.5rem 0" }}>
              Complete lessons and challenges to earn badges.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {user.badges.map((badge, i) => (
                <div key={i} title={badge.name} style={{ background: "var(--bg)", border: `1px solid ${RARITY_COLOR[badge.rarity] ?? "var(--border)"}`, padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
                  <span style={{ fontSize: "1rem" }}>{badge.icon}</span>
                  <span style={{ color: "var(--text-2)", fontSize: "0.6875rem" }}>{badge.name}</span>
                </div>
              ))}
            </div>
          )}
          {/* XP level progress */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Level Progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
              <span>Lv {user?.level}</span>
              <span>Lv {(user?.level ?? 0) + 1}</span>
            </div>
            <div style={{ height: 6, background: "var(--border)" }} role="progressbar" aria-valuenow={user?.nextLevel?.progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Level progress">
              <div style={{ height: "100%", width: `${user?.nextLevel?.progress ?? 0}%`, background: "var(--primary)", transition: "width 0.6s ease" }} />
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {user?.nextLevel?.current?.toLocaleString() ?? 0} / {user?.nextLevel?.needed?.toLocaleString() ?? 0} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
