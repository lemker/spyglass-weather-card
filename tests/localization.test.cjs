// Run with: npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { spawnSync } = require('node:child_process');
const { Script, createContext } = require('node:vm');
const { join } = require('node:path');
const createCardHarness = require('./helpers/card-harness.cjs');

const ROOT = join(__dirname, '..');
const source = readFileSync(join(ROOT, 'spyglass-weather-card.js'), 'utf8');
const begin = source.indexOf('/* BEGIN GENERATED LOCALES (npm run build) */');
const end = source.indexOf('/* Layout for the header', begin);
assert.ok(begin >= 0 && end > begin, 'generated localization helpers must exist');

// Test only the pure i18n helpers, without requiring a Home Assistant DOM.
const context = createContext({});
new Script(source.slice(begin, end) +
  '\nthis.l10n = { spyglassLanguage, spyglassT, spyglassTf, spyglassEditorSchema, spyglassNumberFormatter, SPYGLASS_LOCALES };')
  .runInContext(context);
const { spyglassLanguage: language, spyglassT: t, spyglassTf: tf,
  spyglassEditorSchema: schema, spyglassNumberFormatter: numberFormatter, SPYGLASS_LOCALES: bundled } = context.l10n;
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

test('card renders locale changes even with unchanged watched states', () => {
  const { card, hass } = createCardHarness();
  let updates = 0;
  const update = card._update;
  card._update = function () { updates++; update.call(this); };
  card.hass = hass;
  assert.equal(updates, 1);
  const originalContext = card._ctx;
  card.hass = { ...hass, locale: { ...hass.locale } };
  assert.equal(updates, 1, 'identical settings and states should skip rendering');
  for (const [key, value] of [
    ['language', 'de-AT'], ['language', 'de-DE'], ['time_format', '24'],
    ['number_format', 'decimal_comma'], ['language', 'fr-FR'],
  ]) {
    const before = updates;
    hass.locale[key] = value;
    card.hass = hass;
    assert.equal(updates, before + 1, `${key} must be detected even when hass is mutated in place`);
    assert.equal(card._ctx, originalContext, 'locale changes must preserve the card and its data');
    card.hass = { ...hass, locale: { ...hass.locale } };
    assert.equal(updates, before + 1);
  }
  const before = updates;
  card.hass = { ...hass, states: { ...hass.states, 'sensor.unwatched': { state: '1' } } };
  assert.equal(updates, before);
  card.hass = { ...hass, states: { ...hass.states, 'weather.home': { ...hass.states['weather.home'] } } };
  assert.equal(updates, before + 1, 'watched state changes must still render');
});

test('locale changes rebuild chips and forecast labels while retaining subscriptions', () => {
  const { card, hass, subscriptions } = createCardHarness();
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const forecast = [{ datetime: '2026-11-06T12:00:00Z', condition: 'sunny', temperature: 15, templow: 8 }];
  subscriptions.find(({ message }) => message.forecast_type === 'daily').callback({ forecast });
  const originalChip = state.details.firstChild;
  const originalForecast = state.fc.firstChild;
  assert.equal(state.fc.querySelector('.wx-item-label').textContent,
    new Date(forecast[0].datetime).toLocaleDateString('en-GB', { weekday: 'short' }));
  card.hass = { ...hass, locale: { ...hass.locale, language: 'de-AT' } };
  assert.notEqual(state.details.firstChild, originalChip, 'chips need a locale cache key even with identical values');
  assert.notEqual(state.fc.firstChild, originalForecast);
  assert.equal(state.fc.querySelector('.wx-item-label').textContent,
    new Date(forecast[0].datetime).toLocaleDateString('de-AT', { weekday: 'short' }));
  assert.equal(state.items, forecast);
  assert.equal(subscriptions.length, 2, 'daily and hourly subscriptions should be reused');
  const germanChip = state.details.firstChild, germanForecast = state.fc.firstChild;
  card._update();
  assert.equal(state.details.firstChild, germanChip);
  assert.equal(state.fc.firstChild, germanForecast, 'unchanged render signatures should still skip rebuilding');
});

