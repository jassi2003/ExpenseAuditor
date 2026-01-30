// controllers/employeeControllers.js

import {
  addExpense,
  getAllExpenses,
  AddQueueExpense,
  updateExpense,
  deleteExpense,
  getQueuedExpense
} from "../storage/indexDb.js";

import { saveDraft, loadDraft, clearDraft } from "../storage/sessionStorage.js";
import { postExpenseToServer } from "../services/api.js";
import { drainQueue } from "../services/syncService.js";
import { ExpenseDraftModel } from "../../models/expenseModel.js";


/*  STATE */
let exchangeRates = { INR: 1 };
let currentCurrency = localStorage.getItem("preferredCurrency") || "INR";
let currentTab = "Pending";
let currentPage = 1;
const PAGE_SIZE = 5;

let activeTagFilter = null;
const globalTagSet = new Set();


// HELPERS



/* DIAGNOSTIC */
export function runDiagnosticConsole() {
  console.clear();
  queueMicrotask(() => console.log("Microtask"));
  Promise.resolve().then(() => console.log("Promise.then"));
  setTimeout(() => console.log("setTimeout"), 0);
}

/* NAVIGATION */
export function showPage(page, homePage, addPage, homeBtn, addBtn) {
  if (page === "home") {
    homePage.classList.add("visible");
    addPage.classList.remove("visible");
    homeBtn.classList.add("active");
    addBtn.classList.remove("active");
  } else {
    addPage.classList.add("visible");
    homePage.classList.remove("visible");
    addBtn.classList.add("active");
    homeBtn.classList.remove("active");
  }
}

export function initHashRouting(homePage, addPage, homeBtn, addBtn) {
  const handle = () => {
    const page = location.hash.replace("#", "") || "home";
    showPage(page, homePage, addPage, homeBtn, addBtn);
  };
  handle();
  window.addEventListener("hashchange", handle);
}

/* CURRENCY SSE*/

export function startRateStream() {
  const src = new EventSource("http://localhost:5000/api/conversion/rates/inr-stream");
  src.addEventListener("rates", e => {
    const d = JSON.parse(e.data);
    exchangeRates = { INR: 1, ...d.rates };
  });
  return src;
}
//convert amount to inr
export function convertToINR(amount, currency) {
  if (currency === "INR") {
    return Math.round(amount * 100) / 100;
  }
  const rate = exchangeRates[currency];
  if (!rate) throw new Error("Rate unavailable");
  const inr = amount / rate;
  return Math.round(inr * 100) / 100;
}


export function formatAmount(amount) {
  const rate = exchangeRates[currentCurrency] || 1;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currentCurrency
  }).format(amount * rate);
}

export function setCurrency(cur, rerender) {
  currentCurrency = cur;
  localStorage.setItem("preferredCurrency", cur);
  rerender();
}



/* TAGS FUNCTIONALITY */
export function normalizeTag(t) {
  return t ? "#" + t.replace(/^#+/, "").toLowerCase() : "";
}

export function parseTags(str = "") {
  return str.split(/[,\s]+/).map(normalizeTag).filter(Boolean);
}

export async function rebuildTags(renderTags) {
  globalTagSet.clear();
  const expenses = await getAllExpenses();
  expenses.forEach(e => (e.tags || []).forEach(t => globalTagSet.add(t)));
  renderTags([...globalTagSet]);
}

export function setActiveTag(tag, rerender) {
  activeTagFilter = activeTagFilter === tag ? null : tag;
  currentPage = 1;
  rerender();
}

/* OFFLINE  */
export async function updateOfflineBadge(el) {
  el.textContent = (await getQueuedExpense()).length;
}
export async function syncOffline(setStatus) {
  await drainQueue(setStatus);
}

/* DRAFT  */
export function restoreDraft(setters) {
  const d = loadDraft();
  if (!d) return;
 Object.entries(setters).forEach(([key, setValue]) => {
    setValue(d[key] ?? "");
  });
}
//SAVING DRAFT IN SESSION STORAGE
export function saveDraftForm(data) {
  saveDraft({ ...ExpenseDraftModel, ...data });
}



/*  CRUD, submitting the expense*/
export async function submitExpense(expense, setStatus) {
  if (expense.id && expense._edit) {
      expense.status = "Pending"; 
        expense.updatedAt = Date.now();
    await updateExpense(expense);
  } else {
    await addExpense(expense);
  }
  clearDraft();

  if (navigator.onLine) {
    await postExpenseToServer(expense);
    setStatus("Synced. Waiting for approval...");
       return expense.id;
} 

else {
    await AddQueueExpense({
      queueId: crypto.randomUUID(),
      expense,
      createdAt: new Date().toISOString()
    });
    window.dispatchEvent(new Event("queue:changed"));
    setStatus("Offline: queued");
  }
}

export async function deleteExpenseById(id) {
  await deleteExpense(id);
   const expenses = await getAllExpenses();
  const maxPage = Math.ceil(expenses.length / PAGE_SIZE);

  if (currentPage > maxPage) {
    currentPage = maxPage || 1;
  }
  window.dispatchEvent(new Event("queue:changed"));

}

export async function toggleFlag(id) {
  const e = (await getAllExpenses()).find(x => x.id === id);
  e.flagged = !e.flagged;
  await updateExpense(e);
}

/* LIST,PAGINATION  */

export async function getPaginatedExpenses() {
  let expenses = await getAllExpenses();
  
  //sorting the expenses
   expenses.sort((a, b) => {
    const timeA = a.updatedAt ?? a.createdAt ?? 0;
    const timeB = b.updatedAt ?? b.createdAt ?? 0;
    return timeB - timeA;
  });

  // apply tab filter
  expenses = expenses.filter(e => e.status === currentTab);

  // apply tag filter
  if (activeTagFilter) {
    expenses = expenses.filter(e =>
      (e.tags || []).includes(activeTagFilter)
    );
  }

  const totalItems = expenses.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  //  clamp currentPage
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    items: expenses.slice(start, end),
    currentPage,
    totalPages
  };
}


export function nextPage(totalPages, rerender) {
  if (currentPage < totalPages) {
    currentPage++;
    rerender();
  }
}

export function prevPage(rerender) {
  if (currentPage > 1) {
    currentPage--;
    rerender();
  }
}
export function setTab(tab, rerender) {
  currentTab = tab;
  currentPage = 1;
  rerender();
}



export async function afterMutation(render, rebuildTags) {
  await rebuildTags();
  currentPage = 1;
  render();
}



//LONG POOL
//  LONG POLLING FOR APPROVAL (30s max per request)
export async function longPollApproval(expenseId, onUpdate) {
  try {
    const controller = new AbortController();

    // 30s timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    const res = await fetch(
      `http://localhost:5000/${expenseId}/long-poll`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    // no decision yet → server says "keep waiting"
    if (res.status === 204) {
      onUpdate?.("No response yet... checking again");
      return longPollApproval(expenseId, onUpdate);
    }

    const data = await res.json();

    if (data?.status === "Approved") {
      onUpdate?.(" Manager approved your expense!");
    } else if (data?.status === "Rejected") {
      onUpdate?.(" Manager rejected the expense");
    } else {
      onUpdate?.(" Waiting for decision...");
      return longPollApproval(expenseId, onUpdate);
    }

    return data;

  } catch (err) {
    if (err.name === "AbortError") {
      onUpdate?.(" Approval timed out. Will retry later.");
      return;
    }

    console.error("Long polling failed:", err);
    onUpdate?.("Network error. Retrying in 5s...");
    setTimeout(() =>
      longPollApproval(expenseId, onUpdate),
      5000
    );
  }
}
