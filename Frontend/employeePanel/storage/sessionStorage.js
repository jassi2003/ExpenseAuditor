const DraftKey = "expenseDraftKey";

export function saveDraft(draft) {
  sessionStorage.setItem(DraftKey, JSON.stringify(draft));
}

export function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DraftKey)) || null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(DraftKey);
}
