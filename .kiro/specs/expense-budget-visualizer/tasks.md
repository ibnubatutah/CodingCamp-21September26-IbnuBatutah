# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement the full client-side application from scratch using HTML5, CSS3, and Vanilla JavaScript ES6+. The plan follows the architecture defined in `design.md`: a single `index.html`, one `css/style.css`, and one `js/script.js`. Tasks are ordered so each step compiles on the previous one and the app is usable after each checkpoint.

---

## Tasks

- [x] 1. Scaffold `index.html`
  - [x] 1.1 Create the HTML document shell with `<head>` metadata
    - Write `<!DOCTYPE html>`, `<html lang="en">`, `<meta charset>`, `<meta name="viewport">`, `<title>`, `<link>` to `css/style.css`
    - Add the Chart.js CDN `<script>` tag followed immediately by `<script src="js/script.js" defer></script>` (Req 10.2, 10.3)
    - No inline `<style>` blocks, no inline `<script>` blocks other than the CDN tag (Req 10.1, 10.2)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.2 Add the `<main>` layout and three `<section>` elements
    - Add `<section id="form-section">` containing `<form id="expense-form">` with fields: `<input type="text" id="item-name" maxlength="100">`, `<input type="number" id="amount" step="0.01" min="0">`, `<select id="category">` (options: placeholder + Food, Transport, Fun), `<button type="submit">Add Expense</button>`, and one `<span class="error">` per field (ids: `name-error`, `amount-error`, `category-error`)
    - Add `<section id="list-section">` containing a summary div with `<span id="total-display">$0.00</span>` and `<ul id="transaction-list">` with `<li id="empty-message">No expenses added yet.</li>` inside
    - Add `<section id="chart-section">` containing `<canvas id="expense-chart"></canvas>` and `<p id="chart-placeholder">No spending data available.</p>`
    - Add `<div id="storage-error" role="alert" aria-live="polite"></div>` outside `<main>` for non-blocking storage errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.3, 7.5, 5.6_

- [x] 2. Write base CSS — reset, layout, and form styles (`css/style.css`)
  - [x] 2.1 Add reset, base typography, and layout sections
    - Section comments: `1. Reset & Base`, `2. Layout & Grid`, `3. Expense Form` (see design.md CSS structure)
    - Center `<main>` with `max-width` and auto horizontal margins; vertically stack the three sections
    - Style the form: label/input/select rows, consistent spacing, `<button type="submit">` with clear affordance
    - _Requirements: 9.1, 10.1_

  - [x] 2.2 Add transaction list, total, chart, and error styles
    - Section comments: `4. Transaction List`, `5. Total Display`, `6. Chart Section`, `7. Error & Notification Styles`
    - `#transaction-list`: `max-height` + `overflow-y: auto` for scrolling (Req 4.2)
    - Style each `<li>` to display name, category, amount, and delete button in a single row
    - `.error` spans: `display: block; color: red; font-size: 0.85rem` (Req 2.1–2.6)
    - `#storage-error`: fixed/top banner, hidden by default (`display: none`)
    - `#chart-placeholder`: visible by default; `#expense-chart`: hidden by default
    - _Requirements: 4.2, 5.1, 6.1, 7.5_

  - [x] 2.3 Add responsive media query section (`@media (max-width: 599px)`)
    - Section comment: `8. Responsive — below 600px`
    - Single-column stacking of form, list, chart (Req 9.3)
    - `input, select, button { min-height: 44px; min-width: 44px; }` for touch targets (Req 9.2)
    - Verify no horizontal scrolling at 320 px width (Req 9.1)
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 3. Implement JavaScript state, DOM references, and storage helpers (`js/script.js`)
  - [x] 3.1 Write Section 1 (State) and Section 2 (DOM References)
    - Declare `let transactions = [];` and `let chartInstance = null;` at module level (Section 1)
    - Capture all DOM nodes used elsewhere: `expenseForm`, `itemNameInput`, `amountInput`, `categorySelect`, `transactionList`, `emptyMessage`, `totalDisplay`, `expenseChart`, `chartPlaceholder`, `storageError`, and all three `.error` spans (Section 2)
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Write Section 3 (Storage Helpers): `saveToStorage()` and `loadFromStorage()`
    - `saveToStorage()`: wrap `localStorage.setItem('expense_transactions', JSON.stringify(transactions))` in a `try`; rethrow so callers handle differently (Req 8.1, 8.2)
    - `loadFromStorage()`: `getItem` → null check → `JSON.parse` → array check → return array; on any failure `console.warn` and return `[]` (Req 8.3, 8.6)
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

- [x] 4. Implement form validation (Section 4 of `js/script.js`)
  - [x] 4.1 Write `validateForm()` — single-pass, all-fields validation
    - Clear all error spans at the top of the function
    - Check item name: empty after `.trim()` → set `name-error` text (Req 2.1)
    - Check amount: empty → set `amount-error` (Req 2.2); non-numeric (`isNaN`) → set `amount-error` (Req 2.4); ≤ 0 → set `amount-error` (Req 2.3); more than 2 decimal places (regex `/^\d+(\.\d{1,2})?$/`) → set `amount-error` (Req 2.5)
    - Check category: value is `""` → set `category-error` (Req 2.6)
    - Return `false` if any error was set; return `true` otherwise (Req 2.7, 2.8)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 5. Implement transaction creation (Section 5 of `js/script.js`)
  - [x] 5.1 Write `createTransaction(name, amount, category)` and `resetForm()`
    - `createTransaction`: build object `{ id, name: name.trim(), amount: parseFloat(amount).toFixed(2) * 1, category }` where `id = String(Date.now()) + Math.random().toString(36).slice(2)` (Req 3.1, 3.2)
    - `resetForm()`: set `itemNameInput.value = ''`, `amountInput.value = ''`, `categorySelect.value = ''`, clear all `.error` spans (Req 3.4)
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.2 Write `addTransaction()` — the full add flow
    - Call `validateForm()`; return early if false
    - Call `createTransaction`; `transactions.unshift(newTransaction)` (Req 3.3)
    - `try { saveToStorage(); } catch { transactions.shift(); showStorageError(...); return; }`
    - On success: `renderTransactionList()`, `updateTotal()`, `updateChart()`, `resetForm()` (Req 3.3, 3.4, 8.1)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1_

