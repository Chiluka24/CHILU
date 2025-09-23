const nav = document.getElementById('nav');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
const yearEl = document.getElementById('year');

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
});

function onScroll() {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', onScroll);
onScroll();

menuButton.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
}));

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Pricing toggle
const toggle = document.getElementById('billingToggle');
const labelMonthly = document.getElementById('labelMonthly');
const labelAnnual = document.getElementById('labelAnnual');
const saveBadge = document.getElementById('saveBadge');
const proStrike = document.getElementById('proStrike');

let annual = false;
function updatePrices() {
  document.querySelectorAll('.plan .amount').forEach(el => {
    const month = el.getAttribute('data-month');
    const year = el.getAttribute('data-year');
    const value = annual ? year : month;
    if (value) el.textContent = `$${value}`;
  });
  if (annual) {
    labelAnnual.classList.add('text-primary','font-medium');
    labelMonthly.classList.remove('text-primary','font-medium');
    labelMonthly.classList.add('text-muted-foreground');
    saveBadge.classList.remove('hidden');
    const knob = toggle.querySelector('div');
    if (knob) knob.style.transform = 'translateX(28px)';
    if (proStrike) { proStrike.classList.remove('hidden'); proStrike.textContent = '$12.99/month'; }
  } else {
    labelAnnual.classList.remove('text-primary','font-medium');
    labelMonthly.classList.remove('text-muted-foreground');
    labelMonthly.classList.add('text-primary','font-medium');
    saveBadge.classList.add('hidden');
    const knob = toggle.querySelector('div');
    if (knob) knob.style.transform = 'translateX(4px)';
    if (proStrike) { proStrike.classList.add('hidden'); }
  }
}

if (toggle) {
  toggle.addEventListener('click', () => {
    annual = !annual;
    updatePrices();
  });
  updatePrices();
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const container = btn.parentElement?.parentElement;
    if (!container) return;
    const answer = container.querySelector('.faq-a');
    if (!answer) return;
    const plus = btn.querySelector('.plus');
    const isOpen = !answer.classList.contains('hidden');
    if (isOpen) {
      answer.classList.add('hidden');
      if (plus) plus.textContent = '+';
    } else {
      answer.classList.remove('hidden');
      if (plus) plus.textContent = '−';
    }
  });
});


