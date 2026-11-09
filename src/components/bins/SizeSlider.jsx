import { useRef } from "react";

// Copied from the Base44 app. One step per size; arrow keys also move it.
export default function SizeSlider({ sizes, value, onChange, label = "Bin size in cubic metres" }) {
  const trackRef = useRef(null);
  const n = sizes.length;
  const idx = Math.max(0, sizes.findIndex((s) => s.size === value));
  const pct = n > 1 ? (idx / (n - 1)) * 100 : 0;

  const setFromX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const i = Math.round(x * (n - 1));
    onChange(sizes[Math.max(0, Math.min(n - 1, i))].size);
  };

  return (
    <div>
      <div
        className="py-4 -my-4 cursor-pointer touch-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromX(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons === 1) setFromX(e.clientX); }}
      >
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={sizes[0].size}
          aria-valuemax={sizes[n - 1].size}
          aria-valuenow={value}
          aria-valuetext={`${value} cubic metres`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(sizes[Math.min(n - 1, idx + 1)].size); }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(sizes[Math.max(0, idx - 1)].size); }
          }}
          className="relative h-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-gold"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          <div className="absolute h-2.5 rounded-full bg-black" style={{ width: `${pct}%` }} />
          <div className="absolute top-1/2 w-5 h-5 bg-black rounded-full" style={{ left: `${pct}%`, transform: "translate(-50%, -50%)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <div className="flex justify-between mt-0">
        {sizes.map((s) => (
          <button
            key={s.size}
            type="button"
            onClick={() => onChange(s.size)}
            aria-label={`${s.size} cubic metres`}
            className={`inline-flex items-center justify-center min-h-[44px] min-w-[32px] text-[14px] font-heading font-extrabold ${s.size === value ? "text-black" : "text-black/45"}`}
          >
            {s.size}
          </button>
        ))}
      </div>
    </div>
  );
}
