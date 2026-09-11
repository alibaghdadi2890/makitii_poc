# Makitii POC — Backend Design

Date: 2026-09-11
Status: Approved

## Goal

Replace the POC's static data modules with a real Node + SQLite backend covering
authentication, ad posting with photo upload, the category taxonomy, and ad retrieval.
The front end keeps its current look and behaviour but reads everything from the API.

## Stack

- **Node + Express 5**, plain ESM JavaScript — no build step; `node --watch` handles reload.
- **`node:sqlite`** (built into Node 22.5+). Zero native compilation, which matters on
  Windows. It prints an experimental warning; suppressed at startup. Swapping to
  `better-sqlite3` later means changing only `db.js`, at the cost of a native build.
- **multer** for multipart uploads, **sharp** (already a dependency) to normalise images.
- No JWT or bcrypt library: OTP authentication means there are no passwords to store.

## Image storage

Uploaded files are written to `server/uploads/<uuid>.webp` and the database stores only the
filename. Express serves the directory statically at `/uploads`.

Chosen over SQLite BLOBs because it keeps the database small and fast, needs no
image-streaming endpoint, is trivial to inspect, and matches the shape of production — the
local directory becomes an object-store bucket later without a schema change. The cost is
that rows and files can drift, so deleting an ad must delete its files too.

Every upload is re-encoded through sharp to 900×675 WebP regardless of what was sent. That
caps file size, strips metadata, normalises aspect ratio for the card grid, and means a
malformed image fails at upload rather than in someone's browser.

## Schema

| Table | Purpose |
|---|---|
| `users` | id, full_name, email, phone, created_at. Email and phone are each unique when present. |
| `otp_codes` | identifier, code, purpose, pending full_name, expires_at, consumed_at |
| `sessions` | opaque token, user_id, created_at, expires_at |
| `categories` | id, slug, name_fr, name_en, icon, hue, position |
| `subcategories` | id, category_id, slug, name_fr, name_en, position |
| `ads` | id, slug, user_id, category_id, subcategory_id, bilingual title/description, price_gnf, negotiable, condition, location, status, featured, created_at |
| `ad_attributes` | ad_id, label_fr, label_en, value, position |
| `photos` | id, ad_id, filename, position, and the four credit fields for seeded imagery |

The six seeded sellers become real `users` rows, so seller details always come from one
place rather than being duplicated onto every ad.

## API

All routes under `/api`. Authenticated routes take `Authorization: Bearer <token>`.

**Auth**
- `POST /auth/request-otp` — `{ identifier, fullName?, mode: 'register' | 'login' }`.
  Register requires a full name and an unused identifier; login requires an existing user.
  Responds with the code in development so the demo is self-explanatory.
- `POST /auth/verify-otp` — `{ identifier, code }` → `{ token, user }`. Code is always
  `1234`, valid ten minutes, single use.
- `GET /auth/me`, `POST /auth/logout`

**Catalog**
- `GET /categories` — full taxonomy with subcategories and live ad counts.

**Ads**
- `GET /ads` — `category`, `sub`, `q`, `location`, `condition`, `maxPrice`, `sort`,
  `limit`, `offset` → `{ items, total }`
- `GET /ads/:slug` — ad with photos, attributes and seller
- `POST /ads` — authenticated, multipart, up to 6 images of 5 MB each
- `GET /ads/mine` — the signed-in user's listings

Identifiers are normalised before storage and lookup: emails lowercased and trimmed, phone
numbers reduced to digits, so `+224 622 45 18 90` and `0622451890` resolve to one account.

## Front-end changes

- `src/api/client.ts` — typed fetch wrapper that attaches the bearer token and unwraps errors.
- `src/api/hooks.ts` — `useCategories`, `useAds`, `useAd` using `useEffect` and local state.
  No data-fetching library; the existing skeletons become real loading states.
- `src/auth/AuthContext.tsx` — token in `localStorage`, current user, sign in and out.
- **Login and register become a two-step OTP flow.** The current password fields disappear;
  step one takes an identifier (plus full name when registering), step two a four-digit code.
- `PostAd` submits real multipart data and requires a signed-in user.
- `src/data/*` is no longer read by the application. It remains in the repository as the
  input to the seed script.

## Seeding

`server/src/seed.js` imports the existing taxonomy, the 59 listings and
`src/data/photos.json`, copies the 173 photos into `server/uploads`, and writes every row.
It is idempotent: running it again on a populated database is a no-op unless `--reset` is
passed.

## Dev workflow

`npm run dev` runs the API on 3001 and Vite on 5173 concurrently. Vite proxies `/api` and
`/uploads` to the API, so the browser sees a single origin and there is no CORS handling.

## Explicitly out of scope

Password authentication, real SMS or email delivery, refresh tokens, rate limiting,
pagination UI, ad editing and deletion, image reordering after upload, and admin moderation.
This is a prototype: the OTP is hard-coded and sessions never rotate.
