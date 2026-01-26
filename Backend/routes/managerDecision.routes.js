// routes/managerDecision.routes.js
const express = require("express");
const router = express.Router();
const { resolveWaiters } = require("../controllers/longPoolController");


// POST /api/expenses/:expenseId/decision
// body: { decision: "Manager Approved" | "Rejected", managerEmail?: "" }
router.post("/:expenseId/decision", async (req, res) => {
  const { expenseId } = req.params;
  const { decision, managerEmail } = req.body;

  if (!["Manager Approved", "Rejected"].includes(decision)) {
    return res.status(400).json({ ok: false, message: "Invalid decision" });
  }

  // 1) Update DB record here (Mongo/IndexedDB server etc.)
  // await Expense.updateOne({ id: expenseId }, { status: decision });
  // 2) Resolve all long polls waiting on this expenseId 
  resolveWaiters(expenseId, {
    token: decision,
    meta: { managerEmail: managerEmail || "" },
  });

  return res.json({
    ok: true,
    message: "Decision recorded and clients notified",
    expenseId,
    decision,
  });
});

module.exports = router;
