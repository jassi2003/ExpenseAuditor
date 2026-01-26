import { CONFIG } from "../js/config.js";

export async function postExpenseToServer(expense) {
 
  if (!expense?.id) {
    throw new Error("Expense ID missing. Please generate expense.id in frontend before calling API.");
  }

  const formData = new FormData();

  formData.append(
    "formData",
    JSON.stringify({
      id: expense.id, 
      title: expense.title,
      amount: expense.amount,
      department: expense.department,
      date: expense.date,
      tag: expense.tag,
      status: "Pending",
      flagged: false,
      empMail: expense.empMail || null,
      userId:expense.userId 
    })
  );

  // if (expense.receipt) formData.append("receipt", expense.receipt);

  const res = await fetch(`${CONFIG.BASE_URL}/api/expenses`, {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    throw new Error(text || "Invalid server response (not JSON)");
  }

  if (!res.ok) throw new Error(data.message || "Server error while saving expense");


  return data; 
}
