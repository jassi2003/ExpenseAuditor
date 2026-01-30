// controllers/adminController.js

import {
  addEmployee,
  getAllUsers
} from "../../loginPage/storage/indexDb.js";

import {
  getAllExpenses,
  addDepartmentInfo,
  approveExpense,
  rejectExpense,
  getDepartmentInfo
} from "../../employeePanel/storage/indexDb.js";

import { startConnectivityAuditor } from "../../services/connectivityAuditor.js";
import { startLiveAuditFeed } from "../services/liveAuditFeed.js";




export async function afterAdminMutation({
  renderExpenses,
  renderBudgetGrid,
  tab
}) {
  currentPage = 1;
  currentTab = tab;
  await renderExpenses();
  await renderBudgetGrid();
}



/* NAVIGATION */
export function showAdminPage(page, refs) {
  const { pages, buttons } = refs;
  // hide all pages
  Object.values(pages).forEach(p => p.classList.remove("visible"));
  // deactivate all buttons
  Object.values(buttons).forEach(b => b.classList.remove("active"));
  // show selected page
  pages[page]?.classList.add("visible");
  // activate selected button
  buttons[page]?.classList.add("active");
  // sync hash
  window.location.hash = page;
}
export function getPageFromHash(defaultPage = "home") {
  const page = window.location.hash.replace("#", "");
  return page || defaultPage;
}

export function initHashRouting(homePage, addPage, homeBtn, addBtn) {
  const handle = () => {
    const page = location.hash.replace("#", "") || "home";
    showPage(page, homePage, addPage, homeBtn, addBtn);
  };
  handle();
  window.addEventListener("hashchange", handle);
}


/* STATE*/

let currentTab = "Pending";
let currentPage = 1;
const PAGE_SIZE = 5;

// current tab setting
export function setTab(tab, rerender) {
  currentTab = tab;
  currentPage = 1;
  rerender();
}

const expenseKeyMap = new Map();
const auditNotesMap = new WeakMap();

/* HELPERS*/
//format department name
export function formatDeptName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
//Employee Password Validation
export function validateStrongPassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least 1 uppercase letter (A-Z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least 1 number (0-9).";
  }
  if (!/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]/.test(password)) {
    return "Password must contain at least 1 special character (!@#$...).";
  }
  return "";
}


/*
   DEPARTMENTS + BUDGET
 */

export async function renderBudgetGrid({ budgetGrid }) {
  const departments = await getDepartmentInfo();
  const expenses = await getAllExpenses();

  const consumedMap = new Map();

  expenses.forEach(exp => {
    if (exp.status !== "Approved") return;
    const key = (exp.department || "").toLowerCase();
    consumedMap.set(key, (consumedMap.get(key) || 0) + Number(exp.amountINR || 0));
  });

  budgetGrid.innerHTML = "";

  if (!departments.length) {
    budgetGrid.innerHTML = `<p>No departments found.</p>`;
    return;
  }

  departments.forEach(dept => {
    const key = dept.depttname.toLowerCase();
    const total = Number(dept.depttBudget) || 0;
    const used = consumedMap.get(key) || 0;
    const percent = total ? Math.min((used / total) * 100, 100) : 0;

    const card = document.createElement("div");
    card.className = "budgetCard";
    card.innerHTML = `
      <div class="budgetRowTop">
        <div>${formatDeptName(key)}</div>
        <div><b>${percent.toFixed(0)}%</b></div>
      </div>
      <div>Total ₹${total}</div>
      <div>Consumed ₹${used}</div>
      <div>Remaining ₹${Math.max(total - used, 0)}</div>
      <div class="progressWrap">
        <div class="progressBar" style="width:${percent}%"></div>
      </div>
    `;
    budgetGrid.appendChild(card);
  });
}

export async function addDepartment(info) {
  const newDeptName = info.depttname.trim().toLowerCase();
  // fetch existing departments
  const existingDepartments = await getDepartmentInfo();
  // checking duplicate (case-insensitive)
  const alreadyExists = existingDepartments.some(
    dept => dept.depttname?.trim().toLowerCase() === newDeptName
  );
  if (alreadyExists) {
    throw new Error("Department already exists");
  }
  await addDepartmentInfo({
    ...info,
    depttname: newDeptName
  });
}



