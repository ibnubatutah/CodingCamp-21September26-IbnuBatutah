// ===========================
// 1. State
// ===========================

let transactions = [];   // single source of truth for all expense data
let chartInstance = null; // holds the Chart.js pie chart instance

// ===========================
// 2. DOM References
// ===========================

const expenseForm     = document.getElementById('expense-form');
const itemNameInput   = document.getElementById('item-name');
const amountInput     = document.getElementById('amount');
const categorySelect  = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const emptyMessage    = document.getElementById('empty-message');
const totalDisplay    = document.getElementById('total-display');
const expenseChart    = document.getElementById('expense-chart');
const chartPlaceholder = document.getElementById('chart-placeholder');
const storageError    = document.getElementById('storage-error');
const nameError       = document.getElementById('name-error');
const amountError     = document.getElementById('amount-error');
const categoryError   = document.getElementById('category-error');

// ===========================
// 3. Storage Helpers
// ===========================

function saveToStorage() {
  try {
    localStorage.setItem('expense_transactions', JSON.stringify(transactions));
  } catch (e) {
    throw e; // rethrow — callers handle add vs delete contexts differently
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('expense_transactions');
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('expense_transactions: failed to parse stored data.', e);
    return [];
  }
}

// ===========================
// 4. Validation
// ===========================

function validateForm() {
  // Clear all error spans at the start of each validation pass
  nameError.textContent     = '';
  amountError.textContent   = '';
  categoryError.textContent = '';

  let isValid = true;

  // --- Item name (Req 2.1) ---
  const nameValue = itemNameInput.value.trim();
  if (nameValue === '') {
    nameError.textContent = 'Item name is required.';
    isValid = false;
  }

  // --- Amount (Req 2.2, 2.3, 2.4, 2.5) ---
  const rawAmount = amountInput.value.trim();
  if (rawAmount === '') {
    amountError.textContent = 'Amount is required.';
    isValid = false;
  } else if (isNaN(rawAmount)) {
    amountError.textContent = 'Amount must be a valid number.';
    isValid = false;
  } else if (Number(rawAmount) <= 0) {
    amountError.textContent = 'Amount must be greater than zero.';
    isValid = false;
  } else if (!/^\d+(\.\d{1,2})?$/.test(rawAmount)) {
    amountError.textContent = 'Amount must have at most 2 decimal places.';
    isValid = false;
  }

  // --- Category (Req 2.6) ---
  if (categorySelect.value === '') {
    categoryError.textContent = 'Please select a category.';
    isValid = false;
  }

  return isValid; // true = all fields pass (Req 2.8), false = at least one error (Req 2.7)
}

// ===========================
// 5. Transaction Operations
// ===========================

/**
 * Build a new transaction object from validated form values.
 * @param {string} name     - Raw item name (will be trimmed)
 * @param {string} amount   - Raw amount string (will be parsed and rounded to 2dp)
 * @param {string} category - Selected category value ("Food" | "Transport" | "Fun")
 * @returns {{ id: string, name: string, amount: number, category: string }}
 */
function createTransaction(name, amount, category) {
  return {
    id: String(Date.now()) + Math.random().toString(36).slice(2), // Req 3.2 — guaranteed unique per session
    name: name.trim(),                                             // Req 3.1 — trimmed item name
    amount: parseFloat(parseFloat(amount).toFixed(2)),            // Req 3.1 — numeric, 2dp
    category                                                       // Req 3.1 — selected category
  };
}

/**
 * Reset all form fields to their default/empty state and clear any error messages.
 * Called after a transaction is successfully added (Req 3.4).
 */
function resetForm() {
  itemNameInput.value   = '';  // clear item name field
  amountInput.value     = '';  // clear amount field
  categorySelect.value  = '';  // reset category selector to placeholder

  // Clear all inline validation error messages
  nameError.textContent     = '';
  amountError.textContent   = '';
  categoryError.textContent = '';
}

/**
 * Full add-transaction flow: validate → create → persist → render.
 * Implements the submission pipeline described in design.md (Req 3.1–3.5, 8.1).
 */
