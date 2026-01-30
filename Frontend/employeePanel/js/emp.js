// import { addExpense, getAllExpenses, AddQueueExpense,updateExpense,deleteExpense, getQueuedExpense,getDepartmentInfo } from "../storage/indexDb.js"
// import { saveDraft, loadDraft, clearDraft } from "../storage/sessionStorage.js"
// import { postExpenseToServer } from "../services/api.js"
// import { drainQueue } from "../services/syncService.js"
// import { ExpenseDraftModel } from "../../models/expenseModel.js"
// //controllers

// const logoutBtn = document.querySelector("#lgtBtn")
// const expenseTitle = document.querySelector("#formTitle")
// const amount = document.querySelector("#formAmount")
// const date = document.querySelector("#formDate")
// const tag = document.querySelector("#formTag")
// const receipt = document.querySelector("#formReceipt")
// const clearDraftBtn = document.querySelector("#clearDraftBtn");
// const status = document.querySelector("#status");
// const form = document.querySelector("#expenseForm")
// const expenseList = document.querySelector("#expenseList")
// const expenseTableBody = document.querySelector("#expenseTableBody");

// //receipt preview
// const receiptOpenLink = document.querySelector("#receiptOpenLink");
// const removeReceiptBtn = document.querySelector("#removeReceiptBtn");
// let receiptPreviewURL = null;
// //css navigation
// const homeBtn = document.querySelector("#homeBtn");
// const addBtn = document.querySelector("#addBtn");
// const homePage = document.querySelector("#homePage");
// const addExpensePage = document.querySelector("#addExpensePage");
// //tags
// const tagFilterList = document.querySelector("#tagFilterList");
// const clearTagFilterBtn = document.querySelector("#clearTagFilterBtn");
// // OFFLINE BADGE
// // const offlineBadge = document.querySelector("#offlineBadge");
// const offlineBadgeCount = document.querySelector("#offlineBadgeCount");
// const offlineSyncMsgBox = document.querySelector("#offlineSyncMsgBox");
// const offlineSyncMsg = document.querySelector("#offlineSyncMsg");

// // microvsmacro btn
// const diagBtn = document.querySelector("#diagBtn");

// //input currency 
// const inputCurrency = document.querySelector("#inputCurrency");



// //BODY

// //1:run diagnostic console Btn
// diagBtn?.addEventListener("click", runDiagnosticConsole);
//  export function runDiagnosticConsole() {
//   console.clear();
//   //Microtasks
//   queueMicrotask(() => console.log("  Microtask: queueMicrotask"));
//   Promise.resolve().then(() => console.log(" Microtask: Promise.then #1"));

//   Promise.resolve().then(() => {
//     console.log("Microtask: Promise.then #2");
//     Promise.resolve().then(() =>
//       console.log("  Microtask: nested Promise.then")
//     );
//   });

//   // MutationObserver
//   const target = document.createElement("div");
//   const observer = new MutationObserver(() => {
//     console.log("Microtask: MutationObserver callback");
//     observer.disconnect();
//   });
//   observer.observe(target, { childList: true });
//   target.appendChild(document.createElement("span"));
//   setTimeout(() => console.log("Macrotask: setTimeout(0) #1"), 0);

//   setTimeout(() => console.log("Macrotask: setTimeout(0) #2"), 0);
// }



// //getting exchange rate from SSE
// let ratesSource=null
// let ratesReady = false;
// let exchangeRates = {
//   INR: 1, // default
// };
// function rateChangeStream(){
//     ratesSource = new EventSource("http://localhost:5000/api/conversion/rates/inr-stream");
//     ratesSource.addEventListener("rates",(e)=>{
// const data=JSON.parse(e.data)
// exchangeRates = {
//     INR: 1,
//     USD: data.rates.USD,
//     EUR: data.rates.EUR,
//     GBP: data.rates.GBP,
//   };
//    ratesReady = true;
// })
// }
// rateChangeStream();
// window.addEventListener("beforeunload", () => {
//   if (ratesSource) ratesSource.close();
// });

