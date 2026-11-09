// Wording copied from the Base44 app's How it works screen (customer side only).
export const CUSTOMER_STEPS = [
  { n: 1, title: "Post a job for free", body: "Snap a photo to create a listing. Add what's there, your suburb, a date and a time window: 5am – 8am, 8am – 12pm, 1pm – 3pm or 3pm – 5pm. Collectors send you quotes. Your suburb is shown so that collectors can locate you. No address is shared until you accept a quote." },
  { n: 2, title: "Choose best quote", body: "Compare prices and reviews of different collectors. Tap any collector to see their star rating and the jobs they've completed. Choose the one that suits you best." },
  { n: 3, title: "Book and message", body: "Accept the quote you like, then message your collector to sort the details." },
  { n: 4, title: "Responsible recycling", body: "Where possible, waste is recycled, reused or redistributed." },
];

export const SHORT_STEPS = [
  { n: 1, title: "Post a job for free", body: "Snap a photo to create a listing. Collectors send you quotes." },
  { n: 2, title: "Choose best quote", body: "Compare prices and reviews of different collectors. Choose the one that suits you best." },
  { n: 3, title: "Book and message", body: "Accept the quote you like, then message your collector to sort the details." },
  { n: 4, title: "Responsible recycling", body: "Where possible, waste is recycled, reused or redistributed." },
];

export const PRICE_FACTORS = [
  { n: 1, title: "Size of load", body: "Larger loads increase the price.", dir: "up" },
  { n: 2, title: "Weight", body: "Heavier loads increase the price.", dir: "up" },
  { n: 3, title: "Fridges and mattresses", body: "These cost more to dispose of.", dir: "up" },
  { n: 4, title: "Sofas and upholstered items", body: "Upholstered items can contain POPs (persistent organic pollutants), which need special disposal and increase the price.", dir: "up" },
  { n: 5, title: "Reusable, resaleable or valuable items", body: "Items that can be reused, redistributed or rehomed will reduce the price.", dir: "down" },
  { n: 6, title: "Time slot and pickup day", body: "Narrow, out-of-hours and urgent time slots are available.", dir: null },
  { n: 7, title: "Access and loading time", body: "Awkward access and more complex loading can be accommodated (e.g. apartment complexes, stairs).", dir: "up" },
];

export const CANT_TAKE = [
  "Asbestos",
  "Explosives and ammunition",
  "Poisons and chemicals",
  "Gas bottles and fuel",
  "Paint and solvents",
  "Medical and clinical waste",
];

export const FAQS = [
  { q: "How much does it cost to post a job?", a: "Nothing. You only pay the price you accept from a collector." },
  { q: "How do I pay?", a: "You pay the collector directly when the job is done. Agree on the price and what's included in the messages." },
  { q: "What if I only get one or two quotes?", a: "You can book any quote you've received, or wait for more. We aim for 3 but it depends on how many collectors cover your area that day." },
  { q: "How are collectors checked?", a: "Before we approve a collector, we check the licence and insurance details they upload." },
  { q: "Do I have to share my phone number?", a: "Your number is only shared with the collector you book, so they can confirm the pick up." },
  { q: "Who can see my address?", a: "Your suburb is shown so collectors can locate you for quoting. No address is shared until you accept a quote and engage the collector." },
  { q: "Where do you collect?", a: "Melbourne and Brisbane for now." },
];
