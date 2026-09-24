// Creates the first admin account, a default set of service categories, and
// the (singleton) business profile document.
// Run once after setting up your .env file:  npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const Category = require("./models/Category");
const Profile = require("./models/Profile");
const Testimonial = require("./models/Testimonial");
const Work = require("./models/Work");

const defaultCategories = [
  { name: "Gate & Fencing", icon: "fence", description: "Gate repair, installation and boundary fencing", order: 5 },
  { name: "Painting", icon: "paint", description: "Interior and exterior painting work", order: 2 },
  { name: "Electrical & Wiring", icon: "bolt", description: "House wiring, fittings and repairs", order: 3 },
  { name: "Road & Paving", icon: "road", description: "Road laying, paving and driveway work", order: 4 },
  { name: "Building Construction", icon: "building", description: "Residential, commercial and government building construction — foundation to finishing", order: 1 },
  { name: "General Maintenance", icon: "tools", description: "Everyday repair and upkeep jobs", order: 6 },
  { name: "Renovation & Repair", icon: "home", description: "Old building repair, waterproofing, tiling and full renovation", order: 2 },
  { name: "Plumbing & Drainage", icon: "plumbing", description: "Water lines, sewer, drainage and sanitary fittings", order: 8 },
];

// Demo projects so the site doesn't look empty on day one. They carry isSample=true —
// replace them with real jobs from /admin/works, then run `npm run clear-samples`.
const sampleWorks = [
  { title: "G+3 Residential Building", cat: "Building Construction", location: "Madangir, South Delhi", clientType: "residential", days: 240, featured: true,
    description: "Complete RCC framed construction of a ground plus three floor residential building — excavation, foundation, columns, slabs, brickwork, plaster and finishing." },
  { title: "Commercial Complex Shell & Core", cat: "Building Construction", location: "Saket, New Delhi", clientType: "commercial", days: 300, featured: true,
    description: "Structure and shell work for a three-storey commercial building with basement parking, staircase cores and lift shafts." },
  { title: "Government School Block Extension", cat: "Building Construction", location: "Dakshinpuri, New Delhi", clientType: "government", days: 150, featured: true,
    description: "Additional classroom block with toilets, electrical wiring and painting, completed within the tender schedule." },
  { title: "Society Boundary Wall & Main Gate", cat: "Gate & Fencing", location: "Dwarka, New Delhi", clientType: "residential", days: 25, featured: false,
    description: "Boundary wall with plaster finish and a fabricated MS main gate with automatic sliding mechanism." },
  { title: "Internal Road & Paver Blocks", cat: "Road & Paving", location: "Lajpat Nagar, New Delhi", clientType: "residential", days: 30, featured: true,
    description: "Sub-base preparation, compaction and interlocking paver block laying for a colony internal road and parking area." },
  { title: "Colony Road Resurfacing", cat: "Road & Paving", location: "Tigri, South Delhi", clientType: "government", days: 20, featured: false,
    description: "Bituminous resurfacing and kerb repair for a 600 m colony road stretch." },
  { title: "Full Exterior & Interior Painting", cat: "Painting", location: "Greater Kailash, New Delhi", clientType: "residential", days: 18, featured: false,
    description: "Putty, primer and two coats of weather-proof emulsion on the exterior; premium emulsion for all interior rooms." },
  { title: "Office Rewiring & Panel Upgrade", cat: "Electrical & Wiring", location: "Nehru Place, New Delhi", clientType: "commercial", days: 12, featured: false,
    description: "Concealed conduit wiring, DB and MCB panel replacement and LED lighting for a 4,000 sq ft office." },
  { title: "Old House Renovation & Waterproofing", cat: "Renovation & Repair", location: "Malviya Nagar, New Delhi", clientType: "residential", days: 60, featured: true,
    description: "Structural crack repair, terrace waterproofing, new flooring, bathrooms and kitchen renovation of a 30-year-old house." },
  { title: "Sewer Line & Drainage Work", cat: "Plumbing & Drainage", location: "Sangam Vihar, New Delhi", clientType: "government", days: 35, featured: false,
    description: "Laying of RCC sewer pipes with manholes and storm-water drain connection for a residential lane." },
  { title: "Factory Shed & Compound Wall", cat: "General Maintenance", location: "Okhla Industrial Area, New Delhi", clientType: "commercial", days: 45, featured: false,
    description: "Steel roof shed repair, flooring and compound wall work for a small manufacturing unit." },
  { title: "Community Park Fencing & Pathways", cat: "Gate & Fencing", location: "Chattarpur, New Delhi", clientType: "government", days: 22, featured: false,
    description: "Chain-link and MS grill fencing with paver pathways and entry gates for a community park." },
];

const slugify = (t) =>
  t.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({
      name: process.env.ADMIN_NAME || "Vendor Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "changeme123",
    });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  for (const cat of defaultCategories) {
    const found = await Category.findOne({ slug: slugify(cat.name) });
    if (!found) {
      await Category.create({ ...cat, slug: slugify(cat.name) });
      console.log(`Category created: ${cat.name}`);
    }
  }
  console.log("Note: add as many more categories as your business actually offers from /admin/categories — these six are just a starting point.");

  // business profile — defaults come from the GST certificate (see models/Profile.js)
  const profile = await Profile.findOne();
  if (!profile) {
    await Profile.create({});
    console.log("Business profile created (Navnirman Construction) — add phone / email / logo from /admin/profile");
  }

  // demo projects (only on a fresh database)
  if ((await Work.countDocuments()) === 0) {
    const cats = Object.fromEntries((await Category.find()).map((c) => [c.name, c._id]));
    const now = Date.now();
    await Work.insertMany(
      sampleWorks.map((w, i) => ({
        title: w.title,
        description: w.description,
        category: cats[w.cat],
        location: w.location,
        clientType: w.clientType,
        durationDays: w.days,
        featured: w.featured,
        status: "completed",
        completedOn: new Date(now - (i + 1) * 45 * 24 * 60 * 60 * 1000),
        isSample: true,
      }))
    );
    console.log(`${sampleWorks.length} SAMPLE projects created — replace with your real jobs, then run: npm run clear-samples`);
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      {
        clientName: "Sample Client — edit or delete from /admin/testimonials",
        workLocation: "Delhi",
        message: "Replace this with a real review from a customer once you have one — add it from the admin panel.",
        rating: 5,
        order: 1,
      },
    ]);
    console.log("Sample testimonial created — manage real ones from /admin/testimonials");
  }

  console.log("Seed complete");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
