const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Script, createContext } = require('node:vm');

// Minimal DOM for render/cache tests; layout and animations require Home Assistant.
class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.clientWidth = this.clientHeight = this.offsetHeight = this.scrollWidth = this.scrollLeft = 0;
    this.isConnected = true;
    this.style = {
      setProperty(name, value) { this[name] = value; },
      getPropertyValue(name) { return this[name] || ''; },
    };
    this.classList = {
      contains: (name) => this.className.split(/\s+/).includes(name),
      toggle: (name, on) => {
        const names = new Set(this.className.split(/\s+/).filter(Boolean));
        if (on ?? !names.has(name)) names.add(name); else names.delete(name);
        this.className = [...names].join(' ');
      },
      add: (...names) => names.forEach((name) => this.classList.toggle(name, true)),
      remove: (...names) => names.forEach((name) => this.classList.toggle(name, false)),
    };
  }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  insertBefore(child, before) {
    child.parentNode = this;
    const index = this.children.indexOf(before);
    this.children.splice(index < 0 ? this.children.length : index, 0, child);
    return child;
  }
  get firstChild() { return this.children[0] || null; }
  set innerHTML(value) {
    if (value !== '') throw new Error('HTML parsing is outside this test DOM');
    this.children = [];
    this._text = '';
  }
  set textContent(value) { this.children = []; this._text = String(value); }
  get textContent() { return (this._text || '') + this.children.map((child) => child.textContent).join(''); }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.className = String(value);
  }
  setAttributeNS(_, name, value) { this.setAttribute(name, value); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  querySelectorAll(selector) {
    const [tag, ...classes] = selector.split('.');
    const matches = (node) => (!tag || node.tagName.toLowerCase() === tag)
      && classes.every((name) => node.classList.contains(name));
    return this.children.flatMap((child) => [
      ...(matches(child) ? [child] : []), ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

module.exports = function createCardHarness(options = {}) {
  const now = Date.parse('2026-11-05T10:00:00Z');
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const subscriptions = [];
  const historyRequests = [];
  const timers = [];
  const context = createContext({
    HTMLElement: Element,
    document: { createElement: (tag) => new Element(tag), createElementNS: (_, tag) => new Element(tag) },
    customElements: { get: () => true },
    window: options.window || { matchMedia: () => ({ matches: true }) },
    matchMedia: () => ({ matches: true }),
    requestAnimationFrame: () => {},
    setTimeout: (callback) => timers.push(callback),
    clearTimeout: () => {},
    Date: FixedDate,
    console: { error: (...args) => { throw new Error(args.join(' ')); } },
  });
  const source = readFileSync(join(__dirname, '..', '..', 'spyglass-weather-card.js'), 'utf8');
  new Script(source + '\nthis.Card = SpyglassWeatherCard;').runInContext(context);
  const card = new context.Card();
  // Only the fixed initial HTML is supplied here; setters, update() and draw() run unchanged.
  card._build = function () {
    const root = new Element('ha-card');
    const add = (parent, name) => {
      const node = new Element(); node.className = name; parent.appendChild(node); return node;
    };
    const box = add(root, 'wx-box'), head = add(box, 'wx-head');
    add(head, 'wx-hero');
    const title = add(head, 'wx-title');
    this._head = { icon: new Element(), name: add(title, 'wx-name'), state: add(title, 'wx-state') };
    this.__wxGrid = true;
    this._ctx = { card: root, host: this, options: this._options };
  };
  const hass = {
    locale: { language: 'en-GB', time_format: '12', number_format: 'comma_decimal' },
    states: {
      'weather.home': { state: 'sunny', attributes: { temperature: 12, wind_speed: 10, wind_bearing: 90 } },
      'sun.sun': { state: 'above_horizon', attributes: {
        next_dawn: '2026-11-06T05:30:00Z', next_rising: '2026-11-06T06:00:00Z',
        next_setting: '2026-11-05T16:00:00Z', next_dusk: '2026-11-05T16:30:00Z',
      } },
    },
    connection: { subscribeMessage: (callback, message) => {
      subscriptions.push({ callback, message });
      return Promise.resolve(() => {});
    } },
    callApi: (method, url) => {
      historyRequests.push({ method, url });
      return new Promise(() => {});
    },
  };
  card.setConfig({ entity: 'weather.home', details: { wind: true }, return_home_after: 0 });
  return { card, hass, subscriptions, historyRequests, now, window: context.window,
    flushTimers: () => { while (timers.length) timers.shift()(); } };
};
