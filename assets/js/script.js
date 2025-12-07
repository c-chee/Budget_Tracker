// === Income ===
const openAddIncome = document.getElementById('open-add-income');
const closeAddIncome = document.getElementById('close-add-income');
const editIncome = document.getElementById('edit-income');
const openIncomeDetail = document.getElementById('income-details');
const selectIncomeCategory = document.getElementById("select-income-category");
const customIncomeContainer = document.querySelector(".custom-income-container"); // Called here to unhide container
const updateIncomeTable = document.getElementById('add-income');

// === Expenses ===
const openAddExpenses = document.getElementById('open-add-expenses');
const closeAddExpenses = document.getElementById('close-add-expenses');
const editExpenses = document.getElementById('edit-expenses');
const openExpensesDetails = document.getElementById('expenses-details');
const selectExpensesCategory = document.getElementById("select-expenses-category");
const customExpensesContainer = document.querySelector(".custom-expenses-container"); // Called here to unhide container
const updateExpensesTable = document.getElementById('add-expenses');

// == Total Budget ==
let totalComparisonChart;
let budgetBreakdownChart;


// === Budget Calculation ===
/**
 * Total Budget
 * Income
 * Expenses
 */
class Budget {
    constructor() {
        this.income = [],
        this.expenses = []
    }

