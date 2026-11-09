import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";

export default function PhotoThumb({ fileUri }) {
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUri) return;
    setLoading(true);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 })
      .then(({ signed_url }) => setSignedUrl(signed_url))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fileUri]);

  if (loading) return <div className="w-20 h-20 rounded-lg bg-soft animate-pulse" />;
  if (error || !signedUrl) return <div className="w-20 h-20 rounded-lg bg-soft grid place-items-center text-[11px] text-mute">No preview</div>;
  return (
    <a href={signedUrl} target="_blank" rel="noreferrer" className="block" aria-label="Open photo in a new tab">
      <img src={signedUrl} alt="Pick-up photo" className="w-20 h-20 rounded-lg object-cover" />
    </a>
  );
}
