import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDF_PATH, STAMP_PATH, hashSources, repoFile } from './cv-sources.mjs'

/*
 * Regenerates public/aaron-chartrand-cv.pdf, the file the CV's download button
 * hands over.
 *
 * Vercel's Linux build image has no Chrome, so this can't be a build step. It
 * runs here, on a Mac, and the PDF it writes is committed. The output is the
 * browser's own print rendering of the real page — vector type, selectable
 * text, live links — driven by the @media print sheet in src/cv.css. No
 * dependency: it borrows the Chrome that's already installed.
 *
 * Afterwards it stamps a hash of the CV source files, which is how
 * check-cv-pdf.mjs knows the snapshot has fallen behind the page.
 */

const PORT = 4319
const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
]

const vite = repoFile('node_modules/vite/bin/vite.js')
const runVite = (args, opts) => spawn(process.execPath, [vite, ...args], opts)

const die = (msg) => {
  console.error(`\n  ${msg}\n`)
  process.exit(1)
}

const chrome = CHROMES.find(existsSync)
if (!chrome) {
  die('No Chrome found. Install Google Chrome, or add your browser to CHROMES in this file.')
}

/* vite build, not npm run build — npm would run the staleness check first, and
   that's exactly the thing this script is here to satisfy. */
console.log('  Building…')
const build = spawnSync(process.execPath, [vite, 'build'], { stdio: 'inherit' })
if (build.status !== 0) die('Build failed, so there was nothing to print.')

console.log(`  Serving dist on :${PORT}…`)
const server = runVite(['preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const stopServer = () => server.kill()
process.on('exit', stopServer)
/* Ctrl-C would otherwise leave the preview server running, and the next run
   would quietly print from that stale one instead of a fresh build. */
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(1))

let serverExited = false
server.on('exit', () => (serverExited = true))

const url = `http://localhost:${PORT}/cv.html`
let up = false
for (let i = 0; i < 50 && !up; i++) {
  if (serverExited) die(`The preview server quit. Is port ${PORT} already taken?`)
  await new Promise((r) => setTimeout(r, 200))
  up = await fetch(url).then((res) => res.ok).catch(() => false)
}
if (!up) die(`The preview server never came up on :${PORT}.`)

/* A throwaway profile: headless refuses to share a user-data-dir with the
   Chrome window that's probably already open. --virtual-time-budget is what
   waits for the webfont, since --print-to-pdf has no "ready" hook of its own.
   Start from no file, so "the PDF exists afterwards" is proof this run wrote
   it rather than a leftover from the last one. */
rmSync(PDF_PATH, { force: true })
const profile = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
console.log('  Printing…')
const printer = spawn(
  chrome,
  [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${profile}`,
    '--virtual-time-budget=10000',
    '--no-pdf-header-footer',
    `--print-to-pdf=${PDF_PATH}`,
    url,
  ],
  { stdio: 'ignore' }
)

/* Headless writes the file and then sits there instead of exiting, so don't
   wait on the process — wait for the PDF, give it a moment to finish being
   written, and shut Chrome down. */
for (let i = 0; i < 120 && !existsSync(PDF_PATH); i++) {
  await new Promise((r) => setTimeout(r, 500))
}
if (existsSync(PDF_PATH)) await new Promise((r) => setTimeout(r, 1000))
printer.kill()
await new Promise((r) => printer.once('exit', r))
/* Chrome is still flushing its profile as it goes down, hence the retries. */
rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 200 })
stopServer()

if (!existsSync(PDF_PATH)) die('Chrome did not write a PDF.')

writeFileSync(
  STAMP_PATH,
  `${JSON.stringify({ generated: new Date().toISOString(), sources: hashSources() }, null, 2)}\n`
)

const kb = Math.round(statSync(PDF_PATH).size / 1024)
console.log(`\n  public/aaron-chartrand-cv.pdf — ${kb} KB. Commit it alongside the CV change.\n`)
