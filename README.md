# Expense & Budget Visualizer

A simple client-side web application for tracking daily expenses and visualizing spending distribution by category.

## Features

* Add expense transactions
* Input validation for item name, amount, and category
* Expense categories:

  * Food
  * Transport
  * Fun
* Display transaction list
* Delete transactions
* Automatic total expense calculation
* Spending distribution pie chart
* Data persistence using Browser Local Storage
* Responsive layout for desktop and mobile devices

## Technologies

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* Chart.js
* Browser Local Storage API

## Project Structure

```text
Expense-Budget-Visualizer/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── requirements.md
            ├── design.md
            ├── tasks.md
            └── .config.kiro
```

## How to Run

No backend server or build process is required.

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.
3. Start adding expense transactions.

The application stores transaction data locally in the browser using the Local Storage API.

## Browser Compatibility

The application is designed for modern versions of:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

## Project Documentation

The `.kiro` directory contains the project specification and development documentation:

* `requirements.md` — Functional and non-functional requirements
* `design.md` — Application architecture and technical design
* `tasks.md` — Implementation task breakdown

## Project Type

This project was developed as part of the RevoU Software Engineering Coding Camp Mini Coding Project.

## Author

**Ibnu Batutah**
