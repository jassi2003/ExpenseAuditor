
// import { addEmployee, getAllUsers } from "../../loginPage/storage/indexDb.js";
// import { getAllExpenses } from "../../employeePanel/storage/indexDb.js";
// import { startConnectivityAuditor } from "../../services/connectivityAuditor.js";
// import { startLiveAuditFeed } from "../services/liveAuditFeed.js";
// import { addDepartmentInfo, approveExpense, rejectExpense, getDepartmentInfo } from "../../employeePanel/storage/indexDb.js";

// //adding deptt
// const depttForm = document.querySelector("#depttForm")
// const depttname = document.querySelector("#formDeptt")
// const depttBudget = document.querySelector("#formDepttBudget")

// //pagination
// const prevBtn = document.querySelector("#prevPage");
// const nextBtn = document.querySelector("#nextPage");
// const pageInfo = document.querySelector("#pageInfo");

// //audit notes modal
// const auditNoteModal = document.querySelector("#auditNoteModal");
// const auditNoteInput = document.querySelector("#auditNoteInput");
// const previousNotesList = document.querySelector("#previousNotesList");
// const saveAuditNoteBtn = document.querySelector("#saveAuditNoteBtn");
// const cancelAuditNoteBtn = document.querySelector("#cancelAuditNoteBtn");
// const charCount = document.querySelector("#charCount");
// let currentAuditKey = null; // currently selected
// const expenseKeyMap = new Map(); // expenseId → (id)  // Stable key store (strong reference)
// const auditNotesMap = new WeakMap(); // keyObj → notes[]  Weak association

// //quick info modal
// const quickInfoModal = document.querySelector("#quickInfoModal");
// const closeQuickInfoBtn = document.querySelector("#closeQuickInfoBtn");
// const qiUser = document.querySelector("#qiUser");
// const qiStatus = document.querySelector("#qiStatus");
// const qiDate = document.querySelector("#qiDate");
// const qiTitle = document.querySelector("#qiTitle");
// const qiDept = document.querySelector("#qiDept");
// const qiAmount = document.querySelector("#qiAmount");
// const qiReceipt = document.querySelector("#qiReceipt");


// // DOM Selectors
// const logoutBtn = document.querySelector("#lgtBtn");
// const addEmpForm = document.querySelector("#addEmpForm");
// const Empdepartment = document.querySelector("#formDepartment")
// const expenseTableBody = document.querySelector("#expenseTableBody");

// const adminHomeBtn = document.querySelector("#adminHomeBtn");
// const adminAddEmpBtn = document.querySelector("#adminAddEmpBtn");
// const addDeppBtn = document.querySelector("#addDeppBtn");

// const adminHomePage = document.querySelector("#adminHomePage");
// const addEmpPage = document.querySelector("#addEmpPage");
// const deptPage = document.querySelector("#deptPage");

// const passError = document.querySelector("#passError");

// // WS Live Audit Feed UI
// const wsState = document.querySelector("#wsState");
// const wsSendNoteBtn = document.querySelector("#wsSendNoteBtn");
// const auditTerminal = document.querySelector("#auditTerminal");
// const clearAuditLogBtn = document.querySelector("#clearAuditLogBtn");

// // Short polling widget
// const spLed = document.querySelector("#spLed");
// const spText = document.querySelector("#spText");
// const spMeta = document.querySelector("#spMeta");

// // Web Worker report generator
// const generateReportBtn = document.querySelector("#generateReportBtn");
// const reportStatus = document.querySelector("#reportStatus");
// const reportOutput = document.querySelector("#reportOutput");
// const taxReportGenerationPage = document.querySelector("#taxReportGeneration");
// const reportGenBtn = document.querySelector("#reportGenBtn");
// const downloadReportBtn = document.querySelector("#downloadReportBtn");

// // SSE - Global Exchange Rates
// const sseState = document.querySelector("#sseState");
// const usdInr = document.querySelector("#usdInr");
// const usdEur = document.querySelector("#usdEur");
// const usdGbp = document.querySelector("#usdGbp");
// const usdJpy = document.querySelector("#usdJpy");
// const ratesUpdatedAt = document.querySelector("#ratesUpdatedAt");

// // STATUS MATRIX
// const ledWS = document.querySelector("#ledWS");
// const metaWS = document.querySelector("#metaWS");
// const ledSSE = document.querySelector("#ledSSE");
// const metaSSE = document.querySelector("#metaSSE");
// const ledLP = document.querySelector("#ledLP");
// const metaLP = document.querySelector("#metaLP");
// const ledSP = document.querySelector("#ledSP");
// const metaSP = document.querySelector("#metaSP");


// //VISUALIZATION OF DEPARTMENTS
// const budgetGrid = document.querySelector("#budgetGrid");

// function formatDeptName(name) {
//   // showing nice title case
//   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
// }
// //rendering the budget info of department
// async function renderBudgetGrid() {
//   const departments = await getDepartmentInfo();
//   const expenses = await getAllExpenses();

//   //  Map consumed per dept (APPROVED ONLY)
//   const consumedMap = new Map();

//   expenses.forEach((exp) => {
//     if (exp.status !== "Approved") return;

//     const deptKey = (exp.department || "").trim().toLowerCase();
//     const amount = Number(exp.amountINR) || 0;

//     if (!deptKey) return;

