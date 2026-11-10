// Search, status filters, CSV export and a grid of cards. Shared by the admin tabs.
export default function AdminList({
  records, loading, totalCount, newCount, statuses, activeStatus, onStatusChange,
  searchValue, onSearchChange, searchPlaceholder, onExport, onCardClick, renderCard,
  leading, cappedAt500, emptyText,
}) {
  return (
    <div className="px-4 md:px-0 pt-4 pb-8">
      <p className="font-bold text-[14px] text-black">{newCount} new, {totalCount} in total</p>
      {cappedAt500 && <p className="mt-1 text-mute text-[12px]">Showing the newest 500</p>}

      <input
        type="search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder || "Search"}
        className="mt-3 h-[44px] w-full md:max-w-[520px] rounded-full bg-white border border-line px-4 text-[14px] text-black focus:outline-none focus:border-black"
      />

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onStatusChange(s.value)}
            aria-pressed={activeStatus === s.value}
            className={`min-h-[44px] inline-flex items-center justify-center rounded-full px-3 py-1.5 font-heading font-extrabold text-[13px] ${
              activeStatus === s.value ? "bg-black text-gold" : "bg-white border border-line text-black"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" onClick={onExport} disabled={!records.length || loading} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-black px-4 py-2 font-heading font-extrabold text-[13px] text-black disabled:opacity-40">
          Export CSV
        </button>
        <p className="mt-1 text-mute text-[12px]">Includes personal details. Keep the file secure.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-mute text-[15px]">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-mute text-[15px]">{emptyText || "Nothing here yet."}</p>
        ) : (
          records.map((r) => (
            <button key={r.id} type="button" onClick={() => onCardClick(r)} className="text-left w-full rounded-[16px] bg-white border border-line p-4 hover:border-black">
              {leading ? (
                <div className="flex items-start gap-3">
                  {leading(r)}
                  <div className="min-w-0 flex-1">{renderCard(r)}</div>
                </div>
              ) : (
                renderCard(r)
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
