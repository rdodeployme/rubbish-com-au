import { useEffect, useMemo } from "react";
import { getCounts, nextItemId, formatVolume } from "@/lib/loadModel";
import { SKIP_BINS, HOOK_BINS, getLoadVolume, suggestSize, mostPopularSize, buildExampleLoad, buildFitsAbout } from "@/lib/binModel";
import BinDrawing from "./BinDrawing";
import SizeSlider from "./SizeSlider";
import ItemTiles from "@/components/postpickup/ItemTiles";

// Ported from the Base44 app. On wide screens the bin sits beside the controls.
export default function SkipPicker({ load, setLoad, binType, setBinType, size, setSize, onGetQuotes }) {
  const { placedItems } = load;
  const volume = getLoadVolume(placedItems);
  const counts = getCounts(placedItems);
  const sizes = binType === "skip" ? SKIP_BINS : HOOK_BINS;
  const kind = binType;

  useEffect(() => {
    if (volume > 0) setSize(suggestSize(sizes, volume));
    else setSize(mostPopularSize(sizes));
  }, [volume, binType]);

  const addItem = (key) => setLoad({ ...load, placedItems: [...placedItems, { id: nextItemId(), key }] });
  const removeItem = (key) => {
    let lastIdx = -1;
    for (let i = placedItems.length - 1; i >= 0; i--) { if (placedItems[i].key === key) { lastIdx = i; break; } }
    if (lastIdx === -1) return;
    setLoad({ ...load, placedItems: placedItems.filter((_, i) => i !== lastIdx) });
  };

  const selectedBin = sizes.find((s) => s.size === size) || sizes[0];
  const binForDrawing = { ...selectedBin, kind };
  const percent = size > 0 ? Math.round((volume / size) * 100) : 0;
  const readoutSmall = volume > 0
    ? `Your items: about ${formatVolume(volume)} m³ (${percent}% full)`
    : `${kind === "skip" ? "Skip bin" : "Hook bin"}${selectedBin.popular ? ", most popular" : ""}`;
  const biggest = sizes[sizes.length - 1].size;
  const hint = volume > biggest
    ? kind === "skip"
      ? "More than the biggest skip (12 m³). Try a hook bin, or two skips."
      : "More than the biggest hook bin (30 m³). Collectors may quote for two bins."
    : selectedBin.note;

  const exampleItems = useMemo(() => (placedItems.length > 0 ? null : buildExampleLoad(binForDrawing)), [placedItems.length, size, binType]);
  const fitsList = useMemo(() => (exampleItems ? buildFitsAbout(exampleItems) : ""), [exampleItems]);
  const pxPerM = kind === "hook" ? 98 : 140;

  const toggle = (val, label) => (
    <button
      type="button"
      onClick={() => setBinType(val)}
      aria-pressed={binType === val}
      className={`rounded-full px-4 py-1.5 inline-flex items-center justify-center min-h-[44px] font-heading font-extrabold text-sm ${binType === val ? "bg-black text-gold" : "text-black"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10">
      <div className="rounded-[28px] bg-gold p-5 md:p-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-heading font-extrabold text-[28px] md:text-[40px] text-black leading-tight">Pick a bin size</h1>
          <p className="text-[15px] text-black leading-snug">
            Add what needs to go and we'll suggest the size, or pick one yourself. Collectors will check access when they quote.
          </p>
          <div className="inline-flex rounded-full p-1 bg-black/10" role="group" aria-label="Bin type">
            {toggle("skip", "Skip bin")}
            {toggle("hook", "Hook bin")}
          </div>
          <div>
            <p className="font-heading font-extrabold text-[44px] text-black leading-none" aria-live="polite">{`${size} m³`}</p>
            <p className="mt-1 font-heading font-extrabold text-sm text-black">{readoutSmall}</p>
          </div>
          <BinDrawing bin={binForDrawing} placedItems={placedItems} pxPerM={pxPerM} />
          <p className="text-center text-[15px] text-black leading-snug">
            {placedItems.length > 0
              ? `Your items in a ${size} m³ ${kind === "skip" ? "skip" : "hook bin"}${volume > size ? " (some won't fit)" : ""}.`
              : <><span className="font-bold">Fits about:</span> {fitsList}.</>}
          </p>
          <SizeSlider sizes={sizes} value={size} onChange={setSize} />
          <div className="flex flex-wrap gap-2 items-center">
            <span className="rounded-full px-3 py-1.5 text-[13px] font-heading font-extrabold text-black" style={{ backgroundColor: "rgba(255,255,255,0.45)" }}>Good for</span>
            {selectedBin.goodFor.map((g) => (
              <span key={g} className="rounded-full bg-black text-gold px-3 py-1.5 text-[13px] font-heading font-extrabold">{g}</span>
            ))}
          </div>
        </div>
        <div className="mt-4 lg:mt-0 space-y-4">
          <h2 className="font-heading font-extrabold text-lg text-black hidden lg:block">What needs to go?</h2>
          <ItemTiles counts={counts} onAdd={addItem} onRemove={removeItem} />
          <p className="text-[14px] text-black/70 leading-snug">{hint}</p>
          <button type="button" onClick={onGetQuotes} className="w-full rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[52px]">
            {`Get ${kind === "skip" ? "skip" : "hook"} bin quotes`}
          </button>
        </div>
      </div>
    </div>
  );
}
