export function startLiveAuditFeed({
  url = "ws://localhost:5000/ws/audit",
  onEvent = () => {},
  onState = () => {},
  heartbeatMs = 15000,
  pongTimeoutMs = 6000,
  maxReconnectDelay = 30000,
} = {}) {
  let ws = null;
  let stopped = false;

  let heartbeatTimer = null;
  let pongTimer = null;

  let reconnectAttempt = 0;

  function logState(state) {
    onState({ state, attempt: reconnectAttempt });
  }

  function cleanup() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (pongTimer) clearTimeout(pongTimer);
    heartbeatTimer = null;
    pongTimer = null;
  }

  function startHeartbeat() {
    cleanup();
//detecting dead connections, checking whther sockets open or dead
    heartbeatTimer = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(JSON.stringify({ type: "PING" }));

      pongTimer = setTimeout(() => {
        try {
          ws.close();
        } catch {}
      }, pongTimeoutMs);
    }, heartbeatMs);
  }

  function scheduleReconnect() {
    if (stopped) return;

    reconnectAttempt += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt - 1), maxReconnectDelay);

    logState("reconnecting");

    setTimeout(() => {
      if (!stopped) connect();
    }, delay);
  }

  function connect() {
    if (stopped) return;

    logState("connecting");

    ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttempt = 0;
      logState("online");
      startHeartbeat();
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "PONG") {
          if (pongTimer) clearTimeout(pongTimer);
          pongTimer = null;
          return;
        }

        // audit event from backend
        if (data.type === "AUDIT_EVENT") {
          onEvent(data.payload);
          return;
        }
      } catch {
//ignoring invalid json
      }
    };

    ws.onerror = () => {
      // websocket may call close after error
    };

    ws.onclose = () => {
      cleanup();
      logState("offline");
      scheduleReconnect();
    };
  }

  // start
  connect();

  return {
    send(data) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify(data));
      return true;
    },
    stop() {
      stopped = true;
      cleanup();
      try { ws?.close(); } catch {}
    },
  };
}