    /**
     * Updates either Income or Expenses Table and Total.
     * Updates charts
     * 
     * Takes in a string parameter catergoryType to know which table to update.
     * Will come from either addIncome(income) or addExpenses(expenses)
     * @param {string} categoryType 
     */
    update(categoryType) {

        let data;
        let tableContent;
        let displayTotal;
        
        // If category is Income
        if(categoryType === 'income') {
            // Set everything to income id's
            data = this.income;
            tableContent = document.getElementById('income-table-body');
            displayTotal = document.getElementById('total-income-display');

            // if default row exists, remove
            const defaultIncomeRow = document.getElementById('default-income');
            if(defaultIncomeRow){
                defaultIncomeRow.remove()
            };
        }

        // Else category is Expenses
        else {
            // Set everything to expenses id's
            data = this.expenses;
            tableContent = document.getElementById('expenses-table-body');
            displayTotal = document.getElementById('total-expenses-display');

            // Removes default row if it exists
            const defaultExpensesRow = document.getElementById('default-expenses');
            if(defaultExpensesRow){
                defaultExpensesRow.remove()
            };
        }

        // -------- Table Logic --------
        // Grabs the last item in data array whhich in this method comes from income
        const newData = data[data.length -1]; 

        // Add row to table from add form
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${newData.category}</td>
                            <td>$${newData.amount.toFixed(2)}</td>
                            <td>${newData.notes || "-"}</td>`;

        // Send new to table
        tableContent.appendChild(newRow);

        // Update Total
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        displayTotal.textContent = `$${total.toFixed(2)}`;

    }
    
    // -- Income --
    addIncome() {
        const categorySelection = document.getElementById('select-income-category');
        const customCategoryInput = document.getElementById('custom-income-category');
        const incomeAmount = document.getElementById('income-amount');
        const incomeNotes = document.getElementById('income-notes');
        const incomeErrorMessaage = document.getElementById('income-error-message');


        let category = categorySelection.value; // Let category selected set to caategory

        // If custom was selected ...
        if(category === 'Custom') {
            // Display custom container
            customIncomeContainer.style.display = 'flex';

            // Allow the category to be users input or just Custom if left empty
            category = customCategoryInput.value || 'Custom'
        };

        const amount = parseFloat(incomeAmount.value); // Converts the string in amount to a float

        // Amount Validadtion
        // If amount was left empty or a 0
        if (!amount || amount <= 0) {
            incomeErrorMessaage.textContent = 'Please enter an amount greater than $0'; // Give the error message a string
            incomeErrorMessaage.style.display = 'flex'; // unhide message
            return; // Return prevents the from submitting by existing method
        } 

        // Grabs any notes typed to notes
        const notes = incomeNotes.value;

        // Adds a new object to the income array
        this.income.push({ category, amount, notes });

        // Call update to add last row & update total
        this.update('income');

        // Update charts
        this.updateCharts();

        // Reset form
        categorySelection.value = 'Paycheck';
        customCategoryInput.value = '';
        incomeAmount.value = '';
        incomeNotes.value = '';
        incomeErrorMessaage.style.display = "none";
    }

    // -- Expenses --
    addExpenses() {
        const categorySelection = document.getElementById('select-expenses-category');
        const customCategoryInput = document.getElementById('custom-expenses-category');
        const expenseAmount = document.getElementById('expenses-amount');
        const expeneseNotes = document.getElementById('expenses-notes');
        const expenseErrorMessaage = document.getElementById('expenses-error-message');


        let category = categorySelection.value; // Let category selected set to caategory

        // If custom was selected ...
        if(category === 'Custom') {
            // Display custom container
            customExpensesContainer.style.display = 'flex';

            // Allow the category to be users input or just Custom if left empty
            category = customCategoryInput.value || 'Custom'
        };

        const amount = parseFloat(expenseAmount.value); // Converts the string in amount to a float

        // Amount Validadtion
        // If amount was left empty or a 0
        if (!amount || amount <= 0) {
            expenseErrorMessaage.textContent = 'Please enter an amount greater than $0'; // Give the error message a string
            expenseErrorMessaage.style.display = 'flex'; // unhide message
            return; // Return prevents the from submitting by existing method
        } 

        // Grabs any notes typed to notes
        const notes = expeneseNotes.value;

        // Adds a new object to the income array
        this.expenses.push({ category, amount, notes });

        // Call update to add last row & update total
        this.update('expenses');

        // Update charts
        this.updateCharts();

        // Reset form
        categorySelection.value = 'Food'; // First option
        customCategoryInput.value = '';
        expenseAmount.value = '';
        expeneseNotes.value = '';
        expenseErrorMessaage.style.display = 'none';
    }

    // -- Budget Chart --
    updateCharts() {
        /**
         * reduce() adds the sum of items with the value starting at 0
         * will loop through every item in each array
         */
        const incomeTotal = this.income.reduce((sum, item) => sum + item.amount, 0);
        const expensesTotal = this.expenses.reduce((sum, item) => sum + item.amount, 0);

        // --- Income vs Expenses BAR CHART ---
        const barChart = document.getElementById('total-comparison-chart'); //caanvas element
        
        if (barChart) {
            const barContext = barChart.getContext('2d'); //getss 2d rednderinigg from Charts.js
            if (totalComparisonChart) totalComparisonChart.destroy(); // redraws chart of it alreaddy exists

            // Create a new bar chart
            totalComparisonChart = new Chart(barContext, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenses'], // x labels
                    datasets: [{
                        label: 'Amount ($)',
                        data: [incomeTotal, expensesTotal], // y values
                        backgroundColor: ['#4caf50', '#f44336']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true } // charts always starts at 0
                    }
                }
            });
        }

        // --- BUDGET BREAKDOWN ---
        // Rule: 50 Needs/ 30 Wants/ 20 Savings

        const pieChart = document.getElementById('budget-breakdown-chart');

        if (pieChart) {
            const pieContext = pieChart.getContext('2d'); // Grabs 2 render
            if (budgetBreakdownChart) budgetBreakdownChart.destroy(); // Breakdown old chart if it exists

            const needs = incomeTotal * 0.50 ; // 50%
            const wants = incomeTotal * 0.30; // 30%
            const savings = incomeTotal * 0.20; // 20%

            // --- Handles initial empty data ---
            // (For the first render)
            let pieData, pieLabels, pieColors;

            // if income is 0
            if (incomeTotal === 0) {
                pieData = [1]; // initial slice
                pieLabels = ['No Data'];
                pieColors = ['#cccccc']; // empty color
            } 
            // else load/update in data an labels
            else {
                pieData = [incomeTotal * 0.5, incomeTotal * 0.3, incomeTotal * 0.2];
                pieLabels = ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'];
                pieColors = ['#2196f3', '#ff9800', '#9c27b0'];
            }

            // Create Pie Chart
            budgetBreakdownChart = new Chart(pieContext, {
                type: 'pie',
                data: {
                    labels: pieLabels,
                    datasets: [{
                        data: pieData,
                        backgroundColor: pieColors
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    }

    // -- Budget Plan Selection (If time allows)--
    /**
     * 50 Needs/ 30 Wants/ 20 Savings & Debt
     * 50 Needs/ 40 Debt/ 10 Wants & Savings
     * 70 Living Expenses/ 30 Savings & Investments
     * Custom (Allows Inputs...)
     */


}

const calculateBudget = new Budget();


document.addEventListener('DOMContentLoaded', () => {
    // [ Load Categories from JSON]
    // Load categories from JSON
    fetch('assets/data/categories.json')
    .then(response => response.json())
    .then(data => {
        loadSelectOptions('select-income-category', data.income);
        loadSelectOptions('select-expenses-category', data.expenses);
    })
    .catch(err => console.error('Error loading categories.json:', err));

    function loadSelectOptions(selectId, items) {
        const select = document.getElementById(selectId);
        select.innerHTML = ""; // clear existing options

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    calculateBudget.updateCharts();

    // [ -- ADD INCOME / EXPENSE BUTTON -- ]
    // When Add is clicked, display hiddden section.
    openAddIncome.addEventListener('click', (event) => {
        editIncome.style.display = 'flex'; // Change the edit container back to visible
        openIncomeDetail.open = true; // Opens the closed details section
    });

    openAddExpenses.addEventListener('click', (event) => {
        editExpenses.style.display = 'flex';
        openExpensesDetails.open = true;
    });

    // [ -- CANCEL INCOME / EXPENSE BUTTON -- ]
    closeAddIncome.addEventListener('click', (event) => {
        editIncome.style.display = 'none'; // Change the edit container back to none
    });

    closeAddExpenses.addEventListener('click', (event) => {
        editExpenses.style.display = 'none'; 
    });

    // [ -- Custom Category Section --]
    // When Custom category is selcted, open custom field
    selectIncomeCategory.addEventListener('change', () => {
        // If the value selected is custom(the value), display hidden custom section
        if(selectIncomeCategory.value === 'Custom') {
            customIncomeContainer.style.display = 'flex';
        }
        // Else, leave section hidden
        else {
            customIncomeContainer.style.display = 'none';
        }
    });

    selectExpensesCategory.addEventListener('change', () => {
        if(selectExpensesCategory.value === 'Custom') {
            customExpensesContainer.style.display = 'flex';
        }
        else {
            customExpensesContainer.style.display = 'none';
        }
    });

    // [ ADD INCOME ]
    updateIncomeTable.addEventListener('click', (event) => {
        // Prevent pagge from reloading to defualt, otherwise totals/ew inputs are not saved.
        event.preventDefault();
        calculateBudget.addIncome();
    });

    // [ ADD Expenses ]
    updateExpensesTable.addEventListener('click', (event) => {
        // Prevent pagge from reloading to defualt, otherwise total inputs are not saved.
        event.preventDefault();
        calculateBudget.addExpenses();
    });

});

