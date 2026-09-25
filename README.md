# Spyglass Weather Card

An animated weather card for Home Assistant and [Pirate Weather](https://pirateweather.net/), but the basics work with any weather entity.

![Spyglass Weather Card: the sky changing through clear, rain, a thunderstorm, and snow, then the wind chart, the sun's arc, and a day's hours being read](https://raw.githubusercontent.com/lemker/spyglass-weather-card/main/spyglass-weather-card-demo.gif)

## Features

- **Live sky** — the background follows the current condition, day or night, with drifting
  clouds, rain, snow, and sleet at their real intensity, the sun's glow where the sun actually
  is, and lightning only when a thunderstorm is happening or forecast. Changes crossfade
  smoothly, and each effect can be switched off.
- **Header** — condition, a short near-term summary, the temperature (or feels-like), a
  rising/falling pressure arrow, and a banner for weather alerts.
- **Chips** — UV, air quality (AQHI, US AQI, or CAQI), dew point, wind, sunrise/sunset, and
  sunlight. Tap any chip for its chart.
- **Forecast strip** — each day's condition, high, low, and rain. Tap a day to see its hours.
- **Day chart** — recorded temperature behind now, forecast ahead, condition icons, and a rain
  line (how hard it's raining, recorded then forecast). Drag across any chart to read it. A
  summary covers conditions, high and low, rain and snow so far and expected, strong gusts, and
  high UV.
- **Chip charts** — UV, dew point, wind (with gusts and direction), air quality (with smoke and
  fire risk), sunlight, and a sun arc with twilight, daylight, and tonight's moon phase.
- **History** — every chart pages back through the days Home Assistant has recorded and
  forward through the forecast, where there is one (air quality and sunlight have none). The
  sun and moon work for any date.
- **Units** — everything follows your Home Assistant units; sensors reporting in other units
  are converted.

## Requirements

- Home Assistant 2024.11 or newer
- Pirate Weather integration v1.9.2 or newer
- Home Assistant's recorder, for chart history

## Install

### HACS

1. HACS → ⋮ → **Custom repositories**.
2. Add `https://github.com/lemker/spyglass-weather-card` with the type **Dashboard**.
3. Find **Spyglass Weather Card** and download it. HACS adds the dashboard resource.

### Manually

1. Copy `spyglass-weather-card.js` to `/config/www/`.
2. Settings → Dashboards → ⋮ → **Resources** → Add `/local/spyglass-weather-card.js` as a
   **JavaScript module**.

## Setup

Add the card from the dashboard's card picker and set everything in its visual editor, or
write it in YAML. `entity`, your weather entity, is all it needs:

```yaml
type: custom:spyglass-weather-card
entity: weather.home
```

With Pirate Weather, entities are autofilled and sensors are named after the
weather entity. Only sensors you ticked in the Pirate Weather
integration exist, so whatever isn't there is simply left out.

Everything else is optional and sits next to `entity`. Set a sensor option to use a different
sensor, or to `false` to leave that part off. The visual editor shows the sensors it found;
clearing one there sets it to `false`.

## Settings

### Card

| Setting | Default | Description |
| --- | --- | --- |
| `entity` | — | Your weather entity (required) |
| `name` | your city | Shown under the headline when there is no `subtitle_entity` text. Defaults to the city in your Home Assistant time zone |
| `forecast_type` | `daily` | Forecast strip: `daily`, `hourly`, or `twice_daily` |
| `max_items` | `all` | Strip length: `all`, `fit` (as many as fit), or a number |
| `min_item_width` | `64` | Width of each strip item, in pixels, before it scrolls |
| `return_home_after` | `45` | Seconds without a touch before an open view returns home; `0` never |
| `apparent_temperature` | off | `true` shows feels-like: the Pirate Weather sensor when there is one, else the weather entity's own. Or set a sensor |
| `hide_headline` | `false` | Hide the icon, the condition, and the line under it. With `hide_temperature` too, the header goes |
| `hide_forecast` | `false` | Hide the forecast strip |
| `hide_temperature` | `false` | Hide the temperature in the header |
| `debug` | `false` | Controls for stepping through every background effect |

### Entities

| Setting | Description |
| --- | --- |
| `condition_entity` | Headline text, e.g. "Clear" (falls back to the weather state) |
| `subtitle_entity` | Line under the headline, e.g. "Clear for the hour" |
| `temperature_entity` | Recorded temperature for the day chart |
| `icon_entity` | Recorded conditions for the day chart's icons and summary |
| `pressure_entity` | Rising/falling arrow beside the headline |
| `cloud_entity` | Cloud cover, for how cloudy the sky looks |
| `sun_entity` | Sun entity, default `sun.sun` |
| `summary_entity` | The coming days' summary, in the line under the chips |
| `hourly_summary_entity` | The near-term summary: starts the line under the chips and today's chart summary |
| `alerts_entity` | Weather alerts banner |

### `precipitation`

| Setting | Description |
| --- | --- |
| `type` | Current precipitation type (rain, snow, sleet), picks what falls |
| `rain` | Rain rate |
| `snow` | Snow rate |
| `ice` | Sleet / freezing rain rate |

Rates set how heavy the falling rain or snow looks and draw the day chart's rain line.

### `details`

| Setting | Description |
| --- | --- |
| `uv` | UV index chip and chart |
| `aqi` | Air quality chip and chart |
| `aqi_scale` | `aqhi`, `epa`, or `caqi` (based on your Home Assistant country if left out) |
| `smoke` | Smoke line on the air quality chart, and in its summary |
| `fire` | Fire risk level, in the air quality summary |
| `dew_point` | Dew point chip and chart |
| `humidity` | Humidity, shown in the dew point chart's readout |
| `wind` | Wind speed chip and chart (`true` uses the weather entity) |
| `gust` | Wind gusts |
| `bearing` | Wind direction, for the wind chart's arrows |
| `precip_probability` | Current chance of rain |
| `rain_today` | Rain fallen today, for the day summary |
| `snow_today` | Snow fallen today, for the day summary |
| `solar` | Sunlight reaching the ground (W/m²) chip and chart |

### `show_chips`

Set a chip to `false` to hide it, or `true` to show it. A hidden chip's chart can't be opened.

| Chip | Default |
| --- | --- |
| `uv` | shown |
| `aqi` | shown |
| `dew_point` | shown |
| `wind` | shown |
| `sun` | shown |
| `solar` | hidden |

### `animations`

The sky moves: clouds and fog drift, stars twinkle, the sun's glow pulses, and rain, snow, and
lightning fall and flash. The `animations` block turns effects off one at a time: clouds, fog,
stars, and the sun glow then hold still, while rain, snow, and lightning aren't drawn. A device
set to reduce motion gets a still sky. In the visual editor these are the switches under
**Animations**.

| Setting | Default | Description |
| --- | --- | --- |
| `clouds` | on | Drifting clouds |
| `fog` | on | Drifting fog |
| `stars` | on | Twinkling stars |
| `sun` | on | The sun glow's slow pulse |
| `rain` | on | Drizzle, downpour, and hail |
| `snow` | on | Snow and sleet |
| `lightning` | on | Lightning |

