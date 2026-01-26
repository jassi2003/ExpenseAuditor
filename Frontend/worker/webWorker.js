

function getQuarter(dateStr) {
  // dateStr: "2026-01-20"
  const d = new Date(dateStr);
  const month = d.getMonth() + 1; // 1-12
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}
//filtering the expense based on quarter
function inQuarter(expDate, targetQuarter, targetYear) {
  const d = new Date(expDate);
  // if (Number.isNaN(d.getTime())) return false;

  const q = getQuarter(expDate);
  const y = d.getFullYear();
  return q === targetQuarter && y === targetYear;
}

// - Travel: 50% deductible
// - Software: 100% deductible
// - ClientDinner: 30% deductible
// - Others: 20% deductible
function getDeductionRate(exp) {
  const cat = (exp.category || "").toLowerCase();

  if (cat.includes("travel")) return 0.5;
  if (cat.includes("software")) return 1.0;
  if (cat.includes("dinner") || cat.includes("client")) return 0.3;
  return 0.2;
}

// Receving data from from thread
self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type !== "GENERATE_REPORT") return;

  const { expenses, quarter, year } = payload;

  //report object
  const totals = {
    quarter,
    year,
    totalExpenses: 0,
    deductibleTotal: 0,
    count: 0,
    byDepartment: {},
    byCategory: {},
  };

  // simulate heavy processing: batch progress updates
  const N = expenses.length;
  const batchSize = Math.max(500, Math.floor(N / 20)); // around 5% increments

  for (let i = 0; i < N; i++) {
    const exp = expenses[i];
    const amt = Number(exp.amount) || 0;

    // Consider only not rejected
    if (exp.status === "Rejected") continue;

    // quarterly filter
    if (!inQuarter(exp.date, quarter, year)) continue;

    totals.count += 1;
    totals.totalExpenses += amt;

    const rate = getDeductionRate(exp);
    const deductible = amt * rate;
    totals.deductibleTotal += deductible;

    // group by dept
    const dept = exp.department || "Unknown";
    if (!totals.byDepartment[dept]) {
      totals.byDepartment[dept] = { total: 0, deductible: 0, count: 0 };
    }
    totals.byDepartment[dept].total += amt;
    totals.byDepartment[dept].deductible += deductible;
    totals.byDepartment[dept].count += 1;

    // group by category
    const cat = exp.category || "Uncategorized";
    if (!totals.byCategory[cat]) {
      totals.byCategory[cat] = { total: 0, deductible: 0, count: 0 };
    }
    totals.byCategory[cat].total += amt;
    totals.byCategory[cat].deductible += deductible;
    totals.byCategory[cat].count += 1;

    // Progress update every batch
    if (i % batchSize === 0) {
      const percent = Math.floor((i / N) * 100);
      self.postMessage({
        type: "PROGRESS",
        payload: { percent },
      });
    }
  }

  self.postMessage({ type: "PROGRESS", payload: { percent: 100 } });

  // final report
  self.postMessage({
    type: "DONE",
    payload: {
      ...totals,
      totalExpenses: Math.round(totals.totalExpenses),
      deductibleTotal: Math.round(totals.deductibleTotal),
      generatedAt: new Date().toISOString(),
    },
  });
};