// //converting the input currency rate to inr
// function convertToINR(amount, currency) {
//   //   if (!ratesReady) {
//   //   throw new Error("Exchange rates not loaded yet");
//   // }
//   const cur = String(currency || "INR").trim().toUpperCase();
//   if (cur === "INR") return amount;
//   const rate = exchangeRates[cur];
//   if (!rate) throw new Error("Exchange rate unavailable");
//   return amount / rate;
// }
// //changing currency based on user preference 
// let currentCurrency = localStorage.getItem("preferredCurrency") || "INR"; //current currency of user
// function formatAmount(amountInINR) {
//   const rate = exchangeRates[currentCurrency] || 1;
//   const converted = amountInINR * rate;
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: currentCurrency,
//     maximumFractionDigits: 2,
//   }).format(converted);
// }
// // restore UI state
// const currencySelect = document.querySelector("#currencySelect");
// currencySelect.value = currentCurrency;
// currencySelect.addEventListener("change", () => {
//   currentCurrency = currencySelect.value;
//   localStorage.setItem("preferredCurrency", currentCurrency);
//   renderExpenseList();
// });


// //showing only numbers from 0-9 in amount input
// const amountInput = document.getElementById("formAmount");
// amountInput.addEventListener("input", () => {
//   amountInput.value = amountInput.value.replace(/\D/g, "");
// });
// // block date typing in date input
// date.addEventListener("keydown", (e) => {
//   e.preventDefault();
// });



// // OFFLINE BADGE LOGIC
// async function updateOfflineBadge() {
//   try {
//     const queued = await getQueuedExpense();
//     const count = queued.length;

//     //  prefer count element if present
//     const badgeEl = offlineBadgeCount;

//     if (!badgeEl) return; // nothing to update on this page

//     badgeEl.textContent = count > 0 ? String(count) : "0";
//   } catch (err) {
//     console.error("Failed to update offline badge:", err);
//   }
// }
// function showOfflineMsg(msg) {
//   offlineSyncMsgBox.classList.remove("hidden");
//   offlineSyncMsg.textContent = msg;
// }
// function clearOfflineMsg() {
//   offlineSyncMsgBox.classList.add("hidden");
//   offlineSyncMsg.textContent = "";
// }
// updateOfflineBadge();
// window.addEventListener("queue:changed", updateOfflineBadge);

// window.addEventListener("online", () => {
//   updateOfflineBadge();  
// });


// //TAG FUNCTIONALITY
// const sessionTagSet = new Set(); 
// const globalTagSet = new Set(); 
// let activeTagFilter = null; 

// function normalizeTag(t) {
//   if (!t) return "";
//   t = t.trim();
//   if (!t) return "";
//   if (!t.startsWith("#")) t = "#" + t;
//   t = t.toLowerCase();
//   t = "#" + t.replace(/^#+/, "");
//   return t;
// }

// function parseTags(inputStr) {
//   if (!inputStr) return [];
//   return inputStr
//   //spliting by comma or space
//     .split(/[,\s]+/)   
//     .map(normalizeTag)
//     .filter(Boolean);
// }

// async function rebuildTagSetsFromExpenses() {
//   globalTagSet.clear();
//   const expenses = await getAllExpenses();
//   expenses.forEach((exp) => {
//     const tagsArray = Array.isArray(exp.tags)
//       ? exp.tags
//       : parseTags(exp.tag || "");

//     tagsArray.forEach((t) => globalTagSet.add(normalizeTag(t)));
//   });
//   renderTagFilters();
// }

// function renderTagFilters() {
//   if (!tagFilterList) return;
//   tagFilterList.innerHTML = "";
//   if (globalTagSet.size === 0) {
//     tagFilterList.innerHTML = `<p>No tags yet.</p>`;
//     return;
//   }
//   [...globalTagSet].sort().forEach((t) => {
//     const chip = document.createElement("button");
//     chip.className = "tagChip" + (activeTagFilter === t ? " active" : "");
//     chip.textContent = t;
//     chip.addEventListener("click", () => {
//       // toggle
//       activeTagFilter = activeTagFilter === t ? null : t;
//         currentPage = 1; // RESET
//       renderTagFilters();
//       renderExpenseList();
//     });

//     tagFilterList.appendChild(chip);
//   });
// }
// if (clearTagFilterBtn) {
//   clearTagFilterBtn.addEventListener("click", () => {
//     activeTagFilter = null;
//     renderTagFilters();
//     renderExpenseList();
//   });
// }


