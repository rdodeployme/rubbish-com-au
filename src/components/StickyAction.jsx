// Phone-only bar pinned to the bottom of the screen: the live total and the next step,
// so the customer can see the result while tapping items further down the page.
export default function StickyAction({ summary, detail, buttonLabel, onClick }) {
  return (
    <>
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-black px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
        <div className="mx-auto max-w-site flex items-center gap-3">
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="font-heading font-extrabold text-gold text-[20px] leading-none">{summary}</p>
            {detail && <p className="mt-1 text-white/75 text-[12px] leading-tight truncate">{detail}</p>}
          </div>
          <button type="button" onClick={onClick} className="shrink-0 rounded-full bg-gold text-black px-5 min-h-[48px] font-heading font-extrabold text-sm">
            {buttonLabel}
          </button>
        </div>
      </div>
    </>
  );
}
