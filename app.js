'use strict';


function loadSampleData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  state.transactions = [
    { id: '1', description: 'Tech Corp Salary', amount: 4500, type: 'income', category: 'Salary', date: `${year}-${month}-01`, notes: 'Monthly salary', createdAt: Date.now() },
    { id: '2', description: 'Apartment Rent', amount: 1200, type: 'expense', category: 'Rent', date: `${year}-${month}-03`, notes: '', createdAt: Date.now() },
    { id: '3', description: 'Groceries', amount: 150, type: 'expense', category: 'Food', date: `${year}-${month}-05`, notes: 'Whole Foods', createdAt: Date.now() },
    { id: '4', description: 'Electric Bill', amount: 80, type: 'expense', category: 'Utilities', date: `${year}-${month}-10`, notes: '', createdAt: Date.now() },
    { id: '5', description: 'Freelance Project', amount: 800, type: 'income', category: 'Freelance', date: `${year}-${month}-15`, notes: 'Website design', createdAt: Date.now() },
    { id: '6', description: 'Netflix Subscription', amount: 15, type: 'expense', category: 'Entertainment', date: `${year}-${month}-18`, notes: '', createdAt: Date.now() }
  ];
  
  state.budgets = {
    'Food': 500,
    'Rent': 1500,
    'Utilities': 200,
    'Entertainment': 100
  };
  
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  const fDateStr = futureDate.toISOString().split('T')[0];
  
  state.goals = [
    { id: 'g1', name: 'Emergency Fund', target: 10000, current: 4500, date: fDateStr, emoji: '🏦', createdAt: Date.now() },
    { id: 'g2', name: 'Vacation', target: 2000, current: 500, date: fDateStr, emoji: '✈️', createdAt: Date.now() }
  ];
  
  saveState();
  renderDashboard();
  updateBadges();
  showToast('Sample data loaded successfully!', 'success');
}

/* ============================================================
   1. APP STATE & LOCALSTORAGE
============================================================ */
const STORAGE_KEYS = {
  transactions: 'bw_transactions',
  budgets: 'bw_budgets',
  goals: 'bw_goals',
  settings: 'bw_settings',
  initialized: 'bw_initialized'
};

let state = {
  transactions: [],
  budgets: {},
  goals: [],
  settings: {
    name: 'User',
    currency: '$',
    incomeGoal: 0,
    darkMode: false
  }
};

let barChartInst = null;
let doughnutChartInst = null;
let trendChartInst = null;

const CATEGORIES = ['Salary','Freelance','Investment','Food','Rent','Transport','Entertainment','Health','Shopping','Education','Utilities','Other'];
const EXPENSE_CATS = ['Food','Rent','Transport','Entertainment','Health','Shopping','Education','Utilities','Other'];
const CAT_ICONS = {
  Salary:'💼', Freelance:'💻', Investment:'📈', Food:'🍔', Rent:'🏠',
  Transport:'🚗', Entertainment:'🎬', Health:'❤️', Shopping:'🛍️',
  Education:'📚', Utilities:'💡', Other:'📦'
};
const CAT_COLORS = {
  Food:'#f43f5e', Rent:'#3b82f6', Transport:'#f59e0b', Entertainment:'#8b5cf6',
  Health:'#10b981', Shopping:'#f97316', Other:'#6b7280', Salary:'#10b981',
  Freelance:'#14b8a6', Investment:'#3b82f6', Education:'#8b5cf6', Utilities:'#06b6d4'
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(state.budgets));
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(state.goals));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  } catch(e) {
    showToast('Storage error: ' + e.message, 'error');
  }
}

function loadState() {
  try {
    const tx = localStorage.getItem(STORAGE_KEYS.transactions);
    const bud = localStorage.getItem(STORAGE_KEYS.budgets);
    const goals = localStorage.getItem(STORAGE_KEYS.goals);
    const settings = localStorage.getItem(STORAGE_KEYS.settings);
    if (tx) state.transactions = JSON.parse(tx);
    if (bud) state.budgets = JSON.parse(bud);
    if (goals) state.goals = JSON.parse(goals);
    if (settings) state.settings = { ...state.settings, ...JSON.parse(settings) };
  } catch(e) {
    console.error('Load state error:', e);
  }
}

/* ============================================================
   2. INITIALIZATION — No sample data, clean start
============================================================ */
function initSampleData() {
  // Mark app as initialized with empty data — no sample data loaded
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return;
  state.transactions = [];
  state.budgets = {};
  state.goals = [];
  state.settings = { name: 'User', currency: '$', incomeGoal: 0, darkMode: false };
  saveState();
  localStorage.setItem(STORAGE_KEYS.initialized, '1');
}