test('hass.language also refreshes forecast dates when hass.locale is absent', () => {
  const { card, hass, subscriptions } = createCardHarness();
  delete hass.locale;
  hass.language = 'en-GB';
  card.hass = hass;
  const forecast = [{ datetime: '2026-11-06T12:00:00Z', condition: 'sunny', temperature: 15 }];
  subscriptions.find(({ message }) => message.forecast_type === 'daily').callback({ forecast });
  assert.equal(card._ctx.card.__wx.fc.querySelector('.wx-item-label').textContent,
    new Date(forecast[0].datetime).toLocaleDateString('en-GB', { weekday: 'short' }));
  hass.language = 'de-DE';
  card.hass = hass;
  assert.equal(card._ctx.card.__wx.fc.querySelector('.wx-item-label').textContent,
    new Date(forecast[0].datetime).toLocaleDateString('de-DE', { weekday: 'short' }));
});

test('an open sun chart refreshes translations and time format without losing its view', () => {
  const { card, hass, subscriptions, now, flushTimers } = createCardHarness();
  card.hass = hass;
  const state = card._ctx.card.__wx;
  state.view = { sun: true, off: 0, at: now };
  state.draw();
  flushTimers();
  const originalView = state.view;
  assert.equal(state.fcHead.querySelector('.wx-fc-title').textContent, 'Back');
  assert.equal(state.fc.querySelector('.wx-sun-k').textContent, 'First light');
  assert.equal(state.fc.querySelector('.wx-sun-axis').textContent, '12 AM');
  for (const languageCode of ['de-AT', 'de-DE', 'fr-FR']) {
    const previousChart = state.fc.firstChild;
    card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
    assert.equal(state.view, originalView);
    assert.notEqual(state.fc.firstChild, previousChart);
    assert.equal(state.fcHead.querySelector('.wx-fc-title').textContent, languageCode.startsWith('de') ? 'Zurück' : 'Back');
    const sunLabels = state.fc.querySelectorAll('.wx-sun-k');
    assert.equal(sunLabels[0].textContent, languageCode.startsWith('de') ? 'Dämmerung' : 'First light');
    assert.equal(sunLabels[3].textContent, languageCode.startsWith('de') ? 'Dämmerung' : 'Last light');
  }
  const previousChart = state.fc.firstChild;
  card.hass = { ...hass, locale: { ...hass.locale, time_format: '24' } };
  assert.notEqual(state.fc.firstChild, previousChart);
  assert.equal(state.fc.querySelector('.wx-sun-axis').textContent, '00:00');
  assert.equal(state.view, originalView);
  const timeFormattedChart = state.fc.firstChild;
  card.hass = { ...hass, locale: { ...hass.locale, time_format: '24', number_format: 'decimal_comma' } };
  assert.notEqual(state.fc.firstChild, timeFormattedChart, 'number format must also invalidate charts');
  assert.equal(subscriptions.length, 2);
});

function openView(harness, view) {
  const state = harness.card._ctx.card.__wx;
  state.view = { ...view, at: harness.now };
  state.sig = null;
  state.draw();
  harness.flushTimers();
  assert.doesNotMatch(state.fc.textContent, /Chart error:|Diagrammfehler:/);
  return state;
}

test('forecast labels, sun hints and day navigation follow the active language', () => {
  for (const languageCode of ['en-GB', 'de-AT', 'de-DE', 'fr-FR']) {
    const german = languageCode.startsWith('de');
    for (const type of ['hourly', 'twice_daily']) {
      const harness = createCardHarness();
      const { card, hass } = harness;
      card.setConfig({ entity: 'weather.home', forecast_type: type, return_home_after: 0 });
      hass.locale.language = languageCode;
      card.hass = hass;
      const state = card._ctx.card.__wx;
      state.items = [{ datetime: new Date(harness.now + 36e5).toISOString(), temperature: 12, is_daytime: false }];
      state.sig = null;
      state.draw();
      const text = state.fc.querySelector('.wx-item-label').textContent;
      if (type === 'hourly') assert.equal(text, german ? 'Jetzt' : 'Now');
      else assert.match(text, german ? / nachts$/ : / night$/);
    }
    const harness = createCardHarness();
    harness.hass.locale.language = languageCode;
    harness.hass.config = { latitude: 48.2, longitude: 16.37 };
    harness.card.hass = harness.hass;
    let state = openView(harness, { sun: true });
    assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent, german ? /^Verbleibendes Tageslicht:/ : /^Daylight remaining:/);
    state = openView(harness, { sun: true, off: -3 });
    assert.match(state.fcHead.querySelector('.wx-daynav-label').textContent, german ? /^Letzten / : /^Last /);
    assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent, german ? /Tageslicht als heute$/ : /daylight than today$/);
  }
});

