# Makitii POC — Design Spec

Date: 2026-09-05
Status: Approved

## Goal

A static, backend-free proof of concept for **Makitii**, a classified-ads marketplace for
Conakry, Guinea. It mirrors the layout and information architecture of the reference build at
`mohammadalhourany.net/Makitii/`, then improves on it in a second pass.

## Constraints

- **No backend.** All content comes from typed modules under `src/data/`. Forms validate and
  show success states but persist nothing beyond `localStorage`.
- **Bilingual.** French is the default language, English is switchable. Every user-facing
  string lives in a translation file — no hard-coded copy in components.
- **Currency.** Guinean franc (GNF), formatted `45 000 000 GNF` in FR and `GNF 45,000,000` in EN.
- **Original implementation.** The reference site runs a licensed commercial WordPress theme.
  Layout and proportions are matched by writing our own CSS and components; no theme source,
  photography, or marketing copy is reused.
- **Photography.** Listing photos are openly licensed images fetched from Openverse by
  `scripts/fetch-photos.mjs` and committed under `public/photos`. Licences span CC0, public
  domain, CC-BY and CC-BY-SA, so creator, licence and source are recorded per photo in
  `src/data/photos.json` and surfaced on `/credits` and under each ad's gallery. Generated
  artwork remains as the loading placeholder and fallback.

## Stack

React 18 + Vite + TypeScript. Plain CSS with design tokens in `:root` (no utility framework),
so the refinement pass is a stylesheet edit rather than markup churn. `react-router-dom` for
pages. No state library — a `useAds(filter)` hook reads the static modules.

## Visual system (clone phase)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#242424` | Body text, top bar, footer |
| `--green` | `#318A05` | Primary actions, CTA band |
| `--yellow` | `#FCD116` | Secondary CTA button |
| `--price` | `#FF002E` | Ad prices |
| `--page` | `#F6F6F6` | Page background |
| Font | Poppins | Whole site |

Guinea flag red `#CE1126` / yellow `#FCD116` / green `#009460` accent the hero.

## Page inventory

1. **Home** — top bar (search + category select + auth links + language toggle), header with
   logo and mega-menu, hero, "Why Makitii", "How it works" (4 steps), four ad sections
   (Cars for Sale, Properties, Mobile Phones, Laptops/Tablets/Computers) of four cards each
   with a View All link, green CTA band, footer.
2. **Category** — breadcrumb, result count, filter rail (subcategory, price range, location,
   condition), sort control, responsive card grid, empty state.
3. **Ad detail** — image gallery, title/price/location/date, description, attribute table,
   seller card with reveal-phone and message buttons, safety notice, similar ads.
4. **Post an ad** — multi-step form (category → details → photos → contact) with validation
   and a success screen. Submits nowhere.
5. **Login / Register** — inert forms with validation.

## Data model

```ts
type Category = { id, slug, nameFr, nameEn, icon, children: SubCategory[] }
type Ad = {
  id, slug, categoryId, subCategoryId,
  titleFr, titleEn, descriptionFr, descriptionEn,
  priceGnf, negotiable, condition, location,
  images: string[], postedAt, seller: { name, memberSince, phone, verified },
  featured: boolean
}
```

Roughly five ads per category, with Conakry locations (Kaloum, Ratoma, Matam, Dixinn,
Matoto, Kipé, Lambanyi) and plausible prices.

## Phasing

- **Phase 1 — clone.** Faithful match of the reference layout at 1440px and mobile.
- **Phase 2 — refinements.** Typography scale, card hover/focus states, real empty and loading
  states, mega-menu → drawer on mobile, accessible contrast on the yellow button, sticky
  search on scroll, skeleton shimmer, full keyboard navigation.

Each phase is a separate commit so the two can be compared.

## Out of scope

Payments, chat, real authentication, image upload, SEO/meta work, analytics.