/*EMPLOYEES*/
export async function addEmployeeController(payload) {
  await addEmployee(payload);
}
//getting all employees
export async function getAllEmployees() {
  const users = await getAllUsers();
  return users.filter(u => u.role === "employee")
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function loadDepartments(selectEl) {
  const depts = await getDepartmentInfo();
  selectEl.innerHTML = `<option value="">Select</option>`;
  depts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.depttname;
    opt.textContent = d.depttname.toUpperCase();
    selectEl.appendChild(opt);
  });
}



/*EXPENSE LIST + PAGINATION*/
export async function getPaginatedExpenses() {
  let expenses = await getAllExpenses();
//   if (currentTab === "Pending") {
//     expenses = expenses.filter(e => e.status === "Pending");
//   } else if (currentTab === "approved") {
//     expenses = expenses.filter(e => e.status === "Approved");
//   } else if (currentTab === "rejected") {
//     expenses = expenses.filter(e => e.status === "Rejected");
//   }

  expenses = expenses.filter(e => e.status === currentTab);

  const totalPages = Math.ceil(expenses.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    items: expenses.slice(start, end),
    currentPage,
    totalPages
  };
}

export function nextPage() {
  currentPage++;
}

export function prevPage() {
  if (currentPage > 1) currentPage--;
}

/* 
   APPROVE / REJECT the expense
 */

export async function approveExpenseCtrl(id) {
  await approveExpense(id);
}

export async function rejectExpenseCtrl(id) {
  await rejectExpense(id);
}

/* 
   AUDIT NOTES (WeakMap)
 */

export function getAuditKey(exp) {
  let key = expenseKeyMap.get(exp.id);
  if (!key) {
    key = { id: exp.id };
    expenseKeyMap.set(exp.id, key);
  }
  return key;
}
let currentAuditKey = null;

export function openAudit(key) {
  currentAuditKey = key;
  return auditNotesMap.get(key) || [];
}

/**
 * Save a note for the active audit key
 */
export function saveAuditNote(text) {
  if (!currentAuditKey) return null;
  const notes = auditNotesMap.get(currentAuditKey) || [];
  const note = {
    text,
    time: Date.now()
  };
  notes.push(note);
  auditNotesMap.set(currentAuditKey, notes);
  return notes;
}
/**
 * Close audit context
 */
export function closeAudit() {
  currentAuditKey = null;
}

/*QUICK INFO */
export async function getQuickInfoModal(expenseId) {
  const expenses = await getAllExpenses();
  return expenses.find(e => e.id === expenseId);
}

// export async function getExpenseById(id) {
//   return (await getAllExpenses()).find(e => e.id === id);
// }

// SET MATRIX 4 LEDS
// controllers/adminController.js
export function setMatrix(name, state, msg = "", matrixRefs) {
  const entry = matrixRefs[name];
  if (!entry) return;
  const { led, meta } = entry;
  if (state === "online") {
    led.className = "led green";
  } else if (state === "checking") {
    led.className = "led yellow";
  } else {
    led.className = "led red";
  }
  meta.textContent = msg || state;
}


// LIVE AUDIT FEED (WEB SOCKETS)
export function startAuditFeed(handlers) {
  return startLiveAuditFeed(handlers);
}
//SHORT POLLING
export function startShortPolling(cfg) {
  return startConnectivityAuditor(cfg);
}

//SSE RATE EXCHANGE STREAM
let ratesSource = null;

export function startRatesStream({
  url,
  onConnecting,
  onHello,
  onRates,
  onError
}) {
  if (ratesSource) {
    ratesSource.close();
    ratesSource = null;
  }
  onConnecting?.();
  ratesSource = new EventSource(url);
  ratesSource.addEventListener("hello", () => {
    onHello?.();
  });
  ratesSource.addEventListener("rates", (e) => {
    try {
      const data = JSON.parse(e.data);
      onRates?.(data);
    } catch (err) {
      console.error("Invalid SSE data", err);
    }
  });
  ratesSource.onerror = () => {
    onError?.();
  };
  return ratesSource;
}
export function stopRatesStream() {
  if (ratesSource) {
    ratesSource.close();
    ratesSource = null;
  }
}


//BUDGET STATS

