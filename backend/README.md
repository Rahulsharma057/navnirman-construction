# VendorWorks — Backend API

Express + MongoDB API for a maintenance/construction vendor's portfolio and
contact website: a business profile (photos + address), service categories,
a searchable work gallery, and customer enquiries — all managed by the
vendor through a JWT-protected admin login. Photos are uploaded straight to
Cloudinary.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit values — Mongo URI, JWT secret, Cloudinary keys
npm run seed            # creates the admin login, default categories, and an empty profile
npm run dev              # starts on http://localhost:5000
```

Admin login credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(used only the first time `npm run seed` runs). This login is the vendor's
own login — from it they manage everything: work photos, categories, their
business profile, and enquiries.

Cloudinary credentials go in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`
and `CLOUDINARY_API_SECRET` — get these from your Cloudinary dashboard.
Uploaded photos land in the `vendorworks/works` and `vendorworks/profile`
folders in that account.

Email notifications are optional — set `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_FROM` / `NOTIFY_EMAIL`) to
have the vendor get an email the moment someone submits the contact form.
Leave them blank and the site works exactly the same — enquiries still
save and show up under `/admin/messages`, they just won't trigger an email.

## API overview

| Method | Route                    | Auth  | Purpose                              |
|--------|---------------------------|-------|---------------------------------------|
| POST   | /api/auth/login            | -     | Admin login, returns JWT              |
| GET    | /api/auth/me                | admin | Current admin profile                 |
| GET    | /api/categories             | -     | List categories (with work counts)    |
| POST   | /api/categories             | admin | Create category                       |
| PUT    | /api/categories/:id          | admin | Update category                       |
| DELETE | /api/categories/:id          | admin | Delete category (blocked if in use)   |
| GET    | /api/works?search=&category=&page=&limit=&featured= | - | List/search/filter work items |
| GET    | /api/works/:id               | -     | Single work item                      |
| POST   | /api/works                    | admin | Create work (multipart, field "images", uploaded to Cloudinary) |
| PUT    | /api/works/:id                 | admin | Update work / add more images / remove images (`removeImages`: JSON array of Cloudinary public IDs) |
| DELETE | /api/works/:id                 | admin | Delete work (also removes its Cloudinary photos) |
| GET    | /api/profile                     | -     | Business profile (name, about, address, phone, whatsapp, logo, cover, photo gallery) |
| PUT    | /api/profile                     | admin | Update profile (multipart fields: "logo", "cover", "gallery"; `removeGallery`: JSON array of public IDs) |
| GET    | /api/testimonials                 | -     | List client testimonials                |
| POST   | /api/testimonials                 | admin | Add a testimonial                        |
| PUT    | /api/testimonials/:id               | admin | Update a testimonial                     |
| DELETE | /api/testimonials/:id               | admin | Delete a testimonial                     |
| POST   | /api/contact                    | -     | Submit an enquiry (also emails the vendor if SMTP is configured) |
| GET    | /api/contact                     | admin | List enquiries                        |
| PATCH  | /api/contact/:id/read              | admin | Mark enquiry as read                  |
| DELETE | /api/contact/:id                    | admin | Delete enquiry                        |
