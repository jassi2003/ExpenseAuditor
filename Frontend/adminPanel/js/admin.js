import * as ctrl from "../controllers/adminController.js";
import { startConnectivityAuditor } from "../../services/connectivityAuditor.js";
import { getDepartmentInfo } from "../../employeePanel/storage/indexDb.js";
import { addEmployee } from "../../loginPage/storage/indexDb.js";
import { getAllExpenses } from "../../employeePanel/storage/indexDb.js";

/* DOM */
const budgetGrid = document.querySelector("#budgetGrid");
//adding deptt
const depttForm = document.querySelector("#depttForm");
const depttname = document.querySelector("#formDeptt")
const depttBudget = document.querySelector("#formDepttBudget")
const prevvPage= document.querySelector("#prevvPage")
const pageeInfo= document.querySelector("#pageeInfo")
const nexttPage= document.querySelector("#nexttPage")

const expenseTableBody = document.querySelector("#expenseTableBody");
const pageInfo=document.querySelector("#pageInfo")
const prevBtn = document.querySelector("#prevPage");
const nextBtn = document.querySelector("#nextPage");
/* SIDEBAR */
const sidebar = document.querySelector(".sidebar");
/* BUTTONS */
const adminHomeBtn = document.querySelector("#adminHomeBtn");
const adminAddEmpBtn = document.querySelector("#adminAddEmpBtn");
const addDeppBtn = document.querySelector("#addDeppBtn");
const reportGenBtn = document.querySelector("#reportGenBtn");
/* PAGES */
const adminHomePage = document.querySelector("#adminHomePage");
const addEmpPage = document.querySelector("#addEmpPage");
const deptPage = document.querySelector("#deptPage");
const taxReportGenerationPage = document.querySelector("#taxReportGeneration");
// web socket,lie audit feed dom
const wsState = document.querySelector("#wsState");
const wsSendNoteBtn = document.querySelector("#wsSendNoteBtn");
const auditTerminal = document.querySelector("#auditTerminal");
const clearAuditLogBtn = document.querySelector("#clearAuditLogBtn");
//SSE, RATE CHANGE STREAM
const sseState = document.querySelector("#sseState");
const usdInr = document.querySelector("#usdInr");
const usdEur = document.querySelector("#usdEur");
const usdGbp = document.querySelector("#usdGbp");
const usdJpy = document.querySelector("#usdJpy");
const ratesUpdatedAt = document.querySelector("#ratesUpdatedAt");

//audit notes modal
const auditNoteModal = document.querySelector("#auditNoteModal");
const auditNoteInput = document.querySelector("#auditNoteInput");
const previousNotesList = document.querySelector("#previousNotesList");
const saveAuditNoteBtn = document.querySelector("#saveAuditNoteBtn");
const cancelAuditNoteBtn = document.querySelector("#cancelAuditNoteBtn");
const charCount = document.querySelector("#charCount");

//quick info modal
const quickInfoModal = document.querySelector("#quickInfoModal");
const closeQuickInfoBtn = document.querySelector("#closeQuickInfoBtn");
const qiUser = document.querySelector("#qiUser");
const qiStatus = document.querySelector("#qiStatus");
const qiDate = document.querySelector("#qiDate");
const qiTitle = document.querySelector("#qiTitle");
const qiDept = document.querySelector("#qiDept");
const qiAmount = document.querySelector("#qiAmount");
const qiReceipt = document.querySelector("#qiReceipt");

// // Web Worker report generator
const generateReportBtn = document.querySelector("#generateReportBtn");
const reportStatus = document.querySelector("#reportStatus");
const reportOutput = document.querySelector("#reportOutput");
const downloadReportBtn = document.querySelector("#downloadReportBtn");

//REPORT DATES
const fromDateInput = document.getElementById("reportFromDate");
const toDateInput = document.getElementById("reportToDate");
const quarterSelect = document.getElementById("quarterSelect");



//SIDE PANEL PAGE NAVIGATION OBJTS
const refs = {
  pages: {
    home: adminHomePage,
    addEmp: addEmpPage,
    dept: deptPage,
    taxReport: taxReportGenerationPage
  },
  buttons: {
    home: adminHomeBtn,
    addEmp: adminAddEmpBtn,
    dept: addDeppBtn,
    taxReport: reportGenBtn
  }
};

