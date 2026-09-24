const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProfile);
router.put(
  "/",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateProfile
);

module.exports = router;
