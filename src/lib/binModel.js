import { ITEM_BY_KEY, getCounts, getVolume, formatVolume } from "./loadModel";

// Copied from the Base44 app (src/lib/binModel.js). Keep in step with it.
// Approximate typical Australian sizes. Not verified against supplier specifications.
export const SKIP_BINS = [
  { size: 2, goodFor: ["Bathroom reno", "Small clean-ups"], note: "Smallest skip. Fits most driveways.", topLength: 2.0, height: 0.9, popular: false },
  { size: 3, goodFor: ["Single room clear-out", "Garage or shed"], note: "Good for small household jobs.", topLength: 2.2, height: 1.0, popular: false },
  { size: 4, goodFor: ["Garden clean-ups", "Small renovations"], note: "A handy all-rounder.", topLength: 2.6, height: 1.05, popular: false },
  { size: 6, goodFor: ["Moving house", "Kitchen reno"], note: "Fits a typical household clear-out.", topLength: 3.4, height: 1.2, popular: true },
  { size: 8, goodFor: ["Renovations", "Large clear-outs"], note: "For bigger projects and bulky items.", topLength: 3.7, height: 1.4, popular: false },
  { size: 10, goodFor: ["Full house clear-out", "Deceased estates"], note: "Clears most of a house in one go.", topLength: 3.9, height: 1.6, popular: false },
  { size: 12, goodFor: ["Large renovations", "Commercial clean-outs"], note: "Biggest standard skip. Check access.", topLength: 4.1, height: 1.7, popular: false },
];

export const HOOK_BINS = [
  { size: 10, goodFor: ["Large house clear-outs", "Landscaping"], note: "Smallest hook bin. Walk-in rear door for easy loading.", topLength: 4.0, height: 1.2, popular: false },
  { size: 12, goodFor: ["Renovations", "Shed demolition"], note: "A step up for bigger domestic jobs.", topLength: 4.5, height: 1.2, popular: false },
  { size: 15, goodFor: ["Builders' waste", "Full house renovations"], note: "Fits most building and renovation jobs.", topLength: 5.0, height: 1.35, popular: true },
  { size: 20, goodFor: ["Commercial clean-outs", "Demolition"], note: "For large sites and commercial work.", topLength: 5.8, height: 1.55, popular: false },
  { size: 23, goodFor: ["Large building sites", "Factory clear-outs"], note: "High-volume, lighter waste.", topLength: 6.2, height: 1.7, popular: false },
  { size: 30, goodFor: ["Bulky, light waste", "Warehouse clear-outs"], note: "Biggest hook bin. Bulky, light loads only.", topLength: 6.8, height: 1.9, popular: false },
];

export const WHEELIE_SIZES = [120, 240, 360, 660, 1100];

export const WHEELIE_FREQUENCIES = ["One-off", "Weekly", "Fortnightly", "Monthly"];

export const SKIP_WASTE_TYPES = ["General household", "Green waste", "Mixed building", "Soil and clean fill"];
export const SKIP_HIRE_PERIODS = ["3 days", "7 days", "14 days"];
export const SKIP_PLACEMENTS = ["Driveway", "Front yard", "Rear lane", "Street (permit needed)", "Building site"];

export const WHEELIE_PROPERTY_TYPES = ["Home", "Apartment complex", "Strata or body corporate", "Office", "Retail shop", "Café or restaurant", "Other business"];
export const WHEELIE_STREAMS = ["General waste", "Recycling", "Cardboard", "Organics / FOGO", "Glass"];
export const WHEELIE_FREQUENCY_MAP = {
  "One-off": "One-off collection",
  "Weekly": "Ongoing, weekly",
  "Fortnightly": "Ongoing, fortnightly",
  "Monthly": "Ongoing, monthly",
};
export const WHEELIE_FORM_FREQUENCIES = ["One-off collection", "Ongoing, weekly", "Ongoing, twice weekly", "Ongoing, fortnightly", "Ongoing, monthly"];

export function round2(v) {
  return Math.round(v * 100) / 100;
}

export function getLoadVolume(placedItems) {
  return round2(getVolume(placedItems));
}

