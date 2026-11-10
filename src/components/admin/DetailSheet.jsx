import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Portal from "@/components/Portal";
import { useDialog } from "@/hooks/useDialog";

// Bottom sheet on a phone, side panel on a computer.
export default function DetailSheet({ title, subtitle, onClose, children, headerLeading }) {
  const panelRef = useRef(null);
  useDialog(panelRef, onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div ref={panelRef} tabIndex={-1} className="relative w-full max-w-[480px] md:max-w-[560px] bg-white rounded-t-[28px] md:rounded-none max-h-[92vh] md:max-h-none md:h-full overflow-y-auto focus:outline-none">
          <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 rounded-t-[28px] md:rounded-none">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 grid place-items-center h-11 w-11 rounded-full bg-soft">
              <X className="h-5 w-5 text-black" />
            </button>
            <div className="flex items-center gap-3 pr-12">
              {headerLeading}
              <div className="min-w-0">
                <h2 className="font-heading font-extrabold text-[28px] text-black leading-tight break-words">{title}</h2>
                {subtitle && <p className="mt-1 text-[15px] text-mute">{subtitle}</p>}
              </div>
            </div>
          </div>
          <div className="px-5 pb-6">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
