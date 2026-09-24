# Navnirman Construction — Website, Admin & Tender Tracker

Ek full-stack website: aapke client (jo gate repair, painting, fencing,
wiring, road aur building construction ka kaam karte hain) ke liye —
customers contact kar sakein, aur vo apna completed kaam gallery mein daal
sakein (search + category filter ke saath).

## Structure

```
vendorworks/
  backend/    Node.js + Express + MongoDB API
  frontend/   Next.js (App Router) + MUI v5 website
```

## Quick Start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# .env mein MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD aur
# CLOUDINARY_* values set karein (aapke Cloudinary credentials backend/.env
# mein already daale hue hain, ready to run). Email notification chahiye to
# SMTP_* values bhi bhar dein — optional hai, blank rehne par sab kuch waise
# hi chalega bas email nahi jayega.
npm run seed     # admin login + default categories + sample testimonial bana dega
npm run dev      # http://localhost:5000
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev      # http://localhost:3000
```

Website `/` par khulegi. Admin panel `/admin/login` par hai — jo credentials
`.env` mein `ADMIN_EMAIL` / `ADMIN_PASSWORD` diye the, unse login karein.

## Kya-kya bana hai

- **Home page** — hero, services (categories), "Who we are" (vendor ka
  business profile — logo, cover photo, apni team/kaam ki photos, address),
  recent completed work, contact form
- **/works** — search + category filter + pagination ke saath poori work
  gallery
- **/works/[id]** — ek job ki detail page, photo gallery ke saath
- **Admin dashboard** (`/admin/*`) — yahi vendor ka login hai:
  - work items add/edit/delete (photo upload ke saath — Cloudinary par store
    hoti hain)
  - categories manage — aapke business ki jitni bhi services hain, sab add
    kar sakte hain, sirf 6 tak limited nahi
  - **Business Profile** — apna business name, about, address, phone,
    WhatsApp number, logo, cover photo, aur apni/team ki photos daal sakte
    hain
  - **Testimonials** — clients ki reviews add/edit/delete karna, jo site pe
    "What clients say" section mein dikhti hain
  - customer enquiries dekhna — naya enquiry aane par (agar email set kiya
    hai to) vendor ko turant email bhi chala jaata hai
- Floating **WhatsApp button** har public page pe dikhta hai (jab profile
  mein WhatsApp number daala ho) — customer ek click mein chat kar sakta hai
- Scroll karte hue sections/cards dheere-dheere visible hote hain
  (fade-in), sticky navbar, fast — koi heavy animation library nahi use ki
- Design custom hai: rust/steel color palette + blueprint-grid background —
  generic template jaisa nahi

## Production ke liye notes

- Photos ab **Cloudinary** par store hoti hain (aapke diye hue credentials
  `.env` mein daal diye hain) — local server storage ki zaroorat nahi,
  isliye Vercel/Render jaise host par bhi photos delete nahi hongi.
- `frontend/app/globals.css` mein system fonts use kiye hain taaki build
  bina internet ke bhi chale. Agar aap Archivo/Work Sans wala exact look
  chahte hain, un fonts ki `.woff2` files `frontend/public/fonts/` mein
  daal kar `@font-face` add kar dein — comment already file mein likha hai.
- `JWT_SECRET` aur `ADMIN_PASSWORD` production mein zaroor change karein.
- Aapne jo Cloudinary API secret chat mein share kiya, wo `backend/.env`
  mein already hai (yeh file git mein commit nahi hoti — `.gitignore` mein
  hai). Phir bhi, chat mein secret share hone ki wajah se better rahega ki
  aap Cloudinary dashboard se ek naya API secret generate kar lein jab
  convenient ho.


## Navnirman Construction update — kya naya hai

- **Branding**: Navnirman Construction (owner: Rakesh Kumar) ka logo (`frontend/public/logo.svg`, favicon `frontend/app/icon.svg`), navbar, footer, admin — sab jagah. Admin se apna asli logo upload karoge to wahi dikhega.
- **GST details** (GSTIN 07AJBPR2279N1ZO, trade name, proprietorship, registered since 28/07/2017, address) profile mein pehle se bhare hain — `/admin/profile` > *GST & registration*. PAN / Udyam / contractor class wahin add karo.
- **Company Profile page** (`/company-profile`): printable capability statement. *Download PDF* (Save as PDF), WhatsApp / Email / Copy link se tender ke saath bhej sakte ho.
- **Tenders** (`/admin/tenders`): tender add karo (authority, deadline, EMD, quote), status (Identified → Preparing → Submitted → Won/Lost), documents checklist, deadline countdown, dashboard par "due within 7 days".
- **Projects**: `npm run seed` 12 SAMPLE projects (buildings, roads, painting, renovation…) bana deta hai taaki site khaali na dikhe. Asli jobs `/admin/works` se daalo, phir `npm run clear-samples` chalao.
- **Token expiry**: login token ab 1 din ka (`JWT_EXPIRES_IN`), admin session expire hote hi auto-logout + "session expired" message. Login par rate-limit.

## Bugs fixed

- Admin panel mobile par navigation gayab tha — ab top bar + drawer.
- Work detail page bina photo wale project par crash hota tha.
- Profile save par "Years of experience" khaali chhodne se error aata tha.
- Search sirf poore shabd match karta tha ("gat" se "gate" nahi milta) — ab partial search.
- Kisi optional field (location, date…) ko edit karke khaali karna kaam nahi karta tha.
- Contact enquiry email mein customer ka text escape nahi hota tha (HTML injection); email fail hone par server crash-prone tha; phone validation add.
- Galat ID (`/api/works/xyz`) par 500 aata tha — ab proper 400/404. Multer / validation errors bhi saaf message dete hain.
- Contact page par galat (schedule) icon, fake phone/email fallback; hard-coded "Aligarh since 2011", "500+ jobs", "13 years" hata diye — ab real data.
- Corrupt localStorage se admin layout crash ho sakta tha.
