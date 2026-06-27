/* onboarding.js — multi-step wizard that seeds the user's dashboard data */

requireAuth();

const TOTAL_STEPS = 5;
let step = 1;

const CAT_META = {
  Food: 'fa-utensils', Rent: 'fa-house', Transport: 'fa-car', Shopping: 'fa-bag-shopping',
  Bills: 'fa-file-invoice', Health: 'fa-heart-pulse', Entertainment: 'fa-film', Other: 'fa-ellipsis',
};

const answers = {
  income: 0,
  categories: [],
  catAmounts: {},
  goalType: '',
  goalTarget: 0,
  goalSaved: 0,
  moneyStyle: '',
};

function showWizardError(message) {
  const errorEl = document.getElementById('wizardError');
  if (errorEl) errorEl.textContent = message || '';
}

function setStepFieldError(errorId, message, inputId, gridId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message || '';

  if (inputId) {
    const input = document.getElementById(inputId);
    if (input) input.classList.toggle('field-invalid', Boolean(message));
  }

  if (gridId) {
    const grid = document.getElementById(gridId);
    if (grid) grid.classList.toggle('field-invalid', Boolean(message));
  }
}

function clearStepErrors() {
  showWizardError('');
  [
    ['incomeError', 'income'],
    ['categoryError', null, 'categoryChips'],
    ['goalTypeError', null, 'goalChips'],
    ['goalTargetError', 'goalTarget'],
    ['goalSavedError', 'goalSaved'],
    ['styleError', null, 'styleChips'],
  ].forEach(([errorId, inputId, gridId]) => {
    setStepFieldError(errorId, '', inputId, gridId);
  });
  document.querySelectorAll('#catAmounts .field-error').forEach((el) => {
    el.textContent = '';
  });
  document.querySelectorAll('#catAmounts input').forEach((input) => {
    input.classList.remove('field-invalid');
  });
}

function parseAmount(value) {
  if (value === '' || value == null) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

function focusFirstStepInvalid() {
  const stepEl = document.querySelector('.step.active');
  const first = stepEl?.querySelector('input.field-invalid');
  if (first) first.focus();
}

function validateStep(n) {
  clearStepErrors();

  if (n === 1) {
    const input = document.getElementById('income');
    const raw = input.value.trim();
    if (!raw) {
      setStepFieldError('incomeError', 'Please enter your monthly income.', 'income');
      showWizardError('Complete the required field before continuing.');
      return false;
    }
    const income = parseAmount(raw);
    if (income == null || income <= 0) {
      setStepFieldError('incomeError', 'Income must be greater than 0.', 'income');
      showWizardError('Enter a valid monthly income.');
      return false;
    }
    if (income > 100000000) {
      setStepFieldError('incomeError', 'Please enter a realistic monthly income.', 'income');
      showWizardError('Enter a valid monthly income.');
      return false;
    }
    return true;
  }

  if (n === 2) {
    const selected = document.querySelectorAll('#categoryChips .chip.selected');
    if (!selected.length) {
      setStepFieldError('categoryError', 'Select at least one spending category.', null, 'categoryChips');
      showWizardError('Pick at least one category to continue.');
      return false;
    }
    return true;
  }

  if (n === 3) {
    const inputs = document.querySelectorAll('#catAmounts input');
    if (!inputs.length) {
      showWizardError('Go back and select at least one category.');
      return false;
    }

    let invalid = false;
    inputs.forEach((input) => {
      const raw = input.value.trim();
      const amount = parseAmount(raw);
      const errorEl = input.parentElement.querySelector('.field-error');
      if (!raw || amount == null || amount <= 0) {
        input.classList.add('field-invalid');
        if (errorEl) errorEl.textContent = 'Enter a monthly amount greater than 0.';
        invalid = true;
        return;
      }
      if (amount > 100000000) {
        input.classList.add('field-invalid');
        if (errorEl) errorEl.textContent = 'Please enter a realistic amount.';
        invalid = true;
      }
    });

    if (invalid) {
      showWizardError('Enter a valid monthly amount for each selected category.');
      return false;
    }
    return true;
  }

  if (n === 4) {
    const sel = document.querySelector('#goalChips .chip.selected');
    if (!sel) {
      setStepFieldError('goalTypeError', 'Select your main financial goal.', null, 'goalChips');
      showWizardError('Choose a goal before continuing.');
      return false;
    }

    const targetRaw = document.getElementById('goalTarget').value.trim();
    const target = parseAmount(targetRaw);
    if (!targetRaw || target == null || target <= 0) {
      setStepFieldError('goalTargetError', 'Target amount must be greater than 0.', 'goalTarget');
      showWizardError('Enter a valid target amount.');
      return false;
    }

    const savedRaw = document.getElementById('goalSaved').value.trim();
    if (savedRaw) {
      const saved = parseAmount(savedRaw);
      if (saved == null || saved < 0) {
        setStepFieldError('goalSavedError', 'Already saved cannot be negative.', 'goalSaved');
        showWizardError('Fix the optional saved amount before continuing.');
        return false;
      }
      if (saved > target) {
        setStepFieldError('goalSavedError', 'Already saved cannot exceed your target amount.', 'goalSaved');
        showWizardError('Fix the optional saved amount before continuing.');
        return false;
      }
    }
    return true;
  }

  if (n === 5) {
    const sel = document.querySelector('#styleChips .chip.selected');
    if (!sel) {
      setStepFieldError('styleError', 'Select the option that best describes you.', null, 'styleChips');
      showWizardError('Choose a money style before finishing.');
      return false;
    }
    return true;
  }

  return true;
}

document.querySelectorAll('#categoryChips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
    setStepFieldError('categoryError', '', null, 'categoryChips');
    showWizardError('');
  });
});