function addTransaction() {
  // Req 2.7, 2.8 — run all validation; abort if any field fails
  if (!validateForm()) return;

  // Req 3.1, 3.2 — build the new transaction object
  const newTransaction = createTransaction(
    itemNameInput.value,
    amountInput.value,
    categorySelect.value
  );

  // Req 3.3 — prepend to in-memory array so it appears first in the list
  transactions.unshift(newTransaction);

  // Req 8.1 — persist before updating the UI; roll back on failure
  try {
    saveToStorage();
  } catch (e) {
    // Storage write failed — undo the in-memory change and surface the error
    transactions.shift();
    showStorageError('Could not save your transaction. Storage may be full.');
    return;
  }

  // Req 3.3, 3.4, 8.1 — update all UI layers and reset the form
  renderTransactionList();
  updateTotal();
  updateChart();
  resetForm(); // Req 3.4 — clear fields and error spans
}

/**
 * Delete the transaction with the given id, persist the change, then re-render.
 * Uses a snapshot/rollback pattern so the UI and localStorage stay consistent
 * even when the storage write fails (Req 5.5, 5.6, 8.2).
 *
 * @param {string} id - The id of the transaction to remove
 */
function deleteTransaction(id) {
  // Snapshot the current array so we can roll back on storage failure (Req 5.6)
  const previousTransactions = [...transactions];

  // Remove the target transaction from the in-memory array (Req 5.2)
  transactions = transactions.filter(t => t.id !== id);

  // Persist the updated array; roll back if the write fails (Req 8.2, 5.5, 5.6)
  try {
    saveToStorage();
  } catch (e) {
    // Restore the previous state — the deletion is cancelled (Req 5.5, 5.6)
    transactions = previousTransactions;
    showStorageError('Could not save the deletion. Please try again.');
    return;
  }

  // Storage write succeeded — update all UI layers (Req 5.3, 5.4, 6.2, 7.2)
  renderTransactionList();
  updateTotal();
  updateChart();
}

// ===========================
// 6. Render Functions
// ===========================

/**
 * Rebuild the transaction list UI from the current `transactions` array.
 * Clears all dynamically added <li> elements (preserving #empty-message),
 * then either shows the empty state or renders one <li> per transaction.
 * Implements Req 4.1, 4.2, 4.3, 4.4, 4.5, 5.1.
 */
function renderTransactionList() {
  // Remove all <li> children except #empty-message (Req 4.3 — it must stay in the DOM)
  Array.from(transactionList.children).forEach(child => {
    if (child.id !== 'empty-message') {
      transactionList.removeChild(child);
    }
  });

  // Empty state — show placeholder and bail (Req 4.3)
  if (transactions.length === 0) {
    emptyMessage.style.display = '';
    return;
  }

  // Non-empty state — hide placeholder, render each transaction (Req 4.1, 4.4, 5.1)
  emptyMessage.style.display = 'none';

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.setAttribute('data-id', t.id);

    // Item name (Req 4.1)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = t.name;

    // Category (Req 4.1)
    const categorySpan = document.createElement('span');
    categorySpan.className = 'item-category';
    categorySpan.textContent = t.category;

    // Amount — formatted to 2 dp with $ prefix (Req 4.1, 4.5)
    const amountSpan = document.createElement('span');
    amountSpan.className = 'item-amount';
    amountSpan.textContent = '$' + t.amount.toFixed(2);

    // Delete button with accessible label (Req 5.1, 4.4)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-id', t.id);
    deleteBtn.setAttribute('aria-label', 'Delete ' + t.name);
    deleteBtn.textContent = 'Delete';

    li.appendChild(nameSpan);
    li.appendChild(categorySpan);
    li.appendChild(amountSpan);
    li.appendChild(deleteBtn);

    transactionList.appendChild(li);
  });
}

/**
 * Recalculate the total of all transactions and update #total-display.
 * When transactions is empty, sum is 0 and displays "$0.00" (Req 6.4).
 * Called after every add and every successful delete (Req 6.1, 6.2, 6.3).
 */
function updateTotal() {
  const sum = transactions.reduce((acc, t) => acc + t.amount, 0);
  totalDisplay.textContent = '$' + sum.toFixed(2);
}

