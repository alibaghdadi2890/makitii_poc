/**
 * Renders the running app across viewport widths and reports horizontal
 * overflow — the definitive symptom of a broken responsive layout, and the one
 * thing that is easy to miss by eye because you have to notice the page
 * scrolling sideways.
 *
 *   npm run dev            # in another terminal
 *   npm run audit:responsive
 *
 * Uses playwright-core against a Chromium already cached by Playwright, so it
 * never downloads a browser. Set CHROME_PATH to override the executable.
 */
import { chromium } from 'playwright-core'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

/** Finds a cached Chromium rather than hard-coding a build number. */
function findChromium() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH

  const roots = [
    path.join(homedir(), 'AppData/Local/ms-playwright'),
    path.join(homedir(), '.cache/ms-playwright'),
    path.join(homedir(), 'Library/Caches/ms-playwright'),
  ].filter(existsSync)

  for (const root of roots) {
    const builds = readdirSync(root)
      .filter((d) => d.startsWith('chromium-'))
      .sort()
      .reverse()
    for (const build of builds) {
      for (const rel of [
        'chrome-win64/chrome.exe',
        'chrome-linux/chrome',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      ]) {
        const candidate = path.join(root, build, rel)
        if (existsSync(candidate)) return candidate
      }
    }
  }
  throw new Error('No cached Chromium found. Set CHROME_PATH to a browser executable.')
}

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Android', width: 412, height: 915 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Desktop', width: 1440, height: 900 },
]

const PAGES = [
  ['home', '/'],
  ['category', '/c/electronique'],
  ['ad', '/ad/iphone-15-pro-256'],
  ['post', '/post'],
  ['login', '/login'],
  ['favorites', '/favorites'],
]

const browser = await chromium.launch({ executablePath: findChromium() })
const failures = []

console.log(`\nResponsive audit against ${BASE}\n`)
console.log('viewport'.padEnd(12) + 'width'.padEnd(8) + 'page'.padEnd(12) + 'overflow')
console.log('-'.repeat(46))

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
  })
  const page = await context.newPage()

  for (const [label, url] of PAGES) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)

    const report = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const offenders = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // Fixed overlays and anything clipped by an ancestor are not what makes
        // the document itself scroll sideways.
        if (getComputedStyle(el).position === 'fixed') continue
        if (r.right > vw + 1) {
          offenders.push({
            sel:
              el.tagName.toLowerCase() +
              (typeof el.className === 'string' && el.className
                ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                : ''),
            right: Math.round(r.right),
          })
        }
      }
      offenders.sort((a, b) => b.right - a.right)
      return {
        overflow: document.documentElement.scrollWidth - vw,
        offenders: offenders.slice(0, 3),
      }
    })

    const bad = report.overflow > 0
    if (bad) failures.push({ ...vp, label, ...report })
    console.log(
      vp.name.padEnd(12) +
        String(vp.width).padEnd(8) +
        label.padEnd(12) +
        (bad ? `${report.overflow}px  <-- OVERFLOW` : '0'),
    )
    if (bad) for (const o of report.offenders) console.log(`      ${o.sel} (right=${o.right})`)
  }
  await context.close()
}

await browser.close()

if (failures.length > 0) {
  console.log(`\n${failures.length} viewport/page combination(s) overflow horizontally.\n`)
  process.exit(1)
}
console.log('\nNo horizontal overflow at any tested width.\n')
