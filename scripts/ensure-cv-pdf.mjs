import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { CV_SOURCES, PDF_PATH, STAMP_PATH, findChrome, hashSources, repoFile } from './cv-sources.mjs'

/*
 * Keeps the committed CV PDF in step with the CV page, without anyone having to
 * remember to do it.
 *
 * Wired to npm run dev, npm run build, and the pre-commit hook, so it runs at
 * every point the CV could reasonably have changed. When the page and the PDF
 * already agree — the overwhelmingly common case — it costs one hash of four
 * files and says nothing at all.
 *
 * When they disagree it regenerates, except on Vercel, whose build image has no
 * Chrome to print with. There it can only refuse, which is the right answer:
 * failing the deploy beats handing a recruiter a stale CV.
 */

const staleBecause = () => {
  if (!existsSync(PDF_PATH)) return 'no PDF has been generated yet'
  if (!existsSync(STAMP_PATH)) return 'the stamp recording what it was generated from is missing'
  const stamp = JSON.parse(readFileSync(STAMP_PATH, 'utf8'))
  if (stamp.sources === hashSources()) return null
  return `the CV changed since the PDF was generated on ${stamp.generated.slice(0, 10)}`
}

const reason = staleBecause()
if (!reason) process.exit(0)

const chrome = !process.env.CI && findChrome()
if (!chrome) {
  console.error(
    [
      '',
      `  CV PDF is out of date: ${reason}`,
      '',
      '  The download button serves a committed file, and there is no Chrome',
      '  here to print a new one with. Regenerate it on your Mac and commit',
      '  the result:',
      '',
      '      npm run cv:pdf',
      '',
      `  Watched: ${CV_SOURCES.join(', ')}`,
      '',
    ].join('\n')
  )
  process.exit(1)
}

console.log(`\n  The CV changed, so the download PDF is being rebuilt to match.`)
const run = spawnSync(process.execPath, [repoFile('scripts/cv-pdf.mjs')], { stdio: 'inherit' })
process.exit(run.status ?? 1)
