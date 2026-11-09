import { ITEMS } from "@/lib/loadModel";

export default function ItemTiles({ counts, onAdd, onRemove }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ITEMS.map((item) => {
        const c = counts[item.key] || 0;
        const active = c > 0;
        return (
          <div
            key={item.key}
            className="rounded-xl p-3 flex flex-col"
            style={{ backgroundColor: active ? "#ffffff" : "rgba(255,255,255,0.55)" }}
          >
            <div className="flex flex-col gap-2 flex-1 justify-between">
              <div className="w-full">
                <p className="font-heading font-extrabold text-[13.5px] text-black leading-tight">{item.name}</p>
                {item.sub && <p className="text-[11px] text-black/60 leading-tight">{item.sub}</p>}
              </div>
              <div className="flex items-center justify-between h-11 w-full rounded-full bg-black">
                <button
                  type="button"
                  onClick={() => onRemove(item.key)}
                  aria-label={`Remove ${item.name}`}
                  className="grid place-items-center h-11 w-11 text-gold font-bold text-lg leading-none"
                >
                  &minus;
                </button>
                <span className="font-heading font-extrabold text-sm text-white" aria-live="polite">{c}</span>
                <button
                  type="button"
                  onClick={() => onAdd(item.key)}
                  aria-label={`Add ${item.name}`}
                  className="grid place-items-center h-11 w-11 text-gold font-bold text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
