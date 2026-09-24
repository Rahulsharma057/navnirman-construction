const Category = require("../models/Category");
const Work = require("../models/Work");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    // attach a work count per category for quick UI badges
    const counts = await Work.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    const withCounts = categories.map((c) => ({
      ...c.toObject(),
      workCount: countMap[String(c._id)] || 0,
    }));
    res.json({ success: true, categories: withCounts });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories (admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const category = await Category.create({
      name,
      slug: slugify(name),
      icon: icon || "build",
      description: description || "",
      order: order || 0,
    });
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "A category with this name already exists" });
    }
    next(err);
  }
};

// PUT /api/categories/:id (admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, description, order } = req.body;
    const update = { icon, description, order };
    if (name) {
      update.name = name;
      update.slug = slugify(name);
    }
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id (admin)
const deleteCategory = async (req, res, next) => {
  try {
    const inUse = await Work.countDocuments({ category: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} work item(s) use this category`,
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
