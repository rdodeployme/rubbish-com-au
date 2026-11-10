import { useEffect } from "react";
import { getCounts, nextItemId, formatVolume } from "@/lib/loadModel";
import { WHEELIE_SIZES, WHEELIE_FREQUENCIES, getLoadVolume } from "@/lib/binModel";
import WheelieDrawing from "./WheelieDrawing";
import ItemTiles from "@/components/postpickup/ItemTiles";

// Ported from the Base44 app. Same counting rule: whole litres, rounded up.
export default function WheeliePicker({ load, setLoad, binSize, setBinSize, count, setCount, frequency, setFrequency, onGetQuotes }) {
  const { placedItems } = load;
  const volume = getLoadVolume(placedItems);
  const counts = getCounts(placedItems);

  useEffect(() => {
    if (volume > 0) setCount(Math.max(1, Math.min(40, Math.ceil(Math.round(volume * 1000) / binSize))));
  }, [volume, binSize]);

  const addItem = (key) => setLoad({ ...load, placedItems: [...placedItems, { id: nextItemId(), key }] });
  const removeItem = (key) => {
    let lastIdx = -1;
    for (let i = placedItems.length - 1; i >= 0; i--) { if (placedItems[i].key === key) { lastIdx = i; break; } }
    if (lastIdx === -1) return;
    setLoad({ ...load, placedItems: placedItems.filter((_, i) => i !== lastIdx) });
  };

  const freqText = frequency === "One-off" ? "One-off collection" : `Emptied ${frequency.toLowerCase()}`;
  const needed = volume > 0 ? Math.ceil(Math.round(volume * 1000) / binSize) : 0;
  const overLimit = volume > 0 && needed > 40;
  const itemPart = volume > 0
    ? overLimit
      ? ` · about ${formatVolume(volume)} m³ needs more than 40 bins. A skip or pick-up may suit better.`
      : ` · fits about ${formatVolume(volume)} m³`
    : "";

  const pill = (active) => `rounded-full px-4 py-2 inline-flex items-center justify-center min-h-[44px] font-heading font-extrabold text-sm ${active ? "bg-black text-gold" : "border border-black text-black"}`;

  return (
    <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10">
      <div className="rounded-[28px] bg-gold p-5 md:p-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-heading font-extrabold text-[28px] md:text-[40px] text-black leading-tight">Set up your bins</h1>
          <p className="text-[15px] text-black leading-snug">
            Bins supplied and emptied by a local collector. Once, or on a schedule. Add what needs to go and we'll suggest how many.
          </p>
          <div>
            <p className="font-heading font-extrabold text-[44px] text-black leading-none" aria-live="polite">{`${count} × ${binSize} L`}</p>
            <p className="mt-1 font-heading font-extrabold text-sm text-black">{freqText + itemPart}</p>
          </div>
          <WheelieDrawing count={count} binSize={binSize} />
          <div>
            <p className="font-heading font-extrabold text-sm text-black" id="wbp-size">Bin size</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="wbp-size">
              {WHEELIE_SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setBinSize(s)} aria-pressed={binSize === s} className={pill(binSize === s)}>{`${s} L`}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-heading font-extrabold text-sm text-black">How many</p>
            <div className="mt-2 inline-flex items-center gap-0.5 rounded-full bg-black px-1 py-1">
              <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="Fewer bins" className="grid place-items-center h-11 w-11 rounded-full text-gold font-bold text-lg leading-none">&minus;</button>
              <span className="min-w-[40px] text-center font-heading font-extrabold text-base text-white">{count}</span>
              <button type="button" onClick={() => setCount((c) => Math.min(40, c + 1))} aria-label="More bins" className="grid place-items-center h-11 w-11 rounded-full text-gold font-bold text-lg leading-none">+</button>
            </div>
          </div>
          <div>
            <p className="font-heading font-extrabold text-sm text-black" id="wbp-freq">How often</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="wbp-freq">
              {WHEELIE_FREQUENCIES.map((f) => (
                <button key={f} type="button" onClick={() => setFrequency(f)} aria-pressed={frequency === f} className={pill(frequency === f)}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 space-y-4">
          <h2 className="font-heading font-extrabold text-lg text-black hidden lg:block">What needs to go?</h2>
          <ItemTiles counts={counts} onAdd={addItem} onRemove={removeItem} />
          <p className="text-[14px] text-black/70 leading-snug">General waste, recycling, green waste or cardboard. Pick streams in the next step.</p>
          <button type="button" onClick={onGetQuotes} className="w-full rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[52px]">
            Get wheelie bin quotes
          </button>
        </div>
      </div>
    </div>
  );
}
