"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const PERKS = [
  { icon: "◈", text: "Adaptive lessons with XP & streaks" },
  { icon: "◉", text: "3 financial simulators (stocks, business, personal)" },
  { icon: "◆", text: "Gemini AI tutor — always available" },
  { icon: "◇", text: "Duolingo-style visual learning map" },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const colors = ["", "var(--red)", "var(--amber)", "var(--amber)", "var(--green)"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.25rem" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, background: i <= score ? colors[score] : "var(--border)", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize: "0.625rem", color: colors[score], fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{labels[score]}</div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    nameRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      router.push("/onboarding");
    } catch (err: any) {
      const msg: string = err.message ?? "";
      if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg || "Registration failed.");
      }
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(79,110,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,245,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Left form panel */}
      <div style={{ width: "min(520px, 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2.5rem", position: "relative", zIndex: 1, borderRight: "1px solid var(--border)" }}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.4s, transform 0.4s" }}>

          {/* Back button */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none", color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "2rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
          >
            <span style={{ fontSize: "1rem" }}>←</span> Back to home
          </Link>

          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>FREE ACCOUNT</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>Start your quest</h1>
            <p style={{ color: "var(--text-2)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>No credit card. No limits. Just learning.</p>
          </div>

          {error && (
            <div role="alert" style={{ background: "rgba(255,68,102,0.06)", border: "1px solid rgba(255,68,102,0.2)", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }} noValidate>
            <div>
              <label htmlFor="reg-name" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>Full Name</label>
              <input id="reg-name" ref={nameRef} type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Johnson" required autoComplete="name" className="input-sharp" onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={{ width: "100%", boxSizing: "border-box", borderColor: focused === "name" ? "var(--primary)" : undefined }} />
            </div>
            <div>
              <label htmlFor="reg-email" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>Email Address</label>
              <input id="reg-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required autoComplete="email" className="input-sharp" onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} style={{ width: "100%", boxSizing: "border-box", borderColor: focused === "email" ? "var(--primary)" : undefined }} />
            </div>
            <div>
              <label htmlFor="reg-password" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>Password</label>
              <input id="reg-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" required autoComplete="new-password" className="input-sharp" onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} style={{ width: "100%", boxSizing: "border-box", borderColor: focused === "password" ? "var(--primary)" : undefined }} />
              <PasswordStrength password={form.password} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem", marginTop: "0.25rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right perks panel */}
      <div className="auth-panel-right" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem", position: "relative", zIndex: 1 }} aria-hidden="true">
        <div style={{ maxWidth: 380 }}>
          <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.75rem" }}>WHAT YOU GET</div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text)", margin: "0 0 2rem", letterSpacing: "-0.02em" }}>
            Everything to master<br /><span style={{ color: "var(--accent)" }}>your finances.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem", marginBottom: "2.5rem" }}>
            {PERKS.map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <div style={{ width: 30, height: 30, background: "rgba(79,110,245,0.08)", border: "1px solid rgba(79,110,245,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "0.75rem", flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ paddingTop: "0.25rem", fontSize: "0.9rem", color: "var(--text-2)", lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.125rem" }}>
            <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.875rem" }}>AFTER SIGNUP</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Set your financial goals", "Tell us your experience level", "Enter your real financial data", "Choose your starting cash", "Start learning — for free"].map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{ width: 20, height: 20, background: i === 0 ? "var(--primary)" : "rgba(79,110,245,0.1)", border: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 900, color: i === 0 ? "#fff" : "var(--primary)", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-2)" }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel-right { display: none !important; } }
      `}</style>
    </div>
  );
}
