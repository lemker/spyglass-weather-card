// Run with: node --test tests/localization.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { Script, createContext } = require('node:vm');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '..', 'spyglass-weather-card.js'), 'utf8');
const start = source.indexOf('const SPYGLASS_DE = ');
const end = source.indexOf('/* Layout for the header', start);
assert.ok(start >= 0 && end > start, 'localization helpers must exist');
// Evaluate only the pure localization helpers, not Home Assistant/DOM code.
const context = createContext({});
new Script(source.slice(start, end) +
  '\nthis.l10n = { spyglassT, spyglassTf, spyglassIsGerman, spyglassEditorSchema };')
  .runInContext(context);
const { spyglassT: t, spyglassTf: tf, spyglassIsGerman: isGerman, spyglassEditorSchema: schema } = context.l10n;
const de = { locale: { language: 'de-AT', time_format: '24' } };
const en = { locale: { language: 'en-GB', time_format: '24' } };

test('German locale variants are accepted, other languages use English fallback', () => {
  assert.equal(isGerman(de), true);
  assert.equal(isGerman({ language: 'de_DE' }), true);
  assert.equal(isGerman(en), false);
  assert.equal(t(de, 'Sunrise'), 'Sonnenaufgang');
  assert.equal(t(en, 'Sunrise'), 'Sunrise');
  assert.equal(t({ locale: { language: 'fr' } }, 'Sunrise'), 'Sunrise');
});

test('unknown provider summaries are preserved', () => {
  assert.equal(t(de, 'Leichter Regen in 15 Minuten'), 'Leichter Regen in 15 Minuten');
  assert.equal(t(en, 'Clear for the hour'), 'Clear for the hour');
});

test('parameterized UI sentences are localized', () => {
  assert.equal(tf(de, 'UV index is currently {value}, {level}.', { value: 4, level: 'mäßig' }),
    'Der UV-Index liegt aktuell bei 4 (mäßig).');
  assert.equal(tf(en, 'UV index is currently {value}, {level}.', { value: 4, level: 'moderate' }),
    'UV index is currently 4, moderate.');
});

test('editor schema is localized without changing option values or original schema', () => {
  const original = [{
    title: 'Appearance', schema: [{
      label: 'Forecast type', helper: 'Defaults to your country\'s scale',
      selector: { select: { options: [{ value: 'daily', label: 'Daily' }] } },
    }],
  }];
  const localized = schema(original, de);
  assert.equal(localized[0].title, 'Darstellung');
  assert.equal(localized[0].schema[0].label, 'Vorhersagetyp');
  assert.equal(localized[0].schema[0].selector.select.options[0].label, 'Täglich');
  assert.equal(localized[0].schema[0].selector.select.options[0].value, 'daily');
  assert.equal(original[0].title, 'Appearance');
  assert.equal(schema(original, en)[0].title, 'Appearance');
});
