# BudgetWise 💸

BudgetWise is a sleek, modern, client-side personal finance manager built with vanilla HTML, CSS, and JavaScript. Track your income, manage expenses, set budgets, and monitor savings goals entirely within your browser.

![BudgetWise Preview](https://via.placeholder.com/800x400.png?text=BudgetWise+Dashboard)

## 🌟 Features

- **Dashboard:** Get a birds-eye view of your net balance, savings rate, and recent transactions.
- **Transactions Management:** Log and categorize income and expenses with an intuitive interface.
- **Budget Planner:** Set maximum spending limits across various categories (e.g., Food, Rent, Transport) and visually track your progress.
- **Savings Goals:** Define financial milestones and watch your progress bars fill up.
- **Interactive Charts:** Beautiful monthly bar charts and category donut charts powered by Chart.js.
- **Reports & Exporting:** View monthly summaries, export your transactions to CSV, or print clean, formatted reports to PDF.
- **Dark Mode:** A meticulously crafted dark theme that respects your eyes at night.
- **Privacy First:** 100% client-side. Your financial data never leaves your device and is securely stored in your browser's `localStorage`.

## 🚀 Live Demo

You can view the live application here: **[https://khantnaing910.github.io/BudgetWise/](https://khantnaing910.github.io/BudgetWise/)**

## 🛠️ Installation & Usage

Because BudgetWise is a static application, no build tools or servers are required to run it.

1. Clone or download the repository:
   ```bash
   git clone https://github.com/khantnaing910/BudgetWise.git
   ```
2. Open the folder and double-click `index.html` to open it in any modern web browser.
3. Start logging! You can also click "Load Sample Data" on the welcome screen to populate the app with mock data to see how it looks.

## 📂 File Structure

- `index.html` - The semantic structure and layout of the application.
- `styles.css` - All design tokens, glassmorphism effects, responsive layout grids, and animations.
- `app.js` - State management, DOM manipulation, Chart.js integrations, and local storage logic.
- `print.css` - Specialized styles for exporting clean PDFs and physical prints.

## 💾 Data Management

If you want to switch browsers or back up your data:
1. Navigate to the **Settings** tab.
2. Click **Export JSON** to download a complete backup of your finances.
3. Use the **Import JSON** button on another device or browser to restore your state.

## 🎨 Technologies Used

- HTML5
- CSS3 (Variables, Flexbox, CSS Grid, Glassmorphism)
- Vanilla JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) (for data visualization)
- [FontAwesome](https://fontawesome.com/) (for icons)
- Google Fonts (Sora & Fraunces)

## 📝 License

This project is completely open-source and free to use. Modify it, share it, and make it your own!
