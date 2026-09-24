const cloudinary = require("../config/cloudinary");
const Work = require("../models/Work");

// GET /api/works?search=&category=&page=&limit=&featured=
const getWorks = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 9, featured, status } = req.query;
    const query = {};

    if (search && search.trim()) {
      // partial, case-insensitive match ("gat" finds "Gate repair") — $text only matched whole words
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const [works, total] = await Promise.all([
      Work.find(query)
        .populate("category", "name slug icon")
        .sort({ createdAt: 1, _id: 1 }) // oldest first: jo project pehle add hua wo pehle, naya sabse last mein
        .skip(skip)
        .limit(limitNum),
      Work.countDocuments(query),
    ]);

    res.json({
      success: true,
      works,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/works/:id
const getWork = async (req, res, next) => {
  try {
    const work = await Work.findById(req.params.id).populate("category", "name slug icon");
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });
    res.json({ success: true, work });
  } catch (err) {
    next(err);
  }
};

// POST /api/works (admin, multipart with "images" field, uploaded to Cloudinary by middleware)
const createWork = async (req, res, next) => {
  try {
    const { title, description, category, location, completedOn, durationDays, clientType, featured, status } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Title, description and category are required" });
    }

    const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
    if (images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one photo is required" });
    }

    const work = await Work.create({
      title,
      description,
      category,
      images,
      location,
      completedOn: completedOn || undefined,
      durationDays: durationDays || undefined,
      clientType: clientType || "residential",
      featured: featured === "true" || featured === true,
      status: status || "completed",
    });

    res.status(201).json({ success: true, work });
  } catch (err) {
    next(err);
  }
};

// PUT /api/works/:id (admin, multipart optional new "images")
const updateWork = async (req, res, next) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });

    const fields = ["title", "description", "category", "location", "completedOn", "durationDays", "clientType", "status"];
    fields.forEach((f) => {
      if (req.body[f] === undefined) return;
      // required fields can't be blanked; optional ones can be cleared
      if (req.body[f] === "" && ["title", "description", "category"].includes(f)) return;
      work[f] = req.body[f] === "" ? undefined : req.body[f];
    });
    if (req.body.featured !== undefined) {
      work.featured = req.body.featured === "true" || req.body.featured === true;
    }

    const newImages = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
    if (newImages.length > 0) {
      work.images = [...work.images, ...newImages];
    }

    // remove specific existing images by passing removeImages as a JSON array of Cloudinary publicIds
    if (req.body.removeImages) {
      try {
        const toRemove = JSON.parse(req.body.removeImages);
        const removedImages = work.images.filter((img) => toRemove.includes(img.publicId));
        work.images = work.images.filter((img) => !toRemove.includes(img.publicId));
        await Promise.all(removedImages.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {})));
      } catch (e) {
        /* ignore malformed removeImages payload */
      }
    }

    await work.save();
    res.json({ success: true, work });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/works/:id (admin)
const deleteWork = async (req, res, next) => {
  try {
    const work = await Work.findByIdAndDelete(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });

    await Promise.all(work.images.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {})));

    res.json({ success: true, message: "Work deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorks, getWork, createWork, updateWork, deleteWork };
