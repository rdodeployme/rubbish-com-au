import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Check } from "lucide-react";
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
      <div className="w-full max-h-[85%] overflow-y-auto rounded-[24px] bg-white px-5 pt-5 pb-5">
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
// scroll up and down for the details. No buttons take up room under the card.
// Every decision waits 5 seconds (with Undo) before it's saved, and each one has
// its own timer, so swiping the next card never cuts the last one short.
export default function SwipeReview({ kind, jobs, collectors, onKindChange, onClose, onCommitted }) {
  const [order, setOrder] = useState({ jobs: [], collectors: [] });
  const [hidden, setHidden] = useState(() => new Set());
  const [pending, setPending] = useState([]); // [{ key, kind, item, action, reason, until }], newest last
  const [rejecting, setRejecting] = useState(null); // { kind, item }
  const [notice, setNotice] = useState(null); // { text, tone }
  const [now, setNow] = useState(Date.now());
  const pendingRef = useRef([]);
  const timers = useRef(new Map());
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  const noticeTimer = useRef(null);
  const seq = useRef(0);

  const source = useMemo(() => ({ jobs: jobs || [], collectors: collectors || [] }), [jobs, collectors]);

  // Keep a stable order per deck, so Later (and failed saves) can move a card to the back.
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

  const hide = (k, id) => setHidden((prev) => new Set(prev).add(`${k}:${id}`));
  const show = (k, id) => setHidden((prev) => {
    const s = new Set(prev);
    s.delete(`${k}:${id}`);
    return s;
  });
  const moveTo = (k, id, where) => setOrder((prev) => {
    const rest = prev[k].filter((x) => x !== id);
    return { ...prev, [k]: where === "front" ? [id, ...rest] : [...rest, id] };
  });

  const say = (text, tone = "error") => {
    window.clearTimeout(noticeTimer.current);
    setNotice({ text, tone });
    noticeTimer.current = window.setTimeout(() => setNotice(null), 6000);
  };

  const setPendingList = (list) => {
    pendingRef.current = list;
    setPending(list);
  };
  const removePending = (key) => {
    window.clearTimeout(timers.current.get(key));
    timers.current.delete(key);
    setPendingList(pendingRef.current.filter((p) => p.key !== key));
  };

  // Save one decision. If it fails, the card goes to the BACK of its pile (never
  // in front of the card you're looking at), and a short message says why.
  const commit = useCallback(async (p) => {
    try {
      await saveDecision(p.kind, p.item, p.action, p.reason);
      onCommitted(p.kind, p.item.id, p.action);
    } catch (err) {
      moveTo(p.kind, p.item.id, "back");
      show(p.kind, p.item.id);
      say(`Couldn't save ${labelFor(p.kind, p.item)}: ${errorMessage(err, "please try again.")} It's back at the end of the pile.`);
    }
  }, [onCommitted]);

  const commitNow = (key) => {
    const p = pendingRef.current.find((x) => x.key === key);
    if (!p) return Promise.resolve();
    removePending(key);
    return commit(p);
  };

  const flushAll = useCallback(() => {
    const list = pendingRef.current;
    for (const p of list) window.clearTimeout(timers.current.get(p.key));
    timers.current.clear();
    pendingRef.current = [];
    setPending([]);
    return Promise.all(list.map((p) => commit(p)));
  }, [commit]);

  const startPending = (k, item, action, reason) => {
    hide(k, item.id);
    const key = `p${++seq.current}`;
    const p = { key, kind: k, item, action, reason, until: Date.now() + UNDO_MS };
    setPendingList([...pendingRef.current, p]);
    timers.current.set(key, window.setTimeout(() => commitNow(key), UNDO_MS));
    if (navigator.vibrate) navigator.vibrate(12);
  };

  // Undo the most recent decision: its card comes back to the top.
  const undo = () => {
    const p = pendingRef.current[pendingRef.current.length - 1];
    if (!p) return;
    removePending(p.key);
    if (p.kind !== kind) onKindChange(p.kind);
    moveTo(p.kind, p.item.id, "front");
    show(p.kind, p.item.id);
  };

  // Save anything waiting if the deck is closed or the page is left.
  useEffect(() => () => { flushAll(); window.clearTimeout(noticeTimer.current); }, [flushAll]);
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flushAll(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flushAll]);

  // Countdown for the Undo pill.
  const hasPending = pending.length > 0;
  useEffect(() => {
    if (!hasPending) return undefined;
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(t);
  }, [hasPending]);

  // The page behind doesn't scroll (or bounce) while the deck is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    const prevOb = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overscrollBehavior = prevOb;
    };
  }, []);

  const handleSwiped = (dir, item) => {
    if (!item) return;
    if (dir === "right") {
      startPending(kind, item, "approve", "");
    } else {
      hide(kind, item.id);
      setRejecting({ kind, item });
    }
  };

  const later = () => {
    if (!top || current.length < 2) return;
    moveTo(kind, top.id, "back");
  };

  const close = async () => {
    await flushAll();
    onClose();
  };

  // Arrow keys and Escape on a computer.
  useEffect(() => {
    const onKey = (e) => {
      if (rejecting) {
        if (e.key === "Escape") { show(rejecting.kind, rejecting.item.id); setRejecting(null); }
        return;
      }
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight" && top) cardRef.current?.swipe("right");
      else if (e.key === "ArrowLeft" && top) cardRef.current?.swipe("left");
      else if (e.key === "ArrowDown" && top) later();
      else if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const counts = { jobs: deck("jobs").length, collectors: deck("collectors").length };
  const other = kind === "jobs" ? "collectors" : "jobs";
  const latest = pending[pending.length - 1];
  const secondsLeft = latest ? Math.max(0, Math.ceil((latest.until - now) / 1000)) : 0;
  const progress = latest ? Math.max(0, Math.min(1, (latest.until - now) / UNDO_MS)) : 0;

  return (
    <Portal>
      <div className="fixed inset-0 z-[70] flex flex-col bg-asphalt" style={{ overscrollBehavior: "none" }} role="dialog" aria-modal="true" aria-label="Swipe review">
        {/* Header: close, the Jobs / Collectors switch, and Later. */}
        <div className="shrink-0 px-2 pt-[calc(6px+env(safe-area-inset-top))] pb-1.5 flex items-center gap-1">
          <button ref={closeRef} type="button" onClick={close} aria-label="Close review" className="grid place-items-center h-11 w-11 shrink-0 rounded-full text-white">
            <X className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="grid grid-cols-2 gap-1 rounded-full bg-white/10 p-1" role="tablist" aria-label="What to review">
              {[["jobs", "Jobs"], ["collectors", "Collectors"]].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => onKindChange(k)}
                  className={`min-h-[38px] rounded-full px-3 font-heading font-extrabold text-[14px] inline-flex items-center justify-center gap-1.5 ${kind === k ? "bg-gold text-black" : "text-white"}`}
                >
                  {label}
                  <span className={`text-[12px] ${kind === k ? "text-black/70" : "text-white/60"}`}>{counts[k]}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={later}
            disabled={!top || current.length < 2 || !!rejecting}
            aria-label="Decide later (move to the back)"
            className="h-11 w-11 shrink-0 rounded-full font-heading font-extrabold text-[13px] text-white/80 disabled:opacity-30"
          >
            Later
          </button>
        </div>

        {/* The cards fill the rest of the screen. */}
        <div className="relative flex-1 mx-2 mb-[calc(8px+env(safe-area-inset-bottom))]">
          {top ? (
            <>
              {next && (
                <div className="absolute inset-0 rounded-[24px] bg-white overflow-hidden pointer-events-none" style={{ transform: "translateY(8px) scale(0.96)", opacity: 0.7 }} aria-hidden="true">
                  {kind === "jobs" ? <JobReviewDetails job={next} /> : <CollectorReviewDetails app={next} />}
                </div>
              )}
              <SwipeCard key={`${kind}:${top.id}`} ref={cardRef} item={top} onSwiped={handleSwiped} disabled={!!rejecting}>
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

          {/* Floating messages: they sit over the bottom of the card and never push it around. */}
          {!rejecting && (latest || notice) && (
            <div className="pointer-events-none absolute inset-x-2 bottom-2 z-40 flex flex-col gap-2">
              {notice && (
                <div className="pointer-events-auto rounded-[14px] bg-black px-4 py-2.5 shadow-lg flex items-start gap-3" role="alert">
                  <p className="flex-1 text-[13px] leading-snug text-white">{notice.text}</p>
                  <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="-mr-1 grid place-items-center h-7 w-7 shrink-0 text-white/70">
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              )}
              {latest && (
                <div className="pointer-events-auto relative overflow-hidden rounded-full bg-black pl-4 pr-1 py-1 shadow-lg flex items-center gap-2" role="status">
                  <div className="absolute left-0 bottom-0 h-[3px] bg-gold" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
                  <p className="flex-1 min-w-0 text-[13px] text-white truncate">
                    <span className="font-bold">{latest.action === "approve" ? "Approved" : latest.kind === "jobs" ? "Rejected" : "Not approved"}</span>{" "}
                    {labelFor(latest.kind, latest.item)} · saves in {secondsLeft}s
                    {pending.length > 1 ? ` (+${pending.length - 1})` : ""}
                  </p>
                  <button type="button" onClick={undo} className="min-h-[40px] shrink-0 rounded-full bg-gold px-4 font-heading font-extrabold text-[14px] text-black">
                    Undo
                  </button>
                </div>
              )}
            </div>
          )}

          {rejecting && (
            <RejectSheet
              kind={rejecting.kind}
              item={rejecting.item}
              onCancel={() => { show(rejecting.kind, rejecting.item.id); setRejecting(null); }}
              onConfirm={(reason) => {
                const r = rejecting;
                setRejecting(null);
                startPending(r.kind, r.item, "reject", reason);
              }}
            />
          )}
        </div>
      </div>
    </Portal>
  );
}
