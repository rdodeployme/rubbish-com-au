// Copied from the Base44 app's adminConfig.js. Server timestamps without a zone are UTC.
export function parseServerDate(value) {
  if (typeof value === "string") {
    const hasTime = value.includes("T");
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
    if (hasTime && !hasZone) return new Date(value + "Z");
  }
  return new Date(value);
}

export function formatAUDate(iso) {
  if (!iso) return "";
  const d = iso.length === 10 ? new Date(iso + "T00:00:00") : parseServerDate(iso);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function formatAUDateTime(iso) {
  if (!iso) return "";
  const d = parseServerDate(iso);
  if (isNaN(d.getTime())) return "";
  // Melbourne time whatever the device timezone is, as in the app.
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const part = (type) => parts.find((p) => p.type === type)?.value || "";
  let hours = Number(part("hour"));
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${part("day")}/${part("month")}/${part("year")} ${hours}:${part("minute")}${ampm}`;
}

export function joinList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.join(", ");
}