//     const old = consumedMap.get(deptKey) || 0;
//     consumedMap.set(deptKey, old + amount);
//   });

//   //  Step 2 Rendering the cards
//   budgetGrid.innerHTML = "";

//   if (departments.length === 0) {
//     budgetGrid.innerHTML = `<p>No departments found.</p>`;
//     return;
//   }

//   departments.forEach((dept) => {
//     const deptKey = (dept.depttname || "").trim().toLowerCase();

//     const totalBudget = Number(dept.depttBudget) || 0;
//     const consumed = consumedMap.get(deptKey) || 0;

//     const remaining = Math.max(totalBudget - consumed, 0);
//     const usedPercent = totalBudget > 0 ? Math.min((consumed / totalBudget) * 100, 100) : 0;

//     const card = document.createElement("div");
//     card.className = "budgetCard";

//     card.innerHTML = `
//       <div class="budgetRowTop">
//         <div class="budgetDeptName">${formatDeptName(deptKey)}</div>
//         <div><b>${usedPercent.toFixed(0)}%</b> used</div>
//       </div>

//       <div class="budgetNumbers">
//         <div>Total: <b>₹${totalBudget}</b></div>
//         <div>Consumed: <b>₹${consumed}</b></div>
//         <div>Remaining: <b>₹${remaining}</b></div>
//       </div>

//       <div class="progressWrap">
//         <div class="progressBar" style="width:${usedPercent}%;"></div>
//       </div>
//     `;

//     budgetGrid.appendChild(card);
//   });
// }
// renderBudgetGrid()




// //ADDING DEPARTMENT INFO
// depttForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const info = {
//     depttname: depttname.value.trim().toLowerCase(),
//     depttBudget: depttBudget.value.trim()
//   }
//   try {
//     await addDepartmentInfo(info)
//     alert("department info added successfully")
//     depttForm.reset()
//     await loadDepartments()
//     await renderBudgetGrid()

//   }
//   catch (err) {
//     alert(err);
//     depttForm.reset()
//   }
// })


// // state: "online" | "checking" | "offline"
// function setMatrix(name, state, msg = "") {
//   let ledEl, metaEl;
//   if (name === "WS") { ledEl = ledWS; metaEl = metaWS; }
//   if (name === "SSE") { ledEl = ledSSE; metaEl = metaSSE; }
//   if (name === "LP") { ledEl = ledLP; metaEl = metaLP; }
//   if (name === "SP") { ledEl = ledSP; metaEl = metaSP; }
//   if (!ledEl || !metaEl) return;
//   if (state === "online") ledEl.className = "led green";
//   else if (state === "checking") ledEl.className = "led yellow";
//   else ledEl.className = "led red";
//   metaEl.textContent = msg || state;
// }

// //SSE
// let ratesSource = null;
// function startRatesStream() {
//   if (ratesSource) ratesSource.close();
//   setMatrix("SSE", "checking", "Connecting...");

//   sseState.textContent = "SSE: Connecting...";

//   ratesSource = new EventSource("http://localhost:5000/api/conversion/rates/stream");

//   ratesSource.addEventListener("hello", () => {
//     sseState.textContent = "SSE: Connected ";
//     setMatrix("SSE", "online", "Streaming rates...");
//   });
//   ratesSource.addEventListener("rates", (e) => {
//     const data = JSON.parse(e.data);
//     setMatrix("SSE", "online", "Connected");
//     usdInr.textContent = data.rates.INR;
//     usdEur.textContent = data.rates.EUR;
//     usdGbp.textContent = data.rates.GBP;
//     usdJpy.textContent = data.rates.JPY;
//     ratesUpdatedAt.textContent = `Last update: ${new Date(data.time).toLocaleTimeString()}`;


//   renderExpenseList();
//   });
//   ratesSource.onerror = () => {
//     // EventSource auto reconnects
//     sseState.textContent = "SSE: Disconnected  (reconnecting...)";
//     setMatrix("SSE", "offline", "Error / reconnecting...");

//   };
// }
// startRatesStream();
// window.addEventListener("beforeunload", () => {
//   if (ratesSource) ratesSource.close();
// });


// // LIVE AUDIT FEED PERSISTENCE (sessionStorage)
// const AUDIT_LOG_KEY = "AUDIT_TERMINAL_LOGS";
// const AUDIT_LOG_MAX_LINES = 200;

// let auditLogLines = [];

// function loadAuditLogs() {
//   try {
//     const raw = sessionStorage.getItem(AUDIT_LOG_KEY);
//     const parsed = raw ? JSON.parse(raw) : [];
//     return Array.isArray(parsed) ? parsed : [];
//   } catch (e) {
//     return [];
//   }
// }
// function saveAuditLogs() {
//   sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLogLines));
// }
// function fmtAuditTime(ts = Date.now()) {
//   return new Date(ts).toLocaleTimeString();
// }
// function renderAuditTerminal() {
//   if (!auditTerminal) return;

//   auditTerminal.innerHTML = auditLogLines
//     .map(({ text, level }) => `<div class="line ${level}">${text}</div>`)
//     .join("");

//   auditTerminal.scrollTop = auditTerminal.scrollHeight;
// }

// function appendAuditLog(text, level = "dim") {
//   auditLogLines.push({ text, level });

//   if (auditLogLines.length > AUDIT_LOG_MAX_LINES) {
//     auditLogLines.splice(0, auditLogLines.length - AUDIT_LOG_MAX_LINES);
//   }

