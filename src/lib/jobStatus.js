export function jobStatusPillClass(status) {
  switch (status) {
    case "Open":
      return "bg-gold text-black";
    case "Booked":
      return "bg-black text-gold";
    case "Completed":
      return "bg-soft text-black";
    case "Cancelled":
      return "bg-white border-[1.5px] border-line text-mute";
    case "Expired":
      return "bg-concrete text-black";
    default:
      return "bg-white border border-line text-mute";
  }
}
