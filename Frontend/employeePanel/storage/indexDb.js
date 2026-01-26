const DbName = "ExpenseDb"
const DbVersion = 4;


const ExpenseStore = "expenses"
const OfflineExpenseStore = "offlineQueues";
const UserStore = "users";
const DepttStore = "departments"



function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DbName, DbVersion)

        req.onupgradeneeded = (e) => {
            const db = e.target.result
            //expense store
            if (!db.objectStoreNames.contains(ExpenseStore)) {
                const store = db.createObjectStore(ExpenseStore, { keyPath: "id", autoIncrement: true })
                store.createIndex("byDate", "date")
                store.createIndex("bydeptt", "department")
            }
            //offline expense store
            if (!db.objectStoreNames.contains(OfflineExpenseStore)) {
                db.createObjectStore(OfflineExpenseStore, { keyPath: "queueId", autoIncrement: true });
            }
            //user store
            if (!db.objectStoreNames.contains(UserStore)) {
                const userStore = db.createObjectStore(UserStore, { keyPath: "email" });
                userStore.createIndex("byRole", "role", { unique: false });
            }
            //department store
                if(!db.objectStoreNames.contains(DepttStore)){
            db.createObjectStore(DepttStore, { keyPath: "depttname"});
    }

        }

        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

//adding the expense
export async function addExpense(expense) {
    const db = await openDb()

    return new Promise((resolve, reject) => {
        const txn = db.transaction(ExpenseStore, "readwrite")
        const store = txn.objectStore(ExpenseStore)

        const req = store.add(expense)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)

        txn.oncomplete = () => db.close()
        txn.onerror = () => reject(txn.error);

    })
}
//getting the exenses
export async function getAllExpenses() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const txn = db.transaction(ExpenseStore, "readonly")
        const store = txn.objectStore(ExpenseStore)

        const req = store.getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
        txn.oncomplete = () => db.close()
    })
}

//updating the expense
export async function updateExpense(updatedExpense) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const txn = db.transaction(ExpenseStore, "readwrite");
        const store = txn.objectStore(ExpenseStore);
        store.put(updatedExpense);
        txn.oncomplete = () => resolve(true);
        txn.onerror = () => reject(txn.error);
        txn.onabort = () => reject(txn.error);
    });
}


//deleting the expenses
export async function deleteExpense(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(ExpenseStore, "readwrite");
        const store = tx.objectStore(ExpenseStore)
        const req = store.delete(id)
        req.oncomplete = () => resolve(true);
        req.onerror = () => reject(tx.error);
    });
}


//for offline queued expenses
export async function AddQueueExpense(expense) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const txn = db.transaction(OfflineExpenseStore, "readwrite")
        const store = txn.objectStore(OfflineExpenseStore)
        const req = store.add(expense)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
        txn.oncomplete = () => db.close()
        txn.onerror = () => reject(txn.error);
    })
}

//getting the queued expenses
export async function getQueuedExpense() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const txn = db.transaction(OfflineExpenseStore, "readonly")
        const store = txn.objectStore(OfflineExpenseStore)
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
        txn.oncomplete = () => db.close()

    })
}

//removing the queued expenses
export async function removeQueuedExpense(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
        const txn = db.transaction(OfflineExpenseStore, "readwrite")
        const store = txn.objectStore(OfflineExpenseStore)
        const req = store.delete(id)
        req.oncomplete = () => resolve(true);
        req.onerror = () => reject(tx.error);


    })
}


//adding department info
export async function addDepartmentInfo(info) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const txn = db.transaction(DepttStore, "readwrite");
    const store = txn.objectStore(DepttStore);

    if (!info || typeof info.depttname !== "string") {
      reject("Invalid department name");
      return;
    }

    const deptKey = info.depttname.trim().toLowerCase();
    if (!/^[a-z\s]+$/.test(deptKey)) {
  reject("Department name must contain only letters.");
  return;
}
    if (!deptKey) {
      reject("Department name cannot be empty");
      return;
    }

    const checkReq = store.get(deptKey);

    checkReq.onsuccess = () => {
      if (checkReq.result) {
        reject("Department already exists");
        return;
      }

      // store key
      const addReq = store.add({
        ...info,
        depttname: deptKey
      });

      addReq.onsuccess = () => resolve(true);
      addReq.onerror = () => reject(addReq.error);
    };

    checkReq.onerror = () => reject("Error checking department");

    txn.oncomplete = () => db.close();
    txn.onerror = () => reject(txn.error);

  });
}

//get Departments
export async function getDepartmentInfo(){
    const db= await openDb()
    return new Promise((resolve,reject)=>{
        const txn=db.transaction(DepttStore,"readonly")
          const store = txn.objectStore(DepttStore)
        const req=store.getAll() 
         req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
        txn.oncomplete = () => db.close()
    })
}

// approving the expense and deducting the amount from deptt budget
export async function approveExpense(expId) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const txn = db.transaction(["expenses", "departments"], "readwrite");
    const expenseStore = txn.objectStore("expenses");
    const depttStore = txn.objectStore("departments");

    //  get expense
    const getExpReq = expenseStore.get(expId);

    getExpReq.onerror = () => reject("Failed to fetch expense");

    getExpReq.onsuccess = () => {
      const expense = getExpReq.result;

      if (!expense) {
        reject("Expense not found");
        return;
      }

      if (expense.status === "Approved") {
        reject("Expense already approved");
        return;
      }

      const deptKey = (expense.department || "").trim().toLowerCase(); 
      const amount = Number(expense.amountINR);                           

      if (!deptKey) {
        reject("Department missing in expense");
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        reject("Invalid expense amount");
        return;
      }

      // get department
      const getDeptReq = depttStore.get(deptKey);

      getDeptReq.onerror = () => reject("Failed to fetch department");

      getDeptReq.onsuccess = () => {
        const dept = getDeptReq.result;

        if (!dept) {
          reject("Department not found");
          return;
        }

        const currentBudget = Number(dept.depttBudget);

        if (isNaN(currentBudget)) {
          reject("Department budget is invalid");
          return;
        }

        if (currentBudget < amount) {
          reject("Not enough budget to approve this expense");
          alert("Not enough budget to approve this expense");
          return;
        }
        //  update
        expense.status = "Approved";
        expense.approvedAt = new Date().toISOString();
        dept.depttBudget = String(currentBudget - amount);
        expenseStore.put(expense);
        depttStore.put(dept);
      };

    };

    txn.oncomplete = () => {
      db.close();
      resolve(true);
    };

    txn.onerror = () => {
      db.close();
      reject(txn.error?.message || "Transaction failed");
    };
  });
}
//reject the expense
export async function rejectExpense(expenseId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const txn = db.transaction("expenses", "readwrite");
    const store = txn.objectStore("expenses");

    // 1) get expense
    const getReq = store.get(expenseId);

    getReq.onerror = () => reject("Failed to fetch expense");

    getReq.onsuccess = () => {
      const expense = getReq.result;
      if (!expense) {
        reject("Expense not found");
        return;
      }
      //update status
      expense.status = "Rejected";
      expense.rejectedAt = new Date().toISOString();
      // save the status
      const putReq = store.put(expense);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject("Failed to reject expense");
    };
    txn.oncomplete = () => db.close();
    txn.onerror = () => reject(txn.error);
  });
}
