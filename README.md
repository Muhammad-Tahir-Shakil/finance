# FinTrack — Personal Finance Tracker v2

A personal-finance tracking app built with **plain HTML, CSS, and vanilla JavaScript**. No build tools, no backend — data is stored in the browser via `localStorage`, and charts use [Chart.js](https://www.chartjs.org/) from a CDN.

## Pages

Marketing site (separate pages, each self-contained):

- **Home** (`index.html`) — hero, the "everyday money problem", and a call to action.
- **Features** (`pages/features.html`) — product pillars, money-style picker, security section.
- **Pricing** (`pages/pricing.html`) — Free / Pro / Premium tiers + FAQ.

Dashboard app (requires login):

- **Overview** (`pages/dashboard.html`) — read-only combined view: KPIs, charts, goal/budget summaries, recent activity.
- **Transactions** (`pages/transactions.html`) — add / filter / delete entries + **CSV export**.
- **Goals** (`pages/goals.html`) — create goals, add funds, track progress.
- **Budgets** (`pages/budgets.html`) — set monthly limits per category, compare spent vs. limit.

## How it works

1. **Sign up** → complete the **5-step onboarding** (income, categories, per-category spend, goal + target, money style).
2. The answers seed your dashboard, so every chart is populated from the start.
3. Manage data on the Transactions / Goals / Budgets pages; the **Overview** combines it into KPIs and charts (income vs. expenses, spending by category, budget vs. actual, goal progress).

## Coming soon

These are surfaced in the UI but not yet implemented (they show a "coming soon" toast):

- **Online payments** — the Pro / Premium plan checkout (Pricing page). Every feature is free in this demo.
- **Subscriptions** — recurring-payment tracker with upcoming renewals (dashboard sidebar).
- **Reports** — monthly/yearly printable summaries (dashboard sidebar).
- **Net Worth** — assets-minus-liabilities tracking over time (dashboard sidebar).

## Folder structure

```
finance/
├── index.html              # Home (entry point)
├── pages/                   # features, pricing, login, signup, onboarding,
│                            #   dashboard, transactions, goals, budgets
├── css/                     # styles (theme), landing, auth, dashboard
├── js/
│   ├── storage.js           # localStorage data layer + shared helpers
│   ├── auth.js              # signup / login / logout
│   ├── nav.js               # session-aware marketing nav/CTAs
│   ├── ui.js                # shared toast + "coming soon" helper
│   ├── landing.js           # money-style picker + counters
│   ├── onboarding.js        # wizard logic
│   ├── dashboard.js         # Overview KPIs + charts
│   ├── transactions.js      # transactions page + CSV export
│   ├── goals.js             # goals page
│   └── budgets.js           # budgets page
├── assets/Trust-snapshot.jpeg
└── README.md
```

## Running locally

```bash
python3 -m http.server 8000
```

Open **http://localhost:8000/**. A static server is recommended (rather than opening the file directly) so relative paths and `localStorage` work across pages.

## Notes

- Authentication is **client-side only** and not secure — for demo/learning use. Don't use real passwords.
- Data lives in `localStorage`, so it's per-browser and cleared when you clear site data.
