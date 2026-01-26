require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");


const expenseRoutes = require("./routes/expense.routes");
const healthRoutes=require("./routes/expense.routes")
const ratesRoutes = require("./routes/rates.routes");
// const longPollRoutes = require("./routes/longPool.routes");
const managerDecisionRoutes = require("./routes/managerDecision.routes");


const { setupAuditWebSocket } = require("./ws"); 


const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use("/uploads", express.static("uploads"));
app.use("/api/expenses", expenseRoutes);
app.use("/api", healthRoutes);
app.use("/api/conversion", ratesRoutes);
// app.use("/api/longPool", longPollRoutes);
app.use("/api/expenses", managerDecisionRoutes);


const pendingRequests = new Map(); // expenseId
// long poll route
 app.get("/:expenseId/long-poll", (req, res) => {
    console.log("Long poll route HIT!");
   console.log("Full URL:", req.originalUrl);
  //  console.log("Params:", req.params);
 
   const { expenseId } = req.params;
     console.log(" Expense ID received:", expenseId);
   // store this pending response
   pendingRequests.set(expenseId, res);
   // timeout after 30s
    setTimeout(() => {
         console.log(" Timeout sending for:", expenseId);
     return res.status(200).json({
       message:"backend hit"
     }); 
   
   },30000);
  
  
  req.on("abort",()=>{
        console.log(" abort error");

  })
  
 

});


// function wait(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }


// function wait(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// app.get("/:expenseId/long-poll", async (req, res) => {
//   const { expenseId } = req.params;
//   console.log(" Long poll HIT:", expenseId);

//   pendingRequests.set(expenseId, res);

//   // if client disconnects
//   let closed = false;
//   req.on("close", () => {
//     closed = true;
//     pendingRequests.delete(expenseId);
//     console.log(" Client disconnected:", expenseId);
//   });

//   // wait 30 sec
//   await wait(30000);

//   // if still connected after 30 sec
//   if (!closed) {
//     pendingRequests.delete(expenseId);
//     console.log("Timeout:", expenseId);
//     return res.status(204).end();
//   }
// });









app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
  });
});
const server = http.createServer(app);
const { broadcastAuditEvent } = setupAuditWebSocket(server);
app.set("broadcastAuditEvent", broadcastAuditEvent);




app.get('/', (req, res) => {
  res.send('server working'); 
});
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
