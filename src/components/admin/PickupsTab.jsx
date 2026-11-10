import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44";
import AdminList from "./AdminList";
import StatusPill from "./StatusPill";
import PickupSheet from "./PickupSheet";
import { REQUEST_FILTERS, formatAUDate, PICKUP_CSV_COLUMNS } from "@/lib/adminConfig";
import { jobStatusPillClass } from "@/lib/jobStatus";
import { downloadCSV } from "@/lib/adminExport";

// Ported from the Base44 app's admin (PickupsTab).
const JOB_STATUS_CHIPS = ["Open", "Booked", "Completed", "Cancelled", "Expired"].map((s) => ({ value: s, label: s }));

export default function PickupsTab() {
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.PickupRequest.filter({}, { sort: "-created_date", limit: 500 }),
      base44.entities.PickupRequest.count({}),
      base44.entities.PickupRequest.count({ status: "New" }),
    ])
      .then(([page, total, newC]) => {
        setRecords(page.items || []);
        setTotalCount(total);
        setNewCount(newC);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const isJobStatusChip = JOB_STATUS_CHIPS.some((c) => c.value === activeStatus);

  const filtered = useMemo(() => {
    let list = records;
    if (activeStatus !== "All") {
      list = isJobStatusChip ? list.filter((r) => r.job_status === activeStatus) : list.filter((r) => r.status === activeStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => `${r.name} ${r.suburb} ${r.mobile} ${r.street_address} ${r.email}`.toLowerCase().includes(q));
    }
    return list;
  }, [records, activeStatus, search, isJobStatusChip]);

  const handleUpdated = (updated) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    Promise.all([
      base44.entities.PickupRequest.count({}),
      base44.entities.PickupRequest.count({ status: "New" }),
    ]).then(([total, newC]) => { setTotalCount(total); setNewCount(newC); }).catch(() => {});
  };

  const renderCard = (r) => (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 font-heading font-extrabold text-black text-[15px] truncate">{r.name || "Unknown"}</p>
        {r.job_status === "Open" && r.status !== "Approved" ? (
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-heading font-extrabold shrink-0 bg-gold text-black">Waiting for review</span>
        ) : r.job_status ? (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-heading font-extrabold shrink-0 ${jobStatusPillClass(r.job_status)}`}>{r.job_status}</span>
        ) : (
          <StatusPill status={r.status} />
        )}
      </div>
      <p className="mt-1 text-mute text-[13px]">
        {[r.suburb, r.size].filter(Boolean).join(" · ")}
        {r.pickup_date ? ` · ${formatAUDate(r.pickup_date)}` : ""}
        {r.time_window ? ` ${r.time_window}` : ""}
      </p>
      <p className="mt-0.5 text-mute text-[13px]">
        {[r.vehicle, r.estimated_volume_m3 != null ? `${r.estimated_volume_m3} m³` : ""].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-0.5 text-mute text-[13px]">{formatAUDate(r.created_date)}</p>
    </>
  );

  return (
    <>
      {loadError && <p className="px-4 md:px-0 pt-4 text-[14px] font-bold text-danger" role="alert">Could not load pick ups. Refresh the page to try again.</p>}
      <AdminList
        records={filtered}
        loading={loading}
        totalCount={totalCount}
        newCount={newCount}
        statuses={[...REQUEST_FILTERS, ...JOB_STATUS_CHIPS]}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, suburb, address, mobile or email"
        onExport={() => downloadCSV("pickups", filtered, PICKUP_CSV_COLUMNS)}
        onCardClick={setSelected}
        renderCard={renderCard}
        cappedAt500={records.length === 500}
        emptyText="No pick ups yet."
      />
      {selected && <PickupSheet record={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </>
  );
}