// function showPage(page) {
//   if (page === "home") {
//     homePage.classList.add("visible");
//     addExpensePage.classList.remove("visible");
//     homeBtn.classList.add("active");
//     addBtn.classList.remove("active");
//   } else {
//     addExpensePage.classList.add("visible");
//     homePage.classList.remove("visible");
//     addBtn.classList.add("active");
//     homeBtn.classList.remove("active");
//   }
// }


// homeBtn.addEventListener("click", () => {
//   window.location.hash = "home";
// });
// addBtn.addEventListener("click", () => {
//   window.location.hash = "add";
// });

// function showPageFromHash() {
//   const page = window.location.hash.replace("#", "") || "home";
//   showPage(page);
// }
// showPageFromHash();
// window.addEventListener("hashchange", showPageFromHash);






// //creating the url of file for preview
// receipt.addEventListener("change",()=>{
//     const file = receipt.files?.[0];
//     if(file){
//       removeReceiptBtn.style.display="block"
//     }
//     if (!file) return;
//       receiptPreviewURL = URL.createObjectURL(file);
//   receiptOpenLink.href = receiptPreviewURL;
//     receiptOpenLink.style.display = "inline";
// })

// //for removing the file receipt
// removeReceiptBtn.addEventListener("click", () => {
//   receipt.value = "";
//   if (receiptPreviewURL) {
//     URL.revokeObjectURL(receiptPreviewURL);
//     receiptPreviewURL = null;
//     receiptOpenLink.style.display = "none";
//   }
//   removeReceiptBtn.style.display="none"
// })

// //logging out
// logoutBtn.addEventListener("click", () => {
//   window.location.href = "../loginPage/login.html"
//   sessionStorage.removeItem("loggedInRole")
//   localStorage.removeItem("preferredCurrency")
// })
// function setStatus(msg) {
//   status.innerText = msg;
// }
// window.addEventListener("online", async () => {
//   // if queue has items → show syncing message
//   const queued = await getQueuedExpense();
//   if (queued.length > 0) {
//     showOfflineMsg("Syncing offline queue to server...");
//   }
//   await drainQueue(setStatus);
//   // after drain, check again
//   const remaining = await getQueuedExpense();
//   if (queued.length > 0 && remaining.length === 0) {
//     showOfflineMsg("Offline expenses successfully synced");
//   }

//   // refresh badge always
//   window.dispatchEvent(new Event("queue:changed"));
// });
// restoration();

// //restore expenses from session storage
// async function restoration() {
//   const draft = loadDraft()
//     // await loadDepartments();
//   if (draft) {
//     expenseTitle.value = draft.title || ""
//     // department.value = draft.department || ""
//     amount.value = draft.amount || ""
//     date.value = draft.date || ""
//     tag.value = draft.tag || ""
//     inputCurrency.value=draft.currency || "INR"
//     status.innerText = "draft restored"
//   }
//   await renderExpenseList()
//   await rebuildTagSetsFromExpenses();
//   drainQueue(setStatus);

// }
// updateOfflineBadge();
// clearOfflineMsg();

// //save draft in session storage
// const saveDraftForm = () => {
//   const draft = {
//     ...ExpenseDraftModel,
//     title: expenseTitle.value,
//     amount: amount.value,
//     date: date.value,
//     tag: tag.value,
//     currency:inputCurrency.value
//   }
//   saveDraft(draft)
// }
// ["input", "change"].forEach((evt) => {
//   form.addEventListener(evt, (e) => {
//     // only save when form fields change
//     if (e.target !== receipt) saveDraftForm();
//   });
// });

// clearDraftBtn.addEventListener("click", () => {
//   clearDraft();
//   form.reset();
//   status.innerText = "Draft cleared";
// });

// // drain on start if online
// if (navigator.onLine) drainQueue(setStatus);

// //saving data in inndexedDb
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   status.innerText = "submitting...";
//   const receiptFile = receipt.files?.[0] || null;
//   //tags should be created at submit-time
//   const tagsArray = parseTags(tag.value);
// const editingId = form.dataset.editingId || null;
// const amountInput=Number(amount.value)
// const selectedCurrency = inputCurrency.value || "INR";
// let amountInInr;
// try {
//   amountInInr = convertToINR(amountInput, selectedCurrency);
// } catch (err) {
//   alert(err.message);
//   status.innerText = err.message;
//   return;
// }


