// Tiny in-memory rate limiter (no extra dependency) — used on /auth/login to
// slow down password guessing. Resets per IP after the window passes.
const hits = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 10, message = "Too many attempts, try again later" } = {}) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      const retry = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retry));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

// keep the map from growing forever
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
}, 10 * 60 * 1000).unref();

module.exports = rateLimit;