/**
 * Display a non-blocking error message in the #storage-error banner (Req 5.6).
 * The banner auto-hides after 5 seconds.
 *
 * @param {string} message - The error message to display
 */
function showStorageError(message) {
  storageError.textContent     = message;
  storageError.style.display   = 'block';
  setTimeout(() => { storageError.style.display = 'none'; }, 5000);
}

// ===========================
// 7. Chart
// ===========================

/**
 * Fixed colour map for each category (Req 7.1, 7.6).
 * Used by buildChartData() so the legend colours are always consistent.
 */
const CATEGORY_COLORS = {
  Food:      '#FF6384',
  Transport: '#36A2EB',
  Fun:       '#FFCE56'
};

/**
 * Compute per-category totals from the current `transactions` array and
 * return a Chart.js-compatible data object.
 * Categories whose total is 0 are excluded from the output (Req 7.6).
 *
 * @returns {{ labels: string[], datasets: [{ data: number[], backgroundColor: string[] }] }}
 */
function buildChartData() {
  const categories = ['Food', 'Transport', 'Fun'];

  // Sum amounts per category
  const totals = {};
  categories.forEach(cat => { totals[cat] = 0; });
  transactions.forEach(t => {
    if (totals[t.category] !== undefined) {
      totals[t.category] += t.amount;
    }
  });

  // Filter out categories with a zero total (Req 7.6)
  const activeCategories = categories.filter(cat => totals[cat] > 0);

  return {
    labels: activeCategories,
    datasets: [{
      data:            activeCategories.map(cat => totals[cat]),
      backgroundColor: activeCategories.map(cat => CATEGORY_COLORS[cat])
    }]
  };
}

/**
 * Create the Chart.js pie chart instance once on page load.
 * Stores the instance in the module-level `chartInstance` variable so
 * updateChart() can mutate it without re-creating it (Req 7.1, 9.4).
 */
function createChart() {
  const ctx = expenseChart.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: buildChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}

/**
 * Sync the chart UI to the current `transactions` array.
 * - Empty state: hides the canvas, shows the placeholder, clears chart data (Req 7.5)
 * - Non-empty state: shows the canvas, hides the placeholder, mutates the existing
 *   chart instance with fresh labels/data/colors and calls .update() (Req 7.3, 7.4, 7.6)
 * Never destroys/recreates the chart — always mutates chartInstance in-place.
 */
function updateChart() {
  const data = buildChartData();

  if (transactions.length === 0) {
    expenseChart.style.display = 'none';
    chartPlaceholder.style.display = 'block';
    chartInstance.data.labels = [];
    chartInstance.data.datasets[0].data = [];
    chartInstance.update();
    return;
  }

  expenseChart.style.display = 'block';
  chartPlaceholder.style.display = 'none';
  chartInstance.data.labels = data.labels;
  chartInstance.data.datasets[0].data = data.datasets[0].data;
  chartInstance.data.datasets[0].backgroundColor = data.datasets[0].backgroundColor;
  chartInstance.update();
}

// ===========================
// 8. Event Listeners
// ===========================

// Req 3.5 — handles both mouse click on "Add Expense" and Enter key while any form field is focused
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  addTransaction();
});

// Req 5.2 — single delegated listener on the list; only acts when a .delete-btn is the target
transactionList.addEventListener('click', e => {
  if (e.target.matches('.delete-btn')) {
    deleteTransaction(e.target.dataset.id);
  }
});

// ===========================
// 9. Initialisation
// ===========================

/**
 * Initialise the application:
 *  1. Load persisted transactions from localStorage (Req 8.3)
 *  2. Render the transaction list and total (Req 8.4, 8.6)
 *  3. Create the Chart.js instance and set its initial state (Req 8.5, 8.6)
 */
function init() {
  transactions = loadFromStorage(); // Req 8.3

  renderTransactionList(); // Req 8.4, 8.6
  updateTotal();           // Req 8.4
  createChart();           // Req 8.5 — creates the Chart.js instance once
  updateChart();           // Req 8.5, 8.6 — applies data or shows empty state
}

document.addEventListener('DOMContentLoaded', init);
