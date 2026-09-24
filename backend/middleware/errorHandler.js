const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    // e.g. /api/works/not-a-real-id
    status = 400;
    message = `Invalid ${err.path || "id"}`;
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.code === 11000) {
    status = 400;
    message = "This value already exists";
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Each photo must be 5 MB or smaller" : err.message;
  } else if (err.message && err.message.startsWith("Only image files")) {
    status = 400;
  }

  if (status >= 500) console.error(err.stack);
  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
