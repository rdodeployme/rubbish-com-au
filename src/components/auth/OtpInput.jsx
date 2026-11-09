import { useRef } from "react";

// Six boxes for the email code. Paste fills all six.
export default function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const setAt = (i, d) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, 6));
  };

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          autoFocus={i === 0}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) { setAt(i, ""); return; }
            if (v.length > 1) {
              onChange((value.slice(0, i) + v).slice(0, 6));
              refs.current[Math.min(i + v.length, 5)]?.focus();
              return;
            }
            setAt(i, v);
            if (i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (v) { e.preventDefault(); onChange(v); refs.current[Math.min(v.length, 5)]?.focus(); }
          }}
          className="h-12 w-11 rounded-[12px] border-[1.5px] border-line text-center text-lg font-heading font-extrabold text-black focus:outline-none focus:border-black"
        />
      ))}
    </div>
  );
}
