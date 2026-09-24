const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(admin._id);
    const { exp } = jwt.decode(token); // seconds since epoch — frontend uses it to auto-logout
    res.json({ success: true, token, expiresAt: exp * 1000, admin });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin, expiresAt: req.tokenExp ? req.tokenExp * 1000 : undefined });
};

module.exports = { login, getMe };