function getFutureDate(days) {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

function getPrevMonthDate(y, m, day) {
  let pm = m - 1; let py = y;
  if (pm < 0) { pm = 11; py--; }
  const maxDay = new Date(py, pm+1, 0).getDate();
  return `${py}-${String(pm+1).padStart(2,'0')}-${String(Math.min(day,maxDay)).padStart(2,'0')}`;
}

/* ============================================================
   3. NAVIGATION
============================================================ */
const SECTIONS = ['dashboard','transactions','budget','goals','reports','settings'];
const SECTION_TITLES = {
  dashboard: 'Dashboard', transactions: 'Transactions',
  budget: 'Budget Planner', goals: 'Savings Goals',
  reports: 'Reports & Analytics', settings: 'Settings'
};

let currentSection = 'dashboard';

function navigateTo(section) {
  SECTIONS.forEach(s => {
    document.getElementById('section-'+s).classList.remove('active');
    const navEl = document.querySelector(`[data-section="${s}"]`);
    if (navEl) navEl.classList.remove('active');
  });

  document.getElementById('section-'+section).classList.add('active');
  const activeNav = document.querySelector(`[data-section="${section}"]`);
  if (activeNav) activeNav.classList.add('active');

  document.getElementById('headerTitle').textContent = SECTION_TITLES[section];
  currentSection = section;

  if (section === 'dashboard')    renderDashboard();
  if (section === 'transactions') renderTransactions();
  if (section === 'budget')       renderBudget();
  if (section === 'goals')        renderGoals();
  if (section === 'reports')      renderReports();
  if (section === 'settings')     loadSettingsForm();

  closeMobileSidebar();
}

let sidebarCollapsed = false;

function toggleSidebar() {
  if (window.innerWidth <= 768) { openMobileSidebar(); return; }
  sidebarCollapsed = !sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', sidebarCollapsed);
  document.getElementById('main-content').classList.toggle('sidebar-collapsed', sidebarCollapsed);
  document.getElementById('sidebarToggleIcon').className = sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
}

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebar-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

/* ============================================================
   4. DASHBOARD
============================================================ */
function renderDashboard() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTxs = state.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalIncome  = monthTxs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  const netBalance   = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

  animateCounter('dash-income', totalIncome, true);
  animateCounter('dash-expense', totalExpense, true);

  const balanceEl = document.getElementById('dash-balance');
  balanceEl.style.color = netBalance >= 0 ? 'var(--blue)' : 'var(--red)';
  balanceEl.textContent = (netBalance < 0 ? '-' : '') + formatCurrency(Math.abs(netBalance));

  document.getElementById('dash-savings-rate').textContent = savingsRate + '%';

  // Show/hide welcome card
  const wc = document.getElementById('welcomeCard');
  if (state.transactions.length === 0) {
    wc.style.display = 'block';
  } else {
    wc.style.display = 'none';
  }

  renderBarChart();
  renderDoughnutChart();
  renderRecentTransactions();
  updateBadges();
  populateYearSelect();
}

function renderRecentTransactions() {
  const tbody = document.getElementById('recentTxBody');
  const recent = [...state.transactions]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state" style="padding:32px 20px;">
        <span class="empty-emoji" style="font-size:40px;">📭</span>
        <p>No transactions yet. Add your first one!</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(tx => `
    <tr class="tr-${tx.type}">
      <td><span class="fw-700">${escHtml(tx.description)}</span></td>
      <td><span class="badge badge-category">${CAT_ICONS[tx.category]||'📦'} ${tx.category}</span></td>
      <td style="color:var(--text-secondary);font-size:12.5px;">${getRelativeDate(tx.date)}</td>
      <td><span class="badge badge-${tx.type}">${tx.type === 'income' ? '↑ Income' : '↓ Expense'}</span></td>
      <td class="text-right ${tx.type==='income'?'text-income':'text-expense'}">
        ${tx.type==='income'?'+':'-'}${formatCurrency(tx.amount)}
      </td>
    </tr>
  `).join('');
}

function populateYearSelect() {
  const sel = document.getElementById('chartYearSelect');
  const years = [...new Set(state.transactions.map(t => new Date(t.date).getFullYear()))];
  const curr = new Date().getFullYear();
  if (!years.includes(curr)) years.push(curr);
  years.sort((a,b) => b-a);
  const currentVal = sel.value || String(curr);
  sel.innerHTML = years.map(y => `<option value="${y}" ${y == currentVal ? 'selected' : ''}>${y}</option>`).join('');
}

/* ============================================================
   5. CHARTS
============================================================ */
function getChartColors() {
  const isDark = document.body.classList.contains('dark-mode');
  return {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: isDark ? '#7c94b6' : '#64748b',
    tooltip: isDark ? '#0f1623' : '#0d1117'
  };
}

