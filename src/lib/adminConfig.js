// Ported from the Base44 app's admin (src/lib/adminConfig.js). Keep in step with it.
import { parseServerDate, formatAUDate, formatAUDateTime, joinList } from "@/lib/format";

export { parseServerDate, formatAUDate, formatAUDateTime, joinList };

export const COLLECTOR_STATUSES = ["New", "Checking", "Approved", "Not approved", "Suspended"];

export const COLLECTOR_STATUS_BUTTONS = {
  "New": "New",
  "Checking": "Checking",
  "Approved": "Approve",
  "Not approved": "Not approved",
  "Suspended": "Suspend",
};

export const COLLECTOR_FILTERS = [
  { value: "All", label: "All" },
  { value: "New", label: "New" },
  { value: "Checking", label: "Checking" },
  { value: "Approved", label: "Approved" },
  { value: "Not approved", label: "Not approved" },
  { value: "Suspended", label: "Suspended" },
];

export function statusPillClass(status) {
  switch (status) {
    case "New":
      return "bg-gold text-black";
    case "Checking":
      return "bg-soft text-black";
    case "Approved":
      return "bg-black text-gold";
    case "Not approved":
      return "bg-white border-[1.5px] border-line text-mute";
    case "Suspended":
      return "bg-white border-[1.5px] border-black text-black";
    default:
      return "bg-white border border-line text-mute";
  }
}

export function yesNo(val) {
  return val ? "Yes" : "No";
}

export const REQUEST_STATUSES = ["New", "Contacted", "Closed"];
export const REQUEST_STATUS_BUTTONS = {
  New: "New",
  Contacted: "Contacted",
  Closed: "Closed",
};
export const REQUEST_FILTERS = [
  { value: "All", label: "All" },
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Closed", label: "Closed" },
];

const list = (arr) => (arr || []).join("; ");
const num = (v) => (v != null ? String(v) : "");
const loadItems = (r) =>
  (r.load_items || [])
    .map((li) => (li.item ? `${li.item}${li.quantity ? ` (${li.quantity})` : ""}` : ""))
    .filter(Boolean)
    .join("; ");

export const COLLECTOR_CSV_COLUMNS = [
  { label: "First name", format: (r) => r.first_name || "" },
  { label: "Last name", format: (r) => r.last_name || "" },
  { label: "Mobile", format: (r) => r.mobile || "" },
  { label: "Email", format: (r) => r.email || "" },
  { label: "Home suburb", format: (r) => r.home_suburb || "" },
  { label: "Postcode", format: (r) => r.postcode || "" },
  { label: "State", format: (r) => r.state || "" },
  { label: "Bio", format: (r) => r.bio || "" },
  { label: "Crew size", format: (r) => r.crew_size || "" },
  { label: "Trading name", format: (r) => r.trading_name || "" },
  { label: "Business structure", format: (r) => r.business_structure || "" },
  { label: "ABN", format: (r) => r.abn || "" },
  { label: "GST registered", format: (r) => r.gst_registered || "" },
  { label: "Years of experience", format: (r) => r.years_experience || "" },
  { label: "Website", format: (r) => r.website || "" },
  { label: "Driver licence number", format: (r) => r.driver_licence_number || "" },
  { label: "Driver licence state", format: (r) => r.driver_licence_state || "" },
  { label: "Driver licence expiry", format: (r) => formatAUDate(r.driver_licence_expiry) },
  { label: "Carrier licence number", format: (r) => r.carrier_licence_number || "" },
  { label: "Carrier licence issuer", format: (r) => r.carrier_licence_issuer || "" },
  { label: "Carrier licence expiry", format: (r) => formatAUDate(r.carrier_licence_expiry) },
  { label: "Insurer", format: (r) => r.insurer || "" },
  { label: "Insurance policy number", format: (r) => r.insurance_policy_number || "" },
  { label: "Insurance cover amount", format: (r) => r.insurance_cover_amount || "" },
  { label: "Insurance expiry", format: (r) => formatAUDate(r.insurance_expiry) },
  { label: "Public photo link", format: (r) => r.public_photo_url || "" },
  { label: "Service postcodes", format: (r) => list(r.service_postcodes) },
  {
    label: "Vehicles",
    format: (r) =>
      (r.vehicles || [])
        .map((v) => [v.type, v.rego, v.make_model, v.load_size].filter(Boolean).join(" | "))
        .join("; "),
  },
  { label: "Travel radius (km)", format: (r) => num(r.travel_radius_km) },
  { label: "Work days", format: (r) => list(r.work_days) },
  { label: "Time windows", format: (r) => list(r.time_windows) },
  { label: "Accepts same day", format: (r) => yesNo(r.accepts_same_day) },
  { label: "Accepts out of hours", format: (r) => yesNo(r.accepts_out_of_hours) },
  { label: "Job types", format: (r) => list(r.job_types) },
  { label: "Materials", format: (r) => list(r.materials) },
  { label: "Can handle heavy items", format: (r) => yesNo(r.can_handle_heavy_items) },
  { label: "Disposal facilities", format: (r) => r.disposal_facilities || "" },
  { label: "Will record disposal", format: (r) => yesNo(r.will_record_disposal) },
  { label: "Agreed to terms", format: (r) => yesNo(r.agreed_to_terms) },
  { label: "Status", format: (r) => r.status || "" },
  { label: "Submitted", format: (r) => formatAUDateTime(r.created_date) },
];