test('pressure tooltip changes language even when its arrow stays the same', () => {
  const { card, hass, now, historyRequests } = createCardHarness();
  card.setConfig({ entity: 'weather.home', pressure_entity: 'sensor.pressure', return_home_after: 0 });
  hass.states['sensor.pressure'] = { state: '1015', attributes: { unit_of_measurement: 'hPa' } };
  card.hass = hass;
  const state = card._ctx.card.__wx;
  state.prHist = { at: now, pts: [[now - 4 * 36e5, 1010]] };
  card._update();
  assert.equal(state.trend.textContent, '↑');
  assert.equal(state.trend.title, 'Pressure rising 5.0 over 3 h');
  card.hass = { ...hass, locale: { ...hass.locale, language: 'de-AT' } };
  assert.equal(state.trend.textContent, '↑');
  assert.equal(state.trend.title, 'Luftdruck in 3 Std. um 5.0 gestiegen');
  assert.ok(historyRequests.some(({ url }) => url.includes('filter_entity_id=sensor.pressure&')));
});

test('debug controls refresh their formatter closures and preserve technical values', () => {
  const harness = createCardHarness();
  const { card, hass } = harness;
  card.setConfig({ entity: 'weather.home', debug: true, return_home_after: 0 });
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const rain = state.dbgKnobs.find((knob) => knob.key === 'dbgRain');
  rain.el.listeners.click({ stopPropagation() {} });
  assert.equal(rain.el.textContent, 'Rain: None');
  assert.match(state.dbgText.textContent, /sunny · day$/);
  card.hass = { ...hass, locale: { ...hass.locale, language: 'de-DE' } };
  assert.equal(rain.el.textContent, 'Regen: Keine');
  assert.match(state.dbgText.textContent, /sunny · Tag$/);
  assert.equal(state.alertText.textContent, 'Hitzewarnung (Beispiel)');
  assert.equal(rain.key, 'dbgRain');
  assert.equal(state.dbgRain, 0);
  state.dbgKnobs.find((knob) => knob.key === 'dbgDir').el.listeners.click({ stopPropagation() {} });
  assert.equal(state.dbgDir, 'W');
  assert.equal(state.dbgKnobs.find((knob) => knob.key === 'dbgDir').el.textContent, 'Bewegung ⇢');
});

test('solar and dew point charts render complete translated summaries and readouts', () => {
  const harness = createCardHarness();
  const { card, hass, now } = harness;
  card.setConfig({ entity: 'weather.home', return_home_after: 0, details: {
    solar: 'sensor.solar', dew_point: 'sensor.dew', humidity: 'sensor.humidity',
  } });
  hass.states['sensor.solar'] = { state: '400', attributes: { unit_of_measurement: 'W/m²' } };
  hass.states['sensor.dew'] = { state: '17', attributes: { unit_of_measurement: '°C' } };
  hass.states['sensor.humidity'] = { state: '65', attributes: { unit_of_measurement: '%' } };
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const day0 = new Date(now).setHours(0, 0, 0, 0);
  const history = (off, values) => ({ at: now, pts: values.map((value, i) => [day0 + off * 864e5 + (i + 1) * 36e5, value]) });
  for (const off of [0, -1]) {
    state[off ? 'sHist_-1' : 'sHist'] = history(off, [100, 400]);
    state[off ? 'dHist_-1' : 'dHist'] = history(off, [12, 20]);
    state[off ? 'hHist_-1' : 'hHist'] = history(off, [55, 65]);
  }
  for (const languageCode of ['en-GB', 'de-AT', 'de-DE', 'fr-FR']) {
    const german = languageCode.startsWith('de');
    card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
    openView(harness, { solar: true });
    const solar = state.fc.querySelector('.wx-wind-summary').textContent;
    assert.match(solar, german ? /Aktuelle Sonneneinstrahlung: 400 W\/m² \(stark\)\./ : /Solar irradiance is currently 400 W\/m² \(strong\)\./);
    assert.match(solar, german ? /Bisher eingestrahlte Energie:/ : /Solar energy so far:/);
    openView(harness, { solar: true, off: -1 });
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Höchste Sonneneinstrahlung: 400 W\/m²\./ : /Solar irradiance peaked at 400 W\/m²\./);
    openView(harness, { dew: true });
    const dew = state.fc.querySelector('.wx-wind-summary').textContent;
    assert.match(dew, german ? /Taupunkt liegt aktuell/ : /Dew point is currently/);
    assert.match(dew, german ? /12° bis 20°/ : /12° to 20°/);
    assert.match(state.fc.querySelector('svg').__scrub.fmt(17, now), german ? /65% Luftfeuchtigkeit/ : /65% humidity/);
    openView(harness, { dew: true, off: -1 });
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Die Luft ist angenehm bis schwül\./ : /Conditions range from comfortable to humid\./);
  }
});

