# FinTrack — Personal Finance Tracker

A personal-finance tracking app built with **plain HTML, CSS, and vanilla JavaScript**. No build tools, no backend — data is stored in the browser via `localStorage`, and charts use [Chart.js](https://www.chartjs.org/) from a CDN.

## Pages

Marketing site (separate pages, each self-contained):

- **Home** (`index.html`) — hero, the "everyday money problem", and a call to action.
- **Features** (`pages/features.html`) — product pillars, money-style picker, security section.
- **Pricing** (`pages/pricing.html`) — Free / Pro / Premium tiers + FAQ.

Dashboard app (requires login):

- **Overview** (`pages/dashboard.html`) — KPIs, charts, goal/budget summaries, recent activity, quick links to subscriptions, net worth, and reports.
- **Transactions** (`pages/transactions.html`) — add / filter / delete entries + **CSV export**.
- **Goals** (`pages/goals.html`) — multiple savings goals with categories, priorities, deadlines, filters, and edit.
- **Budgets** (`pages/budgets.html`) — set monthly limits per category, compare spent vs. limit.
- **Subscriptions** (`pages/subscriptions.html`) — recurring payments, renewal dates, monthly cost totals.
- **Reports** (`pages/reports.html`) — monthly/yearly summaries with printable breakdowns.
- **Net Worth** (`pages/networth.html`) — assets minus liabilities with history chart.

## How it works

1. **Sign up** → complete the **5-step onboarding** (income, categories, per-category spend, goal + target, money style).
2. The answers seed your dashboard, so every chart is populated from the start.
3. Manage data on the Transactions / Goals / Budgets / Subscriptions / Net Worth pages; the **Overview** and **Reports** pages combine it into KPIs and charts.

## Coming soon

Only one feature still shows a "coming soon" toast:

- **Online payments** — Pro / Premium plan checkout on the Pricing page. Every feature is free in this demo.

## Folder structure

```
finance/
├── index.html              # Home (entry point)
├── pages/                   # features, pricing, login, signup, onboarding,
│                            #   dashboard, transactions, goals, budgets,
│                            #   subscriptions, reports, networth
├── css/                     # styles (theme), landing, auth, dashboard
├── js/
│   ├── storage.js           # localStorage data layer + shared helpers
│   ├── auth.js              # signup / login / logout
│   ├── nav.js               # session-aware marketing nav/CTAs
│   ├── loader.js            # splash, page loader, link transitions
│   ├── app-nav.js           # shared sidebar for authenticated app pages
│   ├── ui.js                # shared toast + "coming soon" helper (pricing only)
│   ├── landing.js           # money-style picker + counters
│   ├── onboarding.js        # wizard logic
│   ├── dashboard.js         # Overview KPIs + charts
│   ├── transactions.js      # transactions page + CSV export
│   ├── goals.js             # goals page
│   ├── budgets.js           # budgets page
│   ├── subscriptions.js     # subscriptions page
│   ├── reports.js           # reports page
│   └── networth.js          # net worth page
├── assets/Trust-snapshot.jpeg
├── serve.sh                 # local dev server on port 8888
└── README.md
```

## Running locally

```bash
./serve.sh
```

Open **http://localhost:8888/** (port 8888 avoids conflicts with other local services on 8080).

Alternatively:

```bash
python3 -m http.server 8888
```

A static server is recommended (rather than opening the file directly) so relative paths and `localStorage` work across pages.

## Notes

- Authentication is **client-side only** and not secure — for demo/learning use. Don't use real passwords.
- Data lives in `localStorage`, so it's per-browser and cleared when you clear site data.
