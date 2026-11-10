// Same rule as the Base44 postPickup function: VIC and QLD postcodes only.
export const AREA_MESSAGE = "Sorry, we only cover Melbourne and Brisbane for now.";

export function postcodeError(value) {
  const pc = String(value || "").trim();
  if (!/^[0-9]{4}$/.test(pc)) return "Enter a 4-digit postcode";
  const n = Number(pc);
  const inVic = (n >= 3000 && n <= 3999) || (n >= 8000 && n <= 8999);
  const inQld = (n >= 4000 && n <= 4999) || (n >= 9000 && n <= 9999);
  return inVic || inQld ? "" : AREA_MESSAGE;
}
