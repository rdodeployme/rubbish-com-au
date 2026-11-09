import { useState, useEffect } from "react";
import { base44 } from "@/api/base44";

export function usePostingLive() {
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke("getPublicSettings", {})
      .then((res) => { if (!cancelled) setLive(!!res?.data?.customer_posting_live); })
      .catch(() => { if (!cancelled) setLive(false); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { live, loading };
}
