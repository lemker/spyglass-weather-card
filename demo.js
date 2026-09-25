/*
 * Spyglass Weather Card: demo driver, for recording the README video.
 *
 * Paste into the browser console on a dashboard that shows the card. It feeds the card
 * made-up weather for a run of scenes (the headline, temperature, chips, and sky all
 * agree), then, on one held scene, taps through the way a person would: looks at the wind
 * chart and the sun, reads a forecast day's hours with a drag, and goes back. About 33 s; the
 * card gets its real weather back at the end. Nothing is saved; reload the page to undo
 * anything, or run spyglassDemo.stop().
 *
 * With DEMO.record (the default) it first shows a Record button: click it, share this
 * tab, and the demo plays and downloads spyglass-weather-card-demo.webm, cropped to the
 * card, with its rounded corners transparent. Use Chrome or Edge (they can share a single
 * tab, and their recorder keeps the transparency).
 *
 *   spyglassDemo.stop()        stop and hand the card back its real weather
 *   spyglassDemo.run()         play it again without recording
 *   spyglassDemo.record()      show the Record button again
 *
 * Set DEMO.loop to repeat until stopped, and DEMO.touches to show where each tap lands.
 */
(() => {
  const DEMO = {
    record: true,       /* show a Record button that records the demo, cropped to the card */
    loop: false,
    touches: false,     /* true shows a soft circle where each tap and drag happens */
    sceneSecs: 3.2,     /* how long each weather scene holds; the sky crossfades for ~1.5 s of it */
    place: 'Springfield',  /* the name under the headline; null shows your own city */
    scale: 2,           /* how much larger the card is drawn; 1 plays on the dashboard card itself */
    bitrate: 20e6,      /* bits per second: full quality, as the source for the GIF (2.4e6 keeps 30 s under GitHub's 10 MB for videos) */
    /* the scenes shown, in order, by the names below; then the one the chart tour sits
       on. About 33 s in all. */
    order: ['sunny', 'rain', 'storm', 'snow'],
    tour: 'partly',
  };

  /* one forecast day: condition, high, low, rain (mm), wind (km/h), and peak UV */
  const D = (c, hi, lo, rain = 0, wind = 12, uv = 5, bearing = 260) => ({ c, hi, lo, rain, pop: rain ? Math.min(95, 40 + Math.round(rain * 5)) : 5, wind, bearing, uv });

  /* made-up weather, one scene each. at is the time of day the scene plays at (the page's
     clock is moved there); temp in the card's own unit; rates in mm/h, wind in km/h; sun is
     [elevation, azimuth] in degrees, negative elevation is night. week is the seven days
     after today in the forecast strip; today itself follows the scene. */
  const SCENES = [
    { id: 'sunny', at: '13:00', c: 'sunny', temp: 24, feels: 25, aqi: 2, dew: 11, solar: 780, cloud: 3, sun: [48, 170], uv: 7, wind: 8, bearing: 250,
      head: 'Clear', sub: 'Clear for the hour.', near: 'Clear throughout the day.', days: 'Sunny for the next few days, with highs near 27°; rain late in the week.',
      week: [D('sunny', 26, 15, 0, 9, 7), D('partlycloudy', 24, 14, 0, 12, 6), D('sunny', 27, 16, 0, 8, 7), D('partlycloudy', 25, 15, 0, 11, 6),
        D('cloudy', 22, 14, 0.4, 14, 4), D('rainy', 19, 13, 6, 22, 2), D('partlycloudy', 21, 12, 0, 12, 5)] },
    { id: 'partly', at: '15:00', c: 'partlycloudy', temp: 19, feels: 19, aqi: 3, dew: 12, solar: 430, cloud: 40, sun: [26, 235], uv: 4, wind: 18, bearing: 280,
      head: 'Partly Cloudy', sub: 'Partly cloudy for the hour.', near: 'Partly cloudy until evening.', days: 'Sunny for two days, then rain and a stormy day before it clears.' },
    { id: 'rain', at: '11:00', c: 'rainy', temp: 12, feels: 10, aqi: 1, dew: 11, solar: 70, cloud: 96, sun: [20, 200], rain: 2.5, type: 'rain', uv: 1, wind: 28, bearing: 200,
      head: 'Rain', sub: 'Rain for the hour.', near: 'Rain throughout the day.', days: 'Rain again tomorrow, then drying out and sunny for a few days.',
      week: [D('rainy', 13, 8, 9, 26, 1, 200), D('cloudy', 14, 9, 1.5, 18, 2), D('partlycloudy', 15, 8, 0, 12, 4), D('sunny', 16, 7, 0, 9, 5),
        D('sunny', 17, 8, 0, 8, 5), D('partlycloudy', 15, 9, 0, 14, 4), D('rainy', 13, 9, 7, 24, 1, 190)] },
    { id: 'storm', secs: 4.5, at: '22:30', c: 'lightning-rainy', temp: 17, feels: 17, aqi: 2, dew: 16, solar: 0, cloud: 100, sun: [-18, 300], rain: 9, type: 'rain', uv: 0, wind: 42, bearing: 230,
      head: 'Thunderstorms', sub: 'Heavy rain and thunder for the hour.', near: 'Thunderstorms until morning.', days: 'Showers tomorrow, then hot and sunny; more storms in a few days.',
      week: [D('rainy', 21, 15, 6, 24, 3, 220), D('partlycloudy', 24, 16, 0, 14, 6), D('sunny', 26, 17, 0, 10, 7), D('lightning-rainy', 23, 17, 12, 30, 3, 210),
        D('partlycloudy', 24, 16, 0, 15, 6), D('sunny', 25, 15, 0, 10, 7), D('sunny', 26, 16, 0, 9, 7)] },
    { id: 'snow', at: '10:30', c: 'snowy', temp: -3, feels: -8, aqi: 1, dew: -5, solar: 110, cloud: 100, sun: [14, 160], snow: 2, type: 'snow', uv: 1, wind: 15, bearing: 20,
      head: 'Snow', sub: 'Snow for the hour.', near: 'Snow throughout the day.', days: 'More snow tomorrow, then cold and clear; snow again late in the week.',
      week: [D('snowy', -2, -7, 5, 18, 1, 20), D('cloudy', -1, -6, 0, 14, 1), D('sunny', 1, -8, 0, 8, 2), D('sunny', 2, -9, 0, 7, 2),
        D('partlycloudy', 0, -6, 0, 10, 2), D('snowy', -1, -5, 3, 16, 1, 30), D('cloudy', 1, -4, 0, 12, 1)] },
    { id: 'fog', at: '08:30', c: 'fog', temp: 7, feels: 5, aqi: 4, dew: 7, solar: 40, cloud: 100, sun: [4, 105], uv: 0, wind: 3, bearing: 90,
      head: 'Foggy', sub: 'Foggy for the hour.', near: 'Fog clearing by noon.', days: 'Foggy mornings and sunny afternoons all week.',
      week: [D('partlycloudy', 15, 6, 0, 6, 4), D('sunny', 16, 6, 0, 5, 5), D('sunny', 17, 7, 0, 6, 5), D('partlycloudy', 16, 7, 0, 8, 4),
        D('sunny', 17, 6, 0, 6, 5), D('sunny', 18, 7, 0, 7, 5), D('partlycloudy', 16, 8, 0, 9, 4)] },
    { id: 'sunset', at: '18:50', c: 'partlycloudy', temp: 16, feels: 16, aqi: 3, dew: 9, solar: 25, cloud: 30, sun: [2, 285], uv: 0, wind: 10, bearing: 270,
      head: 'Partly Cloudy', sub: 'Partly cloudy for the hour.', near: 'Clearing tonight.', days: 'Clear skies ahead.',
      week: [D('sunny', 19, 9, 0, 9, 6), D('sunny', 20, 10, 0, 8, 6), D('partlycloudy', 19, 10, 0, 11, 5), D('sunny', 21, 10, 0, 8, 6),
        D('sunny', 22, 11, 0, 9, 6), D('partlycloudy', 20, 11, 0, 12, 5), D('sunny', 21, 10, 0, 9, 6)] },
    { id: 'night', at: '23:00', c: 'clear-night', temp: 11, feels: 10, aqi: 2, dew: 6, solar: 0, cloud: 0, sun: [-30, 340], uv: 0, wind: 5, bearing: 300,
      head: 'Clear', sub: 'Clear for the hour.', near: 'Clear overnight.', days: 'Clear and cool for a few days, then rain midweek.',
      week: [D('sunny', 19, 9, 0, 8, 6), D('sunny', 21, 10, 0, 7, 6), D('partlycloudy', 20, 11, 0, 11, 5), D('cloudy', 17, 11, 0.8, 16, 3),
        D('rainy', 15, 10, 7, 22, 2, 200), D('partlycloudy', 16, 9, 0, 13, 4), D('sunny', 18, 8, 0, 9, 5)] },
  ];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const deep = (root, sel, out = []) => {
    root.querySelectorAll('*').forEach((e) => { if (e.matches(sel)) out.push(e); if (e.shadowRoot) deep(e.shadowRoot, sel, out); });
    return out;
  };

  if (window.spyglassDemo) window.spyglassDemo.stop();
  const onPage = deep(document, 'spyglass-weather-card')[0];
  if (!onPage) { console.warn('spyglass demo: no Spyglass Weather Card on this page'); return; }
  /* The demo plays on a copy of the card on a dark stage over the page: laid out at the
     dashboard card's size, drawn DEMO.scale times larger, so a recording has crisp text
     instead of a small card blown up. The card on the dashboard is left alone. */
  let card = onPage, stage = null;
  if (DEMO.scale > 1) {
    const r = onPage.getBoundingClientRect();
    stage = document.createElement('div');
    stage.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:#111';
    const holder = document.createElement('div');
    holder.style.cssText = 'flex:none;width:' + r.width + 'px;height:' + r.height + 'px;transform:scale(' + DEMO.scale + ')';
    card = document.createElement(onPage.localName);
    card.setConfig(onPage._config);
    card.style.cssText = 'display:block;height:100%';
    holder.appendChild(card);
    stage.appendChild(holder);
    document.body.appendChild(stage);
  }
  const proto = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(card), 'hass');
  let real = onPage._hass, fake = null, stopped = false;

  /* ---------- the demo's own clock ----------
     Each scene plays at its own time of day: the page's clock (Date) is moved there, so
     the sunrise and sunset chip, the sun's arc, night hours, and "now" on every chart all
     agree with the sky. stop() puts the real clock back. */
  const RealDate = window.Date;
  let shift = 0;
  class DemoDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + shift); }
    static now() { return RealDate.now() + shift; }
  }
  window.Date = DemoDate;
  const setClock = (hhmm) => {
    if (!hhmm) { shift = 0; return; }
    const [h, m] = hhmm.split(':').map(Number), d = new RealDate();
    d.setHours(h, m || 0, 0, 0);
    shift = d.getTime() - RealDate.now();
  };

  /* ---------- a made-up week: the forecast, and the history behind the charts ----------
     One set of curves serves both, so the recorded part of a chart runs straight into the
     forecast. Temperature swings between each day's low (5 AM) and high (3 PM); UV and
     sunlight follow the sun; rain falls in the afternoon on wet days. */
  const WEEK = [   /* today, then the days ahead */
    { c: 'partlycloudy', hi: 20, lo: 10, rain: 0, pop: 10, wind: 14, bearing: 280, uv: 5 },
    { c: 'sunny', hi: 23, lo: 11, rain: 0, pop: 5, wind: 10, bearing: 260, uv: 7 },
    { c: 'sunny', hi: 25, lo: 13, rain: 0, pop: 0, wind: 8, bearing: 240, uv: 7 },
    { c: 'rainy', hi: 17, lo: 12, rain: 8, pop: 80, wind: 24, bearing: 200, uv: 2 },
    { c: 'lightning-rainy', hi: 18, lo: 12, rain: 15, pop: 90, wind: 32, bearing: 210, uv: 2 },
    { c: 'cloudy', hi: 16, lo: 10, rain: 1.2, pop: 40, wind: 18, bearing: 250, uv: 3 },
    { c: 'partlycloudy', hi: 19, lo: 9, rain: 0, pop: 10, wind: 12, bearing: 290, uv: 5 },
    { c: 'sunny', hi: 22, lo: 10, rain: 0, pop: 5, wind: 9, bearing: 270, uv: 6 },
  ];
  const PAST = [   /* yesterday, and the days before, repeating */
    { c: 'cloudy', hi: 18, lo: 11, rain: 0.4, pop: 30, wind: 16, bearing: 230, uv: 3 },
    { c: 'rainy', hi: 16, lo: 10, rain: 6, pop: 80, wind: 22, bearing: 190, uv: 2 },
    { c: 'partlycloudy', hi: 19, lo: 9, rain: 0, pop: 10, wind: 12, bearing: 280, uv: 5 },
  ];
  const today0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })();
  const dayN = (t) => Math.floor((t - today0) / 864e5);
  /* each scene brings its own today (a rainy scene has a rainy today) and its own week
     ahead; the tour, which has neither, uses WEEK */
  let todayOverride = null, weekOverride = null;
  const dayAt = (k) => {
    if (k < 0) return PAST[(-k - 1) % PAST.length];
    if (k === 0) return todayOverride || WEEK[0];
    const w = weekOverride || WEEK.slice(1);
    return w[Math.min(k - 1, w.length - 1)];
  };
  const todayFor = (sc) => {
    const night = sc.sun[0] < 0, wet = (sc.rain || 0) * 3 + (sc.snow || 0) * 2;
    return { c: sc.c === 'clear-night' ? 'sunny' : sc.c, hi: sc.temp + (night ? 6 : 3), lo: sc.temp - (night ? 2 : 6), rain: Math.round(wet * 10) / 10,
      pop: wet ? 85 : 5, wind: sc.wind, bearing: sc.bearing, uv: Math.max(sc.uv, { sunny: 7, 'clear-night': 7, partlycloudy: 5 }[sc.c] || 2) };
  };
  const hourOf = (t) => { const d = new Date(t); return d.getHours() + d.getMinutes() / 60; };
  const ease = (a, b, f) => a + (b - a) * (1 - Math.cos(Math.PI * f)) / 2;
  /* temperature: eased between the day's low at 5 AM and high at 3 PM, day after day */
  const tempAt = (t) => {
    const k = dayN(t), h = hourOf(t);
    const lo = (n) => dayAt(n).lo, hi = (n) => dayAt(n).hi;
    if (h < 5) return ease(hi(k - 1), lo(k), (h + 9) / 14);
    if (h < 15) return ease(lo(k), hi(k), (h - 5) / 10);
    return ease(hi(k), lo(k + 1), (h - 15) / 14);
  };
  const sunUp = (t, p) => { const h = hourOf(t); return h > 7 && h < 19 ? Math.pow(Math.sin(Math.PI * (h - 7) / 12), p) : 0; };
  const rainAt = (t) => { const dd = dayAt(dayN(t)); if (!dd.rain) return 0; const h = hourOf(t); return dd.rain / 4.4 * Math.exp(-Math.pow((h - 16) / 2.5, 2)); };
  const windAt = (t) => { const dd = dayAt(dayN(t)), h = hourOf(t); return dd.wind * (0.7 + 0.45 * Math.max(0, Math.sin(Math.PI * (h - 8) / 12))) + 1.5 * Math.sin(t / 17e5); };
  const humAt = (t) => { const dd = dayAt(dayN(t)); const f = (tempAt(t) - dd.lo) / Math.max(1, dd.hi - dd.lo); return Math.min(98, 88 - 32 * f + (dd.rain ? 8 : 0)); };
  const condAt = (t) => { const dd = dayAt(dayN(t)); if (dd.rain) return rainAt(t) > 0.3 ? dd.c : 'cloudy'; return dd.c; };
  const PW_ICON = { sunny: 'clear-day', partlycloudy: 'partly-cloudy-day', cloudy: 'cloudy', rainy: 'rain', 'lightning-rainy': 'thunderstorm', snowy: 'snow', 'snowy-rainy': 'sleet', fog: 'fog' };
  /* rain so far today, for the day summary: the day's curve added up to t */
  const rainSoFar = (t) => { const d0 = today0 + dayN(t) * 864e5; let s = 0; for (let u = d0; u < t; u += 12e5) s += rainAt(u) / 3; return s; };
  const VALUE = {
    temp: (t) => tempAt(t).toFixed(1),
    uv: (t) => (dayAt(dayN(t)).uv * sunUp(t, 1.6)).toFixed(1),
    solar: (t) => Math.round(118 * dayAt(dayN(t)).uv * sunUp(t, 1.3)),
    wind: (t) => windAt(t).toFixed(1),
    gust: (t) => (windAt(t) * 1.55 + 2).toFixed(1),
    bearing: (t) => Math.round(dayAt(dayN(t)).bearing + 20 * Math.sin(t / 9e6)),
    hum: (t) => Math.round(humAt(t)),
    dew: (t) => (tempAt(t) - (100 - humAt(t)) / 5).toFixed(1),
    aqi: (t) => { const h = hourOf(t); return 2 + (h > 9 && h < 19 ? 1 : 0) + (dayAt(dayN(t)).c === 'sunny' ? 1 : 0); },
    rain: (t) => rainAt(t).toFixed(2),
    pop: (t) => (rainAt(t) > 0.1 ? dayAt(dayN(t)).pop : Math.min(dayAt(dayN(t)).pop, 15)),
    cloud: (t) => ({ sunny: 5, partlycloudy: 40, cloudy: 90, rainy: 96, 'lightning-rainy': 100, snowy: 100, fog: 100 })[condAt(t)] || 50,
    rainacc: (t) => rainSoFar(t).toFixed(1),
    pressure: (t) => (1016 - (dayAt(dayN(t)).rain ? 7 : 0) + 2 * Math.sin(t / 3e7)).toFixed(1),
    zero: () => 0,
    icon: (t) => { const c = condAt(t), night = !sunUp(t, 1); return night && c === 'sunny' ? 'clear-night' : night && c === 'partlycloudy' ? 'partly-cloudy-night' : PW_ICON[c] || 'cloudy'; },
  };
  /* which made-up series each of the card's sensors gets */
  const kinds = () => {
    const o = (card._ctx && card._ctx.options) || {}, d = o.details || {}, p = o.precipitation || {}, k = {};
    const set = (id, kind) => { if (typeof id === 'string') k[id] = kind; };
    set(o.temperature_entity, 'temp'); set(o.apparent_temperature, 'temp'); set(o.icon_entity, 'icon'); set(o.pressure_entity, 'pressure'); set(o.cloud_entity, 'cloud');
    set(d.uv, 'uv'); set(d.solar, 'solar'); set(d.wind, 'wind'); set(d.gust, 'gust'); set(d.bearing, 'bearing'); set(d.humidity, 'hum');
    set(d.dew_point, 'dew'); set(d.aqi, 'aqi'); set(d.smoke, 'zero'); set(d.precip_probability, 'pop');
    set(p.rain, 'rain'); set(p.snow, 'zero'); set(p.ice, 'zero'); set(d.rain_today, 'rainacc'); set(d.snow_today, 'zero');
    return k;
  };
  /* the card asks Home Assistant for history; the made-up week answers, a reading every
     20 minutes up to now. Anything it doesn't know goes to Home Assistant as usual. */
  const history = (method, path) => {
    const m = /^history\/period\/([^?]+)\?(.*)$/.exec(path || '');
    if (method !== 'GET' || !m) return real.callApi(method, path);
    const q = new URLSearchParams(m[2]), ids = (q.get('filter_entity_id') || '').split(','), k = kinds();
    if (!ids.every((id) => k[id])) return real.callApi(method, path);
    const from = Date.parse(decodeURIComponent(m[1])), to = Math.min(Date.parse(q.get('end_time') || '') || Date.now(), Date.now());
    return Promise.resolve(ids.map((id) => {
      const out = [];
      for (let t = from; t <= to; t += 12e5) out.push({ state: String(VALUE[k[id]](t)), last_changed: new Date(t).toISOString() });
      if (out.length) out[0].entity_id = id;
      return out;
    }));
  };
  /* the forecast subscription: days and hours from the same week */
  const forecast = (type) => {
    if (type === 'hourly') {
      const start = Math.ceil(Date.now() / 36e5) * 36e5, out = [];
      for (let i = 0; i < 168; i++) {
        const t = start + i * 36e5;
        const c = condAt(t);
        out.push({ datetime: new Date(t).toISOString(), condition: c === 'sunny' && !sunUp(t, 1) ? 'clear-night' : c, temperature: +VALUE.temp(t), apparent_temperature: +VALUE.temp(t),
          precipitation: +VALUE.rain(t), precipitation_probability: VALUE.pop(t), wind_speed: +VALUE.wind(t), wind_gust_speed: +VALUE.gust(t),
          wind_bearing: VALUE.bearing(t), uv_index: +VALUE.uv(t), humidity: VALUE.hum(t), dew_point: +VALUE.dew(t), cloud_coverage: VALUE.cloud(t), pressure: +VALUE.pressure(t) });
      }
      return out;
    }
    return WEEK.map((w, i) => {
      const t = today0 + i * 864e5, dd = dayAt(i);
      return { datetime: new Date(t).toISOString(), condition: dd.c, temperature: dd.hi, templow: dd.lo, precipitation: dd.rain, precipitation_probability: dd.pop,
        wind_speed: dd.wind, wind_gust_speed: Math.round(dd.wind * 1.6), wind_bearing: dd.bearing, uv_index: dd.uv, humidity: dd.rain ? 85 : 65 };
    });
  };
  /* forecast subscriptions are kept, so each scene can send its own forecast */
  const subs = new Set();
  const pushForecast = () => subs.forEach((s) => s.cb({ type: s.type, forecast: forecast(s.type) }));
  const connection = () => {
    const c = Object.create(real.connection);
    c.subscribeMessage = (cb, msg) => {
      if (msg && msg.type === 'weather/subscribe_forecast') {
        const s = { cb, type: msg.forecast_type };
        subs.add(s);
        setTimeout(() => cb({ type: s.type, forecast: forecast(s.type) }), 0);
        return Promise.resolve(() => subs.delete(s));
      }
      return real.connection.subscribeMessage(cb, msg);
    };
    return c;
  };
  /* history the card already fetched belongs to the last scene's clock: drop it */
  const freshHistory = () => {
    const S = card.shadowRoot && card.shadowRoot.querySelector('ha-card') && card.shadowRoot.querySelector('ha-card').__wx;
    if (!S) return;
    Object.keys(S).forEach((k2) => { if (/Hist(_-?\d+)?(Busy)?$/.test(k2)) delete S[k2]; });
    S.histFloors = {}; S.sig = null;
  };
  /* the sun's next rising, setting, dawn, and dusk, moved to agree with the demo clock:
     today's real times, the next one after "now" */
  const sunAttrs = (id) => {
    const a = ((real.states[id] || {}).attributes) || {}, now = Date.now(), d0 = new RealDate();
    d0.setHours(0, 0, 0, 0);
    const out = {};
    ['next_rising', 'next_setting', 'next_dawn', 'next_dusk', 'next_noon', 'next_midnight'].forEach((k2) => {
      let t = RealDate.parse(a[k2]);
      if (!isFinite(t)) return;
      while (t >= d0.getTime() + 864e5) t -= 864e5;
      while (t < d0.getTime()) t += 864e5;
      if (t <= now) t += 864e5;
      out[k2] = new RealDate(t).toISOString();
    });
    return out;
  };
  /* a made-up hass: Home Assistant's own, with these states, forecast, and history */
  const makeFake = (states) => Object.assign(Object.create(Object.getPrototypeOf(real)), real, { states, connection: connection(), callApi: history });
  /* the forecast is subscribed once; drop what the card already has so it asks again */
  const resubscribe = () => {
    const S = card.shadowRoot && card.shadowRoot.querySelector('ha-card') && card.shadowRoot.querySelector('ha-card').__wx;
    if (!S) return;
    ['items', 'hours'].forEach((s) => { if (S[s + 'Unsub']) S[s + 'Unsub'].then((u) => u()).catch(() => {}); S[s + 'Unsub'] = null; S[s + 'Key'] = null; });
  };
  if (stage) proto.set.call(card, makeFake(real.states));
  else resubscribe();
  const root = card.shadowRoot;
  /* the name under the headline, for the length of the demo */
  const ownConfig = card._config;
  if (DEMO.place) card._config = Object.assign({}, ownConfig, { name: DEMO.place });

  /* The card is handed our made-up hass instead of the real one; the real one keeps
     arriving from Home Assistant and is kept for when the demo lets go. */
  Object.defineProperty(card, 'hass', {
    configurable: true,
    get: () => card._hass,
    set: (h) => { real = h; if (!fake) proto.set.call(card, h); },
  });

  const opt = () => (card._ctx && card._ctx.options) || {};
  const put = (states, id, state, attrs) => {
    if (!id || typeof id !== 'string' || !real.states[id]) return;
    const was = real.states[id];
    states[id] = Object.assign({}, was, { state: String(state), attributes: Object.assign({}, was.attributes, attrs || {}), last_updated: new Date().toISOString() });
  };
  const show = (sc) => {
    if (stopped) return;
    setClock(sc.at);
    todayOverride = sc.today === undefined ? todayFor(sc) : sc.today;
    weekOverride = sc.week || null;
    freshHistory();
    const o = opt(), d = o.details || {}, p = o.precipitation || {};
    const states = Object.assign({}, real.states);
    const night = sc.sun[0] < 0, sunId = o.sun_entity || 'sun.sun';
    put(states, card._config.entity, sc.c, { temperature: sc.temp, apparent_temperature: sc.feels, wind_speed: sc.wind, wind_bearing: sc.bearing });
    put(states, sunId, night ? 'below_horizon' : 'above_horizon', Object.assign(sunAttrs(sunId), { elevation: sc.sun[0], azimuth: sc.sun[1] }));
    put(states, d.rain_today, VALUE.rainacc(Date.now()));
    put(states, d.snow_today, 0);
    put(states, o.condition_entity, sc.head);
    put(states, o.subtitle_entity, sc.sub);
    put(states, o.hourly_summary_entity, sc.near);
    put(states, o.summary_entity, sc.days);
    put(states, o.cloud_entity, sc.cloud);
    put(states, typeof o.apparent_temperature === 'string' ? o.apparent_temperature : null, sc.feels);
    put(states, p.type, sc.type || 'none');
    put(states, p.rain, sc.rain || 0, { unit_of_measurement: 'mm/h' });
    put(states, p.snow, sc.snow || 0, { unit_of_measurement: 'mm/h' });
    put(states, p.ice, sc.ice || 0, { unit_of_measurement: 'mm/h' });
    put(states, d.uv, sc.uv);
    put(states, d.aqi, sc.aqi);   /* on your card's scale: AQHI 1–10, or AQI / CAQI numbers */
    if (typeof d.wind === 'string') put(states, d.wind, sc.wind, { unit_of_measurement: 'km/h' });
    put(states, d.gust, Math.round(sc.wind * 1.6), { unit_of_measurement: 'km/h' });
    put(states, d.bearing, sc.bearing);
    put(states, d.precip_probability, sc.rain || sc.snow ? 90 : 5);
    put(states, d.dew_point, sc.dew);
    put(states, d.solar, sc.solar);
    fake = makeFake(states);
    proto.set.call(card, fake);
    pushForecast();
  };
  /* back to the real weather: the dashboard card at the end; the copy on the stage just
     stays as it is until stop() takes it away */
  const letGo = () => { if (stage) return; fake = null; resubscribe(); proto.set.call(card, real); };

  /* a soft circle where the "finger" is */
  let dot = null;
  const touch = (x, y, on) => {
    if (!DEMO.touches) return;
    if (!dot) {
      dot = document.createElement('div');
      dot.style.cssText = 'position:fixed;z-index:2147483647;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;'
        + 'background:rgba(255,255,255,0.35);box-shadow:0 0 0 2px rgba(255,255,255,0.6);pointer-events:none;opacity:0;transition:opacity .2s';
      document.body.appendChild(dot);
    }
    dot.style.left = x + 'px'; dot.style.top = y + 'px'; dot.style.opacity = on ? '1' : '0';
  };
  /* el is an element, or a function that finds it: a view can redraw its header between
     the finger landing and the click, so a function is asked again right before clicking */
  const tap = async (el) => {
    const get = typeof el === 'function' ? el : () => el;
    const e0 = get();
    if (!e0 || stopped) return;
    const r = e0.getBoundingClientRect();
    touch(r.left + r.width / 2, r.top + r.height / 2, true);
    await sleep(250);
    const e1 = get();
    if (e1 && e1.isConnected) e1.click();
    await sleep(200);
    touch(0, 0, false);
  };
  /* A finger reading the chart: it lands, sweeps to a spot, settles, drifts back a little
     or pushes on a little, and carries on, the way a person looks for a value. Each leg
     eases in and out, takes time by how far it goes, and the stops are short and uneven.
     path: stops as fractions of the chart's width; each drag picks one of a few. */
  const PATHS = [
    [0.14, 0.6, 0.5, 0.84],
    [0.2, 0.7, 0.62, 0.78],
  ];
  let pathN = 0;
  const drag = async (path) => {
    const svg = [...root.querySelectorAll('svg')].find((s) => s.__scrub);
    if (!svg || stopped) return;
    path = path || PATHS[pathN++ % PATHS.length];
    const r = svg.getBoundingClientRect(), y0 = r.top + r.height * 0.55;
    const X = (k) => r.left + r.width * k;
    const ev = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 7, pointerType: 'mouse', buttons: type === 'pointerup' ? 0 : 1 }));
    const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    let x = X(path[0]), y = y0;
    ev('pointerdown', x, y); touch(x, y, true);
    await sleep(160);
    for (let i = 1; i < path.length && !stopped; i++) {
      const a = X(path[i - 1]), b = X(path[i]);
      const dist = Math.abs(path[i] - path[i - 1]);
      const ms = 320 + dist * 1900;                         /* a full sweep in about 2.2 s */
      const dy = (Math.random() - 0.5) * 6;                 /* a finger never moves dead level */
      const t0 = performance.now();
      await new Promise((done) => {
        const step = (now) => {
          if (stopped) return done();
          const k = Math.min(1, (now - t0) / ms), e = ease(k);
          x = a + (b - a) * e; y = y0 + dy * Math.sin(Math.PI * k);
          ev('pointermove', x, y); touch(x, y, true);
          if (k < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });
      await sleep(i === path.length - 1 ? 500 : 300 + Math.random() * 500);
    }
    ev('pointerup', x, y); touch(0, 0, false);
  };
  const chip = (re) => [...root.querySelectorAll('.wx-chip')].find((c) => re.test((c.querySelector('.wx-chip-label') || {}).textContent || ''));
  const arrow = (i) => root.querySelectorAll('.wx-daynav-btn')[i];
  /* Back, and make sure it took: tap again if the view is still open a moment later */
  const back = async () => {
    for (let k = 0; k < 3 && !stopped; k++) {
      await tap(() => root.querySelector('.wx-fc-back'));
      await sleep(150);
      if (!root.querySelector('.wx-viewing')) return;
    }
  };

  const scene = (id) => SCENES.find((s) => s.id === id);
  const realRandom = Math.random;

  /* About 33 s: the weather scenes, then a short tour on one held scene — a look at the
     wind chart and the sun's arc, then a forecast day's hours, read with a drag. */
  const home = async () => { if (root.querySelector('.wx-fc-back')) { root.querySelector('.wx-fc-back').click(); await sleep(600); } };
  const play = async () => {
    do {
      for (const id of DEMO.order) {
        const sc = scene(id);
        if (stopped) break;
        if (!sc) continue;
        /* The card times its strikes at random and makes most of them distant flashes;
           in a few seconds of video that can mean none at all. While a storm shows, its
           dice are loaded: strikes come sooner and are close, visible bolts. */
        const storm = /lightning/.test(sc.c);
        if (storm) Math.random = () => realRandom() * 0.3;
        try { show(sc); await sleep((sc.secs || DEMO.sceneSecs) * 1000); } finally { Math.random = realRandom; }
      }
      if (stopped) break;
      /* the tour's scene reads its numbers off the made-up week at this moment, so each
         chart's "now" dot sits on its line */
      if (scene(DEMO.tour)) {
        /* the week's own today, at the tour scene's time */
        setClock(scene(DEMO.tour).at); todayOverride = null; weekOverride = scene(DEMO.tour).week || null;
        const t = Date.now();
        show(Object.assign({}, scene(DEMO.tour), { today: null, temp: Math.round(tempAt(t)), feels: Math.round(tempAt(t)), wind: Math.round(windAt(t)), bearing: VALUE.bearing(t),
          uv: +VALUE.uv(t), dew: Math.round(+VALUE.dew(t)), solar: VALUE.solar(t), aqi: VALUE.aqi(t), cloud: VALUE.cloud(t) }));
      }
      /* the sky settles on the tour's scene before the first tap; the main view shows for
         a moment between views, and holds at the end so a looping GIF restarts calmly */
      await sleep(1500);
      const wind = chip(/^Wind$/);
      if (wind && !stopped) { await tap(wind); await sleep(2200); await back(); await sleep(1200); }
      const sun = chip(/^Sun(rise|set)$/);
      if (sun && !stopped) { await tap(sun); await sleep(2500); await back(); await sleep(1200); }
      const day = root.querySelectorAll('.wx-item.wx-tappable')[1] || root.querySelector('.wx-item.wx-tappable');
      if (day && !stopped) { await tap(day); await sleep(900); await drag(); await sleep(500); await back(); await sleep(2000); }
    } while (DEMO.loop && !stopped);
  };
  const run = async () => {
    stopped = false;
    await home();
    await play();
    if (!stopped) letGo();
  };

  /* Recording: the browser captures this tab, cropped to the card, onto a canvas that
     leaves the rounded corners clear, and the canvas is what's recorded, so the video is the
     card alone with transparent corners. It stops when the demo ends and downloads
     spyglass-weather-card-demo.webm. In Chrome and Edge the browser itself crops the
     capture to the card (Region Capture), so the sharing bar appearing or the capture
     changing resolution midway can't shift it; elsewhere the crop is worked out from the
     page every frame, and Firefox (which can't share a single tab) keeps the whole frame. */
  const recordRun = async () => {
    stopped = false;
    await home();
    /* the first scene is already in place when the video starts */
    const first = scene(DEMO.order[0]);
    if (first) { show(first); await sleep(1800); }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 60 }, audio: false, preferCurrentTab: true, selfBrowserSurface: 'include' });
    const [track] = stream.getVideoTracks();
    let cropped = false;
    if (window.CropTarget && track.cropTo) {
      try { await track.cropTo(await CropTarget.fromElement(card)); cropped = true; } catch (e) { console.warn('spyglass demo: Region Capture failed, cropping by hand', e); }
    }
    const video = document.createElement('video');
    video.srcObject = stream; video.muted = true; video.playsInline = true;
    await video.play();
    await sleep(900);                                  /* let the sharing bar and the crop settle */
    const box = card.getBoundingClientRect();
    /* how the video maps onto the page, measured again each frame when cropping by hand */
    const map = () => ({ sx: video.videoWidth / innerWidth, sy: video.videoHeight / innerHeight });
    const m0 = map();
    const isTab = cropped || Math.abs(m0.sx - m0.sy) < 0.02;
    if (!isTab) console.warn('spyglass demo: not a single tab, so the whole frame is recorded. Chrome or Edge can share just this tab.');
    const canvas = document.createElement('canvas');
    canvas.width = cropped ? video.videoWidth : isTab ? Math.round(box.width * m0.sx) : video.videoWidth;
    canvas.height = cropped ? video.videoHeight : isTab ? Math.round(box.height * m0.sy) : video.videoHeight;
    const ctx = canvas.getContext('2d');
    /* the card's rounded corners stay transparent: everything outside its outline is left
       clear, and Chrome's recorder keeps the transparency in the WebM */
    if (isTab) {
      const px = canvas.width / box.width;               /* video pixels per CSS pixel on screen */
      const scale = box.width / (card.offsetWidth || box.width);
      const rad = (parseFloat(getComputedStyle(root.querySelector('ha-card')).borderTopLeftRadius) || 12) * scale * px;
      ctx.beginPath(); ctx.roundRect(0, 0, canvas.width, canvas.height, rad); ctx.clip();
    }
    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (cropped) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      else if (isTab) { const r = card.getBoundingClientRect(), m = map(); ctx.drawImage(video, r.left * m.sx, r.top * m.sy, r.width * m.sx, r.height * m.sy, 0, 0, canvas.width, canvas.height); }
      else ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(frame);
    };
    frame();
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(canvas.captureStream(60), { mimeType: mime, videoBitsPerSecond: DEMO.bitrate });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.start(250);
    try {
      await sleep(400);
      await play();
      await sleep(800);
    } finally {
      rec.stop();
      await new Promise((r) => { rec.onstop = r; });
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
      a.download = 'spyglass-weather-card-demo.webm';
      a.click();
      stop();                                          /* the page as it was: stage gone, real clock back */
    }
  };

  /* a button to start recording: the browser only lets a page capture the screen after a
     click, and pasting into the console doesn't count as one */
  let recBtn = null;
  const offerRecording = () => {
    recBtn = document.createElement('button');
    recBtn.textContent = '● Record demo';
    recBtn.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;padding:10px 18px;'
      + 'border:none;border-radius:999px;background:#c62828;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)';
    recBtn.addEventListener('click', () => {
      recBtn.remove(); recBtn = null;
      recordRun().catch((e) => { console.warn('spyglass demo: recording did not start', e); stop(); });
    });
    document.body.appendChild(recBtn);
  };

  const stop = () => {
    stopped = true;
    if (recBtn) { recBtn.remove(); recBtn = null; }
    Math.random = realRandom;
    window.Date = RealDate; shift = 0;               /* the real clock again */
    card._config = ownConfig;
    delete card.hass;
    if (!stage) resubscribe();                        /* the real forecast again */
    if (card._hass !== real) card.hass = real;
    if (card._update) card._update();
    if (dot) { dot.remove(); dot = null; }
    if (stage) { stage.remove(); stage = null; }
    delete window.spyglassDemo;
  };

  window.spyglassDemo = { run, stop, record: offerRecording, DEMO, SCENES };
  if (DEMO.record) offerRecording(); else run();
})();
