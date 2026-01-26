// // routes/longPoll.routes.js
// const express = require("express");
// const router = express.Router();
// const { addWaiter, removeWaiter } = require("../controllers/longPoolController");

// // LONG POLL: waits up to 30 seconds for manager decision
// // GET /api/longPoll/:expenseId/wait-approval?timeout=30000
// router.get("/:expenseId/wait-approval", (req, res) => {
//   const { expenseId } = req.params;
//   const timeout = Number(req.query.timeout) || 30000;

//   console.log(" Long poll started for:", expenseId);

//   // do NOT send JSON immediately
//   res.setHeader("Content-Type", "application/json; charset=utf-8");
//   res.setHeader("Cache-Control", "no-cache, no-transform");
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   addWaiter(expenseId, res);
//   console.log("✅ waiter added", expenseId);

//   let alive = true;

//   // ✅ heartbeat every 10 seconds to keep connection alive
//   const heartbeat = setInterval(() => {
//     if (!alive || res.writableEnded) return;

//     try {
//       // send 1 whitespace chunk
//       res.write(" ");
//       // IMPORTANT: do not end response here
//       // this prevents browser from aborting idle request
//       console.log(" heartbeat sent for:", expenseId);
//     } catch (err) {
//       console.log(" heartbeat write failed:", expenseId);
//     }
//   }, 10000);

//   res.on("close", () => {
//     alive = false;
//     clearInterval(heartbeat);

//     if (!res.writableEnded) {
//       console.log(" Client ABORTED request:", expenseId);
//     } else {
//       console.log(" Response closed normally:", expenseId);
//     }

//     removeWaiter(expenseId, res);
//   });

//   const timer = setTimeout(() => {
//     clearInterval(heartbeat);

//     if (!alive || res.writableEnded) {
//       console.log(" Timeout ignored (not alive):", expenseId);
//       return;
//     }

//     removeWaiter(expenseId, res);

//     console.log(" TIMEOUT sending response for:", expenseId);

//     try {
//       // IMPORTANT: end the response only here
//       res.end(
//         JSON.stringify({
//           ok: true,
//           status: "TIMEOUT",
//           expenseId,
//           message: "No decision yet. Poll again.",
//           time: new Date().toISOString(),
//         })
//       );
//     } catch (err) {
//       console.log("❌ Could not send TIMEOUT:", expenseId);
//     }
//   }, timeout);

//   res.on("finish", () => {
//     clearTimeout(timer);
//     clearInterval(heartbeat);
//   });
// });

// module.exports = router;
