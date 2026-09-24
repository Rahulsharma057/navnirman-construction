const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: "Not authorized, admin not found" });
    }

    req.admin = admin;
    req.tokenExp = decoded.exp;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, code: "TOKEN_EXPIRED", message: "Session expired, please log in again" });
    }
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };
