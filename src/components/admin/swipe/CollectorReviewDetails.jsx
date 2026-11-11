import FileLink from "../FileLink";
import CollectorAvatar from "@/components/mypickups/CollectorAvatar";
import { formatAUDate, formatAUDateTime, yesNo, joinList } from "@/lib/adminConfig";
import { melbourneToday } from "@/lib/format";
import { Section, Row, Chips, Flag } from "./parts";

function Expiry({ date }) {
  if (!date) return "";
  return formatAUDate(date);
}

// Everything about one collector application, laid out to scroll on a phone.
export default function CollectorReviewDetails({ app }) {
  const name = `${app.first_name || ""} ${app.last_name || ""}`.trim();
  const abn = String(app.abn || "").replace(/\s/g, "");
  const today = melbourneToday();
  const licenceBad = !app.driver_licence_expiry || app.driver_licence_expiry < today;
  const insuranceBad = !app.insurance_expiry || app.insurance_expiry < today;
  const vehicles = Array.isArray(app.vehicles) ? app.vehicles.filter((v) => v && (v.type || v.rego)) : [];

  return (
    <div className="pb-8">
      <div className="bg-black px-5 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <CollectorAvatar photoUrl={app.public_photo_url} name={name} size={72} />
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-[12px] font-heading font-extrabold text-black">
              Collector · {app.status || "New"}
            </span>
            <h2 className="mt-2 font-heading font-extrabold text-white text-[26px] leading-[1.1] break-words">{app.trading_name || name || "No name"}</h2>
            <p className="mt-1 text-white/80 text-[15px]">{name}</p>
          </div>
        </div>
        <p className="mt-3 text-white/80 text-[15px]">
          {[app.home_suburb, app.state, app.postcode].filter(Boolean).join(" ")}
          {app.travel_radius_km ? ` · travels ${app.travel_radius_km} km` : ""}
        </p>
      </div>

      {(licenceBad || insuranceBad) && (
        <Flag>{licenceBad && insuranceBad ? "Driver licence and insurance" : licenceBad ? "Driver licence" : "Insurance"} missing or expired. Approval will be refused until the dates are added.</Flag>
      )}

      <Section title="Business">
        <Row label="ABN">
          {abn ? (
            <a href={`https://abr.business.gov.au/ABN/View?abn=${abn}`} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">
              {abn} (check)
            </a>
          ) : ""}
        </Row>
        <Row label="Structure" value={app.business_structure} />
        <Row label="GST registered" value={app.gst_registered} />
        <Row label="Experience" value={app.years_experience} />
        <Row label="Crew" value={app.crew_size} />
        {app.website && (
          <Row label="Website">
            <a href={app.website} target="_blank" rel="noreferrer" className="underline underline-offset-2">{app.website.replace(/^https?:\/\//, "")}</a>
          </Row>
        )}
      </Section>

      <Section title="Licence and insurance">
        <Row label="Driver licence" value={[app.driver_licence_state, app.driver_licence_number].filter(Boolean).join(" ")} />
        <Row label="Licence expiry" warn={licenceBad}><Expiry date={app.driver_licence_expiry} /></Row>
        <Row label="Insurer" value={app.insurer} />
        <Row label="Policy number" value={app.insurance_policy_number} />
        <Row label="Cover" value={app.insurance_cover_amount} />
        <Row label="Insurance expiry" warn={insuranceBad}><Expiry date={app.insurance_expiry} /></Row>
        <Row label="Carrier licence (optional)" value={app.carrier_licence_number ? `${app.carrier_licence_number}${app.carrier_licence_issuer ? `, ${app.carrier_licence_issuer}` : ""}` : "None"} />
        <div className="pt-2 flex flex-wrap gap-2">
          {app.insurance_certificate_file ? <FileLink fileUri={app.insurance_certificate_file} label="Certificate of currency" /> : <span className="text-mute text-[14px]">No certificate of currency</span>}
          {app.carrier_licence_file && <FileLink fileUri={app.carrier_licence_file} label="Carrier licence" />}
          {app.police_check_file && <FileLink fileUri={app.police_check_file} label="Police check" />}
        </div>
      </Section>

      <Section title="Vehicles">
        {vehicles.length === 0 ? (
          <p className="text-mute text-[14px]">None given</p>
        ) : (
          vehicles.map((v, i) => (
            <div key={i} className="rounded-[12px] bg-soft px-3 py-2">
              <p className="font-bold text-black text-[15px]">{v.type || "Vehicle"}{v.load_size ? ` · ${v.load_size}` : ""}</p>
              <p className="text-mute text-[14px]">{[v.rego, v.make_model].filter(Boolean).join(" · ")}</p>
            </div>
          ))
        )}
      </Section>

      <Section title="Jobs they take">
        <Chips items={app.job_types} />
        <p className="pt-1 text-mute text-[13px]">Materials</p>
        <Chips items={app.materials} />
        <Row label="Heavy items" value={yesNo(app.can_handle_heavy_items)} />
        <Row label="Tips they use" value={app.disposal_facilities} />
      </Section>

      <Section title="When they work">
        <Row label="Days" value={joinList(app.work_days)} />
        <Row label="Time windows" value={joinList(app.time_windows)} />
        <Row label="Same day" value={yesNo(app.accepts_same_day)} />
        <Row label="Out of hours" value={yesNo(app.accepts_out_of_hours)} />
        {Array.isArray(app.service_postcodes) && app.service_postcodes.length > 0 && <Row label="Postcodes" value={joinList(app.service_postcodes)} />}
      </Section>

      {app.bio && (
        <Section title="About them">
          <p className="text-black text-[15px] leading-relaxed whitespace-pre-line break-words">{app.bio}</p>
        </Section>
      )}

      <Section title="Contact">
        <Row label="Mobile">
          {app.mobile ? <a href={`tel:${app.mobile}`} className="font-bold underline underline-offset-2">{app.mobile}</a> : ""}
        </Row>
        <Row label="Email" value={app.email} />
        <Row label="Applied" value={formatAUDateTime(app.created_date)} />
      </Section>
    </div>
  );
}
