const express = require("express");
const { getWorks, getWork, createWork, updateWork, deleteWork } = require("../controllers/workController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getWorks);
router.get("/:id", getWork);
router.post("/", protect, upload.array("images", 8), createWork);
router.put("/:id", protect, upload.array("images", 8), updateWork);
router.delete("/:id", protect, deleteWork);

module.exports = router;
