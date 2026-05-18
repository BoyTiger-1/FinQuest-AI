"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "⊞", label: "Overview", exact: true },
  { href: "/dashboard/learn", icon: "◎", label: "Learn", exact: false },
  { href: "/dashboard/simulate/personal", icon: "$", label: "Personal Finance", exact: false },
  { href: "/dashboard/simulate/business", icon: "≡", label: "Business Sim", exact: false },
  { href: "/dashboard/simulate/stocks", icon: "∿", label: "Stocks", exact: false },
  { href: "/dashboard/analyze", icon: "⊙", label: "AI Analysis", exact: false },
  { href: "/dashboard/tutor", icon: "✦", label: "AI Tutor", exact: false },
];

interface UserData {
  name: string;
  xp: number;
  level: number;
  streak: number;
  virtualCash: number;
  nextLevel: { current: number; needed: number; progress: number };
  onboarded: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then(d => {
        if (!d) return;
        setUser(d);
        if (!d.onboarded) { router.push("/onboarding"); return; }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
  }, [router]);

  const isActive = (href: string, exact: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        style={{
          width: 210,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 30,
        }}
        className={mobileOpen ? "sidebar-mobile-open" : ""}
      >
        {/* Logo */}
        <div style={{ padding: "1.125rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: 30, height: 30,
              background: "var(--primary)",
              borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.75rem", color: "#fff",
              letterSpacing: "-0.5px", flexShrink: 0,
            }}>FQ</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)", lineHeight: 1.2 }}>FinQuest</div>
              <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em" }}>AI Platform</div>
            </div>
          </Link>
        </div>

        {/* User card */}
        {user && (
          <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
              <div style={{
                width: 32, height: 32,
                background: "var(--primary-dim)",
                border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.8125rem", color: "var(--primary)",
                flexShrink: 0,
              }} aria-hidden>
                {user.name[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden", minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{user.name}</div>
                <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", fontWeight: 500 }}>Level {user.level} · {user.streak}d streak</div>
              </div>
            </div>
            <div
              style={{ height: 4, background: "var(--surface-3)", borderRadius: 99 }}
              role="progressbar"
              aria-valuenow={user.nextLevel?.progress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="XP progress"
            >
              <div style={{ height: "100%", width: `${user.nextLevel?.progress ?? 0}%`, background: "var(--primary)", borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5625rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              <span>{user.xp.toLocaleString()} XP</span>
              <span>Lv {user.level + 1}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.625rem 0.625rem", display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ fontSize: "0.5625rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0.375rem 0.5rem 0.5rem" }}>Menu</div>
          {NAV.map(item => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.625rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-2)",
                  background: active ? "var(--primary-dim)" : "transparent",
                  borderRadius: "5px",
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{
                  width: 20, textAlign: "center", flexShrink: 0,
                  fontSize: "0.75rem",
                  color: active ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 600,
                }}>
                  {item.icon}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "0.75rem 0.875rem", borderTop: "1px solid var(--border)" }}>
          {user && (
            <div style={{ marginBottom: "0.625rem", padding: "0.625rem 0.75rem", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "5px" }}>
              <div style={{ fontSize: "0.5625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.125rem" }}>Virtual Cash</div>
              <div style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.875rem" }}>
                ${user.virtualCash.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "0.4375rem 0.625rem",
              cursor: "pointer",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontFamily: "inherit",
              borderRadius: "5px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--red)";
              (e.currentTarget as HTMLElement).style.color = "var(--red)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>↩</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main id="main-content" style={{ flex: 1, overflow: "auto", minHeight: "100vh" }}>
        {/* Mobile topbar */}
        <div
          className="mobile-topbar"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.875rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--surface)",
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text)", padding: "0.375rem 0.625rem", cursor: "pointer", fontSize: "1rem", fontFamily: "inherit", borderRadius: "5px" }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.06em" }}>FinQuest AI</span>
          <div style={{ width: 36 }} />
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { position: fixed !important; left: -210px; transition: left 0.25s; }
          .sidebar-mobile-open { left: 0 !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
