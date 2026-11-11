import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// A full-height card you drag left or right, Tinder style.
// Up and down is left to the browser, so the card scrolls normally to show every detail.
// Only a clearly sideways drag moves the card.
const SwipeCard = forwardRef(function SwipeCard({ children, item, onSwiped, disabled }, ref) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(0); // -1 left, 1 right, 0 staying
  const drag = useRef(null);
  const justDragged = useRef(false);
  const elRef = useRef(null);
  const gone = useRef(false); // a card can only be thrown once

  const width = () => (typeof window !== "undefined" ? window.innerWidth : 400);

  const flyOut = (dir) => {
    if (gone.current) return;
    gone.current = true;
    drag.current = null;
    setLeaving(dir);
    setDragging(false);
    setDx(dir * width() * 1.4);
    // Hand back the card that was thrown, not whatever happens to be on top by then.
    window.setTimeout(() => onSwiped(dir === 1 ? "right" : "left", item), 200);
  };

  const snapBack = () => {
    setDragging(false);
    setDx(0);
  };

  useImperativeHandle(ref, () => ({ swipe: (dir) => { if (!disabled) flyOut(dir === "right" ? 1 : -1); } }));

  const onPointerDown = (e) => {
    if (disabled || gone.current) return;
    if (drag.current && drag.current.lock === "x") return; // a second finger while dragging
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), lock: null, lastX: e.clientX, lastT: Date.now(), prevX: e.clientX, prevT: Date.now() };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.lock) {
      if (Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.3) {
        d.lock = "x";
        setDragging(true);
        try { elRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      } else if (Math.abs(my) > 12) {
        d.lock = "y";
      }
    }
    if (d.lock === "x") {
      justDragged.current = true;
      d.prevX = d.lastX;
      d.prevT = d.lastT;
      d.lastX = e.clientX;
      d.lastT = Date.now();
      setDx(mx);
    }
  };

  const end = (e, cancelled) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.lock !== "x") return;
    // A drag ends with a click on whatever is under the finger; don't let it open a photo or link.
    window.setTimeout(() => { justDragged.current = false; }, 50);
    // Interrupted (a call, a notification, the browser took over): put it back, decide nothing.
    if (cancelled) { snapBack(); return; }
    const mx = (e.clientX || d.lastX) - d.x;
    // Speed over the last moment of the drag, not the whole drag.
    const recent = Math.max(1, Date.now() - d.prevT);
    const velocity = (d.lastX - d.prevX) / recent; // px per ms
    const threshold = Math.min(120, width() * 0.3);
    const flick = Math.abs(mx) > 70 && Math.abs(velocity) > 0.6 && Math.sign(velocity) === Math.sign(mx);
    if (Math.abs(mx) > threshold || flick) {
      flyOut(mx > 0 ? 1 : -1);
    } else {
      snapBack();
    }
  };

  const rotate = Math.max(-18, Math.min(18, dx / 18));
  const approveOpacity = Math.max(0, Math.min(1, dx / 110));
  const rejectOpacity = Math.max(0, Math.min(1, -dx / 110));

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => end(e, false)}
      onPointerCancel={(e) => end(e, true)}
      onClickCapture={(e) => {
        if (justDragged.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="absolute inset-0 rounded-[24px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden select-none"
      style={{
        transform: `translateX(${dx}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : "transform 0.22s ease-out",
        touchAction: "pan-y",
        overscrollBehavior: "none",
        pointerEvents: leaving ? "none" : undefined,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-6 z-20 rounded-[10px] border-[4px] border-gold bg-black px-3 py-1 font-heading font-extrabold text-[28px] tracking-wide text-gold"
        style={{ opacity: approveOpacity, transform: "rotate(-14deg)" }}
      >
        APPROVE
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-6 z-20 rounded-[10px] border-[4px] border-black bg-white px-3 py-1 font-heading font-extrabold text-[28px] tracking-wide text-black"
        style={{ opacity: rejectOpacity, transform: "rotate(14deg)" }}
      >
        REJECT
      </div>
      <div className="h-full overflow-y-auto overscroll-contain" style={{ touchAction: "pan-y" }}>
        {children}
      </div>
    </div>
  );
});

export default SwipeCard;
