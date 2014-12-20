(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _slice = Array.prototype.slice;
var union = require("./util").union;
var comp = require("./util").comp;
var values = require("./util").values;

require("es6-shim");

function AdjacencyList(spec) {
  var V = spec.V;
  var E = spec.E;
  var m = new Map();


  V.forEach(function (v, i) {
    m.set(v, new Set(E[i]));
  });

  return Object.freeze({
    neighbors: neighbors(m),
    add: add(m),
    remove: remove(m),
    vertices: vertices(m)
  });
}

/**
 * Return the neighbors of a vertex
 * @param  {Map} m The map that we are retrieving information from
 * @return {Set}   A Set representing the neighbors of the given vertex
 */
function neighbors(m) {
  return function (v) {
    return m.get(v);
  };
}

/**
 * Add an edge to the vertex of a given Adjacency List
 * @param {Map} m The map that we are using to represent the Adjacency List
 * @return {AdjacencyList} Return the modified Adjacency List
 */
function add(m) {
  return function (v) {
    var edges = _slice.call(arguments, 1);

    var s = m.get(v), e = Array.isArray(edges[0]) ? new Set(edges[0]) : new Set(edges);

    m.set(v, union(s, e));
  };
}

/**
 * Remove an edge or a vertex from the Adjacency List
 * @param  {Map} m The map that we are using to represent the Adjancey List
 * @return {AdjacencyList}   Return the modified Adjacency List
 */
function remove(m) {
  return function (v) {
    var edges = _slice.call(arguments, 1);

    var s = m.get(v);

    if (!edges.length) {
      m = removeVertex(m, v);
    } else if (Array.isArray(edges[0])) {
      var e = new Set(edges[0]);
      m.set(v, comp(s, e));
    } else {
      s["delete"](edges[0]);
      m.set(v, s);
    }
  };
}

/**
 * Remove a vertex from a given Map and remove it from all values
 * @param  {Map}    m The Map we are removing the vertex from
 * @param  {Vertex} v The vertex we are removing from the Map
 * @return {Map}      The updated Map
 */
function removeVertex(m, v) {
  m["delete"](v);

  for (var _iterator = m.values()[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var edges = _step.value;
    if (edges.has(v)) {
      edges["delete"](v);
    }
  }

  return m;
}

/**
 * Retrieve the vertices of our Adjacency List, which is represented as a Map
 * @param  {Map}   m 
 * @return {Array} The vertices of our Adjacency List
 */
function vertices(m) {
  return function () {
    return values(m.keys());
  };
}

module.exports = AdjacencyList;

},{"./util":2,"es6-shim":4}],2:[function(require,module,exports){
"use strict";

require("es6-shim");

/**
 * Union two Sets
 * @param  {Set} s1 First Set
 * @param  {Set} s2 Second Set
 * @return {Set}    Union of the two sets
 */
function union(s1, s2) {
  var s = new Set();

  s1.forEach(addElement);
  s2.forEach(addElement);

  function addElement(e) {
    s.add(e);
  }

  return s;
}

/**
 * Find the complement of two Sets
 * @param  {Set} s1 The first Set
 * @param  {Set} s2 The second Set
 * @return {Set}    The complement of the two Sets
 */
function comp(s1, s2) {
  var s = new Set();

  s1.forEach(function (e) {
    if (!s2.has(e)) {
      s.add(e);
    } else {
      s2["delete"](e);
    }
  });

  s2.forEach(function (e) {
    if (!s1.has(e)) {
      s.add(e);
    }
  });

  return s;
}

/**
 * Find the values contained within a Set
 * @param  {Set} s The Set we want the values of
 * @return {Array}   The values contained within the Set
 */
function values(s) {
  var _values = [];

  for (var _iterator = s[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var v = _step.value;
    _values.push(v);
  }

  ;

  return _values;
}

exports.union = union;
exports.comp = comp;
exports.values = values;

},{"es6-shim":4}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function (process){
 /*!
  * https://github.com/paulmillr/es6-shim
  * @license es6-shim Copyright 2013-2014 by Paul Miller (http://paulmillr.com)
  *   and contributors,  MIT License
  * es6-shim: v0.22.1
  * see https://github.com/paulmillr/es6-shim/blob/0.22.1/LICENSE
  * Details and documentation:
  * https://github.com/paulmillr/es6-shim/
  */

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  /*global define, module, exports */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
  'use strict';

  var isCallableWithoutNew = function (func) {
    try {
      func();
    } catch (e) {
      return false;
    }
    return true;
  };

  var supportsSubclassing = function (C, f) {
    /* jshint proto:true */
    try {
      var Sub = function () { C.apply(this, arguments); };
      if (!Sub.__proto__) { return false; /* skip test on IE < 11 */ }
      Object.setPrototypeOf(Sub, C);
      Sub.prototype = Object.create(C.prototype, {
        constructor: { value: C }
      });
      return f(Sub);
    } catch (e) {
      return false;
    }
  };

  var arePropertyDescriptorsSupported = function () {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) { /* this is IE 8. */
      return false;
    }
  };

  var startsWithRejectsRegex = function () {
    var rejectsRegex = false;
    if (String.prototype.startsWith) {
      try {
        '/a/'.startsWith(/a/);
      } catch (e) { /* this is spec compliant */
        rejectsRegex = true;
      }
    }
    return rejectsRegex;
  };

  /*jshint evil: true */
  var getGlobal = new Function('return this;');
  /*jshint evil: false */

  var globals = getGlobal();
  var global_isFinite = globals.isFinite;
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
  var startsWithIsCompliant = startsWithRejectsRegex();
  var _indexOf = Function.call.bind(String.prototype.indexOf);
  var _toString = Function.call.bind(Object.prototype.toString);
  var _hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
  var ArrayIterator; // make our implementation private
  var noop = function () {};

  var Symbol = globals.Symbol || {};
  var Type = {
    string: function (x) { return _toString(x) === '[object String]'; },
    regex: function (x) { return _toString(x) === '[object RegExp]'; },
    symbol: function (x) {
      /*jshint notypeof: true */
      return typeof globals.Symbol === 'function' && typeof x === 'symbol';
      /*jshint notypeof: false */
    }
  };

  var defineProperty = function (object, name, value, force) {
    if (!force && name in object) { return; }
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };

  var Value = {
    getter: function (object, name, getter) {
      if (!supportsDescriptors) {
        throw new TypeError('getters require true ES5 support');
      }
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        get: getter
      });
    },
    proxy: function (originalObject, key, targetObject) {
      if (!supportsDescriptors) {
        throw new TypeError('getters require true ES5 support');
      }
      var originalDescriptor = Object.getOwnPropertyDescriptor(originalObject, key);
      Object.defineProperty(targetObject, key, {
        configurable: originalDescriptor.configurable,
        enumerable: originalDescriptor.enumerable,
        get: function getKey() { return originalObject[key]; },
        set: function setKey(value) { originalObject[key] = value; }
      });
    },
    redefine: function (object, property, newValue) {
      if (supportsDescriptors) {
        var descriptor = Object.getOwnPropertyDescriptor(object, property);
        descriptor.value = newValue;
        Object.defineProperty(object, property, descriptor);
      } else {
        object[property] = newValue;
      }
    }
  };

  // Define configurable, writable and non-enumerable props
  // if they don’t exist.
  var defineProperties = function (object, map) {
    Object.keys(map).forEach(function (name) {
      var method = map[name];
      defineProperty(object, name, method, false);
    });
  };

  // Simple shim for Object.create on ES3 browsers
  // (unlike real shim, no attempt to support `prototype === null`)
  var create = Object.create || function (prototype, properties) {
    function Prototype() {}
    Prototype.prototype = prototype;
    var object = new Prototype();
    if (typeof properties !== 'undefined') {
      defineProperties(object, properties);
    }
    return object;
  };

  // This is a private name in the es6 spec, equal to '[Symbol.iterator]'
  // we're going to use an arbitrary _-prefixed name to make our shims
  // work properly with each other, even though we don't have full Iterator
  // support.  That is, `Array.from(map.keys())` will work, but we don't
  // pretend to export a "real" Iterator interface.
  var $iterator$ = Type.symbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';
  // Firefox ships a partial implementation using the name @@iterator.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
  // So use that name if we detect it.
  if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }
  var addIterator = function (prototype, impl) {
    if (!impl) { impl = function iterator() { return this; }; }
    var o = {};
    o[$iterator$] = impl;
    defineProperties(prototype, o);
    if (!prototype[$iterator$] && Type.symbol($iterator$)) {
      // implementations are buggy when $iterator$ is a Symbol
      prototype[$iterator$] = impl;
    }
  };

  // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
  // can be replaced with require('is-arguments') if we ever use a build process instead
  var isArguments = function isArguments(value) {
    var str = _toString(value);
    var result = str === '[object Arguments]';
    if (!result) {
      result = str !== '[object Array]' &&
        value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        _toString(value.callee) === '[object Function]';
    }
    return result;
  };

  var ES = {
    CheckObjectCoercible: function (x, optMessage) {
      /* jshint eqnull:true */
      if (x == null) {
        throw new TypeError(optMessage || 'Cannot call method on ' + x);
      }
      return x;
    },

    TypeIsObject: function (x) {
      /* jshint eqnull:true */
      // this is expensive when it returns false; use this function
      // when you expect it to return true in the common case.
      return x != null && Object(x) === x;
    },

    ToObject: function (o, optMessage) {
      return Object(ES.CheckObjectCoercible(o, optMessage));
    },

    IsCallable: function (x) {
      // some versions of IE say that typeof /abc/ === 'function'
      return typeof x === 'function' && _toString(x) === '[object Function]';
    },

    ToInt32: function (x) {
      return x >> 0;
    },

    ToUint32: function (x) {
      return x >>> 0;
    },

    ToInteger: function (value) {
      var number = +value;
      if (Number.isNaN(number)) { return 0; }
      if (number === 0 || !Number.isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    },

    ToLength: function (value) {
      var len = ES.ToInteger(value);
      if (len <= 0) { return 0; } // includes converting -0 to +0
      if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }
      return len;
    },

    SameValue: function (a, b) {
      if (a === b) {
        // 0 === -0, but they are not identical.
        if (a === 0) { return 1 / a === 1 / b; }
        return true;
      }
      return Number.isNaN(a) && Number.isNaN(b);
    },

    SameValueZero: function (a, b) {
      // same as SameValue except for SameValueZero(+0, -0) == true
      return (a === b) || (Number.isNaN(a) && Number.isNaN(b));
    },

    IsIterable: function (o) {
      return ES.TypeIsObject(o) && (typeof o[$iterator$] !== 'undefined' || isArguments(o));
    },

    GetIterator: function (o) {
      if (isArguments(o)) {
        // special case support for `arguments`
        return new ArrayIterator(o, 'value');
      }
      var itFn = o[$iterator$];
      if (!ES.IsCallable(itFn)) {
        throw new TypeError('value is not an iterable');
      }
      var it = itFn.call(o);
      if (!ES.TypeIsObject(it)) {
        throw new TypeError('bad iterator');
      }
      return it;
    },

    IteratorNext: function (it) {
      var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
      if (!ES.TypeIsObject(result)) {
        throw new TypeError('bad iterator');
      }
      return result;
    },

    Construct: function (C, args) {
      // CreateFromConstructor
      var obj;
      if (ES.IsCallable(C['@@create'])) {
        obj = C['@@create']();
      } else {
        // OrdinaryCreateFromConstructor
        obj = create(C.prototype || null);
      }
      // Mark that we've used the es6 construct path
      // (see emulateES6construct)
      defineProperties(obj, { _es6construct: true });
      // Call the constructor.
      var result = C.apply(obj, args);
      return ES.TypeIsObject(result) ? result : obj;
    }
  };

  var emulateES6construct = function (o) {
    if (!ES.TypeIsObject(o)) { throw new TypeError('bad object'); }
    // es5 approximation to es6 subclass semantics: in es6, 'new Foo'
    // would invoke Foo.@@create to allocation/initialize the new object.
    // In es5 we just get the plain object.  So if we detect an
    // uninitialized object, invoke o.constructor.@@create
    if (!o._es6construct) {
      if (o.constructor && ES.IsCallable(o.constructor['@@create'])) {
        o = o.constructor['@@create'](o);
      }
      defineProperties(o, { _es6construct: true });
    }
    return o;
  };


  var numberConversion = (function () {
    // from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js#L176-L266
    // with permission and license, per https://twitter.com/inexorabletash/status/372206509540659200

    function roundToEven(n) {
      var w = Math.floor(n), f = n - w;
      if (f < 0.5) {
        return w;
      }
      if (f > 0.5) {
        return w + 1;
      }
      return w % 2 ? w + 1 : w;
    }

    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << (ebits - 1)) - 1,
        s, e, f,
        i, bits, str, bytes;

      // Compute sign, exponent, fraction
      if (v !== v) {
        // NaN
        // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
        e = (1 << ebits) - 1;
        f = Math.pow(2, fbits - 1);
        s = 0;
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1;
        f = 0;
        s = (v < 0) ? 1 : 0;
      } else if (v === 0) {
        e = 0;
        f = 0;
        s = (1 / v === -Infinity) ? 1 : 0;
      } else {
        s = v < 0;
        v = Math.abs(v);

        if (v >= Math.pow(2, 1 - bias)) {
          e = Math.min(Math.floor(Math.log(v) / Math.LN2), 1023);
          f = roundToEven(v / Math.pow(2, e) * Math.pow(2, fbits));
          if (f / Math.pow(2, fbits) >= 2) {
            e = e + 1;
            f = 1;
          }
          if (e > bias) {
            // Overflow
            e = (1 << ebits) - 1;
            f = 0;
          } else {
            // Normal
            e = e + bias;
            f = f - Math.pow(2, fbits);
          }
        } else {
          // Subnormal
          e = 0;
          f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
        }
      }

      // Pack sign, exponent, fraction
      bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = Math.floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = Math.floor(e / 2);
      }
      bits.push(s ? 1 : 0);
      bits.reverse();
      str = bits.join('');

      // Bits to bytes
      bytes = [];
      while (str.length) {
        bytes.push(parseInt(str.slice(0, 8), 2));
        str = str.slice(8);
      }
      return bytes;
    }

    function unpackIEEE754(bytes, ebits, fbits) {
      // Bytes to bits
      var bits = [], i, j, b, str,
          bias, s, e, f;

      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1];
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0);
          b = b >> 1;
        }
      }
      bits.reverse();
      str = bits.join('');

      // Unpack sign, exponent, fraction
      bias = (1 << (ebits - 1)) - 1;
      s = parseInt(str.slice(0, 1), 2) ? -1 : 1;
      e = parseInt(str.slice(1, 1 + ebits), 2);
      f = parseInt(str.slice(1 + ebits), 2);

      // Produce number
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
      } else if (e > 0) {
        // Normalized
        return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
      } else if (f !== 0) {
        // Denormalized
        return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
      } else {
        return s < 0 ? -0 : 0;
      }
    }

    function unpackFloat64(b) { return unpackIEEE754(b, 11, 52); }
    function packFloat64(v) { return packIEEE754(v, 11, 52); }
    function unpackFloat32(b) { return unpackIEEE754(b, 8, 23); }
    function packFloat32(v) { return packIEEE754(v, 8, 23); }

    var conversions = {
      toFloat32: function (num) { return unpackFloat32(packFloat32(num)); }
    };
    if (typeof Float32Array !== 'undefined') {
      var float32array = new Float32Array(1);
      conversions.toFloat32 = function (num) {
        float32array[0] = num;
        return float32array[0];
      };
    }
    return conversions;
  }());

  defineProperties(String, {
    fromCodePoint: function fromCodePoint(_) { // length = 1
      var result = [];
      var next;
      for (var i = 0, length = arguments.length; i < length; i++) {
        next = Number(arguments[i]);
        if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {
          throw new RangeError('Invalid code point ' + next);
        }

        if (next < 0x10000) {
          result.push(String.fromCharCode(next));
        } else {
          next -= 0x10000;
          result.push(String.fromCharCode((next >> 10) + 0xD800));
          result.push(String.fromCharCode((next % 0x400) + 0xDC00));
        }
      }
      return result.join('');
    },

    raw: function raw(callSite) { // raw.length===1
      var cooked = ES.ToObject(callSite, 'bad callSite');
      var rawValue = cooked.raw;
      var rawString = ES.ToObject(rawValue, 'bad raw value');
      var len = rawString.length;
      var literalsegments = ES.ToLength(len);
      if (literalsegments <= 0) {
        return '';
      }

      var stringElements = [];
      var nextIndex = 0;
      var nextKey, next, nextSeg, nextSub;
      while (nextIndex < literalsegments) {
        nextKey = String(nextIndex);
        next = rawString[nextKey];
        nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 >= literalsegments) {
          break;
        }
        next = nextIndex + 1 < arguments.length ? arguments[nextIndex + 1] : '';
        nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex++;
      }
      return stringElements.join('');
    }
  });

  // Firefox 31 reports this function's length as 0
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1062484
  if (String.fromCodePoint.length !== 1) {
    var originalFromCodePoint = Function.apply.bind(String.fromCodePoint);
    defineProperty(String, 'fromCodePoint', function (_) { return originalFromCodePoint(this, arguments); }, true);
  }

  var StringShims = {
    // Fast repeat, uses the `Exponentiation by squaring` algorithm.
    // Perf: http://jsperf.com/string-repeat2/2
    repeat: (function () {
      var repeat = function (s, times) {
        if (times < 1) { return ''; }
        if (times % 2) { return repeat(s, times - 1) + s; }
        var half = repeat(s, times / 2);
        return half + half;
      };

      return function (times) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        times = ES.ToInteger(times);
        if (times < 0 || times === Infinity) {
          throw new RangeError('Invalid String#repeat value');
        }
        return repeat(thisStr, times);
      };
    }()),

    startsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (Type.regex(searchStr)) {
        throw new TypeError('Cannot call method "startsWith" with a regex');
      }
      searchStr = String(searchStr);
      var startArg = arguments.length > 1 ? arguments[1] : void 0;
      var start = Math.max(ES.ToInteger(startArg), 0);
      return thisStr.slice(start, start + searchStr.length) === searchStr;
    },

    endsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (Type.regex(searchStr)) {
        throw new TypeError('Cannot call method "endsWith" with a regex');
      }
      searchStr = String(searchStr);
      var thisLen = thisStr.length;
      var posArg = arguments.length > 1 ? arguments[1] : void 0;
      var pos = typeof posArg === 'undefined' ? thisLen : ES.ToInteger(posArg);
      var end = Math.min(Math.max(pos, 0), thisLen);
      return thisStr.slice(end - searchStr.length, end) === searchStr;
    },

    includes: function includes(searchString) {
      var position = arguments.length > 1 ? arguments[1] : void 0;
      // Somehow this trick makes method 100% compat with the spec.
      return _indexOf(this, searchString, position) !== -1;
    },

    codePointAt: function (pos) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      var position = ES.ToInteger(pos);
      var length = thisStr.length;
      if (position >= 0 && position < length) {
        var first = thisStr.charCodeAt(position);
        var isEnd = (position + 1 === length);
        if (first < 0xD800 || first > 0xDBFF || isEnd) { return first; }
        var second = thisStr.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) { return first; }
        return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
      }
    }
  };
  defineProperties(String.prototype, StringShims);

  var hasStringTrimBug = '\u0085'.trim().length !== 1;
  if (hasStringTrimBug) {
    delete String.prototype.trim;
    // whitespace from: http://es5.github.io/#x15.5.4.20
    // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
    var ws = [
      '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
      '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
      '\u2029\uFEFF'
    ].join('');
    var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
    defineProperties(String.prototype, {
      trim: function () {
        if (typeof this === 'undefined' || this === null) {
          throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimRegexp, '');
      }
    });
  }

  // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype-@@iterator
  var StringIterator = function (s) {
    this._s = String(ES.CheckObjectCoercible(s));
    this._i = 0;
  };
  StringIterator.prototype.next = function () {
    var s = this._s, i = this._i;
    if (typeof s === 'undefined' || i >= s.length) {
      this._s = void 0;
      return { value: void 0, done: true };
    }
    var first = s.charCodeAt(i), second, len;
    if (first < 0xD800 || first > 0xDBFF || (i + 1) === s.length) {
      len = 1;
    } else {
      second = s.charCodeAt(i + 1);
      len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
    }
    this._i = i + len;
    return { value: s.substr(i, len), done: false };
  };
  addIterator(StringIterator.prototype);
  addIterator(String.prototype, function () {
    return new StringIterator(this);
  });

  if (!startsWithIsCompliant) {
    // Firefox has a noncompliant startsWith implementation
    defineProperties(String.prototype, {
      startsWith: StringShims.startsWith,
      endsWith: StringShims.endsWith
    });
  }

  var ArrayShims = {
    from: function (iterable) {
      var mapFn = arguments.length > 1 ? arguments[1] : void 0;

      var list = ES.ToObject(iterable, 'bad iterable');
      if (typeof mapFn !== 'undefined' && !ES.IsCallable(mapFn)) {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }

      var hasThisArg = arguments.length > 2;
      var thisArg = hasThisArg ? arguments[2] : void 0;

      var usingIterator = ES.IsIterable(list);
      // does the spec really mean that Arrays should use ArrayIterator?
      // https://bugs.ecmascript.org/show_bug.cgi?id=2416
      //if (Array.isArray(list)) { usingIterator=false; }

      var length;
      var result, i, value;
      if (usingIterator) {
        i = 0;
        result = ES.IsCallable(this) ? Object(new this()) : [];
        var it = usingIterator ? ES.GetIterator(list) : null;
        var iterationValue;

        do {
          iterationValue = ES.IteratorNext(it);
          if (!iterationValue.done) {
            value = iterationValue.value;
            if (mapFn) {
              result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
            } else {
              result[i] = value;
            }
            i += 1;
          }
        } while (!iterationValue.done);
        length = i;
      } else {
        length = ES.ToLength(list.length);
        result = ES.IsCallable(this) ? Object(new this(length)) : new Array(length);
        for (i = 0; i < length; ++i) {
          value = list[i];
          if (mapFn) {
            result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
          } else {
            result[i] = value;
          }
        }
      }

      result.length = length;
      return result;
    },

    of: function () {
      return Array.from(arguments);
    }
  };
  defineProperties(Array, ArrayShims);

  var arrayFromSwallowsNegativeLengths = function () {
    try {
      return Array.from({ length: -1 }).length === 0;
    } catch (e) {
      return false;
    }
  };
  // Fixes a Firefox bug in v32
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1063993
  if (!arrayFromSwallowsNegativeLengths()) {
    defineProperty(Array, 'from', ArrayShims.from, true);
  }

  // Our ArrayIterator is private; see
  // https://github.com/paulmillr/es6-shim/issues/252
  ArrayIterator = function (array, kind) {
      this.i = 0;
      this.array = array;
      this.kind = kind;
  };

  defineProperties(ArrayIterator.prototype, {
    next: function () {
      var i = this.i, array = this.array;
      if (!(this instanceof ArrayIterator)) {
        throw new TypeError('Not an ArrayIterator');
      }
      if (typeof array !== 'undefined') {
        var len = ES.ToLength(array.length);
        for (; i < len; i++) {
          var kind = this.kind;
          var retval;
          if (kind === 'key') {
            retval = i;
          } else if (kind === 'value') {
            retval = array[i];
          } else if (kind === 'entry') {
            retval = [i, array[i]];
          }
          this.i = i + 1;
          return { value: retval, done: false };
        }
      }
      this.array = void 0;
      return { value: void 0, done: true };
    }
  });
  addIterator(ArrayIterator.prototype);

  var ArrayPrototypeShims = {
    copyWithin: function (target, start) {
      var end = arguments[2]; // copyWithin.length must be 2
      var o = ES.ToObject(this);
      var len = ES.ToLength(o.length);
      target = ES.ToInteger(target);
      start = ES.ToInteger(start);
      var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
      var from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      end = typeof end === 'undefined' ? len : ES.ToInteger(end);
      var fin = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
      var count = Math.min(fin - from, len - to);
      var direction = 1;
      if (from < to && to < (from + count)) {
        direction = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count > 0) {
        if (_hasOwnProperty(o, from)) {
          o[to] = o[from];
        } else {
          delete o[from];
        }
        from += direction;
        to += direction;
        count -= 1;
      }
      return o;
    },

    fill: function (value) {
      var start = arguments.length > 1 ? arguments[1] : void 0;
      var end = arguments.length > 2 ? arguments[2] : void 0;
      var O = ES.ToObject(this);
      var len = ES.ToLength(O.length);
      start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);
      end = ES.ToInteger(typeof end === 'undefined' ? len : end);

      var relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      var relativeEnd = end < 0 ? len + end : end;

      for (var i = relativeStart; i < len && i < relativeEnd; ++i) {
        O[i] = value;
      }
      return O;
    },

    find: function find(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#find: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0, value; i < length; i++) {
        value = list[i];
        if (thisArg) {
          if (predicate.call(thisArg, value, i, list)) { return value; }
        } else if (predicate(value, i, list)) {
          return value;
        }
      }
    },

    findIndex: function findIndex(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#findIndex: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0; i < length; i++) {
        if (thisArg) {
          if (predicate.call(thisArg, list[i], i, list)) { return i; }
        } else if (predicate(list[i], i, list)) {
          return i;
        }
      }
      return -1;
    },

    keys: function () {
      return new ArrayIterator(this, 'key');
    },

    values: function () {
      return new ArrayIterator(this, 'value');
    },

    entries: function () {
      return new ArrayIterator(this, 'entry');
    }
  };
  // Safari 7.1 defines Array#keys and Array#entries natively,
  // but the resulting ArrayIterator objects don't have a "next" method.
  if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {
    delete Array.prototype.keys;
  }
  if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {
    delete Array.prototype.entries;
  }

  // Chrome 38 defines Array#keys and Array#entries, and Array#@@iterator, but not Array#values
  if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {
    defineProperties(Array.prototype, {
      values: Array.prototype[$iterator$]
    });
    if (Type.symbol(Symbol.unscopables)) {
      Array.prototype[Symbol.unscopables].values = true;
    }
  }
  defineProperties(Array.prototype, ArrayPrototypeShims);

  addIterator(Array.prototype, function () { return this.values(); });
  // Chrome defines keys/values/entries on Array, but doesn't give us
  // any way to identify its iterator.  So add our own shimmed field.
  if (Object.getPrototypeOf) {
    addIterator(Object.getPrototypeOf([].values()));
  }

  var maxSafeInteger = Math.pow(2, 53) - 1;
  defineProperties(Number, {
    MAX_SAFE_INTEGER: maxSafeInteger,
    MIN_SAFE_INTEGER: -maxSafeInteger,
    EPSILON: 2.220446049250313e-16,

    parseInt: globals.parseInt,
    parseFloat: globals.parseFloat,

    isFinite: function (value) {
      return typeof value === 'number' && global_isFinite(value);
    },

    isInteger: function (value) {
      return Number.isFinite(value) && ES.ToInteger(value) === value;
    },

    isSafeInteger: function (value) {
      return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
    },

    isNaN: function (value) {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN('foo') => true
      return value !== value;
    }
  });

  // Work around bugs in Array#find and Array#findIndex -- early
  // implementations skipped holes in sparse arrays. (Note that the
  // implementations of find/findIndex indirectly use shimmed
  // methods of Number, so this test has to happen down here.)
  if (![, 1].find(function (item, idx) { return idx === 0; })) {
    defineProperty(Array.prototype, 'find', ArrayPrototypeShims.find, true);
  }
  if ([, 1].findIndex(function (item, idx) { return idx === 0; }) !== 0) {
    defineProperty(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex, true);
  }

  if (supportsDescriptors) {
    defineProperties(Object, {
      // 19.1.3.1
      assign: function (target, source) {
        if (!ES.TypeIsObject(target)) {
          throw new TypeError('target must be an object');
        }
        return Array.prototype.reduce.call(arguments, function (target, source) {
          return Object.keys(Object(source)).reduce(function (target, key) {
            target[key] = source[key];
            return target;
          }, target);
        });
      },

      is: function (a, b) {
        return ES.SameValue(a, b);
      },

      // 19.1.3.9
      // shim from https://gist.github.com/WebReflection/5593554
      setPrototypeOf: (function (Object, magic) {
        var set;

        var checkArgs = function (O, proto) {
          if (!ES.TypeIsObject(O)) {
            throw new TypeError('cannot set prototype on a non-object');
          }
          if (!(proto === null || ES.TypeIsObject(proto))) {
            throw new TypeError('can only set prototype to an object or null' + proto);
          }
        };

        var setPrototypeOf = function (O, proto) {
          checkArgs(O, proto);
          set.call(O, proto);
          return O;
        };

        try {
          // this works already in Firefox and Safari
          set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
          set.call({}, null);
        } catch (e) {
          if (Object.prototype !== {}[magic]) {
            // IE < 11 cannot be shimmed
            return;
          }
          // probably Chrome or some old Mobile stock browser
          set = function (proto) {
            this[magic] = proto;
          };
          // please note that this will **not** work
          // in those browsers that do not inherit
          // __proto__ by mistake from Object.prototype
          // in these cases we should probably throw an error
          // or at least be informed about the issue
          setPrototypeOf.polyfill = setPrototypeOf(
            setPrototypeOf({}, null),
            Object.prototype
          ) instanceof Object;
          // setPrototypeOf.polyfill === true means it works as meant
          // setPrototypeOf.polyfill === false means it's not 100% reliable
          // setPrototypeOf.polyfill === undefined
          // or
          // setPrototypeOf.polyfill ==  null means it's not a polyfill
          // which means it works as expected
          // we can even delete Object.prototype.__proto__;
        }
        return setPrototypeOf;
      }(Object, '__proto__'))
    });
  }

  // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,
  // but Object.create(null) does.
  if (Object.setPrototypeOf && Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&
      Object.getPrototypeOf(Object.create(null)) === null) {
    (function () {
      var FAKENULL = Object.create(null);
      var gpo = Object.getPrototypeOf, spo = Object.setPrototypeOf;
      Object.getPrototypeOf = function (o) {
        var result = gpo(o);
        return result === FAKENULL ? null : result;
      };
      Object.setPrototypeOf = function (o, p) {
        if (p === null) { p = FAKENULL; }
        return spo(o, p);
      };
      Object.setPrototypeOf.polyfill = false;
    }());
  }

  try {
    Object.keys('foo');
  } catch (e) {
    var originalObjectKeys = Object.keys;
    Object.keys = function (obj) {
      return originalObjectKeys(ES.ToObject(obj));
    };
  }

  if (!RegExp.prototype.flags && supportsDescriptors) {
    var regExpFlagsGetter = function flags() {
      if (!ES.TypeIsObject(this)) {
        throw new TypeError('Method called on incompatible type: must be an object.');
      }
      var result = '';
      if (this.global) {
        result += 'g';
      }
      if (this.ignoreCase) {
        result += 'i';
      }
      if (this.multiline) {
        result += 'm';
      }
      if (this.unicode) {
        result += 'u';
      }
      if (this.sticky) {
        result += 'y';
      }
      return result;
    };

    Value.getter(RegExp.prototype, 'flags', regExpFlagsGetter);
  }

  var regExpSupportsFlagsWithRegex = (function () {
    try {
      return String(new RegExp(/a/g, 'i')) === '/a/i';
    } catch (e) {
      return false;
    }
  }());

  if (!regExpSupportsFlagsWithRegex && supportsDescriptors) {
    var OrigRegExp = RegExp;
    var RegExpShim = function RegExp(pattern, flags) {
      if (Type.regex(pattern) && Type.string(flags)) {
        return new RegExp(pattern.source, flags);
      }
      return new OrigRegExp(pattern, flags);
    };
    defineProperty(RegExpShim, 'toString', OrigRegExp.toString.bind(OrigRegExp), true);
    if (Object.setPrototypeOf) {
      // sets up proper prototype chain where possible
      Object.setPrototypeOf(OrigRegExp, RegExpShim);
    }
    Object.getOwnPropertyNames(OrigRegExp).forEach(function (key) {
      if (key === '$input') { return; } // Chrome < v39 & Opera < 26 have a nonstandard "$input" property
      if (key in noop) { return; }
      Value.proxy(OrigRegExp, key, RegExpShim);
    });
    RegExpShim.prototype = OrigRegExp.prototype;
    Value.redefine(OrigRegExp.prototype, 'constructor', RegExpShim);
    /*globals RegExp: true */
    RegExp = RegExpShim;
    Value.redefine(globals, 'RegExp', RegExpShim);
    /*globals RegExp: false */
  }

  var MathShims = {
    acosh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < 1) { return NaN; }
      if (value === 1) { return 0; }
      if (value === Infinity) { return value; }
      return Math.log(value + Math.sqrt(value * value - 1));
    },

    asinh: function (value) {
      value = Number(value);
      if (value === 0 || !global_isFinite(value)) {
        return value;
      }
      return value < 0 ? -Math.asinh(-value) : Math.log(value + Math.sqrt(value * value + 1));
    },

    atanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < -1 || value > 1) {
        return NaN;
      }
      if (value === -1) { return -Infinity; }
      if (value === 1) { return Infinity; }
      if (value === 0) { return value; }
      return 0.5 * Math.log((1 + value) / (1 - value));
    },

    cbrt: function (value) {
      value = Number(value);
      if (value === 0) { return value; }
      var negate = value < 0, result;
      if (negate) { value = -value; }
      result = Math.pow(value, 1 / 3);
      return negate ? -result : result;
    },

    clz32: function (value) {
      // See https://bugs.ecmascript.org/show_bug.cgi?id=2465
      value = Number(value);
      var number = ES.ToUint32(value);
      if (number === 0) {
        return 32;
      }
      return 32 - (number).toString(2).length;
    },

    cosh: function (value) {
      value = Number(value);
      if (value === 0) { return 1; } // +0 or -0
      if (Number.isNaN(value)) { return NaN; }
      if (!global_isFinite(value)) { return Infinity; }
      if (value < 0) { value = -value; }
      if (value > 21) { return Math.exp(value) / 2; }
      return (Math.exp(value) + Math.exp(-value)) / 2;
    },

    expm1: function (value) {
      value = Number(value);
      if (value === -Infinity) { return -1; }
      if (!global_isFinite(value) || value === 0) { return value; }
      return Math.exp(value) - 1;
    },

    hypot: function (x, y) {
      var anyNaN = false;
      var allZero = true;
      var anyInfinity = false;
      var numbers = [];
      Array.prototype.every.call(arguments, function (arg) {
        var num = Number(arg);
        if (Number.isNaN(num)) {
          anyNaN = true;
        } else if (num === Infinity || num === -Infinity) {
          anyInfinity = true;
        } else if (num !== 0) {
          allZero = false;
        }
        if (anyInfinity) {
          return false;
        } else if (!anyNaN) {
          numbers.push(Math.abs(num));
        }
        return true;
      });
      if (anyInfinity) { return Infinity; }
      if (anyNaN) { return NaN; }
      if (allZero) { return 0; }

      numbers.sort(function (a, b) { return b - a; });
      var largest = numbers[0];
      var divided = numbers.map(function (number) { return number / largest; });
      var sum = divided.reduce(function (sum, number) { return sum + (number * number); }, 0);
      return largest * Math.sqrt(sum);
    },

    log2: function (value) {
      return Math.log(value) * Math.LOG2E;
    },

    log10: function (value) {
      return Math.log(value) * Math.LOG10E;
    },

    log1p: function (value) {
      value = Number(value);
      if (value < -1 || Number.isNaN(value)) { return NaN; }
      if (value === 0 || value === Infinity) { return value; }
      if (value === -1) { return -Infinity; }
      var result = 0;
      var n = 50;

      if (value < 0 || value > 1) { return Math.log(1 + value); }
      for (var i = 1; i < n; i++) {
        if ((i % 2) === 0) {
          result -= Math.pow(value, i) / i;
        } else {
          result += Math.pow(value, i) / i;
        }
      }

      return result;
    },

    sign: function (value) {
      var number = +value;
      if (number === 0) { return number; }
      if (Number.isNaN(number)) { return number; }
      return number < 0 ? -1 : 1;
    },

    sinh: function (value) {
      value = Number(value);
      if (!global_isFinite(value) || value === 0) { return value; }
      return (Math.exp(value) - Math.exp(-value)) / 2;
    },

    tanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value === 0) { return value; }
      if (value === Infinity) { return 1; }
      if (value === -Infinity) { return -1; }
      return (Math.exp(value) - Math.exp(-value)) / (Math.exp(value) + Math.exp(-value));
    },

    trunc: function (value) {
      var number = Number(value);
      return number < 0 ? -Math.floor(-number) : Math.floor(number);
    },

    imul: function (x, y) {
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
      x = ES.ToUint32(x);
      y = ES.ToUint32(y);
      var ah = (x >>> 16) & 0xffff;
      var al = x & 0xffff;
      var bh = (y >>> 16) & 0xffff;
      var bl = y & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
    },

    fround: function (x) {
      if (x === 0 || x === Infinity || x === -Infinity || Number.isNaN(x)) {
        return x;
      }
      var num = Number(x);
      return numberConversion.toFloat32(num);
    }
  };
  defineProperties(Math, MathShims);

  if (Math.imul(0xffffffff, 5) !== -5) {
    // Safari 6.1, at least, reports "0" for this value
    Math.imul = MathShims.imul;
  }

  // Promises
  // Simplest possible implementation; use a 3rd-party library if you
  // want the best possible speed and/or long stack traces.
  var PromiseShim = (function () {

    var Promise, Promise$prototype;

    ES.IsPromise = function (promise) {
      if (!ES.TypeIsObject(promise)) {
        return false;
      }
      if (!promise._promiseConstructor) {
        // _promiseConstructor is a bit more unique than _status, so we'll
        // check that instead of the [[PromiseStatus]] internal field.
        return false;
      }
      if (typeof promise._status === 'undefined') {
        return false; // uninitialized
      }
      return true;
    };

    // "PromiseCapability" in the spec is what most promise implementations
    // call a "deferred".
    var PromiseCapability = function (C) {
      if (!ES.IsCallable(C)) {
        throw new TypeError('bad promise constructor');
      }
      var capability = this;
      var resolver = function (resolve, reject) {
        capability.resolve = resolve;
        capability.reject = reject;
      };
      capability.promise = ES.Construct(C, [resolver]);
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2478
      if (!capability.promise._es6construct) {
        throw new TypeError('bad promise constructor');
      }
      if (!(ES.IsCallable(capability.resolve) && ES.IsCallable(capability.reject))) {
        throw new TypeError('bad promise constructor');
      }
    };

    // find an appropriate setImmediate-alike
    var setTimeout = globals.setTimeout;
    var makeZeroTimeout;
    /*global window */
    if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {
      makeZeroTimeout = function () {
        // from http://dbaron.org/log/20100309-faster-timeouts
        var timeouts = [];
        var messageName = 'zero-timeout-message';
        var setZeroTimeout = function (fn) {
          timeouts.push(fn);
          window.postMessage(messageName, '*');
        };
        var handleMessage = function (event) {
          if (event.source === window && event.data === messageName) {
            event.stopPropagation();
            if (timeouts.length === 0) { return; }
            var fn = timeouts.shift();
            fn();
          }
        };
        window.addEventListener('message', handleMessage, true);
        return setZeroTimeout;
      };
    }
    var makePromiseAsap = function () {
      // An efficient task-scheduler based on a pre-existing Promise
      // implementation, which we can use even if we override the
      // global Promise below (in order to workaround bugs)
      // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
      var P = globals.Promise;
      return P && P.resolve && function (task) {
        return P.resolve().then(task);
      };
    };
    /*global process */
    var enqueue = ES.IsCallable(globals.setImmediate) ?
      globals.setImmediate.bind(globals) :
      typeof process === 'object' && process.nextTick ? process.nextTick :
      makePromiseAsap() ||
      (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() :
      function (task) { setTimeout(task, 0); }); // fallback

    var updatePromiseFromPotentialThenable = function (x, capability) {
      if (!ES.TypeIsObject(x)) {
        return false;
      }
      var resolve = capability.resolve;
      var reject = capability.reject;
      try {
        var then = x.then; // only one invocation of accessor
        if (!ES.IsCallable(then)) { return false; }
        then.call(x, resolve, reject);
      } catch (e) {
        reject(e);
      }
      return true;
    };

    var triggerPromiseReactions = function (reactions, x) {
      reactions.forEach(function (reaction) {
        enqueue(function () {
          // PromiseReactionTask
          var handler = reaction.handler;
          var capability = reaction.capability;
          var resolve = capability.resolve;
          var reject = capability.reject;
          try {
            var result = handler(x);
            if (result === capability.promise) {
              throw new TypeError('self resolution');
            }
            var updateResult =
              updatePromiseFromPotentialThenable(result, capability);
            if (!updateResult) {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    var promiseResolutionHandler = function (promise, onFulfilled, onRejected) {
      return function (x) {
        if (x === promise) {
          return onRejected(new TypeError('self resolution'));
        }
        var C = promise._promiseConstructor;
        var capability = new PromiseCapability(C);
        var updateResult = updatePromiseFromPotentialThenable(x, capability);
        if (updateResult) {
          return capability.promise.then(onFulfilled, onRejected);
        } else {
          return onFulfilled(x);
        }
      };
    };

    Promise = function (resolver) {
      var promise = this;
      promise = emulateES6construct(promise);
      if (!promise._promiseConstructor) {
        // we use _promiseConstructor as a stand-in for the internal
        // [[PromiseStatus]] field; it's a little more unique.
        throw new TypeError('bad promise');
      }
      if (typeof promise._status !== 'undefined') {
        throw new TypeError('promise already initialized');
      }
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
      if (!ES.IsCallable(resolver)) {
        throw new TypeError('not a valid resolver');
      }
      promise._status = 'unresolved';
      promise._resolveReactions = [];
      promise._rejectReactions = [];

      var resolve = function (resolution) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._resolveReactions;
        promise._result = resolution;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-resolution';
        triggerPromiseReactions(reactions, resolution);
      };
      var reject = function (reason) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._rejectReactions;
        promise._result = reason;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-rejection';
        triggerPromiseReactions(reactions, reason);
      };
      try {
        resolver(resolve, reject);
      } catch (e) {
        reject(e);
      }
      return promise;
    };
    Promise$prototype = Promise.prototype;
    var _promiseAllResolver = function (index, values, capability, remaining) {
      var done = false;
      return function (x) {
        if (done) { return; } // protect against being called multiple times
        done = true;
        values[index] = x;
        if ((--remaining.count) === 0) {
          var resolve = capability.resolve;
          resolve(values); // call w/ this===undefined
        }
      };
    };

    defineProperties(Promise, {
      '@@create': function (obj) {
        var constructor = this;
        // AllocatePromise
        // The `obj` parameter is a hack we use for es5
        // compatibility.
        var prototype = constructor.prototype || Promise$prototype;
        obj = obj || create(prototype);
        defineProperties(obj, {
          _status: void 0,
          _result: void 0,
          _resolveReactions: void 0,
          _rejectReactions: void 0,
          _promiseConstructor: void 0
        });
        obj._promiseConstructor = constructor;
        return obj;
      },

      all: function all(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          var values = [], remaining = { count: 1 };
          for (var index = 0; ; index++) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              break;
            }
            var nextPromise = C.resolve(next.value);
            var resolveElement = _promiseAllResolver(
              index, values, capability, remaining
            );
            remaining.count++;
            nextPromise.then(resolveElement, capability.reject);
          }
          if ((--remaining.count) === 0) {
            resolve(values); // call w/ this===undefined
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      },

      race: function race(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          while (true) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              // If iterable has no items, resulting promise will never
              // resolve; see:
              // https://github.com/domenic/promises-unwrapping/issues/75
              // https://bugs.ecmascript.org/show_bug.cgi?id=2515
              break;
            }
            var nextPromise = C.resolve(next.value);
            nextPromise.then(resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      },

      reject: function reject(reason) {
        var C = this;
        var capability = new PromiseCapability(C);
        var rejectPromise = capability.reject;
        rejectPromise(reason); // call with this===undefined
        return capability.promise;
      },

      resolve: function resolve(v) {
        var C = this;
        if (ES.IsPromise(v)) {
          var constructor = v._promiseConstructor;
          if (constructor === C) { return v; }
        }
        var capability = new PromiseCapability(C);
        var resolvePromise = capability.resolve;
        resolvePromise(v); // call with this===undefined
        return capability.promise;
      }
    });

    defineProperties(Promise$prototype, {
      'catch': function (onRejected) {
        return this.then(void 0, onRejected);
      },

      then: function then(onFulfilled, onRejected) {
        var promise = this;
        if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }
        // this.constructor not this._promiseConstructor; see
        // https://bugs.ecmascript.org/show_bug.cgi?id=2513
        var C = this.constructor;
        var capability = new PromiseCapability(C);
        if (!ES.IsCallable(onRejected)) {
          onRejected = function (e) { throw e; };
        }
        if (!ES.IsCallable(onFulfilled)) {
          onFulfilled = function (x) { return x; };
        }
        var resolutionHandler = promiseResolutionHandler(promise, onFulfilled, onRejected);
        var resolveReaction = { capability: capability, handler: resolutionHandler };
        var rejectReaction = { capability: capability, handler: onRejected };
        switch (promise._status) {
          case 'unresolved':
            promise._resolveReactions.push(resolveReaction);
            promise._rejectReactions.push(rejectReaction);
            break;
          case 'has-resolution':
            triggerPromiseReactions([resolveReaction], promise._result);
            break;
          case 'has-rejection':
            triggerPromiseReactions([rejectReaction], promise._result);
            break;
          default:
            throw new TypeError('unexpected');
        }
        return capability.promise;
      }
    });

    return Promise;
  }());

  // Chrome's native Promise has extra methods that it shouldn't have. Let's remove them.
  if (globals.Promise) {
    delete globals.Promise.accept;
    delete globals.Promise.defer;
    delete globals.Promise.prototype.chain;
  }

  // export the Promise constructor.
  defineProperties(globals, { Promise: PromiseShim });
  // In Chrome 33 (and thereabouts) Promise is defined, but the
  // implementation is buggy in a number of ways.  Let's check subclassing
  // support to see if we have a buggy implementation.
  var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function (S) {
    return S.resolve(42) instanceof S;
  });
  var promiseIgnoresNonFunctionThenCallbacks = (function () {
    try {
      globals.Promise.reject(42).then(null, 5).then(null, noop);
      return true;
    } catch (ex) {
      return false;
    }
  }());
  var promiseRequiresObjectContext = (function () {
    /*global Promise */
    try { Promise.call(3, noop); } catch (e) { return true; }
    return false;
  }());
  if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks || !promiseRequiresObjectContext) {
    /*globals Promise: true */
    Promise = PromiseShim;
    /*globals Promise: false */
    defineProperty(globals, 'Promise', PromiseShim, true);
  }

  // Map and Set require a true ES5 environment
  // Their fast path also requires that the environment preserve
  // property insertion order, which is not guaranteed by the spec.
  var testOrder = function (a) {
    var b = Object.keys(a.reduce(function (o, k) {
      o[k] = true;
      return o;
    }, {}));
    return a.join(':') === b.join(':');
  };
  var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
  // some engines (eg, Chrome) only preserve insertion order for string keys
  var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);

  if (supportsDescriptors) {

    var fastkey = function fastkey(key) {
      if (!preservesInsertionOrder) {
        return null;
      }
      var type = typeof key;
      if (type === 'string') {
        return '$' + key;
      } else if (type === 'number') {
        // note that -0 will get coerced to "0" when used as a property key
        if (!preservesNumericInsertionOrder) {
          return 'n' + key;
        }
        return key;
      }
      return null;
    };

    var emptyObject = function emptyObject() {
      // accomodate some older not-quite-ES5 browsers
      return Object.create ? Object.create(null) : {};
    };

    var collectionShims = {
      Map: (function () {

        var empty = {};

        function MapEntry(key, value) {
          this.key = key;
          this.value = value;
          this.next = null;
          this.prev = null;
        }

        MapEntry.prototype.isRemoved = function () {
          return this.key === empty;
        };

        function MapIterator(map, kind) {
          this.head = map._head;
          this.i = this.head;
          this.kind = kind;
        }

        MapIterator.prototype = {
          next: function () {
            var i = this.i, kind = this.kind, head = this.head, result;
            if (typeof this.i === 'undefined') {
              return { value: void 0, done: true };
            }
            while (i.isRemoved() && i !== head) {
              // back up off of removed entries
              i = i.prev;
            }
            // advance to next unreturned element.
            while (i.next !== head) {
              i = i.next;
              if (!i.isRemoved()) {
                if (kind === 'key') {
                  result = i.key;
                } else if (kind === 'value') {
                  result = i.value;
                } else {
                  result = [i.key, i.value];
                }
                this.i = i;
                return { value: result, done: false };
              }
            }
            // once the iterator is done, it is done forever.
            this.i = void 0;
            return { value: void 0, done: true };
          }
        };
        addIterator(MapIterator.prototype);

        function Map(iterable) {
          var map = this;
          if (!ES.TypeIsObject(map)) {
            throw new TypeError('Map does not accept arguments when called as a function');
          }
          map = emulateES6construct(map);
          if (!map._es6map) {
            throw new TypeError('bad map');
          }

          var head = new MapEntry(null, null);
          // circular doubly-linked list.
          head.next = head.prev = head;

          defineProperties(map, {
            _head: head,
            _storage: emptyObject(),
            _size: 0
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = map.set;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              if (!ES.TypeIsObject(nextItem)) {
                throw new TypeError('expected iterable of pairs');
              }
              adder.call(map, nextItem[0], nextItem[1]);
            }
          }
          return map;
        }
        var Map$prototype = Map.prototype;
        defineProperties(Map, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Map$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6map: true });
            return obj;
          }
        });

        Value.getter(Map.prototype, 'size', function () {
          if (typeof this._size === 'undefined') {
            throw new TypeError('size method called on incompatible Map');
          }
          return this._size;
        });

        defineProperties(Map.prototype, {
          get: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              var entry = this._storage[fkey];
              if (entry) {
                return entry.value;
              } else {
                return;
              }
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return i.value;
              }
            }
          },

          has: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              return typeof this._storage[fkey] !== 'undefined';
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return true;
              }
            }
            return false;
          },

          set: function (key, value) {
            var head = this._head, i = head, entry;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] !== 'undefined') {
                this._storage[fkey].value = value;
                return this;
              } else {
                entry = this._storage[fkey] = new MapEntry(key, value);
                i = head.prev;
                // fall through
              }
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.value = value;
                return this;
              }
            }
            entry = entry || new MapEntry(key, value);
            if (ES.SameValue(-0, key)) {
              entry.key = +0; // coerce -0 to +0 in entry
            }
            entry.next = this._head;
            entry.prev = this._head.prev;
            entry.prev.next = entry;
            entry.next.prev = entry;
            this._size += 1;
            return this;
          },

          'delete': function (key) {
            var head = this._head, i = head;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] === 'undefined') {
                return false;
              }
              i = this._storage[fkey].prev;
              delete this._storage[fkey];
              // fall through
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.key = i.value = empty;
                i.prev.next = i.next;
                i.next.prev = i.prev;
                this._size -= 1;
                return true;
              }
            }
            return false;
          },

          clear: function () {
            this._size = 0;
            this._storage = emptyObject();
            var head = this._head, i = head, p = i.next;
            while ((i = p) !== head) {
              i.key = i.value = empty;
              p = i.next;
              i.next = i.prev = head;
            }
            head.next = head.prev = head;
          },

          keys: function () {
            return new MapIterator(this, 'key');
          },

          values: function () {
            return new MapIterator(this, 'value');
          },

          entries: function () {
            return new MapIterator(this, 'key+value');
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var it = this.entries();
            for (var entry = it.next(); !entry.done; entry = it.next()) {
              if (context) {
                callback.call(context, entry.value[1], entry.value[0], this);
              } else {
                callback(entry.value[1], entry.value[0], this);
              }
            }
          }
        });
        addIterator(Map.prototype, function () { return this.entries(); });

        return Map;
      }()),

      Set: (function () {
        // Creating a Map is expensive.  To speed up the common case of
        // Sets containing only string or numeric keys, we use an object
        // as backing storage and lazily create a full Map only when
        // required.
        var SetShim = function Set(iterable) {
          var set = this;
          if (!ES.TypeIsObject(set)) {
            throw new TypeError('Set does not accept arguments when called as a function');
          }
          set = emulateES6construct(set);
          if (!set._es6set) {
            throw new TypeError('bad set');
          }

          defineProperties(set, {
            '[[SetData]]': null,
            _storage: emptyObject()
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = set.add;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              adder.call(set, nextItem);
            }
          }
          return set;
        };
        var Set$prototype = SetShim.prototype;
        defineProperties(SetShim, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Set$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6set: true });
            return obj;
          }
        });

        // Switch from the object backing storage to a full Map.
        var ensureMap = function ensureMap(set) {
          if (!set['[[SetData]]']) {
            var m = set['[[SetData]]'] = new collectionShims.Map();
            Object.keys(set._storage).forEach(function (k) {
              // fast check for leading '$'
              if (k.charCodeAt(0) === 36) {
                k = k.slice(1);
              } else if (k.charAt(0) === 'n') {
                k = +k.slice(1);
              } else {
                k = +k;
              }
              m.set(k, k);
            });
            set._storage = null; // free old backing storage
          }
        };

        Value.getter(SetShim.prototype, 'size', function () {
          if (typeof this._storage === 'undefined') {
            // https://github.com/paulmillr/es6-shim/issues/176
            throw new TypeError('size method called on incompatible Set');
          }
          ensureMap(this);
          return this['[[SetData]]'].size;
        });

        defineProperties(SetShim.prototype, {
          has: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              return !!this._storage[fkey];
            }
            ensureMap(this);
            return this['[[SetData]]'].has(key);
          },

          add: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              this._storage[fkey] = true;
              return this;
            }
            ensureMap(this);
            this['[[SetData]]'].set(key, key);
            return this;
          },

          'delete': function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              var hasFKey = _hasOwnProperty(this._storage, fkey);
              return (delete this._storage[fkey]) && hasFKey;
            }
            ensureMap(this);
            return this['[[SetData]]']['delete'](key);
          },

          clear: function () {
            if (this._storage) {
              this._storage = emptyObject();
            } else {
              this['[[SetData]]'].clear();
            }
          },

          values: function () {
            ensureMap(this);
            return this['[[SetData]]'].values();
          },

          entries: function () {
            ensureMap(this);
            return this['[[SetData]]'].entries();
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var entireSet = this;
            ensureMap(entireSet);
            this['[[SetData]]'].forEach(function (value, key) {
              if (context) {
                callback.call(context, key, key, entireSet);
              } else {
                callback(key, key, entireSet);
              }
            });
          }
        });
        defineProperty(SetShim, 'keys', SetShim.values, true);
        addIterator(SetShim.prototype, function () { return this.values(); });

        return SetShim;
      }())
    };
    defineProperties(globals, collectionShims);

    if (globals.Map || globals.Set) {
      /*
        - In Firefox < 23, Map#size is a function.
        - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
        - In Firefox 24, Map and Set do not implement forEach
        - In Firefox 25 at least, Map and Set are callable without "new"
      */
      if (
        typeof globals.Map.prototype.clear !== 'function' ||
        new globals.Set().size !== 0 ||
        new globals.Map().size !== 0 ||
        typeof globals.Map.prototype.keys !== 'function' ||
        typeof globals.Set.prototype.keys !== 'function' ||
        typeof globals.Map.prototype.forEach !== 'function' ||
        typeof globals.Set.prototype.forEach !== 'function' ||
        isCallableWithoutNew(globals.Map) ||
        isCallableWithoutNew(globals.Set) ||
        !supportsSubclassing(globals.Map, function (M) {
          var m = new M([]);
          // Firefox 32 is ok with the instantiating the subclass but will
          // throw when the map is used.
          m.set(42, 42);
          return m instanceof M;
        })
      ) {
        globals.Map = collectionShims.Map;
        globals.Set = collectionShims.Set;
      }
    }
    if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
      defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
    }
    // Shim incomplete iterator implementations.
    addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
    addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
  }

  return globals;
}));

}).call(this,require('_process'))
},{"_process":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaGJsYWNrL0Rlc2t0b3AvZ3JhcGgvbGliL0FkamFjZW5jeUxpc3QuanMiLCIvVXNlcnMvam9zaGJsYWNrL0Rlc2t0b3AvZ3JhcGgvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2VzNi1zaGltL2VzNi1zaGltLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUEsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3BDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUM7O0FBRXhDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEIsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFO01BQ25CLENBQUMsR0FBUSxJQUFJLENBQWIsQ0FBQztNQUFFLENBQUMsR0FBSyxJQUFJLENBQVYsQ0FBQztNQUNOLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRTs7O0FBRWpCLEdBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RCLEtBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDM0IsQ0FBQyxDQUFDOztBQUVILFNBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNqQixhQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2QixPQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNYLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLFlBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ3hCLENBQUMsQ0FBQztDQUNOOzs7Ozs7O0FBT0QsU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ2xCLFNBQU8sVUFBVSxDQUFDLEVBQUU7QUFDaEIsV0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ25CLENBQUE7Q0FDSjs7Ozs7OztBQU9ELFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNaLFNBQU8sVUFBVSxDQUFDLEVBQVk7UUFBUCxLQUFLOztBQUN4QixRQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUNyQixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDakIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXpCLEtBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6QixDQUFBO0NBQ0o7Ozs7Ozs7QUFPRCxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUU7QUFDZixTQUFPLFVBQVUsQ0FBQyxFQUFZO1FBQVAsS0FBSzs7QUFDeEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakIsUUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDZixPQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoQyxVQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixPQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEIsTUFBTTtBQUNILE9BQUMsVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLE9BQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ2Y7R0FDSixDQUFBO0NBQ0o7Ozs7Ozs7O0FBUUQsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QixHQUFDLFVBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7dUJBRU0sQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUFuQixLQUFLO0FBQ1YsUUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2QsV0FBSyxVQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkI7OztBQUdMLFNBQU8sQ0FBQyxDQUFDO0NBQ1o7Ozs7Ozs7QUFPRCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDakIsU0FBTyxZQUFZO0FBQ2YsV0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7R0FDM0IsQ0FBQTtDQUNKOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7OztBQ25HL0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7Ozs7OztBQVFwQixTQUFTLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ25CLE1BQUksQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRWxCLElBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkIsSUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFdkIsV0FBUyxVQUFVLENBQUMsQ0FBQyxFQUFFO0FBQ25CLEtBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDWjs7QUFFRCxTQUFPLENBQUMsQ0FBQztDQUNaOzs7Ozs7OztBQVFELFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDbEIsTUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsSUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNwQixRQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNaLE9BQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDWixNQUFNO0FBQ0gsUUFBRSxVQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7R0FDSixDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNwQixRQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNaLE9BQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDWjtHQUNKLENBQUMsQ0FBQzs7QUFFSCxTQUFPLENBQUMsQ0FBQztDQUNaOzs7Ozs7O0FBT0QsU0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQ2YsTUFBSSxPQUFNLEdBQUcsRUFBRSxDQUFDOzt1QkFFRixDQUFDO1FBQU4sQ0FBQztBQUNOLFdBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7OztBQUNqQixHQUFDOztBQUVGLFNBQU8sT0FBTSxDQUFDO0NBQ2pCOztBQUVELE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOzs7QUNoRXhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHVuaW9uID0gcmVxdWlyZSgnLi91dGlsJykudW5pb247XG5jb25zdCBjb21wID0gcmVxdWlyZSgnLi91dGlsJykuY29tcDtcbmNvbnN0IHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbCcpLnZhbHVlcztcblxucmVxdWlyZSgnZXM2LXNoaW0nKTtcblxuZnVuY3Rpb24gQWRqYWNlbmN5TGlzdChzcGVjKSB7XG4gICAgbGV0IHsgViwgRSB9ID0gc3BlYyxcbiAgICAgICAgbSA9IG5ldyBNYXAoKTtcblxuICAgIFYuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBtLnNldCh2LCBuZXcgU2V0KEVbaV0pKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgbmVpZ2hib3JzOiBuZWlnaGJvcnMobSksXG4gICAgICAgIGFkZDogYWRkKG0pLFxuICAgICAgICByZW1vdmU6IHJlbW92ZShtKSxcbiAgICAgICAgdmVydGljZXM6IHZlcnRpY2VzKG0pXG4gICAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBuZWlnaGJvcnMgb2YgYSB2ZXJ0ZXhcbiAqIEBwYXJhbSAge01hcH0gbSBUaGUgbWFwIHRoYXQgd2UgYXJlIHJldHJpZXZpbmcgaW5mb3JtYXRpb24gZnJvbVxuICogQHJldHVybiB7U2V0fSAgIEEgU2V0IHJlcHJlc2VudGluZyB0aGUgbmVpZ2hib3JzIG9mIHRoZSBnaXZlbiB2ZXJ0ZXhcbiAqL1xuZnVuY3Rpb24gbmVpZ2hib3JzKG0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIG0uZ2V0KHYpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZWRnZSB0byB0aGUgdmVydGV4IG9mIGEgZ2l2ZW4gQWRqYWNlbmN5IExpc3RcbiAqIEBwYXJhbSB7TWFwfSBtIFRoZSBtYXAgdGhhdCB3ZSBhcmUgdXNpbmcgdG8gcmVwcmVzZW50IHRoZSBBZGphY2VuY3kgTGlzdFxuICogQHJldHVybiB7QWRqYWNlbmN5TGlzdH0gUmV0dXJuIHRoZSBtb2RpZmllZCBBZGphY2VuY3kgTGlzdFxuICovXG5mdW5jdGlvbiBhZGQobSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodiwgLi4uZWRnZXMpIHtcbiAgICAgICAgbGV0IHMgPSBtLmdldCh2KSxcbiAgICAgICAgICAgIGUgPSBBcnJheS5pc0FycmF5KGVkZ2VzWzBdKVxuICAgICAgICAgICAgICAgID8gbmV3IFNldChlZGdlc1swXSlcbiAgICAgICAgICAgICAgICA6IG5ldyBTZXQoZWRnZXMpO1xuXG4gICAgICAgIG0uc2V0KHYsIHVuaW9uKHMsIGUpKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGVkZ2Ugb3IgYSB2ZXJ0ZXggZnJvbSB0aGUgQWRqYWNlbmN5IExpc3RcbiAqIEBwYXJhbSAge01hcH0gbSBUaGUgbWFwIHRoYXQgd2UgYXJlIHVzaW5nIHRvIHJlcHJlc2VudCB0aGUgQWRqYW5jZXkgTGlzdFxuICogQHJldHVybiB7QWRqYWNlbmN5TGlzdH0gICBSZXR1cm4gdGhlIG1vZGlmaWVkIEFkamFjZW5jeSBMaXN0XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZShtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2LCAuLi5lZGdlcykge1xuICAgICAgICBsZXQgcyA9IG0uZ2V0KHYpO1xuXG4gICAgICAgIGlmICghZWRnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBtID0gcmVtb3ZlVmVydGV4KG0sIHYpO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZWRnZXNbMF0pKSB7XG4gICAgICAgICAgICBsZXQgZSA9IG5ldyBTZXQoZWRnZXNbMF0pO1xuICAgICAgICAgICAgbS5zZXQodiwgY29tcChzLCBlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzLmRlbGV0ZShlZGdlc1swXSk7XG4gICAgICAgICAgICBtLnNldCh2LCBzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgYSB2ZXJ0ZXggZnJvbSBhIGdpdmVuIE1hcCBhbmQgcmVtb3ZlIGl0IGZyb20gYWxsIHZhbHVlc1xuICogQHBhcmFtICB7TWFwfSAgICBtIFRoZSBNYXAgd2UgYXJlIHJlbW92aW5nIHRoZSB2ZXJ0ZXggZnJvbVxuICogQHBhcmFtICB7VmVydGV4fSB2IFRoZSB2ZXJ0ZXggd2UgYXJlIHJlbW92aW5nIGZyb20gdGhlIE1hcFxuICogQHJldHVybiB7TWFwfSAgICAgIFRoZSB1cGRhdGVkIE1hcFxuICovXG5mdW5jdGlvbiByZW1vdmVWZXJ0ZXgobSwgdikge1xuICAgIG0uZGVsZXRlKHYpO1xuXG4gICAgZm9yIChsZXQgZWRnZXMgb2YgbS52YWx1ZXMoKSkge1xuICAgICAgICBpZiAoZWRnZXMuaGFzKHYpKSB7XG4gICAgICAgICAgICBlZGdlcy5kZWxldGUodik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgdmVydGljZXMgb2Ygb3VyIEFkamFjZW5jeSBMaXN0LCB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhIE1hcFxuICogQHBhcmFtICB7TWFwfSAgIG0gXG4gKiBAcmV0dXJuIHtBcnJheX0gVGhlIHZlcnRpY2VzIG9mIG91ciBBZGphY2VuY3kgTGlzdFxuICovXG5mdW5jdGlvbiB2ZXJ0aWNlcyhtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcyhtLmtleXMoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFkamFjZW5jeUxpc3Q7IiwicmVxdWlyZSgnZXM2LXNoaW0nKTtcblxuLyoqXG4gKiBVbmlvbiB0d28gU2V0c1xuICogQHBhcmFtICB7U2V0fSBzMSBGaXJzdCBTZXRcbiAqIEBwYXJhbSAge1NldH0gczIgU2Vjb25kIFNldFxuICogQHJldHVybiB7U2V0fSAgICBVbmlvbiBvZiB0aGUgdHdvIHNldHNcbiAqL1xuZnVuY3Rpb24gdW5pb24oczEsIHMyKSB7XG4gICAgbGV0IHMgPSBuZXcgU2V0KCk7XG5cbiAgICBzMS5mb3JFYWNoKGFkZEVsZW1lbnQpO1xuICAgIHMyLmZvckVhY2goYWRkRWxlbWVudCk7XG5cbiAgICBmdW5jdGlvbiBhZGRFbGVtZW50KGUpIHtcbiAgICAgICAgcy5hZGQoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHM7XG59XG5cbi8qKlxuICogRmluZCB0aGUgY29tcGxlbWVudCBvZiB0d28gU2V0c1xuICogQHBhcmFtICB7U2V0fSBzMSBUaGUgZmlyc3QgU2V0XG4gKiBAcGFyYW0gIHtTZXR9IHMyIFRoZSBzZWNvbmQgU2V0XG4gKiBAcmV0dXJuIHtTZXR9ICAgIFRoZSBjb21wbGVtZW50IG9mIHRoZSB0d28gU2V0c1xuICovXG5mdW5jdGlvbiBjb21wKHMxLCBzMikge1xuICAgIGxldCBzID0gbmV3IFNldCgpO1xuXG4gICAgczEuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIXMyLmhhcyhlKSkge1xuICAgICAgICAgICAgcy5hZGQoZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMi5kZWxldGUoZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHMyLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCFzMS5oYXMoZSkpIHtcbiAgICAgICAgICAgIHMuYWRkKGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcztcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSB2YWx1ZXMgY29udGFpbmVkIHdpdGhpbiBhIFNldFxuICogQHBhcmFtICB7U2V0fSBzIFRoZSBTZXQgd2Ugd2FudCB0aGUgdmFsdWVzIG9mXG4gKiBAcmV0dXJuIHtBcnJheX0gICBUaGUgdmFsdWVzIGNvbnRhaW5lZCB3aXRoaW4gdGhlIFNldFxuICovXG5mdW5jdGlvbiB2YWx1ZXMocykge1xuICAgIGxldCB2YWx1ZXMgPSBbXTtcblxuICAgIGZvciAobGV0IHYgb2YgcykgeyBcbiAgICAgICAgdmFsdWVzLnB1c2godikgXG4gICAgfTtcblxuICAgIHJldHVybiB2YWx1ZXM7XG59XG5cbmV4cG9ydHMudW5pb24gPSB1bmlvbjtcbmV4cG9ydHMuY29tcCA9IGNvbXA7XG5leHBvcnRzLnZhbHVlcyA9IHZhbHVlczsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbiAvKiFcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltXG4gICogQGxpY2Vuc2UgZXM2LXNoaW0gQ29weXJpZ2h0IDIwMTMtMjAxNCBieSBQYXVsIE1pbGxlciAoaHR0cDovL3BhdWxtaWxsci5jb20pXG4gICogICBhbmQgY29udHJpYnV0b3JzLCAgTUlUIExpY2Vuc2VcbiAgKiBlczYtc2hpbTogdjAuMjIuMVxuICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL2Jsb2IvMC4yMi4xL0xJQ0VOU0VcbiAgKiBEZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvZXM2LXNoaW0vXG4gICovXG5cbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKVxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIC8qZ2xvYmFsIGRlZmluZSwgbW9kdWxlLCBleHBvcnRzICovXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5yZXR1cm5FeHBvcnRzID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBpc0NhbGxhYmxlV2l0aG91dE5ldyA9IGZ1bmN0aW9uIChmdW5jKSB7XG4gICAgdHJ5IHtcbiAgICAgIGZ1bmMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHZhciBzdXBwb3J0c1N1YmNsYXNzaW5nID0gZnVuY3Rpb24gKEMsIGYpIHtcbiAgICAvKiBqc2hpbnQgcHJvdG86dHJ1ZSAqL1xuICAgIHRyeSB7XG4gICAgICB2YXIgU3ViID0gZnVuY3Rpb24gKCkgeyBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgICBpZiAoIVN1Yi5fX3Byb3RvX18pIHsgcmV0dXJuIGZhbHNlOyAvKiBza2lwIHRlc3Qgb24gSUUgPCAxMSAqLyB9XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoU3ViLCBDKTtcbiAgICAgIFN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEMucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBDIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGYoU3ViKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHZhciBhcmVQcm9wZXJ0eURlc2NyaXB0b3JzU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICd4Jywge30pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiB0aGlzIGlzIElFIDguICovXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzdGFydHNXaXRoUmVqZWN0c1JlZ2V4ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWplY3RzUmVnZXggPSBmYWxzZTtcbiAgICBpZiAoU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICAnL2EvJy5zdGFydHNXaXRoKC9hLyk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIHRoaXMgaXMgc3BlYyBjb21wbGlhbnQgKi9cbiAgICAgICAgcmVqZWN0c1JlZ2V4ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlamVjdHNSZWdleDtcbiAgfTtcblxuICAvKmpzaGludCBldmlsOiB0cnVlICovXG4gIHZhciBnZXRHbG9iYWwgPSBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzOycpO1xuICAvKmpzaGludCBldmlsOiBmYWxzZSAqL1xuXG4gIHZhciBnbG9iYWxzID0gZ2V0R2xvYmFsKCk7XG4gIHZhciBnbG9iYWxfaXNGaW5pdGUgPSBnbG9iYWxzLmlzRmluaXRlO1xuICB2YXIgc3VwcG9ydHNEZXNjcmlwdG9ycyA9ICEhT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIGFyZVByb3BlcnR5RGVzY3JpcHRvcnNTdXBwb3J0ZWQoKTtcbiAgdmFyIHN0YXJ0c1dpdGhJc0NvbXBsaWFudCA9IHN0YXJ0c1dpdGhSZWplY3RzUmVnZXgoKTtcbiAgdmFyIF9pbmRleE9mID0gRnVuY3Rpb24uY2FsbC5iaW5kKFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZik7XG4gIHZhciBfdG9TdHJpbmcgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG4gIHZhciBfaGFzT3duUHJvcGVydHkgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG4gIHZhciBBcnJheUl0ZXJhdG9yOyAvLyBtYWtlIG91ciBpbXBsZW1lbnRhdGlvbiBwcml2YXRlXG4gIHZhciBub29wID0gZnVuY3Rpb24gKCkge307XG5cbiAgdmFyIFN5bWJvbCA9IGdsb2JhbHMuU3ltYm9sIHx8IHt9O1xuICB2YXIgVHlwZSA9IHtcbiAgICBzdHJpbmc6IGZ1bmN0aW9uICh4KSB7IHJldHVybiBfdG9TdHJpbmcoeCkgPT09ICdbb2JqZWN0IFN0cmluZ10nOyB9LFxuICAgIHJlZ2V4OiBmdW5jdGlvbiAoeCkgeyByZXR1cm4gX3RvU3RyaW5nKHgpID09PSAnW29iamVjdCBSZWdFeHBdJzsgfSxcbiAgICBzeW1ib2w6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAvKmpzaGludCBub3R5cGVvZjogdHJ1ZSAqL1xuICAgICAgcmV0dXJuIHR5cGVvZiBnbG9iYWxzLlN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgeCA9PT0gJ3N5bWJvbCc7XG4gICAgICAvKmpzaGludCBub3R5cGVvZjogZmFsc2UgKi9cbiAgICB9XG4gIH07XG5cbiAgdmFyIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgdmFsdWUsIGZvcmNlKSB7XG4gICAgaWYgKCFmb3JjZSAmJiBuYW1lIGluIG9iamVjdCkgeyByZXR1cm47IH1cbiAgICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W25hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBWYWx1ZSA9IHtcbiAgICBnZXR0ZXI6IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGdldHRlcikge1xuICAgICAgaWYgKCFzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2dldHRlcnMgcmVxdWlyZSB0cnVlIEVTNSBzdXBwb3J0Jyk7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGdldDogZ2V0dGVyXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHByb3h5OiBmdW5jdGlvbiAob3JpZ2luYWxPYmplY3QsIGtleSwgdGFyZ2V0T2JqZWN0KSB7XG4gICAgICBpZiAoIXN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZ2V0dGVycyByZXF1aXJlIHRydWUgRVM1IHN1cHBvcnQnKTtcbiAgICAgIH1cbiAgICAgIHZhciBvcmlnaW5hbERlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9yaWdpbmFsT2JqZWN0LCBrZXkpO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldE9iamVjdCwga2V5LCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogb3JpZ2luYWxEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSxcbiAgICAgICAgZW51bWVyYWJsZTogb3JpZ2luYWxEZXNjcmlwdG9yLmVudW1lcmFibGUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0S2V5KCkgeyByZXR1cm4gb3JpZ2luYWxPYmplY3Rba2V5XTsgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXRLZXkodmFsdWUpIHsgb3JpZ2luYWxPYmplY3Rba2V5XSA9IHZhbHVlOyB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlZGVmaW5lOiBmdW5jdGlvbiAob2JqZWN0LCBwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmIChzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcbiAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0eSwgZGVzY3JpcHRvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmplY3RbcHJvcGVydHldID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIERlZmluZSBjb25maWd1cmFibGUsIHdyaXRhYmxlIGFuZCBub24tZW51bWVyYWJsZSBwcm9wc1xuICAvLyBpZiB0aGV5IGRvbuKAmXQgZXhpc3QuXG4gIHZhciBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iamVjdCwgbWFwKSB7XG4gICAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgbWV0aG9kID0gbWFwW25hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBtZXRob2QsIGZhbHNlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaW1wbGUgc2hpbSBmb3IgT2JqZWN0LmNyZWF0ZSBvbiBFUzMgYnJvd3NlcnNcbiAgLy8gKHVubGlrZSByZWFsIHNoaW0sIG5vIGF0dGVtcHQgdG8gc3VwcG9ydCBgcHJvdG90eXBlID09PSBudWxsYClcbiAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIGZ1bmN0aW9uIFByb3RvdHlwZSgpIHt9XG4gICAgUHJvdG90eXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICB2YXIgb2JqZWN0ID0gbmV3IFByb3RvdHlwZSgpO1xuICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGEgcHJpdmF0ZSBuYW1lIGluIHRoZSBlczYgc3BlYywgZXF1YWwgdG8gJ1tTeW1ib2wuaXRlcmF0b3JdJ1xuICAvLyB3ZSdyZSBnb2luZyB0byB1c2UgYW4gYXJiaXRyYXJ5IF8tcHJlZml4ZWQgbmFtZSB0byBtYWtlIG91ciBzaGltc1xuICAvLyB3b3JrIHByb3Blcmx5IHdpdGggZWFjaCBvdGhlciwgZXZlbiB0aG91Z2ggd2UgZG9uJ3QgaGF2ZSBmdWxsIEl0ZXJhdG9yXG4gIC8vIHN1cHBvcnQuICBUaGF0IGlzLCBgQXJyYXkuZnJvbShtYXAua2V5cygpKWAgd2lsbCB3b3JrLCBidXQgd2UgZG9uJ3RcbiAgLy8gcHJldGVuZCB0byBleHBvcnQgYSBcInJlYWxcIiBJdGVyYXRvciBpbnRlcmZhY2UuXG4gIHZhciAkaXRlcmF0b3IkID0gVHlwZS5zeW1ib2woU3ltYm9sLml0ZXJhdG9yKSA/IFN5bWJvbC5pdGVyYXRvciA6ICdfZXM2LXNoaW0gaXRlcmF0b3JfJztcbiAgLy8gRmlyZWZveCBzaGlwcyBhIHBhcnRpYWwgaW1wbGVtZW50YXRpb24gdXNpbmcgdGhlIG5hbWUgQEBpdGVyYXRvci5cbiAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTA3MDc3I2MxNFxuICAvLyBTbyB1c2UgdGhhdCBuYW1lIGlmIHdlIGRldGVjdCBpdC5cbiAgaWYgKGdsb2JhbHMuU2V0ICYmIHR5cGVvZiBuZXcgZ2xvYmFscy5TZXQoKVsnQEBpdGVyYXRvciddID09PSAnZnVuY3Rpb24nKSB7XG4gICAgJGl0ZXJhdG9yJCA9ICdAQGl0ZXJhdG9yJztcbiAgfVxuICB2YXIgYWRkSXRlcmF0b3IgPSBmdW5jdGlvbiAocHJvdG90eXBlLCBpbXBsKSB7XG4gICAgaWYgKCFpbXBsKSB7IGltcGwgPSBmdW5jdGlvbiBpdGVyYXRvcigpIHsgcmV0dXJuIHRoaXM7IH07IH1cbiAgICB2YXIgbyA9IHt9O1xuICAgIG9bJGl0ZXJhdG9yJF0gPSBpbXBsO1xuICAgIGRlZmluZVByb3BlcnRpZXMocHJvdG90eXBlLCBvKTtcbiAgICBpZiAoIXByb3RvdHlwZVskaXRlcmF0b3IkXSAmJiBUeXBlLnN5bWJvbCgkaXRlcmF0b3IkKSkge1xuICAgICAgLy8gaW1wbGVtZW50YXRpb25zIGFyZSBidWdneSB3aGVuICRpdGVyYXRvciQgaXMgYSBTeW1ib2xcbiAgICAgIHByb3RvdHlwZVskaXRlcmF0b3IkXSA9IGltcGw7XG4gICAgfVxuICB9O1xuXG4gIC8vIHRha2VuIGRpcmVjdGx5IGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2xqaGFyYi9pcy1hcmd1bWVudHMvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAgLy8gY2FuIGJlIHJlcGxhY2VkIHdpdGggcmVxdWlyZSgnaXMtYXJndW1lbnRzJykgaWYgd2UgZXZlciB1c2UgYSBidWlsZCBwcm9jZXNzIGluc3RlYWRcbiAgdmFyIGlzQXJndW1lbnRzID0gZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgICB2YXIgc3RyID0gX3RvU3RyaW5nKHZhbHVlKTtcbiAgICB2YXIgcmVzdWx0ID0gc3RyID09PSAnW29iamVjdCBBcmd1bWVudHNdJztcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gc3RyICE9PSAnW29iamVjdCBBcnJheV0nICYmXG4gICAgICAgIHZhbHVlICE9PSBudWxsICYmXG4gICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdmFsdWUubGVuZ3RoID49IDAgJiZcbiAgICAgICAgX3RvU3RyaW5nKHZhbHVlLmNhbGxlZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdmFyIEVTID0ge1xuICAgIENoZWNrT2JqZWN0Q29lcmNpYmxlOiBmdW5jdGlvbiAoeCwgb3B0TWVzc2FnZSkge1xuICAgICAgLyoganNoaW50IGVxbnVsbDp0cnVlICovXG4gICAgICBpZiAoeCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3Iob3B0TWVzc2FnZSB8fCAnQ2Fubm90IGNhbGwgbWV0aG9kIG9uICcgKyB4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB4O1xuICAgIH0sXG5cbiAgICBUeXBlSXNPYmplY3Q6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAvKiBqc2hpbnQgZXFudWxsOnRydWUgKi9cbiAgICAgIC8vIHRoaXMgaXMgZXhwZW5zaXZlIHdoZW4gaXQgcmV0dXJucyBmYWxzZTsgdXNlIHRoaXMgZnVuY3Rpb25cbiAgICAgIC8vIHdoZW4geW91IGV4cGVjdCBpdCB0byByZXR1cm4gdHJ1ZSBpbiB0aGUgY29tbW9uIGNhc2UuXG4gICAgICByZXR1cm4geCAhPSBudWxsICYmIE9iamVjdCh4KSA9PT0geDtcbiAgICB9LFxuXG4gICAgVG9PYmplY3Q6IGZ1bmN0aW9uIChvLCBvcHRNZXNzYWdlKSB7XG4gICAgICByZXR1cm4gT2JqZWN0KEVTLkNoZWNrT2JqZWN0Q29lcmNpYmxlKG8sIG9wdE1lc3NhZ2UpKTtcbiAgICB9LFxuXG4gICAgSXNDYWxsYWJsZTogZnVuY3Rpb24gKHgpIHtcbiAgICAgIC8vIHNvbWUgdmVyc2lvbnMgb2YgSUUgc2F5IHRoYXQgdHlwZW9mIC9hYmMvID09PSAnZnVuY3Rpb24nXG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgJiYgX3RvU3RyaW5nKHgpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH0sXG5cbiAgICBUb0ludDMyOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIHggPj4gMDtcbiAgICB9LFxuXG4gICAgVG9VaW50MzI6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4geCA+Pj4gMDtcbiAgICB9LFxuXG4gICAgVG9JbnRlZ2VyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIU51bWJlci5pc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH0sXG5cbiAgICBUb0xlbmd0aDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgbGVuID0gRVMuVG9JbnRlZ2VyKHZhbHVlKTtcbiAgICAgIGlmIChsZW4gPD0gMCkgeyByZXR1cm4gMDsgfSAvLyBpbmNsdWRlcyBjb252ZXJ0aW5nIC0wIHRvICswXG4gICAgICBpZiAobGVuID4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHsgcmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSOyB9XG4gICAgICByZXR1cm4gbGVuO1xuICAgIH0sXG5cbiAgICBTYW1lVmFsdWU6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICAvLyAwID09PSAtMCwgYnV0IHRoZXkgYXJlIG5vdCBpZGVudGljYWwuXG4gICAgICAgIGlmIChhID09PSAwKSB7IHJldHVybiAxIC8gYSA9PT0gMSAvIGI7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGEpICYmIE51bWJlci5pc05hTihiKTtcbiAgICB9LFxuXG4gICAgU2FtZVZhbHVlWmVybzogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIC8vIHNhbWUgYXMgU2FtZVZhbHVlIGV4Y2VwdCBmb3IgU2FtZVZhbHVlWmVybygrMCwgLTApID09IHRydWVcbiAgICAgIHJldHVybiAoYSA9PT0gYikgfHwgKE51bWJlci5pc05hTihhKSAmJiBOdW1iZXIuaXNOYU4oYikpO1xuICAgIH0sXG5cbiAgICBJc0l0ZXJhYmxlOiBmdW5jdGlvbiAobykge1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChvKSAmJiAodHlwZW9mIG9bJGl0ZXJhdG9yJF0gIT09ICd1bmRlZmluZWQnIHx8IGlzQXJndW1lbnRzKG8pKTtcbiAgICB9LFxuXG4gICAgR2V0SXRlcmF0b3I6IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoaXNBcmd1bWVudHMobykpIHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHN1cHBvcnQgZm9yIGBhcmd1bWVudHNgXG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihvLCAndmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdEZuID0gb1skaXRlcmF0b3IkXTtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShpdEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWx1ZSBpcyBub3QgYW4gaXRlcmFibGUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdCA9IGl0Rm4uY2FsbChvKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KGl0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgaXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdDtcbiAgICB9LFxuXG4gICAgSXRlcmF0b3JOZXh0OiBmdW5jdGlvbiAoaXQpIHtcbiAgICAgIHZhciByZXN1bHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGl0Lm5leHQoYXJndW1lbnRzWzFdKSA6IGl0Lm5leHQoKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIGl0ZXJhdG9yJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBDb25zdHJ1Y3Q6IGZ1bmN0aW9uIChDLCBhcmdzKSB7XG4gICAgICAvLyBDcmVhdGVGcm9tQ29uc3RydWN0b3JcbiAgICAgIHZhciBvYmo7XG4gICAgICBpZiAoRVMuSXNDYWxsYWJsZShDWydAQGNyZWF0ZSddKSkge1xuICAgICAgICBvYmogPSBDWydAQGNyZWF0ZSddKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPcmRpbmFyeUNyZWF0ZUZyb21Db25zdHJ1Y3RvclxuICAgICAgICBvYmogPSBjcmVhdGUoQy5wcm90b3R5cGUgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBNYXJrIHRoYXQgd2UndmUgdXNlZCB0aGUgZXM2IGNvbnN0cnVjdCBwYXRoXG4gICAgICAvLyAoc2VlIGVtdWxhdGVFUzZjb25zdHJ1Y3QpXG4gICAgICBkZWZpbmVQcm9wZXJ0aWVzKG9iaiwgeyBfZXM2Y29uc3RydWN0OiB0cnVlIH0pO1xuICAgICAgLy8gQ2FsbCB0aGUgY29uc3RydWN0b3IuXG4gICAgICB2YXIgcmVzdWx0ID0gQy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogb2JqO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZW11bGF0ZUVTNmNvbnN0cnVjdCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgaWYgKCFFUy5UeXBlSXNPYmplY3QobykpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIG9iamVjdCcpOyB9XG4gICAgLy8gZXM1IGFwcHJveGltYXRpb24gdG8gZXM2IHN1YmNsYXNzIHNlbWFudGljczogaW4gZXM2LCAnbmV3IEZvbydcbiAgICAvLyB3b3VsZCBpbnZva2UgRm9vLkBAY3JlYXRlIHRvIGFsbG9jYXRpb24vaW5pdGlhbGl6ZSB0aGUgbmV3IG9iamVjdC5cbiAgICAvLyBJbiBlczUgd2UganVzdCBnZXQgdGhlIHBsYWluIG9iamVjdC4gIFNvIGlmIHdlIGRldGVjdCBhblxuICAgIC8vIHVuaW5pdGlhbGl6ZWQgb2JqZWN0LCBpbnZva2Ugby5jb25zdHJ1Y3Rvci5AQGNyZWF0ZVxuICAgIGlmICghby5fZXM2Y29uc3RydWN0KSB7XG4gICAgICBpZiAoby5jb25zdHJ1Y3RvciAmJiBFUy5Jc0NhbGxhYmxlKG8uY29uc3RydWN0b3JbJ0BAY3JlYXRlJ10pKSB7XG4gICAgICAgIG8gPSBvLmNvbnN0cnVjdG9yWydAQGNyZWF0ZSddKG8pO1xuICAgICAgfVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhvLCB7IF9lczZjb25zdHJ1Y3Q6IHRydWUgfSk7XG4gICAgfVxuICAgIHJldHVybiBvO1xuICB9O1xuXG5cbiAgdmFyIG51bWJlckNvbnZlcnNpb24gPSAoZnVuY3Rpb24gKCkge1xuICAgIC8vIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2luZXhvcmFibGV0YXNoL3BvbHlmaWxsL2Jsb2IvbWFzdGVyL3R5cGVkYXJyYXkuanMjTDE3Ni1MMjY2XG4gICAgLy8gd2l0aCBwZXJtaXNzaW9uIGFuZCBsaWNlbnNlLCBwZXIgaHR0cHM6Ly90d2l0dGVyLmNvbS9pbmV4b3JhYmxldGFzaC9zdGF0dXMvMzcyMjA2NTA5NTQwNjU5MjAwXG5cbiAgICBmdW5jdGlvbiByb3VuZFRvRXZlbihuKSB7XG4gICAgICB2YXIgdyA9IE1hdGguZmxvb3IobiksIGYgPSBuIC0gdztcbiAgICAgIGlmIChmIDwgMC41KSB7XG4gICAgICAgIHJldHVybiB3O1xuICAgICAgfVxuICAgICAgaWYgKGYgPiAwLjUpIHtcbiAgICAgICAgcmV0dXJuIHcgKyAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHcgJSAyID8gdyArIDEgOiB3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhY2tJRUVFNzU0KHYsIGViaXRzLCBmYml0cykge1xuICAgICAgdmFyIGJpYXMgPSAoMSA8PCAoZWJpdHMgLSAxKSkgLSAxLFxuICAgICAgICBzLCBlLCBmLFxuICAgICAgICBpLCBiaXRzLCBzdHIsIGJ5dGVzO1xuXG4gICAgICAvLyBDb21wdXRlIHNpZ24sIGV4cG9uZW50LCBmcmFjdGlvblxuICAgICAgaWYgKHYgIT09IHYpIHtcbiAgICAgICAgLy8gTmFOXG4gICAgICAgIC8vIGh0dHA6Ly9kZXYudzMub3JnLzIwMDYvd2ViYXBpL1dlYklETC8jZXMtdHlwZS1tYXBwaW5nXG4gICAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxO1xuICAgICAgICBmID0gTWF0aC5wb3coMiwgZmJpdHMgLSAxKTtcbiAgICAgICAgcyA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHYgPT09IEluZmluaXR5IHx8IHYgPT09IC1JbmZpbml0eSkge1xuICAgICAgICBlID0gKDEgPDwgZWJpdHMpIC0gMTtcbiAgICAgICAgZiA9IDA7XG4gICAgICAgIHMgPSAodiA8IDApID8gMSA6IDA7XG4gICAgICB9IGVsc2UgaWYgKHYgPT09IDApIHtcbiAgICAgICAgZSA9IDA7XG4gICAgICAgIGYgPSAwO1xuICAgICAgICBzID0gKDEgLyB2ID09PSAtSW5maW5pdHkpID8gMSA6IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gdiA8IDA7XG4gICAgICAgIHYgPSBNYXRoLmFicyh2KTtcblxuICAgICAgICBpZiAodiA+PSBNYXRoLnBvdygyLCAxIC0gYmlhcykpIHtcbiAgICAgICAgICBlID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyh2KSAvIE1hdGguTE4yKSwgMTAyMyk7XG4gICAgICAgICAgZiA9IHJvdW5kVG9FdmVuKHYgLyBNYXRoLnBvdygyLCBlKSAqIE1hdGgucG93KDIsIGZiaXRzKSk7XG4gICAgICAgICAgaWYgKGYgLyBNYXRoLnBvdygyLCBmYml0cykgPj0gMikge1xuICAgICAgICAgICAgZSA9IGUgKyAxO1xuICAgICAgICAgICAgZiA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlID4gYmlhcykge1xuICAgICAgICAgICAgLy8gT3ZlcmZsb3dcbiAgICAgICAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxO1xuICAgICAgICAgICAgZiA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vcm1hbFxuICAgICAgICAgICAgZSA9IGUgKyBiaWFzO1xuICAgICAgICAgICAgZiA9IGYgLSBNYXRoLnBvdygyLCBmYml0cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFN1Ym5vcm1hbFxuICAgICAgICAgIGUgPSAwO1xuICAgICAgICAgIGYgPSByb3VuZFRvRXZlbih2IC8gTWF0aC5wb3coMiwgMSAtIGJpYXMgLSBmYml0cykpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFBhY2sgc2lnbiwgZXhwb25lbnQsIGZyYWN0aW9uXG4gICAgICBiaXRzID0gW107XG4gICAgICBmb3IgKGkgPSBmYml0czsgaTsgaSAtPSAxKSB7XG4gICAgICAgIGJpdHMucHVzaChmICUgMiA/IDEgOiAwKTtcbiAgICAgICAgZiA9IE1hdGguZmxvb3IoZiAvIDIpO1xuICAgICAgfVxuICAgICAgZm9yIChpID0gZWJpdHM7IGk7IGkgLT0gMSkge1xuICAgICAgICBiaXRzLnB1c2goZSAlIDIgPyAxIDogMCk7XG4gICAgICAgIGUgPSBNYXRoLmZsb29yKGUgLyAyKTtcbiAgICAgIH1cbiAgICAgIGJpdHMucHVzaChzID8gMSA6IDApO1xuICAgICAgYml0cy5yZXZlcnNlKCk7XG4gICAgICBzdHIgPSBiaXRzLmpvaW4oJycpO1xuXG4gICAgICAvLyBCaXRzIHRvIGJ5dGVzXG4gICAgICBieXRlcyA9IFtdO1xuICAgICAgd2hpbGUgKHN0ci5sZW5ndGgpIHtcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChzdHIuc2xpY2UoMCwgOCksIDIpKTtcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKDgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVucGFja0lFRUU3NTQoYnl0ZXMsIGViaXRzLCBmYml0cykge1xuICAgICAgLy8gQnl0ZXMgdG8gYml0c1xuICAgICAgdmFyIGJpdHMgPSBbXSwgaSwgaiwgYiwgc3RyLFxuICAgICAgICAgIGJpYXMsIHMsIGUsIGY7XG5cbiAgICAgIGZvciAoaSA9IGJ5dGVzLmxlbmd0aDsgaTsgaSAtPSAxKSB7XG4gICAgICAgIGIgPSBieXRlc1tpIC0gMV07XG4gICAgICAgIGZvciAoaiA9IDg7IGo7IGogLT0gMSkge1xuICAgICAgICAgIGJpdHMucHVzaChiICUgMiA/IDEgOiAwKTtcbiAgICAgICAgICBiID0gYiA+PiAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBiaXRzLnJldmVyc2UoKTtcbiAgICAgIHN0ciA9IGJpdHMuam9pbignJyk7XG5cbiAgICAgIC8vIFVucGFjayBzaWduLCBleHBvbmVudCwgZnJhY3Rpb25cbiAgICAgIGJpYXMgPSAoMSA8PCAoZWJpdHMgLSAxKSkgLSAxO1xuICAgICAgcyA9IHBhcnNlSW50KHN0ci5zbGljZSgwLCAxKSwgMikgPyAtMSA6IDE7XG4gICAgICBlID0gcGFyc2VJbnQoc3RyLnNsaWNlKDEsIDEgKyBlYml0cyksIDIpO1xuICAgICAgZiA9IHBhcnNlSW50KHN0ci5zbGljZSgxICsgZWJpdHMpLCAyKTtcblxuICAgICAgLy8gUHJvZHVjZSBudW1iZXJcbiAgICAgIGlmIChlID09PSAoMSA8PCBlYml0cykgLSAxKSB7XG4gICAgICAgIHJldHVybiBmICE9PSAwID8gTmFOIDogcyAqIEluZmluaXR5O1xuICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xuICAgICAgICAvLyBOb3JtYWxpemVkXG4gICAgICAgIHJldHVybiBzICogTWF0aC5wb3coMiwgZSAtIGJpYXMpICogKDEgKyBmIC8gTWF0aC5wb3coMiwgZmJpdHMpKTtcbiAgICAgIH0gZWxzZSBpZiAoZiAhPT0gMCkge1xuICAgICAgICAvLyBEZW5vcm1hbGl6ZWRcbiAgICAgICAgcmV0dXJuIHMgKiBNYXRoLnBvdygyLCAtKGJpYXMgLSAxKSkgKiAoZiAvIE1hdGgucG93KDIsIGZiaXRzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcyA8IDAgPyAtMCA6IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5wYWNrRmxvYXQ2NChiKSB7IHJldHVybiB1bnBhY2tJRUVFNzU0KGIsIDExLCA1Mik7IH1cbiAgICBmdW5jdGlvbiBwYWNrRmxvYXQ2NCh2KSB7IHJldHVybiBwYWNrSUVFRTc1NCh2LCAxMSwgNTIpOyB9XG4gICAgZnVuY3Rpb24gdW5wYWNrRmxvYXQzMihiKSB7IHJldHVybiB1bnBhY2tJRUVFNzU0KGIsIDgsIDIzKTsgfVxuICAgIGZ1bmN0aW9uIHBhY2tGbG9hdDMyKHYpIHsgcmV0dXJuIHBhY2tJRUVFNzU0KHYsIDgsIDIzKTsgfVxuXG4gICAgdmFyIGNvbnZlcnNpb25zID0ge1xuICAgICAgdG9GbG9hdDMyOiBmdW5jdGlvbiAobnVtKSB7IHJldHVybiB1bnBhY2tGbG9hdDMyKHBhY2tGbG9hdDMyKG51bSkpOyB9XG4gICAgfTtcbiAgICBpZiAodHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBmbG9hdDMyYXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KDEpO1xuICAgICAgY29udmVyc2lvbnMudG9GbG9hdDMyID0gZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBmbG9hdDMyYXJyYXlbMF0gPSBudW07XG4gICAgICAgIHJldHVybiBmbG9hdDMyYXJyYXlbMF07XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gY29udmVyc2lvbnM7XG4gIH0oKSk7XG5cbiAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcsIHtcbiAgICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KF8pIHsgLy8gbGVuZ3RoID0gMVxuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5leHQgPSBOdW1iZXIoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKCFFUy5TYW1lVmFsdWUobmV4dCwgRVMuVG9JbnRlZ2VyKG5leHQpKSB8fCBuZXh0IDwgMCB8fCBuZXh0ID4gMHgxMEZGRkYpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBjb2RlIHBvaW50ICcgKyBuZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0IDwgMHgxMDAwMCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQgLT0gMHgxMDAwMDtcbiAgICAgICAgICByZXN1bHQucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKChuZXh0ID4+IDEwKSArIDB4RDgwMCkpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoKG5leHQgJSAweDQwMCkgKyAweERDMDApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpIHsgLy8gcmF3Lmxlbmd0aD09PTFcbiAgICAgIHZhciBjb29rZWQgPSBFUy5Ub09iamVjdChjYWxsU2l0ZSwgJ2JhZCBjYWxsU2l0ZScpO1xuICAgICAgdmFyIHJhd1ZhbHVlID0gY29va2VkLnJhdztcbiAgICAgIHZhciByYXdTdHJpbmcgPSBFUy5Ub09iamVjdChyYXdWYWx1ZSwgJ2JhZCByYXcgdmFsdWUnKTtcbiAgICAgIHZhciBsZW4gPSByYXdTdHJpbmcubGVuZ3RoO1xuICAgICAgdmFyIGxpdGVyYWxzZWdtZW50cyA9IEVTLlRvTGVuZ3RoKGxlbik7XG4gICAgICBpZiAobGl0ZXJhbHNlZ21lbnRzIDw9IDApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RyaW5nRWxlbWVudHMgPSBbXTtcbiAgICAgIHZhciBuZXh0SW5kZXggPSAwO1xuICAgICAgdmFyIG5leHRLZXksIG5leHQsIG5leHRTZWcsIG5leHRTdWI7XG4gICAgICB3aGlsZSAobmV4dEluZGV4IDwgbGl0ZXJhbHNlZ21lbnRzKSB7XG4gICAgICAgIG5leHRLZXkgPSBTdHJpbmcobmV4dEluZGV4KTtcbiAgICAgICAgbmV4dCA9IHJhd1N0cmluZ1tuZXh0S2V5XTtcbiAgICAgICAgbmV4dFNlZyA9IFN0cmluZyhuZXh0KTtcbiAgICAgICAgc3RyaW5nRWxlbWVudHMucHVzaChuZXh0U2VnKTtcbiAgICAgICAgaWYgKG5leHRJbmRleCArIDEgPj0gbGl0ZXJhbHNlZ21lbnRzKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCA9IG5leHRJbmRleCArIDEgPCBhcmd1bWVudHMubGVuZ3RoID8gYXJndW1lbnRzW25leHRJbmRleCArIDFdIDogJyc7XG4gICAgICAgIG5leHRTdWIgPSBTdHJpbmcobmV4dCk7XG4gICAgICAgIHN0cmluZ0VsZW1lbnRzLnB1c2gobmV4dFN1Yik7XG4gICAgICAgIG5leHRJbmRleCsrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cmluZ0VsZW1lbnRzLmpvaW4oJycpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRmlyZWZveCAzMSByZXBvcnRzIHRoaXMgZnVuY3Rpb24ncyBsZW5ndGggYXMgMFxuICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMDYyNDg0XG4gIGlmIChTdHJpbmcuZnJvbUNvZGVQb2ludC5sZW5ndGggIT09IDEpIHtcbiAgICB2YXIgb3JpZ2luYWxGcm9tQ29kZVBvaW50ID0gRnVuY3Rpb24uYXBwbHkuYmluZChTdHJpbmcuZnJvbUNvZGVQb2ludCk7XG4gICAgZGVmaW5lUHJvcGVydHkoU3RyaW5nLCAnZnJvbUNvZGVQb2ludCcsIGZ1bmN0aW9uIChfKSB7IHJldHVybiBvcmlnaW5hbEZyb21Db2RlUG9pbnQodGhpcywgYXJndW1lbnRzKTsgfSwgdHJ1ZSk7XG4gIH1cblxuICB2YXIgU3RyaW5nU2hpbXMgPSB7XG4gICAgLy8gRmFzdCByZXBlYXQsIHVzZXMgdGhlIGBFeHBvbmVudGlhdGlvbiBieSBzcXVhcmluZ2AgYWxnb3JpdGhtLlxuICAgIC8vIFBlcmY6IGh0dHA6Ly9qc3BlcmYuY29tL3N0cmluZy1yZXBlYXQyLzJcbiAgICByZXBlYXQ6IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVwZWF0ID0gZnVuY3Rpb24gKHMsIHRpbWVzKSB7XG4gICAgICAgIGlmICh0aW1lcyA8IDEpIHsgcmV0dXJuICcnOyB9XG4gICAgICAgIGlmICh0aW1lcyAlIDIpIHsgcmV0dXJuIHJlcGVhdChzLCB0aW1lcyAtIDEpICsgczsgfVxuICAgICAgICB2YXIgaGFsZiA9IHJlcGVhdChzLCB0aW1lcyAvIDIpO1xuICAgICAgICByZXR1cm4gaGFsZiArIGhhbGY7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHRpbWVzKSB7XG4gICAgICAgIHZhciB0aGlzU3RyID0gU3RyaW5nKEVTLkNoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMpKTtcbiAgICAgICAgdGltZXMgPSBFUy5Ub0ludGVnZXIodGltZXMpO1xuICAgICAgICBpZiAodGltZXMgPCAwIHx8IHRpbWVzID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIFN0cmluZyNyZXBlYXQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVwZWF0KHRoaXNTdHIsIHRpbWVzKTtcbiAgICAgIH07XG4gICAgfSgpKSxcblxuICAgIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uIChzZWFyY2hTdHIpIHtcbiAgICAgIHZhciB0aGlzU3RyID0gU3RyaW5nKEVTLkNoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMpKTtcbiAgICAgIGlmIChUeXBlLnJlZ2V4KHNlYXJjaFN0cikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgbWV0aG9kIFwic3RhcnRzV2l0aFwiIHdpdGggYSByZWdleCcpO1xuICAgICAgfVxuICAgICAgc2VhcmNoU3RyID0gU3RyaW5nKHNlYXJjaFN0cik7XG4gICAgICB2YXIgc3RhcnRBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgIHZhciBzdGFydCA9IE1hdGgubWF4KEVTLlRvSW50ZWdlcihzdGFydEFyZyksIDApO1xuICAgICAgcmV0dXJuIHRoaXNTdHIuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgc2VhcmNoU3RyLmxlbmd0aCkgPT09IHNlYXJjaFN0cjtcbiAgICB9LFxuXG4gICAgZW5kc1dpdGg6IGZ1bmN0aW9uIChzZWFyY2hTdHIpIHtcbiAgICAgIHZhciB0aGlzU3RyID0gU3RyaW5nKEVTLkNoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMpKTtcbiAgICAgIGlmIChUeXBlLnJlZ2V4KHNlYXJjaFN0cikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgbWV0aG9kIFwiZW5kc1dpdGhcIiB3aXRoIGEgcmVnZXgnKTtcbiAgICAgIH1cbiAgICAgIHNlYXJjaFN0ciA9IFN0cmluZyhzZWFyY2hTdHIpO1xuICAgICAgdmFyIHRoaXNMZW4gPSB0aGlzU3RyLmxlbmd0aDtcbiAgICAgIHZhciBwb3NBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgIHZhciBwb3MgPSB0eXBlb2YgcG9zQXJnID09PSAndW5kZWZpbmVkJyA/IHRoaXNMZW4gOiBFUy5Ub0ludGVnZXIocG9zQXJnKTtcbiAgICAgIHZhciBlbmQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCB0aGlzTGVuKTtcbiAgICAgIHJldHVybiB0aGlzU3RyLnNsaWNlKGVuZCAtIHNlYXJjaFN0ci5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cjtcbiAgICB9LFxuXG4gICAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaFN0cmluZykge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICAvLyBTb21laG93IHRoaXMgdHJpY2sgbWFrZXMgbWV0aG9kIDEwMCUgY29tcGF0IHdpdGggdGhlIHNwZWMuXG4gICAgICByZXR1cm4gX2luZGV4T2YodGhpcywgc2VhcmNoU3RyaW5nLCBwb3NpdGlvbikgIT09IC0xO1xuICAgIH0sXG5cbiAgICBjb2RlUG9pbnRBdDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgdmFyIHBvc2l0aW9uID0gRVMuVG9JbnRlZ2VyKHBvcyk7XG4gICAgICB2YXIgbGVuZ3RoID0gdGhpc1N0ci5sZW5ndGg7XG4gICAgICBpZiAocG9zaXRpb24gPj0gMCAmJiBwb3NpdGlvbiA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgZmlyc3QgPSB0aGlzU3RyLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgICAgICB2YXIgaXNFbmQgPSAocG9zaXRpb24gKyAxID09PSBsZW5ndGgpO1xuICAgICAgICBpZiAoZmlyc3QgPCAweEQ4MDAgfHwgZmlyc3QgPiAweERCRkYgfHwgaXNFbmQpIHsgcmV0dXJuIGZpcnN0OyB9XG4gICAgICAgIHZhciBzZWNvbmQgPSB0aGlzU3RyLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKTtcbiAgICAgICAgaWYgKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpIHsgcmV0dXJuIGZpcnN0OyB9XG4gICAgICAgIHJldHVybiAoKGZpcnN0IC0gMHhEODAwKSAqIDEwMjQpICsgKHNlY29uZCAtIDB4REMwMCkgKyAweDEwMDAwO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCBTdHJpbmdTaGltcyk7XG5cbiAgdmFyIGhhc1N0cmluZ1RyaW1CdWcgPSAnXFx1MDA4NScudHJpbSgpLmxlbmd0aCAhPT0gMTtcbiAgaWYgKGhhc1N0cmluZ1RyaW1CdWcpIHtcbiAgICBkZWxldGUgU3RyaW5nLnByb3RvdHlwZS50cmltO1xuICAgIC8vIHdoaXRlc3BhY2UgZnJvbTogaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS41LjQuMjBcbiAgICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9lcy1zaGltcy9lczUtc2hpbS9ibG9iL3YzLjQuMC9lczUtc2hpbS5qcyNMMTMwNC1MMTMyNFxuICAgIHZhciB3cyA9IFtcbiAgICAgICdcXHgwOVxceDBBXFx4MEJcXHgwQ1xceDBEXFx4MjBcXHhBMFxcdTE2ODBcXHUxODBFXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwMycsXG4gICAgICAnXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdTIwMjgnLFxuICAgICAgJ1xcdTIwMjlcXHVGRUZGJ1xuICAgIF0uam9pbignJyk7XG4gICAgdmFyIHRyaW1SZWdleHAgPSBuZXcgUmVnRXhwKCcoXlsnICsgd3MgKyAnXSspfChbJyArIHdzICsgJ10rJCknLCAnZycpO1xuICAgIGRlZmluZVByb3BlcnRpZXMoU3RyaW5nLnByb3RvdHlwZSwge1xuICAgICAgdHJpbTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMgPT09ICd1bmRlZmluZWQnIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2FuJ3QgY29udmVydCBcIiArIHRoaXMgKyAnIHRvIG9iamVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcykucmVwbGFjZSh0cmltUmVnZXhwLCAnJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBzZWUgaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXN0cmluZy5wcm90b3R5cGUtQEBpdGVyYXRvclxuICB2YXIgU3RyaW5nSXRlcmF0b3IgPSBmdW5jdGlvbiAocykge1xuICAgIHRoaXMuX3MgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUocykpO1xuICAgIHRoaXMuX2kgPSAwO1xuICB9O1xuICBTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcyA9IHRoaXMuX3MsIGkgPSB0aGlzLl9pO1xuICAgIGlmICh0eXBlb2YgcyA9PT0gJ3VuZGVmaW5lZCcgfHwgaSA+PSBzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fcyA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB7IHZhbHVlOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG4gICAgdmFyIGZpcnN0ID0gcy5jaGFyQ29kZUF0KGkpLCBzZWNvbmQsIGxlbjtcbiAgICBpZiAoZmlyc3QgPCAweEQ4MDAgfHwgZmlyc3QgPiAweERCRkYgfHwgKGkgKyAxKSA9PT0gcy5sZW5ndGgpIHtcbiAgICAgIGxlbiA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlY29uZCA9IHMuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICBsZW4gPSAoc2Vjb25kIDwgMHhEQzAwIHx8IHNlY29uZCA+IDB4REZGRikgPyAxIDogMjtcbiAgICB9XG4gICAgdGhpcy5faSA9IGkgKyBsZW47XG4gICAgcmV0dXJuIHsgdmFsdWU6IHMuc3Vic3RyKGksIGxlbiksIGRvbmU6IGZhbHNlIH07XG4gIH07XG4gIGFkZEl0ZXJhdG9yKFN0cmluZ0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIGFkZEl0ZXJhdG9yKFN0cmluZy5wcm90b3R5cGUsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0l0ZXJhdG9yKHRoaXMpO1xuICB9KTtcblxuICBpZiAoIXN0YXJ0c1dpdGhJc0NvbXBsaWFudCkge1xuICAgIC8vIEZpcmVmb3ggaGFzIGEgbm9uY29tcGxpYW50IHN0YXJ0c1dpdGggaW1wbGVtZW50YXRpb25cbiAgICBkZWZpbmVQcm9wZXJ0aWVzKFN0cmluZy5wcm90b3R5cGUsIHtcbiAgICAgIHN0YXJ0c1dpdGg6IFN0cmluZ1NoaW1zLnN0YXJ0c1dpdGgsXG4gICAgICBlbmRzV2l0aDogU3RyaW5nU2hpbXMuZW5kc1dpdGhcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBBcnJheVNoaW1zID0ge1xuICAgIGZyb206IGZ1bmN0aW9uIChpdGVyYWJsZSkge1xuICAgICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG5cbiAgICAgIHZhciBsaXN0ID0gRVMuVG9PYmplY3QoaXRlcmFibGUsICdiYWQgaXRlcmFibGUnKTtcbiAgICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnICYmICFFUy5Jc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuXG4gICAgICB2YXIgaGFzVGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgICAgdmFyIHRoaXNBcmcgPSBoYXNUaGlzQXJnID8gYXJndW1lbnRzWzJdIDogdm9pZCAwO1xuXG4gICAgICB2YXIgdXNpbmdJdGVyYXRvciA9IEVTLklzSXRlcmFibGUobGlzdCk7XG4gICAgICAvLyBkb2VzIHRoZSBzcGVjIHJlYWxseSBtZWFuIHRoYXQgQXJyYXlzIHNob3VsZCB1c2UgQXJyYXlJdGVyYXRvcj9cbiAgICAgIC8vIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjQxNlxuICAgICAgLy9pZiAoQXJyYXkuaXNBcnJheShsaXN0KSkgeyB1c2luZ0l0ZXJhdG9yPWZhbHNlOyB9XG5cbiAgICAgIHZhciBsZW5ndGg7XG4gICAgICB2YXIgcmVzdWx0LCBpLCB2YWx1ZTtcbiAgICAgIGlmICh1c2luZ0l0ZXJhdG9yKSB7XG4gICAgICAgIGkgPSAwO1xuICAgICAgICByZXN1bHQgPSBFUy5Jc0NhbGxhYmxlKHRoaXMpID8gT2JqZWN0KG5ldyB0aGlzKCkpIDogW107XG4gICAgICAgIHZhciBpdCA9IHVzaW5nSXRlcmF0b3IgPyBFUy5HZXRJdGVyYXRvcihsaXN0KSA6IG51bGw7XG4gICAgICAgIHZhciBpdGVyYXRpb25WYWx1ZTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgaXRlcmF0aW9uVmFsdWUgPSBFUy5JdGVyYXRvck5leHQoaXQpO1xuICAgICAgICAgIGlmICghaXRlcmF0aW9uVmFsdWUuZG9uZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBpdGVyYXRpb25WYWx1ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgICAgICByZXN1bHRbaV0gPSBoYXNUaGlzQXJnID8gbWFwRm4uY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSkgOiBtYXBGbih2YWx1ZSwgaSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKCFpdGVyYXRpb25WYWx1ZS5kb25lKTtcbiAgICAgICAgbGVuZ3RoID0gaTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbmd0aCA9IEVTLlRvTGVuZ3RoKGxpc3QubGVuZ3RoKTtcbiAgICAgICAgcmVzdWx0ID0gRVMuSXNDYWxsYWJsZSh0aGlzKSA/IE9iamVjdChuZXcgdGhpcyhsZW5ndGgpKSA6IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBoYXNUaGlzQXJnID8gbWFwRm4uY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSkgOiBtYXBGbih2YWx1ZSwgaSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXN1bHQubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgb2Y6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuICBkZWZpbmVQcm9wZXJ0aWVzKEFycmF5LCBBcnJheVNoaW1zKTtcblxuICB2YXIgYXJyYXlGcm9tU3dhbGxvd3NOZWdhdGl2ZUxlbmd0aHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiAtMSB9KS5sZW5ndGggPT09IDA7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcbiAgLy8gRml4ZXMgYSBGaXJlZm94IGJ1ZyBpbiB2MzJcbiAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTA2Mzk5M1xuICBpZiAoIWFycmF5RnJvbVN3YWxsb3dzTmVnYXRpdmVMZW5ndGhzKCkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheSwgJ2Zyb20nLCBBcnJheVNoaW1zLmZyb20sIHRydWUpO1xuICB9XG5cbiAgLy8gT3VyIEFycmF5SXRlcmF0b3IgaXMgcHJpdmF0ZTsgc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvZXM2LXNoaW0vaXNzdWVzLzI1MlxuICBBcnJheUl0ZXJhdG9yID0gZnVuY3Rpb24gKGFycmF5LCBraW5kKSB7XG4gICAgICB0aGlzLmkgPSAwO1xuICAgICAgdGhpcy5hcnJheSA9IGFycmF5O1xuICAgICAgdGhpcy5raW5kID0ga2luZDtcbiAgfTtcblxuICBkZWZpbmVQcm9wZXJ0aWVzKEFycmF5SXRlcmF0b3IucHJvdG90eXBlLCB7XG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGkgPSB0aGlzLmksIGFycmF5ID0gdGhpcy5hcnJheTtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBBcnJheUl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOb3QgYW4gQXJyYXlJdGVyYXRvcicpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBhcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGxlbiA9IEVTLlRvTGVuZ3RoKGFycmF5Lmxlbmd0aCk7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB2YXIga2luZCA9IHRoaXMua2luZDtcbiAgICAgICAgICB2YXIgcmV0dmFsO1xuICAgICAgICAgIGlmIChraW5kID09PSAna2V5Jykge1xuICAgICAgICAgICAgcmV0dmFsID0gaTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgIHJldHZhbCA9IGFycmF5W2ldO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ2VudHJ5Jykge1xuICAgICAgICAgICAgcmV0dmFsID0gW2ksIGFycmF5W2ldXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pID0gaSArIDE7XG4gICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHJldHZhbCwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5hcnJheSA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB7IHZhbHVlOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG4gIH0pO1xuICBhZGRJdGVyYXRvcihBcnJheUl0ZXJhdG9yLnByb3RvdHlwZSk7XG5cbiAgdmFyIEFycmF5UHJvdG90eXBlU2hpbXMgPSB7XG4gICAgY29weVdpdGhpbjogZnVuY3Rpb24gKHRhcmdldCwgc3RhcnQpIHtcbiAgICAgIHZhciBlbmQgPSBhcmd1bWVudHNbMl07IC8vIGNvcHlXaXRoaW4ubGVuZ3RoIG11c3QgYmUgMlxuICAgICAgdmFyIG8gPSBFUy5Ub09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBFUy5Ub0xlbmd0aChvLmxlbmd0aCk7XG4gICAgICB0YXJnZXQgPSBFUy5Ub0ludGVnZXIodGFyZ2V0KTtcbiAgICAgIHN0YXJ0ID0gRVMuVG9JbnRlZ2VyKHN0YXJ0KTtcbiAgICAgIHZhciB0byA9IHRhcmdldCA8IDAgPyBNYXRoLm1heChsZW4gKyB0YXJnZXQsIDApIDogTWF0aC5taW4odGFyZ2V0LCBsZW4pO1xuICAgICAgdmFyIGZyb20gPSBzdGFydCA8IDAgPyBNYXRoLm1heChsZW4gKyBzdGFydCwgMCkgOiBNYXRoLm1pbihzdGFydCwgbGVuKTtcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICd1bmRlZmluZWQnID8gbGVuIDogRVMuVG9JbnRlZ2VyKGVuZCk7XG4gICAgICB2YXIgZmluID0gZW5kIDwgMCA/IE1hdGgubWF4KGxlbiArIGVuZCwgMCkgOiBNYXRoLm1pbihlbmQsIGxlbik7XG4gICAgICB2YXIgY291bnQgPSBNYXRoLm1pbihmaW4gLSBmcm9tLCBsZW4gLSB0byk7XG4gICAgICB2YXIgZGlyZWN0aW9uID0gMTtcbiAgICAgIGlmIChmcm9tIDwgdG8gJiYgdG8gPCAoZnJvbSArIGNvdW50KSkge1xuICAgICAgICBkaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgZnJvbSArPSBjb3VudCAtIDE7XG4gICAgICAgIHRvICs9IGNvdW50IC0gMTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eShvLCBmcm9tKSkge1xuICAgICAgICAgIG9bdG9dID0gb1tmcm9tXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb1tmcm9tXTtcbiAgICAgICAgfVxuICAgICAgICBmcm9tICs9IGRpcmVjdGlvbjtcbiAgICAgICAgdG8gKz0gZGlyZWN0aW9uO1xuICAgICAgICBjb3VudCAtPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG87XG4gICAgfSxcblxuICAgIGZpbGw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHN0YXJ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICB2YXIgZW5kID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB2b2lkIDA7XG4gICAgICB2YXIgTyA9IEVTLlRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbiA9IEVTLlRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIHN0YXJ0ID0gRVMuVG9JbnRlZ2VyKHR5cGVvZiBzdGFydCA9PT0gJ3VuZGVmaW5lZCcgPyAwIDogc3RhcnQpO1xuICAgICAgZW5kID0gRVMuVG9JbnRlZ2VyKHR5cGVvZiBlbmQgPT09ICd1bmRlZmluZWQnID8gbGVuIDogZW5kKTtcblxuICAgICAgdmFyIHJlbGF0aXZlU3RhcnQgPSBzdGFydCA8IDAgPyBNYXRoLm1heChsZW4gKyBzdGFydCwgMCkgOiBNYXRoLm1pbihzdGFydCwgbGVuKTtcbiAgICAgIHZhciByZWxhdGl2ZUVuZCA9IGVuZCA8IDAgPyBsZW4gKyBlbmQgOiBlbmQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSByZWxhdGl2ZVN0YXJ0OyBpIDwgbGVuICYmIGkgPCByZWxhdGl2ZUVuZDsgKytpKSB7XG4gICAgICAgIE9baV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBPO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbiBmaW5kKHByZWRpY2F0ZSkge1xuICAgICAgdmFyIGxpc3QgPSBFUy5Ub09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5ndGggPSBFUy5Ub0xlbmd0aChsaXN0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUVTLklzQ2FsbGFibGUocHJlZGljYXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kOiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXNBcmcpIHtcbiAgICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgICB9IGVsc2UgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZmluZEluZGV4OiBmdW5jdGlvbiBmaW5kSW5kZXgocHJlZGljYXRlKSB7XG4gICAgICB2YXIgbGlzdCA9IEVTLlRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbmd0aCA9IEVTLlRvTGVuZ3RoKGxpc3QubGVuZ3RoKTtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShwcmVkaWNhdGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5I2ZpbmRJbmRleDogcHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzQXJnKSB7XG4gICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIGxpc3RbaV0sIGksIGxpc3QpKSB7IHJldHVybiBpOyB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJlZGljYXRlKGxpc3RbaV0sIGksIGxpc3QpKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9LFxuXG4gICAga2V5czogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUl0ZXJhdG9yKHRoaXMsICdrZXknKTtcbiAgICB9LFxuXG4gICAgdmFsdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IodGhpcywgJ3ZhbHVlJyk7XG4gICAgfSxcblxuICAgIGVudHJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcih0aGlzLCAnZW50cnknKTtcbiAgICB9XG4gIH07XG4gIC8vIFNhZmFyaSA3LjEgZGVmaW5lcyBBcnJheSNrZXlzIGFuZCBBcnJheSNlbnRyaWVzIG5hdGl2ZWx5LFxuICAvLyBidXQgdGhlIHJlc3VsdGluZyBBcnJheUl0ZXJhdG9yIG9iamVjdHMgZG9uJ3QgaGF2ZSBhIFwibmV4dFwiIG1ldGhvZC5cbiAgaWYgKEFycmF5LnByb3RvdHlwZS5rZXlzICYmICFFUy5Jc0NhbGxhYmxlKFsxXS5rZXlzKCkubmV4dCkpIHtcbiAgICBkZWxldGUgQXJyYXkucHJvdG90eXBlLmtleXM7XG4gIH1cbiAgaWYgKEFycmF5LnByb3RvdHlwZS5lbnRyaWVzICYmICFFUy5Jc0NhbGxhYmxlKFsxXS5lbnRyaWVzKCkubmV4dCkpIHtcbiAgICBkZWxldGUgQXJyYXkucHJvdG90eXBlLmVudHJpZXM7XG4gIH1cblxuICAvLyBDaHJvbWUgMzggZGVmaW5lcyBBcnJheSNrZXlzIGFuZCBBcnJheSNlbnRyaWVzLCBhbmQgQXJyYXkjQEBpdGVyYXRvciwgYnV0IG5vdCBBcnJheSN2YWx1ZXNcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5rZXlzICYmIEFycmF5LnByb3RvdHlwZS5lbnRyaWVzICYmICFBcnJheS5wcm90b3R5cGUudmFsdWVzICYmIEFycmF5LnByb3RvdHlwZVskaXRlcmF0b3IkXSkge1xuICAgIGRlZmluZVByb3BlcnRpZXMoQXJyYXkucHJvdG90eXBlLCB7XG4gICAgICB2YWx1ZXM6IEFycmF5LnByb3RvdHlwZVskaXRlcmF0b3IkXVxuICAgIH0pO1xuICAgIGlmIChUeXBlLnN5bWJvbChTeW1ib2wudW5zY29wYWJsZXMpKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGVbU3ltYm9sLnVuc2NvcGFibGVzXS52YWx1ZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBkZWZpbmVQcm9wZXJ0aWVzKEFycmF5LnByb3RvdHlwZSwgQXJyYXlQcm90b3R5cGVTaGltcyk7XG5cbiAgYWRkSXRlcmF0b3IoQXJyYXkucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnZhbHVlcygpOyB9KTtcbiAgLy8gQ2hyb21lIGRlZmluZXMga2V5cy92YWx1ZXMvZW50cmllcyBvbiBBcnJheSwgYnV0IGRvZXNuJ3QgZ2l2ZSB1c1xuICAvLyBhbnkgd2F5IHRvIGlkZW50aWZ5IGl0cyBpdGVyYXRvci4gIFNvIGFkZCBvdXIgb3duIHNoaW1tZWQgZmllbGQuXG4gIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcbiAgICBhZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YoW10udmFsdWVzKCkpKTtcbiAgfVxuXG4gIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIGRlZmluZVByb3BlcnRpZXMoTnVtYmVyLCB7XG4gICAgTUFYX1NBRkVfSU5URUdFUjogbWF4U2FmZUludGVnZXIsXG4gICAgTUlOX1NBRkVfSU5URUdFUjogLW1heFNhZmVJbnRlZ2VyLFxuICAgIEVQU0lMT046IDIuMjIwNDQ2MDQ5MjUwMzEzZS0xNixcblxuICAgIHBhcnNlSW50OiBnbG9iYWxzLnBhcnNlSW50LFxuICAgIHBhcnNlRmxvYXQ6IGdsb2JhbHMucGFyc2VGbG9hdCxcblxuICAgIGlzRmluaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGlzSW50ZWdlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSAmJiBFUy5Ub0ludGVnZXIodmFsdWUpID09PSB2YWx1ZTtcbiAgICB9LFxuXG4gICAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiYgTWF0aC5hYnModmFsdWUpIDw9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgIH0sXG5cbiAgICBpc05hTjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAvLyBOYU4gIT09IE5hTiwgYnV0IHRoZXkgYXJlIGlkZW50aWNhbC5cbiAgICAgIC8vIE5hTnMgYXJlIHRoZSBvbmx5IG5vbi1yZWZsZXhpdmUgdmFsdWUsIGkuZS4sIGlmIHggIT09IHgsXG4gICAgICAvLyB0aGVuIHggaXMgTmFOLlxuICAgICAgLy8gaXNOYU4gaXMgYnJva2VuOiBpdCBjb252ZXJ0cyBpdHMgYXJndW1lbnQgdG8gbnVtYmVyLCBzb1xuICAgICAgLy8gaXNOYU4oJ2ZvbycpID0+IHRydWVcbiAgICAgIHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICAvLyBXb3JrIGFyb3VuZCBidWdzIGluIEFycmF5I2ZpbmQgYW5kIEFycmF5I2ZpbmRJbmRleCAtLSBlYXJseVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgc2tpcHBlZCBob2xlcyBpbiBzcGFyc2UgYXJyYXlzLiAoTm90ZSB0aGF0IHRoZVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgb2YgZmluZC9maW5kSW5kZXggaW5kaXJlY3RseSB1c2Ugc2hpbW1lZFxuICAvLyBtZXRob2RzIG9mIE51bWJlciwgc28gdGhpcyB0ZXN0IGhhcyB0byBoYXBwZW4gZG93biBoZXJlLilcbiAgaWYgKCFbLCAxXS5maW5kKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywgQXJyYXlQcm90b3R5cGVTaGltcy5maW5kLCB0cnVlKTtcbiAgfVxuICBpZiAoWywgMV0uZmluZEluZGV4KGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkgIT09IDApIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kSW5kZXgnLCBBcnJheVByb3RvdHlwZVNoaW1zLmZpbmRJbmRleCwgdHJ1ZSk7XG4gIH1cblxuICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuICAgIGRlZmluZVByb3BlcnRpZXMoT2JqZWN0LCB7XG4gICAgICAvLyAxOS4xLjMuMVxuICAgICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3QodGFyZ2V0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoT2JqZWN0KHNvdXJjZSkpLnJlZHVjZShmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgIH0sIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgaXM6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBFUy5TYW1lVmFsdWUoYSwgYik7XG4gICAgICB9LFxuXG4gICAgICAvLyAxOS4xLjMuOVxuICAgICAgLy8gc2hpbSBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vNTU5MzU1NFxuICAgICAgc2V0UHJvdG90eXBlT2Y6IChmdW5jdGlvbiAoT2JqZWN0LCBtYWdpYykge1xuICAgICAgICB2YXIgc2V0O1xuXG4gICAgICAgIHZhciBjaGVja0FyZ3MgPSBmdW5jdGlvbiAoTywgcHJvdG8pIHtcbiAgICAgICAgICBpZiAoIUVTLlR5cGVJc09iamVjdChPKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBwcm90b3R5cGUgb24gYSBub24tb2JqZWN0Jyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghKHByb3RvID09PSBudWxsIHx8IEVTLlR5cGVJc09iamVjdChwcm90bykpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYW4gb25seSBzZXQgcHJvdG90eXBlIHRvIGFuIG9iamVjdCBvciBudWxsJyArIHByb3RvKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNldFByb3RvdHlwZU9mID0gZnVuY3Rpb24gKE8sIHByb3RvKSB7XG4gICAgICAgICAgY2hlY2tBcmdzKE8sIHByb3RvKTtcbiAgICAgICAgICBzZXQuY2FsbChPLCBwcm90byk7XG4gICAgICAgICAgcmV0dXJuIE87XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyB0aGlzIHdvcmtzIGFscmVhZHkgaW4gRmlyZWZveCBhbmQgU2FmYXJpXG4gICAgICAgICAgc2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPYmplY3QucHJvdG90eXBlLCBtYWdpYykuc2V0O1xuICAgICAgICAgIHNldC5jYWxsKHt9LCBudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlICE9PSB7fVttYWdpY10pIHtcbiAgICAgICAgICAgIC8vIElFIDwgMTEgY2Fubm90IGJlIHNoaW1tZWRcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gcHJvYmFibHkgQ2hyb21lIG9yIHNvbWUgb2xkIE1vYmlsZSBzdG9jayBicm93c2VyXG4gICAgICAgICAgc2V0ID0gZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgICAgICAgICB0aGlzW21hZ2ljXSA9IHByb3RvO1xuICAgICAgICAgIH07XG4gICAgICAgICAgLy8gcGxlYXNlIG5vdGUgdGhhdCB0aGlzIHdpbGwgKipub3QqKiB3b3JrXG4gICAgICAgICAgLy8gaW4gdGhvc2UgYnJvd3NlcnMgdGhhdCBkbyBub3QgaW5oZXJpdFxuICAgICAgICAgIC8vIF9fcHJvdG9fXyBieSBtaXN0YWtlIGZyb20gT2JqZWN0LnByb3RvdHlwZVxuICAgICAgICAgIC8vIGluIHRoZXNlIGNhc2VzIHdlIHNob3VsZCBwcm9iYWJseSB0aHJvdyBhbiBlcnJvclxuICAgICAgICAgIC8vIG9yIGF0IGxlYXN0IGJlIGluZm9ybWVkIGFib3V0IHRoZSBpc3N1ZVxuICAgICAgICAgIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID0gc2V0UHJvdG90eXBlT2YoXG4gICAgICAgICAgICBzZXRQcm90b3R5cGVPZih7fSwgbnVsbCksXG4gICAgICAgICAgICBPYmplY3QucHJvdG90eXBlXG4gICAgICAgICAgKSBpbnN0YW5jZW9mIE9iamVjdDtcbiAgICAgICAgICAvLyBzZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9PT0gdHJ1ZSBtZWFucyBpdCB3b3JrcyBhcyBtZWFudFxuICAgICAgICAgIC8vIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID09PSBmYWxzZSBtZWFucyBpdCdzIG5vdCAxMDAlIHJlbGlhYmxlXG4gICAgICAgICAgLy8gc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPT09IHVuZGVmaW5lZFxuICAgICAgICAgIC8vIG9yXG4gICAgICAgICAgLy8gc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPT0gIG51bGwgbWVhbnMgaXQncyBub3QgYSBwb2x5ZmlsbFxuICAgICAgICAgIC8vIHdoaWNoIG1lYW5zIGl0IHdvcmtzIGFzIGV4cGVjdGVkXG4gICAgICAgICAgLy8gd2UgY2FuIGV2ZW4gZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuX19wcm90b19fO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRQcm90b3R5cGVPZjtcbiAgICAgIH0oT2JqZWN0LCAnX19wcm90b19fJykpXG4gICAgfSk7XG4gIH1cblxuICAvLyBXb3JrYXJvdW5kIGJ1ZyBpbiBPcGVyYSAxMiB3aGVyZSBzZXRQcm90b3R5cGVPZih4LCBudWxsKSBkb2Vzbid0IHdvcmssXG4gIC8vIGJ1dCBPYmplY3QuY3JlYXRlKG51bGwpIGRvZXMuXG4gIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mICYmXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LnNldFByb3RvdHlwZU9mKHt9LCBudWxsKSkgIT09IG51bGwgJiZcbiAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QuY3JlYXRlKG51bGwpKSA9PT0gbnVsbCkge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgRkFLRU5VTEwgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgdmFyIGdwbyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiwgc3BvID0gT2JqZWN0LnNldFByb3RvdHlwZU9mO1xuICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGdwbyhvKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gRkFLRU5VTEwgPyBudWxsIDogcmVzdWx0O1xuICAgICAgfTtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChvLCBwKSB7XG4gICAgICAgIGlmIChwID09PSBudWxsKSB7IHAgPSBGQUtFTlVMTDsgfVxuICAgICAgICByZXR1cm4gc3BvKG8sIHApO1xuICAgICAgfTtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9IGZhbHNlO1xuICAgIH0oKSk7XG4gIH1cblxuICB0cnkge1xuICAgIE9iamVjdC5rZXlzKCdmb28nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciBvcmlnaW5hbE9iamVjdEtleXMgPSBPYmplY3Qua2V5cztcbiAgICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBvcmlnaW5hbE9iamVjdEtleXMoRVMuVG9PYmplY3Qob2JqKSk7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghUmVnRXhwLnByb3RvdHlwZS5mbGFncyAmJiBzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG4gICAgdmFyIHJlZ0V4cEZsYWdzR2V0dGVyID0gZnVuY3Rpb24gZmxhZ3MoKSB7XG4gICAgICBpZiAoIUVTLlR5cGVJc09iamVjdCh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSB0eXBlOiBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSAnJztcbiAgICAgIGlmICh0aGlzLmdsb2JhbCkge1xuICAgICAgICByZXN1bHQgKz0gJ2cnO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaWdub3JlQ2FzZSkge1xuICAgICAgICByZXN1bHQgKz0gJ2knO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubXVsdGlsaW5lKSB7XG4gICAgICAgIHJlc3VsdCArPSAnbSc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy51bmljb2RlKSB7XG4gICAgICAgIHJlc3VsdCArPSAndSc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGlja3kpIHtcbiAgICAgICAgcmVzdWx0ICs9ICd5JztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIFZhbHVlLmdldHRlcihSZWdFeHAucHJvdG90eXBlLCAnZmxhZ3MnLCByZWdFeHBGbGFnc0dldHRlcik7XG4gIH1cblxuICB2YXIgcmVnRXhwU3VwcG9ydHNGbGFnc1dpdGhSZWdleCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBTdHJpbmcobmV3IFJlZ0V4cCgvYS9nLCAnaScpKSA9PT0gJy9hL2knO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0oKSk7XG5cbiAgaWYgKCFyZWdFeHBTdXBwb3J0c0ZsYWdzV2l0aFJlZ2V4ICYmIHN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcbiAgICB2YXIgT3JpZ1JlZ0V4cCA9IFJlZ0V4cDtcbiAgICB2YXIgUmVnRXhwU2hpbSA9IGZ1bmN0aW9uIFJlZ0V4cChwYXR0ZXJuLCBmbGFncykge1xuICAgICAgaWYgKFR5cGUucmVnZXgocGF0dGVybikgJiYgVHlwZS5zdHJpbmcoZmxhZ3MpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4uc291cmNlLCBmbGFncyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IE9yaWdSZWdFeHAocGF0dGVybiwgZmxhZ3MpO1xuICAgIH07XG4gICAgZGVmaW5lUHJvcGVydHkoUmVnRXhwU2hpbSwgJ3RvU3RyaW5nJywgT3JpZ1JlZ0V4cC50b1N0cmluZy5iaW5kKE9yaWdSZWdFeHApLCB0cnVlKTtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAvLyBzZXRzIHVwIHByb3BlciBwcm90b3R5cGUgY2hhaW4gd2hlcmUgcG9zc2libGVcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihPcmlnUmVnRXhwLCBSZWdFeHBTaGltKTtcbiAgICB9XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoT3JpZ1JlZ0V4cCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAnJGlucHV0JykgeyByZXR1cm47IH0gLy8gQ2hyb21lIDwgdjM5ICYgT3BlcmEgPCAyNiBoYXZlIGEgbm9uc3RhbmRhcmQgXCIkaW5wdXRcIiBwcm9wZXJ0eVxuICAgICAgaWYgKGtleSBpbiBub29wKSB7IHJldHVybjsgfVxuICAgICAgVmFsdWUucHJveHkoT3JpZ1JlZ0V4cCwga2V5LCBSZWdFeHBTaGltKTtcbiAgICB9KTtcbiAgICBSZWdFeHBTaGltLnByb3RvdHlwZSA9IE9yaWdSZWdFeHAucHJvdG90eXBlO1xuICAgIFZhbHVlLnJlZGVmaW5lKE9yaWdSZWdFeHAucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBSZWdFeHBTaGltKTtcbiAgICAvKmdsb2JhbHMgUmVnRXhwOiB0cnVlICovXG4gICAgUmVnRXhwID0gUmVnRXhwU2hpbTtcbiAgICBWYWx1ZS5yZWRlZmluZShnbG9iYWxzLCAnUmVnRXhwJywgUmVnRXhwU2hpbSk7XG4gICAgLypnbG9iYWxzIFJlZ0V4cDogZmFsc2UgKi9cbiAgfVxuXG4gIHZhciBNYXRoU2hpbXMgPSB7XG4gICAgYWNvc2g6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKE51bWJlci5pc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAxKSB7IHJldHVybiBOYU47IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gMSkgeyByZXR1cm4gMDsgfVxuICAgICAgaWYgKHZhbHVlID09PSBJbmZpbml0eSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIHJldHVybiBNYXRoLmxvZyh2YWx1ZSArIE1hdGguc3FydCh2YWx1ZSAqIHZhbHVlIC0gMSkpO1xuICAgIH0sXG5cbiAgICBhc2luaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IDAgfHwgIWdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/IC1NYXRoLmFzaW5oKC12YWx1ZSkgOiBNYXRoLmxvZyh2YWx1ZSArIE1hdGguc3FydCh2YWx1ZSAqIHZhbHVlICsgMSkpO1xuICAgIH0sXG5cbiAgICBhdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlID09PSAtMSkgeyByZXR1cm4gLUluZmluaXR5OyB9XG4gICAgICBpZiAodmFsdWUgPT09IDEpIHsgcmV0dXJuIEluZmluaXR5OyB9XG4gICAgICBpZiAodmFsdWUgPT09IDApIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gMC41ICogTWF0aC5sb2coKDEgKyB2YWx1ZSkgLyAoMSAtIHZhbHVlKSk7XG4gICAgfSxcblxuICAgIGNicnQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSAwKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgdmFyIG5lZ2F0ZSA9IHZhbHVlIDwgMCwgcmVzdWx0O1xuICAgICAgaWYgKG5lZ2F0ZSkgeyB2YWx1ZSA9IC12YWx1ZTsgfVxuICAgICAgcmVzdWx0ID0gTWF0aC5wb3codmFsdWUsIDEgLyAzKTtcbiAgICAgIHJldHVybiBuZWdhdGUgPyAtcmVzdWx0IDogcmVzdWx0O1xuICAgIH0sXG5cbiAgICBjbHozMjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAvLyBTZWUgaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDY1XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICB2YXIgbnVtYmVyID0gRVMuVG9VaW50MzIodmFsdWUpO1xuICAgICAgaWYgKG51bWJlciA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMzI7XG4gICAgICB9XG4gICAgICByZXR1cm4gMzIgLSAobnVtYmVyKS50b1N0cmluZygyKS5sZW5ndGg7XG4gICAgfSxcblxuICAgIGNvc2g6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSAwKSB7IHJldHVybiAxOyB9IC8vICswIG9yIC0wXG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSkgeyByZXR1cm4gTmFOOyB9XG4gICAgICBpZiAoIWdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSkpIHsgcmV0dXJuIEluZmluaXR5OyB9XG4gICAgICBpZiAodmFsdWUgPCAwKSB7IHZhbHVlID0gLXZhbHVlOyB9XG4gICAgICBpZiAodmFsdWUgPiAyMSkgeyByZXR1cm4gTWF0aC5leHAodmFsdWUpIC8gMjsgfVxuICAgICAgcmV0dXJuIChNYXRoLmV4cCh2YWx1ZSkgKyBNYXRoLmV4cCgtdmFsdWUpKSAvIDI7XG4gICAgfSxcblxuICAgIGV4cG0xOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gLUluZmluaXR5KSB7IHJldHVybiAtMTsgfVxuICAgICAgaWYgKCFnbG9iYWxfaXNGaW5pdGUodmFsdWUpIHx8IHZhbHVlID09PSAwKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgcmV0dXJuIE1hdGguZXhwKHZhbHVlKSAtIDE7XG4gICAgfSxcblxuICAgIGh5cG90OiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgdmFyIGFueU5hTiA9IGZhbHNlO1xuICAgICAgdmFyIGFsbFplcm8gPSB0cnVlO1xuICAgICAgdmFyIGFueUluZmluaXR5ID0gZmFsc2U7XG4gICAgICB2YXIgbnVtYmVycyA9IFtdO1xuICAgICAgQXJyYXkucHJvdG90eXBlLmV2ZXJ5LmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHZhciBudW0gPSBOdW1iZXIoYXJnKTtcbiAgICAgICAgaWYgKE51bWJlci5pc05hTihudW0pKSB7XG4gICAgICAgICAgYW55TmFOID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChudW0gPT09IEluZmluaXR5IHx8IG51bSA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgYW55SW5maW5pdHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG51bSAhPT0gMCkge1xuICAgICAgICAgIGFsbFplcm8gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW55SW5maW5pdHkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoIWFueU5hTikge1xuICAgICAgICAgIG51bWJlcnMucHVzaChNYXRoLmFicyhudW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGFueUluZmluaXR5KSB7IHJldHVybiBJbmZpbml0eTsgfVxuICAgICAgaWYgKGFueU5hTikgeyByZXR1cm4gTmFOOyB9XG4gICAgICBpZiAoYWxsWmVybykgeyByZXR1cm4gMDsgfVxuXG4gICAgICBudW1iZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGIgLSBhOyB9KTtcbiAgICAgIHZhciBsYXJnZXN0ID0gbnVtYmVyc1swXTtcbiAgICAgIHZhciBkaXZpZGVkID0gbnVtYmVycy5tYXAoZnVuY3Rpb24gKG51bWJlcikgeyByZXR1cm4gbnVtYmVyIC8gbGFyZ2VzdDsgfSk7XG4gICAgICB2YXIgc3VtID0gZGl2aWRlZC5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgbnVtYmVyKSB7IHJldHVybiBzdW0gKyAobnVtYmVyICogbnVtYmVyKTsgfSwgMCk7XG4gICAgICByZXR1cm4gbGFyZ2VzdCAqIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBsb2cyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZyh2YWx1ZSkgKiBNYXRoLkxPRzJFO1xuICAgIH0sXG5cbiAgICBsb2cxMDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2codmFsdWUpICogTWF0aC5MT0cxMEU7XG4gICAgfSxcblxuICAgIGxvZzFwOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IE51bWJlci5pc05hTih2YWx1ZSkpIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlID09PSBJbmZpbml0eSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLTEpIHsgcmV0dXJuIC1JbmZpbml0eTsgfVxuICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICB2YXIgbiA9IDUwO1xuXG4gICAgICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMSkgeyByZXR1cm4gTWF0aC5sb2coMSArIHZhbHVlKTsgfVxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKChpICUgMikgPT09IDApIHtcbiAgICAgICAgICByZXN1bHQgLT0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgKz0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzaWduOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAobnVtYmVyID09PSAwKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIGlmIChOdW1iZXIuaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gbnVtYmVyOyB9XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC0xIDogMTtcbiAgICB9LFxuXG4gICAgc2luaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoIWdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSkgfHwgdmFsdWUgPT09IDApIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gKE1hdGguZXhwKHZhbHVlKSAtIE1hdGguZXhwKC12YWx1ZSkpIC8gMjtcbiAgICB9LFxuXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gSW5maW5pdHkpIHsgcmV0dXJuIDE7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLUluZmluaXR5KSB7IHJldHVybiAtMTsgfVxuICAgICAgcmV0dXJuIChNYXRoLmV4cCh2YWx1ZSkgLSBNYXRoLmV4cCgtdmFsdWUpKSAvIChNYXRoLmV4cCh2YWx1ZSkgKyBNYXRoLmV4cCgtdmFsdWUpKTtcbiAgICB9LFxuXG4gICAgdHJ1bmM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC1NYXRoLmZsb29yKC1udW1iZXIpIDogTWF0aC5mbG9vcihudW1iZXIpO1xuICAgIH0sXG5cbiAgICBpbXVsOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgLy8gdGFrZW4gZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL2ltdWxcbiAgICAgIHggPSBFUy5Ub1VpbnQzMih4KTtcbiAgICAgIHkgPSBFUy5Ub1VpbnQzMih5KTtcbiAgICAgIHZhciBhaCA9ICh4ID4+PiAxNikgJiAweGZmZmY7XG4gICAgICB2YXIgYWwgPSB4ICYgMHhmZmZmO1xuICAgICAgdmFyIGJoID0gKHkgPj4+IDE2KSAmIDB4ZmZmZjtcbiAgICAgIHZhciBibCA9IHkgJiAweGZmZmY7XG4gICAgICAvLyB0aGUgc2hpZnQgYnkgMCBmaXhlcyB0aGUgc2lnbiBvbiB0aGUgaGlnaCBwYXJ0XG4gICAgICAvLyB0aGUgZmluYWwgfDAgY29udmVydHMgdGhlIHVuc2lnbmVkIHZhbHVlIGludG8gYSBzaWduZWQgdmFsdWVcbiAgICAgIHJldHVybiAoKGFsICogYmwpICsgKCgoYWggKiBibCArIGFsICogYmgpIDw8IDE2KSA+Pj4gMCkgfCAwKTtcbiAgICB9LFxuXG4gICAgZnJvdW5kOiBmdW5jdGlvbiAoeCkge1xuICAgICAgaWYgKHggPT09IDAgfHwgeCA9PT0gSW5maW5pdHkgfHwgeCA9PT0gLUluZmluaXR5IHx8IE51bWJlci5pc05hTih4KSkge1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH1cbiAgICAgIHZhciBudW0gPSBOdW1iZXIoeCk7XG4gICAgICByZXR1cm4gbnVtYmVyQ29udmVyc2lvbi50b0Zsb2F0MzIobnVtKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZVByb3BlcnRpZXMoTWF0aCwgTWF0aFNoaW1zKTtcblxuICBpZiAoTWF0aC5pbXVsKDB4ZmZmZmZmZmYsIDUpICE9PSAtNSkge1xuICAgIC8vIFNhZmFyaSA2LjEsIGF0IGxlYXN0LCByZXBvcnRzIFwiMFwiIGZvciB0aGlzIHZhbHVlXG4gICAgTWF0aC5pbXVsID0gTWF0aFNoaW1zLmltdWw7XG4gIH1cblxuICAvLyBQcm9taXNlc1xuICAvLyBTaW1wbGVzdCBwb3NzaWJsZSBpbXBsZW1lbnRhdGlvbjsgdXNlIGEgM3JkLXBhcnR5IGxpYnJhcnkgaWYgeW91XG4gIC8vIHdhbnQgdGhlIGJlc3QgcG9zc2libGUgc3BlZWQgYW5kL29yIGxvbmcgc3RhY2sgdHJhY2VzLlxuICB2YXIgUHJvbWlzZVNoaW0gPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFByb21pc2UsIFByb21pc2UkcHJvdG90eXBlO1xuXG4gICAgRVMuSXNQcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHByb21pc2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghcHJvbWlzZS5fcHJvbWlzZUNvbnN0cnVjdG9yKSB7XG4gICAgICAgIC8vIF9wcm9taXNlQ29uc3RydWN0b3IgaXMgYSBiaXQgbW9yZSB1bmlxdWUgdGhhbiBfc3RhdHVzLCBzbyB3ZSdsbFxuICAgICAgICAvLyBjaGVjayB0aGF0IGluc3RlYWQgb2YgdGhlIFtbUHJvbWlzZVN0YXR1c11dIGludGVybmFsIGZpZWxkLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByb21pc2UuX3N0YXR1cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyB1bmluaXRpYWxpemVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLy8gXCJQcm9taXNlQ2FwYWJpbGl0eVwiIGluIHRoZSBzcGVjIGlzIHdoYXQgbW9zdCBwcm9taXNlIGltcGxlbWVudGF0aW9uc1xuICAgIC8vIGNhbGwgYSBcImRlZmVycmVkXCIuXG4gICAgdmFyIFByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShDKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgICAgfVxuICAgICAgdmFyIGNhcGFiaWxpdHkgPSB0aGlzO1xuICAgICAgdmFyIHJlc29sdmVyID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBjYXBhYmlsaXR5LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBjYXBhYmlsaXR5LnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH07XG4gICAgICBjYXBhYmlsaXR5LnByb21pc2UgPSBFUy5Db25zdHJ1Y3QoQywgW3Jlc29sdmVyXSk7XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDc4XG4gICAgICBpZiAoIWNhcGFiaWxpdHkucHJvbWlzZS5fZXM2Y29uc3RydWN0KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgICB9XG4gICAgICBpZiAoIShFUy5Jc0NhbGxhYmxlKGNhcGFiaWxpdHkucmVzb2x2ZSkgJiYgRVMuSXNDYWxsYWJsZShjYXBhYmlsaXR5LnJlamVjdCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGZpbmQgYW4gYXBwcm9wcmlhdGUgc2V0SW1tZWRpYXRlLWFsaWtlXG4gICAgdmFyIHNldFRpbWVvdXQgPSBnbG9iYWxzLnNldFRpbWVvdXQ7XG4gICAgdmFyIG1ha2VaZXJvVGltZW91dDtcbiAgICAvKmdsb2JhbCB3aW5kb3cgKi9cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgRVMuSXNDYWxsYWJsZSh3aW5kb3cucG9zdE1lc3NhZ2UpKSB7XG4gICAgICBtYWtlWmVyb1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGZyb20gaHR0cDovL2RiYXJvbi5vcmcvbG9nLzIwMTAwMzA5LWZhc3Rlci10aW1lb3V0c1xuICAgICAgICB2YXIgdGltZW91dHMgPSBbXTtcbiAgICAgICAgdmFyIG1lc3NhZ2VOYW1lID0gJ3plcm8tdGltZW91dC1tZXNzYWdlJztcbiAgICAgICAgdmFyIHNldFplcm9UaW1lb3V0ID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgdGltZW91dHMucHVzaChmbik7XG4gICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2VOYW1lLCAnKicpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgaGFuZGxlTWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IHdpbmRvdyAmJiBldmVudC5kYXRhID09PSBtZXNzYWdlTmFtZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBpZiAodGltZW91dHMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgdmFyIGZuID0gdGltZW91dHMuc2hpZnQoKTtcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGhhbmRsZU1lc3NhZ2UsIHRydWUpO1xuICAgICAgICByZXR1cm4gc2V0WmVyb1RpbWVvdXQ7XG4gICAgICB9O1xuICAgIH1cbiAgICB2YXIgbWFrZVByb21pc2VBc2FwID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gQW4gZWZmaWNpZW50IHRhc2stc2NoZWR1bGVyIGJhc2VkIG9uIGEgcHJlLWV4aXN0aW5nIFByb21pc2VcbiAgICAgIC8vIGltcGxlbWVudGF0aW9uLCB3aGljaCB3ZSBjYW4gdXNlIGV2ZW4gaWYgd2Ugb3ZlcnJpZGUgdGhlXG4gICAgICAvLyBnbG9iYWwgUHJvbWlzZSBiZWxvdyAoaW4gb3JkZXIgdG8gd29ya2Fyb3VuZCBidWdzKVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JheW5vcy9vYnNlcnYtaGFzaC9pc3N1ZXMvMiNpc3N1ZWNvbW1lbnQtMzU4NTc2NzFcbiAgICAgIHZhciBQID0gZ2xvYmFscy5Qcm9taXNlO1xuICAgICAgcmV0dXJuIFAgJiYgUC5yZXNvbHZlICYmIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIHJldHVybiBQLnJlc29sdmUoKS50aGVuKHRhc2spO1xuICAgICAgfTtcbiAgICB9O1xuICAgIC8qZ2xvYmFsIHByb2Nlc3MgKi9cbiAgICB2YXIgZW5xdWV1ZSA9IEVTLklzQ2FsbGFibGUoZ2xvYmFscy5zZXRJbW1lZGlhdGUpID9cbiAgICAgIGdsb2JhbHMuc2V0SW1tZWRpYXRlLmJpbmQoZ2xvYmFscykgOlxuICAgICAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHByb2Nlc3MubmV4dFRpY2sgPyBwcm9jZXNzLm5leHRUaWNrIDpcbiAgICAgIG1ha2VQcm9taXNlQXNhcCgpIHx8XG4gICAgICAoRVMuSXNDYWxsYWJsZShtYWtlWmVyb1RpbWVvdXQpID8gbWFrZVplcm9UaW1lb3V0KCkgOlxuICAgICAgZnVuY3Rpb24gKHRhc2spIHsgc2V0VGltZW91dCh0YXNrLCAwKTsgfSk7IC8vIGZhbGxiYWNrXG5cbiAgICB2YXIgdXBkYXRlUHJvbWlzZUZyb21Qb3RlbnRpYWxUaGVuYWJsZSA9IGZ1bmN0aW9uICh4LCBjYXBhYmlsaXR5KSB7XG4gICAgICBpZiAoIUVTLlR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciB0aGVuID0geC50aGVuOyAvLyBvbmx5IG9uZSBpbnZvY2F0aW9uIG9mIGFjY2Vzc29yXG4gICAgICAgIGlmICghRVMuSXNDYWxsYWJsZSh0aGVuKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgdGhlbi5jYWxsKHgsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YXIgdHJpZ2dlclByb21pc2VSZWFjdGlvbnMgPSBmdW5jdGlvbiAocmVhY3Rpb25zLCB4KSB7XG4gICAgICByZWFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAocmVhY3Rpb24pIHtcbiAgICAgICAgZW5xdWV1ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gUHJvbWlzZVJlYWN0aW9uVGFza1xuICAgICAgICAgIHZhciBoYW5kbGVyID0gcmVhY3Rpb24uaGFuZGxlcjtcbiAgICAgICAgICB2YXIgY2FwYWJpbGl0eSA9IHJlYWN0aW9uLmNhcGFiaWxpdHk7XG4gICAgICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICAgICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaGFuZGxlcih4KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGNhcGFiaWxpdHkucHJvbWlzZSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzZWxmIHJlc29sdXRpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB1cGRhdGVSZXN1bHQgPVxuICAgICAgICAgICAgICB1cGRhdGVQcm9taXNlRnJvbVBvdGVudGlhbFRoZW5hYmxlKHJlc3VsdCwgY2FwYWJpbGl0eSk7XG4gICAgICAgICAgICBpZiAoIXVwZGF0ZVJlc3VsdCkge1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHByb21pc2VSZXNvbHV0aW9uSGFuZGxlciA9IGZ1bmN0aW9uIChwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICh4ID09PSBwcm9taXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG9uUmVqZWN0ZWQobmV3IFR5cGVFcnJvcignc2VsZiByZXNvbHV0aW9uJykpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBDID0gcHJvbWlzZS5fcHJvbWlzZUNvbnN0cnVjdG9yO1xuICAgICAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICAgICAgdmFyIHVwZGF0ZVJlc3VsdCA9IHVwZGF0ZVByb21pc2VGcm9tUG90ZW50aWFsVGhlbmFibGUoeCwgY2FwYWJpbGl0eSk7XG4gICAgICAgIGlmICh1cGRhdGVSZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvbkZ1bGZpbGxlZCh4KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZSA9IGZ1bmN0aW9uIChyZXNvbHZlcikge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgICAgcHJvbWlzZSA9IGVtdWxhdGVFUzZjb25zdHJ1Y3QocHJvbWlzZSk7XG4gICAgICBpZiAoIXByb21pc2UuX3Byb21pc2VDb25zdHJ1Y3Rvcikge1xuICAgICAgICAvLyB3ZSB1c2UgX3Byb21pc2VDb25zdHJ1Y3RvciBhcyBhIHN0YW5kLWluIGZvciB0aGUgaW50ZXJuYWxcbiAgICAgICAgLy8gW1tQcm9taXNlU3RhdHVzXV0gZmllbGQ7IGl0J3MgYSBsaXR0bGUgbW9yZSB1bmlxdWUuXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBwcm9taXNlJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByb21pc2UuX3N0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJvbWlzZSBhbHJlYWR5IGluaXRpYWxpemVkJyk7XG4gICAgICB9XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDgyXG4gICAgICBpZiAoIUVTLklzQ2FsbGFibGUocmVzb2x2ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIHZhbGlkIHJlc29sdmVyJyk7XG4gICAgICB9XG4gICAgICBwcm9taXNlLl9zdGF0dXMgPSAndW5yZXNvbHZlZCc7XG4gICAgICBwcm9taXNlLl9yZXNvbHZlUmVhY3Rpb25zID0gW107XG4gICAgICBwcm9taXNlLl9yZWplY3RSZWFjdGlvbnMgPSBbXTtcblxuICAgICAgdmFyIHJlc29sdmUgPSBmdW5jdGlvbiAocmVzb2x1dGlvbikge1xuICAgICAgICBpZiAocHJvbWlzZS5fc3RhdHVzICE9PSAndW5yZXNvbHZlZCcpIHsgcmV0dXJuOyB9XG4gICAgICAgIHZhciByZWFjdGlvbnMgPSBwcm9taXNlLl9yZXNvbHZlUmVhY3Rpb25zO1xuICAgICAgICBwcm9taXNlLl9yZXN1bHQgPSByZXNvbHV0aW9uO1xuICAgICAgICBwcm9taXNlLl9yZXNvbHZlUmVhY3Rpb25zID0gdm9pZCAwO1xuICAgICAgICBwcm9taXNlLl9yZWplY3RSZWFjdGlvbnMgPSB2b2lkIDA7XG4gICAgICAgIHByb21pc2UuX3N0YXR1cyA9ICdoYXMtcmVzb2x1dGlvbic7XG4gICAgICAgIHRyaWdnZXJQcm9taXNlUmVhY3Rpb25zKHJlYWN0aW9ucywgcmVzb2x1dGlvbik7XG4gICAgICB9O1xuICAgICAgdmFyIHJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXR1cyAhPT0gJ3VucmVzb2x2ZWQnKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgcmVhY3Rpb25zID0gcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zO1xuICAgICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG4gICAgICAgIHByb21pc2UuX3Jlc29sdmVSZWFjdGlvbnMgPSB2b2lkIDA7XG4gICAgICAgIHByb21pc2UuX3JlamVjdFJlYWN0aW9ucyA9IHZvaWQgMDtcbiAgICAgICAgcHJvbWlzZS5fc3RhdHVzID0gJ2hhcy1yZWplY3Rpb24nO1xuICAgICAgICB0cmlnZ2VyUHJvbWlzZVJlYWN0aW9ucyhyZWFjdGlvbnMsIHJlYXNvbik7XG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcbiAgICBQcm9taXNlJHByb3RvdHlwZSA9IFByb21pc2UucHJvdG90eXBlO1xuICAgIHZhciBfcHJvbWlzZUFsbFJlc29sdmVyID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZXMsIGNhcGFiaWxpdHksIHJlbWFpbmluZykge1xuICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAoZG9uZSkgeyByZXR1cm47IH0gLy8gcHJvdGVjdCBhZ2FpbnN0IGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHg7XG4gICAgICAgIGlmICgoLS1yZW1haW5pbmcuY291bnQpID09PSAwKSB7XG4gICAgICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpOyAvLyBjYWxsIHcvIHRoaXM9PT11bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgZGVmaW5lUHJvcGVydGllcyhQcm9taXNlLCB7XG4gICAgICAnQEBjcmVhdGUnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICAgIC8vIEFsbG9jYXRlUHJvbWlzZVxuICAgICAgICAvLyBUaGUgYG9iamAgcGFyYW1ldGVyIGlzIGEgaGFjayB3ZSB1c2UgZm9yIGVzNVxuICAgICAgICAvLyBjb21wYXRpYmlsaXR5LlxuICAgICAgICB2YXIgcHJvdG90eXBlID0gY29uc3RydWN0b3IucHJvdG90eXBlIHx8IFByb21pc2UkcHJvdG90eXBlO1xuICAgICAgICBvYmogPSBvYmogfHwgY3JlYXRlKHByb3RvdHlwZSk7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqLCB7XG4gICAgICAgICAgX3N0YXR1czogdm9pZCAwLFxuICAgICAgICAgIF9yZXN1bHQ6IHZvaWQgMCxcbiAgICAgICAgICBfcmVzb2x2ZVJlYWN0aW9uczogdm9pZCAwLFxuICAgICAgICAgIF9yZWplY3RSZWFjdGlvbnM6IHZvaWQgMCxcbiAgICAgICAgICBfcHJvbWlzZUNvbnN0cnVjdG9yOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIG9iai5fcHJvbWlzZUNvbnN0cnVjdG9yID0gY29uc3RydWN0b3I7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9LFxuXG4gICAgICBhbGw6IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSkge1xuICAgICAgICB2YXIgQyA9IHRoaXM7XG4gICAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAgICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghRVMuSXNJdGVyYWJsZShpdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBpdGVyYWJsZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaXQgPSBFUy5HZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICAgICAgdmFyIHZhbHVlcyA9IFtdLCByZW1haW5pbmcgPSB7IGNvdW50OiAxIH07XG4gICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyA7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV4dFByb21pc2UgPSBDLnJlc29sdmUobmV4dC52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgcmVzb2x2ZUVsZW1lbnQgPSBfcHJvbWlzZUFsbFJlc29sdmVyKFxuICAgICAgICAgICAgICBpbmRleCwgdmFsdWVzLCBjYXBhYmlsaXR5LCByZW1haW5pbmdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZW1haW5pbmcuY291bnQrKztcbiAgICAgICAgICAgIG5leHRQcm9taXNlLnRoZW4ocmVzb2x2ZUVsZW1lbnQsIGNhcGFiaWxpdHkucmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCgtLXJlbWFpbmluZy5jb3VudCkgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUodmFsdWVzKTsgLy8gY2FsbCB3LyB0aGlzPT09dW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgICB9LFxuXG4gICAgICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKSB7XG4gICAgICAgIHZhciBDID0gdGhpcztcbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFFUy5Jc0l0ZXJhYmxlKGl0ZXJhYmxlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIGl0ZXJhYmxlJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBpdCA9IEVTLkdldEl0ZXJhdG9yKGl0ZXJhYmxlKTtcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBFUy5JdGVyYXRvck5leHQoaXQpO1xuICAgICAgICAgICAgaWYgKG5leHQuZG9uZSkge1xuICAgICAgICAgICAgICAvLyBJZiBpdGVyYWJsZSBoYXMgbm8gaXRlbXMsIHJlc3VsdGluZyBwcm9taXNlIHdpbGwgbmV2ZXJcbiAgICAgICAgICAgICAgLy8gcmVzb2x2ZTsgc2VlOlxuICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZG9tZW5pYy9wcm9taXNlcy11bndyYXBwaW5nL2lzc3Vlcy83NVxuICAgICAgICAgICAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTI1MTVcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV4dFByb21pc2UgPSBDLnJlc29sdmUobmV4dC52YWx1ZSk7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgICB9LFxuXG4gICAgICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyZWFzb24pIHtcbiAgICAgICAgdmFyIEMgPSB0aGlzO1xuICAgICAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICAgICAgdmFyIHJlamVjdFByb21pc2UgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgICAgcmVqZWN0UHJvbWlzZShyZWFzb24pOyAvLyBjYWxsIHdpdGggdGhpcz09PXVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICAgICAgfSxcblxuICAgICAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh2KSB7XG4gICAgICAgIHZhciBDID0gdGhpcztcbiAgICAgICAgaWYgKEVTLklzUHJvbWlzZSh2KSkge1xuICAgICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHYuX3Byb21pc2VDb25zdHJ1Y3RvcjtcbiAgICAgICAgICBpZiAoY29uc3RydWN0b3IgPT09IEMpIHsgcmV0dXJuIHY7IH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICAgICAgdmFyIHJlc29sdmVQcm9taXNlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgICByZXNvbHZlUHJvbWlzZSh2KTsgLy8gY2FsbCB3aXRoIHRoaXM9PT11bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlZmluZVByb3BlcnRpZXMoUHJvbWlzZSRwcm90b3R5cGUsIHtcbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCBvblJlamVjdGVkKTtcbiAgICAgIH0sXG5cbiAgICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgICAgICBpZiAoIUVTLklzUHJvbWlzZShwcm9taXNlKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBwcm9taXNlJyk7IH1cbiAgICAgICAgLy8gdGhpcy5jb25zdHJ1Y3RvciBub3QgdGhpcy5fcHJvbWlzZUNvbnN0cnVjdG9yOyBzZWVcbiAgICAgICAgLy8gaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNTEzXG4gICAgICAgIHZhciBDID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIGlmICghRVMuSXNDYWxsYWJsZShvblJlamVjdGVkKSkge1xuICAgICAgICAgIG9uUmVqZWN0ZWQgPSBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghRVMuSXNDYWxsYWJsZShvbkZ1bGZpbGxlZCkpIHtcbiAgICAgICAgICBvbkZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4OyB9O1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXNvbHV0aW9uSGFuZGxlciA9IHByb21pc2VSZXNvbHV0aW9uSGFuZGxlcihwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCk7XG4gICAgICAgIHZhciByZXNvbHZlUmVhY3Rpb24gPSB7IGNhcGFiaWxpdHk6IGNhcGFiaWxpdHksIGhhbmRsZXI6IHJlc29sdXRpb25IYW5kbGVyIH07XG4gICAgICAgIHZhciByZWplY3RSZWFjdGlvbiA9IHsgY2FwYWJpbGl0eTogY2FwYWJpbGl0eSwgaGFuZGxlcjogb25SZWplY3RlZCB9O1xuICAgICAgICBzd2l0Y2ggKHByb21pc2UuX3N0YXR1cykge1xuICAgICAgICAgIGNhc2UgJ3VucmVzb2x2ZWQnOlxuICAgICAgICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucy5wdXNoKHJlc29sdmVSZWFjdGlvbik7XG4gICAgICAgICAgICBwcm9taXNlLl9yZWplY3RSZWFjdGlvbnMucHVzaChyZWplY3RSZWFjdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdoYXMtcmVzb2x1dGlvbic6XG4gICAgICAgICAgICB0cmlnZ2VyUHJvbWlzZVJlYWN0aW9ucyhbcmVzb2x2ZVJlYWN0aW9uXSwgcHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2hhcy1yZWplY3Rpb24nOlxuICAgICAgICAgICAgdHJpZ2dlclByb21pc2VSZWFjdGlvbnMoW3JlamVjdFJlYWN0aW9uXSwgcHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmV4cGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlO1xuICB9KCkpO1xuXG4gIC8vIENocm9tZSdzIG5hdGl2ZSBQcm9taXNlIGhhcyBleHRyYSBtZXRob2RzIHRoYXQgaXQgc2hvdWxkbid0IGhhdmUuIExldCdzIHJlbW92ZSB0aGVtLlxuICBpZiAoZ2xvYmFscy5Qcm9taXNlKSB7XG4gICAgZGVsZXRlIGdsb2JhbHMuUHJvbWlzZS5hY2NlcHQ7XG4gICAgZGVsZXRlIGdsb2JhbHMuUHJvbWlzZS5kZWZlcjtcbiAgICBkZWxldGUgZ2xvYmFscy5Qcm9taXNlLnByb3RvdHlwZS5jaGFpbjtcbiAgfVxuXG4gIC8vIGV4cG9ydCB0aGUgUHJvbWlzZSBjb25zdHJ1Y3Rvci5cbiAgZGVmaW5lUHJvcGVydGllcyhnbG9iYWxzLCB7IFByb21pc2U6IFByb21pc2VTaGltIH0pO1xuICAvLyBJbiBDaHJvbWUgMzMgKGFuZCB0aGVyZWFib3V0cykgUHJvbWlzZSBpcyBkZWZpbmVkLCBidXQgdGhlXG4gIC8vIGltcGxlbWVudGF0aW9uIGlzIGJ1Z2d5IGluIGEgbnVtYmVyIG9mIHdheXMuICBMZXQncyBjaGVjayBzdWJjbGFzc2luZ1xuICAvLyBzdXBwb3J0IHRvIHNlZSBpZiB3ZSBoYXZlIGEgYnVnZ3kgaW1wbGVtZW50YXRpb24uXG4gIHZhciBwcm9taXNlU3VwcG9ydHNTdWJjbGFzc2luZyA9IHN1cHBvcnRzU3ViY2xhc3NpbmcoZ2xvYmFscy5Qcm9taXNlLCBmdW5jdGlvbiAoUykge1xuICAgIHJldHVybiBTLnJlc29sdmUoNDIpIGluc3RhbmNlb2YgUztcbiAgfSk7XG4gIHZhciBwcm9taXNlSWdub3Jlc05vbkZ1bmN0aW9uVGhlbkNhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGdsb2JhbHMuUHJvbWlzZS5yZWplY3QoNDIpLnRoZW4obnVsbCwgNSkudGhlbihudWxsLCBub29wKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KCkpO1xuICB2YXIgcHJvbWlzZVJlcXVpcmVzT2JqZWN0Q29udGV4dCA9IChmdW5jdGlvbiAoKSB7XG4gICAgLypnbG9iYWwgUHJvbWlzZSAqL1xuICAgIHRyeSB7IFByb21pc2UuY2FsbCgzLCBub29wKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSgpKTtcbiAgaWYgKCFwcm9taXNlU3VwcG9ydHNTdWJjbGFzc2luZyB8fCAhcHJvbWlzZUlnbm9yZXNOb25GdW5jdGlvblRoZW5DYWxsYmFja3MgfHwgIXByb21pc2VSZXF1aXJlc09iamVjdENvbnRleHQpIHtcbiAgICAvKmdsb2JhbHMgUHJvbWlzZTogdHJ1ZSAqL1xuICAgIFByb21pc2UgPSBQcm9taXNlU2hpbTtcbiAgICAvKmdsb2JhbHMgUHJvbWlzZTogZmFsc2UgKi9cbiAgICBkZWZpbmVQcm9wZXJ0eShnbG9iYWxzLCAnUHJvbWlzZScsIFByb21pc2VTaGltLCB0cnVlKTtcbiAgfVxuXG4gIC8vIE1hcCBhbmQgU2V0IHJlcXVpcmUgYSB0cnVlIEVTNSBlbnZpcm9ubWVudFxuICAvLyBUaGVpciBmYXN0IHBhdGggYWxzbyByZXF1aXJlcyB0aGF0IHRoZSBlbnZpcm9ubWVudCBwcmVzZXJ2ZVxuICAvLyBwcm9wZXJ0eSBpbnNlcnRpb24gb3JkZXIsIHdoaWNoIGlzIG5vdCBndWFyYW50ZWVkIGJ5IHRoZSBzcGVjLlxuICB2YXIgdGVzdE9yZGVyID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYiA9IE9iamVjdC5rZXlzKGEucmVkdWNlKGZ1bmN0aW9uIChvLCBrKSB7XG4gICAgICBvW2tdID0gdHJ1ZTtcbiAgICAgIHJldHVybiBvO1xuICAgIH0sIHt9KSk7XG4gICAgcmV0dXJuIGEuam9pbignOicpID09PSBiLmpvaW4oJzonKTtcbiAgfTtcbiAgdmFyIHByZXNlcnZlc0luc2VydGlvbk9yZGVyID0gdGVzdE9yZGVyKFsneicsICdhJywgJ2JiJ10pO1xuICAvLyBzb21lIGVuZ2luZXMgKGVnLCBDaHJvbWUpIG9ubHkgcHJlc2VydmUgaW5zZXJ0aW9uIG9yZGVyIGZvciBzdHJpbmcga2V5c1xuICB2YXIgcHJlc2VydmVzTnVtZXJpY0luc2VydGlvbk9yZGVyID0gdGVzdE9yZGVyKFsneicsIDEsICdhJywgJzMnLCAyXSk7XG5cbiAgaWYgKHN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcblxuICAgIHZhciBmYXN0a2V5ID0gZnVuY3Rpb24gZmFzdGtleShrZXkpIHtcbiAgICAgIGlmICghcHJlc2VydmVzSW5zZXJ0aW9uT3JkZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBrZXk7XG4gICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuICckJyArIGtleTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gbm90ZSB0aGF0IC0wIHdpbGwgZ2V0IGNvZXJjZWQgdG8gXCIwXCIgd2hlbiB1c2VkIGFzIGEgcHJvcGVydHkga2V5XG4gICAgICAgIGlmICghcHJlc2VydmVzTnVtZXJpY0luc2VydGlvbk9yZGVyKSB7XG4gICAgICAgICAgcmV0dXJuICduJyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHZhciBlbXB0eU9iamVjdCA9IGZ1bmN0aW9uIGVtcHR5T2JqZWN0KCkge1xuICAgICAgLy8gYWNjb21vZGF0ZSBzb21lIG9sZGVyIG5vdC1xdWl0ZS1FUzUgYnJvd3NlcnNcbiAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9O1xuICAgIH07XG5cbiAgICB2YXIgY29sbGVjdGlvblNoaW1zID0ge1xuICAgICAgTWFwOiAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBlbXB0eSA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIE1hcEVudHJ5KGtleSwgdmFsdWUpIHtcbiAgICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgTWFwRW50cnkucHJvdG90eXBlLmlzUmVtb3ZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5rZXkgPT09IGVtcHR5O1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIE1hcEl0ZXJhdG9yKG1hcCwga2luZCkge1xuICAgICAgICAgIHRoaXMuaGVhZCA9IG1hcC5faGVhZDtcbiAgICAgICAgICB0aGlzLmkgPSB0aGlzLmhlYWQ7XG4gICAgICAgICAgdGhpcy5raW5kID0ga2luZDtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZSA9IHtcbiAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMuaSwga2luZCA9IHRoaXMua2luZCwgaGVhZCA9IHRoaXMuaGVhZCwgcmVzdWx0O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChpLmlzUmVtb3ZlZCgpICYmIGkgIT09IGhlYWQpIHtcbiAgICAgICAgICAgICAgLy8gYmFjayB1cCBvZmYgb2YgcmVtb3ZlZCBlbnRyaWVzXG4gICAgICAgICAgICAgIGkgPSBpLnByZXY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhZHZhbmNlIHRvIG5leHQgdW5yZXR1cm5lZCBlbGVtZW50LlxuICAgICAgICAgICAgd2hpbGUgKGkubmV4dCAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpID0gaS5uZXh0O1xuICAgICAgICAgICAgICBpZiAoIWkuaXNSZW1vdmVkKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2luZCA9PT0gJ2tleScpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGkua2V5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ3ZhbHVlJykge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gW2kua2V5LCBpLnZhbHVlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5pID0gaTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvbmNlIHRoZSBpdGVyYXRvciBpcyBkb25lLCBpdCBpcyBkb25lIGZvcmV2ZXIuXG4gICAgICAgICAgICB0aGlzLmkgPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBhZGRJdGVyYXRvcihNYXBJdGVyYXRvci5wcm90b3R5cGUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIE1hcChpdGVyYWJsZSkge1xuICAgICAgICAgIHZhciBtYXAgPSB0aGlzO1xuICAgICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KG1hcCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01hcCBkb2VzIG5vdCBhY2NlcHQgYXJndW1lbnRzIHdoZW4gY2FsbGVkIGFzIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWFwID0gZW11bGF0ZUVTNmNvbnN0cnVjdChtYXApO1xuICAgICAgICAgIGlmICghbWFwLl9lczZtYXApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBtYXAnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaGVhZCA9IG5ldyBNYXBFbnRyeShudWxsLCBudWxsKTtcbiAgICAgICAgICAvLyBjaXJjdWxhciBkb3VibHktbGlua2VkIGxpc3QuXG4gICAgICAgICAgaGVhZC5uZXh0ID0gaGVhZC5wcmV2ID0gaGVhZDtcblxuICAgICAgICAgIGRlZmluZVByb3BlcnRpZXMobWFwLCB7XG4gICAgICAgICAgICBfaGVhZDogaGVhZCxcbiAgICAgICAgICAgIF9zdG9yYWdlOiBlbXB0eU9iamVjdCgpLFxuICAgICAgICAgICAgX3NpemU6IDBcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgaW5pdGlhbGl6ZSBtYXAgZnJvbSBpdGVyYWJsZVxuICAgICAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUgIT09ICd1bmRlZmluZWQnICYmIGl0ZXJhYmxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaXQgPSBFUy5HZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICAgICAgICB2YXIgYWRkZXIgPSBtYXAuc2V0O1xuICAgICAgICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKGFkZGVyKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgbWFwJyk7IH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciBuZXh0ID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICAgICAgaWYgKG5leHQuZG9uZSkgeyBicmVhazsgfVxuICAgICAgICAgICAgICB2YXIgbmV4dEl0ZW0gPSBuZXh0LnZhbHVlO1xuICAgICAgICAgICAgICBpZiAoIUVTLlR5cGVJc09iamVjdChuZXh0SXRlbSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBpdGVyYWJsZSBvZiBwYWlycycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFkZGVyLmNhbGwobWFwLCBuZXh0SXRlbVswXSwgbmV4dEl0ZW1bMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBNYXAkcHJvdG90eXBlID0gTWFwLnByb3RvdHlwZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhNYXAsIHtcbiAgICAgICAgICAnQEBjcmVhdGUnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByb3RvdHlwZSA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZSB8fCBNYXAkcHJvdG90eXBlO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IGNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydGllcyhvYmosIHsgX2VzNm1hcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBWYWx1ZS5nZXR0ZXIoTWFwLnByb3RvdHlwZSwgJ3NpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zaXplID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2l6ZSBtZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSBNYXAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3NpemU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXMoTWFwLnByb3RvdHlwZSwge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXkgPSBmYXN0a2V5KGtleSk7XG4gICAgICAgICAgICBpZiAoZmtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBmYXN0IE8oMSkgcGF0aFxuICAgICAgICAgICAgICB2YXIgZW50cnkgPSB0aGlzLl9zdG9yYWdlW2ZrZXldO1xuICAgICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50cnkudmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQsIGkgPSBoZWFkO1xuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLnZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGhhczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXkgPSBmYXN0a2V5KGtleSk7XG4gICAgICAgICAgICBpZiAoZmtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBmYXN0IE8oMSkgcGF0aFxuICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX3N0b3JhZ2VbZmtleV0gIT09ICd1bmRlZmluZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkLCBpID0gaGVhZDtcbiAgICAgICAgICAgIHdoaWxlICgoaSA9IGkubmV4dCkgIT09IGhlYWQpIHtcbiAgICAgICAgICAgICAgaWYgKEVTLlNhbWVWYWx1ZVplcm8oaS5rZXksIGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQsIGkgPSBoZWFkLCBlbnRyeTtcbiAgICAgICAgICAgIHZhciBma2V5ID0gZmFzdGtleShrZXkpO1xuICAgICAgICAgICAgaWYgKGZrZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBPKDEpIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zdG9yYWdlW2ZrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3JhZ2VbZmtleV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IHRoaXMuX3N0b3JhZ2VbZmtleV0gPSBuZXcgTWFwRW50cnkoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaSA9IGhlYWQucHJldjtcbiAgICAgICAgICAgICAgICAvLyBmYWxsIHRocm91Z2hcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIGkudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW50cnkgPSBlbnRyeSB8fCBuZXcgTWFwRW50cnkoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlKC0wLCBrZXkpKSB7XG4gICAgICAgICAgICAgIGVudHJ5LmtleSA9ICswOyAvLyBjb2VyY2UgLTAgdG8gKzAgaW4gZW50cnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVudHJ5Lm5leHQgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgZW50cnkucHJldiA9IHRoaXMuX2hlYWQucHJldjtcbiAgICAgICAgICAgIGVudHJ5LnByZXYubmV4dCA9IGVudHJ5O1xuICAgICAgICAgICAgZW50cnkubmV4dC5wcmV2ID0gZW50cnk7XG4gICAgICAgICAgICB0aGlzLl9zaXplICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQ7XG4gICAgICAgICAgICB2YXIgZmtleSA9IGZhc3RrZXkoa2V5KTtcbiAgICAgICAgICAgIGlmIChma2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgTygxKSBwYXRoXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fc3RvcmFnZVtma2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaSA9IHRoaXMuX3N0b3JhZ2VbZmtleV0ucHJldjtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N0b3JhZ2VbZmtleV07XG4gICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIGkua2V5ID0gaS52YWx1ZSA9IGVtcHR5O1xuICAgICAgICAgICAgICAgIGkucHJldi5uZXh0ID0gaS5uZXh0O1xuICAgICAgICAgICAgICAgIGkubmV4dC5wcmV2ID0gaS5wcmV2O1xuICAgICAgICAgICAgICAgIHRoaXMuX3NpemUgLT0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9zdG9yYWdlID0gZW1wdHlPYmplY3QoKTtcbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQsIHAgPSBpLm5leHQ7XG4gICAgICAgICAgICB3aGlsZSAoKGkgPSBwKSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpLmtleSA9IGkudmFsdWUgPSBlbXB0eTtcbiAgICAgICAgICAgICAgcCA9IGkubmV4dDtcbiAgICAgICAgICAgICAgaS5uZXh0ID0gaS5wcmV2ID0gaGVhZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhlYWQubmV4dCA9IGhlYWQucHJldiA9IGhlYWQ7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGtleXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ2tleScpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB2YWx1ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ3ZhbHVlJyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGVudHJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ2tleSt2YWx1ZScpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmb3JFYWNoOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgICAgICAgdmFyIGl0ID0gdGhpcy5lbnRyaWVzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBlbnRyeSA9IGl0Lm5leHQoKTsgIWVudHJ5LmRvbmU7IGVudHJ5ID0gaXQubmV4dCgpKSB7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBlbnRyeS52YWx1ZVsxXSwgZW50cnkudmFsdWVbMF0sIHRoaXMpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5LnZhbHVlWzFdLCBlbnRyeS52YWx1ZVswXSwgdGhpcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhZGRJdGVyYXRvcihNYXAucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmVudHJpZXMoKTsgfSk7XG5cbiAgICAgICAgcmV0dXJuIE1hcDtcbiAgICAgIH0oKSksXG5cbiAgICAgIFNldDogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ3JlYXRpbmcgYSBNYXAgaXMgZXhwZW5zaXZlLiAgVG8gc3BlZWQgdXAgdGhlIGNvbW1vbiBjYXNlIG9mXG4gICAgICAgIC8vIFNldHMgY29udGFpbmluZyBvbmx5IHN0cmluZyBvciBudW1lcmljIGtleXMsIHdlIHVzZSBhbiBvYmplY3RcbiAgICAgICAgLy8gYXMgYmFja2luZyBzdG9yYWdlIGFuZCBsYXppbHkgY3JlYXRlIGEgZnVsbCBNYXAgb25seSB3aGVuXG4gICAgICAgIC8vIHJlcXVpcmVkLlxuICAgICAgICB2YXIgU2V0U2hpbSA9IGZ1bmN0aW9uIFNldChpdGVyYWJsZSkge1xuICAgICAgICAgIHZhciBzZXQgPSB0aGlzO1xuICAgICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHNldCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBkb2VzIG5vdCBhY2NlcHQgYXJndW1lbnRzIHdoZW4gY2FsbGVkIGFzIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0ID0gZW11bGF0ZUVTNmNvbnN0cnVjdChzZXQpO1xuICAgICAgICAgIGlmICghc2V0Ll9lczZzZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBzZXQnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHNldCwge1xuICAgICAgICAgICAgJ1tbU2V0RGF0YV1dJzogbnVsbCxcbiAgICAgICAgICAgIF9zdG9yYWdlOiBlbXB0eU9iamVjdCgpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPcHRpb25hbGx5IGluaXRpYWxpemUgbWFwIGZyb20gaXRlcmFibGVcbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlICE9PSAndW5kZWZpbmVkJyAmJiBpdGVyYWJsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGl0ID0gRVMuR2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgICAgICAgdmFyIGFkZGVyID0gc2V0LmFkZDtcbiAgICAgICAgICAgIGlmICghRVMuSXNDYWxsYWJsZShhZGRlcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIHNldCcpOyB9XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICB2YXIgbmV4dCA9IEVTLkl0ZXJhdG9yTmV4dChpdCk7XG4gICAgICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gbmV4dC52YWx1ZTtcbiAgICAgICAgICAgICAgYWRkZXIuY2FsbChzZXQsIG5leHRJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNldDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIFNldCRwcm90b3R5cGUgPSBTZXRTaGltLnByb3RvdHlwZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhTZXRTaGltLCB7XG4gICAgICAgICAgJ0BAY3JlYXRlJzogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgICAgICAgIHZhciBwcm90b3R5cGUgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgU2V0JHByb3RvdHlwZTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBjcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqLCB7IF9lczZzZXQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU3dpdGNoIGZyb20gdGhlIG9iamVjdCBiYWNraW5nIHN0b3JhZ2UgdG8gYSBmdWxsIE1hcC5cbiAgICAgICAgdmFyIGVuc3VyZU1hcCA9IGZ1bmN0aW9uIGVuc3VyZU1hcChzZXQpIHtcbiAgICAgICAgICBpZiAoIXNldFsnW1tTZXREYXRhXV0nXSkge1xuICAgICAgICAgICAgdmFyIG0gPSBzZXRbJ1tbU2V0RGF0YV1dJ10gPSBuZXcgY29sbGVjdGlvblNoaW1zLk1hcCgpO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoc2V0Ll9zdG9yYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgY2hlY2sgZm9yIGxlYWRpbmcgJyQnXG4gICAgICAgICAgICAgIGlmIChrLmNoYXJDb2RlQXQoMCkgPT09IDM2KSB7XG4gICAgICAgICAgICAgICAgayA9IGsuc2xpY2UoMSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoay5jaGFyQXQoMCkgPT09ICduJykge1xuICAgICAgICAgICAgICAgIGsgPSAray5zbGljZSgxKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrID0gK2s7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbS5zZXQoaywgayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldC5fc3RvcmFnZSA9IG51bGw7IC8vIGZyZWUgb2xkIGJhY2tpbmcgc3RvcmFnZVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBWYWx1ZS5nZXR0ZXIoU2V0U2hpbS5wcm90b3R5cGUsICdzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fc3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvZXM2LXNoaW0vaXNzdWVzLzE3NlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2l6ZSBtZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSBTZXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgIHJldHVybiB0aGlzWydbW1NldERhdGFdXSddLnNpemU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXMoU2V0U2hpbS5wcm90b3R5cGUsIHtcbiAgICAgICAgICBoYXM6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBma2V5O1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b3JhZ2UgJiYgKGZrZXkgPSBmYXN0a2V5KGtleSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiAhIXRoaXMuX3N0b3JhZ2VbZmtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS5oYXMoa2V5KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgYWRkOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZmtleTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yYWdlICYmIChma2V5ID0gZmFzdGtleShrZXkpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLl9zdG9yYWdlW2ZrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICB0aGlzWydbW1NldERhdGFdXSddLnNldChrZXksIGtleSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBma2V5O1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b3JhZ2UgJiYgKGZrZXkgPSBmYXN0a2V5KGtleSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHZhciBoYXNGS2V5ID0gX2hhc093blByb3BlcnR5KHRoaXMuX3N0b3JhZ2UsIGZrZXkpO1xuICAgICAgICAgICAgICByZXR1cm4gKGRlbGV0ZSB0aGlzLl9zdG9yYWdlW2ZrZXldKSAmJiBoYXNGS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ11bJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZSkge1xuICAgICAgICAgICAgICB0aGlzLl9zdG9yYWdlID0gZW1wdHlPYmplY3QoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXNbJ1tbU2V0RGF0YV1dJ10uY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdmFsdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS52YWx1ZXMoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZW50cmllczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ10uZW50cmllcygpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmb3JFYWNoOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgICAgICAgdmFyIGVudGlyZVNldCA9IHRoaXM7XG4gICAgICAgICAgICBlbnN1cmVNYXAoZW50aXJlU2V0KTtcbiAgICAgICAgICAgIHRoaXNbJ1tbU2V0RGF0YV1dJ10uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwga2V5LCBrZXksIGVudGlyZVNldCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soa2V5LCBrZXksIGVudGlyZVNldCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KFNldFNoaW0sICdrZXlzJywgU2V0U2hpbS52YWx1ZXMsIHRydWUpO1xuICAgICAgICBhZGRJdGVyYXRvcihTZXRTaGltLnByb3RvdHlwZSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy52YWx1ZXMoKTsgfSk7XG5cbiAgICAgICAgcmV0dXJuIFNldFNoaW07XG4gICAgICB9KCkpXG4gICAgfTtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKGdsb2JhbHMsIGNvbGxlY3Rpb25TaGltcyk7XG5cbiAgICBpZiAoZ2xvYmFscy5NYXAgfHwgZ2xvYmFscy5TZXQpIHtcbiAgICAgIC8qXG4gICAgICAgIC0gSW4gRmlyZWZveCA8IDIzLCBNYXAjc2l6ZSBpcyBhIGZ1bmN0aW9uLlxuICAgICAgICAtIEluIGFsbCBjdXJyZW50IEZpcmVmb3gsIFNldCNlbnRyaWVzL2tleXMvdmFsdWVzICYgTWFwI2NsZWFyIGRvIG5vdCBleGlzdFxuICAgICAgICAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTg2OTk5NlxuICAgICAgICAtIEluIEZpcmVmb3ggMjQsIE1hcCBhbmQgU2V0IGRvIG5vdCBpbXBsZW1lbnQgZm9yRWFjaFxuICAgICAgICAtIEluIEZpcmVmb3ggMjUgYXQgbGVhc3QsIE1hcCBhbmQgU2V0IGFyZSBjYWxsYWJsZSB3aXRob3V0IFwibmV3XCJcbiAgICAgICovXG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLk1hcC5wcm90b3R5cGUuY2xlYXIgIT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgbmV3IGdsb2JhbHMuU2V0KCkuc2l6ZSAhPT0gMCB8fFxuICAgICAgICBuZXcgZ2xvYmFscy5NYXAoKS5zaXplICE9PSAwIHx8XG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLk1hcC5wcm90b3R5cGUua2V5cyAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICB0eXBlb2YgZ2xvYmFscy5TZXQucHJvdG90eXBlLmtleXMgIT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgdHlwZW9mIGdsb2JhbHMuTWFwLnByb3RvdHlwZS5mb3JFYWNoICE9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLlNldC5wcm90b3R5cGUuZm9yRWFjaCAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICBpc0NhbGxhYmxlV2l0aG91dE5ldyhnbG9iYWxzLk1hcCkgfHxcbiAgICAgICAgaXNDYWxsYWJsZVdpdGhvdXROZXcoZ2xvYmFscy5TZXQpIHx8XG4gICAgICAgICFzdXBwb3J0c1N1YmNsYXNzaW5nKGdsb2JhbHMuTWFwLCBmdW5jdGlvbiAoTSkge1xuICAgICAgICAgIHZhciBtID0gbmV3IE0oW10pO1xuICAgICAgICAgIC8vIEZpcmVmb3ggMzIgaXMgb2sgd2l0aCB0aGUgaW5zdGFudGlhdGluZyB0aGUgc3ViY2xhc3MgYnV0IHdpbGxcbiAgICAgICAgICAvLyB0aHJvdyB3aGVuIHRoZSBtYXAgaXMgdXNlZC5cbiAgICAgICAgICBtLnNldCg0MiwgNDIpO1xuICAgICAgICAgIHJldHVybiBtIGluc3RhbmNlb2YgTTtcbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICBnbG9iYWxzLk1hcCA9IGNvbGxlY3Rpb25TaGltcy5NYXA7XG4gICAgICAgIGdsb2JhbHMuU2V0ID0gY29sbGVjdGlvblNoaW1zLlNldDtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdsb2JhbHMuU2V0LnByb3RvdHlwZS5rZXlzICE9PSBnbG9iYWxzLlNldC5wcm90b3R5cGUudmFsdWVzKSB7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShnbG9iYWxzLlNldC5wcm90b3R5cGUsICdrZXlzJywgZ2xvYmFscy5TZXQucHJvdG90eXBlLnZhbHVlcywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIFNoaW0gaW5jb21wbGV0ZSBpdGVyYXRvciBpbXBsZW1lbnRhdGlvbnMuXG4gICAgYWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKChuZXcgZ2xvYmFscy5NYXAoKSkua2V5cygpKSk7XG4gICAgYWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKChuZXcgZ2xvYmFscy5TZXQoKSkua2V5cygpKSk7XG4gIH1cblxuICByZXR1cm4gZ2xvYmFscztcbn0pKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpIl19
