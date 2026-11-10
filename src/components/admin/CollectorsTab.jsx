import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44";
import AdminList from "./AdminList";
import StatusPill from "./StatusPill";
import CollectorSheet from "./CollectorSheet";
import CollectorAvatar from "@/components/mypickups/CollectorAvatar";
import { COLLECTOR_FILTERS, formatAUDate, COLLECTOR_CSV_COLUMNS } from "@/lib/adminConfig";
import { downloadCSV } from "@/lib/adminExport";

// Ported from the Base44 app's admin (CollectorsTab).
export default function CollectorsTab() {
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
      base44.entities.CollectorApplication.filter({}, { sort: "-created_date", limit: 500 }),
      base44.entities.CollectorApplication.count({}),
      base44.entities.CollectorApplication.count({ status: "New" }),
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
      list = list.filter((r) => `${r.first_name} ${r.last_name} ${r.trading_name} ${r.home_suburb} ${r.mobile} ${r.email}`.toLowerCase().includes(q));
    }
    return list;
  }, [records, activeStatus, search]);

  const handleUpdated = (updated) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    Promise.all([
      base44.entities.CollectorApplication.count({}),
      base44.entities.CollectorApplication.count({ status: "New" }),
    ]).then(([total, newC]) => { setTotalCount(total); setNewCount(newC); }).catch(() => {});
  };

  const renderCard = (r) => (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading font-extrabold text-black text-[15px] truncate">{r.first_name} {r.last_name}</p>
          {r.trading_name && <p className="text-mute text-[13px] truncate">{r.trading_name}</p>}
        </div>
        <StatusPill status={r.status} />
      </div>
      <p className="mt-1 text-mute text-[13px]">
        {[r.home_suburb, r.state].filter(Boolean).join(" ")}
        {r.mobile ? ` · ${r.mobile}` : ""}
      </p>
      <p className="mt-0.5 text-mute text-[13px]">{formatAUDate(r.created_date)}</p>
    </>
  );

  return (
    <>
      {loadError && <p className="px-4 md:px-0 pt-4 text-[14px] font-bold text-danger" role="alert">Could not load collectors. Refresh the page to try again.</p>}
      <AdminList
        records={filtered}
        loading={loading}
        totalCount={totalCount}
        newCount={newCount}
        statuses={COLLECTOR_FILTERS}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, business, suburb, mobile or email"
        onExport={() => downloadCSV("collectors", filtered, COLLECTOR_CSV_COLUMNS)}
        onCardClick={setSelected}
        renderCard={renderCard}
        leading={(r) => <CollectorAvatar photoUrl={r.public_photo_url} name={`${r.first_name} ${r.last_name}`} size={44} />}
        cappedAt500={records.length === 500}
      />
      {selected && <CollectorSheet record={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </>
  );
}
