# Adding or updating translations

Spyglass ships **one JavaScript module** (`spyglass-weather-card.js`) to Home Assistant/HACS.
Language files are maintained separately and embedded into that module at build time.
Home Assistant users do not need to install or configure anything else.

## Language files

- `en.json`: canonical English source keys and fallback text. Each value equals its key.
- `de.json`: German translations. Region variants such as `de-AT` and `de-DE` use it automatically.
- To add a language, copy `en.json` to `fr.json`, `it.json`, `nl.json`, etc. and translate the values.
- You may leave keys untranslated or omit them; missing keys fall back to English.
- For region-specific differences, use lowercase filenames such as `pt-br.json`. An exact match
  (for example `pt-BR`) takes precedence over the base language (`pt`) if present.
- Only built-in UI labels are translated by this system. External Pirate Weather summaries
  are displayed as received from Home Assistant.

## Build and validate

Requires Node.js 20 or newer, without third-party dependencies.

```sh
npm run build
npm test
```

`npm run build` discovers all JSON files in `locales/`, validates the language codes and
placeholders, then refreshes the generated translation block in `spyglass-weather-card.js`.
Commit both your JSON file and the regenerated JavaScript file.
To check without changing files:

```sh
npm run build -- --check
```

A CI workflow checks the generated bundle and tests on pull requests.

## Translation conventions

- Keys are stable English source strings, including punctuation and trailing spaces.
- Translate only the values; preserve keys exactly.
- Preserve dynamic placeholders such as `{time}`, `{value}`, `{high}` unchanged.
- Keep UI text short enough for the card's compact charts and chips.
- Prefer idiomatic local-language phrasing for generated sentences.
- Avoid changing the technical values in the visual editor (for example `daily`, `hourly`).
- Review changes in `review/uebersetzungen-de.md` or the Excel-compatible CSV.

## Numbers and wind directions

Visible numbers follow Home Assistant's `number_format` preference: language, system,
comma/decimal, decimal/comma, space/comma, Swiss grouping, or no grouping. The card
preserves its existing rounding, decimal precision, and weather units. SVG coordinates,
CSS values, entity IDs, and configuration values keep their technical formats.

Compass keys (`N`, `NE`, `E`, etc.) translate only the displayed abbreviation. German
uses `NO`, `O`, and `SO`; internal direction codes remain English so chart arrows and
the existing wind summaries continue to use the same data.
