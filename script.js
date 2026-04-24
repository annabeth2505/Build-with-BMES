// Bonus level unlock system using localStorage
// Levels are unlocked sequentially: base → 1 → 2 → 3 → 4 → 5

const STORAGE_KEY = 'traffic-light-progress';
const TOTAL_LEVELS = 5; // bonus levels; base is always unlocked

function getProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { baseDone: false, unlocked: 0, completed: [] };
  try { return JSON.parse(raw); } catch { return { baseDone: false, unlocked: 0, completed: [] }; }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function renderLevels() {
  const p = getProgress();
  // Base level button
  const baseBtn = document.querySelector('#base-done-btn');
  if (baseBtn) {
    if (p.baseDone) {
      baseBtn.classList.add('done');
      baseBtn.textContent = 'Base complete';
    }
  }

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const level = document.querySelector(`#level-${i}`);
    if (!level) continue;
    const status = level.querySelector('.level-status');
    const btn = level.querySelector('.unlock-btn');
    const isUnlocked = p.unlocked >= i;
    const isDone = p.completed.includes(i);

    if (!isUnlocked) {
      level.classList.add('locked');
      status.className = 'level-status locked-tag';
      status.textContent = '🔒 Locked';
    } else {
      level.classList.remove('locked');
      if (isDone) {
        status.className = 'level-status done-tag';
        status.textContent = '✓ Done';
        if (btn) { btn.classList.add('done'); btn.textContent = 'Completed'; }
      } else {
        status.className = 'level-status active-tag';
        status.textContent = '→ Unlocked';
      }
    }
  }
}

function markBaseDone() {
  const p = getProgress();
  p.baseDone = true;
  if (p.unlocked < 1) p.unlocked = 1;
  saveProgress(p);
  renderLevels();
  const nextLvl = document.querySelector('#level-1');
  if (nextLvl) nextLvl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function completeLevel(n) {
  const p = getProgress();
  if (!p.completed.includes(n)) p.completed.push(n);
  if (p.unlocked < n + 1 && n < TOTAL_LEVELS) p.unlocked = n + 1;
  saveProgress(p);
  renderLevels();
  const next = document.querySelector(`#level-${n + 1}`);
  if (next) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetProgress() {
  if (!confirm('Reset all traffic-light progress? This will re-lock the bonus levels.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderLevels();
  const base = document.querySelector('#base-done-btn');
  if (base) { base.classList.remove('done'); base.textContent = "I got the base working! 🔓"; }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', renderLevels);

/* ================================================================ */
/* ============== TINKERCAD WINDOW + DRAWER + MODAL =============== */
/* ================================================================ */

const SETUP_KEY = 'spark-setup-shown';
const TINKERCAD_URL = 'https://www.tinkercad.com/dashboard';

function openTinkercad() {
  // Open in a sized popup window so students can place it side-by-side with the guide.
  // If the popup is blocked, fall back to a normal new tab.
  const w = Math.min(screen.availWidth * 0.55, 1200);
  const h = screen.availHeight - 40;
  const left = 0;
  const top = 0;
  const features = `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`;
  const win = window.open(TINKERCAD_URL, 'tinkercad-window', features);
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // popup blocked — open in new tab
    window.open(TINKERCAD_URL, '_blank');
  } else {
    // shrink the guide window so they fit side-by-side
    try {
      window.resizeTo(screen.availWidth - w, h);
      window.moveTo(w, 0);
    } catch (e) { /* some browsers block resize on non-popups, that's fine */ }
  }
}

function toggleDrawer(force) {
  const drawer = document.getElementById('hint-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer) return;
  const shouldOpen = force === undefined ? !drawer.classList.contains('open') : force;
  drawer.classList.toggle('open', shouldOpen);
  backdrop.classList.toggle('open', shouldOpen);
}

function showSetupModal() {
  const m = document.getElementById('setup-modal');
  if (m) m.classList.add('open');
}
function dismissSetupModal(openTk) {
  const m = document.getElementById('setup-modal');
  if (m) m.classList.remove('open');
  localStorage.setItem(SETUP_KEY, '1');
  if (openTk) openTinkercad();
}

document.addEventListener('DOMContentLoaded', () => {
  // Show setup modal on first visit to any project page
  if (document.querySelector('.proj-hero') && !localStorage.getItem(SETUP_KEY)) {
    setTimeout(showSetupModal, 400);
  }
  // ESC closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDrawer(false);
  });
});
