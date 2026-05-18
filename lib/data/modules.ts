export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonData {
  id?: string;
  title: string;
  content: string;
  type: "text" | "quiz" | "interactive";
  order: number;
  xpReward: number;
  questions: Question[];
}

export interface ModuleData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  order: number;
  icon: string;
  lessons: LessonData[];
}

export const MODULES_DATA: ModuleData[] = [
  {
    title: "Money Basics",
    description: "Understand the fundamentals of money, income, and spending",
    category: "personal",
    difficulty: "beginner",
    order: 1,
    icon: "💵",
    lessons: [
      {
        title: "What is Money?",
        content: `# What is Money?

Money is a medium of exchange that makes buying and selling easier. Before money, people used **barter** — trading goods directly (e.g., 10 apples for a chicken).

## Three Functions of Money
1. **Medium of Exchange** — Accepted payment for goods/services
2. **Store of Value** — Saves purchasing power over time
3. **Unit of Account** — Common measure to compare prices

## Types of Money
- **Commodity money** — Has intrinsic value (gold, silver)
- **Fiat money** — Backed by government trust (USD, EUR)
- **Digital money** — Electronic transactions and cryptocurrencies

## Key Takeaway
Understanding money's role helps you make smarter financial decisions. Every dollar you earn represents time and effort — spend it wisely!`,
        type: "text",
        order: 1,
        xpReward: 15,
        questions: [
          {
            id: "q1",
            text: "What are the three main functions of money?",
            options: [
              "Earning, Spending, Saving",
              "Medium of exchange, Store of value, Unit of account",
              "Cash, Credit, Digital",
              "Gold, Paper, Coin",
            ],
            correct: 1,
            explanation: "Money serves as a medium of exchange (payment), store of value (savings), and unit of account (pricing standard).",
          },
          {
            id: "q2",
            text: "What is 'fiat money'?",
            options: [
              "Money made from precious metals",
              "Money that can be exchanged for goods only",
              "Currency backed by government trust, not a physical commodity",
              "Digital cryptocurrency",
            ],
            correct: 2,
            explanation: "Fiat money has value because the government says it does and people trust it — like US dollars.",
          },
        ],
      },
      {
        title: "Income & Expenses",
        content: `# Income & Expenses

Your **net income** = Total income − Total taxes & deductions.

## Types of Income
- **Active income** — Earned by working (salary, wages, freelance)
- **Passive income** — Earned without active work (dividends, rental income)
- **Portfolio income** — From investments (capital gains)

## Fixed vs Variable Expenses
| Fixed Expenses | Variable Expenses |
|---|---|
| Rent/Mortgage | Groceries |
| Car payment | Entertainment |
| Insurance | Dining out |
| Subscriptions | Gas |

## The Income Statement (Personal)
\`\`\`
Monthly Income:     $4,500
- Taxes (25%):      -$1,125
= Net Income:       $3,375
- Fixed Expenses:   -$1,800
- Variable Expenses:-$700
= Monthly Savings:  $875
\`\`\`

## Key Rule: Pay Yourself First
Set aside savings automatically before spending. Even 10% makes a huge difference over time!`,
        type: "text",
        order: 2,
        xpReward: 15,
        questions: [
          {
            id: "q3",
            text: "If you earn $5,000/month and pay $1,250 in taxes, what is your net income?",
            options: ["$5,000", "$3,750", "$1,250", "$6,250"],
            correct: 1,
            explanation: "$5,000 − $1,250 = $3,750 net income.",
          },
          {
            id: "q4",
            text: "Which of the following is a FIXED expense?",
            options: ["Groceries", "Entertainment", "Rent", "Dining out"],
            correct: 2,
            explanation: "Rent is a fixed expense — it's the same amount each month regardless of your choices.",
          },
        ],
      },
      {
        title: "Budgeting 101",
        content: `# Budgeting 101

A **budget** is a plan for how you'll spend and save your money. It's the foundation of financial health.

## The 50/30/20 Rule
A popular budgeting framework:
- **50%** — Needs (housing, food, transport, utilities)
- **30%** — Wants (entertainment, dining, hobbies)
- **20%** — Savings & debt repayment

## Zero-Based Budgeting
Assign every dollar a job. Income − All allocations = $0.

## How to Create a Budget
1. Calculate your monthly after-tax income
2. List all monthly expenses
3. Subtract expenses from income
4. Adjust until you're saving at least 20%
5. Track spending and adjust monthly

## Budgeting Tools
- Spreadsheets (free, flexible)
- Apps (Mint, YNAB, Personal Capital)
- Envelope method (physical cash in envelopes)

## The Power of Budgeting
People who budget save **2-3x more** than those who don't. A budget gives every dollar a purpose!`,
        type: "text",
        order: 3,
        xpReward: 20,
        questions: [
          {
            id: "q5",
            text: "In the 50/30/20 rule, what percentage goes to WANTS?",
            options: ["50%", "30%", "20%", "10%"],
            correct: 1,
            explanation: "The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings/debt.",
          },
          {
            id: "q6",
            text: "What is zero-based budgeting?",
            options: [
              "Spending zero dollars",
              "Saving nothing each month",
              "Assigning every dollar to a purpose so Income - Allocations = $0",
              "Starting with a budget of zero",
            ],
            correct: 2,
            explanation: "Zero-based budgeting means every dollar of income is allocated to a category, leaving zero unplanned.",
          },
        ],
      },
    ],
  },
  {
    title: "Saving & Emergency Funds",
    description: "Build financial safety nets and develop saving habits",
    category: "personal",
    difficulty: "beginner",
    order: 2,
    icon: "🏦",
    lessons: [
      {
        title: "The Power of Compound Interest",
        content: `# The Power of Compound Interest

Albert Einstein reportedly called compound interest the "eighth wonder of the world." Here's why:

## Simple vs Compound Interest
- **Simple Interest**: Interest only on principal
  - $1,000 × 5% × 10 years = $500 interest = $1,500 total
- **Compound Interest**: Interest on interest!
  - $1,000 × 5% compounded annually × 10 years = $1,629

## The Formula
**A = P(1 + r/n)^(nt)**
- A = Final amount
- P = Principal (starting amount)
- r = Annual interest rate (decimal)
- n = Times compounded per year
- t = Time in years

## The Rule of 72
Divide 72 by your interest rate to find how long to double your money:
- 6% return: 72/6 = **12 years to double**
- 10% return: 72/10 = **7.2 years to double**

## Start Early — It's Everything
| Start Age | Monthly Investment | At Age 65 (7% return) |
|---|---|---|
| 20 | $200 | **$525,000** |
| 30 | $200 | **$243,000** |
| 40 | $200 | **$104,000** |`,
        type: "text",
        order: 1,
        xpReward: 20,
        questions: [
          {
            id: "q7",
            text: "Using the Rule of 72, how long does it take to double $1,000 at an 8% return?",
            options: ["6 years", "9 years", "12 years", "16 years"],
            correct: 1,
            explanation: "72 ÷ 8 = 9 years to double your money at an 8% annual return.",
          },
          {
            id: "q8",
            text: "What makes compound interest more powerful than simple interest?",
            options: [
              "It has a higher rate",
              "It earns interest on both the principal AND accumulated interest",
              "It compounds quarterly",
              "It requires less money to start",
            ],
            correct: 1,
            explanation: "Compound interest earns returns on your returns — it snowballs over time!",
          },
        ],
      },
      {
        title: "Emergency Funds",
        content: `# Emergency Funds: Your Financial Safety Net

An emergency fund is money set aside specifically for unexpected expenses. It's the single most important first step in building wealth.

## How Much Do You Need?
- **Minimum**: 3 months of essential expenses
- **Recommended**: 6 months of essential expenses
- **Freelancers/self-employed**: 9-12 months

## What Counts as an Emergency?
✅ Job loss
✅ Medical emergency
✅ Car repair (essential for work)
✅ Home repair (water heater, roof leak)

❌ New TV
❌ Vacation
❌ Concert tickets
❌ Sale items

## Where to Keep It
- **High-yield savings account** (4-5% APY in 2024)
- Not in stocks (too volatile)
- Not in checking (too tempting to spend)
- Accessible within 1-2 days

## Building Your Fund
1. Start with a $1,000 "starter" fund
2. Cut expenses temporarily to accelerate
3. Direct any windfalls (bonuses, tax refunds) here first
4. Reach 3-6 months, then redirect to investments`,
        type: "text",
        order: 2,
        xpReward: 20,
        questions: [
          {
            id: "q9",
            text: "How many months of expenses should a recommended emergency fund cover?",
            options: ["1-2 months", "3-6 months", "9-12 months", "24 months"],
            correct: 1,
            explanation: "The standard recommendation is 3-6 months of essential expenses in an emergency fund.",
          },
          {
            id: "q10",
            text: "Where is the BEST place to keep an emergency fund?",
            options: [
              "Stock market for growth",
              "Under your mattress",
              "High-yield savings account",
              "Cryptocurrency",
            ],
            correct: 2,
            explanation: "A high-yield savings account keeps money accessible, safe, and earning decent interest.",
          },
        ],
      },
    ],
  },
  {
    title: "Credit & Debt Management",
    description: "Master credit scores, loans, and strategic debt elimination",
    category: "personal",
    difficulty: "intermediate",
    order: 3,
    icon: "💳",
    lessons: [
      {
        title: "Understanding Credit Scores",
        content: `# Understanding Credit Scores

Your credit score is a number (300-850) that lenders use to assess your creditworthiness. It affects loan rates, apartment rentals, and sometimes jobs.

## Credit Score Ranges
| Score | Rating |
|---|---|
| 800-850 | Exceptional |
| 740-799 | Very Good |
| 670-739 | Good |
| 580-669 | Fair |
| 300-579 | Poor |

## FICO Score Breakdown
1. **Payment History (35%)** — Most important! Never miss a payment.
2. **Credit Utilization (30%)** — Keep below 30% of limit
3. **Length of Credit History (15%)** — Older is better
4. **Credit Mix (10%)** — Cards + loans = better
5. **New Credit (10%)** — Avoid too many hard inquiries

## Improving Your Score
- Pay ALL bills on time (set auto-pay!)
- Keep credit card balances below 30% of limit
- Don't close old accounts
- Apply for new credit sparingly
- Check for errors on your report (free at annualcreditreport.com)`,
        type: "text",
        order: 1,
        xpReward: 25,
        questions: [
          {
            id: "q11",
            text: "What is the most important factor in your credit score?",
            options: [
              "Length of credit history",
              "Payment history (35%)",
              "Credit utilization",
              "Number of credit cards",
            ],
            correct: 1,
            explanation: "Payment history makes up 35% of your FICO score — always pay on time!",
          },
          {
            id: "q12",
            text: "What credit utilization rate is recommended for a healthy score?",
            options: ["Below 70%", "Below 50%", "Below 30%", "Below 10%"],
            correct: 2,
            explanation: "Keep your credit card balance below 30% of your credit limit for a healthy score.",
          },
        ],
      },
    ],
  },
  {
    title: "Investing Fundamentals",
    description: "Learn stocks, bonds, ETFs, and portfolio building",
    category: "stocks",
    difficulty: "intermediate",
    order: 4,
    icon: "📈",
    lessons: [
      {
        title: "Stocks vs Bonds vs ETFs",
        content: `# Investment Types: Stocks, Bonds & ETFs

## Stocks (Equities)
Owning a piece of a company.
- **Potential**: High returns (avg 10%/year for S&P 500)
- **Risk**: High — company can fail, price can drop
- **Best for**: Long-term growth (5+ years)

## Bonds (Fixed Income)
Lending money to governments or companies.
- **Potential**: Moderate returns (2-5%)
- **Risk**: Low to moderate
- **Best for**: Capital preservation, regular income

## ETFs (Exchange-Traded Funds)
Baskets of stocks/bonds traded like a single stock.
- **S&P 500 ETF**: Tracks top 500 US companies
- **Diversification**: Built-in, reducing risk
- **Cost**: Very low expense ratios (0.03-0.20%)

## Asset Allocation by Age
A common rule: **110 minus your age = % in stocks**
- Age 20: 90% stocks, 10% bonds
- Age 40: 70% stocks, 30% bonds
- Age 60: 50% stocks, 50% bonds

## Key Investing Principles
1. **Diversify** — Don't put all eggs in one basket
2. **Low costs** — Fees destroy returns over time
3. **Long-term** — Time in market beats timing the market
4. **Dollar-cost average** — Invest regularly regardless of price`,
        type: "text",
        order: 1,
        xpReward: 30,
        questions: [
          {
            id: "q13",
            text: "What is an ETF?",
            options: [
              "A type of savings account",
              "A basket of securities traded like a stock on an exchange",
              "A government bond",
              "A type of insurance",
            ],
            correct: 1,
            explanation: "ETFs (Exchange-Traded Funds) are collections of stocks/bonds that trade on exchanges like individual stocks.",
          },
          {
            id: "q14",
            text: "For a 25-year-old, what stock allocation does the '110 minus age' rule suggest?",
            options: ["25%", "50%", "75%", "85%"],
            correct: 3,
            explanation: "110 − 25 = 85% in stocks. Young investors can handle more risk for greater long-term growth.",
          },
        ],
      },
      {
        title: "Risk & Return",
        content: `# Risk and Return: The Core Trade-off

## The Risk-Return Relationship
Higher potential return = Higher risk. This is the fundamental rule of investing.

| Investment | Risk | Expected Return |
|---|---|---|
| Savings Account | Very Low | 4-5% |
| Government Bonds | Low | 3-5% |
| Corporate Bonds | Medium | 4-7% |
| Large-Cap Stocks | Medium-High | 8-12% |
| Small-Cap Stocks | High | 10-15% |
| Crypto | Very High | -50% to +500% |

## Types of Risk
- **Market risk** — Overall market declines
- **Company risk** — Specific company fails
- **Inflation risk** — Returns don't beat inflation
- **Liquidity risk** — Can't sell when needed

## Diversification Reduces Risk
Holding 20+ uncorrelated stocks eliminates most company-specific risk.

## Standard Deviation & Beta
- **Standard Deviation**: Measures volatility of returns
- **Beta**: How much a stock moves vs the market (Beta 1 = market, Beta 2 = 2x volatile)

## Sharpe Ratio
(Return − Risk-free rate) / Standard Deviation
Higher = better risk-adjusted return`,
        type: "text",
        order: 2,
        xpReward: 30,
        questions: [
          {
            id: "q15",
            text: "What does a Beta of 2.0 mean for a stock?",
            options: [
              "It returns 2% annually",
              "It moves twice as much as the market",
              "It has 2% volatility",
              "It pays a 2% dividend",
            ],
            correct: 1,
            explanation: "Beta measures a stock's volatility relative to the market. Beta 2 means it moves 2x the market — more risk AND more potential reward.",
          },
          {
            id: "q16",
            text: "How does diversification reduce risk?",
            options: [
              "It guarantees positive returns",
              "It spreads investments so one loss doesn't destroy the portfolio",
              "It reduces taxes",
              "It increases returns",
            ],
            correct: 1,
            explanation: "Diversification means losses in one investment are offset by gains in others, reducing overall portfolio volatility.",
          },
        ],
      },
    ],
  },
  {
    title: "Business Finance Essentials",
    description: "Income statements, balance sheets, and business valuation",
    category: "business",
    difficulty: "intermediate",
    order: 5,
    icon: "🏢",
    lessons: [
      {
        title: "Reading Income Statements",
        content: `# The Income Statement

An income statement (P&L — Profit & Loss) shows a company's revenues and expenses over a period of time.

## Structure
\`\`\`
Revenue (Sales)                    $1,000,000
- Cost of Goods Sold (COGS)         -$400,000
= Gross Profit                       $600,000
  Gross Margin: 60%

- Operating Expenses:
  Marketing                         -$100,000
  R&D                                -$80,000
  Payroll (non-COGS)                -$150,000
  G&A                                -$50,000
= EBITDA                             $220,000

- Depreciation & Amortization        -$20,000
= EBIT (Operating Income)            $200,000

- Interest Expense                   -$10,000
= EBT (Earnings Before Tax)          $190,000

- Income Tax (21%)                   -$39,900
= Net Income                         $150,100
  Net Margin: 15%
\`\`\`

## Key Ratios
- **Gross Margin** = Gross Profit / Revenue
- **Operating Margin** = EBIT / Revenue
- **Net Margin** = Net Income / Revenue`,
        type: "text",
        order: 1,
        xpReward: 35,
        questions: [
          {
            id: "q17",
            text: "If revenue is $500,000 and COGS is $200,000, what is the gross profit?",
            options: ["$200,000", "$300,000", "$500,000", "$700,000"],
            correct: 1,
            explanation: "Gross Profit = Revenue − COGS = $500,000 − $200,000 = $300,000",
          },
          {
            id: "q18",
            text: "What does EBITDA stand for?",
            options: [
              "Earnings Before Interest, Taxes, Depreciation, and Amortization",
              "Estimated Business Income Tax and Dividend Allocation",
              "Early Business Investment Total Dollar Amount",
              "Earnings Before Income Tax, Dividends, and Adjustments",
            ],
            correct: 0,
            explanation: "EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization. It's a proxy for operating cash flow.",
          },
        ],
      },
    ],
  },
  {
    title: "Taxes & Tax Planning",
    description: "Understand tax brackets, deductions, and legal tax minimization",
    category: "personal",
    difficulty: "advanced",
    order: 6,
    icon: "📋",
    lessons: [
      {
        title: "How Income Tax Works",
        content: `# How Income Tax Works

The US uses a **progressive tax system** — higher income = higher rates, but only on income ABOVE each threshold.

## 2024 Federal Tax Brackets (Single Filer)
| Rate | Income Range |
|---|---|
| 10% | $0 - $11,600 |
| 12% | $11,601 - $47,150 |
| 22% | $47,151 - $100,525 |
| 24% | $100,526 - $191,950 |
| 32% | $191,951 - $243,725 |
| 35% | $243,726 - $609,350 |
| 37% | Over $609,350 |

## Marginal vs Effective Tax Rate
If you earn $60,000:
- First $11,600 × 10% = $1,160
- Next $35,550 × 12% = $4,266
- Remaining $12,850 × 22% = $2,827
- **Total Tax: $8,253**
- **Effective Rate: 13.8%** (not 22%!)

## Key Deductions
- **Standard deduction**: $14,600 (2024, single)
- **401(k) contributions**: Up to $23,000/year pre-tax
- **HSA contributions**: Up to $4,150/year pre-tax
- **Student loan interest**: Up to $2,500

## Tax-Advantaged Accounts
- **401(k)/IRA**: Tax-deferred growth
- **Roth IRA**: Tax-free growth
- **HSA**: Triple tax advantage`,
        type: "text",
        order: 1,
        xpReward: 40,
        questions: [
          {
            id: "q19",
            text: "If you earn $50,000 and the 22% bracket starts at $47,151, are ALL your earnings taxed at 22%?",
            options: [
              "Yes, 22% on everything",
              "No — only income above $47,151 is taxed at 22%; lower income uses lower rates",
              "Yes, because you're in the 22% bracket",
              "No — you pay 0% due to standard deduction",
            ],
            correct: 1,
            explanation: "Progressive taxation means each 'bracket' only applies to income within that range. Your effective rate will be much lower than your marginal rate.",
          },
          {
            id: "q20",
            text: "What is the main advantage of a Roth IRA over a traditional IRA?",
            options: [
              "Higher contribution limits",
              "Tax deduction now",
              "Tax-FREE growth and withdrawals in retirement",
              "No income limits",
            ],
            correct: 2,
            explanation: "Roth IRA contributions are after-tax, but all growth and qualified withdrawals are completely tax-free!",
          },
        ],
      },
    ],
  },
];
