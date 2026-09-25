# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that allows users to track daily expenses by category. Users can add, view, and delete expense transactions. The application displays total spending and a pie chart showing spending distribution by category. All transaction data is persisted in the browser using the Local Storage API. The application uses HTML, CSS, and Vanilla JavaScript only. No backend server or JavaScript framework is required.

## Glossary

- **Application**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single expense entry consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI element that displays all saved transactions.
- **Expense_Form**: The HTML form through which the user enters a new transaction.
- **Category**: One of three fixed labels assigned to a transaction — Food, Transport, or Fun.
- **Total_Display**: The UI element that shows the cumulative sum of all transaction amounts.
- **Chart**: The pie chart rendered via Chart.js that visualises spending distribution by category.
- **Storage**: The browser's `localStorage` API used to persist transaction data.
- **Validator**: The client-side logic that checks Expense_Form input before a transaction is accepted.

---

## Requirements

### Requirement 1: Expense Form Input

**User Story:** As a user, I want to enter an expense's item name, amount, and category through a form, so that I can record new transactions quickly.

#### Acceptance Criteria

1. THE Expense_Form SHALL contain a text input field for the item name with a maximum length of 100 characters.
2. THE Expense_Form SHALL contain a numeric input field for the amount that accepts positive decimal values up to 2 decimal places.
3. THE Expense_Form SHALL contain a dropdown selector offering exactly three category options: Food, Transport, and Fun.
4. THE Expense_Form SHALL contain a submit button labeled "Add Expense" that triggers transaction creation.

---

### Requirement 2: Input Validation

**User Story:** As a user, I want invalid form submissions to be rejected with clear feedback, so that the transaction list contains only well-formed data.

#### Acceptance Criteria

1. WHEN the submit button is activated and the item name field is empty, THE Validator SHALL display an inline error message adjacent to the item name field indicating the item name is required and SHALL NOT add a transaction.
2. WHEN the submit button is activated and the amount field is empty, THE Validator SHALL display an inline error message adjacent to the amount field indicating the amount is required and SHALL NOT add a transaction.
3. WHEN the submit button is activated and the amount field contains a value less than or equal to zero, THE Validator SHALL display an inline error message adjacent to the amount field indicating the amount must be a positive number greater than zero and SHALL NOT add a transaction.
4. WHEN the submit button is activated and the amount field contains a non-numeric value, THE Validator SHALL display an inline error message adjacent to the amount field indicating the amount must be a valid number and SHALL NOT add a transaction.
5. WHEN the submit button is activated and the amount field contains a numeric value with more than 2 decimal places, THE Validator SHALL display an inline error message adjacent to the amount field indicating the amount must have at most 2 decimal places and SHALL NOT add a transaction.
6. WHEN the submit button is activated and no category option is selected, THE Validator SHALL display an inline error message adjacent to the category selector indicating a category is required and SHALL NOT add a transaction.
7. IF multiple fields fail validation simultaneously, THEN THE Validator SHALL display all corresponding error messages at once and SHALL NOT add a transaction.
8. IF all fields pass validation, THEN THE Validator SHALL clear all error messages and allow transaction creation to proceed.

---

### Requirement 3: Adding Transactions

**User Story:** As a user, I want valid form submissions to be saved and immediately visible, so that my expense list stays up to date.

#### Acceptance Criteria

1. WHEN all fields pass validation and the submit button is activated, THE Application SHALL create a new Transaction object containing the trimmed item name, the parsed numeric amount rounded to 2 decimal places, and the selected category.
2. WHEN a Transaction is created, THE Application SHALL assign it a unique identifier that is guaranteed not to collide with any existing Transaction identifier in the current session.
3. WHEN a Transaction is created, THE Application SHALL prepend the Transaction as the first visible item in the Transaction_List without requiring a page reload.
4. WHEN a Transaction is created, THE Application SHALL reset the item name field to empty, the amount field to empty, and the category selector to its default placeholder state.
5. WHEN the Expense_Form is submitted, THE Application SHALL accept both a mouse click on the submit button and pressing the Enter key while focus is on any form field as equivalent submission triggers.

---

### Requirement 4: Transaction List Display

**User Story:** As a user, I want to see all my recorded transactions in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction's item name (maximum 100 characters), amount formatted as a positive numeric value with exactly 2 decimal places preceded by a currency symbol, and category label.
2. THE Transaction_List SHALL be scrollable when the number of transactions causes the list to exceed its visible height.
3. WHILE the Transaction_List contains no transactions, THE Application SHALL display a placeholder message indicating that no expenses have been added yet.
4. WHEN a Transaction is added or removed, THE Transaction_List SHALL update to reflect the change without requiring a page reload.
5. IF a Transaction's item name is exactly 100 characters, THE Transaction_List SHALL display it without truncation.

---

### Requirement 5: Deleting Transactions

**User Story:** As a user, I want to remove individual transactions from the list, so that I can correct mistakes or remove outdated entries.

#### Acceptance Criteria

