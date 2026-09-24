const mongoose = require("mongoose");

// Singleton document — one business profile per site.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true, default: "Navnirman Construction" },
    ownerName: { type: String, trim: true, default: "Rakesh Kumar" },
    tagline: { type: String, trim: true, default: "Building with trust — from foundation to finish." },
    about: {
      type: String,
      trim: true,
      default:
        "Navnirman Construction is a GST-registered civil contractor based in Delhi. We take on building construction, renovation, road and paving work, painting, electrical, gate and fencing jobs for private clients and government departments.",
    },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "C-2-215,216, Madangir, South Delhi, Delhi - 110062" },
    yearsExperience: { type: Number, default: 9 },

    // ---- GST / registration details (from the GST REG-06 certificate) ----
    gstin: { type: String, trim: true, uppercase: true, default: "07AJBPR2279N1ZO" },
    legalName: { type: String, trim: true, default: "Rakesh" }, // name as printed on the GST certificate
    tradeName: { type: String, trim: true, default: "NAVNIRMAN CONSTRUCTION" },
    constitution: { type: String, trim: true, default: "Proprietorship" },
    gstRegistrationType: { type: String, trim: true, default: "Regular" },
    gstRegisteredOn: { type: Date, default: new Date("2017-07-28") },
    gstJurisdiction: { type: String, trim: true, default: "DL095" },
    // extra tender-related credentials the owner can fill in later
    pan: { type: String, trim: true, uppercase: true, default: "" },
    udyam: { type: String, trim: true, default: "" },
    contractorClass: { type: String, trim: true, default: "" }, // e.g. "Class B, MCD / PWD"

    logo: { type: imageSchema, default: null },
    cover: { type: imageSchema, default: null },
    gallery: { type: [imageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
