const express = require("express");
const { longPollExpenseStatus,adminApproveExpense,adminRejectExpense,resetExpense } =require("../controllers/longPool.controllers.js");


const router = express.Router();

router.get("/:expenseId/long-poll", longPollExpenseStatus);
router.post("/:expenseId/approve", adminApproveExpense);
router.post("/:expenseId/reject", adminRejectExpense);

module.exports = router;