//   saveAuditLogs();
//   renderAuditTerminal();
// }

// //  restore logs on reload
// auditLogLines = loadAuditLogs();
// renderAuditTerminal();

// //  clear terminal + session
// clearAuditLogBtn?.addEventListener("click", () => {
//   auditLogLines = [];
//   sessionStorage.removeItem(AUDIT_LOG_KEY);
//   renderAuditTerminal();
// });

// //  WebSockets Live Audit Feed
// const auditFeed = startLiveAuditFeed({
//   url: "ws://localhost:5000/ws/audit",


//   onState: ({ state, attempt }) => {
//     if (!wsState) return;

//     if (state === "online") {
//       wsState.textContent = "WS: Connected ";
//       wsState.className = "wsOnline";
//       appendAuditLog(`[${fmtAuditTime()}] WS Connected`, "ok");
//     } else if (state === "reconnecting") {
//       wsState.textContent = `WS: Reconnecting... (attempt ${attempt})`;
//       wsState.className = "wsOffline";
//       appendAuditLog(`[${fmtAuditTime()}] WS Reconnecting (attempt ${attempt})`, "warn");
//     } else {
//       wsState.textContent = "WS: Disconnected ";
//       wsState.className = "wsOffline";
//       appendAuditLog(`[${fmtAuditTime()}]  WS Disconnected`, "err");
//     }
//     if (state === "online") {
//       setMatrix("WS", "online", "Connected");
//     } else if (state === "reconnecting") {
//       setMatrix("WS", "checking", `Reconnecting (${attempt})`);
//     } else {
//       setMatrix("WS", "offline", "Disconnected");
//     }
//   },

//   //  ONLY ONE onEvent
//   onEvent: (payload) => {
//     const t = fmtAuditTime(payload.time ? new Date(payload.time).getTime() : Date.now());
//     if (payload.event === "EXPENSE_SUBMITTED") {
//       appendAuditLog(
//         `[${t}]  EXPENSE_SUBMITTED | ${payload.empMail || "employee"} | ${payload.department} | ₹${payload.amountINR} | ${payload.title} | ${payload.status}`,
//         "ok"
//       );
//       const toastPayload={
//     title: "New Expense Submitted",
//     message: `${payload.empMail || "Employee"} submitted ₹${payload.amountINR} for ${payload.title}`,
//     type: "success",
//   };
//   showToast(toastPayload);
// saveToast(toastPayload);

  
//     } 
    
//     else if (payload.event === "EXPENSE_DECISION") {
//       appendAuditLog(
//         `[${t}]  EXPENSE_DECISION | expenseId=${payload.expenseId} | decision=${payload.decision}`,
//         "warn"
//       );
//     } else if (payload.event === "ADMIN_NOTE") {
//       appendAuditLog(`[${t}]  ADMIN_NOTE | ${payload.note}`, "dim");
//     } else {
//       appendAuditLog(`[${t}]  EVENT | ${JSON.stringify(payload)}`, "dim");
//     }
//   },
// });

// // Send admin note
// wsSendNoteBtn?.addEventListener("click", () => {
//   const note = prompt("Enter admin note to broadcast:");
//   if (!note) return;

//   const ok = auditFeed.send({
//     type: "ADMIN_NOTE",
//     payload: { note },
//   });

//   if (!ok) alert("WS not connected. Try again.");
// });

// window.addEventListener("beforeunload", () => {
//   auditFeed.stop();
// });

// //TOAST NOTIFICATION
// //persist toast in sessions storage
// const TOAST_STORE_KEY = "ADMIN_PENDING_TOASTS";
// function saveToast(toast) {
//   const existing = JSON.parse(sessionStorage.getItem(TOAST_STORE_KEY) || "[]");
//   existing.push(toast);
//   sessionStorage.setItem(TOAST_STORE_KEY, JSON.stringify(existing));
// }
// function loadToasts() {
//   return JSON.parse(sessionStorage.getItem(TOAST_STORE_KEY) || "[]");
// }
// function clearToasts() {
//   sessionStorage.removeItem(TOAST_STORE_KEY);
// }

// //restore toast on page reload
// window.addEventListener("DOMContentLoaded", () => {
//   const pendingToasts = loadToasts();

//   pendingToasts.forEach((t) => {
//     showToast({ ...t, duration: 3000 });
//   });

//   setTimeout(clearToasts, 1000);
// });


// //showing toast notification
// const toastContainer = document.querySelector("#toastContainer");
// function showToast({ title, message, type = "success", duration = 4000 }) {
//   const toast = document.createElement("div");
//   toast.className = `toast ${type}`;
//   toast.innerHTML = `
//     <div class="toast-title">${title}</div>
//     <div class="toast-msg">${message}</div>
//   `;

//   toastContainer.appendChild(toast);

//   requestAnimationFrame(() => toast.classList.add("show"));

//   setTimeout(() => {
//     toast.classList.remove("show");
//   }, duration);

//   setTimeout(() => {
//     toast.remove();
//   }, duration + 300);
// }





// // Web Worker Report Download
// let taxWorker = null;
// let latestReport = null;

// function escapeCsv(value) {
//   if (value === null || value === undefined) return "";
//   const str = String(value);

//   if (/[,"\n]/.test(str)) {
//     return `"${str.replace(/"/g, '""')}"`;
//   }
//   return str;
// }

