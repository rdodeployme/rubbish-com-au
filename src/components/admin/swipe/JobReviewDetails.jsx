import { formatAUDate, formatAUDateTime, joinList } from "@/lib/adminConfig";
import { melbourneToday } from "@/lib/format";
import { useSignedUrls } from "./useSignedUrls";
import { Section, Row, Chips, Flag } from "./parts";

// Everything about one customer post, laid out to scroll on a phone.
export default function JobReviewDetails({ job }) {
  const photos = useSignedUrls(job.photos, 8);
  const datePassed = job.pickup_date && job.pickup_date < melbourneToday();
  const items = Array.isArray(job.load_items) ? job.load_items.filter((li) => li && li.item) : [];

  return (
    <div className="pb-8">
      {photos.length > 0 ? (
        <div className={`grid gap-1 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {photos.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`block bg-soft overflow-hidden ${photos.length === 1 ? "aspect-[4/3]" : "aspect-square"} ${photos.length === 3 && i === 0 ? "col-span-2 aspect-[2/1]" : ""}`}
              aria-label={`Open photo ${i + 1} full size`}
             
            >
              <img src={url} alt={`Photo ${i + 1} of the pick up`} className="h-full w-full object-cover" draggable="false" />
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-asphalt px-5 py-8 text-center">
          <p className="font-heading font-extrabold text-white text-[15px]">No photos</p>
        </div>
      )}

      <div className="px-5 pt-4">
        <span className="inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-[12px] font-heading font-extrabold text-black">Job to approve</span>
        <h2 className="mt-2 font-heading font-extrabold text-black text-[28px] leading-[1.1]">
          {[job.suburb, job.postcode].filter(Boolean).join(" ") || "No suburb"}
        </h2>
        <p className="mt-1 text-black text-[17px] font-bold">
          {job.pickup_date ? formatAUDate(job.pickup_date) : "No date"}
          {job.time_window ? ` · ${job.time_window}` : ""}
        </p>
        <p className="mt-1 text-mute text-[15px]">
          {[job.size, job.estimated_volume_m3 != null ? `about ${job.estimated_volume_m3} m³` : "", job.vehicle].filter(Boolean).join(" · ")}
        </p>
      </div>

      {datePassed && <Flag>The pick up date has passed. Reject it, or it will expire on its own.</Flag>}

      <Section title="What needs to go">
        <p className="text-black text-[16px] leading-relaxed whitespace-pre-line break-words">{job.description || "No description"}</p>
        <Chips items={job.materials} />
      </Section>

      {items.length > 0 && (
        <Section title="Items added">
          <ul className="space-y-1">
            {items.map((li, i) => (
              <li key={i} className="flex justify-between text-[15px]">
                <span className="text-black">{li.item}</span>
                {li.quantity ? <span className="text-mute">x {li.quantity}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Where and when">
        <Row label="Address" value={job.street_address} />
        <Row label="Suburb" value={[job.suburb, job.postcode].filter(Boolean).join(" ")} />
        <Row label="Date" value={job.pickup_date ? formatAUDate(job.pickup_date) : ""} warn={datePassed} />
        <Row label="Time window" value={job.time_window} />
      </Section>

      <Section title="Customer">
        <Row label="Name" value={job.name} />
        <Row label="Mobile">
          {job.mobile ? (
            <a href={`tel:${job.mobile}`} className="font-bold underline underline-offset-2">{job.mobile}</a>
          ) : ""}
        </Row>
        <Row label="Email" value={job.email} />
        <Row label="No hazardous items" value={job.hazard_confirmed ? "Confirmed" : "Not confirmed"} warn={!job.hazard_confirmed} />
        <Row label="Posted" value={formatAUDateTime(job.created_date)} />
      </Section>

      {Array.isArray(job.materials) && job.materials.length > 0 && (
        <p className="px-5 pt-2 text-mute text-[13px]">Materials: {joinList(job.materials)}</p>
      )}
    </div>
  );
}
