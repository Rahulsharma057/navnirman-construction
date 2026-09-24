const cloudinary = require("../config/cloudinary");
const Profile = require("../models/Profile");

// there is exactly one profile document for the whole site — fetch it,
// creating the default on first use so the API never 404s on a fresh install
const getOrCreateProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) profile = await Profile.create({});
  return profile;
};

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile();
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile (admin, multipart: fields "logo", "cover", "gallery")
const updateProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile();

    const fields = [
      "businessName", "ownerName", "tagline", "about", "phone", "whatsapp", "email", "address",
      "gstin", "legalName", "tradeName", "constitution", "gstRegistrationType", "gstJurisdiction",
      "pan", "udyam", "contractorClass",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) profile[f] = req.body[f];
    });
    // numbers / dates: an empty form field must not become NaN / Invalid Date
    if (req.body.yearsExperience !== undefined) profile.yearsExperience = Number(req.body.yearsExperience) || 0;
    if (req.body.gstRegisteredOn !== undefined) profile.gstRegisteredOn = req.body.gstRegisteredOn || undefined;
    if (profile.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(profile.gstin)) {
      return res.status(400).json({ success: false, message: "GSTIN format looks wrong (should be 15 characters, e.g. 07AJBPR2279N1ZO)" });
    }

    const files = req.files || {};

    if (files.logo?.[0]) {
      if (profile.logo?.publicId) await cloudinary.uploader.destroy(profile.logo.publicId).catch(() => {});
      profile.logo = { url: files.logo[0].path, publicId: files.logo[0].filename };
    }

    if (files.cover?.[0]) {
      if (profile.cover?.publicId) await cloudinary.uploader.destroy(profile.cover.publicId).catch(() => {});
      profile.cover = { url: files.cover[0].path, publicId: files.cover[0].filename };
    }

    if (files.gallery?.length) {
      const newGalleryImages = files.gallery.map((f) => ({ url: f.path, publicId: f.filename }));
      profile.gallery = [...profile.gallery, ...newGalleryImages];
    }

    // remove specific gallery photos by passing removeGallery as a JSON array of Cloudinary publicIds
    if (req.body.removeGallery) {
      try {
        const toRemove = JSON.parse(req.body.removeGallery);
        const removed = profile.gallery.filter((img) => toRemove.includes(img.publicId));
        profile.gallery = profile.gallery.filter((img) => !toRemove.includes(img.publicId));
        await Promise.all(removed.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {})));
      } catch (e) {
        /* ignore malformed removeGallery payload */
      }
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
