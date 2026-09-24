const mongoose = require("mongoose");

const tenderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tenderNo: { type: String, trim: true, default: "" },
    authority: { type: String, trim: true, default: "" }, // department / client issuing the tender
    location: { type: String, trim: true, default: "" },
    estimatedValue: { type: Number, min: 0 },
    emd: { type: Number, min: 0 }, // earnest money deposit
    quotedAmount: { type: Number, min: 0 },
    submissionDate: { type: Date },
    openingDate: { type: Date },
    status: {
      type: String,
      enum: ["identified", "preparing", "submitted", "won", "lost", "cancelled"],
      default: "identified",
    },
    link: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    checklist: {
      type: [{ label: { type: String, required: true, trim: true }, done: { type: Boolean, default: false }, _id: false }],
      default: [],
    },
  },
  { timestamps: true }
);

tenderSchema.index({ status: 1, submissionDate: 1 });

module.exports = mongoose.model("Tender", tenderSchema);
