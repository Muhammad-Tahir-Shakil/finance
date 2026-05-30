/* landing.js — money-style picker + animated trust counters */

const moneyStyles = {
  planner: { icon: 'fa-calendar-check', title: 'The Careful Planner', text: 'You feel most confident when your financial life is organized before decisions arrive. A clear plan helps you stay calm, prepared, and in control.', label: 'Clarity Match', value: '88%', width: '88%', tip: 'Keep your upcoming bills, monthly limits, and savings targets visible so your next move always feels obvious.' },
  saver: { icon: 'fa-vault', title: 'The Smart Saver', text: 'You are motivated by progress. Even small wins matter to you, because every saved amount feels like a step toward more freedom.', label: 'Progress Match', value: '92%', width: '92%', tip: 'Track your goals in small milestones so your progress feels real, rewarding, and easy to continue.' },
  spender: { icon: 'fa-magnifying-glass-chart', title: 'The Curious Spender', text: 'You do not just want numbers. You want answers. Seeing patterns helps you understand your habits without turning money into stress.', label: 'Insight Match', value: '84%', width: '84%', tip: 'Review your spending categories often so you can spot quiet patterns before they become expensive habits.' },
  chaser: { icon: 'fa-bullseye', title: 'The Goal Chaser', text: 'You are driven by visible targets. When you can see the finish line, saving and planning feel more exciting and achievable.', label: 'Momentum Match', value: '90%', width: '90%', tip: 'Break big goals into smaller checkpoints so every completed step gives you a reason to keep going.' }
};

const styleCards = document.querySelectorAll('.style-card');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const meterLabel = document.getElementById('meterLabel');
const meterValue = document.getElementById('meterValue');
const meterFill = document.getElementById('meterFill');
const resultTip = document.getElementById('resultTip');

styleCards.forEach((card) => {
  card.addEventListener('click', () => {
    const data = moneyStyles[card.dataset.style];
    styleCards.forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    resultIcon.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
    resultTitle.textContent = data.title;
    resultText.textContent = data.text;
    meterLabel.textContent = data.label;
    meterValue.textContent = data.value;
    meterFill.style.width = data.width;
    resultTip.textContent = data.tip;
  });
});

/* animated trust counters */
const trustCounters = document.querySelectorAll('.trust-count');

function runTrustCounters() {
  trustCounters.forEach((counter) => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const speed = Math.max(12, Math.floor(900 / target));
    const tick = () => {
      current += 1;
      counter.textContent = current;
      if (current < target) setTimeout(tick, speed);
    };
    tick();
  });
}

const trustSection = document.querySelector('.trust-section');
let trustStarted = false;

if (trustSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !trustStarted) {
        trustStarted = true;
        runTrustCounters();
      }
    });
  }, { threshold: 0.35 });
  observer.observe(trustSection);
}
