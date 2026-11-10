// Plain form controls used by the bin request forms. Labels are always tied to their inputs,
// and an error is tied to its input with aria-describedby (the error summary announces them).
export const fieldInput =
  "mt-2 w-full h-[52px] rounded-[14px] bg-white border-[1.5px] border-line px-3 text-[15px] text-black focus:outline-none focus:border-black";

export function errorProps(id, error) {
  return error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return <p id={id ? `${id}-error` : undefined} className="mt-1 text-[13px] text-danger font-bold">{children}</p>;
}

const SELECT_STYLE = {
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' stroke='%231B1B1B' stroke-width='2' fill='none'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

export function SelectField({ id, label, value, onChange, options, error, refCb }) {
  return (
    <div ref={refCb}>
      <label htmlFor={id} className="font-heading font-extrabold text-[15px] text-black">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldInput} font-bold appearance-none pr-10`} style={SELECT_STYLE} {...errorProps(id, error)}>
        {options.map((o) => {
          const v = typeof o === "object" ? o.value : o;
          const l = typeof o === "object" ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

export function TextField({ id, label, hint, error, refCb, ...props }) {
  return (
    <div ref={refCb}>
      <label htmlFor={id} className="font-heading font-extrabold text-[15px] text-black">{label}</label>
      <input id={id} className={fieldInput} {...props} {...errorProps(id, error)} />
      {hint && !error && <p className="mt-1 text-[12px] text-mute">{hint}</p>}
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

export function HazardCheck({ id, checked, onChange, error, refCb, children }) {
  return (
    <div ref={refCb}>
      <label className="flex items-start gap-3 cursor-pointer min-h-[44px] py-1">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-black" {...errorProps(id, error)} />
        <span className="text-[14px] text-black leading-snug">{children}</span>
      </label>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}
