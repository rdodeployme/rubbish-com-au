import { VEHICLES, ITEM_BY_KEY, formatVolume } from "@/lib/loadModel";
import Portal from "@/components/Portal";

// prompt = { trigger: 'item' | 'switch', currentVehicle, targetVehicle, tappedItem, N }
function buildContent(prompt) {
  const { trigger, currentVehicle, targetVehicle, tappedItem, N } = prompt;
  const wontFit = trigger === "item" ? currentVehicle : targetVehicle;
  const wontFitName = wontFit === "ute" ? "ute" : "trailer";
  const wontFitCap = VEHICLES[wontFit].capacity;
  const wasOnTruckSwitchingDown = trigger === "switch" && currentVehicle === "truck";

  const heading = trigger === "item" ? `That won't fit in a ${wontFitName}` : `Too much for a ${wontFitName}`;
  const capacityLine = `A ${wontFitName} carries about ${formatVolume(wontFitCap)} m³.`;
  let middleLine;
  if (trigger === "item") {
    const itemName = ITEM_BY_KEY[tappedItem].name.toLowerCase();
    middleLine = `Adding the ${itemName} takes your load to about ${formatVolume(N)} m³,`;
  } else {
    middleLine = `Your load is about ${formatVolume(N)} m³,`;
  }
  let ending;
  if (wasOnTruckSwitchingDown) ending = "so it needs the truck.";
  else if (wontFit === "ute") ending = VEHICLES.trailer.capacity >= N ? "so you'll need a trailer or a truck." : "so you'll need a truck.";
  else ending = "so you'll need a truck.";

  const text = `${capacityLine} ${middleLine} ${ending}`;
  const trailerFits = VEHICLES.trailer.capacity >= N;
  const buttons = [];
  if (trailerFits) buttons.push({ label: "Use a trailer", variant: "black", action: "trailer" });
  if (currentVehicle !== "truck") {
    buttons.push({ label: "Switch to a truck", variant: trailerFits ? "outline" : "black", action: "truck" });
  }
  const keepLabel = trigger === "item" ? `Keep my ${wontFitName} load` : `Keep the ${VEHICLES[currentVehicle].name.toLowerCase()}`;
  buttons.push({ label: keepLabel, variant: "outline", action: "keep" });
  return { heading, text, buttons };
}

export default function WontFitPrompt({ prompt, onAction }) {
  if (!prompt) return null;
  const { heading, text, buttons } = buildContent(prompt);
  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="wontfit-title">
      <div className="w-full max-w-[380px] rounded-[28px] bg-white p-6 relative shadow-xl">
        <button type="button" onClick={() => onAction("keep")} aria-label="Close" className="absolute top-3 right-3 grid place-items-center h-11 w-11 text-black">
          <span className="text-2xl leading-none">&times;</span>
        </button>
        <div className="mt-2">
          <span className="inline-block rounded-full bg-gold px-3 py-1.5 font-heading font-extrabold text-xs text-black">
            Load is about {formatVolume(prompt.N)} {"m³"}
          </span>
        </div>
        <h3 id="wontfit-title" className="mt-4 font-heading font-extrabold text-[24px] text-black leading-tight">{heading}</h3>
        <p className="mt-2 text-[15px] text-black leading-snug">{text}</p>
        <div className="mt-5 space-y-2.5">
          {buttons.map((b) => (
            <button
              key={b.action}
              type="button"
              onClick={() => onAction(b.action)}
              className={`w-full rounded-full py-3 font-heading font-extrabold text-sm min-h-[48px] ${
                b.variant === "black" ? "bg-black text-white" : "bg-white border border-black text-black"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    </Portal>
  );
}