- [x] 6. Implement render functions — transaction list and total display (Section 6 of `js/script.js`)
  - [x] 6.1 Write `renderTransactionList()`
    - Clear all `<li>` elements except `#empty-message`
    - If `transactions.length === 0`: show `#empty-message`, return (Req 4.3)
    - Otherwise hide `#empty-message`; for each transaction create `<li data-id>` with `.item-name`, `.item-category`, `.item-amount` (formatted `'$' + t.amount.toFixed(2)`), and `<button class="delete-btn" data-id aria-label="Delete {name}">Delete</button>`; append to `#transaction-list` (Req 4.1, 4.4, 5.1)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1_

  - [x] 6.2 Write `updateTotal()`
    - Reduce `transactions` to sum; format `'$' + sum.toFixed(2)`; write to `#total-display` (Req 6.1, 6.4)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Checkpoint — verify add flow end-to-end
  - Open `index.html` in a browser, add several transactions, confirm: list updates, total updates, form resets, empty-state message hides, data persists on page refresh.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement delete transaction flow (Section 5 continued in `js/script.js`)
  - [x] 8.1 Write `deleteTransaction(id)` with storage rollback
    - Snapshot `previousTransactions = [...transactions]`; filter out id; `try { saveToStorage(); } catch { transactions = previousTransactions; showStorageError(...); return; }`
    - On success: `renderTransactionList()`, `updateTotal()`, `updateChart()` (Req 5.2, 5.3, 5.4, 5.5, 5.6, 8.2)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 8.2_

- [x] 9. Implement Chart.js pie chart (Section 7 of `js/script.js`)
  - [x] 9.1 Write `buildChartData()` and `createChart()`
    - `buildChartData()`: compute per-category totals from `transactions`; filter out zero-total categories; return `{ labels, datasets: [{ data, backgroundColor }] }` using `CATEGORY_COLORS` map (Req 7.1, 7.2, 7.6)
    - `createChart()`: create `new Chart(ctx, { type: 'pie', data: buildChartData(), options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true } } } })`; store in `chartInstance` (Req 7.1)
    - _Requirements: 7.1, 7.2, 7.6, 9.4_

  - [x] 9.2 Write `updateChart()`
    - If `transactions.length === 0`: hide canvas, show `#chart-placeholder`, clear chart data, call `chartInstance.update()`, return (Req 7.5)
    - Otherwise: show canvas, hide placeholder, mutate `chartInstance.data` with new labels/data/colors, call `chartInstance.update()` (Req 7.3, 7.4, 7.6)
    - _Requirements: 7.3, 7.4, 7.5, 7.6_

- [x] 10. Implement error notification helper (Section 6 of `js/script.js`)
  - [x] 10.1 Write `showStorageError(message)`
    - Set `storageError.textContent = message; storageError.style.display = 'block';`
    - Auto-hide after 5 seconds via `setTimeout` (Req 5.6)
    - _Requirements: 5.6_

- [x] 11. Implement event listeners and initialisation (Sections 8 and 9 of `js/script.js`)
  - [x] 11.1 Write Section 8 (Event Listeners)
    - `expenseForm.addEventListener('submit', e => { e.preventDefault(); addTransaction(); })` — handles both mouse click and Enter key (Req 3.5)
    - `transactionList.addEventListener('click', e => { if (e.target.matches('.delete-btn')) deleteTransaction(e.target.dataset.id); })` — event delegation (Req 5.2)
    - _Requirements: 3.5, 5.2_

  - [x] 11.2 Write Section 9 (Initialisation) — `init()` function wired to `DOMContentLoaded`
    - `transactions = loadFromStorage()` (Req 8.3)
    - `renderTransactionList()`, `updateTotal()`, `createChart()`, `updateChart()` (Req 8.4, 8.5, 8.6)
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [x] 12. Final checkpoint — full smoke test
  - Verify: add valid transaction → list/total/chart update; validation errors for all bad inputs; delete transaction → list/total/chart update; localStorage key `expense_transactions` updated on each mutation; page refresh restores all transactions; empty-state elements toggle correctly; layout renders without horizontal scroll at 320 px; touch targets ≥ 44 × 44 px at < 600 px viewport.
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- All code lives in the three files dictated by Requirement 10 — no additional files are created.
- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references the specific requirement clauses it satisfies for traceability.
- The design document has a Correctness Properties section, but the testing strategy specifies manual browser smoke testing only — no automated test framework is used. Checkpoints 7 and 12 cover the verification scenarios.
- Incremental order: scaffold HTML → styles → JS state/storage → validation → add flow → render → delete → chart → error handling → event wiring → init.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "3.2"] },
    { "id": 4, "tasks": ["2.3", "4.1"] },
    { "id": 5, "tasks": ["5.1", "6.1", "6.2"] },
    { "id": 6, "tasks": ["5.2", "8.1", "9.1", "10.1"] },
    { "id": 7, "tasks": ["9.2", "11.1"] },
    { "id": 8, "tasks": ["11.2"] }
  ]
}
```
