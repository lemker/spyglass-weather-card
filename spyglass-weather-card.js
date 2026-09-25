/**
 * Spyglass Weather Card
 * An animated weather card for Home Assistant, built for Pirate Weather.
 * https://github.com/lemker/spyglass-weather-card
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * The weather condition artwork (the `art` table in update()) is adapted from the
 * Home Assistant frontend (https://github.com/home-assistant/frontend), also Apache-2.0.
 */

const VERSION = '0.1.0';
const TAG = 'spyglass-weather-card';

/* Layout for the header's parts. Everything else, colours and sizes included, is in
   CARD_CSS below. */
const BASE_CSS = `
:host { display: block; }
ha-card {
  overflow: hidden;
  border: none;
  background: none;
  border-radius: var(--spyglass-border-radius, var(--ha-card-border-radius, 12px));
}
.wx-box { border-radius: inherit; }
.wx-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
.wx-hero {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin: 6px 6px 6px 8px;
  overflow: hidden;
}
.wx-hero-icon { --mdc-icon-size: 36px; }
.wx-title {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 16px 0 4px;
  overflow: hidden;
  line-height: 18px;
}
.wx-name, .wx-state { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* hide_headline: no icon, condition or line under it; with hide_temperature too, no header at all */
.wx-box.wx-no-headline .wx-hero, .wx-box.wx-no-headline .wx-title { display: none !important; }
.wx-box.wx-no-head .wx-head { display: none !important; }
`;

const CARD_CSS = `
/* ---------- fill the grid cell, whatever rows it gets ---------- */ ha-card.wx-card, .wx-card ha-card {
  height: 100% !important;
  min-height: 100% !important;
  max-height: none !important;
} .wx-box.wx {
  position: relative !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  min-height: 200px;
  box-sizing: border-box;
  background: linear-gradient(180deg, var(--wx-1, #525f88), var(--wx-2, #4a6ea8)) !important;
  color: #fff;
  opacity: 1;
  transition: background 1.2s ease, opacity 0.15s ease !important;
} .wx-box.wx.wx-unfit { opacity: 0; transition: none !important; } .wx .wx-head {
  position: relative !important;
  z-index: 1;
  flex: 0 0 auto !important;
  height: auto !important;
  min-height: 68px;
  padding-top: 6px;
}
/* ---------- header: HA artwork icon, condition as heading, name beneath ---------- */ .wx .wx-hero {
  background-color: transparent !important;
  color: #fff !important;
  --mdc-icon-size: 36px;
  width: 56px !important;
  height: 56px !important;
  min-width: 56px !important;
  margin-inline-end: 6px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 52px 52px;
} .wx .wx-hero.wx-has-art .wx-hero-icon { visibility: hidden; } .wx .wx-hero-icon { color: #fff !important; } .wx .wx-title { display: flex !important; flex-direction: column !important; justify-content: center; } .wx .wx-state {
  order: -1;
  color: #fff !important;
  font-size: 26px !important;
  font-weight: 500 !important;
  letter-spacing: -0.3px;
  line-height: 1.15 !important;
  text-transform: capitalize;
  opacity: 1 !important;
} .wx .wx-cond {
  order: -1;
  color: #fff;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.3px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
} .wx .wx-cond:empty { display: none; } .wx .wx-trend { font-size: 18px; margin-inline-start: 6px; opacity: 0.75; vertical-align: 2px; } .wx .wx-trend:empty { display: none; } .wx .wx-trend.down { color: #ffd0c0; } .wx.wx-has-cond .wx-state { display: none !important; } .wx .wx-sub {
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.25;
  opacity: 0.72;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
} .wx .wx-sub:empty { display: none; } .wx.wx-has-sub .wx-name { display: none !important; } .wx .wx-name {
  color: #fff !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
  opacity: 0.72;
}
/* ---------- current temperature ---------- */ .wx-now {
  margin-inline-start: auto;
  padding-inline-end: 10px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 500;
} .wx-now ha-icon { --mdc-icon-size: 22px; opacity: 0.95; } /* feels-like: a small label above the reading so it isn't mistaken for the actual temperature */ .wx-now.wx-feels { flex-direction: column; align-items: flex-end; gap: 0; line-height: 1.1; } .wx-now.wx-feels ha-icon { display: none; } .wx-now.wx-feels::before { content: 'Feels like'; font-size: 11px; font-weight: 500; opacity: 0.7; }
/* ---------- detail chips ---------- */ .wx-details {
  position: relative; z-index: 2;
  display: flex; flex-wrap: nowrap; gap: 6px;
  margin: 2px 0 0;
  padding: 0 12px;
  overflow-x: auto; overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
} .wx-details::-webkit-scrollbar { display: none; } .wx-details.wx-end { -webkit-mask-image: none; mask-image: none; } .wx-chip { flex: 0 0 auto; } .wx-viewing .wx-details { display: none; } /* steps applied by the script when the row overflows */ .wx-details.wx-tight .wx-chip-note { display: none; } .wx-details.wx-snug { gap: 4px; } .wx-snug .wx-chip { padding: 0 8px 0 5px; gap: 4px; } .wx-tighter { gap: 4px; } .wx-details.wx-tighter .wx-chip { padding: 0 8px 0 4px; gap: 4px; font-size: 11px; } .wx-details.wx-tighter .wx-chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 14px; } .wx-chip {
  display: inline-flex; align-items: center; gap: 5px;
  height: 26px; padding: 0 10px 0 6px; border-radius: 999px;
  background: rgba(var(--chip, 95,125,56), 0.85);
  color: #fff; font-size: 12px; line-height: 1; white-space: nowrap;
  cursor: pointer;
} .wx-chip:active { filter: brightness(1.15); } .wx-chip ha-icon { --mdc-icon-size: 16px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0, 0, 0, 0.45); display: inline-flex; align-items: center; justify-content: center; } .wx-chip-label { display: none; } .wx-chip-value { font-weight: 700; } .wx-chip-note { opacity: 0.85; padding-left: 6px; border-left: 1px solid rgba(255, 255, 255, 0.3); }
/* ---------- alert banner ---------- */ .wx-alert-bar {
  position: relative;
  z-index: 2;
  display: none;
  align-items: center;
  gap: 8px;
  margin: 4px 12px 0;
  padding: 6px 12px 6px 10px;
  border-radius: 12px;
  background: rgba(255, 170, 50, 0.22);
  border: 1px solid rgba(255, 190, 90, 0.45);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
} .wx-alert-bar.on { display: flex; } .wx-alert-bar ha-icon { --mdc-icon-size: 20px; color: #ffcc66; flex: 0 0 auto; } .wx-alert-text { flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wx-alert-more { flex: 0 0 auto; font-size: 11px; opacity: 0.8; padding: 2px 7px; border-radius: 999px; background: rgba(0, 0, 0, 0.3); } .wx-alert-more:empty { display: none; }
/* ---------- forecast: optional hourly header + scrolling strip ---------- */ .wx-forecast {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: 6px 0 10px;
  transition: opacity 0.15s ease;
} .wx-forecast.wx-swap { opacity: 0; } /* the header line is always laid out so the icon row sits at the same height in
   both views; it is only visible (and tappable) while showing hours */
.wx-fc-head {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 26px;
  padding: 0 12px 0 6px;
  margin-bottom: 4px;
  font-size: 13px;
  user-select: none;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s ease;
} .wx-hourly .wx-fc-head { visibility: visible; opacity: 1; } .wx-fc-head ha-icon { --mdc-icon-size: 22px; } .wx-fc-back { display: inline-flex; align-items: center; gap: 2px; padding: 2px 10px 2px 2px; margin-left: -2px; border-radius: 999px; cursor: pointer; } .wx-fc-back:active { background: rgba(255, 255, 255, 0.14); } .wx-fc-title { font-weight: 600; } .wx-fc-hint { margin-inline-start: auto; opacity: 0.6; font-size: 12px; } .wx-fc-hint:empty { margin-inline-start: auto; } /* day stepper for the humidity, UV and wind views */ .wx-daynav { display: inline-flex; align-items: center; gap: 2px; margin-inline-start: 10px; } .wx-daynav-label { font-size: 12px; font-weight: 600; min-width: 8ch; text-align: center; } .wx-daynav-btn {
  all: unset; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%; --mdc-icon-size: 18px;
} .wx-daynav-btn:active { background: rgba(255, 255, 255, 0.18); } .wx-daynav-btn.off { opacity: 0.25; pointer-events: none; } .wx-strip {
  display: grid;
  grid-auto-flow: column;
  gap: 4px;
  padding: 0 12px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
  scroll-padding-inline: 12px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
} .wx-strip::-webkit-scrollbar { display: none; } .wx-strip.wx-more { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 36px), transparent); } .wx-strip.wx-before { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px); mask-image: linear-gradient(to right, transparent, #000 36px); } .wx-strip.wx-more.wx-before { -webkit-mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(to right, transparent, #000 36px, #000 calc(100% - 36px), transparent); } .wx-summary {
  position: relative;
  z-index: 2;
  margin: 8px 12px 0;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.8;
} .wx-summary:empty, .wx-viewing .wx-summary { display: none; } .wx-item {
  text-align: center;
  font-size: 13px;
  line-height: 1.3;
  min-width: 0;
  scroll-snap-align: start;
  border-radius: 12px;
  padding: 2px 0;
} .wx-item.wx-tappable { cursor: pointer; } .wx-item.wx-tappable:active { background: rgba(255, 255, 255, 0.12); } .wx-item ha-icon { --mdc-icon-size: 26px; display: block; margin: 6px auto 4px; color: #fff; } .wx-art { display: block; width: 34px; height: 34px; margin: 2px auto 0; background: center / contain no-repeat; } .wx-item-label { opacity: 0.85; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wx-item-temp { font-weight: 700; white-space: nowrap; } .wx-item-lo { opacity: 0.7; white-space: nowrap; height: 17px; line-height: 17px; } .wx-item-lo.wx-pop { color: #bfe3ff; font-size: 12px; } .wx-item-rain { color: #9CCBFF; font-size: 11px; font-weight: 600; height: 15px; line-height: 15px; white-space: nowrap; } .wx-item-label { height: 17px; line-height: 17px; } .wx-item-temp { height: 17px; line-height: 17px; } .wx-debug-panel {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 6;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 10px 8px 12px;
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
} .wx-debug-panel .wx-debug { position: static; transform: none; } .wx-debug-panel .wx-debug-opts { position: static; margin: 0; } .wx-debug {
  position: absolute; left: 50%; top: 14px; transform: translateX(-50%); z-index: 5;
  display: flex; align-items: center; gap: 2px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  padding: 0 4px; border-radius: 999px;
  background: rgba(0, 0, 0, 0.5); color: #fff;
} /* the longest label ("partlycloudy-night · night") sets the width, so the pill doesn't
   resize as you step through the conditions */
/* the width is set from the longest label in the list (see dbgText above) */ .wx-debug-text { padding: 0 4px; white-space: nowrap; display: inline-block; text-align: center; font-variant-numeric: tabular-nums; } .wx-debug-btn {
  all: unset; display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%; color: #fff; cursor: pointer;
  --mdc-icon-size: 20px;
} .wx-debug-btn:active { background: rgba(255, 255, 255, 0.2); } .wx-debug-opts {
  position: relative; z-index: 3;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;
  margin: 6px 12px 0;
} .wx-debug-knob {
  all: unset; cursor: pointer; white-space: nowrap;
  padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600;
  background: rgba(255, 255, 255, 0.16); color: #fff;
} .wx-debug-knob:active { background: rgba(255, 255, 255, 0.3); } .wx-debug-knob.live { background: rgba(255, 255, 255, 0.08); opacity: 0.7; } .wx-empty { grid-column: 1 / -1; text-align: center; opacity: 0.7; font-size: 13px; padding: 18px 0; }
/* ---------- sunrise / sunset view ---------- */ .wx-forecast.wx-sunview { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; } .wx-sunview .wx-strip { overflow: hidden; padding: 0 12px; flex: 1 1 auto; min-height: 0; height: 0; display: block; } .wx-sun-wrap { display: flex; flex-direction: column; gap: 12px; height: 100%; max-height: 100%; overflow: hidden; } .wx-sun-wrap svg { flex: 0 0 auto; } .wx-sun-rows { padding-bottom: 2px; } .wx-moon { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; opacity: 0.9; } .wx-moon-ic { flex: none; display: block; } .wx-sun-svg { display: block; width: 100%; border-radius: 10px; background: rgba(0, 0, 0, 0.18); } .wx-sun-grid { stroke: rgba(255, 255, 255, 0.18); stroke-width: 1; stroke-dasharray: 3 4; vector-effect: non-scaling-stroke; } .wx-sun-horizon { stroke: rgba(255, 255, 255, 0.45); stroke-width: 1.5; vector-effect: non-scaling-stroke; } .wx-sun-path { fill: none; stroke: rgba(255, 255, 255, 0.95); stroke-width: 3; stroke-linecap: round; vector-effect: non-scaling-stroke; } .wx-sun-path.dim { stroke: rgba(255, 255, 255, 0.28); } .wx-sun-dot { fill: rgba(255, 255, 255, 0.6); } .wx-sun-glow { fill: rgba(255, 255, 255, 0.25); filter: blur(6px); } .wx-sun-now { fill: #fff; } .wx-sun-now.night { fill: rgba(255, 255, 255, 0.55); } .wx-sun-axis { fill: rgba(255, 255, 255, 0.7); font-size: 11px; font-weight: 600; letter-spacing: 0.2px; } .wx-sun-rows { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; } .wx-sun-row { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 12px; line-height: 1.3; } .wx-sun-v { font-size: 13px; } .wx-sun-k { opacity: 0.7; white-space: nowrap; } .wx-sun-v { font-weight: 700; white-space: nowrap; } /* hourly temperature chart */ .wx-t-mark { fill: #fff; } /* drag-to-read: hidden until a finger is on the chart */ .wx-scrub { opacity: 0; transition: opacity 0.15s ease; pointer-events: none; } .wx-scrubbing .wx-scrub { opacity: 1; } .wx-scrub-line { stroke: rgba(255, 255, 255, 0.85); stroke-width: 1.5; } /* the readout matches the H and L markers: same weight, same tone, no outline */ .wx-scrub-dot { fill: #fff; } .wx-scrub-lab { fill: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 700; } .wx-wind-svg, .wx-aqi-svg { touch-action: pan-y; } /* chance of rain, under the temperature curve */ .wx-pop-area { fill: rgba(77, 163, 255, 0.16); } .wx-pop-line { fill: none; stroke: #4DA3FF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .wx-rain-line { fill: none; stroke: #4DA3FF; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; opacity: 0.85; stroke-dasharray: 7 5; } .wx-rain-line.ahead { stroke-dasharray: none; } .wx-pop-mark { fill: #4DA3FF; stroke: rgba(255, 255, 255, 0.85); stroke-width: 1.5; } .wx-pop-label { fill: #9CCBFF; font-size: 11px; font-weight: 700; } .wx-smoke-line { fill: none; stroke: #D8C3A5; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; opacity: 0.9; } .wx-pop-label.wx-smoke-label { fill: #E6D6BF; } .wx-t-hl { fill: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 700; } /* a fixed label sitting under the scrub readout fades out for as long as it is covered;
   keyed off .wx-scrubbing so it returns on its own when the readout goes away */
.wx-t-hl, .wx-pop-label { transition: opacity 0.15s ease; } .wx-scrubbing .wx-t-hl.wx-under, .wx-scrubbing .wx-pop-label.wx-under { opacity: 0; } /* wind graph */ .wx-wind-svg { display: block; width: 100%; border-radius: 10px; background: rgba(0, 0, 0, 0.18); } .wx-w-grid { stroke: rgba(255, 255, 255, 0.14); stroke-width: 1; } .wx-w-vgrid { stroke: rgba(255, 255, 255, 0.16); stroke-width: 1; stroke-dasharray: 3 4; } .wx-w-scale { fill: rgba(255, 255, 255, 0.7); font-size: 11px; font-weight: 600; } .wx-w-future { fill: rgba(255, 255, 255, 0.06); } .wx-w-area.past { opacity: 0.55; } .wx-w-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; } .wx-w-line.past { opacity: 0.8; stroke-dasharray: 7 5; } /* gusts: a thin pale line so it reads as a second series rather than a second speed */ .wx-w-gust { fill: none; stroke: rgba(255, 255, 255, 0.75) !important; stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 5 4; } .wx-w-gust.past { opacity: 0.45; } .wx-w-now { stroke: rgba(255, 255, 255, 0.55); stroke-width: 1; } .wx-w-dot { fill: #fff; stroke: rgba(0, 0, 0, 0.6); stroke-width: 2; } .wx-w-arrow path { fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .wx-w-arrow.past path { stroke: rgba(255, 255, 255, 0.55); } .wx-wind-summary { flex: 0 0 auto; font-size: 12px; line-height: 1.4; opacity: 0.85; padding: 0 2px 2px; } .wx-wind-summary:empty { display: none; } /* air quality graph */ .wx-aqi-svg { display: block; width: 100%; border-radius: 10px; background: rgba(0, 0, 0, 0.18); } /* frosted glass: the sky behind a chart (rain, snow, drifting cloud) blurs into a soft wash instead of crossing the lines */ .wx-sun-svg, .wx-wind-svg, .wx-aqi-svg { -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); } .wx-aqi-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; } @media (max-width: 520px) { .wx-sun-rows { grid-template-columns: repeat(4, minmax(0, 1fr)); } .wx-sun-row:nth-child(5) { display: none; } }
/* ---------- animated scene ---------- */ .wx-bg {
  position: absolute; inset: 0; z-index: 0;
  overflow: hidden; pointer-events: none;
  container-type: size;
} .wx-scene { position: absolute; inset: 0; overflow: hidden; }   /* one per scene; crossfaded */ .wx-bg i { position: absolute; display: block; } .wx-star {
  width: 2px; height: 2px; border-radius: 50%; background: #fff;
  will-change: opacity;
} .wx-star.bright { box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.55); } /* sun glow: centred on the real sun position (--sun-x/--sun-y from the sun entity),
   warming from pale gold to orange as it nears the horizon (--sun-warm 0..1) */
.wx-sun {
  left: var(--sun-x, 85%); top: var(--sun-y, 20%);
  width: 90cqh; height: 90cqh; border-radius: 50%;
  margin: -45cqh 0 0 -45cqh;
  background: radial-gradient(circle,
    color-mix(in srgb, rgba(255, 232, 180, 0.55), rgba(255, 160, 80, 0.55) calc(var(--sun-warm, 0) * 100%)) 0 10%,
    color-mix(in srgb, rgba(255, 220, 150, 0.26), rgba(255, 140, 70, 0.3) calc(var(--sun-warm, 0) * 100%)) 30%,
    rgba(255, 214, 140, 0) 65%);
  transition: left 2s ease, top 2s ease;
  animation: wx-glow 8s ease-in-out infinite alternate;
} /* cloud layers: a seamless noise tile twice the card wide, scrolled one tile per
   cycle so the wrap is invisible; a soft vertical mask keeps them off the bottom */
.wx-cloudlayer {
  left: 0; width: calc(2 * var(--tile, 100cqw)); height: 115%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  opacity: var(--a, 0.5);
  will-change: transform;
  backface-visibility: hidden;
} .wx-haze {
  inset: 0;
  background: linear-gradient(180deg, rgba(200, 206, 218, 0.08), rgba(200, 206, 218, 0.20) 50%, rgba(200, 206, 218, 0.38));
  animation: wx-hazepulse 14s ease-in-out infinite alternate;
} @keyframes wx-hazepulse { from { opacity: 0.85; } to { opacity: 1; } } .wx-cloudlayer.wx-hazelayer { height: 120%; } /* wind from the east: clouds and fog cross right → left, rain leans the other way */
.wx-drop {
  top: -16cqh; width: 1.5px; height: 12cqh; border-radius: 2px;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.7));
  will-change: transform;
} .wx-drop.hail { width: 3px; height: 3px; border-radius: 50%; background: #fff; } .wx-flake {
  top: -6cqh; width: 3.5px; height: 3.5px; border-radius: 50%; background: #fff;
  will-change: transform;
} /* exceptional: a slow amber pulse along the top edge */ .wx-alert {
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 176, 64, 0.35), rgba(255, 176, 64, 0) 55%);
  animation: wx-alert 4s ease-in-out infinite alternate;
} @keyframes wx-alert { from { opacity: 0.35; } to { opacity: 1; } } .wx-flake.wet { width: 3.5px; height: 3.5px; box-shadow: 0 0 2px rgba(255, 255, 255, 0.7); } .wx-flash {
  inset: 0; opacity: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.95), rgba(220, 230, 255, 0.55) 45%, rgba(255, 255, 255, 0) 80%);
  will-change: opacity;
} .wx-bolt {
  top: 0; width: 3px; height: 45cqh; opacity: 0;
  background: linear-gradient(#fff, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0));
  clip-path: polygon(40% 0, 100% 0, 60% 38%, 100% 38%, 20% 100%, 45% 50%, 0 50%);
  filter: drop-shadow(0 0 6px rgba(200, 220, 255, 0.9));
  transform-origin: 50% 0;
  will-change: opacity;
}
@keyframes wx-glow {
  from { transform: scale(1);    opacity: 0.85; }
  to   { transform: scale(1.06); opacity: 1; }
} @media (prefers-reduced-motion: reduce) {
  .wx-bg i { animation: none !important; }
}
`;

/* The card's logic: builds its DOM once, then keeps it current. Runs with
   this = { card: the ha-card, host: the card element, options }. */
