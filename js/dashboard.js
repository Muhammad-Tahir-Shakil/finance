/* dashboard.js — Overview page: combined, read-only KPIs + charts + summaries */

requireAuth();

const STYLE_TIPS = {
  planner: 'Stay ahead by keeping upcoming bills and limits visible.',
  saver: 'Every small win counts — watch your goals grow.',
  spender: 'Spot your spending patterns before they become habits.',
  chaser: 'Break big goals into milestones and chase them down.',
};

const PALETTE = ['#D4AF37', '#6EA8FE', '#00E676', '#FF6B6B', '#F5D76E', '#3A7BD5', '#FF9F45', '#9D7BFF'];
const GRID = 'rgba(255,255,255,0.06)';
const TICK = '#9FB3C8';

let trendChart, categoryChart, budgetChart;

function sumBy(transactions, type, mKey) {
  return transactions
    .filter((t) => t.type === type && (!mKey || t.date.startsWith(mKey)))
    .reduce((s, t) => s + Number(t.amount), 0);
}

/* ---------- KPIs ---------- */
function renderKPIs(data) {
  const tx = data.transactions;
  const m = monthKey();
  const balance = sumBy(tx, 'income') - sumBy(tx, 'expense');
  const monthIncome = sumBy(tx, 'income', m);
  const monthExpense = sumBy(tx, 'expense', m);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  document.getElementById('kpiBalance').textContent = money(balance);
  document.getElementById('kpiIncome').textContent = money(monthIncome);
  document.getElementById('kpiExpenses').textContent = money(monthExpense);
  document.getElementById('kpiSavings').textContent = savingsRate + '%';
}

/* ---------- income vs expenses (6 months) ---------- */
function renderTrend(data) {
  const labels = [], income = [], expense = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    labels.push(d.toLocaleString('en-US', { month: 'short' }));
    income.push(sumBy(data.transactions, 'income', key));
    expense.push(sumBy(data.transactions, 'expense', key));
  }

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Income', data: income, borderColor: '#00E676', backgroundColor: 'rgba(0,230,118,0.12)', fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3 },
      { label: 'Expenses', data: expense, borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.1)', fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3 },
    ] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: TICK, usePointStyle: true, boxWidth: 8 } } },
      scales: { x: { grid: { color: GRID }, ticks: { color: TICK } }, y: { grid: { color: GRID }, ticks: { color: TICK, callback: (v) => '$' + v } } },
    },
  });
}

/* ---------- spending by category (doughnut) ---------- */
function renderCategory(data) {
  const m = monthKey();
  const totals = {};
  data.transactions.filter((t) => t.type === 'expense' && t.date.startsWith(m))
    .forEach((t) => { totals[t.category] = (totals[t.category] || 0) + Number(t.amount); });

  const labels = Object.keys(totals), values = Object.values(totals);
  const empty = document.getElementById('categoryEmpty');
  const canvas = document.getElementById('categoryChart');
  if (categoryChart) categoryChart.destroy();

  if (!labels.length) { empty.style.display = 'block'; canvas.style.display = 'none'; return; }
  empty.style.display = 'none'; canvas.style.display = 'block';

  categoryChart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: PALETTE, borderColor: '#0A1424', borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: { legend: { position: 'right', labels: { color: TICK, usePointStyle: true, boxWidth: 8, padding: 12 } } } },
  });
}

/* ---------- budget vs actual (bar) ---------- */
function renderBudget(data) {
  const m = monthKey();
  const cats = Object.keys(data.budgets);
  const empty = document.getElementById('budgetEmpty');
  const canvas = document.getElementById('budgetChart');
  if (budgetChart) budgetChart.destroy();

  if (!cats.length) { empty.style.display = 'block'; canvas.style.display = 'none'; return; }
  empty.style.display = 'none'; canvas.style.display = 'block';

  const limits = cats.map((c) => data.budgets[c]);
  const actuals = cats.map((c) => data.transactions
    .filter((t) => t.type === 'expense' && t.category === c && t.date.startsWith(m))
    .reduce((s, t) => s + Number(t.amount), 0));

  budgetChart = new Chart(canvas, {
    type: 'bar',
    data: { labels: cats, datasets: [
      { label: 'Budget', data: limits, backgroundColor: 'rgba(212,175,55,0.35)', borderRadius: 6 },
      { label: 'Actual', data: actuals, backgroundColor: '#6EA8FE', borderRadius: 6 },
    ] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: TICK, usePointStyle: true, boxWidth: 8 } } },
      scales: { x: { grid: { color: GRID }, ticks: { color: TICK } }, y: { grid: { color: GRID }, ticks: { color: TICK, callback: (v) => '$' + v } } } },
  });
}

/* ---------- goals (read-only summary) ---------- */
function renderGoals(data) {
  const wrap = document.getElementById('goalsList');
  wrap.innerHTML = '';
  if (!data.goals.length) {
    wrap.innerHTML = '<p class="empty-note">No goals yet. Add one on the Goals page.</p>';
    return;
  }
  data.goals.forEach((g) => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    const block = document.createElement('div');
    block.className = 'goal-block';
    block.innerHTML = `
      <div class="g-top"><span>${g.name}</span><span>${money(g.saved)} / ${money(g.target)} · ${pct}%</span></div>
      <div class="g-bar"><div class="g-fill" style="width:${pct}%;"></div></div>`;
    wrap.appendChild(block);
  });
}

/* ---------- recent transactions (read-only) ---------- */
function renderRecent(data) {
  const list = document.getElementById('txList');
  const empty = document.getElementById('txEmpty');
  list.innerHTML = '';
  if (!data.transactions.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  data.transactions.slice(0, 6).forEach((t) => {
    const isIncome = t.type === 'income';
    const color = isIncome ? '#00E676' : '#FF5252';
    const bg = isIncome ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)';
    const sign = isIncome ? '+' : '-';
    const row = document.createElement('div');
    row.className = 'tx-item';
    row.innerHTML = `
      <div class="tx-left">
        <div class="tx-badge" style="background:${bg};color:${color};"><i class="fa-solid ${catIcon(t.category)}"></i></div>
        <div class="tx-meta"><div class="n">${t.category}${t.note ? ' · ' + t.note : ''}</div><div class="d">${t.date}</div></div>
      </div>
      <div class="tx-right"><span class="tx-amount" style="color:${color};">${sign}${money(t.amount)}</span></div>`;
    list.appendChild(row);
  });
}

/* ---------- init ---------- */
(function init() {
  const user = currentUser();
  const data = getData();

  if (!data.profile.onboarded) { window.location.href = 'onboarding.html'; return; }

  document.getElementById('userName').textContent = user.name.split(' ')[0];
  if (data.profile.moneyStyle && STYLE_TIPS[data.profile.moneyStyle]) {
    document.getElementById('styleTip').textContent = STYLE_TIPS[data.profile.moneyStyle];
  }

  renderKPIs(data);
  renderTrend(data);
  renderCategory(data);
  renderBudget(data);
  renderGoals(data);
  renderRecent(data);
})();
