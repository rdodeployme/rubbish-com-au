// Ported from the Base44 app's admin (src/lib/adminExport.js).
function escapeCell(value) {
  let str = String(value ?? "");
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function downloadCSV(prefix, records, columns) {
  const bom = "﻿";
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const rows = records.map((r) => columns.map((c) => escapeCell(c.format(r))).join(","));
  const csv = bom + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
