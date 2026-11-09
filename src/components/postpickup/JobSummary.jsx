function Row({ label, value }) {
  const set = value && value !== "";
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-mute text-[13px] shrink-0">{label}</span>
      <span className={`text-[13px] text-right ${set ? "text-black" : "text-mute"}`}>{set ? value : "Not set yet"}</span>
    </div>
  );
}

export default function JobSummary({ job }) {
  return (
    <div className="rounded-[20px] bg-white border border-line p-5">
      <h3 className="font-heading font-extrabold text-lg text-black">Your job</h3>
      <div className="mt-1 divide-y divide-line">
        <Row label="Size" value={job.size} />
        <Row label="Materials" value={job.materials} />
        <Row label="When" value={job.when} />
        <Row label="Suburb" value={job.suburb} />
        <Row label="Photos" value={job.photos} />
      </div>
      <div className="mt-4 rounded-2xl bg-gold p-4">
        <p className="font-heading font-extrabold text-black text-base">Up to 3 quotes</p>
        <p className="text-black text-[13px] leading-snug">from local collectors. You pick the one you want.</p>
      </div>
      <p className="mt-3 text-[12px] text-mute leading-snug">No asbestos or hazardous waste.</p>
    </div>
  );
}