//   const expense = {
//     id: editingId || crypto.randomUUID(),
//     title: expenseTitle.value.trim(),
//   amountINR: Math.round(amountInInr),
//     date: date.value,
//     tags: tagsArray, 
//     receipt: receiptFile,
//       status: "Pending",
//     flagged: false,
//     empMail: sessionStorage.getItem("loggedInEmail"),
//     userId:sessionStorage.getItem("userId"),
//     department:sessionStorage.getItem("department")
//   };

//   // update tag sets
//   tagsArray.forEach((t) => sessionTagSet.add(t));
//   tagsArray.forEach((t) => globalTagSet.add(t));
//   renderTagFilters();

//   // save locally first
//   try {
// if (editingId) {
//   await updateExpense(expense);
//   delete form.dataset.editingId;
//   setStatus("Expense updated ");

// } else {
//   await addExpense(expense);
//   setStatus("Expense saved locally");
// }
//     clearDraft();
//     form.reset();
//       await renderExpenseList();
//   await rebuildTagSetsFromExpenses();
//     window.location.hash = "home";
//       showPageFromHash();    


//   } catch (err) {
//     console.error(err);
//     status.innerText = "Failed to save expense";
//     return;
//   }

//   //  If online: sync to server then long-poll for decision
//   if (navigator.onLine) {
//     try {
//       setStatus("Syncing to server...");
//       console.log(" Expense created:", expense.id);
//       await postExpenseToServer(expense);
//       // setStatus("Synced  Waiting for manager decision...");
// console.log("synced") 
// setStatus("Synced  Waiting for manager decision...");
// // start long polling for this expense id
// await longPollApproval(expense.id);


//     } catch (err) {
//       console.error("postExpenseToServer failed:", err);
//           console.error(" Sync failed:", err);
//       //  If sync fails even though online,push to queue
//       await AddQueueExpense({
//         queueId: "q_" + crypto.randomUUID(),
//         expense,
//         createdAt: new Date().toISOString(),
//       });
//       setStatus("Server failed  Expense added to offline queue.");
//       window.dispatchEvent(new Event("queue:changed"));
//       updateOfflineBadge();
//     }
//   } else {
//     //  Offline queue
//     setStatus("You are Offline: expenses queued for sync");
//     await AddQueueExpense({
//       queueId: "q_" + crypto.randomUUID(),
//       expense,
//       createdAt: new Date().toISOString(),
//     });
//     window.dispatchEvent(new Event("queue:changed"));
//     updateOfflineBadge();
//   }
// });

// //btn navbar
// document.querySelectorAll(".tabBtn").forEach((btn) => {
//   btn.addEventListener("click", async () => {
//     // remove active from all
//     document.querySelectorAll(".tabBtn").forEach((b) => b.classList.remove("active"));
//     // active current
//     btn.classList.add("active");
//     currentTab = btn.dataset.tab;
//     await renderExpenseList();
//   });
// });

// // applying pagination
// const prevBtn = document.querySelector("#prevPage");
// const nextBtn = document.querySelector("#nextPage");
// const pageInfo = document.querySelector("#pageInfo");
// function updatePaginationControls(currentPage, totalPages) {
//   pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
//   prevBtn.disabled = currentPage <= 1;
//   nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
// }
// prevBtn.addEventListener("click", () => {
//   if (currentPage > 1) {
//     currentPage--;
//     renderExpenseList();
//   }
// });

// nextBtn.addEventListener("click", () => {
//   currentPage++;
//   renderExpenseList();
// });


// let currentTab = "Pending";
// let currentPage = 1;
// const PAGE_SIZE = 5;
// renderExpenseList();
// export async function renderExpenseList() {
//   let expenses = await getAllExpenses();
//   // 1: Apply tab filter
//   if (currentTab === "Pending") {
//     expenses = expenses.filter(e => e.status === "Pending");
//   } else if (currentTab === "Approved") {
//     expenses = expenses.filter(e => e.status === "Approved");
//   } else if (currentTab === "Rejected") {
//     expenses = expenses.filter(e => e.status === "Rejected");
//   }
//   // 2: Apply tag filter
//   if (activeTagFilter) {
//     expenses = expenses.filter((exp) => {
//       const tagsArray = Array.isArray(exp.tags)
//         ? exp.tags
//         : parseTags(exp.tag || "");
//       return tagsArray.map(normalizeTag).includes(activeTagFilter);
//     });
//   }
//   // 3: Pagination based on FILTERED data
//   const totalItems = expenses.length;
//   const totalPages = Math.ceil(totalItems / PAGE_SIZE);
//   if (currentPage > totalPages) currentPage = totalPages || 1;
//   const start = (currentPage - 1) * PAGE_SIZE;
//   const end = start + PAGE_SIZE;
//   const pageItems = expenses.slice(start, end);
//   expenseTableBody.innerHTML = "";

