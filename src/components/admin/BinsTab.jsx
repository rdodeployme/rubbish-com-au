import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44";
import AdminList from "./AdminList";
import StatusPill from "./StatusPill";
import BinSheet, { binSizeLabel } from "./BinSheet";
import { REQUEST_FILTERS, formatAUDate, BIN_CSV_COLUMNS } from "@/lib/adminConfig";
import { downloadCSV } from "@/lib/adminExport";

// Ported from the Base44 app's admin (BinsTab). The skip, hook and wheelie waitlist.
export default function BinsTab() {
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
      base44.entities.BinRequest.filter({}, { sort: "-created_date", limit: 500 }),
      base44.entities.BinRequest.count({}),
      base44.entities.BinRequest.count({ status: "New" }),
    ])
      .then(([page, total, newC]) => {
        setRecords(page.items || []);
        setTotalCount(total);
        setNewCount(newC);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = records;
    if (activeStatus !== "All") list = list.filter((r) => r.status === activeStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => `${r.suburb} ${r.waste_type} ${r.name} ${r.mobile} ${r.email}`.toLowerCase().includes(q));
    }
    return list;
  }, [records, activeStatus, search]);

  const handleUpdated = (updated) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    Promise.all([
      base44.entities.BinRequest.count({}),
      base44.entities.BinRequest.count({ status: "New" }),
    ]).then(([total, newC]) => { setTotalCount(total); setNewCount(newC); }).catch(() => {});
  };

  const renderCard = (r) => (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading font-extrabold text-black text-[15px] truncate">{r.bin_kind ? `${r.bin_kind} bin` : "Bin request"}</p>
        <StatusPill status={r.status} />
      </div>
      <p className="mt-1 text-mute text-[13px]">{[binSizeLabel(r), r.suburb, r.needed_date ? formatAUDate(r.needed_date) : ""].filter(Boolean).join(" · ")}</p>
      <p className="mt-0.5 text-mute text-[13px]">{[r.name, formatAUDate(r.created_date)].filter(Boolean).join(" · ")}</p>
    </>
  );

  return (
    <>
      {loadError && <p className="px-4 md:px-0 pt-4 text-[14px] font-bold text-danger" role="alert">Could not load bin requests. Refresh the page to try again.</p>}
      <AdminList
        records={filtered}
        loading={loading}
        totalCount={totalCount}
        newCount={newCount}
        statuses={REQUEST_FILTERS}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by suburb, waste type, name, mobile or email"
        onExport={() => downloadCSV("bins", filtered, BIN_CSV_COLUMNS)}
        onCardClick={setSelected}
        renderCard={renderCard}
        cappedAt500={records.length === 500}
        emptyText="No bin requests yet."
      />
      {selected && <BinSheet record={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </>
  );
}
