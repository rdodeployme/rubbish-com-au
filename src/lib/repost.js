// Details handed to the post form when a customer posts an expired job again.
// The date is deliberately left out: that is the one thing they must pick again.
const KEY = "rubbish_repost";

let cached = null;
let cachedRead = false;

export function saveRepost(data) {
  cached = null;
  cachedRead = false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Nothing to do, the form just opens empty.
  }
}

export function takeRepost() {
  if (cachedRead) return cached;
  cachedRead = true;
  cached = null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      cached = JSON.parse(raw);
      sessionStorage.removeItem(KEY);
    }
  } catch {
    cached = null;
  }
  return cached;
}
