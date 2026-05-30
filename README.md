# FinTrack — Personal Finance Tracker

A complete personal-finance tracking and management app built with **plain HTML, CSS, and vanilla JavaScript**. No build tools, no backend — all data is stored in the browser via `localStorage`. Charts are rendered with [Chart.js](https://www.chartjs.org/) (loaded from a CDN).

## Pages

The marketing site is split into separate pages (not a single scroll), each with its own self-contained content:

- **Home** (`index.html`) — hero overview + the "everyday money problem" + a call to action.
- **Features** (`pages/features.html`) — the three product pillars, the interactive money-style picker, and the security/trust section.
- **Pricing** (`pages/pricing.html`) — Free / Pro / Premium tiers + an interactive FAQ.
- **Dashboard** — the working app (requires login), split into four pages:
  - **Overview** (`pages/dashboard.html`) — read-only combined view: KPIs, charts, goal/budget summaries, recent activity.
  - **Transactions** (`pages/transactions.html`) — add / filter / delete income and expenses.
  - **Goals** (`pages/goals.html`) — create goals, add funds, track progress, delete.
  - **Budgets** (`pages/budgets.html`) — set monthly limits per category and compare spent vs. limit.

## Features

- **Auth** — sign up / log in / log out (simulated with `localStorage`).
- **Onboarding wizard** — a 5-step questionnaire asked after the first login (income, spending categories, a typical monthly amount per category, primary goal + target + amount saved, money style). The answers seed your dashboard so every chart reflects what you entered.
- **Each dashboard section has its own input/setup page**; the **Overview** combines all of that data into KPIs and charts:
  - KPI cards: balance, monthly income, monthly expenses, savings rate.
  - **Income vs Expenses** line chart (last 6 months).
  - **Spending by Category** doughnut chart.
  - **Budget vs Actual** bar chart.
  - **Savings Goals** progress bars.

## Folder structure

```
finance/
├── index.html              # Home page (entry point)
├── pages/
│   ├── features.html       # product features + money style + security
│   ├── pricing.html        # pricing tiers + FAQ
│   ├── login.html
│   ├── signup.html
│   ├── onboarding.html     # question wizard
│   ├── dashboard.html      # Overview (combined, read-only)
│   ├── transactions.html   # add / filter / delete transactions
│   ├── goals.html          # create goals + add funds
│   └── budgets.html        # set limits + spent vs budget
├── css/
│   ├── styles.css          # shared theme: variables, navbar, buttons, footer
│   ├── landing.css         # landing-page sections
│   ├── auth.css            # auth + onboarding forms
│   └── dashboard.css       # dashboard layout
├── js/
│   ├── storage.js          # localStorage data layer + shared helpers
│   ├── auth.js             # signup / login / logout
│   ├── nav.js              # session-aware marketing nav/CTAs
│   ├── landing.js          # money-style picker + counters
│   ├── onboarding.js       # wizard logic
│   ├── dashboard.js        # Overview KPIs + Chart.js charts
│   ├── transactions.js     # transactions page logic
│   ├── goals.js            # goals page logic
│   └── budgets.js          # budgets page logic
├── assets/
│   └── Trust-snapshot.jpeg
└── README.md
```

## Running locally

From this folder, start any static server:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000/** in your browser.

> A server is recommended (rather than opening the file directly) so that relative paths and `localStorage` work consistently across pages.

## Flow

1. Open the landing page → **Sign Up**.
2. Complete the onboarding questions.
3. Land on the dashboard with charts pre-filled from your answers.
4. Add transactions to watch the charts update in real time.

## Notes / limitations

- Authentication is **client-side only** and not secure — it's for demo/learning purposes. Don't use real passwords.
- Data lives in the browser's `localStorage`, so it's per-browser and cleared if you clear site data.
- The original single-file prototype is preserved as `finance.html` (no longer the entry point).
