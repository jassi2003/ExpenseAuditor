// controllers/rates.controller.js

const FRANKFURTER_URL =
  "https://api.frankfurter.dev/v1/latest?from=USD&to=INR,EUR,GBP,JPY";

// SSE message writer(sending res to frontend)
function sendSse(res, event, dataObj) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
}


//api fetching real rates
async function fetchRealUsdRates() {
  const r = await fetch(FRANKFURTER_URL);
  if (!r.ok) {
    throw new Error(`Rates API failed: ${r.status}`);
  }
  const json = await r.json();


  // normalizing payload for frontend
  return {
    base: json.base || "USD",
    time: new Date().toISOString(),
    apiDate: json.date,
    rates: json.rates || {},
  };
}

function streamExchangeRates(req, res) {
  res.setHeader("Content-Type", "text/event-stream"); //telling the browser that its a sse stream
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); //keeping alive the req after res

//Immediately sending headers to the browser or client.
  if (res.flushHeaders) res.flushHeaders();

  // hello event (initial)
  sendSse(res, "hello", {
    ok: true,
    msg: "SSE Connected (Real Exchange Rates)",
    at: new Date().toISOString(),
  });

  // heartbeat every 15 sec (keeps connection alive)
  const heartbeatInterval = setInterval(() => {
    sendSse(res, "ping", { t: Date.now() });
  }, 15000);

  // send real rates every 5 sec
  const ratesInterval = setInterval(async () => {
    try {
      const payload = await fetchRealUsdRates();
      sendSse(res, "rates", payload);
    } catch (err) {
      sendSse(res, "error", {
        ok: false,
        msg: err.message || "Rates fetch failed",
        time: new Date().toISOString(),
      });
    }
  }, 5000);

  // sending data once immediately so UI updates instantly and cant wait for 5s
  (async () => {
    try {
      const payload = await fetchRealUsdRates();
      sendSse(res, "rates", payload);
    } catch (err) {
      sendSse(res, "error", {
        ok: false,
        msg: err.message || "Rates fetch failed",
        time: new Date().toISOString(),
      });
    }
  })();

  req.on("close", () => {
    clearInterval(ratesInterval);
    clearInterval(heartbeatInterval);
    res.end();
  });
}

module.exports = {
  streamExchangeRates,
};
