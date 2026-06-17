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
  catAmounts: {},   // { category: monthlySpend }
  goalType: '',
  goalTarget: 0,
  goalSaved: 0,
  moneyStyle: '',
};

/* --- Inject an error display element dynamically if it doesn't exist --- */
function showError(message) {
  let errorEl = document.getElementById('wizardError');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl = document.createElement('div');
    errorEl.id = 'wizardError';
    errorEl.className = 'form-error'; // Uses your existing .form-error CSS style
    errorEl.style.color = 'var(--red)';
    errorEl.style.fontSize = '14px';
    errorEl.style.marginBottom = '14px';
    errorEl.style.textAlign = 'center';
    errorEl.style.fontWeight = '500';
    
    // Insert it right above the navigation buttons
    const nav = document.querySelector('.wizard-nav');
    nav.parentNode.insertBefore(errorEl, nav);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function clearError() {
  const errorEl = document.getElementById('wizardError');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }
}

/* --- multi-select chips (categories) --- */
document.querySelectorAll('#categoryChips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
    clearError(); // Clear error when they fix it
  });
});

/* --- single-select chips (goal + style) --- */
function singleSelect(containerId) {
  const chips = document.querySelectorAll(`#${containerId} .chip`);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      clearError(); // Clear error when they fix it
    });
  });
}
singleSelect('goalChips');
singleSelect('styleChips');

// Clear error text on text inputs too
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', clearError);
});

/* --- build the per-category amount inputs (step 3) --- */
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
      <input type="number" min="0" id="amt_${cat}" data-cat="${cat}" placeholder="Monthly amount" value="${prev}"/>`;
    wrap.appendChild(field);
    
    // Attach listener to new dynamically generated inputs
    field.querySelector('input').addEventListener('input', clearError);
  });
}

/* --- navigation --- */
function showStep(n) {
  clearError(); // Reset error state on step change
  document.querySelectorAll('.step').forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.step) === n);
  });
  document.getElementById('stepNum').textContent = n;
  document.getElementById('progressBar').style.width = (n / TOTAL_STEPS) * 100 + '%';
  document.getElementById('backBtn').disabled = n === 1;
  document.getElementById('nextBtn').textContent = n === TOTAL_STEPS ? 'Finish' : 'Continue';
  if (n === 3) buildCategoryAmounts();
}

/* --- Step validation logic before proceeding --- */
function validateStep(n) {
  if (n === 1) {
    const incomeVal = document.getElementById('income').value;
    if (!incomeVal || Number(incomeVal) <= 0) {
      showError('Please enter a valid monthly income greater than 0.');
      return false;
    }
  }
  
  if (n === 2) {
    const selectedChips = document.querySelectorAll('#categoryChips .chip.selected');
    if (selectedChips.length === 0) {
      showError('Please select at least one spending category.');
      return false;
    }
  }
  
  if (n === 3) {
    let allFilled = true;
    const inputs = document.querySelectorAll('#catAmounts input');
    inputs.forEach(inp => {
      if (!inp.value || Number(inp.value) <= 0) {
        allFilled = false;
      }
    });
    if (!allFilled) {
      showError('Please fill out typical spending amounts (greater than 0) for all selected categories.');
      return false;
    }
  }
  
  if (n === 4) {
    const selGoal = document.querySelector('#goalChips .chip.selected');
    const targetVal = document.getElementById('goalTarget').value;
    
    if (!selGoal) {
      showError('Please select a financial goal.');
      return false;
    }
    if (!targetVal || Number(targetVal) <= 0) {
      showError('Please enter a valid target amount.');
      return false;
    }
  }
  
  if (n === 5) {
    const selStyle = document.querySelector('#styleChips .chip.selected');
    if (!selStyle) {
      showError('Please select an option that best describes your money style.');
      return false;
    }
  }
  
  return true; // Step is valid
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
  // 1. Run validation check first
  if (!validateStep(step)) {
    return; // Block execution and don't proceed if invalid
  }
  
  // 2. If valid, parse data and advance
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

/* --- finish: persist data + seed transactions, budgets and goal --- */
function finish() {
  // Final validation double check
  if (!validateStep(step)) return;

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
    data.goals.push({ id: uid(), name: answers.goalType, target: answers.goalTarget, saved: answers.goalSaved, deadline: '' });
  }

  saveData(data);
  window.location.href = 'dashboard.html';
}

showStep(1);











































// /* onboarding.js — multi-step wizard that seeds the user's dashboard data */

// requireAuth();

// const TOTAL_STEPS = 5;
// let step = 1;

// const CAT_META = {
//   Food: 'fa-utensils', Rent: 'fa-house', Transport: 'fa-car', Shopping: 'fa-bag-shopping',
//   Bills: 'fa-file-invoice', Health: 'fa-heart-pulse', Entertainment: 'fa-film', Other: 'fa-ellipsis',
// };

// const answers = {
//   income: 0,
//   categories: [],
//   catAmounts: {},   // { category: monthlySpend }
//   goalType: '',
//   goalTarget: 0,
//   goalSaved: 0,
//   moneyStyle: '',
// };

// /* --- multi-select chips (categories) --- */
// document.querySelectorAll('#categoryChips .chip').forEach((chip) => {
//   chip.addEventListener('click', () => chip.classList.toggle('selected'));
// });

// /* --- single-select chips (goal + style) --- */
// function singleSelect(containerId) {
//   const chips = document.querySelectorAll(`#${containerId} .chip`);
//   chips.forEach((chip) => {
//     chip.addEventListener('click', () => {
//       chips.forEach((c) => c.classList.remove('selected'));
//       chip.classList.add('selected');
//     });
//   });
// }
// singleSelect('goalChips');
// singleSelect('styleChips');

