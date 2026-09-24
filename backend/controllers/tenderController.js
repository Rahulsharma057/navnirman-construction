const Tender = require("../models/Tender");

const FIELDS = [
  "title", "tenderNo", "authority", "location", "estimatedValue", "emd", "quotedAmount",
  "submissionDate", "openingDate", "status", "link", "notes", "checklist",
];

// standard documents a contractor normally needs to attach to a tender
const DEFAULT_CHECKLIST = [
  "GST registration certificate",
  "PAN card",
  "Contractor registration / enlistment certificate",
  "Work experience certificates",
  "Last 3 years ITR / balance sheet",
  "EMD / bid security",
  "Bank solvency certificate",
  "Signed tender documents & rate sheet",
];

// turn "" into undefined/null so Mongoose never tries to cast an empty string to Number/Date
const clean = (body) => {
  const data = {};
  FIELDS.forEach((f) => {
    if (body[f] === undefined) return;
    if (["estimatedValue", "emd", "quotedAmount"].includes(f)) {
      data[f] = body[f] === "" || body[f] === null ? null : Number(body[f]);
    } else if (["submissionDate", "openingDate"].includes(f)) {
      data[f] = body[f] ? body[f] : null;
    } else {
      data[f] = body[f];
    }
  });
  return data;
};

// GET /api/tenders?status=
const getTenders = async (req, res, next) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const tenders = await Tender.find(query).sort({ submissionDate: 1, createdAt: -1 });
    res.json({ success: true, tenders });
  } catch (err) {
    next(err);
  }
};

// GET /api/tenders/stats
const getStats = async (req, res, next) => {
  try {
    const rows = await Tender.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueSoon = await Tender.countDocuments({
      status: { $in: ["identified", "preparing"] },
      submissionDate: { $gte: now, $lte: soon },
    });
    res.json({ success: true, byStatus, dueSoon });
  } catch (err) {
    next(err);
  }
};

// POST /api/tenders
const createTender = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ success: false, message: "Tender title is required" });
    }
    const data = clean(req.body);
    if (!data.checklist || data.checklist.length === 0) {
      data.checklist = DEFAULT_CHECKLIST.map((label) => ({ label, done: false }));
    }
    const tender = await Tender.create(data);
    res.status(201).json({ success: true, tender });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tenders/:id
const updateTender = async (req, res, next) => {
  try {
    const tender = await Tender.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
    if (!tender) return res.status(404).json({ success: false, message: "Tender not found" });
    res.json({ success: true, tender });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tenders/:id
const deleteTender = async (req, res, next) => {
  try {
    const tender = await Tender.findByIdAndDelete(req.params.id);
    if (!tender) return res.status(404).json({ success: false, message: "Tender not found" });
    res.json({ success: true, message: "Tender deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTenders, getStats, createTender, updateTender, deleteTender, DEFAULT_CHECKLIST };