function renderBarChart() {
  const sel = document.getElementById('chartYearSelect');
  const year = sel ? parseInt(sel.value) || new Date().getFullYear() : new Date().getFullYear();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const incomeData  = Array(12).fill(0);
  const expenseData = Array(12).fill(0);

  state.transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    if (tx.type === 'income') incomeData[m] += tx.amount;
    else expenseData[m] += tx.amount;
  });

  const ctx = document.getElementById('barChart').getContext('2d');
  if (barChartInst) barChartInst.destroy();

  const c = getChartColors();

  barChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(244,63,94,0.7)',
          borderColor: '#f43f5e',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: c.text, font: { family: 'Sora', size: 12 }, boxWidth: 10, usePointStyle: true, pointStyle: 'circle' }
        },
        tooltip: {
          backgroundColor: c.tooltip,
          titleColor: '#fff', bodyColor: '#94a3b8',
          cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
        }
      },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.text, font: { family: 'Sora' } } },
        y: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { family: 'Sora' }, callback: v => state.settings.currency + v.toLocaleString() },
          beginAtZero: true
        }
      },
      interaction: { intersect: false, mode: 'index' },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

function renderDoughnutChart() {
  const expenseTxs = state.transactions.filter(t => t.type === 'expense');
  const catTotals = {};
  expenseTxs.forEach(t => { catTotals[t.category] = (catTotals[t.category]||0) + t.amount; });

  const labels = Object.keys(catTotals);
  const data   = Object.values(catTotals);
  const colors = labels.map(l => CAT_COLORS[l] || '#6b7280');

  const ctx = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutChartInst) doughnutChartInst.destroy();

  const isDark = document.body.classList.contains('dark-mode');
  const c = getChartColors();

  if (labels.length === 0) {
    doughnutChartInst = null;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  doughnutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: isDark ? '#0f1623' : '#fff',
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: c.text, font: { family: 'Sora', size: 11 }, boxWidth: 10, usePointStyle: true, pointStyle: 'circle', padding: 12 }
        },
        tooltip: {
          backgroundColor: c.tooltip,
          titleColor: '#fff', bodyColor: '#94a3b8',
          cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${((ctx.raw/data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)` }
        }
      }
    }
  });
}

function renderTrendChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = new Date().getFullYear();
  const incomeData  = Array(12).fill(0);
  const expenseData = Array(12).fill(0);

  state.transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    if (tx.type === 'income') incomeData[m] += tx.amount;
    else expenseData[m] += tx.amount;
  });

  const ctx = document.getElementById('trendChart').getContext('2d');
  if (trendChartInst) trendChartInst.destroy();

  const c = getChartColors();

  trendChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointRadius: 5, pointHoverRadius: 8,
          fill: true, tension: 0.4
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244,63,94,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#f43f5e',
          pointRadius: 5, pointHoverRadius: 8,
          fill: true, tension: 0.4
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: c.text, font: { family: 'Sora', size: 12 }, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: {
          backgroundColor: c.tooltip,
          titleColor: '#fff', bodyColor: '#94a3b8',
          cornerRadius: 10, padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
        }
      },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.text, font: { family: 'Sora' } } },
        y: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { family: 'Sora' }, callback: v => state.settings.currency + v.toLocaleString() },
          beginAtZero: true
        }
      },
      interaction: { intersect: false, mode: 'index' },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

/* ============================================================
   6. TRANSACTIONS CRUD
============================================================ */
let filteredTransactions = [];

function renderTransactions() {
  const today = new Date().toISOString().split('T')[0];
  if (!document.getElementById('dateInput').value) {
    document.getElementById('dateInput').value = today;
  }
  filterTransactions();
  updateBadges();
}

function filterTransactions() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const type   = document.getElementById('filterType').value;
  const cat    = document.getElementById('filterCategory').value;
  const from   = document.getElementById('filterDateFrom').value;
  const to     = document.getElementById('filterDateTo').value;
  const sort   = document.getElementById('sortBy').value;

  filteredTransactions = state.transactions.filter(tx => {
    if (type !== 'all' && tx.type !== type) return false;
    if (cat !== 'all' && tx.category !== cat) return false;
    if (from && tx.date < from) return false;
    if (to && tx.date > to) return false;
    if (search && !tx.description.toLowerCase().includes(search) &&
        !tx.category.toLowerCase().includes(search) &&
        !(tx.notes||'').toLowerCase().includes(search)) return false;
    return true;
  });

  filteredTransactions.sort((a,b) => {
    if (sort === 'date-desc')   return new Date(b.date) - new Date(a.date);
    if (sort === 'date-asc')    return new Date(a.date) - new Date(b.date);
    if (sort === 'amount-desc') return b.amount - a.amount;
    if (sort === 'amount-asc')  return a.amount - b.amount;
    if (sort === 'category')    return a.category.localeCompare(b.category);
    return 0;
  });

  renderTransactionTable(filteredTransactions);
  document.getElementById('txCount').textContent =
    `${filteredTransactions.length} of ${state.transactions.length} transactions`;
}

function renderTransactionTable(txs) {
  const tbody = document.getElementById('txTableBody');
  if (txs.length === 0) {
    if (state.transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state">
          <span class="empty-emoji" style="font-size: 48px; margin-bottom: 16px; display: inline-block; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">💸</span>
          <h3>No transactions yet</h3>
          <p>Fill in the form above to log your first income or expense.</p>
        </div>
      </td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state">
          <span class="empty-emoji" style="font-size: 48px; margin-bottom: 16px; display: inline-block; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">🔍</span>
          <h3>No results found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </td></tr>`;
    }
    return;
  }

  tbody.innerHTML = txs.map(tx => `
    <tr class="tr-${tx.type}">
      <td><span class="fw-700">${escHtml(tx.description)}</span></td>
      <td><span class="badge badge-category">${CAT_ICONS[tx.category]||'📦'} ${tx.category}</span></td>
      <td style="color:var(--text-secondary);font-size:12.5px;white-space:nowrap;">${getRelativeDate(tx.date)}</td>
      <td style="color:var(--text-secondary);font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(tx.notes||'')}">
        ${tx.notes ? escHtml(tx.notes) : '<span style="color:var(--text-muted);">—</span>'}
      </td>
      <td><span class="badge badge-${tx.type}">${tx.type==='income'?'↑ Income':'↓ Expense'}</span></td>
      <td class="text-right fw-700 ${tx.type==='income'?'text-income':'text-expense'}">
        ${tx.type==='income'?'+':'-'}${formatCurrency(tx.amount)}
      </td>
      <td class="text-right" style="white-space:nowrap;">
        <button class="btn btn-outline btn-sm btn-icon" onclick="editTransaction('${tx.id}')" data-tooltip="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDeleteTransaction('${tx.id}')" data-tooltip="Delete" style="margin-left:6px;">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function handleTransactionSubmit(e) {
  e.preventDefault();
  if (!validateTransactionForm()) return;

  const id   = document.getElementById('editTxId').value;
  const type = document.querySelector('input[name="txType"]:checked').value;
  const tx = {
    id: id || String(Date.now()),
    description: document.getElementById('descInput').value.trim(),
    amount: parseFloat(document.getElementById('amountInput').value),
    type,
    category: document.getElementById('categoryInput').value,
    date: document.getElementById('dateInput').value,
    notes: document.getElementById('notesInput').value.trim(),
    createdAt: id ? (state.transactions.find(t=>t.id===id)?.createdAt || Date.now()) : Date.now()
  };

  if (id) {
    const idx = state.transactions.findIndex(t => t.id === id);
    if (idx !== -1) state.transactions[idx] = tx;
    showToast('Transaction updated!', 'success');
  } else {
    state.transactions.unshift(tx);
    showToast('Transaction added!', 'success');
  }

  saveState();
  resetTransactionForm();
  filterTransactions();
  updateBadges();
}

function validateTransactionForm() {
  const desc   = document.getElementById('descInput').value.trim();
  const amount = document.getElementById('amountInput').value;
  const cat    = document.getElementById('categoryInput').value;
  const date   = document.getElementById('dateInput').value;

  setFieldError('descInput','descError', !desc);
  setFieldError('amountInput','amountError', !amount || parseFloat(amount) <= 0);
  setFieldError('categoryInput','categoryError', !cat);
  setFieldError('dateInput','dateError', !date);

  return !!(desc && amount && parseFloat(amount) > 0 && cat && date);
}

function setFieldError(fieldId, errId, show) {
  document.getElementById(fieldId).classList.toggle('error', show);
  document.getElementById(errId).classList.toggle('show', show);
}

function editTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  document.getElementById('editTxId').value = tx.id;
  document.getElementById('descInput').value = tx.description;
  document.getElementById('amountInput').value = tx.amount;
  document.getElementById('categoryInput').value = tx.category;
  document.getElementById('dateInput').value = tx.date;
  document.getElementById('notesInput').value = tx.notes || '';
  document.querySelector(`input[name="txType"][value="${tx.type}"]`).checked = true;

  document.getElementById('formCardTitle').innerHTML = '<i class="fas fa-edit text-blue"></i> Edit Transaction';
  document.getElementById('txSubmitBtn').innerHTML = '<i class="fas fa-check"></i> Update Transaction';
  document.getElementById('cancelEditBtn').style.display = 'flex';

  scrollToAddForm();
  navigateTo('transactions');
}

function resetTransactionForm() {
  document.getElementById('transactionForm').reset();
  document.getElementById('editTxId').value = '';
  document.getElementById('type-income').checked = true;
  document.getElementById('dateInput').value = new Date().toISOString().split('T')[0];
  document.getElementById('formCardTitle').innerHTML = '<i class="fas fa-plus-circle text-blue"></i> Add New Transaction';
  document.getElementById('txSubmitBtn').innerHTML = '<i class="fas fa-check"></i> Add Transaction';
  document.getElementById('cancelEditBtn').style.display = 'none';
  ['descInput','amountInput','categoryInput','dateInput'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
  ['descError','amountError','categoryError','dateError'].forEach(id => {
    document.getElementById(id).classList.remove('show');
  });
}

function confirmDeleteTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  showConfirm(
    'Delete Transaction',
    `Are you sure you want to delete <strong>"${escHtml(tx.description)}"</strong>? This cannot be undone.`,
    () => deleteTransaction(id)
  );
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState();
  filterTransactions();
  updateBadges();
  showToast('Transaction deleted.', 'info');
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterCategory').value = 'all';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  document.getElementById('sortBy').value = 'date-desc';
  filterTransactions();
}

function scrollToAddForm() {
  document.getElementById('addTxCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => document.getElementById('descInput').focus(), 300);
}

/* ============================================================
   7. BUDGET MANAGEMENT
============================================================ */
const BUDGET_CATEGORIES = ['Food','Rent','Transport','Entertainment','Health','Shopping','Education','Utilities','Other'];

function renderBudget() {
  const grid = document.getElementById('budgetGrid');
  const warnings = document.getElementById('budgetWarnings');
  const now = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const spent = {};
  state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
  }).forEach(t => { spent[t.category] = (spent[t.category]||0) + t.amount; });

  let warnHTML = '';
  BUDGET_CATEGORIES.forEach(cat => {
    const limit = state.budgets[cat] || 0;
    const s = spent[cat] || 0;
    const pct = limit > 0 ? (s / limit) * 100 : 0;
    if (limit > 0 && pct >= 80 && pct < 100) {
      warnHTML += `<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> <strong>${cat}</strong> — ${pct.toFixed(0)}% of budget used (${formatCurrency(s)} / ${formatCurrency(limit)})</div>`;
    }
    if (limit > 0 && pct >= 100) {
      warnHTML += `<div class="alert" style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.25);color:var(--red);"><i class="fas fa-times-circle"></i> <strong>${cat}</strong> — Budget exceeded! (${formatCurrency(s)} / ${formatCurrency(limit)})</div>`;
    }
  });
  warnings.innerHTML = warnHTML;

  grid.innerHTML = BUDGET_CATEGORIES.map(cat => {
    const limit = state.budgets[cat] || 0;
    const s = spent[cat] || 0;
    const pct = limit > 0 ? Math.min((s / limit) * 100, 100) : 0;
    const remaining = Math.max(limit - s, 0);
    let barClass = 'pb-green';
    if (pct >= 80 && pct < 100) barClass = 'pb-yellow';
    if (pct >= 100) barClass = 'pb-red';

    return `
      <div class="budget-item">
        <div class="budget-item-header">
          <div class="budget-category-name">
            <div class="cat-icon" style="background:${hexToRgba(CAT_COLORS[cat]||'#6b7280',0.12)};color:${CAT_COLORS[cat]||'#6b7280'};">
              ${CAT_ICONS[cat]||'📦'}
            </div>
            ${cat}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;color:var(--text-muted);">Limit:</span>
            <input class="budget-limit-input" type="number" id="budget-${cat}"
              value="${limit}" min="0" step="10" onchange="onBudgetChange('${cat}',this.value)" />
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill ${barClass}" style="width:${pct}%;"></div>
        </div>
        <div class="budget-amounts">
          <span>Spent: <strong style="color:var(--red);">${formatCurrency(s)}</strong></span>
          <span style="font-weight:700;">${pct.toFixed(0)}%</span>
          <span>Left: <strong style="color:var(--emerald);">${formatCurrency(remaining)}</strong></span>
        </div>
        ${pct >= 80 ? `<div class="budget-warning"><i class="fas fa-exclamation-triangle"></i> ${pct >= 100 ? 'Budget exceeded!' : 'Approaching limit!'}</div>` : ''}
      </div>
    `;
  }).join('');
}