//Logout
document.querySelector("#lgtBtn").addEventListener("click", () => {
  window.location.href = "../loginPage/login.html"
  sessionStorage.removeItem("loggedInRole")
  localStorage.removeItem("preferredCurrency")
})

/* SINGLE EVENT LISTENER (EVENT DELEGATION) */
sidebar.addEventListener("click", (e) => {
  const btn = e.target.closest(".sideBtn[data-page]");
  if (!btn) return;
  const page = btn.dataset.page;
  ctrl.showAdminPage(page, refs);
});
/* INITIAL LOAD (refresh safe) */
ctrl.showAdminPage(ctrl.getPageFromHash("home"), refs);
/* HASH CHANGE (browser back/forward) */
window.addEventListener("hashchange", () => {
  ctrl.showAdminPage(ctrl.getPageFromHash("home"), refs);
});

//Navbars of expenses(approved,pending,rejected)
document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabBtn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    ctrl.setTab(btn.dataset.tab, renderExpenses);
  });
});



/* INIT */
ctrl.renderBudgetGrid({ budgetGrid });

/* ADD DEPARTMENT */
depttForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const info = {
    depttname: depttname.value,
    depttBudget: depttBudget.value
  };
  try {
    await ctrl.addDepartment(info);
    alert("Department added successfully");
    depttForm.reset();
    await renderBudgetGrid();
  } catch (err) {
    alert(err.message);
  }
});
window.addEventListener("department:changed", () => {
  loadDepartments();
});


const flaggedExpenseSet = new WeakSet();

/* EXPENSE LIST */  
async function renderExpenses() {
  const { items, currentPage, totalPages } =
    await ctrl.getPaginatedExpenses();

  expenseTableBody.innerHTML = "";

  if (items.length === 0) {
    expenseTableBody.innerHTML = `
      <tr>
        <td colspan="7">No expenses found</td>
      </tr>
    `;
  } else {
    items.forEach(exp => {
      const tr = document.createElement("tr");
      tr.dataset.id = exp.id;
      tr._auditKey = ctrl.getAuditKey(exp);
      tr._expenseRef = ctrl.getAuditKey(exp);
      const hideActionBtns = exp.status === "Approved" || exp.status === "Rejected";


      tr.innerHTML = `
        <td>${exp.userId || "-"}</td>
        <td>${exp.title}</td>
        <td>₹${exp.amountINR}</td>
        <td>${exp.department}</td>
        <td>${exp.date}</td>
        <td><b>${exp.status}</b></td>
         <td class="actionsCell">
        ${hideActionBtns
          ? ""
          : `
              <button class="tableApproveBtn" data-action="approve" data-id="${exp.id}">
                Approve
              </button>
              <button class="tableRejectBtn" data-action="reject" data-id="${exp.id}">
                Reject
              </button>
            `
        }
        <button class="auditNotesBnt" data-action="note" data-id="${exp.id}">
          Audit Note
        </button>
          <button class="flagBtn" data-action="flag">🚩</button>
        <button  class="quickInfoBtn" data-id="${exp.id}" data-action="info" title="Quick Info">ℹ️</button>
      </td>
      `;

      expenseTableBody.appendChild(tr);
    });
  }
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}
renderExpenses()

prevBtn.addEventListener("click", () => {
  ctrl.prevPage();
  renderExpenses();
});

nextBtn.addEventListener("click", () => {
  ctrl.nextPage();
  renderExpenses();
});

//APPROVE,REJECT,ADUIT NOTES,INFO Btns
expenseTableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const action = btn.dataset.action;
  const expenseId = btn.dataset.id;
  const row = btn.closest("tr");

  // if (!expenseId || !row) return;

  switch (action) {
    case "info":
      await openQuickInfoModal(expenseId);
      break;

    case "note":
      openAuditModal(row);
      break;

    case "approve":
      try {
        await ctrl.approveExpenseCtrl(expenseId);

        alert("Expense approved and budget updated!");


        document.querySelectorAll(".tabBtn")
          .forEach(b => b.classList.remove("active"));

        document
          .querySelector('.tabBtn[data-tab="Approved"]')
          .classList.add("active");

        await ctrl.afterAdminMutation({
          renderExpenses,
          renderBudgetGrid,
          tab: "Approved"
        });

      } catch (err) {
        console.error(err);
      }
      break;


    case "reject":
      try {
        await ctrl.rejectExpenseCtrl(expenseId);

        alert("Expense rejected successfully");

        document.querySelectorAll(".tabBtn")
          .forEach(b => b.classList.remove("active"));

        document
          .querySelector('.tabBtn[data-tab="Rejected"]')
          .classList.add("active");

        await ctrl.afterAdminMutation({
          renderExpenses,
          renderBudgetGrid,
          tab: "Rejected"
        });

      } catch (err) {
        console.error(err);
      }
      break;

    case "flag":
      const expense = row._expenseRef;
      if (flaggedExpenseSet.has(expense)) {
        alert("This expense is already flagged for review.");
        return;
      }
      // Mark as flagged
      flaggedExpenseSet.add(expense);
      // UI feedback
      row.classList.add("flagged");
      btn.disabled = true;
      btn.textContent = "Flagged";
      console.log("Flagged expenses (session-only):", flaggedExpenseSet);
      return;
  }

});

