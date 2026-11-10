import { statusPillClass } from "@/lib/adminConfig";

export default function StatusPill({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-heading font-extrabold ${statusPillClass(status)}`}>
      {status}
    </span>
  );
}