function onBudgetChange(cat, val) {
  state.budgets[cat] = Math.max(parseFloat(val) || 0, 0);
}

function saveBudgets() {
  BUDGET_CATEGORIES.forEach(cat => {
    const inp = document.getElementById('budget-'+cat);
    if (inp) state.budgets[cat] = Math.max(parseFloat(inp.value)||0, 0);
  });
  saveState();
  renderBudget();
  showToast('Budgets saved!', 'success');
}

function resetBudgets() {
  showConfirm('Reset Budgets', 'Reset all budget limits to zero?', () => {
    BUDGET_CATEGORIES.forEach(cat => state.budgets[cat] = 0);
    saveState();
    renderBudget();
    showToast('Budgets reset.', 'info');
  });
}

/* ============================================================
   8. SAVINGS GOALS
============================================================ */
function renderGoals() {
  const grid = document.getElementById('goalsGrid');
  updateBadges();

  if (state.goals.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <span class="empty-emoji" style="font-size: 48px; margin-bottom: 16px; display: inline-block; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">🎯</span>
      <h3>No savings goals yet</h3>
      <p>Define a financial milestone and track your progress toward it. Every big achievement starts with a clear goal.</p>
      <button class="btn btn-success" onclick="openGoalModal()"><i class="fas fa-plus"></i> Create Your First Goal</button>
    </div>`;
    return;
  }

  grid.innerHTML = state.goals.map(goal => {
    const pct = Math.min((goal.current / goal.target) * 100, 100).toFixed(1);
    const completed = parseFloat(pct) >= 100;
    const daysLeft = Math.max(0, Math.round((new Date(goal.date) - new Date()) / 86400000));
    const barClass = pct < 50 ? 'pb-blue' : pct < 80 ? 'pb-yellow' : 'pb-green';

    return `
      <div class="goal-card ${completed ? 'completed' : ''}">
        ${completed ? '<div class="celebration">🎉</div>' : ''}
        <span class="goal-emoji">${goal.emoji || '🎯'}</span>
        <div class="goal-name">${escHtml(goal.name)}</div>
        <div class="goal-target">${formatCurrency(goal.current)} saved of ${formatCurrency(goal.target)}</div>
        <div class="goal-percent">${pct}%</div>
        <div class="progress-bar-container" style="margin:10px 0;">
          <div class="progress-bar-fill ${barClass}" style="width:${pct}%;"></div>
        </div>
        ${completed ? '<div class="alert alert-success" style="margin-top:10px;"><i class="fas fa-check-circle"></i> Goal Achieved! Congratulations! 🎊</div>' : ''}
        <div class="goal-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(goal.date)}</span>
          <span><i class="fas fa-clock"></i> ${completed ? 'Completed!' : daysLeft + ' days left'}</span>
        </div>
        <div class="goal-actions">
          <button class="btn btn-outline btn-sm" onclick="editGoal('${goal.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteGoal('${goal.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openGoalModal(id) {
  if (!id) {
    document.getElementById('goalForm').reset();
    document.getElementById('editGoalId').value = '';
    document.getElementById('goalModalTitle').textContent = 'Add Savings Goal';
    document.getElementById('goalSubmitBtn').innerHTML = '<i class="fas fa-check"></i> Save Goal';
    document.getElementById('goalDate').value = getFutureDate(365);
    document.getElementById('goalCurrent').value = 0;
    document.getElementById('goalEmoji').value = '🎯';
  }
  document.getElementById('goalModal').classList.add('show');
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.remove('show');
  document.getElementById('goalForm').reset();
  ['goalName','goalTarget','goalDate'].forEach(f => {
    const el = document.getElementById(f+'Error');
    if (el) el.classList.remove('show');
    document.getElementById(f).classList.remove('error');
  });
}

function editGoal(id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;
  document.getElementById('editGoalId').value = goal.id;
  document.getElementById('goalName').value = goal.name;
  document.getElementById('goalTarget').value = goal.target;
  document.getElementById('goalCurrent').value = goal.current;
  document.getElementById('goalDate').value = goal.date;
  document.getElementById('goalEmoji').value = goal.emoji || '🎯';
  document.getElementById('goalModalTitle').textContent = 'Edit Savings Goal';
  document.getElementById('goalSubmitBtn').innerHTML = '<i class="fas fa-check"></i> Update Goal';
  openGoalModal(id);
}

function handleGoalSubmit(e) {
  e.preventDefault();
  if (!validateGoalForm()) return;

  const id = document.getElementById('editGoalId').value;
  const goal = {
    id: id || String(Date.now()),
    name: document.getElementById('goalName').value.trim(),
    target: parseFloat(document.getElementById('goalTarget').value),
    current: parseFloat(document.getElementById('goalCurrent').value)||0,
    date: document.getElementById('goalDate').value,
    emoji: document.getElementById('goalEmoji').value.trim() || '🎯',
    createdAt: id ? (state.goals.find(g=>g.id===id)?.createdAt || Date.now()) : Date.now()
  };

  if (id) {
    const idx = state.goals.findIndex(g => g.id === id);
    if (idx !== -1) state.goals[idx] = goal;
    showToast('Goal updated!', 'success');
  } else {
    state.goals.push(goal);
    showToast('Savings goal created!', 'success');
  }

  saveState();
  closeGoalModal();
  renderGoals();
}

function validateGoalForm() {
  const name   = document.getElementById('goalName').value.trim();
  const target = document.getElementById('goalTarget').value;
  const date   = document.getElementById('goalDate').value;

  const setErr = (fId, eId, show) => {
    document.getElementById(fId).classList.toggle('error', show);
    document.getElementById(eId).classList.toggle('show', show);
  };

  setErr('goalName','goalNameError', !name);
  setErr('goalTarget','goalTargetError', !target || parseFloat(target)<=0);
  setErr('goalDate','goalDateError', !date);

  return !!(name && target && parseFloat(target)>0 && date);
}

function confirmDeleteGoal(id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;
  showConfirm('Delete Goal', `Delete goal "<strong>${escHtml(goal.name)}</strong>"? This cannot be undone.`, () => {
    state.goals = state.goals.filter(g => g.id !== id);
    saveState();
    renderGoals();
    showToast('Goal deleted.', 'info');
  });
}

/* ============================================================
   9. REPORTS
============================================================ */
function renderReports() {
  const year = new Date().getFullYear();
  document.getElementById('reportYear').textContent = year;
  renderMonthlySummaryTable(year);
  renderTrendChart();
  renderCategoryHBars();
}

function renderMonthlySummaryTable(year) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tbody = document.getElementById('monthlyTableBody');
  const currMonth = new Date().getMonth();

  tbody.innerHTML = months.map((mName, i) => {
    const txs = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === i;
    });
    const inc  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const exp  = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const net  = inc - exp;
    const rate = inc > 0 ? ((net/inc)*100).toFixed(1) : '—';
    const isCurrentMonth = i === currMonth;
    return `
      <tr style="${isCurrentMonth ? 'background:rgba(59,130,246,0.05);' : ''}">
        <td style="${isCurrentMonth ? 'font-weight:700;' : ''}">
          ${mName} ${isCurrentMonth ? '<span class="badge badge-category">Current</span>' : ''}
        </td>
        <td class="text-right text-income">${inc > 0 ? formatCurrency(inc) : '—'}</td>
        <td class="text-right text-expense">${exp > 0 ? formatCurrency(exp) : '—'}</td>
        <td class="text-right fw-700" style="color:${net>=0?'var(--emerald)':'var(--red)'}">
          ${(inc||exp) ? (net>=0?'+':'-')+formatCurrency(Math.abs(net)) : '—'}
        </td>
        <td class="text-right">${rate !== '—' ? rate+'%' : '—'}</td>
      </tr>
    `;
  }).join('');
}

