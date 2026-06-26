/* ==========================================
   BudgetHub Dashboard
   script.js - Part 1
========================================== */

// -------------------------
// Global Variables
// -------------------------

let salary = 0;
let expenses = [];

// Currency Symbols
const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
};

let selectedCurrency = "INR";

// -------------------------
// DOM Elements
// -------------------------

const salaryForm = document.getElementById("salaryForm");
const expenseForm = document.getElementById("expenseForm");

const salaryInput = document.getElementById("salaryInput");
const expenseNameInput = document.getElementById("expenseNameInput");
const expenseAmountInput = document.getElementById("expenseAmountInput");

const currencySelect = document.getElementById("currencySelect");

const salaryValue = document.getElementById("salaryValue");
const expenseValue = document.getElementById("expenseValue");
const remainingValue = document.getElementById("remainingValue");
const savingRate = document.getElementById("savingRate");

const todayExpense = document.getElementById("todayExpense");
const transactionCount = document.getElementById("transactionCount");
const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");

const expenseTableBody = document.getElementById("expenseTableBody");
const emptyState = document.getElementById("emptyState");

const errorMessage = document.getElementById("errorMessage");

const warningBanner = document.getElementById("warningBanner");

const toast = document.getElementById("toast");

// -------------------------
// Theme Toggle
// -------------------------

const themeToggle = document.getElementById("themeToggle");

if(localStorage.getItem("theme")==="light"){

    document.body.classList.add("light");

    themeToggle.checked=true;

}

themeToggle.addEventListener("change",()=>{

    document.body.classList.toggle("light");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("light")
        ? "light"
        : "dark"
    );

});

// -------------------------
// Local Storage
// -------------------------

function saveData(){

    localStorage.setItem("salary",salary);

    localStorage.setItem("expenses",
        JSON.stringify(expenses));

    localStorage.setItem(
        "currency",
        selectedCurrency
    );

}

function loadData(){

    salary =
        Number(localStorage.getItem("salary")) || 0;

    expenses =
        JSON.parse(localStorage.getItem("expenses"))
        || [];

    selectedCurrency =
        localStorage.getItem("currency")
        || "INR";

    currencySelect.value = selectedCurrency;

}

// -------------------------
// Currency Helper
// -------------------------

function symbol(){

    return currencySymbols[selectedCurrency];

}

// -------------------------
// Salary Form
// -------------------------

salaryForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    salary = Number(salaryInput.value);

    selectedCurrency = currencySelect.value;

    saveData();

    updateDashboard();

    salaryInput.value="";

    showToast("Salary Updated");

});

// -------------------------
// Expense Form
// -------------------------

expenseForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const name = expenseNameInput.value.trim();

    const amount =
        Number(expenseAmountInput.value);

    if(name===""){

        showError("Enter expense name");

        return;

    }

    if(amount<=0){

        showError("Enter valid amount");

        return;

    }

    expenses.push({

        name,

        amount,

        date:new Date().toLocaleDateString()

    });

    saveData();

    expenseNameInput.value="";

    expenseAmountInput.value="";

    showError("");

    updateDashboard();

    showToast("Expense Added");

});

// -------------------------
// Dashboard Update
// -------------------------

function updateDashboard(){

    let totalExpense=0;

    expenses.forEach(exp=>{

        totalExpense += exp.amount;

    });

    const remaining =
        salary-totalExpense;

    const percent =
        salary===0
        ?0
        :Math.round(
            (remaining/salary)*100
        );

    salaryValue.textContent =
        symbol()+salary.toLocaleString();

    expenseValue.textContent =
        symbol()+totalExpense.toLocaleString();

    remainingValue.textContent =
        symbol()+remaining.toLocaleString();

    savingRate.textContent =
        percent+"%";

    updateStatistics(totalExpense);

    renderTable();

    checkWarning(remaining);

}
/* ==========================================
        TABLE RENDERING
========================================== */

