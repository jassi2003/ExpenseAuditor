// controllers/rates.controller.js

const INR_URL =
  "https://api.frankfurter.dev/v1/latest?from=INR&to=USD,EUR,GBP,JPY";

// helper SSE message writer
function sendSse(res, event, dataObj) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
}

async function fetchInrRates() {
  const r = await fetch(INR_URL);
  if (!r.ok) {
    throw new Error(`Rates API failed: ${r.status}`);
  }

  const json = await r.json();

  return {
    base: "INR",
    time: new Date().toISOString(),
    apiDate: json.date,
    rates: json.rates || {}, // USD, EUR, GBP per INR
  };
}

/*
  SSE Controller
  GET /api/rates/inr-stream
*/
function streamInrRates(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (res.flushHeaders) res.flushHeaders();

  // hello
  sendSse(res, "hello", {
    ok: true,
    msg: "Employee INR Rates Stream Connected",
    at: new Date().toISOString(),
  });

  // heartbeat
  const heartbeat = setInterval(() => {
    sendSse(res, "ping", { t: Date.now() });
  }, 15000);

  // rates every 5s
  const ratesInterval = setInterval(async () => {
    try {
      const payload = await fetchInrRates();
      sendSse(res, "rates", payload);
    } catch (err) {
      sendSse(res, "error", {
        ok: false,
        msg: err.message,
      });
    }
  }, 5000);

  // send immediately
  (async () => {
    try {
      const payload = await fetchInrRates();
      sendSse(res, "rates", payload);
    } catch (err) {
      sendSse(res, "error", {
        ok: false,
        msg: err.message,
      });
    }
  })();

  req.on("close", () => {
    clearInterval(ratesInterval);
    clearInterval(heartbeat);
    res.end();
  });
}
module.exports = {
  streamInrRates
};

