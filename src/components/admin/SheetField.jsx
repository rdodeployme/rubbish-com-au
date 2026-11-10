export function SheetField({ label, value }) {
  const display = value != null && value !== "" ? String(value) : "Not provided";
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      <p className="text-black text-[14px] whitespace-pre-line break-words">{display}</p>
    </div>
  );
}

export function SheetLink({ label, href, value }) {
  const display = value || "Not provided";
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      {href && value ? (
        <a href={href} className="inline-flex items-center min-h-[44px] text-black text-[14px] underline underline-offset-2 break-all">
          {display}
        </a>
      ) : (
        <p className="text-black text-[14px]">{display}</p>
      )}
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
