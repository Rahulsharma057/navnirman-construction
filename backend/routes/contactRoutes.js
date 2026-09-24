const express = require("express");
const { createMessage, getMessages, markRead, deleteMessage } = require("../controllers/contactController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, getMessages);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
