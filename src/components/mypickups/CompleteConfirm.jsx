import { useState } from "react";
import { base44, errorMessage } from "@/api/base44";

export default function CompleteConfirm({ jobId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("completeJob", { job_id: jobId });
      onSuccess(res?.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (open) {
    return (
      <div>
        <p className="text-black text-[14px]">Has the collector finished the job?</p>
        {error && <p className="mt-1 text-danger text-[13px] font-bold" role="alert">{error}</p>}
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={handleComplete} disabled={busy} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
            {busy ? "Confirming..." : "Yes"}
          </button>
          <button type="button" onClick={() => { setOpen(false); setError(""); }} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[48px]">
            No
          </button>
        </div>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setOpen(true)} className="w-full rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px]">
      Confirm the job is done
    </button>
  );
}