//   // 4: Empty state
//   if (pageItems.length === 0) {
//     expenseTableBody.innerHTML = `
//       <tr>
//         <td colspan="7">No expenses found.</td>
//       </tr>
//     `;
//     updatePaginationControls(currentPage, totalPages);
//     return;
//   }

//   //5: Render ONLY pageItems
//   pageItems.forEach((exp) => {
//     const tr = document.createElement("tr");
//     tr.dataset.id = exp.id;
//     if (exp.flagged) tr.classList.add("flaggedRow");

//     const tagsArray = Array.isArray(exp.tags)
//       ? exp.tags
//       : parseTags(exp.tag || "");

//     tr.innerHTML = `
//       <td>
//         <b>${exp.title}</b>
//         ${exp.flagged ? `<span style="margin-left:6px;">🚩</span>` : ""}
//       </td>
//       <td>${formatAmount(exp.amountINR)}</td>
//       <td>${exp.department}</td>
//       <td>${exp.date}</td>
//       <td>${tagsArray.length ? tagsArray.join(", ") : "None"}</td>
//       <td><b>${exp.status}</b></td>
//       <td class="actions">
//         <button class="btn editBtn" data-action="edit">Edit</button>
//         <button class="btn flagBtn" data-action="flag">
//           ${exp.flagged ? "Unflag" : "Flag"}
//         </button>
//         <button class="btn deleteBtn" data-action="delete">Delete</button>
//       </td>
//     `;

//     expenseTableBody.appendChild(tr);
//   });
//   updatePaginationControls(currentPage, totalPages);
// }


// //EVENT DELEGATION ON BUTTONS
// expenseTableBody.addEventListener("click",async(e)=>{
//     const btn = e.target.closest("button[data-action]");
// if(!btn) return;
// const action=btn.dataset.action
//   const row = btn.closest("tr");
//   if (!row) return;
//   const expenseId = row.dataset.id;
//   if (!expenseId) return;
//    if (action === "delete") {
//     const ok = confirm("Are you sure you want to delete this expense?");
//     if (!ok) return;
//     row.remove();
//   try {
//     await deleteExpense(expenseId);
//     //  Update tags and list safely
//     await rebuildTagSetsFromExpenses();
//     await renderExpenseList();
//     setStatus("Expense deleted ");
//   } catch (err) {
//     console.error("Delete failed:", err);
//     //  if DB delete fails, restore UI by rerendering
//     await renderExpenseList();
//     setStatus("Delete failed ");
//   }
//   }
//   if (action === "flag") {
//     const expenses = await getAllExpenses();
//     const exp = expenses.find((x) => x.id === expenseId);
//     if (!exp) return;
//     exp.flagged = !exp.flagged;
//     await updateExpense(exp);
//     setStatus(exp.flagged ? "Expense flagged" : "Expense unflagged ");
//     await renderExpenseList();
//   }
//   if (action === "edit") {
//     const expenses = await getAllExpenses();
//     const exp = expenses.find((x) => x.id === expenseId);
//     if (!exp) return;

//     // sending user to Add Expense page 
//     window.location.hash = "add";
//     expenseTitle.value = exp.title || "";
//     amount.value = exp.amount || "";
//     date.value = exp.date || "";
//     // category.value = exp.category || "";
//     tag.value = Array.isArray(exp.tags) ? exp.tags.join(",") : (exp.tag || "");

//     setStatus("Edit mode: update the form and submit ");

//     form.dataset.editingId = expenseId;

//   }

// })




