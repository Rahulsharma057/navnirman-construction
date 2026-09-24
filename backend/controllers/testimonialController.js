const Testimonial = require("../models/Testimonial");

// GET /api/testimonials
const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    next(err);
  }
};

// POST /api/testimonials (admin)
const createTestimonial = async (req, res, next) => {
  try {
    const { clientName, workLocation, message, rating, order } = req.body;
    if (!clientName || !message) {
      return res.status(400).json({ success: false, message: "Client name and message are required" });
    }
    const testimonial = await Testimonial.create({
      clientName,
      workLocation,
      message,
      rating: rating || 5,
      order: order || 0,
    });
    res.status(201).json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

// PUT /api/testimonials/:id (admin)
const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/testimonials/:id (admin)
const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
