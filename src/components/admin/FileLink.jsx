import { useState } from "react";
import { base44 } from "@/api/base44";

// Opens a private upload (licence, insurance, photo) through a 5-minute signed link.
export default function FileLink({ fileUri, label }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!fileUri) {
    return <span className="text-mute text-[14px]">No file uploaded</span>;
  }

  const handleOpen = async () => {
    setError("");
    setBusy(true);
    // Open the tab first so the browser does not block it as a pop-up.
    const win = window.open("", "_blank");
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 });
      if (win) win.location.href = signed_url; else window.location.href = signed_url;
    } catch {
      if (win) win.close();
      setError("Could not open file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleOpen} disabled={busy} className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-black text-white px-4 py-2 font-heading font-extrabold text-[13px] disabled:opacity-60">
        {busy ? "Opening..." : label || "Open file"}
      </button>
      {error && <p className="mt-1 text-[12px] text-danger font-bold">{error}</p>}
    </div>
  );
}