test('wind gusts, smoke and UV advice are translated in charts and drag readouts', () => {
  const harness = createCardHarness();
  const { card, hass, now } = harness;
  card.setConfig({ entity: 'weather.home', return_home_after: 0, details: {
    wind: true, gust: 'sensor.gust', aqi: 'sensor.aqi', smoke: 'sensor.smoke', uv: 'sensor.uv',
  } });
  for (const [name, value, unit] of [['gust', 20, 'km/h'], ['aqi', 75, ''], ['smoke', 20, 'µg/m³'], ['uv', 7, '']]) {
    hass.states['sensor.' + name] = { state: String(value), attributes: { unit_of_measurement: unit } };
  }
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const day0 = new Date(now).setHours(0, 0, 0, 0);
  state.wHist = { at: now, speed: [[day0, 10], [now, 10]], gust: [[day0, 20], [now, 20]], bearing: [] };
  state.aHist = { at: now, pts: [[day0, 50], [now, 75]] };
  state.smHist = { at: now, pts: [[day0, 10], [now, 20]] };
  state.uHist = { at: now, pts: [[day0, 0], [now, 7]] };
  for (const languageCode of ['en-GB', 'de-AT', 'de-DE', 'fr-FR']) {
    const german = languageCode.startsWith('de');
    card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
    openView(harness, { wind: true });
    assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent, german ? /Böen: 20 km\/h/ : /Gusts: 20 km\/h/);
    assert.match(state.fc.querySelector('svg').__scrub.fmt(10, now), german ? /Böen 20 km\/h/ : /gusts 20 km\/h/);
    openView(harness, { aqi: true });
    assert.match(state.fc.querySelector('.wx-smoke-label').textContent, german ? /^Rauch 20/ : /^Smoke 20/);
    assert.match(state.fc.querySelector('svg').__scrub.fmt(75, now), german ? /Rauch 20/ : /smoke 20/);
    openView(harness, { uv: true });
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Sonnenschutz empfohlen\./ : /Sun protection recommended\./);
  }
});