export function suggestSize(sizes, volume) {
  for (const s of sizes) {
    if (s.size >= volume) return s.size;
  }
  return sizes[sizes.length - 1].size;
}

export function mostPopularSize(sizes) {
  return sizes.find((s) => s.popular)?.size ?? sizes[0].size;
}

const EXAMPLE_SEQ = [
  "rubbish-bags", "boxes", "fridge", "green-waste", "armchair", "washer",
  "couch", "mattress", "table", "rubbish-bags", "boxes", "wardrobe",
  "green-waste", "tv", "bed-base", "rubbish-bags", "boxes", "couch",
  "armchair", "green-waste", "fridge", "rubbish-bags", "boxes", "table",
];

export function buildExampleLoad(bin) {
  const maxLenRatio = bin.kind === "hook" ? 0.95 : 0.66;
  const maxVol = round2(0.98 * bin.size);
  const result = [];
  let vol = 0;
  let total = 0;
  let passAdded = true;
  while (passAdded && total < 80) {
    passAdded = false;
    for (const key of EXAMPLE_SEQ) {
      if (total >= 80) break;
      const item = ITEM_BY_KEY[key];
      const lenM = item.heightM * item.ratio;
      if (lenM > maxLenRatio * bin.topLength) continue;
      const newVol = round2(vol + item.volume);
      if (newVol > maxVol) continue;
      result.push({ id: `ex${total}`, key });
      vol = newVol;
      total++;
      passAdded = true;
    }
  }
  return result;
}

const FITS_ORDER = [
  { key: "couch", s: "couch", p: "couches" },
  { key: "wardrobe", s: "wardrobe", p: "wardrobes" },
  { key: "fridge", s: "fridge", p: "fridges" },
  { key: "washer", s: "washer", p: "washers" },
  { key: "armchair", s: "armchair", p: "armchairs" },
  { key: "table", s: "table", p: "tables" },
  { key: "mattress", s: "mattress", p: "mattresses" },
  { key: "bed-base", s: "bed base", p: "bed bases" },
  { key: "tv", s: "TV", p: "TVs" },
  { key: "green-waste", green: true },
  { key: "rubbish-bags", bags: true },
  { key: "boxes", boxes: true },
];

export function buildFitsAbout(exampleItems) {
  const counts = getCounts(exampleItems);
  const parts = [];
  for (const o of FITS_ORDER) {
    const c = counts[o.key] || 0;
    if (c === 0) continue;
    if (o.green) parts.push(`${c} m³ of green waste`);
    else if (o.bags) parts.push(`${c * 5} rubbish bags`);
    else if (o.boxes) parts.push(`${c * 5} boxes`);
    else parts.push(`${c} ${c === 1 ? o.s : o.p}`);
  }
  if (parts.length === 0) return "";
  if (parts.length > 5) return parts.slice(0, 5).join(", ") + " and more";
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

// Skyline packing for bins. Returns positioned items in px.
export function packBinLoad(placedItems, insideWidth, insideHeight, pxPerM) {
  const STEP = 2;
  const N = Math.max(1, Math.floor(insideWidth / STEP));
  const sky = new Array(N).fill(insideHeight);
  const positions = [];
  placedItems.forEach((p, idx) => {
    const item = ITEM_BY_KEY[p.key];
    if (!item) return;
    let h = item.heightM * pxPerM;
    let w = h * item.ratio;
    if (w > insideWidth - 4) { w = insideWidth - 4; h = w / item.ratio; }
    if (h > insideHeight - 4) { h = insideHeight - 4; w = h * item.ratio; }
    const span = Math.max(1, Math.round(w / STEP));
    let best = 0;
    let bestBase = -Infinity;
    for (let c = 0; c + span <= N; c++) {
      let base = Infinity;
      for (let k = c; k < c + span; k++) base = Math.min(base, sky[k]);
      if (base > bestBase + 0.5) { bestBase = base; best = c; }
    }
    const leftPx = best * STEP;
    const topPx = bestBase - h;
    for (let k = best; k < best + span; k++) sky[k] = bestBase - h * 0.55;
    positions.push({ id: p.id, key: p.key, leftPx, topPx, w, h, index: idx });
  });
  return positions;
}

export { formatVolume };
