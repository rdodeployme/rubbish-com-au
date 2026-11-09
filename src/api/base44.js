import { createClient } from "@base44/sdk";

// The Rubbish.com.au Base44 app holds all the data and the backend functions.
// This website talks to it as the signed-in customer only. Never put a service key here.
export const APP_ID = "6ad626d1014ee1424d4deeff";

export const base44 = createClient({
  appId: APP_ID,
  serverUrl: "https://base44.app",
  requiresAuth: false,
});

// A failed call throws. Read the server's own message where there is one.
export function errorMessage(err, fallback = "Sorry, that did not work. Please try again.") {
  const fromResponse = err?.response?.data?.error;
  if (typeof fromResponse === "string" && fromResponse) return fromResponse;
  const fromData = err?.data?.error;
  if (typeof fromData === "string" && fromData) return fromData;
  if (typeof fromData?.message === "string" && fromData.message) return fromData.message;
  if (typeof err?.data?.message === "string" && err.data.message) return err.data.message;
  if (typeof err?.data?.detail === "string" && err.data.detail) return err.data.detail;
  return err?.message && !/^Request failed/.test(err.message) ? err.message : fallback;
}

export function errorStatus(err) {
  return err?.response?.status ?? err?.status ?? null;
}
