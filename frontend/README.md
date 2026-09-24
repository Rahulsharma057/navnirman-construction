# VendorWorks — Frontend

Next.js (App Router) + MUI v5 + TanStack Query site for a maintenance and
construction vendor: portfolio gallery with search & category filters, a
contact form, and an admin dashboard to manage everything.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev                         # http://localhost:3000
```

Make sure the backend is running and seeded first (see backend/README.md) —
the home page pulls categories and work items live from the API.

## Pages

- `/` — hero, services, featured work, "Who we are" (business profile with photos & address), contact form
- `/works` — searchable, filterable, paginated work gallery
- `/works/[id]` — single job with photo gallery
- `/admin/login` — vendor/admin sign-in
- `/admin/dashboard` — stats overview
- `/admin/works` — add/edit/delete work items with photo upload (stored on Cloudinary)
- `/admin/categories` — manage service categories (add as many trades as the business actually offers — not limited to the starter six)
- `/admin/profile` — edit business name, about text, address, phone, WhatsApp number, logo, cover photo, and a small photo gallery of the vendor's own work/team
- `/admin/testimonials` — add/edit/delete client reviews shown in the "What clients say" section
- `/admin/messages` — view and manage contact-form enquiries (the vendor also gets an email the moment a new one comes in, if SMTP is configured)

A floating WhatsApp button appears on every public page once a WhatsApp number is set in the business profile.
