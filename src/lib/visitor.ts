// Generate / read a stable visitor id (for analytics)
export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "velicham_vid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}