// function reportToCsv(report) {
//   const lines = [];

//   lines.push("SECTION,KEY,VALUE");
//   lines.push(`Summary,Quarter,${escapeCsv(report.quarter)}`);
//   lines.push(`Summary,Year,${escapeCsv(report.year)}`);
//   lines.push(`Summary,Total Expenses,${escapeCsv(report.totalExpenses)}`);
//   lines.push(`Summary,Deductible Total,${escapeCsv(report.deductibleTotal)}`);
//   lines.push(`Summary,Expense Count,${escapeCsv(report.count)}`);
//   lines.push(`Summary,Generated At,${escapeCsv(report.generatedAt)}`);

//   lines.push("");

//   lines.push("SECTION,DEPARTMENT,TOTAL,DEDUCTIBLE,COUNT");
//   const deptObj = report.byDepartment || {};
//   for (const dept of Object.keys(deptObj)) {
//     const d = deptObj[dept];
//     lines.push(
//       `ByDepartment,${escapeCsv(dept)},${escapeCsv(d.total)},${escapeCsv(
//         d.deductible
//       )},${escapeCsv(d.count)}`
//     );
//   }

//   lines.push("");

//   lines.push("SECTION,CATEGORY,TOTAL,DEDUCTIBLE,COUNT");
//   const catObj = report.byCategory || {};
//   for (const cat of Object.keys(catObj)) {
//     const c = catObj[cat];
//     lines.push(
//       `ByCategory,${escapeCsv(cat)},${escapeCsv(c.total)},${escapeCsv(
//         c.deductible
//       )},${escapeCsv(c.count)}`
//     );
//   }

//   return lines.join("\n");
// }

// function downloadTextFile(filename, text) {
//   const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();

//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

// downloadReportBtn?.addEventListener("click", () => {
//   if (!latestReport) {
//     alert("No report generated yet!");
//     return;
//   }

//   const csv = reportToCsv(latestReport);
//   const fileName = `Quarterly_Tax_Report_${latestReport.quarter}_${latestReport.year}.csv`;
//   downloadTextFile(fileName, csv);
// });

// // Web Worker init
// function initTaxWorker() {
//   if (taxWorker) taxWorker.terminate();

//   taxWorker = new Worker(new URL("../../worker/webWorker.js", import.meta.url), {
//     type: "module",
//   });

//   taxWorker.onmessage = (e) => {
//     const { type, payload } = e.data;

//     if (type === "PROGRESS") {
//       reportStatus.textContent = `Status: Processing... ${payload.percent}%`;
//       return;
//     }

//     if (type === "DONE") {
//       reportStatus.textContent = `Status: Report Ready  (${payload.quarter} ${payload.year})`;
//       reportOutput.textContent = JSON.stringify(payload, null, 2);

//       latestReport = payload;
//       downloadReportBtn.disabled = false;

//       generateReportBtn.disabled = false;
//       generateReportBtn.textContent = "Generate Quarterly Report";
//       return;
//     }
//   };

//   taxWorker.onerror = (err) => {
//     console.error("Worker error:", err);
//     reportStatus.textContent = "Status: Worker Error ";
//     generateReportBtn.disabled = false;
//     generateReportBtn.textContent = "Generate Quarterly Report";
//   };
// }

// generateReportBtn?.addEventListener("click", async () => {
//   generateReportBtn.disabled = true;
//   generateReportBtn.textContent = "Generating...";
//   reportStatus.textContent = "Status: Preparing data...";
//   reportOutput.textContent = "Working...";

//   initTaxWorker();

//   const expenses = await getAllExpenses();

//   // heavy dataset simulation
//   const bigExpenses = [];
//   for (let i = 0; i < 30; i++) {
//     bigExpenses.push(...expenses);
//   }

//   const quarter = "Q1";
//   const year = 2026;

//   reportStatus.textContent = `Status: Sending ${bigExpenses.length} records to worker...`;

//   taxWorker.postMessage({
//     type: "GENERATE_REPORT",
//     payload: {
//       expenses: bigExpenses,
//       quarter,
//       year,
//     },
//   });
// });







// // Short Polling Auditor
// function fmtTime(ts) {
//   if (!ts) return "—";
//   return new Date(ts).toLocaleTimeString();
// }
// const stopAuditor = startConnectivityAuditor({
//   url: "http://localhost:5000/api/health",
//   baseInterval: 5000,
//   timeoutMs: 2500,
//   maxInterval: 60000,

//   onStatus: (info) => {
//     if (!spLed || !spText) return;
//     if (info.state === "checking") {
//       setMatrix("SP", "checking", "Checking...");
//     }
//     if (info.state === "online") {
//       setMatrix("SP", "online", "Healthy");
//     }
//     if (info.state === "offline") {
//       setMatrix("SP", "offline", "Backend Down");
//     }
//     if (info.state === "checking") {
//       spLed.className = "led yellow";
//       spText.textContent = "Connectivity: Checking...";
//       spMeta.textContent = `Attempt: ${info.attempt} | Next check in: ${info.nextDelay}ms`;
//     }

//     if (info.state === "online") {
//       spLed.className = "led green";
//       spText.textContent = "Connectivity: Online ";
//       spMeta.textContent = `Last OK: ${fmtTime(
//         info.lastOkAt
//       )} | Next check: ${info.nextDelay}ms | Server time: ${info.serverTime}`;
//     }

