require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");


const expenseRoutes = require("./routes/expense.routes");
const healthRoutes=require("./routes/health.route")
const ratesRoutes = require("./routes/rates.routes");
const longPoolRoutes=require("./routes/longPool.routes")


const { setupAuditWebSocket } = require("./ws"); 


const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

//apis endpoint
app.use("/uploads", express.static("uploads"));
app.use("/api/expenses", expenseRoutes);
app.use("/api", healthRoutes);
app.use("/api/conversion", ratesRoutes);
app.use("/api/longPool",longPoolRoutes)


//creating http server
const server = http.createServer(app);
const { broadcastAuditEvent } = setupAuditWebSocket(server);
app.set("broadcastAuditEvent", broadcastAuditEvent);  //Storing this function so any route/controller/middleware can use it


app.get('/', (req, res) => {
  res.send('server working'); 
});
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
