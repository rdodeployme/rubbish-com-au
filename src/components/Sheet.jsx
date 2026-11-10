import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Portal from "@/components/Portal";
import { useDialog } from "@/hooks/useDialog";

function readScroll(key) {
  try { return Number(sessionStorage.getItem("rubbish_sheet_" + key)) || 0; } catch { return 0; }
}
function saveScroll(key, y) {
  try { sessionStorage.setItem("rubbish_sheet_" + key, String(Math.round(y))); } catch { /* ignore */ }
}

// Bottom sheet on phones, centred panel on wider screens.
// scrollKey: remembers how far down the sheet was, so coming Back to it lands in the same place.
export function DetailSheet({ title, subtitle, onClose, children, headerLeading, wide = false, scrollKey }) {
  const panelRef = useRef(null);
  useDialog(panelRef, onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Content (quotes) loads after the sheet opens, so keep trying for a moment.
  useEffect(() => {
    if (!scrollKey) return undefined;
    const target = readScroll(scrollKey);
    const el = panelRef.current;
    if (!target || !el) return undefined;
    let tries = 0;
    let stopped = false;
    const stop = () => { stopped = true; };
    el.addEventListener("touchstart", stop, { passive: true, once: true });
    el.addEventListener("wheel", stop, { passive: true, once: true });
    const tick = () => {
      if (stopped || !panelRef.current) return;
      if (el.scrollHeight - el.clientHeight >= target) { el.scrollTop = target; return; }
      if (++tries < 40) setTimeout(tick, 75);
    };
    tick();
    return () => { stopped = true; };
  }, [scrollKey]);

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        onScroll={scrollKey ? (e) => saveScroll(scrollKey, e.currentTarget.scrollTop) : undefined}
        className={`relative w-full ${wide ? "md:max-w-[760px]" : "md:max-w-[560px]"} bg-white rounded-t-[28px] md:rounded-[28px] max-h-[92vh] overflow-y-auto focus:outline-none`}
      >
        <div className="sticky top-0 bg-white z-10 px-5 md:px-7 pt-4 md:pt-6 pb-3 rounded-t-[28px]">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 md:top-4 md:right-4 grid place-items-center h-11 w-11 rounded-full bg-soft hover:bg-line">
            <X className="h-5 w-5 text-black" />
          </button>
          <div className="flex items-center gap-3 pr-12">
            {headerLeading}
            <div className="min-w-0">
              <h2 className="font-heading font-extrabold text-[26px] md:text-[28px] text-black leading-tight">{title}</h2>
              {subtitle && <p className="mt-1 text-[15px] text-mute">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="px-5 md:px-7 pb-6 md:pb-8">{children}</div>
      </div>
    </div>
    </Portal>
  );
}

export function SheetField({ label, value }) {
  const display = value != null && value !== "" ? String(value) : "Not provided";
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      <p className="text-black text-[14px] whitespace-pre-line break-words">{display}</p>
    </div>
  );
}

export function SheetSection({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="font-heading font-extrabold text-[16px] text-black">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}
