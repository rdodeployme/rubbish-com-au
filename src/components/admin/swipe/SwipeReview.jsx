import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Check, Clock } from "lucide-react";
import Portal from "@/components/Portal";
import { base44, errorMessage } from "@/api/base44";
import SwipeCard from "./SwipeCard";
import JobReviewDetails from "./JobReviewDetails";
import CollectorReviewDetails from "./CollectorReviewDetails";

const UNDO_MS = 5000;

const JOB_REASONS = [
  "We only cover Melbourne and Brisbane for now.",
  "Hazardous items (asbestos, chemicals, gas bottles or paint) can't be collected.",
  "Please add photos and more detail about what needs to go.",
  "This looks like a duplicate of another post.",
];

const COLLECTOR_NOTES = ["ABN not active", "Insurance not valid", "Outside our area", "Details incomplete"];

function labelFor(kind, item) {
  if (kind === "jobs") return [item.suburb, item.postcode].filter(Boolean).join(" ") || "This job";
  return item.trading_name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "This collector";
}

async function saveDecision(kind, item, action, reason) {
  if (kind === "jobs") {
    await base44.functions.invoke("adminJobAction", { action, job_id: item.id, reason: reason || "" });
  } else {
    await base44.functions.invoke("setApplicationStatus", {
      applicationId: item.id,
      status: action === "approve" ? "Approved" : "Not approved",
      note: reason || "",
    });
  }
}