expenseTableBody.addEventListener("click", () => {
})






//start live audit feed web sockets
const AUDIT_LOG_KEY = "AUDIT_TERMINAL_LOGS";
const AUDIT_LOG_MAX_LINES = 200;

let auditLogLines = [];


function loadAuditLogs() {
  try {
    const raw = sessionStorage.getItem(AUDIT_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

//saving logs in session storage
function saveAuditLogs() {
  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLogLines));
}

//display the time of event
function fmtAuditTime(ts = Date.now()) {
  return new Date(ts).toLocaleTimeString();
}

//appending data in audit logs lines
function appendAuditLog(text, level = "dim") {
  auditLogLines.push({ text, level });
  if (auditLogLines.length > AUDIT_LOG_MAX_LINES) {
    auditLogLines.splice(0, auditLogLines.length - AUDIT_LOG_MAX_LINES);
  }
  saveAuditLogs();
  renderAuditTerminal();
}

//displaying the data in terminal
function renderAuditTerminal() {
  if (!auditTerminal) return;
  auditTerminal.innerHTML = auditLogLines
    .map(({ text, level }) => `<div class="line ${level}">${text}</div>`)
    .join("");
  auditTerminal.scrollTop = auditTerminal.scrollHeight;
}


//restore logs on reload
auditLogLines = loadAuditLogs();
renderAuditTerminal();

//  clear terminal + session
clearAuditLogBtn?.addEventListener("click", () => {
  auditLogLines = [];
  sessionStorage.removeItem(AUDIT_LOG_KEY);
  renderAuditTerminal();
});


// state: "online" | "checking" | "offline" 4 leds
const matrixRefs = {
  WS: {
    led: document.querySelector("#ledWS"),
    meta: document.querySelector("#metaWS"),
  },
  SSE: {
    led: document.querySelector("#ledSSE"),
    meta: document.querySelector("#metaSSE"),
  },
  SP: {
    led: document.querySelector("#ledSP"),
    meta: document.querySelector("#metaSP"),
  }
};


//  WebSockets Live Audit Feed
const auditFeed = ctrl.startAuditFeed({
  url: "ws://localhost:5000/ws/audit",
  onState: ({ state, attempt }) => {
    if (!wsState) return;

    if (state === "online") {
      wsState.textContent = "WS: Connected ";
      wsState.className = "wsOnline";
      ctrl.setMatrix("WS", "online", "Connected", matrixRefs);
      appendAuditLog(`[${fmtAuditTime()}] WS Connected`, "ok");

    } else if (state === "reconnecting") {
      wsState.textContent = `WS: Reconnecting... (attempt ${attempt})`;
      wsState.className = "wsOffline";
      appendAuditLog(`[${fmtAuditTime()}] WS Reconnecting (attempt ${attempt})`, "warn");
      ctrl.setMatrix("WS", "checking", `Reconnecting (${attempt})`, matrixRefs);

    } else {
      wsState.textContent = "WS: Disconnected ";
      wsState.className = "wsOffline";
      appendAuditLog(`[${fmtAuditTime()}]  WS Disconnected`, "err");
      ctrl.setMatrix("SSE", "checking", "Connecting...", matrixRefs);
    }

  },

  //  ONLY ONE onEvent
  onEvent: (payload) => {
    const t = fmtAuditTime(payload.time ? new Date(payload.time).getTime() : Date.now());
    if (payload.event === "EXPENSE_SUBMITTED") {
      appendAuditLog(
        `[${t}]  EXPENSE_SUBMITTED | ${payload.empMail || "employee"} | ${payload.department} | ₹${payload.amountINR} | ${payload.title} | ${payload.status}`,
        "ok"
      );

      const toastPayload = {
        title: "New Expense Submitted",
        message: `${payload.empMail || "Employee"} submitted ₹${payload.amountINR} for ${payload.title}`,
        type: "success",
      };
      ctrl.showToast(toastPayload);
      ctrl.saveToast(toastPayload);
    }

  else if(payload.event==="EXPENSE_APPROVED"){
  appendAuditLog(
        `[${t}]  EXPENSE APPROVED`,"ok");}
     else if (payload.event === "ADMIN_NOTE") {
      appendAuditLog(`[${t}]  ADMIN_NOTE | ${payload.note}`, "dim");
    } else {
      appendAuditLog(`[${t}]  EVENT | ${JSON.stringify(payload)}`, "dim");
    }
  },
});
ctrl.restoreToasts();


// Send admin note
wsSendNoteBtn?.addEventListener("click", () => {
  const note = prompt("Enter admin note to broadcast:");
  if (!note) return;

  const ok = auditFeed.send({
    type: "ADMIN_NOTE",
    payload: { note },
  });

  if (!ok) alert("WS not connected. Try again.");
});

window.addEventListener("beforeunload", () => {
  auditFeed.stop();
});


//SSE RATE CHANGE STREAM
window.addEventListener("beforeunload", () => {
  ctrl.stopRatesStream();
});

ctrl.startRatesStream({
  url: "http://localhost:5000/api/conversion/rates/stream",

  onConnecting: () => {
    sseState.textContent = "SSE: Connecting...";
    ctrl.setMatrix("SSE", "checking", "Connecting...", matrixRefs);
  },
  //on receiving "hello mssg" from server
  onHello: () => {
    sseState.textContent = "SSE: Connected";
    appendAuditLog("Rates stream live", "success"),
      ctrl.setMatrix("SSE", "online", "Streaming rates...", matrixRefs);
  },
  //on receving rates from api
  onRates: (data) => {
    ctrl.setMatrix("SSE", "online", "Connected", matrixRefs);
    usdInr.textContent = data.rates.INR;
    usdEur.textContent = data.rates.EUR;
    usdGbp.textContent = data.rates.GBP;
    usdJpy.textContent = data.rates.JPY;

    ratesUpdatedAt.textContent =
      `Last update: ${new Date(data.time).toLocaleTimeString()}`;

    // renderExpenseList();
  },
  onError: () => {
    sseState.textContent = "SSE: Disconnected (reconnecting...)";
    ctrl.setMatrix("SSE", "offline", "Error / reconnecting...", matrixRefs);
  }
});


//SHORT POOLING 
function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString();
}
const stopAuditor = startConnectivityAuditor({
  url: "http://localhost:5000/api/health",
  baseInterval: 5000,
  timeoutMs: 2500,
  maxInterval: 60000,

  onStatus: (info) => {
    if (!spLed || !spText) return;

    if (info.state === "checking") {
      ctrl.setMatrix("SP", "checking", "Checking...", matrixRefs);
      spLed.className = "led yellow";
      spText.textContent = "Connectivity: Checking...";
      spMeta.textContent = `Attempt: ${info.attempt} | Next check in: ${info.nextDelay}ms`;
    }

    if (info.state === "online") {
      ctrl.setMatrix("SP", "online", "Healthy", matrixRefs);
      spLed.className = "led green";
      spText.textContent = "Connectivity: Online ";
      spMeta.textContent = `Last OK: ${fmtTime(
        info.lastOkAt
      )} | Next check: ${info.nextDelay}ms | Server time: ${info.serverTime}`;
    }

    if (info.state === "offline") {
      ctrl.setMatrix("SP", "offline", "Backend Down", matrixRefs);
      spLed.className = "led red";
      spText.textContent = "Connectivity: Offline ";
      spMeta.textContent = `Attempt: ${info.attempt} | Error: ${info.error} | Retry in: ${info.nextDelay}ms`;
    }

    if (info.state === "stopped") {
      spLed.className = "led yellow";
      spText.textContent = "Connectivity: Stopped";
      spMeta.textContent = "";
    }
  },
});