1. THE Application SHALL render a clearly labelled delete button alongside each Transaction in the Transaction_List.
2. WHEN the delete button for a Transaction is activated, THE Application SHALL remove that Transaction from the Transaction_List.
3. WHEN a Transaction is deleted, THE Application SHALL recalculate and display the updated total in the Total_Display.
4. WHEN a Transaction is deleted, THE Application SHALL recalculate and re-render the Chart to reflect the revised category totals.
5. WHEN a Transaction is deleted, THE Application SHALL write the updated transaction dataset to Storage, removing the deleted Transaction's record.
6. IF the Storage write fails during deletion, THEN THE Application SHALL display a non-blocking error notification to the user and SHALL retain the Transaction in the Transaction_List.

---

### Requirement 6: Total Spending Display

**User Story:** As a user, I want to see the total of all my expenses in one place, so that I can monitor my overall spending at a glance.

#### Acceptance Criteria

1. THE Total_Display SHALL show the sum of the amounts of all transactions currently in the Transaction_List, formatted with a currency symbol and exactly 2 decimal places.
2. WHEN a Transaction is added, THE Total_Display SHALL update to include the new transaction's amount without requiring a page reload.
3. WHEN a Transaction is deleted, THE Total_Display SHALL update to exclude the removed transaction's amount without requiring a page reload.
4. WHILE the Transaction_List contains no transactions, THE Total_Display SHALL show "$0.00" (or the equivalent formatted zero value for the chosen currency symbol).

---

### Requirement 7: Category Pie Chart

**User Story:** As a user, I want a visual breakdown of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render as a pie chart using the Chart.js library with a legend identifying each category segment by name and a distinct colour.
2. THE Chart SHALL display one segment per Category that has at least one transaction, where each segment's arc angle equals (category total / grand total) × 360 degrees.
3. WHEN a Transaction is added, THE Chart SHALL re-render all segments to reflect the updated category totals without requiring a page reload.
4. WHEN a Transaction is deleted, THE Chart SHALL re-render all segments to reflect the updated category totals without requiring a page reload.
5. WHILE the Transaction_List contains no transactions, THE Chart SHALL hide the pie chart canvas and display a text placeholder of no more than 100 characters indicating that no spending data is available.
6. IF a Category's total reaches zero because all its transactions are deleted, THEN THE Chart SHALL remove that category's segment from the pie chart.

---

### Requirement 8: Data Persistence

**User Story:** As a user, I want my transactions to be saved in the browser, so that my data is still available after I refresh or reopen the page.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE Application SHALL serialise the full transaction dataset as a JSON string and write it to the localStorage key "expense_transactions".
2. WHEN a Transaction is deleted, THE Application SHALL serialise the updated transaction dataset as a JSON string and write it to the localStorage key "expense_transactions".
3. WHEN the Application initialises in the browser, THE Application SHALL read the value stored at the localStorage key "expense_transactions", parse it, and render the recovered transactions in the Transaction_List.
4. IF the Application initialises and the localStorage key "expense_transactions" contains one or more valid transactions, THEN THE Total_Display SHALL reflect the sum of those transactions on first render.
5. IF the Application initialises and the localStorage key "expense_transactions" contains one or more valid transactions, THEN THE Chart SHALL render the category breakdown of those transactions on first render.
6. IF the localStorage key "expense_transactions" is absent, its value is null, or its value fails JSON parsing, THEN THE Application SHALL initialise with an empty transaction dataset, render the empty-state UI, and log a console warning.

---

### Requirement 9: Responsive Layout

**User Story:** As a user on a mobile device, I want the application to display correctly on small screens, so that I can manage expenses from my phone.

#### Acceptance Criteria

1. THE Application SHALL render without horizontal scrolling on viewport widths of 320 pixels or greater.
2. THE Application SHALL scale all interactive controls to a minimum touch-target size of 44 × 44 CSS pixels on viewport widths below 600 CSS pixels.
3. IF the viewport width is below 600 CSS pixels, THEN THE Application SHALL use a single-column layout where the Expense_Form, Transaction_List, and Chart stack vertically.
4. WHEN the viewport is resized, THE Chart SHALL resize proportionally to fit within its container without overflowing or requiring a page reload.

---

### Requirement 10: Code and File Structure

**User Story:** As a developer, I want the codebase to follow a clear single-file-per-concern structure, so that it is easy to read and maintain.

#### Acceptance Criteria

1. THE Application SHALL be delivered as a single `index.html` file that references exactly one external CSS file located at `css/style.css` and contains no inline `<style>` blocks.
2. THE Application SHALL reference exactly one external JavaScript file located at `js/script.js` and contain no inline `<script>` blocks other than the Chart.js CDN `<script>` tag.
3. WHEN the Application is loaded in a browser, THE Application SHALL load the Chart.js library from a CDN `<script>` tag declared in `index.html` before the `js/script.js` script tag.
4. THE Application SHALL not depend on any server-side technology, build tools, or JavaScript frameworks, such that opening `index.html` directly in a browser without a local server produces a fully functional application.