import * as ctrl from "../controllers/employeeControllers.js";
/*DOM */
const homeBtn = document.querySelector("#homeBtn");
const addBtn = document.querySelector("#addBtn");
const homePage = document.querySelector("#homePage");
const addExpensePage = document.querySelector("#addExpensePage");
const diagBtn = document.querySelector("#diagBtn");
const currencySelect = document.querySelector("#currencySelect");
const offlineBadgeCount = document.querySelector("#offlineBadgeCount");
const expenseTableBody = document.querySelector("#expenseTableBody");
const form = document.querySelector("#expenseForm");
 const date = document.querySelector("#formDate")
const status = document.querySelector("#status");
const prevBtn = document.querySelector("#prevPage");
const nextBtn = document.querySelector("#nextPage");
const pageInfo = document.querySelector("#pageInfo");
const logoutBtn=document.querySelector("#lgtBtn")
 const receipt = document.querySelector("#formReceipt")



// HELPERS
const amountInput = document.getElementById("formAmount");
amountInput.addEventListener("input", () => {
  amountInput.value = amountInput.value.replace(/\D/g, "");
});
// block date typing in date input
date.addEventListener("keydown", (e) => {
  e.preventDefault();
});

/*INIT*/
const rateSource = ctrl.startRateStream();
window.addEventListener("beforeunload", () => rateSource.close());

//side panel page routing
ctrl.initHashRouting(homePage, addExpensePage, homeBtn, addBtn);

//update offline expense count
ctrl.updateOfflineBadge(offlineBadgeCount);
window.addEventListener("queue:changed", () => {
  ctrl.updateOfflineBadge(offlineBadgeCount);
});


/*EVENTS */
diagBtn.addEventListener("click", ctrl.runDiagnosticConsole);

currencySelect.value = localStorage.getItem("preferredCurrency") || "INR";
currencySelect.addEventListener("change", e =>
  ctrl.setCurrency(e.target.value, render)
);

homeBtn.addEventListener("click", () => location.hash = "home");
addBtn.addEventListener("click", () => location.hash = "add");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const receiptFile = receipt.files?.[0] || null;
  const isEdit = form.dataset.editingId !== undefined;
  const expensId = isEdit
    ? form.dataset.editingId
    : crypto.randomUUID();
  const expense = {
    id: expensId,
    title: form.formTitle.value.trim(),
    amountINR: ctrl.convertToINR(+form.formAmount.value, form.inputCurrency.value),
    date: form.formDate.value,
    tags: ctrl.parseTags(form.formTag.value),
    status: "Pending",
     receipt: receiptFile,
    userId:sessionStorage.getItem("userId"),
    empMail: sessionStorage.getItem("loggedInEmail"),
    department: sessionStorage.getItem("department"),
    //telling controller this is an edit
    _edit: isEdit,
     createdAt: Date.now(),  
  updatedAt: Date.now()    
  };

   const expenseId = await ctrl.submitExpense(
    expense,
    msg => status.innerText = msg
  );

  if (expenseId) {
   ctrl.longPollApproval(expenseId, msg => {
      status.innerText = msg;
    });
  }
    delete form.dataset.editingId;
  form.reset();
   location.hash = "home";
  render();
});


expenseTableBody.addEventListener("click", async e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  
  const row = btn.closest("tr");
  const id = row.dataset.id;
  
  if (btn.dataset.action === "delete") {
    if (!confirm("Delete expense?")) return;
    row.remove();
    await ctrl.deleteExpenseById(id);
    await ctrl.rebuildTags(renderTagFilters);
     // Clearing invalid active tag
  ctrl.setActiveTag(null, () => {});
    await render();
  }
  
  
  if (btn.dataset.action === "flag") {
    await ctrl.toggleFlag(id);
  }
  
  if (btn.dataset.action === "edit") {
    const exp = (await ctrl.getPaginatedExpenses()).items
      .find(x => x.id === id);

      location.hash = "add";
      form.formTitle.value = exp.title;
      form.formAmount.value = exp.amountINR;
      form.formDate.value = exp.date;
      form.formTag.value = exp.tags?.join(",") || "";
      
      form.dataset.editingId = id;
      status.innerText = "Edit mode";
    }
    
    render();
  });
  
  
  /*RENDER  */
