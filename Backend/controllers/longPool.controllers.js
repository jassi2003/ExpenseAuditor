// backend/controllers/longPoll.controller.js

// in-memory backend state
const pendingLongPolls = new Map();   // expenseId -> res
const expenseStatusMap = new Map();   // expenseId -> "Pending" | "Approved" | "Rejected"


/* EMPLOYEE LONG-POLL ENDPOINT*/
export function longPollExpenseStatus(req, res) {
  const { expenseId } = req.params;

  // If backend already knows decision → respond immediately
  const status = expenseStatusMap.get(expenseId);

  if (status === "Approved" || status === "Rejected") {
    return res.status(200).json({ expenseId, status });
  }

  // Otherwise keeping request open
  pendingLongPolls.set(expenseId, res);

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      pendingLongPolls.delete(expenseId);
      res.status(204).end(); // still pending
    }
  }, 30000);

  // cleanup if client disconnects
  req.on("close", () => {
    clearTimeout(timer);
    pendingLongPolls.delete(expenseId);
  });
}


/*ADMIN APPROVE */
export function adminApproveExpense(req, res) {
  const { expenseId } = req.params;

  // update backend state
  expenseStatusMap.set(expenseId, "Approved");


const broadcastAuditEvent = req.app.get("broadcastAuditEvent");
  if (broadcastAuditEvent) {
    broadcastAuditEvent({
      event: "EXPENSE_APPROVED",
      expenseId,
      status: "Approved",
      time: new Date().toISOString(),
    });
  }

  // resolve long-poll if employee waiting
  const pendingRes = pendingLongPolls.get(expenseId);
  if (pendingRes && !pendingRes.headersSent) {
    pendingRes.status(200).json({
      expenseId,
      status: "Approved",
    });
    pendingLongPolls.delete(expenseId);
     expenseStatusMap.delete(expenseId)
  }

  return res.json({ message: "Expense approved" });
}


/* ADMIN REJECT */
export function adminRejectExpense(req, res) {
  const { expenseId } = req.params;

  expenseStatusMap.set(expenseId, "Rejected");

  const pendingRes = pendingLongPolls.get(expenseId);
  if (pendingRes && !pendingRes.headersSent) {
    pendingRes.status(200).json({
      expenseId,
      status: "Rejected",
    });
    pendingLongPolls.delete(expenseId);
  }

  return res.json({ message: "Expense rejected" });
}