test('hourly narratives translate rain, snow and probability for past, present and future days', () => {
  const harness = createCardHarness();
  const { card, hass, now } = harness;
  card.setConfig({ entity: 'weather.home', return_home_after: 0, temperature_entity: 'sensor.temperature',
    details: { rain_today: 'sensor.rain', snow_today: 'sensor.snow' } });
  for (const [name, value, unit] of [['temperature', 12, '°C'], ['rain', 3, 'mm'], ['snow', 2, 'cm']]) {
    hass.states['sensor.' + name] = { state: String(value), attributes: { unit_of_measurement: unit } };
  }
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const day0 = new Date(now).setHours(0, 0, 0, 0);
  const key = (off) => { const date = new Date(day0 + off * 864e5); return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; };
  state.hours = [0, 1].flatMap((off) => Array.from({ length: 24 }, (_, hour) => ({
    datetime: new Date(day0 + off * 864e5 + hour * 36e5).toISOString(), condition: 'snowy',
    temperature: 12 + hour % 6, precipitation: 1, precipitation_probability: 70, uv_index: 7,
  })));
  state.items = [0, 1].map((off) => ({ datetime: new Date(day0 + off * 864e5).toISOString(), temperature: 17, templow: 12 }));
  for (const off of [0, -1]) {
    const points = (values) => ({ at: now, pts: values.map((value, i) => [day0 + off * 864e5 + (i + 1) * 36e5, value]) });
    state[off ? 'tHist_-1' : 'tHist'] = points([12, 17]);
    state[off ? 'rHist_-1' : 'rHist'] = points([1, 3]);
    state[off ? 'snHist_-1' : 'snHist'] = points([1, 2]);
  }
  for (const languageCode of ['en-GB', 'de-AT', 'de-DE', 'fr-FR']) {
    const german = languageCode.startsWith('de');
    card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
    openView(harness, { day: key(1) });
    const future = state.fc.querySelector('.wx-wind-summary').textContent;
    assert.match(future, german ? /Etwa 24 mm Regen und Schnee erwartet\./ : /About 24 mm of rain and snow expected\./);
    assert.match(future, german ? /Regenwahrscheinlichkeit bis 70%/ : /Up to a 70% chance of rain/);
    assert.match(future, german ? /Voraussichtlicher UV-Höchstwert 7/ : /UV peaks at 7/);
    assert.equal(state.fc.querySelectorAll('.wx-t-hl')[1].textContent, german ? 'T' : 'L');
    openView(harness, { day: key(0) });
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Bisher 3.0 mm Regen und 2.0 cm Schnee, etwa .* zusätzlich erwartet/ : /3.0 mm of rain and 2.0 cm of snow so far, about .* more expected/);
    // Full-day history keeps the normal summary instead of the partial-recording notice.
    state['tHist_-1'].pts[0][0] = day0 - 864e5;
    openView(harness, { day: key(-1) });
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Gefallen sind 3.0 mm Regen und 2.0 cm Schnee\./ : /3.0 mm of rain and 2.0 cm of snow fell\./);
    state['tHist_-1'].pts[0][0] = day0 - 864e5 + 2 * 36e5;
    state['tHist_-1'].pts[1][0] = day0 - 864e5 + 9 * 36e5;
    state.sig = null;
    state.draw();
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      german ? /Aufzeichnungen erst ab .* Seitdem: Höchstwert/ : /is only recorded from .* From then, a high of/);
  }
});

test('partial forecasts use complete sentences and regenerate weekday labels after locale changes', () => {
  const harness = createCardHarness();
  const { card, hass, now } = harness;
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const day = new Date(now); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() + 2);
  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
  for (const low of [null, 8]) {
    for (const amount of [0, 2]) {
      state.items = [{ datetime: day.toISOString(), temperature: 15, templow: low, precipitation: amount }];
      state.hours = [0, 1].map((hour) => ({ datetime: new Date(day.getTime() + hour * 36e5).toISOString(), temperature: 10 }));
      openView(harness, { day: key, label: 'Stale weekday' });
      for (const languageCode of ['de-AT', 'de-DE', 'en-GB', 'fr-FR']) {
        const german = languageCode.startsWith('de');
        card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
        const text = state.fc.querySelector('.wx-empty').textContent;
        assert.ok(text.startsWith(day.toLocaleDateString(languageCode, { weekday: 'long' })));
        assert.match(text, german ? /Noch keine stündliche Vorhersage verfügbar\. Für den ganzen Tag: Höchstwert 15°/ : /isn't forecast hour by hour yet\. For the day as a whole: high 15°/);
        if (low != null) assert.match(text, german ? /Tiefstwert 8°/ : /low 8°/);
        if (amount) assert.match(text, german ? /2.0 mm Niederschlag/ : /2.0 mm precipitation/);
        assert.doesNotMatch(text, /Stale weekday|\{\w+\}/);
      }
    }
  }
  state.hours.push({ datetime: new Date(day.getTime() + 2 * 36e5).toISOString(), temperature: 12 });
  card.hass = { ...hass, locale: { ...hass.locale, language: 'de-AT' } };
  assert.match(state.fc.querySelector('.wx-wind-summary').textContent, /Stündliche Vorhersage nur bis .* Für den ganzen Tag:/);
});