window.addEventListener("beforeunload", () => stopAuditor());


//BUDGET GRID
async function renderBudgetGrid() {
  const stats = await ctrl.getDepartmentBudgetStats();

const {items,currPage,totalPages}=ctrl.paginate(stats)

  budgetGrid.innerHTML = "";

  if (items.length === 0) {
    budgetGrid.innerHTML = `<p>No departments found.</p>`;
    return;
  }

  items.forEach(stat => {
    const card = document.createElement("div");
    card.className = "budgetCard";

    card.innerHTML = `
      <div class="budgetRowTop">
        <div class="budgetDeptName">
          ${ctrl.formatDeptName(stat.deptKey)}
        </div>
        <div><b>${stat.usedPercent.toFixed(0)}%</b> used</div>
      </div>

      <div class="budgetNumbers">
        <div>Total: <b>₹${stat.totalBudget}</b></div>
        <div>Consumed: <b>₹${stat.consumed}</b></div>
        <div>Remaining: <b>₹${stat.remaining}</b></div>
      </div>
      <div class="progressWrap">
        <div class="progressBar" style="width:${stat.usedPercent}%;"></div>
      </div>
    `;
    budgetGrid.appendChild(card);
  });
    pageeInfo.textContent = `Page ${currPage} of ${totalPages}`;
}
renderBudgetGrid();