export const PICKUP_CSV_COLUMNS = [
  { label: "Name", format: (r) => r.name || "" },
  { label: "Mobile", format: (r) => r.mobile || "" },
  { label: "Email", format: (r) => r.email || "" },
  { label: "Suburb", format: (r) => r.suburb || "" },
  { label: "Pickup date", format: (r) => formatAUDate(r.pickup_date) },
  { label: "Time window", format: (r) => r.time_window || "" },
  { label: "Size", format: (r) => r.size || "" },
  { label: "Materials", format: (r) => list(r.materials) },
  { label: "Description", format: (r) => r.description || "" },
  { label: "Vehicle", format: (r) => r.vehicle || "" },
  { label: "Estimated volume (m³)", format: (r) => num(r.estimated_volume_m3) },
  { label: "Load items", format: loadItems },
  { label: "Hazard confirmed", format: (r) => yesNo(r.hazard_confirmed) },
  { label: "Photos", format: (r) => String((r.photos || []).length) },
  { label: "Status", format: (r) => r.status || "" },
  { label: "Submitted", format: (r) => formatAUDateTime(r.created_date) },
  { label: "Job status", format: (r) => r.job_status || "" },
  { label: "Quote count", format: (r) => num(r.quote_count) },
  { label: "Postcode", format: (r) => r.postcode || "" },
  { label: "Street address", format: (r) => r.street_address || "" },
];

export const BIN_CSV_COLUMNS = [
  { label: "Bin kind", format: (r) => r.bin_kind || "" },
  { label: "Size (m³)", format: (r) => num(r.size_m3) },
  { label: "Waste type", format: (r) => r.waste_type || "" },
  { label: "Hire period", format: (r) => r.hire_period || "" },
  { label: "Placement", format: (r) => r.placement || "" },
  { label: "Property type", format: (r) => r.property_type || "" },
  { label: "Bin litres", format: (r) => num(r.bin_litres) },
  { label: "Bin count", format: (r) => num(r.bin_count) },
  { label: "Frequency", format: (r) => r.frequency || "" },
  { label: "Streams", format: (r) => list(r.streams) },
  { label: "Suburb", format: (r) => r.suburb || "" },
  { label: "Needed date", format: (r) => formatAUDate(r.needed_date) },
  { label: "Name", format: (r) => r.name || "" },
  { label: "Mobile", format: (r) => r.mobile || "" },
  { label: "Email", format: (r) => r.email || "" },
  { label: "Hazard confirmed", format: (r) => yesNo(r.hazard_confirmed) },
  { label: "Estimated volume (m³)", format: (r) => num(r.estimated_volume_m3) },
  { label: "Load items", format: loadItems },
  { label: "Status", format: (r) => r.status || "" },
  { label: "Submitted", format: (r) => formatAUDateTime(r.created_date) },
];
