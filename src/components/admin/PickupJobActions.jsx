import { useState } from "react";
import { base44, errorMessage } from "@/api/base44";

// Ported from the Base44 app's admin (PickupJobActions).
const CONFIRM_TITLES = {
  approve: "Approve and send to collectors?",
  reject: "Reject this post?",
  cancel: "Cancel this pick up?",
  reopen: "Reopen this pick up?",
  complete: "Mark this pick up complete?",
};

const btn = "min-h-[44px] inline-flex items-center justify-center rounded-full border border-black px-3 py-1.5 font-heading font-extrabold text-[13px] text-black";

// Admin-only job tools. Each button shows only for the states it applies to.
// adminJobAction checks the admin role on the server.
export default function PickupJobActions({ job, onUpdated }) {
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const status = job.job_status || "";
  const waitingReview = status === "Open" && job.status !== "Approved";
  const canApprove = waitingReview;
  const canReject = waitingReview && !job.accepted_quote_id;
  const canCancel = (status === "Open" && !waitingReview) || status === "Booked";
  const canReopen = status === "Booked" || status === "Cancelled" || status === "Expired";
  const canComplete = status === "Booked";

  if (!canApprove && !canReject && !canCancel && !canReopen && !canComplete) return null;

  const close = () => { setPending(null); setReason(""); setError(""); };

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("adminJobAction", { action: pending, job_id: job.id, reason: reason.trim() });
      onUpdated(res?.data || {});
      close();
    } catch (err) {
      setError(errorMessage(err, "Could not save. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const needsReason = pending === "cancel" || pending === "reject";

  return (
    <div className="mt-5">
      <h3 className="font-heading font-extrabold text-[16px] text-black">Job actions</h3>
      {status === "Open" && (
        <p className="mt-1 text-[13px] font-bold text-black">{waitingReview ? "Waiting for review: collectors can't see it yet." : "Approved: live to collectors."}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {canApprove && <button type="button" onClick={() => setPending("approve")} className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-black text-gold px-4 py-1.5 font-heading font-extrabold text-[13px]">Approve post</button>}
        {canReject && <button type="button" onClick={() => setPending("reject")} className={btn}>Reject post</button>}
        {canCancel && <button type="button" onClick={() => setPending("cancel")} className={btn}>Cancel job</button>}
        {canReopen && <button type="button" onClick={() => setPending("reopen")} className={btn}>Reopen job</button>}
        {canComplete && <button type="button" onClick={() => setPending("complete")} className={btn}>Mark complete</button>}
      </div>

      {pending && (
        <div className="mt-3 rounded-[16px] bg-soft p-4">
          <p className="font-heading font-extrabold text-black text-[15px]">{CONFIRM_TITLES[pending]}</p>
          {pending === "approve" && <p className="mt-1 text-mute text-[13px]">It shows in collectors' Jobs straight away and the customer is emailed that it's live.</p>}
          {needsReason && (
            <div className="mt-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                rows={2}
                aria-label={pending === "reject" ? "Reason for rejecting" : "Reason for cancelling"}
                placeholder={pending === "reject" ? "Reason (the customer sees this)" : "Reason (required)"}
                className="w-full rounded-[14px] bg-white border-[1.5px] border-line px-4 py-3 text-base text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
              />
              <div className="mt-1 flex justify-end"><span className="text-mute text-[13px]">{reason.length} / 200</span></div>
            </div>
          )}
          {pending === "reopen" && <p className="mt-1 text-mute text-[13px]">The accepted quote is released and any earlier quotes stay closed.</p>}
          {pending === "complete" && <p className="mt-1 text-mute text-[13px]">Use this when the customer has not confirmed. The collector is told it is done.</p>}
          {error && <p className="mt-2 text-[13px] font-bold text-danger" role="alert">{error}</p>}
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={close} disabled={busy} className="flex-1 rounded-full border border-black text-black font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">Back</button>
            <button type="button" onClick={run} disabled={busy || (needsReason && reason.trim() === "")} className="flex-1 rounded-full bg-black text-white font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">
              {busy ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
