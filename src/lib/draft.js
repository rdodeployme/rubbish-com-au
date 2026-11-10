import { useEffect } from "react";

// Half-filled forms are kept in this tab only (sessionStorage), so Back, Forward and
// refresh do not lose them. Cleared once the form is sent. Closing the tab clears it too.
const PREFIX = "rubbish_draft_";

export function readDraft(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(key) {
  try { sessionStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}

export function useSaveDraft(key, values, enabled = true) {
  const json = JSON.stringify(values);
  useEffect(() => {
    if (!enabled) return;
    try { sessionStorage.setItem(PREFIX + key, json); } catch { /* ignore quota errors */ }
  }, [key, json, enabled]);
}
