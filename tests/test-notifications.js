#!/usr/bin/env node
/* Unit tests for collectAlerts — run: node tests/test-notifications.js */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '../js/notifications.js'), 'utf8');
const storageHelpers = fs.readFileSync(path.join(__dirname, '../js/storage.js'), 'utf8');

const helperBlock = storageHelpers.match(
  /function money[\s\S]*?function sumByType[\s\S]*?}\n/
)[0];

const ctx = { console, Date, Math, String, Number, Boolean, Array, Object, JSON, isNaN: global.isNaN };
vm.createContext(ctx);
vm.runInContext(helperBlock + '\n' + code, ctx);

const { collectAlerts } = ctx;

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

function baseData() {
  return {
    profile: { onboarded: true },
    transactions: [],
    budgets: {},
    goals: [],
    subscriptions: [],
    netWorth: { assets: [], liabilities: [], history: [] },
  };
}

const month = new Date().toISOString().slice(0, 7);

console.log('\nNotification alerts tests\n');

// Budget exceeded
{
  const data = baseData();
  data.budgets = { Food: 1000 };
  data.transactions = [
    { id: '1', type: 'expense', category: 'Food', amount: 2000, date: `${month}-15` },
  ];
  const alerts = collectAlerts(data);
  const over = alerts.find((a) => a.id === 'budget-over-Food');
  assert(!!over, 'Food budget over limit triggers error alert');
  assert(over.severity === 'error', 'Budget exceeded is error severity');
  assert(over.message.includes('$2,000'), 'Alert message shows spent amount');
}

// Budget warning at 80%+
{
  const data = baseData();
  data.budgets = { Transport: 1000 };
  data.transactions = [
    { id: '1', type: 'expense', category: 'Transport', amount: 850, date: `${month}-10` },
  ];
  const alerts = collectAlerts(data);
  assert(alerts.some((a) => a.id === 'budget-warn-Transport'), 'Budget at 85% triggers warning');
  assert(!alerts.some((a) => a.id === 'budget-over-Transport'), 'Budget under limit is not error');
}

// No budget alerts when within limits
{
  const data = baseData();
  data.budgets = { Food: 1000 };
  data.transactions = [
    { id: '1', type: 'expense', category: 'Food', amount: 500, date: `${month}-10` },
  ];
  const alerts = collectAlerts(data).filter((a) => a.type === 'budget');
  assert(alerts.length === 0, 'No budget alerts when spending is healthy');
}

// Goal overdue
{
  const data = baseData();
  data.goals = [{
    id: 'g1', name: 'Vacation', category: 'travel', target: 5000, saved: 1000,
    deadline: '2020-01-01', priority: 'medium', completed: false,
  }];
  const alerts = collectAlerts(data);
  assert(alerts.some((a) => a.id === 'goal-overdue-g1'), 'Overdue goal triggers alert');
}

// Goal due soon
{
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  const data = baseData();
  data.goals = [{
    id: 'g2', name: 'Emergency', category: 'emergency', target: 10000, saved: 2000,
    deadline: soon.toISOString().slice(0, 10), priority: 'high', completed: false,
  }];
  const alerts = collectAlerts(data);
  assert(alerts.some((a) => a.id === 'goal-due-g2'), 'Goal due within 7 days triggers alert');
}

// Completed goals ignored
{
  const data = baseData();
  data.goals = [{
    id: 'g3', name: 'Done', category: 'custom', target: 1000, saved: 1000,
    deadline: '2020-01-01', priority: 'low', completed: true,
  }];
  const alerts = collectAlerts(data).filter((a) => a.type === 'goal');
  assert(alerts.length === 0, 'Completed goals produce no alerts');
}

// Spending exceeds income
{
  const data = baseData();
  data.transactions = [
    { id: '1', type: 'income', category: 'Salary', amount: 3000, date: `${month}-01` },
    { id: '2', type: 'expense', category: 'Food', amount: 4000, date: `${month}-05` },
  ];
  const alerts = collectAlerts(data);
  assert(alerts.some((a) => a.id === 'insight-overspend'), 'Overspending triggers insight alert');
}

// Subscription renewal soon
{
  const renew = new Date();
  renew.setDate(renew.getDate() + 2);
  const data = baseData();
  data.subscriptions = [{
    id: 's1', name: 'Netflix', amount: 15, renewDate: renew.toISOString().slice(0, 10),
    category: 'Streaming', cycle: 'monthly', active: true,
  }];
  const alerts = collectAlerts(data);
  assert(alerts.some((a) => a.id === 'sub-renew-s1'), 'Upcoming subscription renewal triggers alert');
}

// Empty data — no alerts
{
  const alerts = collectAlerts(baseData());
  assert(alerts.length === 0, 'Empty data produces no alerts');
}

// Severity sorting — errors first
{
  const data = baseData();
  data.budgets = { Food: 1000 };
  data.transactions = [
    { id: '1', type: 'income', category: 'Salary', amount: 2000, date: `${month}-01` },
    { id: '2', type: 'expense', category: 'Food', amount: 2000, date: `${month}-05` },
  ];
  const alerts = collectAlerts(data);
  assert(alerts[0].severity === 'error', 'Error alerts sorted before warnings');
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
