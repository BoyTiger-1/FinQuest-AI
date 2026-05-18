import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinQuest AI — Financial Intelligence Platform",
  description: "Master personal finance, investing, and business with AI-powered adaptive learning, live market simulations, and your personal Gemini AI tutor.",
  keywords: ["financial literacy", "investing", "budgeting", "stock market", "AI tutor", "gamified learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#03030f" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
