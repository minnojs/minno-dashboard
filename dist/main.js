/**
 * @preserve minno-dashboard v1.0.4
 * @license Apache-2.0 (2019)
 */

(function () {
    'use strict';

    /**
     * Object.assign polyfill from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
     **/
    if (typeof Object.assign != 'function') {
        Object.assign = function (target, varArgs) { // eslint-disable-line no-unused-vars
            var arguments$1 = arguments;

            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments$1[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function(predicate) {
                if (this == null) {
                    throw new TypeError('Array.prototype.find called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];
                var value;

                for (var i = 0; i < length; i++) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
                return undefined;
            }
        });
    }

    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/) {
            if (this == null) {
                throw new TypeError('Array.prototype.includes called on null or undefined');
            }

            var O = Object(this);
            var len = parseInt(O.length, 10) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1], 10) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }

    /**
     * @this {Promise}
     */
    function finallyConstructor(callback) {
      var constructor = this.constructor;
      return this.then(
        function(value) {
          return constructor.resolve(callback()).then(function() {
            return value;
          });
        },
        function(reason) {
          return constructor.resolve(callback()).then(function() {
            return constructor.reject(reason);
          });
        }
      );
    }

    // Store setTimeout reference so promise-polyfill will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var setTimeoutFunc = setTimeout;

    function noop() {}

    // Polyfill for Function.prototype.bind
    function bind(fn, thisArg) {
      return function() {
        fn.apply(thisArg, arguments);
      };
    }

    /**
     * @constructor
     * @param {Function} fn
     */
    function Promise$1(fn) {
      if (!(this instanceof Promise$1))
        throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function') throw new TypeError('not a function');
      /** @type {!number} */
      this._state = 0;
      /** @type {!boolean} */
      this._handled = false;
      /** @type {Promise|undefined} */
      this._value = undefined;
      /** @type {!Array<!Function>} */
      this._deferreds = [];

      doResolve(fn, this);
    }

    function handle(self, deferred) {
      while (self._state === 3) {
        self = self._value;
      }
      if (self._state === 0) {
        self._deferreds.push(deferred);
        return;
      }
      self._handled = true;
      Promise$1._immediateFn(function() {
        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
          return;
        }
        var ret;
        try {
          ret = cb(self._value);
        } catch (e) {
          reject(deferred.promise, e);
          return;
        }
        resolve(deferred.promise, ret);
      });
    }

    function resolve(self, newValue) {
      try {
        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === self)
          throw new TypeError('A promise cannot be resolved with itself.');
        if (
          newValue &&
          (typeof newValue === 'object' || typeof newValue === 'function')
        ) {
          var then = newValue.then;
          if (newValue instanceof Promise$1) {
            self._state = 3;
            self._value = newValue;
            finale(self);
            return;
          } else if (typeof then === 'function') {
            doResolve(bind(then, newValue), self);
            return;
          }
        }
        self._state = 1;
        self._value = newValue;
        finale(self);
      } catch (e) {
        reject(self, e);
      }
    }

    function reject(self, newValue) {
      self._state = 2;
      self._value = newValue;
      finale(self);
    }

    function finale(self) {
      if (self._state === 2 && self._deferreds.length === 0) {
        Promise$1._immediateFn(function() {
          if (!self._handled) {
            Promise$1._unhandledRejectionFn(self._value);
          }
        });
      }

      for (var i = 0, len = self._deferreds.length; i < len; i++) {
        handle(self, self._deferreds[i]);
      }
      self._deferreds = null;
    }

    /**
     * @constructor
     */
    function Handler(onFulfilled, onRejected, promise) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.promise = promise;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, self) {
      var done = false;
      try {
        fn(
          function(value) {
            if (done) return;
            done = true;
            resolve(self, value);
          },
          function(reason) {
            if (done) return;
            done = true;
            reject(self, reason);
          }
        );
      } catch (ex) {
        if (done) return;
        done = true;
        reject(self, ex);
      }
    }

    Promise$1.prototype['catch'] = function(onRejected) {
      return this.then(null, onRejected);
    };

    Promise$1.prototype.then = function(onFulfilled, onRejected) {
      // @ts-ignore
      var prom = new this.constructor(noop);

      handle(this, new Handler(onFulfilled, onRejected, prom));
      return prom;
    };

    Promise$1.prototype['finally'] = finallyConstructor;

    Promise$1.all = function(arr) {
      return new Promise$1(function(resolve, reject) {
        if (!arr || typeof arr.length === 'undefined')
          throw new TypeError('Promise.all accepts an array');
        var args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        var remaining = args.length;

        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              var then = val.then;
              if (typeof then === 'function') {
                then.call(
                  val,
                  function(val) {
                    res(i, val);
                  },
                  reject
                );
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }

        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };

    Promise$1.resolve = function(value) {
      if (value && typeof value === 'object' && value.constructor === Promise$1) {
        return value;
      }

      return new Promise$1(function(resolve) {
        resolve(value);
      });
    };

    Promise$1.reject = function(value) {
      return new Promise$1(function(resolve, reject) {
        reject(value);
      });
    };

    Promise$1.race = function(values) {
      return new Promise$1(function(resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
          values[i].then(resolve, reject);
        }
      });
    };

    // Use polyfill for setImmediate for performance gains
    Promise$1._immediateFn =
      (typeof setImmediate === 'function' &&
        function(fn) {
          setImmediate(fn);
        }) ||
      function(fn) {
        setTimeoutFunc(fn, 0);
      };

    Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
      if (typeof console !== 'undefined' && console) {
        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
      }
    };

    /** @suppress {undefinedVars} */
    var globalNS = (function() {
      // the only reliable means to get the global object is
      // `Function('return this')()`
      // However, this causes CSP violations in Chrome apps.
      if (typeof self !== 'undefined') {
        return self;
      }
      if (typeof window !== 'undefined') {
        return window;
      }
      if (typeof global !== 'undefined') {
        return global;
      }
      throw new Error('unable to locate global object');
    })();

    if (!('Promise' in globalNS)) {
      globalNS['Promise'] = Promise$1;
    } else if (!globalNS.Promise.prototype['finally']) {
      globalNS.Promise.prototype['finally'] = finallyConstructor;
    }

    var support = {
      searchParams: 'URLSearchParams' in self,
      iterable: 'Symbol' in self && 'iterator' in Symbol,
      blob:
        'FileReader' in self &&
        'Blob' in self &&
        (function() {
          try {
            new Blob();
            return true
          } catch (e) {
            return false
          }
        })(),
      formData: 'FormData' in self,
      arrayBuffer: 'ArrayBuffer' in self
    };

    function isDataView(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    if (support.arrayBuffer) {
      var viewClasses = [
        '[object Int8Array]',
        '[object Uint8Array]',
        '[object Uint8ClampedArray]',
        '[object Int16Array]',
        '[object Uint16Array]',
        '[object Int32Array]',
        '[object Uint32Array]',
        '[object Float32Array]',
        '[object Float64Array]'
      ];

      var isArrayBufferView =
        ArrayBuffer.isView ||
        function(obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
        };
    }

    function normalizeName(name) {
      if (typeof name !== 'string') {
        name = String(name);
      }
      if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name')
      }
      return name.toLowerCase()
    }

    function normalizeValue(value) {
      if (typeof value !== 'string') {
        value = String(value);
      }
      return value
    }

    // Build a destructive iterator for the value list
    function iteratorFor(items) {
      var iterator = {
        next: function() {
          var value = items.shift();
          return {done: value === undefined, value: value}
        }
      };

      if (support.iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator
        };
      }

      return iterator
    }

    function Headers(headers) {
      this.map = {};

      if (headers instanceof Headers) {
        headers.forEach(function(value, name) {
          this.append(name, value);
        }, this);
      } else if (Array.isArray(headers)) {
        headers.forEach(function(header) {
          this.append(header[0], header[1]);
        }, this);
      } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(function(name) {
          this.append(name, headers[name]);
        }, this);
      }
    }

    Headers.prototype.append = function(name, value) {
      name = normalizeName(name);
      value = normalizeValue(value);
      var oldValue = this.map[name];
      this.map[name] = oldValue ? oldValue + ', ' + value : value;
    };

    Headers.prototype['delete'] = function(name) {
      delete this.map[normalizeName(name)];
    };

    Headers.prototype.get = function(name) {
      name = normalizeName(name);
      return this.has(name) ? this.map[name] : null
    };

    Headers.prototype.has = function(name) {
      return this.map.hasOwnProperty(normalizeName(name))
    };

    Headers.prototype.set = function(name, value) {
      this.map[normalizeName(name)] = normalizeValue(value);
    };

    Headers.prototype.forEach = function(callback, thisArg) {
      var this$1 = this;

      for (var name in this.map) {
        if (this$1.map.hasOwnProperty(name)) {
          callback.call(thisArg, this$1.map[name], name, this$1);
        }
      }
    };

    Headers.prototype.keys = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push(name);
      });
      return iteratorFor(items)
    };

    Headers.prototype.values = function() {
      var items = [];
      this.forEach(function(value) {
        items.push(value);
      });
      return iteratorFor(items)
    };

    Headers.prototype.entries = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
      });
      return iteratorFor(items)
    };

    if (support.iterable) {
      Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }

    function consumed(body) {
      if (body.bodyUsed) {
        return Promise.reject(new TypeError('Already read'))
      }
      body.bodyUsed = true;
    }

    function fileReaderReady(reader) {
      return new Promise(function(resolve, reject) {
        reader.onload = function() {
          resolve(reader.result);
        };
        reader.onerror = function() {
          reject(reader.error);
        };
      })
    }

    function readBlobAsArrayBuffer(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsArrayBuffer(blob);
      return promise
    }

    function readBlobAsText(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsText(blob);
      return promise
    }

    function readArrayBufferAsText(buf) {
      var view = new Uint8Array(buf);
      var chars = new Array(view.length);

      for (var i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i]);
      }
      return chars.join('')
    }

    function bufferClone(buf) {
      if (buf.slice) {
        return buf.slice(0)
      } else {
        var view = new Uint8Array(buf.byteLength);
        view.set(new Uint8Array(buf));
        return view.buffer
      }
    }

    function Body() {
      this.bodyUsed = false;

      this._initBody = function(body) {
        this._bodyInit = body;
        if (!body) {
          this._bodyText = '';
        } else if (typeof body === 'string') {
          this._bodyText = body;
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body;
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this._bodyText = body.toString();
        } else if (support.arrayBuffer && support.blob && isDataView(body)) {
          this._bodyArrayBuffer = bufferClone(body.buffer);
          // IE 10-11 can't handle a DataView body.
          this._bodyInit = new Blob([this._bodyArrayBuffer]);
        } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
          this._bodyArrayBuffer = bufferClone(body);
        } else {
          this._bodyText = body = Object.prototype.toString.call(body);
        }

        if (!this.headers.get('content-type')) {
          if (typeof body === 'string') {
            this.headers.set('content-type', 'text/plain;charset=UTF-8');
          } else if (this._bodyBlob && this._bodyBlob.type) {
            this.headers.set('content-type', this._bodyBlob.type);
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
          }
        }
      };

      if (support.blob) {
        this.blob = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return Promise.resolve(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(new Blob([this._bodyArrayBuffer]))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as blob')
          } else {
            return Promise.resolve(new Blob([this._bodyText]))
          }
        };

        this.arrayBuffer = function() {
          if (this._bodyArrayBuffer) {
            return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
          } else {
            return this.blob().then(readBlobAsArrayBuffer)
          }
        };
      }

      this.text = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      };

      if (support.formData) {
        this.formData = function() {
          return this.text().then(decode)
        };
      }

      this.json = function() {
        return this.text().then(JSON.parse)
      };

      return this
    }

    // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

    function normalizeMethod(method) {
      var upcased = method.toUpperCase();
      return methods.indexOf(upcased) > -1 ? upcased : method
    }

    function Request(input, options) {
      options = options || {};
      var body = options.body;

      if (input instanceof Request) {
        if (input.bodyUsed) {
          throw new TypeError('Already read')
        }
        this.url = input.url;
        this.credentials = input.credentials;
        if (!options.headers) {
          this.headers = new Headers(input.headers);
        }
        this.method = input.method;
        this.mode = input.mode;
        this.signal = input.signal;
        if (!body && input._bodyInit != null) {
          body = input._bodyInit;
          input.bodyUsed = true;
        }
      } else {
        this.url = String(input);
      }

      this.credentials = options.credentials || this.credentials || 'same-origin';
      if (options.headers || !this.headers) {
        this.headers = new Headers(options.headers);
      }
      this.method = normalizeMethod(options.method || this.method || 'GET');
      this.mode = options.mode || this.mode || null;
      this.signal = options.signal || this.signal;
      this.referrer = null;

      if ((this.method === 'GET' || this.method === 'HEAD') && body) {
        throw new TypeError('Body not allowed for GET or HEAD requests')
      }
      this._initBody(body);
    }

    Request.prototype.clone = function() {
      return new Request(this, {body: this._bodyInit})
    };

    function decode(body) {
      var form = new FormData();
      body
        .trim()
        .split('&')
        .forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split('=');
            var name = split.shift().replace(/\+/g, ' ');
            var value = split.join('=').replace(/\+/g, ' ');
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
      return form
    }

    function parseHeaders(rawHeaders) {
      var headers = new Headers();
      // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
      // https://tools.ietf.org/html/rfc7230#section-3.2
      var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
      preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
      return headers
    }

    Body.call(Request.prototype);

    function Response(bodyInit, options) {
      if (!options) {
        options = {};
      }

      this.type = 'default';
      this.status = options.status === undefined ? 200 : options.status;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = 'statusText' in options ? options.statusText : 'OK';
      this.headers = new Headers(options.headers);
      this.url = options.url || '';
      this._initBody(bodyInit);
    }

    Body.call(Response.prototype);

    Response.prototype.clone = function() {
      return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url
      })
    };

    Response.error = function() {
      var response = new Response(null, {status: 0, statusText: ''});
      response.type = 'error';
      return response
    };

    var redirectStatuses = [301, 302, 303, 307, 308];

    Response.redirect = function(url, status) {
      if (redirectStatuses.indexOf(status) === -1) {
        throw new RangeError('Invalid status code')
      }

      return new Response(null, {status: status, headers: {location: url}})
    };

    var DOMException = self.DOMException;
    try {
      new DOMException();
    } catch (err) {
      DOMException = function(message, name) {
        this.message = message;
        this.name = name;
        var error = Error(message);
        this.stack = error.stack;
      };
      DOMException.prototype = Object.create(Error.prototype);
      DOMException.prototype.constructor = DOMException;
    }

    function fetch$1(input, init) {
      return new Promise(function(resolve, reject) {
        var request = new Request(input, init);

        if (request.signal && request.signal.aborted) {
          return reject(new DOMException('Aborted', 'AbortError'))
        }

        var xhr = new XMLHttpRequest();

        function abortXhr() {
          xhr.abort();
        }

        xhr.onload = function() {
          var options = {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders() || '')
          };
          options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
          var body = 'response' in xhr ? xhr.response : xhr.responseText;
          resolve(new Response(body, options));
        };

        xhr.onerror = function() {
          reject(new TypeError('Network request failed'));
        };

        xhr.ontimeout = function() {
          reject(new TypeError('Network request failed'));
        };

        xhr.onabort = function() {
          reject(new DOMException('Aborted', 'AbortError'));
        };

        xhr.open(request.method, request.url, true);

        if (request.credentials === 'include') {
          xhr.withCredentials = true;
        } else if (request.credentials === 'omit') {
          xhr.withCredentials = false;
        }

        if ('responseType' in xhr && support.blob) {
          xhr.responseType = 'blob';
        }

        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });

        if (request.signal) {
          request.signal.addEventListener('abort', abortXhr);

          xhr.onreadystatechange = function() {
            // DONE (success or failure)
            if (xhr.readyState === 4) {
              request.signal.removeEventListener('abort', abortXhr);
            }
          };
        }

        xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
      })
    }

    fetch$1.polyfill = true;

    if (!self.fetch) {
      self.fetch = fetch$1;
      self.Headers = Headers;
      self.Request = Request;
      self.Response = Response;
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var moment = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory();
    }(commonjsGlobal, (function () {
        var hookCallback;

        function hooks () {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback (callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
        }

        function isObject(input) {
            // IE8 will treat undefined and null as object if it wasn't for
            // input != null
            return input != null && Object.prototype.toString.call(input) === '[object Object]';
        }

        function isObjectEmpty(obj) {
            if (Object.getOwnPropertyNames) {
                return (Object.getOwnPropertyNames(obj).length === 0);
            } else {
                var k;
                for (k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        return false;
                    }
                }
                return true;
            }
        }

        function isUndefined(input) {
            return input === void 0;
        }

        function isNumber(input) {
            return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
        }

        function isDate(input) {
            return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
        }

        function map(arr, fn) {
            var res = [], i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function createUTC (input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty           : false,
                unusedTokens    : [],
                unusedInput     : [],
                overflow        : -2,
                charsLeftOver   : 0,
                nullInput       : false,
                invalidMonth    : null,
                invalidFormat   : false,
                userInvalidated : false,
                iso             : false,
                parsedDateParts : [],
                meridiem        : null,
                rfc2822         : false,
                weekdayMismatch : false
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        var some;
        if (Array.prototype.some) {
            some = Array.prototype.some;
        } else {
            some = function (fun) {
                var this$1 = this;

                var t = Object(this);
                var len = t.length >>> 0;

                for (var i = 0; i < len; i++) {
                    if (i in t && fun.call(this$1, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }

        function isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m);
                var parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                });
                var isNowValid = !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

                if (m._strict) {
                    isNowValid = isNowValid &&
                        flags.charsLeftOver === 0 &&
                        flags.unusedTokens.length === 0 &&
                        flags.bigHour === undefined;
                }

                if (Object.isFrozen == null || !Object.isFrozen(m)) {
                    m._isValid = isNowValid;
                }
                else {
                    return isNowValid;
                }
            }
            return m._isValid;
        }

        function createInvalid (flags) {
            var m = createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            }
            else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = hooks.momentProperties = [];

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i = 0; i < momentProperties.length; i++) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        var updateInProgress = false;

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            if (!this.isValid()) {
                this._d = new Date(NaN);
            }
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment (obj) {
            return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
        }

        function absFloor (number) {
            if (number < 0) {
                // -0 -> 0
                return Math.ceil(number) || 0;
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if ((dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        function warn(msg) {
            if (hooks.suppressDeprecationWarnings === false &&
                    (typeof console !==  'undefined') && console.warn) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                var arguments$1 = arguments;

                if (hooks.deprecationHandler != null) {
                    hooks.deprecationHandler(null, msg);
                }
                if (firstTime) {
                    var args = [];
                    var arg;
                    for (var i = 0; i < arguments.length; i++) {
                        arg = '';
                        if (typeof arguments$1[i] === 'object') {
                            arg += '\n[' + i + '] ';
                            for (var key in arguments[0]) {
                                arg += key + ': ' + arguments$1[0][key] + ', ';
                            }
                            arg = arg.slice(0, -2); // Remove trailing comma and space
                        } else {
                            arg = arguments$1[i];
                        }
                        args.push(arg);
                    }
                    warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(name, msg);
            }
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        hooks.suppressDeprecationWarnings = false;
        hooks.deprecationHandler = null;

        function isFunction(input) {
            return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
        }

        function set (config) {
            var this$1 = this;

            var prop, i;
            for (i in config) {
                prop = config[i];
                if (isFunction(prop)) {
                    this$1[i] = prop;
                } else {
                    this$1['_' + i] = prop;
                }
            }
            this._config = config;
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
            // TODO: Remove "ordinalParse" fallback in next major release.
            this._dayOfMonthOrdinalParseLenient = new RegExp(
                (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                    '|' + (/\d{1,2}/).source);
        }

        function mergeConfigs(parentConfig, childConfig) {
            var res = extend({}, parentConfig), prop;
            for (prop in childConfig) {
                if (hasOwnProp(childConfig, prop)) {
                    if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                        res[prop] = {};
                        extend(res[prop], parentConfig[prop]);
                        extend(res[prop], childConfig[prop]);
                    } else if (childConfig[prop] != null) {
                        res[prop] = childConfig[prop];
                    } else {
                        delete res[prop];
                    }
                }
            }
            for (prop in parentConfig) {
                if (hasOwnProp(parentConfig, prop) &&
                        !hasOwnProp(childConfig, prop) &&
                        isObject(parentConfig[prop])) {
                    // make sure changes to properties don't modify parent config
                    res[prop] = extend({}, res[prop]);
                }
            }
            return res;
        }

        function Locale(config) {
            if (config != null) {
                this.set(config);
            }
        }

        var keys;

        if (Object.keys) {
            keys = Object.keys;
        } else {
            keys = function (obj) {
                var i, res = [];
                for (i in obj) {
                    if (hasOwnProp(obj, i)) {
                        res.push(i);
                    }
                }
                return res;
            };
        }

        var defaultCalendar = {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        };

        function calendar (key, mom, now) {
            var output = this._calendar[key] || this._calendar['sameElse'];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        var defaultLongDateFormat = {
            LTS  : 'h:mm:ss A',
            LT   : 'h:mm A',
            L    : 'MM/DD/YYYY',
            LL   : 'MMMM D, YYYY',
            LLL  : 'MMMM D, YYYY h:mm A',
            LLLL : 'dddd, MMMM D, YYYY h:mm A'
        };

        function longDateFormat (key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
                return val.slice(1);
            });

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate () {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d';
        var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

        function ordinal (number) {
            return this._ordinal.replace('%d', number);
        }

        var defaultRelativeTime = {
            future : 'in %s',
            past   : '%s ago',
            s  : 'a few seconds',
            ss : '%d seconds',
            m  : 'a minute',
            mm : '%d minutes',
            h  : 'an hour',
            hh : '%d hours',
            d  : 'a day',
            dd : '%d days',
            M  : 'a month',
            MM : '%d months',
            y  : 'a year',
            yy : '%d years'
        };

        function relativeTime (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (isFunction(output)) ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        }

        function pastFuture (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        var aliases = {};

        function addUnitAlias (unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        var priorities = {};

        function addUnitPriority(unit, priority) {
            priorities[unit] = priority;
        }

        function getPrioritizedUnits(unitsObj) {
            var units = [];
            for (var u in unitsObj) {
                units.push({unit: u, priority: priorities[u]});
            }
            units.sort(function (a, b) {
                return a.priority - b.priority;
            });
            return units;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (sign ? (forceSign ? '+' : '') : '-') +
                Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

        var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

        var formatFunctions = {};

        var formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken (token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(func.apply(this, arguments), token);
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens), i, length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '', i;
                for (i = 0; i < length; i++) {
                    output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var match1         = /\d/;            //       0 - 9
        var match2         = /\d\d/;          //      00 - 99
        var match3         = /\d{3}/;         //     000 - 999
        var match4         = /\d{4}/;         //    0000 - 9999
        var match6         = /[+-]?\d{6}/;    // -999999 - 999999
        var match1to2      = /\d\d?/;         //       0 - 99
        var match3to4      = /\d\d\d\d?/;     //     999 - 9999
        var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
        var match1to3      = /\d{1,3}/;       //       0 - 999
        var match1to4      = /\d{1,4}/;       //       0 - 9999
        var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

        var matchUnsigned  = /\d+/;           //       0 - inf
        var matchSigned    = /[+-]?\d+/;      //    -inf - inf

        var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
        var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

        var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

        var regexes = {};

        function addRegexToken (token, regex, strictRegex) {
            regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
                return (isStrict && strictRegex) ? strictRegex : regex;
            };
        }

        function getParseRegexForToken (token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            }));
        }

        function regexEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken (token, callback) {
            var i, func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (isNumber(callback)) {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken (token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0;
        var MONTH = 1;
        var DATE = 2;
        var HOUR = 3;
        var MINUTE = 4;
        var SECOND = 5;
        var MILLISECOND = 6;
        var WEEK = 7;
        var WEEKDAY = 8;

        // FORMATTING

        addFormatToken('Y', 0, 0, function () {
            var y = this.year();
            return y <= 9999 ? '' + y : '+' + y;
        });

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY',   4],       0, 'year');
        addFormatToken(0, ['YYYYY',  5],       0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PRIORITIES

        addUnitPriority('year', 1);

        // PARSING

        addRegexToken('Y',      matchSigned);
        addRegexToken('YY',     match1to2, match2);
        addRegexToken('YYYY',   match1to4, match4);
        addRegexToken('YYYYY',  match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = hooks.parseTwoDigitYear(input);
        });
        addParseToken('Y', function (input, array) {
            array[YEAR] = parseInt(input, 10);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        // HOOKS

        hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', true);

        function getIsLeapYear () {
            return isLeapYear(this.year());
        }

        function makeGetSet (unit, keepTime) {
            return function (value) {
                if (value != null) {
                    set$1(this, unit, value);
                    hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get(this, unit);
                }
            };
        }

        function get (mom, unit) {
            return mom.isValid() ?
                mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
        }

        function set$1 (mom, unit, value) {
            if (mom.isValid() && !isNaN(value)) {
                if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
                }
                else {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
                }
            }
        }

        // MOMENTS

        function stringGet (units) {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units]();
            }
            return this;
        }


        function stringSet (units, value) {
            var this$1 = this;

            if (typeof units === 'object') {
                units = normalizeObjectUnits(units);
                var prioritized = getPrioritizedUnits(units);
                for (var i = 0; i < prioritized.length; i++) {
                    this$1[prioritized[i].unit](units[prioritized[i].unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        function mod(n, x) {
            return ((n % x) + x) % x;
        }

        var indexOf;

        if (Array.prototype.indexOf) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (o) {
                var this$1 = this;

                // I know
                var i;
                for (i = 0; i < this.length; ++i) {
                    if (this$1[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        function daysInMonth(year, month) {
            if (isNaN(year) || isNaN(month)) {
                return NaN;
            }
            var modMonth = mod(month, 12);
            year += (month - modMonth) / 12;
            return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PRIORITY

        addUnitPriority('month', 8);

        // PARSING

        addRegexToken('M',    match1to2);
        addRegexToken('MM',   match1to2, match2);
        addRegexToken('MMM',  function (isStrict, locale) {
            return locale.monthsShortRegex(isStrict);
        });
        addRegexToken('MMMM', function (isStrict, locale) {
            return locale.monthsRegex(isStrict);
        });

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
        function localeMonths (m, format) {
            if (!m) {
                return isArray(this._months) ? this._months :
                    this._months['standalone'];
            }
            return isArray(this._months) ? this._months[m.month()] :
                this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
        }

        var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
        function localeMonthsShort (m, format) {
            if (!m) {
                return isArray(this._monthsShort) ? this._monthsShort :
                    this._monthsShort['standalone'];
            }
            return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
                this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
        }

        function handleStrictParse(monthName, format, strict) {
            var this$1 = this;

            var i, ii, mom, llc = monthName.toLocaleLowerCase();
            if (!this._monthsParse) {
                // this is not used
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
                for (i = 0; i < 12; ++i) {
                    mom = createUTC([2000, i]);
                    this$1._shortMonthsParse[i] = this$1.monthsShort(mom, '').toLocaleLowerCase();
                    this$1._longMonthsParse[i] = this$1.months(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeMonthsParse (monthName, format, strict) {
            var this$1 = this;

            var i, mom, regex;

            if (this._monthsParseExact) {
                return handleStrictParse.call(this, monthName, format, strict);
            }

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            // TODO: add sorting
            // Sorting makes sure if one month (or abbr) is a prefix of another
            // see sorting in computeMonthsParse
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                if (strict && !this$1._longMonthsParse[i]) {
                    this$1._longMonthsParse[i] = new RegExp('^' + this$1.months(mom, '').replace('.', '') + '$', 'i');
                    this$1._shortMonthsParse[i] = new RegExp('^' + this$1.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this$1._monthsParse[i]) {
                    regex = '^' + this$1.months(mom, '') + '|^' + this$1.monthsShort(mom, '');
                    this$1._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this$1._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this$1._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this$1._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth (mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            if (typeof value === 'string') {
                if (/^\d+$/.test(value)) {
                    value = toInt(value);
                } else {
                    value = mom.localeData().monthsParse(value);
                    // TODO: Another silent failure?
                    if (!isNumber(value)) {
                        return mom;
                    }
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth (value) {
            if (value != null) {
                setMonth(this, value);
                hooks.updateOffset(this, true);
                return this;
            } else {
                return get(this, 'Month');
            }
        }

        function getDaysInMonth () {
            return daysInMonth(this.year(), this.month());
        }

        var defaultMonthsShortRegex = matchWord;
        function monthsShortRegex (isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsShortStrictRegex;
                } else {
                    return this._monthsShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsShortRegex')) {
                    this._monthsShortRegex = defaultMonthsShortRegex;
                }
                return this._monthsShortStrictRegex && isStrict ?
                    this._monthsShortStrictRegex : this._monthsShortRegex;
            }
        }

        var defaultMonthsRegex = matchWord;
        function monthsRegex (isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsStrictRegex;
                } else {
                    return this._monthsRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    this._monthsRegex = defaultMonthsRegex;
                }
                return this._monthsStrictRegex && isStrict ?
                    this._monthsStrictRegex : this._monthsRegex;
            }
        }

        function computeMonthsParse () {
            var this$1 = this;

            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var shortPieces = [], longPieces = [], mixedPieces = [],
                i, mom;
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                shortPieces.push(this$1.monthsShort(mom, ''));
                longPieces.push(this$1.months(mom, ''));
                mixedPieces.push(this$1.months(mom, ''));
                mixedPieces.push(this$1.monthsShort(mom, ''));
            }
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 12; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
            }
            for (i = 0; i < 24; i++) {
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._monthsShortRegex = this._monthsRegex;
            this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
            this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        }

        function createDate (y, m, d, h, M, s, ms) {
            // can't just apply() to create a date:
            // https://stackoverflow.com/q/181348
            var date = new Date(y, m, d, h, M, s, ms);

            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
            return date;
        }

        function createUTCDate (y) {
            var date = new Date(Date.UTC.apply(null, arguments));

            // the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
            return date;
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                fwd = 7 + dow - doy,
                // first-week day local weekday -- which local weekday is fwd
                fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear, resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek, resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PRIORITIES

        addUnitPriority('week', 5);
        addUnitPriority('isoWeek', 5);

        // PARSING

        addRegexToken('w',  match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W',  match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 6th is the first week of the year.
        };

        function localeFirstDayOfWeek () {
            return this._week.dow;
        }

        function localeFirstDayOfYear () {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PRIORITY
        addUnitPriority('day', 11);
        addUnitPriority('weekday', 11);
        addUnitPriority('isoWeekday', 11);

        // PARSING

        addRegexToken('d',    match1to2);
        addRegexToken('e',    match1to2);
        addRegexToken('E',    match1to2);
        addRegexToken('dd',   function (isStrict, locale) {
            return locale.weekdaysMinRegex(isStrict);
        });
        addRegexToken('ddd',   function (isStrict, locale) {
            return locale.weekdaysShortRegex(isStrict);
        });
        addRegexToken('dddd',   function (isStrict, locale) {
            return locale.weekdaysRegex(isStrict);
        });

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        function parseIsoWeekday(input, locale) {
            if (typeof input === 'string') {
                return locale.weekdaysParse(input) % 7 || 7;
            }
            return isNaN(input) ? null : input;
        }

        // LOCALES

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
        function localeWeekdays (m, format) {
            if (!m) {
                return isArray(this._weekdays) ? this._weekdays :
                    this._weekdays['standalone'];
            }
            return isArray(this._weekdays) ? this._weekdays[m.day()] :
                this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
        }

        var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
        function localeWeekdaysShort (m) {
            return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
        }

        var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
        function localeWeekdaysMin (m) {
            return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
        }

        function handleStrictParse$1(weekdayName, format, strict) {
            var this$1 = this;

            var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._minWeekdaysParse = [];

                for (i = 0; i < 7; ++i) {
                    mom = createUTC([2000, 1]).day(i);
                    this$1._minWeekdaysParse[i] = this$1.weekdaysMin(mom, '').toLocaleLowerCase();
                    this$1._shortWeekdaysParse[i] = this$1.weekdaysShort(mom, '').toLocaleLowerCase();
                    this$1._weekdaysParse[i] = this$1.weekdays(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeWeekdaysParse (weekdayName, format, strict) {
            var this$1 = this;

            var i, mom, regex;

            if (this._weekdaysParseExact) {
                return handleStrictParse$1.call(this, weekdayName, format, strict);
            }

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = createUTC([2000, 1]).day(i);
                if (strict && !this$1._fullWeekdaysParse[i]) {
                    this$1._fullWeekdaysParse[i] = new RegExp('^' + this$1.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                    this$1._shortWeekdaysParse[i] = new RegExp('^' + this$1.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                    this$1._minWeekdaysParse[i] = new RegExp('^' + this$1.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
                }
                if (!this$1._weekdaysParse[i]) {
                    regex = '^' + this$1.weekdays(mom, '') + '|^' + this$1.weekdaysShort(mom, '') + '|^' + this$1.weekdaysMin(mom, '');
                    this$1._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'dddd' && this$1._fullWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'ddd' && this$1._shortWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'dd' && this$1._minWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (!strict && this$1._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek (input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek (input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek (input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }

            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.

            if (input != null) {
                var weekday = parseIsoWeekday(input, this.localeData());
                return this.day(this.day() % 7 ? weekday : weekday - 7);
            } else {
                return this.day() || 7;
            }
        }

        var defaultWeekdaysRegex = matchWord;
        function weekdaysRegex (isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysStrictRegex;
                } else {
                    return this._weekdaysRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    this._weekdaysRegex = defaultWeekdaysRegex;
                }
                return this._weekdaysStrictRegex && isStrict ?
                    this._weekdaysStrictRegex : this._weekdaysRegex;
            }
        }

        var defaultWeekdaysShortRegex = matchWord;
        function weekdaysShortRegex (isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysShortStrictRegex;
                } else {
                    return this._weekdaysShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                }
                return this._weekdaysShortStrictRegex && isStrict ?
                    this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
            }
        }

        var defaultWeekdaysMinRegex = matchWord;
        function weekdaysMinRegex (isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysMinStrictRegex;
                } else {
                    return this._weekdaysMinRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                }
                return this._weekdaysMinStrictRegex && isStrict ?
                    this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
            }
        }


        function computeWeekdaysParse () {
            var this$1 = this;

            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
                i, mom, minp, shortp, longp;
            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, 1]).day(i);
                minp = this$1.weekdaysMin(mom, '');
                shortp = this$1.weekdaysShort(mom, '');
                longp = this$1.weekdays(mom, '');
                minPieces.push(minp);
                shortPieces.push(shortp);
                longPieces.push(longp);
                mixedPieces.push(minp);
                mixedPieces.push(shortp);
                mixedPieces.push(longp);
            }
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            minPieces.sort(cmpLenRev);
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 7; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._weekdaysShortRegex = this._weekdaysRegex;
            this._weekdaysMinRegex = this._weekdaysRegex;

            this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
            this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
            this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        function kFormat() {
            return this.hours() || 24;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);
        addFormatToken('k', ['kk', 2], 0, kFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2);
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2);
        });

        function meridiem (token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PRIORITY
        addUnitPriority('hour', 13);

        // PARSING

        function matchMeridiem (isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a',  matchMeridiem);
        addRegexToken('A',  matchMeridiem);
        addRegexToken('H',  match1to2);
        addRegexToken('h',  match1to2);
        addRegexToken('k',  match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);
        addRegexToken('kk', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['k', 'kk'], function (input, array, config) {
            var kInput = toInt(input);
            array[HOUR] = kInput === 24 ? 0 : kInput;
        });
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
        function localeMeridiem (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }


        // MOMENTS

        // Setting the hour should keep the time, because the user explicitly
        // specified which hour they want. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        var getSetHour = makeGetSet('Hours', true);

        var baseConfig = {
            calendar: defaultCalendar,
            longDateFormat: defaultLongDateFormat,
            invalidDate: defaultInvalidDate,
            ordinal: defaultOrdinal,
            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
            relativeTime: defaultRelativeTime,

            months: defaultLocaleMonths,
            monthsShort: defaultLocaleMonthsShort,

            week: defaultLocaleWeek,

            weekdays: defaultLocaleWeekdays,
            weekdaysMin: defaultLocaleWeekdaysMin,
            weekdaysShort: defaultLocaleWeekdaysShort,

            meridiemParse: defaultLocaleMeridiemParse
        };

        // internal storage for locale config files
        var locales = {};
        var localeFamilies = {};
        var globalLocale;

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0, j, next, locale, split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return globalLocale;
        }

        function loadLocale(name) {
            var oldLocale = null;
            // TODO: Find a better way to register and load all the locales in Node
            if (!locales[name] && ('object' !== 'undefined') &&
                    module && module.exports) {
                try {
                    oldLocale = globalLocale._abbr;
                    var aliasedRequire = commonjsRequire;
                    aliasedRequire('./locale/' + name);
                    getSetGlobalLocale(oldLocale);
                } catch (e) {}
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function getSetGlobalLocale (key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = getLocale(key);
                }
                else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                }
                else {
                    if ((typeof console !==  'undefined') && console.warn) {
                        //warn user if arguments are passed but the locale could not be set
                        console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                    }
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale (name, config) {
            if (config !== null) {
                var locale, parentConfig = baseConfig;
                config.abbr = name;
                if (locales[name] != null) {
                    deprecateSimple('defineLocaleOverride',
                            'use moment.updateLocale(localeName, config) to change ' +
                            'an existing locale. moment.defineLocale(localeName, ' +
                            'config) should only be used for creating a new locale ' +
                            'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                    parentConfig = locales[name]._config;
                } else if (config.parentLocale != null) {
                    if (locales[config.parentLocale] != null) {
                        parentConfig = locales[config.parentLocale]._config;
                    } else {
                        locale = loadLocale(config.parentLocale);
                        if (locale != null) {
                            parentConfig = locale._config;
                        } else {
                            if (!localeFamilies[config.parentLocale]) {
                                localeFamilies[config.parentLocale] = [];
                            }
                            localeFamilies[config.parentLocale].push({
                                name: name,
                                config: config
                            });
                            return null;
                        }
                    }
                }
                locales[name] = new Locale(mergeConfigs(parentConfig, config));

                if (localeFamilies[name]) {
                    localeFamilies[name].forEach(function (x) {
                        defineLocale(x.name, x.config);
                    });
                }

                // backwards compat for now: also set the locale
                // make sure we set the locale AFTER all child locales have been
                // created, so we won't end up with the child locale set.
                getSetGlobalLocale(name);


                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        function updateLocale(name, config) {
            if (config != null) {
                var locale, tmpLocale, parentConfig = baseConfig;
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;

                // backwards compat for now: also set the locale
                getSetGlobalLocale(name);
            } else {
                // pass null for config to unupdate, useful for tests
                if (locales[name] != null) {
                    if (locales[name].parentLocale != null) {
                        locales[name] = locales[name].parentLocale;
                    } else if (locales[name] != null) {
                        delete locales[name];
                    }
                }
            }
            return locales[name];
        }

        // returns locale data
        function getLocale (key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        function listLocales() {
            return keys(locales);
        }

        function checkOverflow (m) {
            var overflow;
            var a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow =
                    a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                    a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                    a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                    a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                    a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                    a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                    -1;

                if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(hooks.now());
            if (config._useUTC) {
                return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray (config) {
            var i, date, input = [], currentDate, expectedWeekday, yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear != null) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
            }

            // Check for 24:00:00.000
            if (config._a[HOUR] === 24 &&
                    config._a[MINUTE] === 0 &&
                    config._a[SECOND] === 0 &&
                    config._a[MILLISECOND] === 0) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
            expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }

            // check for mismatching day of week
            if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
                getParsingFlags(config).weekdayMismatch = true;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                var curWeek = weekOfYear(createLocal(), dow, doy);

                weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

                // Default to current week.
                week = defaults(w.w, curWeek.week);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from beginning of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to beginning of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
        var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

        var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

        var isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            // YYYYMM is NOT allowed by the standard
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/]
        ];

        // iso time formats and regexes
        var isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/]
        ];

        var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

        // date from iso format
        function configFromISO(config) {
            var i, l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime, dateFormat, timeFormat, tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

        function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
            var result = [
                untruncateYear(yearStr),
                defaultLocaleMonthsShort.indexOf(monthStr),
                parseInt(dayStr, 10),
                parseInt(hourStr, 10),
                parseInt(minuteStr, 10)
            ];

            if (secondStr) {
                result.push(parseInt(secondStr, 10));
            }

            return result;
        }

        function untruncateYear(yearStr) {
            var year = parseInt(yearStr, 10);
            if (year <= 49) {
                return 2000 + year;
            } else if (year <= 999) {
                return 1900 + year;
            }
            return year;
        }

        function preprocessRFC2822(s) {
            // Remove comments and folding whitespace and replace multiple-spaces with a single space
            return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }

        function checkWeekday(weekdayStr, parsedInput, config) {
            if (weekdayStr) {
                // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                    weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
                if (weekdayProvided !== weekdayActual) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return false;
                }
            }
            return true;
        }

        var obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60
        };

        function calculateOffset(obsOffset, militaryOffset, numOffset) {
            if (obsOffset) {
                return obsOffsets[obsOffset];
            } else if (militaryOffset) {
                // the only allowed military tz is Z
                return 0;
            } else {
                var hm = parseInt(numOffset, 10);
                var m = hm % 100, h = (hm - m) / 100;
                return h * 60 + m;
            }
        }

        // date and time from ref 2822 format
        function configFromRFC2822(config) {
            var match = rfc2822.exec(preprocessRFC2822(config._i));
            if (match) {
                var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
                if (!checkWeekday(match[1], parsedArray, config)) {
                    return;
                }

                config._a = parsedArray;
                config._tzm = calculateOffset(match[8], match[9], match[10]);

                config._d = createUTCDate.apply(null, config._a);
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

                getParsingFlags(config).rfc2822 = true;
            } else {
                config._isValid = false;
            }
        }

        // date from iso format or fallback
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);

            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            configFromRFC2822(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }

        hooks.createFromInputFallback = deprecate(
            'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged and will be removed in an upcoming major release. Please refer to ' +
            'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
            function (config) {
                config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
            }
        );

        // constant that refers to the ISO standard
        hooks.ISO_8601 = function () {};

        // constant that refers to the RFC 2822 form
        hooks.RFC_2822 = function () {};

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === hooks.ISO_8601) {
                configFromISO(config);
                return;
            }
            if (config._f === hooks.RFC_2822) {
                configFromRFC2822(config);
                return;
            }
            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i, parsedInput, tokens, token, skipped,
                stringLength = string.length,
                totalParsedInputLength = 0;

            tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                // console.log('token', token, 'parsedInput', parsedInput,
                //         'regex', getParseRegexForToken(token, config));
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    }
                    else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                }
                else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (config._a[HOUR] <= 12 &&
                getParsingFlags(config).bigHour === true &&
                config._a[HOUR] > 0) {
                getParsingFlags(config).bigHour = undefined;
            }

            getParsingFlags(config).parsedDateParts = config._a.slice(0);
            getParsingFlags(config).meridiem = config._meridiem;
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

            configFromArray(config);
            checkOverflow(config);
        }


        function meridiemFixWrap (locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig,
                bestMoment,

                scoreToBeat,
                i,
                currentScore;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (!isValid(tempConfig)) {
                    continue;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i);
            config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
                return obj && parseInt(obj, 10);
            });

            configFromArray(config);
        }

        function createFromConfig (config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig (config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || getLocale(config._l);

            if (input === null || (format === undefined && input === '')) {
                return createInvalid({nullInput: true});
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isDate(input)) {
                config._d = input;
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            }  else {
                configFromInput(config);
            }

            if (!isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (isUndefined(input)) {
                config._d = new Date(hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(input.valueOf());
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if (isObject(input)) {
                configFromObject(config);
            } else if (isNumber(input)) {
                // from milliseconds
                config._d = new Date(input);
            } else {
                hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC (input, format, locale, strict, isUTC) {
            var c = {};

            if (locale === true || locale === false) {
                strict = locale;
                locale = undefined;
            }

            if ((isObject(input) && isObjectEmpty(input)) ||
                    (isArray(input) && input.length === 0)) {
                input = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function createLocal (input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

        var prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min () {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max () {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = function () {
            return Date.now ? Date.now() : +(new Date());
        };

        var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

        function isDurationValid(m) {
            for (var key in m) {
                if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                    return false;
                }
            }

            var unitHasDecimal = false;
            for (var i = 0; i < ordering.length; ++i) {
                if (m[ordering[i]]) {
                    if (unitHasDecimal) {
                        return false; // only allow non-integers for smallest unit
                    }
                    if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                        unitHasDecimal = true;
                    }
                }
            }

            return true;
        }

        function isValid$1() {
            return this._isValid;
        }

        function createInvalid$1() {
            return createDuration(NaN);
        }

        function Duration (duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            this._isValid = isDurationValid(normalizedInput);

            // representation for dateAddRemove
            this._milliseconds = +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days +
                weeks * 7;
            // It is impossible to translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months +
                quarters * 3 +
                years * 12;

            this._data = {};

            this._locale = getLocale();

            this._bubble();
        }

        function isDuration (obj) {
            return obj instanceof Duration;
        }

        function absRound (number) {
            if (number < 0) {
                return Math.round(-1 * number) * -1;
            } else {
                return Math.round(number);
            }
        }

        // FORMATTING

        function offset (token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset();
                var sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z',  matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher);

            if (matches === null) {
                return null;
            }

            var chunk   = matches[matches.length - 1] || [];
            var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            var minutes = +(parts[1] * 60) + toInt(parts[2]);

            return minutes === 0 ?
              0 :
              parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(res._d.valueOf() + diff);
                hooks.updateOffset(res, false);
                return res;
            } else {
                return createLocal(input).local();
            }
        }

        function getDateOffset (m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        hooks.updateOffset = function () {};

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset (input, keepLocalTime, keepMinutes) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                    if (input === null) {
                        return this;
                    }
                } else if (Math.abs(input) < 16 && !keepMinutes) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone (input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC (keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal (keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset () {
            if (this._tzm != null) {
                this.utcOffset(this._tzm, false, true);
            } else if (typeof this._i === 'string') {
                var tZone = offsetFromString(matchOffset, this._i);
                if (tZone != null) {
                    this.utcOffset(tZone);
                }
                else {
                    this.utcOffset(0, true);
                }
            }
            return this;
        }

        function hasAlignedHourOffset (input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime () {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }

        function isDaylightSavingTimeShifted () {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {};

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                this._isDSTShifted = this.isValid() &&
                    compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal () {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset () {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc () {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

        function createDuration (input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms : input._milliseconds,
                    d  : input._days,
                    M  : input._months
                };
            } else if (isNumber(input)) {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : 1;
                duration = {
                    y  : 0,
                    d  : toInt(match[DATE])                         * sign,
                    h  : toInt(match[HOUR])                         * sign,
                    m  : toInt(match[MINUTE])                       * sign,
                    s  : toInt(match[SECOND])                       * sign,
                    ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
                };
            } else if (!!(match = isoRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : 1;
                duration = {
                    y : parseIso(match[2], sign),
                    M : parseIso(match[3], sign),
                    w : parseIso(match[4], sign),
                    d : parseIso(match[5], sign),
                    h : parseIso(match[6], sign),
                    m : parseIso(match[7], sign),
                    s : parseIso(match[8], sign)
                };
            } else if (duration == null) {// checks for null or undefined
                duration = {};
            } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
                diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            return ret;
        }

        createDuration.fn = Duration.prototype;
        createDuration.invalid = createInvalid$1;

        function parseIso (inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = {milliseconds: 0, months: 0};

            res.months = other.month() - base.month() +
                (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return {milliseconds: 0, months: 0};
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                    'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                    tmp = val; val = period; period = tmp;
                }

                val = typeof val === 'string' ? +val : val;
                dur = createDuration(val, period);
                addSubtract(this, dur, direction);
                return this;
            };
        }

        function addSubtract (mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = absRound(duration._days),
                months = absRound(duration._months);

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (months) {
                setMonth(mom, get(mom, 'Month') + months * isAdding);
            }
            if (days) {
                set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
            }
            if (milliseconds) {
                mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
            }
            if (updateOffset) {
                hooks.updateOffset(mom, days || months);
            }
        }

        var add      = createAdder(1, 'add');
        var subtract = createAdder(-1, 'subtract');

        function getCalendarFormat(myMoment, now) {
            var diff = myMoment.diff(now, 'days', true);
            return diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
        }

        function calendar$1 (time, formats) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                format = hooks.calendarFormat(this, sod) || 'sameElse';

            var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

            return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
        }

        function clone () {
            return new Moment(this);
        }

        function isAfter (input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() > localInput.valueOf();
            } else {
                return localInput.valueOf() < this.clone().startOf(units).valueOf();
            }
        }

        function isBefore (input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() < localInput.valueOf();
            } else {
                return this.clone().endOf(units).valueOf() < localInput.valueOf();
            }
        }

        function isBetween (from, to, units, inclusivity) {
            var localFrom = isMoment(from) ? from : createLocal(from),
                localTo = isMoment(to) ? to : createLocal(to);
            if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
                return false;
            }
            inclusivity = inclusivity || '()';
            return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
                (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
        }

        function isSame (input, units) {
            var localInput = isMoment(input) ? input : createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() === localInput.valueOf();
            } else {
                inputMs = localInput.valueOf();
                return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
            }
        }

        function isSameOrAfter (input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore (input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff (input, units, asFloat) {
            var that,
                zoneDelta,
                output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            switch (units) {
                case 'year': output = monthDiff(this, that) / 12; break;
                case 'month': output = monthDiff(this, that); break;
                case 'quarter': output = monthDiff(this, that) / 3; break;
                case 'second': output = (this - that) / 1e3; break; // 1000
                case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
                case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
                case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
                case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
                default: output = this - that;
            }

            return asFloat ? output : absFloor(output);
        }

        function monthDiff (a, b) {
            // difference in months
            var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
                // b is in (anchor - 1 month, anchor + 1 month)
                anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2, adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            //check for negative zero, return zero if negative zero
            return -(wholeMonthDiff + adjust) || 0;
        }

        hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

        function toString () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function toISOString(keepOffset) {
            if (!this.isValid()) {
                return null;
            }
            var utc = keepOffset !== true;
            var m = utc ? this.clone().utc() : this;
            if (m.year() < 0 || m.year() > 9999) {
                return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
            }
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                if (utc) {
                    return this.toDate().toISOString();
                } else {
                    return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
                }
            }
            return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }

        /**
         * Return a human readable representation of a moment that can
         * also be evaluated to get a new moment which is the same
         *
         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
         */
        function inspect () {
            if (!this.isValid()) {
                return 'moment.invalid(/* ' + this._i + ' */)';
            }
            var func = 'moment';
            var zone = '';
            if (!this.isLocal()) {
                func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
                zone = 'Z';
            }
            var prefix = '[' + func + '("]';
            var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
            var datetime = '-MM-DD[T]HH:mm:ss.SSS';
            var suffix = zone + '[")]';

            return this.format(prefix + year + datetime + suffix);
        }

        function format (inputString) {
            if (!inputString) {
                inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
            }
            var output = formatMoment(this, inputString);
            return this.localeData().postformat(output);
        }

        function from (time, withoutSuffix) {
            if (this.isValid() &&
                    ((isMoment(time) && time.isValid()) ||
                     createLocal(time).isValid())) {
                return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow (withoutSuffix) {
            return this.from(createLocal(), withoutSuffix);
        }

        function to (time, withoutSuffix) {
            if (this.isValid() &&
                    ((isMoment(time) && time.isValid()) ||
                     createLocal(time).isValid())) {
                return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow (withoutSuffix) {
            return this.to(createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        );

        function localeData () {
            return this._locale;
        }

        function startOf (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                    /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                    /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                case 'date':
                    this.hours(0);
                    /* falls through */
                case 'hour':
                    this.minutes(0);
                    /* falls through */
                case 'minute':
                    this.seconds(0);
                    /* falls through */
                case 'second':
                    this.milliseconds(0);
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            }
            if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        }

        function endOf (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }

            // 'date' is an alias for 'day', so it should be considered as such.
            if (units === 'date') {
                units = 'day';
            }

            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        }

        function valueOf () {
            return this._d.valueOf() - ((this._offset || 0) * 60000);
        }

        function unix () {
            return Math.floor(this.valueOf() / 1000);
        }

        function toDate () {
            return new Date(this.valueOf());
        }

        function toArray () {
            var m = this;
            return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
        }

        function toObject () {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds()
            };
        }

        function toJSON () {
            // new Date(NaN).toJSON() === null
            return this.isValid() ? this.toISOString() : null;
        }

        function isValid$2 () {
            return isValid(this);
        }

        function parsingFlags () {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt () {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict
            };
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken (token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg',     'weekYear');
        addWeekYearFormatToken('ggggg',    'weekYear');
        addWeekYearFormatToken('GGGG',  'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PRIORITY

        addUnitPriority('weekYear', 1);
        addUnitPriority('isoWeekYear', 1);


        // PARSING

        addRegexToken('G',      matchSigned);
        addRegexToken('g',      matchSigned);
        addRegexToken('GG',     match1to2, match2);
        addRegexToken('gg',     match1to2, match2);
        addRegexToken('GGGG',   match1to4, match4);
        addRegexToken('gggg',   match1to4, match4);
        addRegexToken('GGGGG',  match1to6, match6);
        addRegexToken('ggggg',  match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear (input) {
            return getSetWeekYearHelper.call(this,
                    input,
                    this.week(),
                    this.weekday(),
                    this.localeData()._week.dow,
                    this.localeData()._week.doy);
        }

        function getSetISOWeekYear (input) {
            return getSetWeekYearHelper.call(this,
                    input, this.isoWeek(), this.isoWeekday(), 1, 4);
        }

        function getISOWeeksInYear () {
            return weeksInYear(this.year(), 1, 4);
        }

        function getWeeksInYear () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PRIORITY

        addUnitPriority('quarter', 7);

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PRIORITY
        addUnitPriority('date', 9);

        // PARSING

        addRegexToken('D',  match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            // TODO: Remove "ordinalParse" fallback in next major release.
            return isStrict ?
              (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
              locale._dayOfMonthOrdinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0]);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PRIORITY
        addUnitPriority('dayOfYear', 4);

        // PARSING

        addRegexToken('DDD',  match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear (input) {
            var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        }

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PRIORITY

        addUnitPriority('minute', 14);

        // PARSING

        addRegexToken('m',  match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PRIORITY

        addUnitPriority('second', 15);

        // PARSING

        addRegexToken('s',  match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });


        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PRIORITY

        addUnitPriority('millisecond', 16);

        // PARSING

        addRegexToken('S',    match1to3, match1);
        addRegexToken('SS',   match1to3, match2);
        addRegexToken('SSS',  match1to3, match3);

        var token;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }
        // MOMENTS

        var getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z',  0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr () {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var proto = Moment.prototype;

        proto.add               = add;
        proto.calendar          = calendar$1;
        proto.clone             = clone;
        proto.diff              = diff;
        proto.endOf             = endOf;
        proto.format            = format;
        proto.from              = from;
        proto.fromNow           = fromNow;
        proto.to                = to;
        proto.toNow             = toNow;
        proto.get               = stringGet;
        proto.invalidAt         = invalidAt;
        proto.isAfter           = isAfter;
        proto.isBefore          = isBefore;
        proto.isBetween         = isBetween;
        proto.isSame            = isSame;
        proto.isSameOrAfter     = isSameOrAfter;
        proto.isSameOrBefore    = isSameOrBefore;
        proto.isValid           = isValid$2;
        proto.lang              = lang;
        proto.locale            = locale;
        proto.localeData        = localeData;
        proto.max               = prototypeMax;
        proto.min               = prototypeMin;
        proto.parsingFlags      = parsingFlags;
        proto.set               = stringSet;
        proto.startOf           = startOf;
        proto.subtract          = subtract;
        proto.toArray           = toArray;
        proto.toObject          = toObject;
        proto.toDate            = toDate;
        proto.toISOString       = toISOString;
        proto.inspect           = inspect;
        proto.toJSON            = toJSON;
        proto.toString          = toString;
        proto.unix              = unix;
        proto.valueOf           = valueOf;
        proto.creationData      = creationData;
        proto.year       = getSetYear;
        proto.isLeapYear = getIsLeapYear;
        proto.weekYear    = getSetWeekYear;
        proto.isoWeekYear = getSetISOWeekYear;
        proto.quarter = proto.quarters = getSetQuarter;
        proto.month       = getSetMonth;
        proto.daysInMonth = getDaysInMonth;
        proto.week           = proto.weeks        = getSetWeek;
        proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
        proto.weeksInYear    = getWeeksInYear;
        proto.isoWeeksInYear = getISOWeeksInYear;
        proto.date       = getSetDayOfMonth;
        proto.day        = proto.days             = getSetDayOfWeek;
        proto.weekday    = getSetLocaleDayOfWeek;
        proto.isoWeekday = getSetISODayOfWeek;
        proto.dayOfYear  = getSetDayOfYear;
        proto.hour = proto.hours = getSetHour;
        proto.minute = proto.minutes = getSetMinute;
        proto.second = proto.seconds = getSetSecond;
        proto.millisecond = proto.milliseconds = getSetMillisecond;
        proto.utcOffset            = getSetOffset;
        proto.utc                  = setOffsetToUTC;
        proto.local                = setOffsetToLocal;
        proto.parseZone            = setOffsetToParsedOffset;
        proto.hasAlignedHourOffset = hasAlignedHourOffset;
        proto.isDST                = isDaylightSavingTime;
        proto.isLocal              = isLocal;
        proto.isUtcOffset          = isUtcOffset;
        proto.isUtc                = isUtc;
        proto.isUTC                = isUtc;
        proto.zoneAbbr = getZoneAbbr;
        proto.zoneName = getZoneName;
        proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
        proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
        proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
        proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
        proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

        function createUnix (input) {
            return createLocal(input * 1000);
        }

        function createInZone () {
            return createLocal.apply(null, arguments).parseZone();
        }

        function preParsePostFormat (string) {
            return string;
        }

        var proto$1 = Locale.prototype;

        proto$1.calendar        = calendar;
        proto$1.longDateFormat  = longDateFormat;
        proto$1.invalidDate     = invalidDate;
        proto$1.ordinal         = ordinal;
        proto$1.preparse        = preParsePostFormat;
        proto$1.postformat      = preParsePostFormat;
        proto$1.relativeTime    = relativeTime;
        proto$1.pastFuture      = pastFuture;
        proto$1.set             = set;

        proto$1.months            =        localeMonths;
        proto$1.monthsShort       =        localeMonthsShort;
        proto$1.monthsParse       =        localeMonthsParse;
        proto$1.monthsRegex       = monthsRegex;
        proto$1.monthsShortRegex  = monthsShortRegex;
        proto$1.week = localeWeek;
        proto$1.firstDayOfYear = localeFirstDayOfYear;
        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

        proto$1.weekdays       =        localeWeekdays;
        proto$1.weekdaysMin    =        localeWeekdaysMin;
        proto$1.weekdaysShort  =        localeWeekdaysShort;
        proto$1.weekdaysParse  =        localeWeekdaysParse;

        proto$1.weekdaysRegex       =        weekdaysRegex;
        proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
        proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

        proto$1.isPM = localeIsPM;
        proto$1.meridiem = localeMeridiem;

        function get$1 (format, index, field, setter) {
            var locale = getLocale();
            var utc = createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function listMonthsImpl (format, index, field) {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return get$1(format, index, field, 'month');
            }

            var i;
            var out = [];
            for (i = 0; i < 12; i++) {
                out[i] = get$1(format, i, field, 'month');
            }
            return out;
        }

        // ()
        // (5)
        // (fmt, 5)
        // (fmt)
        // (true)
        // (true, 5)
        // (true, fmt, 5)
        // (true, fmt)
        function listWeekdaysImpl (localeSorted, format, index, field) {
            if (typeof localeSorted === 'boolean') {
                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            } else {
                format = localeSorted;
                index = format;
                localeSorted = false;

                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            }

            var locale = getLocale(),
                shift = localeSorted ? locale._week.dow : 0;

            if (index != null) {
                return get$1(format, (index + shift) % 7, field, 'day');
            }

            var i;
            var out = [];
            for (i = 0; i < 7; i++) {
                out[i] = get$1(format, (i + shift) % 7, field, 'day');
            }
            return out;
        }

        function listMonths (format, index) {
            return listMonthsImpl(format, index, 'months');
        }

        function listMonthsShort (format, index) {
            return listMonthsImpl(format, index, 'monthsShort');
        }

        function listWeekdays (localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
        }

        function listWeekdaysShort (localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
        }

        function listWeekdaysMin (localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
        }

        getSetGlobalLocale('en', {
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal : function (number) {
                var b = number % 10,
                    output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
                return number + output;
            }
        });

        // Side effect imports

        hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
        hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

        var mathAbs = Math.abs;

        function abs () {
            var data           = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days         = mathAbs(this._days);
            this._months       = mathAbs(this._months);

            data.milliseconds  = mathAbs(data.milliseconds);
            data.seconds       = mathAbs(data.seconds);
            data.minutes       = mathAbs(data.minutes);
            data.hours         = mathAbs(data.hours);
            data.months        = mathAbs(data.months);
            data.years         = mathAbs(data.years);

            return this;
        }

        function addSubtract$1 (duration, input, value, direction) {
            var other = createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days         += direction * other._days;
            duration._months       += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function add$1 (input, value) {
            return addSubtract$1(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function subtract$1 (input, value) {
            return addSubtract$1(this, input, value, -1);
        }

        function absCeil (number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble () {
            var milliseconds = this._milliseconds;
            var days         = this._days;
            var months       = this._months;
            var data         = this._data;
            var seconds, minutes, hours, years, monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                    (milliseconds <= 0 && days <= 0 && months <= 0))) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds           = absFloor(milliseconds / 1000);
            data.seconds      = seconds % 60;

            minutes           = absFloor(seconds / 60);
            data.minutes      = minutes % 60;

            hours             = absFloor(minutes / 60);
            data.hours        = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days   = days;
            data.months = months;
            data.years  = years;

            return this;
        }

        function daysToMonths (days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return days * 4800 / 146097;
        }

        function monthsToDays (months) {
            // the reverse of daysToMonths
            return months * 146097 / 4800;
        }

        function as (units) {
            if (!this.isValid()) {
                return NaN;
            }
            var days;
            var months;
            var milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days   = this._days   + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week'   : return days / 7     + milliseconds / 6048e5;
                    case 'day'    : return days         + milliseconds / 864e5;
                    case 'hour'   : return days * 24    + milliseconds / 36e5;
                    case 'minute' : return days * 1440  + milliseconds / 6e4;
                    case 'second' : return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function valueOf$1 () {
            if (!this.isValid()) {
                return NaN;
            }
            return (
                this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6
            );
        }

        function makeAs (alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms');
        var asSeconds      = makeAs('s');
        var asMinutes      = makeAs('m');
        var asHours        = makeAs('h');
        var asDays         = makeAs('d');
        var asWeeks        = makeAs('w');
        var asMonths       = makeAs('M');
        var asYears        = makeAs('y');

        function clone$1 () {
            return createDuration(this);
        }

        function get$2 (units) {
            units = normalizeUnits(units);
            return this.isValid() ? this[units + 's']() : NaN;
        }

        function makeGetter(name) {
            return function () {
                return this.isValid() ? this._data[name] : NaN;
            };
        }

        var milliseconds = makeGetter('milliseconds');
        var seconds      = makeGetter('seconds');
        var minutes      = makeGetter('minutes');
        var hours        = makeGetter('hours');
        var days         = makeGetter('days');
        var months       = makeGetter('months');
        var years        = makeGetter('years');

        function weeks () {
            return absFloor(this.days() / 7);
        }

        var round = Math.round;
        var thresholds = {
            ss: 44,         // a few seconds to seconds
            s : 45,         // seconds to minute
            m : 45,         // minutes to hour
            h : 22,         // hours to day
            d : 26,         // days to month
            M : 11          // months to year
        };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
            var duration = createDuration(posNegDuration).abs();
            var seconds  = round(duration.as('s'));
            var minutes  = round(duration.as('m'));
            var hours    = round(duration.as('h'));
            var days     = round(duration.as('d'));
            var months   = round(duration.as('M'));
            var years    = round(duration.as('y'));

            var a = seconds <= thresholds.ss && ['s', seconds]  ||
                    seconds < thresholds.s   && ['ss', seconds] ||
                    minutes <= 1             && ['m']           ||
                    minutes < thresholds.m   && ['mm', minutes] ||
                    hours   <= 1             && ['h']           ||
                    hours   < thresholds.h   && ['hh', hours]   ||
                    days    <= 1             && ['d']           ||
                    days    < thresholds.d   && ['dd', days]    ||
                    months  <= 1             && ['M']           ||
                    months  < thresholds.M   && ['MM', months]  ||
                    years   <= 1             && ['y']           || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set the rounding function for relative time strings
        function getSetRelativeTimeRounding (roundingFunction) {
            if (roundingFunction === undefined) {
                return round;
            }
            if (typeof(roundingFunction) === 'function') {
                round = roundingFunction;
                return true;
            }
            return false;
        }

        // This function allows you to set a threshold for relative time strings
        function getSetRelativeTimeThreshold (threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            if (threshold === 's') {
                thresholds.ss = limit - 1;
            }
            return true;
        }

        function humanize (withSuffix) {
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var locale = this.localeData();
            var output = relativeTime$1(this, !withSuffix, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var abs$1 = Math.abs;

        function sign(x) {
            return ((x > 0) - (x < 0)) || +x;
        }

        function toISOString$1() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var seconds = abs$1(this._milliseconds) / 1000;
            var days         = abs$1(this._days);
            var months       = abs$1(this._months);
            var minutes, hours, years;

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes           = absFloor(seconds / 60);
            hours             = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years  = absFloor(months / 12);
            months %= 12;


            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var Y = years;
            var M = months;
            var D = days;
            var h = hours;
            var m = minutes;
            var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
            var total = this.asSeconds();

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            var totalSign = total < 0 ? '-' : '';
            var ymSign = sign(this._months) !== sign(total) ? '-' : '';
            var daysSign = sign(this._days) !== sign(total) ? '-' : '';
            var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

            return totalSign + 'P' +
                (Y ? ymSign + Y + 'Y' : '') +
                (M ? ymSign + M + 'M' : '') +
                (D ? daysSign + D + 'D' : '') +
                ((h || m || s) ? 'T' : '') +
                (h ? hmsSign + h + 'H' : '') +
                (m ? hmsSign + m + 'M' : '') +
                (s ? hmsSign + s + 'S' : '');
        }

        var proto$2 = Duration.prototype;

        proto$2.isValid        = isValid$1;
        proto$2.abs            = abs;
        proto$2.add            = add$1;
        proto$2.subtract       = subtract$1;
        proto$2.as             = as;
        proto$2.asMilliseconds = asMilliseconds;
        proto$2.asSeconds      = asSeconds;
        proto$2.asMinutes      = asMinutes;
        proto$2.asHours        = asHours;
        proto$2.asDays         = asDays;
        proto$2.asWeeks        = asWeeks;
        proto$2.asMonths       = asMonths;
        proto$2.asYears        = asYears;
        proto$2.valueOf        = valueOf$1;
        proto$2._bubble        = bubble;
        proto$2.clone          = clone$1;
        proto$2.get            = get$2;
        proto$2.milliseconds   = milliseconds;
        proto$2.seconds        = seconds;
        proto$2.minutes        = minutes;
        proto$2.hours          = hours;
        proto$2.days           = days;
        proto$2.weeks          = weeks;
        proto$2.months         = months;
        proto$2.years          = years;
        proto$2.humanize       = humanize;
        proto$2.toISOString    = toISOString$1;
        proto$2.toString       = toISOString$1;
        proto$2.toJSON         = toISOString$1;
        proto$2.locale         = locale;
        proto$2.localeData     = localeData;

        proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
        proto$2.lang = lang;

        // Side effect imports

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input, 10) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        // Side effect imports


        hooks.version = '2.23.0';

        setHookCallback(createLocal);

        hooks.fn                    = proto;
        hooks.min                   = min;
        hooks.max                   = max;
        hooks.now                   = now;
        hooks.utc                   = createUTC;
        hooks.unix                  = createUnix;
        hooks.months                = listMonths;
        hooks.isDate                = isDate;
        hooks.locale                = getSetGlobalLocale;
        hooks.invalid               = createInvalid;
        hooks.duration              = createDuration;
        hooks.isMoment              = isMoment;
        hooks.weekdays              = listWeekdays;
        hooks.parseZone             = createInZone;
        hooks.localeData            = getLocale;
        hooks.isDuration            = isDuration;
        hooks.monthsShort           = listMonthsShort;
        hooks.weekdaysMin           = listWeekdaysMin;
        hooks.defineLocale          = defineLocale;
        hooks.updateLocale          = updateLocale;
        hooks.locales               = listLocales;
        hooks.weekdaysShort         = listWeekdaysShort;
        hooks.normalizeUnits        = normalizeUnits;
        hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
        hooks.calendarFormat        = getCalendarFormat;
        hooks.prototype             = proto;

        // currently HTML5 input type only supports 24-hour formats
        hooks.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
            DATE: 'YYYY-MM-DD',                             // <input type="date" />
            TIME: 'HH:mm',                                  // <input type="time" />
            TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
            TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
            WEEK: 'GGGG-[W]WW',                             // <input type="week" />
            MONTH: 'YYYY-MM'                                // <input type="month" />
        };

        return hooks;

    })));
    });

    var pikaday = createCommonjsModule(function (module, exports) {
    /*!
     * Pikaday
     *
     * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
     */

    (function (root, factory)
    {

        var moment$$1;
        {
            // CommonJS module
            // Load moment.js as an optional dependency
            try { moment$$1 = moment; } catch (e) {}
            module.exports = factory(moment$$1);
        }
    }(commonjsGlobal, function (moment$$1)
    {

        /**
         * feature detection and helper functions
         */
        var hasMoment = typeof moment$$1 === 'function',

        hasEventListeners = !!window.addEventListener,

        document = window.document,

        sto = window.setTimeout,

        addEvent = function(el, e, callback, capture)
        {
            if (hasEventListeners) {
                el.addEventListener(e, callback, !!capture);
            } else {
                el.attachEvent('on' + e, callback);
            }
        },

        removeEvent = function(el, e, callback, capture)
        {
            if (hasEventListeners) {
                el.removeEventListener(e, callback, !!capture);
            } else {
                el.detachEvent('on' + e, callback);
            }
        },

        fireEvent = function(el, eventName, data)
        {
            var ev;

            if (document.createEvent) {
                ev = document.createEvent('HTMLEvents');
                ev.initEvent(eventName, true, false);
                ev = extend(ev, data);
                el.dispatchEvent(ev);
            } else if (document.createEventObject) {
                ev = document.createEventObject();
                ev = extend(ev, data);
                el.fireEvent('on' + eventName, ev);
            }
        },

        trim = function(str)
        {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
        },

        hasClass = function(el, cn)
        {
            return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
        },

        addClass = function(el, cn)
        {
            if (!hasClass(el, cn)) {
                el.className = (el.className === '') ? cn : el.className + ' ' + cn;
            }
        },

        removeClass = function(el, cn)
        {
            el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
        },

        isArray = function(obj)
        {
            return (/Array/).test(Object.prototype.toString.call(obj));
        },

        isDate = function(obj)
        {
            return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
        },

        isWeekend = function(date)
        {
            var day = date.getDay();
            return day === 0 || day === 6;
        },

        isLeapYear = function(year)
        {
            // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        },

        getDaysInMonth = function(year, month)
        {
            return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },

        setToStartOfDay = function(date)
        {
            if (isDate(date)) date.setHours(0,0,0,0);
        },

        compareDates = function(a,b)
        {
            // weak date comparison (use setToStartOfDay(date) to ensure correct result)
            return a.getTime() === b.getTime();
        },

        extend = function(to, from, overwrite)
        {
            var prop, hasProp;
            for (prop in from) {
                hasProp = to[prop] !== undefined;
                if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                    if (isDate(from[prop])) {
                        if (overwrite) {
                            to[prop] = new Date(from[prop].getTime());
                        }
                    }
                    else if (isArray(from[prop])) {
                        if (overwrite) {
                            to[prop] = from[prop].slice(0);
                        }
                    } else {
                        to[prop] = extend({}, from[prop], overwrite);
                    }
                } else if (overwrite || !hasProp) {
                    to[prop] = from[prop];
                }
            }
            return to;
        },

        adjustCalendar = function(calendar) {
            if (calendar.month < 0) {
                calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
                calendar.month += 12;
            }
            if (calendar.month > 11) {
                calendar.year += Math.floor(Math.abs(calendar.month)/12);
                calendar.month -= 12;
            }
            return calendar;
        },

        /**
         * defaults and localisation
         */
        defaults = {

            // bind the picker to a form field
            field: null,

            // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
            bound: undefined,

            // position of the datepicker, relative to the field (default to bottom & left)
            // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
            position: 'bottom left',

            // automatically fit in the viewport even if it means repositioning from the position option
            reposition: true,

            // the default output format for `.toString()` and `field` value
            format: 'YYYY-MM-DD',

            // the initial date to view when first opened
            defaultDate: null,

            // make the `defaultDate` the initial selected value
            setDefaultDate: false,

            // first day of week (0: Sunday, 1: Monday etc)
            firstDay: 0,

            // the minimum/earliest date that can be selected
            minDate: null,
            // the maximum/latest date that can be selected
            maxDate: null,

            // number of years either side, or array of upper/lower range
            yearRange: 10,

            // show week numbers at head of row
            showWeekNumber: false,

            // used internally (don't config outside)
            minYear: 0,
            maxYear: 9999,
            minMonth: undefined,
            maxMonth: undefined,

            startRange: null,
            endRange: null,

            isRTL: false,

            // Additional text to append to the year in the calendar title
            yearSuffix: '',

            // Render the month after year in the calendar title
            showMonthAfterYear: false,

            // how many months are visible
            numberOfMonths: 1,

            // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
            // only used for the first display or when a selected date is not visible
            mainCalendar: 'left',

            // Specify a DOM element to render the calendar in
            container: undefined,

            // internationalization
            i18n: {
                previousMonth : 'Previous Month',
                nextMonth     : 'Next Month',
                months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
                weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            },

            // Theme Classname
            theme: null,

            // callback function
            onSelect: null,
            onOpen: null,
            onClose: null,
            onDraw: null
        },


        /**
         * templating functions to abstract HTML rendering
         */
        renderDayName = function(opts, day, abbr)
        {
            day += opts.firstDay;
            while (day >= 7) {
                day -= 7;
            }
            return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
        },

        renderDay = function(opts)
        {
            if (opts.isEmpty) {
                return '<td class="is-empty"></td>';
            }
            var arr = [];
            if (opts.isDisabled) {
                arr.push('is-disabled');
            }
            if (opts.isToday) {
                arr.push('is-today');
            }
            if (opts.isSelected) {
                arr.push('is-selected');
            }
            if (opts.isInRange) {
                arr.push('is-inrange');
            }
            if (opts.isStartRange) {
                arr.push('is-startrange');
            }
            if (opts.isEndRange) {
                arr.push('is-endrange');
            }
            return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '">' +
                     '<button class="pika-button pika-day" type="button" ' +
                        'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
                            opts.day +
                     '</button>' +
                   '</td>';
        },

        renderWeek = function (d, m, y) {
            // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
            var onejan = new Date(y, 0, 1),
                weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay()+1)/7);
            return '<td class="pika-week">' + weekNum + '</td>';
        },

        renderRow = function(days, isRTL)
        {
            return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
        },

        renderBody = function(rows)
        {
            return '<tbody>' + rows.join('') + '</tbody>';
        },

        renderHead = function(opts)
        {
            var i, arr = [];
            if (opts.showWeekNumber) {
                arr.push('<th></th>');
            }
            for (i = 0; i < 7; i++) {
                arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
            }
            return '<thead>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</thead>';
        },

        renderTitle = function(instance, c, year, month, refYear)
        {
            var i, j, arr,
                opts = instance._o,
                isMinYear = year === opts.minYear,
                isMaxYear = year === opts.maxYear,
                html = '<div class="pika-title">',
                monthHtml,
                yearHtml,
                prev = true,
                next = true;

            for (arr = [], i = 0; i < 12; i++) {
                arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
                    (i === month ? ' selected': '') +
                    ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled' : '') + '>' +
                    opts.i18n.months[i] + '</option>');
            }
            monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

            if (isArray(opts.yearRange)) {
                i = opts.yearRange[0];
                j = opts.yearRange[1] + 1;
            } else {
                i = year - opts.yearRange;
                j = 1 + year + opts.yearRange;
            }

            for (arr = []; i < j && i <= opts.maxYear; i++) {
                if (i >= opts.minYear) {
                    arr.push('<option value="' + i + '"' + (i === year ? ' selected': '') + '>' + (i) + '</option>');
                }
            }
            yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

            if (opts.showMonthAfterYear) {
                html += yearHtml + monthHtml;
            } else {
                html += monthHtml + yearHtml;
            }

            if (isMinYear && (month === 0 || opts.minMonth >= month)) {
                prev = false;
            }

            if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
                next = false;
            }

            if (c === 0) {
                html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
            }
            if (c === (instance._o.numberOfMonths - 1) ) {
                html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
            }

            return html += '</div>';
        },

        renderTable = function(opts, data)
        {
            return '<table cellpadding="0" cellspacing="0" class="pika-table">' + renderHead(opts) + renderBody(data) + '</table>';
        },


        /**
         * Pikaday constructor
         */
        Pikaday = function(options)
        {
            var self = this,
                opts = self.config(options);

            self._onMouseDown = function(e)
            {
                if (!self._v) {
                    return;
                }
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }

                if (!hasClass(target, 'is-disabled')) {
                    if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty')) {
                        self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                        if (opts.bound) {
                            sto(function() {
                                self.hide();
                                if (opts.field) {
                                    opts.field.blur();
                                }
                            }, 100);
                        }
                    }
                    else if (hasClass(target, 'pika-prev')) {
                        self.prevMonth();
                    }
                    else if (hasClass(target, 'pika-next')) {
                        self.nextMonth();
                    }
                }
                if (!hasClass(target, 'pika-select')) {
                    // if this is touch event prevent mouse events emulation
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                        return false;
                    }
                } else {
                    self._c = true;
                }
            };

            self._onChange = function(e)
            {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }
                if (hasClass(target, 'pika-select-month')) {
                    self.gotoMonth(target.value);
                }
                else if (hasClass(target, 'pika-select-year')) {
                    self.gotoYear(target.value);
                }
            };

            self._onInputChange = function(e)
            {
                var date;

                if (e.firedBy === self) {
                    return;
                }
                if (hasMoment) {
                    date = moment$$1(opts.field.value, opts.format);
                    date = (date && date.isValid()) ? date.toDate() : null;
                }
                else {
                    date = new Date(Date.parse(opts.field.value));
                }
                if (isDate(date)) {
                  self.setDate(date);
                }
                if (!self._v) {
                    self.show();
                }
            };

            self._onInputFocus = function()
            {
                self.show();
            };

            self._onInputClick = function()
            {
                self.show();
            };

            self._onInputBlur = function()
            {
                // IE allows pika div to gain focus; catch blur the input field
                var pEl = document.activeElement;
                do {
                    if (hasClass(pEl, 'pika-single')) {
                        return;
                    }
                }
                while ((pEl = pEl.parentNode));

                if (!self._c) {
                    self._b = sto(function() {
                        self.hide();
                    }, 50);
                }
                self._c = false;
            };

            self._onClick = function(e)
            {
                e = e || window.event;
                var target = e.target || e.srcElement,
                    pEl = target;
                if (!target) {
                    return;
                }
                if (!hasEventListeners && hasClass(target, 'pika-select')) {
                    if (!target.onchange) {
                        target.setAttribute('onchange', 'return;');
                        addEvent(target, 'change', self._onChange);
                    }
                }
                do {
                    if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                        return;
                    }
                }
                while ((pEl = pEl.parentNode));
                if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                    self.hide();
                }
            };

            self.el = document.createElement('div');
            self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

            addEvent(self.el, 'mousedown', self._onMouseDown, true);
            addEvent(self.el, 'touchend', self._onMouseDown, true);
            addEvent(self.el, 'change', self._onChange);

            if (opts.field) {
                if (opts.container) {
                    opts.container.appendChild(self.el);
                } else if (opts.bound) {
                    document.body.appendChild(self.el);
                } else {
                    opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
                }
                addEvent(opts.field, 'change', self._onInputChange);

                if (!opts.defaultDate) {
                    if (hasMoment && opts.field.value) {
                        opts.defaultDate = moment$$1(opts.field.value, opts.format).toDate();
                    } else {
                        opts.defaultDate = new Date(Date.parse(opts.field.value));
                    }
                    opts.setDefaultDate = true;
                }
            }

            var defDate = opts.defaultDate;

            if (isDate(defDate)) {
                if (opts.setDefaultDate) {
                    self.setDate(defDate, true);
                } else {
                    self.gotoDate(defDate);
                }
            } else {
                self.gotoDate(new Date());
            }

            if (opts.bound) {
                this.hide();
                self.el.className += ' is-bound';
                addEvent(opts.trigger, 'click', self._onInputClick);
                addEvent(opts.trigger, 'focus', self._onInputFocus);
                addEvent(opts.trigger, 'blur', self._onInputBlur);
            } else {
                this.show();
            }
        };


        /**
         * public Pikaday API
         */
        Pikaday.prototype = {


            /**
             * configure functionality
             */
            config: function(options)
            {
                if (!this._o) {
                    this._o = extend({}, defaults, true);
                }

                var opts = extend(this._o, options, true);

                opts.isRTL = !!opts.isRTL;

                opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

                opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

                opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

                opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

                opts.disableWeekends = !!opts.disableWeekends;

                opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

                var nom = parseInt(opts.numberOfMonths, 10) || 1;
                opts.numberOfMonths = nom > 4 ? 4 : nom;

                if (!isDate(opts.minDate)) {
                    opts.minDate = false;
                }
                if (!isDate(opts.maxDate)) {
                    opts.maxDate = false;
                }
                if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                    opts.maxDate = opts.minDate = false;
                }
                if (opts.minDate) {
                    this.setMinDate(opts.minDate);
                }
                if (opts.maxDate) {
                    this.setMaxDate(opts.maxDate);
                }

                if (isArray(opts.yearRange)) {
                    var fallback = new Date().getFullYear() - 10;
                    opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                    opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
                } else {
                    opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                    if (opts.yearRange > 100) {
                        opts.yearRange = 100;
                    }
                }

                return opts;
            },

            /**
             * return a formatted string of the current selection (using Moment.js if available)
             */
            toString: function(format)
            {
                return !isDate(this._d) ? '' : hasMoment ? moment$$1(this._d).format(format || this._o.format) : this._d.toDateString();
            },

            /**
             * return a Moment.js object of the current selection (if available)
             */
            getMoment: function()
            {
                return hasMoment ? moment$$1(this._d) : null;
            },

            /**
             * set the current selection from a Moment.js object (if available)
             */
            setMoment: function(date, preventOnSelect)
            {
                if (hasMoment && moment$$1.isMoment(date)) {
                    this.setDate(date.toDate(), preventOnSelect);
                }
            },

            /**
             * return a Date object of the current selection
             */
            getDate: function()
            {
                return isDate(this._d) ? new Date(this._d.getTime()) : null;
            },

            /**
             * set the current selection
             */
            setDate: function(date, preventOnSelect)
            {
                if (!date) {
                    this._d = null;

                    if (this._o.field) {
                        this._o.field.value = '';
                        fireEvent(this._o.field, 'change', { firedBy: this });
                    }

                    return this.draw();
                }
                if (typeof date === 'string') {
                    date = new Date(Date.parse(date));
                }
                if (!isDate(date)) {
                    return;
                }

                var min = this._o.minDate,
                    max = this._o.maxDate;

                if (isDate(min) && date < min) {
                    date = min;
                } else if (isDate(max) && date > max) {
                    date = max;
                }

                this._d = new Date(date.getTime());
                setToStartOfDay(this._d);
                this.gotoDate(this._d);

                if (this._o.field) {
                    this._o.field.value = this.toString();
                    fireEvent(this._o.field, 'change', { firedBy: this });
                }
                if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                    this._o.onSelect.call(this, this.getDate());
                }
            },

            /**
             * change view to a specific date
             */
            gotoDate: function(date)
            {
                var newCalendar = true;

                if (!isDate(date)) {
                    return;
                }

                if (this.calendars) {
                    var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                        lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
                        visibleDate = date.getTime();
                    // get the end of the month
                    lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
                    lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
                    newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
                }

                if (newCalendar) {
                    this.calendars = [{
                        month: date.getMonth(),
                        year: date.getFullYear()
                    }];
                    if (this._o.mainCalendar === 'right') {
                        this.calendars[0].month += 1 - this._o.numberOfMonths;
                    }
                }

                this.adjustCalendars();
            },

            adjustCalendars: function() {
                var this$1 = this;

                this.calendars[0] = adjustCalendar(this.calendars[0]);
                for (var c = 1; c < this._o.numberOfMonths; c++) {
                    this$1.calendars[c] = adjustCalendar({
                        month: this$1.calendars[0].month + c,
                        year: this$1.calendars[0].year
                    });
                }
                this.draw();
            },

            gotoToday: function()
            {
                this.gotoDate(new Date());
            },

            /**
             * change view to a specific month (zero-index, e.g. 0: January)
             */
            gotoMonth: function(month)
            {
                if (!isNaN(month)) {
                    this.calendars[0].month = parseInt(month, 10);
                    this.adjustCalendars();
                }
            },

            nextMonth: function()
            {
                this.calendars[0].month++;
                this.adjustCalendars();
            },

            prevMonth: function()
            {
                this.calendars[0].month--;
                this.adjustCalendars();
            },

            /**
             * change view to a specific full year (e.g. "2012")
             */
            gotoYear: function(year)
            {
                if (!isNaN(year)) {
                    this.calendars[0].year = parseInt(year, 10);
                    this.adjustCalendars();
                }
            },

            /**
             * change the minDate
             */
            setMinDate: function(value)
            {
                setToStartOfDay(value);
                this._o.minDate = value;
                this._o.minYear  = value.getFullYear();
                this._o.minMonth = value.getMonth();
                this.draw();
            },

            /**
             * change the maxDate
             */
            setMaxDate: function(value)
            {
                setToStartOfDay(value);
                this._o.maxDate = value;
                this._o.maxYear = value.getFullYear();
                this._o.maxMonth = value.getMonth();
                this.draw();
            },

            setStartRange: function(value)
            {
                this._o.startRange = value;
            },

            setEndRange: function(value)
            {
                this._o.endRange = value;
            },

            /**
             * refresh the HTML
             */
            draw: function(force)
            {
                var this$1 = this;

                if (!this._v && !force) {
                    return;
                }
                var opts = this._o,
                    minYear = opts.minYear,
                    maxYear = opts.maxYear,
                    minMonth = opts.minMonth,
                    maxMonth = opts.maxMonth,
                    html = '';

                if (this._y <= minYear) {
                    this._y = minYear;
                    if (!isNaN(minMonth) && this._m < minMonth) {
                        this._m = minMonth;
                    }
                }
                if (this._y >= maxYear) {
                    this._y = maxYear;
                    if (!isNaN(maxMonth) && this._m > maxMonth) {
                        this._m = maxMonth;
                    }
                }

                for (var c = 0; c < opts.numberOfMonths; c++) {
                    html += '<div class="pika-lendar">' + renderTitle(this$1, c, this$1.calendars[c].year, this$1.calendars[c].month, this$1.calendars[0].year) + this$1.render(this$1.calendars[c].year, this$1.calendars[c].month) + '</div>';
                }

                this.el.innerHTML = html;

                if (opts.bound) {
                    if(opts.field.type !== 'hidden') {
                        sto(function() {
                            opts.trigger.focus();
                        }, 1);
                    }
                }

                if (typeof this._o.onDraw === 'function') {
                    var self = this;
                    sto(function() {
                        self._o.onDraw.call(self);
                    }, 0);
                }
            },

            adjustPosition: function()
            {
                var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect;

                if (this._o.container) return;

                this.el.style.position = 'absolute';

                field = this._o.trigger;
                pEl = field;
                width = this.el.offsetWidth;
                height = this.el.offsetHeight;
                viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

                if (typeof field.getBoundingClientRect === 'function') {
                    clientRect = field.getBoundingClientRect();
                    left = clientRect.left + window.pageXOffset;
                    top = clientRect.bottom + window.pageYOffset;
                } else {
                    left = pEl.offsetLeft;
                    top  = pEl.offsetTop + pEl.offsetHeight;
                    while((pEl = pEl.offsetParent)) {
                        left += pEl.offsetLeft;
                        top  += pEl.offsetTop;
                    }
                }

                // default position is bottom & left
                if ((this._o.reposition && left + width > viewportWidth) ||
                    (
                        this._o.position.indexOf('right') > -1 &&
                        left - width + field.offsetWidth > 0
                    )
                ) {
                    left = left - width + field.offsetWidth;
                }
                if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                    (
                        this._o.position.indexOf('top') > -1 &&
                        top - height - field.offsetHeight > 0
                    )
                ) {
                    top = top - height - field.offsetHeight;
                }

                this.el.style.left = left + 'px';
                this.el.style.top = top + 'px';
            },

            /**
             * render HTML for a particular month
             */
            render: function(year, month)
            {
                var this$1 = this;

                var opts   = this._o,
                    now    = new Date(),
                    days   = getDaysInMonth(year, month),
                    before = new Date(year, month, 1).getDay(),
                    data   = [],
                    row    = [];
                setToStartOfDay(now);
                if (opts.firstDay > 0) {
                    before -= opts.firstDay;
                    if (before < 0) {
                        before += 7;
                    }
                }
                var cells = days + before,
                    after = cells;
                while(after > 7) {
                    after -= 7;
                }
                cells += 7 - after;
                for (var i = 0, r = 0; i < cells; i++)
                {
                    var day = new Date(year, month, 1 + (i - before)),
                        isSelected = isDate(this$1._d) ? compareDates(day, this$1._d) : false,
                        isToday = compareDates(day, now),
                        isEmpty = i < before || i >= (days + before),
                        isStartRange = opts.startRange && compareDates(opts.startRange, day),
                        isEndRange = opts.endRange && compareDates(opts.endRange, day),
                        isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
                        isDisabled = (opts.minDate && day < opts.minDate) ||
                                     (opts.maxDate && day > opts.maxDate) ||
                                     (opts.disableWeekends && isWeekend(day)) ||
                                     (opts.disableDayFn && opts.disableDayFn(day)),
                        dayConfig = {
                            day: 1 + (i - before),
                            month: month,
                            year: year,
                            isSelected: isSelected,
                            isToday: isToday,
                            isDisabled: isDisabled,
                            isEmpty: isEmpty,
                            isStartRange: isStartRange,
                            isEndRange: isEndRange,
                            isInRange: isInRange
                        };

                    row.push(renderDay(dayConfig));

                    if (++r === 7) {
                        if (opts.showWeekNumber) {
                            row.unshift(renderWeek(i - before, month, year));
                        }
                        data.push(renderRow(row, opts.isRTL));
                        row = [];
                        r = 0;
                    }
                }
                return renderTable(opts, data);
            },

            isVisible: function()
            {
                return this._v;
            },

            show: function()
            {
                if (!this._v) {
                    removeClass(this.el, 'is-hidden');
                    this._v = true;
                    this.draw();
                    if (this._o.bound) {
                        addEvent(document, 'click', this._onClick);
                        this.adjustPosition();
                    }
                    if (typeof this._o.onOpen === 'function') {
                        this._o.onOpen.call(this);
                    }
                }
            },

            hide: function()
            {
                var v = this._v;
                if (v !== false) {
                    if (this._o.bound) {
                        removeEvent(document, 'click', this._onClick);
                    }
                    this.el.style.position = 'static'; // reset
                    this.el.style.left = 'auto';
                    this.el.style.top = 'auto';
                    addClass(this.el, 'is-hidden');
                    this._v = false;
                    if (v !== undefined && typeof this._o.onClose === 'function') {
                        this._o.onClose.call(this);
                    }
                }
            },

            /**
             * GAME OVER
             */
            destroy: function()
            {
                this.hide();
                removeEvent(this.el, 'mousedown', this._onMouseDown, true);
                removeEvent(this.el, 'touchend', this._onMouseDown, true);
                removeEvent(this.el, 'change', this._onChange);
                if (this._o.field) {
                    removeEvent(this._o.field, 'change', this._onInputChange);
                    if (this._o.bound) {
                        removeEvent(this._o.trigger, 'click', this._onInputClick);
                        removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                        removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                    }
                }
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
            }

        };

        return Pikaday;

    }));
    });

    var mithril = createCommonjsModule(function (module) {
    (function (global, factory) { // eslint-disable-line
    	/* eslint-disable no-undef */
    	var m = factory(global);
    	/*	Set dependencies when no window for isomorphic compatibility */
    	if(typeof window === "undefined") {
    		m.deps({
    			document: typeof document !== "undefined" ? document : {},
    			location: typeof location !== "undefined" ? location : {},
    			clearTimeout: clearTimeout,
    			setTimeout: setTimeout
    		});
    	}
    	if (module != null && module.exports) {
    		module.exports = m;
    	} else {
    		global.m = m;
    	}
    	/* eslint-enable no-undef */
    })(typeof window !== "undefined" ? window : commonjsGlobal, function factory(global, undefined) { // eslint-disable-line

    	m.version = function () {
    		return "v0.2.8"
    	};

    	var hasOwn = {}.hasOwnProperty;
    	var type = {}.toString;

    	function isFunction(object) {
    		return typeof object === "function"
    	}

    	function isObject(object) {
    		return type.call(object) === "[object Object]"
    	}

    	function isString(object) {
    		return type.call(object) === "[object String]"
    	}

    	var isArray = Array.isArray || function (object) {
    		return type.call(object) === "[object Array]"
    	};

    	function noop() {}

    	var voidElements = {
    		AREA: 1,
    		BASE: 1,
    		BR: 1,
    		COL: 1,
    		COMMAND: 1,
    		EMBED: 1,
    		HR: 1,
    		IMG: 1,
    		INPUT: 1,
    		KEYGEN: 1,
    		LINK: 1,
    		META: 1,
    		PARAM: 1,
    		SOURCE: 1,
    		TRACK: 1,
    		WBR: 1
    	};

    	// caching commonly used variables
    	var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;

    	// self invoking function needed because of the way mocks work
    	function initialize(mock) {
    		$document = mock.document;
    		$location = mock.location;
    		$cancelAnimationFrame = mock.cancelAnimationFrame || mock.clearTimeout;
    		$requestAnimationFrame = mock.requestAnimationFrame || mock.setTimeout;
    	}

    	// testing API
    	m.deps = function (mock) {
    		initialize(global = mock || window);
    		return global
    	};

    	m.deps.factory = m.factory = factory;

    	m.deps(global);

    	/**
    	 * @typedef {String} Tag
    	 * A string that looks like -> div.classname#id[param=one][param2=two]
    	 * Which describes a DOM node
    	 */

    	function parseTagAttrs(cell, tag) {
    		var classes = [];
    		/* eslint-disable max-len */
    		var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
    		/* eslint-enable max-len */
    		var match;

    		while ((match = parser.exec(tag))) {
    			if (match[1] === "" && match[2]) {
    				cell.tag = match[2];
    			} else if (match[1] === "#") {
    				cell.attrs.id = match[2];
    			} else if (match[1] === ".") {
    				classes.push(match[2]);
    			} else if (match[3].charAt(0) === "[") { // #1195
    				var attrValue = match[6];
    				if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1");
    				if (match[4] === "class") classes.push(attrValue);
    				else cell.attrs[match[4]] = attrValue || true;
    			}
    		}

    		return classes
    	}

    	function getVirtualChildren(args, hasAttrs) {
    		var children = hasAttrs ? args.slice(1) : args;

    		if (children.length === 1 && isArray(children[0])) {
    			return children[0]
    		} else {
    			return children
    		}
    	}

    	function assignAttrs(target, attrs, classes) {
    		var classAttr = "class" in attrs ? "class" : "className";

    		for (var attrName in attrs) {
    			if (hasOwn.call(attrs, attrName)) {
    				if (attrName === classAttr &&
    						attrs[attrName] != null &&
    						attrs[attrName] !== "") {
    					classes.push(attrs[attrName]);
    					// create key in correct iteration order
    					target[attrName] = "";
    				} else {
    					target[attrName] = attrs[attrName];
    				}
    			}
    		}

    		if (classes.length) target[classAttr] = classes.join(" ");
    	}

    	/**
    	 *
    	 * @param {Tag} The DOM node tag
    	 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
    	 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array,
    	 *                      or splat (optional)
    	 */
    	function m(tag, pairs) {
    		var arguments$1 = arguments;

    		var args = [];

    		for (var i = 1, length = arguments.length; i < length; i++) {
    			args[i - 1] = arguments$1[i];
    		}

    		if (tag && isFunction(tag.view)) return parameterize(tag, args)

    		if (!isString(tag)) {
    			throw new Error("selector in m(selector, attrs, children) should " +
    				"be a string")
    		}

    		var hasAttrs = pairs != null && isObject(pairs) &&
    			!("tag" in pairs || "view" in pairs || "subtree" in pairs);

    		var attrs = hasAttrs ? pairs : {};
    		var cell = {
    			tag: "div",
    			attrs: {},
    			children: getVirtualChildren(args, hasAttrs)
    		};

    		assignAttrs(cell.attrs, attrs, parseTagAttrs(cell, tag));
    		return cell
    	}

    	function forEach(list, f) {
    		for (var i = 0; i < list.length && !f(list[i], i++);) {
    			// function called in condition
    		}
    	}

    	function forKeys(list, f) {
    		forEach(list, function (attrs, i) {
    			return (attrs = attrs && attrs.attrs) &&
    				attrs.key != null &&
    				f(attrs, i)
    		});
    	}
    	// This function was causing deopts in Chrome.
    	function dataToString(data) {
    		// data.toString() might throw or return null if data is the return
    		// value of Console.log in some versions of Firefox (behavior depends on
    		// version)
    		try {
    			if (typeof data !== "boolean" &&
    					data != null &&
    					data.toString() != null) return data
    		} catch (e) {
    			// silently ignore errors
    		}
    		return ""
    	}

    	// This function was causing deopts in Chrome.
    	function injectTextNode(parentElement, first, index, data) {
    		try {
    			insertNode(parentElement, first, index);
    			first.nodeValue = data;
    		} catch (e) {
    			// IE erroneously throws error when appending an empty text node
    			// after a null
    		}
    	}

    	function flatten(list) {
    		// recursively flatten array
    		for (var i = 0; i < list.length; i++) {
    			if (isArray(list[i])) {
    				list = list.concat.apply([], list);
    				// check current index again and flatten until there are no more
    				// nested arrays at that index
    				i--;
    			}
    		}
    		return list
    	}

    	function insertNode(parentElement, node, index) {
    		parentElement.insertBefore(node,
    			parentElement.childNodes[index] || null);
    	}

    	var DELETION = 1;
    	var INSERTION = 2;
    	var MOVE = 3;

    	function handleKeysDiffer(data, existing, cached, parentElement) {
    		forKeys(data, function (key, i) {
    			existing[key = key.key] = existing[key] ? {
    				action: MOVE,
    				index: i,
    				from: existing[key].index,
    				element: cached.nodes[existing[key].index] ||
    					$document.createElement("div")
    			} : {action: INSERTION, index: i};
    		});

    		var actions = [];
    		for (var prop in existing) {
    			if (hasOwn.call(existing, prop)) {
    				actions.push(existing[prop]);
    			}
    		}

    		var changes = actions.sort(sortChanges);
    		var newCached = new Array(cached.length);

    		newCached.nodes = cached.nodes.slice();

    		forEach(changes, function (change) {
    			var index = change.index;
    			if (change.action === DELETION) {
    				clear(cached[index].nodes, cached[index]);
    				newCached.splice(index, 1);
    			}
    			if (change.action === INSERTION) {
    				var dummy = $document.createElement("div");
    				dummy.key = data[index].attrs.key;
    				insertNode(parentElement, dummy, index);
    				newCached.splice(index, 0, {
    					attrs: {key: data[index].attrs.key},
    					nodes: [dummy]
    				});
    				newCached.nodes[index] = dummy;
    			}

    			if (change.action === MOVE) {
    				var changeElement = change.element;
    				var maybeChanged = parentElement.childNodes[index];
    				if (maybeChanged !== changeElement && changeElement !== null) {
    					parentElement.insertBefore(changeElement,
    						maybeChanged || null);
    				}
    				newCached[index] = cached[change.from];
    				newCached.nodes[index] = changeElement;
    			}
    		});

    		return newCached
    	}

    	function diffKeys(data, cached, existing, parentElement) {
    		var keysDiffer = data.length !== cached.length;

    		if (!keysDiffer) {
    			forKeys(data, function (attrs, i) {
    				var cachedCell = cached[i];
    				return keysDiffer = cachedCell &&
    					cachedCell.attrs &&
    					cachedCell.attrs.key !== attrs.key
    			});
    		}

    		if (keysDiffer) {
    			return handleKeysDiffer(data, existing, cached, parentElement)
    		} else {
    			return cached
    		}
    	}

    	function diffArray(data, cached, nodes) {
    		// diff the array itself

    		// update the list of DOM nodes by collecting the nodes from each item
    		forEach(data, function (_, i) {
    			if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes);
    		});
    		// remove items from the end of the array if the new array is shorter
    		// than the old one. if errors ever happen here, the issue is most
    		// likely a bug in the construction of the `cached` data structure
    		// somewhere earlier in the program
    		forEach(cached.nodes, function (node, i) {
    			if (node.parentNode != null && nodes.indexOf(node) < 0) {
    				clear([node], [cached[i]]);
    			}
    		});

    		if (data.length < cached.length) cached.length = data.length;
    		cached.nodes = nodes;
    	}

    	function buildArrayKeys(data) {
    		var guid = 0;
    		forKeys(data, function () {
    			forEach(data, function (attrs) {
    				if ((attrs = attrs && attrs.attrs) && attrs.key == null) {
    					attrs.key = "__mithril__" + guid++;
    				}
    			});
    			return 1
    		});
    	}

    	function isDifferentEnough(data, cached, dataAttrKeys) {
    		if (data.tag !== cached.tag) return true

    		if (dataAttrKeys.sort().join() !==
    				Object.keys(cached.attrs).sort().join()) {
    			return true
    		}

    		if (data.attrs.id !== cached.attrs.id) {
    			return true
    		}

    		if (data.attrs.key !== cached.attrs.key) {
    			return true
    		}

    		if (m.redraw.strategy() === "all") {
    			return !cached.configContext || cached.configContext.retain !== true
    		}

    		if (m.redraw.strategy() === "diff") {
    			return cached.configContext && cached.configContext.retain === false
    		}

    		return false
    	}

    	function maybeRecreateObject(data, cached, dataAttrKeys) {
    		// if an element is different enough from the one in cache, recreate it
    		if (isDifferentEnough(data, cached, dataAttrKeys)) {
    			if (cached.nodes.length) clear(cached.nodes);

    			if (cached.configContext &&
    					isFunction(cached.configContext.onunload)) {
    				cached.configContext.onunload();
    			}

    			if (cached.controllers) {
    				forEach(cached.controllers, function (controller) {
    					if (controller.onunload) {
    						controller.onunload({preventDefault: noop});
    					}
    				});
    			}
    		}
    	}

    	function getObjectNamespace(data, namespace) {
    		if (data.attrs.xmlns) return data.attrs.xmlns
    		if (data.tag === "svg") return "http://www.w3.org/2000/svg"
    		if (data.tag === "math") return "http://www.w3.org/1998/Math/MathML"
    		return namespace
    	}

    	var pendingRequests = 0;
    	m.startComputation = function () { pendingRequests++; };
    	m.endComputation = function () {
    		if (pendingRequests > 1) {
    			pendingRequests--;
    		} else {
    			pendingRequests = 0;
    			m.redraw();
    		}
    	};

    	function unloadCachedControllers(cached, views, controllers) {
    		if (controllers.length) {
    			cached.views = views;
    			cached.controllers = controllers;
    			forEach(controllers, function (controller) {
    				if (controller.onunload && controller.onunload.$old) {
    					controller.onunload = controller.onunload.$old;
    				}

    				if (pendingRequests && controller.onunload) {
    					var onunload = controller.onunload;
    					controller.onunload = function (){};
    					controller.onunload.$old = onunload;
    				}
    			});
    		}
    	}

    	function scheduleConfigsToBeCalled(configs, data, node, isNew, cached) {
    		// schedule configs to be called. They are called after `build` finishes
    		// running
    		if (isFunction(data.attrs.config)) {
    			var context = cached.configContext = cached.configContext || {};

    			// bind
    			configs.push(function () {
    				return data.attrs.config.call(data, node, !isNew, context,
    					cached)
    			});
    		}
    	}

    	function buildUpdatedNode(
    		cached,
    		data,
    		editable,
    		hasKeys,
    		namespace,
    		views,
    		configs,
    		controllers
    	) {
    		var node = cached.nodes[0];

    		if (hasKeys) {
    			setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
    		}

    		cached.children = build(
    			node,
    			data.tag,
    			undefined,
    			undefined,
    			data.children,
    			cached.children,
    			false,
    			0,
    			data.attrs.contenteditable ? node : editable,
    			namespace,
    			configs
    		);

    		cached.nodes.intact = true;

    		if (controllers.length) {
    			cached.views = views;
    			cached.controllers = controllers;
    		}

    		return node
    	}

    	function handleNonexistentNodes(data, parentElement, index) {
    		var nodes;
    		if (data.$trusted) {
    			nodes = injectHTML(parentElement, index, data);
    		} else {
    			nodes = [$document.createTextNode(data)];
    			if (!(parentElement.nodeName in voidElements)) {
    				insertNode(parentElement, nodes[0], index);
    			}
    		}

    		var cached;

    		if (typeof data === "string" ||
    				typeof data === "number" ||
    				typeof data === "boolean") {
    			cached = new data.constructor(data);
    		} else {
    			cached = data;
    		}

    		cached.nodes = nodes;
    		return cached
    	}

    	function reattachNodes(
    		data,
    		cached,
    		parentElement,
    		editable,
    		index,
    		parentTag
    	) {
    		var nodes = cached.nodes;
    		if (!editable || editable !== $document.activeElement ||
    				data !== cached) {
    			if (data.$trusted) {
    				clear(nodes, cached);
    				nodes = injectHTML(parentElement, index, data);
    			} else if (parentTag === "textarea") {
    				// <textarea> uses `value` instead of `nodeValue`.
    				parentElement.value = data;
    			} else if (editable) {
    				// contenteditable nodes use `innerHTML` instead of `nodeValue`.
    				editable.innerHTML = data;
    				nodes = [].slice.call(editable.childNodes);
    			} else {
    				// was a trusted string
    				if (nodes[0].nodeType === 1 || nodes.length > 1 ||
    						(nodes[0].nodeValue.trim &&
    							!nodes[0].nodeValue.trim())) {
    					clear(cached.nodes, cached);
    					nodes = [$document.createTextNode(data)];
    				}

    				injectTextNode(parentElement, nodes[0], index, data);
    			}
    		}
    		cached = new data.constructor(data);
    		cached.nodes = nodes;
    		cached.$trusted = data.$trusted;
    		return cached
    	}

    	function handleTextNode(
    		cached,
    		data,
    		index,
    		parentElement,
    		shouldReattach,
    		editable,
    		parentTag
    	) {
    		if (!cached.nodes.length) {
    			return handleNonexistentNodes(data, parentElement, index)
    		} else if (cached.valueOf() !== data.valueOf() || shouldReattach) {
    			return reattachNodes(data, cached, parentElement, editable, index,
    				parentTag)
    		} else {
    			return (cached.nodes.intact = true, cached)
    		}
    	}

    	function getSubArrayCount(item) {
    		if (item.$trusted) {
    			// fix offset of next element if item was a trusted string w/ more
    			// than one html element
    			return item.nodes.length
    		} else if (isArray(item)) {
    			return item.length
    		}
    		return 1
    	}

    	function buildArray(
    		data,
    		cached,
    		parentElement,
    		index,
    		parentTag,
    		shouldReattach,
    		editable,
    		namespace,
    		configs
    	) {
    		data = flatten(data);
    		var nodes = [];
    		var intact = cached.length === data.length;
    		var subArrayCount = 0;

    		// keys algorithm: sort elements without recreating them if keys are
    		// present
    		//
    		// 1) create a map of all existing keys, and mark all for deletion
    		// 2) add new keys to map and mark them for addition
    		// 3) if key exists in new list, change action from deletion to a move
    		// 4) for each key, handle its corresponding action as marked in
    		//    previous steps

    		var existing = {};
    		var shouldMaintainIdentities = false;

    		forKeys(cached, function (attrs, i) {
    			shouldMaintainIdentities = true;
    			existing[cached[i].attrs.key] = {action: DELETION, index: i};
    		});

    		buildArrayKeys(data);
    		if (shouldMaintainIdentities) {
    			cached = diffKeys(data, cached, existing, parentElement);
    		}
    		// end key algorithm

    		var cacheCount = 0;
    		// faster explicitly written
    		for (var i = 0, len = data.length; i < len; i++) {
    			// diff each item in the array
    			var item = build(
    				parentElement,
    				parentTag,
    				cached,
    				index,
    				data[i],
    				cached[cacheCount],
    				shouldReattach,
    				index + subArrayCount || subArrayCount,
    				editable,
    				namespace,
    				configs);

    			if (item !== undefined) {
    				intact = intact && item.nodes.intact;
    				subArrayCount += getSubArrayCount(item);
    				cached[cacheCount++] = item;
    			}
    		}

    		if (!intact) diffArray(data, cached, nodes);
    		return cached
    	}

    	function makeCache(data, cached, index, parentIndex, parentCache) {
    		if (cached != null) {
    			if (type.call(cached) === type.call(data)) return cached

    			if (parentCache && parentCache.nodes) {
    				var offset = index - parentIndex;
    				var end = offset + (isArray(data) ? data : cached.nodes).length;
    				clear(
    					parentCache.nodes.slice(offset, end),
    					parentCache.slice(offset, end));
    			} else if (cached.nodes) {
    				clear(cached.nodes, cached);
    			}
    		}

    		cached = new data.constructor();
    		// if constructor creates a virtual dom element, use a blank object as
    		// the base cached node instead of copying the virtual el (#277)
    		if (cached.tag) cached = {};
    		cached.nodes = [];
    		return cached
    	}

    	function constructNode(data, namespace) {
    		if (data.attrs.is) {
    			if (namespace == null) {
    				return $document.createElement(data.tag, data.attrs.is)
    			} else {
    				return $document.createElementNS(namespace, data.tag,
    					data.attrs.is)
    			}
    		} else if (namespace == null) {
    			return $document.createElement(data.tag)
    		} else {
    			return $document.createElementNS(namespace, data.tag)
    		}
    	}

    	function constructAttrs(data, node, namespace, hasKeys) {
    		if (hasKeys) {
    			return setAttributes(node, data.tag, data.attrs, {}, namespace)
    		} else {
    			return data.attrs
    		}
    	}

    	function constructChildren(
    		data,
    		node,
    		cached,
    		editable,
    		namespace,
    		configs
    	) {
    		if (data.children != null && data.children.length > 0) {
    			return build(
    				node,
    				data.tag,
    				undefined,
    				undefined,
    				data.children,
    				cached.children,
    				true,
    				0,
    				data.attrs.contenteditable ? node : editable,
    				namespace,
    				configs)
    		} else {
    			return data.children
    		}
    	}

    	function reconstructCached(
    		data,
    		attrs,
    		children,
    		node,
    		namespace,
    		views,
    		controllers
    	) {
    		var cached = {
    			tag: data.tag,
    			attrs: attrs,
    			children: children,
    			nodes: [node]
    		};

    		unloadCachedControllers(cached, views, controllers);

    		if (cached.children && !cached.children.nodes) {
    			cached.children.nodes = [];
    		}

    		return cached
    	}

    	function getController(views, view, cachedControllers, controller) {
    		var controllerIndex;

    		if (m.redraw.strategy() === "diff" && views) {
    			controllerIndex = views.indexOf(view);
    		} else {
    			controllerIndex = -1;
    		}

    		if (controllerIndex > -1) {
    			return cachedControllers[controllerIndex]
    		} else if (isFunction(controller)) {
    			return new controller()
    		} else {
    			return {}
    		}
    	}

    	var unloaders = [];

    	function updateLists(views, controllers, view, controller) {
    		if (controller.onunload != null &&
    				unloaders.map(function (u) { return u.handler })
    					.indexOf(controller.onunload) < 0) {
    			unloaders.push({
    				controller: controller,
    				handler: controller.onunload
    			});
    		}

    		views.push(view);
    		controllers.push(controller);
    	}

    	var forcing = false;
    	function checkView(
    		data,
    		view,
    		cached,
    		cachedControllers,
    		controllers,
    		views
    	) {
    		var controller = getController(
    			cached.views,
    			view,
    			cachedControllers,
    			data.controller);

    		var key = data && data.attrs && data.attrs.key;

    		if (pendingRequests === 0 ||
    				forcing ||
    				cachedControllers &&
    					cachedControllers.indexOf(controller) > -1) {
    			data = data.view(controller);
    		} else {
    			data = {tag: "placeholder"};
    		}

    		if (data.subtree === "retain") return data
    		data.attrs = data.attrs || {};
    		data.attrs.key = key;
    		updateLists(views, controllers, view, controller);
    		return data
    	}

    	function markViews(data, cached, views, controllers) {
    		var cachedControllers = cached && cached.controllers;

    		while (data.view != null) {
    			data = checkView(
    				data,
    				data.view.$original || data.view,
    				cached,
    				cachedControllers,
    				controllers,
    				views);
    		}

    		return data
    	}

    	function buildObject( // eslint-disable-line max-statements
    		data,
    		cached,
    		editable,
    		parentElement,
    		index,
    		shouldReattach,
    		namespace,
    		configs
    	) {
    		var views = [];
    		var controllers = [];

    		data = markViews(data, cached, views, controllers);

    		if (data.subtree === "retain") return cached

    		if (!data.tag && controllers.length) {
    			throw new Error("Component template must return a virtual " +
    				"element, not an array, string, etc.")
    		}

    		data.attrs = data.attrs || {};
    		cached.attrs = cached.attrs || {};

    		var dataAttrKeys = Object.keys(data.attrs);
    		var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0);

    		maybeRecreateObject(data, cached, dataAttrKeys);

    		if (!isString(data.tag)) return

    		var isNew = cached.nodes.length === 0;

    		namespace = getObjectNamespace(data, namespace);

    		var node;
    		if (isNew) {
    			node = constructNode(data, namespace);
    			// set attributes first, then create children
    			var attrs = constructAttrs(data, node, namespace, hasKeys);

    			// add the node to its parent before attaching children to it
    			insertNode(parentElement, node, index);

    			var children = constructChildren(data, node, cached, editable,
    				namespace, configs);

    			cached = reconstructCached(
    				data,
    				attrs,
    				children,
    				node,
    				namespace,
    				views,
    				controllers);
    		} else {
    			node = buildUpdatedNode(
    				cached,
    				data,
    				editable,
    				hasKeys,
    				namespace,
    				views,
    				configs,
    				controllers);
    		}

    		// edge case: setting value on <select> doesn't work before children
    		// exist, so set it again after children have been created/updated
    		if (data.tag === "select" && "value" in data.attrs) {
    			setAttributes(node, data.tag, {value: data.attrs.value}, {},
    				namespace);
    		}

    		if (!isNew && shouldReattach === true && node != null) {
    			insertNode(parentElement, node, index);
    		}

    		// The configs are called after `build` finishes running
    		scheduleConfigsToBeCalled(configs, data, node, isNew, cached);

    		return cached
    	}

    	function build(
    		parentElement,
    		parentTag,
    		parentCache,
    		parentIndex,
    		data,
    		cached,
    		shouldReattach,
    		index,
    		editable,
    		namespace,
    		configs
    	) {
    		/*
    		 * `build` is a recursive function that manages creation/diffing/removal
    		 * of DOM elements based on comparison between `data` and `cached` the
    		 * diff algorithm can be summarized as this:
    		 *
    		 * 1 - compare `data` and `cached`
    		 * 2 - if they are different, copy `data` to `cached` and update the DOM
    		 *     based on what the difference is
    		 * 3 - recursively apply this algorithm for every array and for the
    		 *     children of every virtual element
    		 *
    		 * The `cached` data structure is essentially the same as the previous
    		 * redraw's `data` data structure, with a few additions:
    		 * - `cached` always has a property called `nodes`, which is a list of
    		 *    DOM elements that correspond to the data represented by the
    		 *    respective virtual element
    		 * - in order to support attaching `nodes` as a property of `cached`,
    		 *    `cached` is *always* a non-primitive object, i.e. if the data was
    		 *    a string, then cached is a String instance. If data was `null` or
    		 *    `undefined`, cached is `new String("")`
    		 * - `cached also has a `configContext` property, which is the state
    		 *    storage object exposed by config(element, isInitialized, context)
    		 * - when `cached` is an Object, it represents a virtual element; when
    		 *    it's an Array, it represents a list of elements; when it's a
    		 *    String, Number or Boolean, it represents a text node
    		 *
    		 * `parentElement` is a DOM element used for W3C DOM API calls
    		 * `parentTag` is only used for handling a corner case for textarea
    		 * values
    		 * `parentCache` is used to remove nodes in some multi-node cases
    		 * `parentIndex` and `index` are used to figure out the offset of nodes.
    		 * They're artifacts from before arrays started being flattened and are
    		 * likely refactorable
    		 * `data` and `cached` are, respectively, the new and old nodes being
    		 * diffed
    		 * `shouldReattach` is a flag indicating whether a parent node was
    		 * recreated (if so, and if this node is reused, then this node must
    		 * reattach itself to the new parent)
    		 * `editable` is a flag that indicates whether an ancestor is
    		 * contenteditable
    		 * `namespace` indicates the closest HTML namespace as it cascades down
    		 * from an ancestor
    		 * `configs` is a list of config functions to run after the topmost
    		 * `build` call finishes running
    		 *
    		 * there's logic that relies on the assumption that null and undefined
    		 * data are equivalent to empty strings
    		 * - this prevents lifecycle surprises from procedural helpers that mix
    		 *   implicit and explicit return statements (e.g.
    		 *   function foo() {if (cond) return m("div")}
    		 * - it simplifies diffing code
    		 */
    		data = dataToString(data);
    		if (data.subtree === "retain") return cached
    		cached = makeCache(data, cached, index, parentIndex, parentCache);

    		if (isArray(data)) {
    			return buildArray(
    				data,
    				cached,
    				parentElement,
    				index,
    				parentTag,
    				shouldReattach,
    				editable,
    				namespace,
    				configs)
    		} else if (data != null && isObject(data)) {
    			return buildObject(
    				data,
    				cached,
    				editable,
    				parentElement,
    				index,
    				shouldReattach,
    				namespace,
    				configs)
    		} else if (!isFunction(data)) {
    			return handleTextNode(
    				cached,
    				data,
    				index,
    				parentElement,
    				shouldReattach,
    				editable,
    				parentTag)
    		} else {
    			return cached
    		}
    	}

    	function sortChanges(a, b) {
    		return a.action - b.action || a.index - b.index
    	}

    	function copyStyleAttrs(node, dataAttr, cachedAttr) {
    		if (cachedAttr === dataAttr) {
    			node.style = "";
    			cachedAttr = {};
    		}
    		for (var rule in dataAttr) {
    			if (hasOwn.call(dataAttr, rule)) {
    				if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) {
    					node.style[rule] = dataAttr[rule];
    				}
    			}
    		}

    		for (rule in cachedAttr) {
    			if (hasOwn.call(cachedAttr, rule)) {
    				if (!hasOwn.call(dataAttr, rule)) node.style[rule] = "";
    			}
    		}
    	}

    	var shouldUseSetAttribute = {
    		list: 1,
    		style: 1,
    		form: 1,
    		type: 1,
    		width: 1,
    		height: 1
    	};

    	function setSingleAttr(
    		node,
    		attrName,
    		dataAttr,
    		cachedAttr,
    		tag,
    		namespace
    	) {
    		if (attrName === "config" || attrName === "key") {
    			// `config` isn't a real attribute, so ignore it
    			return true
    		} else if (isFunction(dataAttr) && attrName.slice(0, 2) === "on") {
    			// hook event handlers to the auto-redrawing system
    			node[attrName] = autoredraw(dataAttr, node);
    		} else if (attrName === "style" && dataAttr != null &&
    				isObject(dataAttr)) {
    			// handle `style: {...}`
    			copyStyleAttrs(node, dataAttr, cachedAttr);
    		} else if (namespace != null) {
    			// handle SVG
    			if (attrName === "href") {
    				node.setAttributeNS("http://www.w3.org/1999/xlink",
    					"href", dataAttr);
    			} else {
    				node.setAttribute(
    					attrName === "className" ? "class" : attrName,
    					dataAttr);
    			}
    		} else if (attrName in node && !shouldUseSetAttribute[attrName]) {
    			// handle cases that are properties (but ignore cases where we
    			// should use setAttribute instead)
    			//
    			// - list and form are typically used as strings, but are DOM
    			//   element references in js
    			//
    			// - when using CSS selectors (e.g. `m("[style='']")`), style is
    			//   used as a string, but it's an object in js
    			//
    			// #348 don't set the value if not needed - otherwise, cursor
    			// placement breaks in Chrome
    			// #1252 likewise when `contenteditable` is set on an element.
    			try {
    				if (
    					tag !== "input" && !node.isContentEditable ||
    					node[attrName] != dataAttr // eslint-disable-line eqeqeq
    				) {
    					node[attrName] = dataAttr;
    				}
    			} catch (e) {
    				node.setAttribute(attrName, dataAttr);
    			}
    		} else {
    			try {
    				node.setAttribute(attrName, dataAttr);
    			} catch (e) {
    				// IE8 doesn't allow change input attributes and throws
    				// an exception. Unfortunately it cannot be handled, because
    				// error code is not informative.
    			}
    		}
    	}

    	function trySetAttr(
    		node,
    		attrName,
    		dataAttr,
    		cachedAttr,
    		cachedAttrs,
    		tag,
    		namespace
    	) {
    		if (!(attrName in cachedAttrs) ||
    				(cachedAttr !== dataAttr) ||
    				typeof dataAttr === "object" ||
    				($document.activeElement === node)) {
    			cachedAttrs[attrName] = dataAttr;
    			try {
    				return setSingleAttr(
    					node,
    					attrName,
    					dataAttr,
    					cachedAttr,
    					tag,
    					namespace)
    			} catch (e) {
    				// swallow IE's invalid argument errors to mimic HTML's
    				// fallback-to-doing-nothing-on-invalid-attributes behavior
    				if (e.message.indexOf("Invalid argument") < 0) throw e
    			}
    		} else if (attrName === "value" && tag === "input" &&
    								/* eslint-disable eqeqeq */
    								node.value != dataAttr) {
    								// #348 dataAttr may not be a string,
    								// so use loose comparison
    								/* eslint-enable eqeqeq */
    			node.value = dataAttr;
    		}
    	}

    	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
    		for (var attrName in dataAttrs) {
    			if (hasOwn.call(dataAttrs, attrName)) {
    				if (trySetAttr(
    						node,
    						attrName,
    						dataAttrs[attrName],
    						cachedAttrs[attrName],
    						cachedAttrs,
    						tag,
    						namespace)) {
    					continue
    				}
    			}
    		}
    		return cachedAttrs
    	}

    	function clear(nodes, cached) {
    		for (var i = nodes.length - 1; i > -1; i--) {
    			if (nodes[i] && nodes[i].parentNode) {
    				try {
    					nodes[i].parentNode.removeChild(nodes[i]);
    				} catch (e) {
    					/* eslint-disable max-len */
    					// ignore if this fails due to order of events (see
    					// http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
    					/* eslint-enable max-len */
    				}
    				cached = [].concat(cached);
    				if (cached[i]) unload(cached[i]);
    			}
    		}
    		// release memory if nodes is an array. This check should fail if nodes
    		// is a NodeList (see loop above)
    		if (nodes.length) {
    			nodes.length = 0;
    		}
    	}

    	function unload(cached) {
    		if (cached.configContext && isFunction(cached.configContext.onunload)) {
    			cached.configContext.onunload();
    			cached.configContext.onunload = null;
    		}
    		if (cached.controllers) {
    			forEach(cached.controllers, function (controller) {
    				if (isFunction(controller.onunload)) {
    					controller.onunload({preventDefault: noop});
    				}
    			});
    		}
    		if (cached.children) {
    			if (isArray(cached.children)) forEach(cached.children, unload);
    			else if (cached.children.tag) unload(cached.children);
    		}
    	}

    	function appendTextFragment(parentElement, data) {
    		try {
    			parentElement.appendChild(
    				$document.createRange().createContextualFragment(data));
    		} catch (e) {
    			parentElement.insertAdjacentHTML("beforeend", data);
    			replaceScriptNodes(parentElement);
    		}
    	}

    	// Replace script tags inside given DOM element with executable ones.
    	// Will also check children recursively and replace any found script
    	// tags in same manner.
    	function replaceScriptNodes(node) {
    		if (node.tagName === "SCRIPT") {
    			node.parentNode.replaceChild(buildExecutableNode(node), node);
    		} else {
    			var children = node.childNodes;
    			if (children && children.length) {
    				for (var i = 0; i < children.length; i++) {
    					replaceScriptNodes(children[i]);
    				}
    			}
    		}

    		return node
    	}

    	// Replace script element with one whose contents are executable.
    	function buildExecutableNode(node){
    		var scriptEl = document.createElement("script");
    		var attrs = node.attributes;

    		for (var i = 0; i < attrs.length; i++) {
    			scriptEl.setAttribute(attrs[i].name, attrs[i].value);
    		}

    		scriptEl.text = node.innerHTML;
    		return scriptEl
    	}

    	function injectHTML(parentElement, index, data) {
    		var nextSibling = parentElement.childNodes[index];
    		if (nextSibling) {
    			var isElement = nextSibling.nodeType !== 1;
    			var placeholder = $document.createElement("span");
    			if (isElement) {
    				parentElement.insertBefore(placeholder, nextSibling || null);
    				placeholder.insertAdjacentHTML("beforebegin", data);
    				parentElement.removeChild(placeholder);
    			} else {
    				nextSibling.insertAdjacentHTML("beforebegin", data);
    			}
    		} else {
    			appendTextFragment(parentElement, data);
    		}

    		var nodes = [];

    		while (parentElement.childNodes[index] !== nextSibling) {
    			nodes.push(parentElement.childNodes[index]);
    			index++;
    		}

    		return nodes
    	}

    	function autoredraw(callback, object) {
    		return function (e) {
    			e = e || event;
    			m.redraw.strategy("diff");
    			m.startComputation();
    			try {
    				return callback.call(object, e)
    			} finally {
    				endFirstComputation();
    			}
    		}
    	}

    	var html;
    	var documentNode = {
    		appendChild: function (node) {
    			if (html === undefined) html = $document.createElement("html");
    			if ($document.documentElement &&
    					$document.documentElement !== node) {
    				$document.replaceChild(node, $document.documentElement);
    			} else {
    				$document.appendChild(node);
    			}

    			this.childNodes = $document.childNodes;
    		},

    		insertBefore: function (node) {
    			this.appendChild(node);
    		},

    		childNodes: []
    	};

    	var nodeCache = [];
    	var cellCache = {};

    	m.render = function (root, cell, forceRecreation) {
    		if (!root) {
    			throw new Error("Ensure the DOM element being passed to " +
    				"m.route/m.mount/m.render is not undefined.")
    		}
    		var configs = [];
    		var id = getCellCacheKey(root);
    		var isDocumentRoot = root === $document;
    		var node;

    		if (isDocumentRoot || root === $document.documentElement) {
    			node = documentNode;
    		} else {
    			node = root;
    		}

    		if (isDocumentRoot && cell.tag !== "html") {
    			cell = {tag: "html", attrs: {}, children: cell};
    		}

    		if (cellCache[id] === undefined) clear(node.childNodes);
    		if (forceRecreation === true) reset(root);

    		cellCache[id] = build(
    			node,
    			null,
    			undefined,
    			undefined,
    			cell,
    			cellCache[id],
    			false,
    			0,
    			null,
    			undefined,
    			configs);

    		forEach(configs, function (config) { config(); });
    	};

    	function getCellCacheKey(element) {
    		var index = nodeCache.indexOf(element);
    		return index < 0 ? nodeCache.push(element) - 1 : index
    	}

    	m.trust = function (value) {
    		value = new String(value); // eslint-disable-line no-new-wrappers
    		value.$trusted = true;
    		return value
    	};

    	function gettersetter(store) {
    		function prop() {
    			if (arguments.length) store = arguments[0];
    			return store
    		}

    		prop.toJSON = function () {
    			if (store && isFunction(store.toJSON)) return store.toJSON()
    			return store
    		};

    		return prop
    	}

    	m.prop = function (store) {
    		if ((store != null && (isObject(store) || isFunction(store)) ||
    					((typeof Promise !== "undefined") &&
    						(store instanceof Promise))) &&
    				isFunction(store.then)) {
    			return propify(store)
    		}

    		return gettersetter(store)
    	};

    	var roots = [];
    	var components = [];
    	var controllers = [];
    	var lastRedrawId = null;
    	var lastRedrawCallTime = 0;
    	var computePreRedrawHook = null;
    	var computePostRedrawHook = null;
    	var topComponent;
    	var FRAME_BUDGET = 16; // 60 frames per second = 1 call per 16 ms

    	function parameterize(component, args) {
    		function controller() {
    			/* eslint-disable no-invalid-this */
    			return (component.controller || noop).apply(this, args) || this
    			/* eslint-enable no-invalid-this */
    		}

    		if (component.controller) {
    			controller.prototype = component.controller.prototype;
    		}

    		function view(ctrl) {
    			var arguments$1 = arguments;

    			var currentArgs = [ctrl].concat(args);
    			for (var i = 1; i < arguments.length; i++) {
    				currentArgs.push(arguments$1[i]);
    			}

    			return component.view.apply(component, currentArgs)
    		}

    		view.$original = component.view;
    		var output = {controller: controller, view: view};
    		if (args[0] && args[0].key != null) output.attrs = {key: args[0].key};
    		return output
    	}

    	m.component = function (component) {
    		var arguments$1 = arguments;

    		var args = new Array(arguments.length - 1);

    		for (var i = 1; i < arguments.length; i++) {
    			args[i - 1] = arguments$1[i];
    		}

    		return parameterize(component, args)
    	};

    	var currentRoute, previousRoute;

    	function checkPrevented(component, root, index, isPrevented) {
    		if (!isPrevented) {
    			m.redraw.strategy("all");
    			m.startComputation();
    			roots[index] = root;
    			var currentComponent;

    			if (component) {
    				currentComponent = topComponent = component;
    			} else {
    				currentComponent = topComponent = component = {controller: noop};
    			}

    			var controller = new (component.controller || noop)();

    			// controllers may call m.mount recursively (via m.route redirects,
    			// for example)
    			// this conditional ensures only the last recursive m.mount call is
    			// applied
    			if (currentComponent === topComponent) {
    				controllers[index] = controller;
    				components[index] = component;
    			}
    			endFirstComputation();
    			if (component === null) {
    				removeRootElement(root, index);
    			}
    			return controllers[index]
    		} else {
    			if (component == null) {
    				removeRootElement(root, index);
    			}

    			if (previousRoute) {
    				currentRoute = previousRoute;
    			}
    		}
    	}

    	m.mount = m.module = function (root, component) {
    		if (!root) {
    			throw new Error("Ensure the DOM element being passed to " +
    				"m.route/m.mount/m.render is not undefined.")
    		}

    		var index = roots.indexOf(root);
    		if (index < 0) index = roots.length;

    		var isPrevented = false;
    		var event = {
    			preventDefault: function () {
    				isPrevented = true;
    				computePreRedrawHook = computePostRedrawHook = null;
    			}
    		};

    		forEach(unloaders, function (unloader) {
    			unloader.handler.call(unloader.controller, event);
    			unloader.controller.onunload = null;
    		});

    		if (isPrevented) {
    			forEach(unloaders, function (unloader) {
    				unloader.controller.onunload = unloader.handler;
    			});
    		} else {
    			unloaders = [];
    		}

    		if (controllers[index] && isFunction(controllers[index].onunload)) {
    			controllers[index].onunload(event);
    		}

    		return checkPrevented(component, root, index, isPrevented)
    	};

    	function removeRootElement(root, index) {
    		roots.splice(index, 1);
    		controllers.splice(index, 1);
    		components.splice(index, 1);
    		reset(root);
    		nodeCache.splice(getCellCacheKey(root), 1);
    		unloaders = [];
    	}

    	var redrawing = false;
    	m.redraw = function (force) {
    		if (redrawing) return
    		redrawing = true;
    		if (force) forcing = true;

    		try {
    			// lastRedrawId is a positive number if a second redraw is requested
    			// before the next animation frame
    			// lastRedrawId is null if it's the first redraw and not an event
    			// handler
    			if (lastRedrawId && !force) {
    				// when setTimeout: only reschedule redraw if time between now
    				// and previous redraw is bigger than a frame, otherwise keep
    				// currently scheduled timeout
    				// when rAF: always reschedule redraw
    				if ($requestAnimationFrame === global.requestAnimationFrame ||
    						new Date() - lastRedrawCallTime > FRAME_BUDGET) {
    					if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
    					lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET);
    				}
    			} else {
    				redraw();
    				lastRedrawId = $requestAnimationFrame(function () {
    					lastRedrawId = null;
    				}, FRAME_BUDGET);
    			}
    		} finally {
    			redrawing = forcing = false;
    		}
    	};

    	m.redraw.strategy = m.prop();
    	function redraw() {
    		if (computePreRedrawHook) {
    			computePreRedrawHook();
    			computePreRedrawHook = null;
    		}
    		forEach(roots, function (root, i) {
    			var component = components[i];
    			if (controllers[i]) {
    				var args = [controllers[i]];
    				m.render(root,
    					component.view ? component.view(controllers[i], args) : "");
    			}
    		});
    		// after rendering within a routed context, we need to scroll back to
    		// the top, and fetch the document title for history.pushState
    		if (computePostRedrawHook) {
    			computePostRedrawHook();
    			computePostRedrawHook = null;
    		}
    		lastRedrawId = null;
    		lastRedrawCallTime = new Date();
    		m.redraw.strategy("diff");
    	}

    	function endFirstComputation() {
    		if (m.redraw.strategy() === "none") {
    			pendingRequests--;
    			m.redraw.strategy("diff");
    		} else {
    			m.endComputation();
    		}
    	}

    	m.withAttr = function (prop, withAttrCallback, callbackThis) {
    		return function (e) {
    			e = e || window.event;
    			/* eslint-disable no-invalid-this */
    			var currentTarget = e.currentTarget || this;
    			var _this = callbackThis || this;
    			/* eslint-enable no-invalid-this */
    			var target = prop in currentTarget ?
    				currentTarget[prop] :
    				currentTarget.getAttribute(prop);
    			withAttrCallback.call(_this, target);
    		}
    	};

    	// routing
    	var modes = {pathname: "", hash: "#", search: "?"};
    	var redirect = noop;
    	var isDefaultRoute = false;
    	var routeParams;

    	m.route = function (root, arg1, arg2, vdom) { // eslint-disable-line
    		// m.route()
    		if (arguments.length === 0) return currentRoute
    		// m.route(el, defaultRoute, routes)
    		if (arguments.length === 3 && isString(arg1)) {
    			redirect = function (source) {
    				var path = currentRoute = normalizeRoute(source);
    				if (!routeByValue(root, arg2, path)) {
    					if (isDefaultRoute) {
    						throw new Error("Ensure the default route matches " +
    							"one of the routes defined in m.route")
    					}

    					isDefaultRoute = true;
    					m.route(arg1, true);
    					isDefaultRoute = false;
    				}
    			};

    			var listener = m.route.mode === "hash" ?
    				"onhashchange" :
    				"onpopstate";

    			global[listener] = function () {
    				var path = $location[m.route.mode];
    				if (m.route.mode === "pathname") path += $location.search;
    				if (currentRoute !== normalizeRoute(path)) redirect(path);
    			};

    			computePreRedrawHook = setScroll;
    			global[listener]();

    			return
    		}

    		// config: m.route
    		if (root.addEventListener || root.attachEvent) {
    			var base = m.route.mode !== "pathname" ? $location.pathname : "";
    			root.href = base + modes[m.route.mode] + vdom.attrs.href;
    			if (root.addEventListener) {
    				root.removeEventListener("click", routeUnobtrusive);
    				root.addEventListener("click", routeUnobtrusive);
    			} else {
    				root.detachEvent("onclick", routeUnobtrusive);
    				root.attachEvent("onclick", routeUnobtrusive);
    			}

    			return
    		}
    		// m.route(route, params, shouldReplaceHistoryEntry)
    		if (isString(root)) {
    			previousRoute = currentRoute;
    			currentRoute = root;

    			var args = arg1 || {};
    			var queryIndex = currentRoute.indexOf("?");
    			var params;

    			if (queryIndex > -1) {
    				params = parseQueryString(currentRoute.slice(queryIndex + 1));
    			} else {
    				params = {};
    			}

    			for (var i in args) {
    				if (hasOwn.call(args, i)) {
    					params[i] = args[i];
    				}
    			}

    			var querystring = buildQueryString(params);
    			var currentPath;

    			if (queryIndex > -1) {
    				currentPath = currentRoute.slice(0, queryIndex);
    			} else {
    				currentPath = currentRoute;
    			}

    			if (querystring) {
    				currentRoute = currentPath +
    					(currentPath.indexOf("?") === -1 ? "?" : "&") +
    					querystring;
    			}

    			var replaceHistory =
    				(arguments.length === 3 ? arg2 : arg1) === true ||
    				previousRoute === currentRoute;

    			if (global.history.pushState) {
    				var method = replaceHistory ? "replaceState" : "pushState";
    				computePreRedrawHook = setScroll;
    				computePostRedrawHook = function () {
    					try {
    						global.history[method](null, $document.title,
    							modes[m.route.mode] + currentRoute);
    					} catch (err) {
    						// In the event of a pushState or replaceState failure,
    						// fallback to a standard redirect. This is specifically
    						// to address a Safari security error when attempting to
    						// call pushState more than 100 times.
    						$location[m.route.mode] = currentRoute;
    					}
    				};
    				redirect(modes[m.route.mode] + currentRoute);
    			} else {
    				$location[m.route.mode] = currentRoute;
    				redirect(modes[m.route.mode] + currentRoute);
    			}

    			previousRoute = null;
    		}
    	};

    	m.route.param = function (key) {
    		if (!routeParams) {
    			throw new Error("You must call m.route(element, defaultRoute, " +
    				"routes) before calling m.route.param()")
    		}

    		if (!key) {
    			return routeParams
    		}

    		return routeParams[key]
    	};

    	m.route.mode = "search";

    	function normalizeRoute(route) {
    		return route.slice(modes[m.route.mode].length)
    	}

    	function routeByValue(root, router, path) {
    		routeParams = {};

    		var queryStart = path.indexOf("?");
    		if (queryStart !== -1) {
    			routeParams = parseQueryString(
    				path.substr(queryStart + 1, path.length));
    			path = path.substr(0, queryStart);
    		}

    		// Get all routes and check if there's
    		// an exact match for the current path
    		var keys = Object.keys(router);
    		var index = keys.indexOf(path);

    		if (index !== -1){
    			m.mount(root, router[keys [index]]);
    			return true
    		}

    		for (var route in router) {
    			if (hasOwn.call(router, route)) {
    				if (route === path) {
    					m.mount(root, router[route]);
    					return true
    				}

    				var matcher = new RegExp("^" + route
    					.replace(/:[^\/]+?\.{3}/g, "(.*?)")
    					.replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

    				if (matcher.test(path)) {
    					/* eslint-disable no-loop-func */
    					path.replace(matcher, function () {
    						var keys = route.match(/:[^\/]+/g) || [];
    						var values = [].slice.call(arguments, 1, -2);
    						forEach(keys, function (key, i) {
    							routeParams[key.replace(/:|\./g, "")] =
    								decodeURIComponent(values[i]);
    						});
    						m.mount(root, router[route]);
    					});
    					/* eslint-enable no-loop-func */
    					return true
    				}
    			}
    		}
    	}

    	function routeUnobtrusive(e) {
    		e = e || event;
    		if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return

    		if (e.preventDefault) {
    			e.preventDefault();
    		} else {
    			e.returnValue = false;
    		}

    		var currentTarget = e.currentTarget || e.srcElement;
    		var args;

    		if (m.route.mode === "pathname" && currentTarget.search) {
    			args = parseQueryString(currentTarget.search.slice(1));
    		} else {
    			args = {};
    		}

    		while (currentTarget && !/a/i.test(currentTarget.nodeName)) {
    			currentTarget = currentTarget.parentNode;
    		}

    		// clear pendingRequests because we want an immediate route change
    		pendingRequests = 0;
    		m.route(currentTarget[m.route.mode]
    			.slice(modes[m.route.mode].length), args);
    	}

    	function setScroll() {
    		if (m.route.mode !== "hash" && $location.hash) {
    			$location.hash = $location.hash;
    		} else {
    			global.scrollTo(0, 0);
    		}
    	}

    	function buildQueryString(object, prefix) {
    		var duplicates = {};
    		var str = [];

    		for (var prop in object) {
    			if (hasOwn.call(object, prop)) {
    				var key = prefix ? prefix + "[" + prop + "]" : prop;
    				var value = object[prop];

    				if (value === null) {
    					str.push(encodeURIComponent(key));
    				} else if (isObject(value)) {
    					str.push(buildQueryString(value, key));
    				} else if (isArray(value)) {
    					var keys = [];
    					duplicates[key] = duplicates[key] || {};
    					/* eslint-disable no-loop-func */
    					forEach(value, function (item) {
    						/* eslint-enable no-loop-func */
    						if (!duplicates[key][item]) {
    							duplicates[key][item] = true;
    							keys.push(encodeURIComponent(key) + "=" +
    								encodeURIComponent(item));
    						}
    					});
    					str.push(keys.join("&"));
    				} else if (value !== undefined) {
    					str.push(encodeURIComponent(key) + "=" +
    						encodeURIComponent(value));
    				}
    			}
    		}

    		return str.join("&")
    	}

    	function parseQueryString(str) {
    		if (str === "" || str == null) return {}
    		if (str.charAt(0) === "?") str = str.slice(1);

    		var pairs = str.split("&");
    		var params = {};

    		forEach(pairs, function (string) {
    			var pair = string.split("=");
    			var key = decodeURIComponent(pair[0]);
    			var value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
    			if (params[key] != null) {
    				if (!isArray(params[key])) params[key] = [params[key]];
    				params[key].push(value);
    			} else params[key] = value;
    		});

    		return params
    	}

    	m.route.buildQueryString = buildQueryString;
    	m.route.parseQueryString = parseQueryString;

    	function reset(root) {
    		var cacheKey = getCellCacheKey(root);
    		clear(root.childNodes, cellCache[cacheKey]);
    		cellCache[cacheKey] = undefined;
    	}

    	m.deferred = function () {
    		var deferred = new Deferred();
    		deferred.promise = propify(deferred.promise);
    		return deferred
    	};

    	function propify(promise, initialValue) {
    		var prop = m.prop(initialValue);
    		promise.then(prop);
    		prop.then = function (resolve, reject) {
    			return propify(promise.then(resolve, reject), initialValue)
    		};

    		prop["catch"] = prop.then.bind(null, null);
    		return prop
    	}
    	// Promiz.mithril.js | Zolmeister | MIT
    	// a modified version of Promiz.js, which does not conform to Promises/A+
    	// for two reasons:
    	//
    	// 1) `then` callbacks are called synchronously (because setTimeout is too
    	//    slow, and the setImmediate polyfill is too big
    	//
    	// 2) throwing subclasses of Error cause the error to be bubbled up instead
    	//    of triggering rejection (because the spec does not account for the
    	//    important use case of default browser error handling, i.e. message w/
    	//    line number)

    	var RESOLVING = 1;
    	var REJECTING = 2;
    	var RESOLVED = 3;
    	var REJECTED = 4;

    	function Deferred(onSuccess, onFailure) {
    		var self = this;
    		var state = 0;
    		var promiseValue = 0;
    		var next = [];

    		self.promise = {};

    		self.resolve = function (value) {
    			if (!state) {
    				promiseValue = value;
    				state = RESOLVING;

    				fire();
    			}

    			return self
    		};

    		self.reject = function (value) {
    			if (!state) {
    				promiseValue = value;
    				state = REJECTING;

    				fire();
    			}

    			return self
    		};

    		self.promise.then = function (onSuccess, onFailure) {
    			var deferred = new Deferred(onSuccess, onFailure);

    			if (state === RESOLVED) {
    				deferred.resolve(promiseValue);
    			} else if (state === REJECTED) {
    				deferred.reject(promiseValue);
    			} else {
    				next.push(deferred);
    			}

    			return deferred.promise
    		};

    		function finish(type) {
    			state = type || REJECTED;
    			next.map(function (deferred) {
    				if (state === RESOLVED) {
    					deferred.resolve(promiseValue);
    				} else {
    					deferred.reject(promiseValue);
    				}
    			});
    		}

    		function thennable(then, success, failure, notThennable) {
    			if (((promiseValue != null && isObject(promiseValue)) ||
    					isFunction(promiseValue)) && isFunction(then)) {
    				try {
    					// count protects against abuse calls from spec checker
    					var count = 0;
    					then.call(promiseValue, function (value) {
    						if (count++) return
    						promiseValue = value;
    						success();
    					}, function (value) {
    						if (count++) return
    						promiseValue = value;
    						failure();
    					});
    				} catch (e) {
    					m.deferred.onerror(e);
    					promiseValue = e;
    					failure();
    				}
    			} else {
    				notThennable();
    			}
    		}

    		function fire() {
    			// check if it's a thenable
    			var then;
    			try {
    				then = promiseValue && promiseValue.then;
    			} catch (e) {
    				m.deferred.onerror(e);
    				promiseValue = e;
    				state = REJECTING;
    				return fire()
    			}

    			if (state === REJECTING) {
    				m.deferred.onerror(promiseValue);
    			}

    			thennable(then, function () {
    				state = RESOLVING;
    				fire();
    			}, function () {
    				state = REJECTING;
    				fire();
    			}, function () {
    				try {
    					if (state === RESOLVING && isFunction(onSuccess)) {
    						promiseValue = onSuccess(promiseValue);
    					} else if (state === REJECTING && isFunction(onFailure)) {
    						promiseValue = onFailure(promiseValue);
    						state = RESOLVING;
    					}
    				} catch (e) {
    					m.deferred.onerror(e);
    					promiseValue = e;
    					return finish()
    				}

    				if (promiseValue === self) {
    					promiseValue = TypeError();
    					finish();
    				} else {
    					thennable(then, function () {
    						finish(RESOLVED);
    					}, finish, function () {
    						finish(state === RESOLVING && RESOLVED);
    					});
    				}
    			});
    		}
    	}

    	m.deferred.onerror = function (e) {
    		if (type.call(e) === "[object Error]" &&
    				!/ Error/.test(e.constructor.toString())) {
    			pendingRequests = 0;
    			throw e
    		}
    	};

    	m.sync = function (args) {
    		var deferred = m.deferred();
    		var outstanding = args.length;
    		var results = [];
    		var method = "resolve";

    		function synchronizer(pos, resolved) {
    			return function (value) {
    				results[pos] = value;
    				if (!resolved) method = "reject";
    				if (--outstanding === 0) {
    					deferred.promise(results);
    					deferred[method](results);
    				}
    				return value
    			}
    		}

    		if (args.length > 0) {
    			forEach(args, function (arg, i) {
    				arg.then(synchronizer(i, true), synchronizer(i, false));
    			});
    		} else {
    			deferred.resolve([]);
    		}

    		return deferred.promise
    	};

    	function identity(value) { return value }

    	function handleJsonp(options) {
    		var callbackKey = options.callbackName || "mithril_callback_" +
    			new Date().getTime() + "_" +
    			(Math.round(Math.random() * 1e16)).toString(36);

    		var script = $document.createElement("script");

    		global[callbackKey] = function (resp) {
    			script.parentNode.removeChild(script);
    			options.onload({
    				type: "load",
    				target: {
    					responseText: resp
    				}
    			});
    			global[callbackKey] = undefined;
    		};

    		script.onerror = function () {
    			script.parentNode.removeChild(script);

    			options.onerror({
    				type: "error",
    				target: {
    					status: 500,
    					responseText: JSON.stringify({
    						error: "Error making jsonp request"
    					})
    				}
    			});
    			global[callbackKey] = undefined;

    			return false
    		};

    		script.onload = function () {
    			return false
    		};

    		script.src = options.url +
    			(options.url.indexOf("?") > 0 ? "&" : "?") +
    			(options.callbackKey ? options.callbackKey : "callback") +
    			"=" + callbackKey +
    			"&" + buildQueryString(options.data || {});

    		$document.body.appendChild(script);
    	}

    	function createXhr(options) {
    		var xhr = new global.XMLHttpRequest();
    		xhr.open(options.method, options.url, true, options.user,
    			options.password);

    		xhr.onreadystatechange = function () {
    			if (xhr.readyState === 4) {
    				if (xhr.status >= 200 && xhr.status < 300) {
    					options.onload({type: "load", target: xhr});
    				} else {
    					options.onerror({type: "error", target: xhr});
    				}
    			}
    		};

    		if (options.serialize === JSON.stringify &&
    				options.data &&
    				options.method !== "GET") {
    			xhr.setRequestHeader("Content-Type",
    				"application/json; charset=utf-8");
    		}

    		if (options.deserialize === JSON.parse) {
    			xhr.setRequestHeader("Accept", "application/json, text/*");
    		}

    		if (isObject(options.headers)) {
    			for (var header in options.headers) {
    				if (hasOwn.call(options.headers, header)) {
    					xhr.setRequestHeader(header, options.headers[header]);
    				}
    			}
    		}

    		if (isFunction(options.config)) {
    			var maybeXhr = options.config(xhr, options);
    			if (maybeXhr != null) xhr = maybeXhr;
    		}

    		var data = options.method === "GET" || !options.data ? "" : options.data;

    		if (data && !isString(data) && data.constructor !== global.FormData) {
    			throw new Error("Request data should be either be a string or " +
    				"FormData. Check the `serialize` option in `m.request`")
    		}

    		xhr.send(data);
    		return xhr
    	}

    	function ajax(options) {
    		if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
    			return handleJsonp(options)
    		} else {
    			return createXhr(options)
    		}
    	}

    	function bindData(options, data, serialize) {
    		if (options.method === "GET" && options.dataType !== "jsonp") {
    			var prefix = options.url.indexOf("?") < 0 ? "?" : "&";
    			var querystring = buildQueryString(data);
    			options.url += (querystring ? prefix + querystring : "");
    		} else {
    			options.data = serialize(data);
    		}
    	}

    	function parameterizeUrl(url, data) {
    		if (data) {
    			url = url.replace(/:[a-z]\w+/gi, function (token){
    				var key = token.slice(1);
    				var value = data[key] || token;
    				delete data[key];
    				return value
    			});
    		}
    		return url
    	}

    	m.request = function (options) {
    		if (options.background !== true) m.startComputation();
    		var deferred = new Deferred();
    		var isJSONP = options.dataType &&
    			options.dataType.toLowerCase() === "jsonp";

    		var serialize, deserialize, extract;

    		if (isJSONP) {
    			serialize = options.serialize =
    			deserialize = options.deserialize = identity;

    			extract = function (jsonp) { return jsonp.responseText };
    		} else {
    			serialize = options.serialize = options.serialize || JSON.stringify;

    			deserialize = options.deserialize =
    				options.deserialize || JSON.parse;
    			extract = options.extract || function (xhr) {
    				if (xhr.responseText.length || deserialize !== JSON.parse) {
    					return xhr.responseText
    				} else {
    					return null
    				}
    			};
    		}

    		options.method = (options.method || "GET").toUpperCase();
    		options.url = parameterizeUrl(options.url, options.data);
    		bindData(options, options.data, serialize);
    		options.onload = options.onerror = function (ev) {
    			try {
    				ev = ev || event;
    				var response = deserialize(extract(ev.target, options));
    				if (ev.type === "load") {
    					if (options.unwrapSuccess) {
    						response = options.unwrapSuccess(response, ev.target);
    					}

    					if (isArray(response) && options.type) {
    						forEach(response, function (res, i) {
    							response[i] = new options.type(res);
    						});
    					} else if (options.type) {
    						response = new options.type(response);
    					}

    					deferred.resolve(response);
    				} else {
    					if (options.unwrapError) {
    						response = options.unwrapError(response, ev.target);
    					}

    					deferred.reject(response);
    				}
    			} catch (e) {
    				deferred.reject(e);
    				m.deferred.onerror(e);
    			} finally {
    				if (options.background !== true) m.endComputation();
    			}
    		};

    		ajax(options);
    		deferred.promise = propify(deferred.promise, options.initialValue);
    		return deferred.promise
    	};

    	return m
    }); // eslint-disable-line
    });

    window.m = mithril;
    window.Pikaday = pikaday;

    var checkStatus = function (response) {

        if (response.status >= 200 && response.status < 300) {
            return response;
        }

        var error = new Error(response.statusText);

        error.response = response;

        throw error;
    };

    var checkFullStatus = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        throw response;
    };

    var toJSON = function (response) { return response
        .json()
        .catch( ); };

    // extract info from status error
    var catchJSON = function (err) { return (err.response ? err.response.json() : Promise.reject())
        .catch(function () { return Promise.reject(err); })
        .then(function (json) { return Promise.reject(json); }); };


    function fetchVoid(url, options){
        if ( options === void 0 ) options = {};

        var opts = Object.assign({
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }, options);

        opts.body = JSON.stringify(options.body);
        return fetch(url, opts)
            .then(checkStatus)
            .catch(catchJSON);
    }

    function fetchFullJson(url, options){
        if ( options === void 0 ) options = {};

        var opts = Object.assign({
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }, options);

        opts.body = JSON.stringify(options.body);
        return fetch(url, opts)
            .then(checkFullStatus)
            .then(toJSON)
            .catch();
    }

    function fetchJson(url, options){
        return fetchVoid(url, options)
            .then(toJSON);
    }

    function fetchText(url, options){
        return fetchVoid(url, options)
            .then(function (response) { return response.text(); });
    }

    function fetchUpload(url, options){
        var opts = Object.assign({
            credentials: 'same-origin'
        }, options);

        return fetch(url, opts)
            .then(checkStatus)
            .then(toJSON)
            .catch(catchJSON);
    }

    /**/
    // const urlPrefix = 'http://app-prod-03.implicit.harvard.edu/openserver'; // first pathname section with slashes

    // const urlPrefix = window.location.origin; // first pathname section with slashes

    var urlPrefix = '..';//location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes


    // console.log(location.href);
    var baseUrl            = "" + urlPrefix;
    var studyUrl           = urlPrefix + "/studies";
    var launchUrl          = urlPrefix + "/launch";
    var templatesUrl       = urlPrefix + "/templates";
    var tagsUrl            = urlPrefix + "/tags";
    var translateUrl       = urlPrefix + "/translate";
    var poolUrl            = urlPrefix + "/StudyData";
    var statisticsUrl      = urlPrefix + "/PITracking";
    var downloadsUrl       = urlPrefix + "/DashboardData";
    var activationUrl      = urlPrefix + "/activation";
    var collaborationUrl   = urlPrefix + "/collaboration";
    var downloadsAccessUrl = urlPrefix + "/DownloadsAccess";

    var getStatistics = function (query) {
        return fetchJson(statisticsUrl, {method:'post', body: parseQuery(query)})
            .then(function (response) {
                return response;
            });

        /**
         * Parses the query as we build it locally and creates an appropriate post for the server
         **/
        function parseQuery(ref){
            var source = ref.source;
            var study = ref.study;
            var sortstudy = ref.sortstudy;
            var sorttask = ref.sorttask;
            var sorttime = ref.sorttime;
            var startDate = ref.startDate;
            var endDate = ref.endDate;
            var firstTask = ref.firstTask;
            var lastTask = ref.lastTask;

            var post = {
                schema: source().match(/^(.*?):/)[1], // before colon
                studyId: study(),
                startDate: parseDate(startDate()),
                endDate: parseDate(endDate()),
                startTask: firstTask(),
                sorttask: sorttask(),
                sortstudy: sortstudy(),
                endTask: lastTask(),
                timeframe: sorttime()==='None' ? 'All' : sorttime(),
                extended:sorttask()
            };
            return post;

            function parseDate(date){
                if (!date) return;
                return ((date.getMonth()+1) + "/" + (date.getDate()) + "/" + (date.getYear() + 1900));
            }
        } 
    };
    /* eslint-enable */

    // import $ from 'jquery';
    var Pikaday = window.Pikaday;
    var dateRangePicker = function (args) { return m.component(pikadayRange, args); };

    /**
     * args = {
     *  startValue: m.prop,
     *  endValue: m.prop,
     *  options: Object // specific daterange plugin options
     * }
     */

    var pikadayRange = {
        view: function(ctrl, args){
            return m('.row.form-group.date-range', {config: pikadayRange.config(args)}, [
                m('.col-sm-6', [
                    m('label','Start Date'),
                    m('label.input-group',[
                        m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                        m('input.form-control')
                    ])
                ]),
                m('.col-sm-6', [
                    m('label','End Date'),
                    m('label.input-group',[
                        m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                        m('input.form-control')
                    ])
                ])
            ]);
        },
        config: function config$1(ref){
            var startDate = ref.startDate;
            var endDate = ref.endDate;

            return function (element, isInitialized, ctx) {
                var startPicker = ctx.startPicker;
                var endPicker = ctx.endPicker;

                if (!isInitialized) setup();

                // external date change
                if (!areDatesEqual(startDate, startPicker) || !areDatesEqual(endDate, endPicker)) update(); 

                function setup(){
                    var startElement = element.children[0].children[1].children[1];
                    startPicker = ctx.startPicker = new Pikaday({
                        onSelect: onSelect(startDate),
                        field: startElement 
                    });
                    startElement.addEventListener('keyup', onKeydown(startPicker));
                    
                    var endElement = element.children[1].children[1].children[1];
                    endPicker = ctx.endPicker = new Pikaday({
                        onSelect: onSelect(endDate),
                        field: endElement
                    });
                    endElement.addEventListener('keyup', onKeydown(endPicker));

                    startPicker.setDate(startDate());
                    endPicker.setDate(endDate());

                    ctx.onunload = function () {
                        startPicker.destroy();
                        endPicker.destroy();
                    };
                }

                function onKeydown(picker){
                    return function (e) {
                        if (e.keyCode === 13 && picker.isVisible()) e.stopPropagation();
                        if (e.keyCode === 27 && picker.isVisible()) {
                            e.stopPropagation();
                            picker.hide();
                        }
                    };
                }

                function onSelect(prop){
                    return function (date) {
                        prop(date); // update start/end

                        update();
                        m.redraw();
                    };
                }

                function update(){
                    startPicker.setDate(startDate(),true);
                    endPicker.setDate(endDate(),true);

                    startPicker.setStartRange(startDate());
                    startPicker.setEndRange(endDate());
                    endPicker.setStartRange(startDate());
                    endPicker.setEndRange(endDate());
                    startPicker.setMaxDate(endDate());
                    endPicker.setMinDate(startDate());
                }

                function areDatesEqual(prop, picker){
                    return prop().getTime() === picker.getDate().getTime();
                }
            };
        }
    };

    var inputWrapper = function (view) { return function (ctrl, args) {
        var isValid = !ctrl.validity || ctrl.validity();
        var groupClass;
        var inputClass;
        var form = args.form;
        var colWidth = args.colWidth || 2;

        if (!form) throw new Error('Inputs require a form');
            
        if (form.showValidation()){
            groupClass = isValid ? 'has-success' : 'has-danger';
            inputClass = isValid ? 'form-control-success' : 'form-control-error';
        }

        return m('.form-group.row', {class: groupClass}, [
            args.isStack
                ? [ 
                    m('.col-sm-12', [
                        args.label != null ? m('label', {class: 'strong'}, args.label) : '',
                        view(ctrl, args, {groupClass: groupClass, inputClass: inputClass}),
                        args.help && m('small.text-muted.m-y-0', args.help )
                    ])
                ]
                : [
                    m((".col-sm-" + colWidth), [
                        m('label.form-control-label', args.label)
                    ]),
                    m((".col-sm-" + (12 - colWidth)), [
                        view(ctrl, args, {groupClass: groupClass, inputClass: inputClass})
                    ]),
                    args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help )
                ]
        ]);
    }; };

    var textInputComponent  = {
        controller: function controller(ref) {
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required; if ( required === void 0 ) required = false;

            var validity = function () { return !required || prop().length; };
            form.register(validity);

            return {validity: validity};
        },

        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var isArea = ref.isArea; if ( isArea === void 0 ) isArea = false;
            var isFirst = ref.isFirst; if ( isFirst === void 0 ) isFirst = false;
            var placeholder = ref.placeholder; if ( placeholder === void 0 ) placeholder = '';
            var rows = ref.rows; if ( rows === void 0 ) rows = 3;
            var inputClass = ref$1.inputClass;

            return !isArea
                ? m('input.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    value: prop(),
                    oninput: m.withAttr('value', prop),
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                })
                : m('textarea.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    oninput: m.withAttr('value', prop),
                    rows: rows,
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                } , [prop()]);
        })
    };

    var  maybeInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;
            var dflt = ref.dflt;

            if (!form) throw new Error('Inputs require a form');

            var text = m.prop(typeof prop() == 'boolean' ? dflt || '' : prop());
            var checked = m.prop(!!prop()); 
            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation,
                text: function(value){
                    if (arguments.length){
                        text(value);
                        prop(value || true);
                    }
                    return text();
                },
                checked: function(value){
                    if (arguments.length) {
                        checked(value);
                        if (checked() && text()) prop(text());
                        else prop(checked());
                    }
                    return checked();
                }   
            };
        },
        view: inputWrapper(function (ref, args) {
            var text = ref.text;
            var checked = ref.checked;

            var placeholder = args.placeholder || '';
            return m('.input-group', [
                m('span.input-group-addon', [
                    m('input', {
                        type:'checkbox',
                        onclick: m.withAttr('checked', checked),
                        checked: checked()
                    })
                ]),
                m('input.form-control', {
                    placeholder: placeholder,
                    value: text(),
                    oninput: m.withAttr('value', text),
                    disabled: !checked()
                })
            ]);
        })
    };

    var  checkboxInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var description = ref.description; if ( description === void 0 ) description = '';
            var groupClass = ref$1.groupClass;
            var inputClass = ref$1.inputClass;

            return m('.checkbox.checkbox-input-group', {class: groupClass}, [
                m('label.c-input.c-checkbox', {class: inputClass}, [
                    m('input.form-control', {
                        type: 'checkbox',
                        onclick: m.withAttr('checked', prop),
                        checked: prop()
                    }),
                    m('span.c-indicator'),
                    m.trust('&nbsp;'),
                    description
                ])
            ]);
        })
    };

    var selectInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            if (!form) throw new Error('Inputs require a form');

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var isFirst = ref.isFirst; if ( isFirst === void 0 ) isFirst = false;
            var values = ref.values; if ( values === void 0 ) values = {};
            var inputClass = ref$1.inputClass;

            var value = prop();
            return m('.input-group', [
                m('select.c-select.form-control', {
                    class: inputClass, 
                    onchange: function (e) { return prop(values[e.target.value]); },
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                }, Object.keys(values).map(function (key) { return m('option', {selected:value === values[key]}, key); }))
            ]);
        })
    };

    /**
     * TransformedProp transformProp(Prop prop, Map input, Map output)
     * 
     * where:
     *  Prop :: m.prop
     *  Map  :: any Function(any)
     *
     *  Creates a Transformed prop that pipes the prop through transformation functions.
     **/
    var transformProp = function (ref) {
        var prop = ref.prop;
        var input = ref.input;
        var output = ref.output;

        var p = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length) prop(input(args[0]));
            return output(prop());
        };

        p.toJSON = function () { return output(prop()); };

        return p;
    };

    var arrayInput = function (args) {
        var identity = function (arg) { return arg; };
        var fixedArgs = Object.assign(args);
        fixedArgs.prop = transformProp({
            prop: args.prop,
            output: function (arr) { return arr.map(args.fromArr || identity).join('\n'); },
            input: function (str) { return str === '' ? [] : str.replace(/\n*$/, '').split('\n').map(args.toArr || identity); }
        });

        return m.component(textInputComponent, fixedArgs);
    };

    var selectInputComponent$1 = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            if (!form) throw new Error('Inputs require a form');

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref) {
            var prop = ref.prop;
            var values = ref.values; if ( values === void 0 ) values = {};

            var keys = Object.keys(values);
            if (keys.length === 1)
                prop(values[keys[0]]);
            return m('.c-inputs-stacked', keys
                .map(function (key) { return m('label.c-input.c-radio', [
                    m('input', {type:'radio', checked: values[key] === prop(), onchange: prop.bind(null, values[key])}),
                    m('span.c-indicator'),
                    key
                ]); }));
        })
    };

    function formFactory(){
        var validationHash = [];
        return {
            register: function register(fn){
                validationHash.push(fn);
            },
            isValid: function isValid() {
                return validationHash.every(function (fn) { return fn.call(); });
            },
            showValidation: m.prop(false)
        };
    }

    var textInput = function (args) { return m.component(textInputComponent, args); };
    var maybeInput = function (args) { return m.component(maybeInputComponent, args); };
    var checkboxInput = function (args) { return m.component(checkboxInputComponent, args); };
    var selectInput = function (args) { return m.component(selectInputComponent, args); };
    var radioInput = function (args) { return m.component(selectInputComponent$1, args); };
    var arrayInput$1 = arrayInput;

    var statisticsForm = function (args) { return m.component(statisticsFormComponent, args); };
    var colWidth = 3;
    var SOURCES = {
        'Research pool - Current studies'   : 'Pool:Current',
        //    'Research pool - Past studies'      : 'Research:History',
        'All research - Pool and lab'       : 'Research:Any',
        'Demo studies'                      : 'Demo:Any',
        'All studies'                       : 'Both:Any'
    };

    var statisticsFormComponent = {
        controller: function controller(){
            var form = formFactory();

            return {form: form};
        },
        view: function view(ref, ref$1){
            var form = ref.form;
            var query = ref$1.query;

            return m('.col-sm-12', [
                selectInput({label: 'Source', prop: query.source, values: SOURCES, form: form, colWidth: colWidth}),
                textInput({label:'Study', prop: query.study , form: form, colWidth: colWidth}),
                m('div', {style: 'padding: .375rem'},
                    [
                        dateRangePicker({startDate:query.startDate, endDate: query.endDate})
                        ,m('small.text-muted',  'The data for the study statistics by day is saved in 24 hour increments by date in USA eastern time (EST).')
                    ]
                ),

                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Show by')
                    ]),
                    m('.col-sm-9.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button(query.sortstudy, 'Study'),
                            button(query.sorttask, 'Task'),
                            m('a.btn.btn-secondary.statistics-time-button', {class: query.sorttime() !== 'All' ? 'active' : ''}, [
                                'Time',
                                m('.time-card', [
                                    m('.card', [
                                        m('.card-header', 'Time filter'),
                                        m('.card-block.c-inputs-stacked', [
                                            radioButton(query.sorttime, 'None'),
                                            radioButton(query.sorttime, 'Days'),
                                            radioButton(query.sorttime, 'Weeks'),
                                            radioButton(query.sorttime, 'Months'),
                                            radioButton(query.sorttime, 'Years')
                                        ])
                                    ])
                                ])
                            ])
                        ]),
                        m('.btn-group.btn-group-sm.pull-right', [
                            button(query.showEmpty, 'Hide Empty', 'Hide Rows with Zero Started Sessions'),
                            button(query.sortgroup, 'Show Data Group')

                        ])
                    ])
                ]),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Compute completions')
                    ]),
                    m('.col-sm-9', [
                        m('.row', [
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                            ]),
                            m('.col-sm-1', [
                                m('.form-control-static', 'to')
                            ]),
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                            ])
                        ])
                    ])
                ])
            ]);
        
        
        }
    };

    var button = function (prop, text, title) {
        if ( title === void 0 ) title = '';

        return m('a.btn.btn-secondary', {
        class: prop() ? 'active' : '',
        onclick: function () { return prop(!prop()); },
        title: title
    }, text);
    };

    var radioButton = function (prop, text) { return m('label.c-input.c-radio', [
        m('input.form-control[type=radio]', {
            onclick: prop.bind(null, text),
            checked: prop() == text
        }),
        m('span.c-indicator'),
        text
    ]); };

    function sortTable(listProp, sortByProp) {
        return function(e) {
            var prop = e.target.getAttribute('data-sort-by');
            var list = listProp();
            if (prop) {
                if (typeof sortByProp == 'function') sortByProp(prop); // record property so that we can change style accordingly
                var first = list[0];
                list.sort(function(a, b) {
                    return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
                });
                if (first === list[0]) list.reverse();
            }
        };
    }

    function formatDate(date){
        var pad = function (num) { return num < 10 ? '0' + num : num; };
        return ((pad(date.getMonth() + 1)) + "\\" + (pad(date.getDate())) + "\\" + (date.getFullYear()));
    }

    var statisticsTable = function (args) { return m.component(statisticsTableComponent, args); };

    var statisticsTableComponent = {
        controller: function controller(){
            return {sortBy: m.prop()};
        },
        view: function view(ref, ref$1){
            var sortBy = ref.sortBy;
            var tableContent = ref$1.tableContent;
            var query = ref$1.query;

            if (query.error())
                return m('.alert.alert-warning', m('strong', 'Error: '), query.error());
            var content = tableContent();
            if (!content) return m('div');
            if (!content.data) return m('.col-sm-12', [
                m('.alert.alert-info', 'There was no data found for this request')
            ]);

            var list = m.prop(content.data);
            return m('.col-sm-12',[
                m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                    m('thead', [
                        m('tr.table-default', [
                            th_option(sortBy, 'studyName', 'Study Name'),
                            !query.sorttask_sent() ? '' : th_option(sortBy, 'taskName', 'Task Name'),
                            query.sorttime_sent()==='All' ? '' : th_option(sortBy, 'date', 'Date'),
                            th_option(sortBy, 'starts', 'Starts'),
                            th_option(sortBy, 'completes', 'Completes'),
                            th_option(sortBy, 'completion_rate', 'Completion Rate %'),
                            !query.sortgroup() ? '' : th_option(sortBy, 'schema', 'Schema')
                        ])
                    ]),
                    m('tbody', [
                        list().map(function (row) { return query.showEmpty() && row.starts===0
                                ?
                                ''
                                :
                                m('tr.table-default', [
                                    m('td', row.studyName),
                                    !query.sorttask_sent() ? '' : m('td', row.taskName),
                                    query.sorttime_sent()==='All' ? '' : m('td', formatDate(new Date(row.date))),
                                    m('td', row.starts),
                                    m('td', row.completes),
                                    m('td', row.completion_rate = row.starts===0 ? 0 : (row.completes/row.starts).toFixed(2)),
                                    !query.sortgroup() ? '' : m('td', row.schema)
                                ]); }
                        )
                    ])
                ])
            ]);
        }
    };

    var th_option = function (sortBy, sortByTxt, text) { return m('th', {
        'data-sort-by':sortByTxt, class: sortBy() === sortByTxt ? 'active' : ''
    }, text); };

    var statisticsInstructions = function () { return m('.text-muted', [
        m('p', 'Choose whether you want participation data from demo studies, research pool, all research studies (including lab studies), or all studies (demo and research).'),
        m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies.'),
        m('p', 'You can also use the Task box to enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks.'),
        m('p', 'You can also choose how you want the data displayed, using the "Show by" options. If you click "Study", you will see data from each study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated by task.  The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.  '),
        m('p', 'You can define how completion rate is calculated by entering text to "First task" and "Last task". Only sessions that visited those tasks would be used for the calculation.'),
        m('p', 'When you choose to show the results by date, you will see all the studies that have at least one session in the requested date range, separated by day, week, month or year. This will also show dates with zero sessions. If you want to hide rows with zero sessions, select the "Hide empty" option.')
    ]); };

    var statisticsComponent = {
        controller: function controller(){
            var displayHelp = m.prop(false);
            var tableContent = m.prop('');

            var loading = m.prop(false);
            var query = {
                source: m.prop('Pool:Current'),
                startDate: m.prop(firstDayInPreviousMonth(new Date())),
                endDate: m.prop(new Date()),
                study: m.prop(''),
                task: m.prop(''),
                studyType: m.prop('Both'),
                studydb: m.prop('Any'),
                sortstudy: m.prop(true),
                sorttask: m.prop(false),
                sorttask_sent: m.prop(false),
                sortgroup: m.prop(false),
                sorttime: m.prop('None'),
                sorttime_sent: m.prop('None'),
                showEmpty: m.prop(false),
                firstTask: m.prop(''),
                lastTask: m.prop(''),
                error: m.prop(''),
                rows:m.prop([])
            };

            return {query: query, submit: submit, displayHelp: displayHelp, tableContent: tableContent,loading: loading};

            function submit(){
                loading(true);
                getStatistics(query)
                    .then(tableContent)
                    .catch(function (response) {
                        query.error(response.message);
                    })
                    .then(loading.bind(null, false))
                    .then(query.sorttask_sent(query.sorttask()))
                    .then(query.sorttime_sent(query.sorttime()))
                    .then(m.redraw);
            }

            function firstDayInPreviousMonth(yourDate) {
                return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
            }
        },
        view: function (ref) {
            var query = ref.query;
            var tableContent = ref.tableContent;
            var submit = ref.submit;
            var displayHelp = ref.displayHelp;
            var loading = ref.loading;

            return m('.container.statistics', [
            m('h3', 'Statistics'),
            m('.row', [
                statisticsForm({query: query})
            ]),
            m('.row', [
                m('.col-sm-12',[
                    m('button.btn.btn-secondary.btn-sm', {onclick: function (){ return displayHelp(!displayHelp()); }}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                    m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                    !tableContent()  ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile(query.study() ? ((query.study()) + ".csv") : 'stats.csv', tableContent(), query)}, 'Download CSV')
                ])
            ]),
            !displayHelp() ? '' : m('.row', [
                m('.col-sm-12.p-a-2', statisticsInstructions())
            ]),
            m('.row.m-t-1', [
                loading()
                    ? m('.loader')
                    : statisticsTable({tableContent: tableContent, query: query})
            ])
        ]);
    }
    };

    var downloadFile = function (filename, text, query) { return function (element) {
        var json = text.data;
        json = !query.showEmpty() ? json : json.filter(function (row) { return row.starts !== 0; });

        var fields = ['studyName', !query.sorttask_sent() ? '' : 'taskName', query.sorttime_sent()==='All' ? '' : 'date', 'starts', 'completes', !query.sortgroup() ? '' : 'schema'].filter(function (n) { return n; });

        var replacer = function(key, value) { return value === null ? '' : value;};
        var csv = json.map(function(row){
            return fields.map(function(fieldName){
                return JSON.stringify(row[fieldName], replacer);
            }).join(',');
        });
        csv.unshift(fields.join(',')); // add header column


        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv.join('\r\n') ));
        element.setAttribute('download', filename);
    }; };

    var getStatistics$1 = function (query) {
        return fetchText(statisticsUrl, {method:'post', body: parseQuery(query)})
            .then(function (response) {
                var csv = response ? CSVToArray$1(response) : [[]];
                return {
                    study: query.study(),
                    file: response,
                    headers: csv.shift(),
                    data: csv,
                    query: Object.assign(query) // clone the query so that we can get back to it in the future
                };
            });

        /**
         * Parses the query as we build it locally and creates an appropriate post for the server
         **/
        function parseQuery(ref){
            var source = ref.source;
            var study = ref.study;
            var task = ref.task;
            var sortstudy = ref.sortstudy;
            var sorttask = ref.sorttask;
            var sortgroup = ref.sortgroup;
            var sorttime = ref.sorttime;
            var showEmpty = ref.showEmpty;
            var startDate = ref.startDate;
            var endDate = ref.endDate;
            var firstTask = ref.firstTask;
            var lastTask = ref.lastTask;

            var baseUrl$$1 = (location.origin) + "/implicit";
            var post = {
                db: source().match(/^(.*?):/)[1], // before colon
                current: source().match(/:(.*?)$/)[1], // after colon
                testDB:'newwarehouse',
                study: study(),
                task: task(),
                since: parseDate(startDate()),
                until: parseDate(endDate()),
                refresh: 'no',
                startTask: firstTask(),
                endTask: lastTask(),
                filter:'',
                studyc:sortstudy(),
                taskc:sorttask(),
                datac:sortgroup(),
                timec:sorttime() !== 'None',
                dayc:sorttime() === 'Days',
                weekc:sorttime() === 'Weeks',
                monthc:sorttime() === 'Months',
                yearc:sorttime() === 'Years',
                method:'3',
                cpath:'',
                hpath:'',
                tasksM:'3',
                threads:'yes',
                threadsNum:'1',
                zero: showEmpty(),
                curl:(baseUrl$$1 + "/research/library/randomStudiesConfig/RandomStudiesConfig.xml"),
                hurl:(baseUrl$$1 + "/research/library/randomStudiesConfig/HistoryRand.xml"),
                baseURL:baseUrl$$1
            };
            return post;

            function parseDate(date){
                if (!date) return;
                return ((date.getMonth()+1) + "/" + (date.getDate()) + "/" + (date.getYear() + 1900));
            }
        } 
    };


    /* eslint-disable */

    // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray$1( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }
    /* eslint-enable */

    var statisticsForm$1 = function (args) { return m.component(statisticsFormComponent$1, args); };
    var colWidth$1 = 3;
    var SOURCES$1 = {
        'Research pool - Current studies'   : 'Research:Current',
        //    'Research pool - Past studies'      : 'Research:History',
        'All research - Pool and lab'       : 'Research:Any',
        'Demo studies'                      : 'Demo:Any',
        'All studies'                       : 'Both:Any'
    };

    var statisticsFormComponent$1 = {
        controller: function controller(){
            var form = formFactory();

            return {form: form};
        },
        view: function view(ref, ref$1){
            var form = ref.form;
            var query = ref$1.query;

            return m('.col-sm-12', [
                selectInput({label: 'Source', prop: query.source, values: SOURCES$1, form: form, colWidth: colWidth$1}),
                textInput({label:'Study', prop: query.study , form: form, colWidth: colWidth$1}),
                textInput({label:'Task', prop: query.task , form: form, colWidth: colWidth$1}),
                m('div', {style: 'padding: .375rem .75rem'}, dateRangePicker({startDate:query.startDate, endDate: query.endDate})),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Show by')
                    ]),
                    m('.col-sm-9.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button$1(query.sortstudy, 'Study'),
                            button$1(query.sorttask, 'Task'),
                            m('a.btn.btn-secondary.statistics-time-button', {class: query.sorttime() !== 'None' ? 'active' : ''}, [
                                'Time',
                                m('.time-card', [
                                    m('.card', [
                                        m('.card-header', 'Time filter'),
                                        m('.card-block.c-inputs-stacked', [
                                            radioButton$1(query.sorttime, 'None'),
                                            radioButton$1(query.sorttime, 'Days'),
                                            radioButton$1(query.sorttime, 'Weeks'),
                                            radioButton$1(query.sorttime, 'Months'),
                                            radioButton$1(query.sorttime, 'Years')
                                        ])
                                    ])
                                ])
                            ]),
                            button$1(query.sortgroup, 'Data Group')
                        ]),
                        m('.btn-group.btn-group-sm.pull-right', [
                            button$1(query.showEmpty, 'Hide empty', 'Hide Rows with Zero Started Sessions')
                        ])
                    ])
                ]),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Compute completions')
                    ]),
                    m('.col-sm-9', [
                        m('.row', [
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                            ]),
                            m('.col-sm-1', [
                                m('.form-control-static', 'to')
                            ]),
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                            ])
                        ])
                    ])
                ])
            ]);
        
        
        }
    };

    var button$1 = function (prop, text, title) {
        if ( title === void 0 ) title = '';

        return m('a.btn.btn-secondary', {
        class: prop() ? 'active' : '',
        onclick: function () { return prop(!prop()); },
        title: title
    }, text);
    };

    var radioButton$1 = function (prop, text) { return m('label.c-input.c-radio', [
        m('input.form-control[type=radio]', {
            onclick: prop.bind(null, text),
            checked: prop() == text
        }),
        m('span.c-indicator'),
        text
    ]); };

    var statisticsTable$1 = function (args) { return m.component(statisticsTableComponent$1, args); };

    var statisticsTableComponent$1 = {
        controller: function controller(){
            return {sortBy: m.prop()};
        },
        view: function view(ref, ref$1){
            var sortBy = ref.sortBy;
            var tableContent = ref$1.tableContent;

            var content = tableContent();
            if (!content) return m('div'); 
            if (!content.file) return m('.col-sm-12', [
                m('.alert.alert-info', 'There was no data found for this request')            
            ]);

            var list = m.prop(content.data);
            
            return m('.col-sm-12', [
                m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                    m('thead', [
                        m('tr.table-default', tableContent().headers.map(function (header,index) { return m('th',{'data-sort-by':index, class: sortBy() === index ? 'active' : ''}, header); }))
                    ]),
                    m('tbody', tableContent().data.map(function (row) { return m('tr', !row.length ? '' : row.map(function (column) { return m('td', column); })); }))
                ])
            ]);
        }
    };

    var statisticsInstructions$1 = function () { return m('.text-muted', [
        m('p', 'Choose whether you want participation data from demo studies, research pool, all research studies (including lab studies), or all studies (demo and research).'),
        m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies.'),
        m('p', 'You can also use the Task box to enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks.'),
        m('p', 'You can also choose how you want the data displayed, using the "Show by" options. If you click "Study", you will see data from each study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated by task.  The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.  '),
        m('p', 'You can define how completion rate is calculated by entering text to "First task" and "Last task". Only sessions that visited those tasks would be used for the calculation.'),
        m('p', 'When you choose to show the results by date, you will see all the studies that have at least one session in the requested date range, separated by day, week, month or year. This will also show dates with zero sessions. If you want to hide rows with zero sessions, select the "Hide empty" option.')
    ]); };

    var statisticsComponent$1 = {
        controller: function controller(){
            var displayHelp = m.prop(false);
            var tableContent = m.prop();
            var loading = m.prop(false);
            var query = {
                source: m.prop('Research:Current'),
                startDate: m.prop(firstDayInPreviousMonth(new Date())),
                endDate: m.prop(new Date()),
                study: m.prop(''),
                task: m.prop(''),
                studyType: m.prop('Both'),
                studydb: m.prop('Any'),
                sortstudy: m.prop(true),
                sorttask: m.prop(false),
                sortgroup: m.prop(false),
                sorttime: m.prop('None'),
                showEmpty: m.prop(false),
                firstTask: m.prop(''),
                lastTask: m.prop('')
            };

            return {query: query, submit: submit, displayHelp: displayHelp, tableContent: tableContent,loading: loading};

            function submit(){
                loading(true);
                getStatistics$1(query)
                    .then(tableContent)
                    .then(loading.bind(null, false))
                    .then(m.redraw);
            }

            function firstDayInPreviousMonth(yourDate) {
                return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
            }
        },
        view: function (ref) {
            var query = ref.query;
            var tableContent = ref.tableContent;
            var submit = ref.submit;
            var displayHelp = ref.displayHelp;
            var loading = ref.loading;

            return m('.container.statistics', [
            m('h3', 'Statistics'),
            m('.row', [
                statisticsForm$1({query: query})
            ]),
            m('.row', [
                m('.col-sm-12',[
                    m('button.btn.btn-secondary.btn-sm', {onclick: function (){ return displayHelp(!displayHelp()); }}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                    m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                    !tableContent() || !tableContent().file ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile$1(((tableContent().study) + ".csv"), tableContent().file)}, 'Download CSV')
                ])
            ]),
            !displayHelp() ? '' : m('.row', [
                m('.col-sm-12.p-a-2', statisticsInstructions$1())
            ]),
            m('.row.m-t-1', [
                loading()
                    ? m('.loader')
                    : statisticsTable$1({tableContent: tableContent})
            ])
        ]);
    }
    };

    var downloadFile$1 = function (filename, text) { return function (element) {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    }; };

    var STATUS_RUNNING = 'R';
    var STATUS_PAUSED = 'P';
    var STATUS_STOP = 'S';

    function createStudy(study){
        var body = Object.assign({
            action:'insertRulesTable',
            creationDate: new Date(),
            studyStatus: STATUS_RUNNING
        }, study);

        return fetchJson(poolUrl, {method: 'post', body: body})
            .then(interceptErrors);
    }

    function updateStudy(study){
        var body = Object.assign({
            action:'updateRulesTable'
        }, study);

        return  fetchJson(poolUrl, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function updateStatus(study, status){
        var body = Object.assign({
            action:'updateStudyStatus'
        }, study,{studyStatus: status});

        return  fetchJson(poolUrl, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function getAllPoolStudies(){
        return fetchJson(poolUrl, {method:'post', body: {action:'getAllPoolStudies'}})
            .then(interceptErrors);
    }

    function getLast100PoolUpdates(){
        return fetchJson(poolUrl, {method:'post', body: {action:'getLast100PoolUpdates'}})
            .then(interceptErrors);
    }

    function getStudyId(study){
        var body = Object.assign({
            action:'getStudyId'
        }, study);

        return  fetchJson(poolUrl, {method: 'post',body:body});
    }

    function resetStudy(study){
        return fetchJson(poolUrl, {method:'post', body: Object.assign({action:'resetCompletions'}, study)})
            .then(interceptErrors);
    }

    function interceptErrors(response){
        if (!response.error){
            return response;
        }

        var errors = {
            1: 'This ID already exists.',
            2: 'The study could not be found.',
            3: 'The rule file could not be found.',
            4: 'The rules file does not fit the "research" schema.'
        };

        return Promise.reject({message: errors[response.error]});
    }

    var noop$1 = function (){};

    var messages = {
        vm: {isOpen: false},

        open: function (type, opts) {
            if ( opts === void 0 ) opts={};

            var promise = new Promise(function (resolve, reject) {
                messages.vm = {resolve: resolve,reject: reject,type: type, opts: opts, isOpen:true};
            });
            m.redraw();

            return promise;
        },

        close: function (response) {
            var vm = messages.vm;
            vm.isOpen = false;
            if (typeof vm.resolve === 'function') vm.resolve(response);
            m.redraw();
        },

        custom: function (opts){ return messages.open('custom', opts); },
        alert: function (opts) { return messages.open('alert', opts); },
        confirm: function (opts) { return messages.open('confirm', opts); },
        prompt: function (opts) { return messages.open('prompt', opts); },

        view: function () {
            var vm = messages.vm;
            var close = messages.close.bind(null, null);
            var stopPropagation = function (e) { return e.stopPropagation(); };
            return m('#messages.backdrop', [
                !vm || !vm.isOpen
                    ? ''
                    :[
                        m('.overlay', {config:messages.config(vm.opts)}),
                        m('.backdrop-content', {onclick:close}, [
                            m('.card', {class: vm.opts.wide ? 'col-sm-8' : 'col-sm-5', config:maxHeight}, [
                                m('.card-block', {onclick: stopPropagation}, [
                                    messages.views[vm.type](vm.opts)
                                ])
                            ])
                        ])
                    ]
            ]);

        },

        config: function (opts) {
            return function (element, isInitialized, context) {
                if (!isInitialized) {
                    var handleKey = function(e) {
                        if (e.keyCode == 27) {
                            messages.close(null);
                        }
                        if (e.keyCode == 13 && !opts.preventEnterSubmits) {
                            messages.close(true);
                        }
                    };

                    document.body.addEventListener('keyup', handleKey);

                    context.onunload = function() {
                        document.body.removeEventListener('keyup', handleKey);
                    };
                }
            };
        },

        views: {
            custom: function (opts) {
                if ( opts === void 0 ) opts={};

                return opts.content;
    },

            alert: function (opts) {
                if ( opts === void 0 ) opts={};

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', opts.header),
                    m('p.card-text', opts.content),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
                    ])
                ];
            },

            confirm: function (opts) {
                if ( opts === void 0 ) opts={};

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', opts.header),
                    m('p.card-text', opts.content),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.cancelText || 'Cancel'),
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
                    ])
                ];
            },

            /**
             * Promise prompt(Object opts{header: String, content: String, name: Prop})
             *
             * where:
             *   any Prop(any value)
             */
            prompt: function (ref) {
                if ( ref === void 0 ) ref={prop:noop$1};
                var prop = ref.prop;
                var header = ref.header;
                var content = ref.content;
                var postContent = ref.postContent;
                var okText = ref.okText;
                var cancelText = ref.cancelText;

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', header),
                    m('.card-text', content),
                    m('.card-block', [
                        m('input.form-control', {
                            key: 'prompt',
                            value: prop(),
                            onchange: m.withAttr('value', prop),
                            config: function (element, isInitialized) {
                                if (!isInitialized) setTimeout(function () { return element.focus(); });
                            }
                        })
                    ]),
                    m('.card-text', postContent),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-secondary.btn-sm', {onclick:close(null)}, cancelText || 'Cancel'),
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, okText || 'OK')
                    ])
                ];
            }
        }
    };

    // set message max height, so that content can scroll within it.
    var maxHeight = function (element, isInitialized, ctx) {
        if (!isInitialized){
            onResize();

            window.addEventListener('resize', onResize, true);

            ctx.onunload = function(){
                window.removeEventListener('resize', onResize);
            };

        }

        function onResize(){
            element.style.maxHeight = document.documentElement.clientHeight * 0.9 + 'px';
        }
    };

    var spinner = {
        display: m.prop(false),
        show: function show(response){
            spinner.display(true);
            m.redraw();
            return response;
        },
        hide: function hide(response){
            spinner.display(false);
            m.redraw();
            return response;
        },
        view: function view(){
            return m('.backdrop', {hidden:!spinner.display()}, // spinner.show()
                m('.overlay'),
                m('.backdrop-content.spinner.icon.fa.fa-cog.fa-spin')
            );
        }
    };

    // taken from here:
    // https://github.com/JedWatson/classnames/blob/master/index.js
    var hasOwn = {}.hasOwnProperty;

    function classNames () {
        var arguments$1 = arguments;

        var classes = '';

        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments$1[i];
            if (!arg) continue;

            var argType = typeof arg;

            if (argType === 'string' || argType === 'number') {
                classes += ' ' + arg;
            } else if (Array.isArray(arg)) {
                classes += ' ' + classNames.apply(null, arg);
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes += ' ' + key;
                    }
                }
            }
        }

        return classes.substr(1);
    }

    /**
     * Create edit component
     * Promise editMessage({input:Object, output:Prop})
     */
    var editMessage = function (args) { return messages.custom({
        content: m.component(editComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var editComponent = {
        controller: function controller(ref){
            var input = ref.input;
            var output = ref.output;
            var close = ref.close;

            var study = ['rulesUrl', 'targetCompletions', 'autopauseUrl', 'userEmail'].reduce(function (study, prop){
                study[prop] = m.prop(input[prop] || '');
                return study;
            }, {});

            // export study to calling component
            output(study);


            var ctrl = {
                study: study,
                submitAttempt: false,
                validity: function validity(){
                    var isEmail = function (str)  { return /\S+@\S+\.\S+/.test(str); };
                    var isNormalInteger = function (str) { return /^\+?(0|[1-9]\d*)$/.test(str); };

                    var response = {
                        rulesUrl: study.rulesUrl(),
                        targetCompletions: isNormalInteger(study.targetCompletions()),
                        autopauseUrl: study.autopauseUrl(),
                        userEmail: isEmail(study.userEmail())

                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) {
                        study.targetCompletions(+study.targetCompletions());// targetCompletions should be cast as a number
                        close(true);
                    }
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl, ref){
            var input = ref.input;

            var study = ctrl.study;
            var validity = ctrl.validity();
            var miniButtonView = function (prop, name, url) { return m('button.btn.btn-secondary.btn-sm', {onclick: prop.bind(null,url)}, name); };
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Study Editor'),
                m('.card-block', [
                    m('.form-group', [
                        m('label', 'Study ID'),
                        m('p',[
                            m('strong.form-control-static', input.studyId)
                        ])

                    ]),
                    m('.form-group', [
                        m('label', 'Study URL'),
                        m('p',[
                            m('strong.form-control-static', input.studyUrl)
                        ])
                    ]),

                    m('.form-group', {class:groupClasses(validity.rulesUrl)}, [
                        m('label', 'Rules File URL'),
                        m('input.form-control', {
                            config: focusConfig,
                            placeholder:'Rules file URL',
                            value: study.rulesUrl(),
                            oninput: m.withAttr('value', study.rulesUrl),
                            class:inputClasses(validity.rulesUrl)
                        }),
                        m('p.text-muted.btn-toolbar', [
                            miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml')
                        ]),
                        validationView(validity.rulesUrl, 'This row is required')
                    ]),
                    m('.form-group', {class:groupClasses(validity.autopauseUrl)}, [
                        m('label', 'Auto-pause file URL'),
                        m('input.form-control', {
                            placeholder:'Auto pause file URL',
                            value: study.autopauseUrl(),
                            oninput: m.withAttr('value', study.autopauseUrl),
                            class:inputClasses(validity.autopauseUrl)
                        }),
                        m('p.text-muted.btn-toolbar', [
                            miniButtonView(study.autopauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'),
                            miniButtonView(study.autopauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'),
                            miniButtonView(study.autopauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')
                        ]),
                        validationView(validity.autopauseUrl, 'This row is required')
                    ]),
                    m('.form-group', {class:groupClasses(validity.targetCompletions)}, [
                        m('label','Target number of sessions'),
                        m('input.form-control', {
                            type:'number',
                            placeholder:'Target Sessions',
                            value: study.targetCompletions(),
                            oninput: m.withAttr('value', study.targetCompletions),
                            onclick: m.withAttr('value', study.targetCompletions),
                            class:inputClasses(validity.targetCompletions)
                        }),
                        validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')
                    ]),
                    m('.form-group', {class:groupClasses(validity.userEmail)}, [
                        m('label','User Email'),
                        m('input.form-control', {
                            type:'email',
                            placeholder:'Email',
                            value: study.userEmail(),
                            oninput: m.withAttr('value', study.userEmail),
                            class:inputClasses(validity.userEmail)
                        }),
                        validationView(validity.userEmail, 'This row is required and must be a valid Email')
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    /**
     * Create edit component
     * Promise editMessage({output:Prop})
     */
    var createMessage = function (args) { return messages.custom({
        content: m.component(createComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var study = output({
                studyUrl: m.prop('')
            });

            var ctrl = {
                study: study,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyUrl: study.studyUrl()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });
                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var study = ctrl.study;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Create Study'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyUrl)}, [
                        m('label', 'Study URL'),
                        m('input.form-control', {
                            config: focusConfig$1,
                            placeholder:'Study URL',
                            value: study.studyUrl(),
                            oninput: m.withAttr('value', study.studyUrl),
                            class:inputClasses(validity.studyUrl)
                        }),
                        validationView(validity.studyUrl, 'This row is required')
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'Proceed')
                ])
            ]);
        }
    };

    var focusConfig$1 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play(study){
        return messages.confirm({
            header: 'Continue Study:',
            content: ("Are you sure you want to continue \"" + (study.studyId) + "\"?")
        })
            .then(function (response) {
                if(response) {
                    studyPending(study, true)();
                    return updateStatus(study, STATUS_RUNNING)
                        .then(function (){ return study.studyStatus = STATUS_RUNNING; })
                        .catch(reportError('Continue Study'))
                        .then(studyPending(study, false));
                }
            });
    }

    function pause(study){
        return messages.confirm({
            header: 'Pause Study:',
            content: ("Are you sure you want to pause \"" + (study.studyId) + "\"?")
        })
            .then(function (response) {
                if(response) {
                    studyPending(study, true)();
                    return updateStatus(study, STATUS_PAUSED)
                        .then(function (){ return study.studyStatus = STATUS_PAUSED; })
                        .catch(reportError('Pause Study'))
                        .then(studyPending(study, false));
                }
            });
    }

    var remove  = function (study, list) {
        return messages.confirm({
            header: 'Remove Study:',
            content: ("Are you sure you want to remove \"" + (study.studyId) + "\" from the pool?")
        })
            .then(function (response) {
                if(response) {
                    studyPending(study, true)();
                    return updateStatus(study, STATUS_STOP)
                        .then(function () { return list(list().filter(function (el) { return el !== study; })); })
                        .catch(reportError('Remove Study'))
                        .then(studyPending(study, false));
                }
            });
    };

    var edit  = function (input) {
        var output = m.prop();
        return editMessage({input: input, output: output})
            .then(function (response) {
                if (response) {
                    studyPending(input, true)();
                    var study = Object.assign({}, input, unPropify(output()));
                    return updateStudy(study)
                        .then(function () { return Object.assign(input, study); }) // update study in view
                        .catch(reportError('Study Editor'))
                        .then(studyPending(input, false));
                }
            });
    };

    var create = function (list) {
        var output = m.prop();
        return createMessage({output: output})
            .then(function (response) {
                if (response) {
                    spinner.show();
                    getStudyId(output())
                        .then(function (response) { return Object.assign(unPropify(output()), response); }) // add response data to "newStudy"
                        .then(spinner.hide)
                        .then(editNewStudy);
                }
            });

        function editNewStudy(input){
            var output = m.prop();
            return editMessage({input: input, output: output})
                .then(function (response) {
                    if (response) {
                        var study = Object.assign({
                            startedSessions: 0,
                            completedSessions: 0,
                            creationDate:new Date(),
                            studyStatus: STATUS_RUNNING
                        }, input, unPropify(output()));
                        return createStudy(study)
                            .then(function () { return list().push(study); })
                            .then(m.redraw)
                            .catch(reportError('Create Study'));
                    }
                });
        }
    };

    var reset = function (study) {
        messages.confirm({
            header: 'Restart study',
            content: 'Are you sure you want to restart this study? This action will reset all started and completed sessions.'
        }).then(function (response) {
            if (response) {
                var old = {
                    startedSessions: study.startedSessions,
                    completedSessions: study.completedSessions
                };
                study.startedSessions = study.completedSessions = 0;
                m.redraw();
                return resetStudy(study)
                    .catch(function (response) {
                        Object.assign(study, old);
                        return Promise.reject(response);
                    })
                    .catch(reportError('Restart study'));
            }
        });
    };

    var reportError = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var studyPending = function (study, state) { return function () {
        study.$pending = state;
        m.redraw();
    }; };

    var unPropify = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var loginUrl = baseUrl + "/connect";
    var logoutUrl = baseUrl + "/logout";
    var is_logedinUrl = baseUrl + "/is_loggedin";

    var login = function (username, password) { return fetchJson(loginUrl, {
        method: 'post',
        body: {username: username, password: password}
    }); };

    var logout = function () { return fetchVoid(logoutUrl, {method:'post'}).then(getAuth); };

    var getAuth = function () { return fetchJson(is_logedinUrl, {
        method: 'get'
    }); };

    var PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
    var TABLE_WIDTH = 8;

    var poolComponent = {
        controller: function () {
            var ctrl = {
                play: play, pause: pause, remove: remove, edit: edit, reset: reset, create: create,
                canCreate: false,
                list: m.prop([]),
                globalSearch: m.prop(''),
                sortBy: m.prop(),
                error: m.prop(''),
                loaded: m.prop()
            };

            getAuth().then(function (response) {ctrl.canCreate = response.role === 'SU';});
            getAllPoolStudies()
                .then(ctrl.list)
                .then(ctrl.loaded)
                .catch(ctrl.error)
                .then(m.redraw);
            return ctrl;
        },
        view: function (ctrl) {
            var list = ctrl.list;
            return m('.pool', [
                m('h2', 'Study pool'),
                ctrl.error()
                    ?
                    m('.alert.alert-warning',
                        m('strong', 'Warning!! '), ctrl.error().message
                    )
                    :
                    m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                        m('thead', [
                            m('tr', [
                                m('th', {colspan:TABLE_WIDTH - 1}, [
                                    m('input.form-control', {placeholder: 'Global Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                                ]),
                                m('th', [
                                    m('a.btn.btn-secondary', {href:'/pool/history', config:m.route}, [
                                        m('i.fa.fa-history'), '  History'
                                    ])
                                ])
                            ]),
                            ctrl.canCreate ? m('tr', [
                                m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                                    m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
                                        m('i.fa.fa-plus'), '  Add new study'
                                    ])
                                ])
                            ]) : '',
                            m('tr', [
                                m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
                                m('th', thConfig('studyUrl',ctrl.sortBy), 'Study'),
                                m('th', thConfig('rulesUrl',ctrl.sortBy), 'Rules'),
                                m('th', thConfig('autopauseUrl',ctrl.sortBy), 'Autopause'),
                                m('th', thConfig('completedSessions',ctrl.sortBy), 'Completion'),
                                m('th', thConfig('creationDate',ctrl.sortBy), 'Date'),
                                m('th','Status'),
                                m('th','Actions')
                            ])
                        ]),
                        m('tbody', [
                            list().length === 0
                                ?
                                m('tr.table-info',
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH},
                                        m('strong', 'Heads up! '), 
                                        ctrl.loaded()
                                            ? 'None of your studies is in the Research Pool right now'
                                            : 'Loading...'
                                    )
                                )
                                :
                                list().filter(studyFilter(ctrl)).map(function (study) { return m('tr', [
                                    // ### ID
                                    m('td', study.studyId),

                                    // ### Study url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL + study.studyUrl, target: '_blank'}, 'Study')
                                    ]),

                                    // ### Rules url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL + study.rulesUrl, target: '_blank'}, 'Rules')
                                    ]),

                                    // ### Autopause url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL + study.autopauseUrl, target: '_blank'}, 'Autopause')
                                    ]),

                                    // ### Completions
                                    m('td', [
                                        study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ',
                                        m('i.fa.fa-info-circle'),
                                        m('.info-box', [
                                            m('.card', [
                                                m('.card-header', 'Completion Details'),
                                                m('ul.list-group.list-group-flush',[
                                                    m('li.list-group-item', [
                                                        m('strong', 'Target Completions: '), study.targetCompletions
                                                    ]),
                                                    m('li.list-group-item', [
                                                        m('strong', 'Started Sessions: '), study.startedSessions
                                                    ]),
                                                    m('li.list-group-item', [
                                                        m('strong', 'Completed Sessions: '), study.completedSessions
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ]),

                                    // ### Date
                                    m('td', formatDate(new Date(study.creationDate))),

                                    // ### Status
                                    m('td', [
                                        {
                                            R: m('span.label.label-success', 'Running'),
                                            P: m('span.label.label-info', 'Paused'),
                                            S: m('span.label.label-danger', 'Stopped')
                                        }[study.studyStatus]
                                    ]),

                                    // ### Actions
                                    m('td', [
                                        study.$pending
                                            ?
                                            m('.l', 'Loading...')
                                            :
                                            m('.btn-group', [
                                                study.canUnpause && study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.play.bind(null, study)}, [
                                                    m('i.fa.fa-play')
                                                ]) : '',
                                                study.canPause && study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.pause.bind(null, study)}, [
                                                    m('i.fa.fa-pause')
                                                ]) : '',
                                                study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.edit.bind(null, study)}, [
                                                    m('i.fa.fa-edit')
                                                ]): '',
                                                study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.reset.bind(null, study)}, [
                                                    m('i.fa.fa-refresh')
                                                ]) : '',
                                                study.canStop ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, study, list)}, [
                                                    m('i.fa.fa-close')
                                                ]) : ''
                                            ])
                                    ])
                                ]); })
                        ])
                    ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter(ctrl){
        return function (study) { return includes(study.studyId, ctrl.globalSearch()) ||
            includes(study.studyUrl, ctrl.globalSearch()) ||
            includes(study.rulesUrl, ctrl.globalSearch()); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var PRODUCTION_URL$1 = 'https://implicit.harvard.edu/implicit/';
    var poolComponent$1 = {
        controller: function () {
            var ctrl = {
                list: m.prop([]),
                globalSearch: m.prop(''),
                startDate: m.prop(new Date(0)),
                endDate: m.prop(new Date()),
                sortBy: m.prop()
            };

            getLast100PoolUpdates()
                .then(ctrl.list)
                .then(m.redraw);

            return ctrl;
        },
        view: function (ctrl) {
            var list = ctrl.list;
            return m('.pool', [
                m('h2', 'Pool history'),
                m('.row', {colspan:8}, [
                    m('.col-sm-3',[
                        m('label', 'Search'),
                        m('input.form-control', {placeholder: 'Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                    ]),
                    m('.col-sm-4',[
                        dateRangePicker(ctrl)
                    ]),
                    m('.col-sm-5',[
                        m('label', m.trust('&nbsp')),
                        m('.text-muted.btn-toolbar', [
                            dayButtonView(ctrl, 'Last 7 Days', 7),
                            dayButtonView(ctrl, 'Last 30 Days', 30),
                            dayButtonView(ctrl, 'Last 90 Days', 90),
                            dayButtonView(ctrl, 'All time', 3650)
                        ])
                    ])
                ]) ,
                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$1('studyId',ctrl.sortBy), 'ID'),
                            m('th', thConfig$1('studyUrl',ctrl.sortBy), 'Study'),
                            m('th', thConfig$1('rulesUrl',ctrl.sortBy), 'Rules'),
                            m('th', thConfig$1('autopauseUrl',ctrl.sortBy), 'Autopause'),     
                            m('th', thConfig$1('creationDate',ctrl.sortBy), 'Creation Date'),
                            m('th', thConfig$1('completedSessions',ctrl.sortBy), 'Completion'),
                            m('th','New Status'),
                            m('th','Old Status'),
                            m('th', thConfig$1('updaterId',ctrl.sortBy), 'Updater')
                        ])
                    ]),
                    m('tbody', [
                        list().filter(studyFilter$1(ctrl)).map(function (study) { return m('tr', [
                            // ### ID
                            m('td', study.studyId),

                            // ### Study url
                            m('td', [
                                m('a', {href:PRODUCTION_URL$1 + study.studyUrl, target: '_blank'}, 'Study')
                            ]),

                            // ### Rules url
                            m('td', [
                                m('a', {href:PRODUCTION_URL$1 + study.rulesUrl, target: '_blank'}, 'Rules')
                            ]),

                            // ### Autopause url
                            m('td', [
                                m('a', {href:PRODUCTION_URL$1 + study.autopauseUrl, target: '_blank'}, 'Autopause')
                            ]),
                            
                        

                            // ### Date
                            m('td', formatDate(new Date(study.creationDate))),
                            
                            // ### Target Completionss
                            m('td', [
                                study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ',
                                m('i.fa.fa-info-circle'),
                                m('.card.info-box', [
                                    m('.card-header', 'Completion Details'),
                                    m('ul.list-group.list-group-flush',[
                                        m('li.list-group-item', [
                                            m('strong', 'Target Completions: '), study.targetCompletions
                                        ]),
                                        m('li.list-group-item', [
                                            m('strong', 'Started Sessions: '), study.startedSessions
                                        ]),
                                        m('li.list-group-item', [
                                            m('strong', 'Completed Sessions: '), study.completedSessions
                                        ])
                                    ])
                                ])
                            ]),

                            // ### New Status
                            m('td', [
                                {
                                    R: m('span.label.label-success', 'Running'),
                                    P: m('span.label.label-info', 'Paused'),
                                    S: m('span.label.label-danger', 'Stopped')
                                }[study.newStatus]
                            ]),
                            // ### Old Status
                            m('td', [
                                {
                                    R: m('span.label.label-success', 'Running'),
                                    P: m('span.label.label-info', 'Paused'),
                                    S: m('span.label.label-danger', 'Stopped')
                                }[study.studyStatus]
                            ]),
                            m('td', study.updaterId)
                        ]); })
                    ])
                ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$1 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$1(ctrl){
        return function (study) { return (includes(study.studyId, ctrl.globalSearch()) ||    includes(study.updaterId, ctrl.globalSearch()) || includes(study.rulesUrl, ctrl.globalSearch())
                || includes(study.targetCompletions, ctrl.globalSearch()))
            && (new Date(study.creationDate)).getTime() >= ctrl.startDate().getTime()
        && (new Date(study.creationDate)).getTime() <= ctrl.endDate().getTime()+86000000; }; //include the end day selected

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var dayButtonView = function (ctrl, name, days) { return m('button.btn.btn-secondary.btn-sm', {onclick: function () {
        var d = new Date();
        d.setDate(d.getDate() - days);
        ctrl.startDate(d);
        ctrl.endDate(new Date());
    }}, name); };

    var STATUS_RUNNING$1 = 'R';
    var STATUS_COMPLETE = 'C';
    var STATUS_ERROR = 'X';

    var getAllDownloads = function () { return fetchJson(downloadsUrl, {
        method:'post',
        body: {action:'getAllDownloads'}
    }).then(interceptErrors$1); };

    var removeDownload = function (download) { return fetchVoid(downloadsUrl, {
        method:'post',
        body: Object.assign({action:'removeDownload'}, download)
    }).then(interceptErrors$1); };

    var createDownload = function (download) { return fetchVoid(downloadsUrl, {
        method: 'post',
        body: Object.assign({action:'download'}, download)
    }).then(interceptErrors$1); };

    function interceptErrors$1(response){
        if (!response || !response.error){
            return response;
        }

        return Promise.reject({message: response.msg});
    }

    function createMessage$1 (args) { return messages.custom({
        content: m.component(createComponent$1, Object.assign({close:messages.close}, args)),
        wide: true
    }); }

    var createComponent$1 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var download ={
                studyId: m.prop(''),
                db: m.prop('test'),
                startDate: m.prop(daysAgo(3650)),
                endDate: m.prop(new Date())
            };

            // export study to calling component
            output(download);

            var ctrl = {
                download: download,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: download.studyId()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) {
                        download.endDate(endOfDay(download.endDate())); 
                        close(true);
                    }
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;

            function endOfDay(date){
                if (date) return new Date(date.setHours(23,59,59,999));
            }
        },
        view: function view(ctrl){
            var download = ctrl.download;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Request Data'),
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-6', [
                            m('.form-group', {class:groupClasses(validity.studyId)}, [
                                m('label', 'Study ID'),
                                m('input.form-control', {
                                    config: focusConfig$2,
                                    placeholder:'Study Id',
                                    value: download.studyId(),
                                    oninput: m.withAttr('value', download.studyId),
                                    class:inputClasses(validity.studyId)
                                }),
                                validationView(validity.studyId, 'The study ID is required in order to request a download.')
                            ])   
                        ]),
                        m('.col-sm-6', [
                            m('.form-group', [
                                m('label','Database'),
                                m('select.form-control.c-select', {onchange: m.withAttr('value',download.db)}, [
                                    m('option',{value:'test', selected: download.db() === 'test'}, 'Development'),
                                    m('option',{value:'warehouse', selected: download.db() === 'warehouse'}, 'Production')
                                ])
                            ])
                        ])
                    ]),
                    m('.row', [
                        m('.col-sm-12', [
                            m('.form-group', [
                                dateRangePicker(download),
                                m('p.text-muted.btn-toolbar', [
                                    dayButtonView$1(download, 'Last 7 Days', 7),
                                    dayButtonView$1(download, 'Last 30 Days', 30),
                                    dayButtonView$1(download, 'Last 90 Days', 90),
                                    dayButtonView$1(download, 'All time', 3650)
                                ])
                            ])
                        ])
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$2 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    // helper functions for the day buttons
    var daysAgo = function (days) {
        var d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    };
    var equalDates = function (date1, date2) { return date1.getDate() === date2.getDate(); };
    var activeDate = function (ref, days) {
        var startDate = ref.startDate;
        var endDate = ref.endDate;

        return equalDates(startDate(), daysAgo(days)) && equalDates(endDate(), new Date());
    };

    var dayButtonView$1 = function (download, name, days) { return m('button.btn.btn-secondary.btn-sm', {
        class: activeDate(download, days)? 'active' : '',
        onclick: function () {
            download.startDate(daysAgo(days));
            download.endDate(new Date());
        }
    }, name); };

    var DURATION = 5000;

    /**
     * Get all downloads
     */

    var recursiveGetAll = debounce(getAll, DURATION);
    function getAll(ref){
        var list = ref.list;
        var cancel = ref.cancel;
        var error = ref.error;
        var loaded = ref.loaded;

        return getAllDownloads()
            .then(list)
            .then(function (response) {
                if (!cancel() && response.some(function (download) { return download.studyStatus === STATUS_RUNNING$1; })) {
                    recursiveGetAll({list: list, cancel: cancel, error: error, loaded: loaded});
                }
            })
            .catch(error)
            .then(function(){loaded(true);})
            .then(m.redraw);
    }


    // debounce but call at first iteration
    function debounce(func, wait) {
        var first = true;
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (first) {
                func.apply(context, args);
                first = false;
            }
        };
    }


    /**
     * Remove download
     */

    function remove$1(download, list) {
        return messages.confirm({
            header: 'Delete Request:',
            content: [
                'Are you sure you want to delete this request from your queue?',
                m('.text-xs-center',
                    m('small.muted-text','(Don\'t worry, the data will stay on our servers and you can request it again in the future)')
                )
            ]
        })
            .then(function(response){
                if (response) return doRemove(download, list);
            });
    }

    function doRemove(download, list){
        list(list().filter(function (el) { return el !== download; }));
        m.redraw();
        removeDownload(download)
            .catch(function (err) {
                list().push(download);
                return messages.alert({
                    header: 'Delete Request',
                    content: err.message
                });
            });
    }

    /**
     * Create download
     */

    function create$1(list, cancel, loaded){
        var output = m.prop();
        return createMessage$1({output: output})
            .then(function (response) {
                if (response){
                    var download = unPropify$1(output());
                    list().unshift(Object.assign({
                        studyStatus: STATUS_RUNNING$1,
                        creationDate: new Date()
                    },download));
                    cancel(true);
                    return createDownload(download)
                        .catch(reportError$1('Error creating download'))
                        .then(cancel.bind(null, false))
                        .then(function () {
                            getAll({list: list, cancel: cancel, loaded: loaded});
                        });
                }
            });
    }

    var unPropify$1 = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var reportError$1 = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var TABLE_WIDTH$1 = 7;
    var statusLabelsMap = {}; // defined at the bottom of this file

    var downloadsComponent = {
        controller: function controller(){
            var list = m.prop([]);
            var loaded = m.prop(false);

            var cancelDownload = m.prop(false);

            var ctrl = {
                loaded: loaded,
                list: list,
                cancelDownload: cancelDownload,
                create: create$1,
                remove: remove$1,
                globalSearch: m.prop(''),
                sortBy: m.prop('studyId'),
                onunload: function onunload(){
                    cancelDownload(true);
                },
                error: m.prop('')
            };

            getAll({list:ctrl.list, cancel: cancelDownload, error: ctrl.error, loaded:ctrl.loaded});
            return ctrl;
        },

        view: function view(ctrl) {

            if (!ctrl.loaded())
                return m('.loader');

            var list = ctrl.list;

            if (ctrl.error()) return m('.downloads', [
                m('h3', 'Data Download'),
                m('.alert.alert-warning', [
                    m('strong', 'Warning!! '), ctrl.error().message
                ])
            ]);

            return m('.downloads', [
                m('.row.m-b-1', [
                    m('.col-sm-6', [
                        m('h3', 'Data Download')
                    ]),
                    m('.col-sm-3',[
                        m('button.btn.btn-secondary.pull-right', {onclick:ctrl.create.bind(null, list, ctrl.cancelDownload, ctrl.loaded)}, [
                            m('i.fa.fa-plus'), ' Request Data'
                        ])
                    ]),
                    m('.col-sm-3',[
                        m('input.form-control', {placeholder: 'Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                    ])
                ]),

                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$2('studyId',ctrl.sortBy), 'ID'),
                            m('th', 'Data file'),
                            m('th', thConfig$2('db',ctrl.sortBy), 'Database'),
                            m('th', thConfig$2('fileSize',ctrl.sortBy), 'File Size'),
                            m('th', thConfig$2('creationDate',ctrl.sortBy), 'Date Added'),
                            m('th','Status'),
                            m('th','Actions')
                        ])
                    ]),
                    m('tbody', [
                        list().length === 0
                            ? m('tr.table-info', [
                                m('td.text-xs-center', {colspan: TABLE_WIDTH$1}, 'There are no downloads running yet')
                            ])
                            : list().filter(studyFilter$2(ctrl)).map(function (download) { return m('tr', [
                                // ### ID
                                m('td', download.studyId),

                                // ### Study url
                                m('td', download.studyStatus == STATUS_RUNNING$1
                                    ? m('i.text-muted', 'Loading...')
                                    : download.fileSize
                                        ? m('a', {href:download.studyUrl, download:download.studyId + '.zip', target: '_blank'}, 'Download')
                                        : m('i.text-muted', 'No Data')
                                ),

                                // ### Database
                                m('td', download.db),

                                // ### Filesize
                                m('td', download.fileSize !== 'unknown'
                                    ? download.fileSize
                                    : m('i.text-muted', 'Unknown')
                                ),

                                // ### Date Added
                                m('td', [
                                    formatDate(new Date(download.creationDate)),
                                    '  ',
                                    m('i.fa.fa-info-circle'),
                                    m('.info-box', [
                                        m('.card', [
                                            m('.card-header', 'Creation Details'),
                                            m('ul.list-group.list-group-flush',[
                                                m('li.list-group-item', [
                                                    m('strong', 'Creation Date: '), formatDate(new Date(download.creationDate))
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'Start Date: '), formatDate(new Date(download.startDate))
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'End Date: '), formatDate(new Date(download.endDate))
                                                ])
                                            ])
                                        ])
                                    ])
                                ]),

                                // ### Status
                                m('td', [
                                    statusLabelsMap[download.studyStatus]
                                ]),

                                // ### Actions
                                m('td', [
                                    m('.btn-group', [
                                        m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, download, list)}, [
                                            m('i.fa.fa-close')
                                        ])
                                    ])
                                ])
                            ]); })
                    ])
                ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$2 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$2(ctrl){
        var search = ctrl.globalSearch();
        return function (study) { return includes(study.studyId, search) ||
            includes(study.studyUrl, search); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    statusLabelsMap[STATUS_COMPLETE] = m('span.label.label-success', 'Complete');
    statusLabelsMap[STATUS_RUNNING$1] = m('span.label.label-info', 'Running');
    statusLabelsMap[STATUS_ERROR] = m('span.label.label-danger', 'Error');

    var STATUS_APPROVED = true;
    var STATUS_SUBMITTED = false;

    function createDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'createDataAccessRequest'
        }, dataAccessRequest);

        return fetchJson(downloadsAccessUrl, {method: 'post', body: body})
            .then(interceptErrors$2);
    }

    function deleteDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'deleteDataAccessRequest'
        }, dataAccessRequest);

        return  fetchJson(downloadsAccessUrl, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function updateApproved(dataAccessRequest, approved){
        var body = Object.assign({
            action:'updateApproved'
        }, dataAccessRequest,{approved: approved});

        return  fetchJson(downloadsAccessUrl, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function getAllOpenRequests(){
        return fetchJson(downloadsAccessUrl, {method:'post', body: {action:'getAllOpenRequests'}})
            .then(interceptErrors$2);
    }



    function interceptErrors$2(response){
        if (!response.error){
            return response;
        }

        var errors = {
            1: 'This ID already exists.',
            2: 'The study could not be found.',
            3: 'The rule file could not be found.',
            4: 'The rules file does not fit the "research" schema.'
        };

        return Promise.reject({message: errors[response.error]});
    }

    var createMessage$2 = function (args) { return messages.custom({
        content: m.component(createComponent$2, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent$2 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Request Download Access From Admin'),
                m('p', 'This page will request access to a study from admin.  For studies created by users you should instead email them directly for access.'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig$3,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to request access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$3 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    var grantMessage = function (args) { return messages.custom({
        content: m.component(grantComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var grantComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop(''),
                username: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId(),
                        username: downloadAccess.username()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Grant Data Access'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig$4,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig$4,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            oninput: m.withAttr('value', downloadAccess.username),
                            class:inputClasses(validity.username)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to grant access.'),
                        validationView(validity.username, 'The username is required in order to grant access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$4 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    var revokeMessage = function (args) { return messages.custom({
        content: m.component(revokeComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var revokeComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop(''),
                username: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId(),
                        username: downloadAccess.username()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Revoke Data Access'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig$5,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig$5,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            oninput: m.withAttr('value', downloadAccess.username),
                            class:inputClasses(validity.username)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to revoke access.'),
                        validationView(validity.username, 'The username is required in order to revoke access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$5 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play$1(downloadAccess, list){
        return messages.confirm({
            header: 'Approve Access Request:',
            content: ("Are you sure you want to grant access of '" + (downloadAccess.studyId) + "' to '" + (downloadAccess.username) + "'?")
        })
            .then(function (response) {
                if(response) {
                    return updateApproved(downloadAccess, STATUS_APPROVED)
                        .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                        .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                        .catch(reportError$2('Grant Access'))
                        .then(m.redraw());
                }
            });
    }


    var remove$2  = function (downloadAccess, list) {
        return messages.confirm({
            header: 'Delete request:',
            content: ("Are you sure you want to delete the access request for'" + (downloadAccess.studyId) + "'? If access has already been granted you will lose it")
        })
            .then(function (response) {
                if(response) {
                
                    return deleteDataAccessRequest(downloadAccess)
                        .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                        .then(messages.alert({header:'Deletion complete', content: 'Access has been deleted'}))
                        .catch(reportError$2('Remove Download Request'))
                        .then(m.redraw());

                }
            });
    };
    var grant = function () {
        var output = m.prop();
        return grantMessage({output: output})
            .then(function (response) {
                if (response) {
                    var now = new Date();
                    var downloadAccess = Object.assign({
                        approved: STATUS_APPROVED,
                        creationDate: now
                    }, null, unPropify$2(output()));
                    return createDataAccessRequest(downloadAccess)
                        .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                        .catch(reportError$2('Grant Access'));
                }
            });
    };
    var revoke = function () {
        var output = m.prop();
        return revokeMessage({output: output})
            .then(function (response) {
                if (response) {
                    var now = new Date();
                    var downloadAccess = Object.assign({
                        creationDate: now
                    }, null, unPropify$2(output()));
                    return deleteDataAccessRequest(downloadAccess)
                        .then(messages.alert({header:'Revoke access completed', content: 'Access revoked'}))
                        .catch(reportError$2('Revoke Access'));
                }
            });
    };
    var create$2 = function (list) {
        var output = m.prop();
        return createMessage$2({output: output})
            .then(function (response) {
                if (response) {
                    var now = new Date();
                    var downloadAccess = Object.assign({
                        creationDate: now,
                        approved: 'access pending'
                    }, null, unPropify$2(output()));
                    return createDataAccessRequest(downloadAccess)
                        .then(function () { return list().unshift(downloadAccess); })
                        .then(m.redraw)
                        .catch(reportError$2('Data Access Request'));
                }
            });
    };

    var reportError$2 = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var unPropify$2 = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var TABLE_WIDTH$2 = 6;

    var downloadsAccessComponent = {
        controller: function () {
            var ctrl = {
                play: play$1,
                loaded: m.prop(false),
                remove: remove$2,
                create: create$2,
                grant: grant,
                revoke: revoke,
                list: m.prop([]),
                globalSearch: m.prop(''),
                sortBy: m.prop(),
                error: m.prop(''),
                isAdmin: false
            };
            getAuth().then(function (response) {ctrl.isAdmin = response.role === 'SU';});

            getAllOpenRequests()
                .then(ctrl.list)
                .catch(ctrl.error)
                .then(function(){ctrl.loaded(true);})
                .then(m.redraw);

            return ctrl;
        },
        view: function (ctrl) {
            if (!ctrl.loaded())
                return m('.loader');

            var list = ctrl.list;
            return m('.downloadAccess', [
                m('h3', 'Data Download Access Requests'),
                m('p.col-xs-12.text-muted', [
                    m('small', [
                        ctrl.isAdmin
                            ? 'Approve requests by clicking the Play button; Reject requests by clicking the X button; To grant permission without a request: hit the Grant Access button; For all actions: The user will be notified by email.'
                            : 'You will receive an email when your request is approved or rejected; To cancel a request, click the X button next to the request'
                    ])
                ]),
                ctrl.error()
                    ?
                    m('.alert.alert-warning',
                        m('strong', 'Warning!! '), ctrl.error().message
                    )
                    :
                    m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                        m('thead', [
                            m('tr', [ 
                                m('th', {colspan: TABLE_WIDTH$2}, [ 
                                    m('.row', [
                                        m('.col-xs-3.text-xs-left', [
                                            m('button.btn.btn-secondary', {disabled: ctrl.isAdmin, onclick:ctrl.isAdmin || ctrl.create.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Request Access From Admin'
                                            ])
                                        ]),
                                        m('.col-xs-2.text-xs-left', [
                                            m('button.btn.btn-secondary', {onclick:ctrl.grant.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Grant Access'
                                            ])
                                        ])
                                        ,m('.col-xs-2.text-xs-left', [
                                            ctrl.isAdmin ? m('button.btn.btn-secondary', {onclick:ctrl.revoke.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Revoke Access'
                                            ]) : ''
                                        ]),
                                        m('.col-xs-5.text-xs-left', [
                                            m('input.form-control', {placeholder: 'Global Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                                        ])
                                    ])
                                ])
                            ]),

                            m('tr', [
                                m('th', thConfig$3('studyId',ctrl.sortBy), 'ID'),
                                m('th', thConfig$3('username',ctrl.sortBy), 'Username'),
                                m('th', thConfig$3('email',ctrl.sortBy), 'Email'),
                                m('th', thConfig$3('creationDate',ctrl.sortBy), 'Date'),
                                m('th','Status'),
                                m('th','Actions')
                            ])
                        ]),
                        m('tbody', [
                            list().length === 0
                                ?
                                m('tr.table-info',
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH$2},
                                        m('strong', 'Heads up! '), 'There are no requests yet'
                                    )
                                )
                                :
                                list().filter(dataRequestFilter(ctrl)).map(function (dataRequest) { return m('tr', [
                                    // ### ID
                                    m('td', dataRequest.studyId),
                                    
                                    // ### USERNAME
                                    m('td', dataRequest.username),
                                    
                                    // ### EMAIL
                                    m('td', dataRequest.email),

                                    // ### Date
                                    m('td', formatDate(new Date(dataRequest.creationDate))),
                                    dataRequest.approved=== STATUS_APPROVED
                                        ?
                                        m('td', {style:'color:green'},'access granted')
                                        :
                                        m('td', {style:'color:red'},'access pending'),

                                    // ### Actions
                                    m('td', [
                                        m('.btn-group', [
                                            dataRequest.canApprove && dataRequest.approved === STATUS_SUBMITTED ? m('button.btn.btn-sm.btn-secondary', {title:'Approve request, and auto email requester',onclick: ctrl.play.bind(null, dataRequest,list)}, [
                                                m('i.fa.fa-play')
                                            ]) : '',
                                            dataRequest.canDelete ? m('button.btn.btn-sm.btn-secondary', {title:'Delete request.  If this is a granted request owner will lose access to it',onclick: ctrl.remove.bind(null, dataRequest, list)}, [
                                                m('i.fa.fa-close')
                                            ]) : ''
                                        ])
                                    ])
                                ]); })
                        ])
                    ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$3 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function dataRequestFilter(ctrl){
        return function (dataRequest) { return includes(dataRequest.studyId, ctrl.globalSearch()) ||
            includes(dataRequest.username, ctrl.globalSearch()) ||
            includes(dataRequest.email, ctrl.globalSearch()); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var fullHeight = function (element, isInitialized, ctx) {
        if (!isInitialized){
            onResize();

            window.addEventListener('resize', onResize, true);

            ctx.onunload = function(){
                window.removeEventListener('resize', onResize);
            };

        }

        function onResize(){
            element.style.height = document.documentElement.clientHeight - element.getBoundingClientRect().top + 'px';
        }
    };

    var loginComponent = {
        controller: function controller(){
            var ctrl = {
                username:m.prop(''),
                password:m.prop(''),
                isloggedin: false,
                loginAction: loginAction,
                error: m.prop('')
            };
            is_loggedin();
            return ctrl;

            function loginAction(){
                if(ctrl.username() && ctrl.password())
                    login(ctrl.username, ctrl.password)
                        .then(function () {
                            m.route(!location.hash ? './' : decodeURIComponent(location.hash).substring(1));
                        })
                        .catch(function (response) {
                            ctrl.error(response.message);
                            m.redraw();
                        })
                    ;
            }

            function is_loggedin(){
                getAuth().then(function (response) {
                    if(response.isloggedin)
                        m.route('./');
                });
            }
        },
        view: function view(ctrl){
            return m('.login.centrify', {config:fullHeight},[
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Please sign in'),

                        m('form', {onsubmit:ctrl.loginAction}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'Username / Email',
                                value: ctrl.username(),
                                name: 'username',
                                autofocus:true,
                                oninput: m.withAttr('value', ctrl.username),
                                onkeydown: function (e){(e.keyCode == 13) ? ctrl.loginAction(): false;},
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue(ctrl.username)
                            }),
                            m('input.form-control', {
                                type:'password',
                                name:'password',
                                placeholder: 'Password',
                                value: ctrl.password(),
                                oninput: m.withAttr('value', ctrl.password),
                                onkeydown: function (e){(e.keyCode == 13) ? ctrl.loginAction(): false;},
                                onchange: m.withAttr('value', ctrl.password),
                                config: getStartValue(ctrl.password)
                            })
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.loginAction},'Sign in'),
                        m('p.text-center',
                            m('small.text-muted',  m('a', {href:'index.html?/recovery'}, 'Lost your password?'))
                        )
                    ])
                ])
            ]);
        }
    };

    function getStartValue(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var jshintOptions = {
        // JSHint Default Configuration File (as on JSHint website)
        // See http://jshint.com/docs/ for more details

        'curly'         : false,    // true: Require {} for every new block or scope
        'latedef'       : 'nofunc', // true: Require variables/functions to be defined before being used
        'undef'         : true,     // true: Require all non-global variables to be declared (prevents global leaks)
        'unused'        : 'vars',   // Unused variables:
        'strict'        : false,    // true: Requires all functions run in ES5 Strict Mode

        'browser'       : true,     // Web Browser (window, document, etc)
        'devel'         : true,     // Development/debugging (alert, confirm, etc)

        esversion   : 3,        // Require es3 syntax for backward compatibility

        // Custom Globals
        predef: ['piGlobal','define','require','requirejs','angular']
    };

    var filePrototype = {
        apiUrl: function apiUrl(){
            return (baseUrl + "/files/" + (encodeURIComponent(this.studyId)) + "/file/" + (encodeURIComponent(this.id)));
        },

        get: function get(){
            var this$1 = this;

            return fetchJson(this.apiUrl())
                .then(function (response) {
                    var content = response.content
                        .replace(/\r\n/g, '\n') // Replace carriage returns 
                        .replace(/([^\n])$/,'$1\n'); //  Make sure all files are unix EOF encoded...

                    this$1.sourceContent(content);
                    this$1.content(content);
                    this$1.loaded = true;
                    this$1.error = false;
                    this$1.last_modify = response.last_modify;

                })
                .catch(function (reason) {
                    this$1.loaded = true;
                    this$1.error = true;
                    return Promise.reject(reason); // do not swallow error
                });
        },

        save: function save(){
            var this$1 = this;

            return fetchJson(this.apiUrl(), {
                method:'put',
                body: {content: this.content, last_modify:this.last_modify}
            })
                .then(function (response) {
                    this$1.sourceContent(this$1.content()); // update source content
                    this$1.last_modify = response.last_modify;
                    return response;
                });
        },

        copy: function copy(path, study_id, new_study_id){
            return fetchJson(this.apiUrl() + "/copy/", {
                method:'put',
                body: {new_study_id: new_study_id}
            })
                .catch(function (response) {
                    return Promise.reject(response);
                });
        },

        del: function del(){
            return fetchVoid(this.apiUrl(), {method:'delete'});
        },

        hasChanged: function hasChanged() {
            return this.sourceContent() !== this.content();
        },

        define: function define(context){
            if ( context === void 0 ) context = window;

            console.warn('This should be deprecated!!!');
            var requirejs = context.requirejs;
            var name = this.url;
            var content = this.content();

            return new Promise(function (resolve) {
                requirejs.undef(name);
                context.eval(content.replace("define(","define('" + name + "',"));
                resolve();
            });
        },

        require: function require(context){
            var this$1 = this;
            if ( context === void 0 ) context = window;

            var requirejs = context.requirejs;
            return new Promise(function (resolve, reject) {
                requirejs([this$1.url], resolve,reject);
            });
        },

        checkSyntax: function checkSyntax(){
            var jshint = window.JSHINT;
            this.syntaxValid = jshint(this.content(), jshintOptions);
            this.syntaxData = jshint.data();
            return this.syntaxValid;
        },

        setPath: function setPath(path){
            if ( path === void 0 ) path = '';

            this.path = path;
            this.name = path.substring(path.lastIndexOf('/')+1);
            this.basePath = (path.substring(0, path.lastIndexOf('/'))) + '/';
            this.type = path.substring(path.lastIndexOf('.')+1).toLowerCase();
        }
    };

    /**
     * fileObj = {
     *  id: #hash,
     *  path: path,     
     *  url: URL
     * }
     */

    var fileFactory = function (fileObj) {
        var file = Object.create(filePrototype);
        var path = decodeURIComponent(fileObj.path);


        file.setPath(path);

        Object.assign(file, fileObj, {
            id          : fileObj.id,
            sourceContent       : m.prop(fileObj.content || ''),
            content         : contentProvider.call(file, fileObj.content || ''), // custom m.prop, alows checking syntax on change

            // keep track of loaded state
            loaded          : false,
            error           : false,

            // these are defined when calling checkSyntax
            syntaxValid     : undefined,
            syntaxData      : undefined,

            undoManager     : m.prop(), // a prop to keep track of the ace-editor undo manager for this file
            position        : m.prop() // a prop to keep track of the ace-editor position in this file
        });

        file.content(fileObj.content || '');

        if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(function (file) { return Object.assign(file, {studyId: fileObj.studyId}); });

        return file;

        function contentProvider (store) {
            var this$1 = this;

            var prop = function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                if (args.length) {
                    store = args[0];
                    this$1.type === 'js' && this$1.checkSyntax();
                }
                return store;
            };
            prop.toJSON = function () { return store; };
            return prop;
        }
    };

    var studyPrototype = {
        loaded: false,
        isUploading: false,
        apiURL: function apiURL(path){
            if ( path === void 0 ) path = '';

            return (baseUrl + "/files/" + (encodeURIComponent(this.id)) + path);
        },

        get: function get(){
            var this$1 = this;


            return fetchJson(this.apiURL())
                .then(function (study) {

                    var files = this$1.parseFiles(study.files);
                    this$1.loaded = true;
                    this$1.isReadonly = study.is_readonly;
                    this$1.istemplate = study.is_template;
                    this$1.is_locked = study.is_locked;
                    this$1.is_published = study.is_published;
                    this$1.is_public = study.is_public;
                    this$1.name = study.study_name;
                    this$1.type = study.type || 'minno02';
                    this$1.base_url = study.base_url;
                    this$1.versions = study.versions ? study.versions : [];
                    this$1.files(files);
                    this$1.sort();
                })
                .catch(function (reason) {
                    this$1.error = true;
                    return Promise.reject(reason); // do not swallow error
                });


        },

        parseFiles: function parseFiles(files){
            var study = this;

            return ensureArray(files)
                .map(fileFactory)
                .map(spreadFile)
                .reduce(flattenDeep, [])
                .map(assignStudyId);

            function ensureArray(arr){ return arr || []; }
            function assignStudyId(file){ return Object.assign(file, {studyId: study.id}); }
            function flattenDeep(acc, val) { return Array.isArray(val) ? acc.concat(val.reduce(flattenDeep,[])) : acc.concat(val); }

            // create an array including file and all its children
            function spreadFile(file){ 
                var children = ensureArray(file.files).map(spreadFile);
                return [file].concat(children);
            }
        },

        mergeFiles: function mergeFiles(files){
            var newfiles = this.parseFiles(files);
            var oldfiles = this.files();

            var toRemove = oldfiles.filter(function (oldfile) { return !newfiles.some(function (newfile) { return oldfile.id == newfile.id; }); });
            var toAdd = newfiles.filter(function (newfile) { return !oldfiles.some(function (oldfile) { return oldfile.id == newfile.id; }); });

            toAdd.forEach(this.addFile.bind(this));
            toRemove.forEach(this.removeFile.bind(this));

            this.sort();
        },

        getFile: function getFile(id){
            return this.files().find(function (f) { return f.id === id; });
        },

        // makes sure not to return both a folder and its contents.
        // This is important mainly for server side clarity (don't delete or download both a folder and its content)
        // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
        getChosenFiles: function getChosenFiles(){
            var vm = this.vm;
            var rootFiles = this.files().filter(function (f) { return f.basePath === '/'; });
            return getChosen(rootFiles);

            function getChosen(files){
                return files.reduce(function (response, file) {
                    // a chosen file/dir does not need sub files to be checked
                    if (vm(file.id).isChosen() === 1) response.push(file);
                    // if not chosen, we need to look deeper
                    else response = response.concat(getChosen(file.files || []));
                    return response;
                }, []);
            }
        },

        addFile: function addFile(file){
            this.files().push(file);

            var parent = this.getParent(file);
            if (parent) {
                parent.files || (parent.files = []);
                parent.files.push(file);
            }
        },

        removeFile: function removeFile(file){
            var parent = this.getParent(file);

            remove(this.files(), file);
            if (parent && parent.files) remove(parent.files, file);

            function remove(arr, file){
                var index = arr.indexOf(file);
                arr.splice(index, 1);
            }
        },

        createFile: function createFile(ref){
            var this$1 = this;
            var name = ref.name;
            var content = ref.content; if ( content === void 0 ) content = '';
            var isDir = ref.isDir;

            // validation (make sure there are no invalid characters)
            if(/[^/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: ("The file name \"" + name + "\" is not valid")});

            // validation (make sure file does not already exist)
            var exists = this.files().some(function (file) { return file.path === name; });
            if (exists) return Promise.reject({message: ("The file \"" + name + "\" already exists")});

            // validateion (make sure direcotry exists)
            var basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
            var dirExists = basePath === '' || this.files().some(function (file) { return file.isDir && file.path === basePath; });
            if (!dirExists) return Promise.reject({message: ("The directory \"" + basePath + "\" does not exist")});
            return fetchJson(this.apiURL('/file'), {method:'post', body: {name: name, content: content, isDir: isDir}})
                .then(function (response) {
                    Object.assign(response, {studyId: this$1.id, content: content, path:name, isDir: isDir});
                    var file = fileFactory(response);
                    file.id = encodeURIComponent(file.id);

                    file.loaded = true;
                    this$1.addFile(file);
                    return response;
                })
                .then(this.sort.bind(this));
        },

        sort: function sort(response){
            var files = this.files().sort(sort);
            this.files(files);
            return response;

            function sort(a,b){
                // sort by isDir then name
                var nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
                if (nameA < nameB) return -1;//sort string ascending
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
            }
        },

        move: function move(newpath, file){
            var study = this;
            var files = study.files();

            var basePath = (newpath.substring(0, newpath.lastIndexOf('/')));
            var folderExists = basePath === '' || files.some(function (f) { return f.isDir && f.path === basePath; });
            var fileExists = files.some(function (f){ return f.path === newpath; });
            var hasChangedChildren = study
                .getChildren(file)
                .some(function (file) { return file.hasChanged(); });


            if (!folderExists) return Promise.reject({message: ("Target folder " + basePath + " does not exist.")});
            if (fileExists) return Promise.reject({message: ("Target file " + newpath + " already exists.")});
            if (hasChangedChildren) return Promise.reject({message: "You have unsaved changes in one of the files please save, then try again."});

            return fetchJson(file.apiUrl() + "/move/" , {
                method:'put',
                body: {path:newpath, url:file.url}
            })
                .then(study.mergeFiles.bind(study));
        },

        uploadFiles: function uploadFiles(ref){
            var this$1 = this;
            var path = ref.path;
            var fd = ref.fd;
            var force = ref.force;

            fd.append('forceUpload', +force);
            this.isUploading = true;
            m.redraw();

            return fetchUpload(this.apiURL(("/upload/" + (path === '/' ? '' : encodeURIComponent(path)))), {method:'post', body:fd})
                .then(this.mergeFiles.bind(this))
                .then(function () { return this$1.isUploading = false; })
                .catch(function (err) {
                    this$1.isUploading = false;
                    return Promise.reject(err);
                });
        },

        /*
         * @param files [Array] a list of file.path to download
         * @returns url [String] the download url
         */
        downloadFiles: function downloadFiles(files){
            return fetchJson(this.apiURL(), {method: 'post', body: {files: files}})
                .then(function (response) { return (baseUrl + "/download?path=" + (response.zip_file) + "&study=_PATH"); });
        },

        delFiles: function delFiles(files){
            var paths = files.map(function (f){ return f.path; });
            return fetchJson(this.apiURL(), {method: 'delete', body: {files:paths}})
                .then(this.mergeFiles.bind(this));
        },

        make_experiment: function make_experiment(file, descriptive_id){
            return fetchJson(this.apiURL(("/file/" + (file.id) + "/experiment")),
                {method: 'post', body: {descriptive_id:descriptive_id}}).then(function (exp_data){ return file.exp_data=exp_data; });
        },

        delete_experiment: function delete_experiment(file){
            return fetchVoid(this.apiURL(("/file/" + (file.id) + "/experiment")),
                {method: 'delete'});
        },

        update_experiment: function update_experiment(file, descriptive_id){
            return fetchVoid(this.apiURL(("/file/" + (file.id) + "/experiment")),
                {method: 'put', body: {descriptive_id:descriptive_id}});
        },

        getParents: function getParents(file){
            return this.files().filter(function (f) { return f.isDir && file.basePath.indexOf(f.path) === 0; });
        },

        getParent: function getParent(file){
            return this
                .getParents(file)
                .reduce(function (result, f) { return result && (result.path.length > f.path.length) ? result : f; } , null); 
        },

        // returns array of children for this file, including itself
        getChildren: function getChildren(file){
            return children(file);
           
            function children(file){
                if (!file.files) return [file];
                return file.files
                    .map(children) // harvest children
                    .reduce(function (result, files) { return result.concat(files); }, [file]); // flatten
            }
        }
    };

    var studyFactory =  function (id) {
        var study = Object.create(studyPrototype);

        Object.assign(study, {
            id      : id,
            files   : m.prop([]),
            loaded  : false,
            error   :false,
            vm      : viewModelMap({
                isOpen: m.prop(false),
                isChanged: m.prop(false),
                isChosen: m.prop(0)
            })
        });

        return study;
    };

    // http://lhorie.github.io/mithril-blog/mapping-view-models.html
    var viewModelMap = function(signature) {
        var map = {};
        return function(key) {
            if (!map[key]) {
                map[key] = {};
                for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
            }
            return map[key];
        };
    };

    var imgEditor = function (ref) {
        var file = ref.file;

        return m('div.img-editor.centrify', [
        m('img', {src:file.url})
    ]);
    };

    var pdfEditor = function (ref) {
        var file = ref.file;

        return m('object', {
        data: file.url,
        type: 'application/pdf',
        width: '100%',
        height: '100%'
    }, [
        m('embed', {src: file.url, type: 'application/pdf'}, 'Your browser does not support PDF')
    ]);
    };

    var unknownComponent = function () { return m('.centrify', [
        m('i.fa.fa-file.fa-5x'),
        m('h5', 'Unknow file type')
    ]); };

    // download support according to modernizer
    var downloadSupport = !window.externalHost && 'download' in document.createElement('a');

    var downloadLink = function (url, name) {
        if (downloadSupport){
            var link = document.createElement('a');
            link.href = url;
            link.download = name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            var win = window.open(url, '_blank');
            win.focus();
        }
    };

    var moveFileComponent = function (args) { return m.component(component, args); };


    var component = {
        controller: function controller(ref){
            var file = ref.file;
            var study = ref.study;

            var dirs = study
                .files()
                .filter(function (f) { return f.isDir; })
                .filter(function (f) { return f !== file; })
                .map(function (ref) {
                    var name = ref.name;
                    var basePath = ref.basePath;
                    var path = ref.path;
                    var id = ref.id;

                    return ({name: name, basePath: basePath, path: path, id: id, isOpen: m.prop(study.vm(id).isOpen())});
            })
                .reduce(function (hash, dir){
                    var path = dir.basePath;
                    if (!hash[path]) hash[path] = [];
                    hash[path].push(dir);
                    return hash;
                }, {'/': []});


            var root = {isOpen: m.prop(true), name:'/', path: '/'};
            return {root: root, dirs: dirs};
        },
        view: function view(ref, ref$1){
            var dirs = ref.dirs;
            var root = ref.root;
            var newPath = ref$1.newPath;

            return m('.card-block', [
                m('p.card-text', [
                    m('strong', 'Moving to: '),
                    dirName(newPath())
                ]),
                m('.folders-well', [
                    m('ul.list-unstyled', dirNode(root, dirs, newPath) )
                ])
            ]);
        }
    };


    function dirNode(dir, dirs, newPath){
        var children = dirs[dir.path.replace(/\/?$/, '/')]; // optionally add a backslash at the end
        return m('li', [
            m('i.fa.fa-fw', {
                onclick: function () { return dir.isOpen(!dir.isOpen()); },
                class: classNames({
                    'fa-caret-right' : children && !dir.isOpen(),
                    'fa-caret-down': children && dir.isOpen()
                })
            }),
            m('span', {onclick: function () { return newPath(dir.path); }}, [
                m('i.fa.fa-folder-o.m-r-1'),
                dirName(dir.name)
            ]),
            !children || !dir.isOpen() ? '' : m('ul.bulletless', children.map(function (d) { return dirNode(d, dirs, newPath); }))
        ]);
    }

    function dirName(name){
        return name === '/' ? m('span.text-muted', 'Root Directory') : name;
    }

    function get_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)));
    }

    function get_duplicate_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/copy");
    }


    function get_exps_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/experiments");
    }

    function get_lock_url(study_id , lock) {

        if (lock)
            return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/lock");
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/unlock");
    }

    function get_publish_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/publish");
    }

    /*CRUD*/
    var load_studies = function () { return fetchJson(studyUrl); };

    var load_templates = function () { return fetchJson(templatesUrl); };

    var create_study = function (body) { return fetchJson(studyUrl, { method: 'post', body: body }); };

    var get_exps = function (study_id) { return fetchJson(get_exps_url(study_id)); };

    var get_data = function (study_id, exp_id, version_id, file_format, file_split, start_date, end_date) { return fetchJson(get_exps_url(study_id), {
        method: 'post',
        body: {exp_id: exp_id, version_id: version_id, file_format: file_format, file_split: file_split, start_date: start_date, end_date: end_date}
    }); }
    ;

    var update_study = function (study_id, body) { return fetchJson(get_url(study_id), {
        method: 'put',
        body: body
    }); };

    var rename_study = function (study_id, study_name) { return fetchJson(((get_url(study_id)) + "/rename"), {
        method: 'put',
        body: {study_name: study_name}
    }); };

    var duplicate_study = function (study_id, study_name) { return fetchJson(get_duplicate_url(study_id), {
        method: 'put',
        body: {study_name: study_name}
    }); };

    var lock_study = function (study_id, lock) { return fetchJson(get_lock_url(study_id, lock), {
        method: 'post'
    }); };

    var publish_study = function (study_id, publish, update_url) { return fetchJson(get_publish_url(study_id), {
        method: 'post',
        body: {publish: publish, update_url: update_url}
    }); };

    var delete_study = function (study_id) { return fetchJson(get_url(study_id), {method: 'delete'}); };

    function copyFileComponent (args) { return m.component(copyFileComponent$1, args); }
    var copyFileComponent$1 = {
        controller: function controller(ref){
            var new_study_id = ref.new_study_id;
            var study_id = ref.study_id;

            var studies = m.prop([]);
            var loaded = m.prop(false);
            var error = m.prop(null);
            load_studies()
                .then(function (response) { return studies(response.studies.sort(sort_studies_by_name2).filter(template_filter())); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);
            return {studies: studies, study_id: study_id, new_study_id: new_study_id, loaded: loaded, error: error};
        },
        view: function (ref) {
            var studies = ref.studies;
            var study_id = ref.study_id;
            var new_study_id = ref.new_study_id;
            var loaded = ref.loaded;
            var error = ref.error;

            return m('div', [
            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',

            loaded() && !studies().length ? m('.alert.alert-info', 'You have no studies yet') : '',

            m('select.form-control', {value:new_study_id(), onchange: m.withAttr('value',new_study_id)}, [
                m('option',{value:'', disabled: true}, 'Select Study'),
                studies()
                    .filter(function (study) { return !study.is_locked && !study.is_public && !study.isReadonly && study.permission!=='read only' && study.id!=study_id(); })
                    .map(function (study) { return m('option',{value:study.id, selected: new_study_id() === study.id}, study.name); })
            ])
        ]);
    }
    };



    function sort_studies_by_name2(study1, study2){
        return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
    }

    var template_filter = function () { return function (study) {
        return study.study_type === 'regular' && !study.is_template;
    }; };

    var uploadFiles = function (path,study) { return function (fd, files) {
        // validation (make sure files do not already exist)
        var filePaths = files.map(function (file) { return path === '/' ? file : path + '/' + file; });
        var exist = study.files().filter(function (file) { return filePaths.includes(file.path); }).map(function (f) { return f.path; });

        if (!exist.length) return upload({force:false});
        else return messages.confirm({
            header: 'Upload Files', 
            content: ("The file" + (exist.length > 1 ? 's' : '') + " \"" + (exist.join(', ')) + "\" already exists, do you want to overwrite " + (exist.length > 1 ? 'them' : 'it') + "?"),
            okText: 'Overwrite'
        })
            .then(function (response) { return response && upload({force:true}); });

        function upload(ref) {
            if ( ref === void 0 ) ref = {force:false};
            var force = ref.force;

            return study.uploadFiles({path: path, fd: fd, force: force})
                .catch(function (response) { return messages.alert({
                    header: 'Upload File',
                    content: m('p.alert.alert-danger', response.message)
                }); })
                .then(m.redraw);
        }
    }; };

    var moveFile = function (file, study) { return function () {
        var newPath = m.prop(file.basePath);
        messages.confirm({
            header: 'Move File',
            content: moveFileComponent({newPath: newPath, file: file, study: study})
        })
            .then(function (response) {
                var targetPath = newPath().replace(/\/$/, '') + '/' + file.name;
                if (response && newPath() !== file.basePath) return moveAction(targetPath, file, study);
            });
    }; };

    var duplicateFile = function (file,study) { return function () {
        var newPath = m.prop(file.path);
        return messages.prompt({
            header: 'Duplicate File',
            postContent: m('p.text-muted', 'You can move a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
            prop: newPath
        })
            .then(function (response) {
                if (response && newPath() !== file.name) return createFile(study, newPath, file.content);
            });
    }; };

    var copyFile = function (file, study) { return function () {
        var filePath = m.prop(file.basePath);
        var study_id = m.prop(study.id);
        var new_study_id = m.prop('');
        messages.confirm({
            header: 'Copy File',
            content: copyFileComponent({new_study_id: new_study_id, study_id: study_id})
        })
            .then(function (response) {
                if (response && study_id() !== new_study_id) return copyAction(filePath() +'/'+ file.name, file, study_id, new_study_id);
            })
        ;
    }; };

    var renameFile = function (file,study) { return function () {
        var newPath = m.prop(file.path);
        return messages.prompt({
            header: 'Rename File',
            postContent: m('p.text-muted', 'You can move a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
            prop: newPath
        })
            .then(function (response) {
                if (response && newPath() !== file.name) return moveAction(newPath(), file,study);
            });
    }; };

    var make_experiment = function (file, study) { return function () {
        var descriptive_id = m.prop(file.path);
        var error = m.prop('');
        return messages.confirm({
            header:'New Name',
            content: m('div', [
                m('input.form-control',  {placeholder: 'Enter Descriptive Id', onchange: m.withAttr('value', descriptive_id)}),
                !error() ? '' : m('p.alert.alert-danger', error())
            ])}).then(function (response) { return response && study.make_experiment(file, descriptive_id()).then(function (){ return m.redraw(); }); });
    }; };

    var update_experiment = function (file, study) { return function () {
        var descriptive_id = m.prop(file.exp_data.descriptive_id);
        var error = m.prop('');
        return messages.confirm({
            header:'New Name',
            content: m('div', [
                m('input.form-control',  {placeholder: 'Enter new descriptive id', value: descriptive_id(), onchange: m.withAttr('value', descriptive_id)}),
                !error() ? '' : m('p.alert.alert-danger', error())
            ])}).then(function (response) { return response && study.update_experiment(file, descriptive_id()); })
            .then(function (){file.exp_data.descriptive_id=descriptive_id; m.redraw();});
    }; };

    var delete_experiment = function (file, study) { return function () {
        messages.confirm({
            header: 'Remove Experiment',
            content: 'Are you sure you want to remove this experiment? This is a permanent change.'
        })
            .then(function (response) {
                if (response) study.delete_experiment(file);})
            .then(function (){delete file.exp_data; m.redraw();});

    }; };

    function moveAction(newPath, file, study){
        var isFocused = file.id === m.route.param('fileId');

        var def = study
            .move(newPath,file) // the actual movement
            .then(redirect)
            .catch(function (response) { return messages.alert({
                header: 'Move/Rename File',
                content: m('p.alert.alert-danger', response.message)
            }); })
            .then(m.redraw); // redraw after server response

        m.redraw();
        return def;

        function redirect(response){
            // redirect only if the file is chosen, otherwise we can stay right here...
            if (isFocused) m.route(("/editor/" + (study.id) + "/file/" + (encodeURI(file.id))));
            return response;
        }
    }

    function copyAction(path, file, study_id, new_study_id){
        var def = file
            .copy(path, study_id, new_study_id) // the actual movement
            .catch(function (response) { return messages.alert({

                header: 'Copy File',
                content: m('p.alert.alert-danger', response.message)
            }); })
            .then(m.redraw); // redraw after server response

        return def;
    }

    var playground;
    var play$2 = function (file,study) { return function () {
        var isSaved = study.files().every(function (file) { return !file.hasChanged(); });  
        var open = openNew;

        if (isSaved) open();
        else messages.confirm({
            header: 'Play task',
            content: 'You have unsaved files, the player will use the saved version, are you sure you want to proceed?' 
        }).then(function (response) { return response && open(); });

        function openNew(){
            if (playground && !playground.closed) playground.close();

            playground = window.open((baseUrl + "/play/" + (study.id) + "/" + (file.id)), 'Playground');
            playground.onload = function(){
                playground.addEventListener('unload', function() {
                    window.focus();
                });
                playground.focus();
            };
        }
    }; };

    var save = function (file) { return function () {
        file.save()
            .then(m.redraw)
            .catch(function (err) { return messages.alert({
                header: 'Error Saving:',
                content: err.message
            }); });
    }; };


    // add trailing slash if needed, and then remove proceeding slash
    // return prop
    var pathProp = function (path) { return m.prop(path.replace(/\/?$/, '/').replace(/^\//, '')); };

    var  createFile = function (study, name, content) {
        study.createFile({name:name(), content:content()})
            .then(function (response) {
                m.route(("/editor/" + (study.id) + "/file/" + (encodeURIComponent(encodeURIComponent(response.id)))));
                return response;
            })
            .catch(function (err) { return messages.alert({
                header: 'Failed to create file:',
                content: err.message
            }); });
    };

    var createDir = function (study, path) {
        if ( path === void 0 ) path='';

        return function () {
        var name = pathProp(path);

        messages.prompt({
            header: 'Create Directory',
            content: 'Please insert directory name',
            prop: name
        })
            .then(function (response) {
                if (response) return study.createFile({name:name(), isDir:true});
            })
            .then(m.redraw)
            .catch(function (err) { return messages.alert({
                header: 'Failed to create directory:',
                content: err.message
            }); });
    };
    };

    var createEmpty = function (study, path) {
        if ( path === void 0 ) path = '';

        return function () {
        var name = pathProp(path);
        var content = function (){ return ''; };

        messages.prompt({
            header: 'Create file',
            content: 'Please insert the file name:',
            prop: name
        }).then(function (response) {
            if (response) return createFile(study, name, content);
        });
    };
    };

    var deleteFiles = function (study) { return function () {
        var chosenFiles = study.getChosenFiles();
        var isFocused = chosenFiles.some(function (file) { return file.id === m.route.param('fileId'); });

        if (!chosenFiles.length) {
            messages.alert({
                header:'Remove Files',
                content: 'There are no files selected'
            });
            return;
        }

        messages.confirm({
            header: 'Remove Files',
            content: 'Are you sure you want to remove all checked files? This is a permanent change.'
        })
            .then(function (response) {
                if (response) doDelete();
            });

        function doDelete(){
            study.delFiles(chosenFiles)
                .then(redirect)
                .catch(function (err) { return messages.alert({
                    header: 'Failed to delete files:',
                    content: err.message
                }); })
                .then(m.redraw);
        }

        function redirect(response){
            // redirect only if the file is chosen, otherwise we can stay right here...
            if (isFocused) m.route(("/editor/" + (study.id))); 
            return response;
        }
    }; };

    var downloadChosenFiles = function (study) { return function () {
        var chosenFiles = study.getChosenFiles().map(function (f){ return f.path; });
        if (!chosenFiles.length) {
            messages.alert({
                header:'Download Files',
                content: 'There are no files selected'
            });
            return;
        }

        study.downloadFiles(chosenFiles)
            .then(function (url) { return downloadLink(url, study.name); })
            .catch(function (err) { return messages.alert({
                header: 'Failed to download files:',
                content: err.message
            }); });
    }; };

    var downloadFile$2 = function (study, file) { return function () {
        if (!file.isDir) return downloadLink(file.url, file.name);

        study.downloadFiles([file.path])
            .then(function (url) { return downloadLink(url, study.name); })
            .catch(function (err) { return messages.alert({
                header: 'Failed to download files:',
                content: err.message
            }); });
    }; };

    var resetFile = function (file) { return function () { return file.content(file.sourceContent()); }; };

    var ace = function (args) { return m.component(aceComponent, args); };

    var noop$2 = function(){};

    var aceComponent = {
        controller: function(){
            var editorCache = m.prop();
            return {editorCache: editorCache, onunload: onunload};

            function onunload(){
                if (editorCache()){
                    editorCache().destroy();
                }
            }
        },
        view: function editorView(ctrl, args){
            return m('.editor', {id:'text-editor', config: aceComponent.config(ctrl, args)});
        },

        config: function(ref,ref$1){
            var editorCache = ref.editorCache;
            var content = ref$1.content;
            var observer = ref$1.observer;
            var settings = ref$1.settings; if ( settings === void 0 ) settings = {};

            return function(element, isInitialized, ctx){
                var editor = editorCache();
                var mode = settings.mode || 'javascript';
                if (editor) editor.setReadOnly(!!settings.isReadonly);

                // paster with padding
                var paste = function (text) {
                    if (!editor) return false;
                    var pos = editor.getSelectionRange().start; 
                    var line = editor.getSession().getLine(pos.row);
                    var padding = line.match(/^\s*/);
                    // replace all new lines with padding
                    if (padding) text = text.replace(/(?:\r\n|\r|\n)/g, '\n' + padding[0]);
                    
                    editor.insert(text);
                    editor.focus();
                };

                if (!isInitialized){
                    fullHeight(element, isInitialized, ctx);

                    require(['ace/ace'], function(ace){
                        var undoManager = settings.undoManager || (function (u) { return u; });
                        var position = settings.position || (function (u) { return u; });
                        ace.config.set('packaged', true);
                        ace.config.set('basePath', require.toUrl('ace'));

                        editor = ace.edit(element);
                        editorCache(editor);

                        var session = editor.getSession();
                        var commands = editor.commands;

                        editor.setReadOnly(!!settings.isReadonly);
                        editor.setTheme('ace/theme/cobalt');
                        session.setMode('ace/mode/' + mode);
                        if (mode !== 'javascript') session.setUseWorker(false);
                        editor.setHighlightActiveLine(true);
                        editor.setShowPrintMargin(false);
                        editor.setFontSize('18px');
                        editor.$blockScrolling = Infinity; // scroll to top

                        // set jshintOptions
                        session.on('changeMode', function(e, session){
                            if (session.getMode().$id === 'ace/mode/javascript' && !!session.$worker && settings.jshintOptions) {
                                session.$worker.send('setOptions', [settings.jshintOptions]);
                            }
                        });

                        session.on('change', function(){
                            content(editor.getValue());
                            m.redraw();
                        });

                        commands.addCommand({
                            name: 'save',
                            bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
                            exec: settings.onSave || noop$2
                        });
                        
                        if(observer) observer.on('paste',paste );
                        if(observer) observer.on('settings',function () { return editor.execCommand('showSettingsMenu'); });
                        
                        setContent();

                        // return to the last position when reinitializing an editor
                        if (position()) {
                            var ref = position();
                            var scroll = ref.scroll;
                            var row = ref.row;
                            var column = ref.column;
                            editor.session.setScrollTop(scroll);
                            editor.moveCursorTo(row, column);
                            editor.clearSelection();
                        }

                        // reset undo manager so that ctrl+z doesn't erase file
                        // save it so that it doesn't get lost when users navigate away
                        session.setUndoManager(undoManager() || undoManager(new ace.UndoManager())); 
                        editor.focus();
                        editor.on('destroy', function () {
                            position(Object.assign({scroll: editor.session.getScrollTop()},editor.getCursorPosition()));
                            if(observer) observer.off(paste );
                        });
                    });
                }
                
                // each redraw set content from model (the function makes sure that this is not done when not needed...)
                setContent();

                function setContent(){
                    var editor = editorCache();
                    if (!editor) return;
                    
                    // this should trigger only drastic changes such as the first time the editor is set
                    if (editor.getValue() !== content()){
                        editor.setValue(content());
                        editor.moveCursorTo(0,0);
                        editor.focus();
                    }
                }
            };
        }
    };

    function observer(){
        var channels = {};
        return {
            on: function on(channel,cb){
                channels[channel] || (channels[channel] = []);
                channels[channel].push(cb);
            },
            off: function off(cb){
                for (var channel in channels) {
                    var index = channels[channel].indexOf(cb);
                    if (index > -1) channels[channel].splice(index, 1);
                }
            },
            trigger: function trigger(channel){
                var args = [], len = arguments.length - 1;
                while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

                if (!channels[channel]) return;
                channels[channel].forEach(function (cb) { return cb.apply(null, args); });
            }
        };
    }

    var syntax = function (args) { return m.component(syntaxComponent, args); };

    /**
     * Syntax component
     * Takes an argument as follows:
     *
     * {valid: Boolean, data: jshint(script).data()}
     */
    var syntaxComponent = {

        /**
         * Analyze script
         * @param  {String} script A script to analyze
         * @return {Object}
         * {
         *      isValid: Boolean,
         *      data: Object, // raw data
         *      errors: Array, // an array of analyzed errors
         *      errorCount: Number, // the number of errors
         *      warningCount: Number // the number of warnings
         * }
         */
        analize: function (isValid, data) {
            var errorCount = 0;
            var warningCount = 0;
            var errors = isValid ? [] : data.errors
                .filter(function (e) { return e; }) // clean null values
                .map(function (err) {
                    var isError = err.code && (err.code[0] === 'E');

                    isError ? errorCount++ : warningCount++;

                    return {
                        isError: isError,
                        line: err.line,
                        col: err.character,
                        reason: err.reason,
                        evidence: err.evidence
                    };
                });
            return {
                isValid: isValid,
                data: data,
                errors : errors,
                errorCount: errorCount,
                warningCount: warningCount
            };
        },

        controller:  function (args) {
            var file = args.file;
            return syntaxComponent.analize(file.syntaxValid, file.syntaxData);
        },

        view: function (ctrl) {
            return m('div', [
                ctrl.isValid
                    ?
                    m('div', {class:'alert alert-success'}, [
                        m('strong','Well done!'),
                        'Your script is squeaky clean'
                    ])
                    :
                    m('div', [
                        m('table.table', [
                            m('tbody', ctrl.errors.map(function (err) {
                                return m('tr',[
                                    m('td.text-muted', ("line " + (err.line))),
                                    m('td.text-muted', ("col " + (err.col))),
                                    m('td', {class: err.isError ? 'text-danger' : 'text-info'}, err.reason),
                                    m('td',err.evidence)
                                ]);
                            }))
                        ]),

                        m('.row',[
                            m('.col-md-6', [
                                m('div', {class:'alert alert-danger'}, [
                                    m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                                    ("You have " + (ctrl.errorCount) + " critical errors.")
                                ])
                            ]),
                            m('.col-md-6', [
                                m('div', {class:'alert alert-info'}, [
                                    m('strong',{class:'glyphicon glyphicon-warning-sign'}),
                                    ("You have " + (ctrl.warningCount) + " non standard syntax errors.")
                                ])
                            ])
                        ])

                    ])
            ]);
        }
    };

    function warn(message, test){
        return {level:'warn', message: message, test:test};
    }

    function error$1(message, test){
        return {level:'error', message: message, test:test};
    }

    function row(element, testArr){
        var messages = flatten(testArr)
            .filter(function (msg) { return msg; }) // clean empty
            .filter(function (msg) { return typeof msg.test == 'function' ? msg.test(element) : !!msg.test; }); // run test...

        return !messages.length ? null : {
            element: element,
            messages: messages
        };
    }

    function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    }

    function multiPick(arr, propArr){
        return arr
            .map(function (e){ return e && [].concat(e[propArr[0]], e[propArr[1]], e[propArr[2]]); }) // gather all stim arrays
            .reduce(function (previous, current){ return previous.concat(current); },[]) // flatten arrays
            .filter(function (t){ return t; }); // remove all undefined stim
    }

    function flattenSequence(sequence){
        function unMix(e){
            return flattenSequence([].concat(e.data, e.elseData, (e.branches || []).map(function (e){ return e.data; })));
        }

        return sequence
            .reduce(function (previous, current) {return previous.concat(current && current.mixer ? unMix(current) : current);},[])
            .filter(function (t){ return t; }); // remove all undefined stim;
    }

    function concatClean(){
        var args = [].splice.call(arguments,0);
        return [].concat.apply([], args).filter(function (e){ return e; });
    }

    function pipElements(script){
        var trials, stimuli, media;

        trials = concatClean(flattenSequence(script.sequence), script.trialSets);
        stimuli = concatClean(
            script.stimulusSets,
            multiPick(trials,['stimuli', 'layout'])
        );
        media = concatClean(
            script.mediaSets,
            multiPick(stimuli,['media','touchMedia'])
        );

        return {trials:trials, stimuli:stimuli, media:media};
    }

    function pipValidator(script, url){
        var errors = [];
        var elements = pipElements(script);

        errors.push({type:'Settings',errors: checkSettings(script, url)});
        errors.push({type:'Trials',errors: filterMap(elements.trials, trialTest)});
        // errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
        // errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

        return errors;
    }

    function filterMap(arr, fn){
        return arr.map(fn).filter(function (e){ return e; });
    }

    /**
     * Check settings
     * @param  {Object} script The script to be tested
     * @param  {String} url    The script origin URL
     * @return {Array}        Array of error rows
     */
    function checkSettings(script, url){
        var settings = script.settings || {};

        var w = byProp(warn);
        // var e = byProp(error);

        var errors = [
            r('base_url', [
                w('Your base_url is not in the same directory as your script.', function (e) {
                    // use this!!!
                    // http://stackoverflow.com/questions/4497531/javascript-get-url-path
                    var getPath = function (url) {
                        var a = document.createElement('a');
                        a.href = url;
                        return a.pathname;
                    };

                    var path = getPath(url).substring(0, url.lastIndexOf('/') + 1); // get path but remove file name
                    var t = function (s) { return (!s || getPath(s).indexOf(path) !== 0); };

                    return (typeof e == 'object') ? t(e.image) && t(e.template) : t(e);
                })
            ])
        ];

        return errors.filter(function(err){return !!err;});

        function r(prop, arr){
            var el = {};
            el[prop] = settings[prop];
            return prop in settings && row(el, arr);
        }

        // wrap warn/error so that I don't have to individually
        function byProp(fn){
            return function(msg, test){
                return fn(msg, function (e) {
                    for (var prop in e) {
                        return test(e[prop]);
                    }
                });
            };
        }
    }

    function trialTest(trial) {
        var tests = [
            testInteractions(trial.interactions),
            testInput(trial.input)
        ];

        return row(trial, tests);

        function testInteractions(interactions){
            if (!interactions) {return;}

            if (!Array.isArray(interactions)){
                return [error$1('Interactions must be an array.', true)];
            }

            return  interactions.map(function (interaction, index) {
                return [
                    !interaction.conditions ? error$1(("Interaction [" + index + "] must have conditions"), true) : [
                        error$1(("Interaction conditon [" + index + "] must have a type"), toArray(interaction.conditions).some(function (c){ return !c.type; }))
                    ],
                    !interaction.actions ? error$1(("Interaction [" + index + "] must have actions"), true) : [
                        error$1(("Interaction action [" + index + "] must have a type"), toArray(interaction.actions).some(function (a){ return !a.type; }))
                    ]
                ];
            });


            function toArray(arr){
                return Array.isArray(arr) ? arr : [arr];
            }

        }

        function testInput(input){
            if (!input) {return;}

            if (!Array.isArray(trial.input)){
                return [error$1('Input must be an Array', true)];
            }

            return [
                error$1('Input must always have a handle', input.some(function (i){ return !i.handle; })),
                error$1('Input must always have an on attribute', input.some(function (i){ return !i.on; }))
            ];
        }
    }

    function questValidator(){
        var errors = [];

        errors.push({type:'Settings', errors:[]});
        errors.push({type:'Pages', errors:[]});
        errors.push({type:'Questions', errors:[]});

        return errors;
    }

    function managerValidator(){
        var errors = [];

        errors.push({type:'Settings', errors:[]});
        errors.push({type:'Tasks', errors:[]});

        return errors;
    }

    function validate(script){
        var type = script.type && script.type.toLowerCase();
        switch (type){
            case 'pip' : return pipValidator.apply(null, arguments);
            case 'quest' : return questValidator.apply(null, arguments);
            case 'manager' : return managerValidator.apply(null, arguments);
            default:
                throw new Error('Unknown script.type: ' + type);
        }
    }

    var validate$1 = function (args) { return m.component(validateComponent, args); };

    var validateComponent = {
        controller: function (args) {
            var file = args.file;
            var ctrl = {
                validations : m.prop([]),
                isError: false
            };

            m.startComputation();
            file
                .define()
                .then(function (){
                    return file.require();
                })
                .then(function (script) {
                    ctrl.validations(validate(script, file.url));
                    m.endComputation();
                })
                .catch(function () {
                    ctrl.isError = true;
                    m.endComputation();
                });

            return ctrl;
        },
        view: function (ctrl) {
            return  m('div', [
                !ctrl.isError ? '' :    m('div', {class:'alert alert-danger'}, [
                    m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                    "There was a problem parsing this script. Are you sure that it is a valid PI script? Make sure you fix all syntax errors."
                ]),

                ctrl.validations().map(function (validationReport) {
                    return [
                        m('h4', validationReport.type),
                        !validationReport.errors.length
                            ?
                            m('div', {class:'alert alert-success'}, [
                                m('strong','Well done!'),
                                'Your script is squeaky clean'
                            ])
                            :
                            validationReport.errors.map(function (err) {
                                return m('.row',[
                                    m('.col-md-4.stringified',
                                        m('div', {class:'pre'}, m.trust(stringify(err.element)))
                                    ),
                                    m('.col-md-8',[
                                        m('ul', err.messages.map(function (msg) {
                                            return m('li.list-unstyled', {class: msg.level == 'error' ? 'text-danger' : 'text-info'}, [
                                                m('strong', msg.level),
                                                msg.message
                                            ]);
                                        }))
                                    ])
                                ]);
                            })
                    ];
                })

            ]);
        }
    };


    function stringify(value) {
        if (value == null) { // null || undefined
            return '<i class="text-muted">undefined</i>';
        }
        if (value === '') {
            return '<i class="text-muted">an empty string</i>';
        }

        switch (typeof value) {
            case 'string':
                break;
            case 'number':
                value = '' + value;
                break;
            case 'object':
                // display the error message not the full thing...
                if (value instanceof Error){
                    value = value.message;
                    break;
                }
            /* fall through */
            default:
                // @TODO: implement this: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
                value = syntaxHighlight(JSON.stringify(value, null, 4));
        }

        return value;
    }


    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // eslint-disable-next-line no-useless-escape
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    var copyUrlContent = function (url) { return function () { return m.component(copyComponent, getAbsoluteUrl(url)); }; };


    var copyUrl = function (url, launch) { return function () {
            messages.alert({
            header: 'Copy URL',
            content: m.component(copyComponent, getAbsoluteUrl(url), launch),
            okText: 'Done'
        });
    }; };

    var copyComponent = {
        controller: function (url) {
            var copyFail = m.prop(false);
            var autoCopy = function () { return copy(url).catch(function () { return copyFail(true); }).then(m.redraw); };
            return {autoCopy: autoCopy, copyFail: copyFail};
        },
        view: function (ref, url, launch) {
            var autoCopy = ref.autoCopy;
            var copyFail = ref.copyFail;

            return m('.card-block', [
            m('.form-group', [
                m('label', 'Copy Url by clicking Ctrl + C, or click the copy button.'),
                m('label.input-group',[
                    m('.input-group-addon', {onclick: autoCopy}, m('i.fa.fa-fw.fa-copy')),
                    m('input.form-control', { config: function (el) { return el.select(); }, value: url })

                ]),
                !launch ? '' : [
                    m('input-group-addon', ['Right-click ', m('a', {href: url}, 'HERE'), ' to launch']),
                    m('label', 'You can use this option to play that study in a private or incognito window to bypass cached content.'),
                ],
                !copyFail() ? '' : m('small.text-muted', 'Auto copy will not work on your browser, you need to manually copy this url')
            ])
        ]);
    }
    };

    function getAbsoluteUrl(url) {
        var a = document.createElement('a');
        a.href=url;
        return a.href;
    }

    function copy(text){
        return new Promise(function (resolve, reject) {
            var input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();

            try {
                document.execCommand('copy');
            } catch(err){
                reject(err);
            }

            input.parentNode.removeChild(input);
        });
    }

    var END_LINE = '\n';
    var TAB = '\t';
    var indent = function (str, tab) {
        if ( tab === void 0 ) tab = TAB;

        return str.replace(/^/gm, tab);
    };

    var print = function (obj) {
        switch (typeof obj) {
            case 'boolean': return obj ? 'true' : 'false';
            case 'string' : return printString(obj); 
            case 'number' : return obj + '';
            case 'undefined' : return 'undefined';
            case 'function': 
                if (obj.toJSON) return print(obj()); // Support m.prop
                else return obj.toString();
        }

        if (obj === null) return 'null';

        if (Array.isArray(obj)) return printArray(obj);
        
        return printObj(obj);

        function printString(str){
            return str === '' ? str : str
                // escape string
                .replace(/[\\"']/g, '\\$&')
                // eslint-disable-next-line no-control-regex
                .replace(/\u0000/g, '\\0')
                // manage rows separately
                .split(END_LINE)
                .map(function (str) { return ("'" + str + "'"); })
                .join((" +" + END_LINE + TAB));
        }
        
        function printArray(arr){
            var isShort = arr.every(function (element) { return ['string', 'number', 'boolean'].includes(typeof element) && (element.length === undefined || element.length < 15); } );
            var content = arr
                .map(function (value) { return print(value); })
                .join(isShort ? ', ' : ',\n');

            return isShort
                ? ("[" + content + "]")
                : ("[\n" + (indent(content)) + "\n]");
        }

        function printObj(obj){
            var content = Object.keys(obj)
                .map(function (key) { return ((escapeKey(key)) + " : " + (print(obj[key]))); })
                .map(function (row) { return indent(row); })
                .join(',' + END_LINE);
            return ("{\n" + content + "\n}");

            function escapeKey(key){
                return /[^1-9a-zA-Z$_]/.test(key) ? ("'" + key + "'") : key;
            }
        }
    };

    var inheritInput = function (args) { return m.component(inheritInputComponent, args); };

    var inheritInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;

            var value = prop();
            var rawType = m.prop(typeof value === 'string' ? 'random' : value.type);
            var rawSet = m.prop(typeof value === 'string' ? value : value.set);

            return {type: type, set: set};

            function update(){
                var type = rawType();
                var set = rawSet();
                prop(type === 'random' ? set : {type: type, set: set});
            }
            
            function type(value){
                if (arguments){
                    rawType(value);
                    update();
                }

                return rawType();
            }
            
            function set(value){
                if (arguments){
                    rawSet(value);
                    update();
                }

                return rawSet();
            }
        },

        view: inputWrapper(function (ref) {
            var type = ref.type;
            var set = ref.set;


            return m('.form-inline', [
                m('.form-group.input-group', [
                    m('input.form-control', {
                        placeholder:'Set',
                        onchange: m.withAttr('value', set)
                    }),
                    m('span.input-group-addon', {style:'display:none'}) // needed to make the corners of the input square...
                ]),
                m('select.c-select', {
                    onchange: m.withAttr('value', type)
                }, TYPES.map(function (key) { return m('option', {value:key},key); }))
            ]);
        })
    };

    var TYPES = ['random', 'exRandom', 'sequential'];

    var taskComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            
            var type = m.prop('message');
            var common = {
                inherit: m.prop(''),
                name: m.prop(''),
                title: m.prop('')
            };
            var task = m.prop({});
                
            return {type: type, common: common, task: task, form: form, close: close, proceed: proceed};

            function proceed(){
                output(Object.assign({type: type}, common, task()));
                close(true)();
            }       

        },
        view: function view(ref){
            var type = ref.type;
            var common = ref.common;
            var task = ref.task;
            var form = ref.form;
            var close = ref.close;
            var proceed = ref.proceed;

            return m('div', [   
                m('h4', 'Add task'),
                m('.card-block', [
                    inheritInput({label:'inherit', prop:common.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    selectInput({label:'type', prop: type, form: form, values: {message: 'message', 'minno-time': 'time', 'minno-quest': 'minno', 'pip (old minno-time)': 'pip' }}),
                    textInput({label: 'name', prop: common.name, help: 'The name for the task',form: form}),
                    textInput({label: 'title', prop: common.title, help: 'The title to be displayed in the browsers tab',form: form}),
                    m.component(taskSwitch(type()), {task: task, form: form})
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
                ])
            ]);
        }
    };

    function taskSwitch(type){
        switch (type) {
            case 'message' : return messageComponent;
            case 'pip' : return pipComponent;
            case 'quest' : return questComponent;
            case 'time' : return timeComponent;
            default :
                throw new Error(("Unknown task type: " + type));
        }
    }

    var messageComponent = {
        controller: function controller$1(ref){
            var task = ref.task;

            task({
                //piTemplate: m.prop(true),
                template: m.prop(''),
                templateUrl: m.prop('')
            });
        },
        view: function view$1(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                //selectInput({label:'piTemplate', prop: props.piTemplate, form, values: {'Active': true, 'Debriefing template': 'debrief', 'Don\'t use': false}, help: 'Use the PI style templates'}),
                textInput({label: 'templateUrl', prop: props.templateUrl, help: 'The URL for the task template file',form: form}),
                textInput({label: 'template', prop: props.template, rows:6,  form: form, isArea:true, help: m.trust('You can manually create your template here <strong>instead</strong> of using a url')})
            ]); 
        }
    };

    var timeComponent = {
        controller: function controller$2(ref){
            var task = ref.task;

            var scriptUrl = m.prop('');
            task({ scriptUrl: scriptUrl });
        },
        view: function view$2(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form: form}),
            ]); 
        }
    };

    var pipComponent = {
        controller: function controller$3(ref){
            var task = ref.task;

            var version = m.prop('0.3');
            var scriptUrl = m.prop('');
            var baseUrl = "//cdn.jsdelivr.net/gh/minnojs/minno-quest@" + (version()) + "/dist/js";
            task({ version: version, scriptUrl: scriptUrl, baseUrl: baseUrl });
        },
        view: function view$3(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form: form}),
                selectInput({label:'version', prop: versionProp, form: form, values: {'0.3':0.3, '0.2':0.2}, help: 'The version of PIP that you want to use'})
            ]); 

            function versionProp(){
                if (arguments.length) {
                    props.version(arguments[0]);
                    props.baseUrl = "//cdn.jsdelivr.net/gh/minnojs/minno-quest@" + (props.version()) + "/dist/js";
                }

                return props.version();
            }
        }
    };

    var questComponent = {
        controller: function controller$4(ref){
            var task = ref.task;

            task({
                scriptUrl: m.prop('')
            });
        },
        view: function view$4(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form: form})
            ]); 
        }
    };

    var pageComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            var page = {
                inherit: m.prop(''),
                header: m.prop(''),
                decline: m.prop(false),
                progressBar: m.prop('<%= pagesMeta.number %> out of <%= pagesMeta.outOf%>'),
                autoFocus: true,
                questions: []
            };
            output(page);

            return {page: page,form: form, close: close};

        },
        view: function view(ref){
            var page = ref.page;
            var form = ref.form;
            var close = ref.close;

            return m('div', [   
                m('h4', 'Add Page'),
                m('.card-block', [
                    inheritInput({label:'inherit', prop:page.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    textInput({label: 'header', prop: page.header, help: 'The header for the page',form: form}),
                    checkboxInput({label: 'decline', description: 'Allow declining to answer', prop: page.decline,form: form}),
                    maybeInput({label:'progressBar', help: 'If and when to display the  progress bar (use templates to control the when part)', prop: page.progressBar,form: form})
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, 'Proceed')
                ])
            ]);
        }
    };

    var questComponent$1 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            var type = m.prop();
            var common = {
                inherit: m.prop(''),
                name: m.prop(''),
                stem: m.prop(''),
                required: m.prop(false),
                errorMsg: {
                    required: m.prop('')
                }
            };
            var quest = m.prop({});
            output(quest);

            return {type: type, common: common, quest: quest,form: form, close: close, proceed: proceed};

            function proceed(){
                var script = output(Object.assign({type: type}, common, quest()));
                if (!script.required()) script.required = script.errorMsg = undefined;
                if (!script.help || !script.help()) script.help = script.helpText = undefined;
                
                close(true)();
            }       

        },
        view: function view(ref){
            var type = ref.type;
            var common = ref.common;
            var quest = ref.quest;
            var form = ref.form;
            var close = ref.close;
            var proceed = ref.proceed;

            return m('div', [   
                m('h4', 'Add Question'),
                m('.card-block', [
                    selectInput({label:'type', prop: type, form: form, values: typeMap}),
                    inheritInput({label:'inherit', prop:common.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    textInput({label: 'name', prop: common.name, help: 'The name by which this question will be recorded',form: form}),
                    textInput({label: 'stem', prop: common.stem, help: 'The question text',form: form}),
                    m.component(question(type()), {type: type,quest: quest,form: form,common: common}),
                    checkboxInput({label: 'required', prop: common.required, description: 'Require this question to be answered', form: form}),
                    common.required()
                        ? textInput({label:'requiredText',  help: 'The error message for when the question has not been answered', prop: common.errorMsg.required ,form: form})
                        : ''
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
                ])
            ]);
        }
    };

    var typeMap = {None: undefined, Text: 'text', 'Text Area': 'textarea', 'Select One': 'selectOne', 'Select Multiple': 'selectMulti', Slider: 'slider'};

    var question = function (type) {
        switch (type) {
            case 'text' : return textComponent;
            case 'textarea' : return textareaComponent;
            case 'selectOne' : return selectOneComponent;
            case 'selectMulti' : return selectOneComponent;
            case 'slider' : return sliderComponent;
            case undefined : return {view: function () { return m('div'); }};
            default:
                throw new Error('Unknown question type');
        }
    };

    var textComponent = {
        controller: function controller$1(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('This text field is required');
            // setup unique properties
            quest({
                autoSubmit: m.prop(false)
            });
        },
        view: function view$1(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on enter', form: form})
            ]); 
        }
    };

    var textareaComponent = {
        controller: function controller$2(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('This text field is required');
            // setup unique properties
            quest({
                rows: m.prop(3),
                columns: m.prop('')
            });
        },
        view: function view$2(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                textInput({label: 'rows', prop: props.rows, help: 'The number of visible text lines', form: form})
            ]); 

        }
    };

    var selectOneComponent = {
        controller: function controller$3(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
            // setup unique properties
            quest({
                autoSubmit: m.prop(true),
                answers: m.prop([
                    'Very much',
                    'Somewhat',
                    'Undecided',
                    'Not realy',
                    'Not at all'
                ]),
                numericValues:true,
                help: m.prop(false),
                helpText: m.prop('Tip: For quick response, click to select your answer, and then click again to submit.')
            });
        },
        view: function view$3(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on double click', form: form}),
                arrayInput$1({label: 'answers', prop: props.answers, rows:7,  form: form, isArea:true, help: 'Each row here represents an answer option', required:true}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form: form, dflt: '<%= pagesMeta.number < 3 %>'}),
                props.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form: form, isArea: true})
                    : ''
            ]); 
        }
    };

    var sliderComponent = {
        controller: function controller$4(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
            // setup unique properties
            quest({
                min: m.prop(0),
                max: m.prop(100),
                steps: m.prop(''),
                hidePips: m.prop(false), 
                highlight: m.prop(true),
                labels : m.prop(['Low', 'Medium', 'High']),
                help: m.prop(false),
                helpText: m.prop('Click on the gray line to indicate your judgment. After clicking the line, you can slide the circle to choose the exact judgment.')
            });
        },
        view: function view$4(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                textInput({label: 'min', prop: props.min, help: 'The minimum value for the slider',form: form}),
                textInput({label: 'max', prop: props.max, help: 'The maximum value for the slider',form: form}),
                textInput({label: 'steps', prop: props.steps, help: 'Break the slider continuum to individual steps. Set to an integer or empty for a continuous slider',form: form}),
                props.steps()
                    ? '' 
                    : checkboxInput({label: 'hidePips', prop: props.hidePips, description: 'Hide the markers for the individual steps',form: form}),
                arrayInput$1({label:'labels', prop: props.labels, help: 'A list of labels for the slider range', isArea: true, rows:5, form: form}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form: form, dflt: '<%= pagesMeta.number < 3 %>'}),
                props.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form: form, isArea: true})
                    : ''
            ]); 
        }
    };

    var  snippetRunner = function (component) { return function (observer) { return function () {
        var output = m.prop();
        messages
            .custom({
                preventEnterSubmits: true,
                content: m.component(component, {output: output, close: close}),
                wide: true
            })
            .then(function (isOk) { return isOk && observer.trigger('paste', print(clearUnused(output()))); });

        function close(value) {return function () { return messages.close(value); };}
    }; }; };

    var taskSnippet = snippetRunner(taskComponent);
    var pageSnippet = snippetRunner(pageComponent);
    var questSnippet = snippetRunner(questComponent$1);

    function clearUnused(obj){
        return Object.keys(obj).reduce(function (result, key) {
            var value = obj[key];
            if (typeof value === 'function' && value.toJSON) value = value();
            
            // check if is empty
            if (value === '' || value === undefined) return result;
            if (Array.isArray(value) && !value.length) return result;

            result[key] = value;
            return result;
        }, {});
    }

    var amdReg = /(?:define\(\[['"])(.*?)(?=['"])/;

    var textMenuView = function (ref) {
        var mode = ref.mode;
        var file = ref.file;
        var study = ref.study;
        var observer = ref.observer;

        var setMode = function (value) { return function () { return mode(value); }; };
        var modeClass = function (value) { return mode() === value ? 'active' : ''; };
        var isJs = file.type === 'js';
        var hasChanged = file.hasChanged();
        var isExpt = /\.expt\.xml$/.test(file.path);
        var isHtml = ['html', 'htm', 'jst', 'ejs'].includes(file.type);
        var amdMatch = amdReg.exec(file.content());
        var APItype = amdMatch && amdMatch[1];
        var launchUrl = "https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, '')) + "&refresh=true";

        return m('.btn-toolbar.editor-menu', [
            m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
                m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
                file.path
            ),

            m('.btn-group.btn-group-sm.pull-xs-right', [
                m('button.btn.btn-secondary', {onclick: resetFile(file), title:'Reset any chnages made to this file since the last change'},[
                    m('strong.fa.fa-refresh')
                ]),
                m('a.btn.btn-secondary', {onclick: function (){ return observer.trigger('settings'); }, title:'Editor settings'},[
                    m('strong.fa.fa-cog')
                ])
            ]),

            m('.btn-group.btn-group-sm.pull-xs-right', [
                m('a.btn.btn-secondary', {href: "https://minnojs.github.io/minno-quest/0.2/basics/overview.html", target: '_blank', title:'API documentation'},[
                    m('strong.fa.fa-book'),
                    m('strong', ' Docs')
                ]),
                m('a.btn.btn-secondary', {href: "https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts", target: '_blank', title:'Editor help'},[
                    m('strong.fa.fa-info')
                ])
            ]),

            !isJs ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
                m('a.btn.btn-secondary', {onclick: setMode('edit'), class: modeClass('edit')},[
                    m('strong', study.isReadonly ? 'View' : 'Edit')
                ]),
                m('a.btn.btn-secondary', {onclick: setMode('syntax'), class: modeClass('syntax')},[
                    m('strong',
                        'Syntax ',
                        file.syntaxValid
                            ? m('i.fa.fa-check-square.text-success')
                            : m('span.label.label-danger', file.syntaxData.errors.length)
                    )
                ])
            ]),

            /**
             * Snippets
             **/
            study.isReadonly ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
                !/^minno/.test(study.type) ? '' : [
                    APItype !== 'managerAPI' ? '' : [
                        m('a.btn.btn-secondary', {onclick: taskSnippet(observer), title: 'Add task element'}, [
                            m('strong','T') 
                        ])
                    ],
                    APItype !== 'questAPI' ? '' : [
                        m('a.btn.btn-secondary', {onclick: questSnippet(observer), title: 'Add question element'}, [
                            m('strong','Q') 
                        ]),
                        m('a.btn.btn-secondary', {onclick: pageSnippet(observer), title: 'Add page element'}, [
                            m('strong','P') 
                        ])
                    ],
                    m('a.btn.btn-secondary', {onclick:function () { return observer.trigger('paste', '{\n<%= %>\n}'); }, title:'Paste a template wizard'},[
                        m('strong.fa.fa-percent')
                    ])
                ],

                study.type !== 'html' || !isHtml ? '' : [
                    m('a.btn.btn-secondary', {onclick:function () { return observer.trigger('paste', '<!-- os:base -->'); }, title:'Paste a base url template'},[
                        m('strong','base')
                    ]),
                    m('a.btn.btn-secondary', {onclick:function () { return observer.trigger('paste', '<!-- os:vars -->'); }, title:'Paste a variables template'},[
                        m('strong','vars')
                    ])
                ]


            ]),

            /**
             * Play
             **/
            m('.btn-group.btn-group-sm.pull-xs-right', [

                !/^minno/.test(study.type) ? '' : [
                    !isJs ? '' :  m('a.btn.btn-secondary', {onclick: play$2(file,study), title:'Play this task'},[
                        m('strong.fa.fa-play')
                    ]),

                    !isExpt ? '' :  [
                        m('a.btn.btn-secondary', {href: launchUrl, target: '_blank', title:'Play this task'},[
                            m('strong.fa.fa-play')
                        ]),
                        m('a.btn.btn-secondary', {onmousedown: copyUrl(launchUrl), title:'Copy Launch URL'},[
                            m('strong.fa.fa-link')
                        ])
                    ],

                    !isHtml ? '' :  m('a.btn.btn-secondary', {href: file.url, target: '_blank', title:'View this file'},[
                        m('strong.fa.fa-eye')
                    ]),
                ],

                study.type !== 'html' ? '' : [
                    !isHtml ? '' :  m('a.btn.btn-secondary', {onclick: play$2(file,study), title:'Play this task'},[
                        m('strong.fa.fa-play')
                    ]),
                ],

                m('a.btn.btn-secondary', {onclick: hasChanged && save(file), title:'Save (ctrl+s)',class: classNames({'btn-danger-outline' : hasChanged, 'disabled': !hasChanged || study.isReadonly})},[
                    m('strong.fa.fa-save')
                ])
            ])
        ]);
    };

    var textEditor = function (args) { return m.component(textEditorComponent, args); };

    var textEditorComponent = {
        controller: function(ref){
            var file = ref.file;

            var err = m.prop();
            file.loaded || file.get()
                .catch(err)
                .then(m.redraw);

            var ctrl = {mode:m.prop('edit'), observer: observer(), err: err};

            return ctrl;
        },

        view: function(ctrl, ref){
            var file = ref.file;
            var study = ref.study;

            var observer$$1 = ctrl.observer;
            var err = ctrl.err;
            var mode = ctrl.mode;

            if (!file.loaded) return m('.loader');

            if (file.error) return m('div', {class:'alert alert-danger'}, [
                m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                ("The file \"" + (file.path) + "\" was not found (" + (err() ? err().message : 'please try to refresh the page') + ").")
            ]);

            return m('.editor', [
                textMenuView({mode: mode, file: file, study: study, observer: observer$$1}),
                textContent(ctrl, {key: file.id, file: file,observer: observer$$1, study: study})
            ]);
        }
    };

    var textContent = function (ctrl, ref) {
        var file = ref.file;
        var study = ref.study;
        var observer$$1 = ref.observer;

        var textMode = modeMap[file.type] || 'javascript';
        switch (ctrl.mode()){
            case 'edit' : return ace({
                content:file.content,
                observer: observer$$1,
                settings: {
                    onSave: save(file), 
                    mode: textMode,
                    jshintOptions: jshintOptions,
                    isReadonly: study.isReadonly||study.is_locked,
                    undoManager: file.undoManager,
                    position: file.position
                }
            });
            case 'validator': return validate$1({file: file});
            case 'syntax': return syntax({file: file});
        }
    };

    var modeMap = {
        js: 'javascript',
        json: 'json',
        jsp: 'jsp',
        jst: 'ejs',
        html: 'ejs',
        htm: 'ejs',
        txt: 'txt',
        css: 'css',
        scss: 'scss',
        sass: 'sass',
        m: 'm',
        c: 'cpp',
        cs: 'cs',
        h: 'txt',
        py: 'py',
        xml: 'xml'
    };

    var editors = {
        js: textEditor,
        jsp: textEditor,
        json: textEditor,
        html: textEditor,
        htm: textEditor,
        jst: textEditor,
        txt: textEditor,
        m: textEditor,
        c: textEditor,
        cs: textEditor,
        css: textEditor,
        sass: textEditor,
        scss: textEditor,
        h: textEditor,
        py: textEditor,
        xml: textEditor,

        jpg: imgEditor,
        jpeg: imgEditor,
        bmp: imgEditor,
        png: imgEditor,

        pdf: pdfEditor
    };

    var fileEditorComponent = {
        controller: function(ref) {
            var study = ref.study;

            return {study: study};
        },

        view: function (ref, args) {
            var study = ref.study;
            if ( args === void 0 ) args = {};

            var id = m.route.param('fileId');
            var file = study.getFile(id);
            var editor = file && editors[file.type] || unknownComponent;

            return m('div', {config:fullHeight}, [
                file
                    ? editor({file: file, study: study,  settings: args.settings, key:file.id})
                    : m('.centrify', [
                        m('i.fa.fa-smile-o.fa-5x'),
                        m('h5', 'Please select a file to start working')
                    ])
            ]);
        }
    };

    function ratingWizard(ref){
        var basicPage = ref.basicPage;
        var basicSelect = ref.basicSelect;
        var questionList = ref.questionList;
        var sequence = ref.sequence;

        var NEW_LINE = '\n';
        var content = [
            "var API = new Quest();",

            "",
            "// The structure for the basic questionnaire page",
            ("API.addPagesSet('basicPage', " + (print(basicPage)) + ");"),

            "",
            "// The structure for the basic question    ",
            ("API.addQuestionsSet('basicSelect', " + (print(basicSelect)) + ");"),

            "// This is the question pool, the sequence picks the questions from here",
            ("API.addQuestionsSet('questionList', " + (print(questionList)) + ");"),
            "",

            "// This is the sequence of questions",
            "// Note that you may want to update the \"times\" property if you change the number of questions",
            ("API.addSequence(" + (print(sequence)) + ");"),

            "",
            "return API.script;"
        ].join(NEW_LINE);

        return ("define(['questAPI'], function(Quest){\n" + (indent(content)) + "\n});");
    }

    var wizardComponent = {
        controller: function controller(ref){
            var study = ref.study;

            var path = m.prop('');
            var form = formFactory();
            var submit = function () {
                form.showValidation(true);
                if (form.isValid()){
                    createFile(study, path, compileScript(script) );
                }
                
            };

            var compileScript = function (script) { return function () {
                script.basicPage.questions = [
                    {inherit: {type:script.randomize() ? 'exRandom' : 'sequential', set:'questionList'}}
                ];
                script.sequence = [
                    {
                        mixer:'repeat',
                        times: script.times() || script.questionList().length,
                        data:[
                            {inherit: 'basicPage'}
                        ]
                    }
                ];

                return ratingWizard(script);
            }; };


            var script ={
                basicPage: {
                    header: m.prop(''),
                    decline: m.prop(true),
                    autoFocus:true
                },
                basicSelect: {
                    type: 'selectOne',
                    autoSubmit: m.prop(false),
                    numericValues: m.prop(true),
                    help: m.prop('<%= pagesMeta.number < 3 %>'),
                    helpText: m.prop('Tip: For quick response, click to select your answer, and then click again to submit.'),
                    answers: m.prop([
                        'Very much',
                        'Somewhat',
                        'Undecided',
                        'Not realy',
                        'Not at all'
                    ]) 
                },
                questionList: m.prop([
                    {stem:'Do you like chocolate?', name:'q1', inherit:'basicSelect'},
                    {stem:'Do you like bannanas?', name:'q2', inherit:'basicSelect'}
                ]),
                times: m.prop(false),
                randomize: m.prop(true),
                sequence: [
                    {
                        mixer: 'repeat',
                        times: m.prop(10),
                        data: [
                            {inherit:'basicPage'}
                        ]
                    }
                ]
            };
            return {path: path, form: form, submit: submit, script: script};
        },
        view: function view(ref){
            var form = ref.form;
            var submit = ref.submit;
            var script = ref.script;
            var path = ref.path;
          
            var basicPage = script.basicPage;
            var basicSelect = script.basicSelect;

            return m('.wizard.container', [
                m('h3', 'Rating wizard'),
                m('p', 'This wizard is responsible for rating stuff'),
                textInput({label:'File Name',  placeholder: 'Path to file', prop: path ,form: form, required:true}), 

                m('h4', 'Basic Page'),
                textInput({label:'Header',  placeholder: 'Page header', help: 'The header for all pages.', prop: basicPage.header,form: form}), 
                checkboxInput({label: 'Decline', description: 'Allow users to decline', prop: basicPage.decline, form: form}),

                m('h4', 'Basic Select'),
                checkboxInput({label: 'autoSubmit', description: 'Submit upon second click', prop: basicSelect.autoSubmit, form: form}),
                arrayInput$1({label: 'answers', prop: (basicSelect.answers), rows:7,  form: form, isArea:true, help: 'Each row here represents an answer option', required:true}),
                checkboxInput({label: 'numericValues', description: 'Responses are recorded as numbers', prop: basicSelect.numericValues, form: form}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: basicSelect.help,form: form}),
                basicSelect.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: basicSelect.helpText,form: form, isArea: true})
                    : '',

                m('h4', 'Sequence'),
                checkboxInput({label: 'Randomize', description: 'Randomize questions', prop: script.randomize, form: form}),
                maybeInput({label: 'Choose', help:'Set a number of questions to choose from the pool. If this option is not selected all questions will be used.', form: form, prop: script.times}),
                arrayInput$1({label: 'questions', prop: script.questionList, toArr: function (stem, index) { return ({stem: stem, name: ("q" + index), inherit:'basicSelect'}); }, fromArr: function (q) { return q.stem; }, rows:20,  form: form, isArea:true, help: 'Each row here represents a questions', required:true}),
                m('.row', [
                    m('.col-cs-12.text-xs-right', [
                        !form.showValidation() || form.isValid()
                            ? m('button.btn.btn-primary', {onclick: submit}, 'Create')  
                            : m('button.btn.btn-danger', {disabled: true}, 'Not Valid')
                    ])
                ])
            ]); 
        } 
    };

    /**
     * Set this component into your layout then use any mouse event to open the context menu:
     * oncontextmenu: contextMenuComponent.open([...menu])
     *
     * Example menu:
     * [
     *  {icon:'fa-play', text:'begone'},
     *  {icon:'fa-play', text:'asdf'},
     *  {separator:true},
     *  {icon:'fa-play', text:'wertwert', menu: [
     *      {icon:'fa-play', text:'asdf'}
     *  ]}
     * ]
     */

    var contextMenuComponent = {
        vm: {
            show: m.prop(false),
            style: m.prop({}),
            menu: m.prop([])
        },
        view: function () {
            return m(
                '.context-menu',
                {
                    class: classNames({'show-context-menu': contextMenuComponent.vm.show()}),
                    style: contextMenuComponent.vm.style()
                },
                contextMenuComponent.vm.menu().map(menuNode)
            );
        },

        open: function (menu) { return function (e) {
            e.preventDefault();
            e.stopPropagation();

            var left = e.pageX + 'px';
            var top = e.pageY + 'px';
            var bottom = (window.innerHeight - e.pageY) + 'px';
            var style = window.innerHeight/2 > e.pageY ? {left: left,top: top} : {left: left,bottom: bottom};

            contextMenuComponent.vm.menu(menu);
            contextMenuComponent.vm.show(true);
            contextMenuComponent.vm.style(style);

            document.addEventListener('mousedown', onClick, false);
            function onClick(){
                contextMenuComponent.vm.show(false);
                document.removeEventListener('mousedown', onClick);
                m.redraw();
            }
        }; }
    };

    var menuNode = function (node, key) {
        if (!node) return '';
        if (node.separator) return m('.context-menu-separator', {key:key});

        var action = node.action;
        if (node.href && !action) action = openTab;
        if (node.disabled) action = null;
        
        return m('.context-menu-item', {class: classNames({disabled: node.disabled, submenu:node.menu, key: key})}, [
            m('button.context-menu-btn',{onmousedown: action}, [
                m('i.fa', {class:node.icon}),
                m('span.context-menu-text', node.text)
            ]),
            node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
        ]);

        function openTab(){
            var win = window.open(node.href, '_blank');
            win.focus();
        }
    };

    var fileContext = function (file, study) {
        var path = !file ? '/' : file.isDir ? file.path : file.basePath;
        var isReadonly = study.isReadonly;
        var menu = [];

        if (!isReadonly) {
            menu = menu.concat([
                {icon:'fa-folder', text:'New Directory', action: createDir(study, path)},
                {icon:'fa-file', text:'New File', action: createEmpty(study, path)},
                // @TODO: we've decided to change the exports to be dynamic: to pull the wizard hash from somewhere external
                // this requires some sort of external configuration
                // {icon:'fa-file-text', text:'New from template', menu: mapWizardHash(wizardHash)},
                {icon:'fa-magic', text:'New from wizard', menu: [
                    {text: 'Rating wizard', action: activateWizard("rating")}
                ]}
            ]);
        }
        var version_id = study.versions.length? study.versions[study.versions.length-1].id : '';


        // Allows to use as a button without a specific file
        if (file) {
            // console.log(file);
            // let isExpt = /\.expt\.xml$/.test(file.name) && file.exp_data;
            var isExpt = file.exp_data && !file.exp_data.inactive;

            if (!isReadonly) menu.push({separator:true});

            menu = menu.concat([
                {icon:'fa-refresh', text: 'Refresh/Reset', action: resetFile(file), disabled: isReadonly || file.content() == file.sourceContent()},
                {icon:'fa-download', text:'Download', action: downloadFile$2(study, file)},
                {icon:'fa-link', text: 'Copy URL', action: copyUrl(file.url)},

                !isExpt ?  {icon:'fa-desktop', text:'Make Experiment', action: make_experiment(file,study), disabled: isReadonly }
                    :  {icon:'fa-desktop', text:'Experiment options', menu: [
                        {icon:'fa-exchange', text:'Rename', action: update_experiment(file, study), disabled: isReadonly },
                        {icon:'fa-close', text:'Cancel Experiment File', action: delete_experiment(file, study), disabled: isReadonly },
                        { icon:'fa-play', href:(launchUrl + "/" + (file.exp_data.id) + "/" + version_id), text:'Play this task'},
                        {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl((launchUrl + "/" + (file.exp_data.id) + "/" + version_id), true)}
                    ]},

                //     isExpt ?  { icon:'fa-play', href:`https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit/, '')}`, text:'Play this task'} : '',
                // isExpt ? {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl(`https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit/, '')}`)} : '',
                {icon:'fa-close', text:'Delete', action: deleteFile, disabled: isReadonly },
                {icon:'fa-arrows-v', text:'Move', action: moveFile(file,study), disabled: isReadonly },
                {icon:'fa-clone', text:'Duplicate', action: duplicateFile(file, study), disabled: isReadonly },
                {icon:'fa-clone', text:'Copy to Different Study', action: copyFile(file,study), disabled: isReadonly },
                {icon:'fa-exchange', text:'Rename...', action: renameFile(file,study), disabled: isReadonly }
            ]);
        }

        return contextMenuComponent.open(menu);

        function activateWizard(route){
            return function () { return m.route("/editor/" + (study.id) + "/wizard/" + route); };
        }
        
        // function mapWizardHash(wizardHash){
        //     return Object.keys(wizardHash).map((text) => {
        //         let value = wizardHash[text];
        //         return typeof value === 'string'
        //             ? {text, action: createFromTemplate({study, path, url:value, templateName:text})}
        //             : {text, menu: mapWizardHash(value)};
        //     });
        // }

        function deleteFile(){
            var isFocused = file.id === m.route.param('fileId');

            messages.confirm({
                header:['Delete ',m('small', file.name)],
                content: 'Are you sure you want to delete this file? This action is permanent!'
            })
                .then(function (ok) {
                    if (ok) return doDelete();
                });

            function doDelete(){
                study.delFiles([file])
                    .then(redirect)
                    .catch(function (err) { return messages.alert({
                        header: 'Failed to delete file:',
                        content: err.message
                    }); })
                    .then(m.redraw);
            }

            function redirect(response){
                // redirect only if the file is chosen, otherwise we can stay right here...
                if (isFocused) m.route(("/editor/" + (study.id))); 
                return response;
            }
        } // end delete file
    };

    var DRAGOVER_CLASS = 'is-dragover';
    function dragdrop(element, options) {
        options = options || {};

        element.addEventListener('dragover', activate);
        element.addEventListener('dragleave', deactivate);
        element.addEventListener('dragend', deactivate);
        element.addEventListener('drop', deactivate);
        element.addEventListener('drop', update);

        function activate(e) {
            e.preventDefault();
            e.stopPropagation(); // so that only the lowest level element gets focused
            element.classList.add(DRAGOVER_CLASS);
        }
        function deactivate() {
            element.classList.remove(DRAGOVER_CLASS);
        }
        function update(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadonchange(options)(e);
            m.redraw();
        }
    }

    var uploadConfig = function (ctrl) { return function (element, isInitialized) {
        if (!isInitialized) {
            dragdrop(element, {onchange: ctrl.onchange});
        }
    }; };

    // call onchange with files
    var uploadonchange = function (args) { return function (e) {
        var dt = e.dataTransfer || e.target;
        var cb = args.onchange;

        if (typeof cb !== 'function') return;

        if (dt.items && dt.items.length && 'webkitGetAsEntry' in dt.items[0]) {
            entriesApi(dt.items, cb);
        } else if ('getFilesAndDirectories' in dt) {
            newDirectoryApi(dt, cb);
        } else if (dt.files) {
            arrayApi(dt, cb);
        } else cb();
    }; };

    // API implemented in Firefox 42+ and Edge
    function newDirectoryApi(input, cb) {
        var fd = new FormData(), files = [];
        var iterate = function(entries, path, resolve) {
            var promises = [];
            entries.forEach(function(entry) {
                promises.push(new Promise(function(resolve) {
                    if ('getFilesAndDirectories' in entry) {
                        entry.getFilesAndDirectories().then(function(entries) {
                            iterate(entries, entry.path + '/', resolve);
                        });
                    } else {
                        if (entry.name) {
                            var p = (path + entry.name).replace(/^[/\\]/, '');
                            fd.append('files[]', entry, p);
                            files.push(p);
                        }
                        resolve();
                    }
                }));
            });
            Promise.all(promises).then(resolve);
        };
        input.getFilesAndDirectories().then(function(entries) {
            new Promise(function(resolve) {
                iterate(entries, '/', resolve);
            }).then(cb.bind(null, fd, files));
        });
    }

    // old prefixed API implemented in Chrome 11+ as well as array fallback
    function arrayApi(input, cb) {
        var fd = new FormData(), files = [];
        [].slice.call(input.files).forEach(function(file) {
            fd.append('files[]', file, file.webkitRelativePath || file.name);
            files.push(file.webkitRelativePath || file.name);
        });
        cb(fd, files);
    }

    // old drag and drop API implemented in Chrome 11+
    function entriesApi(items, cb) {
        var fd = new FormData(), files = [], rootPromises = [];

        function readEntries(entry, reader, oldEntries, cb) {
            var dirReader = reader || entry.createReader();
            dirReader.readEntries(function(entries) {
                var newEntries = oldEntries ? oldEntries.concat(entries) : entries;
                if (entries.length) {
                    setTimeout(readEntries.bind(null, entry, dirReader, newEntries, cb), 0);
                } else {
                    cb(newEntries);
                }
            });
        }

        function readDirectory(entry, path, resolve) {
            if (!path) path = entry.name;
            readEntries(entry, 0, 0, function(entries) {
                var promises = [];
                entries.forEach(function(entry) {
                    promises.push(new Promise(function(resolve) {
                        if (entry.isFile) {
                            entry.file(function(file) {
                                var p = path + '/' + file.name;
                                fd.append('files[]', file, p);
                                files.push(p);
                                resolve();
                            }, resolve.bind());
                        } else readDirectory(entry, path + '/' + entry.name, resolve);
                    }));
                });
                Promise.all(promises).then(resolve.bind());
            });
        }

        [].slice.call(items).forEach(function(entry) {
            entry = entry.webkitGetAsEntry();
            if (entry) {
                rootPromises.push(new Promise(function(resolve) {
                    if (entry.isFile) {
                        entry.file(function(file) {
                            fd.append('files[]', file, file.name);
                            files.push(file.name);
                            resolve();
                        }, resolve.bind());
                    } else if (entry.isDirectory) {
                        readDirectory(entry, null, resolve);
                    }
                }));
            }
        });
        Promise.all(rootPromises).then(cb.bind(null, fd, files));
    }

    var node = function (args) { return m.component(nodeComponent, args); };

    var nodeComponent = {
        view: function (ctrl, ref) {
            var file = ref.file;
            var folderHash = ref.folderHash;
            var study = ref.study;

            var vm = study.vm(file.id); // vm is created by the studyModel
            var hasChildren = !!(file.isDir && file.files && file.files.length);
            return m('li.file-node',
                {
                    key: file.id,
                    class: classNames({
                        open : vm.isOpen()
                    }),
                    onclick: file.isDir ? toggleOpen(vm) : select(file),
                    oncontextmenu: fileContext(file, study),
                    config: file.isDir ? uploadConfig({onchange:uploadFiles(file.path, study)}) : null
                },
                [
                    m('a.wholerow', {
                        unselectable:'on',
                        class:classNames({
                            'current': m.route.param('fileId') === file.id
                        })
                    }, m.trust('&nbsp;')),
                    m('i.fa.fa-fw', {
                        class: classNames({
                            'fa-caret-right' : hasChildren && !vm.isOpen(),
                            'fa-caret-down': hasChildren && vm.isOpen()
                        })
                    }),

                    m('a', {class:classNames({'text-primary': /\.expt\.xml$/.test(file.name)})}, [
                        // checkbox
                        m('i.fa.fa-fw', {
                            onclick: choose({file: file,study: study}),
                            class: classNames({
                                'fa-check-square-o': vm.isChosen() === 1,
                                'fa-square-o': vm.isChosen() === 0,
                                'fa-minus-square-o': vm.isChosen() === -1
                            })
                        }),

                        // icon
                        m('i.fa.fa-fw.fa-file-o', {
                            class: classNames({
                                'fa-file-code-o': /(js)$/.test(file.type),
                                'fa-file-text-o': /(jst|html|xml)$/.test(file.type),
                                'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
                                'fa-file-pdf-o': /(pdf)$/.test(file.type),
                                'fa-folder-o': file.isDir
                            })
                        }),

                        // file name
                        m('span',{class:classNames({'font-weight-bold':file.hasChanged()})},(" " + (file.name))),

                        // children
                        hasChildren && vm.isOpen() ? folder({path: file.path + '/', folderHash: folderHash, study: study}) : ''
                    ])
                ]
            );
        }
    };

    var toggleOpen = function (vm) { return function (e) {
        vm.isOpen(!vm.isOpen());
        e.preventDefault();
        e.stopPropagation();
    }; };

    // select specific file and display it
    var select = function (file) { return function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (file.viewStudy) m.route(("/view/" + (m.route.param('code')) + "/file/" + (encodeURIComponent(file.id))));
        else m.route(("/editor/" + (file.studyId) + "/file/" + (encodeURIComponent(file.id))));
        m.redraw.strategy('diff'); // make sure that the route change is diffed as opposed to redraws
    }; };

    // checkmark a file/folder
    var choose = function (ref) {
        var file = ref.file;
        var study = ref.study;

        return function (e) {
        e.stopPropagation();
        e.preventDefault();

        var currentState = isChosen(file)();
        var newState = currentState === 1 ? 0 : 1;

        // mark decendents (and the file itself
        study
            .getChildren(file)
            .forEach(function (f) { return isChosen(f)(newState); }); // update vm for each child

        study
            .getParents(file)
            .forEach(function (file) {
                var checked = study
                    .getChildren(file)
                    .filter(function (f) { return f !== file; })
                    .map(function (f) { return isChosen(f)(); })
                    .reverse();

                var state = checked.every(function (v) { return v === 0; })
                    ? 0
                    : checked.every(function (v) { return v === 1; })
                        ? 1
                        : -1;

                isChosen(file)(state);
            });

        function isChosen(file){
            return study.vm(file.id).isChosen;
        }
    };
    };

    var folder = function (args) {
        args.key = args.path;
        return m.component(folderComponent, args);
    };

    var folderComponent = {
        view: function view(ctrl, ref){
            var path = ref.path;
            var folderHash = ref.folderHash;
            var study = ref.study;

            var files = folderHash[path] || [];

            return m('.files', [
                m('ul', files.map(function (file) { return node({key: file.id, file: file, folderHash: folderHash, study: study}); }))
            ]);
        }
    };

    var filesList = function (ref) {
        var study = ref.study;

        var folderHash = parseFiles(study.files());
        var config = uploadConfig({onchange:uploadFiles('/', study)});
        var chooseState = getCurrentState(study); 

        return m('.sidebar-files', {config: config}, [
            m('h5', [
                m('small', [
                    m('i.fa.fa-fw', {
                        onclick: choose$1(chooseState, study),
                        class: classNames({
                            'fa-check-square-o': chooseState === 1,
                            'fa-square-o': chooseState === 0,
                            'fa-minus-square-o': chooseState === -1
                        })
                    })
                ]),
                m('a.no-decoration', {href:("/editor/" + (study.id)), config:m.route}, study.name)
            ]),
            study.isUploading
                ? m('div', [
                    m('.loader'),
                    m('.text-sm-center', [
                        m('strong', 'UPLOADING...')
                    ])
                ])
                : folder({path:'/',folderHash: folderHash, study: study})
        ]);
    };

    var parseFiles = function (files) { return files.reduce(function (hash, file){
        var path = file.basePath;
        if (!hash[path]) hash[path] = [];
        hash[path].push(file);
        return hash;
    }, {}); };

    function choose$1(currentState, study){
        return function () { return study.files().forEach(function (file) { return study.vm(file.id).isChosen(currentState === 1 ? 0 : 1); }); };
    }

    function getCurrentState(study){
        var vm = study.vm;
        var filesCount = study.files().length;
        var chosenCount = study.files().reduce(function (result, file) { return vm(file.id).isChosen() ? result + 1 : result; }, 0);
        return !chosenCount ? 0 : filesCount === chosenCount ? 1 : -1;
    }

    /**
     * VirtualElement dropdown(Object {String toggleSelector, Element toggleContent, Element elements})
     *
     * where:
     *  Element String text | VirtualElement virtualElement | Component
     * 
     * @param toggleSelector the selector for the toggle element
     * @param toggleContent the: content for the toggle element
     * @param elements: a list of dropdown items (http://v4-alpha.getbootstrap.com/components/dropdowns/)
     **/
    var dropdown = function (args) { return m.component(dropdownComponent, args); };


    var dropdownComponent = {
        controller: function controller(){
            return {
                isOpen : m.prop(false),
                inLowerViewport: m.prop(true)
            };
        },

        view: function view(ref, ref$1){
            var isOpen = ref.isOpen;
            var inLowerViewport = ref.inLowerViewport;
            var toggleSelector = ref$1.toggleSelector;
            var toggleContent = ref$1.toggleContent;
            var elements = ref$1.elements;
            var right = ref$1.right;

            return m('.dropdown.dropdown-component', { class: classNames({ open: isOpen()}), config: dropdownComponent.config(isOpen)}, [
                m(toggleSelector, {onmousedown: onmousedown}, toggleContent), 
                m('.dropdown-menu', {class: classNames({'dropdown-menu-right' :right, 'dropdown-menu-up': inLowerViewport()})}, elements)
            ]);

            function onmousedown(e){
                inLowerViewport(document.documentElement.clientHeight / 2 < e.target.getBoundingClientRect().top);
                isOpen(!isOpen());
            }
        },

        config: function (isOpen) { return function (element, isInit, ctx) {
            if (!isInit) {
                // this is a bit memory intensive, but lets not preemptively optimse
                // bootstrap does this with a backdrop
                document.addEventListener('mousedown', onClick, false);
                ctx.onunload = function () { return document.removeEventListener('mousedown', onClick); };
            }

            function onClick(e){
                if (!isOpen()) return;

                // if we are within the dropdown do not close it
                // this is conditional to prevent IE problems
                if (e.target.closest && e.target.closest('.dropdown') === element && !hasClass(e.target, 'dropdown-onclick')) return true;
                isOpen(false);
                m.redraw();
            }

            function hasClass(el, selector){
                return ( (' ' + el.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + selector + ' ') > -1 );
            }
        }; }
    };

    function studyTemplatesComponent (args) { return m.component(studyTemplatesComponent$1, args); }
    var studyTemplatesComponent$1 = {
        controller: function controller(ref){
            var load_templates = ref.load_templates;
            var studies = ref.studies;
            var reuse_id = ref.reuse_id;
            var templates = ref.templates;
            var template_id = ref.template_id;

            var loaded = m.prop(false);
            var error = m.prop(null);
            load_templates()
                .then(function (response) { return templates(response.templates); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);
            return {studies: studies, template_id: template_id, reuse_id: reuse_id, templates: templates, loaded: loaded, error: error};
        },
        view: function (ref) {
            var studies = ref.studies;
            var template_id = ref.template_id;
            var reuse_id = ref.reuse_id;
            var templates = ref.templates;
            var loaded = ref.loaded;
            var error = ref.error;

            return m('div.space', [
            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',
            loaded() && !templates().length ? m('.alert.alert-info', 'There is no templates yet') : '',
            m('select.form-control', {value:template_id(), onchange: m.withAttr('value',template_id)}, [
                m('option',{value:'', disabled: true}, 'Select template'),
                templates().filter(ownerFilter()).sort(sort_studies).map(function (study) { return m('option',{value:study.id}, study.name); })
            ]),
            !template_id() ? '' :
                m('div.space', [
                    m('select.form-control', {value:reuse_id(), onchange: m.withAttr('value',reuse_id)}, [
                        m('option',{value:'', disabled: true}, 'Select template for reuse (optional)'),
                        studies.map(function (study) { return m('option',{value:study.id}, study.name); })
                    ])])

        ]);
    }
    };

    function sort_studies(study_1, study_2){return study_1.name.toLowerCase() === study_2.name.toLowerCase() ? 0 : study_1.name.toLowerCase() > study_2.name.toLowerCase() ? 1 : -1;}

    var ownerFilter = function () { return function (study) {
        return study.permission == 'owner';
    }; };

    function tag_url(tag_id)
    {
        return (tagsUrl + "/" + (encodeURIComponent(tag_id)));
    }

    function study_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/tags");
    }

    var update_tags_in_study = function (study_id, tags) { return fetchJson(study_url(study_id), {
        method: 'put',
        body: {tags: tags}
    }); };

    var get_tags = function () { return fetchJson(tagsUrl, {
        method: 'get'
    }); };


    var get_tags_for_study = function (study_id) { return fetchJson(study_url(study_id), {
        method: 'get'
    }); };

    var remove_tag = function (tag_id) { return fetchJson(tag_url(tag_id), {
        method: 'delete'
    }); };

    var add_tag = function (tag_text, tag_color) { return fetchJson(tagsUrl, {
        method: 'post',
        body: {tag_text: tag_text, tag_color: tag_color}
    }); };

    var edit_tag = function (tag_id, tag_text, tag_color) { return fetchJson(tag_url(tag_id), {
        method: 'put',
        body: {tag_text: tag_text, tag_color: tag_color}
    }); };

    function studyTagsComponent (args) { return m.component(studyTagsComponent$1, args); }
    var studyTagsComponent$1 = {
        controller: function controller(ref){
            var tags = ref.tags;
            var study_id = ref.study_id;

            var tagName = m.prop('');
            var loaded = m.prop(false);
            var error = m.prop(null);
            get_tags_for_study(study_id)
                .then(function (response) { return tags(response.tags); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);

            return {tagName: tagName, tags: tags, loaded: loaded, error: error};
        },
        view: function (ref, ref$1) {
            var tagName = ref.tagName;
            var tags = ref.tags;
            var loaded = ref.loaded;
            var error = ref.error;
            var study_id = ref$1.study_id;

            return m('div', [
            m('.input-group', [
                m('input.form-control', {
                    placeholder: 'Filter Tags',
                    value: tagName(),
                    oninput: m.withAttr('value', tagName)
                }),
                m('span.input-group-btn', [
                    m('button.btn.btn-secondary', {onclick: create_tag(study_id, tagName, tags, error), disabled: !tagName()}, [
                        m('i.fa.fa-plus'),
                        ' Create New'
                    ])
                ])
            ]),
            m('.small.text-muted.m-b-1', 'Use this text field to filter your tags. Click "Create New" to turn a filter into a new tag'),

            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',
            loaded() && !tags().length ? m('.alert.alert-info', 'You have no tags yet') : '',

            m('.custom-controls-stacked.pre-scrollable', tags().sort(sort_tags).filter(filter_tags(tagName())).map(function (tag) { return m('label.custom-control.custom-checkbox', [
                m('input.custom-control-input', {
                    type: 'checkbox',
                    checked: tag.used,
                    onclick: function(){
                        tag.used = !tag.used;
                        tag.changed = !tag.changed;
                    }
                }), 
                m('span.custom-control-indicator'),
                m('span.custom-control-description.m-l-1.study-tag',{style: {'background-color': '#' + tag.color}}, tag.text)
            ]); }))
        ]);
    }
    };

    function filter_tags(val){return function (tag) { return tag.text.indexOf(val) !== -1; };}
    function sort_tags(tag_1, tag_2){return tag_1.text.toLowerCase() === tag_2.text.toLowerCase() ? 0 : tag_1.text.toLowerCase() > tag_2.text.toLowerCase() ? 1 : -1;}       


    function create_tag(study_id, tagName, tags, error){
        return function () { return add_tag(tagName(), 'E7E7E7')
            .then(function (response) { return tags().push(response); })
            .then(tagName.bind(null, ''))
            .catch(error)
            .then(m.redraw); };
    }

    function createMessage$3 (args) { return m.component(createMessage$4, args); }
    var createMessage$4 = {
        controller: function controller(ref){
            var exps = ref.exps;
            var dates = ref.dates;
            var study_id = ref.study_id;
            var versions = ref.versions;
            var close = ref.close;

            var ctrl = {
                data_study_id: m.prop(''),
                exp_id: m.prop(''),
                study_id:m.prop(study_id),
                exps: exps,
                versions: versions,
                studies: m.prop([]),
                version_id: m.prop(''),
                all_exp_ids: m.prop(''),
                all_versions: m.prop(''),
                file_format: m.prop('csv'),
                file_split: m.prop('taskName'),

                loaded: m.prop(false),
                downloaded: m.prop(true),
                link: m.prop(''),
                error: m.prop(null),
                dates: {
                    startDate: m.prop(daysAgo$1(3650)),
                    endDate: m.prop(daysAgo$1(-1))
                }
            };

            load_studies()
                .then(function (response) {
                    ctrl.studies(response.studies);
                    ctrl.studies(ctrl.studies().filter(function (study){ return study.has_data_permission; }).sort(sort_studies_by_name));
                }).then(function (){ return load_exps(ctrl); });

            return {ctrl: ctrl, close: close};
        },
        view: function (ref) {
            var ctrl = ref.ctrl;
            var close = ref.close;

            return m('div', [
            m('.card-block', [
                m('.input-group', [m('strong', 'Study name'),
                    m('select.c-select.form-control',{onchange: function (e) { return select_study(ctrl, e.target.value); }}, [
                        ctrl.studies().map(function (study){ return m('option', {value:study.id, selected:study.id==ctrl.study_id()} , study.name); })
                    ])
                ]),
                m('.row', [
                    m('.col-sm-4', [
                        m('.input-group', [m('strong', 'Experimant id'),
                            m('select.c-select.form-control',{onchange: function (e) { return ctrl.exp_id(e.target.value); }}, [
                                ctrl.exps().length<=1 ? '' : m('option', {selected:true, value:ctrl.all_exp_ids()}, 'All experiments'),
                                ctrl.exps().map(function (exp){ return m('option', {value:exp.ids} , exp.descriptive_id); })
                            ])
                        ])
                    ]),
                    m('.col-sm-5', [
                        m('.input-group', [m('strong', 'Version id'),
                            m('select.c-select.form-control',{onchange: function (e) { return ctrl.version_id(e.target.value); }}, [
                                ctrl.versions.length<=1 ? '' : m('option', {selected:true, value:ctrl.all_versions()}, 'All versions'),
                                ctrl.versions.map(function (version){ return m('option', {value:version.id}, ((version.version) + " (" + (version.state) + ")")); })
                            ])
                        ])
                    ]),
                    m('.col-sm-3', [
                        m('.input-group', [m('strong', 'Output type'),
                            m('select.c-select.form-control',{onchange: function (e) { return ctrl.file_format(e.target.value); }}, [
                                m('option', {value:'csv'}, 'csv'),
                                m('option', {value:'tsv'}, 'tsv'),
                                m('option', {value:'json'}, 'json')
                            ])
                        ])
                    ])
                ]),
                m('.row.space', [
                    m('.col-sm-9', [
                        m('span', 'Split to files by (clear text to download in one file):'),
                        m('input.form-control', {
                            placeholder: 'File split variable',
                            value: ctrl.file_split(),
                            oninput: m.withAttr('value', ctrl.file_split)
                        })
                    ])

                ]),
                m('.row.space', [
                    m('.col-sm-12', [
                        m('.form-group', [
                            dateRangePicker(ctrl.dates),
                            m('p.text-muted.btn-toolbar', [
                                dayButtonView$2(ctrl.dates, 'Last 7 Days', 7),
                                dayButtonView$2(ctrl.dates, 'Last 30 Days', 30),
                                dayButtonView$2(ctrl.dates, 'Last 90 Days', 90),
                                dayButtonView$2(ctrl.dates, 'All time', 3650)
                            ])
                        ])
                    ])
                ])
            ]),
            ctrl.loaded() ? '' : m('.loader'),
            ctrl.error() ? m('.alert.alert-warning', ctrl.error()): '',
            !ctrl.loaded() && ctrl.exps().length<1 ? m('.alert.alert-info', 'You have no experiments yet') : '',

            !ctrl.link() ? '' : m('input-group-addon', ['Your file is ready for downloading: ', m('a', {href: ctrl.link()}, ctrl.link())]),

            ctrl.downloaded() ? '' : m('.loader'),
            m('.text-xs-right.btn-toolbar',[
                m('a.btn.btn-secondary.btn-sm', {onclick:function (){close(null);}}, 'Cancel'),
                m('a.btn.btn-primary.btn-sm', {onclick:function (){ask_get_data(ctrl); }}, 'OK')
            ])
        ]);
    }
    };

    function ask_get_data(ctrl){
        ctrl.error('');
        if(ctrl.exp_id() ==='')
            return error('Please select experiment id');

        if(!Array.isArray(ctrl.exp_id()))
            ctrl.exp_id(ctrl.exp_id().split(','));
        ctrl.downloaded(false);

        return get_data(ctrl.study_id(), ctrl.exp_id(), ctrl.version_id(), ctrl.file_format(), ctrl.file_split(), ctrl.dates.startDate(), ctrl.dates.endDate())
            .then(function (response) {
                var file_data = response.data_file;
                if (file_data == null) return Promise.reject('There was a problem creating your file, please contact your administrator');
                ctrl.link((baseUrl + "/download?path=" + file_data), file_data);
            })
            .catch(function (err){ return ctrl.error(err.message); })
            .then(function (){ return ctrl.downloaded(true); })

            .then(m.redraw);
    }

    // helper functions for the day buttons
    var daysAgo$1 = function (days) {
        var d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    };
    var equalDates$1 = function (date1, date2) { return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth(); };
    var activeDate$1 = function (ref, days) {
        var startDate = ref.startDate;
        var endDate = ref.endDate;

        return equalDates$1(startDate(), daysAgo$1(days)) && equalDates$1(endDate(), new Date());
    };
    var dayButtonView$2 = function (dates, name, days) { return m('button.btn.btn-secondary.btn-sm', {

        class: activeDate$1(dates, days)? 'active' : '',
        onclick: function () {
            dates.startDate(daysAgo$1(days));
            dates.endDate(new Date());
        }
    }, name); };



    function sort_studies_by_name(study1, study2){
        return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
    }



    function select_study(ctrl, study_id){
        ctrl.study_id(study_id);
        ctrl.loaded.bind(null, false);
        var new_study = ctrl.studies().filter(function (study){ return study.id==study_id; })[0];    ctrl.versions = new_study.versions;
        return load_exps(ctrl);

    }

    function load_exps(ctrl){
        get_exps(ctrl.study_id())
            .then(function (response) {
                ctrl.exps(response.experiments);
                ctrl.all_exp_ids(ctrl.exps().map(function (exp){ return exp.id; }));
                ctrl.exp_id(ctrl.all_exp_ids());
                var tmp_exps = [];
                ctrl.exps().forEach(function (exp){
                    !tmp_exps.find(function (exp2find){ return exp2find.descriptive_id === exp.descriptive_id; })
                        ?
                        tmp_exps.push({ids:[exp.id], descriptive_id:exp.descriptive_id})
                        :
                        tmp_exps.map(function (exp2update){ return exp2update.descriptive_id === exp.descriptive_id ? exp2update.ids.push(exp.id) : exp2update; });
                    ctrl.exps(tmp_exps);
                });
                console.log(ctrl.exps());
            })
            .then(function (){
                ctrl.all_versions(ctrl.versions.map(function (version){ return version.id; }));
                ctrl.version_id(ctrl.all_versions());
            })
            .catch(ctrl.error)
            .then(ctrl.loaded.bind(null, true))
            .then(m.redraw);
    }

    function collaboration_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/collaboration");
    }

    function link_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/link");
    }



    function public_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/public");
    }

    var get_collaborations = function (study_id) { return fetchJson(collaboration_url(study_id), {
        method: 'get'
    }); };

    var remove_collaboration = function (study_id, user_id) { return fetchJson(collaboration_url(study_id), {
        method: 'delete',
        body: {user_id: user_id}
    }); };


    var add_collaboration = function (study_id, user_name, permission, data_permission) { return fetchJson(collaboration_url(study_id), {
        method: 'post',
        body: {user_name: user_name, permission: permission, data_permission: data_permission}
    }); };


    var add_link = function (study_id) { return fetchJson(link_url(study_id), {
        method: 'post'
    }); };

    var revoke_link = function (study_id) { return fetchJson(link_url(study_id), {
        method: 'delete'
    }); };



    var make_pulic = function (study_id, is_public) { return fetchJson(public_url(study_id), {
        method: 'post',
        body: {is_public: is_public}
    }); };

    var do_create = function (type, studies) {
        var study_name = m.prop('');
        var description = m.prop('');
        var templates = m.prop([]);
        var template_id = m.prop('');
        var reuse_id = m.prop('');
        var error = m.prop('');
        var isOpenServer = true;
        var study_type = m.prop('minno02');
        var isTemplate = type !== 'regular';

        var ask = function () { return messages.confirm({
            header: isTemplate ? 'New Template Study' : 'New Study',
            content: m.component({
                view: function () { return m('p', [
                    m('.form-group', [
                        m('label', 'Enter Study Name:'),
                        m('input.form-control',  {oninput: m.withAttr('value', study_name)})
                    ]),
                    m('.form-group', [
                        m('label', 'Enter Study Description:'),
                        m('textarea.form-control',  {oninput: m.withAttr('value', description)})
                    ]),
                    isTemplate || !isOpenServer ? '' : m('.form-group', [
                        m('label', 'Pick Study Player:'),
                        m('select.c-select.form-control', { onchange: m.withAttr('value', study_type)}, [
                            m('option', {value:'minno02'}, 'MinnoJS v0.2'),
                            m('option', {value:'html'}, 'JSPysch (run any HTML)')
                        ])
                    ]),
                    !error() ? '' : m('p.alert.alert-danger', error()),
                    !isTemplate ? '' : m('p', studyTemplatesComponent({load_templates: load_templates, studies: studies, reuse_id: reuse_id, templates: templates, template_id: template_id}))
                ]); }
            })
        }).then(function (response) { return response && create(); }); };

        var create = function () { return create_study({study_name: study_name, study_type: study_type, description: description, type: type, template_id: template_id, reuse_id: reuse_id})
            .then(function (response) { return m.route(type == 'regular' ? ("/editor/" + (response.study_id)) : ("/translate/" + (response.study_id))); })
            .catch(function (e) {
                error(e.message);
                ask();
            }); };
        ask();
    };

    var do_tags = function (study) { return function (e) {
        e.preventDefault();
        var study_id = study.id;
        var filter_tags = function (){return function (tag) { return tag.changed; };};
        var tags = m.prop([]);
        messages.confirm({header:'Tags', content: studyTagsComponent({tags: tags, study_id: study_id})})
            .then(function (response) {
                if (response){
                    var new_tags = tags().filter(function (tag){ return tag.used; });
                    study.tags = new_tags;
                    tags(tags().filter(filter_tags()).map(function (tag){ return (({text: tag.text, id: tag.id, used: tag.used})); }));
                    return update_tags_in_study(study_id, tags);
                }
            })
            .then(m.redraw);
    }; };

    var do_data = function (study) { return function (e) {
        e.preventDefault();
        // let exps = get_exps[]);
        // console.log(exps);

        var study_id = study.id;
        var versions = study.versions;
        var exps = m.prop([]);
        var tags = m.prop([]);
        var dates = m.prop();

        var close = messages.close;
        messages.custom({header:'Data download', content: createMessage$3({tags: tags, exps: exps, dates: dates, study_id: study_id, versions: versions, close: close})})
            .then(m.redraw);
    }; };


    var do_make_public = function (study) { return function (e) {
        e.preventDefault();
        var error = m.prop('');
        return messages.confirm({okText: ['Yes, make ', !study.is_public ? 'public' : 'private'], cancelText: ['No, keep ', !study.is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', !study.is_public
            ?
            'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
            :
            'Making the study private will hide its files from everyone but you.'),
        m('span', {class: error() ? 'alert alert-danger' : ''}, error())])})
            .then(function (response) {
                if (response) make_pulic(study.id, !study.is_public)
                    .then(study.is_public = !study.is_public)
                    .then(m.redraw);
            });

    }; };


    var do_delete = function (study) { return function (e) {
        e.preventDefault();
        return messages.confirm({header:'Delete study', content:'Are you sure?'})
            .then(function (response) {
                if (response) delete_study(study.id)
                    .then(function (){ return study.deleted=true; })
                    .catch(function (error) { return messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}); })
                    .then(m.redraw)
                    .then(m.route('./'))
                ;

            });
    }; };

    var update_study_description = function (study) { return function (e) {
        e.preventDefault();
        var study_description = m.prop(!study.description ? '' : study.description);
        var error = m.prop();

        var ask = function () { return messages.confirm({
            header:'Study Description',
            content: {
                view: function view(){
                    return m('div', [
                        m('textarea.form-control',  {placeholder: 'Enter description', value: study_description(), onchange: m.withAttr('value', study_description)}),
                        !error() ? '' : m('p.alert.alert-danger', error())
                    ]);
                }
            }
        }).then(function (response) { return response && rename(); }); };

        var rename = function () { return update_study(study.id, {description:study_description()})
            .then(function (){ return study.description=study_description(); })
            .catch(function (e) {
                error(e.message);
                ask();
            })
            .then(m.redraw); };

        ask();
    }; };

    var do_rename = function (study) { return function (e) {
        e.preventDefault();
        var study_name = m.prop(study.name);
        var error = m.prop('');

        var ask = function () { return messages.confirm({
            header:'New Name',
            content: {
                view: function view(){
                    return m('div', [
                        m('input.form-control',  {placeholder: 'Enter Study Name', value: study_name(), onchange: m.withAttr('value', study_name)}),
                        !error() ? '' : m('p.alert.alert-danger', error())
                    ]);
                }
            }
        }).then(function (response) { return response && rename(); }); };

        var rename = function () { return rename_study(study.id, study_name)
            .then(function (){ return study.name=study_name(); })
            .then(m.redraw)
            .catch(function (e) {
                error(e.message);
                ask();
            }).then(m.redraw); };

        ask();
    }; };

    var do_duplicate= function (study, callback) { return function (e) {
        e.preventDefault();
        var study_name = m.prop(study.name);
        var error = m.prop('');

        var ask = function () { return messages.confirm({
            header:'New Name',
            content: m('div', [
                m('input.form-control', {placeholder: 'Enter Study Name', onchange: m.withAttr('value', study_name)}),
                !error() ? '' : m('p.alert.alert-danger', error())
            ])
        }).then(function (response) { return response && duplicate(); }); };

        var duplicate= function () { return duplicate_study(study.id, study_name)
            .then(function (response) { return m.route( study.type=='regular' ? ("/editor/" + (response.study_id)): ("/editor/" + (response.study_id)) ); })
            .then(callback)
            .then(m.redraw)
            .catch(function (e) {
                error(e.message);
                ask();
            }); };
        ask();
    }; };

    var do_lock = function (study, callback) { return function (e) {
        e.preventDefault();
        var error = m.prop('');

        var ask = function () { return messages.confirm({okText: ['Yes, ', study.is_locked ? 'unlock' : 'lock' , ' the study'], cancelText: 'Cancel', header:'Are you sure?', content:m('p', [m('p', study.is_locked
            ?
            !study.is_published
                ?
                'Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'
                :
                [
                    m('p','Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'),
                    m('p','However, the study is currently published so you might want to make sure participants are not taking it. We recommend unlocking a published study only if you know that participants are not taking it while you modify the files, or if you know exactly what you are going to change and you are confident that you will not make mistakes that will break the study.')
                ]
            :
            'Are you sure you want to lock the study? This will prevent you from modifying the study until you unlock the study again. When a study is locked, you cannot add files, delete files, rename files, edit files, rename the study, or delete the study.'),
        !error() ? '' : m('p.alert.alert-danger', error())])
        })

            .then(function (response) { return response && lock(); }); };

        var lock= function () { return lock_study(study.id, !study.is_locked)
            .then(function () { return study.is_locked = !study.is_locked; })
            .then(function () { return study.isReadonly = study.is_locked; })
            .then(callback)

            .catch(function (e) {
                error(e.message);
                ask();
            })
            .then(m.redraw); };
        ask();
    }; };

    var do_publish = function (study, callback) { return function (e) {
        e.preventDefault();
        var error = m.prop('');
        var update_url =m.prop('update');

        var ask = function () { return messages.confirm({okText: ['Yes, ', study.is_published ? 'Unpublish' : 'Publish' , ' the study'], cancelText: 'Cancel', header:[study.is_published ? 'Unpublish' : 'Publish', ' the study?'],
            content:m('p',
                [m('p', study.is_published
                    ?
                    'The launch URL participants used to run the study will be removed. Participants using this link will see an error page. Use it if you completed running the study, or if you want to pause the study and prevent participants from taking it for a while. You will be able to publish the study again, if you want.'
                    :
                    [
                        m('p', 'This will create a link that participants can use to launch the study.'),
                        m('p', 'Publishing locks the study for editing to prevent you from modifying the files while participants take the study. To make changes to the study, you will be able to unpublish it later.'),
                        m('p', 'Although it is strongly not recommended, you can also unlock the study after it is published by using Unlock Study in the Study menu.'),
                        m('p', 'After you publish the study, you can obtain the new launch URL by right clicking on the experiment file and choosing Experiment options->Copy Launch URL')

                        ,m('.input-group', [
                            m('select.c-select.form-control',{onchange: function (e) { return update_url(e.target.value); }}, [
                                m('option', {value:'update', selected:true}, 'Update the launch URL'),
                                m('option', {value:'keep'}, 'Keep the launch URL'),
                                study.versions.length<2 ? '' : m('option', {value:'reuse'}, 'Use the launch URL from the previous published version')
                            ])
                        ])
                    ]),
                !error() ? '' : m('p.alert.alert-danger', error())])
        })

            .then(function (response) { return response && publish(); }); };

        var publish= function () { return publish_study(study.id, !study.is_published, update_url)
            .then(function (res){ return study.versions.push(res); })
            .then(study.is_published = !study.is_published)
            .then(study.is_locked = study.is_published || study.is_locked)
            .then(study.isReadonly = study.is_locked)
            .then(callback)

            .catch(function (e) {
                error(e.message);
                ask();
            })
            .then(m.redraw); };
        ask();
    }; };

    var do_copy_url = function (study) { return copyUrl(study.base_url); };

    var can_edit = function (study) { return !study.isReadonly && study.permission !== 'read only'; };

    var is_locked = function (study) { return study.is_locked; };
    var is_published = function (study) { return study.is_published; };
    var is_public = function (study) { return study.is_public; };

    var not = function (fn) { return function (study) { return !fn(study); }; };

    var settings = {
        'tags':[],
        'data':[],
        'delete':[],
        'rename':[],
        'description':[],
        'duplicate':[],
        'publish':[],
        'unpublish':[],
        'lock':[],
        'unlock':[],
        // 'deploy':[],
        // 'studyChangeRequest':[],
        // 'studyRemoval':[],
        'sharing':[],
        'public':[],
        'private':[],
        // 'unpublic':[],
        'copyUrl':[]
    };

    var settings_hash = {
        tags: {text: 'Tags',
            config: {
                display: [can_edit],
                onmousedown: do_tags,
                class: 'fa-tags'
            }},
        data: {text: 'Data',
            config: {
                display: [can_edit],
                onmousedown: do_data,
                class: 'fa-download'
            }},
        delete: {text: 'Delete Study',
            config: {
                display: [can_edit, not(is_locked)],
                onmousedown: do_delete,
                class: 'fa-remove'
            }},
        rename: {text: 'Rename Study',
            config: {
                display: [can_edit, not(is_locked)],
                onmousedown: do_rename,
                class: 'fa-exchange'
            }},
        description: {text: 'Change description',
            config: {
                display: [can_edit, not(is_locked)],
                onmousedown: update_study_description,
                class: 'fa-comment'
            }},
        duplicate: {text: 'Duplicate study',
            config: {
                onmousedown: do_duplicate,
                class: 'fa-clone'
            }},
        lock: {text: 'Lock Study',
            config: {
                display: [can_edit, not(is_locked)],
                onmousedown: do_lock,
                class: 'fa-lock'
            }},
        publish: {text: 'Publish Study',
            config: {
                display: [can_edit, not(is_locked), not(is_published)],
                onmousedown: do_publish,
                class: 'fa-cloud-upload'
            }},
        unpublish: {text: 'Unpublish Study', config: {
            display: [can_edit, is_published],
            onmousedown: do_publish,
            class: 'fa-cloud-upload'
        }},

        republish: {text: 'Republish Study', config: {
            display: [can_edit, not(is_published)],
            onmousedown: do_publish,
            class: 'fa-cloud-upload'
        }},

        public: {text: 'Make public', config: {
            display: [can_edit, not(is_locked), not(is_public)],
            onmousedown: do_make_public,
            class: 'fa-globe'
        }},

        private: {text: 'Make private', config: {
            display: [can_edit, not(is_locked), is_public],
            onmousedown: do_make_public,
            class: 'fa-globe'
        }},


        unlock: {text: 'Unlock Study',
            config: {
                display: [can_edit, is_locked],
                onmousedown: do_lock,
                class: 'fa-unlock'
            }},
        deploy: {text: 'Request Deploy',
            config: {
                display: [can_edit, not(is_locked)],
                href: "/deploy/"
            }},
        studyChangeRequest: {text: 'Request Change',
            config: {
                display: [can_edit, not(is_locked)],
                href: "/studyChangeRequest/"
            }},
        studyRemoval: {text: 'Request Removal',
            config: {
                display: [can_edit, not(is_locked)],
                href: "/studyRemoval/"
            }},
        sharing: {text: 'Sharing',
            config: {
                display: [can_edit],
                href: "/sharing/",
                class: 'fa-user-plus'
            }},
        copyUrl: {text: 'Copy Base URL',
            config: {
                onmousedown: do_copy_url,
                class: 'fa-link'
            }}
    };


    var draw_menu = function (study) { return Object.keys(settings)
        .map(function (comp) {
            var config = settings_hash[comp].config;
            return !should_display(config, study) 
                ? '' 
                : config.href
                    ? m('a.dropdown-item', { href: config.href+study.id, config: m.route }, [
                        m('i.fa.fa-fw.'+config.class),
                        settings_hash[comp].text
                    ])
                    : m('a.dropdown-item.dropdown-onclick', {onmousedown: config.onmousedown(study)}, [
                        m('i.fa.fa-fw.'+config.class),
                        settings_hash[comp].text
                    ]);
        }); };


    function should_display(config, study){
        return !config.display || config.display.every(function (fn) { return fn(study); });
    }

    var sidebarButtons = function (ref) {
        var study = ref.study;

        var readonly = study.isReadonly;

        return m('.sidebar-buttons.btn-toolbar', [
            m('.btn-group.btn-group-sm', [
                dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), elements: [
                    draw_menu(study)
                ]})
            ]),
            m('.btn-group.btn-group-sm', [
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || fileContext(null, study), title: 'Create new files'}, [
                    m('i.fa.fa-plus')
                ]),
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || deleteFiles(study), title: 'Delete selected files'}, [
                    m('i.fa.fa-close')
                ]),
                m('a.btn.btn-secondary.btn-sm', {onclick: downloadChosenFiles(study), title: 'Download selected files'}, [
                    m('i.fa.fa-download')
                ]),
                m('label.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', title: 'Drag files over the file list in order to upload easily'}, [
                    m('i.fa.fa-upload'),
                    readonly ? '' : m('input[type="file"]', {style: 'display:none', multiple:'true', onchange: uploadonchange({onchange:uploadFiles('/', study)})})
                ])
            ])
        ]);
    };

    var sidebarComponent = {
        view: function (ctrl , ref) {
            var study = ref.study;

            return m('.sidebar', {config: config}, [
                sidebarButtons({study: study}),
                filesList({study: study})
            ]);
        }
    };

    function config(el, isInitialized, ctx){
        if (!isInitialized) el.addEventListener('scroll', listen, false);
        el.scrollTop = ctx.scrollTop || 0;

        function listen(){
            ctx.scrollTop = el.scrollTop;
        }
    }

    var splitPane = function (args) { return m.component(splitComponent, args); };

    var splitComponent = {
        controller: function controller(ref){
            var leftWidth = ref.leftWidth;

            return {
                parentWidth: m.prop(),
                parentOffset: m.prop(),
                leftWidth: leftWidth || m.prop('auto')
            };
        },

        view: function view(ref, ref$1){
            var parentWidth = ref.parentWidth;
            var parentOffset = ref.parentOffset;
            var leftWidth = ref.leftWidth;
            var left = ref$1.left; if ( left === void 0 ) left = '';
            var right = ref$1.right; if ( right === void 0 ) right = '';

            return m('.split-pane', {config: config$1(parentWidth, parentOffset, leftWidth)}, [
                m('.split-pane-col-left', {style: {flexBasis: leftWidth() + 'px'}}, left),
                m('.split-pane-divider', {onmousedown: onmousedown(parentOffset, leftWidth)}),
                m('.split-pane-col-right', right)
            ]);
        }
    };

    var config$1 = function (parentWidth, parentLeft, leftWidth) { return function (element, isInitialized, ctx) {
        if (!isInitialized){
            update();
            if (leftWidth() === undefined) leftWidth(parentWidth()/6);
        }

        document.addEventListener('resize', update);
        ctx.onunload = function () { return document.removeEventListener('resize', update); };
        
        function update(){
            parentWidth(element.offsetWidth);
            parentLeft(element.getBoundingClientRect().left);
        }
    }; };

    var onmousedown = function (parentOffset, leftWidth) { return function () {
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', mousemove);

        function mouseup() {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mousemove);
        }

        function mousemove(e){
            leftWidth(e.pageX - parentOffset());
            m.redraw();
        }
    }; };

    var study;
    var editorLayoutComponent = {
        controller: function (){
            var id = m.route.param('studyId');
            if (!study || (study.id !== id)){
                study = studyFactory(id);

                study
                    .get()
                    .catch(function (err){ return study.err = err.message; })
                    .then(m.redraw);
            }

            var ctrl = {study: study, onunload: onunload};

            window.addEventListener('beforeunload', beforeunload);

            return ctrl;

            function hasUnsavedData(){
                return study.files().some(function (f) { return f.content() !== f.sourceContent(); });
            }

            function beforeunload(event) {
                if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
            }

            function onunload(e){

                var leavingEditor = !/^\/editor\//.test(m.route());
                if (leavingEditor && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                    e.preventDefault();
                } else {
                    window.removeEventListener('beforeunload', beforeunload);
                }

                if (leavingEditor) study = null;
            }
        },
        view: function (ref) {
            var study = ref.study;

            return m('.study', {config: fullHeight},  [
                study.err ?
                    m('.alert.alert-danger',
                        m('strong', 'Error: '), study.err)
                    :
                    !study.loaded ? '' :
                        splitPane({
                            leftWidth: leftWidth,
                            left: m.component(sidebarComponent, {study: study}),
                            right: m.route.param('resource') === 'wizard'
                                ? m.component(wizardComponent, {study: study})
                                : m.component(fileEditorComponent, {study: study})
                        })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }

    var studyPrototype$1 = {
        apiURL: function apiURL(path){
            if ( path === void 0 ) path = '';

            return (baseUrl + "/view_files/" + (encodeURIComponent(this.code)) + path);
        },

        get: function get(){
            var this$1 = this;

            return fetchFullJson(this.apiURL())
                .then(function (study) {
                    this$1.loaded = true;
                    this$1.id = study.id;
                    this$1.isReadonly = study.is_readonly;
                    this$1.istemplate = study.is_template;
                    this$1.is_locked = study.is_locked;
                    this$1.name = study.study_name;
                    this$1.baseUrl = study.base_url;
                    var files = flattenFiles(study.files)
                        .map(assignStudyId(this$1.id))
                        .map(assignViewStudy())
                        .map(fileFactory);

                    this$1.files(files);
                    this$1.sort();
                })
                .catch(function (reason) {
                    this$1.error = true;
                    throw(reason);
                    // if(reason.status==404)
                    //
                    // console.log(reason.status);
                    //
                    // return Promise.reject(reason); // do not swallow error
                });

            function flattenFiles(files){
                if (!files) return [];
                return files
                    .map(spreadFile)
                    .reduce(function (result, fileArr) { return result.concat(fileArr); },[]);
            }

            function assignStudyId(id){
                return function (f) { return Object.assign(f, {studyId: id}); };
            }

            function assignViewStudy(){
                return function (f) { return Object.assign(f, {viewStudy: true}); };
            }

            // create an array including file and all its children
            function spreadFile(file){
                return [file].concat(flattenFiles(file.files));
            }
        },

        getFile: function getFile(id){
            return this.files().find(function (f) { return f.id === id; });
        },

        // makes sure not to return both a folder and its contents.
        // This is important mainly for server side clarity (don't delete or download both a folder and its content)
        // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
        getChosenFiles: function getChosenFiles(){
            var vm = this.vm;
            var rootFiles = this.files().filter(function (f) { return f.basePath === '/'; });
            return getChosen(rootFiles);

            function getChosen(files){
                return files.reduce(function (response, file) {
                    // a chosen file/dir does not need sub files to be checked
                    if (vm(file.id).isChosen() === 1) response.push(file);
                    // if not chosen, we need to look deeper
                    else response = response.concat(getChosen(file.files || []));
                    return response;
                }, []);
            }
        },

        addFile: function addFile(file){
            this.files().push(file);
            // update the parent folder
            var parent = this.getParents(file).reduce(function (result, f) { return result && (result.path.length > f.path.length) ? result : f; } , null); 
            if (parent) {
                parent.files || (parent.files = []);
                parent.files.push(file);
            }
        },

        createFile: function createFile(ref){
            var this$1 = this;
            var name = ref.name;
            var content = ref.content; if ( content === void 0 ) content = '';
            var isDir = ref.isDir;

            // validation (make sure there are no invalid characters)
            // eslint-disable-next-line no-useless-escape
            if(/[^\/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: ("The file name \"" + name + "\" is not valid")});

            // validation (make sure file does not already exist)
            var exists = this.files().some(function (file) { return file.path === name; });
            if (exists) return Promise.reject({message: ("The file \"" + name + "\" already exists")});

            // validateion (make sure direcotry exists)
            var basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
            var dirExists = basePath === '' || this.files().some(function (file) { return file.isDir && file.path === basePath; });
            if (!dirExists) return Promise.reject({message: ("The directory \"" + basePath + "\" does not exist")});
            return fetchJson(this.apiURL('/file'), {method:'post', body: {name: name, content: content, isDir: isDir}})
                .then(function (response) {
                    Object.assign(response, {studyId: this$1.id, content: content, path:name, isDir: isDir});
                    var file = fileFactory(response);
                    file.loaded = true;
                    this$1.addFile(file);
                    return response;
                })
                .then(this.sort.bind(this));
        },

        sort: function sort(response){
            var files = this.files().sort(sort);
            this.files(files);
            return response;

            function sort(a,b){
                // sort by isDir then name
                var nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
                if (nameA < nameB) return -1;//sort string ascending
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
            }
        },


        /*
         * @param files [Array] a list of file.path to download
         * @returns url [String] the download url
         */
        downloadFiles: function downloadFiles(files){
            return fetchJson(this.apiURL(), {method: 'post', body: {files: files}})
                .then(function (response) { return (baseUrl + "/download?path=" + (response.zip_file) + "&study=_PATH"); });
        },


        getParents: function getParents(file){
            return this.files().filter(function (f) { return f.isDir && file.basePath.indexOf(f.path) === 0; });
        },

        // returns array of children for this file, including itself
        getChildren: function getChildren(file){
            return children(file);
           
            function children(file){
                if (!file.files) return [file];
                return file.files
                    .map(children) // harvest children
                    .reduce(function (result, files) { return result.concat(files); }, [file]); // flatten
            }
        }
    };

    var studyFactory$1 =  function (code) {
        var study = Object.create(studyPrototype$1);
        Object.assign(study, {
            code    : code,
            id      : '',
            view    : true,
            files   : m.prop([]),
            loaded  : false,
            error   :false,
            vm      : viewModelMap$1({
                isOpen: m.prop(false),
                isChanged: m.prop(false),
                isChosen: m.prop(0)
            })
        });

        return study;
    };

    // http://lhorie.github.io/mithril-blog/mapping-view-models.html
    var viewModelMap$1 = function(signature) {
        var map = {};
        return function(key) {
            if (!map[key]) {
                map[key] = {};
                for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
            }
            return map[key];
        };
    };

    var study$1;

    var editorLayoutComponent$1 = {
        controller: function (){

            var code = m.route.param('code');

            if (!study$1 || (study$1.code !== code)){
                study$1 = studyFactory$1(code);
                study$1
                    .get()
                    .catch(function (reason) {
                        if(reason.status==403)
                            m.route('/');
                    })
                    .then(m.redraw);
            }

            var ctrl = {study: study$1, onunload: onunload};
            return ctrl;
        },
        view: function (ref) {
            var study = ref.study;

            return m('.study', {config: fullHeight},  [
                !study.loaded ? '' : splitPane({
                    leftWidth: leftWidth$1,
                    left: m.component(sidebarComponent, {study: study}),
                    right: m.route.param('resource') === 'wizard'
                        ? m.component(wizardComponent, {study: study})
                        : m.component(fileEditorComponent, {study: study})
                })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth$1(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }

    var mainComponent = {

        controller: function(){
            var ctrl = {
                studies:m.prop([]),
                have_templates:m.prop(false),
                tags:m.prop([]),
                user_name:m.prop(''),
                globalSearch: m.prop(''),
                permissionChoice: m.prop('all'),
                loaded:false,
                order_by_name: true,
                loadStudies: loadStudies,
                loadTags: loadTags,
                type: m.prop(''),
                sort_studies_by_name: sort_studies_by_name,
                sort_studies_by_date: sort_studies_by_date
            };

            loadTags();
            loadStudies();
            function loadStudies() {
                ctrl.type(m.route() == '/studies' ? 'regular' : 'template');
                // console.log(ctrl.type());
                load_studies()
                    .then(function (response) { return response.studies; })
                    .then(ctrl.studies)
                    .then(function (){ return ctrl.loaded = true; })
                    .then(sort_studies_by_name)
                    .then(m.redraw);
            }

            function loadTags() {
                get_tags()
                    .then(function (response) { return response.tags; })
                    .then(ctrl.tags)
                    .then(m.redraw);
            }

            return ctrl;
            function sort_studies_by_name2(study1, study2){
                ctrl.order_by_name = true;
                return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
            }

            function sort_studies_by_date2(study1, study2){
                ctrl.order_by_name = false;
                return study1.last_modified === study2.last_modified ? 0 : study1.last_modified < study2.last_modified ? 1 : -1;
            }

            function sort_studies_by_date(){
                ctrl.studies(ctrl.studies().sort(sort_studies_by_date2));
            }
            function sort_studies_by_name(){
                ctrl.studies(ctrl.studies().sort(sort_studies_by_name2));
            }


        },
        view: function view(ref){
            var loaded = ref.loaded;
            var studies = ref.studies;
            var tags = ref.tags;
            var permissionChoice = ref.permissionChoice;
            var globalSearch = ref.globalSearch;
            var sort_studies_by_date = ref.sort_studies_by_date;
            var sort_studies_by_name = ref.sort_studies_by_name;
            var order_by_name = ref.order_by_name;
            var type = ref.type;

            if (!loaded) return m('.loader');


            return m('.container.studies', [
                m('.row.p-t-1', [
                    m('.col-sm-4', [
                        m('h3', ['My ', type()=='regular' ? 'Studies' : 'Template Studies'])
                    ]),

                    m('.col-sm-8', [
                        m('button.btn.btn-success.btn-sm.pull-right', {onclick:function(){do_create(type(), studies().filter(typeFilter(type())));}}, [
                            m('i.fa.fa-plus'), '  Add new study'
                        ]),

                        m('.pull-right.m-r-1', [
                            dropdown({toggleSelector:'button.btn.btn-sm.btn-secondary.dropdown-toggle', toggleContent: [m('i.fa.fa-tags'), ' Tags'], elements:[
                                m('h6.dropdown-header', 'Filter by tags'),
                                !tags().length
                                    ? m('em.dropdown-header', 'You do not have any tags yet')
                                    : tags().map(function (tag) { return m('a.dropdown-item',m('label.custom-control.custom-checkbox', [
                                        m('input.custom-control-input', {
                                            type: 'checkbox',
                                            checked: tag.used,
                                            onclick: function(){ tag.used = !tag.used; }
                                        }),
                                        m('span.custom-control-indicator'),
                                        m('span.custom-control-description.m-r-1.study-tag',{style: {'background-color': '#'+tag.color}}, tag.text)
                                    ])); }),
                                m('.dropdown-divider'),
                                m('a.dropdown-item', { href: "/tags", config: m.route }, 'Manage tags')
                            ]})
                        ]),

                        m('.input-group.pull-right.m-r-1', [
                            m('select.c-select.form-control', {onchange: function (e) { return permissionChoice(e.target.value); }}, [
                                m('option', {value:'all'}, 'Show all my studies'),
                                m('option', {value:'owner'}, 'Show only studies I created'),
                                m('option', {value:'collaboration'}, 'Show only studies shared with me'),
                                m('option', {value:'public'}, 'Show public studies'),
                                m('option', {value:'bank'}, 'Show study bank studies')
                            ])
                        ])
                    ])
                ]),

                m('.card.studies-card', [
                    m('.card-block', [
                        m('.row', {key: '@@notid@@'}, [
                            m('.col-sm-5', [
                                m('.form-control-static',{onclick:sort_studies_by_name, style:'cursor:pointer'},[
                                    m('strong', 'Study Name '),
                                    m('i.fa.fa-sort', {style: {color: order_by_name ? 'black' : 'grey'}})
                                ])
                            ]),
                            m('.col-sm-3', [
                                m('.form-control-static',{onclick:sort_studies_by_date, style:'cursor:pointer'},[
                                    m('strong', ' Last Changed '),
                                    m('i.fa.fa-sort', {style: {color: !order_by_name ? 'black' : 'grey'}})
                                ])
                            ]),
                            m('.col-sm-4', [
                                m('input.form-control', {placeholder: 'Search ...', value: globalSearch(), oninput: m.withAttr('value', globalSearch)})
                            ])
                        ]),

                        studies()
                            .filter(function (study){ return study.permission!=='deleted'; })
                            .filter(typeFilter(type()))
                            .filter(tagFilter(tags().filter(uesedFilter()).map(function (tag){ return tag.text; })))
                            .filter(permissionFilter(permissionChoice()))
                            .filter(searchFilter(globalSearch()))
                            .filter(function (study){ return !study.deleted; })
                            .map(function (study) { return m('a', {href: m.route() != '/studies' ? ("/translate/" + (study.id)) : ("/editor/" + (study.id)),config:routeConfig, key: study.id}, [
                                m('.row.study-row', [
                                    m('.col-sm-5', [
                                        m('.study-text', [
                                            m('i.fa.fa-fw.owner-icon', {
                                                class: classNames({
                                                    'fa-lock':  study.is_locked,
                                                    'fa-globe': study.is_public,
                                                    'fa-flag':  study.is_template,
                                                    'fa-university':  study.is_bank,
                                                    'fa-users': !study.is_public && study.permission !== 'owner'
                                                }),
                                                title: study.is_public
                                                    ? study.is_bank
                                                        ? 'Bank'
                                                        : 'Public'
                                                    : study.permission === 'owner'
                                                        ? ''
                                                        : 'Collaboration'
                                            }),
                                            m('strong', study.name)
                                        ]),
                                        !study.description ? '' : m('.study-description', [
                                            study.description,
                                            m('.study-tip', study.description)
                                        ])
                                    ]),
                                    m('.col-sm-3', [
                                        m('.study-text', formatDate(new Date(study.last_modified)))
                                    ]),
                                    m('.col-sm-3', [
                                        study.tags.map(function (tag){ return m('span.study-tag',  {style: {'background-color': '#' + tag.color}}, tag.text); })
                                    ]),
                                    m('.col-sm-1', [
                                        m('.btn-toolbar.pull-right',
                                            m('.btn-group.btn-group-sm', 
                                                dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                    draw_menu(study)
                                                ]})
                                            )
                                        )
                                    ])
                                ])
                            ]); })
                    ])
                ])
            ]);
        }
    };


    var typeFilter = function (type) { return function (study) {
        return study.study_type === type;
    }; };

    var permissionFilter = function (permission) { return function (study) {
        if(permission === 'all') return !(study.is_public && study.permission !== 'owner');
        if(permission === 'public') return study.is_public && !study.is_bank;
        if(permission === 'collaboration') return study.permission !== 'owner' && !study.is_public;
        if(permission === 'template') return study.is_template;
        if(permission === 'bank') return study.is_bank;
        return study.permission === permission;
    }; };

    var tagFilter = function (tags) { return function (study) {
        if (tags.length==0)
            return true;
        return study.tags.map(function (tag){ return tag.text; }).some(function (tag) { return tags.indexOf(tag) != -1; });
    }; };

    var uesedFilter = function () { return function (tag) { return tag.used; }; };

    var searchFilter = function (searchTerm) { return function (study) { return !study.name || study.name.match(new RegExp(searchTerm, 'i')) || (study.description && study.description.match(new RegExp(searchTerm, 'i'))); }; };

    function routeConfig(el, isInit, ctx, vdom) {

        el.href = location.pathname + '?' + vdom.attrs.href;

        if (!isInit) el.addEventListener('click', route);

        function route(e){
            var el = e.currentTarget;

            if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;
            if (e.defaultPrevented) return;

            e.preventDefault();
            if (e.target.tagName === 'A' && e.target !== el) return;

            m.route(el.search.slice(1));
        }
    }

    var deploy_url = baseUrl + "/deploy_list";

    function get_study_list(){
        return fetchJson(deploy_url);
    }

    var thConfig$4 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    var deployComponent = {
        controller: function controller(){
            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_study_list()
                .then(function (response) {ctrl.list(response.requests);
                })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },
        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;
            return ctrl.list().length === 0
                ?
                m('.loader')
                :
                m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$4('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                            m('th', thConfig$4('FOLDER_LOCATION',ctrl.sortBy), 'Folder location'),
                            m('th', thConfig$4('RULE_FILE',ctrl.sortBy), 'Rule file'),
                            m('th', thConfig$4('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                            m('th', thConfig$4('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                            m('th', thConfig$4('TARGET_NUMBER',ctrl.sortBy), 'Target number'),
                            m('th', thConfig$4('APPROVED_BY_A_REVIEWER',ctrl.sortBy), 'Approved by a reviewer'),
                            m('th', thConfig$4('EXPERIMENT_FILE',ctrl.sortBy), 'Experiment file'),
                            m('th', thConfig$4('LAUNCH_CONFIRMATION',ctrl.sortBy), 'Launch confirmation'),
                            m('th', thConfig$4('COMMENTS',ctrl.sortBy), 'Comments')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.list().map(function (study) { return m('tr', [
                            m('td', study.CREATION_DATE),
                            m('td', m('a', {href:study.FOLDER_LOCATION}, study.FOLDER_LOCATION)),
                            m('td', study.RULE_FILE),
                            m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                            m('td', study.RESEARCHER_NAME),
                            m('td', study.TARGET_NUMBER),
                            m('td', study.APPROVED_BY_A_REVIEWER),
                            m('td', study.EXPERIMENT_FILE),
                            m('td', study.LAUNCH_CONFIRMATION),
                            m('td', study.COMMENTS)
                        ]); })
                    ])
                ]);
        }
    };

    var change_request_url = baseUrl + "/change_request_list";


    function get_change_request_list(){
        return fetchJson(change_request_url);
    }

    var thConfig$5 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };
    var changeRequestListComponent = {
        controller: function controller(){

            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_change_request_list()
                .then(function (response) {ctrl.list(response.requests);
                })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },

        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;


            return ctrl.list().length === 0
                ?
                m('.loader')
                :
                m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$5('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                            m('th', thConfig$5('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                            m('th', thConfig$5('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                            m('th', thConfig$5('FILE_NAMES',ctrl.sortBy), 'File names'),
                            m('th', thConfig$5('TARGET_SESSIONS',ctrl.sortBy), 'Target sessions'),
                            m('th', thConfig$5('STUDY_SHOWFILES_LINK',ctrl.sortBy), 'Study showfiles link'),
                            m('th', thConfig$5('STATUS',ctrl.sortBy), 'Status'),
                            m('th', thConfig$5('COMMENTS',ctrl.sortBy), 'Comments')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.list().map(function (study) { return m('tr', [
                            m('td', study.CREATION_DATE),
                            m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                            m('td', study.RESEARCHER_NAME),
                            m('td', study.FILE_NAMES),
                            m('td', study.TARGET_SESSIONS),
                            m('td', m('a', {href:study.STUDY_SHOWFILES_LINK}, study.STUDY_SHOWFILES_LINK)),
                            m('td', study.STATUS),
                            m('td', study.COMMENTS)
                        ]); })
                    ])
                ]);
        }
    };

    var removal_url = baseUrl + "/removal_list";

    function get_removal_list(){
        return fetchJson(removal_url);
    }

    var thConfig$6 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    var removalListComponent = {
        controller: function controller(){
            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_removal_list()
                .then(function (response) {ctrl.list(response.requests);
                })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },
        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;

            return ctrl.list().length === 0
                ?
                m('.loader')
                :
                m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$6('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                            m('th', thConfig$6('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                            m('th', thConfig$6('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                            m('th', thConfig$6('STUDY_NAME',ctrl.sortBy), 'Study name'),
                            m('th', thConfig$6('COMPLETED_N',ctrl.sortBy), 'Completed n'),
                            m('th', thConfig$6('COMMENTS',ctrl.sortBy), 'Comments')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.list().map(function (study) { return m('tr', [
                            m('td', study.CREATION_DATE),
                            m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                            m('td', study.RESEARCHER_NAME),
                            m('td', study.STUDY_NAME),
                            m('td', study.COMPLETED_N),
                            m('td', study.COMMENTS)
                        ]); })
                    ])
                ]);
        }
    };

    function deploy_url$1(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/deploy");
    }

    var get_study_prop = function (study_id) { return fetchJson(deploy_url$1(study_id), {
        method: 'get'
    }); };

    var study_removal = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'delete',
        body: {study_name: ctrl.study_name, completed_n: ctrl.completed_n, comments: ctrl.comments}
    }); };

    var deploy = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'post',
        body: {target_number: ctrl.target_number, approved_by_a_reviewer: ctrl.approved_by_a_reviewer, experiment_file: ctrl.experiment_file, launch_confirmation: ctrl.launch_confirmation, comments: ctrl.comments, rulesValue: ctrl.rulesValue}
    }); };

    var Study_change_request = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'put',
        body: {file_names: ctrl.file_names, target_sessions: ctrl.target_sessions, status: ctrl.status, comments: ctrl.comments}
    }); };

    function rulesEditor (args) { return m.component(rulesComponent, args); }
    var rulesComponent = {
        controller: function controller(ref){
            var visual = ref.visual;
            var value = ref.value;
            var comments = ref.comments;
            var exist_rule_file = ref.exist_rule_file;

            return {visual: visual, value: value, edit: edit, remove: remove, addcomments: addcomments, exist_rule_file: exist_rule_file};

            function edit(){
                window.open('../ruletable.html');
            }

            function remove(){
                visual('None');
                value('parent'); // this value is defined by the rule generator
            }

            function addcomments(){
                messages.prompt({
                    prop: comments,
                    header: 'Edit rule comments'
                });
            }
        },
        view: function (ref) {
            var visual = ref.visual;
            var value = ref.value;
            var edit = ref.edit;
            var remove = ref.remove;
            var exist_rule_file = ref.exist_rule_file;

            return m('div', [
                !exist_rule_file() ? '' : m('.small.text-muted', [
                    'You already have a rule file by the name of "',
                    exist_rule_file(),
                    '", it will be overwritten if you create a new one.'
                ]),
                m('.btn-group', [
                    m('.btn.btn-secondary.btn-sm', {onclick: edit},  [
                        m('i.fa.fa-edit'), ' Rule editor'
                    ]),
                    m('.btn.btn-secondary.btn-sm', {onclick: remove},  [
                        m('i.fa.fa-remove'), ' Clear rules'
                    ])
                ]),
                m('#ruleGenerator.card', {config: getInputs(visual, value)}, [
                    m('.card-block', visual())
                ])
            ]);
        }
    };

    var getInputs = function (visual, value) { return function (element, isInit) {
        if (isInit) return true;
        element.ruleGeneratorVisual = visual;
        element.ruleGeneratorValue = value;
    }; };

    var ASTERIX = m('span.text-danger', '*');

    var deployComponent$1 = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                error: m.prop(''),
                folder_location: m.prop(''),
                researcher_email: m.prop(''),
                researcher_name: m.prop(''),
                target_number: m.prop(''),
                
                rulesValue: m.prop('parent'), // this value is defined by the rule generator
                rulesVisual: m.prop('None'),
                rulesComments: m.prop(''),
                rule_file: m.prop(''),
                exist_rule_file: m.prop(''),

                approved_by_a_reviewer: m.prop(''),
                zero_unnecessary_files: m.prop(''),

                // unnecessary
                completed_checklist: m.prop(''),
                approved_by_irb: m.prop(''),
                valid_study_name: m.prop(''),
                realstart: m.prop(''),

                experiment_file: m.prop(''),
                experiment_files: m.prop(''),
                launch_confirmation: m.prop(''),
                comments: m.prop('')   
                
            };

            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.exist_rule_file(response.have_rule_file ? response.study_name+'.rules.xml' : '');
                    ctrl.study_name = response.study_name;
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.folder_location(response.folder);
                    ctrl.experiment_files(response.experiment_file.reduce(function (obj, row) {obj[row.file_name] = row.file_name;
                        return obj;
                    }, {}));
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);
        
            return {ctrl: ctrl, form: form, submit: submit, studyId: studyId};
            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }

                deploy(studyId, ctrl)
                    .then(function (response) {
                        ctrl.rule_file(response.rule_file);
                        ctrl.sent = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            if (ctrl.sent) return m('.deploy.centrify',[
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', ['The Deploy form was sent successfully ', m('a', {href:'/deployList', config: m.route}, 'View Deploy Requests')]),
                ctrl.rule_file() !='' ? m('h5', ['Rule File: ', m('a', {href: ("/editor/" + (m.route.param('studyId')) + "/file/" + (ctrl.rule_file()) + ".xml"), config: m.route}, ctrl.rule_file())]) : ''
            ]);
            
            return m('.deploy.container', [
                m('h3', [
                    'Request Deploy ',
                    m('small', ctrl.study_name)
                ]),

                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Name: ')),
                    m('.col-sm-9', ctrl.researcher_name())
                ]),
                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                    m('.col-sm-9', ctrl.researcher_email())
                ]),
                m('.row.m-b-1', [
                    m('.col-sm-3', m('strong', 'Study Folder Location: ')),
                    m('.col-sm-9', ctrl.folder_location())
                ]),

                radioInput({
                    label:m('span', ['Name of Experiment File', ASTERIX]),
                    prop: ctrl.experiment_file,
                    values:ctrl.experiment_files(),
                    form: form, required:true, isStack:true
                }),

                textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:['Target Number of Completed Study Sessions', ASTERIX],  placeholder: 'Target Number of Completed Study Sessions', prop: ctrl.target_number, form: form, required:true, isStack:true}),

                m('.font-weight-bold', 'Participant Restrictions'),
                rulesEditor({value:ctrl.rulesValue, visual: ctrl.rulesVisual, comments: ctrl.rulesComments, exist_rule_file: ctrl.exist_rule_file}),

                m('.font-weight-bold', 'Study is ready for deploy: ', ASTERIX),
                m('.m-b-1', [
                    checkbox({description: 'The study\'s study-id starts with my user name', prop: ctrl.valid_study_name, form: form, required:true, isStack:true}),
                    checkbox({
                        description:  'This study has been approved by the appropriate IRB ', 
                        prop: ctrl.approved_by_irb,
                        required:true,
                        form: form, isStack:true
                    }),
                    checkbox({
                        description:  [
                            'The study is compliant with ',
                            m('a', {hxref:'https://docs.google.com/document/d/1pglAQELqNLWbV1yscE2IVd7G5xVgZ8b4lkT8PYeumu8/edit?usp=sharing', target:'_blank'}, 'PI Research Pool Guidelines and Required Elements & Study Conventions'),
                            ' .'
                        ],
                        prop: ctrl.completed_checklist,
                        form: form, isStack:true,
                        required:true
                    }),
                    checkbox({
                        description: 'My study folder includes ZERO files that aren\'t necessary for the study (e.g., word documents, older versions of files, items that were dropped from the final version)',
                        prop: ctrl.zero_unnecessary_files,
                        required:true,
                        form: form, isStack:true
                    }),
                    checkbox({description: 'I used a realstart and lastpage tasks', prop: ctrl.realstart, form: form, required:true, isStack:true})
                ]),
                radioInput({
                    label:['Study has been approved by a *User Experience* Reviewer (Calvin Lai): ', ASTERIX],
                    prop: ctrl.approved_by_a_reviewer,
                    values: {
                        'No, this study is not for the Project Implicit pool.' : 'No, this study is not for the Project Implicit pool.',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                radioInput({
                    label: ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched? ', ASTERIX],
                    prop: ctrl.launch_confirmation,
                    values: {
                        'No,this study is mine': 'No,this study is mine',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Request Deploy')
            ]);
        }
    };

    var checkbox = function (args) { return m.component({
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            var validity = function () { return !required || prop(); };
            if (!form) throw new Error('Form not defined');
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: function (ctrl, ref) {
            var prop = ref.prop;
            var description = ref.description; if ( description === void 0 ) description = '';
            var help = ref.help;
            var required = ref.required;
            var form = ref.form;

            return m('.checkmarked', 
            { onclick: function (){ return prop(!prop()); } },
            [
                m('i.fa.fa-fw', {
                    class: classNames({
                        'fa-square-o' : !prop(),
                        'fa-check-square-o' : prop(),
                        'text-success' : required && form.showValidation() && prop(),
                        'text-danger' : required && form.showValidation() && !prop()
                    })
                }),
                m.trust('&nbsp;'),
                description,
                !help ? '' : m('small.text-muted', help)
            ]);
        }
    }, args); };

    var ASTERIX$1 = m('span.text-danger', '*');

    var StudyRemovalComponent = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                researcher_name: m.prop(''),
                researcher_email: m.prop(''),
                global_study_name: m.prop(''),
                study_name: m.prop(''),
                study_names: m.prop(''),
                completed_n: m.prop(''),
                comments: m.prop(''),
                error: m.prop('')
            };

            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.global_study_name(response.study_name);
                    ctrl.study_names(response.experiment_file.reduce(function (obj, row) {
                        obj[row.file_id] = row.file_id;
                        return obj;
                    }, {}));
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);

            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }
                study_removal(studyId, ctrl)
                    .then(function () {
                        ctrl.sent = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                    })
                    .then(m.redraw);
            }
            return {ctrl: ctrl, form: form, submit: submit};
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            return ctrl.sent
                ?
                m('.deploy.centrify',[
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', ['The removal form was sent successfully ', m('a', {href:'/removalList', config: m.route}, 'View removal requests')])
                ])
                :
                m('.StudyRemoval.container', [
                    m('h3', [
                        'Study Removal Request ',
                        m('small', ctrl.global_study_name())
                    ]),

                    m('.row', [
                        m('.col-sm-3', m('strong', 'Researcher Name: ')),
                        m('.col-sm-9', ctrl.researcher_name())
                    ]),
                    m('.row.m-b-1', [
                        m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                        m('.col-sm-9', ctrl.researcher_email())
                    ]),

                    radioInput({
                        label:m('span', ['Study name', ASTERIX$1]), 
                        prop: ctrl.study_name,
                        values:ctrl.study_names(),
                        help: 'This is the name you submitted to the RDE (e.g., colinsmith.elmcogload) ',
                        form: form, required:true, isStack:true
                    }),
                    textInput({label: m('span', ['Please enter your completed n below ', m('span.text-danger', ' *')]), help: m('span', ['you can use the following link: ', m('a', {href:'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3'}, 'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3')]),  placeholder: 'completed n', prop: ctrl.completed_n, form: form, required:true, isStack:true}),
                    textInput({isArea: true, label: m('span', 'Additional comments'), help: '(e.g., anything unusual about the data collection, consistent participant comments, etc.)',  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                    !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                    m('button.btn.btn-primary', {onclick: submit}, 'Submit')
                ]);
        }
    };

    var ASTERIX$2 = m('span.text-danger', '*');

    var studyChangeRequestComponent = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                user_name: m.prop(''),
                researcher_name: m.prop(''),
                researcher_email: m.prop(''),
                study_name: m.prop(''),
                target_sessions: m.prop(''),
                status: m.prop(''),
                file_names: m.prop(''),
                comments: m.prop(''),
                error: m.prop('')
            };
            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.user_name(response.user_name);
                    ctrl.study_name(response.study_name);
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);

            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }
                Study_change_request(studyId, ctrl)
                    .then(function () {
                        ctrl.sent = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                    }).then(m.redraw);
            }
            return {ctrl: ctrl, form: form, submit: submit, studyId: studyId};
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            var study_showfiles_link = document.location.origin + '/implicit/showfiles.jsp?user=' + ctrl.user_name() + '&study=' + ctrl.study_name();

            if (ctrl.sent) return m('.deploy.centrify',[
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', ['The change request form was sent successfully ', m('a', {href:'/changeRequestList', config: m.route}, 'View change request  requests')])
            ]);
                
            return m('.StudyChangeRequest.container', [
                m('h3', [
                    'Study Change Request ',
                    m('small', ctrl.study_name())
                ]),

                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Name: ')),
                    m('.col-sm-9', ctrl.researcher_name())
                ]),
                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                    m('.col-sm-9', ctrl.researcher_email())
                ]),
                m('.row.m-b-1', [
                    m('.col-sm-3', m('strong', 'Study showfiles link: ')),
                    m('.col-sm-9', m('a', {href:study_showfiles_link, target: '_blank'}, study_showfiles_link))
                ]),


                textInput({label: m('span', ['Target number of additional sessions (In addition to the sessions completed so far)', m('span.text-danger', ' *')]),  placeholder: 'Target number of additional sessions', prop: ctrl.target_sessions, form: form, required:true, isStack:true}),

                radioInput({
                    label: m('span', ['What\'s the current status of your study?', ASTERIX$2]),
                    prop: ctrl.status,
                    values: {
                        'Currently collecting data and does not need to be unpaused': 'Currently collecting data and does not need to be unpaused',
                        'Manually paused and needs to be unpaused' : 'Manually paused and needs to be unpaused',
                        'Auto-paused due to low completion rates or meeting target N.' : 'Auto-paused due to low completion rates or meeting target N.'
                    },
                    form: form, required:true, isStack:true
                }),
                textInput({isArea: true, label: m('span', ['Change Request', m('span.text-danger', ' *')]), help: 'List all file names involved in the change request. Specify for each file whether file is being updated or added to production.)',  placeholder: 'Change Request', prop: ctrl.file_names, form: form, required:true, isStack:true}),
                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Submit')
            ]);
        }
    };

    var add_userUrl = baseUrl + "/users/add_user";

    var add = function (username, first_name , last_name, email, iscu) { return fetchJson(add_userUrl, {
        method: 'post',
        body: {username: username, first_name: first_name , last_name: last_name, email: email, iscu: iscu}
    }); };

    var addComponent = {
        controller: function controller(){
            var username = m.prop('');
            var first_name = m.prop('');
            var last_name = m.prop('');
            var email = m.prop('');
            var iscu = m.prop(false);
            var ctrl = {
                username: username,
                first_name: first_name,
                last_name: last_name,
                email: email,
                iscu: iscu,
                error: m.prop(''),
                added:false,
                activation_code: m.prop(''),
                add: addAction,
            };
            return ctrl;

            function addAction(){
                add(username, first_name , last_name, email, iscu)
                    .then(function (response) {
                        ctrl.added = true;
                        ctrl.activation_code(response.activation_code);
                        m.redraw();
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                        m.redraw();
                    });
            }
        },
        view: function view(ctrl){
            return m('.add.centrify',[
                ctrl.added
                    ?

                    ctrl.activation_code()
                        ?
                        [
                            m('h5', [, ("Added " + (ctrl.username()) + " successfully")]),
                            m('.card.card-inverse.col-md-10',
                                [m('label', 'Send the following link to user to allow them to activate their account and to change their password.'),
                                 copyUrlContent(ctrl.activation_code())()
                            ])
                        ]:
                        [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', [ctrl.username(), ' successfully added (email sent)!'])
                    ]
                    :
                    m('.card.card-inverse.col-md-10', [
                        m('.card-block',[
                            m('h4', 'Please fill the following details'),
                            m('form', {onsubmit:ctrl.add}, [
                                m('fieldset.form-group',
                                    m('label', 'User name:'),
                                    m('input.form-control', {
                                        type:'text',
                                        placeholder: 'User name',
                                        value: ctrl.username(),
                                        oninput: m.withAttr('value', ctrl.username),
                                        onchange: m.withAttr('value', ctrl.username),
                                        config: getStartValue$1(ctrl.username)
                                    }
                                )),
                                m('fieldset.form-group',
                                    m('label', 'First name:'),
                                    m('input.form-control', {
                                        type:'text',
                                        placeholder: 'First name',
                                        value: ctrl.first_name(),
                                        oninput: m.withAttr('value', ctrl.first_name),
                                        onchange: m.withAttr('value', ctrl.first_name),
                                        config: getStartValue$1(ctrl.first_name)
                                    }
                                )),
                                m('fieldset.form-group',
                                    m('label', 'Last name:'),
                                    m('input.form-control', {
                                        type:'text',
                                        placeholder: 'Last name',
                                        value: ctrl.last_name(),
                                        oninput: m.withAttr('value', ctrl.last_name),
                                        onchange: m.withAttr('value', ctrl.last_name),
                                        config: getStartValue$1(ctrl.last_name)
                                    }
                                    ))
                                ,m('fieldset.form-group',
                                    m('label', 'Email:'),
                                    m('input.form-control', {
                                        type:'text',
                                        placeholder: 'Email',
                                        value: ctrl.email(),
                                        oninput: m.withAttr('value', ctrl.email),
                                        onchange: m.withAttr('value', ctrl.email),
                                        config: getStartValue$1(ctrl.email)
                                    }
                                ))
                            ]),

                            !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                            m('button.btn.btn-primary.btn-block', {onclick: ctrl.add},'Add')
                        ])
                    ])
            ]);
        }
    };

    function getStartValue$1(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function users_url()
    {
        return (baseUrl + "/users");
    }


    var get_users = function () { return fetchJson(users_url(), {
        method: 'get'
    }); };

    var remove_user = function (user_id) { return fetchJson(users_url(), {
        body: {user_id: user_id},
        method: 'delete'
    }); };

    var update_role = function (user_id, role) { return fetchJson(users_url(), {
        body: {user_id: user_id, role: role},
        method: 'put'
    }); };

    var usersComponent = {
        controller: function controller(){
            var ctrl = {
                users:m.prop(),
                loaded:false,
                col_error:m.prop(''),
                password:m.prop(''),
                remove: remove,
                update: update,
                change_password: change_password,
                activate_user: activate_user,
                add_user: add_user};
            function load() {
                get_users()
                    .then(function (response) { return ctrl.users(response.users); })
                    .then(function (){ return ctrl.loaded = true; })
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);

            }

            function add_user(){
                messages.alert({okText: 'Close', header:'Add a new user', content:addComponent

                        })
                    .then(function (){ return load(); }).then(m.redraw);
            }


            function remove(user_id){
                messages.confirm({header:'Delete user', content:'Are you sure?'})
                    .then(function (response) {
                        if (response)
                            remove_user(user_id)
                                .then(function (){ return load(); })
                                .catch(function (error) {
                                    ctrl.col_error(error.message);
                                })
                                .then(m.redraw);
                    });
            }

            function change_password(reset_code, user_name){
                messages.confirm({
                    header:("Url for reset " + user_name + "'s password"),
                    content: copyUrlContent(reset_code)()
                });
            }

            function activate_user(activation_code, user_name){
                messages.confirm({
                    header:("Url for " + user_name + "'s account activation"),
                    content: copyUrlContent(activation_code)()
                });
            }

            function update(user_id, role){
                update_role(user_id, role)
                    .then(function (){
                        load();
                    })
                    .then(m.redraw);
            }

            load();
            return ctrl;
        },
        view: function view(ctrl){
            return  !ctrl.loaded
                ?
                m('.loader')
                :
                    m('.container.sharing-page', [
                        m('.row',[
                            m('.col-sm-10', [
                                m('h3', 'User Management')
                            ]),
                            m('.col-sm-2', [
                                m('button.btn.btn-success.btn-sm.m-r-1', {onclick:ctrl.add_user}, [
                                    m('i.fa.fa-user-plus'), '  Add a new user'
                                ])
                            ])
                        ]),
                        m('table', {class:'table table-striped table-hover'}, [
                        m('thead', [
                            m('tr', [
                                m('th', 'User name'),
                                m('th',  'First name'),
                                m('th',  'Last name'),
                                m('th',  'Email'),
                                m('th',  'Role'),
                                ctrl.users().filter(function (user){ return !!user.reset_code || !!user.activation_code; }).length>0 ? m('th',  'Actions') : '',
                                m('th',  'Remove')
                            ])
                        ]),
                        m('tbody', [
                            ctrl.users().map(function (user) { return m('tr', [
                                m('td', user.user_name),
                                m('td', user.first_name),
                                m('td', user.last_name),
                                m('td', user.email),
                                m('td',
                                    m('select.form-control', {value:user.role, onchange : function(){ ctrl.update(user.id, this.value); }}, [
                                        m('option',{value:'u', selected: user.role !== 'su'},  'Simple user'),
                                        m('option',{value:'su', selected: user.role === 'su'}, 'Super user')
                                    ])
                                ),

                                ctrl.users().filter(function (user){ return !!user.reset_code || !!user.activation_code; }).length==0 ? '' :
                                    !user.reset_code && !user.activation_code ?  m('td', '') :
                                        user.reset_code ? m('td', m('button.btn.btn-secondery', {onclick:function (){ return ctrl.change_password(user.reset_code, user.user_name); }}, 'Reset password'))
                                            : m('td', m('button.btn.btn-secondery', {onclick:function (){ return ctrl.activate_user(user.activation_code, user.user_name); }}, 'Activate user')),

                                m('td', m('button.btn.btn-danger', {onclick:function (){ return ctrl.remove(user.id); }}, 'Remove'))
                            ]); })
                        ]),
                    ])
                ]);
        }
    };

    function config_url()
    {
        return (baseUrl + "/config");
    }

    function gmail_url()
    {
        return (baseUrl + "/config/gmail");
    }

    function dbx_url()
    {
        return (baseUrl + "/config/dbx");
    }


    var get_config = function () { return fetchJson(config_url(), {
        method: 'get'
    }); };

    var set_gmail_params = function (email, password) { return fetchJson(gmail_url(), {
        body: {email: email, password: password},
        method: 'put'
    }); };

    var unset_gmail_params = function () { return fetchJson(gmail_url(), {
        method: 'delete'
    }); };


    var set_dbx_params = function (client_id, client_secret) { return fetchJson(dbx_url(), {
        body: {client_id: client_id, client_secret: client_secret},
        method: 'put'
    }); };

    var unset_dbx_params = function () { return fetchJson(dbx_url(), {
        method: 'delete'
    }); };

    var change_password_url = baseUrl + "/change_password";
    var change_email_url = baseUrl + "/change_email";
    var update_details_url = baseUrl + "/settings";
    var present_templates_url = baseUrl + "/present_templates";
    var dropbox_url = baseUrl + "/dropbox";

    function apiURL(code)
    {   
        return (change_password_url + "/" + (encodeURIComponent(code)));
    }

    var is_recovery_code = function (code) { return fetchJson(apiURL(code), {
        method: 'get'
    }); };

    var set_password = function (code, password, confirm) { return fetchJson(apiURL(code), {
        method: 'post',
        body: {password: password, confirm: confirm}
    }); };

    var set_email = function (email) { return fetchJson(change_email_url, {
        method: 'post',
        body: {email: email}
    }); };


    var update_details = function (params) { return fetchJson(update_details_url, {
        method: 'post',
        body: {params: params}
    }); };


    var get_email = function () { return fetchJson(change_email_url, {
        method: 'get'
    }); };


    var check_if_present_templates = function () { return fetchJson(present_templates_url, {
        method: 'get'
    }); };

    var set_present_templates = function (value) {
        if (value)
            return do_present_templates();
        return do_hide_templates();
    };



    var do_present_templates = function () { return fetchJson(present_templates_url, {
        method: 'post'
    }); };

    var do_hide_templates = function () { return fetchJson(present_templates_url, {
        method: 'delete'
    }); };

    var check_if_dbx_synchronized = function () { return fetchJson(dropbox_url, {
        method: 'get'
    }); };

    var stop_dbx_synchronized = function () { return fetchJson(dropbox_url, {
        method: 'delete'
    }); };

    var configComponent = {
        controller: function controller(){
            var ctrl = {
                loaded:m.prop(false),
                dbx: {
                    setted: m.prop(false),
                    enable: m.prop(false),
                    client_id:m.prop(''),
                    client_secret:m.prop(''),
                    error:m.prop('')
                },
                gmail: {
                    setted: m.prop(false),
                    enable: m.prop(false),
                    email:m.prop(''),
                    password:m.prop(''),
                    error:m.prop('')
                },

                toggle_visibility: toggle_visibility,
                set_gmail: set_gmail,
                unset_gmail: unset_gmail,
                set_dbx: set_dbx,
                unset_dbx: unset_dbx
            };


            function set_values(response){
                if(response.config.gmail)
                    ctrl.gmail.setted(true) && ctrl.gmail.enable(true) && ctrl.gmail.email(response.config.gmail.email) && ctrl.gmail.password(response.config.gmail.password);
                if(response.config.dbx)
                    ctrl.dbx.setted(true) && ctrl.dbx.enable(true) && ctrl.dbx.client_id(response.config.dbx.client_id) && ctrl.dbx.client_secret(response.config.dbx.client_secret);
            }

            function toggle_visibility(varable, state){
                ctrl[varable].error('');
                ctrl[varable].enable(state);
            }

            function load() {
                get_config()
                    .then(function (response) { return set_values(response); })
                    .then(function (){ return ctrl.loaded(true); })
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);
            }


            function set_gmail() {
                ctrl.gmail.error('');
                set_gmail_params(ctrl.gmail.email, ctrl.gmail.password)
                    .catch(function (error) {
                        ctrl.gmail.error(error.message);
                    })
                    .then(ctrl.gmail.setted(true))
                    .then(ctrl.gmail.enable(true))
                    .then(m.redraw);
            }

            function unset_gmail() {
                ctrl.gmail.error('');
                unset_gmail_params()
                    .catch(function (error) {
                        ctrl.gmail.error(error.message);
                    })
                    .then(ctrl.gmail.setted(false))
                    .then(ctrl.gmail.enable(false))
                    .then(ctrl.gmail.email(''))
                    .then(ctrl.gmail.password(''))
                    .then(m.redraw);
            }

            function set_dbx() {
                ctrl.dbx.error('');
                set_dbx_params(ctrl.dbx.client_id, ctrl.dbx.client_secret)
                    .catch(function (error) {
                        ctrl.dbx.error(error.message);
                    })
                    .then(ctrl.dbx.setted(true))
                    .then(ctrl.dbx.enable(true))
                    .then(m.redraw);
            }

            function unset_dbx() {
                unset_dbx_params()
                    .catch(function (error) {
                        ctrl.dbx.error(error.message);
                    })
                    .then(ctrl.dbx.setted(false))
                    .then(ctrl.dbx.enable(false))
                    .then(ctrl.dbx.client_id(''))
                    .then(ctrl.dbx.client_secret(''))
                    .then(m.redraw);
            }

            load();
            return ctrl;
        },
        view: function view(ctrl){
            return  !ctrl.loaded()
                ?
                m('.loader')
                :
                    m('.container.sharing-page', [
                        m('.row',[
                            m('.col-sm-10', [
                                m('h3', 'Edit configuration')
                            ])
                        ]),

                        m('.row.centrify',
                            [m('.card.card-inverse.col-md-5.centrify', [

                                !ctrl.gmail.enable() ?
                                    m('a', {onclick: function (){ return ctrl.toggle_visibility('gmail', true); }},
                                        m('button.btn.btn-primary.btn-block', [
                                            m('i.fa.fa-fw.fa-envelope'), ' Enable support with email'
                                        ])
                                    )
                                    :
                                    m('.card-block',[
                                    m('h4', 'Enter details for Gmail accont'),
                                    m('form', [
                                        m('input.form-control', {
                                            type:'input',
                                            placeholder: 'Gmail accont',
                                            value: ctrl.gmail.email(),
                                            oninput: m.withAttr('value', ctrl.gmail.email),
                                            onchange: m.withAttr('value', ctrl.gmail.email),
                                        }),

                                        m('input.form-control', {
                                            type:'input',
                                            placeholder: 'password',
                                            value: ctrl.gmail.password(),
                                            oninput: m.withAttr('value', ctrl.gmail.password),
                                            onchange: m.withAttr('value', ctrl.gmail.password),
                                        })
                                    ]),
                                    ctrl.gmail.setted() ? ''  : m('button.btn.btn-secondery.btn-block', {onclick: function (){ return ctrl.toggle_visibility('gmail', false); }},'Cancel'),
                                    m('button.btn.btn-primary.btn-block', {onclick: ctrl.set_gmail},'Update'),
                                    !ctrl.gmail.setted() ? '' : m('button.btn.btn-danger.btn-block', {onclick: ctrl.unset_gmail},'remove'),
                                    !ctrl.gmail.error() ? '' : m('p.alert.alert-danger', ctrl.gmail.error()),
                                    ])
                            ])

                            ]),
                        m('.row.centrify',
                            m('.card.card-inverse.col-md-5.centrify', [
                                !ctrl.dbx.enable() ?
                                    m('a', {onclick: function (){ return ctrl.toggle_visibility('dbx', true); }},
                                        m('button.btn.btn-primary.btn-block', [
                                            m('i.fa.fa-fw.fa-envelope'), ' Enable support with dropbox'
                                        ])
                                    )
                                    :
                                    m('.card-block',[
                                    m('h4', 'Enter details for Dropbox application'),
                                    m('form', [
                                        m('input.form-control', {
                                            type:'input',
                                            placeholder: 'client id',
                                            value: ctrl.dbx.client_id(),
                                            oninput: m.withAttr('value', ctrl.dbx.client_id),
                                            onchange: m.withAttr('value', ctrl.dbx.client_id),
                                        }),

                                        m('input.form-control', {
                                            type:'input',
                                            placeholder: 'client secret',
                                            value: ctrl.dbx.client_secret(),
                                            oninput: m.withAttr('value', ctrl.dbx.client_secret),
                                            onchange: m.withAttr('value', ctrl.dbx.client_secret),
                                        })
                                    ]),
                                        ctrl.dbx.setted() ? ''  : m('button.btn.btn-secondery.btn-block', {onclick: function (){ return ctrl.toggle_visibility('dbx', false); }},'Cancel'),
                                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.set_dbx},'Update'),
                                        !ctrl.dbx.setted() ? '' : m('button.btn.btn-danger.btn-block', {onclick: ctrl.unset_dbx},'remove'),
                                        !ctrl.dbx.error() ? '' : m('p.alert.alert-danger', ctrl.dbx.error()),
                                ])
                            ])
                        ),
                ]);
        }
    };

    var emil_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('form', [
                m('label', 'Email Address:'),
                m('input.form-control', {
                    type:'email',
                    placeholder: 'Email Address',
                    value: ctrl.email(),
                    oninput: m.withAttr('value', ctrl.email),
                    onchange: m.withAttr('value', ctrl.email),
                    config: getStartValue$2(ctrl.email)
                })
            ])
            ,
            !ctrl.email_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.email_error()),
            ctrl.external() ? '' : m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_email},'Update')

        ])

    ]); };

    function getStartValue$2(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var password_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('form', [
                m('label', 'Password:'),
                m('input.form-control', {
                    type:'password',
                    placeholder: 'Password',
                    value: ctrl.password(),
                    oninput: m.withAttr('value', ctrl.password),
                    onchange: m.withAttr('value', ctrl.password),
                    config: getStartValue$3(ctrl.password)
                }),
                m('label.space', 'Confirm password:'),
                m('input.form-control', {
                    type:'password',
                    placeholder: 'Confirm password',
                    value: ctrl.confirm(),
                    oninput: m.withAttr('value', ctrl.confirm),
                    onchange: m.withAttr('value', ctrl.confirm),
                    config: getStartValue$3(ctrl.confirm)
                })
            ]),
            !ctrl.password_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.password_error()),
            ctrl.external() ? '' : m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_password},'Update')
        ])
    ]); };

    function getStartValue$3(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function start_dbx_sync(ctrl){
        var error = m.prop('');
        // ctrl.dbx_auth_link()
        messages.confirm({okText: 'Continue', cancelText: 'Cancel', header:'Synchronization with Dropbox', content:m('p', [
            m('p','This feature creates a backup for all your studies by copying all your study files to your Dropbox account. Every time you change a file here, on the Dashboard, it will send that update to your Dropbox account. Using the Dropbox website, you will be able to see previous versions of all the files you changed.'),
            m('ul',
                [
                    m('li', 'Dropbox will create a folder under Apps/minno.js/username and will copy all your studies under that folder.'),
                    m('li', 'We will not have access to any of your files on other folders.'),
                    m('li', [m('span' ,'This feature is only for backup. If you edit or delete your study files on your computer\'s file-system, these edits will not be synchronized with the study files on this website. '), m('strong', 'Updates work only in one direction: from this website to your Dropbox, not from your Dropbox to this website.')]),
                    m('li', 'If you want to see an older version of any of your study files, you can go to Dropbox and request to see previous versions of the file. If you want to restore an older version of a file, you will need to copy and paste its text to the Dashboard\'s editor on this website, or to download the old file to your computer and upload it to this website.')
                ]
            ),
            !error() ? '' : m('p.alert.alert-danger', error())])
        })
            .then(function (response) {
                if (response)
                    window.location = ctrl.dbx_auth_link();
            });

    }

    function stop_dbx_sync(ctrl){
        stop_dbx_synchronized()
            .then(m.route('/settings'))
            .catch(function (response) {
                ctrl.synchronization_error(response.message);
            });
    }

    var dropbox_body = function (ctrl) { return typeof ctrl.is_dbx_synchronized()==='undefined' || ctrl.role()=='CU' ? '' : m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            !ctrl.is_dbx_synchronized()?
                m('button.btn.btn-primary.btn-block', {onclick: function(){start_dbx_sync(ctrl);}},[
                    m('i.fa.fa-fw.fa-dropbox'), ' Synchronize with your Dropbox account'
                ])
                :
                m('button.btn.btn-primary.btn-block', {onclick: function(){stop_dbx_sync(ctrl);}},[
                    m('i.fa.fa-fw.fa-dropbox'), ' Stop Synchronize with your Dropbox account'
                ])
        ])
    ]); };

    var settings$1 = {'password':[],
        'emil':[],
        'dropbox':[]
        // ,'templates':[]
    };

    var settings_hash$1 = {
        password: password_body,
        emil: emil_body,
        dropbox: dropbox_body
        // templates: templates_body
    };

    var draw_menu$1 = function (ctrl, external) {
        return Object.keys(settings$1).map(function (feature){ return settings_hash$1[feature](ctrl, external); });
    };

    var changePasswordComponent = {
        controller: function controller(){

            var ctrl = {
                role:m.prop(''),
                external:m.prop(true),
                password:m.prop(''),
                confirm:m.prop(''),
                is_dbx_synchronized: m.prop(),
                is_gdrive_synchronized: m.prop(),
                present_templates: m.prop(),
                dbx_auth_link: m.prop(''),
                gdrive_auth_link: m.prop(''),
                synchronization_error: m.prop(''),
                present_templates_error: m.prop(''),
                email: m.prop(''),
                prev_email: m.prop(''),
                password_error: m.prop(''),
                password_changed:false,
                email_error: m.prop(''),
                email_changed:false,
                update_all_details: update_all_details,
                do_set_password: do_set_password,
                do_set_email: do_set_email,
                do_set_templete: do_set_templete

            };
            getAuth().then(function (response) {            ctrl.role(response.role);
            });

            get_email()
                .then(function (response) {
                    ctrl.email(response.email);
                    ctrl.prev_email(response.email);
                })
                .catch(function (response) {
                    ctrl.email_error(response.message);
                })
                .then(m.redraw);
            check_if_dbx_synchronized()
                .then(function (response) {
                    ctrl.is_dbx_synchronized(response.is_synchronized);
                    ctrl.dbx_auth_link(response.auth_link);
                })
                .catch(function (response) {
                    ctrl.synchronization_error(response.message);
                })
                .then(m.redraw);

            // check_if_gdrive_synchronized()
            //     .then((response) => {
            //         ctrl.is_gdrive_synchronized(response.is_synchronized);
            //         ctrl.gdrive_auth_link(response.auth_link);
            //     })
            //     .catch(response => {
            //         ctrl.synchronization_error(response.message);
            //     })
            //     .then(m.redraw);

            check_if_present_templates()
                .then(function (response) {
                    ctrl.present_templates(response.present_templates);
                })
                .catch(function (response) {
                    ctrl.present_templates_error(response.message);
                })
                .then(m.redraw);
            return ctrl;

            function update_all_details(){

                ctrl.password_changed = false;
                ctrl.email_changed    = false;
                ctrl.password_error('');
                ctrl.email_error('');

                var params = {};
                if(ctrl.password() || ctrl.confirm()){
                    params.password = ctrl.password();
                    params.confirm = ctrl.confirm();
                }
                if(ctrl.email() !== ctrl.prev_email())
                {
                    ctrl.prev_email(ctrl.email());
                    params.email = ctrl.email();
                }
                if(Object.keys(params).length > 0)
                    update_details(params)
                        .then(function (response) {
                            ctrl.password_error(response.password ? response.password.error : '');
                            ctrl.email_error(response.email ? response.email.error : '');
                            ctrl.password_changed = response.password && !response.password.error;
                            ctrl.email_changed    = response.email && !response.email.error;


                        })
                        .then(m.redraw);
            }

            function do_set_password(){
                set_password('', ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.password_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }

            function do_set_email(){
                set_email(ctrl.email)
                    .then(function () {
                        ctrl.email_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.email_error(response.message);
                    })
                    .then(m.redraw);
            }
            function do_set_templete(value){
                set_present_templates(value)
                    .then(function () {
                        ctrl.present_templates(value);
                    })
                    .catch(function (response) {
                        ctrl.present_templates_error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
            return m('.activation.centrify', {config:fullHeight},[
                draw_menu$1(ctrl),
                m('.card-block',

                    m('button.btn.btn-primary.btn-block', {onclick: ctrl.update_all_details},'Update')
                ),
                !ctrl.password_changed ? '' : m('.alert.alert-success', m('strong', 'Password successfully updated')),
                !ctrl.email_changed ? '' : m('.alert.alert-success', m('strong', 'Email successfully updated'))
            ]);
        }
    };

    var pending_url = baseUrl + "/pending";

    function apiURL$1(code)
    {
        return (collaborationUrl + "/" + (encodeURIComponent(code)));
    }

    var get_pending_studies = function () { return fetchJson(pending_url, {
        method: 'get'
    }); };


    var use_code = function (code) { return fetchJson(apiURL$1(code), {
        method: 'get'
    }); };

    var messagesComponent = {
        controller: function controller(){
            var ctrl = {
                role:m.prop(''),
                pendings: m.prop(''),
                loaded: false,
                error: m.prop(''),
                do_use_code: do_use_code
            };
            getAuth().then(function (response) {
                ctrl.role(response.role);
            });

            function do_use_code(code){
                use_code(code)
                    .then(function (){ return ctrl.pendings(ctrl.pendings().filter(function (study){ return study.accept!==code && study.reject!==code; })); })
                    .then(m.redraw);
            }

            get_pending_studies()
                .then(function (response) {
                    ctrl.pendings(response.studies);
                    ctrl.loaded = true;
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);
            return ctrl;
        },
        view: function view(ctrl){

            return  !ctrl.loaded
                ?
                m('.loader')
                :
                m('.container.studies', [
                    m('.row.p-t-1', [
                        m('.col-sm-4', [
                            m('h3', 'Sharing Invitations')
                        ])]),
                    m('.card.studies-card', [
                        m('.card-block', [
                            m('.row', {key: '@@notid@@'}, [
                                m('.col-sm-3', [
                                    m('.form-control-static',[
                                        m('strong', 'Owner ')
                                    ])
                                ]),
                                m('.col-sm-4', [
                                    m('.form-control-static',[
                                        m('strong', 'Study name ')
                                    ])]),
                                m('.col-sm-2', [
                                    m('.form-control-static',[
                                        m('strong', 'Permission ')
                                    ])
                                ]),
                                m('.col-sm-3', [
                                    m('.form-control-static',[
                                        m('strong', 'Action ')
                                    ])
                                ])

                            ]),
                            ctrl.pendings().map(function (study) { return m('.row.study-row', [
                                    m('.col-sm-3', [
                                        m('.study-text', study.owner_name)
                                    ]),
                                    m('.col-sm-4', [
                                        m('.study-text', study.study_name)
                                    ]),
                                    m('.col-sm-2', [
                                        m('.study-text', study.permission)
                                    ]),
                                    m('.col-sm-3', [
                                        m('.study-text', m('button.btn.btn-primary', {onclick:function() {ctrl.do_use_code(study.accept);}}, 'Accept'), ' | ',
                                            m('button.btn.btn-danger', {onclick:function() {ctrl.do_use_code(study.reject);}}, 'Reject'))
                                    ]),


                                ]); })
                        ])])]);


        }
    };

    var massMailUrl = baseUrl + "/mass_mail";

    var send = function (subject, body , ru, su, cu) { return fetchJson(massMailUrl, {
        method: 'post',
        body: {subject: subject, body: body , ru: ru, su: su, cu: cu}
    }); };

    var massMailComponent = {
        controller: function controller(){
            var subject = m.prop('');
            var body = m.prop('');
            var ru = m.prop(false);
            var su = m.prop(false);
            var cu = m.prop(false);
            var ctrl = {
                subject: subject,
                body: body,
                ru: ru,
                su: su,
                cu: cu,
                error: m.prop(''),
                sent:false,
                send: sendAction
            };
            return ctrl;

            function sendAction(){
                send(subject, body , ru, su, cu)
                    .then(function () {
                        ctrl.sent = true;
                        m.redraw();
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                        m.redraw();
                    });
            }
        },
        view: function view(ctrl){
            return m('.add.centrify', {config:fullHeight},[
                ctrl.sent
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Mail successfully sent!')
                    ]
                    :
                    m('.card.card-inverse.col-md-4', [
                        m('.card-block',[
                            m('h4', 'Please fill the following details'),
                            m('form', {onsubmit:ctrl.send}, [
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'Subject',
                                        placeholder: 'Subject',
                                        value: ctrl.subject(),
                                        oninput: m.withAttr('value', ctrl.subject),
                                        onchange: m.withAttr('value', ctrl.subject),
                                        config: getStartValue$4(ctrl.subject)
                                    }
                                    )),
                                m('fieldset.form-group',
                                    m('textarea.form-control', {
                                        type:'Body',
                                        placeholder: 'Body',
                                        value: ctrl.body(),
                                        oninput: m.withAttr('value', ctrl.body),
                                        onchange: m.withAttr('value', ctrl.body),
                                        config: getStartValue$4(ctrl.body)
                                    }
                                    )),
                                m('fieldset.form-group',

                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.ru)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Regular users')
                                    ]),
                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.su)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Super users')
                                    ]),
                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.cu)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Contract users')
                                    ])

                                )
                            ]),

                            !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                            m('button.btn.btn-primary.btn-block', {onclick: ctrl.send},'Send')
                        ])
                    ])
            ]);
        }
    };

    function getStartValue$4(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function apiURL$2(code)
    {   
        return (activationUrl + "/" + (encodeURIComponent(code)));
    }

    var is_activation_code = function (code) { return fetchJson(apiURL$2(code), {
        method: 'get'
    }); };

    var set_password$1 = function (code, password, confirm) { return fetchJson(apiURL$2(code), {
        method: 'post',
        body: {password: password, confirm: confirm}
    }); };

    var activationComponent = {
        controller: function controller(){
            var ctrl = {
                password: m.prop(''),
                external: m.prop(false),
                confirm: m.prop(''),
                password_error: m.prop(''),
                activated:false,
                error:m.prop(''),
                do_set_password: do_set_password
            };
           
            is_activation_code(m.route.param('code'))
            .catch(function (err) { return ctrl.error(err.message); })
            .then(m.redraw);

            return ctrl;

            function do_set_password(){
                set_password$1(m.route.param('code'), ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.activated = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
                return m('.activation.centrify', {config:fullHeight},[
                ctrl.error() ?
                    m('p.text-center',
                        m('.alert.alert-danger', m('strong', 'Error: '), ctrl.error())) :
                    ctrl.activated
                        ?
                        [
                            m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                            m('h5', 'Password successfully updated!'),
                            m('p.text-center', m('small.text-muted',  m('a', {href:'./'}, 'Take me to the login page!')))
                        ]
                        :
                        password_body(ctrl)]);
        }
    };

    function apiURL$3(code)
    {   
        return (collaborationUrl + "/" + (encodeURIComponent(code)));
    }

    var is_collaboration_code = function (code) { return fetchJson(apiURL$3(code), {
        method: 'get'
    }); };

    var collaborationComponent = {
        controller: function controller(){
            is_collaboration_code(m.route.param('code'))
                .then(function () {
                    m.route('/');
                }).catch().then(m.redraw);



        },
        view: function view(){
            return m('.activation.centrify', {config:fullHeight},[
                m('i.fa.fa-thumbs-down.fa-5x.m-b-1'),
                m('h5', 'There is a problem! please check your code...')]);
        }
    };

    var resetPasswordComponent = {
        controller: function controller(){
            var ctrl = {
                password:m.prop(''),
                confirm:m.prop(''),
                password_error: m.prop(''),
                password_changed:false,
                code: m.prop(''),
                do_set_password: do_set_password
            };
            ctrl.code(m.route.param('code')!== undefined ? m.route.param('code') : '');
            is_recovery_code(ctrl.code())
                .catch(function () {
                    m.route('/');
                })
                .then(function () {
                    m.redraw();
                });

            return ctrl;
            
            function do_set_password(){
                set_password(ctrl.code(), ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.password_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
            return m('.activation.centrify', {config:fullHeight},[
                ctrl.password_changed
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Password successfully updated!'),
                        m('p.text-center',
                            m('small.text-muted',  m('a', {href:'./'}, 'Take me to my studies!'))
                        )
                    ]
                    :
                    password_body(ctrl)
            ]);
        }
    };

    var recoveryUrl = baseUrl + "/recovery";


    var recovery = function (username) { return fetchJson(recoveryUrl, {
        method: 'post',
        body: {username: username}
    }); };

    var recoveryComponent = {
        controller: function controller(){
            var ctrl = {
                sent:false,
                username: m.prop(''),
                error: m.prop(''),
                recoveryAction: recoveryAction
            };
            return ctrl;

            function recoveryAction(){
                recovery(ctrl.username)
                    .catch(function (response) {
                        ctrl.error(response.message);
                    })
                    .then(function (){ctrl.sent = true; m.redraw();});
            }
        },
        view: function view(ctrl){
            return  m('.recovery.centrify', {config:fullHeight},[
                ctrl.sent
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Recovery request successfully sent!')
                    ]
                    :
                    m('.card.card-inverse.col-md-4', [
                        m('.card-block',[
                            m('h4', 'Password Reset Request'),
                            m('p', 'Enter your username or your email address in the space below and we will mail you the password reset instructions'),

                            m('form', {onsubmit:ctrl.recoveryAction}, [
                                m('input.form-control', {
                                    type:'username',
                                    placeholder: 'Username / Email',
                                    value: ctrl.username(),
                                    oninput: m.withAttr('value', ctrl.username),
                                    onchange: m.withAttr('value', ctrl.username),
                                    config: getStartValue$5(ctrl.username)
                                })
                            ]),

                            !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                            m('button.btn.btn-primary.btn-block', {onclick: ctrl.recoveryAction},'Request')
                        ])
                    ])
            ]);
        }
    };

    function getStartValue$5(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var collaborationComponent$1 = {
        controller: function controller(){
            var ctrl = {
                users:m.prop(),
                is_public:m.prop(),

                link_data:m.prop(),
                link:m.prop(''),
                link_type:m.prop(''),
                link_list:m.prop([]),
                link_add_list:m.prop([]),
                link_remove_list:m.prop([]),
                study_name:m.prop(),
                user_name:m.prop(''),
                permission:m.prop('can edit'),
                data_permission:m.prop('visible'),
                loaded:false,
                col_error:m.prop(''),
                pub_error:m.prop(''),
                share_error:m.prop(''),
                remove: remove,
                do_add_collaboration: do_add_collaboration,
                do_add_link: do_add_link,
                do_revoke_link: do_revoke_link,
                do_make_public: do_make_public
            };
            function load() {
                get_collaborations(m.route.param('studyId'))
                    .then(function (response) {ctrl.users(response.users);
                        ctrl.is_public(response.is_public);
                        ctrl.study_name(response.study_name);
                        ctrl.link(response.link_data.link);
                        ctrl.link_type(response.link_data.link_type);
                        ctrl.link_list(response.link_data.link_list);

                        ctrl.loaded = true;})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);

            }
            function remove(user_id){
                messages.confirm({header:'Delete collaboration', content:'Are you sure?'})
                    .then(function (response) {
                        if (response)
                            remove_collaboration(m.route.param('studyId'), user_id)
                                .then(function (){
                                    load();
                                })
                                .catch(function (error) {
                                    ctrl.col_error(error.message);
                                })
                                .then(m.redraw);
                    });
            }



            function check_permission(ctrl){
                return ctrl.data_permission(ctrl.permission() === 'invisible' ? 'visible' : ctrl.data_permission());



            }

            function do_add_collaboration()
            {


                    messages.confirm({
                    header:'Add a Collaborator',
                    content: m.component({view: function () { return m('p', [
                        m('p', 'Enter collaborator\'s user name:'),
                        m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),

                        m('p.space', 'Select users\'s permissions:'),
                        m('select.form-control', {value:ctrl.permission(), onchange: m.withAttr('value',ctrl.permission)}, [
                            m('option',{value:'can edit', selected: ctrl.permission() === 'can edit'}, 'Can edit'),
                            m('option',{value:'read only', selected: ctrl.permission() === 'read only'}, 'Read only'),
                            m('option',{value:'invisible', selected: ctrl.permission() === 'invisible'}, 'Invisible'),

                        ]),
                        m('p.space', 'Select data visibility:'),
                            m('select.form-control', {value:check_permission(ctrl), onchange: m.withAttr('value',ctrl.data_permission)}, [
                                m('option',{value:'visible', selected: ctrl.data_permission() === 'visible' }, 'Visible'),
                                m('option',{value:'invisible', disabled: ctrl.permission() === 'invisible', selected: ctrl.data_permission() === 'invisible'}, 'Invisible')
                            ]),

                        m('p', {class: ctrl.col_error()? 'alert alert-danger' : ''}, ctrl.col_error())
                    ]); }
                    })})
                    .then(function (response) {
                        if (response){

                            if(!ctrl.user_name())
                            {
                                ctrl.col_error('ERROR: user name is missing');
                                return do_add_collaboration();

                            }
                            add_collaboration(m.route.param('studyId'), ctrl.user_name, ctrl.permission, ctrl.data_permission)
                                .then(function (){
                                    ctrl.col_error('');
                                    load();
                                })
                                .catch(function (error) {
                                    ctrl.col_error(error.message);
                                    do_add_collaboration();
                                })
                                .then(m.redraw);
                        }
                    });
            }

            function do_add_link() {
                add_link(m.route.param('studyId'))
                    .then(function (response) {ctrl.link(response.link);})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);
            }

            function do_revoke_link() {
                revoke_link(m.route.param('studyId'))
                    .then(function () {ctrl.link('');})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);
            }

            function do_make_public(is_public){
                messages.confirm({okText: ['Yes, make ', is_public ? 'public' : 'private'], cancelText: ['No, keep ', is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', is_public
                    ?
                    'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
                    :
                    'Making the study private will hide its files from everyone but you.'),
                m('span', {class: ctrl.pub_error()? 'alert alert-danger' : ''}, ctrl.pub_error())])})
                    .then(function (response) {
                        if (response) make_pulic(m.route.param('studyId'), is_public)
                            .then(function (){
                                ctrl.pub_error('');
                                load();
                            })
                            .catch(function (error) {
                                ctrl.pub_error(error.message);
                                do_make_public(is_public);
                            })
                            .then(m.redraw);
                    });

            }
            load();
            return ctrl;
        },
        view: function view(ctrl){
            return  !ctrl.loaded
                ?
                m('.loader')
                :
                m('.container.sharing-page', [
                    m('.row',[
                        m('.col-sm-7', [
                            m('h3', [ctrl.study_name(), ' (Sharing Settings)'])
                        ]),
                        m('.col-sm-5', [
                            m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_collaboration}, [
                                m('i.fa.fa-plus'), '  Add a new collaborator'
                            ]),
                            m('button.btn.btn-secondary.btn-sm', {onclick:function() {ctrl.do_make_public(!ctrl.is_public());}}, ['Make ', ctrl.is_public() ? 'Private' : 'Public'])
                        ])
                    ]),
                    m('table', {class:'table table-striped table-hover'}, [
                        m('thead', [
                            m('tr', [
                                m('th', 'User name'),
                                m('th',  'Permission'),
                                m('th',  'Remove')
                            ])
                        ]),
                        m('tbody', [
                            ctrl.users().map(function (user) { return m('tr', [
                                m('td', user.user_name),
                                m('td', [user.permission, user.status ? (" (" + (user.status) + ")") : '']),
                                m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.remove(user.user_id);}}, 'Remove'))
                            ]); })

                        ]),
                        /*  m('.row.space',
                            m('.col-sm-12', [
                                m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_link},
                                    [m('i.fa.fa-plus'), '  Create / Re-create public link']
                                ),
                                m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_revoke_link},
                                    [m('i.fa.fa-fw.fa-remove'), '  Revoke public link']
                                ),
                                m('label.input-group.space',[
                                    m('.input-group-addon', {onclick: function() {copy(ctrl.link());}}, m('i.fa.fa-fw.fa-copy')),
                                    m('input.form-control', { value: ctrl.link(), onchange: m.withAttr('value', ctrl.link)})
                                ])
                            ])
                        )*/

                    ])
                ]);
        }
    };

    // it makes sense to use this for cotnrast:
    // https://24ways.org/2010/calculating-color-contrast/

    var editTag = function (args) { return m.component(editTagComponent, args); };

    var editTagComponent = {
        view: function (ctrl, ref) {
            var tag_color = ref.tag_color;
            var tag_text = ref.tag_text;
            var error = ref.error;

            return m('div', [
            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Tag name')
                ]),
                m('.col-sm-9', [
                    m('input.form-control', {placeholder: 'tag_text', value: tag_text(), oninput: m.withAttr('value', tag_text)})
                ])
            ]),

            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Preview')
                ]),
                m('.col-sm-9.form-control-static', [
                    !tag_text()
                        ? m('small.text-muted', 'No tag name yet')
                        : m('span.study-tag',  {style: {'background-color': '#'+tag_color()}}, tag_text())
                ])
            ]),

            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Color')
                ]),
                m('.col-sm-9', [
                    m('div',[
                        colorButton('E7E7E7', tag_color),
                        colorButton('B6CFF5', tag_color),
                        colorButton('98D7E4', tag_color),
                        colorButton('E3D7FF', tag_color),
                        colorButton('FBD3E0', tag_color),
                        colorButton('F2B2A8', tag_color),
                        colorButton('C2C2C2', tag_color),
                        colorButton('4986E7', tag_color)
                    ]),
                    m('div', [
                        colorButton('2DA2BB', tag_color),
                        colorButton('B99AFF', tag_color),
                        colorButton('F691B2', tag_color),
                        colorButton('FB4C2F', tag_color),
                        colorButton('FFC8AF', tag_color),
                        colorButton('FFDEB5', tag_color),
                        colorButton('FBE9E7', tag_color),
                        colorButton('FDEDC1', tag_color)
                    ]),
                    m('div', [
                        colorButton('B3EFD3', tag_color),
                        colorButton('A2DCC1', tag_color),
                        colorButton('FF7537', tag_color),
                        colorButton('FFAD46', tag_color),
                        colorButton('EBDBDE', tag_color),
                        colorButton('CCA6AC', tag_color),
                        colorButton('42D692', tag_color),
                        colorButton('16A765', tag_color)
                    ])
                ])
            ]),


            m('p', {class: error()? 'alert alert-danger' : ''}, error())
        ]);
    }
    };

    function colorButton(color, prop){
        return m('button',  {style: {'background-color': ("#" + color)}, onclick: prop.bind(null, color)}, ' A ');
    }

    var tagsComponent = {
        controller: function controller(){
            var ctrl = {
                tags:m.prop(),
                tag_text:m.prop(''),
                tag_color:m.prop(''),
                loaded:false,
                error:m.prop(''),
                remove: remove,
                add: add,
                edit: edit
            };

            function load() {
                get_tags()
                    .then(function (response) {
                        ctrl.tags(response.tags);
                        ctrl.loaded = true;
                    })
                    .catch(function (error) {
                        ctrl.error(error.message);
                    }).then(m.redraw);
            }

            function remove(tag_id){
                return function () { return messages.confirm({header:'Delete tag', content:'Are you sure?'})
                    .then(function (response) {
                        if (response)
                            remove_tag(tag_id)
                                .then(load)
                                .catch(function (error) {
                                    ctrl.error(error.message);
                                })
                                .then(m.redraw);
                    }); };
            }

            function edit(tag_id, tag_text, tag_color){
                return function () {
                    ctrl.tag_text(tag_text);
                    ctrl.tag_color(tag_color);

                    messages.confirm({
                        header:'Edit tag',
                        content: editTag(ctrl)
                    })
                        .then(function (response) {
                            if (response)
                                edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color)
                                    .then(function (){
                                        ctrl.error('');
                                        ctrl.tag_text('');
                                        ctrl.tag_color('');
                                        load();
                                    })
                                    .catch(function (error) {
                                        ctrl.error(error.message);
                                        edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color);
                                    })
                                    .then(m.redraw);
                        });
                };
            }

            function add(){
                ctrl.tag_text('');
                ctrl.tag_color('E7E7E7');
                messages.confirm({
                    header:'Add a new tag',
                    content: editTag(ctrl)
                })
                    .then(function (response) {
                        if (response) add_tag(ctrl.tag_text, ctrl.tag_color)
                            .then(function (){
                                ctrl.error('');
                                ctrl.tag_text('');
                                ctrl.tag_color('');
                                load();
                            })
                            .catch(function (error) {
                                ctrl.error(error.message);
                                add(); // retry
                            })
                            .then(m.redraw);
                    });
            }

            load();
            return ctrl;
        },
        view: function view(ref){
            var loaded = ref.loaded;
            var add = ref.add;
            var tags = ref.tags;
            var edit = ref.edit;
            var remove = ref.remove;

            if (!loaded) return m('.loader');

            return m('.container.tags-page', [
                m('.row',[
                    m('.col-sm-7', [
                        m('h3', 'Tags')
                    ]),
                    m('.col-sm-5', [
                        m('button.btn.btn-success.btn-sm.pull-right', {onclick:add}, [
                            m('i.fa.fa-plus'), '  Create new tag'
                        ])
                    ])
                ]),

                !tags().length
                    ? m('.alert.alert-info', 'You have no tags yet') 
                    : m('.row', [
                        m('.list-group.col-sm-6', [
                            tags().map(function (tag) { return m('.list-group-item', [
                                m('.row', [
                                    m('.col-sm-6', [
                                        m('span.study-tag',  {style: {'background-color': '#'+tag.color}}, tag.text)
                                    ]),
                                    m('.col-sm-6', [
                                        m('btn-group', [
                                            m('a.btn.btn-sm.btn-secondary', {onclick:edit(tag.id, tag.text, tag.color)}, [
                                                m('i.fa.fa-edit'),
                                                ' Edit'
                                            ]),
                                            m('a.btn.btn-sm.btn-secondary', {onclick:remove(tag.id)}, [
                                                m('i.fa.fa-remove'),
                                                ' Remove'
                                            ])
                                        ])
                                    ])
                                ])
                            ]); })
                        ])
                    ])
            ]);
        }
    };

    function template_url(templateId)
    {
        return (translateUrl + "/" + (encodeURIComponent(templateId)));
    }

    function page_url(templateId, pageId)
    {
        return (translateUrl + "/" + (encodeURIComponent(templateId)) + "/" + (encodeURIComponent(pageId)));
    }

    var getListOfPages = function (templateId) { return fetchJson(template_url(templateId), {
        method: 'get'
    }); };


    var getStrings = function (templateId, pageId) { return fetchJson(page_url(templateId, pageId), {
        method: 'get'
    }); };


    var saveStrings = function (strings, templateId, pageId) { return fetchJson(page_url(templateId, pageId), {
        body: {strings: strings},
        method: 'put'
    }); };

    function textareaConfig(el, isInit){
        var resize = function () {
            el.style.height = ''; // reset before recaluculating
            var height = el.scrollHeight + 'px';
            requestAnimationFrame(function () {
                el.style.overflow = 'hidden';
                el.style.height = height;
            });
        };

        if (!isInit) {
            el.addEventListener('input',  resize);
            requestAnimationFrame(resize);
        }
    }

    var pagesComponent = {
        controller: function controller(){
            var templateId = m.route.param('templateId');
            var pageId = m.route.param('pageId');
            var ctrl = {
                pages:m.prop(),
                study_name:m.prop(),
                strings:m.prop(),
                loaded:false,
                has_changed:m.prop(false),
                error:m.prop(''),
                pageId: pageId,
                templateId: templateId,
                save: save,
                onunload: onunload
            };

            function load() {
                getListOfPages(templateId)
                    .then(function (response) {
                        ctrl.pages(response.pages);
                        ctrl.study_name(response.study_name);
                        ctrl.loaded = true;
                    })
                    .catch(function (error) {
                        ctrl.error(error.message);
                    }).then(m.redraw);
                if(pageId)
                    getStrings(templateId, pageId)
                        .then(function (response) {
                            ctrl.strings(response.strings.map(propifyTranslation).map(propifyChanged));
                            ctrl.loaded = true;

                        })
                        .catch(function (error) {
                            ctrl.error(error.message);
                        }).then(m.redraw);

            }
            function save() {
                ctrl.has_changed(false);
                var changed_studies = ctrl.strings().filter(changedFilter());
                if(!changed_studies.length)
                    return;
                saveStrings(changed_studies, templateId, pageId)
                    .then(function (){ return load(); });
            }
            load();

            function beforeunload(event) {
                if (ctrl.has_changed())
                    event.returnValue = 'You have unsaved data are you sure you want to leave?';
            }

            function onunload(e){
                if (ctrl.has_changed() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                    e.preventDefault();
                } else {
                    window.removeEventListener('beforeunload', beforeunload);
                }
            }
            return ctrl;
        },
        view: function view(ref){
            var loaded = ref.loaded;
            var pages = ref.pages;
            var strings = ref.strings;
            var save = ref.save;
            var templateId = ref.templateId;
            var pageId = ref.pageId;
            var study_name = ref.study_name;
            var has_changed = ref.has_changed;

            return m('.study',  [
                !loaded ? m('.loader') : splitPane({
                    leftWidth: leftWidth$2,
                    left:m('div.translate-page', [
                        m('h5', m('a.no-decoration',  (" " + (study_name())))),
                        m('.files', [
                            m('ul', pages().map(function (page) { return m('li.file-node',{onclick: select$1(templateId, page)}, [
                                m('a.wholerow',{
                                    unselectable:'on',
                                    class:classNames({
                                        'current': page.pageName===pageId
                                    })
                                }, m.trust('&nbsp;')),

                                m('a', {class:classNames({'text-primary': /\.expt\.xml$/.test(page.pageName)})}, [
                                    // icon
                                    m('i.fa.fa-fw.fa-file-o.fa-files-o', {
                                    }),
                                    // page name
                                    m('span', (" " + (page.pageName)))
                                ])
                            ]); }))
                        ])
                    ]),
                    right:  !strings()
                        ?  m('.centrify', [
                            m('i.fa.fa-smile-o.fa-5x'),
                            m('h5', 'Please select a page to start working')
                        ])
                        :
                        [
                            m('.study',
                                m('.editor',
                                    m('.btn-toolbar.editor-menu', [
                                        m('.file-name', {class: has_changed() ? 'text-danger' : ''},
                                            m('span',{class: has_changed() ? '' : 'invisible'}, '*'),
                                            pageId
                                        ),
                                        m('.btn-group.btn-group-sm.pull-xs-right', [
                                            m('a.btn.btn-secondary', { title:'Save', onclick:save
                                                , class: classNames({'btn-danger-outline' : has_changed(), 'disabled': !has_changed()})
                                            },[
                                                m('strong.fa.fa-save')
                                            ])]
                                        )]))),
                            m('div.translate-page', {config: fullHeight},
                                [strings().map(function (string) { return m('.list-group-item', [
                                    m('.row', [
                                        m('.col-sm-5', [
                                            m('span',  string.text),
                                            m('p.small.text-muted.m-y-0', string.comment)
                                        ]),
                                        m('.col-sm-7', [
                                            m('textarea.form-control', {
                                                placeholder: 'translation',
                                                oninput: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                                onchange: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                                config: textareaConfig
                                            }, string.translation())
                                        ])

                                    // ,m('.col-sm-6', [
                                    //     m('input.form-control', {
                                    //         type:'text',
                                    //         placeholder: 'translation',
                                    //         value: string.translation(),
                                    //         oninput: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                    //         onchange: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                    //         config: getStartValue(string.translation)
                                    //     })
                                    // ])
                                    ])
                                ]); })
                                ])

                        ]
                })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth$2(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }
    // function do_onchange(string){
    //     m.withAttr('value', string.translation);
    // }


    function propifyTranslation(obj){
        obj = Object.assign({}, obj); // copy obj
        obj.translation = m.prop(obj.translation);
        return obj;
    }

    function propifyChanged(obj) {
        obj.changed = false;
        return obj;
    }


    var changedFilter = function () { return function (string) {
        return string.changed==true;
    }; };

    var select$1 = function (templateId, page) { return function (e) {
        e.stopPropagation();
        e.preventDefault();
        m.route(("/translate/" + templateId + "/" + (page.pageName)));
    }; };

    var routes = {
        '/tags':  tagsComponent,
        '/translate/:templateId':  pagesComponent,
        '/translate/:templateId/:pageId':  pagesComponent,
        '/template_studies' : mainComponent,


        '/recovery':  recoveryComponent,
        '/activation/:code':  activationComponent,
        '/collaboration/:code':  collaborationComponent,
        '/settings':  changePasswordComponent,
        '/messages':  messagesComponent,
        '/reset_password/:code':  resetPasswordComponent,

        '/deployList': deployComponent,
        '/removalList': removalListComponent,
        '/changeRequestList': changeRequestListComponent,
        '/addUser':  addComponent,
        '/users':  usersComponent,
        '/config':  configComponent,
        '/massMail':  massMailComponent,

        '/studyChangeRequest/:studyId':  studyChangeRequestComponent,
        '/studyRemoval/:studyId':  StudyRemovalComponent,
        '/deploy/:studyId': deployComponent$1,
        '/login': loginComponent,
        '/studies' : mainComponent,
        '/studies/statistics_old' : statisticsComponent$1,
        '/studies/statistics' : statisticsComponent,

        '/view/:code': editorLayoutComponent$1,
        '/view/:code/:resource/:fileId': editorLayoutComponent$1,


        '/editor/:studyId': editorLayoutComponent,
        '/editor/:studyId/:resource/:fileId': editorLayoutComponent,
        '/pool': poolComponent,
        '/pool/history': poolComponent$1,
        '/downloads': downloadsComponent,
        '/downloadsAccess': downloadsAccessComponent,
        '/sharing/:studyId': collaborationComponent$1
    };

    var timer = 0;
    var countdown = 0;
    var role = '';
    var isloggedin = true;
    var new_msgs = false;

    var layout = function (route) {
        return {
            controller: function controller(){
                var ctrl = {
                    isloggedin: isloggedin,
                    role: m.prop(role),
                    new_msgs: m.prop(new_msgs),
                    present_templates: m.prop(false),
                    doLogout: doLogout,
                    timer:m.prop(0)
                };
                is_loggedin();
                function is_loggedin(){
                    getAuth().then(function (response) {
                        role = ctrl.role(response.role);
                        new_msgs = ctrl.new_msgs(response.new_msgs);

                        isloggedin = ctrl.isloggedin = response.isloggedin;
                        ctrl.present_templates(response.present_templates);
                        var is_view = (m.route() == ("/view/" + (m.route.param('code'))) || m.route() == ("/view/" + (m.route.param('code')) + "/" + (m.route.param('resource')) + "/" + (encodeURIComponent(m.route.param('fileId')))));

                        if(ctrl.role()=='ro' && !is_view)
                            return doLogout();
                        var is4su   = (m.route() == "/users" || m.route() == "/config");

                        if(ctrl.role()!='su' && is4su)
                            m.route('./');

                        if (!is_view &&  !ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code')  && m.route() !== '/reset_password/'+ m.route.param('code')){
                            // doLogout();
                            var url = m.route();
                            m.route('/login');
                            location.hash = encodeURIComponent(url);
                        }
                        if(ctrl.role()=='CU' && m.route() == '/studies')
                            m.route('/downloads');


                        timer = response.timeoutInSeconds;
                        run_countdown();
                        m.redraw();
                    });
                }

                function run_countdown(){
                    clearInterval(countdown);
                    countdown = setInterval(function () {
                        if(timer<=0)
                            return;
                        if(timer<10) {
                            messages.close();
                            doLogout();
                        }
                        if(timer==70)
                            messages.confirm({header:'Timeout Warning', content:'The session is about to expire. Do you want to keep working?',okText:'Yes, stay signed-in', cancelText:'No, sign out'})
                                .then(function (response) {
                                    if (!response)
                                        return doLogout();
                                    return is_loggedin();
                                });
                        timer--;
                    }, 1000);
                }
                return ctrl;

                function doLogout(){
                    clearInterval(countdown);
                    logout().then(function () {
                        var url = m.route();
                        m.route('/login');
                        location.hash = encodeURIComponent(url);
                    });
                }
            },
            view: function view(ctrl){

                var settings = {
                    'studies':[],
                    // 'data':['downloads', 'downloadsAccess', 'statistics'],
                    // 'pool':[],
                    'tags':[]
                    ,'admin':[/*'deployList', 'removalList', 'changeRequestList', 'addUser', */'users', 'config'/*, 'massMail'*/]
                };


                var settings_hash = {
                    'studies':{text: 'Studies', href:'/studies', sub:[]},
                    'data':{text: 'Data', href:false,
                        subs: {
                            'downloads': {text: 'downloads', href: '/downloads'},
                            'downloadsAccess': {text: 'Downloads Access', href: '/downloadsAccess'},
                            'statistics': {text: 'Statistics', href: '/statistics'}
                        }},
                    'pool':{text: 'Pool', href:'/pool', sub:[]},
                    'tags':{text: 'Tags', href:'/tags', sub:[]},
                    'admin':{text: 'Admin', href:false,
                        su:true,
                        subs:{'deployList': {text:'Deploy List', href: '/deployList'},
                            'removalList': {text:'Removal List', href:'/removalList'},
                            'changeRequestList': {text:'Change Request List', href: '/changeRequestList'},
                            'addUser': {text:'Add User', href: '/addUser'},
                            'config': {text:'Edit Configuration', href: '/config'},
                            'massMail': {text:'Send MassMail', href: '/massMail'},
                            'users': {text:'Users Management', href: '/users'}
                        }}

                };


                return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                    !ctrl.isloggedin || ctrl.role()=='ro'
                        ?
                        ''
                        :
                        m('nav.navbar.navbar-dark', [
                            m('a.navbar-brand', {href:'', config:m.route}, 'Dashboard'),
                            m('ul.nav.navbar-nav',[

                                Object.keys(settings).map(function (comp){ return settings_hash[comp].su && ctrl.role() !=='su' ? '' :
                                        settings[comp].length==0 ?
                                            m('li.nav-item',[
                                                m('a.nav-link',{href:settings_hash[comp].href, config:m.route}, settings_hash[comp].text)

                                            ])
                                            :
                                            m('li.nav-item', [
                                                m('.dropdown', [
                                                    m('a.nav-link', settings_hash[comp].text),
                                                    m('.dropdown-menu', [
                                                        settings[comp].map(function (sub_comp){ return m('a.dropdown-item',{href:settings_hash[comp].subs[sub_comp].href, config:m.route}, settings_hash[comp].subs[sub_comp].text); }
                                                        )

                                                    ])
                                                ])
                                            ]); }
                                ),
                                !ctrl.new_msgs() ? '' : m('li.nav-item.pull-xs-right', [
                                    m('a.nav-link',{href:'/messages', config:m.route},m('i.fa.fa-envelope.fa-lg', {style:{color:'white'}}))
                                ]),

                                m('li.nav-item.pull-xs-right', [
                                    m('a.nav-link',{href:'/settings', config:m.route},m('i.fa.fa-cog.fa-lg'))
                                ]),
                                !ctrl.isloggedin ? '' : m('li.nav-item.pull-xs-right',[
                                    m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
                                        m('i.fa.fa-sign-out'), '  Logout'
                                    ])
                                ])
                            ])
                        ]),

                    m('.main-content.container-fluid', [
                        route,

                        m.component(contextMenuComponent), // register context menu
                        m.component(messages), // register modal
                        m.component(spinner) // register spinner
                    ])

                ]);
            }
        };

    };

    var wrappedRoutes = mapObject(routes, layout);
    m.route(document.body, '/studies', wrappedRoutes);

    /**
     * Map Object
     * A utility function to transform objects
     * @param  {Object}     obj     The object to transform
     * @param  {Function}   cb      The transforming function
     * @return {Object}        [description]
     *
     * Signature:
     *
     * Object mapObject(Object obj, callbackFunction cb)
     *
     * where:
     *  callbackFunction :: any Function(any value, String key, Object object)
     */

    function mapObject(obj, cb) {
        return Object.keys(obj)
            .reduce(function(result, key) {
                result[key] = cb(obj[key], key, obj);
                return result;
            }, {});
    }

}());
//# sourceMappingURL=main.js.map