function renderCategoryHBars() {
  const container = document.getElementById('catHbarContainer');
  const spent = {};
  state.transactions.filter(t => t.type==='expense').forEach(t => {
    spent[t.category] = (spent[t.category]||0) + t.amount;
  });

  const sorted = Object.entries(spent).sort((a,b)=>b[1]-a[1]);
  const maxVal = sorted.length > 0 ? sorted[0][1] : 1;

  if (sorted.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="empty-emoji" style="font-size:40px;">📊</span><p>No expense data to display yet.</p></div>`;
    return;
  }

  container.innerHTML = sorted.map(([cat, val]) => `
    <div class="hbar-row">
      <div class="hbar-label">
        <span>${CAT_ICONS[cat]||'📦'} ${cat}</span>
        <span class="fw-700">${formatCurrency(val)}</span>
      </div>
      <div class="hbar-track">
        <div class="hbar-fill" style="width:${(val/maxVal*100).toFixed(1)}%;background:${CAT_COLORS[cat]||'#6b7280'};"></div>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   10. SETTINGS
============================================================ */
function loadSettingsForm() {
  document.getElementById('settingsName').value = state.settings.name;
  document.getElementById('settingsCurrency').value = state.settings.currency;
  document.getElementById('settingsIncomeGoal').value = state.settings.incomeGoal || '';
  document.getElementById('darkModeToggle').checked = state.settings.darkMode;
}

function saveSettings() {
  const name = document.getElementById('settingsName').value.trim() || 'User';
  const currency = document.getElementById('settingsCurrency').value;
  const incomeGoal = parseFloat(document.getElementById('settingsIncomeGoal').value) || 0;

  state.settings.name = name;
  state.settings.currency = currency;
  state.settings.incomeGoal = incomeGoal;

  saveState();
  updateUserUI();
  showToast('Settings saved!', 'success');
}

function updateUserUI() {
  const name = state.settings.name;
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name.split(' ')[0];
  const emojis = ['👋', '✨', '🚀', '🌟'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  document.getElementById('headerSubtitle').textContent = `${greeting}, ${firstName}! ${randomEmoji}`;
}

function toggleDarkMode() {
  state.settings.darkMode = !state.settings.darkMode;
  document.body.classList.toggle('dark-mode', state.settings.darkMode);
  document.getElementById('darkModeBtn').innerHTML = state.settings.darkMode
    ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = state.settings.darkMode;
  saveState();
  if (currentSection === 'dashboard') { renderBarChart(); renderDoughnutChart(); }
  if (currentSection === 'reports') renderTrendChart();
}

function confirmClearData() {
  showConfirm(
    'Clear All Data',
    'Are you absolutely sure? This will permanently delete <strong>all</strong> your transactions, budgets, goals, and settings. This cannot be undone.',
    () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      state = {
        transactions: [], budgets: {}, goals: [],
        settings: { name: 'User', currency: '$', incomeGoal: 0, darkMode: false }
      };
      document.body.classList.remove('dark-mode');
      updateUserUI();
      renderDashboard();
      showToast('All data cleared.', 'info');
      navigateTo('dashboard');
    }
  );
}

/* ============================================================
   11. CSV EXPORT
============================================================ */
function exportCSV() {
  if (state.transactions.length === 0) { showToast('No transactions to export.', 'warning'); return; }
  const header = ['ID','Description','Amount','Type','Category','Date','Notes'];
  const rows = state.transactions.map(t => [
    t.id,
    `"${t.description.replace(/"/g,'""')}"`,
    t.amount.toFixed(2),
    t.type,
    t.category,
    t.date,
    `"${(t.notes||'').replace(/"/g,'""')}"`
  ].join(','));
  const csv = [header.join(','), ...rows].join('\n');
  downloadFile(csv, `budgetwise_transactions_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  showToast('Exported to CSV!', 'success');
}

/* ============================================================
   12. JSON IMPORT / EXPORT
============================================================ */
function exportJSON() {
  const data = { transactions: state.transactions, budgets: state.budgets, goals: state.goals, settings: state.settings, exportedAt: new Date().toISOString() };
  downloadFile(JSON.stringify(data, null, 2), `budgetwise_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('Data exported as JSON!', 'success');
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.transactions) state.transactions = data.transactions;
      if (data.budgets) state.budgets = data.budgets;
      if (data.goals) state.goals = data.goals;
      if (data.settings) state.settings = { ...state.settings, ...data.settings };
      saveState();
      localStorage.setItem(STORAGE_KEYS.initialized, '1');
      updateUserUI();
      navigateTo(currentSection);
      showToast('Data imported successfully!', 'success');
    } catch(err) {
      showToast('Invalid JSON file. Import failed.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   13. TOAST NOTIFICATIONS
============================================================ */
const TOAST_ICONS = {
  success: 'fa-check-circle',
  error:   'fa-times-circle',
  warning: 'fa-exclamation-triangle',
  info:    'fa-info-circle'
};

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${TOAST_ICONS[type]||'fa-info-circle'} toast-icon"></i>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ============================================================
   14. CONFIRMATION MODAL
============================================================ */
let confirmCallback = null;

function showConfirm(title, message, callback) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').innerHTML = message;
  confirmCallback = callback;
  document.getElementById('confirm-modal').classList.add('show');
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('show');
  confirmCallback = null;
}

document.getElementById('confirmActionBtn').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeConfirmModal();
});

/* ============================================================
   15. UTILITY FUNCTIONS
============================================================ */
function formatCurrency(amount) {
  const sym = state.settings.currency || '$';
  return sym + parseFloat(amount||0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function getRelativeDate(dateStr) {
  if (!dateStr) return '—';
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function updateBadges() {
  document.getElementById('txBadge').textContent = state.transactions.length;
  document.getElementById('goalsBadge').textContent = state.goals.length;
}

function animateCounter(elId, targetValue, isCurrency = false) {
  const el = document.getElementById(elId);
  if (!el) return;
  const duration = 700;
  const startTime = performance.now();
  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = targetValue * eased;
    el.textContent = isCurrency ? formatCurrency(current) : current.toFixed(1) + '%';
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isCurrency ? formatCurrency(targetValue) : targetValue.toFixed(1) + '%';
  };
  requestAnimationFrame(step);
}

/* ============================================================
   16. KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'N' || e.key === 'n') {
    navigateTo('transactions');
    setTimeout(() => document.getElementById('descInput').focus(), 200);
    showToast('Quick add transaction!', 'info', 2000);
  }
  if (e.key === 'Escape') {
    closeGoalModal();
    closeConfirmModal();
    closeMobileSidebar();
  }
});

/* ============================================================
   17. RESIZE — CHART RESPONSIVENESS
============================================================ */
window.addEventListener('resize', () => {
  if (barChartInst) barChartInst.resize();
  if (doughnutChartInst) doughnutChartInst.resize();
  if (trendChartInst) trendChartInst.resize();
});

/* ============================================================
   18. CLOSE MODALS ON OVERLAY CLICK
============================================================ */
document.getElementById('goalModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('goalModal')) closeGoalModal();
});
document.getElementById('confirm-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirm-modal')) closeConfirmModal();
});

/* ============================================================
   19. INIT
============================================================ */
function init() {
  loadState();
  initSampleData();
  loadState();

  if (state.settings.darkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-sun"></i>';
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = true;
  }

  updateUserUI();
  document.getElementById('dateInput').value = new Date().toISOString().split('T')[0];
  populateYearSelect();
  renderDashboard();
  updateBadges();

  console.log('✅ BudgetWise v2.0 initialized');
}

document.addEventListener('DOMContentLoaded', init);