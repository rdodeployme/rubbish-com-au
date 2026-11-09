import { Star } from "lucide-react";

export default function StarRating({ value, total = 5, size = 16, filled = "#1B1B1B", empty = "#E6E6E6", stroke }) {
  const rounded = Math.round(value);
  const filledStroke = stroke ?? filled;
  return (
    <span className="inline-flex" role="img" aria-label={`${rounded} of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star key={i} size={size} fill={i < rounded ? filled : "none"} stroke={i < rounded ? filledStroke : empty} strokeWidth={1.5} aria-hidden="true" />
      ))}
    </span>
  );
}
