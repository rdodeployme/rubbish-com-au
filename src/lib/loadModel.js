import { useEffect, useMemo, useState } from "react";

// Copied from the Base44 app (src/lib/loadModel.js). Keep in step with it.
// PROVISIONAL. Ute and trailer capacities are to be confirmed by Richard (ref RB-07).
export const VEHICLES = {
  ute: {
    name: "Ute",
    capacity: 1.5,
    // load box: left, top, right, bottom (design units in a 1288 x 610 stage)
    loadBox: [50, 60, 638, 374],
    pxPerM: 245,
    bubble: [344, 170],
    overlayWidth: 1,
    image:
      "https://media.base44.com/images/public/6ad626d1014ee1424d4deeff/ae8df8046_vehicle-ute.png",
    overlay:
      "https://media.base44.com/images/public/6ad626d1014ee1424d4deeff/377b969d3_vehicle-ute-overlay.png",
  },
  trailer: {
    name: "Trailer",
    capacity: 3,
    loadBox: [52, 62, 948, 370],
    pxPerM: 367,
    bubble: [500, 165],
    overlayWidth: 1,
    image:
      "https://media.base44.com/images/public/6ad626d1014ee1424d4deeff/eff1bd1bc_vehicle-trailer.png",
    overlay:
      "https://media.base44.com/images/public/6ad626d1014ee1424d4deeff/ca478a2c2_vehicle-trailer-overlay.png",
  },
  truck: {
    name: "Truck",
    capacity: 20,
    loadBox: [42, 36, 893, 399],
    pxPerM: 152,
    bubble: [468, 215],
    overlayWidth: 930 / 1288,
    image:
      "https://media.base44.com/images/public/6ad626d1014ee1424d4deeff/bdf4ff73f_vehicle-box-truck.png",
    overlay:
      "https://rdodeployme.github.io/rubbish-com-prototype/t-boxframe.webp",
  },
};

export const VEHICLE_ORDER = ["ute", "trailer", "truck"];