export async function getDepartmentBudgetStats() {
  const departments = await getDepartmentInfo();
  const expenses = await getAllExpenses();

  // Map: deptKey → consumed amount (Approved only)
  const consumedMap = new Map();

  expenses.forEach(exp => {
    if (exp.status !== "Approved") return;

    const deptKey = (exp.department || "").trim().toLowerCase();
    const amount = Number(exp.amountINR) || 0;

    if (!deptKey) return;

    consumedMap.set(deptKey, (consumedMap.get(deptKey) || 0) + amount);
  });

  // Prepare final data structure
  return departments.map(dept => {
    const deptKey = (dept.depttname || "").trim().toLowerCase();

    const totalBudget = Number(dept.depttBudget) || 0;
    const consumed = consumedMap.get(deptKey) || 0;

    const remaining = Math.max(totalBudget - consumed, 0);
    const usedPercent =
      totalBudget > 0
        ? Math.min((consumed / totalBudget) * 100, 100)
        : 0;

    return {
      deptKey,
      totalBudget,
      consumed,
      remaining,
      usedPercent
    };
  });
}



// ===== TOAST SYSTEM =====
export async function showToast({ title, message, type = "info", duration = 3000 }) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <strong>${title}</strong>
    <p>${message}</p>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

//  persist toast in sessionStorage
export async function saveToast(payload) {
  const key = "ADMIN_TOASTS";
  const existing = JSON.parse(sessionStorage.getItem(key) || "[]");
  existing.push({ ...payload, time: Date.now() });
  sessionStorage.setItem(key, JSON.stringify(existing));
}

//restore toasts from sesssion storage
export function restoreToasts() {
  const key = "ADMIN_TOASTS";
  const stored = JSON.parse(sessionStorage.getItem(key) || "[]");

  if (!stored.length) return;

  stored.forEach(t => {
    showToast({
      title: t.title,
      message: t.message,
      type: t.type || "info",
      duration: 4000
    });
  });

  sessionStorage.removeItem(key);
}



// TAX REPORT (WEB WORKER)

let taxWorker = null;
let latestReport = null;

/* CSV HELPERS */
function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function reportToCsv(report) {
  const lines = [];

  lines.push("SECTION,KEY,VALUE");
  lines.push(`Summary,Quarter,${escapeCsv(report.quarter)}`);
  lines.push(`Summary,Year,${escapeCsv(report.year)}`);
  lines.push(`Summary,Total Expenses,${escapeCsv(report.totalExpenses)}`);
  lines.push(`Summary,Deductible Total,${escapeCsv(report.deductibleTotal)}`);
  lines.push(`Summary,Expense Count,${escapeCsv(report.count)}`);
  lines.push(`Summary,Generated At,${escapeCsv(report.generatedAt)}`);
  lines.push("");

  lines.push("SECTION,DEPARTMENT,TOTAL,DEDUCTIBLE,COUNT");
  for (const dept in report.byDepartment || {}) {
    const d = report.byDepartment[dept];
    lines.push(
      `ByDepartment,${escapeCsv(dept)},${escapeCsv(d.total)},${escapeCsv(
        d.deductible
      )},${escapeCsv(d.count)}`
    );
  }

  lines.push("");

  lines.push("SECTION,CATEGORY,TOTAL,DEDUCTIBLE,COUNT");
  for (const cat in report.byCategory || {}) {
    const c = report.byCategory[cat];
    lines.push(
      `ByCategory,${escapeCsv(cat)},${escapeCsv(c.total)},${escapeCsv(
        c.deductible
      )},${escapeCsv(c.count)}`
    );
  }

  return lines.join("\n");
}

/*FILE DOWNLOAD*/
function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// Start worker and generate report
export async function generateTaxReport({
  expenses,
  quarter,
  year,
  onProgress,
  onDone,
  onError,
}) {
  if (taxWorker) taxWorker.terminate();

  taxWorker = new Worker(
    new URL("../../worker/webWorker.js", import.meta.url),
    { type: "module" }
  );

  taxWorker.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === "PROGRESS") {
      onProgress?.(payload);
      return;
    }

    if (type === "DONE") {
      latestReport = payload;
      onDone?.(payload);
    }
  };

  taxWorker.onerror = (err) => {
    console.error("Worker error:", err);
    onError?.(err);
  };

  // SEND REAL DATA ONLY
  taxWorker.postMessage({
    type: "GENERATE_REPORT",
    payload: {
      expenses,     // <-- NO duplication
      quarter,
      year
    }
  });
}


// Download last generated report
export  function downloadLatestTaxReport() {
  if (!latestReport) return false;

  const csv = reportToCsv(latestReport);
  const filename = `Quarterly_Tax_Report_${latestReport.quarter}_${latestReport.year}.csv`;
  downloadTextFile(filename, csv);
  return true;
}






