#!/usr/bin/env node
// scripts/check-locales.mjs
//
// Locale parity check. Flattens i18n/locales/en.json and fr.json to dotted
// key paths and reports:
//   - keys present in en.json but missing from fr.json
//   - keys present in fr.json but missing from en.json
//   - keys whose French value is byte-identical to the English value
//     (a likely untranslated paste — reported as a warning, not a failure,
//     since some strings legitimately match, e.g. "Klea", "API")
//
// Exits non-zero only when either missing-key list is non-empty. The
// identical-value warning never affects the exit code — it exists so a
// human can judge whether a match is legitimate or copy-pasted.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EN_PATH = join(__dirname, '..', 'i18n', 'locales', 'en.json')
const FR_PATH = join(__dirname, '..', 'i18n', 'locales', 'fr.json')

/**
 * Flatten a nested object to a Map of dotted key path -> string value.
 */
function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out)
    } else {
      out.set(path, value)
    }
  }
  return out
}

function loadFlat(path) {
  const raw = readFileSync(path, 'utf8')
  const json = JSON.parse(raw)
  return flatten(json)
}

const en = loadFlat(EN_PATH)
const fr = loadFlat(FR_PATH)

const missingInFr = [...en.keys()].filter((k) => !fr.has(k)).sort()
const missingInEn = [...fr.keys()].filter((k) => !en.has(k)).sort()

const identical = [...en.keys()]
  .filter((k) => fr.has(k))
  .filter((k) => String(en.get(k)) === String(fr.get(k)))
  .sort()

console.log('Locale parity check: i18n/locales/en.json <-> i18n/locales/fr.json')
console.log('')
console.log(`en.json keys: ${en.size}`)
console.log(`fr.json keys: ${fr.size}`)
console.log('')

if (missingInFr.length > 0) {
  console.log(`MISSING IN fr.json (${missingInFr.length}):`)
  for (const k of missingInFr) console.log(`  - ${k}`)
  console.log('')
} else {
  console.log('MISSING IN fr.json: none')
  console.log('')
}

if (missingInEn.length > 0) {
  console.log(`MISSING IN en.json (${missingInEn.length}):`)
  for (const k of missingInEn) console.log(`  - ${k}`)
  console.log('')
} else {
  console.log('MISSING IN en.json: none')
  console.log('')
}

if (identical.length > 0) {
  console.log(`WARNING — identical value in both locales (${identical.length}):`)
  for (const k of identical) console.log(`  - ${k}: "${en.get(k)}"`)
  console.log('')
} else {
  console.log('WARNING — identical value in both locales: none')
  console.log('')
}

const failed = missingInFr.length > 0 || missingInEn.length > 0

if (failed) {
  console.error('FAIL: locale files are out of sync (missing keys above).')
  process.exit(1)
} else {
  console.log('PASS: en.json and fr.json have identical key sets.')
  process.exit(0)
}
