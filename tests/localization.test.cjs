// Run with: npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { Script, createContext } = require('node:vm');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const source = readFileSync(join(ROOT, 'spyglass-weather-card.js'), 'utf8');
const begin = source.indexOf('/* BEGIN GENERATED LOCALES (npm run build) */');
const end = source.indexOf('/* Layout for the header', begin);
assert.ok(begin >= 0 && end > begin, 'generated localization helpers must exist');

// Test only the pure i18n helpers, without requiring a Home Assistant DOM.
const context = createContext({});
new Script(source.slice(begin, end) +
  '\nthis.l10n = { spyglassLanguage, spyglassT, spyglassTf, spyglassEditorSchema, SPYGLASS_LOCALES };')
  .runInContext(context);
const { spyglassLanguage: language, spyglassT: t, spyglassTf: tf,
  spyglassEditorSchema: schema, SPYGLASS_LOCALES: bundled } = context.l10n;
const de = { locale: { language: 'de-AT', time_format: '24' } };
const en = { locale: { language: 'en-GB', time_format: '24' } };

test('language selection supports exact tags, base languages and English fallback', () => {
  assert.equal(language(de), 'de');
  assert.equal(language({ language: 'de_DE' }), 'de');
  assert.equal(language(en), 'en');
  assert.equal(language({ locale: { language: 'fr-CA' } }), 'en');
  assert.equal(language({}), 'en');
  assert.equal(t(de, 'Sunrise'), 'Sonnenaufgang');
  assert.equal(t(en, 'Sunrise'), 'Sunrise');
});

test('provider summaries remain untouched and parameterized text is safe', () => {
  assert.equal(t(de, 'Leichter Regen in 15 Minuten'), 'Leichter Regen in 15 Minuten');
  assert.equal(tf(de, 'UV index is currently {value}, {level}.',
    { value: 4, level: 'mäßig' }), 'Der UV-Index liegt aktuell bei 4 (mäßig).');
  assert.equal(tf(en, 'UV index is currently {value}, {level}.',
    { value: 4, level: 'moderate' }), 'UV index is currently 4, moderate.');
});

test('user-approved terminology is retained', () => {
  assert.equal(t(de, 'Waxing gibbous'), 'Zunehmender Dreiviertelmond');
  assert.equal(t(de, 'Waning gibbous'), 'Abnehmender Dreiviertelmond');
  assert.equal(t(de, 'Fair'), 'Akzeptabel');
  assert.equal(t(de, 'Unhealthy (sens.)'), 'Ungesund (sens.)');
  assert.equal(t(de, 'Sleet'), 'Schneeregen');
  assert.equal(t(de, 'Solar'), 'Sonneneinstrahlung');
  assert.equal(t(de, 'Low'), 'Niedrig');
  assert.equal(t(de, 'High'), 'Hoch');
});

test('editor schema is localized recursively without mutating option values', () => {
  const original = [{
    title: 'Appearance', schema: [{
      label: 'Forecast type', helper: 'Defaults to your country\'s scale',
      selector: { select: { options: [{ value: 'daily', label: 'Daily' }] } },
    }],
  }];
  const translated = schema(original, de);
  assert.equal(translated[0].title, 'Darstellung');
  assert.equal(translated[0].schema[0].label, 'Vorhersagetyp');
  assert.equal(translated[0].schema[0].selector.select.options[0].label, 'Täglich');
  assert.equal(translated[0].schema[0].selector.select.options[0].value, 'daily');
  assert.equal(original[0].title, 'Appearance');
  assert.equal(schema(original, en)[0].title, 'Appearance');
});

test('every source language file is included in the built HACS asset', () => {
  const filenames = readdirSync(join(ROOT, 'locales')).filter((name) => name.endsWith('.json'));
  const languages = filenames.map((name) => name.slice(0, -5)).sort();
  assert.deepEqual(Object.keys(bundled).sort(), languages);
  for (const languageCode of languages) {
    const fromFile = JSON.parse(readFileSync(join(ROOT, 'locales', languageCode + '.json'), 'utf8'));
    assert.equal(JSON.stringify(bundled[languageCode]), JSON.stringify(fromFile));
  }
});

test('all locale placeholders agree with their English source', () => {
  const placeholders = (str) => [...str.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)]
    .map((m) => m[1]).sort().join(',');
  for (const [languageCode, values] of Object.entries(bundled)) {
    for (const [key, value] of Object.entries(values)) {
      assert.equal(placeholders(value), placeholders(key), languageCode + ': ' + key);
      assert.ok(Object.prototype.hasOwnProperty.call(bundled.en, key), languageCode + ': ' + key);
    }
  }
});
