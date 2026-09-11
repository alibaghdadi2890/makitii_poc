import { Router } from 'express'
import { db } from '../db.js'

export const categoryRoutes = Router()

categoryRoutes.get('/', (_req, res) => {
  const categories = db
    .prepare('SELECT * FROM categories ORDER BY position')
    .all()
  const subs = db
    .prepare('SELECT * FROM subcategories ORDER BY category_id, position')
    .all()

  // Counts for the whole taxonomy in two queries rather than one per row.
  const byCategory = new Map(
    db
      .prepare(
        "SELECT category_id AS id, COUNT(*) AS n FROM ads WHERE status = 'active' GROUP BY category_id",
      )
      .all()
      .map((r) => [r.id, r.n]),
  )
  const bySub = new Map(
    db
      .prepare(
        `SELECT subcategory_id AS id, COUNT(*) AS n FROM ads
         WHERE status = 'active' AND subcategory_id IS NOT NULL
         GROUP BY subcategory_id`,
      )
      .all()
      .map((r) => [r.id, r.n]),
  )

  res.json({
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      fr: c.name_fr,
      en: c.name_en,
      icon: c.icon,
      hue: c.hue,
      adCount: byCategory.get(c.id) ?? 0,
      children: subs
        .filter((s) => s.category_id === c.id)
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          fr: s.name_fr,
          en: s.name_en,
          adCount: bySub.get(s.id) ?? 0,
        })),
    })),
  })
})
