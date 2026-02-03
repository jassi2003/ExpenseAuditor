
//Checking whether an expense date lies between two selected dates.
function inDateRange(dateStr, from, to) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false; //checking Invalid date
  return d >= from && d <= to;
}

//worker receiving mssg from admincontroller
self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type !== "GENERATE_REPORT") return;

  const { expenses, fromDate, toDate } = payload; //extracting data from payload

  const from = new Date(fromDate);
  const to = new Date(toDate);

  //report object
  const report = {
    fromDate,
    toDate,
    totalExpenseAmt:0,
    ExpenseCount: 0,
    byDepartment: {},
    byEmployee: {},
    generatedAt: new Date().toISOString()
  };


  expenses.forEach((exp) => {
    if (exp.status !== "Approved") return;
    if (!inDateRange(exp.date, from, to)) return;

    const amt = Number(exp.amountINR);
    if (!amt) return;

    report.ExpenseCount += 1;
    report.totalExpenseAmt += amt;

  

    // department summary 
    const dept = exp.department || "Unknown";
    if (!report.byDepartment[dept]) {
      report.byDepartment[dept] = { total: 0, count: 0 };
    }
    report.byDepartment[dept].total += amt;
    report.byDepartment[dept].count += 1;

    //  employee summary 
    const emp = exp.empMail || exp.userId || "Unknown";
    if (!report.byEmployee[emp]) {
      report.byEmployee[emp] = { total: 0, count: 0 };
    }
    report.byEmployee[emp].total += amt;
    report.byEmployee[emp].count += 1;
  });


  //sending message to main thread
  self.postMessage({
    type: "DONE",
    payload: {
      ...report,
    }
  });
};