export const ITEMS = [
  { key: "couch", name: "Couch", sub: "3-seater", volume: 1.5, heightM: 0.85, ratio: 1.649, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-couch.webp" },
  { key: "armchair", name: "Armchair", sub: "", volume: 0.6, heightM: 0.95, ratio: 1.041, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-chair.webp" },
  { key: "mattress", name: "Mattress", sub: "Queen", volume: 0.6, heightM: 0.28, ratio: 5.614, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-mattress.webp" },
  { key: "bed-base", name: "Bed base", sub: "", volume: 0.6, heightM: 0.45, ratio: 4.051, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-bed.webp" },
  { key: "fridge", name: "Fridge", sub: "", volume: 0.8, heightM: 1.7, ratio: 0.442, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-fridge.webp" },
  { key: "washer", name: "Washer", sub: "or dryer", volume: 0.4, heightM: 0.85, ratio: 0.736, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-washer.webp" },
  { key: "wardrobe", name: "Wardrobe", sub: "", volume: 1.2, heightM: 1.8, ratio: 0.619, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-wardrobe.webp" },
  { key: "table", name: "Table", sub: "", volume: 0.6, heightM: 0.78, ratio: 2.55, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-table.webp" },
  { key: "tv", name: "TV", sub: "", volume: 0.15, heightM: 0.75, ratio: 1.407, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-tv.webp" },
  { key: "boxes", name: "Boxes", sub: "5 boxes", volume: 0.3, heightM: 0.9, ratio: 0.716, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-boxes.webp" },
  { key: "rubbish-bags", name: "Rubbish bags", sub: "5 bags", volume: 0.4, heightM: 0.7, ratio: 1.212, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-bags.webp" },
  { key: "green-waste", name: "Green waste", sub: "1 m³ pile", volume: 1.0, heightM: 0.8, ratio: 1.441, image: "https://rdodeployme.github.io/rubbish-com-prototype/t-green.webp" },
];

export const ITEM_BY_KEY = Object.fromEntries(ITEMS.map((i) => [i.key, i]));

export const TIME_WINDOWS = [
  { value: "5am – 8am", label: "Early" },
  { value: "8am – 12pm", label: "Morning" },
  { value: "1pm – 3pm", label: "Early arvo" },
  { value: "3pm – 5pm", label: "Late arvo" },
];

export const MATERIAL_OPTIONS = [
  "General",
  "Cardboard",
  "Polystyrene",
  "Mattresses",
  "Green waste",
  "E-waste",
  "Metal",
];

export const SIZE_OPTIONS = [
  { value: "A few items", sub: "1–5 things" },
  { value: "Quarter load", sub: "Car boot or more" },
  { value: "Half load", sub: "A room full" },
  { value: "Full load", sub: "Whole house" },
];

const STORAGE_KEY = "rubbish_load";
const TOL = 1e-6;

export function getCounts(placedItems) {
  const counts = {};
  for (const p of placedItems) counts[p.key] = (counts[p.key] || 0) + 1;
  return counts;
}

export function getVolume(placedItems) {
  let vol = 0;
  for (const p of placedItems) {
    const item = ITEM_BY_KEY[p.key];
    if (item) vol += item.volume;
  }
  return vol;
}

export function formatVolume(v) {
  return v.toFixed(1).replace(/\.0$/, "");
}

export function readoutText(vehicle, volume) {
  const v = VEHICLES[vehicle];
  if (volume === 0) return "Tap items below to start";
  if (vehicle === "truck" && volume > v.capacity) {
    return "More than a full truckload. Collectors may quote for two loads.";
  }
  if ((vehicle === "ute" || vehicle === "trailer") && volume >= v.capacity - 0.05) {
    return `Your ${v.name.toLowerCase()} is full`;
  }
  const pct = Math.round((volume / v.capacity) * 100);
  const x = Math.max(1, Math.min(99, pct));
  const loadWord = vehicle === "truck" ? "truckload" : `${v.name.toLowerCase()} load`;
  return `About ${x}% of a full ${loadWord}`;
}

// Skyline packing. Returns positioned items as percentages of the load box.
export function packLoad(placedItems, vehicle) {
  const v = VEHICLES[vehicle];
  const [left, top, right, bottom] = v.loadBox;
  const IW = right - left;
  const IH = bottom - top;
  const FLOOR = IH + 6;
  const STEP = 4;
  const N = Math.floor(IW / STEP);
  const sky = new Array(N).fill(FLOOR);
  const positions = [];
  placedItems.forEach((p, idx) => {
    const item = ITEM_BY_KEY[p.key];
    if (!item) return;
    let h = item.heightM * v.pxPerM;
    let w = h * item.ratio;
    if (w > IW - 8) {
      w = IW - 8;
      h = w / item.ratio;
    }
    if (h > IH - 4) {
      h = IH - 4;
      w = h * item.ratio;
    }
    const span = Math.max(1, Math.round(w / STEP));
    let best = 0;
    let bestBase = -Infinity;
    for (let c = 0; c + span <= N; c++) {
      let base = Infinity;
      for (let k = c; k < c + span; k++) base = Math.min(base, sky[k]);
      if (base > bestBase + 0.5) {
        bestBase = base;
        best = c;
      }
    }
    const leftPx = best * STEP;
    const topPx = bestBase - h;
    for (let k = best; k < best + span; k++) sky[k] = bestBase - h * 0.55;
    positions.push({
      id: p.id,
      key: p.key,
      leftPct: (leftPx / IW) * 100,
      topPct: (topPx / IH) * 100,
      widthPct: (w / IW) * 100,
      heightPct: (h / IH) * 100,
      z: idx + 1,
      rotation: ((idx * 37) % 3) - 1,
    });
  });
  return positions;
}

let _idCounter = 0;
export function nextItemId() {
  _idCounter += 1;
  return `i${Date.now()}_${_idCounter}`;
}

export function wouldExceed(placedItems, vehicle, addVolume) {
  return getVolume(placedItems) + addVolume > VEHICLES[vehicle].capacity + TOL;
}

export function exceedsCapacity(placedItems, vehicle) {
  return getVolume(placedItems) > VEHICLES[vehicle].capacity + TOL;
}

// Shared load state persisted to session storage under "rubbish_load".
export function useLoad() {
  const [placedItems, setPlacedItems] = useState([]);
  const [vehicle, setVehicle] = useState("ute");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.placedItems)) setPlacedItems(parsed.placedItems);
        if (VEHICLES[parsed.vehicle]) setVehicle(parsed.vehicle);
      }
    } catch (e) {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ placedItems, vehicle })
      );
    } catch (e) {
      // ignore quota errors
    }
  }, [placedItems, vehicle, hydrated]);

  const setLoad = (next) => {
    if (typeof next === "function") next = next({ placedItems, vehicle });
    setPlacedItems(next.placedItems ?? placedItems);
    setVehicle(next.vehicle ?? vehicle);
  };

  const load = useMemo(() => ({ placedItems, vehicle }), [placedItems, vehicle]);

  return { load, setLoad, hydrated };
}