//     if (info.state === "offline") {
//       spLed.className = "led red";
//       spText.textContent = "Connectivity: Offline ";
//       spMeta.textContent = `Attempt: ${info.attempt} | Error: ${info.error} | Retry in: ${info.nextDelay}ms`;
//     }

//     if (info.state === "stopped") {
//       spLed.className = "led yellow";
//       spText.textContent = "Connectivity: Stopped";
//       spMeta.textContent = "";
//     }
//   },
// });

// window.addEventListener("beforeunload", () => stopAuditor());

// // Sidebar Navigation
// window.addEventListener("DOMContentLoaded", () => {
//   function setActive(btn) {
//     [adminHomeBtn, adminAddEmpBtn, addDeppBtn, reportGenBtn].forEach(
//       (b) => b?.classList.remove("active")
//     );
//     btn?.classList.add("active");
//   }

//   function showAdminPage(page) {
//     [adminHomePage, addEmpPage, deptPage, taxReportGenerationPage].forEach(
//       (p) => p?.classList.remove("visible")
//     );

//     if (page === "home") {
//       adminHomePage.classList.add("visible");
//       setActive(adminHomeBtn);
//     } else if (page === "addEmp") {
//       addEmpPage.classList.add("visible");
//       setActive(adminAddEmpBtn);
//     } else if (page === "dept") {
//       deptPage.classList.add("visible");
//       setActive(addDeppBtn);
//     } 
//     // else if (page === "allEmp") {
//     //   allEmpPage.classList.add("visible");
//     //   setActive(allEmployeesBtn);
//     // } 
//     else if (page === "taxReport") {
//       taxReportGenerationPage.classList.add("visible");
//       setActive(reportGenBtn);
//     }

//     window.location.hash = page;
//   }

//   function getPageFromHash() {
//     const page = window.location.hash.replace("#", "");
//     return ["home", "addEmp", "dept", "allEmp", "taxReport"].includes(page)
//       ? page
//       : "home";
//   }

//   adminHomeBtn?.addEventListener("click", () => showAdminPage("home"));
//   adminAddEmpBtn?.addEventListener("click", () => showAdminPage("addEmp"));
//   addDeppBtn?.addEventListener("click", () => showAdminPage("dept"));
//   // allEmployeesBtn?.addEventListener("click", () => showAdminPage("allEmp"));
//   reportGenBtn?.addEventListener("click", () => showAdminPage("taxReport"));

//   showAdminPage(getPageFromHash());

//   window.addEventListener("hashchange", () => {
//     showAdminPage(getPageFromHash());
//   });
// });

// // Password Validation
// function validateStrongPassword(password) {
//   if (password.length < 8) {
//     return "Password must be at least 8 characters long.";
//   }
//   if (!/[A-Z]/.test(password)) {
//     return "Password must contain at least 1 uppercase letter (A-Z).";
//   }
//   if (!/[0-9]/.test(password)) {
//     return "Password must contain at least 1 number (0-9).";
//   }
//   if (!/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]/.test(password)) {
//     return "Password must contain at least 1 special character (!@#$...).";
//   }
//   return "";
// }

// document.querySelector("#formPass")?.addEventListener("input", (e) => {
//   const msg = validateStrongPassword(e.target.value.trim());
//   passError.innerText = msg;
// });

// //loading the departments in the select 
// async function loadDepartments() {
//   try {
//     const departments = await getDepartmentInfo();
//     Empdepartment.innerHTML = `<option value="">Select</option>`;
//     if (departments.length === 0) {
//       Empdepartment.innerHTML = `<option value="">No Departments Found</option>`
//     }
//     departments.forEach((dept) => {
//       const option = document.createElement("option");
//       option.value = dept.depttname;
//       option.textContent = dept.depttname.toUpperCase();
//       Empdepartment.appendChild(option);
//     });
//   }
//   catch (err) {
//     console.error("failed to load departments", err)
//     Empdepartment.innerHtml = `<option value="">Failed to load departments</option>`
//   }
// }
// loadDepartments()
// // Add Employee Form Box1
// addEmpForm?.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const name = document.querySelector("#formName").value.trim();
//   const email = document.querySelector("#formEmail").value.trim().toLowerCase();
//   const password = document.querySelector("#formPass").value.trim();
//   const userId = document.querySelector("#formUserId").value.trim()
//   const empdepartment = Empdepartment.value.trim()
//   passError.innerText = "";
//   if (!name || !email || !password || !userId || !empdepartment) {
//     alert("Please fill all fields");
//     return;
//   }
//   const errMsg = validateStrongPassword(password);
//   if (errMsg) {
//     passError.innerText = errMsg;
//     return;
//   }
//   try {
//     await addEmployee({ userId, name, email, password, empdepartment });
//     addEmpForm.reset();
//     alert("Employee added successfully");
//         await getAllEmployees();

//   } catch (err) {
//     alert(err);
//   }
// });
// //get employees box2
// const empTable=document.querySelector("#empTable")
// async function getAllEmployees(){
//   try{
//     const allEmp=await getAllUsers()
//         allEmp.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

//     const tbody = document.createElement("tbody");
//     // clearing old rows
//     empTable.querySelector("tbody")?.remove();
//     if(allEmp.length ===0){
//       tbody.innerHTML=`<tr>No employees found</tr>`
//       empTable.appendChild(tbody);
//       return;
//     }

