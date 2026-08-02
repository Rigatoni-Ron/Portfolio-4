import { existsSync, readFileSync } from 'node:fs'
import { CV_SOURCES, PDF_PATH, STAMP_PATH, hashSources } from './cv-sources.mjs'

/*
 * Runs as `prebuild`, so it fires on every `npm run build` — locally and on
 * Vercel. The committed PDF is a snapshot; this is what stops an edited CV
 * from shipping with last month's download attached to it.
 */

const fail = (reason) => {
  console.error(
    [
      '',
      `  CV PDF is out of date: ${reason}`,
      '',
      '  The download button serves a committed file, so it has to be',
      '  regenerated whenever the CV changes:',
      '',
      '      npm run cv:pdf',
      '',
      `  Watched: ${CV_SOURCES.join(', ')}`,
      '',
    ].join('\n')
  )
  process.exit(1)
}

if (!existsSync(PDF_PATH)) fail('public/aaron-chartrand-cv.pdf is missing')
if (!existsSync(STAMP_PATH)) fail('scripts/cv-pdf.stamp.json is missing')

const stamp = JSON.parse(readFileSync(STAMP_PATH, 'utf8'))

if (stamp.sources !== hashSources()) {
  fail(`the CV changed since the PDF was generated on ${stamp.generated.slice(0, 10)}`)
}
