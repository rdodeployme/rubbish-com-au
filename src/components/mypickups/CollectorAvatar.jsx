export default function CollectorAvatar({ photoUrl, name, size = 48 }) {
  const initials = (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  if (photoUrl) {
    return <img src={photoUrl} alt={name || "Collector"} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full bg-black grid place-items-center shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <span className="font-heading font-extrabold text-gold leading-none" style={{ fontSize: Math.round(size * 0.36) }}>{initials || "?"}</span>
    </div>
  );
}