nexttPage.addEventListener("click", async () => {
    const stats = await ctrl.getDepartmentBudgetStats();
    const totalPages = Math.ceil(stats.length / 4);

    ctrl.nextDepttPage(totalPages);
    renderBudgetGrid();
  });

prevvPage.addEventListener("click", () => {
    ctrl.prevDepttPage();
    renderBudgetGrid();
  });


//loading the departments in the select 
const Empdepartment = document.querySelector("#formDepartment")

async function loadDepartments() {
  try {
    const departments = await getDepartmentInfo();
    Empdepartment.innerHTML = `<option value="">Select</option>`;
    if (departments.length === 0) {
      Empdepartment.innerHTML = `<option value="">No Departments Found</option>`
    }
    departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.depttname;
      option.textContent = dept.depttname.toUpperCase();
      Empdepartment.appendChild(option);
    });
  }
  catch (err) {
    console.error("failed to load departments", err)
    Empdepartment.innerHtml = `<option value="">Failed to load departments</option>`
  }
}
loadDepartments()
// Add Employee Form Box1
addEmpForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.querySelector("#formName").value.trim();
  const email = document.querySelector("#formEmail").value.trim().toLowerCase();
  const password = document.querySelector("#formPass").value.trim();
  const userId = document.querySelector("#formUserId").value.trim()

  const empdepartment = Empdepartment.value.trim()
  passError.innerText = "";
  if (!name || !email || !password || !userId || !empdepartment) {
    alert("Please fill all fields");
    return;
  }
  const errMsg = ctrl.validateStrongPassword(password);
  if (errMsg) {
    passError.innerText = errMsg;
    return;
  }
  try {
    await addEmployee({ userId, name, email, password, empdepartment });
    addEmpForm.reset();
    alert("Employee added successfully");
    await ctrl.getAllEmployees();
    await renderEmployees()

  } catch (err) {
    alert(err);
  }
});
document.querySelector("#formPass")?.addEventListener("input", (e) => {
  const msg = ctrl.validateStrongPassword(e.target.value.trim());
  document.querySelector("#passError").innerText = msg;
});



// showing all employees in box 2
const empTable = document.querySelector("#empTable");

async function renderEmployees() {
  const employees = await ctrl.getAllEmployees();
  // remove old tbody safely
  empTable.querySelector("tbody")?.remove();
  const tbody = document.createElement("tbody");
  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No employees found</td></tr>`;
    empTable.appendChild(tbody);
    return;
  }
  employees.forEach((emp, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${emp.userId}</td>
      <td>${emp.email}</td>
      <td>${emp.department}</td>
    `;
    tbody.appendChild(tr);
  });
  empTable.appendChild(tbody);
}
renderEmployees()


// AUDIT NOTES LOGIC
function renderPreviousNotes(notes) {
  previousNotesList.innerHTML = "";

  if (!notes.length) {
    previousNotesList.innerHTML = "<p class='dim'>No previous notes</p>";
    return;
  }

  notes.forEach(n => {
    const div = document.createElement("div");
    div.className = "noteItem";
    div.innerHTML = `
      <div>${n.text}</div>
      <small>${new Date(n.time).toLocaleTimeString()}</small>
    `;
    previousNotesList.appendChild(div);
  });
}

/* Character counter */
auditNoteInput.addEventListener("input", () => {
  charCount.textContent = auditNoteInput.value.length;
});

