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
const logoutBtn = document.querySelector("#lgtBtn")
const receipt = document.querySelector("#formReceipt")



// HELPERS
//amt validation
const amountInput = document.getElementById("formAmount");
amountInput.addEventListener("input", () => {
  amountInput.value = amountInput.value.replace(/\D/g, "");
});
// block date typing in date input(datevalidation)
date.addEventListener("keydown", (e) => {
  e.preventDefault();
});

/*INIT*/
const rateSource = ctrl.startRateStream();
window.addEventListener("beforeunload", () => rateSource.close());

//side panel page routing
ctrl.initHashRouting(homePage, addExpensePage, homeBtn, addBtn);

//update offline expense count,whenever the queue will change the count will be updated
ctrl.updateOfflineBadge(offlineBadgeCount);
window.addEventListener("queue:changed", () => {
  ctrl.updateOfflineBadge(offlineBadgeCount);
});



/*EVENTS */
diagBtn.addEventListener("click", ctrl.runDiagnosticConsole); //diagnostic console action

currencySelect.value = localStorage.getItem("preferredCurrency") || "INR";  //changing curreccy from select
currencySelect.addEventListener("change", e =>
  ctrl.setCurrency(e.target.value, render)
);

homeBtn.addEventListener("click", () => location.hash = "home");
addBtn.addEventListener("click", () => location.hash = "add");

form.addEventListener("submit", async e => {
  e.preventDefault();

  const receiptFile = receipt.files?.[0] || null;
  const isEdit = form.dataset.editingId !== undefined;

  const expensId = isEdit ? form.dataset.editingId : crypto.randomUUID();

  const expense = {
    id: expensId,
    title: form.formTitle.value.trim(),
    amountINR: ctrl.convertToINR(+form.formAmount.value, form.inputCurrency.value),
    date: form.formDate.value,
    tags: ctrl.parseTags(form.formTag.value),
    status: "Pending",
    receipt: receiptFile,
    userId: sessionStorage.getItem("userId"),
    empMail: sessionStorage.getItem("loggedInEmail"),
    department: sessionStorage.getItem("department"),
    //telling controller this is an edit
    _edit: isEdit,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const savedExpenseId = await ctrl.submitExpense(
    expense,
    msg => status.innerText = msg
  );

  /*STARTING LONG POLL */
  if (savedExpenseId) {
    ctrl.longPollApproval(savedExpenseId, msg => {
      status.innerText = msg;
    });
  }
  delete form.dataset.editingId;
  form.reset();
  location.hash = "home";
  render();
});

//EVENT DELEGATIION ON BTNSS
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
    ctrl.setActiveTag(null, () => { });
    await render();
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
  expenseTableBody.innerHTML = items.map(exp => {
    const isReadOnly =
      exp.status === "Approved" || exp.status === "Rejected";
      
    return `
    <tr data-id="${exp.id}">
      <td>${exp.title}</td>
      <td>${ctrl.formatAmount(exp.amountINR)}</td>
      <td>${exp.department}</td>
      <td>${exp.date}</td>
      <td>${exp.tags?.join(", ") || "None"}</td>
      <td><b>${exp.status}</b></td>
      <td class="actions">
 <button 
        data-action="edit" 
        class="editBtn"
        ${isReadOnly ? "disabled" : ""}>
        Edit
      </button>
      <button data-action="delete">Delete</button>
      </td>
      </tr>
  `}).join("");
  
}

render();


//FILTERING ON THE BASISOF APPROVED, REJECTED, PENDING
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

//saving draft IN SESSION STORAGE
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

//RESTORING from session storage draft 
ctrl.restoreDraft({
  title: v => form.formTitle.value = v,
  amount: v => form.formAmount.value = v,
  date: v => form.formDate.value = v,
  tag: v => form.formTag.value = v,
  currency: v => form.inputCurrency.value = v
});
//clear draft  btn
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








