const express = require("express");
const { getTenders, getStats, createTender, updateTender, deleteTender } = require("../controllers/tenderController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// tenders are private business data — every route needs the admin token
router.use(protect);
router.get("/stats", getStats);
router.get("/", getTenders);
router.post("/", createTender);
router.put("/:id", updateTender);
router.delete("/:id", deleteTender);

module.exports = router;
