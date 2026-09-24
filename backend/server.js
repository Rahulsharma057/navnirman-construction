require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const workRoutes = require("./routes/workRoutes");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const tenderRoutes = require("./routes/tenderRoutes");

connectDB();

const app = express();

app.use(
  cors({
    // CLIENT_URL can hold several origins separated by commas
    origin: (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// photos are uploaded straight to Cloudinary (see middleware/upload.js) — no
// local /uploads static folder needed

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/works", workRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/tenders", tenderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
