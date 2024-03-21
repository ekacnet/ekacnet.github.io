(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.cubism = {}, global.d3));
})(this, (function (exports, d3) { 'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

  const version = "1.1.3";

  var noop = {
    value: () => {}
  };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function (t) {
      var name = "",
        i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {
        type: t,
        name: name
      };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function (typename, callback) {
      var _ = this._,
        T = parseTypenames$1(typename + "", _),
        t,
        i = -1,
        n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function () {
      var copy = {},
        _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function (type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function (type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({
      name: name,
      value: callback
    });
    return type;
  }

  function ascending$1 (a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector (f) {
    let delta = f;
    let compare = f;
    if (f.length === 1) {
      delta = (d, x) => f(d) - x;
      compare = ascendingComparator(f);
    }
    function left(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;else hi = mid;
      }
      return lo;
    }
    function right(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;else lo = mid + 1;
      }
      return lo;
    }
    function center(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }
    return {
      left,
      center,
      right
    };
  }
  function ascendingComparator(f) {
    return (d, x) => ascending$1(f(d), x);
  }

  function number$3 (x) {
    return x === null ? NaN : +x;
  }

  const ascendingBisect = bisector(ascending$1);
  const bisectRight = ascendingBisect.right;
  bisector(number$3).center;

  var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
  function ticks (start, stop, count) {
    var reverse,
      i = -1,
      n,
      ticks,
      step;
    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];
    if (step > 0) {
      let r0 = Math.round(start / step),
        r1 = Math.round(stop / step);
      if (r0 * step < start) ++r0;
      if (r1 * step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) * step;
    } else {
      step = -step;
      let r0 = Math.round(start * step),
        r1 = Math.round(stop * step);
      if (r0 / step < start) ++r0;
      if (r1 / step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) / step;
    }
    if (reverse) ticks.reverse();
    return ticks;
  }
  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
    return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }
  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
    if (error >= e10) step1 *= 10;else if (error >= e5) step1 *= 5;else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range).domain(domain);
        break;
    }
    return this;
  }

  function define (constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
    reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
    reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
    reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
    reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
    reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };
  define(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
    : l === 3 ? new Rgb(m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, (m & 0xf) << 4 | m & 0xf, 1) // #f00
    : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
    : l === 4 ? rgba(m >> 12 & 0xf | m >> 8 & 0xf0, m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, ((m & 0xf) << 4 | m & 0xf) / 0xff) // #f000
    : null // invalid hex
    ) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
    : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
    : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
    : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
    : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
    : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
    : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
    : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb$1(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define(Rgb, rgb$1, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;else if (l <= 0 || l >= 1) h = s = NaN;else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;else if (g === max) h = (b - r) / s + 2;else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
      return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  var constant$1 = (x => () => x);

  function linear$1(a, d) {
    return function (t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function (t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function (a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var rgb = (function rgbGamma(y) {
    var color = gamma(y);
    function rgb(start, end) {
      var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
      return function (t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }
    rgb.gamma = rgbGamma;
    return rgb;
  })(1);

  function numberArray (a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
    return function (t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }
  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;
    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];
    return function (t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date$1 (a, b) {
    var d = new Date();
    return a = +a, b = +b, function (t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber (a, b) {
    return a = +a, b = +b, function (t) {
      return a * (1 - t) + b * t;
    };
  }

  function object (a, b) {
    var i = {},
      c = {},
      k;
    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};
    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function (t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function () {
      return b;
    };
  }
  function one(b) {
    return function (t) {
      return b(t) + "";
    };
  }
  function string (a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0,
      // scan index for next number in b
      am,
      // current match in a
      bm,
      // current match in b
      bs,
      // string preceding current number in b, if any
      i = -1,
      // index in s
      s = [],
      // string constants and placeholders
      q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else {
        // interpolate non-matching numbers
        s[++i] = null;
        q.push({
          i: i,
          x: interpolateNumber(am, bm)
        });
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function (t) {
      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    });
  }

  function interpolate (a, b) {
    var t = typeof b,
      c;
    return b == null || t === "boolean" ? constant$1(b) : (t === "number" ? interpolateNumber : t === "string" ? (c = color(b)) ? (b = c, rgb) : string : b instanceof color ? rgb : b instanceof Date ? date$1 : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber)(a, b);
  }

  function interpolateRound (a, b) {
    return a = +a, b = +b, function (t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  function constants(x) {
    return function () {
      return x;
    };
  }

  function number$2(x) {
    return +x;
  }

  var unit = [0, 1];
  function identity$2(x) {
    return x;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function (x) {
      return (x - a) / b;
    } : constants(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function (x) {
      return Math.max(a, Math.min(b, x));
    };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0],
      d1 = domain[1],
      r0 = range[0],
      r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function (x) {
      return r0(d0(x));
    };
  }
  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }
    return function (x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit,
      range = unit,
      interpolate$1 = interpolate,
      transform,
      untransform,
      unknown,
      clamp = identity$2,
      piecewise,
      output,
      input;
    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$2) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }
    scale.invert = function (y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };
    scale.domain = function (_) {
      return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
    };
    scale.range = function (_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };
    scale.rangeRound = function (_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };
    scale.clamp = function (_) {
      return arguments.length ? (clamp = _ ? true : identity$2, rescale()) : clamp !== identity$2;
    };
    scale.interpolate = function (_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };
    scale.unknown = function (_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function (t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity$2, identity$2);
  }

  function formatDecimal (x) {
    return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimalParts(1.23) returns ["123", 0].
  function formatDecimalParts(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i,
      coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x.slice(i + 1)];
  }

  function exponent (x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup (grouping, thousands) {
    return function (value, width) {
      var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
    };
  }

  function formatNumerals (numerals) {
    return function (value) {
      return value.replace(/[0-9]/g, function (i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }
  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }
  FormatSpecifier.prototype.toString = function () {
    return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === undefined ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim (s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0) i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i]) break out;
          if (i0 > 0) i0 = 0;
          break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;
  function formatPrefixAuto (x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded (x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
      exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": x => Math.round(x).toString(2),
    "c": x => x + "",
    "d": formatDecimal,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": x => Math.round(x).toString(8),
    "p": (x, p) => formatRounded(x * 100, p),
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": x => Math.round(x).toString(16).toUpperCase(),
    "x": x => Math.round(x).toString(16)
  };

  function identity$1 (x) {
    return x;
  }

  var map = Array.prototype.map,
    prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function formatLocale$1 (locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "−" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";
    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);
      var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format(value) {
        var valuePrefix = prefix,
          valueSuffix = suffix,
          i,
          n,
          c;
        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Determine the sign. -0 is not less than 0, but 1 / -0 is!
          var valueNegative = value < 0 || 1 / value < 0;

          // Perform the initial formatting.
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }
        return numerals(value);
      }
      format.toString = function () {
        return specifier + "";
      };
      return format;
    }
    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
      return function (value) {
        return f(k * value) + prefix;
      };
    }
    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale$1;
  var format;
  var formatPrefix;
  defaultLocale$1({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale$1(definition) {
    locale$1 = formatLocale$1(definition);
    format = locale$1.format;
    formatPrefix = locale$1.formatPrefix;
    return locale$1;
  }

  function precisionFixed (step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix (step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound (step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
      precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s":
        {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
      case "":
      case "e":
      case "g":
      case "p":
      case "r":
        {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
      case "f":
      case "%":
        {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function (count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function (count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function (count) {
      if (count == null) count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear() {
    var scale = continuous();
    scale.copy = function () {
      return copy(scale, linear());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  function nice(domain, interval) {
    domain = domain.slice();
    var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      t;
    if (x1 < x0) {
      t = i0, i0 = i1, i1 = t;
      t = x0, x0 = x1, x1 = t;
    }
    domain[i0] = interval.floor(x0);
    domain[i1] = interval.ceil(x1);
    return domain;
  }

  var t0 = new Date(),
    t1 = new Date();
  function newInterval(floori, offseti, count, field) {
    function interval(date) {
      return floori(date = arguments.length === 0 ? new Date() : new Date(+date)), date;
    }
    interval.floor = function (date) {
      return floori(date = new Date(+date)), date;
    };
    interval.ceil = function (date) {
      return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
    };
    interval.round = function (date) {
      var d0 = interval(date),
        d1 = interval.ceil(date);
      return date - d0 < d1 - date ? d0 : d1;
    };
    interval.offset = function (date, step) {
      return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
    };
    interval.range = function (start, stop, step) {
      var range = [],
        previous;
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      do range.push(previous = new Date(+start)), offseti(start, step), floori(start); while (previous < start && start < stop);
      return range;
    };
    interval.filter = function (test) {
      return newInterval(function (date) {
        if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
      }, function (date, step) {
        if (date >= date) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
          } else while (--step >= 0) {
            while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
          }
        }
      });
    };
    if (count) {
      interval.count = function (start, end) {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };
      interval.every = function (step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? function (d) {
          return field(d) % step === 0;
        } : function (d) {
          return interval.count(0, d) % step === 0;
        });
      };
    }
    return interval;
  }

  var millisecond = newInterval(function () {
    // noop
  }, function (date, step) {
    date.setTime(+date + step);
  }, function (start, end) {
    return end - start;
  });

  // An optimized implementation for this simple case.
  millisecond.every = function (k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(function (date) {
      date.setTime(Math.floor(date / k) * k);
    }, function (date, step) {
      date.setTime(+date + step * k);
    }, function (start, end) {
      return (end - start) / k;
    });
  };
  millisecond.range;

  const durationSecond = 1000;
  const durationMinute = durationSecond * 60;
  const durationHour = durationMinute * 60;
  const durationDay = durationHour * 24;
  const durationWeek = durationDay * 7;
  const durationMonth = durationDay * 30;
  const durationYear = durationDay * 365;

  var second = newInterval(function (date) {
    date.setTime(date - date.getMilliseconds());
  }, function (date, step) {
    date.setTime(+date + step * durationSecond);
  }, function (start, end) {
    return (end - start) / durationSecond;
  }, function (date) {
    return date.getUTCSeconds();
  });
  var utcSecond = second;
  second.range;

  var minute = newInterval(function (date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
  }, function (date, step) {
    date.setTime(+date + step * durationMinute);
  }, function (start, end) {
    return (end - start) / durationMinute;
  }, function (date) {
    return date.getMinutes();
  });
  var timeMinute = minute;
  minute.range;

  var hour = newInterval(function (date) {
    date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
  }, function (date, step) {
    date.setTime(+date + step * durationHour);
  }, function (start, end) {
    return (end - start) / durationHour;
  }, function (date) {
    return date.getHours();
  });
  var timeHour = hour;
  hour.range;

  var day = newInterval(date => date.setHours(0, 0, 0, 0), (date, step) => date.setDate(date.getDate() + step), (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay, date => date.getDate() - 1);
  var timeDay = day;
  day.range;

  function weekday(i) {
    return newInterval(function (date) {
      date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
      date.setHours(0, 0, 0, 0);
    }, function (date, step) {
      date.setDate(date.getDate() + step * 7);
    }, function (start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
    });
  }
  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);
  sunday.range;
  monday.range;
  tuesday.range;
  wednesday.range;
  thursday.range;
  friday.range;
  saturday.range;

  var month = newInterval(function (date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setMonth(date.getMonth() + step);
  }, function (start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, function (date) {
    return date.getMonth();
  });
  var timeMonth = month;
  month.range;

  var year = newInterval(function (date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setFullYear(date.getFullYear() + step);
  }, function (start, end) {
    return end.getFullYear() - start.getFullYear();
  }, function (date) {
    return date.getFullYear();
  });

  // An optimized implementation for this simple case.
  year.every = function (k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function (date) {
      date.setFullYear(Math.floor(date.getFullYear() / k) * k);
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function (date, step) {
      date.setFullYear(date.getFullYear() + step * k);
    });
  };
  var timeYear = year;
  year.range;

  var utcDay = newInterval(function (date) {
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCDate(date.getUTCDate() + step);
  }, function (start, end) {
    return (end - start) / durationDay;
  }, function (date) {
    return date.getUTCDate() - 1;
  });
  utcDay.range;

  function utcWeekday(i) {
    return newInterval(function (date) {
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
      date.setUTCHours(0, 0, 0, 0);
    }, function (date, step) {
      date.setUTCDate(date.getUTCDate() + step * 7);
    }, function (start, end) {
      return (end - start) / durationWeek;
    });
  }
  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);
  utcSunday.range;
  utcMonday.range;
  utcTuesday.range;
  utcWednesday.range;
  utcThursday.range;
  utcFriday.range;
  utcSaturday.range;

  var utcYear = newInterval(function (date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step);
  }, function (start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, function (date) {
    return date.getUTCFullYear();
  });

  // An optimized implementation for this simple case.
  utcYear.every = function (k) {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function (date) {
      date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function (date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step * k);
    });
  };
  utcYear.range;

  function ticker(year, month, week, day, hour, minute) {
    const tickIntervals = [[utcSecond, 1, durationSecond], [utcSecond, 5, 5 * durationSecond], [utcSecond, 15, 15 * durationSecond], [utcSecond, 30, 30 * durationSecond], [minute, 1, durationMinute], [minute, 5, 5 * durationMinute], [minute, 15, 15 * durationMinute], [minute, 30, 30 * durationMinute], [hour, 1, durationHour], [hour, 3, 3 * durationHour], [hour, 6, 6 * durationHour], [hour, 12, 12 * durationHour], [day, 1, durationDay], [day, 2, 2 * durationDay], [week, 1, durationWeek], [month, 1, durationMonth], [month, 3, 3 * durationMonth], [year, 1, durationYear]];
    function ticks(start, stop, count) {
      const reverse = stop < start;
      if (reverse) [start, stop] = [stop, start];
      const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
      const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop
      return reverse ? ticks.reverse() : ticks;
    }
    function tickInterval(start, stop, count) {
      const target = Math.abs(stop - start) / count;
      const i = bisector(([,, step]) => step).right(tickIntervals, target);
      if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
      if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
      const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
      return t.every(step);
    }
    return [ticks, tickInterval];
  }
  const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, sunday, timeDay, timeHour, timeMinute);

  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date.setFullYear(d.y);
      return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }
  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date.setUTCFullYear(d.y);
      return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }
  function newDate(y, m, d) {
    return {
      y: y,
      m: m,
      d: d,
      H: 0,
      M: 0,
      S: 0,
      L: 0
    };
  }
  function formatLocale(locale) {
    var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;
    var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);
    var formats = {
      "a": formatShortWeekday,
      "A": formatWeekday,
      "b": formatShortMonth,
      "B": formatMonth,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "f": formatMicroseconds,
      "g": formatYearISO,
      "G": formatFullYearISO,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes$1,
      "p": formatPeriod,
      "q": formatQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatSeconds$1,
      "u": formatWeekdayNumberMonday,
      "U": formatWeekNumberSunday,
      "V": formatWeekNumberISO,
      "w": formatWeekdayNumberSunday,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };
    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "f": formatUTCMicroseconds,
      "g": formatUTCYearISO,
      "G": formatUTCFullYearISO,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "q": formatUTCQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatUTCSeconds,
      "u": formatUTCWeekdayNumberMonday,
      "U": formatUTCWeekNumberSunday,
      "V": formatUTCWeekNumberISO,
      "w": formatUTCWeekdayNumberSunday,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };
    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "f": parseMicroseconds,
      "g": parseYear,
      "G": parseFullYear,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "q": parseQuarter,
      "Q": parseUnixTimestamp,
      "s": parseUnixTimestampSeconds,
      "S": parseSeconds,
      "u": parseWeekdayNumberMonday,
      "U": parseWeekNumberSunday,
      "V": parseWeekNumberISO,
      "w": parseWeekdayNumberSunday,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };

    // These recursive directive definitions must be deferred.
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);
    function newFormat(specifier, formats) {
      return function (date) {
        var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;
        if (!(date instanceof Date)) date = new Date(+date);
        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);else pad = c === "e" ? " " : "0";
            if (format = formats[c]) c = format(date, pad);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }
    function newParse(specifier, Z) {
      return function (string) {
        var d = newDate(1900, undefined, 1),
          i = parseSpecifier(d, specifier, string += "", 0),
          week,
          day;
        if (i != string.length) return null;

        // If a UNIX timestamp is specified, return it.
        if ("Q" in d) return new Date(d.Q);
        if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

        // If this is utcParse, never use the local timezone.
        if (Z && !("Z" in d)) d.Z = 0;

        // The am-pm flag is 0 for AM, and 1 for PM.
        if ("p" in d) d.H = d.H % 12 + d.p * 12;

        // If the month was not specified, inherit from the quarter.
        if (d.m === undefined) d.m = "q" in d ? d.q : 0;

        // Convert day-of-week and week-of-year to day-of-year.
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
            week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + (d.w + 6) % 7;
          } else {
            week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
            week = day > 4 || day === 0 ? monday.ceil(week) : monday(week);
            week = timeDay.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + (d.w + 6) % 7;
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
        }

        // If a time zone is specified, all fields are interpreted as UTC and then
        // offset according to the specified time zone.
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }

        // Otherwise, all fields are in local time.
        return localDate(d);
      };
    }
    function parseSpecifier(d, specifier, string, j) {
      var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;
      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || (j = parse(d, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }
    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }
    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }
    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }
    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }
    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }
    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }
    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }
    function formatQuarter(d) {
      return 1 + ~~(d.getMonth() / 3);
    }
    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }
    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }
    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }
    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }
    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }
    function formatUTCQuarter(d) {
      return 1 + ~~(d.getUTCMonth() / 3);
    }
    return {
      format: function (specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function () {
          return specifier;
        };
        return f;
      },
      parse: function (specifier) {
        var p = newParse(specifier += "", false);
        p.toString = function () {
          return specifier;
        };
        return p;
      },
      utcFormat: function (specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function () {
          return specifier;
        };
        return f;
      },
      utcParse: function (specifier) {
        var p = newParse(specifier += "", true);
        p.toString = function () {
          return specifier;
        };
        return p;
      }
    };
  }
  var pads = {
      "-": "",
      "_": " ",
      "0": "0"
    },
    numberRe = /^\s*\d+/,
    // note: ignores next directive
    percentRe = /^%/,
    requoteRe = /[\\^$*+?|[\]().{}]/g;
  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }
  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }
  function formatLookup(names) {
    return new Map(names.map((name, i) => [name.toLowerCase(), i]));
  }
  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }
  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.u = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.V = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }
  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }
  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
  }
  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }
  function parseQuarter(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
  }
  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }
  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }
  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }
  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }
  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }
  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }
  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }
  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
  }
  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = +n[0], i + n[0].length) : -1;
  }
  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.s = +n[0], i + n[0].length) : -1;
  }
  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }
  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }
  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }
  function formatDayOfYear(d, p) {
    return pad(1 + timeDay.count(timeYear(d), d), p, 3);
  }
  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }
  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }
  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }
  function formatMinutes$1(d, p) {
    return pad(d.getMinutes(), p, 2);
  }
  function formatSeconds$1(d, p) {
    return pad(d.getSeconds(), p, 2);
  }
  function formatWeekdayNumberMonday(d) {
    var day = d.getDay();
    return day === 0 ? 7 : day;
  }
  function formatWeekNumberSunday(d, p) {
    return pad(sunday.count(timeYear(d) - 1, d), p, 2);
  }
  function dISO(d) {
    var day = d.getDay();
    return day >= 4 || day === 0 ? thursday(d) : thursday.ceil(d);
  }
  function formatWeekNumberISO(d, p) {
    d = dISO(d);
    return pad(thursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
  }
  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }
  function formatWeekNumberMonday(d, p) {
    return pad(monday.count(timeYear(d) - 1, d), p, 2);
  }
  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatYearISO(d, p) {
    d = dISO(d);
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 10000, p, 4);
  }
  function formatFullYearISO(d, p) {
    var day = d.getDay();
    d = day >= 4 || day === 0 ? thursday(d) : thursday.ceil(d);
    return pad(d.getFullYear() % 10000, p, 4);
  }
  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
  }
  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }
  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }
  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }
  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }
  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }
  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }
  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }
  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }
  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }
  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }
  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
  }
  function UTCdISO(d) {
    var day = d.getUTCDay();
    return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  }
  function formatUTCWeekNumberISO(d, p) {
    d = UTCdISO(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }
  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }
  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
  }
  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCYearISO(d, p) {
    d = UTCdISO(d);
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }
  function formatUTCFullYearISO(d, p) {
    var day = d.getUTCDay();
    d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }
  function formatUTCZone() {
    return "+0000";
  }
  function formatLiteralPercent() {
    return "%";
  }
  function formatUnixTimestamp(d) {
    return +d;
  }
  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1000);
  }

  var locale;
  var timeFormat;
  var utcFormat;
  defaultLocale({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });
  function defaultLocale(definition) {
    locale = formatLocale(definition);
    timeFormat = locale.format;
    locale.parse;
    utcFormat = locale.utcFormat;
    locale.utcParse;
    return locale;
  }

  var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";
  function formatIsoNative(date) {
    return date.toISOString();
  }
  var formatIso = Date.prototype.toISOString ? formatIsoNative : utcFormat(isoSpecifier);

  function date(t) {
    return new Date(t);
  }
  function number$1(t) {
    return t instanceof Date ? +t : +new Date(+t);
  }
  function calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format) {
    var scale = continuous(),
      invert = scale.invert,
      domain = scale.domain;
    var formatMillisecond = format(".%L"),
      formatSecond = format(":%S"),
      formatMinute = format("%I:%M"),
      formatHour = format("%I %p"),
      formatDay = format("%a %d"),
      formatWeek = format("%b %d"),
      formatMonth = format("%B"),
      formatYear = format("%Y");
    function tickFormat(date) {
      return (second(date) < date ? formatMillisecond : minute(date) < date ? formatSecond : hour(date) < date ? formatMinute : day(date) < date ? formatHour : month(date) < date ? week(date) < date ? formatDay : formatWeek : year(date) < date ? formatMonth : formatYear)(date);
    }
    scale.invert = function (y) {
      return new Date(invert(y));
    };
    scale.domain = function (_) {
      return arguments.length ? domain(Array.from(_, number$1)) : domain().map(date);
    };
    scale.ticks = function (interval) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval);
    };
    scale.tickFormat = function (count, specifier) {
      return specifier == null ? tickFormat : format(specifier);
    };
    scale.nice = function (interval) {
      var d = domain();
      if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
      return interval ? domain(nice(d, interval)) : scale;
    };
    scale.copy = function () {
      return copy(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format));
    };
    return scale;
  }
  function time() {
    return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, sunday, timeDay, timeHour, timeMinute, utcSecond, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
  }

  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace (name) {
    var prefix = name += "",
      i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {
      space: namespaces[prefix],
      local: name
    } : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function () {
      var document = this.ownerDocument,
        uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml ? document.createElement(name) : document.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function () {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator (name) {
    var fullname = namespace(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  function none() {}
  function selector (selector) {
    return selector == null ? none : function () {
      return this.querySelector(selector);
    };
  }

  function selection_select (select) {
    if (typeof select !== "function") select = selector(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  function array (x) {
    return typeof x === "object" && "length" in x ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function empty() {
    return [];
  }
  function selectorAll (selector) {
    return selector == null ? empty : function () {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function () {
      var group = select.apply(this, arguments);
      return group == null ? [] : array(group);
    };
  }
  function selection_selectAll (select) {
    if (typeof select === "function") select = arrayAll(select);else select = selectorAll(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  function matcher (selector) {
    return function () {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function (node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;
  function childFind(match) {
    return function () {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selection_selectChild (match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;
  function children() {
    return this.children;
  }
  function childrenFilter(match) {
    return function () {
      return filter.call(this.children, match);
    };
  }
  function selection_selectChildren (match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter (match) {
    if (typeof match !== "function") match = matcher(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  function sparse (update) {
    return new Array(update.length);
  }

  function selection_enter () {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }
  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function (child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function (child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function (selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function (selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  function constant (x) {
    return function () {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
      node,
      nodeByKeyValue = new Map(),
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function selection_data (value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;
    if (typeof value !== "function") value = constant(value);
    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = array(value.call(parent, parent && parent.__data__, j, parents)),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit () {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join (onenter, onupdate, onexit) {
    var enter = this.enter(),
      update = this,
      exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove();else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge (selection) {
    if (!(selection instanceof Selection)) throw new Error("invalid merge");
    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  function selection_order () {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  function selection_sort (compare) {
    if (!compare) compare = ascending;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call () {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes () {
    return Array.from(this);
  }

  function selection_node () {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  function selection_size () {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty () {
    return !this.node();
  }

  function selection_each (callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  function attrRemove(name) {
    return function () {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function () {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function () {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function () {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function selection_attr (name, value) {
    var fullname = namespace(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  function defaultView (node) {
    return node.ownerDocument && node.ownerDocument.defaultView // node is a Node
    || node.document && node // node is a Window
    || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function () {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function () {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);else this.style.setProperty(name, v, priority);
    };
  }
  function selection_style (name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function () {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function () {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];else this[name] = v;
    };
  }
  function selection_property (name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function (name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function (name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function (name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node),
      i = -1,
      n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node),
      i = -1,
      n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function () {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function () {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function () {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function selection_classed (name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()),
        i = -1,
        n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function () {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function selection_text (value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function () {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function selection_html (value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function selection_raise () {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function selection_lower () {
    return this.each(lower);
  }

  function selection_append (name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function () {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }
  function selection_insert (name, before) {
    var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function () {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function selection_remove () {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false),
      parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true),
      parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_clone (deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum (value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  function contextListener(listener) {
    return function (event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function (t) {
      var name = "",
        i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {
        type: t,
        name: name
      };
    });
  }
  function onRemove(typename) {
    return function () {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function () {
      var on = this.__on,
        o,
        listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {
        type: typename.type,
        name: typename.name,
        value: value,
        listener: listener,
        options: options
      };
      if (!on) this.__on = [o];else on.push(o);
    };
  }
  function selection_on (typename, value, options) {
    var typenames = parseTypenames(typename + ""),
      i,
      n = typenames.length,
      t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
      event = window.CustomEvent;
    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;else event.initEvent(type, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type, params) {
    return function () {
      return dispatchEvent(this, type, params);
    };
  }
  function dispatchFunction(type, params) {
    return function () {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }
  function selection_dispatch (type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  function* selection_iterator () {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select (selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  var apiStart = function apiStart(state) {
    return {
      start: function start() {
        var _timeout = state._timeout,
          _stop1 = state._stop1,
          _serverDelay = state._serverDelay,
          _clientDelay = state._clientDelay,
          _step = state._step,
          _event = state._event,
          _scale = state._scale,
          _size = state._size,
          _focus = state._focus;
        if (_timeout) clearTimeout(_timeout);
        var delay = +_stop1 + _serverDelay - Date.now();

        // If we're too late for the first prepare _event, skip it.
        if (delay < _clientDelay) delay += _step;
        var prepare = function prepare() {
          state._stop1 = new Date(Math.floor((Date.now() - _serverDelay) / _step) * _step);
          state._start1 = new Date(state._stop1 - _size * _step);
          _event.call('prepare', state, state._start1, state._stop1);
          setTimeout(function () {
            state.start0 = state._start1;
            state.stop0 = state._stop1;
            _scale.domain([state.start0, state.stop0]);
            _event.call('beforechange', state, state._start1, state._stop1);
            _event.call('change', state, state._start1, state._stop1);
            _event.call('focus', state, _focus);
          }, _clientDelay);
          state.timeout = setTimeout(prepare, _step);
        };
        state.timeout = setTimeout(prepare, delay);
        return state;
      }
    };
  };

  var apiStop = function apiStop(state) {
    return {
      stop: function stop() {
        state._timeout = clearTimeout(state._timeout);
        return state;
      }
    };
  };

  var apiOn$1 = function apiOn(state) {
    return {
      on: function on(type) {
        var listener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var _event = state._event,
          _focus = state._focus,
          _start1 = state._start1,
          _stop1 = state._stop1,
          _start0 = state._start0,
          _stop0 = state._stop0;
        if (listener === null) return _event.on(type);
        _event.on(type, listener);

        // Notify the listener of the current start and stop time, as appropriate.
        // This way, metrics can make requests for data immediately,
        // and likewise the axis can display itself synchronously.
        if (/^prepare(\.|$)/.test(type)) listener(_start1, _stop1);
        if (/^beforechange(\.|$)/.test(type)) listener(_start0, _stop0);
        if (/^change(\.|$)/.test(type)) listener(_start0, _stop0);
        if (/^focus(\.|$)/.test(type)) listener(_focus);
        return state;
      }
    };
  };

  var apiFocus = function apiFocus(state) {
    return {
      focus: function focus(i) {
        var _event = state._event;
        _event.call('focus', state, state._focus = i);
        return state;
      }
    };
  };

  var update = function update(state) {
    var _step = state._step,
      _serverDelay = state._serverDelay,
      _clientDelay = state._clientDelay,
      _scale = state._scale,
      _size = state._size;
    var now = Date.now();
    state._stop0 = new Date(Math.floor((now - _serverDelay - _clientDelay) / _step) * _step);
    state._start0 = new Date(state._stop0 - _size * _step);
    state._stop1 = new Date(Math.floor((now - _serverDelay) / _step) * _step);
    state._start1 = new Date(state._stop1 - _size * _step);
    _scale.domain([state._start0, state._stop0]);
    return state;
  };

  // The client delay is the amount of additional time we wait to fetch those
  // metrics from the server. The client and server delay combined represent the
  // age of the most recent displayed metric. Defaults to 1 second.
  var apiClientDelay = function apiClientDelay(state) {
    return {
      clientDelay: function clientDelay() {
        var _clientDelay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_clientDelay === null) return state._clientDelay;
        state._clientDelay = +_clientDelay;
        return update(state);
      }
    };
  };

  // The server delay is the amount of time we wait for the server to compute a
  // metric. This delay may result from clock skew or from delays collecting
  // metrics from various hosts. Defaults to 4 seconds.
  var apiServerDelay = function apiServerDelay(state) {
    return {
      serverDelay: function serverDelay() {
        var _serverDelay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_serverDelay === null) return state._serverDelay;
        state._serverDelay = +_serverDelay;
        return update(state);
      }
    };
  };

  // Set or get the context size (the count of metric values).
  // Defaults to 1440 (four hours at ten seconds).
  var apiSize = function apiSize(state) {
    return {
      size: function size() {
        var _size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_size === null) return state._size;
        state._scale.range([0, state._size = +_size]);
        return update(state);
      }
    };
  };

  // Set or ge2t the step interval in milliseconds.
  // Defaults to ten seconds.
  var apiStep = function apiStep(state) {
    return {
      step: function step() {
        var _step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_step === null) return state._step;
        state._step = +_step;
        return update(state);
      }
    };
  };

  var apiAlias = function apiAlias(state) {
    return {
      alias: function alias(name) {
        state.toString = function () {
          return name;
        };
        return state;
      }
    };
  };

  var apiExtent = function apiExtent(state) {
    return {
      extent: function extent() {
        var _size = state._size,
          _values = state._values;
        var i = 0,
          value,
          min = Infinity,
          max = -Infinity;
        while (++i < _size) {
          value = _values[i];
          if (value < min) min = value;
          if (value > max) max = value;
        }
        return [min, max];
      }
    };
  };

  // When the context changes, switch to the new data, ready-or-not!
  var beforechange = function beforechange(state) {
    return function (start1, stop1) {
      var _step = state._step,
        _size = state._size;
      if (!isFinite(state._start)) state._start = start1;
      state._values.splice(0, Math.max(0, Math.min(_size, Math.round((start1 - state._start) / _step))));
      state._start = start1;
      state._stop = stop1;
    };
  };

  // Prefetch new data into a temporary array.
  var prepare = function prepare(state, request) {
    return function (start1, stop) {
      var _start = state._start,
        _step = state._step,
        _fetching = state._fetching,
        _event = state._event,
        _size = state._size;
      var steps = Math.min(_size, Math.round((start1 - _start) / _step));
      if (!steps || _fetching) return; // already fetched, or fetching!
      state._fetching = true;
      state._steps = Math.min(_size, steps + 6);
      var start0 = new Date(stop - state._steps * _step);
      request(start0, stop, _step, function (error, data) {
        state._fetching = false;
        if (error) return console.warn(error);
        var i = isFinite(_start) ? Math.round((start0 - _start) / _step) : 0;
        for (var j = 0, m = data.length; j < m; ++j) state._values[j + i] = data[j];
        _event.call('change', _start, stop);
      });
    };
  };
  var apiOn = function apiOn(state, request) {
    return {
      on: function on(type) {
        var listener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var _event = state._event,
          _id = state._id,
          context = state.context,
          _start = state._start,
          _stop = state._stop;
        if (listener === null) return _event.on(type);

        // If there are no listeners, then stop listening to the context,
        // and avoid unnecessary fetches.
        if (listener == null) {
          if (_event.on(type) != null && --state._listening === 0) {
            context.on('prepare' + _id, null).on('beforechange' + _id, null);
          }
        } else {
          if (_event.on(type) == null && ++state._listening === 1) {
            context.on('prepare' + _id, prepare(state, request)).on('beforechange' + _id, beforechange(state));
          }
        }
        _event.on(type, listener);

        // Notify the listener of the current start and stop time, as appropriate.
        // This way, charts can display synchronous metrics immediately.
        if (listener != null) {
          if (/^change(\.|$)/.test(type)) listener(_start, _stop);
        }
        return state;
      }
    };
  };

  // Number of metric to refetch each period, in case of lag.
  var MetricOverlap = 6;

  // Prefetch new data into a temporary array.
  var apiPrepare = function apiPrepare(state, request) {
    return {
      prepare: function prepare(start1, stop) {
        var _size = state._size,
          _start = state._start,
          _step = state._step,
          _fetching = state._fetching,
          _event = state._event;
        var steps = Math.min(_size, Math.round((start1 - _start) / _step));
        if (!steps || _fetching === true) return; // already fetched, or fetching!
        state._fetching = true;
        state._steps = Math.min(_size, steps + MetricOverlap);
        var start0 = new Date(stop - steps * _step);
        request(start0, stop, _step, function (error, data) {
          state._fetching = false;
          if (error) return console.warn(error);
          var i = isFinite(_start) ? Math.round((start0 - _start) / _step) : 0;
          for (var j = 0, m = data.length; j < m; ++j) values[j + i] = data[j];
          _event.call('change', state, _start, stop);
        });
      }
    };
  };

  // Wraps the specified request implementation, and shifts time by the given offset.
  var metricShift = function metricShift(request, offset) {
    return function (start, stop, step, callback) {
      return request(new Date(+start + offset), new Date(+stop + offset), step, callback);
    };
  };
  var apiShift = function apiShift(state, request) {
    return {
      shift: function shift(offset) {
        var context = state.context;
        return context.metric(metricShift(request, +offset));
      }
    };
  };

  var apiValueAt = function apiValueAt(state) {
    return {
      valueAt: function valueAt(i) {
        return state._values[i];
      }
    };
  };

  var genericOperate = function genericOperate(name, operate) {
    return function (state, metric) {
      return Object.assign({}, state, {
        valueAt: function valueAt(i) {
          return operate(state.valueAt(i), metric.valueAt(i));
        },
        toString: function toString() {
          return "".concat(state, " ").concat(name, " ").concat(metric);
        },
        on: function on(type) {
          var listener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          if (listener === null) return state.on(type);
          state.on(type, listener);
          metric.on(type, listener);
        }
      }, {
        shift: function shift(offset) {
          return genericOperate(name, operate)(state.shift(offset), metric.shift(offset));
        }
      });
    };
  };
  var apiOperator = function apiOperator(state) {
    return {
      add: function add(metric) {
        return genericOperate('+', function (a, b) {
          return a + b;
        })(state, metric);
      },
      subtract: function subtract(metric) {
        return genericOperate('-', function (a, b) {
          return a - b;
        })(state, metric);
      },
      multiply: function multiply(metric) {
        return genericOperate('*', function (a, b) {
          return a * b;
        })(state, metric);
      },
      divide: function divide(metric) {
        return genericOperate('/', function (a, b) {
          return a / b;
        })(state, metric);
      }
    };
  };

  var apiToString = function apiToString(name) {
    return {
      toString: function toString() {
        return name;
      }
    };
  };
  var apiMetric$1 = function apiMetric(context) {
    return {
      metric: function metric(request, name) {
        var metricState = {
          context: context,
          _id: '.metric-' + ++context._id,
          _start: -Infinity,
          _stop: null,
          _step: context.step(),
          _size: context.size(),
          _values: [],
          _event: dispatch('change'),
          _listening: 0,
          _fetching: false
        };
        var metric = Object.assign(metricState, apiOn(metricState, request), apiPrepare(metricState, request), apiValueAt(metricState), apiAlias(metricState), apiShift(metricState, request), apiExtent(metricState), apiToString(name));
        return Object.assign(metric, apiOperator(metric));
      }
    };
  };

  function responseText(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.text();
  }
  function text (input, init) {
    return fetch(input, init).then(responseText);
  }

  function responseJson(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    if (response.status === 204 || response.status === 205) return;
    return response.json();
  }
  function json (input, init) {
    return fetch(input, init).then(responseJson);
  }

  var apiCube = function apiCube(context) {
    return {
      cube: function cube() {
        var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        return {
          toString: function toString() {
            return host;
          },
          metric: function metric(expression) {
            return context.metric(function (start, stop, step, callback) {
              json(host + '/1.0/metric' + '?expression=' + encodeURIComponent(expression) + '&start=' + formatIso(start) + '&stop=' + formatIso(stop) + '&step=' + step).then(function (data) {
                if (!data) return callback(new Error('unable to load data'));
                callback(null, data.map(function (d) {
                  return d.value;
                }));
              });
            }, expression += '');
          }
        };
      }
    };
  };

  var slice = Array.prototype.slice;

  function identity (x) {
    return x;
  }

  var top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;
  function translateX(x) {
    return "translate(" + x + ",0)";
  }
  function translateY(y) {
    return "translate(0," + y + ")";
  }
  function number(scale) {
    return d => +scale(d);
  }
  function center(scale, offset) {
    offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
    if (scale.round()) offset = Math.round(offset);
    return d => +scale(d) + offset;
  }
  function entering() {
    return !this.__axis;
  }
  function axis(orient, scale) {
    var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
      k = orient === top || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === top || orient === bottom ? translateX : translateY;
    function axis(context) {
      var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues,
        format = tickFormat == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity : tickFormat,
        spacing = Math.max(tickSizeInner, 0) + tickPadding,
        range = scale.range(),
        range0 = +range[0] + offset,
        range1 = +range[range.length - 1] + offset,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset),
        selection = context.selection ? context.selection() : context,
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick").data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text");
      path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
      tick = tick.merge(tickEnter);
      line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x + "2", k * tickSizeInner));
      text = text.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x, k * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
      if (context !== selection) {
        path = path.transition(context);
        tick = tick.transition(context);
        line = line.transition(context);
        text = text.transition(context);
        tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function (d) {
          return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform");
        });
        tickEnter.attr("opacity", epsilon).attr("transform", function (d) {
          var p = this.parentNode.__axis;
          return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset);
        });
      }
      tickExit.remove();
      path.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1);
      tick.attr("opacity", 1).attr("transform", function (d) {
        return transform(position(d) + offset);
      });
      line.attr(x + "2", k * tickSizeInner);
      text.attr(x, k * spacing).text(format);
      selection.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
      selection.each(function () {
        this.__axis = position;
      });
    }
    axis.scale = function (_) {
      return arguments.length ? (scale = _, axis) : scale;
    };
    axis.ticks = function () {
      return tickArguments = slice.call(arguments), axis;
    };
    axis.tickArguments = function (_) {
      return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
    };
    axis.tickValues = function (_) {
      return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
    };
    axis.tickFormat = function (_) {
      return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };
    axis.tickSize = function (_) {
      return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };
    axis.tickSizeInner = function (_) {
      return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };
    axis.tickSizeOuter = function (_) {
      return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };
    axis.tickPadding = function (_) {
      return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };
    axis.offset = function (_) {
      return arguments.length ? (offset = +_, axis) : offset;
    };
    return axis;
  }
  function axisTop(scale) {
    return axis(top, scale);
  }
  function axisRight(scale) {
    return axis(right, scale);
  }
  function axisBottom(scale) {
    return axis(bottom, scale);
  }
  function axisLeft(scale) {
    return axis(left, scale);
  }

  var formatSeconds = timeFormat('%I:%M:%S %p');
  var formatMinutes = timeFormat('%I:%M %p');
  var formatDays = timeFormat('%B %d');
  var formatDefault = function formatDefault(context) {
    return context.step() < 6e4 ? formatSeconds : context.step() < 864e5 ? formatMinutes : formatDays;
  };
  var apiRemove$3 = function apiRemove(axisState) {
    return {
      remove: function remove(selection) {
        var context = axisState.context;
        selection.selectAll('svg').each(function (d) {
          context.on('change.axis-' + d.id, null);
          context.on('focus.axis-' + d.id, null);
        }).remove();
      }
    };
  };
  var apiFocusFormat = function apiFocusFormat(axisState) {
    return {
      focusFormat: function focusFormat() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return axisState.format === formatDefault(axisState.context) ? null : _;
        axisState.format = _ == null ? formatDefault(context) : _;
        return axisState;
      }
    };
  };
  var apiRender$3 = function apiRender(context, state) {
    return {
      render: function render(selection) {
        var _axis = state._axis,
          scale = state.scale,
          format = state.format,
          id = state.id,
          size = state.size;
        var tick = null;
        var g = selection.append('svg').datum({
          id: id
        }).attr('width', size).attr('height', Math.max(28, -_axis.tickSize())).append('g').attr('transform', 'translate(0,' + 4 + ')').call(_axis);
        context.on('change.axis-' + id, function () {
          g.call(_axis);
          if (!tick) tick = select(g.node().appendChild(g.selectAll('text').node().cloneNode(true))).style('display', 'none').text(null);
        });
        context.on('focus.axis-' + id, function (i) {
          if (tick) {
            if (i == null) {
              tick.style('display', 'none');
              g.selectAll('text').style('fill-opacity', null);
            } else {
              tick.style('display', null).attr('x', i).text(format(scale.invert(i)));
              var dx = tick.node().getComputedTextLength() + 6;
              g.selectAll('text').style('fill-opacity', function (d) {
                return Math.abs(scale(d) - i) < dx ? 0 : 1;
              });
            }
          }
        });
      }
    };
  };
  var apiTicks = function apiTicks(axisState) {
    return {
      ticks: function ticks() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        axisState._axis.ticks(args);
        return axisState;
      }
    };
  };
  var apiOrient = function apiOrient(axisSate) {
    return {
      orient: function orient(_orient) {
        var context = axisSate.context;
        switch (_orient) {
          case 'top':
            axisSate._axis = axisTop().scale(context._scale);
            break;
          case 'bottom':
            axisSate._axis = axisBottom().scale(context._scale);
            break;
          case 'left':
            axisSate._axis = axisLeft().scale(context._scale);
            break;
          case 'right':
            axisSate._axis = axisRight().scale(context._scale);
            break;
          case 'default':
            console.warn('orient shall be one of bottom|top|left|right');
            break;
          default:
            console.warn('orient shall be one of bottom|top|left|right');
            break;
        }
        return axisSate;
      }
    };
  };
  var apiAxis = function apiAxis(context) {
    return {
      axis: function axis() {
        var axisState = {
          context: context,
          size: context._size,
          scale: context._scale,
          _axis: axisBottom().scale(context._scale),
          format: formatDefault(context),
          id: ++context._id
        };
        return Object.assign(axisState, apiRemove$3(axisState), apiFocusFormat(axisState), apiTicks(axisState), apiOrient(axisState), apiRender$3(context, axisState));
      }
    };
  };

  var apiRemove$2 = function apiRemove(ruleState, selection) {
    return {
      remove: function remove() {
        var _context = ruleState._context;
        selection.selectAll('.line').each(function (d) {
          return _context.on('focus.rule-' + d.id, null);
        }).remove();
      }
    };
  };
  var apiMetric = function apiMetric(ruleState) {
    return {
      metric: function metric() {
        var _metric2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_metric2 === null) return ruleState._metric;
        ruleState._metric = _metric2;
        return ruleState;
      }
    };
  };
  var apiRender$2 = function apiRender(state) {
    return {
      render: function render(selection) {
        var _context = state._context,
          _metric = state._metric;
        var id = ++_context._id;
        var line = selection.append('div').datum({
          id: id
        }).attr('class', 'line').style('position', 'absolute').style('top', 0).style('bottom', 0).style('width', '1px').style('pointer-events', 'none');
        selection.each(function (d, i) {
          var metric_ = typeof _metric === 'function' ? _metric(d, i) : _metric;
          if (!metric_) return;
          var change = function change(start, stop) {
            var values = [];
            for (var _i = 0, n = _context.size(); _i < n; ++_i) {
              if (metric_.valueAt(_i)) {
                values.push(_i);
              }
            }
            var lines = selection.selectAll('.metric').data(values);
            lines.exit().remove();
            lines.enter().append('div').attr('class', 'metric line').style('position', 'absolute').style('top', 0).style('bottom', 0).style('width', '1px').style('pointer-events', 'none');
            lines.style('left', function (i) {
              return i + 'px';
            });
          };
          _context.on('change.rule-' + id, change);
          metric_.on('change.rule-' + id, change);
        });
        _context.on('focus.rule-' + id, function (i) {
          line
          // .datum(i)
          .style('display', i == null ? 'none' : null).style('left', i == null ? null : "".concat(i, "px"));
        });
      }
    };
  };
  var apiRule = function apiRule(context) {
    return {
      rule: function rule() {
        var state = {
          _context: context,
          _metric: function _metric(d) {
            return d;
          }
        };
        return Object.assign(state, apiRemove$2(state), apiMetric(state), apiRender$2(state));
      }
    };
  };

  var apiRender$1 = function apiRender(context, state) {
    return {
      render: function render(selection) {
        selection.append('div').attr('a', 'b');
        var _width = state._width,
          _height = state._height,
          _title = state._title,
          _metric = state._metric,
          _colors = state._colors,
          _extent = state._extent,
          _scale = state._scale,
          _buffer = state._buffer,
          _mode = state._mode,
          _format = state._format;
        selection.on('mousemove.horizon', function (event) {
          // todo: why directly importing mouse doesn't work here?
          context.focus(Math.round(d3__namespace.pointer(event)[0]));
        }).on('mouseout.horizon', function () {
          return context.focus(null);
        });
        selection.append('canvas').attr('width', _width).attr('height', _height);
        selection.append('span').attr('class', 'title').text(_title);
        selection.append('span').attr('class', 'value');
        selection.each(function (d, i) {
          var id = ++context._id,
            metric_ = typeof _metric === 'function' ? _metric(d, i) : _metric,
            colors_ = typeof _colors === 'function' ? _colors(d, i) : _colors,
            extent_ = typeof _extent === 'function' ? _extent(d, i) : _extent,
            step = context.step(),
            canvas = select(this).select('canvas'),
            span = select(this).select('.value'),
            m = colors_.length >> 1;
          var start = -Infinity,
            max_,
            ready;
          canvas.datum({
            id: id,
            metric: metric_
          });
          var ctx = canvas.node().getContext('2d');
          function change(start1, stop) {
            ctx.save();

            // compute the new extent and ready flag
            var extent = metric_.extent();
            ready = extent.every(isFinite);
            if (extent_ != null) extent = extent_;

            // if this is an update (with no extent change), copy old values!
            var i0 = 0,
              max = Math.max(-extent[0], extent[1]);
            if (this === context) {
              if (max === max_) {
                i0 = _width - 6;
                var dx = (start1 - start) / step;
                if (dx < _width) {
                  var canvas0 = _buffer.getContext('2d');
                  canvas0.clearRect(0, 0, _width, _height);
                  canvas0.drawImage(ctx.canvas, dx, 0, _width - dx, _height, 0, 0, _width - dx, _height);
                  ctx.clearRect(0, 0, _width, _height);
                  ctx.drawImage(canvas0.canvas, 0, 0);
                }
              }
              start = start1;
            }

            // update the domain
            _scale.domain([0, max_ = max]);

            // clear for the new data
            ctx.clearRect(i0, 0, _width - i0, _height);

            // record whether there are negative values to display
            var negative;

            // positive bands
            for (var j = 0; j < m; ++j) {
              ctx.fillStyle = colors_[m + j];

              // Adjust the range based on the current band index.
              var y0 = (j - m + 1) * _height;
              _scale.range([m * _height + y0, y0]);
              y0 = _scale(0);
              for (var _i = i0, n = _width, _y; _i < n; ++_i) {
                _y = metric_.valueAt(_i);
                if (_y <= 0) {
                  negative = true;
                  continue;
                }
                if (_y === undefined) continue;
                ctx.fillRect(_i, _y = _scale(_y), 1, y0 - _y);
              }
            }
            if (negative) {
              // enable offset mode
              if (_mode === 'offset') {
                ctx.translate(0, _height);
                ctx.scale(1, -1);
              }

              // negative bands
              for (var _j = 0; _j < m; ++_j) {
                ctx.fillStyle = colors_[m - 1 - _j];

                // Adjust the range based on the current band index.
                var _y2 = (_j - m + 1) * _height;
                _scale.range([m * _height + _y2, _y2]);
                _y2 = _scale(0);
                for (var _i2 = i0, _n = _width, _y3; _i2 < _n; ++_i2) {
                  _y3 = metric_.valueAt(_i2);
                  if (_y3 >= 0) continue;
                  ctx.fillRect(_i2, _scale(-_y3), 1, _y2 - _scale(-_y3));
                }
              }
            }
            ctx.restore();
          }
          var focus = function focus(i) {
            if (i == null) i = _width - 1;
            var value = metric_.valueAt(i);
            span.datum(value).text(isNaN(value) ? null : _format);
          };

          // Update the chart when the context changes.
          context.on('change.horizon-' + id, change);
          context.on('focus.horizon-' + id, focus);

          // Display the first metric change immediately,
          // but defer subsequent updates to the canvas change.
          // Note that someone still needs to listen to the metric,
          // so that it continues to update automatically.
          metric_.on('change.horizon-' + id, function (start, stop) {
            change(start), focus();
            if (ready) metric_.on('change.horizon-' + id, function (d) {
              return d;
            });
          });
        });
      }
    };
  };

  var apiMisc$1 = function apiMisc(state) {
    return {
      mode: function mode() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._mode;
        state._mode = _ + '';
        return state;
      },
      height: function height() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._height;
        state._height = +_;
        state._buffer.height = +_;
        return state;
      },
      metric: function metric() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._metric;
        state._metric = _;
        return state;
      },
      scale: function scale() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._scale;
        state._scale = _;
        return state;
      },
      extent: function extent() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._extent;
        state._extent = _;
        return state;
      },
      title: function title() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._title;
        state._title = _;
        return state;
      },
      format: function format() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._format;
        state._format = _;
        return state;
      },
      colors: function colors() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._colors;
        state._colors = _;
        return state;
      }
    };
  };

  var apiRemove$1 = function apiRemove(context) {
    return {
      remove: function remove(selection) {
        selection.on('mousemove.horizon', null).on('mouseout.horizon', null);
        var remove = function remove(d) {
          d.metric.on('change.horizon-' + d.id, null);
          context.on('change.horizon-' + d.id, null);
          context.on('focus.horizon-' + d.id, null);
        };
        selection.selectAll('canvas').each(remove).remove();
        selection.selectAll('._title,.value').remove();
      }
    };
  };

  var apiHorizon = function apiHorizon(context) {
    return {
      horizon: function horizon() {
        var buffer = document.createElement('canvas');
        buffer.width = context.size();
        buffer.height = 30;
        var state = {
          _mode: 'offset',
          _buffer: buffer,
          _width: buffer.width,
          _height: buffer.height,
          _scale: linear().interpolate(interpolateRound),
          _metric: function _metric(d) {
            return d;
          },
          _extent: null,
          _title: function _title(d) {
            return d;
          },
          _format: format('.2s'),
          _colors: ['#08519c', '#3182bd', '#6baed6', '#bdd7e7', '#bae4b3', '#74c476', '#31a354', '#006d2c']
        };
        return Object.assign(state, apiRemove$1(state), apiMisc$1(state), apiRender$1(context, state));
      }
    };
  };

  var apiGangliaWeb = function apiGangliaWeb(context) {
    return {
      gangliaWeb: function gangliaWeb(config) {
        var host = config.host || '';
        var uriPathPrefix = config.uriPathPrefix || '/ganglia2/';

        /* Add leading and trailing slashes, as appropriate. */
        if (uriPathPrefix[0] !== '/') {
          uriPathPrefix = '/' + uriPathPrefix;
        }
        if (uriPathPrefix[uriPathPrefix.length - 1] !== '/') {
          uriPathPrefix += '/';
        }
        return {
          toString: function toString() {
            return host + uriPathPrefix;
          },
          metric: function metric(metricInfo) {
            /* Store the members from metricInfo into local variables. */
            var clusterName = metricInfo.clusterName,
              metricName = metricInfo.metricName,
              hostName = metricInfo.hostName,
              onChangeCallback = metricInfo.onChangeCallback;
            var isReport = metricInfo.isReport === undefined ? false : metricInfo.isReport;
            /* Reasonable (not necessarily pretty) default for titleGenerator. */
            var defaultTitleGenerator = function defaultTitleGenerator(unusedMetricInfo) {
              return "clusterName:".concat(clusterName, " metricName:").concat(metricName, " hostName:").concat(hostName);
            };
            var titleGenerator = metricInfo.titleGenerator || defaultTitleGenerator;

            /* Default to plain, simple metrics. */
            var metricKeyName = isReport ? 'g' : 'm';
            var metricFn = function metricFn(start, stop, step, callback) {
              var constructGangliaWebRequestQueryParams = function constructGangliaWebRequestQueryParams() {
                return "c=".concat(clusterName, "&").concat(metricKeyName, "=").concat(metricName, "&h=").concat(hostName) + '&cs=' + start / 1000 + '&ce=' + stop / 1000 + '&step=' + step / 1000 + '&graphlot=1';
              };
              json(host + uriPathPrefix + 'graph.php?' + constructGangliaWebRequestQueryParams()).then(function (result) {
                if (result === undefined || result === null) {
                  return callback(new Error('Unable to fetch GangliaWeb data'));
                }
                callback(null, result[0].data);
              })["catch"](function (e) {
                return callback(new Error("Unable to fetch GangliaWeb data: Error ".concat(e)));
              });
            };
            titleGenerator(metricInfo);
            var gangliaWebMetric = context.metric(metricFn);
            gangliaWebMetric.toString = function () {
              return titleGenerator(metricInfo);
            };

            /* Allow users to run their custom code each time a gangliaWebMetric changes.
             *
             * TODO Consider abstracting away the naked Cubism call, and instead exposing
             * a callback that takes in the values array (maybe alongwith the original
             * start and stop 'naked' parameters), since it's handy to have the entire
             * dataset at your disposal (and users will likely implement onChangeCallback
             * primarily to get at this dataset).
             */
            if (onChangeCallback) {
              gangliaWebMetric.on('change', onChangeCallback);
            }
            return gangliaWebMetric;
          }
        };
      }
    };
  };

  /*
   * We are most likely not going to get the same number of measurements
   * cubism expects for a particular context: We have to perform down/up
   * sampling
   */
  var downUpSampling = function downUpSampling(isdate, iedate, step, librato_mm) {
    var av = [];
    for (var i = isdate; i <= iedate; i += step) {
      var int_mes = [];
      while (librato_mm.length && librato_mm[0].measure_time <= i) {
        int_mes.push(librato_mm.shift().value);
      }
      var v = void 0;
      if (int_mes.length) {
        /* Compute the average */
        v = int_mes.reduce(function (a, b) {
          return a + b;
        }) / int_mes.length;
      } else {
        /* No librato values on interval */
        v = av.length ? av[av.length - 1] : 0;
      }
      av.push(v);
    }
    return av;
  };

  /* Given a step, find the best librato resolution to use.
   *
   * Example:
   *
   * (s) : cubism step
   *
   * avail_rsts   1 --------------- 60 --------------- 900 ---------------- 3600
   *                                |    (s)            |
   *                                |                   |
   *                              [low_res             top_res]
   *
   * return: low_res (60)
   */
  var findIdealLibratoRFesolution = function findIdealLibratoRFesolution(step) {
    var avail_rsts = [1, 60, 900, 3600];
    var highest_res = avail_rsts[0],
      lowest_res = avail_rsts[avail_rsts.length]; // high and lowest available resolution from librato

    /* If step is outside the highest or lowest librato resolution, pick them and we are done */
    if (step >= lowest_res) return lowest_res;
    if (step <= highest_res) return highest_res;

    /* If not, find in what resolution interval the step lands. */
    var iof, top_res, i;
    for (i = step; i <= lowest_res; i++) {
      iof = avail_rsts.indexOf(i);
      if (iof > -1) {
        top_res = avail_rsts[iof];
        break;
      }
    }
    var low_res;
    for (i = step; i >= highest_res; i--) {
      iof = avail_rsts.indexOf(i);
      if (iof > -1) {
        low_res = avail_rsts[iof];
        break;
      }
    }

    /* What's the closest librato resolution given the step ? */
    return top_res - step < step - low_res ? top_res : low_res;
  };

  var findLibratoResolution = function findLibratoResolution(sdate, edate, step) {
    var i_size = edate - sdate,
      // interval size
      month = 2419200,
      week = 604800,
      two_days = 172800;
    if (i_size > month) return 3600;
    var ideal_res = findIdealLibratoRFesolution(step);

    /*
     * Now we have the ideal resolution, but due to the retention policies at librato, maybe we have
     * to use a higher resolution.
     * http://support.metrics.librato.com/knowledgebase/articles/66838-understanding-metrics-roll-ups-retention-and-grap
     */
    if (i_size > week && ideal_res < 900) return 900;else if (i_size > two_days && ideal_res < 60) return 60;else return ideal_res;
  };

  var make_url = function make_url(sdate, edate, step, composite) {
    var url_prefix = 'https://metrics-api.librato.com/v1/metrics';
    var params = 'compose=' + composite + '&start_time=' + sdate + '&end_time=' + edate + '&resolution=' + findLibratoResolution(sdate, edate, step);
    return url_prefix + '?' + params;
  };

  /* All the logic to query the librato API is here */
  var request = function request(composite, user, token) {
    return {
      fire: function fire(isdate, iedate, step, callback_done) {
        var a_values = []; /* Store partial values from librato */
        var full_url = make_url(isdate, iedate, step, composite);
        var auth_string = 'Basic ' + btoa(user + ':' + token);

        /*
         * Librato has a limit in the number of measurements we get back in a request (100).
         * We recursively perform requests to the API to ensure we have all the data points
         * for the interval we are working on.
         */
        json(full_url).header('X-Requested-With', 'XMLHttpRequest').header('Authorization', auth_string).header('Librato-User-Agent', 'cubism/' + cubism.version).then(function (data) {
          if (data.measurements.length === 0) {
            return;
          }
          data.measurements[0].series.forEach(function (o) {
            a_values.push(o);
          });
          var still_more_values = 'query' in data && 'next_time' in data.query;
          if (still_more_values) {
            request(make_url(data.query.next_time, iedate, step));
          } else {
            var a_adjusted = downUpSampling(isdate, iedate, step, a_values);
            callback_done(a_adjusted);
          }
        })["catch"](function (error) {
          return console.error(error);
        });
      }
    };
  };

  /* librato (http://dev.librato.com/v1/post/metrics) source
   * If you want to see an example of how to use this source, check: https://gist.github.com/drio/5792680
   */
  var DateFormatter$1 = function DateFormatter(time) {
    return Math.floor(time / 1000);
  };
  var apiLibrato = function apiLibrato(context) {
    return {
      librato: function librato(user, token) {
        return {
          toString: function toString() {
            return 'librato';
          },
          metric: function metric(m_composite) {
            return context.metric(function (start, stop, step, callback) {
              /* All the librato logic is here; .fire() retrieves the metrics' data */
              request(m_composite, user, token).fire(DateFormatter$1(start), DateFormatter$1(stop), DateFormatter$1(step), function (a_values) {
                return callback(null, a_values);
              });
            }, m_composite += '');
          }
        };
      }
    };
  };

  // Helper method for parsing graphite's raw format.
  var parseGraphite = function parseGraphite(text) {
    var i = text.indexOf('|'),
      meta = text.substring(0, i),
      c = meta.lastIndexOf(','),
      b = meta.lastIndexOf(',', c - 1),
      a = meta.lastIndexOf(',', b - 1);
      meta.substring(a + 1, b) * 1000;
      meta.substring(c + 1) * 1000;
    return text.substring(i + 1).split(',').slice(1) // the first value is always None?
    .map(function (d) {
      return +d;
    });
  };
  var DateFormatter = function DateFormatter(time) {
    return Math.floor(time / 1000);
  };
  var apiGraphite = function apiGraphite(context) {
    return {
      graphite: function graphite() {
        var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        return {
          toString: function toString() {
            return host;
          },
          // Returns the graphite host.
          find: function find(pattern, callback) {
            json(host + '/metrics/find?format=completer' + '&query=' + encodeURIComponent(pattern)).then(function (result) {
              if (!result) return callback(new Error('unable to find metrics'));
              callback(null, result.metrics.map(function (d) {
                return d.path;
              }));
            });
          },
          metric: function metric(expression) {
            var sum = 'sum';
            var metric = context.metric(function (start, stop, step, callback) {
              var target = expression;

              // Apply the summarize, if necessary.
              if (step !== 1e4) target = 'summarize(' + target + ",'" + (!(step % 36e5) ? step / 36e5 + 'hour' : !(step % 6e4) ? step / 6e4 + 'min' : step / 1e3 + 'sec') + "','" + sum + "')";
              text(host + '/render?format=raw' + '&target=' + encodeURIComponent('alias(' + target + ",'')") + '&from=' + DateFormatter(start - 2 * step) +
              // off-by-two?
              '&until=' + DateFormatter(stop - 1000)).then(function (text) {
                if (!text) return callback(new Error('unable to load data'));
                callback(null, parseGraphite(text));
              });
            }, expression += '');
            metric.summarize = function (_sum) {
              sum = _sum;
              return metric;
            };
            return metric;
          }
        };
      }
    };
  };

  var apiRemove = function apiRemove(state) {
    return {
      remove: function remove(selection) {
        var context = state.context;
        var _remove = function _remove(d) {
          d.primary.on('change.comparison-' + d.id, null);
          d.secondary.on('change.comparison-' + d.id, null);
          context.on('change.comparison-' + d.id, null);
          context.on('focus.comparison-' + d.id, null);
        };
        selection.on('mousemove.comparison', null).on('mouseout.comparison', null);
        selection.selectAll('canvas').each(_remove).remove();
        selection.selectAll('.title,.value').remove();
      }
    };
  };

  var apiMisc = function apiMisc(state) {
    return {
      height: function height() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._height;
        state._height = +_;
        return state;
      },
      primary: function (_primary) {
        function primary() {
          return _primary.apply(this, arguments);
        }
        primary.toString = function () {
          return _primary.toString();
        };
        return primary;
      }(function () {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._primary;
        state._primary = primary;
        return state;
      }),
      secondary: function secondary() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._secondary;
        state._secondary = _;
        return state;
      },
      extent: function extent() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._extent;
        state._extent = _;
        return state;
      },
      scale: function scale() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._scale;
        state._scale = _;
        return state;
      },
      title: function title() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._title;
        state._title = _;
        return state;
      },
      formatPrimary: function formatPrimary() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._formatPrimary;
        state._formatPrimary = _;
        return state;
      },
      formatChange: function formatChange() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._formatChange;
        state._formatChange = _;
        return state;
      },
      colors: function colors() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._colors;
        state._colorscolors = _;
        return state;
      },
      strokeWidth: function strokeWidth() {
        var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        if (_ === null) return state._strokeWidth;
        state._strokeWidth = _;
        return state;
      }
    };
  };

  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  var uuid = function uuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  var roundEven = function roundEven(i) {
    return i & 0xfffffe;
  };
  var roundOdd = function roundOdd(i) {
    return (i + 1 & 0xfffffe) - 1;
  };
  var apiRender = function apiRender(state) {
    return {
      render: function render(selection) {
        var context = state.context,
          _width = state._width,
          _height = state._height,
          _scale = state._scale,
          _primary = state._primary,
          _secondary = state._secondary,
          _extent = state._extent,
          _title = state._title,
          _formatPrimary = state._formatPrimary,
          _formatChange = state._formatChange,
          _colors = state._colors,
          _strokeWidth = state._strokeWidth;
        selection.on('mousemove.comparison', function (event) {
          // todo, why directly d3.mouse doesn't work?
          context.focus(Math.round(d3__namespace.pointer(event)[0]));
        }).on('mouseout.comparison', function () {
          return context.focus(null);
        });
        selection.append('canvas').attr('width', _width).attr('height', _height);
        selection.append('span').attr('class', 'title').text(_title);
        selection.append('span').attr('class', 'value primary');
        selection.append('span').attr('class', 'value change');
        selection.each(function (d, i) {
          var id = uuid(),
            primary_ = typeof _primary === 'function' ? _primary.call(this, d, i) : _primary,
            secondary_ = typeof _secondary === 'function' ? _secondary.call(this, d, i) : _secondary,
            extent_ = typeof _extent === 'function' ? _extent.call(this, d, i) : _extent,
            div = select(this),
            canvas = div.select('canvas'),
            spanPrimary = div.select('.value.primary'),
            spanChange = div.select('.value.change');
          var ready = null;
          canvas.datum({
            id: id,
            primary: primary_,
            secondary: secondary_
          });
          var canvasContext = canvas.node().getContext('2d');
          function change(start, stop) {
            canvasContext.save();
            canvasContext.clearRect(0, 0, _width, _height);

            // update the scale
            var primaryExtent = primary_.extent(),
              secondaryExtent = secondary_.extent(),
              extent = extent_ == null ? primaryExtent : extent_;
            _scale.domain(extent).range([_height, 0]);
            ready = primaryExtent.concat(secondaryExtent).every(isFinite);

            // consistent overplotting
            var round = start / context.step() & 1 ? roundOdd : roundEven;

            // positive changes
            canvasContext.fillStyle = _colors[2];
            for (var _i = 0, n = _width; _i < n; ++_i) {
              var y0 = _scale(primary_.valueAt(_i)),
                y1 = _scale(secondary_.valueAt(_i));
              if (y0 < y1) canvasContext.fillRect(round(_i), y0, 1, y1 - y0);
            }

            // negative changes
            canvasContext.fillStyle = _colors[0];
            for (var _i2 = 0, _n = _width; _i2 < _n; ++_i2) {
              var _y = _scale(primary_.valueAt(_i2)),
                _y2 = _scale(secondary_.valueAt(_i2));
              if (_y > _y2) canvasContext.fillRect(round(_i2), _y2, 1, _y - _y2);
            }

            // positive values
            canvasContext.fillStyle = _colors[3];
            for (var _i3 = 0, _n2 = _width; _i3 < _n2; ++_i3) {
              var _y3 = _scale(primary_.valueAt(_i3)),
                _y4 = _scale(secondary_.valueAt(_i3));
              if (_y3 <= _y4) canvasContext.fillRect(round(_i3), _y3, 1, _strokeWidth);
            }

            // negative values
            canvasContext.fillStyle = _colors[1];
            for (var _i4 = 0, _n3 = _width; _i4 < _n3; ++_i4) {
              var _y5 = _scale(primary_.valueAt(_i4)),
                _y6 = _scale(secondary_.valueAt(_i4));
              if (_y5 > _y6) canvasContext.fillRect(round(_i4), _y5 - _strokeWidth, 1, _strokeWidth);
            }
            canvasContext.restore();
          }
          var focus = function focus() {
            var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _width - 1;
            var valuePrimary = primary_.valueAt(i),
              valueSecondary = secondary_.valueAt(i),
              valueChange = (valuePrimary - valueSecondary) / valueSecondary;
            spanPrimary.datum(valuePrimary).text(isNaN(valuePrimary) ? null : _formatPrimary);
            spanChange.datum(valueChange).text(isNaN(valueChange) ? null : _formatChange).attr('class', 'value change ' + (valueChange > 0 ? 'positive' : valueChange < 0 ? 'negative' : ''));
          };
          var firstChange = function firstChange(start, stop) {
            change(start);
            focus();
            if (ready) {
              primary_.on('change.comparison-' + id, function (d) {
                return d;
              });
              secondary_.on('change.comparison-' + id, function (d) {
                return d;
              });
            }
          };

          // Display the first primary change immediately,
          // but defer subsequent updates to the context change.
          // Note this someone still needs to listen to the metric,
          // so this it continues to update automatically.
          primary_.on('change.comparison-' + id, firstChange);
          secondary_.on('change.comparison-' + id, firstChange);

          // Update the chart when the context changes.
          context.on('change.comparison-' + id, change);
          context.on('focus.comparison-' + id, focus);
        });
      }
    };
  };

  var initState = function initState(context) {
    return {
      context: context,
      _width: context.size(),
      _height: 120,
      _scale: linear().interpolate(interpolateRound),
      _primary: function _primary(d) {
        return d[0];
      },
      _secondary: function _secondary(d) {
        return d[1];
      },
      _extent: null,
      _title: function _title(d) {
        return d;
      },
      _formatPrimary: format('.2s'),
      _formatChange: format('+.0%'),
      _colors: ['#9ecae1', '#225b84', '#a1d99b', '#22723a'],
      _strokeWidth: 1.5
    };
  };
  var apiComparison = function apiComparison(context) {
    return {
      comparison: function comparison() {
        var state = initState(context);
        return Object.assign(state, apiRemove(state), apiMisc(state), apiRender(state));
      }
    };
  };

  ({
    id: 1,
    step: 1e4,
    // ten seconds, in milliseconds
    size: 1440,
    // ten seconds, in milliseconds
    serverDelay: 5e3,
    clientDelay: 5e3,
    event: dispatch('prepare', 'beforechange', 'change', 'focus'),
    start0: null,
    stop0: null,
    // the start and stop for the previous change event
    start1: null,
    stop1: null,
    // the start and stop for the next prepare event
    timeout: null,
    focus: null,
    scale: time().range([0, 1440])
  });
  var context$1 = function context() {
    var state = {
      _id: 1,
      _step: 1e4,
      // ten seconds, in milliseconds
      _size: 1440,
      // ten seconds, in milliseconds
      _serverDelay: 5e3,
      _clientDelay: 5e3,
      _event: dispatch('prepare', 'beforechange', 'change', 'focus'),
      _start0: null,
      _stop0: null,
      // the start and stop for the previous change event
      _start1: null,
      _stop1: null,
      // the start and stop for the next prepare event
      _timeout: null,
      _focus: null,
      _scale: time().range([0, 1440])
    };
    var _context = Object.assign(state, apiAxis(state), apiComparison(state), apiCube(state), apiClientDelay(state), apiFocus(state), apiMetric$1(state), apiOn$1(state), apiRule(state), apiServerDelay(state), apiSize(state), apiStart(state), apiStop(state), apiStep(state));
    state._timeout = setTimeout(_context.start, 10);
    var focus = _context.focus;
    select(window).on('keydown.context-' + ++_context._id, function (event) {
      switch (!event.metaKey && event.keyCode) {
        case 37:
          // left
          if (focus == null) _context.focus = size - 1;
          if (focus > 0) _context.focus(--_context.focus);
          break;
        case 39:
          // right
          if (focus == null) _context.focus = size - 2;
          if (focus < size - 1) _context.focus(++_context.focus);
          break;
        default:
          return;
      }
      event.preventDefault();
    });
    var cubismContext = update(_context);
    return Object.assign(cubismContext, apiHorizon(cubismContext), apiGangliaWeb(cubismContext), apiLibrato(cubismContext), apiGraphite(cubismContext));
  };

  var options = function options(name) {
    var defaultValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var options = location.search.substring(1).split('&'),
      values = [],
      n = options.length;
    var i = -1,
      o;
    while (++i < n) {
      if ((o = options[i].split('='))[0] === name) {
        values.push(decodeURIComponent(o[1]));
      }
    }
    return values.length || !defaultValues ? values : defaultValues;
  };
  var option = function option(name, defaultValue) {
    var values = options(name);
    return values.length ? values[0] : defaultValue;
  };

  exports.context = context$1;
  exports.option = option;
  exports.options = options;
  exports.version = version;

}));
//# sourceMappingURL=cubism-es.standalone.js.map
