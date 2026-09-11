# Makitii — POC

A proof-of-concept classified-ads marketplace for Conakry, Guinea. React front end,
Node + SQLite back end, bilingual (French default, English switchable), prices in Guinean
francs.

## Running it

```bash
npm install
npm run seed     # loads 12 categories, 59 listings and 173 photos into SQLite
npm run dev      # API on :3001, web on :5173
```

Then open <http://localhost:5173>. Vite proxies `/api` and `/uploads` to the API, so the
browser only ever talks to one origin.

| Script | Does |
|---|---|
| `npm run dev` | Runs the API and the web app together |
| `npm run dev:api` | API only, with `--watch` reload |
| `npm run dev:web` | Vite only |
| `npm run seed` | Seeds the database if it is empty |
| `npm run seed:reset` | Wipes and rebuilds the database and uploads |
| `npm run build` | Type-checks and builds the front end |

## Signing in

Authentication is a mocked OTP flow. Register with a full name and an email or Guinean
phone number, then enter **`1234`** — the code is fixed and shown on screen. Phone numbers
are normalised, so `+224 622 45 18 90`, `00224622451890` and `0622451890` all reach the same
account. Posting an ad requires an account; browsing does not.

## Layout

```
server/
  src/index.js         Express app, static /uploads, error handling
  src/schema.sql       Tables (applied on every boot, idempotent)
  src/db.js            node:sqlite connection and transaction helper
  src/auth.js          OTP issue/verify, sessions, identifier normalisation
  src/images.js        multer + sharp upload pipeline
  src/routes/          auth, categories, ads
  src/seed.js          Imports src/data/* into the database
  uploads/             Uploaded and seeded images (gitignored)
  makitii.db           SQLite database (gitignored)
src/
  api/                 Fetch client, hooks, catalog context
  auth/                Session context
  components/          Layout, cards, images, toasts
  pages/               Home, Category, AdDetail, PostAd, Auth, Favorites, MyAds, Credits
  data/                Original sample data — now only the seed script reads this
  i18n/                FR/EN dictionaries
scripts/fetch-photos.mjs   Rebuilds public/photos from Openverse
```

## Notes and limits

This is a prototype, not a product. In particular:

- The OTP is hard-coded to `1234` and there is no SMS or email delivery.
- Sessions are opaque tokens in the database; they never rotate and are not revoked on
  password change (there are no passwords).
- There is no rate limiting, ad editing or deletion, moderation, or real messaging.
- `node:sqlite` prints an experimental warning on Node 24; it is suppressed via
  `--no-warnings`. Swapping to `better-sqlite3` means changing only `server/src/db.js`, at
  the cost of a native build.
- Photos are stored as files under `server/uploads` with the filename in the database.
  Moving to object storage later is a change to `images.js` and the URL helper, not the
  schema.

Demo photography comes from Openverse under CC0, public-domain, CC-BY and CC-BY-SA
licences. Creator, licence and source for every image are recorded per photo and listed at
`/credits`.
