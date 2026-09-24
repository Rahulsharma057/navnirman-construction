// Built-in defaults — taken from the GST registration certificate. The live
// values come from the business profile (/admin/profile); these are only the
// fallback shown before the API responds.
export const COMPANY = {
  businessName: "Navnirman Construction",
  ownerName: "Rakesh Kumar",
  tagline: "Building with trust — from foundation to finish.",
  about:
    "Navnirman Construction is a GST-registered civil contractor based in Delhi. We take on building construction, renovation, road and paving work, painting, electrical, gate and fencing jobs for private clients and government departments.",
  address: "C-2-215,216, Madangir, South Delhi, Delhi - 110062",
  yearsExperience: 9,
  gstin: "07AJBPR2279N1ZO",
  legalName: "Rakesh",
  tradeName: "NAVNIRMAN CONSTRUCTION",
  constitution: "Proprietorship",
  gstRegistrationType: "Regular",
  gstRegisteredOn: "2017-07-28",
  gstJurisdiction: "DL095",
};

export const fmtDate = (d, opts = { day: "2-digit", month: "short", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-IN", opts) : "—";

export const fmtMoney = (n) =>
  n === null || n === undefined || n === "" ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

// Construction is the core business — show building construction first, then the rest in their saved order.
const priority = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("building") || n.includes("construction")) return 0;
  if (n.includes("renovation")) return 1;
  return 2;
};
export const sortCategories = (cats = []) =>
  [...cats].sort((a, b) => priority(a.name) - priority(b.name) || (a.order ?? 0) - (b.order ?? 0));

// a profile's business name must be the company name — never the owner's personal name
export const isPersonName = (name, profile = {}) => {
  const n = (name || "").trim().toLowerCase();
  return !n || !n.includes(" ") || n === (profile.ownerName || "").toLowerCase() || n === (profile.legalName || "").toLowerCase();
};