test('provider headlines, summaries and real alerts remain untranslated', () => {
  const { card, hass } = createCardHarness();
  card.setConfig({ entity: 'weather.home', return_home_after: 0, condition_entity: 'sensor.condition',
    subtitle_entity: 'sensor.subtitle', summary_entity: 'sensor.summary', alerts_entity: 'sensor.alerts' });
  for (const [name, value] of [['condition', 'Sunrise'], ['subtitle', 'Sunset'], ['summary', 'Sun protection recommended.'], ['alerts', 'Heat Warning (sample)']]) {
    hass.states['sensor.' + name] = { state: value, attributes: {} };
  }
  hass.locale.language = 'de-AT';
  card.hass = hass;
  const state = card._ctx.card.__wx;
  assert.equal(state.condText.textContent, 'Sunrise');
  assert.equal(state.sub.textContent, 'Sunset');
  assert.equal(state.summary.textContent, 'Sun protection recommended.');
  assert.equal(state.alertText.textContent, 'Heat Warning (sample)');
});

test('configuration errors localize their text while preserving entity keys', () => {
  const { card, hass } = createCardHarness();
  hass.locale.language = 'de-AT';
  card.hass = hass;
  assert.throws(() => card.setConfig({ entity: 'sensor.home' }),
    /Setze "entity" auf eine Wetter-Entität, z\. B\. weather\.home/);
  card.hass = { ...hass, locale: { ...hass.locale, language: 'fr-FR' } };
  assert.throws(() => card.setConfig({ entity: 'sensor.home' }),
    /Set "entity" to a weather entity, e\.g\. weather\.home/);
});

test('visible decimals follow language and explicit Home Assistant number preferences', () => {
  const { card, hass } = createCardHarness();
  hass.locale = { language: 'de-AT', time_format: '24', number_format: 'language' };
  hass.states['weather.home'].attributes.temperature = 12.5;
  card.hass = hass;
  const state = card._ctx.card.__wx;
  state.items = [{ datetime: '2026-11-06T12:00:00Z', temperature: 15, precipitation: 1.2 }];
  state.sig = null;
  state.draw();
  assert.equal(state.temp.textContent, '12,5°');
  assert.equal(state.fc.querySelector('.wx-item-rain').textContent, '1,2 mm');
  card.hass = { ...hass, locale: { ...hass.locale, number_format: 'comma_decimal' } };
  assert.equal(state.temp.textContent, '12.5°');
  assert.equal(state.fc.querySelector('.wx-item-rain').textContent, '1.2 mm');
});

test('number formatting supports every Home Assistant preference, regions and invalid values', () => {
  const format = (language, number_format) => numberFormatter({ locale: { language, number_format } });
  assert.equal(format('de-DE', 'language')(1234.56), '1.234,56');
  assert.equal(format('de-AT', 'language')(12.5), '12,5');
  assert.equal(format('de-DE', 'comma_decimal')(1234.56), '1,234.56');
  assert.equal(format('en-GB', 'decimal_comma')(1234.56), '1.234,56');
  assert.equal(format('en-GB', 'space_comma')(1234.56).replace(/\s/g, ' '), '1 234,56');
  assert.equal(format('de-DE', 'quote_decimal')(1234.56).replace(/’/g, "'"), "1'234.56");
  assert.equal(format('de-DE', 'none')(1234.56), '1234.56');
  assert.equal(format('de-DE', 'system')(1234.56), new Intl.NumberFormat(undefined).format(1234.56));
  assert.equal(numberFormatter({ language: 'de_DE' })(12.5), '12,5');
  assert.equal(numberFormatter({})(12.5), '12.5');
  assert.equal(format('fr-FR', 'language')(12.5), '12,5', 'number language is independent of English UI fallback');
  const german = format('de-DE', 'language');
  assert.equal(german('1.20', 2, 2), '1,20');
  assert.equal(german(-0), '0');
  for (const value of [null, undefined, '', NaN, Infinity, -Infinity, 'unavailable']) {
    assert.equal(german(value), '–');
  }
});

test('existing rounding and precipitation precision are preserved', () => {
  const { card, hass } = createCardHarness();
  hass.locale = { language: 'de-DE', number_format: 'language', time_format: '24' };
  const attributes = hass.states['weather.home'].attributes;
  attributes.temperature = 2.55;
  attributes.precipitation_unit = 'in';
  card.hass = hass;
  const state = card._ctx.card.__wx;
  state.items = [{ datetime: '2026-11-06T12:00:00Z', temperature: -2.5, precipitation: 0.125 }];
  state.sig = null; state.draw();
  assert.equal(state.temp.textContent, '2,5°', 'keep toFixed rounding for header decimals');
  assert.equal(state.fc.querySelector('.wx-item-temp').textContent, '-2°', 'keep Math.round for forecast temperatures');
  assert.equal(state.fc.querySelector('.wx-item-rain').textContent, '0,13 in');
  for (const [value, expected] of [[-0.04, '0°'], [-2.5, '-2,5°'], [12, '12°']]) {
    attributes.temperature = value;
    card._update();
    assert.equal(state.temp.textContent, expected);
  }
});