//     allEmp.forEach((emp,index)=>{
//       if(emp.role==="employee"){
//       const tr = document.createElement("tr");
// tr.innerHTML=`
//         <td>${index + 1}</td>
// <td>${emp.userId}</td>
// <td>${emp.email}</td>
// <td>${emp.department}</td>`
//       tbody.appendChild(tr);
//       }
// })
// empTable.appendChild(tbody);
//   }
//   catch(err){
//     console.log("error fetching employees",err)
//   }
// }
// getAllEmployees();


// // Expense List Rendering
// //applying pagination
// let currentTab = "Pending"
// let currentPage = 1;
// const PAGE_SIZE = 3; // how many expenses per page

// renderExpenseList();



// async function renderExpenseList() {
//   let expenses = await getAllExpenses();
//   //  Apply tab filter
//   if (currentTab === "Pending") {
//     expenses = expenses.filter(e => e.status === "Pending");
//   } else if (currentTab === "approved") {
//     expenses = expenses.filter(e => e.status === "Approved");
//   } else if (currentTab === "rejected") {
//     expenses = expenses.filter(e => e.status === "Rejected");
//   }
//   const totalItems = expenses.length;
//   const totalPages = Math.ceil(totalItems / PAGE_SIZE);

//   //  Fix page overflow
//   if (currentPage > totalPages) currentPage = totalPages || 1;

//   //  Slice data for current page
//   const start = (currentPage - 1) * PAGE_SIZE;
//   const end = start + PAGE_SIZE;
//   const pageItems = expenses.slice(start, end);

//   expenseTableBody.innerHTML = "";

//   // Empty state
//   if (pageItems.length === 0) {
//     expenseTableBody.innerHTML = `
//       <tr>
//         <td colspan="7">No expenses found.</td>
//       </tr>
//     `;
//   } else {
//     pageItems.forEach((exp) => {
//       const hideActionBtns = exp.status === "Approved" || exp.status === "Rejected";
//       const tr = document.createElement("tr");
// //audit notes weak map,getting the key
//  let keyObj = expenseKeyMap.get(exp.id);
//   if (!keyObj) {
//     keyObj = { id: exp.id };
//     expenseKeyMap.set(exp.id, keyObj);
//   }
//   tr._auditKey = keyObj;
//   tr.innerHTML = `...`;

//       tr.innerHTML = `
//         <td>${exp.userId || "-"}</td>
//         <td>${exp.title}</td>
// <td>${exp.amountINR}</td>
//         <td>${exp.department}</td>
//         <td>${exp.date}</td>
//         <td><b>${exp.status}</b></td>
//           <td class="actionsCell">
//         ${hideActionBtns
//           ? ""
//           : `
//               <button class="tableApproveBtn" data-action="approve" data-id="${exp.id}">
//                 Approve
//               </button>
//               <button class="tableRejectBtn" data-action="reject" data-id="${exp.id}">
//                 Reject
//               </button>
//             `
//         }
//         <button class="auditNotesBnt" data-action="note" data-id="${exp.id}">
//           Audit Note
//         </button>
//         <button  class="quickInfoBtn" data-id="${exp.id}" data-action="info" title="Quick Info">ℹ️</button>
//       </td>

//       `;
//       expenseTableBody.appendChild(tr);
//     });
//   }
//   // Update pagination UI
//   updatePaginationControls(currentPage, totalPages);
// }



// function updatePaginationControls(page, totalPages) {
//   pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;
//   prevBtn.disabled = page <= 1;
//   nextBtn.disabled = page >= totalPages;
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


// //audit notes weak map
// auditNoteInput.addEventListener("input", () => {
//   charCount.textContent = auditNoteInput.value.length;
// });

// function openAuditModal(row) {
//   const key = row._auditKey;
//   currentAuditKey = key;
//   auditNoteInput.value = "";
//   charCount.textContent = "0";
//   const notes = auditNotesMap.get(key) || [];
//   renderPreviousNotes(notes);
//   auditNoteModal.classList.remove("hidden"); 
// }


// function renderPreviousNotes(notes) {
//   previousNotesList.innerHTML = "";
//   if (notes.length === 0) {
//     previousNotesList.innerHTML = "<p class='dim'>No previous notes</p>";
//     return;
//   }
//   notes.forEach(n => {
//     const div = document.createElement("div");
//     div.className = "noteItem";
//     div.innerHTML = `
//       <div>${n.text}</div>
//       <small>${new Date(n.time).toLocaleTimeString()}</small>
//     `;
//     previousNotesList.appendChild(div);
//   });
// }
// saveAuditNoteBtn.addEventListener("click", () => {
//   if (!currentAuditKey) return;
//   const text = auditNoteInput.value.trim();
//   if (!text) return;
//   const notes = auditNotesMap.get(currentAuditKey) || [];
//   notes.push({
//     text,
//     time: Date.now()
//   });
//   auditNotesMap.set(currentAuditKey, notes);
//   renderPreviousNotes(notes);
// });


// cancelAuditNoteBtn.addEventListener("click", closeAuditModal);

// function closeAuditModal() {
//   auditNoteModal.classList.add("hidden");
//   currentAuditKey = null;
// }


// //qucik info modal
// let activeReceiptURL = null;

