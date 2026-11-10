import { useEffect, useState } from "react";
import { base44, errorMessage } from "@/api/base44";
import { formatAUDate, formatAUDateTime, joinList } from "@/lib/adminConfig";
import { melbourneToday } from "@/lib/format";

// Ported from the Base44 app's admin (PostReviewCard).
// One customer post waiting for approval: everything needed to decide, with Approve and Reject on the card.
export default function PostReviewCard({ post, onDone, onOpen }) {
  const [thumbs, setThumbs] = useState([]);
  const [mode, setMode] = useState(null); // "approve" | "reject"
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const uris = Array.isArray(post.photos) ? post.photos.slice(0, 4) : [];
    Promise.allSettled(uris.map((file_uri) => base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 3600 }))).then((results) => {
      if (cancelled) return;
      setThumbs(results.map((r) => (r.status === "fulfilled" ? r.value?.signed_url : null)).filter(Boolean));
    });
    return () => { cancelled = true; };
  }, [post.id]);

  const datePassed = post.pickup_date && post.pickup_date < melbourneToday();

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("adminJobAction", { action: mode, job_id: post.id, reason: reason.trim() });
      onDone(post.id, mode);
    } catch (err) {
      setError(errorMessage(err, "Could not save. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[18px] bg-white border border-line p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-extrabold text-black text-[17px] leading-tight">{[post.suburb, post.postcode].filter(Boolean).join(" ")}</p>
          <p className="mt-0.5 text-black text-[14px]">
            {post.pickup_date ? formatAUDate(post.pickup_date) : "No date"}
            {post.time_window ? ` · ${post.time_window}` : ""}
          </p>
          <p className="mt-0.5 text-mute text-[13px]">
            {[post.size, post.estimated_volume_m3 != null ? `${post.estimated_volume_m3} m³` : "", post.vehicle].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-[12px] font-heading font-extrabold text-black">Waiting</span>
      </div>

      {datePassed && (
        <p className="rounded-[12px] bg-black text-white px-3 py-2 text-[13px] font-bold">The pick up date has passed. Reject it, or it will expire on its own.</p>
      )}

      {post.description && <p className="text-black text-[14px] leading-relaxed whitespace-pre-line break-words line-clamp-6">{post.description}</p>}

      {Array.isArray(post.materials) && post.materials.length > 0 && <p className="text-mute text-[13px]">Materials: {joinList(post.materials)}</p>}

      {thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {thumbs.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-[10px] bg-soft" aria-label={`Open photo ${i + 1}`}>
              <img src={url} alt={`Photo ${i + 1} of the pick up`} className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <p className="text-mute text-[12px]">{post.name || "Customer"} · posted {formatAUDateTime(post.created_date)}</p>

      {!mode && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode("approve")} className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-full bg-black text-gold px-4 font-heading font-extrabold text-[14px]">Approve</button>
          <button type="button" onClick={() => setMode("reject")} className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-full border border-black text-black px-4 font-heading font-extrabold text-[14px]">Reject</button>
          <button type="button" onClick={() => onOpen(post)} className="min-h-[44px] inline-flex items-center justify-center rounded-full px-3 text-black font-bold text-[14px] underline underline-offset-2">All details</button>
        </div>
      )}

      {mode && (
        <div className="rounded-[14px] bg-soft p-3">
          <p className="font-heading font-extrabold text-black text-[15px]">{mode === "approve" ? "Approve and send to collectors?" : "Reject this post?"}</p>
          <p className="mt-1 text-mute text-[13px]">
            {mode === "approve"
              ? "It shows in collectors' Jobs straight away and the customer is emailed that it's live."
              : "The post is closed and the customer is emailed the reason below."}
          </p>
          {mode === "reject" && (
            <div className="mt-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                rows={2}
                aria-label="Reason for rejecting (the customer sees this)"
                placeholder="Reason (the customer sees this)"
                className="w-full rounded-[12px] bg-white border-[1.5px] border-line px-3 py-2 text-[15px] text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
              />
              <p className="mt-1 text-right text-mute text-[12px]">{reason.length} / 200</p>
            </div>
          )}
          {error && <p className="mt-2 text-[13px] font-bold text-danger" role="alert">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => { setMode(null); setReason(""); setError(""); }} disabled={busy} className="min-h-[44px] flex-1 rounded-full border border-black text-black font-heading font-extrabold text-[14px] disabled:opacity-60">Back</button>
            <button type="button" onClick={run} disabled={busy || (mode === "reject" && reason.trim() === "")} className="min-h-[44px] flex-1 rounded-full bg-black text-white font-heading font-extrabold text-[14px] disabled:opacity-60">
              {busy ? "Saving..." : mode === "approve" ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