test('open solar charts reformat numbers while SVG coordinates and raw data remain unchanged', () => {
  const harness = createCardHarness();
  const { card, hass, now } = harness;
  card.setConfig({ entity: 'weather.home', return_home_after: 0, details: { solar: 'sensor.solar' } });
  hass.locale = { language: 'de-DE', number_format: 'language', time_format: '24' };
  hass.states['sensor.solar'] = { state: '1000', attributes: { unit_of_measurement: 'W/m²' } };
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const points = [[now - 2 * 36e5, 500], [now - 36e5, 1000]];
  state.sHist = { at: now, pts: points };
  openView(harness, { solar: true });
  const view = state.view;
  const svgAttributes = (element) => [element.tagName, element.attributes, element.children.map(svgAttributes)];
  const coordinates = JSON.stringify(svgAttributes(state.fc.querySelector('svg')));
  assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent, /1.000 W\/m²/);
  assert.match(state.fc.querySelector('.wx-wind-summary').textContent, /Energie: \d+,\d kWh\/m²/);
  assert.ok(state.fc.querySelectorAll('.wx-w-scale').some((label) => label.textContent === '1.200'));
  card.hass = { ...hass, locale: { ...hass.locale, number_format: 'comma_decimal' } };
  assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent, /1,000 W\/m²/);
  assert.match(state.fc.querySelector('.wx-wind-summary').textContent, /Energie: \d+\.\d kWh\/m²/);
  assert.ok(state.fc.querySelectorAll('.wx-w-scale').some((label) => label.textContent === '1,200'));
  assert.equal(JSON.stringify(svgAttributes(state.fc.querySelector('svg'))), coordinates);
  assert.equal(state.view, view);
  assert.equal(state.sHist.pts, points);
  assert.equal(state.solarNow, 1000);
  assert.match(state.sunPos, /^\d+\.\d\|[-\d]+\.\d\|\d+\.\d+$/);
});

test('cards sharing a page keep their own number formatters in later callbacks', () => {
  const english = createCardHarness();
  const german = createCardHarness({ window: english.window });
  const forecast = [{ datetime: '2026-11-06T12:00:00Z', temperature: 12, precipitation: 1.2 }];
  english.hass.locale.number_format = 'language';
  german.hass.locale = { language: 'de-DE', number_format: 'language', time_format: '24' };
  for (const harness of [english, german]) {
    harness.card.hass = harness.hass;
    harness.subscriptions.find(({ message }) => message.forecast_type === 'daily').callback({ forecast });
  }
  assert.equal(english.window.__spyglassWeatherCard, german.window.__spyglassWeatherCard);
  const enState = english.card._ctx.card.__wx, deState = german.card._ctx.card.__wx;
  for (const [harness, state, expected] of [[english, enState, '1.2 mm'], [german, deState, '1,2 mm']]) {
    state.sig = null;
    state.draw();
    assert.equal(state.fc.querySelector('.wx-item-rain').textContent, expected);
    harness.card._update();
    assert.equal(state.fc.querySelector('.wx-item-rain').textContent, expected);
  }
});

