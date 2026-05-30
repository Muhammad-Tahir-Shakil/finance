/* goals.js — Goals page: create goal, add funds, delete */

requireAuth();

function addGoal(e) {
  e.preventDefault();
  const name = document.getElementById('goalName').value.trim();
  const target = Number(document.getElementById('goalTarget').value);
  const saved = Number(document.getElementById('goalSaved').value) || 0;
  const deadline = document.getElementById('goalDeadline').value;
  if (!name || !target || target <= 0) return;

  const data = getData();
  data.goals.push({ id: uid(), name, target, saved, deadline });
  saveData(data);
  e.target.reset();
  render();
}

function addFunds(id) {
  const input = document.getElementById('add_' + id);
  const amount = Number(input.value);
  if (!amount || amount <= 0) return;

  const data = getData();
  const goal = data.goals.find((g) => g.id === id);
  if (goal) {
    goal.saved = Number(goal.saved) + amount;
    saveData(data);
    render();
  }
}

function deleteGoal(id) {
  const data = getData();
  data.goals = data.goals.filter((g) => g.id !== id);
  saveData(data);
  render();
}

function renderKPIs(data) {
  const saved = data.goals.reduce((s, g) => s + Number(g.saved), 0);
  const target = data.goals.reduce((s, g) => s + Number(g.target), 0);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  document.getElementById('kpiSaved').textContent = money(saved);
  document.getElementById('kpiTarget').textContent = money(target);
  document.getElementById('kpiProgress').textContent = pct + '%';
  document.getElementById('kpiGoals').textContent = data.goals.length;
}

function renderCards(data) {
  const wrap = document.getElementById('goalsWrap');
  const empty = document.getElementById('goalsEmpty');
  wrap.innerHTML = '';

  if (!data.goals.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  data.goals.forEach((g) => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    const done = pct >= 100;
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="gc-top">
        <div>
          <div class="gc-name">${g.name}</div>
          <div class="gc-sub">${done ? 'Goal reached! 🎉' : (g.deadline ? 'Target by ' + g.deadline : 'No deadline set')}</div>
        </div>
        <button class="icon-del" title="Delete goal" onclick="deleteGoal('${g.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="gc-amt">${money(g.saved)} <span>/ ${money(g.target)} · ${pct}%</span></div>
      <div class="g-bar"><div class="g-fill" style="width:${pct}%;${done ? 'background:linear-gradient(90deg,#00C853,#00E676);' : ''}"></div></div>
      <div class="gc-actions">
        <input type="number" id="add_${g.id}" placeholder="Add funds" min="0"/>
        <button class="gc-add" onclick="addFunds('${g.id}')">Add</button>
      </div>`;
    wrap.appendChild(card);
  });
}

function render() {
  const data = getData();
  renderKPIs(data);
  renderCards(data);
}

render();
