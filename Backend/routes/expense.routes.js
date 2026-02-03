const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// const dataFile = path.join(__dirname, "..", "data", "expenses.json");


const upload = multer();

// POST /api/expenses
router.post("/", upload.none(), (req, res) => {
  try {
    const meta = JSON.parse(req.body.formData);
    // const expenses = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    const newExpense = {
      ...meta,
      syncedAt: new Date().toISOString(),
    };

    // expenses.push(newExpense);
    // fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
    // Broadcast to WebSocket Live Audit Feed

    const amountINR = Number(newExpense.amountINR ?? newExpense.amount ?? 0);
    const broadcastAuditEvent = req.app.get("broadcastAuditEvent");
    if (broadcastAuditEvent) {
      broadcastAuditEvent({
        event: "EXPENSE_SUBMITTED",
        expenseId: newExpense.id,
        title: newExpense.title,
        amountINR,
        department: newExpense.department,
        status: newExpense.status || "Pending",
        empMail: newExpense.empMail,
        time: new Date().toISOString(),
      });
    }

    return res.status(201).json({ message: "Expense synced" });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: "Invalid payload" });
  }
});

module.exports = router;
