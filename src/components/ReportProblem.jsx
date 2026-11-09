import { useState } from "react";
import { base44, errorMessage } from "@/api/base44";

// Small sheet for telling the team something went wrong with a job.
export default function ReportProblem({ jobId }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const close = () => { setOpen(false); setMessage(""); setError(""); setSent(false); };

  const handleSubmit = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("reportProblem", { job_id: jobId, message: message.trim() });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Sorry, that did not send. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const tooShort = message.trim().length < 10;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center text-mute text-[13px] underline underline-offset-2 min-h-[44px] hover:text-black">
        Report a problem
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center md:p-6" role="dialog" aria-modal="true" aria-labelledby={`rp-${jobId}`}>
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative w-full md:max-w-[480px] bg-white rounded-t-[28px] md:rounded-[28px] p-5 md:p-7">
            <h2 id={`rp-${jobId}`} className="font-heading font-extrabold text-[20px] text-black">Report a problem</h2>
            {sent ? (
              <>
                <p className="mt-2 text-black text-[14px]">Thanks. We'll look into it and get back to you by email.</p>
                <button type="button" onClick={close} className="mt-4 w-full rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px]">Close</button>
              </>
            ) : (
              <>
                <p className="mt-2 text-mute text-[13px]">Tell us what happened. Our team reads every report.</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                  aria-label="What happened"
                  rows={4}
                  placeholder="What happened?"
                  className="mt-3 w-full rounded-[14px] bg-white border-[1.5px] border-line px-4 py-3 text-base text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
                />
                <div className="mt-1 flex justify-end"><span className="text-mute text-[13px]">{message.trim().length} / 1000</span></div>
                {error && <p className="mt-1 text-[13px] font-bold text-danger" role="alert">{error}</p>}
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={handleSubmit} disabled={busy || tooShort} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
                    {busy ? "Sending..." : "Send report"}
                  </button>
                  <button type="button" onClick={close} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[48px]">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