// /* --- build the per-category amount inputs (step 3) --- */
// function buildCategoryAmounts() {
//   const wrap = document.getElementById('catAmounts');
//   const empty = document.getElementById('catAmountsEmpty');
//   wrap.innerHTML = '';

//   if (!answers.categories.length) {
//     empty.style.display = 'block';
//     return;
//   }
//   empty.style.display = 'none';

//   answers.categories.forEach((cat) => {
//     const field = document.createElement('div');
//     field.className = 'field';
//     const prev = answers.catAmounts[cat] || '';
//     field.innerHTML = `
//       <label for="amt_${cat}"><i class="fa-solid ${CAT_META[cat] || 'fa-circle-dollar-to-slot'}" style="color:var(--gold);margin-right:8px;"></i>${cat}</label>
//       <input type="number" min="0" id="amt_${cat}" data-cat="${cat}" placeholder="Monthly amount" value="${prev}"/>`;
//     wrap.appendChild(field);
//   });
// }

// /* --- navigation --- */
// function showStep(n) {
//   document.querySelectorAll('.step').forEach((s) => {
//     s.classList.toggle('active', Number(s.dataset.step) === n);
//   });
//   document.getElementById('stepNum').textContent = n;
//   document.getElementById('progressBar').style.width = (n / TOTAL_STEPS) * 100 + '%';
//   document.getElementById('backBtn').disabled = n === 1;
//   document.getElementById('nextBtn').textContent = n === TOTAL_STEPS ? 'Finish' : 'Continue';
//   if (n === 3) buildCategoryAmounts();
// }

// function collectStep(n) {
//   if (n === 1) answers.income = Number(document.getElementById('income').value) || 0;
//   if (n === 2) {
//     answers.categories = [...document.querySelectorAll('#categoryChips .chip.selected')].map((c) => c.dataset.value);
//   }
//   if (n === 3) {
//     answers.catAmounts = {};
//     document.querySelectorAll('#catAmounts input').forEach((inp) => {
//       answers.catAmounts[inp.dataset.cat] = Number(inp.value) || 0;
//     });
//   }
//   if (n === 4) {
//     const sel = document.querySelector('#goalChips .chip.selected');
//     answers.goalType = sel ? sel.dataset.value : '';
//     answers.goalTarget = Number(document.getElementById('goalTarget').value) || 0;
//     answers.goalSaved = Number(document.getElementById('goalSaved').value) || 0;
//   }
//   if (n === 5) {
//     const sel = document.querySelector('#styleChips .chip.selected');
//     answers.moneyStyle = sel ? sel.dataset.value : '';
//   }
// }

// function nextStep() {
//   collectStep(step);
//   if (step < TOTAL_STEPS) {
//     step++;
//     showStep(step);
//   } else {
//     finish();
//   }
// }

// function prevStep() {
//   if (step > 1) {
//     collectStep(step);
//     step--;
//     showStep(step);
//   }
// }

// /* --- finish: persist data + seed transactions, budgets and goal --- */
// function finish() {
//   collectStep(step);
//   const data = getData();
//   const today = new Date().toISOString().slice(0, 10);

//   data.profile = {
//     onboarded: true,
//     income: answers.income,
//     categories: answers.categories,
//     moneyStyle: answers.moneyStyle,
//     goalType: answers.goalType,
//   };

//   // Income as an opening transaction.
//   if (answers.income > 0) {
//     data.transactions.push({ id: uid(), type: 'income', amount: answers.income, category: 'Salary', date: today, note: 'Monthly income' });
//   }

//   // One expense transaction + a budget per chosen category.
//   answers.categories.forEach((cat) => {
//     const amt = answers.catAmounts[cat] || 0;
//     if (amt > 0) {
//       data.transactions.push({ id: uid(), type: 'expense', amount: amt, category: cat, date: today, note: 'Typical monthly spend' });
//       data.budgets[cat] = Math.round(amt * 1.15); // budget a touch above typical spend
//     }
//   });

//   // Savings goal from the answers.
//   if (answers.goalType && answers.goalTarget > 0) {
//     data.goals.push({ id: uid(), name: answers.goalType, target: answers.goalTarget, saved: answers.goalSaved, deadline: '' });
//   }

//   saveData(data);
//   window.location.href = 'dashboard.html';
// }

// showStep(1);
