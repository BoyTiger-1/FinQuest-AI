"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const starterQuestions = [
  "How does compound interest work?",
  "What's the difference between stocks and bonds?",
  "How should I start budgeting?",
  "Explain the 50/30/20 rule",
  "What is a Roth IRA?",
  "How do I improve my credit score?",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your FinQuest AI financial tutor, powered by Gemini AI 🎓\n\nI can explain any financial concept — from basic budgeting to advanced investment strategies. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const userMsg = text ?? input.trim();
    if (!userMsg || streaming) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);
    setApiKeyMissing(false);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(m => [...m, assistantMsg]);

    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!r.ok) {
        const err = await r.text();
        if (err.includes("API_KEY") || err.includes("API key") || r.status === 401) setApiKeyMissing(true);
        throw new Error(err);
      }

      const reader = r.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: fullText };
          return updated;
        });
      }
    } catch (err: any) {
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = {
          role: "assistant",
          content: apiKeyMissing
            ? "⚠️ To enable the AI Tutor, add your Gemini API key to `.env.local`:\n\n```\nGEMINI_API_KEY=your-key-here\n```\n\nGet your free API key at [aistudio.google.com](https://aistudio.google.com)"
            : "I encountered an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renderMessage(content: string) {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} style={{ fontSize: "1.125rem", fontWeight: 800, color: "#f8fafc", margin: "0.75rem 0 0.25rem" }}>{line.replace("# ", "")}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1rem", fontWeight: 700, color: "#38bdf8", margin: "0.625rem 0 0.2rem" }}>{line.replace("## ", "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#a78bfa", margin: "0.5rem 0 0.15rem" }}>{line.replace("### ", "")}</h3>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ display: "flex", gap: "0.4rem", paddingLeft: "0.25rem", margin: "0.15rem 0" }}><span style={{ color: "#0ea5e9", flexShrink: 0 }}>•</span><span>{line.replace(/^[-•] /, "")}</span></div>;
      if (line.startsWith("```")) return null;
      if (line === "") return <div key={i} style={{ height: "0.375rem" }} />;
      return <span key={i} style={{ display: "block" }}>{line}</span>;
    }).filter(Boolean);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
      <div style={{ marginBottom: "1.25rem", flexShrink: 0 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>💬 AI Financial Tutor</h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9375rem" }}>Powered by Gemini AI · Ask anything about personal finance, investing, or business</p>
      </div>

      {/* Starter questions */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", flexShrink: 0 }}>
          {starterQuestions.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 9999, padding: "0.4rem 0.875rem", fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#0ea5e9"; (e.currentTarget as HTMLElement).style.color = "#38bdf8"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#334155"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: "0.75rem", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: msg.role === "user" ? "linear-gradient(135deg,#0ea5e9,#8b5cf6)" : "linear-gradient(135deg,#8b5cf6,#0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem"
            }}>
              {msg.role === "user" ? "U" : "🤖"}
            </div>
            <div style={{
              maxWidth: "80%",
              background: msg.role === "user" ? "rgba(14,165,233,0.12)" : "#0f172a",
              border: `1px solid ${msg.role === "user" ? "rgba(14,165,233,0.25)" : "#334155"}`,
              borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              padding: "0.875rem 1.125rem",
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "#f1f5f9",
            }}>
              {msg.content === "" && streaming ? (
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", opacity: 0.6 }} />
                  ))}
                </div>
              ) : renderMessage(msg.content)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "0.75rem 1rem", display: "flex", alignItems: "flex-end", gap: "0.625rem" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about finance... (Enter to send)"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", color: "#f8fafc", resize: "none",
              fontSize: "0.9375rem", outline: "none", lineHeight: 1.5, maxHeight: "120px",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button onClick={() => sendMessage()} disabled={!input.trim() || streaming}
          style={{ width: 44, height: 44, borderRadius: 12, background: !input.trim() || streaming ? "#334155" : "linear-gradient(135deg,#0ea5e9,#8b5cf6)", border: "none", color: "white", cursor: !input.trim() || streaming ? "not-allowed" : "pointer", fontSize: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          →
        </button>
      </div>
    </div>
  );
}