// async function openQuickInfoModal(expenseId) {
//   const expenses = await getAllExpenses();
//   const expense = expenses.find(e => e.id === expenseId);
//   if (!expense) return;
//   qiUser.textContent = expense.userId || "-";
//   qiStatus.textContent = expense.status;
//   qiDate.textContent = expense.date;
//   qiTitle.textContent = expense.title;
//   qiDept.textContent = expense.department;
//   qiAmount.textContent = `₹${expense.amountINR}`;
  

//     qiReceipt.innerHTML = "";
//   if (expense.receipt instanceof File ) {
//     const file = expense.receipt;
//     // Create object URL
//     activeReceiptURL = URL.createObjectURL(file);
//     // View button
//     const viewBtn = document.createElement("button");
//     viewBtn.textContent = "View Receipt";
//     viewBtn.className = "viewReceiptBtn";
//     viewBtn.onclick = () => window.open(activeReceiptURL);
//        qiReceipt.appendChild(viewBtn);
//   }
//    else {
//     qiReceipt.textContent = "No receipt uploaded";
//   }
//   quickInfoModal.classList.remove("hidden");
// }
// //closing the modal
// closeQuickInfoBtn.addEventListener("click", () => {
//   quickInfoModal.classList.add("hidden");
// });





// expenseTableBody.addEventListener("click", async (e) => {
//   const btn = e.target.closest("button[data-action]");
//   if (!btn) return;

//   e.preventDefault();
//   e.stopPropagation();

//   const action = btn.dataset.action;
//   const expenseId = btn.dataset.id;
//   const row = btn.closest("tr");

//   if (!expenseId || !row) return;

//   switch (action) {
//     case "info":
//       await openQuickInfoModal(expenseId);
//       break;

//     case "note":
//       openAuditModal(row);
//       break;

//     case "approve":
//       try {
//         await approveExpense(expenseId);
//         alert("Expense approved and budget updated!");

//         currentTab = "approved";
//         document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
//         document.querySelector('.tabBtn[data-tab="approved"]').classList.add("active");

//         await renderExpenseList();
//         await renderBudgetGrid();
//       } catch (err) {
//         console.error(err);
//       }
//       break;

//     case "reject":
//       try {
//         await rejectExpense(expenseId);
//         alert("Expense rejected successfully");
//         currentTab = "rejected";
//         document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
//         document.querySelector('.tabBtn[data-tab="rejected"]').classList.add("active");

//         await renderExpenseList();
//       } catch (err) {
//         console.error(err);
//       }
//       break;
//   }
//     console.log("btn ROW CLICKED");

// });

// expenseTableBody.addEventListener("click",()=>{
// console.log("body clicked")
// })







// // Approve / Reject Expense
// // expenseList?.addEventListener("click", async (e) => {
// //   const approveBtn = e.target.closest(".approveBtn");
// //   const rejectBtn = e.target.closest(".rejectBtn");

// //   if (!approveBtn && !rejectBtn) return;

// //   // Fix
// //   const expenseId = (approveBtn || rejectBtn).dataset.id;

// //   const decision = approveBtn ? "Manager Approved" : "Rejected";

// //   try {
// //     const expenses = await getAllExpenses();
// //     const exp = expenses.find((x) => x.id === expenseId);
// //     if (!exp) return alert("Expense not found");

// //     exp.status = decision;

// //     await fetch(`http://localhost:5000/api/longPool/${expenseId}/decision`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ decision }),
// //     });

// //     renderExpenseList();
// //     alert(`Expense ${expenseId}: ${decision}`);
// //   } catch (err) {
// //     console.error(err);
// //     alert("Error updating decision");
// //   }
// // });



// // async function sendManagerDecision(expenseId, decision) {
// //   const res = await fetch(`http://localhost:5000/api/longPool/${expenseId}/decision`, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({
// //       decision, // "Manager Approved" | "Rejected"
// //       managerEmail: sessionStorage.getItem("loggedInEmail") || "admin",
// //     }),
// //   });
// //   if (!res.ok) {
// //     const text = await res.text();
// //     throw new Error(`Decision API failed: ${res.status} ${text}`);
// //   }
// //   return res.json();
// // }


// logoutBtn?.addEventListener("click", () => {
//   sessionStorage.removeItem("loggedInRole");
//   sessionStorage.removeItem("loggedInEmail");
//   sessionStorage.removeItem(AUDIT_LOG_KEY);

//   window.location.href = "../loginPage/login.html";
// });

import * as ctrl from "../controllers/adminController.js";
import { startConnectivityAuditor } from "../../services/connectivityAuditor.js";
import { approveExpense,rejectExpense,getDepartmentInfo  } from "../../employeePanel/storage/indexDb.js";
import { addEmployee } from "../../loginPage/storage/indexDb.js";
import { getAllExpenses } from "../../employeePanel/storage/indexDb.js";

/* DOM */
const budgetGrid = document.querySelector("#budgetGrid");
//adding deptt
const depttForm = document.querySelector("#depttForm");
const depttname = document.querySelector("#formDeptt")
const depttBudget = document.querySelector("#formDepttBudget")

const expenseTableBody = document.querySelector("#expenseTableBody");
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

//Navbars of expenses
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

  if (!expenseId || !row) return;

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
  }

});

