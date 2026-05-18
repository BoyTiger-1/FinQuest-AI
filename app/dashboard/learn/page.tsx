"use client";
import { useEffect, useState, useRef } from "react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  xpReward: number;
  completed: boolean;
  score: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lessons: Lesson[];
}

const DIFF_COLOR: Record<string, string> = {
  beginner: "var(--green)",
  intermediate: "var(--amber)",
  advanced: "var(--red)",
};

const CAT_LABEL: Record<string, string> = {
  personal: "Personal Finance",
  business: "Business",
  stocks: "Investing",
};

// Build a flat ordered list of nodes from modules
function buildNodes(modules: Module[]) {
  const nodes: { type: "module" | "lesson"; module: Module; lesson?: Lesson; globalIndex: number }[] = [];
  let gi = 0;
  for (const mod of modules) {
    nodes.push({ type: "module", module: mod, globalIndex: gi++ });
    for (const lesson of mod.lessons) {
      nodes.push({ type: "lesson", module: mod, lesson, globalIndex: gi++ });
    }
  }
  return nodes;
}

function isLessonUnlocked(lesson: Lesson, mod: Module): boolean {
  const idx = mod.lessons.findIndex(l => l.id === lesson.id);
  if (idx === 0) return true;
  return mod.lessons[idx - 1]?.completed ?? false;
}

