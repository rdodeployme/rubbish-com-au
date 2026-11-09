import { SheetField, SheetSection } from "@/components/Sheet";
import PhotoThumb from "./PhotoThumb";
import QuotesSection from "./QuotesSection";
import { jobStatusPillClass } from "@/lib/jobStatus";
import { formatAUDate, joinList } from "@/lib/format";

// The body of a pick up. Shown in a side panel on desktop and in a sheet on phones.
// Quotes come first on wide screens because that is what people come back for.
export default function PickupDetail({ record, onJobUpdate }) {
  return (
    <div>
      <div className="mt-2">
        <p className="text-mute text-[12px] font-bold">Job status</p>
        <div className="mt-1">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-heading font-extrabold ${jobStatusPillClass(record.job_status)}`}>
            {record.job_status}
          </span>
        </div>
      </div>

      <QuotesSection key={record.id} record={record} onJobUpdate={onJobUpdate} />

      <div className="md:grid md:grid-cols-2 md:gap-x-8">
        <SheetSection title="What needs to go">
          <SheetField label="Size" value={record.size} />
          <SheetField label="Description" value={record.description} />
          <SheetField label="Materials" value={joinList(record.materials)} />
        </SheetSection>
        <SheetSection title="Pick up">
          <SheetField label="Date" value={formatAUDate(record.pickup_date)} />
          <SheetField label="Time window" value={record.time_window} />
          <SheetField label="Suburb" value={record.suburb} />
          <SheetField label="Postcode" value={record.postcode} />
          <SheetField label="Street address" value={record.street_address} />
        </SheetSection>
        <SheetSection title="Vehicle and volume">
          <SheetField label="Vehicle" value={record.vehicle} />
          <SheetField label="Estimated volume (m³)" value={record.estimated_volume_m3 != null ? String(record.estimated_volume_m3) : ""} />
        </SheetSection>
        <SheetSection title="Load items">
          {Array.isArray(record.load_items) && record.load_items.length > 0 ? (
            <ul className="space-y-1">
              {record.load_items.map((li, i) => (
                <li key={i} className="text-black text-[14px]">{li.item}{li.quantity ? ` (${li.quantity})` : ""}</li>
              ))}
            </ul>
          ) : (
            <p className="text-mute text-[14px]">No items</p>
          )}
        </SheetSection>
      </div>

      <SheetSection title="Photos">
        {Array.isArray(record.photos) && record.photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {record.photos.map((uri, i) => <PhotoThumb key={i} fileUri={uri} />)}
          </div>
        ) : (
          <p className="text-mute text-[14px]">No photos</p>
        )}
      </SheetSection>
    </div>
  );
}
