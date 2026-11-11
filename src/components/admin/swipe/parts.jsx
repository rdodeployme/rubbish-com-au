// Small layout pieces shared by the job and collector review cards.
export function Section({ title, children }) {
  return (
    <section className="px-5 py-4 border-t border-line">
      <h3 className="font-heading font-extrabold text-[13px] uppercase tracking-[0.12em] text-mute">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function Row({ label, value, warn, children }) {
  const shown = children ?? value;
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-mute text-[14px] shrink-0">{label}</span>
      <span className={`text-right text-[15px] break-words min-w-0 ${warn ? "font-bold text-danger" : "text-black"}`}>
        {shown === "" || shown == null ? <span className="text-mute">Not given</span> : shown}
      </span>
    </div>
  );
}

export function Chips({ items }) {
  if (!Array.isArray(items) || items.length === 0) return <p className="text-mute text-[14px]">None</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((m) => (
        <span key={m} className="rounded-full bg-soft px-3 py-1 text-[13px] text-black">{m}</span>
      ))}
    </div>
  );
}

export function Flag({ children }) {
  return <p className="mx-5 mt-3 rounded-[12px] bg-black px-3 py-2 text-[14px] font-bold text-white">{children}</p>;
}