function renderTable(){

    expenseTableBody.innerHTML="";

    if(expenses.length===0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";

    expenses.forEach((expense,index)=>{

        const row=document.createElement("tr");

        row.innerHTML=`

        <td>${expense.name}</td>

        <td class="expense-amount-cell">
            ${symbol()}${expense.amount.toLocaleString()}
        </td>

        <td>${expense.date}</td>

        <td>

            <button
                class="delete-button"
                onclick="deleteExpense(${index})">

                Delete

            </button>

        </td>

        `;

        expenseTableBody.appendChild(row);

    });

}

/* ==========================================
        DELETE EXPENSE
========================================== */

function deleteExpense(index){

    expenses.splice(index,1);

    saveData();

    updateDashboard();

    updateCharts();

    showToast("Expense Deleted");

}

/* ==========================================
        CLEAR ALL
========================================== */

const clearExpenses=document.getElementById("clearExpenses");

clearExpenses.addEventListener("click",()=>{

    if(!confirm("Delete all expenses?")){

        return;

    }

    expenses=[];

    saveData();

    updateDashboard();

    updateCharts();

    showToast("All Expenses Removed");

});

/* ==========================================
        STATISTICS
========================================== */

function updateStatistics(totalExpense){

    todayExpense.textContent=
        symbol()+totalExpense.toLocaleString();

    transactionCount.textContent=
        expenses.length;

    let highest=0;

    expenses.forEach(exp=>{

        if(exp.amount>highest){

            highest=exp.amount;

        }

    });

    highestExpense.textContent=
        symbol()+highest.toLocaleString();

    const average=

        expenses.length===0

        ?0

        :Math.round(totalExpense/expenses.length);

    averageExpense.textContent=
        symbol()+average.toLocaleString();

}

/* ==========================================
        WARNING
========================================== */

function checkWarning(balance){

    if(salary===0){

        warningBanner.style.display="none";

        return;

    }

    if(balance<salary*0.10){

        warningBanner.style.display="block";

    }

    else{

        warningBanner.style.display="none";

    }

}

/* ==========================================
        SEARCH
========================================== */

const searchExpense=document.getElementById("searchExpense");

searchExpense.addEventListener("keyup",()=>{

    const keyword=

        searchExpense.value.toLowerCase();

    const rows=

        expenseTableBody.querySelectorAll("tr");

    rows.forEach(row=>{

        row.style.display=

            row.innerText

            .toLowerCase()

            .includes(keyword)

            ?""

            :"none";

    });

});

/* ==========================================
        TOAST
========================================== */

function showToast(message){

    toast.innerText=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

/* ==========================================
        ERROR
========================================== */

function showError(message){

    errorMessage.innerText=message;

    errorMessage.style.display=

        message

        ?"block"

        :"none";

}
/* ==========================================
        CHARTS
========================================== */

let lineChart;
let pieChart;
let barChart;
let savingChart;

function updateCharts(){

    const totalExpense = expenses.reduce(
        (sum,item)=>sum+item.amount,
        0
    );

    const remaining = salary-totalExpense;

    // ---------- LINE CHART ----------

    const lineCanvas=document.getElementById("lineChartCanvas");

    if(lineCanvas){

        if(lineChart) lineChart.destroy();

        lineChart=new Chart(lineCanvas,{

            type:"line",

            data:{

                labels:expenses.map((e,i)=>`#${i+1}`),

                datasets:[{

                    label:"Expenses",

                    data:expenses.map(e=>e.amount),

                    borderColor:"#58A6FF",

                    backgroundColor:"rgba(88,166,255,.15)",

                    fill:true,

                    tension:.4

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{display:false}

                }

            }

        });

    }

    // ---------- PIE CHART ----------

    const pieCanvas=document.getElementById("pieChartCanvas");

    if(pieCanvas){

        if(pieChart) pieChart.destroy();

        pieChart=new Chart(pieCanvas,{

            type:"doughnut",

            data:{

                labels:expenses.map(e=>e.name),

                datasets:[{

                    data:expenses.map(e=>e.amount),

                    backgroundColor:[

                        "#58A6FF",

                        "#3FB950",

                        "#F85149",

                        "#D29922",

                        "#A371F7",

                        "#FF7B72",

                        "#56D364",

                        "#1F6FEB"

                    ]

                }]

            },

            options:{

                responsive:true

            }

        });

    }

    // ---------- BAR CHART ----------

    const barCanvas=document.getElementById("barChartCanvas");

    if(barCanvas){

        if(barChart) barChart.destroy();

        barChart=new Chart(barCanvas,{

            type:"bar",

            data:{

                labels:["Salary","Expenses"],

                datasets:[{

                    data:[salary,totalExpense],

                    backgroundColor:[

                        "#3FB950",

                        "#F85149"

                    ]

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{display:false}

                }

            }

        });

    }

    // ---------- SAVINGS CHART ----------

    const savingCanvas=document.getElementById("savingChartCanvas");

    if(savingCanvas){

        if(savingChart) savingChart.destroy();

        savingChart=new Chart(savingCanvas,{

            type:"doughnut",

            data:{

                labels:["Saved","Spent"],

                datasets:[{

                    data:[

                        Math.max(remaining,0),

                        totalExpense

                    ],

                    backgroundColor:[

                        "#3FB950",

                        "#F85149"

                    ]

                }]

            },

            options:{

                responsive:true,

                cutout:"75%"

            }

        });

    }

}

/* ==========================================
        PDF EXPORT
========================================== */

const pdfButton=document.getElementById("downloadReportButton");

if(pdfButton){

pdfButton.addEventListener("click",()=>{

    const { jsPDF } = window.jspdf;

    const doc=new jsPDF();

    doc.setFontSize(20);

    doc.text("BudgetHub Report",20,20);

    doc.setFontSize(12);

    doc.text(`Salary : ${symbol()}${salary}`,20,40);

    let total=expenses.reduce((a,b)=>a+b.amount,0);

    doc.text(`Expenses : ${symbol()}${total}`,20,50);

    doc.text(`Remaining : ${symbol()}${salary-total}`,20,60);

    let y=80;

    expenses.forEach(exp=>{

        doc.text(

            `${exp.name} - ${symbol()}${exp.amount}`,

            20,

            y

        );

        y+=10;

    });

    doc.save("BudgetHub_Report.pdf");

});

}

/* ==========================================
        INITIALIZE
========================================== */

loadData();

updateDashboard();

updateCharts();

/* ==========================================
        UPDATE OVERRIDE
========================================== */

const oldUpdate=updateDashboard;

updateDashboard=function(){

    oldUpdate();

    updateCharts();

};

/* ==========================================
        START
========================================== */

window.addEventListener("load",()=>{

    updateDashboard();

    showToast("Welcome to BudgetHub 🚀");

});