test('wind direction display is localized while internal compass codes stay stable', () => {
  const harness = createCardHarness();
  const { card, hass } = harness;
  hass.states['weather.home'].attributes.wind_bearing = 45;
  card.hass = hass;
  const state = card._ctx.card.__wx;
  const value = () => state.details.querySelectorAll('.wx-chip')
    .find((chip) => chip.dataset.view === 'wind').querySelector('.wx-chip-value').textContent;
  assert.match(value(), / NE$/);
  for (const languageCode of ['de-AT', 'de-DE', 'en-GB', 'fr-FR']) {
    card.hass = { ...hass, locale: { ...hass.locale, language: languageCode } };
    assert.equal(state.windNow.dir, 'NE');
    assert.match(value(), languageCode.startsWith('de') ? / NO$/ : / NE$/);
    openView(harness, { wind: true });
    assert.match(state.fcHead.querySelector('.wx-fc-hint').textContent,
      languageCode.startsWith('de') ? / NO$/ : / NE$/);
    assert.match(state.fc.querySelector('.wx-wind-summary').textContent,
      languageCode.startsWith('de') ? /Nordosten/ : /northeast/);
  }
  for (const [bearing, code, display] of [[0, 'N', 'N'], [45, 'NE', 'NO'], [90, 'E', 'O'], [135, 'SE', 'SO'],
    [180, 'S', 'S'], [225, 'SW', 'SW'], [270, 'W', 'W'], [315, 'NW', 'NW'], [-270, 'E', 'O'], [450, 'E', 'O']]) {
    hass.states['weather.home'].attributes.wind_bearing = bearing;
    card.hass = { ...hass, locale: { ...hass.locale, language: 'de-AT' } };
    card._update();
    assert.equal(state.windNow.dir, code);
    assert.ok(value().endsWith(' ' + display));
    assert.ok(state.fcHead.querySelector('.wx-fc-hint').textContent.endsWith(' ' + display));
  }
});

test('translation review catalogues match locales and retain approval status', () => {
  const csv = readFileSync(join(ROOT, 'review', 'uebersetzungen-de.csv'), 'utf8');
  const rows = csv.trim().split(/\r?\n/).slice(1).map((line) =>
    [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((match) => match[1].replace(/""/g, '"')));
  const markdown = readFileSync(join(ROOT, 'review', 'uebersetzungen-de.md'), 'utf8');
  assert.equal(rows.length, Object.keys(bundled.en).length);
  assert.equal((markdown.match(/^\| \d+ \|/gm) || []).length, rows.length, 'Markdown must list each entry exactly once');
  assert.ok(markdown.includes(`**${rows.length} Einträge**`));
  assert.equal(new Set(rows.map((row) => row[2])).size, rows.length);
  assert.equal(rows.filter((row) => row[4] === 'Bestätigt').length, 16);
  for (const [id, , key, value, status] of rows) {
    assert.equal(bundled.de[key], value, key);
    assert.ok(markdown.includes(`| ${id} | ${key} | ${value} | ${status} |`), key);
  }
});

for (const [name, lineEnding] of [['LF', '\n'], ['CRLF', '\r\n']]) {
  test(`locale build accepts ${name} and still detects stale translations`, (t) => {
    const fixture = mkdtempSync(join(tmpdir(), 'spyglass-locales-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    mkdirSync(join(fixture, 'scripts'));
    mkdirSync(join(fixture, 'locales'));
    const script = join(fixture, 'scripts', 'build-locales.mjs');
    copyFileSync(join(ROOT, 'scripts', 'build-locales.mjs'), script);
    for (const filename of readdirSync(join(ROOT, 'locales')).filter((name) => name.endsWith('.json'))) {
      copyFileSync(join(ROOT, 'locales', filename), join(fixture, 'locales', filename));
    }
    const card = join(fixture, 'spyglass-weather-card.js');
    const original = source.replace(/\r\n/g, '\n').replace(/\n/g, lineEnding);
    writeFileSync(card, original);
    const runBuild = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    let result = runBuild('--check');
    assert.equal(result.status, 0, result.stderr);
    result = runBuild();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(card, 'utf8'), original, 'an up-to-date build must not rewrite the asset');

    const germanFile = join(fixture, 'locales', 'de.json');
    const german = JSON.parse(readFileSync(germanFile, 'utf8'));
    german.Sunrise = 'Test-Sonnenaufgang';
    writeFileSync(germanFile, JSON.stringify(german));
    result = runBuild('--check');
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Locale bundle is out of date/);
    assert.equal(readFileSync(card, 'utf8'), original, '--check must not rewrite the asset');

    result = runBuild();
    assert.equal(result.status, 0, result.stderr);
    const expected = original.replace('"Sunrise": "Sonnenaufgang"', '"Sunrise": "Test-Sonnenaufgang"');
    assert.notEqual(expected, original);
    assert.equal(readFileSync(card, 'utf8'), expected, 'only the translation should change, preserving line endings');
    result = runBuild('--check');
    assert.equal(result.status, 0, result.stderr);
  });
}
