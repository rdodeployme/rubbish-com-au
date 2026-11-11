import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";

// Private uploads (pick up photos) need a short-lived signed link to show.
export function useSignedUrls(uris, limit = 8) {
  const [urls, setUrls] = useState([]);
  const key = Array.isArray(uris) ? uris.slice(0, limit).join("|") : "";
  useEffect(() => {
    let cancelled = false;
    const list = key ? key.split("|") : [];
    if (list.length === 0) {
      setUrls([]);
      return undefined;
    }
    Promise.allSettled(
      list.map((file_uri) => base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 3600 }))
    ).then((results) => {
      if (cancelled) return;
      setUrls(results.map((r) => (r.status === "fulfilled" ? r.value?.signed_url : null)).filter(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return urls;
}
