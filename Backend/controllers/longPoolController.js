// // services/approvalLongPoll.js
// // Long Polling store: expenseId -> list of waiting responses

// const waiters = new Map(); 
// // expenseId => Set(res)

// function addWaiter(expenseId, res) {
//   if (!waiters.has(expenseId)) waiters.set(expenseId, new Set());
//   waiters.get(expenseId).add(res);
// }

// function removeWaiter(expenseId, res) {
//   const set = waiters.get(expenseId);
//   if (!set) return;
//   set.delete(res);
//   if (set.size === 0) waiters.delete(expenseId);
// }

// function resolveWaiters(expenseId, tokenObj) {
//   const set = waiters.get(expenseId);
//   if (!set || set.size === 0) return;

//   for (const res of set) {
//     try {
//       res.json({
//         ok: true,
//         status: "DECIDED",
//         token: tokenObj.token, // "Manager Approved" | "Rejected"
//         expenseId,
//         time: new Date().toISOString(),
//         meta: tokenObj.meta || {},
//       });
//     } catch {}
//   }

// //router delete all
//   waiters.delete(expenseId);
// }

// module.exports = { addWaiter, removeWaiter, resolveWaiters };
