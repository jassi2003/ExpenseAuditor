import { getQueuedExpense, removeQueuedExpense } from "../storage/indexDb.js";
import { postExpenseToServer } from "./api.js";
import { longPollApproval } from "../controllers/employeeControllers.js";
let draining = false

export async function drainQueue(setStatus) {
    if (draining) return
    draining = true
    try {
        if (!navigator.onLine) return;
        const queued = await getQueuedExpense()
        if (!queued.length) return
        setStatus?.(` Syncing ${queued.length} offline item...`);
        for (const item of queued) {
            try {
                await postExpenseToServer(item.expense);
                await removeQueuedExpense(item.queueId);
                window.dispatchEvent(new Event("queue:changed"));
                 longPollApproval(item.expense.id)

            }
            catch (e) {
                setStatus?.("Sync failed...");
                break;
            }
        }
        setStatus?.("Sync finished");
        window.dispatchEvent(new Event("queue:changed"));


    }
    finally {
        draining = false;
    }
}



