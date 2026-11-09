import { useState } from "react";
import { base44, errorMessage } from "@/api/base44";

export default function CancelConfirm({ jobId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("cancelJob", { job_id: jobId, reason: reason.trim() });
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
        <label htmlFor={`cancel-${jobId}`} className="text-black text-[14px]">Cancel this pick up?</label>
        <textarea
          id={`cancel-${jobId}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Reason (optional)"
          className="mt-2 w-full rounded-[14px] bg-white border-[1.5px] border-line px-4 py-3 text-base text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
        />
        <div className="mt-1 flex justify-end"><span className="text-mute text-[13px]">{reason.length} / 200</span></div>
        {error && <p className="mt-1 text-danger text-[13px] font-bold" role="alert">{error}</p>}
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={handleCancel} disabled={busy} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
            {busy ? "Cancelling..." : "Yes, cancel"}
          </button>
          <button type="button" onClick={() => { setOpen(false); setError(""); }} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[48px]">
            Keep it
          </button>
        </div>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setOpen(true)} className="w-full rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[48px] hover:border-black">
      Cancel pick up
    </button>
  );
}
