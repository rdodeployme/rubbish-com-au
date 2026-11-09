import { useEffect } from "react";
import { X } from "lucide-react";

// Bottom sheet on phones, centred panel on wider screens.
export function DetailSheet({ title, subtitle, onClose, children, headerLeading, wide = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${wide ? "md:max-w-[760px]" : "md:max-w-[560px]"} bg-white rounded-t-[28px] md:rounded-[28px] max-h-[92vh] overflow-y-auto`}>
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
  );
}

export function SheetField({ label, value }) {
  const display = value != null && value !== "" ? String(value) : "Not provided";
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      <p className="text-black text-[14px] whitespace-pre-line">{display}</p>
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
