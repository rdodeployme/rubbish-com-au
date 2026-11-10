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

// Posts are checked by the Rubbish.com.au team before collectors see them.
// The Base44 "status" field holds the review: "New" = in review, "Approved" = live,
// "Rejected" = not posted (the job is also Cancelled, with the reason).
export function isInReview(job) {
  return !!job && job.job_status === "Open" && job.status !== "Approved";
}

export function customerStatusLabel(job) {
  if (!job) return "";
  if (job.status === "Rejected") return "Not posted";
  if (isInReview(job)) return "In review";
  return job.job_status;
}

export function customerStatusPillClass(job) {
  if (job && job.status === "Rejected") return jobStatusPillClass("Cancelled");
  if (isInReview(job)) return "bg-white border-[1.5px] border-black text-black";
  return jobStatusPillClass(job && job.job_status);
}
