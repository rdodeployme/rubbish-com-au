// Resolve ?returnTo= to a safe in-site path (router path, without the site base), else "/".
// A value like //evil.com or /\evil.com must never get through: only one leading slash.
export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get("returnTo");
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    for (const p of ["access_token", "clear_access_token", "app_id", "from_url"]) url.searchParams.delete(p);
    const path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//")) return "/";
    return path;
  } catch {
    return "/";
  }
}

// Full browser address for a router path (adds the GitHub Pages base).
export function siteHref(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : "/" + path);
}