// Asked after a swipe left: why is it being rejected?
function RejectSheet({ kind, item, onCancel, onConfirm }) {
  const [choice, setChoice] = useState("");
  const [text, setText] = useState("");
  const isJob = kind === "jobs";
  const presets = isJob ? JOB_REASONS : COLLECTOR_NOTES;
  const reason = (choice === "other" ? text : choice).trim();
  const canSend = isJob ? reason !== "" : true;
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/60" role="dialog" aria-modal="true" aria-labelledby="reject-title">
      <div className="w-full max-h-[85%] overflow-y-auto rounded-t-[24px] bg-white px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <h2 id="reject-title" className="font-heading font-extrabold text-black text-[22px] leading-tight">
          {isJob ? `Reject ${labelFor(kind, item)}?` : `Don't approve ${labelFor(kind, item)}?`}
        </h2>
        <p className="mt-1 text-mute text-[14px]">
          {isJob
            ? "The post is closed and the customer is emailed this reason."
            : "They're emailed that their application wasn't approved. Your note stays with the team."}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {presets.map((p, i) => (
            <button
              key={p}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              onClick={() => setChoice(p)}
              aria-pressed={choice === p}
              className={`min-h-[48px] rounded-[14px] px-4 py-2 text-left text-[15px] ${choice === p ? "bg-black text-gold font-bold" : "bg-soft text-black"}`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setChoice("other")}
            aria-pressed={choice === "other"}
            className={`min-h-[48px] rounded-[14px] px-4 py-2 text-left text-[15px] ${choice === "other" ? "bg-black text-gold font-bold" : "bg-soft text-black"}`}
          >
            {isJob ? "Something else (type it)" : "Write a note"}
          </button>
          {choice === "other" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 200))}
              rows={3}
              autoFocus
              aria-label={isJob ? "Reason (the customer sees this)" : "Note for the team"}
              placeholder={isJob ? "Reason (the customer sees this)" : "Note for the team (not sent to them)"}
              className="w-full rounded-[14px] border-[1.5px] border-line px-4 py-3 text-[16px] text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
            />
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="min-h-[52px] flex-1 rounded-full border border-black font-heading font-extrabold text-[15px] text-black">
            Keep it
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!canSend}
            className="min-h-[52px] flex-1 rounded-full bg-black font-heading font-extrabold text-[15px] text-white disabled:opacity-40"
          >
            {isJob ? "Reject" : "Not approved"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Full-screen, one-at-a-time review: swipe right to approve, left to reject,
// scroll up and down for the details. Every decision can be undone for 5 seconds.
export default function SwipeReview({ kind, jobs, collectors, onKindChange, onClose, onCommitted }) {
  const [order, setOrder] = useState({ jobs: [], collectors: [] });
  const [hidden, setHidden] = useState(() => new Set());
  const [pending, setPending] = useState(null); // { kind, item, action, reason, until }
  const [rejecting, setRejecting] = useState(null); // { kind, item }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const pendingRef = useRef(null);
  const timerRef = useRef(null);
  const cardRef = useRef(null);
  const closeRef = useRef(null);

  const source = useMemo(() => ({ jobs: jobs || [], collectors: collectors || [] }), [jobs, collectors]);

  // Keep a stable order per deck, so Later can move a card to the back.
  useEffect(() => {
    setOrder((prev) => {
      const next = {};
      for (const k of ["jobs", "collectors"]) {
        const ids = source[k].map((x) => x.id);
        const kept = prev[k].filter((id) => ids.includes(id));
        const added = ids.filter((id) => !kept.includes(id));
        next[k] = [...kept, ...added];
      }
      return next;
    });
  }, [source]);

  const byId = useMemo(() => {
    const m = {};
    for (const k of ["jobs", "collectors"]) for (const x of source[k]) m[`${k}:${x.id}`] = x;
    return m;
  }, [source]);

  const deck = (k) => order[k].filter((id) => !hidden.has(`${k}:${id}`)).map((id) => byId[`${k}:${id}`]).filter(Boolean);
  const current = deck(kind);
  const top = current[0];
  const next = current[1];

  const unhide = (k, id, toFront = true) => {
    setHidden((prev) => {
      const s = new Set(prev);
      s.delete(`${k}:${id}`);
      return s;
    });
    if (toFront) setOrder((prev) => ({ ...prev, [k]: [id, ...prev[k].filter((x) => x !== id)] }));
  };
  const hide = (k, id) => setHidden((prev) => new Set(prev).add(`${k}:${id}`));

  const commit = useCallback(async (p) => {
    if (!p) return;
    setSaving(true);
    try {
      await saveDecision(p.kind, p.item, p.action, p.reason);
      onCommitted(p.kind, p.item.id, p.action);
    } catch (err) {
      unhide(p.kind, p.item.id);
      setError(`${labelFor(p.kind, p.item)}: ${errorMessage(err, "Could not save. Please try again.")}`);
    } finally {
      setSaving(false);
    }
  }, [onCommitted]);

  const flush = useCallback(() => {
    const p = pendingRef.current;
    if (!p) return Promise.resolve();
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    setPending(null);
    return commit(p);
  }, [commit]);

  const startPending = (k, item, action, reason) => {
    flush();
    hide(k, item.id);
    setError("");
    const p = { kind: k, item, action, reason, until: Date.now() + UNDO_MS };
    pendingRef.current = p;
    setPending(p);
    if (navigator.vibrate) navigator.vibrate(12);
    timerRef.current = window.setTimeout(() => {
      if (pendingRef.current === p) {
        pendingRef.current = null;
        setPending(null);
        commit(p);
      }
    }, UNDO_MS);
  };

  const undo = () => {
    const p = pendingRef.current;
    if (!p) return;
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    setPending(null);
    if (p.kind !== kind) onKindChange(p.kind);
    unhide(p.kind, p.item.id);
  };

  // Save anything waiting if the deck is closed or the page is left.
  useEffect(() => () => { flush(); }, [flush]);
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  // Countdown for the Undo bar.
  useEffect(() => {
    if (!pending) return undefined;
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(t);
  }, [pending]);

  // The page behind doesn't scroll while the deck is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSwiped = (dir) => {
    if (!top) return;
    if (dir === "right") {
      startPending(kind, top, "approve", "");
    } else {
      hide(kind, top.id);
      setRejecting({ kind, item: top });
    }
  };

  const later = () => {
    if (!top || current.length < 2) return;
    setOrder((prev) => ({ ...prev, [kind]: [...prev[kind].filter((x) => x !== top.id), top.id] }));
  };

  const close = async () => {
    await flush();
    onClose();
  };

  // Arrow keys and Escape on a computer.
  useEffect(() => {
    const onKey = (e) => {
      if (rejecting) {
        if (e.key === "Escape") { unhide(rejecting.kind, rejecting.item.id); setRejecting(null); }
        return;
      }
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight" && top) cardRef.current?.swipe("right");
      else if (e.key === "ArrowLeft" && top) cardRef.current?.swipe("left");
      else if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const counts = { jobs: deck("jobs").length, collectors: deck("collectors").length };
  const other = kind === "jobs" ? "collectors" : "jobs";
  const secondsLeft = pending ? Math.max(0, Math.ceil((pending.until - now) / 1000)) : 0;
  const progress = pending ? Math.max(0, Math.min(1, (pending.until - now) / UNDO_MS)) : 0;

  return (
    <Portal>
      <div className="fixed inset-0 z-[70] flex flex-col bg-asphalt" role="dialog" aria-modal="true" aria-label="Swipe review">
        {/* Header: close, the Jobs / Collectors switch, how many are left. */}
        <div className="shrink-0 px-3 pt-[calc(8px+env(safe-area-inset-top))] pb-2 flex items-center gap-2">
          <button ref={closeRef} type="button" onClick={close} aria-label="Close review" className="grid place-items-center h-11 w-11 rounded-full text-white">
            <X className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-2 gap-1 rounded-full bg-white/10 p-1" role="tablist" aria-label="What to review">
              {[["jobs", "Jobs"], ["collectors", "Collectors"]].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => { setError(""); onKindChange(k); }}
                  className={`min-h-[40px] rounded-full px-4 font-heading font-extrabold text-[14px] inline-flex items-center justify-center gap-1.5 ${kind === k ? "bg-gold text-black" : "text-white"}`}
                >
                  {label}
                  <span className={`text-[12px] ${kind === k ? "text-black/70" : "text-white/60"}`}>{counts[k]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-11" aria-hidden="true" />
        </div>

        {error && (
          <div className="mx-3 mb-2 rounded-[14px] bg-white px-4 py-3 text-[14px] font-bold text-danger" role="alert">
            {error}
          </div>
        )}

        {/* The cards. */}
        <div className="relative flex-1 mx-3 mb-2">
          {top ? (
            <>
              {next && (
                <div className="absolute inset-0 rounded-[24px] bg-white overflow-hidden" style={{ transform: "translateY(10px) scale(0.96)", opacity: 0.7 }} aria-hidden="true">
                  {kind === "jobs" ? <JobReviewDetails job={next} /> : <CollectorReviewDetails app={next} />}
                </div>
              )}
              <SwipeCard key={`${kind}:${top.id}`} ref={cardRef} onSwiped={handleSwiped} disabled={!!rejecting}>
                {kind === "jobs" ? <JobReviewDetails job={top} /> : <CollectorReviewDetails app={top} />}
              </SwipeCard>
            </>
          ) : (
            <div className="absolute inset-0 rounded-[24px] bg-white flex flex-col items-center justify-center px-8 text-center">
              <span className="grid place-items-center h-16 w-16 rounded-full bg-gold">
                <Check className="h-8 w-8 text-black" strokeWidth={3} />
              </span>
              <h2 className="mt-4 font-heading font-extrabold text-black text-[26px]">All caught up</h2>
              <p className="mt-1 text-mute text-[15px]">No {kind === "jobs" ? "jobs" : "collectors"} waiting for review.</p>
              {counts[other] > 0 && (
                <button type="button" onClick={() => onKindChange(other)} className="mt-6 min-h-[52px] rounded-full bg-black px-6 font-heading font-extrabold text-[15px] text-gold">
                  Review {counts[other]} {other === "jobs" ? (counts[other] === 1 ? "job" : "jobs") : counts[other] === 1 ? "collector" : "collectors"}
                </button>
              )}
              <button type="button" onClick={close} className="mt-3 min-h-[48px] px-6 font-heading font-extrabold text-[15px] text-black underline underline-offset-4">
                Back to Admin
              </button>
            </div>
          )}

          {rejecting && (
            <RejectSheet
              kind={rejecting.kind}
              item={rejecting.item}
              onCancel={() => { unhide(rejecting.kind, rejecting.item.id); setRejecting(null); }}
              onConfirm={(reason) => {
                const r = rejecting;
                setRejecting(null);
                startPending(r.kind, r.item, "reject", reason);
              }}
            />
          )}
        </div>

        {/* Undo bar: the decision is only saved when this runs out. */}
        <div className="shrink-0 px-3 min-h-[56px]">
          {pending ? (
            <div className="relative overflow-hidden rounded-[14px] bg-white flex items-center gap-3 px-4 py-2.5" role="status">
              <div className="absolute left-0 bottom-0 h-[3px] bg-gold" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
              <p className="flex-1 min-w-0 text-[14px] text-black truncate">
                <span className="font-bold">{pending.action === "approve" ? "Approving" : pending.kind === "jobs" ? "Rejecting" : "Not approving"}</span>{" "}
                {labelFor(pending.kind, pending.item)} in {secondsLeft}s
              </p>
              <button type="button" onClick={undo} className="min-h-[44px] shrink-0 rounded-full bg-black px-5 font-heading font-extrabold text-[14px] text-gold">
                Undo
              </button>
            </div>
          ) : saving ? (
            <p className="text-center text-white/70 text-[13px] py-4">Saving...</p>
          ) : top ? (
            <p className="text-center text-white/60 text-[13px] py-4">Swipe right to approve, left to reject. Scroll for details.</p>
          ) : null}
        </div>

        {/* Buttons for the same actions. */}
        <div className="shrink-0 px-6 pt-1 pb-[calc(14px+env(safe-area-inset-bottom))] flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => cardRef.current?.swipe("left")}
            disabled={!top || !!rejecting}
            aria-label={kind === "jobs" ? "Reject" : "Don't approve"}
            className="grid place-items-center h-[68px] w-[68px] rounded-full bg-white text-black shadow-lg disabled:opacity-30"
          >
            <X className="h-8 w-8" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={later}
            disabled={!top || current.length < 2 || !!rejecting}
            aria-label="Decide later"
            className="grid place-items-center h-[52px] w-[52px] rounded-full bg-white/15 text-white disabled:opacity-30"
          >
            <Clock className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => cardRef.current?.swipe("right")}
            disabled={!top || !!rejecting}
            aria-label="Approve"
            className="grid place-items-center h-[68px] w-[68px] rounded-full bg-gold text-black shadow-lg disabled:opacity-30"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </button>
        </div>
      </div>
    </Portal>
  );
}