// Lesson overlay
function LessonOverlay({ lessonId, onClose, onComplete }: { lessonId: string; onClose: () => void; onComplete: () => void }) {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"content" | "quiz">("content");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch(`/api/learn/lesson?id=${lessonId}`).then(r => r.json()).then(setData);
    closeRef.current?.focus();
  }, [lessonId]);

  async function submitQuiz() {
    if (!data) return;
    const qs = data.questions ?? [];
    if (qs.length === 0) return;
    let correct = 0;
    for (const q of qs) if (answers[q.id] === q.correct) correct++;
    const score = correct / qs.length;
    setSubmitted(true);
    const res = await fetch("/api/learn/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: data.id, score }),
    });
    const r = await res.json();
    setResult({ ...r, score, correct, total: qs.length });
    onComplete();
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Lesson" style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,3,15,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "min(760px, 100%)", maxHeight: "90vh", overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
        {/* Corner accents */}
        {[["top:0;left:0;border-top:2px solid var(--primary);border-left:2px solid var(--primary)", "TL"],
          ["top:0;right:0;border-top:2px solid var(--primary);border-right:2px solid var(--primary)", "TR"],
          ["bottom:0;left:0;border-bottom:2px solid var(--primary);border-left:2px solid var(--primary)", "BL"],
          ["bottom:0;right:0;border-bottom:2px solid var(--primary);border-right:2px solid var(--primary)", "BR"],
        ].map(([style, key]) => (
          <div key={key} aria-hidden style={{ position: "absolute", width: 14, height: 14, ...(Object.fromEntries(style.split(";").map(s => { const [k, v] = s.split(":"); return [k, v]; }))) }} />
        ))}

        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            {data && (
              <>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.375rem" }}>
                  {data.module?.title} · +{data.xpReward} XP
                </div>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>{data.title}</h2>
              </>
            )}
            {!data && <div style={{ color: "var(--text-2)" }}>Loading lesson...</div>}
          </div>
          <button ref={closeRef} onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-2)", width: 36, height: 36, cursor: "pointer", fontSize: "1.125rem", flexShrink: 0, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close lesson">✕</button>
        </div>

        {/* Tabs */}
        {data && (
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {(["content", "quiz"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "0.875rem", background: "transparent", border: "none", color: tab === t ? "var(--primary)" : "var(--text-2)", fontWeight: tab === t ? 700 : 400, cursor: "pointer", borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "inherit" }}>
                {t === "content" ? "Lesson" : `Quiz (${(data.questions ?? []).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        {data && (
          <div style={{ padding: "1.5rem", flex: 1 }}>
            {tab === "content" ? (
              <div>
                <div style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
                  {data.content?.split(/^(#{1,3} .+$)/m).map((part: string, i: number) => {
                    if (part.startsWith("### ")) return <h3 key={i} style={{ color: "var(--text)", fontWeight: 700, fontSize: "1.0625rem", margin: "1.25rem 0 0.5rem" }}>{part.replace("### ", "")}</h3>;
                    if (part.startsWith("## ")) return <h2 key={i} style={{ color: "var(--text)", fontWeight: 800, fontSize: "1.25rem", margin: "1.5rem 0 0.625rem" }}>{part.replace("## ", "")}</h2>;
                    if (part.startsWith("# ")) return <h1 key={i} style={{ color: "var(--text)", fontWeight: 900, fontSize: "1.5rem", margin: "0 0 1rem" }}>{part.replace("# ", "")}</h1>;
                    return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
                  })}
                </div>
                {(data.questions ?? []).length > 0 && (
                  <button onClick={() => setTab("quiz")} className="btn-primary" style={{ marginTop: "1.5rem", padding: "0.875rem 2rem" }}>
                    Take Quiz →
                  </button>
                )}
              </div>
            ) : (
              <div>
                {result ? (
                  <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                    <div style={{ width: 80, height: 80, background: result.score >= 0.7 ? "rgba(0,230,118,0.1)" : "rgba(255,176,32,0.1)", border: `2px solid ${result.score >= 0.7 ? "var(--green)" : "var(--amber)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2rem" }}>
                      {result.score >= 0.7 ? "✓" : "↺"}
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem" }}>{result.score >= 0.7 ? "Excellent work!" : "Keep practicing!"}</h2>
                    <p style={{ color: "var(--text-2)", marginBottom: "0.5rem" }}>{result.correct}/{result.total} correct — {Math.round(result.score * 100)}%</p>
                    {result.passed && <p style={{ color: "var(--green)", fontWeight: 700 }}>Lesson complete! +{result.xpEarned} XP earned</p>}
                    {result.newBadges?.length > 0 && <p style={{ color: "var(--amber)" }}>New badge unlocked!</p>}
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                      <button onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }} className="btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>Try Again</button>
                      <button onClick={onClose} className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>Back to Map</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {(data.questions ?? []).map((q: any, qi: number) => (
                      <div key={q.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "1.25rem" }}>
                        <p style={{ fontWeight: 700, marginBottom: "0.875rem", lineHeight: 1.5, color: "var(--text)" }}>
                          <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>{qi + 1}.</span>{q.text}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {q.options.map((opt: string, oi: number) => (
                            <button key={oi} onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: oi }))}
                              style={{ background: answers[q.id] === oi ? "rgba(79,110,245,0.1)" : "transparent", border: `1px solid ${answers[q.id] === oi ? "var(--primary)" : "var(--border)"}`, color: answers[q.id] === oi ? "var(--text)" : "var(--text-2)", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", fontSize: "0.875rem", fontWeight: answers[q.id] === oi ? 600 : 400, transition: "all 0.15s", fontFamily: "inherit" }}>
                              <span style={{ color: "var(--text-muted)", marginRight: "0.5rem", fontWeight: 700 }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz} disabled={Object.keys(answers).length < (data.questions ?? []).length} className="btn-primary" style={{ padding: "0.875rem", opacity: Object.keys(answers).length < (data.questions ?? []).length ? 0.5 : 1, cursor: Object.keys(answers).length < (data.questions ?? []).length ? "not-allowed" : "pointer" }}>
                      Submit Quiz ({Object.keys(answers).length}/{(data.questions ?? []).length} answered)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Node component
function MapNode({ node, position, isActive, isUnlocked, onClick }: {
  node: { type: "module" | "lesson"; module: Module; lesson?: Lesson; globalIndex: number };
  position: "left" | "center" | "right";
  isActive: boolean;
  isUnlocked: boolean;
  onClick: () => void;
}) {
  if (node.type === "module") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", margin: "1.5rem 0 0.75rem" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          — {CAT_LABEL[node.module.category] ?? node.module.category} —
        </div>
        <div style={{ background: "var(--surface)", border: `1px solid ${DIFF_COLOR[node.module.difficulty] ?? "var(--border)"}`, padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", maxWidth: 340 }}>
          <span style={{ fontSize: "1.5rem" }}>{node.module.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--text)" }}>{node.module.title}</div>
            <div style={{ fontSize: "0.6875rem", color: DIFF_COLOR[node.module.difficulty] ?? "var(--text-2)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {node.module.difficulty} · {node.module.completedLessons}/{node.module.totalLessons}
            </div>
          </div>
          {node.module.progress === 100 && (
            <div style={{ marginLeft: "auto", width: 24, height: 24, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: "0.75rem" }}>✓</div>
          )}
        </div>
        {/* Module progress bar */}
        <div style={{ width: 200, height: 3, background: "var(--border)" }}>
          <div style={{ height: "100%", width: `${node.module.progress}%`, background: DIFF_COLOR[node.module.difficulty] ?? "var(--primary)", transition: "width 0.5s" }} />
        </div>
      </div>
    );
  }

  const lesson = node.lesson!;
  const completed = lesson.completed;
  const nodeColor = completed ? "var(--green)" : isActive ? "var(--primary)" : isUnlocked ? "var(--text-2)" : "var(--text-muted)";

  return (
    <div style={{ display: "flex", justifyContent: position === "left" ? "flex-start" : position === "right" ? "flex-end" : "center", padding: "0.25rem 2rem" }}>
      <button
        onClick={isUnlocked ? onClick : undefined}
        aria-label={`${lesson.title}${!isUnlocked ? " (locked)" : ""}`}
        aria-disabled={!isUnlocked}
        style={{
          background: completed ? "rgba(0,230,118,0.08)" : isActive ? "rgba(79,110,245,0.1)" : "var(--surface)",
          border: `2px solid ${nodeColor}`,
          padding: "0.875rem 1.25rem",
          cursor: isUnlocked ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          width: 280,
          fontFamily: "inherit",
          textAlign: "left",
          transition: "all 0.2s",
          position: "relative",
          boxShadow: isActive ? `0 0 20px rgba(79,110,245,0.3)` : completed ? "0 0 12px rgba(0,230,118,0.15)" : "none",
          animation: isActive ? "pulseGlow 2s ease-in-out infinite" : "none",
          opacity: isUnlocked ? 1 : 0.45,
        }}
        onMouseEnter={e => isUnlocked && ((e.currentTarget as HTMLElement).style.borderColor = completed ? "var(--green)" : "var(--primary)")}
        onMouseLeave={e => isUnlocked && ((e.currentTarget as HTMLElement).style.borderColor = nodeColor)}
      >
        {/* Status icon */}
        <div style={{ width: 40, height: 40, background: completed ? "rgba(0,230,118,0.15)" : isActive ? "rgba(79,110,245,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${nodeColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1rem", color: nodeColor, fontWeight: 900 }}>
          {!isUnlocked ? "🔒" : completed ? "✓" : isActive ? "▶" : "○"}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: isUnlocked ? "var(--text)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</div>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.125rem", display: "flex", gap: "0.5rem" }}>
            <span style={{ color: nodeColor, fontWeight: 700 }}>+{lesson.xpReward} XP</span>
            {lesson.score !== null && <span>· {Math.round(lesson.score * 100)}%</span>}
            <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{lesson.type}</span>
          </div>
        </div>
      </button>
    </div>
  );
}

// SVG connector between two nodes
function Connector({ from, to, completed }: { from: "left" | "center" | "right"; to: "left" | "center" | "right"; completed: boolean }) {
  const xMap = { left: "25%", center: "50%", right: "75%" };
  const x1 = from === "left" ? 25 : from === "right" ? 75 : 50;
  const x2 = to === "left" ? 25 : to === "right" ? 75 : 50;

  return (
    <svg width="100%" height="60" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <path
        d={`M ${x1}% 0 C ${x1}% 30, ${x2}% 30, ${x2}% 60`}
        fill="none"
        stroke={completed ? "var(--green)" : "var(--border)"}
        strokeWidth={2}
        strokeDasharray={completed ? "none" : "6 4"}
      />
    </svg>
  );
}

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  function loadModules() {
    return fetch("/api/learn/modules").then(r => r.json()).then(d => {
      setModules(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }

  useEffect(() => { loadModules(); }, []);

  // Find the first unlocked+incomplete lesson
  function findCurrentLesson() {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.completed && isLessonUnlocked(lesson, mod)) return lesson.id;
      }
    }
    return null;
  }

  const currentLessonId = findCurrentLesson();
  const nodes = buildNodes(modules);

  // Position sequence for zigzag: right → center → left → center → right...
  const positions: ("left" | "center" | "right")[] = ["right", "center", "left", "center"];
  let lessonIdx = 0;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} aria-hidden />
        <div style={{ color: "var(--text-2)", fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading learning map...</div>
      </div>
    );
  }

  const totalLessons = modules.reduce((a, m) => a + m.totalLessons, 0);
  const completedLessons = modules.reduce((a, m) => a + m.completedLessons, 0);
  const totalXP = modules.reduce((a, m) => a + m.lessons.filter(l => l.completed).reduce((b, l) => b + l.xpReward, 0), 0);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.5rem" }}>LEARNING PATH</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Your Financial Map</h1>
        <p style={{ color: "var(--text-2)", margin: 0 }}>Complete lessons in order to master personal finance, investing, and business.</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {[
          { label: "Lessons Complete", value: `${completedLessons}/${totalLessons}`, color: "var(--primary)" },
          { label: "XP Earned", value: `${totalXP.toLocaleString()} XP`, color: "var(--accent)" },
          { label: "Modules", value: `${modules.filter(m => m.progress === 100).length}/${modules.length} done`, color: "var(--green)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
          <span style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Overall Progress</span>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%</span>
        </div>
        <div style={{ height: 6, background: "var(--border)" }}>
          <div style={{ height: "100%", width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%`, background: "var(--primary)", transition: "width 0.8s ease", animation: "progressFill 1.2s ease-out" }} />
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "relative" }}>
        {modules.map((mod, mi) => {
          const allPrevCompleted = mi === 0 || modules.slice(0, mi).every(m => m.progress === 100);
          return (
            <div key={mod.id}>
              {/* Module header */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", margin: "2rem 0 1.25rem" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  — MODULE {mi + 1}: {CAT_LABEL[mod.category] ?? mod.category} —
                </div>
                <div style={{ background: "var(--surface)", border: `1px solid ${DIFF_COLOR[mod.difficulty] ?? "var(--border)"}`, padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", gap: "0.875rem", maxWidth: 360, width: "100%", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.5rem" }}>{mod.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>{mod.title}</div>
                    <div style={{ fontSize: "0.6875rem", color: DIFF_COLOR[mod.difficulty] ?? "var(--text-2)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span>{mod.difficulty}</span>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span style={{ color: "var(--text-muted)" }}>{mod.completedLessons}/{mod.totalLessons} lessons</span>
                      {mod.progress === 100 && <span style={{ color: "var(--green)" }}>✓ COMPLETE</span>}
                    </div>
                  </div>
                </div>
                <div style={{ width: 220, height: 3, background: "var(--border)" }}>
                  <div style={{ height: "100%", width: `${mod.progress}%`, background: DIFF_COLOR[mod.difficulty] ?? "var(--primary)", transition: "width 0.5s" }} />
                </div>
              </div>

              {/* Lesson nodes in zigzag */}
              {mod.lessons.map((lesson, li) => {
                const pos = positions[lessonIdx % positions.length];
                const prevPos = lessonIdx > 0 ? positions[(lessonIdx - 1) % positions.length] : pos;
                lessonIdx++;
                const unlocked = isLessonUnlocked(lesson, mod) && allPrevCompleted;
                const isCurrent = lesson.id === currentLessonId;
                const prevCompleted = li === 0 ? allPrevCompleted : mod.lessons[li - 1].completed;

                return (
                  <div key={lesson.id}>
                    {li > 0 && (
                      <Connector from={prevPos} to={pos} completed={prevCompleted} />
                    )}
                    <div style={{ display: "flex", justifyContent: pos === "left" ? "flex-start" : pos === "right" ? "flex-end" : "center", padding: "0 2rem" }}>
                      <button
                        onClick={unlocked ? () => setActiveLesson(lesson.id) : undefined}
                        aria-label={`${lesson.title}${!unlocked ? " (locked)" : ""}`}
                        aria-disabled={!unlocked}
                        style={{
                          background: lesson.completed ? "rgba(0,230,118,0.06)" : isCurrent ? "rgba(79,110,245,0.08)" : "var(--surface)",
                          border: `2px solid ${lesson.completed ? "var(--green)" : isCurrent ? "var(--primary)" : unlocked ? "var(--border)" : "rgba(255,255,255,0.08)"}`,
                          padding: "0.875rem 1.125rem",
                          cursor: unlocked ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.875rem",
                          width: 268,
                          fontFamily: "inherit",
                          textAlign: "left",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                          boxShadow: isCurrent ? "0 0 24px rgba(79,110,245,0.25)" : lesson.completed ? "0 0 12px rgba(0,230,118,0.1)" : "none",
                          opacity: unlocked ? 1 : 0.4,
                          animation: isCurrent && unlocked ? "pulseGlow 2.5s ease-in-out infinite" : "none",
                        }}
                      >
                        <div style={{ width: 42, height: 42, background: lesson.completed ? "rgba(0,230,118,0.12)" : isCurrent ? "rgba(79,110,245,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${lesson.completed ? "var(--green)" : isCurrent ? "var(--primary)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.125rem", color: lesson.completed ? "var(--green)" : isCurrent ? "var(--primary)" : "var(--text-muted)", fontWeight: 900 }}>
                          {!unlocked ? "⬛" : lesson.completed ? "✓" : isCurrent ? "▶" : "○"}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: unlocked ? "var(--text)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</div>
                          <div style={{ fontSize: "0.6875rem", marginTop: "0.125rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ color: lesson.completed ? "var(--green)" : isCurrent ? "var(--primary)" : "var(--text-muted)", fontWeight: 700 }}>+{lesson.xpReward} XP</span>
                            {lesson.score !== null && <span style={{ color: "var(--text-muted)" }}>{Math.round(lesson.score * 100)}%</span>}
                            <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{lesson.type}</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* End of path */}
        {completedLessons === totalLessons && totalLessons > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "3rem", padding: "2rem", background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.2)" }}>
            <div style={{ fontSize: "2rem", color: "var(--green)" }}>✓</div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "var(--text)" }}>All modules complete!</div>
            <div style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>You&apos;ve mastered the entire curriculum. Check back for new content.</div>
          </div>
        )}
      </div>

      {activeLesson && (
        <LessonOverlay
          lessonId={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={loadModules}
        />
      )}
    </div>
  );
}