function singleSelect(containerId, errorId) {
  const chips = document.querySelectorAll(`#${containerId} .chip`);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      setStepFieldError(errorId, '', null, containerId);
      showWizardError('');
    });
  });
}
singleSelect('goalChips', 'goalTypeError');
singleSelect('styleChips', 'styleError');

function bindOnboardingInputClear() {
  ['income', 'goalTarget', 'goalSaved'].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('field-invalid');
      const errorMap = {
        income: 'incomeError',
        goalTarget: 'goalTargetError',
        goalSaved: 'goalSavedError',
      };
      setStepFieldError(errorMap[id], '', id);
      showWizardError('');
    });
  });
}
bindOnboardingInputClear();

function buildCategoryAmounts() {
  const wrap = document.getElementById('catAmounts');
  const empty = document.getElementById('catAmountsEmpty');
  wrap.innerHTML = '';

  if (!answers.categories.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  answers.categories.forEach((cat) => {
    const field = document.createElement('div');
    field.className = 'field';
    const prev = answers.catAmounts[cat] || '';
    field.innerHTML = `
      <label for="amt_${cat}"><i class="fa-solid ${CAT_META[cat] || 'fa-circle-dollar-to-slot'}" style="color:var(--gold);margin-right:8px;"></i>${cat}</label>
      <input type="number" min="0.01" step="0.01" id="amt_${cat}" data-cat="${cat}" placeholder="Monthly amount" value="${prev}" required/>
      <p class="field-error"></p>`;
    const input = field.querySelector('input');
    input.addEventListener('input', () => {
      input.classList.remove('field-invalid');
      field.querySelector('.field-error').textContent = '';
      showWizardError('');
    });
    wrap.appendChild(field);
  });
}

function showStep(n) {
  document.querySelectorAll('.step').forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.step) === n);
  });
  document.getElementById('stepNum').textContent = n;
  document.getElementById('progressBar').style.width = (n / TOTAL_STEPS) * 100 + '%';
  document.getElementById('backBtn').disabled = n === 1;
  document.getElementById('nextBtn').textContent = n === TOTAL_STEPS ? 'Finish' : 'Continue';
  clearStepErrors();
  if (n === 3) buildCategoryAmounts();
}

function collectStep(n) {
  if (n === 1) answers.income = Number(document.getElementById('income').value) || 0;
  if (n === 2) {
    answers.categories = [...document.querySelectorAll('#categoryChips .chip.selected')].map((c) => c.dataset.value);
  }
  if (n === 3) {
    answers.catAmounts = {};
    document.querySelectorAll('#catAmounts input').forEach((inp) => {
      answers.catAmounts[inp.dataset.cat] = Number(inp.value) || 0;
    });
  }
  if (n === 4) {
    const sel = document.querySelector('#goalChips .chip.selected');
    answers.goalType = sel ? sel.dataset.value : '';
    answers.goalTarget = Number(document.getElementById('goalTarget').value) || 0;
    answers.goalSaved = Number(document.getElementById('goalSaved').value) || 0;
  }
  if (n === 5) {
    const sel = document.querySelector('#styleChips .chip.selected');
    answers.moneyStyle = sel ? sel.dataset.value : '';
  }
}

function nextStep() {
  if (!validateStep(step)) {
    focusFirstStepInvalid();
    return;
  }
  collectStep(step);
  if (step < TOTAL_STEPS) {
    step++;
    showStep(step);
  } else {
    finish();
  }
}

function prevStep() {
  if (step > 1) {
    collectStep(step);
    step--;
    showStep(step);
  }
}

function finish() {
  if (!validateStep(step)) {
    focusFirstStepInvalid();
    return;
  }
  collectStep(step);
  const data = getData();
  const today = new Date().toISOString().slice(0, 10);

  data.profile = {
    onboarded: true,
    income: answers.income,
    categories: answers.categories,
    moneyStyle: answers.moneyStyle,
    goalType: answers.goalType,
  };

  if (answers.income > 0) {
    data.transactions.push({ id: uid(), type: 'income', amount: answers.income, category: 'Salary', date: today, note: 'Monthly income' });
  }

  answers.categories.forEach((cat) => {
    const amt = answers.catAmounts[cat] || 0;
    if (amt > 0) {
      data.transactions.push({ id: uid(), type: 'expense', amount: amt, category: cat, date: today, note: 'Typical monthly spend' });
      data.budgets[cat] = Math.round(amt * 1.15);
    }
  });

  if (answers.goalType && answers.goalTarget > 0) {
    const cat = inferGoalCategory(answers.goalType);
    data.goals.push(normalizeGoal({
      id: uid(),
      name: answers.goalType,
      category: cat,
      target: answers.goalTarget,
      saved: answers.goalSaved,
      deadline: '',
      priority: 'high',
      monthlyContribution: 0,
      note: 'Created during onboarding',
      history: answers.goalSaved > 0 ? [{ id: uid(), date: new Date().toISOString().slice(0, 10), amount: answers.goalSaved, type: 'deposit', note: 'Initial balance' }] : [],
    }));
  }

  saveData(data);
  showTransition('Launching your dashboard...', 'dashboard.html');
}

showStep(1);

document.getElementById('nextBtn').addEventListener('click', nextStep);
document.getElementById('backBtn').addEventListener('click', prevStep);
window.nextStep = nextStep;
window.prevStep = prevStep;
