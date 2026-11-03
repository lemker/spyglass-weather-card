#!/usr/bin/env node
/**
 * Embed locales/*.json into the standalone HACS JavaScript file.
 * No external build dependencies; run: npm run build
 * CI validation without rewriting files: npm run build -- --check
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'spyglass-weather-card.js');
const BEGIN = '/* BEGIN GENERATED LOCALES (npm run build) */';
const END = '/* END GENERATED LOCALES */';
const check = process.argv.includes('--check');

const files = (await readdir(join(ROOT, 'locales')))
  .filter((name) => name.endsWith('.json'))
  .sort();
if (!files.includes('en.json')) throw new Error('Missing locales/en.json (fallback language).');

const locales = {};
const tokens = (text) => [...text.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]).sort().join(',');
for (const name of files) {
  const language = name.slice(0, -5);
  if (!/^[a-z]{2,3}(?:-[a-z0-9]+)*$/.test(language))
    throw new Error(`Invalid locale filename: ${name}. Use language tags such as de.json or pt-br.json.`);
  const content = JSON.parse(await readFile(join(ROOT, 'locales', name), 'utf8'));
  if (!content || typeof content !== 'object' || Array.isArray(content))
    throw new Error(`${name} must contain a JSON object.`);
  for (const [key, value] of Object.entries(content)) {
    if (!key || typeof value !== 'string' || !value.trim())
      throw new Error(`${name}: invalid translation for "${key}".`);
    if (tokens(key) !== tokens(value))
      throw new Error(`${name}: placeholders do not match in "${key}".`);
  }
  locales[language] = content;
}
const english = locales.en;
for (const [key, value] of Object.entries(english)) {
  if (value !== key) throw new Error(`en.json: English fallback must preserve the source string "${key}".`);
}
for (const [language, values] of Object.entries(locales)) {
  for (const key of Object.keys(values)) {
    if (!Object.prototype.hasOwnProperty.call(english, key))
      throw new Error(`${language}.json: unknown translation key "${key}". Add it to en.json first.`);
  }
}
const source = await readFile(DEST, 'utf8');
const start = source.indexOf(BEGIN), end = source.indexOf(END, start + BEGIN.length);
if (start < 0 || end < 0 || source.indexOf(BEGIN, start + BEGIN.length) >= 0 ||
    source.indexOf(END, end + END.length) >= 0)
  throw new Error('Missing or duplicate generated locale markers in spyglass-weather-card.js.');

const embedded = `${BEGIN}\nconst SPYGLASS_LOCALES = Object.freeze(${JSON.stringify(locales, null, 2)});\n${END}`;
const built = source.slice(0, start) + embedded + source.slice(end + END.length);
if (built === source) {
  console.log(`Locale bundle up to date: ${Object.keys(locales).join(', ')}`);
} else if (check) {
  console.error('Locale bundle is out of date. Run "npm run build" and commit spyglass-weather-card.js.');
  process.exitCode = 1;
} else {
  await writeFile(DEST, built, 'utf8');
  console.log(`Updated ${DEST} with locales: ${Object.keys(locales).join(', ')}`);
}
