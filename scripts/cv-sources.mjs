import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/*
 * Shared between the PDF generator and the staleness check, so both agree on
 * what "the CV changed" means.
 *
 * This package is "type": "module", so __dirname doesn't exist — everything
 * resolves from import.meta.url, the same way vite.config.js does it.
 */

export const repoFile = (file) => fileURLToPath(new URL(`../${file}`, import.meta.url))

/* The files that decide what the printed page looks like. icons.jsx is left
   out on purpose: the only icon on this page sits inside the download button,
   which the print sheet hides. */
export const CV_SOURCES = ['cv.html', 'src/cv.jsx', 'src/cv.css', 'src/components/Cv.jsx']

export const PDF_PATH = repoFile('public/aaron-chartrand-cv.pdf')
export const STAMP_PATH = repoFile('scripts/cv-pdf.stamp.json')

export function hashSources() {
  const hash = createHash('sha256')
  for (const file of CV_SOURCES) {
    hash.update(file)
    hash.update(readFileSync(repoFile(file)))
  }
  return hash.digest('hex')
}
