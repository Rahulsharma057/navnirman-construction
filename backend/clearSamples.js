// Removes the demo projects created by `npm run seed` (isSample = true).
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Work = require("./models/Work");

(async () => {
  await connectDB();
  const res = await Work.deleteMany({ isSample: true });
  console.log(`Removed ${res.deletedCount} sample project(s)`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
