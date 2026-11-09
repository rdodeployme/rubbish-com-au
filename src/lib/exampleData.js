import { format, addDays } from "date-fns";

export function formatJobDate(daysFromNow) {
  return format(addDays(new Date(), daysFromNow), "EEE d MMM");
}

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("en-AU");
}
