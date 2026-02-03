const { WebSocketServer } = require("ws");

function setupAuditWebSocket(server) {
  // WebSocket Server at /ws/audit
  const wss = new WebSocketServer({
    server,
    path: "/ws/audit",
  });

  //it fires when admin connects
  wss.on("connection", (ws) => {
  console.log("Admin WS connected");
});


  const clients = new Set();

  //it sends same audit message to all connected admins
  function broadcastAuditEvent(payload) {
    const msg = JSON.stringify({
      type: "AUDIT_EVENT",
      payload,
    });

    //it loops over all connected admins and sends the message
    for (const ws of clients) {
      if (ws.readyState === 1) {
        ws.send(msg);
      }
    }
  }


  //it runs once per admin connection
  wss.on("connection", (ws) => {
    clients.add(ws);
    // welcome
    ws.send(
      JSON.stringify({
        type: "WELCOME",
        payload: { msg: "Connected to Live Audit Feed" },
      })
    );

    //it triggeres when admin sends something,then converts buffer to string
    ws.on("message", (buffer) => {
      try {
        const data = JSON.parse(buffer.toString());
        // heartbeat
        if (data.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG", payload: { time: Date.now() } }));
          return;
        }

        // bi-directional example (admin can send notes)
        if (data.type === "ADMIN_NOTE") {
          broadcastAuditEvent({
            event: "ADMIN_NOTE",
            note: data.payload?.note || "",
            time: new Date().toISOString(),
          });
          return;
        }
      } catch (e) {
        // ignore invalid json
      }
    });

    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));
  });

  return { broadcastAuditEvent };
}

module.exports = { setupAuditWebSocket };