expenseTableBody.addEventListener("click",()=>{
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
function saveAuditLogs() {
  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLogLines));
}
function fmtAuditTime(ts = Date.now()) {
  return new Date(ts).toLocaleTimeString();
}
function renderAuditTerminal() {
  if (!auditTerminal) return;

  auditTerminal.innerHTML = auditLogLines
    .map(({ text, level }) => `<div class="line ${level}">${text}</div>`)
    .join("");

  auditTerminal.scrollTop = auditTerminal.scrollHeight;
}

function appendAuditLog(text, level = "dim") {
  auditLogLines.push({ text, level });

  if (auditLogLines.length > AUDIT_LOG_MAX_LINES) {
    auditLogLines.splice(0, auditLogLines.length - AUDIT_LOG_MAX_LINES);
  }

  saveAuditLogs();
  renderAuditTerminal();
}

//  restore logs on reload
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
  LP: {
    led: document.querySelector("#ledLP"),
    meta: document.querySelector("#metaLP"),
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
      appendAuditLog(`[${fmtAuditTime()}] WS Connected`, "ok");
    } else if (state === "reconnecting") {
      wsState.textContent = `WS: Reconnecting... (attempt ${attempt})`;
      wsState.className = "wsOffline";
      appendAuditLog(`[${fmtAuditTime()}] WS Reconnecting (attempt ${attempt})`, "warn");
    } else {
      wsState.textContent = "WS: Disconnected ";
      wsState.className = "wsOffline";
      appendAuditLog(`[${fmtAuditTime()}]  WS Disconnected`, "err");
    }
    if (state === "online") {
      ctrl.setMatrix("WS", "online", "Connected",matrixRefs);
    } else if (state === "reconnecting") {
      ctrl.setMatrix("WS", "checking", `Reconnecting (${attempt})`,matrixRefs);
    } else {
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
      const toastPayload={
    title: "New Expense Submitted",
    message: `${payload.empMail || "Employee"} submitted ₹${payload.amountINR} for ${payload.title}`,
    type: "success",
  };
  ctrl.showToast(toastPayload);
ctrl.saveToast(toastPayload);
    } 
    else if (payload.event === "EXPENSE_DECISION") {
      appendAuditLog(
        `[${t}]  EXPENSE_DECISION | expenseId=${payload.expenseId} | decision=${payload.decision}`,
        "warn"
      );
    } else if (payload.event === "ADMIN_NOTE") {
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

  onHello: () => {
    sseState.textContent = "SSE: Connected";
    ctrl.setMatrix("SSE", "online", "Streaming rates...", matrixRefs);
  },

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
      ctrl.setMatrix("SP", "checking", "Checking...",matrixRefs);
    }
    if (info.state === "online") {
      ctrl.setMatrix("SP", "online", "Healthy",matrixRefs);
    }
    if (info.state === "offline") {
      ctrl.setMatrix("SP", "offline", "Backend Down",matrixRefs);
    }
    if (info.state === "checking") {
      spLed.className = "led yellow";
      spText.textContent = "Connectivity: Checking...";
      spMeta.textContent = `Attempt: ${info.attempt} | Next check in: ${info.nextDelay}ms`;
    }

    if (info.state === "online") {
      spLed.className = "led green";
      spText.textContent = "Connectivity: Online ";
      spMeta.textContent = `Last OK: ${fmtTime(
        info.lastOkAt
      )} | Next check: ${info.nextDelay}ms | Server time: ${info.serverTime}`;
    }

    if (info.state === "offline") {
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

  budgetGrid.innerHTML = "";

  if (stats.length === 0) {
    budgetGrid.innerHTML = `<p>No departments found.</p>`;
    return;
  }

  stats.forEach(stat => {
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
}
renderBudgetGrid();


//ADD EMPLOYEE FORM


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

async function openQuickInfoModal(expId){
const expense=await ctrl.getQuickInfoModal(expId)
if (!expense) return;
  qiUser.textContent = expense.userId || "-";
  qiStatus.textContent = expense.status;
  qiDate.textContent = expense.date;
  qiTitle.textContent = expense.title;
  qiDept.textContent = expense.department;
  qiAmount.textContent = `₹${expense.amountINR}`;
  
    qiReceipt.innerHTML = "";
  if (expense.receipt instanceof File ) {
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


//generating the report 
generateReportBtn?.addEventListener("click", async () => {
  generateReportBtn.disabled = true;
  generateReportBtn.textContent = "Generating...";
  reportStatus.textContent = "Status: Preparing data...";
  reportOutput.textContent = "Working...";

  const expenses = await getAllExpenses();

  ctrl.generateTaxReport({
    expenses,
    quarter: "Q1",
    year: 2026,

    onProgress: ({ percent }) => {
      reportStatus.textContent = `Status: Processing... ${percent}%`;
    },

    onDone: (report) => {
      reportStatus.textContent = `Status: Report Ready (${report.quarter} ${report.year})`;
      reportOutput.textContent = JSON.stringify(report, null, 2);

      downloadReportBtn.disabled = false;
      generateReportBtn.disabled = false;
      generateReportBtn.textContent = "Generate Quarterly Report";
    },

    onError: () => {
      reportStatus.textContent = "Status: Worker Error";
      generateReportBtn.disabled = false;
      generateReportBtn.textContent = "Generate Quarterly Report";
    },
  });
});

downloadReportBtn.addEventListener("click",()=>{
  const ok= ctrl.downloadLatestTaxReport()
    if (!ok) alert("No report generated yet!");

})