function update(hass, entity) {
  const card = this.card;
  const cfg = Object.assign({ type: 'daily', max_items: 'all', min_item_width: 64, sun_entity: 'sun.sun' }, this.options || {});
  const box = card.querySelector('.wx-box');
  const row = card.querySelector('.wx-head');
  if (!box || !row || !entity) return '';
  const st = hass.states[entity];
  if (!st || !st.attributes || entity.indexOf('weather.') !== 0) return '';
  const a = st.attributes;
  /* Units. What the card shows follows the weather entity's units, else Home Assistant's
     own unit system. A sensor may report in a unit of its own, so its readings are
     converted to the card's. The card's thresholds (what counts as a trace, the smallest
     rain scale, the animation's intensities) sit on one common scale — the table below is
     the only place that knows how big each unit is. */
  const us = (hass.config && hass.config.unit_system) || {};
  const precipU = a.precipitation_unit || us.accumulated_precipitation || 'mm';
  const pUnitScale = { mm: 1, cm: 10, in: 25.4, '"': 25.4 };
  const pUnitOf = (u) => String(u || precipU).split('/')[0].trim().toLowerCase();   /* a rate's unit, without the /h */
  const precipBase = (v, fromU) => Number(v) * (pUnitScale[pUnitOf(fromU)] || 1);        /* onto the common scale */
  const fromBase = (v) => v / (pUnitScale[pUnitOf(precipU)] || 1);                       /* common scale to the card's unit */
  const precipConv = (v, fromU) => fromBase(precipBase(v, fromU));
  /* colour at v along [[value, '#rrggbb'], ...], blending between neighbours */
  const blendAnch = (an, v) => {
    if (!an.length) return '#ffffff';
    const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    if (v <= an[0][0]) return an[0][1];
    const last = an[an.length - 1];
    if (v >= last[0]) return last[1];
    let i = 0;
    while (i < an.length - 2 && v > an[i + 1][0]) i++;
    const lo = an[i], hi = an[i + 1], k = hi[0] === lo[0] ? 0 : (v - lo[0]) / (hi[0] - lo[0]);
    const c1 = hx(lo[1]), c2 = hx(hi[1]);
    return 'rgb(' + c1.map((c, j) => Math.round(c + (c2[j] - c) * k)).join(',') + ')';
  };
  /* band colours as blend anchors at each band's middle, plus one band past the top so
     the highest part of the scale still blends toward the next colour */
  const bandAnch = (bands, lo, hi) => {
    const inside = bands.filter((b) => b[1] > lo && b[0] < hi);
    const nxt = bands[bands.indexOf(inside[inside.length - 1]) + 1];
    return inside.concat(nxt ? [nxt] : []).map((b) => [(Math.max(b[0], lo) + Math.min(b[1], hi + (hi - lo))) / 2, b[2]]);
  };
  /* The one gradient recipe for every chart, the temperature chart's: colour blends through
     the bands rather than stepping at their edges; the line at full strength, the fill
     fading from the top of the scale toward the bottom. */
  const chartGrad = (mk, id, bottom, top, colAt, lo, hi, fade) => {
    const g = mk('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: bottom, x2: 0, y2: top });
    for (let i = 0; i <= 16; i++) {
      const o2 = i / 16;
      g.appendChild(mk('stop', { offset: o2, 'stop-color': colAt(lo + (hi - lo) * o2), 'stop-opacity': fade ? (0.05 + 0.95 * Math.pow(o2, 1.3)) : 1 }));
    }
    return g;
  };
  const fmtPrecip = (v) => (/in/i.test(precipU) ? Number(v).toFixed(2) : v < 10 ? Number(v).toFixed(1) : String(Math.round(v))) + ' ' + precipU;
  const W = window;

  /* ---- shared helpers, built once per page ---- */
  if (!W.__spyglassWeatherCard || W.__spyglassWeatherCard.v !== 10) {
    const L = W.__spyglassWeatherCard = { v: 10 };
    L.icons = {
      'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', fog: 'mdi:weather-fog',
      hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy',
      partlycloudy: 'mdi:weather-partly-cloudy', 'partlycloudy-night': 'mdi:weather-night-partly-cloudy',
      pouring: 'mdi:weather-pouring', rainy: 'mdi:weather-rainy', snowy: 'mdi:weather-snowy',
      'snowy-rainy': 'mdi:weather-snowy-rainy', sunny: 'mdi:weather-sunny', windy: 'mdi:weather-windy',
      'windy-variant': 'mdi:weather-windy-variant', exceptional: 'mdi:alert-circle-outline'
    };
    /* HA's own weather-card artwork (frontend src/data/weather.ts, coordinates rounded) */
    const P = (fill, d, extra) => "<path fill='" + fill + "'" + (extra || '') + " d='" + d + "'/>";
    const sunP = P('#fdd93c', 'm 14.39,8.40 c 0,3.31 -2.68,5.99 -5.99,5.99 -3.31,0 -5.99,-2.68 -5.99,-5.99 0,-3.31 2.68,-5.99 5.99,-5.99 3.31,0 5.99,2.68 5.99,5.99');
    const moonP = P('#fcf497', 'm 13.50,11.38 c -1.01,1.85 -2.97,3.12 -5.24,3.12 -3.28,0 -5.95,-2.66 -5.95,-5.95 0,-2.26 1.26,-4.22 3.12,-5.24 -0.45,0.84 -0.71,1.80 -0.71,2.83 0,3.28 2.66,5.95 5.95,5.95 1.02,0 1.98,-0.25 2.83,-0.71');
    const small = 'm14.98 4.21c0 1.92-1.56 3.48-3.48 3.48-1.92 0-3.48-1.56-3.48-3.48s1.56-3.48 3.48-3.48c1.92 0 3.48 1.55 3.48 3.48';
    const clouds = P('#d4d4d4', 'm3.88 5.03c-0.54 0.16-1.04 0.46-1.43 0.86-0.63 0.63-1.02 1.49-1.02 2.45 0 1.92 1.55 3.46 3.48 3.46h6.96c1.92 0 3.48-1.59 3.48-3.52 0-1.92-1.55-3.52-3.48-3.52h-1.08c-0.25-1.69-1.69-2.90-3.44-2.90-1.79 0-3.28 1.41-3.46 3.16')
      + P('#f9f9f9', 'm4.19 7.69c-0.33 0.10-0.64 0.28-0.88 0.53-0.39 0.38-0.63 0.92-0.63 1.51 0 1.18 0.96 2.14 2.15 2.14h4.30c1.18 0 2.15-0.98 2.15-2.17 0-1.18-0.96-2.17-2.15-2.17h-0.66c-0.15-1.04-1.04-1.79-2.12-1.79-1.11 0-2.02 0.87-2.14 1.95');
    const rain = P('#30b3ff', 'M5.28 14.73c-0.22 0.24-0.57 0.29-0.77 0.11-0.20-0.18-0.18-0.53 0.03-0.78 0.14-0.16 0.59-0.32 0.87-0.42 0.12-0.04 0.22 0.05 0.19 0.17-0.06 0.29-0.18 0.74-0.33 0.91'
      + 'M11.25 14.16c-0.22 0.24-0.57 0.29-0.77 0.11-0.20-0.18-0.18-0.53 0.03-0.78 0.14-0.16 0.59-0.32 0.87-0.42 0.12-0.04 0.22 0.05 0.19 0.17-0.06 0.29-0.18 0.74-0.33 0.91'
      + 'M8.43 15.87c-0.15 0.17-0.39 0.20-0.53 0.07-0.14-0.12-0.12-0.36 0.02-0.53 0.10-0.11 0.40-0.22 0.60-0.29 0.08-0.02 0.15 0.03 0.13 0.12-0.04 0.20-0.12 0.51-0.23 0.62'
      + 'M7.99 14.11c-0.19 0.21-0.49 0.25-0.66 0.09-0.17-0.15-0.16-0.45 0.03-0.67 0.12-0.14 0.50-0.28 0.75-0.36 0.10-0.03 0.19 0.04 0.17 0.15-0.05 0.25-0.16 0.64-0.28 0.78');
    const pour = P('#30b3ff', 'M10.64 16.44c-0.19 0.21-0.49 0.25-0.66 0.09-0.17-0.16-0.16-0.46 0.03-0.67 0.12-0.14 0.50-0.28 0.75-0.36 0.10-0.03 0.19 0.04 0.17 0.15-0.05 0.25-0.16 0.65-0.28 0.79'
      + 'M5.93 16.65c-0.22 0.25-0.57 0.30-0.77 0.11-0.20-0.18-0.18-0.54 0.03-0.79 0.14-0.16 0.59-0.33 0.87-0.42 0.12-0.04 0.22 0.05 0.19 0.18-0.06 0.29-0.18 0.75-0.33 0.92');
    const wind = P('#d4d4d4', 'm 13.59,15.30 c 0,0 -0.09,-0.00 -0.25,-0.01 -0.15,-0.01 -0.38,-0.02 -0.64,-0.05 -0.26,-0.02 -0.56,-0.06 -0.87,-0.12 -0.15,-0.03 -0.31,-0.06 -0.47,-0.11 -0.15,-0.04 -0.31,-0.09 -0.46,-0.16 l -0.26,-0.09 c -0.09,-0.02 -0.20,-0.04 -0.30,-0.06 -0.19,-0.02 -0.38,-0.03 -0.56,-0.02 -0.36,0.02 -0.68,0.11 -0.94,0.22 -0.26,0.10 -0.46,0.23 -0.60,0.32 -0.13,0.09 -0.20,0.16 -0.20,0.16 0,0 0.08,-0.01 0.24,-0.04 0.15,-0.02 0.37,-0.06 0.63,-0.08 0.25,-0.02 0.55,-0.04 0.86,-0.02 0.07,0.00 0.15,0.01 0.23,0.02 0.07,0.01 0.15,0.02 0.23,0.04 0.07,0.01 0.13,0.03 0.21,0.05 l 0.23,0.08 c 0.09,0.03 0.18,0.07 0.27,0.09 0.09,0.02 0.18,0.05 0.27,0.07 0.18,0.03 0.36,0.06 0.54,0.07 0.35,0.01 0.67,-0.01 0.95,-0.06 0.27,-0.05 0.49,-0.12 0.64,-0.18 0.15,-0.05 0.23,-0.10 0.23,-0.10')
      + P('#d4d4d4', 'm 4.75,13.90 c 0,0 0.09,-0.00 0.25,-0.00 0.15,-0.00 0.38,-0.01 0.64,-0.03 0.26,-0.01 0.56,-0.04 0.88,-0.09 0.15,-0.02 0.31,-0.05 0.47,-0.09 0.15,-0.03 0.31,-0.08 0.46,-0.14 l 0.27,-0.08 c 0.10,-0.02 0.20,-0.04 0.30,-0.05 0.19,-0.01 0.38,-0.01 0.56,0.00 0.36,0.03 0.67,0.14 0.93,0.26 0.25,0.11 0.45,0.24 0.58,0.34 0.13,0.09 0.19,0.16 0.19,0.16 0,0 -0.08,-0.01 -0.24,-0.05 C 9.94,14.08 9.72,14.04 9.46,14.00 9.20,13.97 8.90,13.94 8.59,13.95 c -0.07,0.00 -0.15,0.01 -0.23,0.01 -0.07,0.00 -0.15,0.02 -0.23,0.03 -0.07,0.01 -0.14,0.03 -0.21,0.04 l -0.24,0.08 c -0.09,0.02 -0.18,0.06 -0.27,0.08 C 7.30,14.23 7.20,14.26 7.11,14.27 6.93,14.30 6.74,14.32 6.56,14.32 6.21,14.33 5.89,14.28 5.62,14.22 5.35,14.16 5.13,14.08 4.98,14.01 4.83,13.95 4.75,13.90 4.75,13.90');
    const snow = P('#f9f9f9', 'M 8.43,15.34 c 0,0.25 -0.20,0.46 -0.46,0.46 -0.25,0 -0.46,-0.20 -0.46,-0.46 0,-0.25 0.20,-0.46 0.46,-0.46 0.25,0 0.46,0.20 0.46,0.46'
      + 'M 11.26,14.35 c 0,0.36 -0.29,0.65 -0.65,0.65 -0.36,0 -0.65,-0.29 -0.65,-0.65 0,-0.36 0.29,-0.65 0.65,-0.65 0.36,0 0.65,0.29 0.65,0.65'
      + 'M 5.32,13.69 c 0,0.36 -0.29,0.66 -0.65,0.66 -0.36,0 -0.65,-0.29 -0.65,-0.66 0,-0.36 0.29,-0.65 0.65,-0.65 0.36,0 0.65,0.29 0.65,0.65', " stroke='#d4d4d4' stroke-width='1' paint-order='stroke'");
    const bolt = P('#fdd93c', 'm 9.92,10.93 -1.64,2.34 1.11,0.05 -1.21,2.02 3.04,-2.61 H 9.88 L 10.97,11.29 10.70,10.79 h -0.50 l -0.26,0.13');
    /* Weather artwork adapted from the Home Assistant frontend (Apache-2.0), cropped
       per condition by the table below. */
    const art = {
      sunny: sunP, 'clear-night': moonP,
      partlycloudy: P('#fdd93c', small) + clouds, 'partlycloudy-night': P('#fcf497', small) + clouds,
      cloudy: clouds, fog: clouds, lightning: clouds + bolt, 'lightning-rainy': clouds + rain + bolt,
      pouring: clouds + rain + pour, rainy: clouds + rain, hail: clouds + rain,
      snowy: clouds + snow, 'snowy-rainy': clouds + snow, windy: clouds + wind, 'windy-variant': clouds + wind
    };
    /* HA draws each of these inside the same 17×17 canvas, but the artwork doesn't fill
       it the same way — the sun is centred, the clouds sit high. Crop each one to its own
       bounds so they line up with each other wherever they are placed. */
    const bbox = {
      sunny: '2 2 13 13', 'clear-night': '2 2 13 13',
      partlycloudy: '1.2 0.5 14.6 11.6', 'partlycloudy-night': '1.2 0.5 14.6 11.6',
      cloudy: '1.2 1.8 14.6 10.2', fog: '1.2 1.8 14.6 10.2',
      windy: '1.2 1.8 14.6 14', 'windy-variant': '1.2 1.8 14.6 14',
      lightning: '1.2 1.8 14.6 13.8', 'lightning-rainy': '1.2 1.8 14.6 14.6',
      rainy: '1.2 1.8 14.6 14.4', pouring: '1.2 1.8 14.6 15.2', hail: '1.2 1.8 14.6 14.4',
      snowy: '1.2 1.8 14.6 14.4', 'snowy-rainy': '1.2 1.8 14.6 14.4'
    };
    const cache = {};
    L.art = (k) => {
      if (!art[k]) return '';
      if (!cache[k]) cache[k] = 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='" + (bbox[k] || '0 0 17 17') + "'>" + art[k] + '</svg>') + '")';
      return cache[k];
    };
    /* Muted [day, night] gradients (top, bottom) per condition */
    L.bg = {
      sunny:                [['#50608e', '#3e6cbb'], ['#2f3148', '#3b3d58']],
      'clear-night':        [['#50608e', '#3e6cbb'], ['#2b2d44', '#383a55']],
      partlycloudy:         [['#525f88', '#4a6ea8'], ['#32334b', '#3e4059']],
      'partlycloudy-night': [['#525f88', '#4a6ea8'], ['#32334b', '#3e4059']],
      cloudy:               [['#5a6580', '#66738f'], ['#33364a', '#40445a']],
      fog:                  [['#6f7a8a', '#8791a0'], ['#383f4a', '#4a525d']],
      rainy:                [['#4c5a74', '#526685'], ['#2c3345', '#38405a']],
      pouring:              [['#414d64', '#495b75'], ['#262c3c', '#313a4e']],
      lightning:            [['#4a4b68', '#5a5c7c'], ['#26263a', '#333450']],
      'lightning-rainy':    [['#454761', '#535673'], ['#232436', '#30324a']],
      snowy:                [['#69758d', '#8b97ab'], ['#343b4b', '#454d5f']],
      'snowy-rainy':        [['#5f6d86', '#7a889c'], ['#303747', '#404859']],
      hail:                 [['#55637d', '#66768e'], ['#2e3546', '#3c4457']],
      windy:                [['#526a92', '#5b7fae'], ['#2f3549', '#3d4560']],
      'windy-variant':      [['#56698a', '#6b7f9d'], ['#31374a', '#40485c']],
      exceptional:          [['#5a554a', '#7a6a4e'], ['#2f2d28', '#463d2f']]
    };
    /* Cloud texture, drawn on a canvas at exactly the tile's device-pixel width so it
       is painted 1:1 (a scaled, repeated image shows a seam at every repeat). Fractal
       value noise, periodic in x, shaped into clouds by a transfer table:
       density 0 sparse, 1 broken, 2 overcast, 3 haze (no threshold) */
    const texCache = {};
    L.cloudTex = (seed, density, scale, W, H, stretch, contrast, vfade) => {
      stretch = stretch || 1; contrast = contrast || 1.3; vfade = vfade || 'bottom';
      const key = [seed, density, scale, W, H, stretch, contrast, vfade].join('|');
      /* vertical falloff: clouds thin out toward the bottom of the card, fog toward the top */
      const fade = (fy) => vfade === 'bottom'
        ? (fy < 0.25 ? fy / 0.25 : fy < 0.5 ? 1 : Math.max(0, 1 - (fy - 0.5) / 0.3))      /* clouds: a band between header and forecast */
        : (fy < 0.35 ? fy / 0.35 * 0.5 : fy < 0.7 ? 0.5 + (fy - 0.35) / 0.35 * 0.5 : 1); /* fog: densest low */
      if (texCache[key]) return texCache[key];
      const tables = [[0, 0, 0, 0, 0, 0.1, 0.35, 0.7, 0.95, 1], [0, 0, 0, 0.05, 0.25, 0.55, 0.8, 0.95, 1, 1], [0, 0, 0.08, 0.3, 0.55, 0.8, 0.95, 1, 1, 1], [0, 0.04, 0.12, 0.25, 0.42, 0.6, 0.76, 0.88, 0.95, 1]];
      const table = tables[density];
      const shape = (v) => { const p = Math.min(0.9999, Math.max(0, v)) * (table.length - 1), i = Math.floor(p), f = p - i; return table[i] + (table[i + 1] - table[i]) * f; };
      const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1013904223) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      const sm = (t) => t * t * (3 - 2 * t);
      /* evaluate at quarter resolution, then upsample: plenty for soft cloud shapes */
      const w = Math.max(8, Math.ceil(W / 4)), h = Math.max(4, Math.ceil(H / 4));
      const buf = new Float32Array(w * h);
      let amp = 1, total = 0;
      for (let o = 0; o < 5; o++, amp *= 0.5) {
        const cellsX = Math.max(1, Math.round(4 * scale * Math.pow(2, o)));   /* integer → periodic in x */
        const cell = w / cellsX, cellsY = Math.max(1, Math.round(h * stretch / cell));
        for (let y = 0; y < h; y++) {
          const gy = y / (h / cellsY), iy = Math.floor(gy), fy = sm(gy - iy);
          for (let x = 0; x < w; x++) {
            const gx = x / cell, ix = Math.floor(gx), fx = sm(gx - ix);
            const x0 = ix % cellsX, x1 = (ix + 1) % cellsX;
            const a = hash(x0, iy, seed + o * 17), b = hash(x1, iy, seed + o * 17), c2 = hash(x0, iy + 1, seed + o * 17), d = hash(x1, iy + 1, seed + o * 17);
            buf[y * w + x] += amp * ((a + (b - a) * fx) * (1 - fy) + (c2 + (d - c2) * fx) * fy);
          }
        }
        total += amp;
      }
      /* two tiles side by side in one image: the layer is never repeated, so there is
         no repeat edge for the sampler to blend; the middle join is continuous noise */
      const W2 = W * 2;
      const cv = document.createElement('canvas'); cv.width = W2; cv.height = H;
      const ctx = cv.getContext('2d'), img = ctx.createImageData(W2, H), px = img.data;
      const scaleX = w / W;   /* low-res buffer columns per output pixel */
      for (let y = 0; y < H; y++) {
        const sy = y / 4, y0 = Math.min(h - 1, Math.floor(sy)), y1 = Math.min(h - 1, y0 + 1), fy = sy - y0;
        for (let x = 0; x < W2; x++) {
          const sx = (x % W) * scaleX, x0 = Math.floor(sx) % w, x1 = (x0 + 1) % w, fx = sx - Math.floor(sx);
          const v = ((buf[y0 * w + x0] * (1 - fx) + buf[y0 * w + x1] * fx) * (1 - fy) + (buf[y1 * w + x0] * (1 - fx) + buf[y1 * w + x1] * fx) * fy) / total;
          /* stretch the mid-range a little so the table has contrast to work with */
          const alpha = shape((v - 0.5) * contrast + 0.5) * fade(y / H);
          const i = (y * W2 + x) * 4;
          px[i] = 226; px[i + 1] = 229; px[i + 2] = 238; px[i + 3] = Math.round(alpha * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      return (texCache[key] = 'url("' + cv.toDataURL('image/png') + '")');
    };
    /* Web Animations with plain px keyframes run on the compositor thread; CSS keyframes
       that reference var() (--tile, --sway…) fall back to the main thread and stutter
       whenever a hass update lands */
    L.anim = (el, frames, dur, delay, easing, reverse) => {
      if (!el.animate) return null;
      return el.animate(frames, { duration: dur * 1000, delay: (delay || 0) * 1000, iterations: Infinity, easing: easing || 'linear', direction: reverse ? 'reverse' : 'normal', fill: 'both' });
    };
    /* history points inside [start, end], plus the state that was in effect at
       start (HA returns it stamped with its earlier change time) pinned to start */
    L.window = (pts, start, end) => {
      const out = [];
      let prev = null;
      pts.forEach((p) => { if (p[0] < start) prev = p; else if (p[0] <= end) out.push(p); });
      if (prev) out.unshift([start, prev[1]]);
      return out;
    };
    /* Pirate Weather / Dark Sky icon keys -> the conditions the artwork is keyed on */
    L.pw = { 'clear-day': 'sunny', 'clear-night': 'clear-night', 'partly-cloudy-day': 'partlycloudy',
      'partly-cloudy-night': 'partlycloudy-night', cloudy: 'cloudy', rain: 'rainy', snow: 'snowy',
      sleet: 'snowy-rainy', wind: 'windy', fog: 'fog', hail: 'hail', thunderstorm: 'lightning-rainy' };
    L.rand = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
    L.el = (tag, cls, parent) => { const e = document.createElement(tag); e.className = cls; parent.appendChild(e); return e; };
    L.kind = (c) => /pouring/.test(c) ? 'pour' : /snowy-rainy/.test(c) ? 'mix' : /rainy|hail/.test(c) ? 'rain' : /snowy/.test(c) ? 'snow' : '';
    /* cloud cover per condition: 0 none, 1 scattered, 2 broken, 3 overcast */
    L.cover = (c) => ({ cloudy: 3, partlycloudy: 1, 'partlycloudy-night': 1, rainy: 3, pouring: 3, lightning: 3,
      'lightning-rainy': 3, snowy: 2, 'snowy-rainy': 2, hail: 2, windy: 2, 'windy-variant': 2, exceptional: 0, fog: 0 })[c] || 0;
    L.t = (v) => (v == null || isNaN(v)) ? '–' : Math.round(v) + '°';
    L.dkey = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    /* the artwork as a plain data URI, for an SVG <image> */
    L.artUrl = (k) => { const u = L.art(k); return u ? u.slice(5, -2) : ''; };
    /* condition -> icon element (HA artwork, mdi fallback) */
    L.icon = (c) => {
      const u = L.art(c);
      if (u) { const i = document.createElement('i'); i.className = 'wx-art'; i.style.backgroundImage = u; return i; }
      const h = document.createElement('ha-icon'); h.icon = L.icons[c] || 'mdi:weather-cloudy'; return h;
    };
  }
  const L = W.__spyglassWeatherCard;
  const S = card.__wx || (card.__wx = {});
  const sun = hass.states[cfg.sun_entity || 'sun.sun'];
  const nightNow = !!(sun && sun.state === 'below_horizon');
  const nightAt = (t) => {
    if (!sun || !sun.attributes.next_rising) return nightNow;
    const now = Date.now(), rise = Date.parse(sun.attributes.next_rising), set = Date.parse(sun.attributes.next_setting);
    let tt = t; while (tt - now > 864e5) tt -= 864e5; while (tt < now) tt += 864e5;
    return nightNow ? !(tt > rise && (set < rise || tt < set)) : (tt > set && tt < rise);
  };
  /* today's twilight and sun times, folded from the sun entity's next_* attributes */
  const sunTimes = () => {
    if (!sun || !sun.attributes.next_rising) return null;
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const day0 = d0.getTime(), day1 = day0 + 864e5;
    const fold = (k) => { let t = Date.parse(sun.attributes[k]); if (!isFinite(t)) return null; while (t >= day1) t -= 864e5; while (t < day0) t += 864e5; return t; };
    return { day0: day0, dawn: fold('next_dawn'), rise: fold('next_rising'), set: fold('next_setting'), dusk: fold('next_dusk') };
  };
  /* Sunrise, sunset and civil twilight for any day, worked out from the sun's position
     (the standard sunrise equation, within a minute or so of Home Assistant's own). Sun
     times need no recording, so the sun view can page to any date; today still uses
     Home Assistant's sun entity. Null where the sun doesn't rise or set that day. */
  const sunCalc = (off) => {
    const lat = Number(hass.config && hass.config.latitude), lon = Number(hass.config && hass.config.longitude);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    const rad = Math.PI / 180, day0 = dayStartOf(off);
    const jdNoon = (day0 + 432e5) / 864e5 + 2440587.5;
    const Js = Math.round(jdNoon - 2451545 + 0.0008 + lon / 360) - lon / 360;   /* mean solar noon */
    const M = (357.5291 + 0.98560028 * Js) % 360;
    const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const lam = (M + C + 180 + 102.9372) % 360;
    const Jt = 2451545 + Js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad);
    const dec = Math.asin(Math.sin(lam * rad) * Math.sin(23.4397 * rad));
    const at = (h0, sign) => {
      const cw = (Math.sin(h0 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
      if (cw < -1 || cw > 1) return null;
      return Math.round((Jt + sign * Math.acos(cw) / rad / 360 - 2440587.5) * 864e5);
    };
    const T = { day0: day0, dawn: at(-6, -1), rise: at(-0.833, -1), set: at(-0.833, 1), dusk: at(-6, 1) };
    return T.rise && T.set ? T : null;
  };
  /* The moon, worked out from the date like the sun times: the angle between moon and sun
     as seen from Earth (low-precision positions, good to a fraction of a degree), which
     gives how much is lit, whether it is waxing, the phase's name, and when the next full
     or new moon falls. Needs no sensor, and works for any day the sun view pages to. */
  const moonElong = (t) => {
    const d = t / 864e5 - 10957.5, r = Math.PI / 180, n360 = (v) => ((v % 360) + 360) % 360;   /* days since J2000.0 */
    const g = n360(357.529 + 0.98560028 * d);
    const ls = 280.459 + 0.98564736 * d + 1.915 * Math.sin(g * r) + 0.020 * Math.sin(2 * g * r);
    const Mm = 134.963 + 13.064993 * d, D = 297.850 + 12.190749 * d, F = 93.272 + 13.229350 * d;
    const lm = 218.316 + 13.176396 * d + 6.289 * Math.sin(Mm * r) + 1.274 * Math.sin((2 * D - Mm) * r) + 0.658 * Math.sin(2 * D * r)
      + 0.214 * Math.sin(2 * Mm * r) - 0.186 * Math.sin(g * r) - 0.114 * Math.sin(2 * F * r);
    return n360(lm - ls);
  };
  /* the next moment the angle passes 180 (full) or 0 (new) after t: step six hours, then halve */
  const moonNext = (t, full) => {
    const past = (a0, a1) => (full ? a0 < 180 && a1 >= 180 : a0 > 300 && a1 < 60);
    let t0 = t, e0 = moonElong(t0);
    for (let i = 0; i < 130; i++) {
      const t1 = t0 + 216e5, e1 = moonElong(t1);
      if (past(e0, e1)) {
        let lo = t0, hi = t1;
        for (let j = 0; j < 20; j++) { const mid = (lo + hi) / 2; if (past(moonElong(lo), moonElong(mid))) hi = mid; else lo = mid; }
        return hi;
      }
      t0 = t1; e0 = e1;
    }
    return null;
  };
  /* A phase is a moment, so a day is named for it only when that moment falls on the day
     (from0 to to0, local midnights), as the almanacs do. A window around the angle instead
     would name two nights in a row, since the moon moves about 12° a day. */
  const moonAt = (t, from0, to0) => {
    const E = moonElong(t), k = (1 - Math.cos(E * Math.PI / 180)) / 2, waxing = E < 180;
    const e0 = moonElong(from0), e1 = moonElong(to0);
    const hit = (a) => { const d0 = ((e0 - a + 540) % 360) - 180, d1 = ((e1 - a + 540) % 360) - 180; return d0 < 0 && d1 >= 0; };
    const name = hit(0) ? 'New moon' : hit(90) ? 'First quarter' : hit(180) ? 'Full moon' : hit(270) ? 'Last quarter'
      : (waxing ? 'Waxing ' : 'Waning ') + (k < 0.5 ? 'crescent' : 'gibbous');
    return { E: E, k: k, waxing: waxing, name: name };
  };
  /* the moon drawn like the weather artwork's crescent: its pale yellow for the lit part,
     over a faint full disc, the terminator an ellipse for the real amount lit. Lit on the
     right while waxing, mirrored south of the equator. */
  const moonIcon = (k, waxing, size) => {
    const NS = 'http://www.w3.org/2000/svg', mk = (n, at) => { const e = document.createElementNS(NS, n); Object.keys(at).forEach((q) => e.setAttribute(q, at[q])); return e; };
    const sv = mk('svg', { viewBox: '0 0 24 24', width: size, height: size, class: 'wx-moon-ic' });
    /* the whole disc always shows, so a nearly-full or nearly-new moon still reads as round:
       its dark side a soft white wash, lighter than whatever sky is behind it rather than a
       fixed colour that can match the background */
    sv.appendChild(mk('circle', { cx: 12, cy: 12, r: 10, fill: '#ffffff', 'fill-opacity': 0.28 }));
    const south = Number(hass.config && hass.config.latitude) < 0, right = south ? !waxing : waxing;
    if (k > 0.99) sv.appendChild(mk('circle', { cx: 12, cy: 12, r: 10, fill: '#fcf497' }));
    else if (k > 0.01) {
      const rx = (10 * Math.abs(1 - 2 * k)).toFixed(2);
      const d = right ? 'M12,2 A10 10 0 0 1 12,22 A' + rx + ' 10 0 0 ' + (k < 0.5 ? 0 : 1) + ' 12,2 Z'
        : 'M12,2 A10 10 0 0 0 12,22 A' + rx + ' 10 0 0 ' + (k < 0.5 ? 1 : 0) + ' 12,2 Z';
      sv.appendChild(mk('path', { d: d, fill: '#fcf497' }));
    }
    return sv;
  };
  const fmtTime = (t) => new Date(t).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 });
  const fmtDur = (ms) => { const m = Math.max(0, Math.round(ms / 6e4)); return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  /* sun arc: a 24 h cosine whose zero crossings sit on sunrise/sunset,
     shaded above the horizon, dotted through twilight, with the sun where it is now */
  const sunGraph = (T, Wd, H) => {
    const padB = 20, top = 8, bottom = H - padB;
    const D = T.set - T.rise, noon = (T.rise + T.set) / 2;
    const c0 = Math.cos(Math.PI * D / 864e5);
    const ev = (t) => Math.cos(2 * Math.PI * (t - noon) / 864e5) - c0;   /* 0 at rise/set */
    const emax = 1 - c0, emin = -1 - c0;
    const x = (t) => (t - T.day0) / 864e5 * Wd;
    const y = (e) => top + (emax - e) / (emax - emin) * (bottom - top);
    const horizon = y(0);
    let path = '';
    for (let i = 0; i <= 96; i++) { const t = T.day0 + i * 9e5; path += (i ? ' L ' : 'M ') + x(t).toFixed(1) + ' ' + y(ev(t)).toFixed(1); }
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(svgNS, n); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Wd, height: H, class: 'wx-sun-svg' });
    svg.style.height = H + 'px';
    const defs = el('defs', {});
    const clip = el('clipPath', { id: 'wx-day-clip' });
    clip.appendChild(el('rect', { x: x(T.rise), y: 0, width: Math.max(0, x(T.set) - x(T.rise)), height: horizon }));
    defs.appendChild(clip);
    const grad = el('linearGradient', { id: 'wx-sky', x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(el('stop', { offset: '0', 'stop-color': 'rgba(255,255,255,0.28)' }));
    grad.appendChild(el('stop', { offset: '1', 'stop-color': 'rgba(255,255,255,0.06)' }));
    defs.appendChild(grad);
    svg.appendChild(defs);
    /* daylight sky */
    svg.appendChild(el('rect', { x: 0, y: 0, width: Wd, height: horizon, fill: 'url(#wx-sky)', 'clip-path': 'url(#wx-day-clip)' }));
    /* hour grid */
    [6, 12, 18].forEach((hh) => svg.appendChild(el('line', { x1: hh / 24 * Wd, y1: 0, x2: hh / 24 * Wd, y2: bottom, class: 'wx-sun-grid' })));
    /* horizon */
    svg.appendChild(el('line', { x1: 0, y1: horizon, x2: Wd, y2: horizon, class: 'wx-sun-horizon' }));
    /* curve: below the horizon dim, above bright (clip) */
    svg.appendChild(el('path', { d: path, class: 'wx-sun-path dim' }));
    svg.appendChild(el('path', { d: path, class: 'wx-sun-path', 'clip-path': 'url(#wx-day-clip)' }));
    /* twilight dots */
    /* three dots stepping away from sunrise / sunset into twilight, about half the
       twilight's length apart (at least 14 minutes) */
    [[T.rise, -1], [T.set, 1]].forEach((seg) => {
      const tw = seg[1] < 0 ? (T.dawn ? T.rise - T.dawn : 30 * 6e4) : (T.dusk ? T.dusk - T.set : 30 * 6e4);
      const step = Math.max(tw * 0.55, 14 * 6e4);
      for (let i = 1; i <= 3; i++) { const t = seg[0] + seg[1] * step * i; svg.appendChild(el('circle', { cx: x(t), cy: y(ev(t)), r: 1.9, class: 'wx-sun-dot' })); }
    });
    /* the sun now */
    const now = Date.now();
    if (now >= T.day0 && now < T.day0 + 864e5) {
      const up = ev(now) > 0;
      const rs = Math.max(5, Math.min(8, H / 16));
      if (up) svg.appendChild(el('circle', { cx: x(now), cy: y(ev(now)), r: rs * 2.4, class: 'wx-sun-glow' }));
      svg.appendChild(el('circle', { cx: x(now), cy: y(ev(now)), r: up ? rs : rs * 0.75, class: up ? 'wx-sun-now' : 'wx-sun-now night' }));
    }
    /* axis labels */
    [[0, '12 AM'], [6, '6 AM'], [12, '12 PM'], [18, '6 PM']].forEach((l) => {
      const t = el('text', { x: l[0] / 24 * Wd + 5, y: H - 6, class: 'wx-sun-axis' }); t.textContent = l[1]; svg.appendChild(t);
    });
    const wrap = document.createElement('div'); wrap.className = 'wx-sun-wrap';
    wrap.appendChild(svg);
    const rows = L.el('div', 'wx-sun-rows', wrap);
    [['First light', T.dawn], ['Sunrise', T.rise], ['Sunset', T.set], ['Last light', T.dusk], ['Total daylight', fmtDur(T.set - T.rise)]].forEach((r) => {
      if (!r[1]) return;
      const c = L.el('div', 'wx-sun-row', rows);
      L.el('span', 'wx-sun-k', c).textContent = r[0];
      L.el('span', 'wx-sun-v', c).textContent = typeof r[1] === 'string' ? r[1] : fmtTime(r[1]);
    });
    /* that night's moon (at 9 PM), and the next full or new moon after it */
    {
      const next0 = new Date(T.day0); next0.setDate(next0.getDate() + 1);
      const tn = T.day0 + 21 * 36e5, Mn = moonAt(tn, T.day0, next0.getTime());
      const nf = moonNext(tn, true), nn = moonNext(tn, false);
      const nx = nf && (!nn || nf < nn) ? [nf, 'Full moon'] : nn ? [nn, 'New moon'] : null;
      let when = '';
      if (nx) {
        /* whole days from that night's date to the event's */
        const dd = Math.round((new Date(nx[0]).setHours(0, 0, 0, 0) - new Date(T.day0).setHours(0, 0, 0, 0)) / 864e5);
        const dn = new Date(nx[0]);
        when = dd <= 0 ? 'tonight' : dd === 1 ? 'tomorrow' : dd < 7 ? dn.toLocaleDateString(lang, { weekday: 'long' }) : dn.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
      }
      /* above the chart, so it sits with the view's header rather than under the times */
      const ml = document.createElement('div'); ml.className = 'wx-moon';
      wrap.insertBefore(ml, wrap.firstChild);
      ml.appendChild(moonIcon(Mn.k, Mn.waxing, 26));
      L.el('span', 'wx-moon-t', ml).textContent = Mn.name + ' · ' + Math.round(Mn.k * 100) + '% lit'
        + (nx && Mn.name !== nx[1] ? ' · ' + nx[1] + ' ' + when : '');
    }
    return wrap;
  };
  /* wind history for today (HA history API), cached ten minutes */
  const windHistory = (off) => {
    const dcfg = cfg.details || {};
    const slot = (off || 0) === 0 ? 'wHist' : 'wHist_' + off;
    const ids = [];
    if (typeof dcfg.wind === 'string') ids.push(dcfg.wind);
    if (dcfg.gust) ids.push(dcfg.gust);
    if (dcfg.bearing) ids.push(dcfg.bearing);
    if (!ids.length) { S[slot] = { at: Date.now(), speed: [], gust: [], bearing: [] }; return; }
    /* a finished day never changes, so it is kept until midnight; today is refreshed
       every ten minutes; a fetch that failed is retried after thirty seconds */
    if (S[slot] && (S[slot].err ? Date.now() - S[slot].at < 3e4 : ((off || 0) < 0 || Date.now() - S[slot].at < 6e5))) return;
    if (S[slot + 'Busy']) return;
    S[slot + 'Busy'] = true;
    const from = new Date(dayStartOf(off || 0));
    const to = new Date(Math.min(Date.now(), dayStartOf(off || 0) + 864e5));
    const url = 'history/period/' + from.toISOString() + '?filter_entity_id=' + ids.join(',') + '&end_time=' + to.toISOString() + '&minimal_response&no_attributes&significant_changes_only=0';
    hass.callApi('GET', url).then((res) => {
      const out = { at: Date.now(), speed: [], gust: [], bearing: [] };
      (res || []).forEach((arr) => {
        if (!arr || !arr.length) return;
        const id = arr[0].entity_id;
        const key = id === dcfg.gust ? 'gust' : id === dcfg.bearing ? 'bearing' : 'speed';
        arr.forEach((p) => { const v = Number(p.state), t = Date.parse(p.last_changed || p.last_updated); if (isFinite(v) && isFinite(t)) out[key].push([t, v]); });
      });
      S[slot] = out; S[slot + 'Busy'] = false;
      if ((off || 0) < 0 && out.speed.length === 0) setFloor('wHist', off);
      S.sig = null; if (S.draw) S.draw();
    }).catch(() => { S[slot + 'Busy'] = false; S[slot] = { at: Date.now(), speed: [], gust: [], bearing: [], err: true }; S.sig = null; if (S.draw) S.draw(); });
  };
  /* wind graph: shaded speed curve (dashed for the past, solid ahead),
     gust line above it, direction arrows along the top, scale on the right */
  const windGraph = (Wd, H, off) => {
    const day0 = dayStartOf(off), day1 = day0 + 864e5, now = Date.now();
    const today2 = !off, pastDay = (off || 0) < 0;
    const hist = (((off || 0) === 0 ? S.wHist : S['wHist_' + off]) || { speed: [], gust: [], bearing: [] });
    const a0 = a, u = (S.windNow && S.windNow.u) || a.wind_speed_unit || us.wind_speed || 'km/h';
    /* past: history; future: hourly forecast; the current reading joins them */
    /* only genuinely recorded readings: one stale point pinned at midnight would be
       drawn as a day-long line (or a spike at "now"), which is worse than nothing */
    /* The coverage rule exists to stop one stale reading being drawn as a day-long line
       on today. A past day is different: whatever was recorded is all there will ever be,
       so partial data (the evening the integration was set up, say) is drawn as it is. */
    const recorded = (arr) => {
      const inDay = (arr || []).filter((p) => p[0] >= day0 && p[0] <= Math.min(now, day1));
      if (inDay.length < 3) return [];
      if (pastDay) return inDay;
      const covered = inDay[inDay.length - 1][0] - inDay[0][0];
      return covered < Math.max(1, now - day0) * 0.5 ? [] : inDay;
    };
    let speed = today2 || pastDay ? recorded(hist.speed) : [];
    let gust = today2 || pastDay ? recorded(hist.gust) : [];
    let bear = today2 || pastDay ? recorded(hist.bearing) : [];
    if (today2 && S.windNow) { speed.push([now, S.windNow.v]); if (S.windNow.gust != null) gust.push([now, S.windNow.gust]); }
    if (today2 && isFinite(Number(a0.wind_bearing))) bear.push([now, Number(a0.wind_bearing)]);
    const fut = (S.hours || []).filter((h) => { const t = Date.parse(h.datetime); return t > (today2 ? now : day0 - 1) && t < day1; });
    fut.forEach((h) => {
      const t = Date.parse(h.datetime);
      if (h.wind_speed != null) speed.push([t, Number(h.wind_speed)]);
      if (h.wind_gust_speed != null) gust.push([t, Number(h.wind_gust_speed)]);
      if (h.wind_bearing != null) bear.push([t, Number(h.wind_bearing)]);
    });
    speed.sort((p, q) => p[0] - q[0]); gust.sort((p, q) => p[0] - q[0]); bear.sort((p, q) => p[0] - q[0]);
    /* the last forecast hour (or reading) holds to midnight, so the lines reach the edge —
       only when the data gets within two hours of it, so a day the forecast only partly
       covers isn't stretched out with wind nobody forecast */
    [speed, gust].forEach((arr) => { const lp = arr[arr.length - 1]; if (lp && lp[0] < day1 - 6e4 && lp[0] >= day1 - 72e5) arr.push([day1, lp[1]]); });
    const top = 30, padB = 20, right = 34, left = 0, bottom = H - padB;
    const vmax = Math.max(5, ...speed.map((p) => p[1]), ...gust.map((p) => p[1]));
    const step = vmax <= 12 ? 2 : vmax <= 30 ? 5 : vmax <= 60 ? 10 : 20;
    const ymax = Math.ceil(vmax * 1.12 / step) * step;
    const x = (t) => left + (t - day0) / 864e5 * (Wd - left - right);
    const y = (v) => bottom - v / ymax * (bottom - top);
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(svgNS, n); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
    /* smooth path through points (Catmull-Rom → cubic Bézier) */
    const smooth = (pts) => {
      if (pts.length < 2) return '';
      const P = pts.map((p) => [x(p[0]), y(p[1])]);
      let d = 'M ' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        /* Keep the control points inside the segment in both axes. Clamping y stops the
           curve swinging past the readings it joins; clamping x stops it doubling back on
           itself when the points are unevenly spaced, which looks like a loop. */
        const loY = Math.min(p1[1], p2[1]), hiY = Math.max(p1[1], p2[1]);
        const cl = (v) => Math.max(loY, Math.min(hiY, v));
        const clX = (v) => Math.max(p1[0], Math.min(p2[0], v));
        const c1 = [clX(p1[0] + (p2[0] - p0[0]) / 6), cl(p1[1] + (p2[1] - p0[1]) / 6)];
        const c2 = [clX(p2[0] - (p3[0] - p1[0]) / 6), cl(p2[1] - (p3[1] - p1[1]) / 6)];
        d += ' C ' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ', ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };
    const area = (pts) => { if (pts.length < 2) return ''; return smooth(pts) + ' L ' + x(pts[pts.length - 1][0]).toFixed(1) + ' ' + bottom + ' L ' + x(pts[0][0]).toFixed(1) + ' ' + bottom + ' Z'; };
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Wd, height: H, class: 'wx-wind-svg' });
    svg.style.height = H + 'px';
    const defs = el('defs', {});
    /* line colour follows the same speed bands as the Wind chip (set on a common scale,
       converted to the graph's unit), blended as the temperature chart's is */
    const f = u === 'm/s' ? 1 / 3.6 : u === 'mph' ? 1 / 1.609 : u === 'kn' ? 1 / 1.852 : 1;
    const wbands = [[0, 10, '#7ED957'], [10, 20, '#F2D34B'], [20, 30, '#F5A05A'], [30, 40, '#F26B6B'], [40, 50, '#B07CD6'], [50, 1e9, '#B36B86']].map((b) => [b[0] * f, b[1] * f, b[2]]);
    const wAnchG = bandAnch(wbands, 0, ymax);
    defs.appendChild(chartGrad(el, 'wx-w-stroke', bottom, top, (v) => blendAnch(wAnchG, v), 0, ymax, false));
    defs.appendChild(chartGrad(el, 'wx-w-fill', bottom, top, (v) => blendAnch(wAnchG, v), 0, ymax, true));
    const colourOf = (v) => (wbands.find((b) => v < b[1]) || wbands[wbands.length - 1])[2];
    /* scale labels blend between band colours rather than snapping: the ticks are finer
       than the bands, so a hard rule prints the same colour on two neighbouring labels
       (10 and 15 both yellow). Anchored at band midpoints, as the day graphs do. */
    const hexW = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const wIn = wbands.filter((b) => b[0] < ymax);
    /* one band past the top of the scale is kept as an anchor, or the highest label
       would clamp to the same colour as the one below it */
    const wNext = wbands[wIn.length];
    const wAnch = wIn.map((b) => [(b[0] + Math.min(b[1], ymax * 2)) / 2, hexW(b[2])])
      .concat(wNext ? [[(wNext[0] + Math.min(wNext[1], ymax * 2)) / 2, hexW(wNext[2])]] : []);
    const scaleCol = (v) => {
      if (!wAnch.length) return '#fff';
      if (v <= wAnch[0][0]) return 'rgb(' + wAnch[0][1].join(',') + ')';
      const lastW = wAnch[wAnch.length - 1];
      if (v >= lastW[0]) return 'rgb(' + lastW[1].join(',') + ')';
      let loW = wAnch[0], hiW = lastW;
      for (let i = 0; i < wAnch.length - 1; i++) if (v >= wAnch[i][0] && v <= wAnch[i + 1][0]) { loW = wAnch[i]; hiW = wAnch[i + 1]; break; }
      const kW = hiW[0] === loW[0] ? 0 : (v - loW[0]) / (hiW[0] - loW[0]);
      return 'rgb(' + loW[1].map((c2, i) => Math.round(c2 + (hiW[1][i] - c2) * kW)).join(',') + ')';
    };
    const nowX = today2 ? x(now) : pastDay ? Wd - right : 0;
    const past = el('clipPath', { id: 'wx-w-past' }); past.appendChild(el('rect', { x: 0, y: 0, width: Math.max(0, nowX), height: H })); defs.appendChild(past);
    const futc = el('clipPath', { id: 'wx-w-fut' }); futc.appendChild(el('rect', { x: nowX, y: 0, width: Math.max(0, Wd - right - nowX), height: H })); defs.appendChild(futc);
    svg.appendChild(defs);
    /* grid + scale */
    for (let v = 0; v <= ymax; v += step) {
      svg.appendChild(el('line', { x1: left, y1: y(v), x2: Wd - right, y2: y(v), class: 'wx-w-grid' }));
      const t = el('text', { x: Wd - right + 8, y: y(v) + 4, class: 'wx-w-scale' }); t.textContent = v; svg.appendChild(t);
      t.style.fill = scaleCol(v);
    }
    [6, 12, 18].forEach((hh) => svg.appendChild(el('line', { x1: x(day0 + hh * 36e5), y1: top - 4, x2: x(day0 + hh * 36e5), y2: bottom, class: 'wx-w-vgrid' })));
    /* future backdrop, a lighter panel (a day ahead is all forecast) */
    if (today2) svg.appendChild(el('rect', { x: x(now), y: top - 4, width: Math.max(0, Wd - right - x(now)), height: bottom - top + 4, class: 'wx-w-future' }));
    /* speed: area + line (dashed past, solid future); gusts: thin line */
    if (speed.length > 1) {
      svg.appendChild(el('path', { d: area(speed), class: 'wx-w-area past', fill: 'url(#wx-w-fill)', 'clip-path': 'url(#wx-w-past)' }));
      svg.appendChild(el('path', { d: area(speed), class: 'wx-w-area', fill: 'url(#wx-w-fill)', 'clip-path': 'url(#wx-w-fut)' }));
      svg.appendChild(el('path', { d: smooth(speed), class: 'wx-w-line past', stroke: 'url(#wx-w-stroke)', 'clip-path': 'url(#wx-w-past)' }));
      svg.appendChild(el('path', { d: smooth(speed), class: 'wx-w-line', stroke: 'url(#wx-w-stroke)', 'clip-path': 'url(#wx-w-fut)' }));
    }
    if (gust.length > 1) {
      svg.appendChild(el('path', { d: smooth(gust), class: 'wx-w-gust past', stroke: 'url(#wx-w-stroke)', 'clip-path': 'url(#wx-w-past)' }));
      svg.appendChild(el('path', { d: smooth(gust), class: 'wx-w-gust', stroke: 'url(#wx-w-stroke)', 'clip-path': 'url(#wx-w-fut)' }));
    }
    /* now */
    if (today2) svg.appendChild(el('line', { x1: x(now), y1: top - 4, x2: x(now), y2: bottom, class: 'wx-w-now' }));
    if (today2 && S.windNow) {
      const c = colourOf(S.windNow.v);
      svg.appendChild(el('circle', { cx: x(now), cy: y(S.windNow.v), r: 10, fill: c, 'fill-opacity': 0.3 }));
      svg.appendChild(el('circle', { cx: x(now), cy: y(S.windNow.v), r: 5, fill: c, stroke: '#fff', 'stroke-width': 2 }));
    }
    /* direction arrows every two hours: pointing where the wind blows TO */
    /* an arrow only where a reading is genuinely close by: with a three-hour window the
       hours before "now" borrowed the current value and showed direction for data that
       was never recorded */
    const nearest = (t) => { let best = null; bear.forEach((p) => { if (!best || Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p; }); return best && Math.abs(best[0] - t) < 75 * 6e4 ? best[1] : null; };
    for (let hh = 1; hh < 24; hh += 2) {
      const t = day0 + hh * 36e5, b = nearest(t);
      if (b == null) continue;
      const g = el('g', { transform: 'translate(' + x(t).toFixed(1) + ' 14) rotate(' + ((b + 180) % 360 - 90).toFixed(0) + ')', class: 'wx-w-arrow' + (t > now ? '' : ' past') });
      g.appendChild(el('path', { d: 'M -6 0 H 4 M 1 -3.5 L 5 0 L 1 3.5' }));
      svg.appendChild(g);
    }
    /* time axis */
    [[0, '12 AM'], [6, '6 AM'], [12, '12 PM'], [18, '6 PM']].forEach((l) => {
      const t = el('text', { x: x(day0 + l[0] * 36e5) + 5, y: H - 6, class: 'wx-sun-axis' }); t.textContent = l[1]; svg.appendChild(t);
    });
    /* drag to read: speed at that hour, plus the gust when one is forecast */
    svg.__scrub = { P: speed.map((p) => [x(p[0]), y(p[1])]), pts: speed, top: top, bottom: bottom, right: right, Wd: Wd,
      fmt: (v, t2) => {
        let g2 = null;
        gust.forEach((q) => { if (!g2 || Math.abs(q[0] - t2) < Math.abs(g2[0] - t2)) g2 = q; });
        const gs = g2 && Math.abs(g2[0] - t2) < 5400e3 && g2[1] > v + 0.5 ? ' · gusts ' + Math.round(g2[1]) + ' ' + u : '';
        /* both numbers carry the unit: with it only on one, the other reads as bare */
        return Math.round(v) + ' ' + u + gs + ' · ' + new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 });
      } };
    const wrap = document.createElement('div'); wrap.className = 'wx-sun-wrap wx-wind-wrap';
    /* summary line above the chart, as in the hourly view */
    const vals = speed.map((p) => p[1]), gv = gust.map((p) => p[1]);
    const rows = L.el('div', 'wx-wind-summary', wrap);
    wrap.appendChild(svg);
    if (vals.length) {
      const dirName = { N: 'north', NE: 'northeast', E: 'east', SE: 'southeast', S: 'south', SW: 'southwest', W: 'west', NW: 'northwest' };
      let txt = today2 && S.windNow ? 'Wind is currently ' + Math.round(S.windNow.v) + ' ' + u + (S.windNow.dir ? ' from the ' + dirName[S.windNow.dir] : '') + '. ' : '';
      txt += (today2 ? 'Today, wind speeds are ' : pastDay ? 'Wind speeds were ' : 'Wind speeds are ') + Math.round(Math.min(...vals)) + ' to ' + Math.round(Math.max(...vals)) + ' ' + u;
      if (gv.length) txt += ', with gusts up to ' + Math.round(Math.max(...gv)) + ' ' + u;
      rows.textContent = txt + '.';
    }
    return wrap;
  };
  /* air quality for one day on the chosen scale's colour bands, current value marked */
  /* Which air-quality scale the sensor is on. Pirate Weather returns a different index
     depending on its units option (us -> EPA 0-500, ca -> ECCC AQHI 1-10+, si/uk -> EU
     CAQI 0-100+), and nothing on the entity says which, so it is configured — defaulting
     to a guess from Home Assistant's own country. */
  const aqiScales = {
    epa: { name: 'AQI', edges: [50, 100, 150, 200, 300], top: 500,
      labels: ['Good', 'Moderate', 'Unhealthy (sens.)', 'Unhealthy', 'Very unhealthy', 'Hazardous'],
      long: ['Good', 'Moderate', 'Unhealthy for sensitive groups', 'Unhealthy', 'Very unhealthy', 'Hazardous'], floor: 60 },
    aqhi: { name: 'AQHI', edges: [3, 6, 10], top: 15,
      labels: ['Low', 'Moderate', 'High', 'Very high'],
      long: ['low risk', 'moderate risk', 'high risk', 'very high risk'], floor: 6 },
    caqi: { name: 'CAQI', edges: [25, 50, 75, 100], top: 125,
      labels: ['Very low', 'Low', 'Medium', 'High', 'Very high'],
      long: ['very low', 'low', 'medium', 'high', 'very high'], floor: 50 }
  };
  const aqiScale = (() => {
    const want = String((cfg.details || {}).aqi_scale || '').toLowerCase();
    return aqiScales[want] || aqiScales[guessAqiScale(hass)];
  })();
  /* the chip colours, as a ramp across however many bands the scale has */
  const aqiTone = ['95,125,56', '142,120,45', '141,89,53', '140,64,64', '97,73,108', '97,70,78'];
  const aqiBright = { '95,125,56': '#7ED957', '142,120,45': '#F2D34B', '141,89,53': '#F5A05A', '140,64,64': '#F26B6B', '97,73,108': '#B07CD6', '97,70,78': '#B36B86' };
  /* [lo, hi, tone, label] per band, built from the chosen scale */
  const aqiBands = (() => {
    const e = aqiScale.edges, out = [];
    const tones = aqiTone.slice(0, e.length + 1);
    if (tones.length < e.length + 1) tones.push(aqiTone[aqiTone.length - 1]);
    for (let i = 0; i <= e.length; i++) out.push([i === 0 ? 0 : e[i - 1], i === e.length ? aqiScale.top : e[i], tones[i], aqiScale.long[i]]);
    return out;
  })();
  /* a value on an edge belongs to the band below it, as the scales define them (AQHI
     1-3 is low, EPA 0-50 good) — the same rule as aqiLabel, so words and colour agree */
  const aqiBandOf = (v) => aqiBands.find((b) => v <= b[1]) || aqiBands[aqiBands.length - 1];
  const aqiLabel = (v) => { const e = aqiScale.edges; for (let i = 0; i < e.length; i++) if (v <= e[i]) return aqiScale.labels[i]; return aqiScale.labels[e.length]; };
  /* One calendar day, like the other views: today runs from midnight to now, earlier
     days are whole. There is no air-quality forecast, so nothing lies ahead of today. */
  const aqiGraph = (Wd, H, off) => {
    off = Math.min(0, off || 0);
    /* Today's chart ends at now rather than at midnight — with no forecast, the rest of
       the day would only be empty space — so the line always reaches the right edge. At
       least an hour wide, so just after midnight isn't a few minutes stretched across. */
    const now = Date.now(), t0 = dayStartOf(off), tEnd = dayStartOf(off + 1);
    const tRight = off === 0 ? Math.max(now, t0 + 36e5) : tEnd, spanA = tRight - t0;
    const cutA = off === 0 ? now : tEnd;
    const pts = ((((histOf('aHist', off) || {}).pts) || []).filter((p) => p[0] >= t0 && p[0] <= cutA)).slice();
    if (off === 0 && S.aqiNow != null) pts.push([now, S.aqiNow]);
    pts.sort((p, q) => p[0] - q[0]);
    /* the recorder keeps only changes: on a finished day the last reading held until
       midnight, so the line runs there, as the other day charts do */
    if (off < 0 && pts.length && pts[pts.length - 1][0] < tEnd - 6e4) pts.push([tEnd, pts[pts.length - 1][1]]);
    const bands = aqiBands, bright = aqiBright, bandOf = aqiBandOf;
    /* the axis follows the scale: rounding to 25s would swamp a 1-10 index */
    const vmax = Math.max(aqiScale.floor, ...pts.map((p) => p[1])) * 1.1;
    const step = aqiScale.top <= 20 ? 1 : vmax <= 110 ? 25 : 50;
    const ymax = Math.min(aqiScale.top, Math.ceil(vmax / step) * step);
    const top = 10, padB = 20, right = 40, bottom = H - padB;
    const x = (t) => (t - t0) / spanA * (Wd - right);
    const y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(svgNS, n); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Wd, height: H, class: 'wx-aqi-svg' });
    svg.style.height = H + 'px';
    /* the line takes the colour of the value it is at, blended through the bands as the
       temperature chart's is */
    const defs = el('defs', {});
    const aAnchG = bandAnch(bands.map((b) => [b[0], b[1], bright[b[2]]]), 0, ymax);
    defs.appendChild(chartGrad(el, 'wx-aqi-stroke', bottom, top, (v) => blendAnch(aAnchG, v), 0, ymax, false));
    defs.appendChild(chartGrad(el, 'wx-aqi-fill', bottom, top, (v) => blendAnch(aAnchG, v), 0, ymax, true));
    svg.appendChild(defs);
    /* quiet grid at the band thresholds, labelled on the right */
    bands.forEach((b) => {
      if (b[0] >= ymax) return;
      const yt = y(b[0]);
      svg.appendChild(el('line', { x1: 0, y1: yt, x2: Wd - right, y2: yt, class: 'wx-w-grid' }));
      const lab = el('text', { x: Wd - right + 8, y: yt + 4, class: 'wx-w-scale' }); lab.textContent = b[0]; svg.appendChild(lab);
      /* a threshold reads as the top of the band beneath it: "50" is where green ends */
      if (b[0] > 0) lab.style.fill = bright[bandOf(b[0] - 0.01)[2]];
    });
    const topLab = el('text', { x: Wd - right + 8, y: top + 4, class: 'wx-w-scale' }); topLab.textContent = ymax; svg.appendChild(topLab);
    topLab.style.fill = bright[bandOf(ymax - 0.01)[2]];
    /* ticks at midnight, 6 AM, noon and 6 PM of that day (local, so DST days work) */
    const ticks = [0, 6, 12, 18].map((h) => { const d = new Date(t0); d.setHours(h, 0, 0, 0); return d.getTime(); }).filter((t) => t < tRight);
    ticks.forEach((t) => { if (x(t) > 2 && x(t) < Wd - right - 2) svg.appendChild(el('line', { x1: x(t), y1: top, x2: x(t), y2: bottom, class: 'wx-w-vgrid' })); });
    /* the line, smooth, white with a soft dark shadow so it reads on every band */
    const smooth = (P) => {
      if (P.length < 2) return '';
      let d = 'M ' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        /* no overshoot between points, in either axis: clamping x keeps unevenly spaced
           readings from making the curve loop back on itself */
        const loY = Math.min(p1[1], p2[1]), hiY = Math.max(p1[1], p2[1]);
        const cl = (v) => Math.max(loY, Math.min(hiY, v));
        const clX = (v) => Math.max(p1[0], Math.min(p2[0], v));
        d += ' C ' + clX(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + cl(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ', ' + clX(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + cl(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };
    const P = pts.map((p) => [x(p[0]), y(p[1])]);
    /* the lines are held to the plot, as on the other charts: a line reaching the edge
       otherwise pokes its rounded end past the grid into the scale */
    const plotClip = el('clipPath', { id: 'wx-aqi-plot' });
    plotClip.appendChild(el('rect', { x: 0, y: 0, width: Math.max(0, Wd - right), height: H }));
    defs.appendChild(plotClip);
    if (P.length > 1) {
      const d = smooth(P);
      svg.appendChild(el('path', { d: d + ' L ' + P[P.length - 1][0].toFixed(1) + ' ' + bottom + ' L ' + P[0][0].toFixed(1) + ' ' + bottom + ' Z', fill: 'url(#wx-aqi-fill)', 'clip-path': 'url(#wx-aqi-plot)' }));
      svg.appendChild(el('path', { d: d, class: 'wx-aqi-line', stroke: 'url(#wx-aqi-stroke)', 'clip-path': 'url(#wx-aqi-plot)' }));
    }
    /* Smoke, as a second line on its own scale across the lower part of the chart, in a
       smoky tan so it can't be mistaken for the index. Only once it has been measurable
       (5 µg/m³, where the old chip appeared) at some point in the window — otherwise it
       would be a flat line along the bottom. The scale is at least 35 µg/m³, the top of
       EPA's moderate band, so light smoke doesn't fill the chart. */
    const smE = (cfg.details || {}).smoke && hass.states[(cfg.details || {}).smoke];
    const smU = (smE && smE.attributes.unit_of_measurement) || 'µg/m³';
    const smNow = off === 0 && smE && isFinite(Number(smE.state)) ? Number(smE.state) : null;
    const smPts = ((((histOf('smHist', off) || {}).pts) || []).filter((p) => p[0] >= t0 && p[0] <= cutA)).slice();
    if (smNow != null) smPts.push([now, smNow]);
    smPts.sort((p, q) => p[0] - q[0]);
    if (off < 0 && smPts.length && smPts[smPts.length - 1][0] < tEnd - 6e4) smPts.push([tEnd, smPts[smPts.length - 1][1]]);
    const smMax = smPts.length ? Math.max(...smPts.map((p) => p[1])) : 0;
    const smShown = smPts.length > 1 && smMax >= 5;
    if (smShown) {
      const smScale = Math.max(35, smMax);
      const yS = (v) => bottom - Math.min(smScale, Math.max(0, v)) / smScale * (bottom - top) * 0.45;
      const SP = smPts.map((p) => [x(p[0]), yS(p[1])]);
      svg.appendChild(el('path', { d: smooth(SP), class: 'wx-smoke-line', 'clip-path': 'url(#wx-aqi-plot)' }));
      /* today is labelled with where it is now; a past day with its peak */
      let iS = SP.length - 1;
      if (off < 0) smPts.forEach((q, i) => { if (q[1] > smPts[iS][1]) iS = i; });
      const endS = SP[iS];
      const labS = off < 0
        ? el('text', { x: Math.max(40, Math.min(Wd - right - 40, endS[0])), y: endS[1] - 7, class: 'wx-pop-label wx-smoke-label', 'text-anchor': 'middle' })
        : el('text', { x: Math.max(40, endS[0] - 12), y: endS[1] - 7, class: 'wx-pop-label wx-smoke-label', 'text-anchor': 'end' });
      labS.textContent = 'Smoke ' + Math.round(smPts[iS][1]) + ' ' + smU;
      svg.appendChild(labS);
    }
    const smokeAt = (t2) => { let b2 = null; smPts.forEach((q) => { if (q[0] <= t2) b2 = q; }); return b2; };
    if (off === 0 && S.aqiNow != null) {
      const c = bright[bandOf(S.aqiNow)[2]];
      svg.appendChild(el('circle', { cx: x(now), cy: y(S.aqiNow), r: 10, fill: c, 'fill-opacity': 0.3 }));
      svg.appendChild(el('circle', { cx: x(now), cy: y(S.aqiNow), r: 5, fill: c, stroke: '#fff', 'stroke-width': 2 }));
    }
    /* axis labels under the same ticks; skip one that would run into the right edge */
    ticks.forEach((t) => {
      if (Wd - right - x(t) < 44) return;
      const lab = el('text', { x: x(t) + 5, y: H - 6, class: 'wx-sun-axis' });
      lab.textContent = new Date(t).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
      svg.appendChild(lab);
    });
    svg.__scrub = { P: P, pts: pts, top: top, bottom: bottom, right: right, Wd: Wd,
      fmt: (v, t2) => {
        const sm2 = smShown ? smokeAt(t2) : null;
        return Math.round(v) + (sm2 ? ' · smoke ' + Math.round(sm2[1]) + ' ' + smU : '') + ' · ' + new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 });
      } };
    const wrap = document.createElement('div'); wrap.className = 'wx-sun-wrap wx-aqi-wrap';
    /* the sentence sits above the chart, like the other views; the bands are already
       drawn on the chart's own scale, so there is no separate gauge bar */
    const txt = L.el('div', 'wx-wind-summary', wrap);
    wrap.appendChild(svg);
    if (off < 0) {
      /* a past day: its high and low, and smoke if there was any worth noting; the fire
         risk is only known as it is now */
      let t = pts.length > 1 ? aqiScale.name + ' ' + hiLoAt(pts, (v) => String(Math.round(v))) + '.' : '';
      if (smShown) { const pk = smPts.reduce((m2, q) => (q[1] > m2[1] ? q : m2), smPts[0]); t += ' Smoke peaked at ' + Math.round(pk[1]) + ' ' + smU + ' around ' + new Date(Math.round(pk[0] / 36e5) * 36e5).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 }) + '.'; }
      txt.textContent = t.trim();
    } else if (S.aqiNow != null) {
      const b = bandOf(S.aqiNow);
      const vals = pts.map((p) => p[1]);
      let t = aqiScale.name + ' is ' + Math.round(S.aqiNow) + ', ' + String(b[3]).toLowerCase() + '.';
      if (vals.length > 1) t += ' Today, a ' + hiLoAt(pts, (v) => String(Math.round(v))) + '.';
      /* smoke and fire risk, which used to be chips of their own */
      if (smNow != null && smNow >= 5) t += ' Smoke is ' + Math.round(smNow) + ' ' + smU + ', ' + ['light', 'moderate', 'heavy', 'very heavy', 'hazardous'][[12, 35, 55, 150].filter((e2) => smNow > e2).length] + '.';
      const fE = (cfg.details || {}).fire && hass.states[(cfg.details || {}).fire];
      /* the risk level only: the index behind it is a 0-100 weather-only number that says
         nothing more to a reader than the level already does */
      if (fE && !/^(unknown|unavailable|none)$/i.test(fE.state)) t += ' Fire risk is ' + String(fE.state).toLowerCase() + '.';
      txt.textContent = t;
    }
    return wrap;
  };
  /* generic "today" graph: history (dashed) + hourly forecast (solid), line and fill
     coloured by value bands, current value marked, one-line summary underneath.
     o = { pts, nowVal, bands: [[lo, hi, colour, name]], ymax, ticks, fmt, summary } */
  const dayGraph = (o, Wd, H) => {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const day0 = o.day0 != null ? o.day0 : d0.getTime(), now = Date.now();
    const pts = o.pts.slice().sort((p, q) => p[0] - q[0]);
    /* the forecast is hourly, so the last entry sits an hour short of midnight; carry the
       curve out to the edge rather than leaving a gap */
    const dayEnd = day0 + 864e5;
    if (pts.length && pts[pts.length - 1][0] < dayEnd - 6e4) pts.push([dayEnd, pts[pts.length - 1][1]]);
    /* ymin lets a scale sit below zero (dew point in winter); it defaults to 0, which
       leaves humidity and UV drawn exactly as before */
    const top = 12, padB = 20, right = 40, bottom = H - padB, ymax = o.ymax, ymin = o.ymin || 0, yspan = (ymax - ymin) || 1;
    const x = (t) => (t - day0) / 864e5 * (Wd - right);
    const y = (v) => bottom - (Math.min(Math.max(v, ymin), ymax) - ymin) / yspan * (bottom - top);
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(svgNS, n); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Wd, height: H, class: 'wx-wind-svg' });
    svg.style.height = H + 'px';
    const colourOf = (v) => (o.bands.find((b) => v < b[1]) || o.bands[o.bands.length - 1]);
    const uid = 'wx-' + o.id;
    const defs = el('defs', {});
    /* The shaded zones keep their hard edges — that is the point of them — but the line
       blends between band colours instead of switching mid-curve, which looked like two
       lines spliced together. */
    const hexOf = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const anchors = o.bands.filter((b) => b[0] < ymax && b[1] > ymin).map((b) => [(Math.max(b[0], ymin) + Math.min(b[1], ymax)) / 2, hexOf(b[2])]);
    const colAt = (v) => {
      if (!anchors.length) return '#fff';
      if (v <= anchors[0][0]) return 'rgb(' + anchors[0][1].join(',') + ')';
      const lastA = anchors[anchors.length - 1];
      if (v >= lastA[0]) return 'rgb(' + lastA[1].join(',') + ')';
      let lo2 = anchors[0], hi2 = lastA;
      for (let i = 0; i < anchors.length - 1; i++) if (v >= anchors[i][0] && v <= anchors[i + 1][0]) { lo2 = anchors[i]; hi2 = anchors[i + 1]; break; }
      const k = hi2[0] === lo2[0] ? 0 : (v - lo2[0]) / (hi2[0] - lo2[0]);
      return 'rgb(' + lo2[1].map((c2, i) => Math.round(c2 + (hi2[1][i] - c2) * k)).join(',') + ')';
    };
    defs.appendChild(chartGrad(el, uid + '-stroke', bottom, top, colAt, ymin, ymax, false));
    defs.appendChild(chartGrad(el, uid + '-fill', bottom, top, colAt, ymin, ymax, true));
    const past = el('clipPath', { id: uid + '-past' }); past.appendChild(el('rect', { x: 0, y: 0, width: Math.max(0, x(now)), height: H })); defs.appendChild(past);
    const futc = el('clipPath', { id: uid + '-fut' }); futc.appendChild(el('rect', { x: x(now), y: 0, width: Math.max(0, Wd - right - x(now)), height: H })); defs.appendChild(futc);
    svg.appendChild(defs);
    o.ticks.forEach((v) => {
      svg.appendChild(el('line', { x1: 0, y1: y(v), x2: Wd - right, y2: y(v), class: 'wx-w-grid' }));
      const t = el('text', { x: Wd - right + 8, y: y(v) + 4, class: 'wx-w-scale' }); t.textContent = o.fmt(v); svg.appendChild(t);
      /* tintScale: the default colours a tick by the band it caps, which suits a one-way
         scale — "50" is where Good ends. 'comfort' points the other way on a two-sided
         scale, so both edges of the comfortable middle are tinted with it: on humidity
         40% opens the green band and 60% closes it, and both read green. */
      /* 'blend' takes the line's own colour at that value: for bands of uneven width
         (dew point's run 10 / 16 / 18 / 21) it's the only tint that doesn't repeat */
      if (o.tintScale === 'blend') t.style.fill = colAt(v);
      else if (o.tintScale) {
        const cb = o.tintScale === 'comfort' ? (o.comfort || o.bands[Math.floor(o.bands.length / 2)]) : null;
        /* the bottom tick takes the band it opens, so 0% reads red on a comfort scale */
        t.style.fill = colourOf(v <= 0 ? 0 : cb ? (v <= cb[0] ? v : v - 0.01) : v - 0.01)[2];
      }
    });
    [6, 12, 18].forEach((hh) => svg.appendChild(el('line', { x1: x(day0 + hh * 36e5), y1: top, x2: x(day0 + hh * 36e5), y2: bottom, class: 'wx-w-vgrid' })));
    svg.appendChild(el('rect', { x: x(now), y: top, width: Math.max(0, Wd - right - x(now)), height: bottom - top, class: 'wx-w-future' }));
    const smooth = (P) => {
      if (P.length < 2) return '';
      let d = 'M ' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        /* no overshoot between points, in either axis: clamping x keeps unevenly spaced
           readings from making the curve loop back on itself */
        const loY = Math.min(p1[1], p2[1]), hiY = Math.max(p1[1], p2[1]);
        const cl = (v) => Math.max(loY, Math.min(hiY, v));
        const clX = (v) => Math.max(p1[0], Math.min(p2[0], v));
        d += ' C ' + clX(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + cl(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ', ' + clX(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + cl(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };
    const P = pts.map((p) => [x(p[0]), y(p[1])]);
    if (P.length > 1) {
      const d = smooth(P), ad = d + ' L ' + P[P.length - 1][0].toFixed(1) + ' ' + bottom + ' L ' + P[0][0].toFixed(1) + ' ' + bottom + ' Z';
      svg.appendChild(el('path', { d: ad, class: 'wx-w-area past', fill: 'url(#' + uid + '-fill)', 'clip-path': 'url(#' + uid + '-past)' }));
      svg.appendChild(el('path', { d: ad, class: 'wx-w-area', fill: 'url(#' + uid + '-fill)', 'clip-path': 'url(#' + uid + '-fut)' }));
      svg.appendChild(el('path', { d: d, class: 'wx-w-line past', stroke: 'url(#' + uid + '-stroke)', 'clip-path': 'url(#' + uid + '-past)' }));
      svg.appendChild(el('path', { d: d, class: 'wx-w-line', stroke: 'url(#' + uid + '-stroke)', 'clip-path': 'url(#' + uid + '-fut)' }));
    }
    svg.appendChild(el('line', { x1: x(now), y1: top, x2: x(now), y2: bottom, class: 'wx-w-now' }));
    if (o.nowVal != null) {
      const c = colourOf(o.nowVal)[2];
      svg.appendChild(el('circle', { cx: x(now), cy: y(o.nowVal), r: 10, fill: c, 'fill-opacity': 0.3 }));
      svg.appendChild(el('circle', { cx: x(now), cy: y(o.nowVal), r: 5, fill: c, stroke: '#fff', 'stroke-width': 2 }));
    }
    [[0, '12 AM'], [6, '6 AM'], [12, '12 PM'], [18, '6 PM']].forEach((l) => {
      const t = el('text', { x: x(day0 + l[0] * 36e5) + 5, y: H - 6, class: 'wx-sun-axis' }); t.textContent = l[1]; svg.appendChild(t);
    });
    svg.__scrub = { P: P, pts: pts, top: top, bottom: bottom, right: right, Wd: Wd,
      fmt: o.scrubFmt || ((v, t2) => o.fmt(Math.round(v * 10) / 10) + ' · ' + new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 })) };
    const wrap = document.createElement('div'); wrap.className = 'wx-sun-wrap';
    L.el('div', 'wx-wind-summary', wrap).textContent = o.summary(pts.map((p) => p[1]), colourOf, pts);
    wrap.appendChild(svg);
    return wrap;
  };
  /* today's points for a sensor-backed series: history + current + hourly forecast field */
  const dayStartOf = (off) => { const d2 = new Date(); d2.setHours(0, 0, 0, 0); return d2.getTime() + (off || 0) * 864e5; };
  /* points for one day: recorded history behind "now" (today only) plus the hourly
     forecast ahead. dayOff steps forward through the forecast days. */
  const todayPts = (hist, nowVal, field, dayOff) => {
    const off = dayOff || 0;
    const day0 = dayStartOf(off), day1 = day0 + 864e5, now = Date.now();
    /* a past day is entirely recorded, today is history then forecast, a future day is
       entirely forecast */
    const pts = off <= 0 ? L.window((hist && hist.pts) || [], day0, Math.min(now, day1)) : [];
    if (off === 0 && nowVal != null) pts.push([now, nowVal]);
    /* field is a key of the hourly entry, or a function of it for a derived value */
    const getF = typeof field === 'function' ? field : (h) => h[field];
    if (off >= 0) (S.hours || []).forEach((h) => { const t = Date.parse(h.datetime), v = getF(h); if (t > (off === 0 ? now : day0 - 1) && t < day1 && v != null && isFinite(Number(v))) pts.push([t, Number(v)]); });
    return pts;
  };
  /* how many forecast days the hourly data actually covers */
  /* How far back the arrows may step. Home Assistant doesn't tell the frontend what the
     recorder keeps, so the card finds out by looking: there is no fixed limit, and the
     first day that comes back with nothing becomes the floor. The floor is kept per
     history — a sensor added last week must not cut short one recorded for a month. */
  const daysBack = (slot0) => {
    const fl = (S.histFloors || {})[slot0];
    return fl != null ? -fl : 3650;
  };
  const setFloor = (slot0, off) => {
    S.histFloors = S.histFloors || {};
    const cur = S.histFloors[slot0];
    S.histFloors[slot0] = cur == null ? off + 1 : Math.max(cur, off + 1);
  };
  const daysAhead = () => {
    const last = (S.hours || []).length ? Date.parse(S.hours[S.hours.length - 1].datetime) : 0;
    /* the last day the hourly forecast touches, capped at how far the daily forecast
       itself runs — taken from what the provider sent rather than a fixed number of
       days, since providers differ (this one sends 8 daily, 7 days of hours) */
    const lastDaily = (S.items || []).reduce((m2, i2) => {
      const o2 = Math.round((Date.parse(i2.datetime) - dayStartOf(0)) / 864e5);
      return isFinite(o2) && o2 > m2 ? o2 : m2;
    }, 0);
    return Math.max(0, Math.min(lastDaily, Math.floor((last - dayStartOf(0)) / 864e5)));
  };
  /* generic per-sensor history fetch for today, cached ten minutes; slot = S key */
  /* history for one day (off 0 = today, negative = earlier), cached ten minutes each */
  const dayHistory = (id, slot0, text, off) => {
    const slot = (off || 0) === 0 ? slot0 : slot0 + '_' + off;
    if (typeof id !== 'string') { S[slot] = { at: Date.now(), pts: [] }; return; }
    /* a finished day never changes, so it is kept until midnight; today is refreshed
       every ten minutes; a fetch that failed is retried after thirty seconds */
    if (S[slot] && (S[slot].err ? Date.now() - S[slot].at < 3e4 : ((off || 0) < 0 || Date.now() - S[slot].at < 6e5))) return;
    if (S[slot + 'Busy']) return;
    S[slot + 'Busy'] = true;
    const from = new Date(dayStartOf(off || 0));
    const to = new Date(Math.min(Date.now(), dayStartOf(off || 0) + 864e5));
    hass.callApi('GET', 'history/period/' + from.toISOString() + '?filter_entity_id=' + id + '&end_time=' + to.toISOString() + '&minimal_response&no_attributes&significant_changes_only=0').then((res) => {
      const pts = [];
      ((res && res[0]) || []).forEach((p) => {
        const t = Date.parse(p.last_changed || p.last_updated);
        if (!isFinite(t)) return;
        if (text) { if (p.state && !/^(unknown|unavailable)$/i.test(p.state)) pts.push([t, String(p.state)]); return; }
        const v = Number(p.state); if (isFinite(v)) pts.push([t, v]);
      });
      S[slot] = { at: Date.now(), pts: pts }; S[slot + 'Busy'] = false;
      /* a past day that comes back with nothing is older than the recorder keeps: that
         becomes the floor for the day arrows, so no option has to say how far back to go.
         Only a numeric reading decides it, and only a day with nothing at all. The icon
         history is a condition that can sit unchanged all day, which the recorder sends
         as a single point — that used to count as "nothing" and stop the back arrow at
         yesterday on any day the weather didn't change. */
      if ((off || 0) < 0 && !text && pts.length === 0) setFloor(slot0, off);
      S.sig = null; if (S.draw) S.draw();
    }).catch(() => { S[slot + 'Busy'] = false; S[slot] = { at: Date.now(), pts: [], err: true }; S.sig = null; if (S.draw) S.draw(); });
  };
  /* the history bucket for a given day, whatever the offset */
  const histOf = (slot0, off) => S[(off || 0) === 0 ? slot0 : slot0 + '_' + off] || null;
  /* true / false once that day has been fetched, null while it hasn't */
  const hasDay = (slot0, off) => {
    const b = histOf(slot0, off);
    if (!b || b.err) return null;       /* not fetched, or the fetch failed: unknown, not empty */
    const n = b.pts ? b.pts.length : ((b.speed || []).length);
    return n >= 2;
  };
  /* red at the extremes (0–10, 90–100), yellow either side of the 40–60 comfort zone */
  /* hourly chart for one day: temperature curve (dashed behind now, solid
     ahead), condition icons along the top, H and L marked, scale on the right */
  const hourGraph = (dayStart, Wd, H) => {
    const now = Date.now();
    const isToday = dayStart <= now && now < dayStart + 864e5;
    const dayOff = Math.round((dayStart - dayStartOf(0)) / 864e5);
    /* only what was really recorded — a single stale point must not be stretched into a
       flat line across the morning. A past day is history only. */
    const hist = dayOff <= 0 ? (((histOf('tHist', dayOff) || {}).pts) || []).filter((p) => p[0] >= dayStart && p[0] <= Math.min(now, dayStart + 864e5)) : [];
    /* always the whole day, midnight to midnight; hours with no data stay empty */
    const day0 = dayStart, day1 = dayStart + 864e5, span = 864e5;
    const hrs = (S.hours || []).filter((i) => { const t = Date.parse(i.datetime); return t >= day0 && t < day1; });
    let pts = dayOff < 0 ? [] : hrs.filter((i) => i.temperature != null).map((i) => [Date.parse(i.datetime), Number(i.temperature)]);
    if (isToday) {
      pts = hist.concat(pts.filter((p) => p[0] > now));
      const tv2 = Number(a.temperature);
      if (isFinite(tv2)) pts.push([now, tv2]);
    } else if (dayOff < 0) pts = hist.slice();
    pts.sort((p, q) => p[0] - q[0]);
    /* drop points that sit almost on top of each other (the live reading next to a
       forecast hour), which would otherwise make the smoothing loop back on itself */
    pts = pts.filter((p, i) => i === 0 || p[0] - pts[i - 1][0] > 24e4);
    /* carry the curve out to both edges: the forecast is hourly, so the window usually
       ends part way past the last entry (and starts just before the first one) */
    if (pts.length) {
      const all = (S.hours || []).filter((i) => i.temperature != null).map((i) => [Date.parse(i.datetime), Number(i.temperature)]).sort((p, q) => p[0] - q[0]);
      const at = (edge, before, after) => {
        if (!before || !after || after[0] === before[0]) return (before || after)[1];
        return before[1] + (after[1] - before[1]) * (edge - before[0]) / (after[0] - before[0]);
      };
      /* Only reach out to an edge when the stretch really is forecast. Never invent the
         hours a past day (or today) simply has no record of — the curve just starts and
         ends where the data does. */
      /* Only reach to an edge when there is a real reading beyond it to aim at. The
         forecast runs out part way through its last day, and carrying the final value
         flat to midnight drew a straight line across hours nothing is known about. */
      const future = dayOff > 0;
      const before = all.filter((p) => p[0] <= day0).pop();
      if (future && before && pts[0][0] > day0 + 6e4) pts.unshift([day0, at(day0, before, pts[0])]);
      const last = pts[pts.length - 1];
      if ((future || isToday) && last[0] < day1 - 6e4) {
        const after = all.find((p) => p[0] >= day1);
        if (after) pts.push([day1, at(day1, last, after)]);
      }
    }
    const top = 36, padB = 20, right = 40, bottom = H - padB;   /* room for the icon strip */
    const vals = pts.map((p) => p[1]);
    const lo = vals.length ? Math.min(...vals) : 0, hi = vals.length ? Math.max(...vals) : 10;
    const pad = Math.max(2, (hi - lo) * 0.25);
    const ymin = Math.floor((lo - pad) / 3) * 3, ymax = Math.ceil((hi + pad) / 3) * 3;
    const x = (t) => (t - day0) / span * (Wd - right);
    const y = (v) => bottom - (Math.min(Math.max(v, ymin), ymax) - ymin) / (ymax - ymin || 1) * (bottom - top);
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(svgNS, n); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Wd, height: H, class: 'wx-wind-svg' });
    svg.style.height = H + 'px';
    /* temperature colours; thresholds are °C, converted when the entity reports °F */
    const f = /F/.test(unit || '') ? (c2) => c2 * 9 / 5 + 32 : (c2) => c2;
    /* A blue-to-red ramp on an absolute scale, so the same colour always means the same
       temperature: deep blue below freezing, cyan through the single digits, pale gold
       for the mild teens, orange through the high twenties and thirties, red only for
       genuine heat (40 °C+). No green — blue interpolated straight to yellow would pass
       through it, so the mild anchor is a desaturated gold instead. */
    const tb = [[-99, -6, '#2A5FDB'], [-6, 4, '#4D9BF5'], [4, 12, '#3FC8F0'], [12, 20, '#BFD9C0'], [20, 27, '#F5C84E'], [27, 34, '#FF9500'], [34, 40, '#FF6A2B'], [40, 99, '#FF3B30']].map((b) => [f(b[0]), f(b[1]), b[2]]);
    const colourOf = (v) => (tb.find((b) => v < b[1]) || tb[tb.length - 1])[2];
    const defs = el('defs', {});
    /* gradient: the colour blends smoothly between bands rather than stepping,
       and the fill fades out toward the bottom of the chart */
    const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const anchors = tb.map((b) => [Math.max(ymin, Math.min(ymax, (Math.max(b[0], ymin - 5) + Math.min(b[1], ymax + 5)) / 2)), hex(b[2])]);
    const colAt = (v) => {
      let lo2 = anchors[0], hi2 = anchors[anchors.length - 1];
      for (let i = 0; i < anchors.length - 1; i++) if (v >= anchors[i][0] && v <= anchors[i + 1][0]) { lo2 = anchors[i]; hi2 = anchors[i + 1]; break; }
      if (v <= anchors[0][0]) return 'rgb(' + anchors[0][1].join(',') + ')';
      if (v >= hi2[0] && hi2 === anchors[anchors.length - 1]) return 'rgb(' + hi2[1].join(',') + ')';
      const k = hi2[0] === lo2[0] ? 0 : (v - lo2[0]) / (hi2[0] - lo2[0]);
      return 'rgb(' + lo2[1].map((c2, i) => Math.round(c2 + (hi2[1][i] - c2) * k)).join(',') + ')';
    };
    const grad = (id, fade) => {
      const g = el('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: bottom, x2: 0, y2: top });
      for (let i = 0; i <= 16; i++) {
        const o = i / 16, v = ymin + (ymax - ymin) * o;
        g.appendChild(el('stop', { offset: o, 'stop-color': colAt(v), 'stop-opacity': fade ? (0.05 + 0.95 * Math.pow(o, 1.3)) : 1 }));
      }
      return g;
    };
    defs.appendChild(grad('wx-t-stroke', false)); defs.appendChild(grad('wx-t-fill', true));
    /* dashed behind "now", solid ahead: a future day is all forecast (solid), a past
       day is all history (dashed), today splits at the current time */
    const today = isToday;
    const nx = today ? Math.max(0, Math.min(Wd - right, x(now))) : (day0 > now ? 0 : Wd - right);
    const past = el('clipPath', { id: 'wx-t-past' }); past.appendChild(el('rect', { x: 0, y: 0, width: nx, height: H })); defs.appendChild(past);
    const futc = el('clipPath', { id: 'wx-t-fut' }); futc.appendChild(el('rect', { x: nx, y: 0, width: Math.max(0, Wd - right - nx), height: H })); defs.appendChild(futc);
    svg.appendChild(defs);
    /* scale: a line every 3 degrees, labelled */
    for (let v = ymin; v <= ymax; v += 3) {
      svg.appendChild(el('line', { x1: 0, y1: y(v), x2: Wd - right, y2: y(v), class: 'wx-w-grid' }));
      const t2 = el('text', { x: Wd - right + 8, y: y(v) + 4, class: 'wx-w-scale' }); t2.textContent = Math.round(v) + '°'; svg.appendChild(t2);
    }
    /* gridlines on real clock hours (every 6 h from midnight) inside the window */
    const ticks = [];
    { const every = span > 12 * 36e5 ? 6 : span > 6 * 36e5 ? 3 : 2;
      const d = new Date(day0); d.setMinutes(0, 0, 0); d.setHours(Math.ceil(d.getHours() / every) * every);
      for (let t2 = d.getTime(); t2 < day1; t2 += every * 36e5) ticks.push(t2); }
    /* a gridline sitting on the plot's own edge just looks like a border */
    ticks.forEach((t2) => { if (x(t2) > 2 && x(t2) < Wd - right - 2) svg.appendChild(el('line', { x1: x(t2), y1: top, x2: x(t2), y2: bottom, class: 'wx-w-vgrid' })); });
    if (today) svg.appendChild(el('rect', { x: nx, y: top, width: Math.max(0, Wd - right - nx), height: bottom - top, class: 'wx-w-future' }));
    const smooth = (P) => {
      if (P.length < 2) return '';
      let d = 'M ' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        /* no overshoot between points, in either axis: clamping x keeps unevenly spaced
           readings from making the curve loop back on itself */
        const loY = Math.min(p1[1], p2[1]), hiY = Math.max(p1[1], p2[1]);
        const cl = (v) => Math.max(loY, Math.min(hiY, v));
        const clX = (v) => Math.max(p1[0], Math.min(p2[0], v));
        d += ' C ' + clX(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + cl(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ', ' + clX(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + cl(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };
    const P = pts.map((p) => [x(p[0]), y(p[1])]);
    if (P.length > 1) {
      const d = smooth(P), ad = d + ' L ' + P[P.length - 1][0].toFixed(1) + ' ' + bottom + ' L ' + P[0][0].toFixed(1) + ' ' + bottom + ' Z';
      svg.appendChild(el('path', { d: ad, class: 'wx-w-area past', fill: 'url(#wx-t-fill)', 'clip-path': 'url(#wx-t-past)' }));
      svg.appendChild(el('path', { d: ad, class: 'wx-w-area', fill: 'url(#wx-t-fill)', 'clip-path': 'url(#wx-t-fut)' }));
      svg.appendChild(el('path', { d: d, class: 'wx-w-line past', stroke: 'url(#wx-t-stroke)', 'clip-path': 'url(#wx-t-past)' }));
      svg.appendChild(el('path', { d: d, class: 'wx-w-line', stroke: 'url(#wx-t-stroke)', 'clip-path': 'url(#wx-t-fut)' }));
    }
    /* chance of rain ahead of now: in the drag readout and the sentence under the chart,
       no longer a line of its own — the rain line carries on as an expected amount */
    let popAll = [];
    {
      let pop = dayOff < 0 ? [] : hrs.filter((i) => i.precipitation_probability != null).map((i) => [Date.parse(i.datetime), Number(i.precipitation_probability)]);
      if (isToday) {
        pop = pop.filter((p) => p[0] > now);
        const pe2 = (cfg.details || {}).precip_probability && hass.states[(cfg.details || {}).precip_probability];
        const pv2 = pe2 ? Number(pe2.state) : NaN;
        if (isFinite(pv2)) pop.push([now, pv2]);
      }
      pop.sort((p, q) => p[0] - q[0]);
      popAll = pop.filter((p, i) => i === 0 || p[0] - pop[i - 1][0] > 24e4);
    }
    /* One rain line, as a running total for the day: behind now what has fallen (the
       accumulation sensor, dashed, in steps, since it only updates now and then), ahead
       what is expected (each forecast hour's amount added on, solid). Both are the same
       measure, so the line runs on through now without a jump. Its own scale, with a
       minimum height so a drizzle doesn't fill the chart. */
    let rainAll = [], rainAhead = [], rateP = [], rateF = [], snowTot = 0, snowU = '';
    const rainFmt = fmtPrecip;
    const rainShown = (v) => precipBase(v, precipU) >= 0.1;   /* anything less is a trace */
    {
      const rainId = (cfg.details || {}).rain_today;
      const rE = rainId && hass.states[rainId];
      const rU = (rE && rE.attributes.unit_of_measurement) || precipU;   /* converted into the card's unit */
      let rp = [];
      if (rainId && dayOff <= 0) {
        if (isToday) dayHistory(rainId, 'rHist', false, 0);
        rp = (((histOf('rHist', dayOff) || {}).pts) || []).filter((p) => p[0] >= day0 && p[0] < day1 && p[0] <= now)
          .map((p) => [p[0], precipConv(p[1], rU)]);
        if (isToday && rE && isFinite(Number(rE.state))) rp.push([now, precipConv(rE.state, rU)]);
        rp.sort((p, q) => p[0] - q[0]);
        /* a finished day's total holds to midnight after the last change */
        if (!isToday && rp.length && rp[rp.length - 1][0] < day1 - 6e4) rp.push([day1, rp[rp.length - 1][1]]);
      }
      /* ahead: from the total now (or zero at midnight on a later day), each forecast
         hour's amount added over that hour — only the part of it still to come */
      let fp = [];
      if (dayOff >= 0) {
        const fStart = isToday ? now : day0;
        let tot = isToday && rp.length ? rp[rp.length - 1][1] : 0;
        fp.push([fStart, tot]);
        hrs.map((i) => [Date.parse(i.datetime), Number(i.precipitation)]).sort((p, q) => p[0] - q[0]).forEach((h) => {
          const a0 = Math.max(h[0], fStart), a1 = Math.min(h[0] + 36e5, day1);
          if (!(a1 > a0)) return;
          tot += (isFinite(h[1]) ? Math.max(0, h[1]) : 0) * (a1 - a0) / 36e5;
          fp.push([a1, tot]);
        });
      }
      rainAll = rp; rainAhead = fp;   /* totals: for the readout and the sentence */
      /* snow that has fallen, from its own running total, in the unit its sensor reports:
         snow is given as a depth, conventionally in a larger unit than rain */
      const snId = (cfg.details || {}).snow_today;
      if (snId && dayOff <= 0) {
        const snE = hass.states[snId];
        snowU = (snE && snE.attributes.unit_of_measurement) || precipU;
        snowTot = isToday ? (snE && isFinite(Number(snE.state)) ? Number(snE.state) : 0)
          : Math.max(0, ...((((histOf('snHist', dayOff) || {}).pts) || []).filter((p) => p[0] >= day0 && p[0] < day1).map((p) => Number(p[1])).filter((v) => isFinite(v))));
      }
      /* What the chart draws is how hard it rains — an amount per hour — so the line falls
         back to nothing when the rain stops, instead of holding at the day's total. Behind
         now it's the recorded rate (the rain, snow and sleet rate sensors added together,
         dashed); ahead, the forecast's amount for each hour (solid) — the same measure, so
         the two meet at now. Without rate sensors, the past rate is worked out hour by hour
         from the running total. */
      const pcR = cfg.precipitation || {};
      const rIds = [pcR.rain, pcR.snow, pcR.ice].filter(Boolean);
      if (dayOff <= 0 && rIds.length) {
        if (isToday) rIds.forEach((id, k) => dayHistory(id, 'rrHist' + k, false, 0));
        const series = rIds.map((id, k) => {
          const e3 = hass.states[id], u3 = e3 && e3.attributes.unit_of_measurement;
          return (((histOf('rrHist' + k, dayOff) || {}).pts) || []).filter((p) => p[0] >= day0 && p[0] < day1 && p[0] <= now).map((p) => [p[0], precipConv(p[1], u3)]);
        });
        const ts3 = Array.from(new Set([].concat(...series.map((se) => se.map((p) => p[0]))))).sort((p, q) => p - q);
        const ix3 = series.map(() => -1);
        ts3.forEach((t) => {
          let sum = 0;
          series.forEach((se, k) => { while (ix3[k] + 1 < se.length && se[ix3[k] + 1][0] <= t) ix3[k]++; if (ix3[k] >= 0) sum += se[ix3[k]][1]; });
          rateP.push([t, sum]);
        });
        if (isToday) {
          let sum = 0, any = false;
          rIds.forEach((id) => { const e3 = hass.states[id], v3 = e3 && Number(e3.state); if (isFinite(v3)) { sum += precipConv(v3, e3.attributes.unit_of_measurement); any = true; } });
          if (any) rateP.push([now, sum]);
        }
        if (!isToday && rateP.length && rateP[rateP.length - 1][0] < day1 - 6e4) rateP.push([day1, rateP[rateP.length - 1][1]]);
      } else if (dayOff <= 0 && rp.length > 1) {
        /* no rate sensors: each hour's share of the running total, at the middle of the hour */
        for (let h0 = day0; h0 < Math.min(day1, now); h0 += 36e5) {
          const at = (t) => { let v = 0; rp.forEach((q) => { if (q[0] <= t) v = q[1]; }); return v; };
          rateP.push([Math.min(h0 + 18e5, now), Math.max(0, at(Math.min(h0 + 36e5, now)) - at(h0))]);
        }
      }
      if (dayOff >= 0) {
        const f0 = isToday ? now : day0;
        if (isToday && rateP.length) rateF.push([now, rateP[rateP.length - 1][1]]);
        hrs.map((i) => [Date.parse(i.datetime), Number(i.precipitation)]).filter((h) => isFinite(h[1]) && h[0] + 36e5 > f0 && h[0] < day1)
          .sort((p, q) => p[0] - q[0]).forEach((h) => rateF.push([Math.max(h[0] + 18e5, f0), Math.max(0, h[1])]));
        /* each hour sits at its middle, so the line is carried to both ends of the day,
           or it stops half an hour short of midnight */
        if (!isToday && rateF.length) rateF.unshift([day0, rateF[0][1]]);
        if (rateF.length && rateF[rateF.length - 1][0] < day1 - 6e4) rateF.push([day1, rateF[rateF.length - 1][1]]);
      }
      const rMaxAll = Math.max(0, ...rateP.map((p) => p[1]), ...rateF.map((p) => p[1]));
      if (rainShown(rMaxAll)) {
        /* its own scale, with a minimum height so a drizzle doesn't fill the chart */
        const scaleR = Math.max(rMaxAll, fromBase(2.5));
        const yR = (v) => bottom - Math.min(scaleR, Math.max(0, v)) / scaleR * (bottom - top) * 0.45;
        if (rateP.length > 1) svg.appendChild(el('path', { d: smooth(rateP.map((p) => [x(p[0]), yR(p[1])])), class: 'wx-rain-line' }));
        if (rateF.length > 1) svg.appendChild(el('path', { d: smooth(rateF.map((p) => [x(p[0]), yR(p[1])])), class: 'wx-rain-line ahead' }));
        /* the heaviest expected hour, marked as the chance of rain used to be */
        const pkF = rateF.filter((p) => p[0] > now + 6e4).reduce((m2, p) => (!m2 || p[1] > m2[1] ? p : m2), null);
        if (pkF && rainShown(pkF[1])) {
          const kx = x(pkF[0]), ky = yR(pkF[1]);
          svg.appendChild(el('circle', { cx: kx, cy: ky, r: 3, class: 'wx-pop-mark' }));
          const labK = el('text', { x: Math.max(24, Math.min(Wd - right - 24, kx)), y: ky - 7, class: 'wx-pop-label wx-rain-label', 'text-anchor': 'middle' });
          labK.textContent = rainFmt(pkF[1]) + '/h';
          svg.appendChild(labK);
        }
      }
    }
    /* drag to read: temperature at that hour, with the chance of rain when there is any */
    svg.__scrub = { P: P, pts: pts, top: top, bottom: bottom, right: right, Wd: Wd,
      fmt: (v, t2) => {
        let out = L.t(v);
        let best = null;
        popAll.forEach((q) => { if (!best || Math.abs(q[0] - t2) < Math.abs(best[0] - t2)) best = q; });
        /* how hard it was raining then, or is expected to be */
        let r2 = null;
        const serR = t2 <= now ? rateP : rateF;
        for (let i = 1; i < serR.length; i++) {
          const q0 = serR[i - 1], q1 = serR[i];
          if (t2 >= q0[0] && t2 <= q1[0]) { r2 = q0[1] + (q1[1] - q0[1]) * (t2 - q0[0]) / Math.max(1, q1[0] - q0[0]); break; }
        }
        if (r2 != null && rainShown(r2)) out += ' · ' + rainFmt(r2) + '/h';
        if (t2 > now && best && Math.abs(best[0] - t2) < 5400e3 && best[1] >= 5) out += ' · ' + Math.round(best[1]) + '%';
        return out + ' · ' + new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 });
      } };
    /* the day's high and low, marked on the curve */
    if (pts.length > 1) {
      const hiP = pts.reduce((m, p) => p[1] > m[1] ? p : m, pts[0]);
      const loP = pts.reduce((m, p) => p[1] < m[1] ? p : m, pts[0]);
      [[hiP, 'H', -10], [loP, 'L', 16]].forEach((m) => {
        svg.appendChild(el('circle', { cx: x(m[0][0]), cy: y(m[0][1]), r: 3.5, class: 'wx-t-mark' }));
        /* the high or low can fall on the first or last point — a centred label would be
           half cut off there, so it is held inside the plot the way the peak-% one is */
        const lab = el('text', { x: Math.max(9, Math.min(Wd - right - 9, x(m[0][0]))), y: y(m[0][1]) + m[2], class: 'wx-t-hl', 'text-anchor': 'middle' });
        lab.textContent = m[1]; svg.appendChild(lab);
      });
    }
    if (today) {
      svg.appendChild(el('line', { x1: nx, y1: top, x2: nx, y2: bottom, class: 'wx-w-now' }));
      const tv3 = Number(a.temperature);
      if (isFinite(tv3)) {
        svg.appendChild(el('circle', { cx: nx, cy: y(tv3), r: 10, fill: colourOf(tv3), 'fill-opacity': 0.3 }));
        svg.appendChild(el('circle', { cx: nx, cy: y(tv3), r: 5, fill: colourOf(tv3), stroke: '#fff', 'stroke-width': 2 }));
      }
    }
    ticks.forEach((t2) => {
      if (Wd - right - x(t2) < 44) return;
      const lab = el('text', { x: x(t2) + 5, y: H - 6, class: 'wx-sun-axis' });
      lab.textContent = new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
      svg.appendChild(lab);
    });
    const wrap = document.createElement('div'); wrap.className = 'wx-sun-wrap wx-hour-wrap';
    const foot = L.el('div', 'wx-wind-summary', wrap);
    /* one icon per hour across the whole day: the forecast covers the hours ahead,
       the icon sensor's history covers the ones already gone */
    /* icon history only stands in for hours already gone. Borrowing today's history for
       a future day drew a full row of icons across hours the forecast never covered. */
    const iHist = dayOff <= 0 ? (((histOf('iHist', dayOff) || {}).pts) || []) : [];
    /* the recorded condition as spans — each state from its change to the next, or to
       now — so a stretch of time can be asked which condition lasted longest in it */
    const recEnd = Math.min(now, day1), recSeg = [];
    iHist.forEach((p, i) => {
      const st = Math.max(p[0], day0), en = Math.min(i + 1 < iHist.length ? iHist[i + 1][0] : recEnd, recEnd);
      if (en > st) recSeg.push([st, en, L.pw[p[1]] || p[1]]);
    });
    /* The one rule for "what was the weather over this stretch", shared by the icon row
       and the sentence under the chart: the condition that lasted longest in it. Time
       already gone counts what was recorded, each state for as long as it held; time
       ahead counts the forecast, an hour per entry. */
    const condLongest = (from, to) => {
      const tally = {};
      recSeg.forEach((r) => { const ov = Math.min(r[1], to) - Math.max(r[0], from); if (ov > 0) tally[r[2]] = (tally[r[2]] || 0) + ov; });
      hrs.forEach((i) => { const t = Date.parse(i.datetime); if (t >= from && t < to && t > now - 18e5 && i.condition) tally[i.condition] = (tally[i.condition] || 0) + 36e5; });
      return Object.keys(tally).sort((m, n) => tally[n] - tally[m])[0] || null;
    };
    /* span: how much time this icon stands for; it shows condLongest over that stretch,
       falling back to the moment itself only where the stretch has nothing at all */
    const condAt = (t2, span) => {
      if (span) { const lg = condLongest(t2, t2 + span); if (lg) return lg; }
      if (t2 > now - 18e5) {                        /* forecast: nearest hour */
        let best = null;
        hrs.forEach((it) => { const ht = Date.parse(it.datetime); if (!best || Math.abs(ht - t2) < Math.abs(best[0] - t2)) best = [ht, it.condition]; });
        if (best && Math.abs(best[0] - t2) < 5400e3) return best[1] || 'cloudy';
      }
      let prev = null;                              /* history: the state in effect then */
      iHist.forEach((p) => { if (p[0] <= t2 + 3e5) prev = p; });
      return prev ? (L.pw[prev[1]] || prev[1]) : null;
    };
    /* the icons live inside the chart, on a strip above a divider */
    let lastX = -14;
    const h0 = Math.ceil(day0 / 36e5) * 36e5;
    /* icons keep 24 px apart, so on a narrow chart each one covers more than an hour */
    const iconSpan = Math.max(1, Math.ceil(24 / ((Wd - right) / 24))) * 36e5;
    for (let hh = 0; hh < 25; hh++) {
      const t2 = h0 + hh * 36e5, px2 = x(t2);
      if (t2 >= day1) break;
      if (px2 - lastX < 24) continue;               /* keep them from touching */
      const c2 = condAt(t2, iconSpan);
      if (!c2) continue;
      const u2 = L.artUrl(variant(c2, nightAt(t2)));
      if (!u2) continue;
      lastX = px2;
      const ix = Math.max(2, Math.min(Wd - right - 20, px2 - 9));   /* never clipped by an edge */
      const im = el('image', { x: ix, y: 7, width: 18, height: 18, preserveAspectRatio: 'xMidYMid meet' });
      im.setAttribute('href', u2);
      im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', u2);
      svg.appendChild(im);
    }
    wrap.appendChild(svg);
    /* the provider's own wording for today ("Clear throughout the day."); for any other
       day it only covers the next 24 h, so the line is written from the forecast instead */
    const hse = today && cfg.hourly_summary_entity && hass.states[cfg.hourly_summary_entity];
    const given = hse && !/^(unknown|unavailable|none)$/i.test(hse.state) ? String(hse.state) : '';
    /* The sentence under the chart, in short sentences: what the day is like (Pirate
       Weather's own words for today, otherwise worked out below), then the high and low,
       the rain, and gusts or UV when they are worth a mention. */
    const sents = [];
    const cap = (t2) => t2.replace(/^./, (c2) => c2.toUpperCase());
    const hr2 = (t) => new Date(Math.round(t / 36e5) * 36e5).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
    if (given) sents.push(given.trim().replace(/[.]+$/, ''));
    else {
      const word = { sunny: 'sunny', 'clear-night': 'clear', partlycloudy: 'partly cloudy', 'partlycloudy-night': 'partly cloudy',
        cloudy: 'cloudy', fog: 'foggy', rainy: 'rain', pouring: 'heavy rain', 'lightning-rainy': 'thunderstorms',
        lightning: 'thunderstorms', snowy: 'snow', 'snowy-rainy': 'sleet', hail: 'hail', windy: 'windy', 'windy-variant': 'windy' };
      /* The dominant condition in each part of the day, collapsed when they agree, and
         weighted by time: the forecast's hours for what is ahead, and for what has passed
         the condition Home Assistant recorded, each state counted for as long as it held.
         So a past day reads like a forecast one, and today covers its morning too. */
      const hourAt = (h) => { const d = new Date(day0); d.setHours(h, 0, 0, 0); return d.getTime(); };   /* local, so DST days work */
      const part = (from, to) => { const k2 = condLongest(hourAt(from), hourAt(to)); return k2 ? (word[k2] || k2) : ''; };
      const morning = part(5, 12), afternoon = part(12, 18), evening = part(18, 24);
      if (morning && morning === afternoon && morning === evening) sents.push(cap(morning) + ' all day');
      else {
        const seq = [];
        if (morning) seq.push(morning + ' in the morning');
        if (afternoon && afternoon !== morning) seq.push(afternoon + ' in the afternoon');
        if (evening && evening !== afternoon) seq.push(evening + ' in the evening');
        if (seq.length) sents.push(cap(seq.join(', ')));
      }
    }
    /* the high and the low and when each falls, rounded to the nearest hour */
    if (pts.length > 1) {
      const hiP2 = pts.reduce((m, p) => p[1] > m[1] ? p : m, pts[0]);
      const loP2 = pts.reduce((m, p) => p[1] < m[1] ? p : m, pts[0]);
      sents.push('High of ' + L.t(hiP2[1]) + ' around ' + hr2(hiP2[0]) + ', low of ' + L.t(loP2[1]) + ' around ' + hr2(loP2[0]));
    }
    /* rain: fallen and expected, from the same totals as the rain line, and the peak chance */
    {
      const rainTot = rainAll.length ? rainAll[rainAll.length - 1][1] : 0;
      const rainMore = rainAhead.length > 1 ? rainAhead[rainAhead.length - 1][1] - rainAhead[0][1] : 0;
      let rt = '';
      /* snow counts once it is a tenth of the smallest usual depth; the forecast's amount
         covers rain and snow together, so it is named after what is expected */
      const snowTxt = snowTot > 0 && precipBase(snowTot, snowU) >= 1
        ? (snowTot < 10 ? snowTot.toFixed(1) : String(Math.round(snowTot))) + ' ' + snowU + ' of snow' : '';
      const snowAhead = hrs.some((i) => Date.parse(i.datetime) > now - 18e5 && /snow/.test(i.condition || ''));
      const expNoun = snowAhead ? 'rain and snow' : 'rain';
      const fallen = [rainShown(rainTot) ? rainFmt(rainTot) + ' of rain' : '', snowTxt].filter(Boolean);
      if (dayOff < 0) { if (fallen.length) rt = fallen.join(' and ') + ' fell'; }
      else if (dayOff > 0) { if (rainShown(rainMore)) rt = 'About ' + rainFmt(rainMore) + ' of ' + expNoun + ' expected'; }
      else if (fallen.length) rt = fallen.join(' and ') + ' so far' + (rainShown(rainMore) ? ', about ' + rainFmt(rainMore) + ' more expected' : '');
      else if (rainShown(rainMore)) rt = 'About ' + rainFmt(rainMore) + ' of ' + expNoun + ' expected';
      const popMax = popAll.length ? Math.max(...popAll.map((p) => p[1])) : 0;
      if (popMax >= 20) {
        const at2 = popAll.reduce((m, p) => p[1] > m[1] ? p : m, popAll[0]);
        rt = rt ? rt + ', with up to a ' + Math.round(popMax) + '% chance around ' + hr2(at2[0]) : 'Up to a ' + Math.round(popMax) + '% chance of rain around ' + hr2(at2[0]);
      }
      if (rt) sents.push(rt);
    }
    /* from the hours still ahead: gusts once they are strong (the threshold converted to
       the wind unit shown), and UV only once it is high — 6 or more, where sun protection
       really matters; below that it is ordinary and would just lengthen the sentence */
    if (hrs.length) {
      const wu = a.wind_speed_unit || us.wind_speed || 'km/h';
      const kmhOf = { mph: 1.609, 'm/s': 3.6, kn: 1.852, 'ft/s': 1.097 }[wu] || 1;
      const ahead = hrs.filter((i) => Date.parse(i.datetime) > now - 18e5);
      const gPk = ahead.reduce((m, i) => (Number(i.wind_gust_speed) > (m ? Number(m.wind_gust_speed) : -1) ? i : m), null);
      if (gPk && Number(gPk.wind_gust_speed) * kmhOf >= 30) sents.push('Gusts up to ' + Math.round(Number(gPk.wind_gust_speed)) + ' ' + wu + ' around ' + hr2(Date.parse(gPk.datetime)));
      const uPk = ahead.reduce((m, i) => (Number(i.uv_index) > (m ? Number(m.uv_index) : -1) ? i : m), null);
      const uvPk = uPk ? Number(uPk.uv_index) : 0;
      if (uvPk >= 6) sents.push('UV ' + (dayOff > 0 ? 'peaks' : 'peaking') + ' at ' + Math.round(uvPk) + ' (' + (uvPk >= 11 ? 'extreme' : uvPk >= 8 ? 'very high' : 'high') + ') around ' + hr2(Date.parse(uPk.datetime)));
    }
    foot.textContent = sents.length ? sents.map((t2) => cap(t2) + '.').join(' ') : '';
    return wrap;
  };
  /* "high of 11° at 3 PM, low of 7° at 5 AM": the highest and lowest readings and the
     hour each came, rounded to the nearest hour as the rest of the card does; on a tie
     the first wins, which also keeps the copy of the last reading carried to midnight
     from winning */
  const hiLoAt = (P, fmtV) => {
    if (!P || P.length < 2) return '';
    let lo = P[0], hi = P[0];
    P.forEach((p) => { if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; });
    const at = (t) => new Date(Math.round(t / 36e5) * 36e5).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
    return 'high of ' + fmtV(hi[1]) + ' at ' + at(hi[0]) + ', low of ' + fmtV(lo[1]) + ' at ' + at(lo[0]);
  };
  /* ---- dew point: the moisture actually in the air, in the temperature's own unit.
     Where the provider or a sensor gives it, that is used; otherwise it is worked out
     from temperature and relative humidity with the Magnus formula (Alduchov-Eskridge
     constants), good to a few tenths of a degree across weather ranges. */
  const tUnitF = /F/i.test(a.temperature_unit || '');
  const toC = (v) => (tUnitF ? (v - 32) * 5 / 9 : v);
  const fromC = (v) => (tUnitF ? v * 9 / 5 + 32 : v);
  const dewFrom = (temp, rh) => {
    const T = toC(Number(temp)), R = Number(rh);
    if (temp == null || rh == null || !isFinite(T) || !isFinite(R) || R <= 0) return null;
    const g = Math.log(Math.min(R, 100) / 100) + 17.625 * T / (243.04 + T);
    return fromC(243.04 * g / (17.625 - g));
  };
  const dewOfHour = (h) => (h.dew_point != null && isFinite(Number(h.dew_point)) ? Number(h.dew_point) : dewFrom(h.temperature, h.humidity));
  /* The comfort scale, native in each unit rather than converted. It is a °F scale at
     heart — 50 / 60 / 65 / 70 — and the °C one is its usual rounding, 10 / 16 / 18 / 21.
     Converting the rounded °C edges back gave 60.8 and 64.4 °F, which no one uses.
     Below the first edge is simply dry air, normal in winter, so it gets a quiet colour.
     The chart, the chip and the words all read from this one table. */
  const dewBands = (tUnitF
    ? [[-100, 50], [50, 60], [60, 65], [65, 70], [70, 180]]
    : [[-80, 10], [10, 16], [16, 18], [18, 21], [21, 80]])
    .map((b, i) => [b[0], b[1], ['#8AB4E8', '#7ED957', '#F2D34B', '#F5A05A', '#F26B6B'][i], ['dry', 'comfortable', 'slightly humid', 'humid', 'oppressive'][i]]);
  const dewBandIx = (v) => { const i = dewBands.findIndex((b) => v < b[1]); return i < 0 ? dewBands.length - 1 : i; };
  /* words and chip colour go by the rounded value, so they agree with the number shown:
     49.9 displays as 50° and must not be called dry */
  const dewLabel = (v) => { const w = dewBands[dewBandIx(Math.round(v))][3]; return w.charAt(0).toUpperCase() + w.slice(1); };
  const dewSensor = () => { const d = (cfg.details || {}).dew_point; return typeof d === 'string' && hass.states[d] ? d : null; };
  /* History from the dew point sensor when there is one. Otherwise it is built from the
     temperature and humidity recordings: every moment either one changed, using the last
     value of each — so a temperature change with steady humidity still moves the line. */
  const dewHistory = (off) => {
    const o2 = off || 0, dslot = o2 === 0 ? 'dHist' : 'dHist_' + o2;
    if (dewSensor()) { dayHistory(dewSensor(), 'dHist', false, o2); return; }
    dayHistory(cfg.temperature_entity, 'tHist', false, o2);
    dayHistory((cfg.details || {}).humidity, 'hHist', false, o2);
    const tb = histOf('tHist', o2), hb = histOf('hHist', o2);
    if (!tb || !hb) { delete S[dslot]; return; }
    const at = Math.max(tb.at, hb.at);
    if (S[dslot] && S[dslot].at === at) return;
    const tp = tb.pts || [], hp = hb.pts || [], out = [];
    if (tp.length && hp.length) {
      const ts = Array.from(new Set(tp.map((p) => p[0]).concat(hp.map((p) => p[0])))).sort((p, q) => p - q);
      let i = 0, k = 0;
      ts.forEach((t) => {
        while (i + 1 < tp.length && tp[i + 1][0] <= t) i++;
        while (k + 1 < hp.length && hp[k + 1][0] <= t) k++;
        if (tp[i][0] > t || hp[k][0] > t) return;
        const d = dewFrom(tp[i][1], hp[k][1]);
        if (d != null) out.push([t, d]);
      });
    }
    S[dslot] = { at: at, pts: out, err: !!(tb.err || hb.err) };
  };
  const dewGraph = (Wd, H, off) => {
    const pts = todayPts(histOf('dHist', off), off ? null : S.dewNow, dewOfHour, off);
    const vals = pts.map((p) => p[1]);
    /* the scale follows the day, since dew point sits anywhere from below freezing to the
       twenties: whole steps, at least three of them */
    const stepD = tUnitF ? 5 : 3;
    const lo = vals.length ? Math.min(...vals) : 0, hi = vals.length ? Math.max(...vals) : 10;
    let ymin = Math.floor((lo - stepD / 2) / stepD) * stepD, ymax = Math.ceil((hi + stepD / 2) / stepD) * stepD;
    while ((ymax - ymin) / stepD < 3) { ymax += stepD; if ((ymax - ymin) / stepD < 3) ymin -= stepD; }
    const ticks = [];
    for (let v = ymin; v <= ymax + 1e-9; v += stepD) ticks.push(v);
    /* humidity rides along in the drag readout: it's the number people know */
    const humPts = todayPts(histOf('hHist', off), off ? null : S.humNow, 'humidity', off);
    const humAt = (t) => {
      let best = null;
      humPts.forEach((p) => { if (Math.abs(p[0] - t) <= 54e5 && (!best || Math.abs(p[0] - t) < Math.abs(best[0] - t))) best = p; });
      return best ? best[1] : null;
    };
    return dayGraph({
      id: 'd', day0: dayStartOf(off), pts: pts, nowVal: off ? null : S.dewNow, bands: dewBands, ymin: ymin, ymax: ymax, tintScale: 'blend',
      ticks: ticks, fmt: (v) => Math.round(v) + '°',
      scrubFmt: (v, t2) => {
        const rh = humAt(t2);
        return Math.round(v) + '°' + (rh != null ? ' · ' + Math.round(rh) + '% humidity' : '') + ' · ' + new Date(t2).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit', hour12: h12 });
      },
      summary: (v2, colourOf, P3) => {
        const rng = v2.length > 1 ? Math.round(Math.min(...v2)) + '° to ' + Math.round(Math.max(...v2)) + '°' : '';
        /* any other day: its high and low, and how that feels — the words for the low and
           the high, or one word when the whole day sits in the same band */
        if (off) {
          const r3 = hiLoAt(P3, (v) => Math.round(v) + '°');
          if (!r3) return '';
          const wLo = dewLabel(Math.min(...v2)), wHi = dewLabel(Math.max(...v2));
          return 'Dew point ' + r3 + '. ' + (wLo === wHi ? wLo + ' all day.' : wLo + ' to ' + wHi.toLowerCase() + '.');
        }
        if (S.dewNow == null) return '';
        let t = 'Dew point is currently ' + Math.round(S.dewNow) + '°, ' + dewLabel(S.dewNow).toLowerCase() + '.';
        if (rng) t += ' Today it ranges from ' + rng + '.';
        /* within about 2 °C of the temperature the air is close to saturated */
        const tNow = Number(a.temperature);
        /* while it rains, fog or dew is beside the point: the air simply is saturated */
        const rainR = cfg.precipitation && cfg.precipitation.rain && hass.states[cfg.precipitation.rain];
        const raining = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail'].includes(st.state) || (rainR && Number(rainR.state) > 0);
        if (isFinite(tNow) && toC(tNow) - toC(S.dewNow) <= 2) t += raining ? ' The air is saturated.' : toC(tNow) <= 0 ?' The air is close to saturation and below freezing, so frost is likely.' : ' The air is close to saturation, so fog or dew is likely.';
        return t;
      }
    }, Wd, H);
  };
  /* Sunlight reaching the ground, in W/m2 — the number solar output follows. History
     only: Home Assistant's forecast has no irradiance field, so today's curve ends at
     now, and the arrows page back through recorded days but not ahead. */
  const solarBands = [[0, 100, '#6E86A8', 'dim'], [100, 300, '#F2D34B', 'moderate'], [300, 600, '#F5A05A', 'strong'], [600, 1200, '#FF9500', 'very strong']];
  const solarGraph = (Wd, H, off) => {
    off = Math.min(0, off || 0);
    const day0 = dayStartOf(off);
    const pts = (((histOf('sHist', off) || {}).pts) || []).filter((p) => p[0] >= day0 && p[0] <= Math.min(Date.now(), day0 + 864e5));
    if (!off && S.solarNow != null) pts.push([Date.now(), S.solarNow]);
    const peak = Math.max(0, ...pts.map((p) => p[1]));
    const ymax = peak <= 200 ? 200 : peak <= 500 ? 500 : peak <= 800 ? 800 : 1200;
    return dayGraph({
      /* the ticks are quarters of the axis while the bands sit at 100/300/600, so they
         rarely coincide — tinting them would just repeat a colour. Plain labels here. */
      id: 's', day0: day0, pts: pts, nowVal: off ? null : S.solarNow, bands: solarBands, ymax: ymax,
      ticks: [0, ymax / 4, ymax / 2, ymax * 0.75, ymax], fmt: (v) => Math.round(v),
      summary: () => {
        const bits = [];
        if (!off && S.solarNow != null) bits.push(Math.round(S.solarNow) + ' W/m² right now' + (S.solarNow > 0 ? ', ' + (solarBands.find((b) => S.solarNow < b[1]) || solarBands[3])[3] + ' sun' : ''));
        if (peak > 0) bits.push((off ? 'peaked at ' : 'peaking at ') + Math.round(peak) + ' W/m²' + (off ? '' : ' today'));
        if (pts.length > 1) {
          /* rough energy: the area under the curve, in kWh per square metre */
          let wh = 0;
          for (let i = 1; i < pts.length; i++) wh += (pts[i][1] + pts[i - 1][1]) / 2 * (pts[i][0] - pts[i - 1][0]) / 36e5;
          if (wh >= 50) bits.push((wh / 1000).toFixed(1) + ' kWh/m² ' + (off ? 'over the day' : 'so far'));
        }
        return bits.length ? bits.join(', ').replace(/^./, (c2) => c2.toUpperCase()) + '.' : '';
      }
    }, Wd, H);
  };
  /* WHO UV bands */
  const uvBands = [[0, 3, '#7ED957', 'low'], [3, 6, '#F2D34B', 'moderate'], [6, 8, '#F5A05A', 'high'], [8, 11, '#F26B6B', 'very high'], [11, 99, '#B07CD6', 'extreme']];
  const uvGraph = (Wd, H, off) => {
    const pts = todayPts(histOf('uHist', off), S.uvNow, 'uv_index', off);
    const ymax = Math.max(11, Math.ceil(Math.max(0, ...pts.map((p) => p[1])) + 1));
    return dayGraph({
      id: 'u', day0: dayStartOf(off), pts: pts, nowVal: off ? null : S.uvNow, bands: uvBands, ymax: ymax, tintScale: true,
      ticks: [0, 3, 6, 8, 11].concat(ymax > 11 ? [ymax] : []), fmt: (v) => v,
      summary: (vals, colourOf) => {
        if (off) { const mx2 = vals.length ? Math.max(...vals) : 0; return mx2 ? (off < 0 ? 'UV peaked at ' : 'UV peaks at ') + Math.round(mx2) + ' (' + colourOf(mx2)[3] + ').' : ''; }
        if (S.uvNow == null) return '';
        let t = 'UV index is currently ' + Math.round(S.uvNow) + ', ' + colourOf(S.uvNow)[3] + '.';
        if (vals.length > 1) { const mx = Math.max(...vals); t += ' Today\'s peak is ' + Math.round(mx) + ' (' + colourOf(mx)[3] + ').'; }
        if (S.uvNow >= 3) t += ' Sun protection recommended.';
        return t;
      }
    }, Wd, H);
  };
  const variant = (c, nt) => (nt && c === 'partlycloudy') ? 'partlycloudy-night' : (nt && c === 'sunny') ? 'clear-night' : (!nt && c === 'clear-night') ? 'sunny' : c;
  const cond = variant(st.state, nightNow);
  /* sun position for the glow: azimuth 90° (E) → left edge, 180° (S) → centre,
     270° (W) → right edge; elevation 0° → horizon line low on the card, ~65° → top */
  {
    const az = Number(sun && sun.attributes.azimuth), el = Number(sun && sun.attributes.elevation);
    const x = isFinite(az) ? Math.min(100, Math.max(0, (az - 90) / 180 * 100)) : 85;
    const e = isFinite(el) ? Math.min(65, Math.max(0, el)) : 45;
    /* horizon at ~30% down the card; a mid-afternoon sun (~30°) sits on the top edge
       with half the glow in frame, and a high summer sun rises above it */
    const y = 30 - e / 65 * 55;
    const warm = isFinite(el) ? Math.min(1, Math.max(0, (12 - el) / 12)) : 0;
    S.sunPos = x.toFixed(1) + '|' + y.toFixed(1) + '|' + warm.toFixed(2);
  }
  const type = cfg.type || 'daily';
  const unit = a.temperature_unit || '';
  const loc = hass.locale || {};
  const lang = loc.language || undefined;
  const h12 = loc.time_format === '12' ? true : loc.time_format === '24' ? false : undefined;

  /* ---- size: the card element reports its grid size itself (getGridOptions); here it
     asks hui-card to re-read it, and pins the card's height to the grid cell ---- */
  const host = this.host || null;
  if (host) {
    if (!host.__wxGrid) {
      host.__wxGrid = true;
      host.style.display = 'block';
      host.style.height = '100%';
      /* hui-card re-reads getGridOptions() on this event and re-applies the row span */
      setTimeout(() => host.dispatchEvent(new Event('card-updated', { bubbles: true, composed: true })), 0);
      /* Measure the grid cell (hui-card) and size the card in px: percentage heights
         don't survive the dashboard's wrappers, a measured value does. The cell is looked up
         lazily: the first template run happens before the card is attached */
      S.findCell = () => {
        /* the row-fitted element is the section's div.card wrapper *above* hui-card
           (hui-card itself is inline and measures 0); in edit mode there is a
           hui-card-edit-mode between the two */
        let c = host;
        for (let i = 0; i < 8 && c && c.tagName !== 'HUI-CARD'; i++) c = c.parentElement || (c.parentNode && c.parentNode.host) || null;
        if (!c || c.tagName !== 'HUI-CARD') return null;
        let w = c.parentElement;
        if (w && w.tagName === 'HUI-CARD-EDIT-MODE') w = w.parentElement;
        return w || c;
      };
      S.fit = () => {
        if (!S.cell || !S.cell.isConnected) {
          S.cell = S.findCell();
          if (!S.cell) return;
          if (W.ResizeObserver) { if (S.cellRo) S.cellRo.disconnect(); S.cellRo = new ResizeObserver(() => S.fit()); S.cellRo.observe(S.cell); }
          S.cellH = null;
        }
        /* only a row-fitted wrapper has a height of its own; with rows: auto the
           content decides, so leave everything unpinned */
        const fitted = S.cell.classList.contains('fit-rows') || /fit-rows/.test(S.cell.className);
        const h = fitted ? Math.round(S.cell.getBoundingClientRect().height) : 0;
        if (h === S.cellH) return;
        S.cellH = h;
        let e = box;
        for (let i = 0; i < 12 && e && e !== S.cell; i++) {
          /* a transition on a wrapper would animate a height set after first paint
             and slide the header down on load */
          if (e !== box) e.style.setProperty('transition', 'none', 'important');
          if (h) {
            e.style.setProperty('height', h + 'px', 'important');
            e.style.setProperty('min-height', h + 'px', 'important');
            e.style.setProperty('max-height', h + 'px', 'important');
            e.style.setProperty('display', e === box ? 'flex' : 'block', 'important');
            e.style.setProperty('box-sizing', 'border-box', 'important');
          } else {
            ['height', 'min-height', 'max-height', 'display', 'box-sizing'].forEach((k) => e.style.removeProperty(k));
          }
          e = e.parentElement || (e.parentNode && e.parentNode.host) || null;
        }
        if (S.edge) S.edge();
        box.classList.remove('wx-unfit');
      };
      /* hold the card invisible until it has its height; never longer than 1.5 s */
      box.classList.add('wx-unfit');
      setTimeout(() => box.classList.remove('wx-unfit'), 1500);
      requestAnimationFrame(() => S.fit()); setTimeout(() => S.fit(), 300);
    }
  }

  /* ---- one-time DOM ---- */
  box.classList.add('wx');
  card.classList.add('wx-card');
  if (!S.bg) {
    S.bg = document.createElement('div'); S.bg.className = 'wx-bg';
    box.insertBefore(S.bg, box.firstChild);
    const nc = row.querySelector('.wx-title');
    if (nc) {
      S.cond = document.createElement('div'); S.cond.className = 'wx-cond'; nc.insertBefore(S.cond, nc.firstChild);
      S.condText = L.el('span', 'wx-cond-text', S.cond);
      S.trend = L.el('span', 'wx-trend', S.cond);
      S.sub = L.el('div', 'wx-sub', nc);
    }
    S.now = document.createElement('div'); S.now.className = 'wx-now';
    const ic = document.createElement('ha-icon'); ic.icon = 'mdi:thermometer'; S.now.appendChild(ic);
    S.temp = L.el('span', 'wx-temp', S.now);
    row.appendChild(S.now);
    /* forecast area: an optional header (hourly view) + a horizontally scrolling strip */
    S.details = L.el('div', 'wx-details', box);
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => S.details.addEventListener(ev, (e) => e.stopPropagation()));
    S.details.addEventListener('scroll', () => S.edge && S.edge(true), { passive: true });
    S.details.addEventListener('click', (e) => {
      e.stopPropagation();
      const chip = e.target.closest && e.target.closest('.wx-chip');
      if (!chip) return;
      if (chip.dataset.view === 'sun') { S.view = { sun: true, label: 'Sunrise & Sunset', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
      if (chip.dataset.view === 'wind') { S.view = { wind: true, label: 'Wind', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
      if (chip.dataset.view === 'aqi') { S.view = { aqi: true, label: 'Air Quality', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
      if (chip.dataset.view === 'dew') { S.view = { dew: true, label: 'Dew point', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
      if (chip.dataset.view === 'uv') { S.view = { uv: true, label: 'UV Index', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
      if (chip.dataset.view === 'solar') { S.view = { solar: true, label: 'Sunlight', at: Date.now() }; S.sig = null; if (S.draw) S.draw(); return; }
    });
    /* one narrative line under the chips: the next 24 h, then the week */
    S.summary = L.el('div', 'wx-summary', box);
    S.alert = L.el('div', 'wx-alert-bar', box);
    const ai = document.createElement('ha-icon'); ai.icon = 'mdi:alert'; S.alert.appendChild(ai);
    S.alertText = L.el('div', 'wx-alert-text', S.alert);
    S.alertMore = L.el('span', 'wx-alert-more', S.alert);
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => S.alert.addEventListener(ev, (e) => e.stopPropagation()));
    /* by design nothing in the card leaves it: the banner only shows the headline */
    S.alert.addEventListener('click', (e) => e.stopPropagation());
    S.fcWrap = L.el('div', 'wx-forecast', box);
    S.fcHead = L.el('div', 'wx-fc-head', S.fcWrap);
    S.fc = L.el('div', 'wx-strip', S.fcWrap);
    /* keep taps inside the strip from firing the card's own tap action */
    ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => S.fcWrap.addEventListener(ev, (e) => e.stopPropagation()));
    /* the return-home countdown runs from the last touch, not from when the view opened,
       so reading a chart with a long drag isn't cut short; the draw re-arms the timer */
    /* a touch keeps an open view up: restart its return-home timer here, without
       redrawing. A redraw under the finger could replace the Back or arrow button
       between press and release, and the tap was lost (it took a second tap). */
    const touched = () => {
      if (!S.view) return;
      S.view.at = Date.now();
      if (S.backTimer) clearTimeout(S.backTimer);
      S.backTimer = null;
      S.backFor = S.view;
      const back = S.backSecs || 0;
      if (back > 0) S.backTimer = setTimeout(() => { S.backTimer = null; S.backFor = null; if (S.draw) S.draw(); }, back * 1000 + 200);
    };
    S.fcWrap.addEventListener('pointerdown', touched);
    S.fcWrap.addEventListener('pointerup', touched);
    S.fc.addEventListener('scroll', () => S.edge && S.edge(true), { passive: true });
    S.fcHead.addEventListener('click', (e) => {
      if (!(e.target.closest && e.target.closest('.wx-fc-back'))) return;
      S.view = null; S.sig = null; if (S.draw) S.draw();
    });
    S.fc.addEventListener('click', (e) => {
      const cell = e.target.closest && e.target.closest('.wx-item[data-day]');
      if (!cell || type === 'hourly') return;   /* a day always opens its hours */
      S.view = { day: cell.dataset.day, label: cell.dataset.label, at: Date.now() };
      S.sig = null;
      if (S.draw) S.draw();
    });
    if (W.ResizeObserver) { S.ro = new ResizeObserver(() => { if (S.edge) S.edge(); }); S.ro.observe(box); }
  }
  S.now.style.display = cfg.hide_temperature ? 'none' : '';
  if (S.fit) S.fit();

  /* ---- header icon, palette and animated scene for a given condition/night.
     Kept as a function so the debug cycler can drive it without a hass update ---- */
  const wind = Number(a.wind_speed) || 0, wu = a.wind_speed_unit || us.wind_speed || 'km/h';
  /* wind_bearing is where the wind blows FROM; clouds travel the opposite way.
     East is right on the card, so a westerly (270°) pushes clouds left → right */
  const bearing = Number(a.wind_bearing);
  const toLeft = isFinite(bearing) && Math.sin((bearing + 180) * Math.PI / 180) < 0;
  /* the scene's wind thresholds are on a common scale; this is the size of the shown unit on it */
  const wPer = { 'm/s': 3.6, mph: 1.609, kn: 1.852, 'ft/s': 1.097 }[wu] || 1;
  const kmh = wind * wPer;
  /* a device that asks for reduced motion gets a still sky; otherwise each effect has its
     own switch under animations */
  const anim = !(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  S.apply = (c, night) => {
    S.lastScene = [c, night];
    /* main icon: HA artwork instead of the mdi glyph */
    const iconBox = row.querySelector('.wx-hero');
    if (iconBox) {
      const u = L.art(c);
      if (iconBox.__wxArt !== u) {
        iconBox.__wxArt = u;
        iconBox.style.backgroundImage = u || '';
        iconBox.classList.toggle('wx-has-art', !!u);
      }
    }
    /* background colours */
    const pal = (L.bg[c] || L.bg.cloudy)[night ? 1 : 0];
    if (S.pal !== pal[0] + pal[1]) {
      S.pal = pal[0] + pal[1];
      card.style.setProperty('--wx-1', pal[0]);
      card.style.setProperty('--wx-2', pal[1]);
    }
    if (S.sunApplied !== S.sunPos) {
      S.sunApplied = S.sunPos;
      const [sx, sy, warm] = S.sunPos.split('|');
      S.bg.style.setProperty('--sun-x', sx + '%');
      S.bg.style.setProperty('--sun-y', sy + '%');
      S.bg.style.setProperty('--sun-warm', warm);
    }
    /* animated scene, rebuilt only when condition / night / wind bucket change */
    /* live precipitation rates per type, converted from each sensor's own unit onto the
       common scale, and the type the provider reports.
       In debug the knobs below stand in for the sensors so every effect can be seen. */
    const pc = cfg.precipitation || {};
    const rate = (id) => { const e = id && hass.states[id]; const v = e && Number(e.state); return isFinite(v) ? Math.max(0, precipBase(v, (e.attributes || {}).unit_of_measurement)) : null; };
    const dbg = !!cfg.debug;
    let wet = { rain: rate(pc.rain), snow: rate(pc.snow), ice: rate(pc.ice) };
    let ptype = pc.type && hass.states[pc.type] ? String(hass.states[pc.type].state).toLowerCase() : '';
    /* each type has its own knob in debug; a knob left on "auto" keeps its sensor */
    if (dbg && (S.dbgRain != null || S.dbgSnow != null || S.dbgIce != null)) {
      wet = { rain: S.dbgRain != null ? S.dbgRain : wet.rain, snow: S.dbgSnow != null ? S.dbgSnow : wet.snow, ice: S.dbgIce != null ? S.dbgIce : wet.ice };
      ptype = '';                                   /* let the rates decide what falls */
    }
    const rateMax = Math.max(wet.rain || 0, wet.snow || 0, wet.ice || 0);
    /* wind and cloud cover can be driven from the knobs too */
    const kmhEff = dbg && S.dbgWind != null ? S.dbgWind : kmh;
    /* wind direction: westerly blows the scene left → right, easterly the other way */
    const toLeftEff = dbg && S.dbgDir ? S.dbgDir === 'E' : toLeft;
    /* how much cloud: the measured percentage when there is a sensor, else the condition's
       own level. Read here because the scene key below depends on it. */
    const cloudPct = (() => {
      if (dbg && S.dbgCloud != null) return S.dbgCloud;
      const e = cfg.cloud_entity && hass.states[cfg.cloud_entity]; const v = e && Number(e.state); return isFinite(v) ? v : null;
    })();
    if (S.tile) S.tile();
    /* no width yet (first run happens before the card is laid out): leave the scene
       for S.tile() to build once the tile is measured, so it isn't built twice */
    if (!S.tileW) { S.sceneKey = null; return; }
    /* rebuild when the rate changes enough to look different (small steps) */
    const wetKey = ptype + '|' + Math.round(Math.min(20, rateMax) * 4) / 4 + '|' + (cloudPct == null ? 'x' : Math.round(cloudPct / 5)) + '|' + (dbg ? [S.dbgRain, S.dbgSnow, S.dbgIce, S.dbgWind, S.dbgDir, S.dbgCloud, S.dbgStorm].join(',') : '');
    /* Thunder is shown only when it is actually forecast: the condition now, or a
       thunderstorm in the hourly forecast within the next two hours (a distant rumble).
       Pirate Weather's "nearest storm distance" is the nearest precipitation, not
       lightning, so drizzle nearby read as a storm at 0 km — it no longer decides. */
    const thunderNow = /lightning/.test(c);
    const tNowMs = Date.now();
    const thunderSoon = !thunderNow && (S.hours || []).some((h) => { const t = Date.parse(h.datetime); return t > tNowMs - 36e5 && t <= tNowMs + 2 * 36e5 && /lightning/.test(h.condition || ''); });
    /* each effect can be switched off on its own (the animations option): clouds, fog,
       stars and the sun glow then hold still; rain, snow and lightning aren't drawn */
    const an = Object.assign({}, ANIM_DEFAULTS, cfg.animations);
    const sceneKey = (thunderNow ? 'T' : thunderSoon ? 't' : '-') + '|' + c + '|' + (night ? 'n' : 'd') + '|' + Math.min(6, Math.round(kmhEff / 10)) + '|' + (anim ? 1 : 0) + '|' + (toLeftEff ? 'L' : 'R') + '|' + wetKey + '|' + Object.keys(an).filter((k) => !an[k]).join(',');
    if (S.sceneKey === sceneKey) return;
    S.sceneKey = sceneKey;
    /* Crossfade. The new scene is built as a layer of its own, carrying its own sky
       colours, and fades in over the old one, which is removed once covered. This used to
       clear everything and redraw in the same frame — a hard cut on every change of
       condition and on the small rebuilds too (a wind step, the rain rate, cloud cover) —
       and the sky couldn't fade at all, since a gradient set through variables doesn't
       animate. A scene still fading out when another arrives is dropped. */
    const prevScn = S.scene && S.scene.parentNode === S.bg ? S.scene : null;
    const scn = document.createElement('div');
    scn.className = 'wx-scene';
    scn.style.background = 'linear-gradient(180deg, ' + pal[0] + ', ' + pal[1] + ')';
    scn.classList.toggle('wx-to-left', toLeftEff);
    Array.from(S.bg.children).forEach((k2) => { if (k2 !== prevScn) k2.remove(); });
    S.bg.appendChild(scn);
    S.scene = scn;
    if (prevScn) {
      const fadeMs = anim ? 2000 : 0;
      const dropPrev = () => { if (prevScn.parentNode) prevScn.remove(); };
      if (fadeMs && scn.animate) {
        scn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeMs, easing: 'ease-in-out' }).onfinish = dropPrev;
        setTimeout(dropPrev, fadeMs + 600);   /* in case a hidden tab never finishes it */
      } else dropPrev();
    }
    if (!anim) return;
    const r = L.rand(42);
    if (night && /sunny|clear|partly|windy|cloudy/.test(c)) {
      /* a sky's worth of stars above the forecast strip: mostly faint pinpricks, a
         few brighter ones with a glow, each twinkling on its own cycle */
      for (let i = 0; i < 26; i++) {
        const st = L.el('i', 'wx-star', scn);
        st.style.left = (2 + r() * 96) + '%'; st.style.top = (2 + r() * 58) + '%';
        const kind = r();
        const sz = kind < 0.15 ? 3 : kind < 0.55 ? 2 : 1.5;
        st.style.width = sz + 'px'; st.style.height = sz + 'px';
        if (kind < 0.15) st.classList.add('bright');
        const lo = kind < 0.15 ? 0.45 : 0.12 + r() * 0.15, hi = kind < 0.15 ? 1 : 0.55 + r() * 0.4;
        if (an.stars) L.anim(st, [{ opacity: lo }, { opacity: hi }, { opacity: lo }], 3 + r() * 4, -r() * 7, 'ease-in-out');
        else st.style.opacity = ((lo + hi) / 2).toFixed(2);
      }
    }
    if (!night && /sunny|partlycloudy$|windy$/.test(c)) {
      const sunEl = L.el('i', 'wx-sun', scn);
      if (!an.sun) sunEl.style.animation = 'none';
    }
    if (/exceptional/.test(c)) L.el('i', 'wx-alert', scn);
    /* Wind speed drives the drift, inversely: dead calm is ten minutes per card width
       (imperceptible, which is what no wind should look like), a light breeze about a
       minute, a strong wind a quarter of that, never faster than 12 s. 'windy' conditions
       imply at least a stiff breeze even if the reported speed is low. */
    const eff = /windy/.test(c) ? Math.max(kmhEff, 40) : kmhEff;
    /* rain and storms keep at least broken cover whatever the number says */
    let cover = L.cover(c);
    /* how thick the cloud looks within its level, so 7% is a wisp and 28% is real
       scattered cloud rather than both jumping to the same thing */
    let cloudFade = 1;
    if (cloudPct != null && !/fog|exceptional/.test(c)) {
      const byPct = cloudPct < 3 ? 0 : cloudPct < 30 ? 1 : cloudPct < 65 ? 2 : 3;
      cover = /rainy|pouring|snowy|hail|lightning/.test(c) ? Math.max(2, byPct) : byPct;
      cloudFade = byPct === 1 ? Math.max(0.3, Math.min(1, 0.3 + cloudPct / 30 * 0.7))
        : byPct === 2 ? Math.max(0.7, Math.min(1, 0.7 + (cloudPct - 30) / 35 * 0.3)) : 1;
    }
    const dur = Math.max(12, Math.min(600, 600 / (eff + 0.4)));
    /* texture size: fixed width, height chosen so one tile has the layer's aspect
       ratio (tile wide, 1.15 × card tall), so the noise isn't squashed when stretched.
       Not tied to the exact pixel width, so a width change never rebuilds the scene */
    const TW = 1024;
    const TH = Math.max(64, Math.min(1536, Math.round(TW * (1.15 * (box.clientHeight || 300)) / S.tileW)));
    if (cover) {
      /* far layer: large soft masses, slow; near layer: smaller, sharper, faster;
         overcast adds a third dense sheet behind both. Night clouds are dimmer */
      const dim = night ? 0.7 : 1;
      const layers = cover === 1
        ? [{ seed: 3, d: 0, sc: 1.0, a: 0.32, t: 0.9 }, { seed: 7, d: 0, sc: 1.6, a: 0.26, t: 0.6 }]
        : cover === 2
        ? [{ seed: 3, d: 1, sc: 0.9, a: 0.3, t: 1.0 }, { seed: 11, d: 0, sc: 1.6, a: 0.26, t: 0.6 }]
        : [{ seed: 5, d: 1, sc: 0.7, a: 0.3, t: 1.4 }, { seed: 3, d: 1, sc: 1.0, a: 0.3, t: 1.0 }, { seed: 11, d: 1, sc: 1.7, a: 0.24, t: 0.6 }];
      layers.forEach((ly, i) => {
        const el = L.el('i', 'wx-cloudlayer', scn);
        el.style.backgroundImage = L.cloudTex(ly.seed, ly.d, ly.sc, TW, TH);
        el.style.setProperty('--a', (ly.a * dim * cloudFade).toFixed(2));
        el.style.top = (-15 + i * 8) + '%';
        if (an.clouds) el.__drift = L.anim(el, [{ transform: 'translate3d(-' + S.tileW + 'px,0,0)' }, { transform: 'translate3d(0,0,0)' }], dur * ly.t, -r() * dur * ly.t, 'linear', toLeftEff);
      });
    }
    /* What falls is decided by the measured rates first, the provider's type second and
       the condition word last: "lightning" says nothing about rain, and a cloudy state
       that is actually drizzling should still show drops. Each type is drawn in its own
       right, so rain and snow together give both. */
    const haveRates = wet.rain != null || wet.snow != null || wet.ice != null;
    /* one batch of particles: kind is rain | pour | snow | mix, rt the rate driving how
       many and how fast (null keeps the condition's own fixed density) */
    const fall = (kind, rt, hail) => {
      if (kind === 'snow' || kind === 'mix' ? !an.snow : !an.rain) return;
      const base = kind === 'pour' ? 55 : kind === 'snow' ? 30 : kind === 'mix' ? 40 : 32;
      const heavy = rt != null ? Math.min(1.8, Math.sqrt(Math.min(rt, 12) / 2.5)) : null;
      const cnt = rt != null ? Math.max(6, Math.round(base * 0.35 + base * 0.9 * heavy)) : base;
      for (let i = 0; i < cnt; i++) {
        /* sleet: alternate wet flakes and sparse drops */
        const flake = kind === 'snow' || (kind === 'mix' && i % 2 === 0);
        const d = L.el('i', flake ? 'wx-flake' : 'wx-drop', scn);
        if (hail) d.classList.add('hail');
        if (kind === 'mix' && flake) d.classList.add('wet');
        d.style.left = (toLeftEff ? 8 + r() * 100 : r() * 100 - 8) + '%';
        let dd = flake ? (kind === 'mix' ? 5 + r() * 4 : 8 + r() * 7) : kind === 'pour' ? 0.6 + r() * 0.3 : 1 + r() * 0.6;
        /* heavier precipitation falls faster, to about half the drizzle's crossing time */
        if (heavy != null) dd = dd / (0.75 + 0.45 * heavy);
        /* wind from the SE blows rain toward the NW: streaks lean and drift left.
           skewX(-θ) puts the bottom of the streak to the left; the horizontal drift
           over the fall matches the lean (tan 12° ≈ 0.21) */
        const fallPx = Math.round((box.clientHeight || 300) * 1.3), sway = Math.round(r() * 40 - 20);
        const dir = toLeftEff ? -1 : 1, lean = 12 * dir, driftPx = Math.round(fallPx * 0.21) * dir;
        if (flake) L.anim(d, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(' + (sway + driftPx / 2) + 'px,' + Math.round(fallPx / 2) + 'px,0)' }, { transform: 'translate3d(' + driftPx + 'px,' + fallPx + 'px,0)' }], dd, -r() * 10);
        else L.anim(d, [{ transform: 'translate3d(0,0,0) skewX(' + lean + 'deg)' }, { transform: 'translate3d(' + driftPx + 'px,' + fallPx + 'px,0) skewX(' + lean + 'deg)' }], dd, -r() * 10);
        d.style.opacity = (flake ? 0.6 + r() * 0.4 : 0.3 + r() * 0.35).toFixed(2);
      }
    };
    const hailNow = /hail/.test(c);
    if (rateMax > 0) {
      const known = /^(rain|snow|sleet)$/.test(ptype) ? ptype : '';
      if (known === 'snow') fall('snow', Math.max(wet.snow || 0, rateMax), false);
      else if (known === 'sleet') fall('mix', Math.max(wet.ice || 0, rateMax), false);
      else if (known === 'rain') fall((wet.rain || rateMax) >= 7.5 ? 'pour' : 'rain', wet.rain || rateMax, hailNow);
      else {
        /* no usable type: draw whatever each rate reports, so a rain-and-snow mix shows both */
        if ((wet.rain || 0) > 0) fall(wet.rain >= 7.5 ? 'pour' : 'rain', wet.rain, hailNow);
        if ((wet.snow || 0) > 0) fall('snow', wet.snow, false);
        if ((wet.ice || 0) > 0) fall('mix', wet.ice, false);
      }
    } else if (!haveRates) {
      /* no rate sensors at all: the condition decides, at its own fixed density */
      const k = L.kind(c);
      if (k) fall(k, null, hailNow);
    } else if (hailNow) fall('rain', null, true);   /* measured dry, but the state says hail */
    if (/fog/.test(c)) {
      /* a veil over the whole card, densest at the bottom like ground fog, plus two
         very slow, low-contrast haze layers drifting through it */
      const haze = L.el('i', 'wx-haze', scn);
      if (!an.fog) haze.style.animation = 'none';
      /* three banks of fog: big slow masses, mid, and a finer faster one low down */
      [{ seed: 21, sc: 1.0, a: 0.38, t: 1.8, top: -5 }, { seed: 33, sc: 1.8, a: 0.32, t: 1.1, top: 8 }, { seed: 47, sc: 3.0, a: 0.28, t: 0.7, top: 20 }].forEach((ly) => {
        const el = L.el('i', 'wx-cloudlayer wx-hazelayer', scn);
        el.style.backgroundImage = L.cloudTex(ly.seed, 3, ly.sc, TW, TH, 2.5, 1.9, 'top');
        el.style.setProperty('--a', (ly.a * (night ? 0.7 : 1)).toFixed(2));
        el.style.top = ly.top + '%';
        const d = Math.max(30, dur * ly.t);
        if (an.fog) el.__drift = L.anim(el, [{ transform: 'translate3d(-' + S.tileW + 'px,0,0)' }, { transform: 'translate3d(0,0,0)' }], d, -r() * d, 'linear', toLeftEff);
      });
    }
    /* lightning with a thunderstorm now (overhead) or forecast within two hours (far
       off); the debug Storm knob can still force it over any scene */
    const dbgKm = dbg && S.dbgStorm != null ? S.dbgStorm : null;
    const stormKm2 = dbgKm != null ? dbgKm : thunderNow ? 0 : 25;
    if (an.lightning && (thunderNow || thunderSoon || (dbgKm != null && dbgKm <= 30))) {
      /* strikes are scheduled, not looped: each one lands somewhere new with its own
         flicker; four in five are distant (sky flash only): a bolt about every 30 s */
      const flash = L.el('i', 'wx-flash', scn);
      const bolt = L.el('i', 'wx-bolt', scn);
      const strike = () => {
        if (!scn.contains(bolt)) return;          /* scene was rebuilt */
        /* a storm overhead flashes often and shows its bolts; a distant one rumbles rarely */
        const km2 = stormKm2;
        const near = km2 == null ? 0.5 : Math.max(0, Math.min(1, (40 - km2) / 40));
        const far = Math.random() > 0.1 + 0.35 * near;
        const k = (0.35 + Math.random() * 0.45) * (0.6 + 0.6 * near);   /* brightness of this strike */
        /* where in the sky this strike lights up: behind the bolt, or anywhere for a distant one */
        const cx = 10 + Math.random() * 80;
        flash.style.background = 'radial-gradient(ellipse ' + (40 + Math.random() * 40) + '% ' + (50 + Math.random() * 40) + '% at ' + cx.toFixed(0) + '% 0%, rgba(255,255,255,0.95), rgba(220,230,255,0.55) 45%, rgba(255,255,255,0) 80%)';
        flash.animate([{ opacity: 0 }, { opacity: 0.7 * k, offset: 0.08 }, { opacity: 0.1 * k, offset: 0.2 }, { opacity: 0.5 * k, offset: 0.32 }, { opacity: 0.15 * k, offset: 0.5 }, { opacity: 0 }], { duration: 700 + Math.random() * 400, easing: 'linear' });
        if (!far) {
          bolt.style.left = cx + '%';
          bolt.style.height = (30 + Math.random() * 25) + 'cqh';
          bolt.style.transform = 'rotate(' + (Math.random() * 16 - 8).toFixed(1) + 'deg) scaleX(' + (Math.random() < 0.5 ? -1 : 1) + ')';
          bolt.animate([{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.3, offset: 0.35 }, { opacity: 0.9, offset: 0.5 }, { opacity: 0 }], { duration: 380 + Math.random() * 200, easing: 'linear' });
        }
        S.boltT = setTimeout(strike, (2000 + Math.random() * 4000) + (1 - near) * (3000 + Math.random() * 6000));
      };
      clearTimeout(S.boltT);
      S.boltT = setTimeout(strike, 800 + Math.random() * 2500);
    } else clearTimeout(S.boltT);
  };

  /* ---- debug: step through every background effect with arrows (debug: true) ---- */
  const dbgList = [
    { c: 'sunny', n: false }, { c: 'clear-night', n: true }, { c: 'partlycloudy', n: false }, { c: 'partlycloudy-night', n: true },
    { c: 'cloudy', n: false }, { c: 'cloudy', n: true }, { c: 'fog', n: false }, { c: 'rainy', n: false }, { c: 'pouring', n: true },
    { c: 'lightning', n: true }, { c: 'lightning-rainy', n: true }, { c: 'snowy', n: false }, { c: 'snowy-rainy', n: true },
    { c: 'hail', n: false }, { c: 'windy', n: false }, { c: 'exceptional', n: false }
  ];
  S.dbgShow = () => {
    const d = dbgList[S.dbgIdx];
    S.dbgText.textContent = (S.dbgIdx + 1) + '/' + dbgList.length + ' · ' + d.c + (d.n ? ' · night' : ' · day');
    /* a knob showing the live reading is dimmed; once stepped it holds its own value */
    const pcx = cfg.precipitation || {};
    const nz = (id) => { const e2 = id && hass.states[id]; const v2 = e2 && Number(e2.state); return isFinite(v2) ? v2 : null; };
    const live = { rain: nz(pcx.rain), snow: nz(pcx.snow), ice: nz(pcx.ice), wind: kmh, dir: toLeft ? 'E' : 'W', cloud: nz(cfg.cloud_entity), storm: S.stormKm };
    (S.dbgKnobs || []).forEach((kn) => {
      if (!kn.el) return;
      const v2 = kn.vals[kn.i], set = v2 != null;
      kn.el.textContent = (kn.label ? kn.label + ': ' : '') + kn.fmt(set ? v2 : live[kn.src]);
      kn.el.classList.toggle('live', !set);
    });
    S.apply(d.c, d.n);
  };
  if (cfg.debug) {
    if (S.dbgIdx == null) S.dbgIdx = 0;
    if (!S.dbgBar) {
      /* one panel laid over the bottom of the card, so the controls never fight the
         header, chips or summary for space */
      S.dbgPanel = L.el('div', 'wx-debug-panel', box);
      S.dbgBar = L.el('div', 'wx-debug', S.dbgPanel);
      const mk = (dir) => {
        const b = L.el('button', 'wx-debug-btn', S.dbgBar);
        const ic = document.createElement('ha-icon'); ic.icon = dir < 0 ? 'mdi:chevron-left' : 'mdi:chevron-right'; b.appendChild(ic);
        b.addEventListener('click', (e) => { e.stopPropagation(); S.dbgIdx = (S.dbgIdx + dir + dbgList.length) % dbgList.length; S.dbgShow(); });
        return b;
      };
      mk(-1);
      S.dbgText = L.el('span', 'wx-debug-text', S.dbgBar);
      /* hold the width of the longest label so the pill never resizes while stepping */
      const widest = dbgList.reduce((m, d, i) => Math.max(m, ((i + 1) + '/' + dbgList.length + ' · ' + d.c + (d.n ? ' · night' : ' · day')).length), 0);
      S.dbgText.style.minWidth = widest + 'ch';
      mk(1);
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => S.dbgBar.addEventListener(ev, (e) => e.stopPropagation()));
      /* knobs: tap one to step it through its values and watch the scene react.
         "auto" hands that input back to the sensors. */
      /* each knob starts on the live reading and steps through fixed values from there */
      const rateF = (v) => v == null ? '–' : v === 0 ? 'none' : (Math.round(fromBase(v) * 100) / 100) + ' ' + precipU + '/h';
      S.dbgKnobs = [
        { key: 'dbgRain', src: 'rain', label: 'Rain', vals: [null, 0, 0.2, 1, 2.5, 7.5, 15], fmt: rateF },
        { key: 'dbgSnow', src: 'snow', label: 'Snow', vals: [null, 0, 0.2, 1, 2.5, 7.5, 15], fmt: rateF },
        { key: 'dbgIce', src: 'ice', label: 'Sleet', vals: [null, 0, 0.2, 1, 2.5, 7.5], fmt: rateF },
        { key: 'dbgWind', src: 'wind', label: 'Wind', vals: [null, 0, 10, 25, 45, 70], fmt: (v) => v == null ? '–' : Math.round(v / wPer) + ' ' + wu },
        { key: 'dbgDir', src: 'dir', label: '', vals: [null, 'W', 'E'], fmt: (v) => v === 'E' ? '⇠ drift' : v === 'W' ? 'drift ⇢' : '–' },
        { key: 'dbgCloud', src: 'cloud', label: 'Cloud', vals: [null, 0, 20, 50, 80, 100], fmt: (v) => v == null ? '–' : Math.round(v) + '%' },
        { key: 'dbgStorm', src: 'storm', label: 'Storm', vals: [null, 3, 10, 25, 60], fmt: (v) => v == null ? 'none' : Math.round(v) + ' km' }
      ];
      S.dbgOpts = L.el('div', 'wx-debug-opts', S.dbgPanel);
      S.dbgKnobs.forEach((kn) => {
        kn.i = 0;
        kn.el = L.el('button', 'wx-debug-knob', S.dbgOpts);
        kn.el.addEventListener('click', (e) => {
          e.stopPropagation();
          kn.i = (kn.i + 1) % kn.vals.length;
          S[kn.key] = kn.vals[kn.i];
          S.sceneKey = null;                /* force a full rebuild, not a no-op */
          S.pal = null; S.sunApplied = null;
          if (S.bg) S.bg.innerHTML = '';
          S.dbgShow();
        });
      });
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => S.dbgOpts.addEventListener(ev, (e) => e.stopPropagation()));
    }
    S.dbgShow();
  } else {
    if (S.dbgPanel) { S.dbgPanel.remove(); S.dbgPanel = null; }
    S.dbgBar = null; S.dbgText = null; S.dbgOpts = null; S.dbgKnobs = null;
    S.dbgRain = S.dbgSnow = S.dbgIce = S.dbgWind = S.dbgDir = S.dbgCloud = S.dbgStorm = null;
    S.apply(cond, nightNow);
  }

  /* ---- forecast subscriptions: the strip's type always; hourly lazily on first tap ---- */
  const subscribe = (ftype, slot) => {
    const k = entity + '|' + ftype;
    if (S[slot + 'Key'] === k) return;
    S[slot + 'Key'] = k; S[slot] = null; S.sig = null;
    if (S[slot + 'Unsub']) { S[slot + 'Unsub'].then((u) => u()).catch(() => {}); S[slot + 'Unsub'] = null; }
    const p = S[slot + 'Unsub'] = hass.connection.subscribeMessage((m) => {
      if (!card.isConnected) { p.then((u) => u()).catch(() => {}); S[slot + 'Unsub'] = null; S[slot + 'Key'] = null; return; }
      S[slot] = (m && m.forecast) || []; S.sig = null; if (S.draw) S.draw();
    }, { type: 'weather/subscribe_forecast', entity_id: entity, forecast_type: ftype });
    p.catch(() => { S[slot + 'Unsub'] = null; S[slot + 'Key'] = null; });
  };
  subscribe(type, 'items');
  /* today's temperature history, so the hourly chart's past half is ready on first tap */
  if (cfg.temperature_entity) dayHistory(cfg.temperature_entity, 'tHist');
  if (cfg.icon_entity) dayHistory(cfg.icon_entity, 'iHist', true);

  /* ---- the line under the headline: the provider's near-term wording, in place of
     the card's name (falls back to the name when the sensor has nothing) ---- */
  if (S.sub) {
    const be = cfg.subtitle_entity && hass.states[cfg.subtitle_entity];
    /* shown as a caption, so without the provider's closing full stop */
    const txt = be && !/^(unknown|unavailable|none)$/i.test(be.state) ? String(be.state).trim().replace(/\.+$/, '') : '';
    if (S.sub.textContent !== txt) S.sub.textContent = txt;
    box.classList.toggle('wx-has-sub', !!txt);
  }

  /* ---- the two summary lines under the chips: today's hours, then the week ---- */
  {
    const read = (id) => {
      const e2 = id && hass.states[id];
      return e2 && !/^(unknown|unavailable|none)$/i.test(e2.state) ? String(e2.state).trim() : '';
    };
    /* both sentences run together on one line, near-term first */
    const parts = [read(cfg.hourly_summary_entity), read(cfg.summary_entity)].filter(Boolean);
    const txt = parts.join(' ');
    if (S.summary && S.summary.textContent !== txt) S.summary.textContent = txt;
  }

  /* ---- headline: the provider's own wording ("Mainly Sunny") when a sensor is given ---- */
  if (S.cond) {
    const ce = cfg.condition_entity && hass.states[cfg.condition_entity];
    const txt = ce && !/^(unknown|unavailable|none)$/i.test(ce.state) ? String(ce.state) : '';
    if (S.condText.textContent !== txt) S.condText.textContent = txt;
    box.classList.toggle('wx-has-cond', !!txt);
    /* pressure trend over the last three hours: the classic "change is coming" signal */
    if (cfg.pressure_entity) {
      dayHistory(cfg.pressure_entity, 'prHist');
      const pe = hass.states[cfg.pressure_entity];
      const nowP = pe ? Number(pe.state) : NaN;
      const past = ((S.prHist && S.prHist.pts) || []).filter((p) => p[0] <= Date.now() - 3 * 36e5).pop();
      let mark = '', tip = '';
      if (isFinite(nowP) && past) {
        const d2 = nowP - past[1];
        if (d2 >= 1) { mark = '↑'; tip = 'Pressure rising ' + d2.toFixed(1) + ' over 3 h'; }
        else if (d2 <= -1) { mark = '↓'; tip = 'Pressure falling ' + Math.abs(d2).toFixed(1) + ' over 3 h'; }
      }
      if (S.trend.textContent !== mark) { S.trend.textContent = mark; S.trend.title = tip; }
      S.trend.classList.toggle('down', mark === '↓');
    }
  }

  /* ---- header temperature: actual, or "feels like" when apparent_temperature is on
     (true = the weather entity's attribute, or a sensor id). Falls back to the actual
     reading whenever the apparent one is missing ---- */
  let tv = Number(a.temperature), feels = false;
  if (cfg.apparent_temperature) {
    const av = typeof cfg.apparent_temperature === 'string'
      ? (hass.states[cfg.apparent_temperature] ? Number(hass.states[cfg.apparent_temperature].state) : NaN)
      : Number(a.apparent_temperature);
    if (isFinite(av)) { tv = av; feels = true; }
  }
  const tNow = isNaN(tv) ? '–' : (Math.abs(tv - Math.round(tv)) > 0.049 ? tv.toFixed(1) : String(Math.round(tv))) + '°';
  if (S.temp.textContent !== tNow) S.temp.textContent = tNow;
  if (S.now) S.now.classList.toggle('wx-feels', feels);

  /* ---- detail chips: UV, air quality, wind ---- */
  {
    const dcfg = cfg.details || {};
    const chips = [];
    const band = (v, edges, cols) => { for (let i = 0; i < edges.length; i++) if (v <= edges[i]) return cols[i]; return cols[cols.length - 1]; };
    /* the chip colours: green, yellow, orange, red, purple, maroon */
    const cols = ['95,125,56', '142,120,45', '141,89,53', '140,64,64', '97,73,108', '97,70,78'];
    const num = (id) => { const e = id && hass.states[id]; const v = e && Number(e.state); return e && isFinite(v) ? v : null; };
    if (dcfg.uv) {
      const v = num(dcfg.uv);
      if (v != null) S.uvNow = v;
      if (v != null) chips.push({ ent: dcfg.uv, view: 'uv', icon: 'mdi:white-balance-sunny', label: 'UV', value: Math.round(v),
        note: band(v, [2, 5, 7, 10], ['Low', 'Moderate', 'High', 'Very high', 'Extreme']), col: band(v, [2, 5, 7, 10], [cols[0], cols[1], cols[2], cols[3], cols[4]]) });
    }
    if (dcfg.aqi) {
      const v = num(dcfg.aqi);
      if (v != null) {
        S.aqiNow = v;
        chips.push({ ent: dcfg.aqi, view: 'aqi', icon: 'mdi:air-filter', label: aqiScale.name, value: Math.round(v),
          note: aqiLabel(v), col: aqiBandOf(v)[2] });
      }
    }
    if (dcfg.humidity || dcfg.dew_point) {
      let v = typeof dcfg.humidity === 'string' ? num(dcfg.humidity) : Number(a.humidity), ent = typeof dcfg.humidity === 'string' ? dcfg.humidity : entity;
      if (v != null && isFinite(v)) S.humNow = v;
      /* dew point: its own sensor, else the weather entity's, else worked out from the
         current temperature and humidity */
      let dv = dewSensor() ? num(dewSensor()) : null;
      if (dv == null && a.dew_point != null && isFinite(Number(a.dew_point))) dv = Number(a.dew_point);
      if (dv == null && S.humNow != null) dv = dewFrom(a.temperature, S.humNow);
      S.dewNow = dv;
      if (dv != null) {
        chips.push({ ent: dewSensor() || ent, view: 'dew', icon: 'mdi:water-thermometer', label: 'Dew point', value: L.t(dv),
          note: dewLabel(dv), col: [cols[5], cols[0], cols[1], cols[2], cols[3]][dewBandIx(Math.round(dv))] });
      }
    }
    if (dcfg.wind) {
      let v, u = a.wind_speed_unit || us.wind_speed || 'km/h', ent = entity, br = Number(a.wind_bearing);
      if (typeof dcfg.wind === 'string') { const e = hass.states[dcfg.wind]; v = e ? Number(e.state) : NaN; u = (e && e.attributes.unit_of_measurement) || u; ent = dcfg.wind; }
      else v = Number(a.wind_speed);
      if (isFinite(v)) {
        const k = u === 'm/s' ? v * 3.6 : u === 'mph' ? v * 1.609 : u === 'kn' ? v * 1.852 : v;
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const dir = isFinite(br) ? dirs[Math.round(((br % 360) + 360) % 360 / 45) % 8] : '';
        let gust = null, gu = u;
        if (dcfg.gust && hass.states[dcfg.gust]) { const g = Number(hass.states[dcfg.gust].state); if (isFinite(g)) { gust = g; gu = hass.states[dcfg.gust].attributes.unit_of_measurement || u; } }
        else if (a.wind_gust_speed != null) gust = Number(a.wind_gust_speed);
        S.windNow = { v: v, u: u, dir: dir, gust: null };
        if (gust != null && isFinite(gust)) S.windNow.gust = gust;
        chips.push({ ent: ent, view: 'wind', icon: 'mdi:weather-windy', label: 'Wind', value: Math.round(v) + ' ' + u + (dir ? ' ' + dir : ''),
          note: gust != null && isFinite(gust) && gust > v ? 'Gusts ' + Math.round(gust) + (gu !== u ? ' ' + gu : '') : '',
          col: band(k, [10, 20, 30, 40, 50], cols) });
      }
    }
    if (dcfg.sun !== false) {
      const T = sunTimes();
      if (T && T.rise && T.set) {
        const now = Date.now();
        const nextIsSet = now >= T.rise && now < T.set;
        const t = nextIsSet ? T.set : (now < T.rise ? T.rise : T.rise + 864e5);
        chips.push({ ent: null, view: 'sun', icon: nextIsSet ? 'mdi:weather-sunset-down' : 'mdi:weather-sunset-up', label: nextIsSet ? 'Sunset' : 'Sunrise',
          value: fmtTime(t), note: nextIsSet ? 'Sunset' : 'Sunrise', col: '70,80,110' });
      }
    }
    /* sunlight on the ground: the last chip */
    if (dcfg.solar) {
      const v = num(dcfg.solar);
      if (v != null) S.solarNow = v;
      if (v != null) chips.push({ ent: dcfg.solar, view: 'solar', icon: 'mdi:solar-power-variant', label: 'Solar', value: Math.round(v) + ' W/m²',
        note: v < 5 ? 'None' : band(v, [100, 300, 600], ['Dim', 'Moderate', 'Strong', 'Very strong']),
        col: v < 5 ? '70,80,110' : band(v, [100, 300, 600], [cols[4], cols[1], cols[2], cols[3]]) });
    }
    /* show_chips decides which chips appear: each is on unless set false, except solar,
       which is off unless set true. Values are still read either way, since the charts
       and the scene use them. */
    const shownC = Object.assign({ uv: true, aqi: true, dew_point: true, wind: true, solar: false, sun: true }, cfg.show_chips || {});
    const chipKeyOf = { dew: 'dew_point' };
    for (let i = chips.length - 1; i >= 0; i--) { const k2 = chipKeyOf[chips[i].view] || chips[i].view; if (!shownC[k2]) chips.splice(i, 1); }
    const dkey = chips.map((c) => c.ent + c.value + c.note + c.col).join(';');
    if (S.detailKey !== dkey) {
      S.detailKey = dkey;
      S.details.innerHTML = '';
      S.details.style.display = chips.length ? '' : 'none';
      chips.forEach((c) => {
        const el = L.el('div', 'wx-chip', S.details);
        if (c.ent) el.dataset.entity = c.ent;
        if (c.view) el.dataset.view = c.view;
        el.style.setProperty('--chip', c.col);
        const ic = document.createElement('ha-icon'); ic.icon = c.icon; el.appendChild(ic);
        L.el('span', 'wx-chip-label', el).textContent = c.label;
        L.el('span', 'wx-chip-value', el).textContent = c.value;
        if (c.note) L.el('span', 'wx-chip-note', el).textContent = c.note;
      });
      requestAnimationFrame(() => S.edge && S.edge());
    }
  }

  /* ---- weather alert banner (alerts_entity: a warnings sensor whose state is the
     alert count, with the headlines in alert_1, alert_2, ... attributes) ---- */
  {
    const ae = cfg.alerts_entity, as = ae && hass.states[ae];
    S.alertEntity = ae || null;
    let heads = [];
    if (as) {
      const at = as.attributes || {};
      /* Environment Canada: alert_1, alert_2 … ; Pirate Weather: an alerts array
         of objects carrying a title / event / headline */
      heads = Object.keys(at).filter((k) => /^alert_\d+$/.test(k)).sort((x, y) => Number(x.slice(6)) - Number(y.slice(6))).map((k) => String(at[k]));
      if (!heads.length) {
        /* Pirate Weather (and others) put the alerts in an attribute holding objects or
           strings; take the first attribute that looks like that, whatever it is called */
        const pick = (o) => typeof o === 'string' ? o : String((o && (o.title || o.event || o.headline || o.Event || o.description)) || '');
        const arr = at.alerts || at.Alerts || at.alert;
        let src = arr;
        if (!src) Object.keys(at).forEach((k) => { if (!src && Array.isArray(at[k]) && at[k].length && /alert|warning|watch/i.test(k)) src = at[k]; });
        if (Array.isArray(src)) heads = src.map(pick);
        else if (src && typeof src === 'object') heads = [pick(src)];
      }
      heads = heads.filter((v) => v && !/^(unknown|unavailable|none)$/i.test(v));
      /* sensors that put the headline in the state itself */
      if (!heads.length && as.state && isNaN(Number(as.state)) && !/^(unknown|unavailable|none|off)$/i.test(as.state)) heads = [as.state];
      if (Number(as.state) === 0) heads = [];
    }
    if (cfg.debug && !heads.length) heads = ['Heat Warning (sample)'];
    const key = heads.join('|');
    if (S.alertKey !== key) {
      S.alertKey = key;
                  /* fade in only when an alert starts while the card is already showing;
         one present at load simply renders in place */
      const appearing = heads.length > 0 && S.alertKey !== undefined && S.alertSeen;
      S.alert.classList.toggle('on', heads.length > 0);
      if (appearing && !(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) S.alert.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
      S.alertSeen = true;
      S.alertText.textContent = heads[0] || '';
      S.alertMore.textContent = heads.length > 1 ? '+' + (heads.length - 1) : '';
      box.classList.toggle('wx-alerting', heads.length > 0);
    }
  }

  /* ---- fade the strip's edges while items are hidden that way ---- */
  /* chip row: drop detail until every chip fits on one line (measured against the
     card, not the viewport): full → no descriptions → closer together → smaller text
     and icons → scroll. Closer together comes before smaller, so a row a few pixels
     short of fitting keeps its size. */
  S.fitChips = () => {
    const d = S.details;
    if (!d || d.style.display === 'none') return;
    const fits = () => d.scrollWidth <= d.clientWidth + 1;
    d.classList.remove('wx-tight', 'wx-snug', 'wx-tighter');
    if (fits()) return;
    d.classList.add('wx-tight');
    if (fits()) return;
    d.classList.add('wx-snug');
    if (fits()) return;
    d.classList.add('wx-tighter');
  };
  S.tile = () => {
    const w = Math.ceil(box.clientWidth || 0);
    if (!w) return;
    if (!S.tileW) {
      /* first measurement: set it and build the scene */
      S.tileW = w; S.bg.style.setProperty('--tile', w + 'px');
      if (S.apply && S.lastScene) { S.sceneKey = null; S.apply(S.lastScene[0], S.lastScene[1]); }
      return;
    }
    /* later changes (scrollbar toggling, resize): ignore the tiny ones, debounce the rest;
       the scene keeps running, only the scroll distance adjusts */
    if (Math.abs(w - S.tileW) < 8) return;
    clearTimeout(S.tileT);
    S.tileT = setTimeout(() => {
      const w2 = Math.ceil(box.clientWidth || 0);
      if (!w2 || Math.abs(w2 - S.tileW) < 8) return;
      S.tileW = w2; S.bg.style.setProperty('--tile', w2 + 'px');
      /* running drifts keep their phase; only the distance changes */
      S.bg.querySelectorAll('.wx-cloudlayer').forEach((el) => { if (el.__drift && el.__drift.effect && el.__drift.effect.setKeyframes) el.__drift.effect.setKeyframes([{ transform: 'translate3d(-' + w2 + 'px,0,0)' }, { transform: 'translate3d(0,0,0)' }]); });
    }, 300);
  };
  S.edge = (fromScroll) => {
    if (!fromScroll) S.tile();
    /* with max_items: fit, a width change can mean a different number of days */
    if (!fromScroll && String(cfg.max_items).toLowerCase() === 'fit' && !S.view && S.draw && !S.swapping) {
      const minW2 = Number(cfg.min_item_width) || 64;
      const n2 = Math.max(1, Math.floor(((S.fc.clientWidth || 0) - 20) / (minW2 + 4)));
      if (S.fitN && n2 !== S.fitN) { S.sig = null; S.draw(); }
    }
    if (S.fitChips && !fromScroll) S.fitChips();
    if (S.view && (S.view.sun || S.view.wind || S.view.aqi || S.view.dew || S.view.uv || S.view.solar) && S.draw && !S.swapping) {
      const w = Math.max(120, S.fc.clientWidth - 24 || box.clientWidth - 48);
      if (w !== S.sunW) { S.sig = null; S.draw(); }
    }
    if (S.details) S.details.classList.toggle('wx-end', S.details.scrollWidth - S.details.clientWidth - S.details.scrollLeft <= 4);
    const fc = S.fc;
    fc.classList.toggle('wx-more', fc.scrollWidth - fc.clientWidth - fc.scrollLeft > 4);
    fc.classList.toggle('wx-before', fc.scrollLeft > 12);
  };

  /* ---- forecast strip (days, or the hours of a tapped day) ---- */
  S.draw = () => {
    /* History is cached by how many days back it is, and the earliest day with any
       recording is kept the same way. Both are relative to today, so on a tablet that
       stays up past midnight they quietly describe the wrong days — the floor set when
       recording began kept shrinking the reach of the back arrow as days rolled on.
       When the date changes, drop them all and let them be fetched again. */
    const rollKey = L.dkey(new Date());
    if (S.dayKey && S.dayKey !== rollKey) {
      S.histFloors = {};
      Object.keys(S).forEach((k2) => { if (/_-\d+(Busy)?$/.test(k2)) delete S[k2]; });
      S.sig = null;
    }
    S.dayKey = rollKey;
    subscribe('hourly', 'hours');   /* the background's thunder reads the next hours */
    const fc = S.fc, head = S.fcHead;
    if (cfg.hide_forecast) { S.fcWrap.style.display = 'none'; return; }
    S.fcWrap.style.display = '';
    /* how long an open view — a day's hours, a chip's chart, the sun — stays up without
       being touched */
    const back = Number(cfg.return_home_after != null ? cfg.return_home_after : 45) || 0;
    S.backSecs = back;
    if (S.view && back > 0 && Date.now() - S.view.at > back * 1000) { S.view = null; S.sig = null; }
    /* one timer per open view: re-armed when the view changes, cleared when it closes */
    if (S.view && back > 0 && S.backFor !== S.view) {
      if (S.backTimer) clearTimeout(S.backTimer);
      S.backFor = S.view;
      S.backTimer = setTimeout(() => { S.backTimer = null; S.backFor = null; if (S.draw) S.draw(); }, Math.max(200, back * 1000 - (Date.now() - S.view.at) + 200));
    } else if (!S.view && S.backTimer) { clearTimeout(S.backTimer); S.backTimer = null; S.backFor = null; }
    const sunView = !!(S.view && S.view.sun);
    const windView = !!(S.view && S.view.wind);
    const aqiView = !!(S.view && S.view.aqi);
    const dewView = !!(S.view && S.view.dew);
    const uvView = !!(S.view && S.view.uv);
    const solView = !!(S.view && S.view.solar);
    const hourly = !!S.view && !sunView && !windView && !aqiView && !dewView && !uvView && !solView;
    let list, sig;
    /* which day the hourly view is on, and the one before it (for the arrows) */
    let hrOff = 0, hrPrev = -1;
    if (hourly && S.view.day) {
      const dk0 = S.view.day.split('-').map(Number);
      hrOff = Math.round((new Date(dk0[0], dk0[1], dk0[2]).getTime() - dayStartOf(0)) / 864e5);
      hrPrev = Math.min(0, hrOff) - 1;
    }
    if (solView) {
      const offS0 = Math.min(0, S.view.off || 0);
      dayHistory((cfg.details || {}).solar, 'sHist', false, offS0);
      dayHistory((cfg.details || {}).solar, 'sHist', false, offS0 - 1);
      list = [1];
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 'o|' + offS0 + '|' + ((histOf('sHist', offS0) || {}).at || 0) + '|' + ((histOf('sHist', offS0 - 1) || {}).at || 0) + '|' + S.solarNow + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (uvView) {
      subscribe('hourly', 'hours');
      const offU0 = (S.view.off || 0) <= 0 ? (S.view.off || 0) : 0;
      dayHistory((cfg.details || {}).uv, 'uHist', false, offU0);
      dayHistory((cfg.details || {}).uv, 'uHist', false, offU0 - 1);
      list = [1];
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 'v|' + (S.view.off || 0) + '|' + ((histOf('uHist', S.view.off) || {}).at || 0) + '|' + ((histOf('uHist', offU0 - 1) || {}).at || 0) + '|' + ((S.hours || []).length) + '|' + S.uvNow + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (dewView) {
      subscribe('hourly', 'hours');
      const offD0 = (S.view.off || 0) <= 0 ? (S.view.off || 0) : 0;
      dewHistory(offD0); dewHistory(offD0 - 1);
      dayHistory((cfg.details || {}).humidity, 'hHist', false, offD0);   /* for the readout */
      list = [1];
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 'p|' + (S.view.off || 0) + '|' + ((histOf('dHist', S.view.off) || {}).at || 0) + '|' + ((histOf('dHist', offD0 - 1) || {}).at || 0) + '|' + ((histOf('hHist', offD0) || {}).at || 0) + '|' + ((S.hours || []).length) + '|' + S.dewNow + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (aqiView) {
      const offA0 = Math.min(0, S.view.off || 0), aId = (cfg.details || {}).aqi, smId = (cfg.details || {}).smoke;
      dayHistory(aId, 'aHist', false, offA0); dayHistory(aId, 'aHist', false, offA0 - 1);
      dayHistory(smId, 'smHist', false, offA0);
      list = [1];
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 'a|' + offA0 + '|' + ((histOf('aHist', offA0) || {}).at || 0) + '|' + ((histOf('aHist', offA0 - 1) || {}).at || 0) + '|' + ((histOf('smHist', offA0) || {}).at || 0) + '|' + S.aqiNow + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (windView) {
      subscribe('hourly', 'hours');
      const offW0 = (S.view.off || 0) <= 0 ? (S.view.off || 0) : 0;
      windHistory(offW0);
      windHistory(offW0 - 1);
      list = [1];
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 'w|' + (S.view.off || 0) + '|' + (((((S.view.off || 0) === 0 ? S.wHist : S['wHist_' + S.view.off]) || {}).at) || 0) + '|' + ((histOf('wHist', offW0 - 1) || {}).at || 0) + '|' + ((S.hours || []).length) + '|' + (S.windNow ? S.windNow.v + '/' + S.windNow.gust : '') + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (sunView) {
      const offS0 = S.view.off || 0;
      const T = offS0 ? sunCalc(offS0) : (sunTimes() || sunCalc(0));
      list = T ? [T] : [];
      /* fill the card: everything below the header row minus the Back line and the times row */
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 110; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      sig = 's|' + offS0 + '|' + (T ? [T.dawn, T.rise, T.set, T.dusk].join(',') : '') + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else if (hourly) {
      subscribe('hourly', 'hours');
      const back0 = Math.min(0, hrOff);
      /* whichever day is open, plus the one before it so the arrow state is known */
      dayHistory(cfg.temperature_entity, 'tHist', false, back0);
      dayHistory(cfg.icon_entity, 'iHist', true, back0);
      dayHistory((cfg.details || {}).rain_today, 'rHist', false, back0);
      if (back0 < 0) dayHistory((cfg.details || {}).snow_today, 'snHist', false, back0);
      [(cfg.precipitation || {}).rain, (cfg.precipitation || {}).snow, (cfg.precipitation || {}).ice].filter(Boolean).forEach((id, k) => dayHistory(id, 'rrHist' + k, false, back0));
      dayHistory(cfg.temperature_entity, 'tHist', false, hrPrev); dayHistory(cfg.icon_entity, 'iHist', true, hrPrev);
      dayHistory(cfg.temperature_entity, 'tHist');
      dayHistory(cfg.icon_entity, 'iHist', true);
      list = (S.hours || []).filter((i) => L.dkey(new Date(i.datetime)) === S.view.day);
      S.sunW = Math.max(120, (fc.clientWidth - 24) || (box.clientWidth - 48) || 320);
      if (!S.sunH) { const h3 = box.clientHeight - row.offsetHeight - 98; S.sunH = isFinite(h3) && h3 > 90 ? h3 : 180; }
      const hsE = cfg.hourly_summary_entity && hass.states[cfg.hourly_summary_entity];
      sig = 'h|' + S.view.day + '|' + (S.hours ? list.map((i) => i.datetime + i.condition + i.temperature).join(';') : 'loading') + '|' + (hsE ? hsE.state : '') + '|' + ((histOf('tHist', Math.min(0, hrOff)) || {}).at || 0) + '|' + ((histOf('iHist', Math.min(0, hrOff)) || {}).at || 0) + '|' + ((histOf('tHist', hrPrev) || {}).at || 0) + '|' + Math.floor(Date.now() / 6e4) + '|' + S.sunW + 'x' + S.sunH;
    } else {
      list = S.items || [];
      if (type !== 'daily') list = list.filter((i) => Date.parse(i.datetime) > Date.now() - 36e5);
      /* "fit" shows as many as the width holds without scrolling, "all" everything the
         provider sends, a number caps it and the rest scroll */
      const mi = String(cfg.max_items == null ? 'all' : cfg.max_items).toLowerCase();
      const minW = Number(cfg.min_item_width) || 64;
      if (mi === 'fit') {
        const room = (fc.clientWidth || box.clientWidth || 0) - 24 + 4;   /* padding, then one gap back */
        S.fitN = Math.max(1, Math.floor(room / (minW + 4)));
        list = list.slice(0, S.fitN);
      } else if (mi !== 'all') list = list.slice(0, Number(cfg.max_items) || 8);   /* a number caps it */
      sig = 'd|' + list.map((i) => i.datetime + i.condition + i.temperature + i.templow + i.precipitation).join(';');
      /* Each day's high and low on the calendar date — the same figures its day view shows,
         from the hourly forecast, and for today also what was recorded since midnight.
         Pirate Weather's own daily low is the coming night's (6 PM to 6 AM), so the strip
         and the tapped day used to disagree. A day the hourly forecast doesn't mostly cover
         keeps the daily figures, as its day view does. */
      S.calHL = {};
      if (type === 'daily') {
        const byDay = {};
        (S.hours || []).forEach((h) => { const v = Number(h.temperature); if (h.temperature != null && isFinite(v)) { const k = L.dkey(new Date(h.datetime)); (byDay[k] = byDay[k] || []).push(v); } });
        const todayK = L.dkey(new Date()), t00 = dayStartOf(0);
        const recT = ((S.tHist && S.tHist.pts) || []).filter((p) => p[0] >= t00).map((p) => Number(p[1])).filter((v) => isFinite(v));
        list.forEach((it) => {
          const k = L.dkey(new Date(it.datetime));
          let vs = byDay[k] || [];
          if (k === todayK) vs = vs.concat(recT);
          else if (vs.length < 20) return;
          if (vs.length) S.calHL[k] = [Math.max(...vs), Math.min(...vs)];
        });
        /* redraw when a figure actually shown changes, not on every forecast push */
        sig += '|' + Object.keys(S.calHL).map((k) => k + ':' + Math.round(S.calHL[k][0]) + '/' + Math.round(S.calHL[k][1])).join(',');
      }
    }
    sig += '|' + nightNow + unit;
    if (S.sig === sig) return;
    /* switching between days and hours: fade the strip out, rebuild, fade back in */
    const modeKey = solView ? 'o' : uvView ? 'v' : dewView ? 'p' : aqiView ? 'a' : windView ? 'w' : sunView ? 's' : hourly ? 'h' : 'd';
    if (S.swapping) return;
    if (S.fcMode && S.fcMode !== modeKey) {
      S.swapping = true;
      S.fcWrap.classList.add('wx-swap');
      setTimeout(() => { S.swapping = false; S.fcMode = modeKey; S.fadedMode = null; S.sig = null; S.fcWrap.classList.remove('wx-swap'); S.draw(); }, 150);
      return;
    }
    const firstFill = !S.fcMode || S.fcEmpty;
    S.fcMode = modeKey;
    const fadeIn = () => {
      if (S.fadedMode === modeKey) return;
      S.fadedMode = modeKey;
      if (!(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) S.fcWrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: firstFill ? 260 : 200, easing: 'ease-out' });
    };
    S.sig = sig;
    const anyView = hourly || sunView || windView || aqiView || dewView || uvView || solView;
    box.classList.toggle('wx-viewing', anyView);
    S.fcWrap.classList.toggle('wx-hourly', anyView);
    S.fcWrap.classList.toggle('wx-sunview', anyView);
    head.innerHTML = '';
    /* Drag anywhere on a chart to read it: a line follows the finger, the dot rides the
       curve and the label shows its value and time. Any chart that sets
       svg.__scrub = { P, pts, fmt, top, bottom, right, Wd } and draws its line with the
       shared smooth() curve gets this for free. */
    const scrub = (svg) => {
      const cfgS = svg && svg.__scrub;
      if (!cfgS || !cfgS.P || cfgS.P.length < 2) return;
      const NS = 'http://www.w3.org/2000/svg';
      const mk = (n2, at) => { const e = document.createElementNS(NS, n2); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
      const g = mk('g', { class: 'wx-scrub' });
      const line = mk('line', { y1: cfgS.top, y2: cfgS.bottom, class: 'wx-scrub-line' });
      const dot = mk('circle', { r: 3.5, class: 'wx-scrub-dot' });
      const lab = mk('text', { class: 'wx-scrub-lab', 'text-anchor': 'start' });
      g.appendChild(line); g.appendChild(dot); g.appendChild(lab);
      svg.appendChild(g);
      let hideT = null;
      const show = (clientX) => {
        const r = svg.getBoundingClientRect();
        if (!r.width) return;
        const px = (clientX - r.left) * (cfgS.Wd / r.width);
        /* The cursor glides with the finger, and the value is read off the drawn curve at
           that exact moment, so the dot sits on the line even between readings (AQI's
           come every few hours, the others every 20 minutes). */
        const P = cfgS.P, n = P.length - 1;
        const cx = Math.max(P[0][0], Math.min(P[n][0], px));
        let j = 1;
        while (j < n && P[j][0] < cx) j++;
        const k = P[j][0] === P[j - 1][0] ? 0 : (cx - P[j - 1][0]) / (P[j][0] - P[j - 1][0]);
        const va = cfgS.pts[j - 1], vb = cfgS.pts[j];
        /* the segment's Bézier, built exactly as every chart's smooth() builds it (the
           control points held inside the segment in both axes); then the t whose x is the
           cursor's — x only ever moves forward along a segment, so halving finds it */
        const a0 = P[j - 1], a3 = P[j], p0 = P[j - 2] || a0, p3 = P[j + 1] || a3;
        const loY = Math.min(a0[1], a3[1]), hiY = Math.max(a0[1], a3[1]);
        const cl = (v2) => Math.max(loY, Math.min(hiY, v2)), clX = (v2) => Math.max(a0[0], Math.min(a3[0], v2));
        const c = [[clX(a0[0] + (a3[0] - p0[0]) / 6), cl(a0[1] + (a3[1] - p0[1]) / 6)], [clX(a3[0] - (p3[0] - a0[0]) / 6), cl(a3[1] - (p3[1] - a0[1]) / 6)]];
        const bz = (t, ax) => { const u = 1 - t; return u * u * u * a0[ax] + 3 * u * u * t * c[0][ax] + 3 * u * t * t * c[1][ax] + t * t * t * a3[ax]; };
        let lo = 0, hi = 1;
        for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if (bz(m, 0) < cx) lo = m; else hi = m; }
        const py = bz((lo + hi) / 2, 1);
        const p = [cx, py];
        /* the value is read back off the dot's height, so the label and the dot agree */
        const kv = a3[1] === a0[1] ? k : (py - a0[1]) / (a3[1] - a0[1]);
        const v = [va[0] + (vb[0] - va[0]) * k, va[1] + (vb[1] - va[1]) * kv];
        line.setAttribute('x1', p[0]); line.setAttribute('x2', p[0]);
        dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
        lab.textContent = cfgS.fmt(v[1], v[0]);
        /* the readout sits beside the line rather than across it, flipping to the other
           side near the right edge, and stays inside the plot vertically */
        const room = cfgS.Wd - cfgS.right - p[0];
        let need = 96;
        try { need = lab.getBBox().width + 16; } catch (err) {}   /* measured: readouts differ in length */
        const flip = room < need;
        lab.setAttribute('text-anchor', flip ? 'end' : 'start');
        lab.setAttribute('x', flip ? p[0] - 9 : p[0] + 9);
        lab.setAttribute('y', Math.max(cfgS.top + 14, Math.min(cfgS.bottom - 6, p[1] - 12)));
        /* the readout lands exactly where the H / L marks and the peak-% label live.
           Rather than dodge them (there is nowhere to go that isn't the curve or the
           icon strip), hide the ones it covers — measured, not guessed, so a mark well
           away from the cursor stays put. The occupied span runs from the cursor line
           to the far end of the readout, with a wide margin: a label that merely sits
           beside the text, with the 9 px gap between, still reads as part of it. */
        try {
          const rb = lab.getBBox();
          const x0 = Math.min(rb.x, p[0]) - 14, x1 = Math.max(rb.x + rb.width, p[0]) + 14;
          svg.querySelectorAll('.wx-t-hl, .wx-pop-label').forEach((n2) => {
            const b2 = n2.getBBox();
            n2.classList.toggle('wx-under', b2.x < x1 && x0 < b2.x + b2.width
              && b2.y < rb.y + rb.height + 3 && rb.y < b2.y + b2.height + 3);
          });
        } catch (err) {}
        svg.classList.add('wx-scrubbing');
        clearTimeout(hideT);
      };
      const end = () => { hideT = setTimeout(() => svg.classList.remove('wx-scrubbing'), 2200); };
      svg.addEventListener('pointerdown', (e) => { e.stopPropagation(); try { svg.setPointerCapture(e.pointerId); } catch (err) {} show(e.clientX); });
      svg.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') { e.preventDefault(); show(e.clientX); } });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => svg.addEventListener(ev, end));
    };
    /* Day-based views (humidity, UV, wind) can step forward through the forecast days.
       Arrows rather than a swipe, since a horizontal drag already scrubs the chart. */
    /* maxOff: the furthest day ahead to offer; views with no forecast pass 0 */
    const dayNav = (label, slot0, curOff, setter, maxOff) => {
      const off = curOff != null ? curOff : ((S.view && S.view.off) || 0);
      const max = maxOff != null ? maxOff : daysAhead();
      /* the day before this one is fetched in the background; if it is a past day that
         holds nothing, don't offer to step onto an empty chart. Today and the forecast days
         always can be stepped back onto: they have the forecast and the current reading
         even when the recorder has almost nothing yet (UV sits at 0 all night, which the
         recorder keeps as a single point). A past day that holds nothing means there is
         no history before it either. */
      let min = -daysBack(slot0);
      if (slot0) {
        if (off - 1 < 0 && hasDay(slot0, off - 1) === false) min = off;
        if (off < 0 && hasDay(slot0, off) === false) min = off;
      }
      const nav = L.el('div', 'wx-daynav', head);
      const mkA = (dir, icon) => {
        const b2 = L.el('button', 'wx-daynav-btn', nav);
        const ic = document.createElement('ha-icon'); ic.icon = icon; b2.appendChild(ic);
        /* no wrapping: an arrow only ever moves one day the way it points, and stops
           at the ends of what there is data for */
        if ((dir < 0 && off <= min) || (dir > 0 && off >= max)) b2.classList.add('off');
        b2.addEventListener('click', (e) => {
          e.stopPropagation();
          const n2 = Math.max(min, Math.min(max, off + dir));
          if (n2 === off) return;
          if (setter) setter(n2); else { S.view.off = n2; S.view.at = Date.now(); S.sig = null; S.draw(); }
        });
        return b2;
      };
      mkA(-1, 'mdi:chevron-left');
      const d2 = new Date(dayStartOf(off));
      const wd = d2.toLocaleDateString(lang, { weekday: 'long' });
      /* a weekday name only within the week either side; further out it would be the
         wrong week ("Last Thursday" for three months ago), so it gives the date */
      const far = { weekday: 'short', month: 'short', day: 'numeric' };
      if (d2.getFullYear() !== new Date().getFullYear()) far.year = 'numeric';
      L.el('span', 'wx-daynav-label', nav).textContent = off === 0 ? (label || 'Today')
        : off === 1 ? 'Tomorrow' : off === -1 ? 'Yesterday'
        : Math.abs(off) >= 7 ? d2.toLocaleDateString(lang, far)
        : off < 0 ? 'Last ' + wd : wd;
      mkA(1, 'mdi:chevron-right');
    };
    /* graph views: build, then on the next frame give the svg exactly the space left */
    /* A past day with no recorded data would draw an empty grid, which looks broken. Say
       so — and while its history is still on the way, say that instead of drawing a chart
       that is about to be replaced. */
    const noHistory = (slot0, offIn) => {
      const off = offIn != null ? offIn : ((S.view && S.view.off) || 0);
      if (off >= 0) return false;
      const known = hasDay(slot0, off);
      if (known === true) return false;
      fc.innerHTML = '';
      fc.style.gridTemplateColumns = '1fr';
      L.el('div', 'wx-empty', fc).textContent = known === false ? 'No recorded history for this day' : 'Loading…';
      S.fadedMode = null;
      S.edge();
      return true;
    };
    const mountGraph = (builder, footSel) => {
      fc.innerHTML = '';
      fc.style.gridTemplateColumns = '1fr';
      /* a non-finite size would give the svg a NaN viewBox, which renders as nothing at
         all — clamp before building, and let the measuring pass below correct it */
      const okNum = (v, fb) => (isFinite(v) && v > 0 ? v : fb);
      S.sunW = Math.max(120, okNum(S.sunW, okNum(fc.clientWidth - 24, 320)));
      S.sunH = Math.max(90, okNum(S.sunH, 180));
      /* a chart that fails to build would otherwise leave a blank card with no clue why;
         show the reason in its place and log it */
      let wrap;
      try { wrap = builder(S.sunW, S.sunH); }
      catch (err) {
        console.error('spyglass-weather-card: chart failed', err);
        L.el('div', 'wx-empty', fc).textContent = 'Chart error: ' + ((err && err.message) || err);
        S.edge();
        return;
      }
      fc.appendChild(wrap);
      try { scrub(wrap.querySelector('svg')); } catch (err) { console.error('spyglass-weather-card: scrub failed', err); }
      requestAnimationFrame(() => {
        if (!wrap.isConnected) return;
        const old = wrap.querySelector('svg');
        /* everything in the wrap that isn't the chart (icon row, summary) plus the gaps */
        const kids = Array.prototype.slice.call(wrap.children);
        const others = kids.reduce((n, c) => n + (c === old ? 0 : c.offsetHeight), 0);
        /* measure the strip, not the wrap: the wrap's height: 100% resolves against a
           content-sized flex item, so it grows with whatever we just drew */
        const avail = Math.floor(fc.clientHeight - others - 12 * Math.max(0, kids.length - 1) - 6);
        const w = Math.max(120, fc.clientWidth - 24);
        if (!isFinite(avail) || !isFinite(w)) return;
        if (avail >= 80 && (Math.abs(avail - S.sunH) > 1 || w !== S.sunW)) {
          S.sunH = avail; S.sunW = w;
          try {
            const fresh = builder(w, avail).querySelector('svg');
            if (old && fresh) { wrap.replaceChild(fresh, old); scrub(fresh); }
          } catch (err) { console.error('spyglass-weather-card: chart resize failed', err); }
        }
      });
      S.edge();
      fadeIn();
    };
    if (solView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const offS = Math.min(0, S.view.off || 0);
      L.el('span', 'wx-fc-hint', head).textContent = offS ? '' : (S.solarNow != null ? Math.round(S.solarNow) + ' W/m²' : 'Sunlight');
      dayNav(null, 'sHist', null, null, 0);
      if (noHistory('sHist')) return;
      mountGraph((w2, h2) => solarGraph(w2, h2, offS), '.wx-wind-summary');
      return;
    }
    if (uvView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const un = S.uvNow;
      const offU = (S.view.off || 0);
      L.el('span', 'wx-fc-hint', head).textContent = offU ? '' : (un != null ? 'UV ' + Math.round(un) + ' · ' + (uvBands.find((b) => un < b[1]) || uvBands[4])[3].replace(/^./, (c) => c.toUpperCase()) : 'UV Index');
      dayNav(null, 'uHist');
      if (noHistory('uHist')) return;
      mountGraph((w2, h2) => uvGraph(w2, h2, offU), '.wx-wind-summary');
      return;
    }
    if (dewView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const dn = S.dewNow;
      const offD = (S.view.off || 0);
      L.el('span', 'wx-fc-hint', head).textContent = offD ? '' : (dn != null ? Math.round(dn) + '° · ' + dewLabel(dn) : 'Dew point');
      dayNav(null, 'dHist');
      if (noHistory('dHist')) return;
      mountGraph((w2, h2) => dewGraph(w2, h2, offD), '.wx-wind-summary');
      return;
    }
    if (aqiView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const offA = Math.min(0, S.view.off || 0);
      L.el('span', 'wx-fc-hint', head).textContent = offA ? '' : (S.aqiNow != null ? aqiScale.name + ' ' + Math.round(S.aqiNow) + ' · ' + aqiLabel(S.aqiNow) : 'Air Quality');
      dayNav(null, 'aHist', null, null, 0);
      if (noHistory('aHist')) return;
      mountGraph((w2, h2) => aqiGraph(w2, h2, offA), '.wx-wind-summary');
      return;
    }
    if (windView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const wn = S.windNow;
      const offW = (S.view.off || 0);
      L.el('span', 'wx-fc-hint', head).textContent = offW ? '' : (wn ? Math.round(wn.v) + ' ' + wn.u + (wn.dir ? ' ' + wn.dir : '') + (wn.gust != null ? ' · Gusts: ' + Math.round(wn.gust) + ' ' + wn.u : '') : 'Wind');
      dayNav(null, 'wHist');
      if (noHistory('wHist')) return;
      mountGraph((w2, h2) => windGraph(w2, h2, offW), '.wx-wind-summary');
      return;
    }
    if (sunView) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      const T = list[0];
      /* time until sunset while the sun is up, otherwise until the next sunrise */
      let hint = '';
      const offS = S.view.off || 0;
      if (T && T.rise && T.set) {
        const now = Date.now();
        if (offS) {
          /* another day: how its daylight compares with today's */
          const T0 = sunCalc(0);   /* calculated both sides, so only the season differs */
          const dd = T0 ? Math.round(((T.set - T.rise) - (T0.set - T0.rise)) / 6e4) : null;
          const amt = (m) => (m < 60 ? m + ' min' : fmtDur(m * 6e4));
          hint = dd == null ? '' : dd === 0 ? 'Same daylight as today' : amt(Math.abs(dd)) + (dd > 0 ? ' more' : ' less') + ' daylight than today';
        } else if (now >= T.rise && now < T.set) hint = 'Daylight remaining: ' + fmtDur(T.set - now);
        else hint = 'Sunrise in: ' + fmtDur((now < T.rise ? T.rise : T.rise + 864e5) - now);
      }
      L.el('span', 'wx-fc-hint', head).textContent = hint;
      /* any day, back or forward: sun times are calculated, not recorded */
      dayNav(null, null, null, null, 365);
      fc.innerHTML = '';
      fc.style.gridTemplateColumns = '1fr';
      if (T && T.rise && T.set) {
        const wrap = sunGraph(T, S.sunW, S.sunH);
        fc.appendChild(wrap);
        /* second pass: the times row is now laid out, give the graph exactly the rest */
        requestAnimationFrame(() => {
          if (!wrap.isConnected) return;
          /* room for everything under the chart: the times, and the moon line (with its gap) */
          const rows = wrap.querySelector('.wx-sun-rows'), moonL = wrap.querySelector('.wx-moon'), old = wrap.querySelector('svg.wx-sun-svg');
          /* the pieces are spaced by the wrap's gap, one fewer gap than pieces */
          const gapW = parseFloat(getComputedStyle(wrap).rowGap) || 12, kidsW = wrap.children.length;
          const avail = Math.floor(wrap.clientHeight - (rows ? rows.offsetHeight : 0) - (moonL ? moonL.offsetHeight : 0) - gapW * Math.max(0, kidsW - 1));
          const w = Math.max(120, fc.clientWidth - 24);
          if (avail >= 80 && (Math.abs(avail - S.sunH) > 1 || w !== S.sunW)) {
            S.sunH = avail; S.sunW = w;
            const fresh = sunGraph(T, w, avail).querySelector('svg.wx-sun-svg');
            if (old && fresh) wrap.replaceChild(fresh, old);
          }
        });
      } else L.el('div', 'wx-empty', fc).textContent = 'No sun data';
      S.edge();
      fadeIn();
      return;
    }
    if (hourly) {
      const back = L.el('div', 'wx-fc-back', head);
      const b = document.createElement('ha-icon'); b.icon = 'mdi:chevron-left'; back.appendChild(b);
      L.el('span', 'wx-fc-title', back).textContent = 'Back';
      /* That day's own daily forecast, where the strip has one. */
      const dayEnt = (S.items || []).filter((i) => L.dkey(new Date(i.datetime)) === S.view.day)[0];
      /* a future day the hourly forecast only partly reaches: draw the hours it does
         have, but take the H / L from the daily entry, since a few hours either side of
         midnight are not the day's high and low and would contradict the cell tapped */
      const partDay = !!(dayEnt && hrOff >= 1 && list.length < 20);
      /* today and past days carry their readings in the recorder, not in the hourly
         forecast, so the H / L has to take those in too — otherwise a past day shows
         marks on the chart and nothing in the header */
      const histPts = hrOff <= 0 ? (((histOf('tHist', hrOff) || {}).pts) || [])
        .filter((p) => p[0] >= dayStartOf(hrOff) && p[0] < dayStartOf(hrOff) + 864e5) : [];
      const hi2 = list.filter((i) => i.temperature != null).map((i) => Number(i.temperature))
        .concat(histPts.map((p) => Number(p[1])))
        .filter((v) => isFinite(v));
      L.el('span', 'wx-fc-hint', head).textContent = partDay
        ? 'H ' + L.t(dayEnt.temperature) + (dayEnt.templow != null ? ' L ' + L.t(dayEnt.templow) : '')
        : (hi2.length ? 'H ' + L.t(Math.max(...hi2)) + ' L ' + L.t(Math.min(...hi2)) : '');
      /* step through the days without going back to the strip */
      dayNav(null, 'tHist', hrOff, (n2) => {
        const d3 = new Date(dayStartOf(n2));
        S.view.day = L.dkey(d3);
        S.view.label = n2 === 0 ? 'Today' : n2 === 1 ? 'Tomorrow' : n2 === -1 ? 'Yesterday'
          : n2 < 0 ? 'Last ' + d3.toLocaleDateString(lang, { weekday: 'long' }) : d3.toLocaleDateString(lang, { weekday: 'long' });
        S.view.at = Date.now(); S.sig = null; S.draw();
      });
      if (!list.length && hrOff >= 0) {
        fc.innerHTML = '';
        L.el('div', 'wx-empty', fc).textContent = S.hours ? 'No hourly forecast for this day' : 'Loading…';
        S.fadedMode = null; S.edge(); return;
      }
      if (noHistory('tHist', hrOff)) return;
      const dk = S.view.day.split('-').map(Number);          /* dkey: year-monthIndex-date */
      const d0h = new Date(dk[0], dk[1], dk[2], 0, 0, 0, 0).getTime();
      mountGraph((w2, h2) => hourGraph(d0h, w2, h2), '.wx-wind-summary');
      /* the generated sentence is written from the hours on hand, so on a day the hourly
         forecast only clips it reads as a fragment ("high of 10° around 12 AM"). Say what
         it actually covers, and give the day's own figures. */
      /* a past day whose recording starts partway through: the generated sentence reads
         as if the day began then. Say when the record starts and what it covered. */
      if (hrOff < 0 && histPts.length > 1 && histPts[0][0] > dayStartOf(hrOff) + 54e5) {
        const vsP = histPts.map((p) => Number(p[1])).filter((v) => isFinite(v));
        const fromTxt = new Date(histPts[0][0]).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
        const fEl2 = fc.querySelector('.wx-wind-summary');
        if (fEl2 && vsP.length) fEl2.textContent = (S.view.label || 'This day') + ' is only recorded from '
          + fromTxt + '. From then, a ' + hiLoAt(histPts, L.t) + '.';
      }
      if (partDay && list.length) {
        const lastT = Math.max(...list.map((i) => Date.parse(i.datetime)));
        const endTxt = new Date(lastT).toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
        const amtP = Number(dayEnt.precipitation);
        const sum = (S.view.label || 'This day') + ' is only forecast hour by hour to ' + endTxt
          + '. For the day as a whole: high ' + L.t(dayEnt.temperature)
          + (dayEnt.templow != null ? ', low ' + L.t(dayEnt.templow) : '')
          + (isFinite(amtP) && precipBase(amtP) >= 0.1 ? ', ' + fmtPrecip(amtP) : '') + '.';
        const fEl = fc.querySelector('.wx-wind-summary');
        if (fEl) fEl.textContent = sum;
      }
      return;
    }
    fc.innerHTML = '';
    fc.style.gridTemplateColumns = 'repeat(' + Math.max(1, list.length) + ', minmax(' + (Number(cfg.min_item_width) || 64) + 'px, 1fr))';
    fc.scrollLeft = 0;
    if (!list.length) {
      S.fcEmpty = true;
      S.fadedMode = null;
      L.el('div', 'wx-empty', fc).textContent = hourly ? (S.hours ? 'No hourly forecast for this day' : 'Loading…') : (S.items ? 'No forecast' : 'Loading…');
      S.edge();
      return;
    }
    S.fcEmpty = false;
    const todayKey = L.dkey(new Date());
    /* does any day in the strip carry an amount worth showing? */
    const wetWeek = !hourly && type === 'daily' && list.some((i) => { const v = Number(i.precipitation); return isFinite(v) && v >= 0.1; });
    list.forEach((it, idx) => {
      const d = new Date(it.datetime), cell = L.el('div', 'wx-item', fc);
      let nt = false, label;
      if (hourly || type === 'hourly') {
        nt = nightAt(d.getTime());
        label = (!hourly && idx === 0) ? 'Now' : d.toLocaleTimeString(lang, { hour: 'numeric', hour12: h12 });
      } else if (type === 'twice_daily') {
        nt = it.is_daytime === false;
        label = d.toLocaleDateString(lang, { weekday: 'short' }) + (nt ? ' night' : '');
      } else {
        /* shown as HA's own forecast does: weekday labels, entries as the provider
           sends them; a night-only entry (no high) gets the night icon */
        label = d.toLocaleDateString(lang, { weekday: 'short' });
        if (it.temperature == null && it.templow != null) nt = true;
        cell.dataset.day = L.dkey(d);
        cell.dataset.label = d.toLocaleDateString(lang, { weekday: 'long' });
        /* every day in the strip opens. Where the hourly forecast does not reach, the
           day view falls back to that day's daily forecast, so there is nothing here
           that has to know how many hours arrived — which is what used to go stale. */
        cell.classList.add('wx-tappable');
      }
      L.el('div', 'wx-item-label', cell).textContent = label;
      cell.appendChild(L.icon(variant(it.condition || 'cloudy', nt)));
      const calK = (S.calHL || {})[L.dkey(new Date(it.datetime))];
      L.el('div', 'wx-item-temp', cell).textContent = L.t(!hourly && calK ? calK[0] : it.temperature);
      const lo = L.el('div', 'wx-item-lo', cell);
      if (!hourly && type === 'daily' && (calK || it.templow != null)) lo.textContent = L.t(calK ? calK[1] : it.templow);
      else { const p = Number(it.precipitation_probability); lo.textContent = (isFinite(p) && p >= 20) ? p + '%' : ''; lo.classList.add('wx-pop'); }
      /* how much, not just how likely: an amount says far more than a percentage. The row is only
         added when some day in the strip actually has an amount, so a dry week stays short */
      if (wetWeek) {
        const amtD = Number(it.precipitation), pD = Number(it.precipitation_probability);
        const rain = L.el('div', 'wx-item-rain', cell);
        rain.textContent = isFinite(amtD) && precipBase(amtD) >= 0.1 ? fmtPrecip(amtD)
          : (isFinite(pD) && pD >= 20 ? pD + '%' : '');
      }
    });
    requestAnimationFrame(() => { fc.scrollLeft = 0; S.edge(); });
    fadeIn();
  };
  S.draw();
}

/* Keys that configure the card element itself; every other key is a card option. */
const OWN_KEYS = new Set(['type', 'entity', 'name', 'tap_action', 'hold_action', 'double_tap_action',
  'grid_options', 'layout_options', 'view_layout', 'visibility', 'card_mod']);

const ENTITY_ID = /^[a-z_]+\.[a-z0-9_]+$/;

/* Pirate Weather names its sensors after the weather entity: weather.home comes with
   sensor.home_summary, sensor.home_uv_index and so on. Each option left unset is filled
   from the matching sensor when it exists; set an option to false to leave it off. */
const AUTO_SENSORS = {
  condition_entity: 'summary',
  subtitle_entity: 'minutely_summary',
  temperature_entity: 'temperature',
  pressure_entity: 'pressure',
  cloud_entity: 'cloud_coverage',
  icon_entity: 'icon',
  summary_entity: 'daily_summary',
  hourly_summary_entity: 'hourly_summary',
  alerts_entity: 'alerts',
  precipitation: { type: 'precip', rain: 'rain_intensity', snow: 'snow_intensity', ice: 'ice_intensity' },
  details: {
    uv: 'uv_index',
    aqi: 'air_quality_index',
    smoke: 'smoke',
    fire: 'fire_risk_level',
    dew_point: 'dew_point',
    humidity: 'humidity',
    wind: 'wind_speed',
    gust: 'wind_gust',
    bearing: 'wind_bearing',
    precip_probability: 'precip_probability',
    rain_today: 'current_day_liquid_accumulation',
    snow_today: 'current_day_snow_accumulation',
    solar: 'downward_short_wave_radiation_flux',
  },
};

/* the sky's effects, each on unless the animations option sets it false */
const ANIM_DEFAULTS = { clouds: true, fog: true, stars: true, sun: true, rain: true, snow: true, lightning: true };

/* the options with the sensors found filled in and the ones set to false taken out;
   `found` lists what was filled in, for the editor */
const autoOptions = (options, entity, hass) => {
  const prefix = 'sensor.' + String(entity || '').split('.')[1] + '_';
  const has = (suffix) => !!(hass && hass.states && hass.states[prefix + suffix]);
  const fill = (src, map, found) => {
    const out = Object.assign({}, src);
    for (const [k, suffix] of Object.entries(map)) {
      if (typeof suffix === 'object') continue;
      if (out[k] === false) delete out[k];
      else if (out[k] === undefined && has(suffix)) { out[k] = prefix + suffix; found[k] = out[k]; }
    }
    return out;
  };
  const found = {};
  const out = fill(options, AUTO_SENSORS, found);
  for (const group of ['precipitation', 'details']) {
    if (out[group] === false) { delete out[group]; continue; }
    found[group] = {};
    const sub = fill(out[group], AUTO_SENSORS[group], found[group]);
    if (Object.keys(sub).length) out[group] = sub; else delete out[group];
  }
  /* feels-like stays a switch, but when it's on, its sensor is used when there is one */
  if (out.apparent_temperature === true && has('apparent_temperature')) {
    out.apparent_temperature = prefix + 'apparent_temperature';
    found.apparent_temperature = out.apparent_temperature;
  }
  return { options: out, found };
};

/* The card's default name: the city in Home Assistant's time zone ("America/New_York" →
   "New York"), which is the nearest thing to a city Home Assistant knows; else the name
   of the home */
const placeName = (hass) => {
  const c = (hass && hass.config) || {};
  const tz = String(c.time_zone || '').split('/');
  if (tz.length > 1 && tz[0] !== 'Etc') return tz[tz.length - 1].replace(/_/g, ' ');
  return c.location_name || '';
};

/* the air quality scale when aqi_scale doesn't say, from Home Assistant's country:
   Canada reports AQHI, the US the EPA's AQI, Europe (and anywhere else set) CAQI */
const guessAqiScale = (hass) => {
  const cc = String((hass && hass.config && hass.config.country) || '').toUpperCase();
  return cc === 'CA' ? 'aqhi' : cc === 'US' ? 'epa' : cc ? 'caqi' : 'epa';
};

/* one console line per distinct error, not one per state change */
let lastError = '';
const report = (e) => {
  const msg = String((e && e.stack) || e);
  if (msg === lastError) return;
  lastError = msg;
  console.error(`[${TAG}]`, e);
};

class SpyglassWeatherCard extends HTMLElement {
  setConfig(config) {
    if (!config || typeof config.entity !== 'string' || !config.entity.startsWith('weather.')) {
      throw new Error('Set "entity" to a weather entity, e.g. weather.home');
    }
    /* the card's options sit at the top level, next to type and entity */
    const options = {};
    for (const k of Object.keys(config)) if (!OWN_KEYS.has(k)) options[k] = config[k];
    /* `type` is the card's own key, so the forecast type is set with forecast_type */
    if (config.forecast_type) options.type = config.forecast_type;
    this._config = config;
    this._options = options;
    this._resolved = false;
    this._watch = [config.entity];
    this._seen = null;
    if (this._ctx) this._build();   /* new options: start again from a fresh card */
    if (this._hass) this._update();
  }

  /* fill in the sensors found for the options left unset, and watch every entity the
     options end up naming: a change to any of them re-renders */
  _resolve() {
    const { options } = autoOptions(this._options, this._config.entity, this._hass);
    this._ctx.options = options;
    const ids = new Set([this._config.entity, options.sun_entity || 'sun.sun']);
    const walk = (v) => {
      if (typeof v === 'string') { if (ENTITY_ID.test(v)) ids.add(v); }
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(options);
    this._watch = [...ids];
    this._seen = null;
    this._resolved = true;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._ctx) this._build();
    if (!this._resolved) this._resolve();
    const seen = this._watch.map((id) => hass.states[id]);
    if (this._seen && seen.every((s, i) => s === this._seen[i])) return;
    this._seen = seen;
    this._update();
  }

  connectedCallback() {
    /* time moves on between state changes (the "now" marks, "sunrise in", the day's
       history), so refresh once a minute while the card is on the page; look for the
       sensors again too, in case one has appeared */
    clearInterval(this._tick);
    this._tick = setInterval(() => { this._resolved = false; this._update(); }, 60000);
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
  }

  _build() {
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = BASE_CSS + CARD_CSS;
    const card = document.createElement('ha-card');
    card.innerHTML = '<div class="wx-box"><div class="wx-head">'
      + '<div class="wx-hero"><ha-state-icon class="wx-hero-icon"></ha-state-icon></div>'
      + '<div class="wx-title"><div class="wx-name"></div><div class="wx-state"></div></div>'
      + '</div></div>';
    root.replaceChildren(style, card);
    this.__wxGrid = false;   /* let update() size the new card to its grid cell */
    this._ctx = { card, host: this, options: this._options };
    this._head = {
      icon: card.querySelector('.wx-hero-icon'),
      name: card.querySelector('.wx-name'),
      state: card.querySelector('.wx-state'),
    };
  }

  _update() {
    const hass = this._hass;
    const cfg = this._config;
    if (!hass || !cfg || !this._ctx) return;
    if (!this._resolved) this._resolve();
    const st = hass.states[cfg.entity];
    if (st) {
      const h = this._head;
      const name = cfg.name || placeName(hass) || st.attributes.friendly_name || cfg.entity;
      if (h.name.textContent !== name) h.name.textContent = name;
      const state = hass.formatEntityState ? hass.formatEntityState(st) : st.state;
      if (h.state.textContent !== state) h.state.textContent = state;
      h.icon.hass = hass;
      h.icon.stateObj = st;
    }
    try {
      update.call(this._ctx, hass, cfg.entity);
    } catch (e) {
      report(e);
    }
    const box = this._ctx.card.querySelector('.wx-box');
    box.classList.toggle('wx-no-headline', !!cfg.hide_headline);
    box.classList.toggle('wx-no-head', !!(cfg.hide_headline && cfg.hide_temperature));
  }

  getCardSize() {
    return 6;
  }

  /* 6 rows is the least that holds the header, chips, summary and strip at any width;
     at 4 rows the strip is cut off, and at 5 a narrow card squeezes the chips */
  getGridOptions() {
    const go = (this._config && this._config.grid_options) || {};
    return { columns: go.columns || 12, rows: go.rows || 6, min_columns: 8, min_rows: 5 };
  }

  static getStubConfig(hass) {
    const entity = Object.keys((hass && hass.states) || {}).find((id) => id.startsWith('weather.'));
    return { entity: entity || 'weather.home' };
  }

  static async getConfigElement() {
    await loadEditorParts();
    return document.createElement(TAG + '-editor');
  }
}

/* ---------- visual editor ---------- */

/* which chips show when show_chips doesn't say */
const CHIP_DEFAULTS = { uv: true, aqi: true, dew_point: true, wind: true, sun: true, solar: false };
/* what the card uses for these when the config leaves them out: the editor shows them
   rather than an empty field, and doesn't write them back unless changed */
const FIELD_DEFAULTS = { forecast_type: 'daily', max_items: 'all', min_item_width: 64, return_home_after: 45, sun_entity: 'sun.sun' };

const sensor = (name, label, helper) => ({ name, label, helper, selector: { entity: { domain: 'sensor' } } });
const toggle = (name, label, helper) => ({ name, label, helper, selector: { boolean: {} } });

/* Each field carries its own label and helper: the same key (uv, wind, type…) appears in
   more than one group, so a lookup by name alone can't tell them apart. */
const EDITOR_SCHEMA = [
  { name: 'entity', label: 'Weather entity', required: true, selector: { entity: { domain: 'weather' } } },
  { name: 'name', label: 'Name', helper: 'Shown under the headline when the subtitle sensor has no text. Empty: the city of your Home Assistant time zone', selector: { text: {} } },
  {
    type: 'grid', name: '', schema: [
      { name: 'forecast_type', label: 'Forecast type', selector: { select: { mode: 'dropdown', options: [
        { value: 'daily', label: 'Daily' },
        { value: 'hourly', label: 'Hourly' },
        { value: 'twice_daily', label: 'Twice daily' },
      ] } } },
      toggle('apparent_temperature', 'Feels-like temperature'),
    ],
  },
  {
    name: 'appearance', type: 'expandable', flatten: true, title: 'Appearance', schema: [
      toggle('hide_headline', 'Hide headline', 'The icon, the condition, and the line under it'),
      toggle('hide_temperature', 'Hide temperature'),
      toggle('hide_forecast', 'Hide forecast strip'),
      toggle('debug', 'Debug controls', 'Buttons for stepping through every background effect'),
    ],
  },
  {
    name: 'motion', type: 'expandable', flatten: true, title: 'Animations', schema: [
      {
        /* one switch per line: a column as wide as the form */
        name: 'animations', type: 'grid', column_min_width: '100%', schema: [
          toggle('clouds', 'Drifting clouds', 'Drift with the wind, faster as it picks up; density based on cloud cover. Off: they hold still'),
          toggle('fog', 'Drifting fog', 'Banks of fog drift with the wind. Off: they hold still'),
          toggle('stars', 'Twinkling stars', 'At night, unless it\'s raining, snowing, or foggy. Off: they shine steadily'),
          toggle('sun', 'Sun glow', 'Sits where the sun is and warms toward sunset, with a slow pulse. Off: no pulse'),
          toggle('rain', 'Rain and hail', 'Heavier and faster with the rain rate, slanting with the wind'),
          toggle('snow', 'Snow and sleet', 'Flakes sway down, drifting with the wind; more of them in heavier snow'),
          toggle('lightning', 'Lightning', 'Only with a thunderstorm now or forecast within two hours; closer storms flash more often'),
        ],
      },
    ],
  },
  {
    name: 'headline', type: 'expandable', flatten: true, title: 'Headline and sky', schema: [
      sensor('condition_entity', 'Headline text', 'e.g. "Clear"; falls back to the weather state'),
      sensor('subtitle_entity', 'Line under the headline', 'e.g. "Clear for the hour"'),
      sensor('temperature_entity', 'Temperature', 'Recorded temperature, for the day chart'),
      sensor('feels_like_entity', 'Feels-like sensor', 'Optional: shown instead of the weather entity\'s feels-like'),
      sensor('icon_entity', 'Conditions', 'Recorded conditions, for the day chart\'s icons and summary'),
      sensor('pressure_entity', 'Pressure', 'Rising/falling arrow beside the headline'),
      sensor('cloud_entity', 'Cloud cover', 'How cloudy the sky looks'),
      { name: 'sun_entity', label: 'Sun', selector: { entity: { domain: 'sun' } } },
      sensor('alerts_entity', 'Weather alerts', 'Shows a banner while there are alerts'),
    ],
  },
  {
    name: 'summaries', type: 'expandable', flatten: true, title: 'Summaries', schema: [
      sensor('hourly_summary_entity', 'Near-term summary', 'Starts the line under the chips, and today\'s chart summary'),
      sensor('summary_entity', 'Coming days summary', 'The rest of the line under the chips'),
    ],
  },
  {
    name: 'precipitation', type: 'expandable', title: 'Precipitation', schema: [
      sensor('type', 'Precipitation type', 'Rain, snow, or sleet: picks what falls'),
      sensor('rain', 'Rain rate'),
      sensor('snow', 'Snow rate'),
      sensor('ice', 'Sleet / freezing rain rate'),
    ],
  },
  {
    name: 'details', type: 'expandable', title: 'Chips and charts', schema: [
      sensor('uv', 'UV index'),
      sensor('aqi', 'Air quality'),
      { name: 'aqi_scale', label: 'Air quality scale', helper: 'Defaults to your country\'s scale', selector: { select: { mode: 'dropdown', options: [
        { value: 'aqhi', label: 'AQHI (Canada)' },
        { value: 'epa', label: 'US AQI (EPA)' },
        { value: 'caqi', label: 'CAQI (Europe)' },
      ] } } },
      sensor('smoke', 'Smoke'),
      sensor('fire', 'Fire risk'),
      sensor('dew_point', 'Dew point'),
      sensor('humidity', 'Humidity'),
      sensor('wind', 'Wind speed'),
      toggle('wind_from_weather', 'Wind from the weather entity', 'For when there is no wind sensor'),
      sensor('gust', 'Wind gusts'),
      sensor('bearing', 'Wind direction'),
      sensor('precip_probability', 'Chance of rain'),
      sensor('rain_today', 'Rain today'),
      sensor('snow_today', 'Snow today'),
      sensor('solar', 'Solar', 'Sunlight reaching the ground (W/m²)'),
    ],
  },
  {
    name: 'show_chips', type: 'expandable', title: 'Show chips', schema: [{
      type: 'grid', name: '', schema: [
        toggle('uv', 'UV'),
        toggle('aqi', 'Air quality'),
        toggle('dew_point', 'Dew point'),
        toggle('wind', 'Wind'),
        toggle('sun', 'Sunrise and sunset'),
        toggle('solar', 'Solar'),
      ],
    }],
  },
  {
    name: 'strip', type: 'expandable', flatten: true, title: 'Forecast strip', schema: [
      { name: 'max_items', label: 'Entries shown', helper: 'All, Fit, or Number', selector: { select: { mode: 'dropdown', custom_value: true, options: [
        { value: 'all', label: 'All' },
        { value: 'fit', label: 'Fit' },
      ] } } },
      { name: 'min_item_width', label: 'Entry width', helper: 'Each day or hour in the strip is at least this wide; past that the strip scrolls', selector: { number: { min: 40, max: 200, step: 1, mode: 'box', unit_of_measurement: 'px' } } },
      { name: 'return_home_after', label: 'Back to the main view after', helper: '0 stays on the open view', selector: { number: { min: 0, max: 600, step: 5, mode: 'box', unit_of_measurement: 's' } } },
    ],
  },
];

/* ha-form and its pickers load with Home Assistant's own card editors; make sure they
   are there before the editor draws */
const loadEditorParts = async () => {
  if (customElements.get('ha-form') && customElements.get('ha-entity-picker')) return;
  const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
  if (!helpers) return;
  const card = await helpers.createCardElement({ type: 'entities', entities: [] });
  if (card && card.constructor.getConfigElement) await card.constructor.getConfigElement();
};

/* drop cleared fields and empty groups, and chip and animation switches left at their default */
const tidyConfig = (config) => {
  const out = Object.assign({}, config);
  if (out.show_chips) {
    const chips = {};
    for (const [k, v] of Object.entries(out.show_chips)) if (CHIP_DEFAULTS[k] !== v) chips[k] = v;
    out.show_chips = chips;
  }
  if (out.animations) {
    const anims = {};
    for (const [k, v] of Object.entries(out.animations)) if (ANIM_DEFAULTS[k] !== v) anims[k] = v;
    out.animations = anims;
  }
  const prune = (o) => {
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v === '' || v === null || v === undefined) delete o[k];
      else if (typeof v === 'object' && !Array.isArray(v)) {
        o[k] = prune(Object.assign({}, v));
        if (!Object.keys(o[k]).length) delete o[k];
      }
    }
    return o;
  };
  return prune(out);
};

class SpyglassWeatherCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.computeLabel = (s) => s.label || s.title || s.name;
      this._form.computeHelper = (s) => s.helper;
      this._form.addEventListener('value-changed', (e) => this._changed(e.detail.value));
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = EDITOR_SCHEMA;
    /* the pickers show the sensors set plus the ones the card finds on its own */
    const cfg = this._config;
    const { options: shown, found } = autoOptions(cfg, cfg.entity, this._hass);
    /* `wind: true` (use the weather entity) can't sit in an entity picker, so it shows
       as its own switch */
    const details = Object.assign({}, shown.details);
    /* the scale the card is using, guessed or set */
    if (!details.aqi_scale) details.aqi_scale = guessAqiScale(this._hass);
    details.wind_from_weather = (cfg.details || {}).wind === true;
    if (details.wind_from_weather) details.wind = '';
    /* the feels-like sensor the card would use, shown even while the switch is off */
    const feelsAuto = 'sensor.' + String(cfg.entity || '').split('.')[1] + '_apparent_temperature';
    const data = Object.assign({}, FIELD_DEFAULTS, shown, {
      /* feels-like is a switch, plus a picker for its sensor */
      apparent_temperature: !!cfg.apparent_temperature,
      feels_like_entity: typeof shown.apparent_temperature === 'string' ? shown.apparent_temperature
        : this._hass.states[feelsAuto] ? feelsAuto : '',
      precipitation: Object.assign({}, shown.precipitation),
      details,
      /* the chip switches show their real state, defaults included */
      show_chips: Object.assign({}, CHIP_DEFAULTS, cfg.show_chips),
      /* the animation switches too: every effect is on unless turned off */
      animations: Object.assign({}, ANIM_DEFAULTS, cfg.animations),
    });
    this._found = found;
    this._shown = data;
    this._form.data = data;
  }

  _changed(value) {
    const cfg = this._config;
    const shown = this._shown || {};
    const found = this._found || {};
    const next = Object.assign({}, value, { type: cfg.type });
    /* a default shown but untouched stays out of the config; one set back to its
       default is dropped too */
    for (const [k, def] of Object.entries(FIELD_DEFAULTS)) {
      if (next[k] === shown[k]) next[k] = cfg[k];
      else if (next[k] === def) next[k] = undefined;
    }
    /* A sensor picker left as shown keeps what the config had, so a sensor the card found
       stays found rather than written in; a new pick is written; a cleared one is saved
       as false where the card would otherwise find a sensor, so it stays empty. */
    const settle = (now, was, cfgVal, auto) => {
      if (now === was) return cfgVal;
      if (now) return now;
      return auto ? false : undefined;
    };
    for (const [k, suffix] of Object.entries(AUTO_SENSORS)) {
      if (typeof suffix === 'object') continue;
      next[k] = settle(next[k] || '', shown[k] || '', cfg[k], found[k]);
    }
    for (const group of ['precipitation', 'details']) {
      const now = Object.assign({}, next[group]);
      const was = shown[group] || {};
      const conf = cfg[group] || {};
      const fnd = found[group] || {};
      if (group === 'details') {
        /* the wind switch and the wind picker set one key: the one touched last wins */
        const on = !!now.wind_from_weather;
        const pickSame = (now.wind || '') === (was.wind || '');
        delete now.wind_from_weather;
        if (on && (!was.wind_from_weather || pickSame)) now.wind = true;
        /* the guessed scale is shown, not saved: untouched, it keeps what the config had */
        if (now.aqi_scale === was.aqi_scale) now.aqi_scale = conf.aqi_scale;
      }
      for (const k of Object.keys(AUTO_SENSORS[group])) {
        if (now[k] === true) continue;
        now[k] = settle(now[k] || '', was[k] || '', conf[k] === true ? undefined : conf[k], fnd[k]);
      }
      next[group] = now;
    }
    {
      /* feels-like: picking a sensor turns it on and uses it; the switch alone uses the
         sensor the card finds, else the weather entity's own value */
      const on = !!next.apparent_temperature;
      const pick = next.feels_like_entity || '';
      const wasPick = shown.feels_like_entity || '';
      delete next.feels_like_entity;
      if (pick && pick !== wasPick) next.apparent_temperature = pick;
      else if (!on) next.apparent_temperature = undefined;
      else if (!shown.apparent_temperature || pick !== wasPick) next.apparent_temperature = true;
      else next.apparent_temperature = cfg.apparent_temperature;
    }
    const config = tidyConfig(next);
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { bubbles: true, composed: true, detail: { config } }));
  }
}

/* ---------- end visual editor ---------- */

if (!customElements.get(TAG)) {
  customElements.define(TAG + '-editor', SpyglassWeatherCardEditor);
  customElements.define(TAG, SpyglassWeatherCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: TAG,
    name: 'Spyglass Weather Card',
    description: 'An animated weather card, built for Pirate Weather.',
    preview: true,
    documentationURL: 'https://github.com/lemker/spyglass-weather-card',
  });
  console.info(`%c SPYGLASS WEATHER CARD %c ${VERSION} `,
    'color: #fff; background: #3b5b8c; font-weight: 600', 'color: #3b5b8c; background: #fff');
}
