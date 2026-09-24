const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    location: { type: String, trim: true, default: "" },
    completedOn: { type: Date },
    durationDays: { type: Number },
    clientType: { type: String, enum: ["residential", "commercial", "government", "other"], default: "residential" },
    featured: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false }, // demo entries created by `npm run seed` — remove with `npm run clear-samples`
    status: { type: String, enum: ["completed", "in-progress"], default: "completed" },
  },
  { timestamps: true }
);

workSchema.index({ category: 1, featured: -1, completedOn: -1 });

module.exports = mongoose.model("Work", workSchema);
