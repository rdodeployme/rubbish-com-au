import { useState } from "react";
import {
  VEHICLES, VEHICLE_ORDER, ITEM_BY_KEY, getCounts, getVolume, formatVolume, readoutText, nextItemId,
} from "@/lib/loadModel";
import VehicleStage from "./VehicleStage";
import ItemTiles from "./ItemTiles";
import WontFitPrompt from "./WontFitPrompt";

const TOL = 1e-6;

// Ported from the Base44 app. Same rules; on wide screens the vehicle sits beside the item tiles.
export default function LoadEstimator({ load, setLoad, onDone }) {
  const { placedItems, vehicle } = load;
  const [justAddedId, setJustAddedId] = useState(null);
  const [prompt, setPrompt] = useState(null);

  const counts = getCounts(placedItems);
  const volume = getVolume(placedItems);
  const v = VEHICLES[vehicle];

  const switchVehicle = (target) => {
    if (getVolume(placedItems) > VEHICLES[target].capacity + TOL) {
      setPrompt({ trigger: "switch", currentVehicle: vehicle, targetVehicle: target, tappedItem: null, N: volume });
      return;
    }
    setLoad({ ...load, vehicle: target });
  };

  const addItem = (key) => {
    const item = ITEM_BY_KEY[key];
    const newVol = volume + item.volume;
    if (newVol > v.capacity + TOL) {
      setPrompt({ trigger: "item", currentVehicle: vehicle, targetVehicle: null, tappedItem: key, N: newVol });
      return;
    }
    const id = nextItemId();
    setLoad({ ...load, placedItems: [...placedItems, { id, key }] });
    setJustAddedId(id);
  };

  const removeItem = (key) => {
    let lastIdx = -1;
    for (let i = placedItems.length - 1; i >= 0; i--) {
      if (placedItems[i].key === key) { lastIdx = i; break; }
    }
    if (lastIdx === -1) return;
    setLoad({ ...load, placedItems: placedItems.filter((_, i) => i !== lastIdx) });
  };

  const clearAll = () => {
    setLoad({ ...load, placedItems: [] });
    setJustAddedId(null);
  };

  const handlePromptAction = (action) => {
    if (action === "keep") { setPrompt(null); return; }
    let newPlaced = placedItems;
    let newJustAdded = null;
    if (prompt.tappedItem) {
      const id = nextItemId();
      newPlaced = [...placedItems, { id, key: prompt.tappedItem }];
      newJustAdded = id;
    }
    setLoad({ ...load, vehicle: action, placedItems: newPlaced });
    if (newJustAdded) setJustAddedId(newJustAdded);
    setPrompt(null);
  };

  return (
    <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10">
      <div className="rounded-[28px] bg-gold p-5 md:p-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-heading font-extrabold text-[28px] md:text-[36px] text-black leading-tight">
              Load the {v.name.toLowerCase()}
            </h2>
            <div className="inline-flex rounded-full p-1 bg-black/10" role="group" aria-label="Vehicle">
              {VEHICLE_ORDER.map((vk) => (
                <button
                  key={vk}
                  type="button"
                  onClick={() => switchVehicle(vk)}
                  aria-pressed={vehicle === vk}
                  className={`rounded-full px-4 py-1.5 inline-flex items-center justify-center min-h-[44px] font-heading font-extrabold text-sm ${
                    vehicle === vk ? "bg-black text-gold" : "text-black"
                  }`}
                >
                  {VEHICLES[vk].name}
                </button>
              ))}
            </div>
            <p className="text-[15px] text-black leading-snug max-w-[560px]">
              Add what needs to go. Customers use this to understand volumes; collectors use it to give the
              best quote. The closer it is, the better the price.
            </p>
            <div>
              <p className="font-heading font-extrabold text-[44px] text-black leading-none">
                {formatVolume(volume)} {"m³"}
              </p>
              <p className="mt-1 font-heading font-extrabold text-sm text-black">{readoutText(vehicle, volume)}</p>
            </div>
            <VehicleStage placedItems={placedItems} vehicle={vehicle} justAddedId={justAddedId} />
          </div>

          <div className="mt-4 lg:mt-0 space-y-4">
            <ItemTiles counts={counts} onAdd={addItem} onRemove={removeItem} />
            <p className="text-[12px] text-black/70 leading-snug">
              *Disclaimer: sizes are estimates, as items of similar description can
              vary in size. This is designed as a guide to assist customers and
              collectors. You can add photos on the form if required.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-black px-5 py-3 font-heading font-extrabold text-sm text-black min-h-[48px]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onDone}
                className="flex-1 rounded-full bg-black text-white px-5 py-3 font-heading font-extrabold text-sm min-h-[48px]"
              >
                {volume > 0 ? "Use this load" : "Back to the form"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <WontFitPrompt prompt={prompt} onAction={handlePromptAction} />
    </div>
  );
}
