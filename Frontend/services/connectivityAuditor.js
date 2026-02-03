
export function startConnectivityAuditor({
  url = "http://localhost:5000/api/health",
  baseInterval = 5000,   
  maxInterval = 60000,     
  timeoutMs = 2500, 
  //random delay       
  // jitter = true,            
  onStatus = () => {},      
} = {}) {

  let stopped = false;
  let attempt = 0;              
  let nextDelay = baseInterval;  
  let lastOkAt = null;
  let lastFailAt = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));



  //exponential delay,like attempt0:delay5s, attempt1:depaly10s and so on...  
  const computeBackoffDelay = () => {
    const exp = baseInterval * Math.pow(2, attempt);  //5000 × 2⁰
    const capped = Math.min(exp, maxInterval);  //it prevents delay from growing forever.

    // if (!jitter) return capped;
    return capped + Math.floor(Math.random() * 500);
  };
//here, creating a fetch request that automatically cancelled after timeout
  const makeAbortableFetch = async () => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
//no chache is sent from server
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timerId);
      return res;
    } catch (err) {
      clearTimeout(timerId);
      throw err;
    }
  };

  async function checkOnce() {
    // notify UI that check started
    onStatus({
      state: "checking",
      attempt,
      nextDelay,
      lastOkAt,
      lastFailAt,
    });

    try {
      const res = await makeAbortableFetch();

      if (!res.ok) {
        throw new Error(`Health check failed (HTTP ${res.status})`);
      }

      const data = await res.json();

      //on success
      attempt = 0;
      nextDelay = baseInterval;
      lastOkAt = Date.now();

      onStatus({
        state: "online",
        attempt,
        nextDelay,
        lastOkAt,
        lastFailAt,
        serverTime: data.time,
        ok: data.ok,
      });
    } catch (err) {
      // failure
      attempt += 1;
      nextDelay = computeBackoffDelay();
      lastFailAt = Date.now();

      const reason =
        err?.name === "AbortError"
          ? `Timeout after ${timeoutMs}ms`
          : err?.message || "Unknown network error";

      onStatus({
        state: "offline",
        attempt,
        nextDelay,
        lastOkAt,
        lastFailAt,
        error: reason,
      });
    }
  }

  async function loop() {
    while (!stopped) {
      await checkOnce();
      await sleep(nextDelay);
    }
  }
  // start loop immediately
  loop();

  // return stop function
  return function stop() {
    stopped = true;
    onStatus({ state: "stopped" });
  };
}