/* Open modal */
function openAuditModal(row) {
  const key = ctrl.getAuditKey(row);
  const notes = ctrl.openAudit(key);

  auditNoteInput.value = "";
  charCount.textContent = "0";
  renderPreviousNotes(notes);
  auditNoteModal.classList.remove("hidden");
}

/* Save note */
saveAuditNoteBtn.addEventListener("click", () => {
  const text = auditNoteInput.value.trim();
  if (!text) return;

  const notes = ctrl.saveAuditNote(text);
  renderPreviousNotes(notes);

  auditNoteInput.value = "";
  charCount.textContent = "0";
});

/* Close modal */
cancelAuditNoteBtn.addEventListener("click", () => {
  ctrl.closeAudit();
  auditNoteModal.classList.add("hidden");
});

//OPENING QUICK INFO MODEL

let activeReceiptURL = null;

async function openQuickInfoModal(expId) {
  const expense = await ctrl.getQuickInfoModal(expId)
  if (!expense) return;
  qiUser.textContent = expense.userId || "-";
  qiStatus.textContent = expense.status;
  qiDate.textContent = expense.date;
  qiTitle.textContent = expense.title;
  qiDept.textContent = expense.department;
  qiAmount.textContent = `₹${expense.amountINR}`;

  qiReceipt.innerHTML = "";
  if (expense.receipt instanceof File) {
    const file = expense.receipt;
    // Create object URL
    activeReceiptURL = URL.createObjectURL(file);
    // View button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View Receipt";
    viewBtn.className = "viewReceiptBtn";
    viewBtn.onclick = () => window.open(activeReceiptURL);
    qiReceipt.appendChild(viewBtn);
  }
  else {
    qiReceipt.textContent = "No receipt uploaded";
  }
  quickInfoModal.classList.remove("hidden");
}

//closing quick info modal
closeQuickInfoBtn.addEventListener("click", () => {
  quickInfoModal.classList.add("hidden");
});



//webworker, generating the report 
[fromDateInput, toDateInput].forEach(input => {
  input.addEventListener("keydown", e => {
    e.preventDefault(); 
  });
});

quarterSelect.addEventListener("change", () => {
  const year = 2026; 
  const quarters = {
    Q1: { from: `${year}-01-01`, to: `${year}-03-31` },
    Q2: { from: `${year}-04-01`, to: `${year}-06-30` },
    Q3: { from: `${year}-07-01`, to: `${year}-09-30` },
    Q4: { from: `${year}-10-01`, to: `${year}-12-31` }
  };
  const selected = quarters[quarterSelect.value];
  if (!selected) {
    fromDateInput.value = "";
    toDateInput.value = "";
    return;
  }
  fromDateInput.value = selected.from;
  toDateInput.value = selected.to;
});


generateReportBtn?.addEventListener("click", async () => {
  generateReportBtn.disabled = true;
  generateReportBtn.textContent = "Generating...";
  reportStatus.textContent = "Status: Preparing data...";
  reportOutput.textContent = "Working...";
  
  const expenses = await getAllExpenses();
  

 const fromDate = fromDateInput.value;
  const toDate = toDateInput.value;
  // basic validation


  if (!fromDate || !toDate) {
    alert("Please select both From and To dates");
    return;
  }
  if (new Date(fromDate) > new Date(toDate)) {
    alert("From date cannot be after To date");
    return;
  }

  ctrl.generateTaxReport({
    expenses,
    fromDate,
     toDate,

    onProgress: ({ percent }) => {
      reportStatus.textContent = `Status: Processing... ${percent}%`;
    },

    onDone: (report) => {
      reportStatus.textContent =
        `Status: Report Ready (${report.fromDate} → ${report.toDate})`;

      // reportOutput.textContent = JSON.stringify(report, null, 2);
      reportOutput.innerHTML = ctrl.renderReportTable(report);


      downloadReportBtn.disabled = false;
      generateReportBtn.disabled = false;
      generateReportBtn.textContent = "Generate Report";
    },

    onError: () => {
      reportStatus.textContent = "Status: Worker Error";
      generateReportBtn.disabled = false;
      generateReportBtn.textContent = "Generate Report";
    },
  });
});

downloadReportBtn.addEventListener("click", () => {
  const ok = ctrl.downloadLatestTaxReport()
  if (!ok) alert("No report generated yet!");

})






