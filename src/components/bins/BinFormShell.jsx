// Black heading band and a two-column form area on wide screens.
export default function BinFormShell({ title, intro, aside, children }) {
  return (
    <div>
      <section className="bg-black">
        <div className="mx-auto max-w-site px-4 md:px-8 pt-8 pb-9 md:pt-12 md:pb-12">
          <h1 className="font-heading font-extrabold text-white text-[40px] md:text-[52px] leading-[1.05]">{title}</h1>
          <p className="mt-3 max-w-[680px] text-white/70 text-[15px] md:text-[17px] leading-relaxed">{intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:items-start">
        <div className="space-y-4">{children}</div>
        {aside && <aside className="hidden lg:block sticky top-24">{aside}</aside>}
      </div>
    </div>
  );
}

export function RequestSummary({ rows, onEdit }) {
  return (
    <div className="rounded-[20px] bg-white border border-line p-5">
      <h3 className="font-heading font-extrabold text-lg text-black">Your request</h3>
      <div className="mt-1 divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="text-mute text-[13px] shrink-0">{label}</span>
            <span className={`text-[13px] text-right ${value ? "text-black" : "text-mute"}`}>{value || "Not set yet"}</span>
          </div>
        ))}
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="mt-3 inline-flex items-center min-h-[44px] text-black font-bold text-[14px] underline underline-offset-2">
          Change size
        </button>
      )}
      <p className="mt-2 text-[12px] text-mute leading-snug">No asbestos or hazardous waste.</p>
    </div>
  );
}
