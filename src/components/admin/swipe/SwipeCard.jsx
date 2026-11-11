import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// A full-height card you drag left or right, Tinder style.
// Up and down is left to the browser, so the card scrolls normally to show every detail.
// Only a clearly sideways drag moves the card.
const SwipeCard = forwardRef(function SwipeCard({ children, onSwiped, disabled }, ref) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(0); // -1 left, 1 right, 0 staying
  const drag = useRef(null);
  const justDragged = useRef(false);
  const elRef = useRef(null);

  const width = () => (typeof window !== "undefined" ? window.innerWidth : 400);

  const flyOut = (dir) => {
    setLeaving(dir);
    setDragging(false);
    setDx(dir * width() * 1.4);
    window.setTimeout(() => onSwiped(dir === 1 ? "right" : "left"), 220);
  };

  useImperativeHandle(ref, () => ({ swipe: (dir) => flyOut(dir === "right" ? 1 : -1) }));

  const onPointerDown = (e) => {
    if (disabled || leaving) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), lock: null, lastX: e.clientX, lastT: Date.now() };
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
      d.lastX = e.clientX;
      d.lastT = Date.now();
      setDx(mx);
    }
  };

  const end = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.lock !== "x") return;
    // A drag ends with a click on whatever is under the finger; don't let it open a photo or link.
    window.setTimeout(() => { justDragged.current = false; }, 50);
    const mx = e.clientX - d.x;
    const dt = Math.max(1, Date.now() - d.t);
    const velocity = mx / dt; // px per ms
    const threshold = Math.min(130, width() * 0.28);
    if (Math.abs(mx) > threshold || Math.abs(velocity) > 0.7) {
      flyOut(mx > 0 ? 1 : -1);
    } else {
      setDragging(false);
      setDx(0);
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
      onPointerUp={end}
      onPointerCancel={end}
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
