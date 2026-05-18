"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Sparkline SVG ──────────────────────────────────────────── */
function Sparkline({ color = "#4f6ef5", points = "0,50 40,42 80,35 120,40 160,28 200,22 240,16 280,20 320,10 360,6 400,4" }: { color?: string; points?: string }) {
  const id = color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,60 ${points} 400,60`} fill={`url(#sg${id})`} />
    </svg>
  );
}

/* ─── Live dashboard mockup ──────────────────────────────────── */
function DashboardMockup() {
  return (
    <div style={{ background: "#07081a", border: "1px solid rgba(80,100,220,0.2)", overflow: "hidden", fontFamily: "inherit" }} aria-hidden="true" role="img" aria-label="FinQuest AI dashboard preview">
      {/* Browser chrome */}
      <div style={{ background: "#0d0e22", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(80,100,220,0.12)" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57","#febc2e","#28c840"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.65 }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", padding: "3px 10px", fontSize: 10, color: "#3a3a60", textAlign: "center" }}>finquestai.com/dashboard</div>
      </div>
      {/* Layout */}
      <div style={{ display: "flex", height: 360 }}>
        {/* Sidebar */}
        <div style={{ width: 130, background: "#05051a", borderRight: "1px solid rgba(80,100,220,0.08)", padding: "12px 8px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 8px", marginBottom: 10, fontSize: 11, fontWeight: 900, background: "linear-gradient(90deg,#818cf8,#00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FINQUEST</div>
          {[{ l:"Dashboard",a:true },{ l:"Learn" },{ l:"Stocks" },{ l:"Business" },{ l:"AI Tutor" }].map((n, i) => (
            <div key={i} style={{ padding: "5px 8px", fontSize: 9.5, color: n.a ? "#818cf8" : "#3a3a60", background: n.a ? "rgba(79,110,245,0.12)" : "transparent", borderLeft: `2px solid ${n.a ? "#4f6ef5" : "transparent"}`, display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <div style={{ width: 5, height: 5, background: n.a ? "#4f6ef5" : "#1e1e40" }} />{n.l}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "8px", background: "rgba(79,110,245,0.08)", border: "1px solid rgba(79,110,245,0.15)" }}>
            <div style={{ fontSize: 7.5, color: "#3a3a60", marginBottom: 2 }}>XP Progress · Lv 7→8</div>
            <div style={{ height: 3, background: "#1a1a40" }}><div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg,#4f6ef5,#00d4ff)" }} /></div>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: 12, overflow: "hidden" }}>
          <div style={{ fontSize: 8.5, color: "#3a3a60", marginBottom: 8 }}>Welcome back, Alex — Level 7 · 14d streak 🔥</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 8 }}>
            {[{ l:"Portfolio",v:"$14,820",c:"#00d4ff" },{ l:"XP",v:"2,840",c:"#818cf8" },{ l:"Streak",v:"14d",c:"#ff4466" },{ l:"Lessons",v:"7/10",c:"#00e676" }].map((s, i) => (
              <div key={i} style={{ background: "#0d0e22", border: "1px solid rgba(80,100,220,0.1)", padding: "6px 7px" }}>
                <div style={{ fontSize: 6.5, color: "#3a3a60", marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0d0e22", border: "1px solid rgba(80,100,220,0.1)", padding: "7px 10px", marginBottom: 7 }}>
            <div style={{ fontSize: 7, color: "#3a3a60", marginBottom: 4 }}>Portfolio Performance · 30D  +18.4%</div>
            <Sparkline color="#4f6ef5" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <div style={{ background: "#0d0e22", border: "1px solid rgba(80,100,220,0.1)", padding: "7px 10px" }}>
              <div style={{ fontSize: 7, color: "#3a3a60", marginBottom: 5 }}>Learning Path</div>
              {[["Money Basics",100],["Investing",65],["Business",30]].map(([m,p], i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#5a5a80", marginBottom: 2 }}><span>{m}</span><span>{p}%</span></div>
                  <div style={{ height: 2, background: "#1a1a40" }}><div style={{ width: `${p}%`, height: "100%", background: Number(p) === 100 ? "#00e676" : "#4f6ef5" }} /></div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0d0e22", border: "1px solid rgba(80,100,220,0.1)", padding: "7px 10px" }}>
              <div style={{ fontSize: 7, color: "#3a3a60", marginBottom: 5 }}>Top Holdings</div>
              {[["NVDA","+24.1%","#00e676"],["MSFT","+11.3%","#00e676"],["TSLA","-3.2%","#ff4466"]].map(([s,v,c], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#5a5a80", marginBottom: 4 }}>
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>{s}</span>
                  <span style={{ color: c as string }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stock ticker ───────────────────────────────────────────── */
const TICKERS = [
  { sym:"AAPL", p:"189.42", c:"+1.2%", up:true },
  { sym:"NVDA", p:"487.21", c:"+3.8%", up:true },
  { sym:"MSFT", p:"415.60", c:"+0.9%", up:true },
  { sym:"GOOGL",p:"172.89", c:"+0.6%", up:true },
  { sym:"AMZN", p:"198.11", c:"+2.1%", up:true },
  { sym:"TSLA", p:"203.65", c:"-1.4%", up:false },
  { sym:"META", p:"504.78", c:"+1.7%", up:true },
  { sym:"COIN", p:"211.34", c:"+4.2%", up:true },
  { sym:"AMD",  p:"162.50", c:"+2.9%", up:true },
  { sym:"NFLX", p:"638.14", c:"-0.8%", up:false },
];

/* ─── Mini previews for feature cards ───────────────────────── */
function MiniMap() {
  const nodes = [
    { label:"Money Basics", done:true }, { label:"Saving", done:true },
    { label:"Credit", done:false, cur:true }, { label:"Investing", done:false },
  ];
  const xs = [50,72,50,28];
  return (
    <div style={{ position:"relative", height:180, width:"100%" }} aria-hidden="true">
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }}>
        {nodes.slice(0,-1).map((_,i) => (
          <line key={i} x1={`${xs[i]}%`} y1={i*52+22} x2={`${xs[i+1]}%`} y2={(i+1)*52+22}
            stroke="rgba(79,110,245,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
        ))}
      </svg>
      {nodes.map((n,i) => (
        <div key={i} style={{ position:"absolute", left:`${xs[i]}%`, top:i*52, transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center",
            border:`2px solid ${n.done?"#4f6ef5":(n as any).cur?"#00d4ff":"rgba(80,100,220,0.2)"}`,
            background: n.done?"rgba(79,110,245,0.18)":"rgba(7,8,26,0.9)", fontSize:"1rem",
            animation: (n as any).cur ? "borderFlow 2s ease infinite" : undefined }}>
            {n.done?"✓":(n as any).cur?"▶":"🔒"}
          </div>
          <span style={{ fontSize:8, color:n.done?"#818cf8":(n as any).cur?"#00d4ff":"#3a3a60", whiteSpace:"nowrap" }}>{n.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniChart() {
  return (
    <div style={{ background:"rgba(7,8,26,0.9)", border:"1px solid rgba(80,100,220,0.12)", padding:"10px 12px" }} aria-hidden="true">
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:9, color:"#818cf8", fontWeight:700 }}>NVDA</span>
        <span style={{ fontSize:9, color:"#00e676", fontWeight:700 }}>+3.8% ↑</span>
      </div>
      <Sparkline color="#00e676" points="0,50 40,44 80,36 120,41 160,28 200,20 240,14 280,18 320,8 360,4 400,2" />
      <div style={{ display:"flex", gap:6, marginTop:6 }}>
        {["Buy","Sell"].map((b,i) => (
          <div key={i} style={{ flex:1, padding:"4px 0", textAlign:"center", fontSize:8.5, fontWeight:700,
            background: i===0?"rgba(0,230,118,0.12)":"rgba(255,68,102,0.1)",
            border:`1px solid ${i===0?"rgba(0,230,118,0.3)":"rgba(255,68,102,0.25)"}`,
            color: i===0?"#00e676":"#ff4466" }}>{b}</div>
        ))}
      </div>
    </div>
  );
}

function MiniTutor() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }} aria-hidden="true">
      {[
        { u:false, t:"Hi! I'm your AI tutor. What do you want to learn today?" },
        { u:true,  t:"What's compound interest and why does it matter?" },
        { u:false, t:"Compound interest is earning interest on your interest — it's the most powerful force in personal finance..." },
      ].map((m,i) => (
        <div key={i} style={{ display:"flex", justifyContent:m.u?"flex-end":"flex-start" }}>
          <div style={{ maxWidth:"87%", padding:"5px 9px", fontSize:8, lineHeight:1.5,
            background:m.u?"rgba(79,110,245,0.18)":"rgba(13,14,34,0.9)",
            border:`1px solid ${m.u?"rgba(79,110,245,0.3)":"rgba(80,100,220,0.1)"}`,
            color:m.u?"#818cf8":"#8892c0" }}>{m.t}</div>
        </div>
      ))}
    </div>
  );
}

function MiniBusiness() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }} aria-hidden="true">
      {[["Revenue","$142,800","+18.3%",true],["Net Income","$38,420","+12.1%",true],["Employees","24","+2",true],["Cash Flow","$21,600","-5.2%",false]].map(([l,v,c,up],i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 8px", background:"rgba(13,14,34,0.9)", border:"1px solid rgba(80,100,220,0.1)", fontSize:8 }}>
          <span style={{ color:"#5a5a80" }}>{l}</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ color:"#e8ecff", fontWeight:700 }}>{v}</span>
            <span style={{ color:up?"#00e676":"#ff4466" }}>{c}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniPersonal() {
  const expenses = [{ l:"Housing", pct:38, c:"#818cf8" },{ l:"Food", pct:18, c:"#00d4ff" },{ l:"Transport", pct:12, c:"#ffb020" },{ l:"Savings", pct:22, c:"#00e676" },{ l:"Other", pct:10, c:"#ff4466" }];
  return (
    <div aria-hidden="true">
      <div style={{ fontSize:7.5, color:"#3a3a60", marginBottom:8 }}>Monthly Budget Breakdown</div>
      {expenses.map((e,i) => (
        <div key={i} style={{ marginBottom:5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:7.5, color:"#5a5a80", marginBottom:2 }}><span>{e.l}</span><span>{e.pct}%</span></div>
          <div style={{ height:4, background:"#0d0e22" }}><div style={{ width:`${e.pct*2.2}%`, height:"100%", background:e.c }} /></div>
        </div>
      ))}
    </div>
  );
}

function MiniAnalysis() {
  return (
    <div aria-hidden="true" style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <div style={{ fontSize:7.5, color:"#3a3a60", marginBottom:2 }}>Financial Health Score</div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#00e676" }}>84</div>
        <div style={{ fontSize:8, color:"#5a5a80" }}>out of 100<br /><span style={{ color:"#00e676" }}>Good — above average</span></div>
      </div>
      {[["Savings Rate","82","#00e676"],["Debt Ratio","71","#ffb020"],["Investment","68","#818cf8"],["Emergency Fund","90","#00d4ff"]].map(([l,v,c],i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:7.5 }}>
          <span style={{ color:"#3a3a60", width:80, flexShrink:0 }}>{l}</span>
          <div style={{ flex:1, height:3, background:"#0d0e22" }}><div style={{ width:`${v}%`, height:"100%", background:c as string }} /></div>
          <span style={{ color:c as string, width:20, textAlign:"right", fontWeight:700 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Feature card data ──────────────────────────────────────── */
const FEATURES = [
  { id:"map",     icon:"◈", color:"#818cf8", title:"Duolingo-Style Learning Map",    tag:"SM-2 ALGORITHM",  desc:"Adaptive spaced repetition unlocks lessons based on your quiz performance. A visual path that evolves with you.", preview:<MiniMap /> },
  { id:"stocks",  icon:"◉", color:"#00e676", title:"Real Market Simulation",         tag:"GBM PRICING",     desc:"Trade 12 stocks powered by Geometric Brownian Motion. Build a portfolio. Feel real gains and losses — without real risk.", preview:<MiniChart /> },
  { id:"tutor",   icon:"◎", color:"#00d4ff", title:"Gemini AI Financial Tutor",      tag:"STREAMING AI",    desc:"Ask anything about finance. Get expert answers instantly, adapted to your knowledge level. Available 24/7.", preview:<MiniTutor /> },
  { id:"biz",     icon:"◆", color:"#ffb020", title:"Business Finance Simulator",     tag:"QUARTERLY SIMS",  desc:"Run a virtual company. Set prices, hire staff, allocate R&D. See real income statements and balance sheets.", preview:<MiniBusiness /> },
  { id:"personal",icon:"◇", color:"#ff4466", title:"Personal Finance Lab",           tag:"YOUR REAL DATA",  desc:"Enter your actual income and expenses. Simulate months of decisions. See how your choices compound over time.", preview:<MiniPersonal /> },
  { id:"analysis",icon:"◐", color:"#818cf8", title:"AI Financial Analysis",          tag:"DEEP INSIGHTS",   desc:"Get ratio breakdowns, trend analysis, risk flags, and a personalized financial health score from Gemini AI.", preview:<MiniAnalysis /> },
];

const STEPS = [
  { n:"01", title:"Set up your profile",     desc:"Choose your goals, experience level, and enter your actual financial data. No templates — everything is yours." },
  { n:"02", title:"Learn through doing",     desc:"Complete adaptive lessons, then simulate the concepts immediately. Every lesson has a real-world simulation attached." },
  { n:"03", title:"Get AI-powered insights", desc:"Ask your AI tutor anything. Get personalized analysis of your portfolio, business decisions, and financial health." },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ s: 0, m: 0, sims: 0, rate: 0 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } }, { threshold: 0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { s: 12847, m: 10, sims: 3, rate: 98 };
    const dur = 2000;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({ s: Math.round(targets.s * e), m: Math.round(targets.m * e), sims: Math.round(targets.sims * e), rate: Math.round(targets.rate * e) });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  return (
    <div style={{ background:"var(--bg)", color:"var(--text)", overflowX:"hidden" }}>
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* ── Navigation ─────────────────────────────────────── */}
      <header role="banner" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(3,3,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(80,100,220,0.12)" : "transparent"}`,
        transition:"all 0.35s",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 2rem", display:"flex", alignItems:"center", height:64 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:"0.5rem", textDecoration:"none", marginRight:"auto" }} aria-label="FinQuest AI home">
            <div style={{ width:30, height:30, background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.875rem", color:"#fff", letterSpacing:"-0.04em" }}>FQ</div>
            <span style={{ fontWeight:800, fontSize:"0.9375rem", letterSpacing:"-0.02em" }}>FinQuest</span>
            <span className="badge badge-accent" style={{ marginLeft:2, fontSize:"0.6rem" }}>AI</span>
          </Link>

          <nav aria-label="Main" style={{ display:"flex", gap:"0.125rem", marginRight:"2rem" }}>
            {[["Features","#features"],["How It Works","#how"],["Simulations","#sims"]].map(([l,h]) => (
              <a key={l} href={h} style={{ padding:"0.375rem 0.875rem", fontSize:"0.8125rem", color:"var(--text-2)", textDecoration:"none", fontWeight:500, transition:"color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color="var(--text)")} onMouseLeave={e => (e.currentTarget.style.color="var(--text-2)")}>{l}</a>
            ))}
          </nav>

          <div style={{ display:"flex", gap:"0.5rem" }}>
            <Link href="/login" className="btn-secondary" style={{ padding:"0.5rem 1.125rem", fontSize:"0.8125rem" }}>Sign In</Link>
            <Link href="/register" className="btn-primary btn-glow" style={{ padding:"0.5rem 1.25rem", fontSize:"0.8125rem" }}>Get Started →</Link>
          </div>
        </div>
      </header>

      <main id="main" style={{ paddingTop:64 }}>
        {/* ── Hero ────────────────────────────────────────── */}
        <section aria-labelledby="hero-h" style={{ padding:"6rem 2rem 4rem", position:"relative", overflow:"hidden", background:"radial-gradient(ellipse 90% 60% at 50% -5%, rgba(79,110,245,0.16) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(0,212,255,0.06) 0%, transparent 60%), var(--bg)" }}>
          <div style={{ backgroundImage:"radial-gradient(rgba(79,110,245,0.12) 1px, transparent 1px)", backgroundSize:"28px 28px", position:"absolute", inset:0, opacity:0.6 }} aria-hidden="true" />
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"rgba(79,110,245,0.07)", filter:"blur(100px)", top:-200, left:"10%", pointerEvents:"none" }} aria-hidden="true" />

          <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center", position:"relative", zIndex:1 }}>
            {/* Left */}
            <div className="anim-slide-left">
              <div className="badge badge-primary anim-fade-in" style={{ marginBottom:"1.5rem", display:"inline-flex" }}>
                <span style={{ color:"var(--accent)" }}>★</span>&nbsp;AI-POWERED FINANCIAL EDUCATION
              </div>
              <h1 id="hero-h" style={{ fontSize:"clamp(2.25rem,4.5vw,3.5rem)", fontWeight:900, lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:"1.5rem" }}>
                Financial Intelligence.<br />
                <span className="gradient-text">Built for Tomorrow.</span>
              </h1>
              <p style={{ fontSize:"1.0625rem", color:"var(--text-2)", lineHeight:1.8, marginBottom:"2rem", maxWidth:480 }}>
                The only platform that teaches you finance through AI tutoring, live market simulations, and an adaptive Duolingo-style path — with real analysis of your actual progress.
              </p>
              <div style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap", marginBottom:"2rem" }}>
                <Link href="/register" className="btn-primary btn-glow" style={{ fontSize:"1rem", padding:"0.875rem 2rem" }}>Start Learning Free →</Link>
                <a href="#how" className="btn-secondary" style={{ fontSize:"1rem", padding:"0.875rem 1.75rem" }}>See How It Works</a>
              </div>
              <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
                {["No credit card · 100% free","Powered by Gemini AI","Real market simulations"].map((t,i) => (
                  <span key={i} style={{ fontSize:"0.8125rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                    <span style={{ color:"var(--green)" }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="anim-slide-right" style={{ position:"relative" }}>
              <div style={{ position:"absolute", inset:-1, background:"linear-gradient(135deg,rgba(79,110,245,0.35),rgba(0,212,255,0.15),rgba(0,230,118,0.08))", zIndex:-1, filter:"blur(1px)" }} aria-hidden="true" />
              <div className="anim-float">
                <DashboardMockup />
              </div>
              <div className="anim-fade-in delay-4" style={{ position:"absolute", top:16, right:-56, background:"var(--surface-2)", border:"1px solid rgba(0,230,118,0.35)", padding:"8px 14px", fontSize:"0.75rem", color:"#00e676", fontWeight:700, boxShadow:"0 4px 24px rgba(0,230,118,0.2)", whiteSpace:"nowrap" }} aria-hidden="true">↑ NVDA +24.1%</div>
              <div className="anim-fade-in delay-5" style={{ position:"absolute", bottom:24, left:-56, background:"var(--surface-2)", border:"1px solid rgba(79,110,245,0.35)", padding:"8px 14px", fontSize:"0.75rem", color:"#818cf8", fontWeight:700, boxShadow:"0 4px 24px rgba(79,110,245,0.2)", whiteSpace:"nowrap" }} aria-hidden="true">+50 XP earned 🎯</div>
            </div>
          </div>
        </section>

        {/* ── Stock ticker ─────────────────────────────────── */}
        <div role="complementary" aria-label="Live market data" style={{ borderTop:"1px solid rgba(80,100,220,0.1)", borderBottom:"1px solid rgba(80,100,220,0.1)", background:"rgba(7,8,26,0.85)", padding:"0.625rem 0", overflow:"hidden" }}>
          <div className="ticker-inner" aria-hidden="true">
            {[...TICKERS,...TICKERS].map((t,i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontSize:"0.8rem" }}>
                <span style={{ color:"#818cf8", fontWeight:700, letterSpacing:"0.04em" }}>{t.sym}</span>
                <span style={{ color:"var(--text)", fontWeight:600 }}>${t.p}</span>
                <span style={{ color:t.up?"#00e676":"#ff4466", fontWeight:600 }}>{t.c}</span>
                <span style={{ color:"rgba(80,100,220,0.2)", marginLeft:"0.5rem" }}>|</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <section ref={statsRef} aria-label="Platform statistics" style={{ borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)" }}>
            {[
              { v:counts.s.toLocaleString(), suf:"+", l:"Students Enrolled",  sub:"Active learners worldwide",    c:"#818cf8" },
              { v:String(counts.m),          suf:"",  l:"Learning Modules",   sub:"Covering every finance topic", c:"#00d4ff" },
              { v:String(counts.sims),       suf:"",  l:"Live Simulations",   sub:"Real market dynamics",         c:"#00e676" },
              { v:String(counts.rate),       suf:"%", l:"Completion Rate",    sub:"Average module finish rate",   c:"#ffb020" },
            ].map((s,i) => (
              <div key={i} style={{ background:"var(--bg)", padding:"2.75rem 2rem", textAlign:"center" }}>
                <div style={{ fontSize:"clamp(2rem,3vw,3rem)", fontWeight:900, color:s.c, lineHeight:1, marginBottom:"0.5rem", fontVariantNumeric:"tabular-nums" }}>{s.v}{s.suf}</div>
                <div style={{ fontWeight:700, fontSize:"0.9375rem", marginBottom:"0.25rem" }}>{s.l}</div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features bento ───────────────────────────────── */}
        <section id="features" aria-labelledby="feat-h" style={{ padding:"6rem 2rem" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
              <div className="badge badge-primary" style={{ marginBottom:"1rem", display:"inline-flex" }}>PLATFORM FEATURES</div>
              <h2 id="feat-h" style={{ fontSize:"clamp(1.75rem,3vw,2.5rem)", fontWeight:900, letterSpacing:"-0.03em", marginBottom:"1rem" }}>
                Everything to master money.<br /><span className="gradient-text-blue">Nothing you don't need.</span>
              </h2>
              <p style={{ color:"var(--text-2)", maxWidth:520, margin:"0 auto", lineHeight:1.75, fontSize:"0.9375rem" }}>
                Six purpose-built tools that form a complete financial education system. Learn a concept → simulate it → analyze it → ask your AI tutor.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)" }}>
              {FEATURES.map((f,i) => (
                <article key={f.id} className="feature-card" aria-labelledby={`f-${f.id}`} style={{ background:"var(--surface-2)", border:"none", padding:"2rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.875rem" }}>
                    <span style={{ fontSize:"1.375rem", color:f.color, fontWeight:900, lineHeight:1 }} aria-hidden="true">{f.icon}</span>
                    <h3 id={`f-${f.id}`} style={{ fontWeight:700, fontSize:"1rem", lineHeight:1.25 }}>{f.title}</h3>
                  </div>
                  <p style={{ fontSize:"0.875rem", color:"var(--text-2)", lineHeight:1.7, marginBottom:"1rem" }}>{f.desc}</p>
                  {f.preview && (
                    <div style={{ border:"1px solid var(--border)", padding:"0.75rem", background:"var(--surface)" }}>
                      {f.preview}
                    </div>
                  )}
                  <div style={{ marginTop:"1rem" }}>
                    <span className="tag">{f.tag}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Learning map preview ──────────────────────────── */}
        <section id="sims" aria-labelledby="map-h" style={{ padding:"6rem 2rem", background:"var(--surface)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom:"1rem", display:"inline-flex" }}>ADAPTIVE LEARNING</div>
              <h2 id="map-h" style={{ fontSize:"clamp(1.75rem,3vw,2.25rem)", fontWeight:900, letterSpacing:"-0.03em", marginBottom:"1rem" }}>
                Your path. Your pace.<br /><span className="gradient-text">Never a dead end.</span>
              </h2>
              <p style={{ color:"var(--text-2)", lineHeight:1.8, marginBottom:"1.5rem", fontSize:"0.9375rem" }}>
                FinQuest's learning map uses SM-2 spaced repetition — the same algorithm in world-class flashcard apps — to surface the right lesson at exactly the right time.
              </p>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                {[["SM-2 spaced repetition algorithm","var(--primary)"],["6 modules · 10 lessons + quizzes","var(--accent)"],["Instant XP and badge rewards","var(--green)"],["Quiz-validated progression","var(--amber)"]].map(([t,c],i) => (
                  <li key={i} style={{ display:"flex", gap:"0.5rem", fontSize:"0.9rem", color:"var(--text-2)", alignItems:"flex-start" }}>
                    <span style={{ color:c, flexShrink:0, marginTop:2 }}>◆</span>{t}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary" style={{ marginTop:"2rem", display:"inline-flex" }}>Start Your Journey →</Link>
            </div>

            {/* Map preview */}
            <div role="img" aria-label="Learning path map preview" style={{ background:"var(--bg)", border:"1px solid var(--border)", padding:"1.75rem" }}>
              <div style={{ fontSize:"0.6875rem", color:"var(--text-muted)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1.5rem" }}>Your Learning Path</div>
              {([
                { mod:"Module 1 — Money Basics", lsns:["What is Money?","Income Sources","Your Paycheck"], done:[true,true,false] },
                { mod:"Module 2 — Saving",       lsns:["Emergency Fund"],                                  done:[false] },
                { mod:"Module 3 — Credit",       lsns:["Credit Scores","Debt Strategies"],                 done:[false,false] },
              ] as const).map((m,mi) => {
                const allXs = [50,72,50,28,50,72];
                const base = [0,3,4][mi];
                return (
                  <div key={mi} style={{ marginBottom:"1rem" }}>
                    <div className="map-module-header" style={{ marginBottom:"0.75rem" }}>
                      <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-2)" }}>{m.mod}</span>
                      <span className="badge badge-primary" style={{ marginLeft:"auto", fontSize:"0.6rem" }}>{m.lsns.filter((_,i) => m.done[i]).length}/{m.lsns.length}</span>
                    </div>
                    <div style={{ position:"relative", height: m.lsns.length * 58 }}>
                      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }} aria-hidden="true">
                        {m.lsns.slice(0,-1).map((_,li) => (
                          <line key={li} x1={`${allXs[base+li]}%`} y1={li*58+22} x2={`${allXs[base+li+1]}%`} y2={(li+1)*58+22}
                            stroke="rgba(79,110,245,0.25)" strokeWidth="1.5" strokeDasharray="5 3" />
                        ))}
                      </svg>
                      {m.lsns.map((l,li) => {
                        const done = m.done[li]; const cur = !done && (li===0 || m.done[li-1]);
                        return (
                          <div key={li} style={{ position:"absolute", left:`${allXs[base+li]}%`, top:li*58, transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                            <div className={`map-node ${done?"map-node-complete":cur?"map-node-current":"map-node-locked"}`} style={{ width:42, height:42, fontSize:"1rem" }} title={l} aria-label={`${l} — ${done?"Completed":cur?"Available":"Locked"}`}>
                              {done?"✓":cur?"▶":"🔒"}
                            </div>
                            <span style={{ fontSize:7.5, color:done?"#818cf8":cur?"#00d4ff":"var(--text-muted)", whiteSpace:"nowrap" }}>{l}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section id="how" aria-labelledby="how-h" style={{ padding:"6rem 2rem" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
              <div className="badge badge-green" style={{ marginBottom:"1rem", display:"inline-flex" }}>HOW IT WORKS</div>
              <h2 id="how-h" style={{ fontSize:"clamp(1.75rem,3vw,2.5rem)", fontWeight:900, letterSpacing:"-0.03em" }}>
                From zero to financially<br /><span className="gradient-text">fluent in weeks.</span>
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)" }}>
              {STEPS.map((s,i) => (
                <div key={i} style={{ background:"var(--bg)", padding:"2.5rem 2rem", position:"relative" }}>
                  <div style={{ fontSize:"3.5rem", fontWeight:900, color:"rgba(79,110,245,0.1)", lineHeight:1, marginBottom:"1rem", letterSpacing:"-0.05em" }} aria-hidden="true">{s.n}</div>
                  <h3 style={{ fontWeight:700, fontSize:"1.0625rem", marginBottom:"0.75rem" }}>{s.title}</h3>
                  <p style={{ color:"var(--text-2)", lineHeight:1.75, fontSize:"0.9rem" }}>{s.desc}</p>
                  {i < 2 && <div style={{ position:"absolute", top:"50%", right:-14, fontSize:"1.25rem", color:"var(--primary)", zIndex:1 }} aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────── */}
        <section aria-labelledby="test-h" style={{ padding:"6rem 2rem", background:"var(--surface)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <h2 id="test-h" className="sr-only">Student testimonials</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)" }}>
              {[
                { q:"I went from knowing nothing about investing to managing a $15k virtual portfolio with actual strategies. The simulations are shockingly realistic.", n:"Sarah K.", r:"Finance Student, NYU" },
                { q:"The AI tutor is on another level. I asked it to explain options trading and it gave a better answer than my actual textbook — with real examples.", n:"Marcus T.", r:"CS + Finance, Stanford" },
                { q:"The Duolingo-style map makes progress so easy to track. I've done 3 modules in 2 weeks. My understanding of credit scores went from 0 to rock solid.", n:"Priya M.", r:"High School Senior" },
              ].map((t,i) => (
                <article key={i} style={{ background:"var(--bg)", padding:"2.25rem 2rem" }} aria-label={`Testimonial from ${t.n}`}>
                  <div style={{ color:"#ffb020", fontSize:"0.875rem", marginBottom:"1rem" }} aria-label="5 out of 5 stars">★★★★★</div>
                  <blockquote style={{ color:"var(--text-2)", fontSize:"0.9rem", lineHeight:1.8, marginBottom:"1.5rem", fontStyle:"italic" }}>"{t.q}"</blockquote>
                  <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{t.n}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.125rem" }}>{t.r}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section aria-labelledby="cta-h" style={{ padding:"8rem 2rem", position:"relative", overflow:"hidden" }}>
          <div style={{ backgroundImage:"radial-gradient(rgba(79,110,245,0.12) 1px, transparent 1px)", backgroundSize:"28px 28px", position:"absolute", inset:0, opacity:0.5 }} aria-hidden="true" />
          <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"rgba(79,110,245,0.08)", filter:"blur(100px)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} aria-hidden="true" />
          <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
            <div className="badge badge-primary" style={{ marginBottom:"1.5rem", display:"inline-flex" }}>START TODAY — IT'S FREE</div>
            <h2 id="cta-h" style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:"1.25rem" }}>
              Your financial future<br /><span className="gradient-text">starts right here.</span>
            </h2>
            <p style={{ color:"var(--text-2)", fontSize:"1.0625rem", lineHeight:1.75, marginBottom:"2.5rem" }}>
              Join 12,000+ students building real financial intelligence. No cost. No fluff. Just results.
            </p>
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
              <Link href="/register" className="btn-accent" style={{ fontSize:"1rem", padding:"0.9375rem 2.5rem" }}>Create Free Account →</Link>
              <Link href="/login"    className="btn-secondary" style={{ fontSize:"1rem", padding:"0.9375rem 2rem" }}>Sign In</Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer role="contentinfo" style={{ borderTop:"1px solid var(--border)", padding:"3rem 2rem" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"3rem", marginBottom:"3rem" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1rem" }}>
                  <div style={{ width:28, height:28, background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.8125rem", color:"#fff" }}>FQ</div>
                  <span style={{ fontWeight:800, fontSize:"0.9375rem" }}>FinQuest AI</span>
                </div>
                <p style={{ fontSize:"0.875rem", color:"var(--text-muted)", lineHeight:1.75, maxWidth:280 }}>Financial intelligence for the next generation. Learn, simulate, analyze — powered by AI.</p>
              </div>
              {[
                { h:"Platform", ls:["Learning Map","Stock Simulation","Business Sim","Personal Finance","AI Tutor","AI Analysis"] },
                { h:"Learn",    ls:["Money Basics","Investing","Credit & Debt","Business Finance","Taxes","Budgeting"] },
                { h:"Account",  ls:["Register","Sign In","Dashboard","Settings"] },
              ].map((c,i) => (
                <div key={i}>
                  <div style={{ fontWeight:700, fontSize:"0.75rem", color:"var(--text-2)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"1rem" }}>{c.h}</div>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                    {c.ls.map((l,j) => (
                      <li key={j}><Link href="/register" style={{ fontSize:"0.875rem", color:"var(--text-muted)", textDecoration:"none", transition:"color 0.15s" }}
                        onMouseEnter={e=>(e.currentTarget.style.color="var(--text)")} onMouseLeave={e=>(e.currentTarget.style.color="var(--text-muted)")}>{l}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ height:1, background:"var(--border)", marginBottom:"1.5rem" }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8125rem", color:"var(--text-muted)" }}>
              <span>© 2026 FinQuest AI. All rights reserved.</span>
              <span>Built with Gemini AI · Next.js · Prisma</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
