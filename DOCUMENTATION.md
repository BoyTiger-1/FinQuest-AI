# FinQuest AI — Technical Documentation

**Live Application:** [https://finquest-ai.onrender.com](https://finquest-ai.onrender.com)  
**Repository:** [https://github.com/BoyTiger-1/FinQuest-AI](https://github.com/BoyTiger-1/FinQuest-AI)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [AI & Machine Learning Systems](#7-ai--machine-learning-systems)
8. [Gamification System](#8-gamification-system)
9. [Financial Simulations](#9-financial-simulations)
10. [Learning System](#10-learning-system)
11. [Authentication](#11-authentication)
12. [Environment Variables](#12-environment-variables)
13. [Local Development Setup](#13-local-development-setup)
14. [Deployment](#14-deployment)

---

## 1. Project Overview

FinQuest AI is a full-stack AI-powered gamified financial literacy platform built for K-12 and college students. The platform combines structured financial education, three live simulation environments, and a Gemini-powered AI tutor to make financial decision-making tangible and engaging.

### Core Problems It Solves

| Problem | FinQuest AI Solution |
|---------|----------------------|
| Financial education is abstract | Interactive simulations with real consequences |
| Students disengage from text-heavy content | Gamified lessons, XP, streaks, badges, leaderboards |
| No personalized feedback | Gemini AI tutor and adaptive spaced repetition |
| No safe environment to practice finance | Virtual cash simulators for stocks, business, and personal finance |
| Isolated concepts with no connection to real decisions | Integrated platform where learning feeds into simulation performance |

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.6 | Full-stack React framework, App Router, SSR/SSG |
| **React** | 19.2.4 | UI component library |
| **TypeScript** | ^5 | Static typing across the entire codebase |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **Framer Motion** | ^12.38.0 | Animation library for UI transitions |
| **Recharts** | ^3.8.1 | Composable charting library for financial visualizations |
| **Lucide React** | ^1.16.0 | Icon library |
| **Zustand** | ^5.0.13 | Lightweight global state management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.2.6 | Serverless API endpoints co-located with frontend |
| **Prisma ORM** | ^7.8.0 | Type-safe database access layer |
| **better-sqlite3** | ^12.10.0 | High-performance synchronous SQLite driver |
| **@prisma/adapter-better-sqlite3** | ^7.8.0 | Prisma adapter for SQLite native driver |
| **bcryptjs** | ^3.0.3 | Password hashing |
| **jsonwebtoken** | ^9.0.3 | JWT generation and verification for auth |
| **date-fns** | ^4.1.0 | Date manipulation for spaced repetition scheduling |

### AI & APIs

| Technology | Version | Purpose |
|------------|---------|---------|
| **Google Gemini API** | `gemini-2.5-flash` | AI tutor chat, financial analysis, adaptive insights |
| **@google/generative-ai** | ^0.24.1 | Official Gemini SDK |

### Database

| Technology | Purpose |
|------------|---------|
| **SQLite** | Embedded relational database for all persistent data |
| **Prisma Migrate** | Schema migration management |

### Dev & Build Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **tsx** | ^4.22.1 | TypeScript execution for seed scripts |
| **ESLint** | ^9 | Code linting with Next.js config |
| **dotenv** | ^17.4.2 | Environment variable loading |
| **@tailwindcss/postcss** | ^4 | PostCSS integration for Tailwind |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                        │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Dashboard  │  │  Learn Map   │  │  Simulators (3x)       │  │
│  │  (Recharts) │  │  (Zigzag UI) │  │  Personal/Business/    │  │
│  │             │  │              │  │  Stocks                │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌─────────────┐                              │
│  │  AI Tutor    │  │  AI Analyze │                              │
│  │  (streaming) │  │             │                              │
│  └──────────────┘  └─────────────┘                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / Fetch API
┌──────────────────────────▼──────────────────────────────────────┐
│                    Next.js Server (Render)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    API Routes (/api/*)                    │    │
│  │                                                          │    │
│  │  auth/   learn/   simulate/   analyze   tutor   leader   │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                      │
│  ┌───────────────┐  ┌─────▼────────┐  ┌───────────────────┐     │
│  │  ML Engines   │  │  Prisma ORM  │  │  Gemini AI SDK    │     │
│  │  - SM-2 algo  │  │              │  │  - streamChat()   │     │
│  │  - GBM stocks │  │              │  │  - analyzeFinanc  │     │
│  │  - Business   │  │              │  │  - adaptiveLearni │     │
│  └───────────────┘  └──────┬───────┘  └───────────────────┘     │
│                            │                                     │
│                    ┌───────▼───────┐                             │
│                    │  SQLite DB    │                             │
│                    │  (dev.db)     │                             │
│                    └───────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                           │ REST API
                    ┌──────▼───────┐
                    │  Google AI   │
                    │  (Gemini     │
                    │  2.5 Flash)  │
                    └──────────────┘
```

### Key Architectural Decisions

- **Co-located API routes**: Next.js App Router API routes eliminate the need for a separate backend service, reducing deployment complexity.
- **SQLite over PostgreSQL**: Chosen for zero-infrastructure-overhead during development and for Render deployment. All database access is synchronous via `better-sqlite3`, avoiding connection pool issues.
- **Prisma 7 config-based setup**: Prisma 7 moved datasource URL configuration out of `schema.prisma` and into `prisma.config.ts`, enabling runtime adapter injection.
- **JWT over session cookies**: Stateless auth using httpOnly cookies storing JWTs — no server-side session storage required.
- **GBM for stock prices**: Geometric Brownian Motion with seeded randomness produces deterministic-yet-realistic price histories that are consistent across users.

---

## 4. Project Structure

```
finquest-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST — authenticate user
│   │   │   ├── register/route.ts   # POST — create account
│   │   │   └── me/route.ts         # GET — current user | DELETE — logout
│   │   ├── learn/
│   │   │   ├── modules/route.ts    # GET — all modules with progress
│   │   │   ├── lesson/route.ts     # GET — single lesson content
│   │   │   └── progress/route.ts   # POST — submit quiz score
│   │   ├── simulate/
│   │   │   ├── personal/route.ts   # GET/POST — personal finance state
│   │   │   ├── business/route.ts   # GET/POST — business sim state
│   │   │   └── stocks/route.ts     # GET/POST — portfolio & trading
│   │   ├── analyze/route.ts        # POST — AI financial analysis
│   │   ├── tutor/route.ts          # POST — AI tutor streaming chat
│   │   ├── leaderboard/route.ts    # GET — top users by XP
│   │   └── onboarding/route.ts     # POST — save onboarding data
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar nav, user session guard
│   │   ├── page.tsx                # Main dashboard with charts
│   │   ├── learn/page.tsx          # Zigzag learning map
│   │   ├── analyze/page.tsx        # AI analysis interface
│   │   ├── tutor/page.tsx          # AI tutor chat
│   │   └── simulate/
│   │       ├── personal/page.tsx   # Personal finance simulator
│   │       ├── business/page.tsx   # Business simulator
│   │       └── stocks/page.tsx     # Stock trading simulator
│   ├── onboarding/page.tsx         # Multi-step onboarding flow
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # CSS variables, global styles
├── lib/
│   ├── auth.ts                     # JWT helpers, getAuthUser()
│   ├── db.ts                       # Prisma client singleton
│   ├── gemini.ts                   # Gemini AI — streamChat, analyzeFinancials
│   ├── gamification.ts             # XP/level math, badge definitions
│   ├── firebase.ts                 # Firebase config (auth provider)
│   ├── firebase-verify.ts          # Firebase token verification
│   ├── data/
│   │   └── modules.ts              # All lesson & module content
│   └── ml/
│       ├── spaced-repetition.ts    # SM-2 algorithm implementation
│       ├── stock-simulation.ts     # GBM stock pricing engine
│       └── business-sim.ts         # Business economics engine
├── prisma/
│   ├── schema.prisma               # Database models
│   ├── seed.ts                     # Database seeder
│   ├── migrations/                 # Migration history
│   └── dev.db                      # SQLite database file (gitignored)
├── public/                         # Static assets
├── prisma.config.ts                # Prisma 7 configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config                 # Tailwind CSS configuration
└── package.json
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
User ──────────────────────────────────────────────────┐
 │                                                      │
 ├─< LearningProgress >── Lesson ──< Module            │
 │                                                      │
 ├─< UserBadge >── Badge                               │
 │                                                      │
 ├─< StockHolding                                      │
 │                                                      │
 ├── BusinessState (1:1)                               │
 │                                                      │
 └── PersonalFinanceState (1:1)                        │
```

### Model Definitions

#### `User`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `email` | String (unique) | User email |
| `name` | String | Display name |
| `password` | String | bcrypt hash |
| `xp` | Int | Total experience points |
| `level` | Int | Derived level (computed from XP) |
| `streak` | Int | Consecutive active days |
| `lastActive` | DateTime? | Used for streak calculation |
| `virtualCash` | Float | Starting $10,000 for trading |
| `onboarded` | Boolean | Onboarding completion flag |
| `goals` | String | JSON array of selected goals |
| `experience` | String | `beginner / basic / intermediate / advanced` |

#### `Module`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | e.g. `mod-1` |
| `title` | String | Module name |
| `description` | String | Short description |
| `category` | String | `personal / stocks / business` |
| `difficulty` | String | `beginner / intermediate / advanced` |
| `order` | Int | Display sequence |
| `icon` | String | Emoji icon |

#### `Lesson`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | e.g. `lesson-mod-1-1` |
| `moduleId` | String | FK → Module |
| `title` | String | Lesson title |
| `content` | String | Markdown lesson body |
| `type` | String | `text / quiz / interactive` |
| `order` | Int | Position within module |
| `xpReward` | Int | XP awarded on completion |
| `questions` | String | JSON array of quiz questions |

#### `LearningProgress`
| Field | Type | Description |
|-------|------|-------------|
| `userId + lessonId` | Composite unique | One record per user per lesson |
| `completed` | Boolean | True when score ≥ 50% |
| `score` | Float? | Quiz score 0.0–1.0 |
| `nextReview` | DateTime? | SM-2 calculated next review date |
| `interval` | Int | SM-2 interval in days |
| `easeFactor` | Float | SM-2 ease factor (starts at 2.5) |
| `repetitions` | Int | SM-2 successful repetition count |

#### `Badge`
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Slug e.g. `first-lesson` |
| `name` | String | Display name |
| `description` | String | Earned condition description |
| `icon` | String | Emoji |
| `rarity` | String | `common / uncommon / rare / epic / legendary` |

#### `StockHolding`
| Field | Type | Description |
|-------|------|-------------|
| `userId + symbol` | Composite unique | One holding per stock per user |
| `shares` | Float | Number of shares held |
| `avgCost` | Float | Average cost basis per share |

#### `BusinessState` & `PersonalFinanceState`
Both are 1:1 with User, storing the full simulation state as individual Float/Int columns plus a `history` JSON string for chart data.

---

## 6. API Reference

All endpoints require authentication via JWT cookie (except `/api/auth/login` and `/api/auth/register`). Unauthorized requests return `401`.

### Authentication

#### `POST /api/auth/register`
Creates a new user account.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```
**Response:** Sets httpOnly JWT cookie. Returns user object.

---

#### `POST /api/auth/login`
Authenticates an existing user.

**Request body:**
```json
{ "email": "jane@example.com", "password": "securePassword123" }
```
**Response:** Sets httpOnly JWT cookie. Returns user object with XP, level, streak, badges, nextLevel progress.

---

#### `GET /api/auth/me`
Returns current authenticated user's profile.

**Response:**
```json
{
  "id": "cuid...",
  "name": "Jane Doe",
  "xp": 450,
  "level": 3,
  "streak": 7,
  "virtualCash": 9250.00,
  "badges": [{ "id": "first-lesson", "name": "First Steps", "icon": "🎯", "rarity": "common" }],
  "completedLessons": 9,
  "nextLevel": { "current": 50, "needed": 400, "progress": 12 }
}
```

---

#### `DELETE /api/auth/me`
Logs out the current user (clears JWT cookie).

---

### Learning

#### `GET /api/learn/modules`
Returns all modules with per-user progress.

**Response:**
```json
[
  {
    "id": "mod-1",
    "title": "Money Basics",
    "icon": "💵",
    "category": "personal",
    "difficulty": "beginner",
    "progress": 66,
    "completedLessons": 2,
    "totalLessons": 3,
    "lessons": [
      { "id": "lesson-mod-1-1", "title": "What is Money?", "type": "text",
        "xpReward": 15, "completed": true, "score": 1.0 }
    ]
  }
]
```

---

#### `GET /api/learn/lesson?id={lessonId}`
Returns full lesson content and quiz questions for a specific lesson.

**Response:**
```json
{
  "id": "lesson-mod-1-1",
  "title": "What is Money?",
  "content": "# What is Money?\n\n...",
  "type": "text",
  "xpReward": 15,
  "questions": [
    {
      "id": "q1",
      "text": "What are the three main functions of money?",
      "options": ["Earning, Spending, Saving", "Medium of exchange, Store of value, Unit of account", ...],
      "correct": 1,
      "explanation": "Money serves as a medium of exchange..."
    }
  ],
  "module": { "title": "Money Basics" }
}
```

---

#### `POST /api/learn/progress`
Submits a quiz result. Applies SM-2 spaced repetition, awards XP, checks badge eligibility.

**Request body:**
```json
{ "lessonId": "lesson-mod-1-1", "score": 0.85 }
```

**Response:**
```json
{
  "xpEarned": 15,
  "newXp": 465,
  "newLevel": 3,
  "nextReview": "2026-05-24T00:00:00.000Z",
  "passed": true,
  "newBadges": ["perfect-score"]
}
```

---

### Simulations

#### `GET /api/simulate/personal`
Returns the user's personal finance simulation state.

#### `POST /api/simulate/personal`
Advances simulation by one month or updates configuration.

**Actions:** `setup`, `advance`, `update`

---

#### `GET /api/simulate/business`
Returns the user's business simulation state.

#### `POST /api/simulate/business`
Advances the business simulation by one period.

**Actions:** `setup`, `advance`

---

#### `GET /api/simulate/stocks`
Returns all 12 simulated stocks with real-time GBM prices, 30-day history, and the user's portfolio.

**Response includes:**
- Per-stock: symbol, name, sector, price, day change %, 30-day price history, user holding
- Portfolio: cash balance, all holdings, aggregate metrics (total value, gain %, Beta, Sharpe ratio)

#### `POST /api/simulate/stocks`
Executes a buy or sell order.

**Request body:**
```json
{ "action": "buy", "symbol": "NVDA", "shares": 2 }
```

---

### AI

#### `POST /api/tutor`
Streams a Gemini AI tutor response. Returns a `ReadableStream` of text chunks.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is compound interest?" }
  ]
}
```
**Response:** `text/plain` streaming response.

---

#### `POST /api/analyze`
Returns a structured AI financial analysis of the user's simulation data.

**Request body:**
```json
{ "type": "personal" }
```
or
```json
{ "type": "business" }
```
or custom data:
```json
{ "type": "custom", "data": { ... } }
```

**Response:**
```json
{ "analysis": "## Financial Health Analysis\n\n..." }
```

---

#### `GET /api/leaderboard`
Returns top 10 users ranked by XP.

---

#### `POST /api/onboarding`
Saves onboarding form data (goals, experience level, financial data) to the user record and personal finance state.

---

## 7. AI & Machine Learning Systems

### 7.1 Gemini AI Integration (`lib/gemini.ts`)

The platform uses **Gemini 2.5 Flash** for all AI features.

#### AI Tutor — `streamChat()`
Implements a real-time streaming chat interface. Converts the message history to Gemini's format (role `"assistant"` → `"model"`), starts a multi-turn chat session, and streams tokens back as a `ReadableStream`.

```
User message → Gemini Chat Session → Stream of text chunks → Browser (rendered in real time)
```

The tutor system prompt configures the AI as a student-friendly financial educator covering budgeting, investing, credit, taxes, business finance, and stock markets.

#### Financial Analysis — `analyzeFinancials()`
Sends the user's full simulation state (income, expenses, investments, debt, credit score, etc.) to Gemini with a structured prompt requesting:
1. Key ratio analysis (liquidity, profitability, solvency, efficiency)
2. Trend analysis
3. Strengths and areas of concern
4. Actionable recommendations
5. A health score out of 100

#### Adaptive Insights — `getAdaptiveLearningInsight()`
Accepts a performance data object and returns a brief (2–3 sentence) personalized learning recommendation.

---

### 7.2 Spaced Repetition — SM-2 Algorithm (`lib/ml/spaced-repetition.ts`)

FinQuest AI implements the **SM-2 (SuperMemo 2)** spaced repetition algorithm, the same algorithm used by Anki and Duolingo.

#### How It Works

After each quiz, the score is converted to a quality rating (0–5):

| Score | Quality |
|-------|---------|
| ≥ 90% | 5 (perfect) |
| ≥ 80% | 4 (correct, slight hesitation) |
| ≥ 70% | 3 (correct with difficulty) |
| ≥ 60% | 2 (incorrect, easy to recall) |
| ≥ 40% | 1 (incorrect, hard) |
| < 40% | 0 (blackout) |

The SM-2 update then calculates:
- **Interval**: Days until next review (1 → 6 → interval × easeFactor)
- **Ease Factor**: Adjusted based on quality, minimum 1.3
- **Repetitions**: Reset to 0 on failure

This data is stored in `LearningProgress` and drives the learning map's "next review" scheduling.

---

### 7.3 Stock Price Simulation — GBM (`lib/ml/stock-simulation.ts`)

Stock prices are simulated using **Geometric Brownian Motion (GBM)**, the mathematical model underlying the Black-Scholes options pricing formula.

#### Price Formula
```
Price(t+dt) = Price(t) × exp((μ - σ²/2)dt + σ√dt × Z)
```

Where:
- `μ` = drift (expected annual return, e.g. 0.12 for 12%)
- `σ` = volatility (annual standard deviation)
- `dt` = 1/252 (one trading day as a fraction of a year)
- `Z` = standard normal random variable (Box-Muller transform)

#### Deterministic Seeding
A **linear congruential generator** seeded by `symbol + dayOffset` produces the same price history for every user on every device, making prices consistent and fair across the platform.

#### Portfolio Metrics
- **Beta**: Each stock's volatility relative to market volatility (σ / 0.16)
- **Sharpe Ratio**: Risk-adjusted return = gain% / (beta × 10)

#### Available Stocks (12 simulated tickers)

| Symbol | Name | Sector | Base Price | Annual Return | Volatility |
|--------|------|--------|-----------|---------------|------------|
| APPL | Apple Technologies | Technology | $185 | 12% | 25% |
| GOOG | Google Systems | Technology | $140 | 10% | 22% |
| AMZN | Amazon Commerce | E-Commerce | $178 | 14% | 28% |
| MSFT | Microsoft Corp | Technology | $415 | 11% | 20% |
| TSLA | Tesla Motors | Automotive | $250 | 8% | 45% |
| META | MetaVerse Inc | Social Media | $490 | 13% | 30% |
| NVDA | NVidia Chips | Semiconductors | $875 | 20% | 40% |
| JPM | JP Morgan Bank | Finance | $195 | 9% | 18% |
| JNJ | Johnson Health | Healthcare | $158 | 7% | 15% |
| WMT | Walmart Retail | Retail | $67 | 6% | 14% |
| KO | Coca-Cola Co | Consumer Goods | $62 | 5% | 12% |
| SPY | S&P 500 Index | Index Fund | $520 | 10% | 16% |

---

## 8. Gamification System

Defined in `lib/gamification.ts`.

### XP & Levels

Level is derived from XP using a square-root curve:

```
level = floor(√(xp / 100)) + 1
xpForLevel(n) = (n - 1)² × 100
```

| Level | XP Required | XP Gap |
|-------|-------------|--------|
| 1 | 0 | — |
| 2 | 100 | 100 |
| 3 | 400 | 300 |
| 4 | 900 | 500 |
| 5 | 1,600 | 700 |
| 10 | 8,100 | 1,700 |

XP is awarded per lesson:
- **Pass (≥ 70%)**: Full `xpReward` (15–40 XP depending on difficulty)
- **Attempt (< 70%)**: 30% of `xpReward`

### Streak System

`lastActive` is compared against the current day on each login. A streak increments by 1 for each consecutive daily login and resets to 0 if more than one day is missed.

### Badges

| Badge ID | Name | Condition | Rarity |
|----------|------|-----------|--------|
| `first-lesson` | First Steps | Complete first lesson | Common |
| `streak-7` | Week Warrior | 7-day streak | Uncommon |
| `streak-30` | Monthly Master | 30-day streak | Rare |
| `level-5` | Rising Star | Reach level 5 | Uncommon |
| `level-10` | Finance Pro | Reach level 10 | Rare |
| `budget-master` | Budget Master | Complete personal finance module | Uncommon |
| `stock-guru` | Stock Guru | Complete stock market module | Rare |
| `business-tycoon` | Business Tycoon | Complete business module | Rare |
| `perfect-score` | Perfectionist | Score 100% on a quiz | Rare |
| `analysis-ace` | Analysis Ace | Use AI analysis tool | Common |
| `investor` | Investor | Buy first stock | Common |
| `debt-free` | Debt Free | Pay off all debt in personal sim | Epic |

---

## 9. Financial Simulations

### 9.1 Personal Finance Simulator

Tracks a complete monthly household budget including:
- **Income**: Salary or wage
- **Expenses**: Rent, food, transport, utilities, insurance, other
- **Assets**: Cash, savings, investments
- **Liabilities**: Total debt
- **Credit Score**: 300–850 scale

Each month advance calculates net cash flow, applies investment returns, accrues debt interest, and updates the credit score based on debt-to-income ratio and payment behavior. History is stored as a JSON array for chart rendering.

### 9.2 Business Finance Simulator

Manages a full business P&L across multiple periods:
- Revenue from unit sales (price × units)
- COGS and gross margin
- Operating expenses (marketing, R&D, payroll, G&A)
- EBITDA, net income
- Cash position over time

Each period advance simulates demand elasticity, hiring costs, and R&D impact on future revenue. Defined in `lib/ml/business-sim.ts`.

### 9.3 Stock Market Simulator

- **Virtual cash**: Each user starts with $10,000
- **12 simulated stocks** with GBM pricing (see Section 7.3)
- **Buy/sell orders**: Average cost basis tracking for multiple purchases of the same ticker
- **Portfolio metrics**: Total value, unrealized gain/loss, portfolio Beta, Sharpe ratio
- **Price history**: 30-day candlestick-ready history per stock
- **Badge trigger**: First buy awards the `investor` badge

---

## 10. Learning System

### Module Structure

The curriculum is defined in `lib/data/modules.ts` as a typed `MODULES_DATA` array. Each module contains:
- Metadata (title, description, category, difficulty, order, icon)
- An array of lessons

Each lesson contains:
- Markdown content body
- Type (`text`, `quiz`, `interactive`)
- XP reward
- Array of quiz questions (each with 4 options, correct index, explanation)

### Learning Map

The learning map (`/dashboard/learn`) renders modules and their lessons as a **zigzag path** with SVG bezier-curve connectors between nodes. Lesson unlock logic:
- First lesson of each module: unlocked when all previous modules are 100% complete
- Subsequent lessons: unlocked when the previous lesson in the same module is completed

Clicking an unlocked lesson opens a `LessonOverlay` dialog with a content tab (rendered markdown) and a quiz tab (multiple-choice form).

### Current Curriculum (6 Modules)

| # | Module | Category | Difficulty | Lessons |
|---|--------|----------|------------|---------|
| 1 | Money Basics | Personal | Beginner | 3 |
| 2 | Saving & Emergency Funds | Personal | Beginner | 2 |
| 3 | Credit & Debt Management | Personal | Intermediate | 1 |
| 4 | Investing Fundamentals | Stocks | Intermediate | 2 |
| 5 | Business Finance Essentials | Business | Intermediate | 1 |
| 6 | Taxes & Tax Planning | Personal | Advanced | 1 |

---

## 11. Authentication

Authentication uses **JSON Web Tokens (JWT)** stored in **httpOnly cookies** to prevent XSS token theft.

### Flow

```
1. Register/Login → bcrypt verify password → sign JWT (7-day expiry)
2. Set-Cookie: token=<jwt>; HttpOnly; Path=/; SameSite=Lax
3. All API requests automatically include the cookie
4. getAuthUser() decodes and verifies the JWT on every protected route
5. Logout → Set-Cookie with maxAge=0 (clears cookie)
```

### `getAuthUser()` (`lib/auth.ts`)
Reads the `token` cookie from the Next.js request context, verifies the JWT signature using `JWT_SECRET`, and returns the decoded user payload `{ id, email, name }`. Returns `null` if missing or invalid.

---

## 12. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash |
| `JWT_SECRET` | Yes | Secret key for signing JWTs (use a long random string) |
| `DATABASE_URL` | Yes (Render) | SQLite file path e.g. `file:./prisma/dev.db` |
| `NODE_ENV` | Recommended | Set to `production` on Render |

To generate a secure `JWT_SECRET`:
```bash
openssl rand -hex 32
```

---

## 13. Local Development Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
# Clone the repository
git clone https://github.com/BoyTiger-1/FinQuest-AI.git
cd FinQuest-AI

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in GEMINI_API_KEY and JWT_SECRET
```

### Environment File (`.env.local`)

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
DATABASE_URL=file:./prisma/dev.db
```

### Database Setup

```bash
# Run migrations to create database schema
npx prisma migrate dev

# Seed with modules, lessons, and badges
npm run db:seed

# Or do both at once
npm run db:setup
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev --webpack` | Start development server on port 3000 |
| `build` | `next build` | Build production bundle |
| `start` | `next start` | Start production server |
| `db:generate` | `prisma generate` | Regenerate Prisma client |
| `db:migrate` | `prisma migrate dev` | Run pending migrations |
| `db:seed` | `tsx prisma/seed.ts` | Seed database with curriculum content |
| `db:setup` | migrate + seed | Full database initialization |

### Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 14. Deployment

### Render (Current Production)

**Live URL:** [https://finquest-ai.onrender.com](https://finquest-ai.onrender.com)

#### Build Configuration

| Setting | Value |
|---------|-------|
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy && npm run db:seed && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | On push to `main` branch |

#### Environment Variables (set in Render Dashboard)

```
GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=production
```

#### Important Notes

- **Prisma 7**: The datasource URL is configured in `prisma.config.ts`, NOT in `schema.prisma` (breaking change in Prisma 7).
- **SQLite on Render**: The free tier uses an ephemeral filesystem. Data persists during the container's lifetime but resets on redeploy. The `db:seed` step in the build command ensures modules and badges are always present after a fresh deploy.
- **Native binaries**: `better-sqlite3` compiles during `npm install`. Render's build environment supports native Node.js modules.

#### Upgrading to Persistent Storage

To preserve user data across redeploys, add a **Render Disk** ($0.25/GB/month) mounted at `/data`, then update `lib/db.ts`:

```typescript
const dbPath = process.env.NODE_ENV === "production"
  ? "/data/prod.db"
  : path.resolve(process.cwd(), "prisma/dev.db");
const dbUrl = `file:${dbPath}`;
```

---

*FinQuest AI — Making financial literacy practical, personalized, and engaging.*
