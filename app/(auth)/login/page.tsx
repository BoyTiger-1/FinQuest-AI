"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, form.email, form.password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/dashboard");
    } catch (err: any) {
      const msg: string = err.message ?? "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Try again later.");
      } else {
        setError(msg || "Sign-in failed.");
      }
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      {/* Grid background */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(79,110,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,245,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(79,110,245,0.4), transparent)", zIndex: 1 }} />

      {/* Left decorative panel */}
      <div className="auth-panel-left" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem", position: "relative", zIndex: 1 }} aria-hidden="true">
        <div style={{ maxWidth: 420 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.625rem", marginBottom: "4rem" }}>
            <div style={{ width: 36, height: 36, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.875rem", color: "#fff" }}>FQ</div>
            <span style={{ fontWeight: 800, fontSize: "0.9375rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)" }}>FinQuest AI</span>
          </Link>

          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>PLATFORM OVERVIEW</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 900, lineHeight: 1.1, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
              Master money.<br />
              <span style={{ color: "var(--accent)" }}>Beat the system.</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
            {[
              { label: "Adaptive Learning", val: "SM-2 Algorithm", color: "var(--primary)" },
              { label: "Market Simulation", val: "Real-time GBM Pricing", color: "var(--accent)" },
              { label: "AI Tutor", val: "Gemini 2.5 Flash", color: "var(--green)" },
              { label: "Business Simulator", val: "Full P&L Engine", color: "var(--amber)" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 3, height: 32, background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "2.5rem" }}>
            {[{ n: "12K+", l: "Learners" }, { n: "98%", l: "Satisfaction" }, { n: "4.9★", l: "Rating" }].map(({ n, l }) => (
              <div key={l}>
                <div style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>{n}</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: "min(480px, 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem", position: "relative", zIndex: 1, borderLeft: "1px solid var(--border)" }}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.4s, transform 0.4s" }}>

          {/* Back button */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none", color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "2.5rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
          >
            <span style={{ fontSize: "1rem" }}>←</span> Back to home
          </Link>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>SECURE ACCESS</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>Welcome back</h1>
            <p style={{ color: "var(--text-2)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>Sign in to continue your journey.</p>
          </div>

          {error && (
            <div role="alert" style={{ background: "rgba(255,68,102,0.06)", border: "1px solid rgba(255,68,102,0.2)", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }} noValidate>
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>Email Address</label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="input-sharp"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                style={{ width: "100%", boxSizing: "border-box", borderColor: focused === "email" ? "var(--primary)" : undefined }}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>Password</label>
              <input
                id="login-password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input-sharp"
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                style={{ width: "100%", boxSizing: "border-box", borderColor: focused === "password" ? "var(--primary)" : undefined }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem", marginTop: "0.25rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: "1.75rem", paddingTop: "1.75rem", borderTop: "1px solid var(--border)" }}>
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-2)" }}>
              No account?{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
                Create one free →
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.12)", padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Powered by Firebase</span>
            Your credentials are secured by Google Firebase Authentication.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel-left { display: none !important; } }
      `}</style>
    </div>
  );
}
