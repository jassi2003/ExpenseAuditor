function getQuarter(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;

  const m = d.getMonth() + 1;
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

function inQuarter(dateStr, quarter, year) {
  const d = new Date(dateStr);
  return (
    getQuarter(dateStr) === quarter &&
    d.getFullYear() === year
  );
}

function getCategory(exp) {
  const text =
    `${exp.title || ""} ${(exp.tags || []).join(" ")}`.toLowerCase();

  if (text.includes("travel") || text.includes("cab") || text.includes("flight")) {
    return "Travel";
  }
  if (text.includes("food") || text.includes("dinner")) {
    return "Food";
  }
  return "Uncategorized";
}

function getDeductionRate(category) {
  if (category === "Travel") return 0.5;
  if (category === "Food") return 0.3;
  return 0.2;
}

self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type !== "GENERATE_REPORT") return;

  const { expenses, quarter, year } = payload;

  const report = {
    quarter,
    year,
    totalExpenses: 0,
    deductibleTotal: 0,
    count: 0,
    byDepartment: {},
    byCategory: {},
    generatedAt: new Date().toISOString()
  };

  expenses.forEach(exp => {
    if (exp.status !== "Approved") return;
    if (!inQuarter(exp.date, quarter, year)) return;

    const amt = Number(exp.amountINR);
    if (!amt) return;

    report.count += 1;
    report.totalExpenses += amt;

    const category = getCategory(exp);
    const rate = getDeductionRate(category);
    const deductible = amt * rate;

    report.deductibleTotal += deductible;

    // ---- department ----
    const dept = exp.department || "Unknown";
    if (!report.byDepartment[dept]) {
      report.byDepartment[dept] = { total: 0, deductible: 0, count: 0 };
    }

    report.byDepartment[dept].total += amt;
    report.byDepartment[dept].deductible += deductible;
    report.byDepartment[dept].count += 1;

  
  });

  self.postMessage({
    type: "DONE",
    payload: {
      ...report,
      totalExpenses: Math.round(report.totalExpenses),
      deductibleTotal: Math.round(report.deductibleTotal)
    }
  });
};
