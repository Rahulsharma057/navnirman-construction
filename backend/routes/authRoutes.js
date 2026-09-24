const express = require("express");
const { login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

router.post("/login", rateLimit({ max: 10, message: "Too many login attempts. Try again in 15 minutes." }), login);
router.get("/me", protect, getMe);

module.exports = router;