async function render() {
  const { items, currentPage, totalPages } =
  await ctrl.getPaginatedExpenses();
  
  // update page text
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  // disable buttons
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  
  expenseTableBody.innerHTML = items.map(exp => `
    <tr data-id="${exp.id}">
      <td>${exp.title}</td>
      <td>${ctrl.formatAmount(exp.amountINR)}</td>
      <td>${exp.department}</td>
      <td>${exp.date}</td>
      <td>${exp.tags?.join(", ") || "None"}</td>
      <td><b>${exp.status}</b></td>
      <td class="actions">
      <button data-action="edit">Edit</button>
      <button data-action="flag">${exp.flagged ? "Unflag" : "Flag"}</button>
      <button data-action="delete">Delete</button>
      </td>
      </tr>
      `).join("");
}


render();

document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabBtn")
    .forEach(b => b.classList.remove("active"));
    
    btn.classList.add("active");

    ctrl.setTab(btn.dataset.tab, render);
  });
});


//tag filters
const tagFilterList = document.querySelector("#tagFilterList");
const clearTagFilterBtn = document.querySelector("#clearTagFilterBtn");

await ctrl.rebuildTags(renderTagFilters);
function renderTagFilters(tags) {
  tagFilterList.innerHTML = "";
  
  if (!tags.length) {
    tagFilterList.innerHTML = "<p>No tags yet.</p>";
    return;
  }
  
  tags.sort().forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tagChip";
    btn.textContent = tag;
    
    btn.addEventListener("click", () =>
      ctrl.setActiveTag(tag, render)
  );

    tagFilterList.appendChild(btn);
  });
}
clearTagFilterBtn.addEventListener("click", () => {
  ctrl.setActiveTag(null, render);
});


//pagination prev btn
prevBtn.addEventListener("click", () => {
  ctrl.prevPage(render);
});
//pagination next btn
nextBtn.addEventListener("click", async () => {
  const { totalPages } = await ctrl.getPaginatedExpenses();
  ctrl.nextPage(totalPages, render);
});
ctrl.setTab("Pending", render);

//when online  
window.addEventListener("online", async () => {
  status.innerText = "Back online. Syncing offline queue...";
  await ctrl.syncOffline(msg => status.innerText = msg);
  // refreshing everything
  await ctrl.updateOfflineBadge(offlineBadgeCount);
  await ctrl.rebuildTags(renderTagFilters);
  await render();
  status.innerText = "Offline queue synced";
});

//saving draft 
["input", "change"].forEach(evt => {
  form.addEventListener(evt, e => {
    if (e.target.id === "formReceipt") return;
    ctrl.saveDraftForm({
      title: form.formTitle.value,
      amount: form.formAmount.value,
      date: form.formDate.value,
      tag: form.formTag.value,
      currency: form.inputCurrency.value
    });
  });
});
//restore draft
ctrl.restoreDraft({
  title: v => form.formTitle.value = v,
  amount: v => form.formAmount.value = v,
  date: v => form.formDate.value = v,
  tag: v => form.formTag.value = v,
  currency: v => form.inputCurrency.value = v
});
//clear draft 
clearDraftBtn.addEventListener("click", () => {
  ctrl.clearDraft?.(); // or import clearDraft directly
  form.reset();
  status.innerText = "Draft cleared";
});

//Logout
logoutBtn.addEventListener("click", () => {
  window.location.href = "../loginPage/login.html"
  sessionStorage.removeItem("loggedInRole")
  localStorage.removeItem("preferredCurrency")
})

//LONG POOL
// async function longPollApproval(expenseId) {
//   try {
//     console.log("longpool function hit")
//     const res = await fetch(`http://localhost:5000/${expenseId}/long-poll`);
//     console.log(" longpool api hitt")
//     // timeout (no decision in 30s)
//     if (res.status === 204) {
//       setStatus("No response yet... sending request again...");
//       return longPollApproval(expenseId); // re-poll
//     }
//     const data = await res.json();
// console.log("data",data)
//     // if (data?.status === "Approved") {
//     //   setStatus(" Manager approved your expense!");
//     // } else if (data?.status === "Rejected") {
//     //   setStatus(" Manager rejected your expense!");
//     // } else {
//     //   // if server sends unknown reply
//     //   setStatus("Waiting for manager decision...");
//     //   longPollApproval(expenseId);
//     // }

//   } catch (err) {
//     console.log("Long poll failed, retrying in 5s...", err);
//     setTimeout(() => longPollApproval(expenseId), 5000);
//   }
// }







