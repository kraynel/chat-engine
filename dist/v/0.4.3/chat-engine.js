(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = asyncify;

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _initialParams = require('./internal/initialParams');

var _initialParams2 = _interopRequireDefault(_initialParams);

var _setImmediate = require('./internal/setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return (0, _initialParams2.default)(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if ((0, _isObject2.default)(result) && typeof result.then === 'function') {
            result.then(function (value) {
                invokeCallback(callback, null, value);
            }, function (err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        (0, _setImmediate2.default)(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}
module.exports = exports['default'];
},{"./internal/initialParams":2,"./internal/setImmediate":5,"lodash/isObject":37}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (fn) {
    return function () /*...args, callback*/{
        var args = (0, _slice2.default)(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

var _slice = require('./slice');

var _slice2 = _interopRequireDefault(_slice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
},{"./slice":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = once;
function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports["default"];
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onlyOnce;
function onlyOnce(fn) {
    return function () {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports["default"];
},{}],5:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasNextTick = exports.hasSetImmediate = undefined;
exports.fallback = fallback;
exports.wrap = wrap;

var _slice = require('./slice');

var _slice2 = _interopRequireDefault(_slice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasSetImmediate = exports.hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = exports.hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn /*, ...args*/) {
        var args = (0, _slice2.default)(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

exports.default = wrap(_defer);
}).call(this,require('_process'))

},{"./slice":6,"_process":39}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = slice;
function slice(arrayLike, start) {
    start = start | 0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for (var idx = 0; idx < newLen; idx++) {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}
module.exports = exports["default"];
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isAsync = undefined;

var _asyncify = require('../asyncify');

var _asyncify2 = _interopRequireDefault(_asyncify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
}

exports.default = wrapAsync;
exports.isAsync = isAsync;
},{"../asyncify":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tasks, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    if (!(0, _isArray2.default)(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = (0, _wrapAsync2.default)(tasks[taskIndex++]);
        args.push((0, _onlyOnce2.default)(next));
        task.apply(null, args);
    }

    function next(err /*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask((0, _slice2.default)(arguments, 1));
    }

    nextTask([]);
};

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('./internal/once');

var _once2 = _interopRequireDefault(_once);

var _slice = require('./internal/slice');

var _slice2 = _interopRequireDefault(_slice);

var _onlyOnce = require('./internal/onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

var _wrapAsync = require('./internal/wrapAsync');

var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
},{"./internal/once":3,"./internal/onlyOnce":4,"./internal/slice":6,"./internal/wrapAsync":7,"lodash/isArray":36,"lodash/noop":38}],9:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":11}],10:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))

},{"../core/createError":17,"./../core/settle":20,"./../helpers/btoa":24,"./../helpers/buildURL":25,"./../helpers/cookies":27,"./../helpers/isURLSameOrigin":29,"./../helpers/parseHeaders":31,"./../utils":33,"_process":39}],11:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":12,"./cancel/CancelToken":13,"./cancel/isCancel":14,"./core/Axios":15,"./defaults":22,"./helpers/bind":23,"./helpers/spread":32,"./utils":33}],12:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],13:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":12}],14:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],15:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":22,"./../helpers/combineURLs":26,"./../helpers/isAbsoluteURL":28,"./../utils":33,"./InterceptorManager":16,"./dispatchRequest":18}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":33}],17:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":19}],18:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":14,"../defaults":22,"./../utils":33,"./transformData":21}],19:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],20:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":17}],21:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":33}],22:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))

},{"./adapters/http":10,"./adapters/xhr":10,"./helpers/normalizeHeaderName":30,"./utils":33,"_process":39}],23:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],24:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":33}],26:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],27:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":33}],28:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],29:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":33}],30:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":33}],31:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"./../utils":33}],32:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],33:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":23,"is-buffer":35}],34:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._events.maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._events.maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. %d listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: %s.';
      console.error(errorMsg, count, eventName);
    } else {
      console.error(errorMsg, count);
    }

    if (console.trace){
      console.trace();
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._events.maxListeners > 0 &&
            tree._listeners.length > this._events.maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._events || init.call(this);
      this._events.maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._events.maxListeners > 0 &&
        this._events[type].length > this._events.maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],35:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],36:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],37:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],38:[function(require,module,exports){
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;

},{}],39:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],40:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.PubNub=t():e.PubNub=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){if(!navigator||!navigator.sendBeacon)return!1;navigator.sendBeacon(e)}Object.defineProperty(t,"__esModule",{value:!0});var u=n(1),c=r(u),l=n(41),h=r(l),f=n(42),d=r(f),p=n(43),g=(n(8),function(e){function t(e){i(this,t);var n=e.listenToBrowserNetworkEvents,r=void 0===n||n;e.db=d.default,e.sdkFamily="Web",e.networking=new h.default({get:p.get,post:p.post,sendBeacon:a});var o=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r&&(window.addEventListener("offline",function(){o.networkDownDetected()}),window.addEventListener("online",function(){o.networkUpDetected()})),o}return o(t,e),t}(c.default));t.default=g,e.exports=t.default},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),u=i(a),c=n(7),l=i(c),h=n(9),f=i(h),d=n(11),p=i(d),g=n(12),y=i(g),v=n(19),b=i(v),_=n(20),m=r(_),k=n(21),P=r(k),S=n(22),O=r(S),w=n(23),T=r(w),C=n(24),M=r(C),E=n(25),x=r(E),N=n(26),R=r(N),K=n(27),j=r(K),A=n(28),D=r(A),G=n(29),U=r(G),H=n(30),B=r(H),I=n(31),L=r(I),q=n(32),z=r(q),F=n(33),X=r(F),W=n(34),V=r(W),J=n(35),$=r(J),Q=n(36),Y=r(Q),Z=n(37),ee=r(Z),te=n(38),ne=r(te),re=n(39),ie=r(re),se=n(15),oe=r(se),ae=n(40),ue=r(ae),ce=n(16),le=i(ce),he=n(13),fe=i(he),de=(n(8),function(){function e(t){var n=this;s(this,e);var r=t.db,i=t.networking,o=this._config=new l.default({setup:t,db:r}),a=new f.default({config:o});i.init(o);var u={config:o,networking:i,crypto:a},c=b.default.bind(this,u,oe),h=b.default.bind(this,u,U),d=b.default.bind(this,u,L),g=b.default.bind(this,u,X),v=b.default.bind(this,u,ue),_=this._listenerManager=new y.default,k=new p.default({timeEndpoint:c,leaveEndpoint:h,heartbeatEndpoint:d,setStateEndpoint:g,subscribeEndpoint:v,crypto:u.crypto,config:u.config,listenerManager:_});this.addListener=_.addListener.bind(_),this.removeListener=_.removeListener.bind(_),this.removeAllListeners=_.removeAllListeners.bind(_),this.channelGroups={listGroups:b.default.bind(this,u,T),listChannels:b.default.bind(this,u,M),addChannels:b.default.bind(this,u,m),removeChannels:b.default.bind(this,u,P),deleteGroup:b.default.bind(this,u,O)},this.push={addChannels:b.default.bind(this,u,x),removeChannels:b.default.bind(this,u,R),deleteDevice:b.default.bind(this,u,D),listChannels:b.default.bind(this,u,j)},this.hereNow=b.default.bind(this,u,V),this.whereNow=b.default.bind(this,u,B),this.getState=b.default.bind(this,u,z),this.setState=k.adaptStateChange.bind(k),this.grant=b.default.bind(this,u,Y),this.audit=b.default.bind(this,u,$),this.publish=b.default.bind(this,u,ee),this.fire=function(e,t){return e.replicate=!1,e.storeInHistory=!1,n.publish(e,t)},this.history=b.default.bind(this,u,ne),this.fetchMessages=b.default.bind(this,u,ie),this.time=c,this.subscribe=k.adaptSubscribeChange.bind(k),this.unsubscribe=k.adaptUnsubscribeChange.bind(k),this.disconnect=k.disconnect.bind(k),this.reconnect=k.reconnect.bind(k),this.destroy=function(e){k.unsubscribeAll(e),k.disconnect()},this.stop=this.destroy,this.unsubscribeAll=k.unsubscribeAll.bind(k),this.getSubscribedChannels=k.getSubscribedChannels.bind(k),this.getSubscribedChannelGroups=k.getSubscribedChannelGroups.bind(k),this.encrypt=a.encrypt.bind(a),this.decrypt=a.decrypt.bind(a),this.getAuthKey=u.config.getAuthKey.bind(u.config),this.setAuthKey=u.config.setAuthKey.bind(u.config),this.setCipherKey=u.config.setCipherKey.bind(u.config),this.getUUID=u.config.getUUID.bind(u.config),this.setUUID=u.config.setUUID.bind(u.config),this.getFilterExpression=u.config.getFilterExpression.bind(u.config),this.setFilterExpression=u.config.setFilterExpression.bind(u.config),this.setHeartbeatInterval=u.config.setHeartbeatInterval.bind(u.config)}return o(e,[{key:"getVersion",value:function(){return this._config.getVersion()}},{key:"networkDownDetected",value:function(){this._listenerManager.announceNetworkDown(),this._config.restore?this.disconnect():this.destroy(!0)}},{key:"networkUpDetected",value:function(){this._listenerManager.announceNetworkUp(),this.reconnect()}}],[{key:"generateUUID",value:function(){return u.default.v4()}}]),e}());de.OPERATIONS=le.default,de.CATEGORIES=fe.default,t.default=de,e.exports=t.default},function(e,t,n){var r=n(3),i=n(6),s=i;s.v1=r,s.v4=i,e.exports=s},function(e,t,n){function r(e,t,n){var r=t&&n||0,i=t||[];e=e||{};var o=void 0!==e.clockseq?e.clockseq:u,h=void 0!==e.msecs?e.msecs:(new Date).getTime(),f=void 0!==e.nsecs?e.nsecs:l+1,d=h-c+(f-l)/1e4;if(d<0&&void 0===e.clockseq&&(o=o+1&16383),(d<0||h>c)&&void 0===e.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");c=h,l=f,u=o,h+=122192928e5;var p=(1e4*(268435455&h)+f)%4294967296;i[r++]=p>>>24&255,i[r++]=p>>>16&255,i[r++]=p>>>8&255,i[r++]=255&p;var g=h/4294967296*1e4&268435455;i[r++]=g>>>8&255,i[r++]=255&g,i[r++]=g>>>24&15|16,i[r++]=g>>>16&255,i[r++]=o>>>8|128,i[r++]=255&o;for(var y=e.node||a,v=0;v<6;++v)i[r+v]=y[v];return t||s(i)}var i=n(4),s=n(5),o=i(),a=[1|o[0],o[1],o[2],o[3],o[4],o[5]],u=16383&(o[6]<<8|o[7]),c=0,l=0;e.exports=r},function(e,t){(function(t){var n,r=t.crypto||t.msCrypto;if(r&&r.getRandomValues){var i=new Uint8Array(16);n=function(){return r.getRandomValues(i),i}}if(!n){var s=new Array(16);n=function(){for(var e,t=0;t<16;t++)0==(3&t)&&(e=4294967296*Math.random()),s[t]=e>>>((3&t)<<3)&255;return s}}e.exports=n}).call(t,function(){return this}())},function(e,t){function n(e,t){var n=t||0,i=r;return i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]}for(var r=[],i=0;i<256;++i)r[i]=(i+256).toString(16).substr(1);e.exports=n},function(e,t,n){function r(e,t,n){var r=t&&n||0;"string"==typeof e&&(t="binary"==e?new Array(16):null,e=null),e=e||{};var o=e.random||(e.rng||i)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,t)for(var a=0;a<16;++a)t[r+a]=o[a];return t||s(o)}var i=n(4),s=n(5);e.exports=r},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(2),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=(n(8),function(){function e(t){var n=t.setup,i=t.db;r(this,e),this._db=i,this.instanceId="pn-"+o.default.v4(),this.secretKey=n.secretKey||n.secret_key,this.subscribeKey=n.subscribeKey||n.subscribe_key,this.publishKey=n.publishKey||n.publish_key,this.sdkFamily=n.sdkFamily,this.partnerId=n.partnerId,this.setAuthKey(n.authKey),this.setCipherKey(n.cipherKey),this.setFilterExpression(n.filterExpression),this.origin=n.origin||"pubsub.pndsn.com",this.secure=n.ssl||!1,this.restore=n.restore||!1,this.proxy=n.proxy,this.keepAlive=n.keepAlive,this.keepAliveSettings=n.keepAliveSettings,this.autoNetworkDetection=n.autoNetworkDetection||!1,this.dedupeOnSubscribe=n.dedupeOnSubscribe||!1,this.maximumCacheSize=n.maximumCacheSize||100,this.customEncrypt=n.customEncrypt,this.customDecrypt=n.customDecrypt,"undefined"!=typeof location&&"https:"===location.protocol&&(this.secure=!0),this.logVerbosity=n.logVerbosity||!1,this.suppressLeaveEvents=n.suppressLeaveEvents||!1,this.announceFailedHeartbeats=n.announceFailedHeartbeats||!0,this.announceSuccessfulHeartbeats=n.announceSuccessfulHeartbeats||!1,this.useInstanceId=n.useInstanceId||!1,this.useRequestId=n.useRequestId||!1,this.requestMessageCountThreshold=n.requestMessageCountThreshold,this.setTransactionTimeout(n.transactionalRequestTimeout||15e3),this.setSubscribeTimeout(n.subscribeRequestTimeout||31e4),this.setSendBeaconConfig(n.useSendBeacon||!0),this.setPresenceTimeout(n.presenceTimeout||300),n.heartbeatInterval&&this.setHeartbeatInterval(n.heartbeatInterval),this.setUUID(this._decideUUID(n.uuid))}return i(e,[{key:"getAuthKey",value:function(){return this.authKey}},{key:"setAuthKey",value:function(e){return this.authKey=e,this}},{key:"setCipherKey",value:function(e){return this.cipherKey=e,this}},{key:"getUUID",value:function(){return this.UUID}},{key:"setUUID",value:function(e){return this._db&&this._db.set&&this._db.set(this.subscribeKey+"uuid",e),this.UUID=e,this}},{key:"getFilterExpression",value:function(){return this.filterExpression}},{key:"setFilterExpression",value:function(e){return this.filterExpression=e,this}},{key:"getPresenceTimeout",value:function(){return this._presenceTimeout}},{key:"setPresenceTimeout",value:function(e){return this._presenceTimeout=e,this.setHeartbeatInterval(this._presenceTimeout/2-1),this}},{key:"getHeartbeatInterval",value:function(){return this._heartbeatInterval}},{key:"setHeartbeatInterval",value:function(e){return this._heartbeatInterval=e,this}},{key:"getSubscribeTimeout",value:function(){return this._subscribeRequestTimeout}},{key:"setSubscribeTimeout",value:function(e){return this._subscribeRequestTimeout=e,this}},{key:"getTransactionTimeout",value:function(){return this._transactionalRequestTimeout}},{key:"setTransactionTimeout",value:function(e){return this._transactionalRequestTimeout=e,this}},{key:"isSendBeaconEnabled",value:function(){return this._useSendBeacon}},{key:"setSendBeaconConfig",value:function(e){return this._useSendBeacon=e,this}},{key:"getVersion",value:function(){return"4.15.1"}},{key:"_decideUUID",value:function(e){return e||(this._db&&this._db.get&&this._db.get(this.subscribeKey+"uuid")?this._db.get(this.subscribeKey+"uuid"):"pn-"+o.default.v4())}}]),e}());t.default=a,e.exports=t.default},function(e,t){"use strict";e.exports={}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(7),a=(r(o),n(10)),u=r(a),c=function(){function e(t){var n=t.config;i(this,e),this._config=n,this._iv="0123456789012345",this._allowedKeyEncodings=["hex","utf8","base64","binary"],this._allowedKeyLengths=[128,256],this._allowedModes=["ecb","cbc"],this._defaultOptions={encryptKey:!0,keyEncoding:"utf8",keyLength:256,mode:"cbc"}}return s(e,[{key:"HMACSHA256",value:function(e){return u.default.HmacSHA256(e,this._config.secretKey).toString(u.default.enc.Base64)}},{key:"SHA256",value:function(e){return u.default.SHA256(e).toString(u.default.enc.Hex)}},{key:"_parseOptions",value:function(e){var t=e||{};return t.hasOwnProperty("encryptKey")||(t.encryptKey=this._defaultOptions.encryptKey),t.hasOwnProperty("keyEncoding")||(t.keyEncoding=this._defaultOptions.keyEncoding),t.hasOwnProperty("keyLength")||(t.keyLength=this._defaultOptions.keyLength),t.hasOwnProperty("mode")||(t.mode=this._defaultOptions.mode),-1===this._allowedKeyEncodings.indexOf(t.keyEncoding.toLowerCase())&&(t.keyEncoding=this._defaultOptions.keyEncoding),-1===this._allowedKeyLengths.indexOf(parseInt(t.keyLength,10))&&(t.keyLength=this._defaultOptions.keyLength),-1===this._allowedModes.indexOf(t.mode.toLowerCase())&&(t.mode=this._defaultOptions.mode),t}},{key:"_decodeKey",value:function(e,t){return"base64"===t.keyEncoding?u.default.enc.Base64.parse(e):"hex"===t.keyEncoding?u.default.enc.Hex.parse(e):e}},{key:"_getPaddedKey",value:function(e,t){return e=this._decodeKey(e,t),t.encryptKey?u.default.enc.Utf8.parse(this.SHA256(e).slice(0,32)):e}},{key:"_getMode",value:function(e){return"ecb"===e.mode?u.default.mode.ECB:u.default.mode.CBC}},{key:"_getIV",value:function(e){return"cbc"===e.mode?u.default.enc.Utf8.parse(this._iv):null}},{key:"encrypt",value:function(e,t,n){return this._config.customEncrypt?this._config.customEncrypt(e):this.pnEncrypt(e,t,n)}},{key:"decrypt",value:function(e,t,n){return this._config.customDecrypt?this._config.customDecrypt(e):this.pnDecrypt(e,t,n)}},{key:"pnEncrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);return u.default.AES.encrypt(e,s,{iv:r,mode:i}).ciphertext.toString(u.default.enc.Base64)||e}},{key:"pnDecrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);try{var o=u.default.enc.Base64.parse(e),a=u.default.AES.decrypt({ciphertext:o},s,{iv:r,mode:i}).toString(u.default.enc.Utf8);return JSON.parse(a)}catch(e){return null}}}]),e}();t.default=c,e.exports=t.default},function(e,t){"use strict";var n=n||function(e,t){var n={},r=n.lib={},i=function(){},s=r.Base={extend:function(e){i.prototype=this;var t=new i;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},o=r.WordArray=s.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=void 0!=t?t:4*e.length},toString:function(e){return(e||u).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes;if(e=e.sigBytes,this.clamp(),r%4)for(var i=0;i<e;i++)t[r+i>>>2]|=(n[i>>>2]>>>24-i%4*8&255)<<24-(r+i)%4*8;else if(65535<n.length)for(i=0;i<e;i+=4)t[r+i>>>2]=n[i>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=s.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],r=0;r<t;r+=4)n.push(4294967296*e.random()|0);return new o.init(n,t)}}),a=n.enc={},u=a.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++){var i=t[r>>>2]>>>24-r%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new o.init(n,t/2)}},c=a.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++)n.push(String.fromCharCode(t[r>>>2]>>>24-r%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(255&e.charCodeAt(r))<<24-r%4*8;return new o.init(n,t)}},l=a.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},h=r.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=l.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n=this._data,r=n.words,i=n.sigBytes,s=this.blockSize,a=i/(4*s),a=t?e.ceil(a):e.max((0|a)-this._minBufferSize,0);if(t=a*s,i=e.min(4*t,i),t){for(var u=0;u<t;u+=s)this._doProcessBlock(r,u);u=r.splice(0,t),n.sigBytes-=i}return new o.init(u,i)},clone:function(){var e=s.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});r.Hasher=h.extend({cfg:s.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new f.HMAC.init(e,n).finalize(t)}}});var f=n.algo={};return n}(Math);!function(e){for(var t=n,r=t.lib,i=r.WordArray,s=r.Hasher,r=t.algo,o=[],a=[],u=function(e){return 4294967296*(e-(0|e))|0},c=2,l=0;64>l;){var h;e:{h=c;for(var f=e.sqrt(h),d=2;d<=f;d++)if(!(h%d)){h=!1;break e}h=!0}h&&(8>l&&(o[l]=u(e.pow(c,.5))),a[l]=u(e.pow(c,1/3)),l++),c++}var p=[],r=r.SHA256=s.extend({_doReset:function(){this._hash=new i.init(o.slice(0))},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],s=n[2],o=n[3],u=n[4],c=n[5],l=n[6],h=n[7],f=0;64>f;f++){if(16>f)p[f]=0|e[t+f];else{var d=p[f-15],g=p[f-2];p[f]=((d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3)+p[f-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+p[f-16]}d=h+((u<<26|u>>>6)^(u<<21|u>>>11)^(u<<7|u>>>25))+(u&c^~u&l)+a[f]+p[f],g=((r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22))+(r&i^r&s^i&s),h=l,l=c,c=u,u=o+d|0,o=s,s=i,i=r,r=d+g|0}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+s|0,n[3]=n[3]+o|0,n[4]=n[4]+u|0,n[5]=n[5]+c|0,n[6]=n[6]+l|0,n[7]=n[7]+h|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return n[i>>>5]|=128<<24-i%32,n[14+(i+64>>>9<<4)]=e.floor(r/4294967296),n[15+(i+64>>>9<<4)]=r,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=s._createHelper(r),t.HmacSHA256=s._createHmacHelper(r)}(Math),function(){var e=n,t=e.enc.Utf8;e.algo.HMAC=e.lib.Base.extend({init:function(e,n){e=this._hasher=new e.init,"string"==typeof n&&(n=t.parse(n));var r=e.blockSize,i=4*r;n.sigBytes>i&&(n=e.finalize(n)),n.clamp();for(var s=this._oKey=n.clone(),o=this._iKey=n.clone(),a=s.words,u=o.words,c=0;c<r;c++)a[c]^=1549556828,u[c]^=909522486;s.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher;return e=t.finalize(e),t.reset(),t.finalize(this._oKey.clone().concat(e))}})}(),function(){var e=n,t=e.lib.WordArray;e.enc.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp(),e=[];for(var i=0;i<n;i+=3)for(var s=(t[i>>>2]>>>24-i%4*8&255)<<16|(t[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|t[i+2>>>2]>>>24-(i+2)%4*8&255,o=0;4>o&&i+.75*o<n;o++)e.push(r.charAt(s>>>6*(3-o)&63));if(t=r.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var n=e.length,r=this._map,i=r.charAt(64);i&&-1!=(i=e.indexOf(i))&&(n=i);for(var i=[],s=0,o=0;o<n;o++)if(o%4){var a=r.indexOf(e.charAt(o-1))<<o%4*2,u=r.indexOf(e.charAt(o))>>>6-o%4*2;i[s>>>2]|=(a|u)<<24-s%4*8,s++}return t.create(i,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(e){function t(e,t,n,r,i,s,o){return((e=e+(t&n|~t&r)+i+o)<<s|e>>>32-s)+t}function r(e,t,n,r,i,s,o){return((e=e+(t&r|n&~r)+i+o)<<s|e>>>32-s)+t}function i(e,t,n,r,i,s,o){return((e=e+(t^n^r)+i+o)<<s|e>>>32-s)+t}function s(e,t,n,r,i,s,o){return((e=e+(n^(t|~r))+i+o)<<s|e>>>32-s)+t}for(var o=n,a=o.lib,u=a.WordArray,c=a.Hasher,a=o.algo,l=[],h=0;64>h;h++)l[h]=4294967296*e.abs(e.sin(h+1))|0;a=a.MD5=c.extend({_doReset:function(){this._hash=new u.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,n){for(var o=0;16>o;o++){var a=n+o,u=e[a];e[a]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8)}var o=this._hash.words,a=e[n+0],u=e[n+1],c=e[n+2],h=e[n+3],f=e[n+4],d=e[n+5],p=e[n+6],g=e[n+7],y=e[n+8],v=e[n+9],b=e[n+10],_=e[n+11],m=e[n+12],k=e[n+13],P=e[n+14],S=e[n+15],O=o[0],w=o[1],T=o[2],C=o[3],O=t(O,w,T,C,a,7,l[0]),C=t(C,O,w,T,u,12,l[1]),T=t(T,C,O,w,c,17,l[2]),w=t(w,T,C,O,h,22,l[3]),O=t(O,w,T,C,f,7,l[4]),C=t(C,O,w,T,d,12,l[5]),T=t(T,C,O,w,p,17,l[6]),w=t(w,T,C,O,g,22,l[7]),O=t(O,w,T,C,y,7,l[8]),C=t(C,O,w,T,v,12,l[9]),T=t(T,C,O,w,b,17,l[10]),w=t(w,T,C,O,_,22,l[11]),O=t(O,w,T,C,m,7,l[12]),C=t(C,O,w,T,k,12,l[13]),T=t(T,C,O,w,P,17,l[14]),w=t(w,T,C,O,S,22,l[15]),O=r(O,w,T,C,u,5,l[16]),C=r(C,O,w,T,p,9,l[17]),T=r(T,C,O,w,_,14,l[18]),w=r(w,T,C,O,a,20,l[19]),O=r(O,w,T,C,d,5,l[20]),C=r(C,O,w,T,b,9,l[21]),T=r(T,C,O,w,S,14,l[22]),w=r(w,T,C,O,f,20,l[23]),O=r(O,w,T,C,v,5,l[24]),C=r(C,O,w,T,P,9,l[25]),T=r(T,C,O,w,h,14,l[26]),w=r(w,T,C,O,y,20,l[27]),O=r(O,w,T,C,k,5,l[28]),C=r(C,O,w,T,c,9,l[29]),T=r(T,C,O,w,g,14,l[30]),w=r(w,T,C,O,m,20,l[31]),O=i(O,w,T,C,d,4,l[32]),C=i(C,O,w,T,y,11,l[33]),T=i(T,C,O,w,_,16,l[34]),w=i(w,T,C,O,P,23,l[35]),O=i(O,w,T,C,u,4,l[36]),C=i(C,O,w,T,f,11,l[37]),T=i(T,C,O,w,g,16,l[38]),w=i(w,T,C,O,b,23,l[39]),O=i(O,w,T,C,k,4,l[40]),C=i(C,O,w,T,a,11,l[41]),T=i(T,C,O,w,h,16,l[42]),w=i(w,T,C,O,p,23,l[43]),O=i(O,w,T,C,v,4,l[44]),C=i(C,O,w,T,m,11,l[45]),T=i(T,C,O,w,S,16,l[46]),w=i(w,T,C,O,c,23,l[47]),O=s(O,w,T,C,a,6,l[48]),C=s(C,O,w,T,g,10,l[49]),T=s(T,C,O,w,P,15,l[50]),w=s(w,T,C,O,d,21,l[51]),O=s(O,w,T,C,m,6,l[52]),C=s(C,O,w,T,h,10,l[53]),T=s(T,C,O,w,b,15,l[54]),w=s(w,T,C,O,u,21,l[55]),O=s(O,w,T,C,y,6,l[56]),C=s(C,O,w,T,S,10,l[57]),T=s(T,C,O,w,p,15,l[58]),w=s(w,T,C,O,k,21,l[59]),O=s(O,w,T,C,f,6,l[60]),C=s(C,O,w,T,_,10,l[61]),T=s(T,C,O,w,c,15,l[62]),w=s(w,T,C,O,v,21,l[63]);o[0]=o[0]+O|0,o[1]=o[1]+w|0,o[2]=o[2]+T|0,o[3]=o[3]+C|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;n[i>>>5]|=128<<24-i%32;var s=e.floor(r/4294967296);for(n[15+(i+64>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),n[14+(i+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(n.length+1),this._process(),t=this._hash,n=t.words,r=0;4>r;r++)i=n[r],n[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8);return t},clone:function(){var e=c.clone.call(this);return e._hash=this._hash.clone(),e}}),o.MD5=c._createHelper(a),o.HmacMD5=c._createHmacHelper(a)}(Math),function(){var e=n,t=e.lib,r=t.Base,i=t.WordArray,t=e.algo,s=t.EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n=this.cfg,r=n.hasher.create(),s=i.create(),o=s.words,a=n.keySize,n=n.iterations;o.length<a;){u&&r.update(u);var u=r.update(e).finalize(t);r.reset();for(var c=1;c<n;c++)u=r.finalize(u),r.reset();s.concat(u)}return s.sigBytes=4*a,s}});e.EvpKDF=function(e,t,n){return s.create(n).compute(e,t)}}(),n.lib.Cipher||function(e){var t=n,r=t.lib,i=r.Base,s=r.WordArray,o=r.BufferedBlockAlgorithm,a=t.enc.Base64,u=t.algo.EvpKDF,c=r.Cipher=o.extend({cfg:i.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(t,n,r){return("string"==typeof n?g:p).encrypt(e,t,n,r)},decrypt:function(t,n,r){return("string"==typeof n?g:p).decrypt(e,t,n,r)}}}});r.StreamCipher=c.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l=t.mode={},h=function(e,t,n){var r=this._iv;r?this._iv=void 0:r=this._prevBlock;for(var i=0;i<n;i++)e[t+i]^=r[i]},f=(r.BlockCipherMode=i.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}})).extend();f.Encryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize;h.call(this,e,t,r),n.encryptBlock(e,t),this._prevBlock=e.slice(t,t+r)}}),f.Decryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=e.slice(t,t+r);n.decryptBlock(e,t),h.call(this,e,t,r),this._prevBlock=i}}),l=l.CBC=f,f=(t.pad={}).Pkcs7={pad:function(e,t){for(var n=4*t,n=n-e.sigBytes%n,r=n<<24|n<<16|n<<8|n,i=[],o=0;o<n;o+=4)i.push(r);n=s.create(i,n),e.concat(n)},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2]}},r.BlockCipher=c.extend({cfg:c.cfg.extend({mode:l,padding:f}),reset:function(){c.reset.call(this);var e=this.cfg,t=e.iv,e=e.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=e.createEncryptor;else n=e.createDecryptor,this._minBufferSize=1;this._mode=n.call(e,this,t&&t.words)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){e.pad(this._data,this.blockSize);var t=this._process(!0)}else t=this._process(!0),e.unpad(t);return t},blockSize:4});var d=r.CipherParams=i.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}}),l=(t.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return e=e.salt,(e?s.create([1398893684,1701076831]).concat(e).concat(t):t).toString(a)},parse:function(e){e=a.parse(e);var t=e.words;if(1398893684==t[0]&&1701076831==t[1]){var n=s.create(t.slice(2,4));t.splice(0,4),e.sigBytes-=16}return d.create({ciphertext:e,salt:n})}},p=r.SerializableCipher=i.extend({cfg:i.extend({format:l}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r);return t=i.finalize(t),i=i.cfg,d.create({ciphertext:t,key:n,iv:i.iv,algorithm:e,mode:i.mode,padding:i.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return"string"==typeof e?t.parse(e,this):e}}),t=(t.kdf={}).OpenSSL={execute:function(e,t,n,r){return r||(r=s.random(8)),e=u.create({keySize:t+n}).compute(e,r),n=s.create(e.words.slice(t),4*n),e.sigBytes=4*t,d.create({key:e,iv:n,salt:r})}},g=r.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:t}),encrypt:function(e,t,n,r){return r=this.cfg.extend(r),n=r.kdf.execute(n,e.keySize,e.ivSize),r.iv=n.iv,e=p.encrypt.call(this,e,t,n.key,r),e.mixIn(n),e},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),n=r.kdf.execute(n,e.keySize,e.ivSize,t.salt),r.iv=n.iv,p.decrypt.call(this,e,t,n.key,r)}})}(),function(){for(var e=n,t=e.lib.BlockCipher,r=e.algo,i=[],s=[],o=[],a=[],u=[],c=[],l=[],h=[],f=[],d=[],p=[],g=0;256>g;g++)p[g]=128>g?g<<1:g<<1^283;for(var y=0,v=0,g=0;256>g;g++){var b=v^v<<1^v<<2^v<<3^v<<4,b=b>>>8^255&b^99;i[y]=b,s[b]=y;var _=p[y],m=p[_],k=p[m],P=257*p[b]^16843008*b;o[y]=P<<24|P>>>8,a[y]=P<<16|P>>>16,u[y]=P<<8|P>>>24,c[y]=P,P=16843009*k^65537*m^257*_^16843008*y,l[b]=P<<24|P>>>8,h[b]=P<<16|P>>>16,f[b]=P<<8|P>>>24,d[b]=P,y?(y=_^p[p[p[k^_]]],v^=p[p[v]]):y=v=1}var S=[0,1,2,4,8,16,32,64,128,27,54],r=r.AES=t.extend({_doReset:function(){for(var e=this._key,t=e.words,n=e.sigBytes/4,e=4*((this._nRounds=n+6)+1),r=this._keySchedule=[],s=0;s<e;s++)if(s<n)r[s]=t[s];else{var o=r[s-1];s%n?6<n&&4==s%n&&(o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o]):(o=o<<8|o>>>24,o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o],o^=S[s/n|0]<<24),r[s]=r[s-n]^o}for(t=this._invKeySchedule=[],n=0;n<e;n++)s=e-n,o=n%4?r[s]:r[s-4],t[n]=4>n||4>=s?o:l[i[o>>>24]]^h[i[o>>>16&255]]^f[i[o>>>8&255]]^d[i[255&o]]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,o,a,u,c,i)},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,l,h,f,d,s),n=e[t+1],e[t+1]=e[t+3],e[t+3]=n},_doCryptBlock:function(e,t,n,r,i,s,o,a){for(var u=this._nRounds,c=e[t]^n[0],l=e[t+1]^n[1],h=e[t+2]^n[2],f=e[t+3]^n[3],d=4,p=1;p<u;p++)var g=r[c>>>24]^i[l>>>16&255]^s[h>>>8&255]^o[255&f]^n[d++],y=r[l>>>24]^i[h>>>16&255]^s[f>>>8&255]^o[255&c]^n[d++],v=r[h>>>24]^i[f>>>16&255]^s[c>>>8&255]^o[255&l]^n[d++],f=r[f>>>24]^i[c>>>16&255]^s[l>>>8&255]^o[255&h]^n[d++],c=g,l=y,h=v;g=(a[c>>>24]<<24|a[l>>>16&255]<<16|a[h>>>8&255]<<8|a[255&f])^n[d++],y=(a[l>>>24]<<24|a[h>>>16&255]<<16|a[f>>>8&255]<<8|a[255&c])^n[d++],v=(a[h>>>24]<<24|a[f>>>16&255]<<16|a[c>>>8&255]<<8|a[255&l])^n[d++],f=(a[f>>>24]<<24|a[c>>>16&255]<<16|a[l>>>8&255]<<8|a[255&h])^n[d++],e[t]=g,e[t+1]=y,e[t+2]=v,e[t+3]=f},keySize:8});e.AES=t._createHelper(r)}(),n.mode.ECB=function(){var e=n.lib.BlockCipherMode.extend();return e.Encryptor=e.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t)}}),e.Decryptor=e.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t)}}),e}(),e.exports=n},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(9),a=(r(o),n(7)),u=(r(a),n(12)),c=(r(u),n(14)),l=r(c),h=n(17),f=r(h),d=n(18),p=r(d),g=(n(8),n(13)),y=r(g),v=function(){function e(t){var n=t.subscribeEndpoint,r=t.leaveEndpoint,s=t.heartbeatEndpoint,o=t.setStateEndpoint,a=t.timeEndpoint,u=t.config,c=t.crypto,h=t.listenerManager;i(this,e),this._listenerManager=h,this._config=u,this._leaveEndpoint=r,this._heartbeatEndpoint=s,this._setStateEndpoint=o,this._subscribeEndpoint=n,this._crypto=c,this._channels={},this._presenceChannels={},this._channelGroups={},this._presenceChannelGroups={},this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[],this._currentTimetoken=0,this._lastTimetoken=0,this._storedTimetoken=null,this._subscriptionStatusAnnounced=!1,this._isOnline=!0,this._reconnectionManager=new l.default({timeEndpoint:a}),this._dedupingManager=new f.default({config:u})}return s(e,[{key:"adaptStateChange",value:function(e,t){var n=this,r=e.state,i=e.channels,s=void 0===i?[]:i,o=e.channelGroups,a=void 0===o?[]:o;return s.forEach(function(e){e in n._channels&&(n._channels[e].state=r)}),a.forEach(function(e){e in n._channelGroups&&(n._channelGroups[e].state=r)}),this._setStateEndpoint({state:r,channels:s,channelGroups:a},t)}},{key:"adaptSubscribeChange",value:function(e){var t=this,n=e.timetoken,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s,a=e.withPresence,u=void 0!==a&&a;if(!this._config.subscribeKey||""===this._config.subscribeKey)return void(console&&console.log&&console.log("subscribe key missing; aborting subscribe"));n&&(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=n),"0"!==this._currentTimetoken&&(this._storedTimetoken=this._currentTimetoken,this._currentTimetoken=0),i.forEach(function(e){t._channels[e]={state:{}},u&&(t._presenceChannels[e]={}),t._pendingChannelSubscriptions.push(e)}),
o.forEach(function(e){t._channelGroups[e]={state:{}},u&&(t._presenceChannelGroups[e]={}),t._pendingChannelGroupSubscriptions.push(e)}),this._subscriptionStatusAnnounced=!1,this.reconnect()}},{key:"adaptUnsubscribeChange",value:function(e,t){var n=this,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s,a=[],u=[];i.forEach(function(e){e in n._channels&&(delete n._channels[e],a.push(e)),e in n._presenceChannels&&(delete n._presenceChannels[e],a.push(e))}),o.forEach(function(e){e in n._channelGroups&&(delete n._channelGroups[e],u.push(e)),e in n._presenceChannelGroups&&(delete n._channelGroups[e],u.push(e))}),0===a.length&&0===u.length||(!1!==this._config.suppressLeaveEvents||t||this._leaveEndpoint({channels:a,channelGroups:u},function(e){e.affectedChannels=a,e.affectedChannelGroups=u,e.currentTimetoken=n._currentTimetoken,e.lastTimetoken=n._lastTimetoken,n._listenerManager.announceStatus(e)}),0===Object.keys(this._channels).length&&0===Object.keys(this._presenceChannels).length&&0===Object.keys(this._channelGroups).length&&0===Object.keys(this._presenceChannelGroups).length&&(this._lastTimetoken=0,this._currentTimetoken=0,this._storedTimetoken=null,this._region=null,this._reconnectionManager.stopPolling()),this.reconnect())}},{key:"unsubscribeAll",value:function(e){this.adaptUnsubscribeChange({channels:this.getSubscribedChannels(),channelGroups:this.getSubscribedChannelGroups()},e)}},{key:"getSubscribedChannels",value:function(){return Object.keys(this._channels)}},{key:"getSubscribedChannelGroups",value:function(){return Object.keys(this._channelGroups)}},{key:"reconnect",value:function(){this._startSubscribeLoop(),this._registerHeartbeatTimer()}},{key:"disconnect",value:function(){this._stopSubscribeLoop(),this._stopHeartbeatTimer(),this._reconnectionManager.stopPolling()}},{key:"_registerHeartbeatTimer",value:function(){this._stopHeartbeatTimer(),0!==this._config.getHeartbeatInterval()&&(this._performHeartbeatLoop(),this._heartbeatTimer=setInterval(this._performHeartbeatLoop.bind(this),1e3*this._config.getHeartbeatInterval()))}},{key:"_stopHeartbeatTimer",value:function(){this._heartbeatTimer&&(clearInterval(this._heartbeatTimer),this._heartbeatTimer=null)}},{key:"_performHeartbeatLoop",value:function(){var e=this,t=Object.keys(this._channels),n=Object.keys(this._channelGroups),r={};if(0!==t.length||0!==n.length){t.forEach(function(t){var n=e._channels[t].state;Object.keys(n).length&&(r[t]=n)}),n.forEach(function(t){var n=e._channelGroups[t].state;Object.keys(n).length&&(r[t]=n)});var i=function(t){t.error&&e._config.announceFailedHeartbeats&&e._listenerManager.announceStatus(t),t.error&&e._config.autoNetworkDetection&&e._isOnline&&(e._isOnline=!1,e.disconnect(),e._listenerManager.announceNetworkDown(),e.reconnect()),!t.error&&e._config.announceSuccessfulHeartbeats&&e._listenerManager.announceStatus(t)};this._heartbeatEndpoint({channels:t,channelGroups:n,state:r},i.bind(this))}}},{key:"_startSubscribeLoop",value:function(){this._stopSubscribeLoop();var e=[],t=[];if(Object.keys(this._channels).forEach(function(t){return e.push(t)}),Object.keys(this._presenceChannels).forEach(function(t){return e.push(t+"-pnpres")}),Object.keys(this._channelGroups).forEach(function(e){return t.push(e)}),Object.keys(this._presenceChannelGroups).forEach(function(e){return t.push(e+"-pnpres")}),0!==e.length||0!==t.length){var n={channels:e,channelGroups:t,timetoken:this._currentTimetoken,filterExpression:this._config.filterExpression,region:this._region};this._subscribeCall=this._subscribeEndpoint(n,this._processSubscribeResponse.bind(this))}}},{key:"_processSubscribeResponse",value:function(e,t){var n=this;if(e.error)return void(e.category===y.default.PNTimeoutCategory?this._startSubscribeLoop():e.category===y.default.PNNetworkIssuesCategory?(this.disconnect(),e.error&&this._config.autoNetworkDetection&&this._isOnline&&(this._isOnline=!1,this._listenerManager.announceNetworkDown()),this._reconnectionManager.onReconnection(function(){n._config.autoNetworkDetection&&!n._isOnline&&(n._isOnline=!0,n._listenerManager.announceNetworkUp()),n.reconnect(),n._subscriptionStatusAnnounced=!0;var t={category:y.default.PNReconnectedCategory,operation:e.operation,lastTimetoken:n._lastTimetoken,currentTimetoken:n._currentTimetoken};n._listenerManager.announceStatus(t)}),this._reconnectionManager.startPolling(),this._listenerManager.announceStatus(e)):e.category===y.default.PNBadRequestCategory?(this._stopHeartbeatTimer(),this._listenerManager.announceStatus(e)):this._listenerManager.announceStatus(e));if(this._storedTimetoken?(this._currentTimetoken=this._storedTimetoken,this._storedTimetoken=null):(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=t.metadata.timetoken),!this._subscriptionStatusAnnounced){var r={};r.category=y.default.PNConnectedCategory,r.operation=e.operation,r.affectedChannels=this._pendingChannelSubscriptions,r.subscribedChannels=this.getSubscribedChannels(),r.affectedChannelGroups=this._pendingChannelGroupSubscriptions,r.lastTimetoken=this._lastTimetoken,r.currentTimetoken=this._currentTimetoken,this._subscriptionStatusAnnounced=!0,this._listenerManager.announceStatus(r),this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[]}var i=t.messages||[],s=this._config,o=s.requestMessageCountThreshold,a=s.dedupeOnSubscribe;if(o&&i.length>=o){var u={};u.category=y.default.PNRequestMessageCountExceededCategory,u.operation=e.operation,this._listenerManager.announceStatus(u)}i.forEach(function(e){var t=e.channel,r=e.subscriptionMatch,i=e.publishMetaData;if(t===r&&(r=null),a){if(n._dedupingManager.isDuplicate(e))return;n._dedupingManager.addEntry(e)}if(p.default.endsWith(e.channel,"-pnpres")){var s={};s.channel=null,s.subscription=null,s.actualChannel=null!=r?t:null,s.subscribedChannel=null!=r?r:t,t&&(s.channel=t.substring(0,t.lastIndexOf("-pnpres"))),r&&(s.subscription=r.substring(0,r.lastIndexOf("-pnpres"))),s.action=e.payload.action,s.state=e.payload.data,s.timetoken=i.publishTimetoken,s.occupancy=e.payload.occupancy,s.uuid=e.payload.uuid,s.timestamp=e.payload.timestamp,e.payload.join&&(s.join=e.payload.join),e.payload.leave&&(s.leave=e.payload.leave),e.payload.timeout&&(s.timeout=e.payload.timeout),n._listenerManager.announcePresence(s)}else{var o={};o.channel=null,o.subscription=null,o.actualChannel=null!=r?t:null,o.subscribedChannel=null!=r?r:t,o.channel=t,o.subscription=r,o.timetoken=i.publishTimetoken,o.publisher=e.issuingClientId,e.userMetadata&&(o.userMetadata=e.userMetadata),n._config.cipherKey?o.message=n._crypto.decrypt(e.payload):o.message=e.payload,n._listenerManager.announceMessage(o)}}),this._region=t.metadata.region,this._startSubscribeLoop()}},{key:"_stopSubscribeLoop",value:function(){this._subscribeCall&&(this._subscribeCall.abort(),this._subscribeCall=null)}}]),e}();t.default=v,e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=(n(8),n(13)),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=function(){function e(){r(this,e),this._listeners=[]}return i(e,[{key:"addListener",value:function(e){this._listeners.push(e)}},{key:"removeListener",value:function(e){var t=[];this._listeners.forEach(function(n){n!==e&&t.push(n)}),this._listeners=t}},{key:"removeAllListeners",value:function(){this._listeners=[]}},{key:"announcePresence",value:function(e){this._listeners.forEach(function(t){t.presence&&t.presence(e)})}},{key:"announceStatus",value:function(e){this._listeners.forEach(function(t){t.status&&t.status(e)})}},{key:"announceMessage",value:function(e){this._listeners.forEach(function(t){t.message&&t.message(e)})}},{key:"announceNetworkUp",value:function(){var e={};e.category=o.default.PNNetworkUpCategory,this.announceStatus(e)}},{key:"announceNetworkDown",value:function(){var e={};e.category=o.default.PNNetworkDownCategory,this.announceStatus(e)}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNNetworkUpCategory:"PNNetworkUpCategory",PNNetworkDownCategory:"PNNetworkDownCategory",PNNetworkIssuesCategory:"PNNetworkIssuesCategory",PNTimeoutCategory:"PNTimeoutCategory",PNBadRequestCategory:"PNBadRequestCategory",PNAccessDeniedCategory:"PNAccessDeniedCategory",PNUnknownCategory:"PNUnknownCategory",PNReconnectedCategory:"PNReconnectedCategory",PNConnectedCategory:"PNConnectedCategory",PNRequestMessageCountExceededCategory:"PNRequestMessageCountExceededCategory"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(15),o=(function(e){e&&e.__esModule}(s),n(8),function(){function e(t){var n=t.timeEndpoint;r(this,e),this._timeEndpoint=n}return i(e,[{key:"onReconnection",value:function(e){this._reconnectionCallback=e}},{key:"startPolling",value:function(){this._timeTimer=setInterval(this._performTimeLoop.bind(this),3e3)}},{key:"stopPolling",value:function(){clearInterval(this._timeTimer)}},{key:"_performTimeLoop",value:function(){var e=this;this._timeEndpoint(function(t){t.error||(clearInterval(e._timeTimer),e._reconnectionCallback())})}}]),e}());t.default=o,e.exports=t.default},function(e,t,n){"use strict";function r(){return h.default.PNTimeOperation}function i(){return"/time/0"}function s(e){return e.config.getTransactionTimeout()}function o(){return{}}function a(){return!1}function u(e,t){return{timetoken:t[0]}}function c(){}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.getURL=i,t.getRequestTimeout=s,t.prepareParams=o,t.isAuthSupported=a,t.handleResponse=u,t.validateParams=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNTimeOperation:"PNTimeOperation",PNHistoryOperation:"PNHistoryOperation",PNFetchMessagesOperation:"PNFetchMessagesOperation",PNSubscribeOperation:"PNSubscribeOperation",PNUnsubscribeOperation:"PNUnsubscribeOperation",PNPublishOperation:"PNPublishOperation",PNPushNotificationEnabledChannelsOperation:"PNPushNotificationEnabledChannelsOperation",PNRemoveAllPushNotificationsOperation:"PNRemoveAllPushNotificationsOperation",PNWhereNowOperation:"PNWhereNowOperation",PNSetStateOperation:"PNSetStateOperation",PNHereNowOperation:"PNHereNowOperation",PNGetStateOperation:"PNGetStateOperation",PNHeartbeatOperation:"PNHeartbeatOperation",PNChannelGroupsOperation:"PNChannelGroupsOperation",PNRemoveGroupOperation:"PNRemoveGroupOperation",PNChannelsForGroupOperation:"PNChannelsForGroupOperation",PNAddChannelsToGroupOperation:"PNAddChannelsToGroupOperation",PNRemoveChannelsFromGroupOperation:"PNRemoveChannelsFromGroupOperation",PNAccessManagerGrant:"PNAccessManagerGrant",PNAccessManagerAudit:"PNAccessManagerAudit"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(7),o=(function(e){e&&e.__esModule}(s),function(e){var t=0;if(0===e.length)return t;for(var n=0;n<e.length;n+=1){t=(t<<5)-t+e.charCodeAt(n),t&=t}return t}),a=function(){function e(t){var n=t.config;r(this,e),this.hashHistory=[],this._config=n}return i(e,[{key:"getKey",value:function(e){var t=o(JSON.stringify(e.payload)).toString();return e.publishMetaData.publishTimetoken+"-"+t}},{key:"isDuplicate",value:function(e){return this.hashHistory.includes(this.getKey(e))}},{key:"addEntry",value:function(e){this.hashHistory.length>=this._config.maximumCacheSize&&this.hashHistory.shift(),this.hashHistory.push(this.getKey(e))}},{key:"clearHistory",value:function(){this.hashHistory=[]}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";function n(e){var t=[];return Object.keys(e).forEach(function(e){return t.push(e)}),t}function r(e){return encodeURIComponent(e).replace(/[!~*'()]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function i(e){return n(e).sort()}function s(e){return i(e).map(function(t){return t+"="+r(e[t])}).join("&")}function o(e,t){return-1!==e.indexOf(t,this.length-t.length)}function a(){var e=void 0,t=void 0;return{promise:new Promise(function(n,r){e=n,t=r}),reject:t,fulfill:e}}e.exports={signPamFromParams:s,endsWith:o,createPromise:a,encodeString:r}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return e.type=t,e.error=!0,e}function u(e){return a({message:e},"validationError")}function c(e,t,n){return e.usePost&&e.usePost(t,n)?e.postURL(t,n):e.getURL(t,n)}function l(e){var t="PubNub-JS-"+e.sdkFamily;return e.partnerId&&(t+="-"+e.partnerId),t+="/"+e.getVersion()}function h(e,t,n){var r=e.config,i=e.crypto;n.timestamp=Math.floor((new Date).getTime()/1e3);var s=r.subscribeKey+"\n"+r.publishKey+"\n"+t+"\n";s+=g.default.signPamFromParams(n);var o=i.HMACSHA256(s);o=o.replace(/\+/g,"-"),o=o.replace(/\//g,"_"),n.signature=o}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=e.networking,r=e.config,i=null,s=null,o={};t.getOperation()===b.default.PNTimeOperation||t.getOperation()===b.default.PNChannelGroupsOperation?i=arguments.length<=2?void 0:arguments[2]:(o=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]),"undefined"==typeof Promise||i||(s=g.default.createPromise());var a=t.validateParams(e,o);if(!a){var f=t.prepareParams(e,o),p=c(t,e,o),y=void 0,v={url:p,operation:t.getOperation(),timeout:t.getRequestTimeout(e)};f.uuid=r.UUID,f.pnsdk=l(r),r.useInstanceId&&(f.instanceid=r.instanceId),r.useRequestId&&(f.requestid=d.default.v4()),t.isAuthSupported()&&r.getAuthKey()&&(f.auth=r.getAuthKey()),r.secretKey&&h(e,p,f);var m=function(n,r){if(n.error)return void(i?i(n):s&&s.reject(new _("PubNub call failed, check status for details",n)));var a=t.handleResponse(e,r,o);i?i(n,a):s&&s.fulfill(a)};if(t.usePost&&t.usePost(e,o)){var k=t.postPayload(e,o);y=n.POST(f,k,v,m)}else y=n.GET(f,v,m);return t.getOperation()===b.default.PNSubscribeOperation?y:s?s.promise:void 0}return i?i(u(a)):s?(s.reject(new _("Validation failed, check status for details",u(a))),s.promise):void 0};var f=n(2),d=r(f),p=(n(8),n(18)),g=r(p),y=n(7),v=(r(y),n(16)),b=r(v),_=function(e){function t(e,n){i(this,t);var r=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.name=r.constructor.name,r.status=n,r.message=e,r}return o(t,e),t}(Error);e.exports=t.default},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNAddChannelsToGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{add:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveChannelsFromGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{remove:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)+"/remove"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(){return{}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNChannelGroupsOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{groups:t.payload.groups}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNChannelsForGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(){return{}}function l(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,add:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,remove:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(e,t){return{channels:t}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNRemoveAllPushNotificationsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n+"/remove"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNUnsubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/leave"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNWhereNowOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r;return"/v2/presence/sub-key/"+n.subscribeKey+"/uuid/"+i}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return t.payload?{channels:t.payload.channels}:{channels:[]}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHeartbeatOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/heartbeat"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.state,s=void 0===i?{}:i,o=e.config,a={};return r.length>0&&(a["channel-group"]=r.join(",")),a.state=JSON.stringify(s),a.heartbeat=o.getPresenceTimeout(),a}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNGetStateOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r,s=t.channels,o=void 0===s?[]:s,a=o.length>0?o.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(a)+"/uuid/"+i}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a={};return 1===i.length&&0===o.length?a[i[0]]=t.payload:a=t.payload,{channels:a}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSetStateOperation}function s(e,t){var n=e.config,r=t.state,i=t.channels,s=void 0===i?[]:i,o=t.channelGroups,a=void 0===o?[]:o;return r?n.subscribeKey?0===s.length&&0===a.length?"Please provide a list of channels and/or channel-groups":void 0:"Missing Subscribe Key":"Missing State"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/uuid/"+n.UUID+"/data"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.state,r=t.channelGroups,i=void 0===r?[]:r,s={};return s.state=JSON.stringify(n),i.length>0&&(s["channel-group"]=i.join(",")),s}function l(e,t){return{state:t.payload}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHereNowOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=t.channelGroups,o=void 0===s?[]:s,a="/v2/presence/sub-key/"+n.subscribeKey;if(i.length>0||o.length>0){var u=i.length>0?i.join(","):",";a+="/channel/"+p.default.encodeString(u)}return a}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.includeUUIDs,s=void 0===i||i,o=t.includeState,a=void 0!==o&&o,u={};return s||(u.disable_uuids=1),a&&(u.state=1),r.length>0&&(u["channel-group"]=r.join(",")),u}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a=n.includeUUIDs,u=void 0===a||a,c=n.includeState,l=void 0!==c&&c;return i.length>1||o.length>0||0===o.length&&0===i.length?function(){var e={};return e.totalChannels=t.payload.total_channels,e.totalOccupancy=t.payload.total_occupancy,e.channels={},Object.keys(t.payload.channels).forEach(function(n){var r=t.payload.channels[n],i=[];return e.channels[n]={occupants:i,name:n,occupancy:r.occupancy},u&&r.uuids.forEach(function(e){l?i.push({state:e.state,uuid:e.uuid}):i.push({state:null,uuid:e})}),e}),e}():function(){var e={},n=[];return e.totalChannels=1,e.totalOccupancy=t.occupancy,e.channels={},e.channels[i[0]]={occupants:n,name:i[0],occupancy:t.occupancy},u&&t.uuids&&t.uuids.forEach(function(e){l?n.push({state:e.state,uuid:e.uuid}):n.push({state:null,uuid:e})}),e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerAudit}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v2/auth/audit/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channel,r=t.channelGroup,i=t.authKeys,s=void 0===i?[]:i,o={};return n&&(o.channel=n),r&&(o["channel-group"]=r),s.length>0&&(o.auth=s.join(",")),o}function c(e,t){return t.payload}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerGrant}function i(e){var t=e.config;return t.subscribeKey?t.publishKey?t.secretKey?void 0:"Missing Secret Key":"Missing Publish Key":"Missing Subscribe Key"}function s(e){return"/v2/auth/grant/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.channelGroups,s=void 0===i?[]:i,o=t.ttl,a=t.read,u=void 0!==a&&a,c=t.write,l=void 0!==c&&c,h=t.manage,f=void 0!==h&&h,d=t.authKeys,p=void 0===d?[]:d,g={};return g.r=u?"1":"0",g.w=l?"1":"0",g.m=f?"1":"0",r.length>0&&(g.channel=r.join(",")),s.length>0&&(g["channel-group"]=s.join(",")),p.length>0&&(g.auth=p.join(",")),(o||0===o)&&(g.ttl=o),g}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i}function s(){return v.default.PNPublishOperation}function o(e,t){var n=e.config,r=t.message;return t.channel?r?n.subscribeKey?void 0:"Missing Subscribe Key":"Missing Message":"Missing Channel"}function a(e,t){var n=t.sendByPost;return void 0!==n&&n}function u(e,t){var n=e.config,r=t.channel,s=t.message,o=i(e,s);return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0/"+_.default.encodeString(o)}function c(e,t){var n=e.config,r=t.channel;return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0"}
function l(e){return e.config.getTransactionTimeout()}function h(){return!0}function f(e,t){return i(e,t.message)}function d(e,t){var n=t.meta,r=t.replicate,i=void 0===r||r,s=t.storeInHistory,o=t.ttl,a={};return null!=s&&(a.store=s?"1":"0"),o&&(a.ttl=o),!1===i&&(a.norep="true"),n&&"object"===(void 0===n?"undefined":g(n))&&(a.meta=JSON.stringify(n)),a}function p(e,t){return{timetoken:t[2]}}Object.defineProperty(t,"__esModule",{value:!0});var g="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.getOperation=s,t.validateParams=o,t.usePost=a,t.getURL=u,t.postURL=c,t.getRequestTimeout=l,t.isAuthSupported=h,t.postPayload=f,t.prepareParams=d,t.handleResponse=p;var y=(n(8),n(16)),v=r(y),b=n(18),_=r(b)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return d.default.PNHistoryOperation}function o(e,t){var n=t.channel,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channel"}function a(e,t){var n=t.channel;return"/v2/history/sub-key/"+e.config.subscribeKey+"/channel/"+g.default.encodeString(n)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.reverse,s=t.count,o=void 0===s?100:s,a=t.stringifiedTimeToken,u=void 0!==a&&a,c={include_token:"true"};return c.count=o,n&&(c.start=n),r&&(c.end=r),u&&(c.string_message_token="true"),null!=i&&(c.reverse=i.toString()),c}function h(e,t){var n={messages:[],startTimeToken:t[1],endTimeToken:t[2]};return t[0].forEach(function(t){var r={timetoken:t.timetoken,entry:i(e,t.message)};n.messages.push(r)}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),n(16)),d=r(f),p=n(18),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return d.default.PNFetchMessagesOperation}function o(e,t){var n=t.channels,r=e.config;return n&&0!==n.length?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channels"}function a(e,t){var n=t.channels,r=void 0===n?[]:n,i=e.config,s=r.length>0?r.join(","):",";return"/v3/history/sub-key/"+i.subscribeKey+"/channel/"+g.default.encodeString(s)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.count,s={};return i&&(s.max=i),n&&(s.start=n),r&&(s.end=r),s}function h(e,t){var n={channels:{}};return Object.keys(t.channels||{}).forEach(function(r){n.channels[r]=[],(t.channels[r]||[]).forEach(function(t){var s={};s.channel=r,s.subscription=null,s.timetoken=t.timetoken,s.message=i(e,t.message),n.channels[r].push(s)})}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),n(16)),d=r(f),p=n(18),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/subscribe/"+n.subscribeKey+"/"+p.default.encodeString(s)+"/0"}function a(e){return e.config.getSubscribeTimeout()}function u(){return!0}function c(e,t){var n=e.config,r=t.channelGroups,i=void 0===r?[]:r,s=t.timetoken,o=t.filterExpression,a=t.region,u={heartbeat:n.getPresenceTimeout()};return i.length>0&&(u["channel-group"]=i.join(",")),o&&o.length>0&&(u["filter-expr"]=o),s&&(u.tt=s),a&&(u.tr=a),u}function l(e,t){var n=[];t.m.forEach(function(e){var t={publishTimetoken:e.p.t,region:e.p.r},r={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,userMetadata:e.u,publishMetaData:t};n.push(r)});var r={timetoken:t.t.t,region:t.t.r};return{messages:n,metadata:r}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(18),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(7),a=(r(o),n(13)),u=r(a),c=(n(8),function(){function e(t){var n=this;i(this,e),this._modules={},Object.keys(t).forEach(function(e){n._modules[e]=t[e].bind(n)})}return s(e,[{key:"init",value:function(e){this._config=e,this._maxSubDomain=20,this._currentSubDomain=Math.floor(Math.random()*this._maxSubDomain),this._providedFQDN=(this._config.secure?"https://":"http://")+this._config.origin,this._coreParams={},this.shiftStandardOrigin()}},{key:"nextOrigin",value:function(){if(-1===this._providedFQDN.indexOf("pubsub."))return this._providedFQDN;var e=void 0;return this._currentSubDomain=this._currentSubDomain+1,this._currentSubDomain>=this._maxSubDomain&&(this._currentSubDomain=1),e=this._currentSubDomain.toString(),this._providedFQDN.replace("pubsub","ps"+e)}},{key:"shiftStandardOrigin",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this._standardOrigin=this.nextOrigin(e),this._standardOrigin}},{key:"getStandardOrigin",value:function(){return this._standardOrigin}},{key:"POST",value:function(e,t,n,r){return this._modules.post(e,t,n,r)}},{key:"GET",value:function(e,t,n){return this._modules.get(e,t,n)}},{key:"_detectErrorCategory",value:function(e){if("ENOTFOUND"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNREFUSED"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNRESET"===e.code)return u.default.PNNetworkIssuesCategory;if("EAI_AGAIN"===e.code)return u.default.PNNetworkIssuesCategory;if(0===e.status||e.hasOwnProperty("status")&&void 0===e.status)return u.default.PNNetworkIssuesCategory;if(e.timeout)return u.default.PNTimeoutCategory;if(e.response){if(e.response.badRequest)return u.default.PNBadRequestCategory;if(e.response.forbidden)return u.default.PNAccessDeniedCategory}return u.default.PNUnknownCategory}}]),e}());t.default=c,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={get:function(e){try{return localStorage.getItem(e)}catch(e){return null}},set:function(e,t){try{return localStorage.setItem(e,t)}catch(e){return null}}},e.exports=t.default},function(e,t,n){"use strict";function r(e){var t=(new Date).getTime(),n=(new Date).toISOString(),r=function(){return console&&console.log?console:window&&window.console&&window.console.log?window.console:console}();r.log("<<<<<"),r.log("["+n+"]","\n",e.url,"\n",e.qs),r.log("-----"),e.on("response",function(n){var i=(new Date).getTime(),s=i-t,o=(new Date).toISOString();r.log(">>>>>>"),r.log("["+o+" / "+s+"]","\n",e.url,"\n",e.qs,"\n",n.text),r.log("-----")})}function i(e,t,n){var i=this;return this._config.logVerbosity&&(e=e.use(r)),this._config.proxy&&this._modules.proxy&&(e=this._modules.proxy.call(this,e)),this._config.keepAlive&&this._modules.keepAlive&&(e=this._modules.keepAlive(e)),e.timeout(t.timeout).end(function(e,r){var s={};if(s.error=null!==e,s.operation=t.operation,r&&r.status&&(s.statusCode=r.status),e)return s.errorData=e,s.category=i._detectErrorCategory(e),n(s,null);var o=JSON.parse(r.text);return o.error&&1===o.error&&o.status&&o.message&&o.service?(s.errorData=o,s.statusCode=o.status,s.error=!0,s.category=i._detectErrorCategory(s),n(s,null)):n(s,o)})}function s(e,t,n){var r=u.default.get(this.getStandardOrigin()+t.url).query(e);return i.call(this,r,t,n)}function o(e,t,n,r){var s=u.default.post(this.getStandardOrigin()+n.url).query(e).send(t);return i.call(this,s,n,r)}Object.defineProperty(t,"__esModule",{value:!0}),t.get=s,t.post=o;var a=n(44),u=function(e){return e&&e.__esModule?e:{default:e}}(a);n(8)},function(e,t,n){function r(){}function i(e){if(!v(e))return e;var t=[];for(var n in e)s(t,n,e[n]);return t.join("&")}function s(e,t,n){if(null!=n)if(Array.isArray(n))n.forEach(function(n){s(e,t,n)});else if(v(n))for(var r in n)s(e,t+"["+r+"]",n[r]);else e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));else null===n&&e.push(encodeURIComponent(t))}function o(e){for(var t,n,r={},i=e.split("&"),s=0,o=i.length;s<o;++s)t=i[s],n=t.indexOf("="),-1==n?r[decodeURIComponent(t)]="":r[decodeURIComponent(t.slice(0,n))]=decodeURIComponent(t.slice(n+1));return r}function a(e){var t,n,r,i,s=e.split(/\r?\n/),o={};s.pop();for(var a=0,u=s.length;a<u;++a)n=s[a],t=n.indexOf(":"),r=n.slice(0,t).toLowerCase(),i=_(n.slice(t+1)),o[r]=i;return o}function u(e){return/[\/+]json\b/.test(e)}function c(e){return e.split(/ *; */).shift()}function l(e){return e.split(/ *; */).reduce(function(e,t){var n=t.split(/ *= */),r=n.shift(),i=n.shift();return r&&i&&(e[r]=i),e},{})}function h(e,t){t=t||{},this.req=e,this.xhr=this.req.xhr,this.text="HEAD"!=this.req.method&&(""===this.xhr.responseType||"text"===this.xhr.responseType)||void 0===this.xhr.responseType?this.xhr.responseText:null,this.statusText=this.req.xhr.statusText,this._setStatusProperties(this.xhr.status),this.header=this.headers=a(this.xhr.getAllResponseHeaders()),this.header["content-type"]=this.xhr.getResponseHeader("content-type"),this._setHeaderProperties(this.header),this.body="HEAD"!=this.req.method?this._parseBody(this.text?this.text:this.xhr.response):null}function f(e,t){var n=this;this._query=this._query||[],this.method=e,this.url=t,this.header={},this._header={},this.on("end",function(){var e=null,t=null;try{t=new h(n)}catch(t){return e=new Error("Parser is unable to parse the response"),e.parse=!0,e.original=t,e.rawResponse=n.xhr&&n.xhr.responseText?n.xhr.responseText:null,e.statusCode=n.xhr&&n.xhr.status?n.xhr.status:null,n.callback(e)}n.emit("response",t);var r;try{(t.status<200||t.status>=300)&&(r=new Error(t.statusText||"Unsuccessful HTTP response"),r.original=e,r.response=t,r.status=t.status)}catch(e){r=e}r?n.callback(r,t):n.callback(null,t)})}function d(e,t){var n=b("DELETE",e);return t&&n.end(t),n}var p;"undefined"!=typeof window?p=window:"undefined"!=typeof self?p=self:(console.warn("Using browser-only version of superagent in non-browser environment"),p=this);var g=n(45),y=n(46),v=n(47),b=e.exports=n(48).bind(null,f);b.getXHR=function(){if(!(!p.XMLHttpRequest||p.location&&"file:"==p.location.protocol&&p.ActiveXObject))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(e){}throw Error("Browser-only verison of superagent could not find XHR")};var _="".trim?function(e){return e.trim()}:function(e){return e.replace(/(^\s*|\s*$)/g,"")};b.serializeObject=i,b.parseString=o,b.types={html:"text/html",json:"application/json",xml:"application/xml",urlencoded:"application/x-www-form-urlencoded",form:"application/x-www-form-urlencoded","form-data":"application/x-www-form-urlencoded"},b.serialize={"application/x-www-form-urlencoded":i,"application/json":JSON.stringify},b.parse={"application/x-www-form-urlencoded":o,"application/json":JSON.parse},h.prototype.get=function(e){return this.header[e.toLowerCase()]},h.prototype._setHeaderProperties=function(e){var t=this.header["content-type"]||"";this.type=c(t);var n=l(t);for(var r in n)this[r]=n[r]},h.prototype._parseBody=function(e){var t=b.parse[this.type];return!t&&u(this.type)&&(t=b.parse["application/json"]),t&&e&&(e.length||e instanceof Object)?t(e):null},h.prototype._setStatusProperties=function(e){1223===e&&(e=204);var t=e/100|0;this.status=this.statusCode=e,this.statusType=t,this.info=1==t,this.ok=2==t,this.clientError=4==t,this.serverError=5==t,this.error=(4==t||5==t)&&this.toError(),this.accepted=202==e,this.noContent=204==e,this.badRequest=400==e,this.unauthorized=401==e,this.notAcceptable=406==e,this.notFound=404==e,this.forbidden=403==e},h.prototype.toError=function(){var e=this.req,t=e.method,n=e.url,r="cannot "+t+" "+n+" ("+this.status+")",i=new Error(r);return i.status=this.status,i.method=t,i.url=n,i},b.Response=h,g(f.prototype);for(var m in y)f.prototype[m]=y[m];f.prototype.type=function(e){return this.set("Content-Type",b.types[e]||e),this},f.prototype.responseType=function(e){return this._responseType=e,this},f.prototype.accept=function(e){return this.set("Accept",b.types[e]||e),this},f.prototype.auth=function(e,t,n){switch(n||(n={type:"basic"}),n.type){case"basic":var r=btoa(e+":"+t);this.set("Authorization","Basic "+r);break;case"auto":this.username=e,this.password=t}return this},f.prototype.query=function(e){return"string"!=typeof e&&(e=i(e)),e&&this._query.push(e),this},f.prototype.attach=function(e,t,n){return this._getFormData().append(e,t,n||t.name),this},f.prototype._getFormData=function(){return this._formData||(this._formData=new p.FormData),this._formData},f.prototype.callback=function(e,t){var n=this._callback;this.clearTimeout(),n(e,t)},f.prototype.crossDomainError=function(){var e=new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");e.crossDomain=!0,e.status=this.status,e.method=this.method,e.url=this.url,this.callback(e)},f.prototype._timeoutError=function(){var e=this._timeout,t=new Error("timeout of "+e+"ms exceeded");t.timeout=e,this.callback(t)},f.prototype._appendQueryString=function(){var e=this._query.join("&");e&&(this.url+=~this.url.indexOf("?")?"&"+e:"?"+e)},f.prototype.end=function(e){var t=this,n=this.xhr=b.getXHR(),i=this._timeout,s=this._formData||this._data;this._callback=e||r,n.onreadystatechange=function(){if(4==n.readyState){var e;try{e=n.status}catch(t){e=0}if(0==e){if(t.timedout)return t._timeoutError();if(t._aborted)return;return t.crossDomainError()}t.emit("end")}};var o=function(e,n){n.total>0&&(n.percent=n.loaded/n.total*100),n.direction=e,t.emit("progress",n)};if(this.hasListeners("progress"))try{n.onprogress=o.bind(null,"download"),n.upload&&(n.upload.onprogress=o.bind(null,"upload"))}catch(e){}if(i&&!this._timer&&(this._timer=setTimeout(function(){t.timedout=!0,t.abort()},i)),this._appendQueryString(),this.username&&this.password?n.open(this.method,this.url,!0,this.username,this.password):n.open(this.method,this.url,!0),this._withCredentials&&(n.withCredentials=!0),"GET"!=this.method&&"HEAD"!=this.method&&"string"!=typeof s&&!this._isHost(s)){var a=this._header["content-type"],c=this._serializer||b.serialize[a?a.split(";")[0]:""];!c&&u(a)&&(c=b.serialize["application/json"]),c&&(s=c(s))}for(var l in this.header)null!=this.header[l]&&n.setRequestHeader(l,this.header[l]);return this._responseType&&(n.responseType=this._responseType),this.emit("request",this),n.send(void 0!==s?s:null),this},b.Request=f,b.get=function(e,t,n){var r=b("GET",e);return"function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},b.head=function(e,t,n){var r=b("HEAD",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.options=function(e,t,n){var r=b("OPTIONS",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.del=d,b.delete=d,b.patch=function(e,t,n){var r=b("PATCH",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.post=function(e,t,n){var r=b("POST",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.put=function(e,t,n){var r=b("PUT",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}},function(e,t,n){function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+e]=this._callbacks["$"+e]||[]).push(t),this},r.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var n=this._callbacks["$"+e];if(!n)return this;if(1==arguments.length)return delete this._callbacks["$"+e],this;for(var r,i=0;i<n.length;i++)if((r=n[i])===t||r.fn===t){n.splice(i,1);break}return this},r.prototype.emit=function(e){this._callbacks=this._callbacks||{};var t=[].slice.call(arguments,1),n=this._callbacks["$"+e];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},r.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks["$"+e]||[]},r.prototype.hasListeners=function(e){return!!this.listeners(e).length}},function(e,t,n){var r=n(47);t.clearTimeout=function(){return this._timeout=0,clearTimeout(this._timer),this},t.parse=function(e){return this._parser=e,this},t.serialize=function(e){return this._serializer=e,this},t.timeout=function(e){return this._timeout=e,this},t.then=function(e,t){if(!this._fullfilledPromise){var n=this;this._fullfilledPromise=new Promise(function(e,t){n.end(function(n,r){n?t(n):e(r)})})}return this._fullfilledPromise.then(e,t)},t.catch=function(e){return this.then(void 0,e)},t.use=function(e){return e(this),this},t.get=function(e){return this._header[e.toLowerCase()]},t.getHeader=t.get,t.set=function(e,t){if(r(e)){for(var n in e)this.set(n,e[n]);return this}return this._header[e.toLowerCase()]=t,this.header[e]=t,this},t.unset=function(e){return delete this._header[e.toLowerCase()],delete this.header[e],this},t.field=function(e,t){if(null===e||void 0===e)throw new Error(".field(name, val) name can not be empty");if(r(e)){for(var n in e)this.field(n,e[n]);return this}if(null===t||void 0===t)throw new Error(".field(name, val) val can not be empty");return this._getFormData().append(e,t),this},t.abort=function(){return this._aborted?this:(this._aborted=!0,this.xhr&&this.xhr.abort(),this.req&&this.req.abort(),this.clearTimeout(),this.emit("abort"),this)},t.withCredentials=function(){return this._withCredentials=!0,this},t.redirects=function(e){return this._maxRedirects=e,this},t.toJSON=function(){return{method:this.method,url:this.url,data:this._data,headers:this._header}},t._isHost=function(e){switch({}.toString.call(e)){case"[object File]":case"[object Blob]":case"[object FormData]":return!0;default:return!1}},t.send=function(e){var t=r(e),n=this._header["content-type"];if(t&&r(this._data))for(var i in e)this._data[i]=e[i];else"string"==typeof e?(n||this.type("form"),n=this._header["content-type"],this._data="application/x-www-form-urlencoded"==n?this._data?this._data+"&"+e:e:(this._data||"")+e):this._data=e;return!t||this._isHost(e)?this:(n||this.type("json"),this)}},function(e,t){function n(e){return null!==e&&"object"==typeof e}e.exports=n},function(e,t){function n(e,t,n){return"function"==typeof n?new e("GET",t).end(n):2==arguments.length?new e("GET",t):new e(t,n)}e.exports=n}])});
},{}],41:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var PubNub = require('pubnub');

// allows asynchronous execution flow.
var waterfall = require('async/waterfall');

// required to make AJAX calls for auth
var axios = require('axios');

/**
Global object used to create an instance of {@link ChatEngine}.

@alias ChatEngineCore
@param pnConfig {Object} ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See the getting started tutorial and [the PubNub docs](https://www.pubnub.com/docs/java-se-java/api-reference-configuration).
@param ceConfig {Object} A list of chat engine specific config options.
@param [ceConfig.globalChannel=chat-engine] {String} The root channel. See {@link ChatEngine.global}
@param [ceConfig.authUrl] {String} The root URL used to manage permissions for private channels. Omitting this forces insecure mode.
@param [ceConfig.throwErrors=true] {Boolean} Throws errors in JS console.
@param [ceConfig.insecure=true] {Boolean} Force into insecure mode. Will ignore authUrl and all Chats will be public.
@return {ChatEngine} Returns an instance of {@link ChatEngine}
@example
ChatEngine = ChatEngineCore.create({
    publishKey: 'demo',
    subscribeKey: 'demo'
}, {
    authUrl: 'http://localhost/auth',
    globalChannel: 'chat-engine-global-channel'
});
*/
var create = function create(pnConfig) {
    var ceConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    var ChatEngine = false;

    if (ceConfig.globalChannel) {
        ceConfig.globalChannel = ceConfig.globalChannel.toString();
    } else {
        ceConfig.globalChannel = 'chat-engine';
    }

    if (typeof ceConfig.throwErrors == "undefined") {
        ceConfig.throwErrors = true;
    }

    ceConfig.insecure = ceConfig.insecure || false;
    if (!ceConfig.authUrl) {
        console.info('ChatEngine is running in insecure mode. Supply a authUrl to run in secure mode.');
        ceConfig.insecure = true;
    }

    var throwError = function throwError(self, cb, key, ceError) {
        var payload = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


        if (ceConfig.throwErrors) {
            // throw ceError;
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);
    };

    /**
    * The {@link ChatEngine} object is a RootEmitter. Configures an event emitter that other ChatEngine objects inherit. Adds shortcut methods for
    * ```this.on()```, ```this.emit()```, etc.
    */

    var RootEmitter = function RootEmitter() {
        _classCallCheck(this, RootEmitter);

        /**
        * @private
        */
        this.events = {};

        /**
        Create a new EventEmitter2 object for this class.
         @private
        */
        this.emitter = new EventEmitter2({
            wildcard: true,
            newListener: true,
            maxListeners: 50,
            verboseMemoryLeak: true
        });

        // we bind to make sure wildcards work
        // https://github.com/asyncly/EventEmitter2/issues/186

        /**
        Private emit method that broadcasts the event to listeners on this page.
         @private
        @param {String} event The event name
        @param {Object} the event payload
        */
        this._emit = this.emitter.emit.bind(this.emitter);

        /**
        Listen for a specific event and fire a callback when it's emitted. This is reserved in case ```this.on``` is overwritten.
         @private
        @param {String} event The event name
        @param {Function} callback The function to run when the event is emitted
        */

        this._on = this.emitter.on.bind(this.emitter);

        /**
        * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
        * @method
        * @param {String} event The event name
        * @param {Function} cb The function to run when the event is emitted
        * @example
        *
        * // Get notified whenever someone joins the room
        * object.on('event', (payload) => {
        *     console.log('event was fired').
        * })
        *
        * // Get notified of event.a and event.b
        * object.on('event.*', (payload) => {
        *     console.log('event.a or event.b was fired').;
        * })
        */
        this.on = this.emitter.on.bind(this.emitter);

        /**
        * Stop a callback from listening to an event.
        * @method
        * @param {String} event The event name
        * @example
        * let callback = function(payload;) {
        *    console.log('something happend!');
        * };
        * object.on('event', callback);
        * // ...
        * object.off('event', callback);
        */
        this.off = this.emitter.off.bind(this.emitter);

        /**
        * Listen for any event on this object and fire a callback when it's emitted
        * @method
        * @param {Function} callback The function to run when any event is emitted. First parameter is the event name and second is the payload.
        * @example
        * object.onAny((event, payload) => {
        *     console.log('All events trigger this.');
        * });
        */
        this.onAny = this.emitter.onAny.bind(this.emitter);

        /**
        * Listen for an event and only fire the callback a single time
        * @method
        * @param {String} event The event name
        * @param {Function} callback The function to run once
        * @example
        * object.once('message', => (event, payload) {
        *     console.log('This is only fired once!');
        * });
        */
        this.once = this.emitter.once.bind(this.emitter);
    };

    /**
    Represents an event that may be emitted or subscribed to.
    */


    var Event = function Event(chat, event) {
        var _this = this;

        _classCallCheck(this, Event);

        /**
        Events are always a property of a {@link Chat}. Responsible for
        listening to specific events and firing events when they occur.
        ;
        @readonly
        @type String
        @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
        */
        this.channel = chat.channel;

        /**
        Publishes the event over the PubNub network to the {@link Event} channel
         @private
        @param {Object} data The event payload object
        */
        this.publish = function (m) {

            m.event = event;

            ChatEngine.pubnub.publish({
                message: m,
                channel: _this.channel
            }, function (status, response) {

                if (status.statusCode == 200) {
                    chat.trigger('$.publish.success');
                } else {

                    /**
                    * There was a problem publishing over the PubNub network.
                    * @event Chat#$"."error"."publish
                    */
                    throwError(chat, 'trigger', 'publish', new Error('There was a problem publishing over the PubNub network.'), {
                        errorText: status.errorData.response.text,
                        error: status.errorData
                    });
                }
            });
        };

        /**
        Forwards events to the Chat that registered the event {@link Chat}
         @private
        @param {Object} data The event payload object
        */
        this.onMessage = function (m) {

            if (_this.channel == m.channel && m.message.event == event) {
                chat.trigger(m.message.event, m.message);
            }
        };

        // call onMessage when PubNub receives an event
        ChatEngine.pubnub.addListener({
            message: this.onMessage
        });
    };

    /**
    An ChatEngine generic emitter that supports plugins and forwards
    events to the root emitter.
    @extends RootEmitter
    */


    var Emitter = function (_RootEmitter) {
        _inherits(Emitter, _RootEmitter);

        function Emitter() {
            _classCallCheck(this, Emitter);

            /**
            Emit events locally.
             @private
            @param {String} event The event payload object
            */
            var _this2 = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

            _this2._emit = function (event, data) {

                // all events are forwarded to ChatEngine object
                // so you can globally bind to events with ChatEngine.on()
                ChatEngine._emit(event, data);

                // emit the event from the object that created it
                _this2.emitter.emit(event, data);
            };

            /**
            * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
            * @method
            * @param {String} event The event name
            * @param {Function} cb The function to run when the event is emitted
            * @example
            *
            * // Get notified whenever someone joins the room
            * object.on('event', (payload) => {
            *     console.log('event was fired').
            * })
            *
            * // Get notified of event.a and event.b
            * object.on('event.*', (payload) => {
            *     console.log('event.a or event.b was fired').;
            * })
            */
            _this2.on = function (event, cb) {

                // keep track of all events on this emitter
                _this2.events[event] = _this2.events[event] || new Event(_this2, event);

                // call the private _on property
                _this2._on(event, cb);
            };

            /**
            Stores a list of plugins bound to this object
            @private
            */
            _this2.plugins = [];

            /**
            Binds a plugin to this object
            @param {Object} module The plugin module
            */
            _this2.plugin = function (module) {

                // add this plugin to a list of plugins for this object
                this.plugins.push(module);

                // returns the name of this class
                var className = this.constructor.name;

                // see if there are plugins to attach to this class
                if (module.extends && module.extends[className]) {

                    // attach the plugins to this class
                    // under their namespace
                    ChatEngine.addChild(this, module.namespace, new module.extends[className]());

                    this[module.namespace].ChatEngine = ChatEngine;

                    // if the plugin has a special construct function
                    // run it
                    if (this[module.namespace].construct) {
                        this[module.namespace].construct();
                    }
                }
            };

            return _this2;
        }

        return Emitter;
    }(RootEmitter);

    /**
    This is the root {@link Chat} class that represents a chat room
     @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
    @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
    @param {Boolean} [needGrant=true] This Chat has restricted permissions and we need to authenticate ourselves in order to connect.
    @extends Emitter
    @fires Chat#$"."ready
    @fires Chat#$"."state
    @fires Chat#$"."online
    @fires Chat#$"."offline
    */


    var Chat = function (_Emitter) {
        _inherits(Chat, _Emitter);

        function Chat() {
            var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date().getTime();
            var needGrant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var autoConnect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            _classCallCheck(this, Chat);

            var _this3 = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this));

            if (ceConfig.insecure) {
                needGrant = false;
            }

            /**
            * A string identifier for the Chat room.
            * @type String
            * @readonly
            * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
            */
            _this3.channel = channel.toString();

            var chanPrivString = 'public.';
            if (needGrant) {
                chanPrivString = 'private.';
            }

            if (_this3.channel.indexOf(ceConfig.globalChannel) == -1) {
                _this3.channel = [ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
            }

            /**
            A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
            Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes
             @type Object
            @readonly
            */
            _this3.users = {};

            /**
            A map of {@link Event} bound to this {@link Chat}
             @private
            @type Object
            @readonly
            */
            _this3.events = {};

            /**
            Updates list of {@link User}s in this {@link Chat}
            based on who is online now.
             @private
            @param {Object} status The response status
            @param {Object} response The response payload object
            */
            _this3.onHereNow = function (status, response) {

                if (status.error) {

                    /**
                    * There was a problem fetching the presence of this chat
                    * @event Chat#$"."error"."presence
                    */
                    throwError(_this3, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'), {
                        error: status.errorData,
                        errorText: status.errorData.response.text
                    });
                } else {

                    // get the list of occupants in this channel
                    var occupants = response.channels[_this3.channel].occupants;

                    // format the userList for rltm.js standard
                    for (var i in occupants) {
                        _this3.userUpdate(occupants[i].uuid, occupants[i].state);
                    }
                }
            };

            /**
            * Get messages that have been published to the network before this client was connected.
            * Events are published with the ```$history``` prefix. So for example, if you had the event ```message```,
            * you would call ```Chat.history('message')``` and subscribe to history events via ```chat.on('$history.message', (data) => {})```.
            *
            * @param {String} event The name of the event we're getting history for
            * @param {Object} [config] The PubNub history config for this call
            * @tutorial history
            */
            _this3.history = function (event) {
                var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


                // create the event if it does not exist
                _this3.events[event] = _this3.events[event] || new Event(_this3, event);

                // set the PubNub configured channel to this channel
                config.channel = _this3.events[event].channel;

                // run the PubNub history method for this event
                ChatEngine.pubnub.history(config, function (status, response) {

                    if (status.error) {

                        /**
                        * There was a problem fetching the history of this chat
                        * @event Chat#$"."error"."history
                        */
                        throwError(_this3, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), {
                            errorText: status.errorData.response.text,
                            error: status.error
                        });
                    } else {

                        response.messages.forEach(function (message) {

                            if (message.entry.event == event) {

                                /**
                                * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                                * ```$.history.``` to distinguish it from the original live events.
                                * @event Chat#$"."history"."*
                                * @tutorial history
                                */
                                _this3.trigger(['$', 'history', event].join('.'), message.entry);
                            }
                        });
                    }
                });
            };

            /**
            * Invite a user to this Chat. Authorizes the invited user in the Chat and sends them an invite via {@link User#direct}.
            * @param {User} user The {@link User} to invite to this chatroom.
            * @fires Me#event:$"."invite
            * @example
            * // one user running ChatEngine
            * let secretChat = new ChatEngine.Chat('secret-channel');
            * secretChat.invite(someoneElse);
            *
            * // someoneElse in another instance of ChatEngine
            * me.direct.on('$.invite', (payload) => {
            *     let secretChat = new ChatEngine.Chat(payload.data.channel);
            * });
            */
            _this3.invite = function (user) {

                var complete = function complete() {

                    var send = function send() {

                        /**
                        * Notifies {@link Me} that they've been invited to a new private {@link Chat}.
                        * Fired by the {@link Chat#invite} method.
                        * @event Me#$"."invite
                        * @tutorial private
                        * @example
                        * me.direct.on('$.invite', (payload) => {
                        *    let privChat = new ChatEngine.Chat(payload.data.channel));
                        * });
                        */
                        user.direct.emit('$.invite', {
                            channel: _this3.channel
                        });
                    };

                    if (!user.direct.connected) {
                        user.direct.connect();
                        user.direct.on('$.connected', send);
                    } else {
                        send();
                    }
                };

                if (ceConfig.insecure) {
                    complete();
                } else {

                    axios.post(ceConfig.authUrl + '/invite', {
                        authKey: pnConfig.authKey,
                        uuid: user.uuid,
                        channel: _this3.channel,
                        myUUID: ChatEngine.me.uuid,
                        authData: ChatEngine.me.authData
                    }).then(function (response) {
                        complete();
                    }).catch(function (error) {

                        throwError(_this3, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });
                    });
                }
            };

            /**
            Keep track of {@link User}s in the room by subscribing to PubNub presence events.
             @private
            @param {Object} data The PubNub presence response for this event
            */
            _this3.onPresence = function (presenceEvent) {

                // make sure channel matches this channel
                if (_this3.channel == presenceEvent.channel) {

                    // someone joins channel
                    if (presenceEvent.action == "join") {

                        var user = _this3.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Fired when a {@link User} has joined the room.
                        *
                        * @event Chat#$"."online"."join
                        * @param {Object} data The payload returned by the event
                        * @param {User} data.user The {@link User} that came online
                        * @example
                        * chat.on('$.join', (data) => {
                        *     console.log('User has joined the room!', data.user);
                        * });
                        */
                        _this3.trigger('$.online.join', {
                            user: user
                        });
                    }

                    // someone leaves channel
                    if (presenceEvent.action == "leave") {
                        _this3.userLeave(presenceEvent.uuid);
                    }

                    // someone timesout
                    if (presenceEvent.action == "timeout") {
                        _this3.userDisconnect(presenceEvent.uuid);
                    }

                    // someone's state is updated
                    if (presenceEvent.action == "state-change") {
                        _this3.userUpdate(presenceEvent.uuid, presenceEvent.state);
                    }
                }
            };

            /**
             * Boolean value that indicates of the Chat is connected to the network.
             * @type {Boolean}
             */
            _this3.connected = false;

            /**
            * Connect to PubNub servers to initialize the chat.
            * @example
            * // create a new chatroom, but don't connect to it automatically
            * let chat = new Chat('some-chat', false)
            *
            * // connect to the chat when we feel like it
            * chat.connect();
            */
            _this3.connect = function () {

                if (!_this3.connected) {

                    if (!ChatEngine.pubnub) {
                        throwError(_this3, 'trigger', 'setup', new Error('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.'));
                    }

                    // listen to all PubNub events for this Chat
                    ChatEngine.pubnub.addListener({
                        message: _this3.onMessage,
                        presence: _this3.onPresence
                    });

                    // subscribe to the PubNub channel for this Chat
                    ChatEngine.pubnub.subscribe({
                        channels: [_this3.channel],
                        withPresence: true
                    });
                }
            };

            /**
             * @private
             */
            _this3.onPrep = function () {

                if (autoConnect) {
                    _this3.connect();
                }
            };

            /**
             * @private
             */
            _this3.grant = function () {

                if (ceConfig.insecure) {
                    return _this3.onPrep();
                } else {

                    axios.post(ceConfig.authUrl + '/chat', {
                        authKey: pnConfig.authKey,
                        uuid: pnConfig.uuid,
                        channel: _this3.channel,
                        authData: ChatEngine.me.authData
                    }).then(function (response) {
                        _this3.onPrep();
                    }).catch(function (error) {

                        throwError(_this3, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });
                    });
                }
            };

            if (needGrant) {
                _this3.grant();
            } else {
                _this3.onPrep();
            }

            ChatEngine.chats[_this3.channel] = _this3;

            return _this3;
        }

        /**
        * Send events to other clients in this {@link User}.
        * Events are trigger over the network  and all events are made
        * on behalf of {@link Me}
        *
        * @param {String} event The event name
        * @param {Object} data The event payload object
        * @example
        * chat.emit('custom-event', {value: true});
        * chat.on('custom-event', (payload) => {
        *     console.log(payload.sender.uuid, 'emitted the value', payload.data.value);
        * });
        */


        _createClass(Chat, [{
            key: 'emit',
            value: function emit(event, data) {
                var _this4 = this;

                // create a standardized payload object
                var payload = {
                    data: data, // the data supplied from params
                    sender: ChatEngine.me.uuid, // my own uuid
                    chat: this // an instance of this chat
                };

                // run the plugin queue to modify the event
                this.runPluginQueue('emit', event, function (next) {
                    next(null, payload);
                }, function (err, payload) {

                    // remove chat otherwise it would be serialized
                    // instead, it's rebuilt on the other end.
                    // see this.trigger
                    delete payload.chat;

                    // publish the event and data over the configured channel

                    // ensure the event exists within the global space
                    _this4.events[event] = _this4.events[event] || new Event(_this4, event);

                    _this4.events[event].publish(payload);
                });
            }

            /**
            Broadcasts an event locally to all listeners.
             @private
            @param {String} event The event name
            @param {Object} payload The event payload object
            */

        }, {
            key: 'trigger',
            value: function trigger(event, payload) {
                var _this5 = this;

                if ((typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) == "object") {

                    // restore chat in payload
                    if (!payload.chat) {
                        payload.chat = this;
                    }

                    // turn a uuid found in payload.sender to a real user
                    if (payload.sender && ChatEngine.users[payload.sender]) {
                        payload.sender = ChatEngine.users[payload.sender];
                    }
                }

                // let plugins modify the event
                this.runPluginQueue('on', event, function (next) {
                    next(null, payload);
                }, function (err, payload) {

                    // emit this event to any listener
                    _this5._emit(event, payload);
                });
            }

            /**
            Add a user to the {@link Chat}, creating it if it doesn't already exist.
             @private
            @param {String} uuid The user uuid
            @param {Object} state The user initial state
            @param {Boolean} trigger Force a trigger that this user is online
            */

        }, {
            key: 'createUser',
            value: function createUser(uuid, state) {

                // Ensure that this user exists in the global list
                // so we can reference it from here out
                ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

                // Add this chatroom to the user's list of chats
                ChatEngine.users[uuid].addChat(this, state);

                // trigger the join event over this chatroom
                if (!this.users[uuid]) {

                    /**
                    * Broadcast that a {@link User} has come online. This is when
                    * the framework firsts learn of a user. This can be triggered
                    * by, ```$.join```, or other network events that
                    * notify the framework of a new user.
                    *
                    * @event Chat#$"."online"."here
                    * @param {Object} data The payload returned by the event
                    * @param {User} data.user The {@link User} that came online
                    * @example
                    * chat.on('$.online.here', (data) => {
                    *     console.log('User has come online:', data.user);
                    * });
                    */
                    this.trigger('$.online.here', {
                        user: ChatEngine.users[uuid]
                    });
                }

                // store this user in the chatroom
                this.users[uuid] = ChatEngine.users[uuid];

                // return the instance of this user
                return ChatEngine.users[uuid];
            }

            /**
            * Update a user's state within this {@link Chat}.
            * @private
            * @param {String} uuid The {@link User} uuid
            * @param {Object} state State to update for the user
            */

        }, {
            key: 'userUpdate',
            value: function userUpdate(uuid, state) {

                // ensure the user exists within the global space
                ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

                // if we don't know about this user
                if (!this.users[uuid]) {
                    // do the whole join thing
                    this.createUser(uuid, state);
                }

                // update this user's state in this chatroom
                this.users[uuid].assign(state, this);

                /**
                * Broadcast that a {@link User} has changed state.
                * @event Chat#$"."state
                * @param {Object} data The payload returned by the event
                * @param {User} data.user The {@link User} that changed state
                * @param {Object} data.state The new user state for this ```Chat```
                * @example
                * chat.on('$.state', (data) => {
                *     console.log('User has changed state:', data.user, 'new state:', data.state);
                * });
                */
                this.trigger('$.state', {
                    user: this.users[uuid],
                    state: this.users[uuid].state(this)
                });
            }

            /**
            * Leave from the {@link Chat} on behalf of {@link Me}.
            * @example
            * chat.leave();
            */

        }, {
            key: 'leave',
            value: function leave() {

                ChatEngine.pubnub.unsubscribe({
                    channels: [this.channel]
                });
            }

            /**
            Perform updates when a user has left the {@link Chat}.
             @private
            */

        }, {
            key: 'userLeave',
            value: function userLeave(uuid) {

                // make sure this event is real, user may have already left
                if (this.users[uuid]) {

                    // if a user leaves, trigger the event

                    /**
                    * Fired when a {@link User} intentionally leaves a {@link Chat}.
                    *
                    * @event Chat#$"."offline"."leave
                    * @param {Object} data The data payload from the event
                    * @param {User} user The {@link User} that has left the room
                    * @example
                    * chat.on('$.offline.leave', (data) => {
                    *     console.log('User left the room manually:', data.user);
                    * });
                    */
                    this.trigger('$.offline.leave', {
                        user: this.users[uuid]
                    });

                    // remove the user from the local list of users
                    delete this.users[uuid];

                    // we don't remove the user from the global list,
                    // because they may be online in other channels
                } else {

                        // that user isn't in the user list
                        // we never knew about this user or they already left

                        // console.log('user already left');
                    }
            }

            /**
            Fired when a user disconnects from the {@link Chat}
             @private
            @param {String} uuid The uuid of the {@link Chat} that left
            */

        }, {
            key: 'userDisconnect',
            value: function userDisconnect(uuid) {

                // make sure this event is real, user may have already left
                if (this.users[uuid]) {

                    /**
                    * Fired specifically when a {@link User} looses network connection
                    * to the {@link Chat} involuntarily.
                    *
                    * @event Chat#$"."offline"."disconnect
                    * @param {Object} data The {@link User} that disconnected
                    * @param {Object} data.user The {@link User} that disconnected
                    * @example
                    * chat.on('$.offline.disconnect', (data) => {
                    *     console.log('User disconnected from the network:', data.user);
                    * });
                    */

                    this.trigger('$.offline.disconnect', {
                        user: this.users[uuid]
                    });
                }
            }

            /**
            Load plugins and attach a queue of functions to execute before and
            after events are trigger or received.
             @private
            @param {String} location Where in the middleeware the event should run (emit, trigger)
            @param {String} event The event name
            @param {String} first The first function to run before the plugins have run
            @param {String} last The last function to run after the plugins have run
            */

        }, {
            key: 'runPluginQueue',
            value: function runPluginQueue(location, event, first, last) {

                // this assembles a queue of functions to run as middleware
                // event is a triggered event key
                var plugin_queue = [];

                // the first function is always required
                plugin_queue.push(first);

                // look through the configured plugins
                for (var i in this.plugins) {

                    // if they have defined a function to run specifically
                    // for this event
                    if (this.plugins[i].middleware && this.plugins[i].middleware[location] && this.plugins[i].middleware[location][event]) {

                        // add the function to the queue
                        plugin_queue.push(this.plugins[i].middleware[location][event]);
                    }
                }

                // waterfall runs the functions in assigned order
                // waiting for one to complete before moving to the next
                // when it's done, the ```last``` parameter is called
                waterfall(plugin_queue, last);
            }

            /**
            Set the state for {@link Me} within this {@link User}.
            Broadcasts the ```$.state``` event on other clients
             @private
            @param {Object} state The new state {@link Me} will have within this {@link User}
            */

        }, {
            key: 'setState',
            value: function setState(state) {

                ChatEngine.pubnub.setState({
                    state: state,
                    channels: [this.channel]
                }, function (status, response) {
                    // handle status, response
                });
            }
        }, {
            key: 'onConnectionReady',
            value: function onConnectionReady() {

                /**
                * Broadcast that the {@link Chat} is connected to the network.
                * @event Chat#$"."connected
                * @example
                * chat.on('$.connected', () => {
                *     console.log('chat is ready to go!');
                * });
                */
                this.connected = true;

                this.trigger('$.connected');

                // get a list of users online now
                // ask PubNub for information about connected users in this channel
                ChatEngine.pubnub.hereNow({
                    channels: [this.channel],
                    includeUUIDs: true,
                    includeState: true
                }, this.onHereNow);
            }
        }]);

        return Chat;
    }(Emitter);

    ;

    /**
    This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
    If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
    @class
    @extends Emitter
    @param uuid
    @param state
    @param chat
    */

    var User = function (_Emitter2) {
        _inherits(User, _Emitter2);

        function User(uuid) {
            var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var chat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ChatEngine.global;

            _classCallCheck(this, User);

            /**
            The User's unique identifier, usually a device uuid. This helps ChatEngine identify the user between events. This is public id exposed to the network.
            Check out [the wikipedia page on UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier).
             @readonly
            @type String
            */
            var _this6 = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this));

            _this6.uuid = uuid;

            /**
            A map of the User's state in each {@link Chat}. Stays in sync automatically.
             @private
            @type Object
            */
            _this6.states = {};

            /**
            * An object containing the Chats this {@link User} is currently in. The key of each item in the object is the {@link Chat.channel} and the value is the {@link Chat} object. Note that for privacy, this map will only contain {@link Chat}s that the client ({@link Me}) is also connected to.
            *
            * @readonly
            * @type Object
            * @example
            *{
            *    "globalChannel": {
            *        channel: "globalChannel",
            *        users: {
            *            //...
            *        },
            *    },
            *    // ...
            * }
            */
            _this6.chats = {};

            /**
            * Feed is a Chat that only streams things a User does, like
            * 'startTyping' or 'idle' events for example. Anybody can subscribe
            * to a User's feed, but only the User can publish to it. Users will
            * not be able to converse in this channel.
            *
            * @type Chat
            * @example
            * // me
            * me.feed.emit('update', 'I may be away from my computer right now');
            *
            * // another instance
            * them.feed.connect();
            * them.feed.on('update', (payload) => {})
            */

            // grants for these chats are done on auth. Even though they're marked private, they are locked down via the server
            _this6.feed = new Chat([ChatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, _this6.constructor.name == "Me");

            /**
            * Direct is a private channel that anybody can publish to but only
            * the user can subscribe to. Great for pushing notifications or
            * inviting to other chats. Users will not be able to communicate
            * with one another inside of this chat. Check out the
            * {@link Chat#invite} method for private chats utilizing
            * {@link User#direct}.
            *
            * @type Chat
            * @example
            * // me
            * me.direct.on('private-message', (payload) -> {
            *     console.log(payload.sender.uuid, 'sent your a direct message');
            * });
            *
            * // another instance
            * them.direct.connect();
            * them.direct.emit('private-message', {secret: 42});
            */
            _this6.direct = new Chat([ChatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, _this6.constructor.name == "Me");

            // if the user does not exist at all and we get enough
            // information to build the user
            if (!ChatEngine.users[uuid]) {
                ChatEngine.users[uuid] = _this6;
            }

            // update this user's state in it's created context
            _this6.assign(state, chat);

            return _this6;
        }

        /**
        * Gets the user state in a {@link Chat}. See {@link Me#update} for how to assign state values.
        * @param {Chat} chat Chatroom to retrieve state from
        * @return {Object} Returns a generic JSON object containing state information.
        * @example
        *
        * // Global State
        * let globalState = user.state();
        *
        * // State in some channel
        * let someChat = new ChatEngine.Chat('some-channel');
        * let someChatState = user.state(someChat);s
        */


        _createClass(User, [{
            key: 'state',
            value: function state() {
                var chat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ChatEngine.global;

                return this.states[chat.channel] || {};
            }

            /**
            * @private
            * @param {Object} state The new state for the user
            * @param {Chat} chat Chatroom to retrieve state from
            */

        }, {
            key: 'update',
            value: function update(state) {
                var chat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChatEngine.global;

                var chatState = this.state(chat) || {};
                this.states[chat.channel] = Object.assign(chatState, state);
            }

            /**
            this is only called from network updates
             @private
            */

        }, {
            key: 'assign',
            value: function assign(state, chat) {
                this.update(state, chat);
            }

            /**
            adds a chat to this user
             @private
            */

        }, {
            key: 'addChat',
            value: function addChat(chat, state) {

                // store the chat in this user object
                this.chats[chat.channel] = chat;

                // updates the user's state in that chatroom
                this.assign(state, chat);
            }
        }]);

        return User;
    }(Emitter);

    /**
    Represents the client connection as a special {@link User} with write permissions.
    Has the ability to update it's state on the network. An instance of
    {@link Me} is returned by the ```ChatEngine.connect()```
    method.
     @class Me
    @param {String} uuid The uuid of this user
    @extends User
    */


    var Me = function (_User) {
        _inherits(Me, _User);

        function Me(uuid, authData) {
            _classCallCheck(this, Me);

            var _this7 = _possibleConstructorReturn(this, (Me.__proto__ || Object.getPrototypeOf(Me)).call(this, uuid));

            // call the User constructor


            _this7.authData = authData;

            return _this7;
        }

        // assign updates from network


        _createClass(Me, [{
            key: 'assign',
            value: function assign(state, chat) {
                // we call "update" because calling "super.assign"
                // will direct back to "this.update" which creates
                // a loop of network updates
                _get(Me.prototype.__proto__ || Object.getPrototypeOf(Me.prototype), 'update', this).call(this, state, chat);
            }

            /**
            * Update {@link Me}'s state in a {@link Chat}. All {@link User}s in
            * the {@link Chat} will be notified of this change via ($.update)[Chat.html#event:$%2522.%2522state].
            * Retrieve state at any time with {@link User#state}.
            * @param {Object} state The new state for {@link Me}
            * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
            * Defaults to ```ChatEngine.global```.
            * @fires Chat#event:$"."state
            * @example
            * // update global state
            * me.update({value: true});
            *
            * // update state in specific chat
            * let chat = new ChatEngine.Chat('some-chat');
            * me.update({value: true}, chat);
            */

        }, {
            key: 'update',
            value: function update(state) {
                var chat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChatEngine.global;


                // run the root update function
                _get(Me.prototype.__proto__ || Object.getPrototypeOf(Me.prototype), 'update', this).call(this, state, chat);

                // publish the update over the global channel
                chat.setState(state);
            }
        }]);

        return Me;
    }(User);

    /**
    Provides the base Widget class...
     @class ChatEngine
    @extends RootEmitter
     */


    var init = function init() {

        // Create the root ChatEngine object
        ChatEngine = new RootEmitter();

        /**
        * A map of all known {@link User}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.users = {};

        /**
        * A map of all known {@link Chat}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.chats = {};

        /**
        * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
        * @member {Chat} global
        * @memberof ChatEngine
        */
        ChatEngine.global = false;

        /**
        * This instance of ChatEngine represented as a special {@link User} know as {@link Me}
        * @member {Me} me
        * @memberof ChatEngine
        */
        ChatEngine.me = false;

        /**
        * An instance of PubNub, the networking infrastructure that powers the realtime communication between {@link User}s in {@link Chats}.
        * @member {Object} pubnub
        * @memberof ChatEngine
        */
        ChatEngine.pubnub = false;

        /**
        * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event
        * @member {Object} ready
        * @memberof ChatEngine
        */
        ChatEngine.ready = false;

        /**
        * Connect to realtime service and create instance of {@link Me}
        * @method ChatEngine#connect
        * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc.
        * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
        * * @param {Strung} authKey A authentication secret. Will be sent to authentication backend for validation. This is usually an access token or password. This is different from UUID as a user can have a single UUID but multiple auth keys.
        * @param {Object} [authData] Additional data to send to the authentication endpoint. Not used by ChatEngine SDK.
        * @fires $"."connected
        */
        ChatEngine.connect = function (uuid) {
            var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var _this8 = this;

            var authKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var authData = arguments[3];


            // this creates a user known as Me and
            // connects to the global chatroom

            pnConfig.uuid = uuid;

            var complete = function complete() {

                _this8.pubnub = new PubNub(pnConfig);

                // create a new chat to use as global chat
                // we don't do auth on this one becauseit's assumed to be done with the /auth request below
                _this8.global = new Chat(ceConfig.globalChannel, false, true);

                // create a new user that represents this client
                _this8.me = new Me(pnConfig.uuid, authData);

                // create a new instance of Me using input parameters
                _this8.global.createUser(pnConfig.uuid, state);

                _this8.me.update(state);

                /**
                 * Fired when ChatEngine is connected to the internet and ready to go!
                 * @event ChatEngine#$"."ready
                 */
                _this8.global.on('$.connected', function () {

                    _this8._emit('$.ready', {
                        me: _this8.me
                    });

                    _this8.ready = true;
                });

                /**
                Fires when PubNub network connection changes
                 @private
                @param {Object} statusEvent The response status
                */
                _this8.pubnub.addListener({
                    status: function status(statusEvent) {

                        /**
                        * SDK detected that network is online.
                        * @event ChatEngine#$"."network"."up"."online
                        */

                        /**
                        * SDK detected that network is down.
                        * @event ChatEngine#$"."network"."down"."offline
                        */

                        /**
                        * A subscribe event experienced an exception when running.
                        * @event ChatEngine#$"."network"."down"."issue
                        */

                        /**
                        * SDK was able to reconnect to pubnub.
                        * @event ChatEngine#$"."network"."up"."reconnected
                        */

                        /**
                        * SDK subscribed with a new mix of channels.
                        * @event ChatEngine#$"."network"."up"."connected
                        */

                        /**
                        * JSON parsing crashed.
                        * @event ChatEngine#$"."network"."down"."malformed
                        */

                        /**
                        * Server rejected the request.
                        * @event ChatEngine#$"."network"."down"."badrequest
                        */

                        /**
                        * If using decryption strategies and the decryption fails.
                        * @event ChatEngine#$"."network"."down"."decryption
                        */

                        /**
                        * Request timed out.
                        * @event ChatEngine#$"."network"."down"."timeout
                        */

                        /**
                        * PAM permission failure.
                        * @event ChatEngine#$"."network"."down"."denied
                        */

                        // map the pubnub events into chat engine events
                        var map = {
                            'PNNetworkUpCategory': 'up.online',
                            'PNNetworkDownCategory': 'down.offline',
                            'PNNetworkIssuesCategory': 'down.issue',
                            'PNReconnectedCategory': 'up.reconnected',
                            'PNConnectedCategory': 'up.connected',
                            'PNAccessDeniedCategory': 'down.denied',
                            'PNMalformedResponseCategory': 'down.malformed',
                            'PNBadRequestCategory': 'down.badrequest',
                            'PNDecryptionErrorCategory': 'down.decryption',
                            'PNTimeoutCategory': 'down.timeout'
                        };

                        var eventName = ['$', 'network', map[statusEvent.category] || 'undefined'].join('.');

                        if (statusEvent.affectedChannels) {

                            statusEvent.affectedChannels.forEach(function (channel) {

                                var chat = ChatEngine.chats[channel];

                                if (chat) {

                                    // connected category tells us the chat is ready
                                    if (statusEvent.category === "PNConnectedCategory") {
                                        chat.onConnectionReady();
                                    }

                                    // trigger the network events
                                    chat.trigger(eventName, statusEvent);
                                } else {

                                    _this8._emit(eventName, statusEvent);
                                }
                            });
                        } else {

                            _this8._emit(eventName, statusEvent);
                        }
                    }
                });
            };

            if (ceConfig.insecure) {
                complete();
            } else {

                pnConfig.authKey = authKey;

                axios.post(ceConfig.authUrl + '/auth', {
                    uuid: pnConfig.uuid,
                    channel: ceConfig.globalChannel,
                    authData: this.me.authData
                }).then(function (response) {

                    complete();
                }).catch(function (error) {

                    /**
                    * There was a problem logging in
                    * @event ChatEngine#$"."error"."auth
                    */
                    throwError(_this8, '_emit', 'auth', new Error('There was a problem logging into the auth server (' + ceConfig.authUrl + ').'), {
                        error: error
                    });
                });
            }
        };

        /**
        * The {@link Chat} class.
        * @member {Chat} Chat
        * @memberof ChatEngine
        * @see {@link Chat}
        */
        ChatEngine.Chat = Chat;

        /**
        * The {@link User} class.
        * @member {User} User
        * @memberof ChatEngine
        * @see {@link User}
        */
        ChatEngine.User = User;

        // add an object as a subobject under a namespoace
        ChatEngine.addChild = function (ob, childName, childOb) {

            // assign the new child object as a property of parent under the
            // given namespace
            ob[childName] = childOb;

            // the new object can use ```this.parent``` to access
            // the root class
            childOb.parent = ob;
        };

        return ChatEngine;
    };

    // return an instance of ChatEngine
    return init();
};

// export the ChatEngine api
module.exports = {
    plugin: {}, // leave a spot for plugins to exist
    create: create
};

},{"async/waterfall":8,"axios":9,"eventemitter2":34,"pubnub":40}]},{},[41])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvYXN5bmNpZnkuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvaW50ZXJuYWwvaW5pdGlhbFBhcmFtcy5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9vbmNlLmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jL2ludGVybmFsL29ubHlPbmNlLmpzIiwibm9kZV9tb2R1bGVzL2FzeW5jL2ludGVybmFsL3NldEltbWVkaWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9zbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC93cmFwQXN5bmMuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvd2F0ZXJmYWxsLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idG9hLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIyL2xpYi9ldmVudGVtaXR0ZXIyLmpzIiwibm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL25vb3AuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3B1Ym51Yi9kaXN0L3dlYi9wdWJudWIubWluLmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQSxJQUFNLGdCQUFnQixRQUFRLGVBQVIsRUFBeUIsYUFBL0M7O0FBRUEsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmOztBQUVBO0FBQ0EsSUFBTSxZQUFZLFFBQVEsaUJBQVIsQ0FBbEI7O0FBRUE7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQWQ7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBLElBQU0sU0FBUyxTQUFULE1BQVMsQ0FBUyxRQUFULEVBQWtDO0FBQUEsUUFBZixRQUFlLHVFQUFKLEVBQUk7OztBQUU3QyxRQUFJLGFBQWEsS0FBakI7O0FBRUEsUUFBRyxTQUFTLGFBQVosRUFBMkI7QUFDdkIsaUJBQVMsYUFBVCxHQUF5QixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsRUFBekI7QUFDSCxLQUZELE1BRU87QUFDSCxpQkFBUyxhQUFULEdBQXlCLGFBQXpCO0FBQ0g7O0FBRUQsUUFBRyxPQUFPLFNBQVMsV0FBaEIsSUFBK0IsV0FBbEMsRUFBK0M7QUFDM0MsaUJBQVMsV0FBVCxHQUF1QixJQUF2QjtBQUNIOztBQUVELGFBQVMsUUFBVCxHQUFvQixTQUFTLFFBQVQsSUFBcUIsS0FBekM7QUFDQSxRQUFHLENBQUMsU0FBUyxPQUFiLEVBQXNCO0FBQ2xCLGdCQUFRLElBQVIsQ0FBYSxpRkFBYjtBQUNBLGlCQUFTLFFBQVQsR0FBb0IsSUFBcEI7QUFDSDs7QUFFRCxRQUFNLGFBQWEsU0FBYixVQUFhLENBQVMsSUFBVCxFQUFlLEVBQWYsRUFBbUIsR0FBbkIsRUFBd0IsT0FBeEIsRUFBK0M7QUFBQSxZQUFkLE9BQWMsdUVBQUosRUFBSTs7O0FBRTlELFlBQUcsU0FBUyxXQUFaLEVBQXlCO0FBQ3JCO0FBQ0Esa0JBQU0sT0FBTjtBQUNIOztBQUVELGdCQUFRLE9BQVIsR0FBa0IsUUFBUSxRQUFSLEVBQWxCOztBQUVBLGFBQUssRUFBTCxFQUFTLENBQUMsR0FBRCxFQUFNLE9BQU4sRUFBZSxHQUFmLEVBQW9CLElBQXBCLENBQXlCLEdBQXpCLENBQVQsRUFBd0MsT0FBeEM7QUFFSCxLQVhEOztBQWFBOzs7OztBQWpDNkMsUUFxQ3ZDLFdBckN1QyxHQXVDekMsdUJBQWM7QUFBQTs7QUFFVjs7O0FBR0EsYUFBSyxNQUFMLEdBQWMsRUFBZDs7QUFFQTs7OztBQUtBLGFBQUssT0FBTCxHQUFlLElBQUksYUFBSixDQUFrQjtBQUMvQixzQkFBVSxJQURxQjtBQUUvQix5QkFBYSxJQUZrQjtBQUcvQiwwQkFBYyxFQUhpQjtBQUkvQiwrQkFBbUI7QUFKWSxTQUFsQixDQUFmOztBQU9BO0FBQ0E7O0FBRUE7Ozs7OztBQU9BLGFBQUssS0FBTCxHQUFhLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdUIsS0FBSyxPQUE1QixDQUFiOztBQUVBOzs7Ozs7O0FBUUEsYUFBSyxHQUFMLEdBQVcsS0FBSyxPQUFMLENBQWEsRUFBYixDQUFnQixJQUFoQixDQUFxQixLQUFLLE9BQTFCLENBQVg7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLGFBQUssRUFBTCxHQUFVLEtBQUssT0FBTCxDQUFhLEVBQWIsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBSyxPQUExQixDQUFWOztBQUVBOzs7Ozs7Ozs7Ozs7QUFZQSxhQUFLLEdBQUwsR0FBVyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLElBQWpCLENBQXNCLEtBQUssT0FBM0IsQ0FBWDs7QUFFQTs7Ozs7Ozs7O0FBU0EsYUFBSyxLQUFMLEdBQWEsS0FBSyxPQUFMLENBQWEsS0FBYixDQUFtQixJQUFuQixDQUF3QixLQUFLLE9BQTdCLENBQWI7O0FBRUE7Ozs7Ozs7Ozs7QUFVQSxhQUFLLElBQUwsR0FBWSxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLElBQWxCLENBQXVCLEtBQUssT0FBNUIsQ0FBWjtBQUVILEtBeEl3Qzs7QUE0STdDOzs7OztBQTVJNkMsUUErSXZDLEtBL0l1QyxHQWlKekMsZUFBWSxJQUFaLEVBQWtCLEtBQWxCLEVBQXlCO0FBQUE7O0FBQUE7O0FBRXJCOzs7Ozs7OztBQVFBLGFBQUssT0FBTCxHQUFlLEtBQUssT0FBcEI7O0FBRUE7Ozs7O0FBTUEsYUFBSyxPQUFMLEdBQWUsVUFBQyxDQUFELEVBQU87O0FBRWxCLGNBQUUsS0FBRixHQUFVLEtBQVY7O0FBRUEsdUJBQVcsTUFBWCxDQUFrQixPQUFsQixDQUEwQjtBQUN0Qix5QkFBUyxDQURhO0FBRXRCLHlCQUFTLE1BQUs7QUFGUSxhQUExQixFQUdHLFVBQUMsTUFBRCxFQUFTLFFBQVQsRUFBc0I7O0FBRXJCLG9CQUFHLE9BQU8sVUFBUCxJQUFxQixHQUF4QixFQUE2QjtBQUN6Qix5QkFBSyxPQUFMLENBQWEsbUJBQWI7QUFDSCxpQkFGRCxNQUVPOztBQUVIOzs7O0FBSUEsK0JBQVcsSUFBWCxFQUFpQixTQUFqQixFQUE0QixTQUE1QixFQUF1QyxJQUFJLEtBQUosQ0FBVSx5REFBVixDQUF2QyxFQUE2RztBQUN6RyxtQ0FBVyxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFEb0U7QUFFekcsK0JBQU8sT0FBTztBQUYyRixxQkFBN0c7QUFLSDtBQUVKLGFBcEJEO0FBc0JILFNBMUJEOztBQTRCQTs7Ozs7QUFNQSxhQUFLLFNBQUwsR0FBaUIsVUFBQyxDQUFELEVBQU87O0FBRXBCLGdCQUFHLE1BQUssT0FBTCxJQUFnQixFQUFFLE9BQWxCLElBQTZCLEVBQUUsT0FBRixDQUFVLEtBQVYsSUFBbUIsS0FBbkQsRUFBMEQ7QUFDdEQscUJBQUssT0FBTCxDQUFhLEVBQUUsT0FBRixDQUFVLEtBQXZCLEVBQThCLEVBQUUsT0FBaEM7QUFDSDtBQUVKLFNBTkQ7O0FBUUE7QUFDQSxtQkFBVyxNQUFYLENBQWtCLFdBQWxCLENBQThCO0FBQzFCLHFCQUFTLEtBQUs7QUFEWSxTQUE5QjtBQUlILEtBbE53Qzs7QUFzTjdDOzs7Ozs7O0FBdE42QyxRQTJOdkMsT0EzTnVDO0FBQUE7O0FBNk56QywyQkFBYztBQUFBOztBQUlWOzs7OztBQUpVOztBQVVWLG1CQUFLLEtBQUwsR0FBYSxVQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCOztBQUUxQjtBQUNBO0FBQ0EsMkJBQVcsS0FBWCxDQUFpQixLQUFqQixFQUF3QixJQUF4Qjs7QUFFQTtBQUNBLHVCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLEtBQWxCLEVBQXlCLElBQXpCO0FBRUgsYUFURDs7QUFXQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsbUJBQUssRUFBTCxHQUFVLFVBQUMsS0FBRCxFQUFRLEVBQVIsRUFBZTs7QUFFckI7QUFDQSx1QkFBSyxNQUFMLENBQVksS0FBWixJQUFxQixPQUFLLE1BQUwsQ0FBWSxLQUFaLEtBQXNCLElBQUksS0FBSixTQUFnQixLQUFoQixDQUEzQzs7QUFFQTtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxLQUFULEVBQWdCLEVBQWhCO0FBRUgsYUFSRDs7QUFVQTs7OztBQUlBLG1CQUFLLE9BQUwsR0FBZSxFQUFmOztBQUVBOzs7O0FBSUEsbUJBQUssTUFBTCxHQUFjLFVBQVMsTUFBVCxFQUFpQjs7QUFFM0I7QUFDQSxxQkFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixNQUFsQjs7QUFFQTtBQUNBLG9CQUFJLFlBQVksS0FBSyxXQUFMLENBQWlCLElBQWpDOztBQUVBO0FBQ0Esb0JBQUcsT0FBTyxPQUFQLElBQWtCLE9BQU8sT0FBUCxDQUFlLFNBQWYsQ0FBckIsRUFBZ0Q7O0FBRTVDO0FBQ0E7QUFDQSwrQkFBVyxRQUFYLENBQW9CLElBQXBCLEVBQTBCLE9BQU8sU0FBakMsRUFDSSxJQUFJLE9BQU8sT0FBUCxDQUFlLFNBQWYsQ0FBSixFQURKOztBQUdBLHlCQUFLLE9BQU8sU0FBWixFQUF1QixVQUF2QixHQUFvQyxVQUFwQzs7QUFFQTtBQUNBO0FBQ0Esd0JBQUcsS0FBSyxPQUFPLFNBQVosRUFBdUIsU0FBMUIsRUFBcUM7QUFDakMsNkJBQUssT0FBTyxTQUFaLEVBQXVCLFNBQXZCO0FBQ0g7QUFFSjtBQUdKLGFBM0JEOztBQTFEVTtBQXVGYjs7QUFwVHdDO0FBQUEsTUEyTnZCLFdBM051Qjs7QUF3VDdDOzs7Ozs7Ozs7Ozs7O0FBeFQ2QyxRQW9VdkMsSUFwVXVDO0FBQUE7O0FBc1V6Qyx3QkFBa0Y7QUFBQSxnQkFBdEUsT0FBc0UsdUVBQTVELElBQUksSUFBSixHQUFXLE9BQVgsRUFBNEQ7QUFBQSxnQkFBdEMsU0FBc0MsdUVBQTFCLElBQTBCO0FBQUEsZ0JBQXBCLFdBQW9CLHVFQUFOLElBQU07O0FBQUE7O0FBQUE7O0FBSTlFLGdCQUFHLFNBQVMsUUFBWixFQUFzQjtBQUNsQiw0QkFBWSxLQUFaO0FBQ0g7O0FBRUQ7Ozs7OztBQU1BLG1CQUFLLE9BQUwsR0FBZSxRQUFRLFFBQVIsRUFBZjs7QUFFQSxnQkFBSSxpQkFBaUIsU0FBckI7QUFDQSxnQkFBRyxTQUFILEVBQWM7QUFDVixpQ0FBaUIsVUFBakI7QUFDSDs7QUFFRCxnQkFBRyxPQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLFNBQVMsYUFBOUIsS0FBZ0QsQ0FBQyxDQUFwRCxFQUF1RDtBQUNuRCx1QkFBSyxPQUFMLEdBQWUsQ0FBQyxTQUFTLGFBQVYsRUFBeUIsTUFBekIsRUFBaUMsY0FBakMsRUFBaUQsT0FBakQsRUFBMEQsSUFBMUQsQ0FBK0QsR0FBL0QsQ0FBZjtBQUNIOztBQUVEOzs7Ozs7QUFPQSxtQkFBSyxLQUFMLEdBQWEsRUFBYjs7QUFFQTs7Ozs7O0FBT0EsbUJBQUssTUFBTCxHQUFjLEVBQWQ7O0FBRUE7Ozs7Ozs7QUFRQSxtQkFBSyxTQUFMLEdBQWlCLFVBQUMsTUFBRCxFQUFTLFFBQVQsRUFBc0I7O0FBRW5DLG9CQUFHLE9BQU8sS0FBVixFQUFpQjs7QUFFYjs7OztBQUlBLHVDQUFpQixTQUFqQixFQUE0QixVQUE1QixFQUF3QyxJQUFJLEtBQUosQ0FBVSxrRkFBVixDQUF4QyxFQUF1STtBQUNuSSwrQkFBTyxPQUFPLFNBRHFIO0FBRW5JLG1DQUFXLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQjtBQUY4RixxQkFBdkk7QUFLSCxpQkFYRCxNQVdPOztBQUVIO0FBQ0Esd0JBQUksWUFBWSxTQUFTLFFBQVQsQ0FBa0IsT0FBSyxPQUF2QixFQUFnQyxTQUFoRDs7QUFFQTtBQUNBLHlCQUFJLElBQUksQ0FBUixJQUFhLFNBQWIsRUFBd0I7QUFDcEIsK0JBQUssVUFBTCxDQUFnQixVQUFVLENBQVYsRUFBYSxJQUE3QixFQUFtQyxVQUFVLENBQVYsRUFBYSxLQUFoRDtBQUNIO0FBRUo7QUFFSixhQXpCRDs7QUEyQkE7Ozs7Ozs7OztBQVNBLG1CQUFLLE9BQUwsR0FBZSxVQUFDLEtBQUQsRUFBd0I7QUFBQSxvQkFBaEIsTUFBZ0IsdUVBQVAsRUFBTzs7O0FBRW5DO0FBQ0EsdUJBQUssTUFBTCxDQUFZLEtBQVosSUFBcUIsT0FBSyxNQUFMLENBQVksS0FBWixLQUFzQixJQUFJLEtBQUosU0FBZ0IsS0FBaEIsQ0FBM0M7O0FBRUE7QUFDQSx1QkFBTyxPQUFQLEdBQWlCLE9BQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsT0FBcEM7O0FBRUE7QUFDQSwyQkFBVyxNQUFYLENBQWtCLE9BQWxCLENBQTBCLE1BQTFCLEVBQWtDLFVBQUMsTUFBRCxFQUFTLFFBQVQsRUFBc0I7O0FBRXBELHdCQUFHLE9BQU8sS0FBVixFQUFpQjs7QUFFYjs7OztBQUlBLDJDQUFpQixTQUFqQixFQUE0QixTQUE1QixFQUF1QyxJQUFJLEtBQUosQ0FBVSw2RkFBVixDQUF2QyxFQUFpSjtBQUM3SSx1Q0FBVyxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFEd0c7QUFFN0ksbUNBQU8sT0FBTztBQUYrSCx5QkFBako7QUFLSCxxQkFYRCxNQVdPOztBQUVILGlDQUFTLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBMEIsVUFBQyxPQUFELEVBQWE7O0FBRW5DLGdDQUFHLFFBQVEsS0FBUixDQUFjLEtBQWQsSUFBdUIsS0FBMUIsRUFBaUM7O0FBRTdCOzs7Ozs7QUFNQSx1Q0FBSyxPQUFMLENBQ0ksQ0FBQyxHQUFELEVBQU0sU0FBTixFQUFpQixLQUFqQixFQUF3QixJQUF4QixDQUE2QixHQUE3QixDQURKLEVBRUksUUFBUSxLQUZaO0FBSUg7QUFFSix5QkFoQkQ7QUFrQkg7QUFFSixpQkFuQ0Q7QUFxQ0gsYUE5Q0Q7O0FBZ0RBOzs7Ozs7Ozs7Ozs7OztBQWNBLG1CQUFLLE1BQUwsR0FBYyxVQUFDLElBQUQsRUFBVTs7QUFFcEIsb0JBQUksV0FBVyxTQUFYLFFBQVcsR0FBTTs7QUFFakIsd0JBQUksT0FBTyxTQUFQLElBQU8sR0FBTTs7QUFFYjs7Ozs7Ozs7OztBQVVBLDZCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFVBQWpCLEVBQTZCO0FBQ3pCLHFDQUFTLE9BQUs7QUFEVyx5QkFBN0I7QUFJSCxxQkFoQkQ7O0FBa0JBLHdCQUFHLENBQUMsS0FBSyxNQUFMLENBQVksU0FBaEIsRUFBMkI7QUFDdkIsNkJBQUssTUFBTCxDQUFZLE9BQVo7QUFDQSw2QkFBSyxNQUFMLENBQVksRUFBWixDQUFlLGFBQWYsRUFBOEIsSUFBOUI7QUFDSCxxQkFIRCxNQUdPO0FBQ0g7QUFDSDtBQUVKLGlCQTNCRDs7QUE2QkEsb0JBQUcsU0FBUyxRQUFaLEVBQXNCO0FBQ2xCO0FBQ0gsaUJBRkQsTUFFTzs7QUFFSCwwQkFBTSxJQUFOLENBQVcsU0FBUyxPQUFULEdBQW1CLFNBQTlCLEVBQXlDO0FBQ3JDLGlDQUFTLFNBQVMsT0FEbUI7QUFFckMsOEJBQU0sS0FBSyxJQUYwQjtBQUdyQyxpQ0FBUyxPQUFLLE9BSHVCO0FBSXJDLGdDQUFRLFdBQVcsRUFBWCxDQUFjLElBSmU7QUFLckMsa0NBQVUsV0FBVyxFQUFYLENBQWM7QUFMYSxxQkFBekMsRUFPQyxJQVBELENBT00sVUFBQyxRQUFELEVBQWM7QUFDaEI7QUFDSCxxQkFURCxFQVVDLEtBVkQsQ0FVTyxVQUFDLEtBQUQsRUFBVzs7QUFFZCwyQ0FBaUIsU0FBakIsRUFBNEIsTUFBNUIsRUFBb0MsSUFBSSxLQUFKLENBQVUsdUVBQVYsQ0FBcEMsRUFBd0g7QUFDcEgsbUNBQU87QUFENkcseUJBQXhIO0FBSUgscUJBaEJEO0FBaUJIO0FBRUosYUF0REQ7O0FBd0RBOzs7OztBQU1BLG1CQUFLLFVBQUwsR0FBa0IsVUFBQyxhQUFELEVBQW1COztBQUVqQztBQUNBLG9CQUFHLE9BQUssT0FBTCxJQUFnQixjQUFjLE9BQWpDLEVBQTBDOztBQUV0QztBQUNBLHdCQUFHLGNBQWMsTUFBZCxJQUF3QixNQUEzQixFQUFtQzs7QUFFL0IsNEJBQUksT0FBTyxPQUFLLFVBQUwsQ0FBZ0IsY0FBYyxJQUE5QixFQUFvQyxjQUFjLEtBQWxELENBQVg7O0FBRUE7Ozs7Ozs7Ozs7O0FBV0EsK0JBQUssT0FBTCxDQUFhLGVBQWIsRUFBOEI7QUFDMUIsa0NBQU07QUFEb0IseUJBQTlCO0FBSUg7O0FBRUQ7QUFDQSx3QkFBRyxjQUFjLE1BQWQsSUFBd0IsT0FBM0IsRUFBb0M7QUFDaEMsK0JBQUssU0FBTCxDQUFlLGNBQWMsSUFBN0I7QUFDSDs7QUFFRDtBQUNBLHdCQUFHLGNBQWMsTUFBZCxJQUF3QixTQUEzQixFQUFzQztBQUNsQywrQkFBSyxjQUFMLENBQW9CLGNBQWMsSUFBbEM7QUFDSDs7QUFFRDtBQUNBLHdCQUFHLGNBQWMsTUFBZCxJQUF3QixjQUEzQixFQUEyQztBQUN2QywrQkFBSyxVQUFMLENBQWdCLGNBQWMsSUFBOUIsRUFBb0MsY0FBYyxLQUFsRDtBQUNIO0FBRUo7QUFFSixhQTVDRDs7QUE4Q0E7Ozs7QUFJQSxtQkFBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVBOzs7Ozs7Ozs7QUFTQSxtQkFBSyxPQUFMLEdBQWUsWUFBTTs7QUFFakIsb0JBQUcsQ0FBQyxPQUFLLFNBQVQsRUFBb0I7O0FBRWhCLHdCQUFHLENBQUMsV0FBVyxNQUFmLEVBQXVCO0FBQ25CLDJDQUFpQixTQUFqQixFQUE0QixPQUE1QixFQUFxQyxJQUFJLEtBQUosQ0FBVSw4RkFBVixDQUFyQztBQUNIOztBQUVEO0FBQ0EsK0JBQVcsTUFBWCxDQUFrQixXQUFsQixDQUE4QjtBQUMxQixpQ0FBUyxPQUFLLFNBRFk7QUFFMUIsa0NBQVUsT0FBSztBQUZXLHFCQUE5Qjs7QUFLQTtBQUNBLCtCQUFXLE1BQVgsQ0FBa0IsU0FBbEIsQ0FBNEI7QUFDeEIsa0NBQVUsQ0FBQyxPQUFLLE9BQU4sQ0FEYztBQUV4QixzQ0FBYztBQUZVLHFCQUE1QjtBQUtIO0FBRUosYUF0QkQ7O0FBd0JBOzs7QUFHQSxtQkFBSyxNQUFMLEdBQWMsWUFBTTs7QUFFaEIsb0JBQUcsV0FBSCxFQUFnQjtBQUNaLDJCQUFLLE9BQUw7QUFDSDtBQUVKLGFBTkQ7O0FBUUE7OztBQUdBLG1CQUFLLEtBQUwsR0FBYSxZQUFNOztBQUVmLG9CQUFHLFNBQVMsUUFBWixFQUFzQjtBQUNsQiwyQkFBTyxPQUFLLE1BQUwsRUFBUDtBQUNILGlCQUZELE1BRU87O0FBRUgsMEJBQU0sSUFBTixDQUFXLFNBQVMsT0FBVCxHQUFtQixPQUE5QixFQUF1QztBQUNuQyxpQ0FBUyxTQUFTLE9BRGlCO0FBRW5DLDhCQUFNLFNBQVMsSUFGb0I7QUFHbkMsaUNBQVMsT0FBSyxPQUhxQjtBQUluQyxrQ0FBVSxXQUFXLEVBQVgsQ0FBYztBQUpXLHFCQUF2QyxFQU1DLElBTkQsQ0FNTSxVQUFDLFFBQUQsRUFBYztBQUNoQiwrQkFBSyxNQUFMO0FBQ0gscUJBUkQsRUFTQyxLQVRELENBU08sVUFBQyxLQUFELEVBQVc7O0FBRWQsMkNBQWlCLFNBQWpCLEVBQTRCLE1BQTVCLEVBQW9DLElBQUksS0FBSixDQUFVLHVFQUFWLENBQXBDLEVBQXdIO0FBQ3BILG1DQUFPO0FBRDZHLHlCQUF4SDtBQUlILHFCQWZEO0FBaUJIO0FBRUosYUF6QkQ7O0FBMkJBLGdCQUFHLFNBQUgsRUFBYztBQUNWLHVCQUFLLEtBQUw7QUFDSCxhQUZELE1BRU87QUFDSCx1QkFBSyxNQUFMO0FBQ0g7O0FBRUQsdUJBQVcsS0FBWCxDQUFpQixPQUFLLE9BQXRCOztBQXZWOEU7QUF5VmpGOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7QUFqcUJ5QztBQUFBO0FBQUEsaUNBOHFCcEMsS0E5cUJvQyxFQThxQjdCLElBOXFCNkIsRUE4cUJ2QjtBQUFBOztBQUVkO0FBQ0Esb0JBQUksVUFBVTtBQUNWLDBCQUFNLElBREksRUFDYTtBQUN2Qiw0QkFBUSxXQUFXLEVBQVgsQ0FBYyxJQUZaLEVBRW9CO0FBQzlCLDBCQUFNLElBSEksQ0FHYTtBQUhiLGlCQUFkOztBQU1BO0FBQ0EscUJBQUssY0FBTCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxVQUFDLElBQUQsRUFBVTtBQUN6Qyx5QkFBSyxJQUFMLEVBQVcsT0FBWDtBQUNILGlCQUZELEVBRUcsVUFBQyxHQUFELEVBQU0sT0FBTixFQUFrQjs7QUFFakI7QUFDQTtBQUNBO0FBQ0EsMkJBQU8sUUFBUSxJQUFmOztBQUVBOztBQUVBO0FBQ0EsMkJBQUssTUFBTCxDQUFZLEtBQVosSUFBcUIsT0FBSyxNQUFMLENBQVksS0FBWixLQUFzQixJQUFJLEtBQUosU0FBZ0IsS0FBaEIsQ0FBM0M7O0FBRUEsMkJBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsT0FBbkIsQ0FBMkIsT0FBM0I7QUFFSCxpQkFoQkQ7QUFrQkg7O0FBRUQ7Ozs7Ozs7QUE1c0J5QztBQUFBO0FBQUEsb0NBbXRCakMsS0FudEJpQyxFQW10QjFCLE9BbnRCMEIsRUFtdEJqQjtBQUFBOztBQUVwQixvQkFBRyxRQUFPLE9BQVAseUNBQU8sT0FBUCxNQUFrQixRQUFyQixFQUErQjs7QUFFM0I7QUFDQSx3QkFBRyxDQUFDLFFBQVEsSUFBWixFQUFrQjtBQUNkLGdDQUFRLElBQVIsR0FBZSxJQUFmO0FBQ0g7O0FBRUQ7QUFDQSx3QkFBRyxRQUFRLE1BQVIsSUFBa0IsV0FBVyxLQUFYLENBQWlCLFFBQVEsTUFBekIsQ0FBckIsRUFBdUQ7QUFDbkQsZ0NBQVEsTUFBUixHQUFpQixXQUFXLEtBQVgsQ0FBaUIsUUFBUSxNQUF6QixDQUFqQjtBQUNIO0FBRUo7O0FBRUQ7QUFDQSxxQkFBSyxjQUFMLENBQW9CLElBQXBCLEVBQTBCLEtBQTFCLEVBQWlDLFVBQUMsSUFBRCxFQUFVO0FBQ3ZDLHlCQUFLLElBQUwsRUFBVyxPQUFYO0FBQ0gsaUJBRkQsRUFFRyxVQUFDLEdBQUQsRUFBTSxPQUFOLEVBQWtCOztBQUVqQjtBQUNBLDJCQUFLLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLE9BQWxCO0FBRUgsaUJBUEQ7QUFTSDs7QUFFRDs7Ozs7Ozs7QUEvdUJ5QztBQUFBO0FBQUEsdUNBdXZCOUIsSUF2dkI4QixFQXV2QnhCLEtBdnZCd0IsRUF1dkJqQjs7QUFFcEI7QUFDQTtBQUNBLDJCQUFXLEtBQVgsQ0FBaUIsSUFBakIsSUFBeUIsV0FBVyxLQUFYLENBQWlCLElBQWpCLEtBQTBCLElBQUksSUFBSixDQUFTLElBQVQsQ0FBbkQ7O0FBRUE7QUFDQSwyQkFBVyxLQUFYLENBQWlCLElBQWpCLEVBQXVCLE9BQXZCLENBQStCLElBQS9CLEVBQXFDLEtBQXJDOztBQUVBO0FBQ0Esb0JBQUcsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQUosRUFBc0I7O0FBRWxCOzs7Ozs7Ozs7Ozs7OztBQWNBLHlCQUFLLE9BQUwsQ0FBYSxlQUFiLEVBQThCO0FBQzFCLDhCQUFNLFdBQVcsS0FBWCxDQUFpQixJQUFqQjtBQURvQixxQkFBOUI7QUFJSDs7QUFFRDtBQUNBLHFCQUFLLEtBQUwsQ0FBVyxJQUFYLElBQW1CLFdBQVcsS0FBWCxDQUFpQixJQUFqQixDQUFuQjs7QUFFQTtBQUNBLHVCQUFPLFdBQVcsS0FBWCxDQUFpQixJQUFqQixDQUFQO0FBRUg7O0FBRUQ7Ozs7Ozs7QUEveEJ5QztBQUFBO0FBQUEsdUNBcXlCOUIsSUFyeUI4QixFQXF5QnhCLEtBcnlCd0IsRUFxeUJqQjs7QUFFcEI7QUFDQSwyQkFBVyxLQUFYLENBQWlCLElBQWpCLElBQXlCLFdBQVcsS0FBWCxDQUFpQixJQUFqQixLQUEwQixJQUFJLElBQUosQ0FBUyxJQUFULENBQW5EOztBQUVBO0FBQ0Esb0JBQUcsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQUosRUFBc0I7QUFDbEI7QUFDQSx5QkFBSyxVQUFMLENBQWdCLElBQWhCLEVBQXNCLEtBQXRCO0FBQ0g7O0FBRUQ7QUFDQSxxQkFBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixNQUFqQixDQUF3QixLQUF4QixFQUErQixJQUEvQjs7QUFFQTs7Ozs7Ozs7Ozs7QUFXQSxxQkFBSyxPQUFMLENBQWEsU0FBYixFQUF3QjtBQUNwQiwwQkFBTSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBRGM7QUFFcEIsMkJBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixLQUFqQixDQUF1QixJQUF2QjtBQUZhLGlCQUF4QjtBQUtIOztBQUVEOzs7Ozs7QUFyMEJ5QztBQUFBO0FBQUEsb0NBMDBCakM7O0FBRUosMkJBQVcsTUFBWCxDQUFrQixXQUFsQixDQUE4QjtBQUMxQiw4QkFBVSxDQUFDLEtBQUssT0FBTjtBQURnQixpQkFBOUI7QUFJSDs7QUFFRDs7Ozs7QUFsMUJ5QztBQUFBO0FBQUEsc0NBdTFCL0IsSUF2MUIrQixFQXUxQnpCOztBQUVaO0FBQ0Esb0JBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFILEVBQXFCOztBQUVqQjs7QUFFQTs7Ozs7Ozs7Ozs7QUFXQSx5QkFBSyxPQUFMLENBQWEsaUJBQWIsRUFBZ0M7QUFDNUIsOEJBQU0sS0FBSyxLQUFMLENBQVcsSUFBWDtBQURzQixxQkFBaEM7O0FBSUE7QUFDQSwyQkFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQVA7O0FBRUE7QUFDQTtBQUVILGlCQXpCRCxNQXlCTzs7QUFFSDtBQUNBOztBQUVBO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7O0FBNTNCeUM7QUFBQTtBQUFBLDJDQWs0QjFCLElBbDRCMEIsRUFrNEJwQjs7QUFFakI7QUFDQSxvQkFBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQUgsRUFBcUI7O0FBRWpCOzs7Ozs7Ozs7Ozs7O0FBYUEseUJBQUssT0FBTCxDQUFhLHNCQUFiLEVBQXFDO0FBQ2pDLDhCQUFNLEtBQUssS0FBTCxDQUFXLElBQVg7QUFEMkIscUJBQXJDO0FBSUg7QUFFSjs7QUFFRDs7Ozs7Ozs7OztBQTU1QnlDO0FBQUE7QUFBQSwyQ0FzNkIxQixRQXQ2QjBCLEVBczZCaEIsS0F0NkJnQixFQXM2QlQsS0F0NkJTLEVBczZCRixJQXQ2QkUsRUFzNkJJOztBQUV6QztBQUNBO0FBQ0Esb0JBQUksZUFBZSxFQUFuQjs7QUFFQTtBQUNBLDZCQUFhLElBQWIsQ0FBa0IsS0FBbEI7O0FBRUE7QUFDQSxxQkFBSSxJQUFJLENBQVIsSUFBYSxLQUFLLE9BQWxCLEVBQTJCOztBQUV2QjtBQUNBO0FBQ0Esd0JBQUcsS0FBSyxPQUFMLENBQWEsQ0FBYixFQUFnQixVQUFoQixJQUNJLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsVUFBaEIsQ0FBMkIsUUFBM0IsQ0FESixJQUVJLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsVUFBaEIsQ0FBMkIsUUFBM0IsRUFBcUMsS0FBckMsQ0FGUCxFQUVvRDs7QUFFaEQ7QUFDQSxxQ0FBYSxJQUFiLENBQ0ksS0FBSyxPQUFMLENBQWEsQ0FBYixFQUFnQixVQUFoQixDQUEyQixRQUEzQixFQUFxQyxLQUFyQyxDQURKO0FBRUg7QUFFSjs7QUFFRDtBQUNBO0FBQ0E7QUFDQSwwQkFBVSxZQUFWLEVBQXdCLElBQXhCO0FBRUg7O0FBRUQ7Ozs7Ozs7QUF0OEJ5QztBQUFBO0FBQUEscUNBNjhCaEMsS0E3OEJnQyxFQTY4QnpCOztBQUVaLDJCQUFXLE1BQVgsQ0FBa0IsUUFBbEIsQ0FDSTtBQUNJLDJCQUFPLEtBRFg7QUFFSSw4QkFBVSxDQUFDLEtBQUssT0FBTjtBQUZkLGlCQURKLEVBS0ksVUFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUNsQjtBQUNILGlCQVBMO0FBVUg7QUF6OUJ3QztBQUFBO0FBQUEsZ0RBMjlCckI7O0FBRWhCOzs7Ozs7OztBQVFBLHFCQUFLLFNBQUwsR0FBaUIsSUFBakI7O0FBRUEscUJBQUssT0FBTCxDQUFhLGFBQWI7O0FBRUE7QUFDQTtBQUNBLDJCQUFXLE1BQVgsQ0FBa0IsT0FBbEIsQ0FBMEI7QUFDdEIsOEJBQVUsQ0FBQyxLQUFLLE9BQU4sQ0FEWTtBQUV0QixrQ0FBYyxJQUZRO0FBR3RCLGtDQUFjO0FBSFEsaUJBQTFCLEVBSUcsS0FBSyxTQUpSO0FBTUg7QUFqL0J3Qzs7QUFBQTtBQUFBLE1Bb1UxQixPQXBVMEI7O0FBbS9CNUM7O0FBRUQ7Ozs7Ozs7Ozs7QUFyL0I2QyxRQTgvQnZDLElBOS9CdUM7QUFBQTs7QUFnZ0N6QyxzQkFBWSxJQUFaLEVBQXdEO0FBQUEsZ0JBQXRDLEtBQXNDLHVFQUE5QixFQUE4QjtBQUFBLGdCQUExQixJQUEwQix1RUFBbkIsV0FBVyxNQUFROztBQUFBOztBQUlwRDs7Ozs7O0FBSm9EOztBQVdwRCxtQkFBSyxJQUFMLEdBQVksSUFBWjs7QUFFQTs7Ozs7QUFNQSxtQkFBSyxNQUFMLEdBQWMsRUFBZDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxtQkFBSyxLQUFMLEdBQWEsRUFBYjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTtBQUNBLG1CQUFLLElBQUwsR0FBWSxJQUFJLElBQUosQ0FDUixDQUFDLFdBQVcsTUFBWCxDQUFrQixPQUFuQixFQUE0QixNQUE1QixFQUFvQyxJQUFwQyxFQUEwQyxPQUExQyxFQUFtRCxNQUFuRCxFQUEyRCxJQUEzRCxDQUFnRSxHQUFoRSxDQURRLEVBQzhELEtBRDlELEVBQ3FFLE9BQUssV0FBTCxDQUFpQixJQUFqQixJQUF5QixJQUQ5RixDQUFaOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLG1CQUFLLE1BQUwsR0FBYyxJQUFJLElBQUosQ0FDVixDQUFDLFdBQVcsTUFBWCxDQUFrQixPQUFuQixFQUE0QixNQUE1QixFQUFvQyxJQUFwQyxFQUEwQyxRQUExQyxFQUFvRCxRQUFwRCxFQUE4RCxJQUE5RCxDQUFtRSxHQUFuRSxDQURVLEVBQytELEtBRC9ELEVBQ3NFLE9BQUssV0FBTCxDQUFpQixJQUFqQixJQUF5QixJQUQvRixDQUFkOztBQUdBO0FBQ0E7QUFDQSxnQkFBRyxDQUFDLFdBQVcsS0FBWCxDQUFpQixJQUFqQixDQUFKLEVBQTRCO0FBQ3hCLDJCQUFXLEtBQVgsQ0FBaUIsSUFBakI7QUFDSDs7QUFFRDtBQUNBLG1CQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLElBQW5COztBQXhGb0Q7QUEwRnZEOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7QUE1bEN5QztBQUFBO0FBQUEsb0NBeW1DVDtBQUFBLG9CQUExQixJQUEwQix1RUFBbkIsV0FBVyxNQUFROztBQUM1Qix1QkFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFLLE9BQWpCLEtBQTZCLEVBQXBDO0FBQ0g7O0FBRUQ7Ozs7OztBQTdtQ3lDO0FBQUE7QUFBQSxtQ0FrbkNsQyxLQWxuQ2tDLEVBa25DRDtBQUFBLG9CQUExQixJQUEwQix1RUFBbkIsV0FBVyxNQUFROztBQUNwQyxvQkFBSSxZQUFZLEtBQUssS0FBTCxDQUFXLElBQVgsS0FBb0IsRUFBcEM7QUFDQSxxQkFBSyxNQUFMLENBQVksS0FBSyxPQUFqQixJQUE0QixPQUFPLE1BQVAsQ0FBYyxTQUFkLEVBQXlCLEtBQXpCLENBQTVCO0FBQ0g7O0FBRUQ7Ozs7O0FBdm5DeUM7QUFBQTtBQUFBLG1DQTRuQ2xDLEtBNW5Da0MsRUE0bkMzQixJQTVuQzJCLEVBNG5DckI7QUFDaEIscUJBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsSUFBbkI7QUFDSDs7QUFFRDs7Ozs7QUFob0N5QztBQUFBO0FBQUEsb0NBcW9DakMsSUFyb0NpQyxFQXFvQzNCLEtBcm9DMkIsRUFxb0NwQjs7QUFFakI7QUFDQSxxQkFBSyxLQUFMLENBQVcsS0FBSyxPQUFoQixJQUEyQixJQUEzQjs7QUFFQTtBQUNBLHFCQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLElBQW5CO0FBQ0g7QUE1b0N3Qzs7QUFBQTtBQUFBLE1BOC9CMUIsT0E5L0IwQjs7QUFncEM3Qzs7Ozs7Ozs7Ozs7QUFocEM2QyxRQTBwQ3ZDLEVBMXBDdUM7QUFBQTs7QUE0cEN6QyxvQkFBWSxJQUFaLEVBQWtCLFFBQWxCLEVBQTRCO0FBQUE7O0FBQUEsaUhBR2xCLElBSGtCOztBQUV4Qjs7O0FBR0EsbUJBQUssUUFBTCxHQUFnQixRQUFoQjs7QUFMd0I7QUFPM0I7O0FBRUQ7OztBQXJxQ3lDO0FBQUE7QUFBQSxtQ0FzcUNsQyxLQXRxQ2tDLEVBc3FDM0IsSUF0cUMyQixFQXNxQ3JCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLCtHQUFhLEtBQWIsRUFBb0IsSUFBcEI7QUFFSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE5cUN5QztBQUFBO0FBQUEsbUNBOHJDbEMsS0E5ckNrQyxFQThyQ0Q7QUFBQSxvQkFBMUIsSUFBMEIsdUVBQW5CLFdBQVcsTUFBUTs7O0FBRXBDO0FBQ0EsK0dBQWEsS0FBYixFQUFvQixJQUFwQjs7QUFFQTtBQUNBLHFCQUFLLFFBQUwsQ0FBYyxLQUFkO0FBRUg7QUF0c0N3Qzs7QUFBQTtBQUFBLE1BMHBDNUIsSUExcEM0Qjs7QUEwc0M3Qzs7Ozs7OztBQU1BLFFBQU0sT0FBTyxTQUFQLElBQU8sR0FBVzs7QUFFcEI7QUFDQSxxQkFBYSxJQUFJLFdBQUosRUFBYjs7QUFFQTs7OztBQUlBLG1CQUFXLEtBQVgsR0FBbUIsRUFBbkI7O0FBRUE7Ozs7QUFJQSxtQkFBVyxLQUFYLEdBQW1CLEVBQW5COztBQUVBOzs7OztBQUtBLG1CQUFXLE1BQVgsR0FBb0IsS0FBcEI7O0FBRUE7Ozs7O0FBS0EsbUJBQVcsRUFBWCxHQUFnQixLQUFoQjs7QUFFQTs7Ozs7QUFLQSxtQkFBVyxNQUFYLEdBQW9CLEtBQXBCOztBQUVBOzs7OztBQUtBLG1CQUFXLEtBQVgsR0FBbUIsS0FBbkI7O0FBRUE7Ozs7Ozs7OztBQVNBLG1CQUFXLE9BQVgsR0FBcUIsVUFBUyxJQUFULEVBQXNEO0FBQUEsZ0JBQXZDLEtBQXVDLHVFQUEvQixFQUErQjs7QUFBQTs7QUFBQSxnQkFBM0IsT0FBMkIsdUVBQWpCLEtBQWlCO0FBQUEsZ0JBQVYsUUFBVTs7O0FBRXZFO0FBQ0E7O0FBRUEscUJBQVMsSUFBVCxHQUFnQixJQUFoQjs7QUFFQSxnQkFBSSxXQUFXLFNBQVgsUUFBVyxHQUFNOztBQUVqQix1QkFBSyxNQUFMLEdBQWMsSUFBSSxNQUFKLENBQVcsUUFBWCxDQUFkOztBQUVBO0FBQ0E7QUFDQSx1QkFBSyxNQUFMLEdBQWMsSUFBSSxJQUFKLENBQVMsU0FBUyxhQUFsQixFQUFpQyxLQUFqQyxFQUF3QyxJQUF4QyxDQUFkOztBQUVBO0FBQ0EsdUJBQUssRUFBTCxHQUFVLElBQUksRUFBSixDQUFPLFNBQVMsSUFBaEIsRUFBc0IsUUFBdEIsQ0FBVjs7QUFFQTtBQUNBLHVCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLFNBQVMsSUFBaEMsRUFBc0MsS0FBdEM7O0FBRUEsdUJBQUssRUFBTCxDQUFRLE1BQVIsQ0FBZSxLQUFmOztBQUVBOzs7O0FBSUEsdUJBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxhQUFmLEVBQThCLFlBQU07O0FBRWhDLDJCQUFLLEtBQUwsQ0FBVyxTQUFYLEVBQXNCO0FBQ2xCLDRCQUFJLE9BQUs7QUFEUyxxQkFBdEI7O0FBSUEsMkJBQUssS0FBTCxHQUFhLElBQWI7QUFFSCxpQkFSRDs7QUFZQTs7Ozs7QUFNQSx1QkFBSyxNQUFMLENBQVksV0FBWixDQUF3QjtBQUNwQiw0QkFBUSxnQkFBQyxXQUFELEVBQWlCOztBQUVyQjs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTtBQUNBLDRCQUFJLE1BQU07QUFDTixtREFBdUIsV0FEakI7QUFFTixxREFBeUIsY0FGbkI7QUFHTix1REFBMkIsWUFIckI7QUFJTixxREFBeUIsZ0JBSm5CO0FBS04sbURBQXVCLGNBTGpCO0FBTU4sc0RBQTBCLGFBTnBCO0FBT04sMkRBQStCLGdCQVB6QjtBQVFOLG9EQUF3QixpQkFSbEI7QUFTTix5REFBNkIsaUJBVHZCO0FBVU4saURBQXFCO0FBVmYseUJBQVY7O0FBYUEsNEJBQUksWUFBWSxDQUFDLEdBQUQsRUFBTSxTQUFOLEVBQWlCLElBQUksWUFBWSxRQUFoQixLQUE0QixXQUE3QyxFQUEwRCxJQUExRCxDQUErRCxHQUEvRCxDQUFoQjs7QUFFQSw0QkFBRyxZQUFZLGdCQUFmLEVBQWlDOztBQUU3Qix3Q0FBWSxnQkFBWixDQUE2QixPQUE3QixDQUFxQyxVQUFDLE9BQUQsRUFBYTs7QUFFOUMsb0NBQUksT0FBTyxXQUFXLEtBQVgsQ0FBaUIsT0FBakIsQ0FBWDs7QUFFQSxvQ0FBRyxJQUFILEVBQVM7O0FBRUw7QUFDQSx3Q0FBSSxZQUFZLFFBQVosS0FBeUIscUJBQTdCLEVBQW9EO0FBQ2hELDZDQUFLLGlCQUFMO0FBQ0g7O0FBRUQ7QUFDQSx5Q0FBSyxPQUFMLENBQWEsU0FBYixFQUF3QixXQUF4QjtBQUdILGlDQVhELE1BV087O0FBRUgsMkNBQUssS0FBTCxDQUFXLFNBQVgsRUFBc0IsV0FBdEI7QUFFSDtBQUVKLDZCQXJCRDtBQXVCSCx5QkF6QkQsTUF5Qk87O0FBRUgsbUNBQUssS0FBTCxDQUFXLFNBQVgsRUFBc0IsV0FBdEI7QUFFSDtBQUVKO0FBcEdtQixpQkFBeEI7QUF3R0gsYUE5SUQ7O0FBZ0pBLGdCQUFHLFNBQVMsUUFBWixFQUFzQjtBQUNsQjtBQUNILGFBRkQsTUFFTzs7QUFFSCx5QkFBUyxPQUFULEdBQW1CLE9BQW5COztBQUlBLHNCQUFNLElBQU4sQ0FBVyxTQUFTLE9BQVQsR0FBbUIsT0FBOUIsRUFBdUM7QUFDbkMsMEJBQU0sU0FBUyxJQURvQjtBQUVuQyw2QkFBUyxTQUFTLGFBRmlCO0FBR25DLDhCQUFVLEtBQUssRUFBTCxDQUFRO0FBSGlCLGlCQUF2QyxFQUtDLElBTEQsQ0FLTSxVQUFDLFFBQUQsRUFBYzs7QUFFaEI7QUFFSCxpQkFURCxFQVVDLEtBVkQsQ0FVTyxVQUFDLEtBQUQsRUFBVzs7QUFFZDs7OztBQUlBLHVDQUFpQixPQUFqQixFQUEwQixNQUExQixFQUFrQyxJQUFJLEtBQUosQ0FBVSx1REFBcUQsU0FBUyxPQUE5RCxHQUFzRSxJQUFoRixDQUFsQyxFQUF5SDtBQUNySCwrQkFBTztBQUQ4RyxxQkFBekg7QUFJSCxpQkFwQkQ7QUFzQkg7QUFFSixTQXZMRDs7QUF5TEE7Ozs7OztBQU1BLG1CQUFXLElBQVgsR0FBa0IsSUFBbEI7O0FBRUE7Ozs7OztBQU1BLG1CQUFXLElBQVgsR0FBa0IsSUFBbEI7O0FBRUE7QUFDQSxtQkFBVyxRQUFYLEdBQXNCLFVBQUMsRUFBRCxFQUFLLFNBQUwsRUFBZ0IsT0FBaEIsRUFBNEI7O0FBRTlDO0FBQ0E7QUFDQSxlQUFHLFNBQUgsSUFBZ0IsT0FBaEI7O0FBRUE7QUFDQTtBQUNBLG9CQUFRLE1BQVIsR0FBaUIsRUFBakI7QUFFSCxTQVZEOztBQVlBLGVBQU8sVUFBUDtBQUVILEtBOVFEOztBQWdSQTtBQUNBLFdBQU8sTUFBUDtBQUVILENBbitDRDs7QUFxK0NBO0FBQ0EsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsWUFBUSxFQURLLEVBQ0E7QUFDYixZQUFRO0FBRkssQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBhc3luY2lmeTtcblxudmFyIF9pc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc09iamVjdCcpO1xuXG52YXIgX2lzT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzT2JqZWN0KTtcblxudmFyIF9pbml0aWFsUGFyYW1zID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9pbml0aWFsUGFyYW1zJyk7XG5cbnZhciBfaW5pdGlhbFBhcmFtczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pbml0aWFsUGFyYW1zKTtcblxudmFyIF9zZXRJbW1lZGlhdGUgPSByZXF1aXJlKCcuL2ludGVybmFsL3NldEltbWVkaWF0ZScpO1xuXG52YXIgX3NldEltbWVkaWF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zZXRJbW1lZGlhdGUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIFRha2UgYSBzeW5jIGZ1bmN0aW9uIGFuZCBtYWtlIGl0IGFzeW5jLCBwYXNzaW5nIGl0cyByZXR1cm4gdmFsdWUgdG8gYVxuICogY2FsbGJhY2suIFRoaXMgaXMgdXNlZnVsIGZvciBwbHVnZ2luZyBzeW5jIGZ1bmN0aW9ucyBpbnRvIGEgd2F0ZXJmYWxsLFxuICogc2VyaWVzLCBvciBvdGhlciBhc3luYyBmdW5jdGlvbnMuIEFueSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBnZW5lcmF0ZWRcbiAqIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uIChleGNlcHQgZm9yIHRoZSBmaW5hbFxuICogY2FsbGJhY2sgYXJndW1lbnQpLiBFcnJvcnMgdGhyb3duIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBjYWxsYmFjay5cbiAqXG4gKiBJZiB0aGUgZnVuY3Rpb24gcGFzc2VkIHRvIGBhc3luY2lmeWAgcmV0dXJucyBhIFByb21pc2UsIHRoYXQgcHJvbWlzZXMnc1xuICogcmVzb2x2ZWQvcmVqZWN0ZWQgc3RhdGUgd2lsbCBiZSB1c2VkIHRvIGNhbGwgdGhlIGNhbGxiYWNrLCByYXRoZXIgdGhhbiBzaW1wbHlcbiAqIHRoZSBzeW5jaHJvbm91cyByZXR1cm4gdmFsdWUuXG4gKlxuICogVGhpcyBhbHNvIG1lYW5zIHlvdSBjYW4gYXN5bmNpZnkgRVMyMDE3IGBhc3luY2AgZnVuY3Rpb25zLlxuICpcbiAqIEBuYW1lIGFzeW5jaWZ5XG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgbW9kdWxlOlV0aWxzXG4gKiBAbWV0aG9kXG4gKiBAYWxpYXMgd3JhcFN5bmNcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gVGhlIHN5bmNocm9ub3VzIGZ1bmN0aW9uLCBvciBQcm9taXNlLXJldHVybmluZ1xuICogZnVuY3Rpb24gdG8gY29udmVydCB0byBhbiB7QGxpbmsgQXN5bmNGdW5jdGlvbn0uXG4gKiBAcmV0dXJucyB7QXN5bmNGdW5jdGlvbn0gQW4gYXN5bmNocm9ub3VzIHdyYXBwZXIgb2YgdGhlIGBmdW5jYC4gVG8gYmVcbiAqIGludm9rZWQgd2l0aCBgKGFyZ3MuLi4sIGNhbGxiYWNrKWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIHBhc3NpbmcgYSByZWd1bGFyIHN5bmNocm9ub3VzIGZ1bmN0aW9uXG4gKiBhc3luYy53YXRlcmZhbGwoW1xuICogICAgIGFzeW5jLmFwcGx5KGZzLnJlYWRGaWxlLCBmaWxlbmFtZSwgXCJ1dGY4XCIpLFxuICogICAgIGFzeW5jLmFzeW5jaWZ5KEpTT04ucGFyc2UpLFxuICogICAgIGZ1bmN0aW9uIChkYXRhLCBuZXh0KSB7XG4gKiAgICAgICAgIC8vIGRhdGEgaXMgdGhlIHJlc3VsdCBvZiBwYXJzaW5nIHRoZSB0ZXh0LlxuICogICAgICAgICAvLyBJZiB0aGVyZSB3YXMgYSBwYXJzaW5nIGVycm9yLCBpdCB3b3VsZCBoYXZlIGJlZW4gY2F1Z2h0LlxuICogICAgIH1cbiAqIF0sIGNhbGxiYWNrKTtcbiAqXG4gKiAvLyBwYXNzaW5nIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcHJvbWlzZVxuICogYXN5bmMud2F0ZXJmYWxsKFtcbiAqICAgICBhc3luYy5hcHBseShmcy5yZWFkRmlsZSwgZmlsZW5hbWUsIFwidXRmOFwiKSxcbiAqICAgICBhc3luYy5hc3luY2lmeShmdW5jdGlvbiAoY29udGVudHMpIHtcbiAqICAgICAgICAgcmV0dXJuIGRiLm1vZGVsLmNyZWF0ZShjb250ZW50cyk7XG4gKiAgICAgfSksXG4gKiAgICAgZnVuY3Rpb24gKG1vZGVsLCBuZXh0KSB7XG4gKiAgICAgICAgIC8vIGBtb2RlbGAgaXMgdGhlIGluc3RhbnRpYXRlZCBtb2RlbCBvYmplY3QuXG4gKiAgICAgICAgIC8vIElmIHRoZXJlIHdhcyBhbiBlcnJvciwgdGhpcyBmdW5jdGlvbiB3b3VsZCBiZSBza2lwcGVkLlxuICogICAgIH1cbiAqIF0sIGNhbGxiYWNrKTtcbiAqXG4gKiAvLyBlczIwMTcgZXhhbXBsZSwgdGhvdWdoIGBhc3luY2lmeWAgaXMgbm90IG5lZWRlZCBpZiB5b3VyIEpTIGVudmlyb25tZW50XG4gKiAvLyBzdXBwb3J0cyBhc3luYyBmdW5jdGlvbnMgb3V0IG9mIHRoZSBib3hcbiAqIHZhciBxID0gYXN5bmMucXVldWUoYXN5bmMuYXN5bmNpZnkoYXN5bmMgZnVuY3Rpb24oZmlsZSkge1xuICogICAgIHZhciBpbnRlcm1lZGlhdGVTdGVwID0gYXdhaXQgcHJvY2Vzc0ZpbGUoZmlsZSk7XG4gKiAgICAgcmV0dXJuIGF3YWl0IHNvbWVQcm9taXNlKGludGVybWVkaWF0ZVN0ZXApXG4gKiB9KSk7XG4gKlxuICogcS5wdXNoKGZpbGVzKTtcbiAqL1xuZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgIHJldHVybiAoMCwgX2luaXRpYWxQYXJhbXMyLmRlZmF1bHQpKGZ1bmN0aW9uIChhcmdzLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICBpZiAoKDAsIF9pc09iamVjdDIuZGVmYXVsdCkocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGludm9rZUNhbGxiYWNrKGNhbGxiYWNrLCBudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaW52b2tlQ2FsbGJhY2soY2FsbGJhY2ssIGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGludm9rZUNhbGxiYWNrKGNhbGxiYWNrLCBlcnJvciwgdmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgICBjYWxsYmFjayhlcnJvciwgdmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgKDAsIF9zZXRJbW1lZGlhdGUyLmRlZmF1bHQpKHJldGhyb3csIGUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmV0aHJvdyhlcnJvcikge1xuICAgIHRocm93IGVycm9yO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSAvKi4uLmFyZ3MsIGNhbGxiYWNrKi97XG4gICAgICAgIHZhciBhcmdzID0gKDAsIF9zbGljZTIuZGVmYXVsdCkoYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCBhcmdzLCBjYWxsYmFjayk7XG4gICAgfTtcbn07XG5cbnZhciBfc2xpY2UgPSByZXF1aXJlKCcuL3NsaWNlJyk7XG5cbnZhciBfc2xpY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2xpY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gb25jZTtcbmZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIGNhbGxGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBvbmx5T25jZTtcbmZ1bmN0aW9uIG9ubHlPbmNlKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICB2YXIgY2FsbEZuID0gZm47XG4gICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmhhc05leHRUaWNrID0gZXhwb3J0cy5oYXNTZXRJbW1lZGlhdGUgPSB1bmRlZmluZWQ7XG5leHBvcnRzLmZhbGxiYWNrID0gZmFsbGJhY2s7XG5leHBvcnRzLndyYXAgPSB3cmFwO1xuXG52YXIgX3NsaWNlID0gcmVxdWlyZSgnLi9zbGljZScpO1xuXG52YXIgX3NsaWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NsaWNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGhhc1NldEltbWVkaWF0ZSA9IGV4cG9ydHMuaGFzU2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG52YXIgaGFzTmV4dFRpY2sgPSBleHBvcnRzLmhhc05leHRUaWNrID0gdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nO1xuXG5mdW5jdGlvbiBmYWxsYmFjayhmbikge1xuICAgIHNldFRpbWVvdXQoZm4sIDApO1xufVxuXG5mdW5jdGlvbiB3cmFwKGRlZmVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChmbiAvKiwgLi4uYXJncyovKSB7XG4gICAgICAgIHZhciBhcmdzID0gKDAsIF9zbGljZTIuZGVmYXVsdCkoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgZGVmZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbnZhciBfZGVmZXI7XG5cbmlmIChoYXNTZXRJbW1lZGlhdGUpIHtcbiAgICBfZGVmZXIgPSBzZXRJbW1lZGlhdGU7XG59IGVsc2UgaWYgKGhhc05leHRUaWNrKSB7XG4gICAgX2RlZmVyID0gcHJvY2Vzcy5uZXh0VGljaztcbn0gZWxzZSB7XG4gICAgX2RlZmVyID0gZmFsbGJhY2s7XG59XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHdyYXAoX2RlZmVyKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gc2xpY2U7XG5mdW5jdGlvbiBzbGljZShhcnJheUxpa2UsIHN0YXJ0KSB7XG4gICAgc3RhcnQgPSBzdGFydCB8IDA7XG4gICAgdmFyIG5ld0xlbiA9IE1hdGgubWF4KGFycmF5TGlrZS5sZW5ndGggLSBzdGFydCwgMCk7XG4gICAgdmFyIG5ld0FyciA9IEFycmF5KG5ld0xlbik7XG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbmV3TGVuOyBpZHgrKykge1xuICAgICAgICBuZXdBcnJbaWR4XSA9IGFycmF5TGlrZVtzdGFydCArIGlkeF07XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5pc0FzeW5jID0gdW5kZWZpbmVkO1xuXG52YXIgX2FzeW5jaWZ5ID0gcmVxdWlyZSgnLi4vYXN5bmNpZnknKTtcblxudmFyIF9hc3luY2lmeTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3luY2lmeSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBzdXBwb3J0c1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbic7XG5cbmZ1bmN0aW9uIGlzQXN5bmMoZm4pIHtcbiAgICByZXR1cm4gc3VwcG9ydHNTeW1ib2wgJiYgZm5bU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gJ0FzeW5jRnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiB3cmFwQXN5bmMoYXN5bmNGbikge1xuICAgIHJldHVybiBpc0FzeW5jKGFzeW5jRm4pID8gKDAsIF9hc3luY2lmeTIuZGVmYXVsdCkoYXN5bmNGbikgOiBhc3luY0ZuO1xufVxuXG5leHBvcnRzLmRlZmF1bHQgPSB3cmFwQXN5bmM7XG5leHBvcnRzLmlzQXN5bmMgPSBpc0FzeW5jOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSAoMCwgX29uY2UyLmRlZmF1bHQpKGNhbGxiYWNrIHx8IF9ub29wMi5kZWZhdWx0KTtcbiAgICBpZiAoISgwLCBfaXNBcnJheTIuZGVmYXVsdCkodGFza3MpKSByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKSk7XG4gICAgaWYgKCF0YXNrcy5sZW5ndGgpIHJldHVybiBjYWxsYmFjaygpO1xuICAgIHZhciB0YXNrSW5kZXggPSAwO1xuXG4gICAgZnVuY3Rpb24gbmV4dFRhc2soYXJncykge1xuICAgICAgICB2YXIgdGFzayA9ICgwLCBfd3JhcEFzeW5jMi5kZWZhdWx0KSh0YXNrc1t0YXNrSW5kZXgrK10pO1xuICAgICAgICBhcmdzLnB1c2goKDAsIF9vbmx5T25jZTIuZGVmYXVsdCkobmV4dCkpO1xuICAgICAgICB0YXNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHQoZXJyIC8qLCAuLi5hcmdzKi8pIHtcbiAgICAgICAgaWYgKGVyciB8fCB0YXNrSW5kZXggPT09IHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFRhc2soKDAsIF9zbGljZTIuZGVmYXVsdCkoYXJndW1lbnRzLCAxKSk7XG4gICAgfVxuXG4gICAgbmV4dFRhc2soW10pO1xufTtcblxudmFyIF9pc0FycmF5ID0gcmVxdWlyZSgnbG9kYXNoL2lzQXJyYXknKTtcblxudmFyIF9pc0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzQXJyYXkpO1xuXG52YXIgX25vb3AgPSByZXF1aXJlKCdsb2Rhc2gvbm9vcCcpO1xuXG52YXIgX25vb3AyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbm9vcCk7XG5cbnZhciBfb25jZSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvb25jZScpO1xuXG52YXIgX29uY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfb25jZSk7XG5cbnZhciBfc2xpY2UgPSByZXF1aXJlKCcuL2ludGVybmFsL3NsaWNlJyk7XG5cbnZhciBfc2xpY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2xpY2UpO1xuXG52YXIgX29ubHlPbmNlID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9vbmx5T25jZScpO1xuXG52YXIgX29ubHlPbmNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ubHlPbmNlKTtcblxudmFyIF93cmFwQXN5bmMgPSByZXF1aXJlKCcuL2ludGVybmFsL3dyYXBBc3luYycpO1xuXG52YXIgX3dyYXBBc3luYzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93cmFwQXN5bmMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxuLyoqXG4gKiBSdW5zIHRoZSBgdGFza3NgIGFycmF5IG9mIGZ1bmN0aW9ucyBpbiBzZXJpZXMsIGVhY2ggcGFzc2luZyB0aGVpciByZXN1bHRzIHRvXG4gKiB0aGUgbmV4dCBpbiB0aGUgYXJyYXkuIEhvd2V2ZXIsIGlmIGFueSBvZiB0aGUgYHRhc2tzYCBwYXNzIGFuIGVycm9yIHRvIHRoZWlyXG4gKiBvd24gY2FsbGJhY2ssIHRoZSBuZXh0IGZ1bmN0aW9uIGlzIG5vdCBleGVjdXRlZCwgYW5kIHRoZSBtYWluIGBjYWxsYmFja2AgaXNcbiAqIGltbWVkaWF0ZWx5IGNhbGxlZCB3aXRoIHRoZSBlcnJvci5cbiAqXG4gKiBAbmFtZSB3YXRlcmZhbGxcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBtb2R1bGU6Q29udHJvbEZsb3dcbiAqIEBtZXRob2RcbiAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAqIEBwYXJhbSB7QXJyYXl9IHRhc2tzIC0gQW4gYXJyYXkgb2YgW2FzeW5jIGZ1bmN0aW9uc117QGxpbmsgQXN5bmNGdW5jdGlvbn1cbiAqIHRvIHJ1bi5cbiAqIEVhY2ggZnVuY3Rpb24gc2hvdWxkIGNvbXBsZXRlIHdpdGggYW55IG51bWJlciBvZiBgcmVzdWx0YCB2YWx1ZXMuXG4gKiBUaGUgYHJlc3VsdGAgdmFsdWVzIHdpbGwgYmUgcGFzc2VkIGFzIGFyZ3VtZW50cywgaW4gb3JkZXIsIHRvIHRoZSBuZXh0IHRhc2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gcnVuIG9uY2UgYWxsIHRoZVxuICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBUaGlzIHdpbGwgYmUgcGFzc2VkIHRoZSByZXN1bHRzIG9mIHRoZSBsYXN0IHRhc2snc1xuICogY2FsbGJhY2suIEludm9rZWQgd2l0aCAoZXJyLCBbcmVzdWx0c10pLlxuICogQHJldHVybnMgdW5kZWZpbmVkXG4gKiBAZXhhbXBsZVxuICpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqICAgICB9LFxuICogICAgIGZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNhbGxiYWNrKSB7XG4gKiAgICAgICAgIC8vIGFyZzEgbm93IGVxdWFscyAnb25lJyBhbmQgYXJnMiBub3cgZXF1YWxzICd0d28nXG4gKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogICAgIH0sXG4gKiAgICAgZnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAgICAgLy8gYXJnMSBub3cgZXF1YWxzICd0aHJlZSdcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAqICAgICB9XG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICpcbiAqIC8vIE9yLCB3aXRoIG5hbWVkIGZ1bmN0aW9uczpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgbXlGaXJzdEZ1bmN0aW9uLFxuICogICAgIG15U2Vjb25kRnVuY3Rpb24sXG4gKiAgICAgbXlMYXN0RnVuY3Rpb24sXG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICogZnVuY3Rpb24gbXlGaXJzdEZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gKiAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqIH1cbiAqIGZ1bmN0aW9uIG15U2Vjb25kRnVuY3Rpb24oYXJnMSwgYXJnMiwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogfVxuICogZnVuY3Rpb24gbXlMYXN0RnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ3RocmVlJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICdkb25lJyk7XG4gKiB9XG4gKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBidG9hID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5idG9hICYmIHdpbmRvdy5idG9hLmJpbmQod2luZG93KSkgfHwgcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J0b2EnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgbG9hZEV2ZW50ID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG4gICAgdmFyIHhEb21haW4gPSBmYWxzZTtcblxuICAgIC8vIEZvciBJRSA4LzkgQ09SUyBzdXBwb3J0XG4gICAgLy8gT25seSBzdXBwb3J0cyBQT1NUIGFuZCBHRVQgY2FsbHMgYW5kIGRvZXNuJ3QgcmV0dXJucyB0aGUgcmVzcG9uc2UgaGVhZGVycy5cbiAgICAvLyBET04nVCBkbyB0aGlzIGZvciB0ZXN0aW5nIGIvYyBYTUxIdHRwUmVxdWVzdCBpcyBtb2NrZWQsIG5vdCBYRG9tYWluUmVxdWVzdC5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0JyAmJlxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB3aW5kb3cuWERvbWFpblJlcXVlc3QgJiYgISgnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0KSAmJlxuICAgICAgICAhaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSB7XG4gICAgICByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuICAgICAgbG9hZEV2ZW50ID0gJ29ubG9hZCc7XG4gICAgICB4RG9tYWluID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uIGhhbmRsZVByb2dyZXNzKCkge307XG4gICAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7fTtcbiAgICB9XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0W2xvYWRFdmVudF0gPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IChyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQgJiYgIXhEb21haW4pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIC8vIElFIHNlbmRzIDEyMjMgaW5zdGVhZCBvZiAyMDQgKGh0dHBzOi8vZ2l0aHViLmNvbS9temFicmlza2llL2F4aW9zL2lzc3Vlcy8yMDEpXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAnTm8gQ29udGVudCcgOiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIHZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcblxuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKHV0aWxzLm1lcmdlKGRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gdXRpbHMubWVyZ2Uoe1xuICAgICAgdXJsOiBhcmd1bWVudHNbMF1cbiAgICB9LCBhcmd1bWVudHNbMV0pO1xuICB9XG5cbiAgY29uZmlnID0gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIHRoaXMuZGVmYXVsdHMsIHsgbWV0aG9kOiAnZ2V0JyB9LCBjb25maWcpO1xuICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIFN1cHBvcnQgYmFzZVVSTCBjb25maWdcbiAgaWYgKGNvbmZpZy5iYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKGNvbmZpZy51cmwpKSB7XG4gICAgY29uZmlnLnVybCA9IGNvbWJpbmVVUkxzKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVycyB8fCB7fVxuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGJ0b2EgcG9seWZpbGwgZm9yIElFPDEwIGNvdXJ0ZXN5IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGNoYW1iZXJzL0Jhc2U2NC5qc1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBFKCkge1xuICB0aGlzLm1lc3NhZ2UgPSAnU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyJztcbn1cbkUucHJvdG90eXBlID0gbmV3IEVycm9yO1xuRS5wcm90b3R5cGUuY29kZSA9IDU7XG5FLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cbmZ1bmN0aW9uIGJ0b2EoaW5wdXQpIHtcbiAgdmFyIHN0ciA9IFN0cmluZyhpbnB1dCk7XG4gIHZhciBvdXRwdXQgPSAnJztcbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlclxuICAgIHZhciBibG9jaywgY2hhckNvZGUsIGlkeCA9IDAsIG1hcCA9IGNoYXJzO1xuICAgIC8vIGlmIHRoZSBuZXh0IHN0ciBpbmRleCBkb2VzIG5vdCBleGlzdDpcbiAgICAvLyAgIGNoYW5nZSB0aGUgbWFwcGluZyB0YWJsZSB0byBcIj1cIlxuICAgIC8vICAgY2hlY2sgaWYgZCBoYXMgbm8gZnJhY3Rpb25hbCBkaWdpdHNcbiAgICBzdHIuY2hhckF0KGlkeCB8IDApIHx8IChtYXAgPSAnPScsIGlkeCAlIDEpO1xuICAgIC8vIFwiOCAtIGlkeCAlIDEgKiA4XCIgZ2VuZXJhdGVzIHRoZSBzZXF1ZW5jZSAyLCA0LCA2LCA4XG4gICAgb3V0cHV0ICs9IG1hcC5jaGFyQXQoNjMgJiBibG9jayA+PiA4IC0gaWR4ICUgMSAqIDgpXG4gICkge1xuICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaWR4ICs9IDMgLyA0KTtcbiAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICB0aHJvdyBuZXcgRSgpO1xuICAgIH1cbiAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ0b2E7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgfVxuXG4gICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICB9O1xuICAgIH1cblxuICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICB9O1xuICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICFpc0FycmF5KG9iaikpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0eXBlb2YgcmVzdWx0W2tleV0gPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltXG59O1xuIiwiLyohXHJcbiAqIEV2ZW50RW1pdHRlcjJcclxuICogaHR0cHM6Ly9naXRodWIuY29tL2hpajFueC9FdmVudEVtaXR0ZXIyXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMyBoaWoxbnhcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKi9cclxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcclxuXHJcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5ID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIF9pc0FycmF5KG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgfTtcclxuICB2YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgdGhpcy5fZXZlbnRzID0ge307XHJcbiAgICBpZiAodGhpcy5fY29uZikge1xyXG4gICAgICBjb25maWd1cmUuY2FsbCh0aGlzLCB0aGlzLl9jb25mKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25mKSB7XHJcbiAgICBpZiAoY29uZikge1xyXG4gICAgICB0aGlzLl9jb25mID0gY29uZjtcclxuXHJcbiAgICAgIGNvbmYuZGVsaW1pdGVyICYmICh0aGlzLmRlbGltaXRlciA9IGNvbmYuZGVsaW1pdGVyKTtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGNvbmYubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQgPyBjb25mLm1heExpc3RlbmVycyA6IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbiAgICAgIGNvbmYud2lsZGNhcmQgJiYgKHRoaXMud2lsZGNhcmQgPSBjb25mLndpbGRjYXJkKTtcclxuICAgICAgY29uZi5uZXdMaXN0ZW5lciAmJiAodGhpcy5uZXdMaXN0ZW5lciA9IGNvbmYubmV3TGlzdGVuZXIpO1xyXG4gICAgICBjb25mLnZlcmJvc2VNZW1vcnlMZWFrICYmICh0aGlzLnZlcmJvc2VNZW1vcnlMZWFrID0gY29uZi52ZXJib3NlTWVtb3J5TGVhayk7XHJcblxyXG4gICAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJUcmVlID0ge307XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9nUG9zc2libGVNZW1vcnlMZWFrKGNvdW50LCBldmVudE5hbWUpIHtcclxuICAgIHZhciBlcnJvck1zZyA9ICcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcclxuICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcclxuICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJztcclxuXHJcbiAgICBpZih0aGlzLnZlcmJvc2VNZW1vcnlMZWFrKXtcclxuICAgICAgZXJyb3JNc2cgKz0gJyBFdmVudCBuYW1lOiAlcy4nO1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnLCBjb3VudCwgZXZlbnROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29uc29sZS50cmFjZSl7XHJcbiAgICAgIGNvbnNvbGUudHJhY2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcihjb25mKSB7XHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIHRoaXMubmV3TGlzdGVuZXIgPSBmYWxzZTtcclxuICAgIHRoaXMudmVyYm9zZU1lbW9yeUxlYWsgPSBmYWxzZTtcclxuICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmYpO1xyXG4gIH1cclxuICBFdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjsgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgZm9yIGV4cG9ydGluZyBFdmVudEVtaXR0ZXIgcHJvcGVydHlcclxuXHJcbiAgLy9cclxuICAvLyBBdHRlbnRpb24sIGZ1bmN0aW9uIHJldHVybiB0eXBlIG5vdyBpcyBhcnJheSwgYWx3YXlzICFcclxuICAvLyBJdCBoYXMgemVybyBlbGVtZW50cyBpZiBubyBhbnkgbWF0Y2hlcyBmb3VuZCBhbmQgb25lIG9yIG1vcmVcclxuICAvLyBlbGVtZW50cyAobGVhZnMpIGlmIHRoZXJlIGFyZSBtYXRjaGVzXHJcbiAgLy9cclxuICBmdW5jdGlvbiBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIGkpIHtcclxuICAgIGlmICghdHJlZSkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICB2YXIgbGlzdGVuZXJzPVtdLCBsZWFmLCBsZW4sIGJyYW5jaCwgeFRyZWUsIHh4VHJlZSwgaXNvbGF0ZWRCcmFuY2gsIGVuZFJlYWNoZWQsXHJcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGUubGVuZ3RoLCBjdXJyZW50VHlwZSA9IHR5cGVbaV0sIG5leHRUeXBlID0gdHlwZVtpKzFdO1xyXG4gICAgaWYgKGkgPT09IHR5cGVMZW5ndGggJiYgdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIGV2ZW50KHMpIGxpc3QgYW5kIHRoZSB0cmVlIGhhcyBsaXN0ZW5lcnNcclxuICAgICAgLy8gaW52b2tlIHRob3NlIGxpc3RlbmVycy5cclxuICAgICAgLy9cclxuICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBoYW5kbGVycyAmJiBoYW5kbGVycy5wdXNoKHRyZWUuX2xpc3RlbmVycyk7XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGxlYWYgPSAwLCBsZW4gPSB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoOyBsZWFmIDwgbGVuOyBsZWFmKyspIHtcclxuICAgICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzW2xlYWZdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgoY3VycmVudFR5cGUgPT09ICcqJyB8fCBjdXJyZW50VHlwZSA9PT0gJyoqJykgfHwgdHJlZVtjdXJyZW50VHlwZV0pIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGV2ZW50IGVtaXR0ZWQgaXMgJyonIGF0IHRoaXMgcGFydFxyXG4gICAgICAvLyBvciB0aGVyZSBpcyBhIGNvbmNyZXRlIG1hdGNoIGF0IHRoaXMgcGF0Y2hcclxuICAgICAgLy9cclxuICAgICAgaWYgKGN1cnJlbnRUeXBlID09PSAnKicpIHtcclxuICAgICAgICBmb3IgKGJyYW5jaCBpbiB0cmVlKSB7XHJcbiAgICAgICAgICBpZiAoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgdHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgICB9IGVsc2UgaWYoY3VycmVudFR5cGUgPT09ICcqKicpIHtcclxuICAgICAgICBlbmRSZWFjaGVkID0gKGkrMSA9PT0gdHlwZUxlbmd0aCB8fCAoaSsyID09PSB0eXBlTGVuZ3RoICYmIG5leHRUeXBlID09PSAnKicpKTtcclxuICAgICAgICBpZihlbmRSZWFjaGVkICYmIHRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gVGhlIG5leHQgZWxlbWVudCBoYXMgYSBfbGlzdGVuZXJzLCBhZGQgaXQgdG8gdGhlIGhhbmRsZXJzLlxyXG4gICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcclxuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgaWYoYnJhbmNoID09PSAnKicgfHwgYnJhbmNoID09PSAnKionKSB7XHJcbiAgICAgICAgICAgICAgaWYodHJlZVticmFuY2hdLl9saXN0ZW5lcnMgJiYgIWVuZFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xyXG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIE5vIG1hdGNoIG9uIHRoaXMgb25lLCBzaGlmdCBpbnRvIHRoZSB0cmVlIGJ1dCBub3QgaW4gdGhlIHR5cGUgYXJyYXkuXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2N1cnJlbnRUeXBlXSwgaSsxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgeFRyZWUgPSB0cmVlWycqJ107XHJcbiAgICBpZiAoeFRyZWUpIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHRyZWUgd2lsbCBhbGxvdyBhbnkgbWF0Y2ggZm9yIHRoaXMgcGFydCxcclxuICAgICAgLy8gdGhlbiByZWN1cnNpdmVseSBleHBsb3JlIGFsbCBicmFuY2hlcyBvZiB0aGUgdHJlZVxyXG4gICAgICAvL1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHhUcmVlLCBpKzEpO1xyXG4gICAgfVxyXG5cclxuICAgIHh4VHJlZSA9IHRyZWVbJyoqJ107XHJcbiAgICBpZih4eFRyZWUpIHtcclxuICAgICAgaWYoaSA8IHR5cGVMZW5ndGgpIHtcclxuICAgICAgICBpZih4eFRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGxpc3RlbmVyIG9uIGEgJyoqJywgaXQgd2lsbCBjYXRjaCBhbGwsIHNvIGFkZCBpdHMgaGFuZGxlci5cclxuICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGFycmF5cyBvZiBtYXRjaGluZyBuZXh0IGJyYW5jaGVzIGFuZCBvdGhlcnMuXHJcbiAgICAgICAgZm9yKGJyYW5jaCBpbiB4eFRyZWUpIHtcclxuICAgICAgICAgIGlmKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHh4VHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGlmKGJyYW5jaCA9PT0gbmV4dFR5cGUpIHtcclxuICAgICAgICAgICAgICAvLyBXZSBrbm93IHRoZSBuZXh0IGVsZW1lbnQgd2lsbCBtYXRjaCwgc28ganVtcCB0d2ljZS5cclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBjdXJyZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgIC8vIEN1cnJlbnQgbm9kZSBtYXRjaGVzLCBtb3ZlIGludG8gdGhlIHRyZWUuXHJcbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbYnJhbmNoXSwgaSsxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpc29sYXRlZEJyYW5jaCA9IHt9O1xyXG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoW2JyYW5jaF0gPSB4eFRyZWVbYnJhbmNoXTtcclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHsgJyoqJzogaXNvbGF0ZWRCcmFuY2ggfSwgaSsxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgLy8gV2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgYW5kIHN0aWxsIG9uIGEgJyoqJ1xyXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZVsnKiddICYmIHh4VHJlZVsnKiddLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVsnKiddLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBncm93TGlzdGVuZXJUcmVlKHR5cGUsIGxpc3RlbmVyKSB7XHJcblxyXG4gICAgdHlwZSA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBMb29rcyBmb3IgdHdvIGNvbnNlY3V0aXZlICcqKicsIGlmIHNvLCBkb24ndCBhZGQgdGhlIGV2ZW50IGF0IGFsbC5cclxuICAgIC8vXHJcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0eXBlLmxlbmd0aDsgaSsxIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYodHlwZVtpXSA9PT0gJyoqJyAmJiB0eXBlW2krMV0gPT09ICcqKicpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJlZSA9IHRoaXMubGlzdGVuZXJUcmVlO1xyXG4gICAgdmFyIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcblxyXG4gICAgd2hpbGUgKG5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgaWYgKCF0cmVlW25hbWVdKSB7XHJcbiAgICAgICAgdHJlZVtuYW1lXSA9IHt9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cmVlID0gdHJlZVtuYW1lXTtcclxuXHJcbiAgICAgIGlmICh0eXBlLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICBpZiAoIXRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gbGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gW3RyZWUuX2xpc3RlbmVyc107XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG5cclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgIXRyZWUuX2xpc3RlbmVycy53YXJuZWQgJiZcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA+IDAgJiZcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCA+IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnNcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMud2FybmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbG9nUG9zc2libGVNZW1vcnlMZWFrLmNhbGwodGhpcywgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCwgbmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cclxuICAvLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcclxuICAvLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cclxuICAvL1xyXG4gIC8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xyXG4gIC8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmRlbGltaXRlciA9ICcuJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XHJcbiAgICBpZiAobiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgICBpZiAoIXRoaXMuX2NvbmYpIHRoaXMuX2NvbmYgPSB7fTtcclxuICAgICAgdGhpcy5fY29uZi5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnQgPSAnJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XHJcbiAgICB0aGlzLm1hbnkoZXZlbnQsIDEsIGZuKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubWFueSA9IGZ1bmN0aW9uKGV2ZW50LCB0dGwsIGZuKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xyXG4gICAgICBpZiAoLS10dGwgPT09IDApIHtcclxuICAgICAgICBzZWxmLm9mZihldmVudCwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXIuX29yaWdpbiA9IGZuO1xyXG5cclxuICAgIHRoaXMub24oZXZlbnQsIGxpc3RlbmVyKTtcclxuXHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHZhciB0eXBlID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIGlmICh0eXBlID09PSAnbmV3TGlzdGVuZXInICYmICF0aGlzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFsID0gYXJndW1lbnRzLmxlbmd0aDtcclxuICAgIHZhciBhcmdzLGwsaSxqO1xyXG4gICAgdmFyIGhhbmRsZXI7XHJcblxyXG4gICAgaWYgKHRoaXMuX2FsbCAmJiB0aGlzLl9hbGwubGVuZ3RoKSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9hbGwuc2xpY2UoKTtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwpO1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBhbDsgaisrKSBhcmdzW2pdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gaGFuZGxlci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgaGFuZGxlciA9IFtdO1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgIC8vIG5lZWQgdG8gbWFrZSBjb3B5IG9mIGhhbmRsZXJzIGJlY2F1c2UgbGlzdCBjYW4gY2hhbmdlIGluIHRoZSBtaWRkbGVcclxuICAgICAgICAvLyBvZiBlbWl0IGNhbGxcclxuICAgICAgICBoYW5kbGVyID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5sZW5ndGgpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChpID0gMCwgbCA9IGhhbmRsZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAhIXRoaXMuX2FsbDtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRBc3luYyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcikgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtmYWxzZV0pOyB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb21pc2VzPSBbXTtcclxuXHJcbiAgICB2YXIgYWwgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgdmFyIGFyZ3MsbCxpLGo7XHJcbiAgICB2YXIgaGFuZGxlcjtcclxuXHJcbiAgICBpZiAodGhpcy5fYWxsKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gdGhpcy5fYWxsLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLl9hbGxbaV0uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGhhbmRsZXIgPSBbXTtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXIsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcykpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsIC0gMSk7XHJcbiAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBoYW5kbGVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChhcmd1bWVudHNbMV0pOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vbkFueSh0eXBlKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29uIG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcclxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXHJcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGdyb3dMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCB0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIENoYW5nZSB0byBhcnJheS5cclxuICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgJiZcclxuICAgICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID4gMCAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgIGxvZ1Bvc3NpYmxlTWVtb3J5TGVhay5jYWxsKHRoaXMsIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgsIHR5cGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignb25Bbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fYWxsKSB7XHJcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIGV2ZW50IGxpc3RlbmVyIGNvbGxlY3Rpb24uXHJcbiAgICB0aGlzLl9hbGwucHVzaChmbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhbmRsZXJzLGxlYWZzPVtdO1xyXG5cclxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cclxuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xyXG4gICAgICBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgbGVhZnMucHVzaCh7X2xpc3RlbmVyczpoYW5kbGVyc30pO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xyXG4gICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgaGFuZGxlcnMgPSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgIGlmIChpc0FycmF5KGhhbmRsZXJzKSkge1xyXG5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAtMTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoaGFuZGxlcnNbaV0gPT09IGxpc3RlbmVyIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5saXN0ZW5lciAmJiBoYW5kbGVyc1tpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5fb3JpZ2luICYmIGhhbmRsZXJzW2ldLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgICAgICBsZWFmLl9saXN0ZW5lcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlTGlzdGVuZXJcIiwgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChoYW5kbGVycyA9PT0gbGlzdGVuZXIgfHxcclxuICAgICAgICAoaGFuZGxlcnMubGlzdGVuZXIgJiYgaGFuZGxlcnMubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB8fFxyXG4gICAgICAgIChoYW5kbGVycy5fb3JpZ2luICYmIGhhbmRsZXJzLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgIGRlbGV0ZSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyXCIsIHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5R2FyYmFnZUNvbGxlY3Qocm9vdCkge1xyXG4gICAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vdCk7XHJcbiAgICAgIGZvciAodmFyIGkgaW4ga2V5cykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciBvYmogPSByb290W2tleV07XHJcbiAgICAgICAgaWYgKChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbikgfHwgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHx8IChvYmogPT09IG51bGwpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmVjdXJzaXZlbHlHYXJiYWdlQ29sbGVjdChyb290W2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGRlbGV0ZSByb290W2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZWN1cnNpdmVseUdhcmJhZ2VDb2xsZWN0KHRoaXMubGlzdGVuZXJUcmVlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICB2YXIgaSA9IDAsIGwgPSAwLCBmbnM7XHJcbiAgICBpZiAoZm4gJiYgdGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmKGZuID09PSBmbnNbaV0pIHtcclxuICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbik7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKylcclxuICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbnNbaV0pO1xyXG4gICAgICB0aGlzLl9hbGwgPSBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAhdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHZhciBsZWFmcyA9IHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIG51bGwsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcblxyXG4gICAgICBmb3IgKHZhciBpTGVhZj0wOyBpTGVhZjxsZWFmcy5sZW5ndGg7IGlMZWFmKyspIHtcclxuICAgICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgICBsZWFmLl9saXN0ZW5lcnMgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHMpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIGhhbmRsZXJzID0gW107XHJcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVycywgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXJzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xyXG4gICAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiB0aGlzLmxpc3RlbmVycyh0eXBlKS5sZW5ndGg7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnNBbnkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZih0aGlzLl9hbGwpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FsbDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgLy8gQ29tbW9uSlNcclxuICAgIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsLlxyXG4gICAgd2luZG93LkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XHJcbiAgfVxyXG59KCk7XHJcbiIsIi8qIVxuICogRGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIEJ1ZmZlclxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbi8vIFRoZSBfaXNCdWZmZXIgY2hlY2sgaXMgZm9yIFNhZmFyaSA1LTcgc3VwcG9ydCwgYmVjYXVzZSBpdCdzIG1pc3Npbmdcbi8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgKGlzQnVmZmVyKG9iaikgfHwgaXNTbG93QnVmZmVyKG9iaikgfHwgISFvYmouX2lzQnVmZmVyKVxufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopXG59XG5cbi8vIEZvciBOb2RlIHYwLjEwIHN1cHBvcnQuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkuXG5mdW5jdGlvbiBpc1Nsb3dCdWZmZXIgKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyKG9iai5zbGljZSgwLCAwKSlcbn1cbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8ubm9vcCk7XG4gKiAvLyA9PiBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIE5vIG9wZXJhdGlvbiBwZXJmb3JtZWQuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIhZnVuY3Rpb24oZSx0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9leHBvcnRzLlB1Yk51Yj10KCk6ZS5QdWJOdWI9dCgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQocil7aWYobltyXSlyZXR1cm4gbltyXS5leHBvcnRzO3ZhciBpPW5bcl09e2V4cG9ydHM6e30saWQ6cixsb2FkZWQ6ITF9O3JldHVybiBlW3JdLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLHQpLGkubG9hZGVkPSEwLGkuZXhwb3J0c312YXIgbj17fTtyZXR1cm4gdC5tPWUsdC5jPW4sdC5wPVwiXCIsdCgwKX0oW2Z1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBzKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gbyhlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfWZ1bmN0aW9uIGEoZSl7aWYoIW5hdmlnYXRvcnx8IW5hdmlnYXRvci5zZW5kQmVhY29uKXJldHVybiExO25hdmlnYXRvci5zZW5kQmVhY29uKGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciB1PW4oMSksYz1yKHUpLGw9big0MSksaD1yKGwpLGY9big0MiksZD1yKGYpLHA9big0MyksZz0obig4KSxmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUpe2kodGhpcyx0KTt2YXIgbj1lLmxpc3RlblRvQnJvd3Nlck5ldHdvcmtFdmVudHMscj12b2lkIDA9PT1ufHxuO2UuZGI9ZC5kZWZhdWx0LGUuc2RrRmFtaWx5PVwiV2ViXCIsZS5uZXR3b3JraW5nPW5ldyBoLmRlZmF1bHQoe2dldDpwLmdldCxwb3N0OnAucG9zdCxzZW5kQmVhY29uOmF9KTt2YXIgbz1zKHRoaXMsKHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwodGhpcyxlKSk7cmV0dXJuIHImJih3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9mZmxpbmVcIixmdW5jdGlvbigpe28ubmV0d29ya0Rvd25EZXRlY3RlZCgpfSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmxpbmVcIixmdW5jdGlvbigpe28ubmV0d29ya1VwRGV0ZWN0ZWQoKX0pKSxvfXJldHVybiBvKHQsZSksdH0oYy5kZWZhdWx0KSk7dC5kZWZhdWx0PWcsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBuIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbikmJih0W25dPWVbbl0pO3JldHVybiB0LmRlZmF1bHQ9ZSx0fWZ1bmN0aW9uIGkoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIHMoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksYT1uKDIpLHU9aShhKSxjPW4oNyksbD1pKGMpLGg9big5KSxmPWkoaCksZD1uKDExKSxwPWkoZCksZz1uKDEyKSx5PWkoZyksdj1uKDE5KSxiPWkodiksXz1uKDIwKSxtPXIoXyksaz1uKDIxKSxQPXIoayksUz1uKDIyKSxPPXIoUyksdz1uKDIzKSxUPXIodyksQz1uKDI0KSxNPXIoQyksRT1uKDI1KSx4PXIoRSksTj1uKDI2KSxSPXIoTiksSz1uKDI3KSxqPXIoSyksQT1uKDI4KSxEPXIoQSksRz1uKDI5KSxVPXIoRyksSD1uKDMwKSxCPXIoSCksST1uKDMxKSxMPXIoSSkscT1uKDMyKSx6PXIocSksRj1uKDMzKSxYPXIoRiksVz1uKDM0KSxWPXIoVyksSj1uKDM1KSwkPXIoSiksUT1uKDM2KSxZPXIoUSksWj1uKDM3KSxlZT1yKFopLHRlPW4oMzgpLG5lPXIodGUpLHJlPW4oMzkpLGllPXIocmUpLHNlPW4oMTUpLG9lPXIoc2UpLGFlPW4oNDApLHVlPXIoYWUpLGNlPW4oMTYpLGxlPWkoY2UpLGhlPW4oMTMpLGZlPWkoaGUpLGRlPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10aGlzO3ModGhpcyxlKTt2YXIgcj10LmRiLGk9dC5uZXR3b3JraW5nLG89dGhpcy5fY29uZmlnPW5ldyBsLmRlZmF1bHQoe3NldHVwOnQsZGI6cn0pLGE9bmV3IGYuZGVmYXVsdCh7Y29uZmlnOm99KTtpLmluaXQobyk7dmFyIHU9e2NvbmZpZzpvLG5ldHdvcmtpbmc6aSxjcnlwdG86YX0sYz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsb2UpLGg9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFUpLGQ9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEwpLGc9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFgpLHY9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHVlKSxfPXRoaXMuX2xpc3RlbmVyTWFuYWdlcj1uZXcgeS5kZWZhdWx0LGs9bmV3IHAuZGVmYXVsdCh7dGltZUVuZHBvaW50OmMsbGVhdmVFbmRwb2ludDpoLGhlYXJ0YmVhdEVuZHBvaW50OmQsc2V0U3RhdGVFbmRwb2ludDpnLHN1YnNjcmliZUVuZHBvaW50OnYsY3J5cHRvOnUuY3J5cHRvLGNvbmZpZzp1LmNvbmZpZyxsaXN0ZW5lck1hbmFnZXI6X30pO3RoaXMuYWRkTGlzdGVuZXI9Xy5hZGRMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlTGlzdGVuZXI9Xy5yZW1vdmVMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzPV8ucmVtb3ZlQWxsTGlzdGVuZXJzLmJpbmQoXyksdGhpcy5jaGFubmVsR3JvdXBzPXtsaXN0R3JvdXBzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxUKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LE0pLGFkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxtKSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUCksZGVsZXRlR3JvdXA6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LE8pfSx0aGlzLnB1c2g9e2FkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSx4KSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUiksZGVsZXRlRGV2aWNlOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxEKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LGopfSx0aGlzLmhlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFYpLHRoaXMud2hlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEIpLHRoaXMuZ2V0U3RhdGU9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHopLHRoaXMuc2V0U3RhdGU9ay5hZGFwdFN0YXRlQ2hhbmdlLmJpbmQoayksdGhpcy5ncmFudD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsWSksdGhpcy5hdWRpdD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsJCksdGhpcy5wdWJsaXNoPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxlZSksdGhpcy5maXJlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUucmVwbGljYXRlPSExLGUuc3RvcmVJbkhpc3Rvcnk9ITEsbi5wdWJsaXNoKGUsdCl9LHRoaXMuaGlzdG9yeT1iLmRlZmF1bHQuYmluZCh0aGlzLHUsbmUpLHRoaXMuZmV0Y2hNZXNzYWdlcz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsaWUpLHRoaXMudGltZT1jLHRoaXMuc3Vic2NyaWJlPWsuYWRhcHRTdWJzY3JpYmVDaGFuZ2UuYmluZChrKSx0aGlzLnVuc3Vic2NyaWJlPWsuYWRhcHRVbnN1YnNjcmliZUNoYW5nZS5iaW5kKGspLHRoaXMuZGlzY29ubmVjdD1rLmRpc2Nvbm5lY3QuYmluZChrKSx0aGlzLnJlY29ubmVjdD1rLnJlY29ubmVjdC5iaW5kKGspLHRoaXMuZGVzdHJveT1mdW5jdGlvbihlKXtrLnVuc3Vic2NyaWJlQWxsKGUpLGsuZGlzY29ubmVjdCgpfSx0aGlzLnN0b3A9dGhpcy5kZXN0cm95LHRoaXMudW5zdWJzY3JpYmVBbGw9ay51bnN1YnNjcmliZUFsbC5iaW5kKGspLHRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxzPWsuZ2V0U3Vic2NyaWJlZENoYW5uZWxzLmJpbmQoayksdGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwcz1rLmdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzLmJpbmQoayksdGhpcy5lbmNyeXB0PWEuZW5jcnlwdC5iaW5kKGEpLHRoaXMuZGVjcnlwdD1hLmRlY3J5cHQuYmluZChhKSx0aGlzLmdldEF1dGhLZXk9dS5jb25maWcuZ2V0QXV0aEtleS5iaW5kKHUuY29uZmlnKSx0aGlzLnNldEF1dGhLZXk9dS5jb25maWcuc2V0QXV0aEtleS5iaW5kKHUuY29uZmlnKSx0aGlzLnNldENpcGhlcktleT11LmNvbmZpZy5zZXRDaXBoZXJLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5nZXRVVUlEPXUuY29uZmlnLmdldFVVSUQuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRVVUlEPXUuY29uZmlnLnNldFVVSUQuYmluZCh1LmNvbmZpZyksdGhpcy5nZXRGaWx0ZXJFeHByZXNzaW9uPXUuY29uZmlnLmdldEZpbHRlckV4cHJlc3Npb24uYmluZCh1LmNvbmZpZyksdGhpcy5zZXRGaWx0ZXJFeHByZXNzaW9uPXUuY29uZmlnLnNldEZpbHRlckV4cHJlc3Npb24uYmluZCh1LmNvbmZpZyksdGhpcy5zZXRIZWFydGJlYXRJbnRlcnZhbD11LmNvbmZpZy5zZXRIZWFydGJlYXRJbnRlcnZhbC5iaW5kKHUuY29uZmlnKX1yZXR1cm4gbyhlLFt7a2V5OlwiZ2V0VmVyc2lvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NvbmZpZy5nZXRWZXJzaW9uKCl9fSx7a2V5OlwibmV0d29ya0Rvd25EZXRlY3RlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTmV0d29ya0Rvd24oKSx0aGlzLl9jb25maWcucmVzdG9yZT90aGlzLmRpc2Nvbm5lY3QoKTp0aGlzLmRlc3Ryb3koITApfX0se2tleTpcIm5ldHdvcmtVcERldGVjdGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrVXAoKSx0aGlzLnJlY29ubmVjdCgpfX1dLFt7a2V5OlwiZ2VuZXJhdGVVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdS5kZWZhdWx0LnY0KCl9fV0pLGV9KCkpO2RlLk9QRVJBVElPTlM9bGUuZGVmYXVsdCxkZS5DQVRFR09SSUVTPWZlLmRlZmF1bHQsdC5kZWZhdWx0PWRlLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uKDMpLGk9big2KSxzPWk7cy52MT1yLHMudjQ9aSxlLmV4cG9ydHM9c30sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSx0LG4pe3ZhciByPXQmJm58fDAsaT10fHxbXTtlPWV8fHt9O3ZhciBvPXZvaWQgMCE9PWUuY2xvY2tzZXE/ZS5jbG9ja3NlcTp1LGg9dm9pZCAwIT09ZS5tc2Vjcz9lLm1zZWNzOihuZXcgRGF0ZSkuZ2V0VGltZSgpLGY9dm9pZCAwIT09ZS5uc2Vjcz9lLm5zZWNzOmwrMSxkPWgtYysoZi1sKS8xZTQ7aWYoZDwwJiZ2b2lkIDA9PT1lLmNsb2Nrc2VxJiYobz1vKzEmMTYzODMpLChkPDB8fGg+YykmJnZvaWQgMD09PWUubnNlY3MmJihmPTApLGY+PTFlNCl0aHJvdyBuZXcgRXJyb3IoXCJ1dWlkLnYxKCk6IENhbid0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlY1wiKTtjPWgsbD1mLHU9byxoKz0xMjIxOTI5MjhlNTt2YXIgcD0oMWU0KigyNjg0MzU0NTUmaCkrZiklNDI5NDk2NzI5NjtpW3IrK109cD4+PjI0JjI1NSxpW3IrK109cD4+PjE2JjI1NSxpW3IrK109cD4+PjgmMjU1LGlbcisrXT0yNTUmcDt2YXIgZz1oLzQyOTQ5NjcyOTYqMWU0JjI2ODQzNTQ1NTtpW3IrK109Zz4+PjgmMjU1LGlbcisrXT0yNTUmZyxpW3IrK109Zz4+PjI0JjE1fDE2LGlbcisrXT1nPj4+MTYmMjU1LGlbcisrXT1vPj4+OHwxMjgsaVtyKytdPTI1NSZvO2Zvcih2YXIgeT1lLm5vZGV8fGEsdj0wO3Y8NjsrK3YpaVtyK3ZdPXlbdl07cmV0dXJuIHR8fHMoaSl9dmFyIGk9big0KSxzPW4oNSksbz1pKCksYT1bMXxvWzBdLG9bMV0sb1syXSxvWzNdLG9bNF0sb1s1XV0sdT0xNjM4MyYob1s2XTw8OHxvWzddKSxjPTAsbD0wO2UuZXhwb3J0cz1yfSxmdW5jdGlvbihlLHQpeyhmdW5jdGlvbih0KXt2YXIgbixyPXQuY3J5cHRvfHx0Lm1zQ3J5cHRvO2lmKHImJnIuZ2V0UmFuZG9tVmFsdWVzKXt2YXIgaT1uZXcgVWludDhBcnJheSgxNik7bj1mdW5jdGlvbigpe3JldHVybiByLmdldFJhbmRvbVZhbHVlcyhpKSxpfX1pZighbil7dmFyIHM9bmV3IEFycmF5KDE2KTtuPWZ1bmN0aW9uKCl7Zm9yKHZhciBlLHQ9MDt0PDE2O3QrKykwPT0oMyZ0KSYmKGU9NDI5NDk2NzI5NipNYXRoLnJhbmRvbSgpKSxzW3RdPWU+Pj4oKDMmdCk8PDMpJjI1NTtyZXR1cm4gc319ZS5leHBvcnRzPW59KS5jYWxsKHQsZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKSl9LGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlLHQpe3ZhciBuPXR8fDAsaT1yO3JldHVybiBpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV19Zm9yKHZhciByPVtdLGk9MDtpPDI1NjsrK2kpcltpXT0oaSsyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7ZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKGUsdCxuKXt2YXIgcj10JiZufHwwO1wic3RyaW5nXCI9PXR5cGVvZiBlJiYodD1cImJpbmFyeVwiPT1lP25ldyBBcnJheSgxNik6bnVsbCxlPW51bGwpLGU9ZXx8e307dmFyIG89ZS5yYW5kb218fChlLnJuZ3x8aSkoKTtpZihvWzZdPTE1Jm9bNl18NjQsb1s4XT02MyZvWzhdfDEyOCx0KWZvcih2YXIgYT0wO2E8MTY7KythKXRbcithXT1vW2FdO3JldHVybiB0fHxzKG8pfXZhciBpPW4oNCkscz1uKDUpO2UuZXhwb3J0cz1yfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oMiksbz1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KHMpLGE9KG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuc2V0dXAsaT10LmRiO3IodGhpcyxlKSx0aGlzLl9kYj1pLHRoaXMuaW5zdGFuY2VJZD1cInBuLVwiK28uZGVmYXVsdC52NCgpLHRoaXMuc2VjcmV0S2V5PW4uc2VjcmV0S2V5fHxuLnNlY3JldF9rZXksdGhpcy5zdWJzY3JpYmVLZXk9bi5zdWJzY3JpYmVLZXl8fG4uc3Vic2NyaWJlX2tleSx0aGlzLnB1Ymxpc2hLZXk9bi5wdWJsaXNoS2V5fHxuLnB1Ymxpc2hfa2V5LHRoaXMuc2RrRmFtaWx5PW4uc2RrRmFtaWx5LHRoaXMucGFydG5lcklkPW4ucGFydG5lcklkLHRoaXMuc2V0QXV0aEtleShuLmF1dGhLZXkpLHRoaXMuc2V0Q2lwaGVyS2V5KG4uY2lwaGVyS2V5KSx0aGlzLnNldEZpbHRlckV4cHJlc3Npb24obi5maWx0ZXJFeHByZXNzaW9uKSx0aGlzLm9yaWdpbj1uLm9yaWdpbnx8XCJwdWJzdWIucG5kc24uY29tXCIsdGhpcy5zZWN1cmU9bi5zc2x8fCExLHRoaXMucmVzdG9yZT1uLnJlc3RvcmV8fCExLHRoaXMucHJveHk9bi5wcm94eSx0aGlzLmtlZXBBbGl2ZT1uLmtlZXBBbGl2ZSx0aGlzLmtlZXBBbGl2ZVNldHRpbmdzPW4ua2VlcEFsaXZlU2V0dGluZ3MsdGhpcy5hdXRvTmV0d29ya0RldGVjdGlvbj1uLmF1dG9OZXR3b3JrRGV0ZWN0aW9ufHwhMSx0aGlzLmRlZHVwZU9uU3Vic2NyaWJlPW4uZGVkdXBlT25TdWJzY3JpYmV8fCExLHRoaXMubWF4aW11bUNhY2hlU2l6ZT1uLm1heGltdW1DYWNoZVNpemV8fDEwMCx0aGlzLmN1c3RvbUVuY3J5cHQ9bi5jdXN0b21FbmNyeXB0LHRoaXMuY3VzdG9tRGVjcnlwdD1uLmN1c3RvbURlY3J5cHQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGxvY2F0aW9uJiZcImh0dHBzOlwiPT09bG9jYXRpb24ucHJvdG9jb2wmJih0aGlzLnNlY3VyZT0hMCksdGhpcy5sb2dWZXJib3NpdHk9bi5sb2dWZXJib3NpdHl8fCExLHRoaXMuc3VwcHJlc3NMZWF2ZUV2ZW50cz1uLnN1cHByZXNzTGVhdmVFdmVudHN8fCExLHRoaXMuYW5ub3VuY2VGYWlsZWRIZWFydGJlYXRzPW4uYW5ub3VuY2VGYWlsZWRIZWFydGJlYXRzfHwhMCx0aGlzLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHM9bi5hbm5vdW5jZVN1Y2Nlc3NmdWxIZWFydGJlYXRzfHwhMSx0aGlzLnVzZUluc3RhbmNlSWQ9bi51c2VJbnN0YW5jZUlkfHwhMSx0aGlzLnVzZVJlcXVlc3RJZD1uLnVzZVJlcXVlc3RJZHx8ITEsdGhpcy5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkPW4ucmVxdWVzdE1lc3NhZ2VDb3VudFRocmVzaG9sZCx0aGlzLnNldFRyYW5zYWN0aW9uVGltZW91dChuLnRyYW5zYWN0aW9uYWxSZXF1ZXN0VGltZW91dHx8MTVlMyksdGhpcy5zZXRTdWJzY3JpYmVUaW1lb3V0KG4uc3Vic2NyaWJlUmVxdWVzdFRpbWVvdXR8fDMxZTQpLHRoaXMuc2V0U2VuZEJlYWNvbkNvbmZpZyhuLnVzZVNlbmRCZWFjb258fCEwKSx0aGlzLnNldFByZXNlbmNlVGltZW91dChuLnByZXNlbmNlVGltZW91dHx8MzAwKSxuLmhlYXJ0YmVhdEludGVydmFsJiZ0aGlzLnNldEhlYXJ0YmVhdEludGVydmFsKG4uaGVhcnRiZWF0SW50ZXJ2YWwpLHRoaXMuc2V0VVVJRCh0aGlzLl9kZWNpZGVVVUlEKG4udXVpZCkpfXJldHVybiBpKGUsW3trZXk6XCJnZXRBdXRoS2V5XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hdXRoS2V5fX0se2tleTpcInNldEF1dGhLZXlcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5hdXRoS2V5PWUsdGhpc319LHtrZXk6XCJzZXRDaXBoZXJLZXlcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5jaXBoZXJLZXk9ZSx0aGlzfX0se2tleTpcImdldFVVSURcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLlVVSUR9fSx7a2V5Olwic2V0VVVJRFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9kYiYmdGhpcy5fZGIuc2V0JiZ0aGlzLl9kYi5zZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIsZSksdGhpcy5VVUlEPWUsdGhpc319LHtrZXk6XCJnZXRGaWx0ZXJFeHByZXNzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5maWx0ZXJFeHByZXNzaW9ufX0se2tleTpcInNldEZpbHRlckV4cHJlc3Npb25cIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5maWx0ZXJFeHByZXNzaW9uPWUsdGhpc319LHtrZXk6XCJnZXRQcmVzZW5jZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wcmVzZW5jZVRpbWVvdXR9fSx7a2V5Olwic2V0UHJlc2VuY2VUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3ByZXNlbmNlVGltZW91dD1lLHRoaXMuc2V0SGVhcnRiZWF0SW50ZXJ2YWwodGhpcy5fcHJlc2VuY2VUaW1lb3V0LzItMSksdGhpc319LHtrZXk6XCJnZXRIZWFydGJlYXRJbnRlcnZhbFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2hlYXJ0YmVhdEludGVydmFsfX0se2tleTpcInNldEhlYXJ0YmVhdEludGVydmFsXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2hlYXJ0YmVhdEludGVydmFsPWUsdGhpc319LHtrZXk6XCJnZXRTdWJzY3JpYmVUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3Vic2NyaWJlUmVxdWVzdFRpbWVvdXR9fSx7a2V5Olwic2V0U3Vic2NyaWJlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9zdWJzY3JpYmVSZXF1ZXN0VGltZW91dD1lLHRoaXN9fSx7a2V5OlwiZ2V0VHJhbnNhY3Rpb25UaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdHJhbnNhY3Rpb25hbFJlcXVlc3RUaW1lb3V0fX0se2tleTpcInNldFRyYW5zYWN0aW9uVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl90cmFuc2FjdGlvbmFsUmVxdWVzdFRpbWVvdXQ9ZSx0aGlzfX0se2tleTpcImlzU2VuZEJlYWNvbkVuYWJsZWRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl91c2VTZW5kQmVhY29ufX0se2tleTpcInNldFNlbmRCZWFjb25Db25maWdcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fdXNlU2VuZEJlYWNvbj1lLHRoaXN9fSx7a2V5OlwiZ2V0VmVyc2lvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuXCI0LjE1LjFcIn19LHtrZXk6XCJfZGVjaWRlVVVJRFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiBlfHwodGhpcy5fZGImJnRoaXMuX2RiLmdldCYmdGhpcy5fZGIuZ2V0KHRoaXMuc3Vic2NyaWJlS2V5K1widXVpZFwiKT90aGlzLl9kYi5nZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIpOlwicG4tXCIrby5kZWZhdWx0LnY0KCkpfX1dKSxlfSgpKTt0LmRlZmF1bHQ9YSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO2UuZXhwb3J0cz17fX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz1uKDcpLGE9KHIobyksbigxMCkpLHU9cihhKSxjPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LmNvbmZpZztpKHRoaXMsZSksdGhpcy5fY29uZmlnPW4sdGhpcy5faXY9XCIwMTIzNDU2Nzg5MDEyMzQ1XCIsdGhpcy5fYWxsb3dlZEtleUVuY29kaW5ncz1bXCJoZXhcIixcInV0ZjhcIixcImJhc2U2NFwiLFwiYmluYXJ5XCJdLHRoaXMuX2FsbG93ZWRLZXlMZW5ndGhzPVsxMjgsMjU2XSx0aGlzLl9hbGxvd2VkTW9kZXM9W1wiZWNiXCIsXCJjYmNcIl0sdGhpcy5fZGVmYXVsdE9wdGlvbnM9e2VuY3J5cHRLZXk6ITAsa2V5RW5jb2Rpbmc6XCJ1dGY4XCIsa2V5TGVuZ3RoOjI1Nixtb2RlOlwiY2JjXCJ9fXJldHVybiBzKGUsW3trZXk6XCJITUFDU0hBMjU2XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHUuZGVmYXVsdC5IbWFjU0hBMjU2KGUsdGhpcy5fY29uZmlnLnNlY3JldEtleSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5CYXNlNjQpfX0se2tleTpcIlNIQTI1NlwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB1LmRlZmF1bHQuU0hBMjU2KGUpLnRvU3RyaW5nKHUuZGVmYXVsdC5lbmMuSGV4KX19LHtrZXk6XCJfcGFyc2VPcHRpb25zXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9ZXx8e307cmV0dXJuIHQuaGFzT3duUHJvcGVydHkoXCJlbmNyeXB0S2V5XCIpfHwodC5lbmNyeXB0S2V5PXRoaXMuX2RlZmF1bHRPcHRpb25zLmVuY3J5cHRLZXkpLHQuaGFzT3duUHJvcGVydHkoXCJrZXlFbmNvZGluZ1wiKXx8KHQua2V5RW5jb2Rpbmc9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5RW5jb2RpbmcpLHQuaGFzT3duUHJvcGVydHkoXCJrZXlMZW5ndGhcIil8fCh0LmtleUxlbmd0aD10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlMZW5ndGgpLHQuaGFzT3duUHJvcGVydHkoXCJtb2RlXCIpfHwodC5tb2RlPXRoaXMuX2RlZmF1bHRPcHRpb25zLm1vZGUpLC0xPT09dGhpcy5fYWxsb3dlZEtleUVuY29kaW5ncy5pbmRleE9mKHQua2V5RW5jb2RpbmcudG9Mb3dlckNhc2UoKSkmJih0LmtleUVuY29kaW5nPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUVuY29kaW5nKSwtMT09PXRoaXMuX2FsbG93ZWRLZXlMZW5ndGhzLmluZGV4T2YocGFyc2VJbnQodC5rZXlMZW5ndGgsMTApKSYmKHQua2V5TGVuZ3RoPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUxlbmd0aCksLTE9PT10aGlzLl9hbGxvd2VkTW9kZXMuaW5kZXhPZih0Lm1vZGUudG9Mb3dlckNhc2UoKSkmJih0Lm1vZGU9dGhpcy5fZGVmYXVsdE9wdGlvbnMubW9kZSksdH19LHtrZXk6XCJfZGVjb2RlS2V5XCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXtyZXR1cm5cImJhc2U2NFwiPT09dC5rZXlFbmNvZGluZz91LmRlZmF1bHQuZW5jLkJhc2U2NC5wYXJzZShlKTpcImhleFwiPT09dC5rZXlFbmNvZGluZz91LmRlZmF1bHQuZW5jLkhleC5wYXJzZShlKTplfX0se2tleTpcIl9nZXRQYWRkZWRLZXlcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3JldHVybiBlPXRoaXMuX2RlY29kZUtleShlLHQpLHQuZW5jcnlwdEtleT91LmRlZmF1bHQuZW5jLlV0ZjgucGFyc2UodGhpcy5TSEEyNTYoZSkuc2xpY2UoMCwzMikpOmV9fSx7a2V5OlwiX2dldE1vZGVcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm5cImVjYlwiPT09ZS5tb2RlP3UuZGVmYXVsdC5tb2RlLkVDQjp1LmRlZmF1bHQubW9kZS5DQkN9fSx7a2V5OlwiX2dldElWXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuXCJjYmNcIj09PWUubW9kZT91LmRlZmF1bHQuZW5jLlV0ZjgucGFyc2UodGhpcy5faXYpOm51bGx9fSx7a2V5OlwiZW5jcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fY29uZmlnLmN1c3RvbUVuY3J5cHQ/dGhpcy5fY29uZmlnLmN1c3RvbUVuY3J5cHQoZSk6dGhpcy5wbkVuY3J5cHQoZSx0LG4pfX0se2tleTpcImRlY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX2NvbmZpZy5jdXN0b21EZWNyeXB0P3RoaXMuX2NvbmZpZy5jdXN0b21EZWNyeXB0KGUpOnRoaXMucG5EZWNyeXB0KGUsdCxuKX19LHtrZXk6XCJwbkVuY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7aWYoIXQmJiF0aGlzLl9jb25maWcuY2lwaGVyS2V5KXJldHVybiBlO249dGhpcy5fcGFyc2VPcHRpb25zKG4pO3ZhciByPXRoaXMuX2dldElWKG4pLGk9dGhpcy5fZ2V0TW9kZShuKSxzPXRoaXMuX2dldFBhZGRlZEtleSh0fHx0aGlzLl9jb25maWcuY2lwaGVyS2V5LG4pO3JldHVybiB1LmRlZmF1bHQuQUVTLmVuY3J5cHQoZSxzLHtpdjpyLG1vZGU6aX0pLmNpcGhlcnRleHQudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5CYXNlNjQpfHxlfX0se2tleTpcInBuRGVjcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtpZighdCYmIXRoaXMuX2NvbmZpZy5jaXBoZXJLZXkpcmV0dXJuIGU7bj10aGlzLl9wYXJzZU9wdGlvbnMobik7dmFyIHI9dGhpcy5fZ2V0SVYobiksaT10aGlzLl9nZXRNb2RlKG4pLHM9dGhpcy5fZ2V0UGFkZGVkS2V5KHR8fHRoaXMuX2NvbmZpZy5jaXBoZXJLZXksbik7dHJ5e3ZhciBvPXUuZGVmYXVsdC5lbmMuQmFzZTY0LnBhcnNlKGUpLGE9dS5kZWZhdWx0LkFFUy5kZWNyeXB0KHtjaXBoZXJ0ZXh0Om99LHMse2l2OnIsbW9kZTppfSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5VdGY4KTtyZXR1cm4gSlNPTi5wYXJzZShhKX1jYXRjaChlKXtyZXR1cm4gbnVsbH19fV0pLGV9KCk7dC5kZWZhdWx0PWMsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjt2YXIgbj1ufHxmdW5jdGlvbihlLHQpe3ZhciBuPXt9LHI9bi5saWI9e30saT1mdW5jdGlvbigpe30scz1yLkJhc2U9e2V4dGVuZDpmdW5jdGlvbihlKXtpLnByb3RvdHlwZT10aGlzO3ZhciB0PW5ldyBpO3JldHVybiBlJiZ0Lm1peEluKGUpLHQuaGFzT3duUHJvcGVydHkoXCJpbml0XCIpfHwodC5pbml0PWZ1bmN0aW9uKCl7dC4kc3VwZXIuaW5pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9KSx0LmluaXQucHJvdG90eXBlPXQsdC4kc3VwZXI9dGhpcyx0fSxjcmVhdGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmV4dGVuZCgpO3JldHVybiBlLmluaXQuYXBwbHkoZSxhcmd1bWVudHMpLGV9LGluaXQ6ZnVuY3Rpb24oKXt9LG1peEluOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdCBpbiBlKWUuaGFzT3duUHJvcGVydHkodCkmJih0aGlzW3RdPWVbdF0pO2UuaGFzT3duUHJvcGVydHkoXCJ0b1N0cmluZ1wiKSYmKHRoaXMudG9TdHJpbmc9ZS50b1N0cmluZyl9LGNsb25lOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW5pdC5wcm90b3R5cGUuZXh0ZW5kKHRoaXMpfX0sbz1yLldvcmRBcnJheT1zLmV4dGVuZCh7aW5pdDpmdW5jdGlvbihlLHQpe2U9dGhpcy53b3Jkcz1lfHxbXSx0aGlzLnNpZ0J5dGVzPXZvaWQgMCE9dD90OjQqZS5sZW5ndGh9LHRvU3RyaW5nOmZ1bmN0aW9uKGUpe3JldHVybihlfHx1KS5zdHJpbmdpZnkodGhpcyl9LGNvbmNhdDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLndvcmRzLG49ZS53b3JkcyxyPXRoaXMuc2lnQnl0ZXM7aWYoZT1lLnNpZ0J5dGVzLHRoaXMuY2xhbXAoKSxyJTQpZm9yKHZhciBpPTA7aTxlO2krKyl0W3IraT4+PjJdfD0obltpPj4+Ml0+Pj4yNC1pJTQqOCYyNTUpPDwyNC0ocitpKSU0Kjg7ZWxzZSBpZig2NTUzNTxuLmxlbmd0aClmb3IoaT0wO2k8ZTtpKz00KXRbcitpPj4+Ml09bltpPj4+Ml07ZWxzZSB0LnB1c2guYXBwbHkodCxuKTtyZXR1cm4gdGhpcy5zaWdCeXRlcys9ZSx0aGlzfSxjbGFtcDpmdW5jdGlvbigpe3ZhciB0PXRoaXMud29yZHMsbj10aGlzLnNpZ0J5dGVzO3Rbbj4+PjJdJj00Mjk0OTY3Mjk1PDwzMi1uJTQqOCx0Lmxlbmd0aD1lLmNlaWwobi80KX0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1zLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUud29yZHM9dGhpcy53b3Jkcy5zbGljZSgwKSxlfSxyYW5kb206ZnVuY3Rpb24odCl7Zm9yKHZhciBuPVtdLHI9MDtyPHQ7cis9NCluLnB1c2goNDI5NDk2NzI5NiplLnJhbmRvbSgpfDApO3JldHVybiBuZXcgby5pbml0KG4sdCl9fSksYT1uLmVuYz17fSx1PWEuSGV4PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcztlPWUuc2lnQnl0ZXM7Zm9yKHZhciBuPVtdLHI9MDtyPGU7cisrKXt2YXIgaT10W3I+Pj4yXT4+PjI0LXIlNCo4JjI1NTtuLnB1c2goKGk+Pj40KS50b1N0cmluZygxNikpLG4ucHVzaCgoMTUmaSkudG9TdHJpbmcoMTYpKX1yZXR1cm4gbi5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXtmb3IodmFyIHQ9ZS5sZW5ndGgsbj1bXSxyPTA7cjx0O3IrPTIpbltyPj4+M118PXBhcnNlSW50KGUuc3Vic3RyKHIsMiksMTYpPDwyNC1yJTgqNDtyZXR1cm4gbmV3IG8uaW5pdChuLHQvMil9fSxjPWEuTGF0aW4xPXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcztlPWUuc2lnQnl0ZXM7Zm9yKHZhciBuPVtdLHI9MDtyPGU7cisrKW4ucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKHRbcj4+PjJdPj4+MjQtciU0KjgmMjU1KSk7cmV0dXJuIG4uam9pbihcIlwiKX0scGFyc2U6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PWUubGVuZ3RoLG49W10scj0wO3I8dDtyKyspbltyPj4+Ml18PSgyNTUmZS5jaGFyQ29kZUF0KHIpKTw8MjQtciU0Kjg7cmV0dXJuIG5ldyBvLmluaXQobix0KX19LGw9YS5VdGY4PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGMuc3RyaW5naWZ5KGUpKSl9Y2F0Y2goZSl7dGhyb3cgRXJyb3IoXCJNYWxmb3JtZWQgVVRGLTggZGF0YVwiKX19LHBhcnNlOmZ1bmN0aW9uKGUpe3JldHVybiBjLnBhcnNlKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChlKSkpfX0saD1yLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG09cy5leHRlbmQoe3Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5fZGF0YT1uZXcgby5pbml0LHRoaXMuX25EYXRhQnl0ZXM9MH0sX2FwcGVuZDpmdW5jdGlvbihlKXtcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9bC5wYXJzZShlKSksdGhpcy5fZGF0YS5jb25jYXQoZSksdGhpcy5fbkRhdGFCeXRlcys9ZS5zaWdCeXRlc30sX3Byb2Nlc3M6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5fZGF0YSxyPW4ud29yZHMsaT1uLnNpZ0J5dGVzLHM9dGhpcy5ibG9ja1NpemUsYT1pLyg0KnMpLGE9dD9lLmNlaWwoYSk6ZS5tYXgoKDB8YSktdGhpcy5fbWluQnVmZmVyU2l6ZSwwKTtpZih0PWEqcyxpPWUubWluKDQqdCxpKSx0KXtmb3IodmFyIHU9MDt1PHQ7dSs9cyl0aGlzLl9kb1Byb2Nlc3NCbG9jayhyLHUpO3U9ci5zcGxpY2UoMCx0KSxuLnNpZ0J5dGVzLT1pfXJldHVybiBuZXcgby5pbml0KHUsaSl9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9cy5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLl9kYXRhPXRoaXMuX2RhdGEuY2xvbmUoKSxlfSxfbWluQnVmZmVyU2l6ZTowfSk7ci5IYXNoZXI9aC5leHRlbmQoe2NmZzpzLmV4dGVuZCgpLGluaXQ6ZnVuY3Rpb24oZSl7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKGUpLHRoaXMucmVzZXQoKX0scmVzZXQ6ZnVuY3Rpb24oKXtoLnJlc2V0LmNhbGwodGhpcyksdGhpcy5fZG9SZXNldCgpfSx1cGRhdGU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2FwcGVuZChlKSx0aGlzLl9wcm9jZXNzKCksdGhpc30sZmluYWxpemU6ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJnRoaXMuX2FwcGVuZChlKSx0aGlzLl9kb0ZpbmFsaXplKCl9LGJsb2NrU2l6ZToxNixfY3JlYXRlSGVscGVyOmZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LG4pe3JldHVybiBuZXcgZS5pbml0KG4pLmZpbmFsaXplKHQpfX0sX2NyZWF0ZUhtYWNIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsbil7cmV0dXJuIG5ldyBmLkhNQUMuaW5pdChlLG4pLmZpbmFsaXplKHQpfX19KTt2YXIgZj1uLmFsZ289e307cmV0dXJuIG59KE1hdGgpOyFmdW5jdGlvbihlKXtmb3IodmFyIHQ9bixyPXQubGliLGk9ci5Xb3JkQXJyYXkscz1yLkhhc2hlcixyPXQuYWxnbyxvPVtdLGE9W10sdT1mdW5jdGlvbihlKXtyZXR1cm4gNDI5NDk2NzI5NiooZS0oMHxlKSl8MH0sYz0yLGw9MDs2ND5sOyl7dmFyIGg7ZTp7aD1jO2Zvcih2YXIgZj1lLnNxcnQoaCksZD0yO2Q8PWY7ZCsrKWlmKCEoaCVkKSl7aD0hMTticmVhayBlfWg9ITB9aCYmKDg+bCYmKG9bbF09dShlLnBvdyhjLC41KSkpLGFbbF09dShlLnBvdyhjLDEvMykpLGwrKyksYysrfXZhciBwPVtdLHI9ci5TSEEyNTY9cy5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5faGFzaD1uZXcgaS5pbml0KG8uc2xpY2UoMCkpfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49dGhpcy5faGFzaC53b3JkcyxyPW5bMF0saT1uWzFdLHM9blsyXSxvPW5bM10sdT1uWzRdLGM9bls1XSxsPW5bNl0saD1uWzddLGY9MDs2ND5mO2YrKyl7aWYoMTY+ZilwW2ZdPTB8ZVt0K2ZdO2Vsc2V7dmFyIGQ9cFtmLTE1XSxnPXBbZi0yXTtwW2ZdPSgoZDw8MjV8ZD4+PjcpXihkPDwxNHxkPj4+MTgpXmQ+Pj4zKStwW2YtN10rKChnPDwxNXxnPj4+MTcpXihnPDwxM3xnPj4+MTkpXmc+Pj4xMCkrcFtmLTE2XX1kPWgrKCh1PDwyNnx1Pj4+NileKHU8PDIxfHU+Pj4xMSleKHU8PDd8dT4+PjI1KSkrKHUmY15+dSZsKSthW2ZdK3BbZl0sZz0oKHI8PDMwfHI+Pj4yKV4ocjw8MTl8cj4+PjEzKV4ocjw8MTB8cj4+PjIyKSkrKHImaV5yJnNeaSZzKSxoPWwsbD1jLGM9dSx1PW8rZHwwLG89cyxzPWksaT1yLHI9ZCtnfDB9blswXT1uWzBdK3J8MCxuWzFdPW5bMV0raXwwLG5bMl09blsyXStzfDAsblszXT1uWzNdK298MCxuWzRdPW5bNF0rdXwwLG5bNV09bls1XStjfDAsbls2XT1uWzZdK2x8MCxuWzddPW5bN10raHwwfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2RhdGEsbj10LndvcmRzLHI9OCp0aGlzLl9uRGF0YUJ5dGVzLGk9OCp0LnNpZ0J5dGVzO3JldHVybiBuW2k+Pj41XXw9MTI4PDwyNC1pJTMyLG5bMTQrKGkrNjQ+Pj45PDw0KV09ZS5mbG9vcihyLzQyOTQ5NjcyOTYpLG5bMTUrKGkrNjQ+Pj45PDw0KV09cix0LnNpZ0J5dGVzPTQqbi5sZW5ndGgsdGhpcy5fcHJvY2VzcygpLHRoaXMuX2hhc2h9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9cy5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLl9oYXNoPXRoaXMuX2hhc2guY2xvbmUoKSxlfX0pO3QuU0hBMjU2PXMuX2NyZWF0ZUhlbHBlcihyKSx0LkhtYWNTSEEyNTY9cy5fY3JlYXRlSG1hY0hlbHBlcihyKX0oTWF0aCksZnVuY3Rpb24oKXt2YXIgZT1uLHQ9ZS5lbmMuVXRmODtlLmFsZ28uSE1BQz1lLmxpYi5CYXNlLmV4dGVuZCh7aW5pdDpmdW5jdGlvbihlLG4pe2U9dGhpcy5faGFzaGVyPW5ldyBlLmluaXQsXCJzdHJpbmdcIj09dHlwZW9mIG4mJihuPXQucGFyc2UobikpO3ZhciByPWUuYmxvY2tTaXplLGk9NCpyO24uc2lnQnl0ZXM+aSYmKG49ZS5maW5hbGl6ZShuKSksbi5jbGFtcCgpO2Zvcih2YXIgcz10aGlzLl9vS2V5PW4uY2xvbmUoKSxvPXRoaXMuX2lLZXk9bi5jbG9uZSgpLGE9cy53b3Jkcyx1PW8ud29yZHMsYz0wO2M8cjtjKyspYVtjXV49MTU0OTU1NjgyOCx1W2NdXj05MDk1MjI0ODY7cy5zaWdCeXRlcz1vLnNpZ0J5dGVzPWksdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe3ZhciBlPXRoaXMuX2hhc2hlcjtlLnJlc2V0KCksZS51cGRhdGUodGhpcy5faUtleSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGFzaGVyLnVwZGF0ZShlKSx0aGlzfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLl9oYXNoZXI7cmV0dXJuIGU9dC5maW5hbGl6ZShlKSx0LnJlc2V0KCksdC5maW5hbGl6ZSh0aGlzLl9vS2V5LmNsb25lKCkuY29uY2F0KGUpKX19KX0oKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmxpYi5Xb3JkQXJyYXk7ZS5lbmMuQmFzZTY0PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcyxuPWUuc2lnQnl0ZXMscj10aGlzLl9tYXA7ZS5jbGFtcCgpLGU9W107Zm9yKHZhciBpPTA7aTxuO2krPTMpZm9yKHZhciBzPSh0W2k+Pj4yXT4+PjI0LWklNCo4JjI1NSk8PDE2fCh0W2krMT4+PjJdPj4+MjQtKGkrMSklNCo4JjI1NSk8PDh8dFtpKzI+Pj4yXT4+PjI0LShpKzIpJTQqOCYyNTUsbz0wOzQ+byYmaSsuNzUqbzxuO28rKyllLnB1c2goci5jaGFyQXQocz4+PjYqKDMtbykmNjMpKTtpZih0PXIuY2hhckF0KDY0KSlmb3IoO2UubGVuZ3RoJTQ7KWUucHVzaCh0KTtyZXR1cm4gZS5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXt2YXIgbj1lLmxlbmd0aCxyPXRoaXMuX21hcCxpPXIuY2hhckF0KDY0KTtpJiYtMSE9KGk9ZS5pbmRleE9mKGkpKSYmKG49aSk7Zm9yKHZhciBpPVtdLHM9MCxvPTA7bzxuO28rKylpZihvJTQpe3ZhciBhPXIuaW5kZXhPZihlLmNoYXJBdChvLTEpKTw8byU0KjIsdT1yLmluZGV4T2YoZS5jaGFyQXQobykpPj4+Ni1vJTQqMjtpW3M+Pj4yXXw9KGF8dSk8PDI0LXMlNCo4LHMrK31yZXR1cm4gdC5jcmVhdGUoaSxzKX0sX21hcDpcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCJ9fSgpLGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSx0LG4scixpLHMsbyl7cmV0dXJuKChlPWUrKHQmbnx+dCZyKStpK28pPDxzfGU+Pj4zMi1zKSt0fWZ1bmN0aW9uIHIoZSx0LG4scixpLHMsbyl7cmV0dXJuKChlPWUrKHQmcnxuJn5yKStpK28pPDxzfGU+Pj4zMi1zKSt0fWZ1bmN0aW9uIGkoZSx0LG4scixpLHMsbyl7cmV0dXJuKChlPWUrKHRebl5yKStpK28pPDxzfGU+Pj4zMi1zKSt0fWZ1bmN0aW9uIHMoZSx0LG4scixpLHMsbyl7cmV0dXJuKChlPWUrKG5eKHR8fnIpKStpK28pPDxzfGU+Pj4zMi1zKSt0fWZvcih2YXIgbz1uLGE9by5saWIsdT1hLldvcmRBcnJheSxjPWEuSGFzaGVyLGE9by5hbGdvLGw9W10saD0wOzY0Pmg7aCsrKWxbaF09NDI5NDk2NzI5NiplLmFicyhlLnNpbihoKzEpKXwwO2E9YS5NRDU9Yy5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5faGFzaD1uZXcgdS5pbml0KFsxNzMyNTg0MTkzLDQwMjMyMzM0MTcsMjU2MjM4MzEwMiwyNzE3MzM4NzhdKX0sX2RvUHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsbil7Zm9yKHZhciBvPTA7MTY+bztvKyspe3ZhciBhPW4rbyx1PWVbYV07ZVthXT0xNjcxMTkzNSYodTw8OHx1Pj4+MjQpfDQyNzgyNTUzNjAmKHU8PDI0fHU+Pj44KX12YXIgbz10aGlzLl9oYXNoLndvcmRzLGE9ZVtuKzBdLHU9ZVtuKzFdLGM9ZVtuKzJdLGg9ZVtuKzNdLGY9ZVtuKzRdLGQ9ZVtuKzVdLHA9ZVtuKzZdLGc9ZVtuKzddLHk9ZVtuKzhdLHY9ZVtuKzldLGI9ZVtuKzEwXSxfPWVbbisxMV0sbT1lW24rMTJdLGs9ZVtuKzEzXSxQPWVbbisxNF0sUz1lW24rMTVdLE89b1swXSx3PW9bMV0sVD1vWzJdLEM9b1szXSxPPXQoTyx3LFQsQyxhLDcsbFswXSksQz10KEMsTyx3LFQsdSwxMixsWzFdKSxUPXQoVCxDLE8sdyxjLDE3LGxbMl0pLHc9dCh3LFQsQyxPLGgsMjIsbFszXSksTz10KE8sdyxULEMsZiw3LGxbNF0pLEM9dChDLE8sdyxULGQsMTIsbFs1XSksVD10KFQsQyxPLHcscCwxNyxsWzZdKSx3PXQodyxULEMsTyxnLDIyLGxbN10pLE89dChPLHcsVCxDLHksNyxsWzhdKSxDPXQoQyxPLHcsVCx2LDEyLGxbOV0pLFQ9dChULEMsTyx3LGIsMTcsbFsxMF0pLHc9dCh3LFQsQyxPLF8sMjIsbFsxMV0pLE89dChPLHcsVCxDLG0sNyxsWzEyXSksQz10KEMsTyx3LFQsaywxMixsWzEzXSksVD10KFQsQyxPLHcsUCwxNyxsWzE0XSksdz10KHcsVCxDLE8sUywyMixsWzE1XSksTz1yKE8sdyxULEMsdSw1LGxbMTZdKSxDPXIoQyxPLHcsVCxwLDksbFsxN10pLFQ9cihULEMsTyx3LF8sMTQsbFsxOF0pLHc9cih3LFQsQyxPLGEsMjAsbFsxOV0pLE89cihPLHcsVCxDLGQsNSxsWzIwXSksQz1yKEMsTyx3LFQsYiw5LGxbMjFdKSxUPXIoVCxDLE8sdyxTLDE0LGxbMjJdKSx3PXIodyxULEMsTyxmLDIwLGxbMjNdKSxPPXIoTyx3LFQsQyx2LDUsbFsyNF0pLEM9cihDLE8sdyxULFAsOSxsWzI1XSksVD1yKFQsQyxPLHcsaCwxNCxsWzI2XSksdz1yKHcsVCxDLE8seSwyMCxsWzI3XSksTz1yKE8sdyxULEMsayw1LGxbMjhdKSxDPXIoQyxPLHcsVCxjLDksbFsyOV0pLFQ9cihULEMsTyx3LGcsMTQsbFszMF0pLHc9cih3LFQsQyxPLG0sMjAsbFszMV0pLE89aShPLHcsVCxDLGQsNCxsWzMyXSksQz1pKEMsTyx3LFQseSwxMSxsWzMzXSksVD1pKFQsQyxPLHcsXywxNixsWzM0XSksdz1pKHcsVCxDLE8sUCwyMyxsWzM1XSksTz1pKE8sdyxULEMsdSw0LGxbMzZdKSxDPWkoQyxPLHcsVCxmLDExLGxbMzddKSxUPWkoVCxDLE8sdyxnLDE2LGxbMzhdKSx3PWkodyxULEMsTyxiLDIzLGxbMzldKSxPPWkoTyx3LFQsQyxrLDQsbFs0MF0pLEM9aShDLE8sdyxULGEsMTEsbFs0MV0pLFQ9aShULEMsTyx3LGgsMTYsbFs0Ml0pLHc9aSh3LFQsQyxPLHAsMjMsbFs0M10pLE89aShPLHcsVCxDLHYsNCxsWzQ0XSksQz1pKEMsTyx3LFQsbSwxMSxsWzQ1XSksVD1pKFQsQyxPLHcsUywxNixsWzQ2XSksdz1pKHcsVCxDLE8sYywyMyxsWzQ3XSksTz1zKE8sdyxULEMsYSw2LGxbNDhdKSxDPXMoQyxPLHcsVCxnLDEwLGxbNDldKSxUPXMoVCxDLE8sdyxQLDE1LGxbNTBdKSx3PXModyxULEMsTyxkLDIxLGxbNTFdKSxPPXMoTyx3LFQsQyxtLDYsbFs1Ml0pLEM9cyhDLE8sdyxULGgsMTAsbFs1M10pLFQ9cyhULEMsTyx3LGIsMTUsbFs1NF0pLHc9cyh3LFQsQyxPLHUsMjEsbFs1NV0pLE89cyhPLHcsVCxDLHksNixsWzU2XSksQz1zKEMsTyx3LFQsUywxMCxsWzU3XSksVD1zKFQsQyxPLHcscCwxNSxsWzU4XSksdz1zKHcsVCxDLE8saywyMSxsWzU5XSksTz1zKE8sdyxULEMsZiw2LGxbNjBdKSxDPXMoQyxPLHcsVCxfLDEwLGxbNjFdKSxUPXMoVCxDLE8sdyxjLDE1LGxbNjJdKSx3PXModyxULEMsTyx2LDIxLGxbNjNdKTtvWzBdPW9bMF0rT3wwLG9bMV09b1sxXSt3fDAsb1syXT1vWzJdK1R8MCxvWzNdPW9bM10rQ3wwfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2RhdGEsbj10LndvcmRzLHI9OCp0aGlzLl9uRGF0YUJ5dGVzLGk9OCp0LnNpZ0J5dGVzO25baT4+PjVdfD0xMjg8PDI0LWklMzI7dmFyIHM9ZS5mbG9vcihyLzQyOTQ5NjcyOTYpO2ZvcihuWzE1KyhpKzY0Pj4+OTw8NCldPTE2NzExOTM1JihzPDw4fHM+Pj4yNCl8NDI3ODI1NTM2MCYoczw8MjR8cz4+PjgpLG5bMTQrKGkrNjQ+Pj45PDw0KV09MTY3MTE5MzUmKHI8PDh8cj4+PjI0KXw0Mjc4MjU1MzYwJihyPDwyNHxyPj4+OCksdC5zaWdCeXRlcz00KihuLmxlbmd0aCsxKSx0aGlzLl9wcm9jZXNzKCksdD10aGlzLl9oYXNoLG49dC53b3JkcyxyPTA7ND5yO3IrKylpPW5bcl0sbltyXT0xNjcxMTkzNSYoaTw8OHxpPj4+MjQpfDQyNzgyNTUzNjAmKGk8PDI0fGk+Pj44KTtyZXR1cm4gdH0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1jLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2hhc2g9dGhpcy5faGFzaC5jbG9uZSgpLGV9fSksby5NRDU9Yy5fY3JlYXRlSGVscGVyKGEpLG8uSG1hY01ENT1jLl9jcmVhdGVIbWFjSGVscGVyKGEpfShNYXRoKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmxpYixyPXQuQmFzZSxpPXQuV29yZEFycmF5LHQ9ZS5hbGdvLHM9dC5FdnBLREY9ci5leHRlbmQoe2NmZzpyLmV4dGVuZCh7a2V5U2l6ZTo0LGhhc2hlcjp0Lk1ENSxpdGVyYXRpb25zOjF9KSxpbml0OmZ1bmN0aW9uKGUpe3RoaXMuY2ZnPXRoaXMuY2ZnLmV4dGVuZChlKX0sY29tcHV0ZTpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj10aGlzLmNmZyxyPW4uaGFzaGVyLmNyZWF0ZSgpLHM9aS5jcmVhdGUoKSxvPXMud29yZHMsYT1uLmtleVNpemUsbj1uLml0ZXJhdGlvbnM7by5sZW5ndGg8YTspe3UmJnIudXBkYXRlKHUpO3ZhciB1PXIudXBkYXRlKGUpLmZpbmFsaXplKHQpO3IucmVzZXQoKTtmb3IodmFyIGM9MTtjPG47YysrKXU9ci5maW5hbGl6ZSh1KSxyLnJlc2V0KCk7cy5jb25jYXQodSl9cmV0dXJuIHMuc2lnQnl0ZXM9NCphLHN9fSk7ZS5FdnBLREY9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBzLmNyZWF0ZShuKS5jb21wdXRlKGUsdCl9fSgpLG4ubGliLkNpcGhlcnx8ZnVuY3Rpb24oZSl7dmFyIHQ9bixyPXQubGliLGk9ci5CYXNlLHM9ci5Xb3JkQXJyYXksbz1yLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0sYT10LmVuYy5CYXNlNjQsdT10LmFsZ28uRXZwS0RGLGM9ci5DaXBoZXI9by5leHRlbmQoe2NmZzppLmV4dGVuZCgpLGNyZWF0ZUVuY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLmNyZWF0ZSh0aGlzLl9FTkNfWEZPUk1fTU9ERSxlLHQpfSxjcmVhdGVEZWNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5jcmVhdGUodGhpcy5fREVDX1hGT1JNX01PREUsZSx0KX0saW5pdDpmdW5jdGlvbihlLHQsbil7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKG4pLHRoaXMuX3hmb3JtTW9kZT1lLHRoaXMuX2tleT10LHRoaXMucmVzZXQoKX0scmVzZXQ6ZnVuY3Rpb24oKXtvLnJlc2V0LmNhbGwodGhpcyksdGhpcy5fZG9SZXNldCgpfSxwcm9jZXNzOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9hcHBlbmQoZSksdGhpcy5fcHJvY2VzcygpfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmdGhpcy5fYXBwZW5kKGUpLHRoaXMuX2RvRmluYWxpemUoKX0sa2V5U2l6ZTo0LGl2U2l6ZTo0LF9FTkNfWEZPUk1fTU9ERToxLF9ERUNfWEZPUk1fTU9ERToyLF9jcmVhdGVIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJue2VuY3J5cHQ6ZnVuY3Rpb24odCxuLHIpe3JldHVybihcInN0cmluZ1wiPT10eXBlb2Ygbj9nOnApLmVuY3J5cHQoZSx0LG4scil9LGRlY3J5cHQ6ZnVuY3Rpb24odCxuLHIpe3JldHVybihcInN0cmluZ1wiPT10eXBlb2Ygbj9nOnApLmRlY3J5cHQoZSx0LG4scil9fX19KTtyLlN0cmVhbUNpcGhlcj1jLmV4dGVuZCh7X2RvRmluYWxpemU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcHJvY2VzcyghMCl9LGJsb2NrU2l6ZToxfSk7dmFyIGw9dC5tb2RlPXt9LGg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRoaXMuX2l2O3I/dGhpcy5faXY9dm9pZCAwOnI9dGhpcy5fcHJldkJsb2NrO2Zvcih2YXIgaT0wO2k8bjtpKyspZVt0K2ldXj1yW2ldfSxmPShyLkJsb2NrQ2lwaGVyTW9kZT1pLmV4dGVuZCh7Y3JlYXRlRW5jcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuRW5jcnlwdG9yLmNyZWF0ZShlLHQpfSxjcmVhdGVEZWNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5EZWNyeXB0b3IuY3JlYXRlKGUsdCl9LGluaXQ6ZnVuY3Rpb24oZSx0KXt0aGlzLl9jaXBoZXI9ZSx0aGlzLl9pdj10fX0pKS5leHRlbmQoKTtmLkVuY3J5cHRvcj1mLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy5fY2lwaGVyLHI9bi5ibG9ja1NpemU7aC5jYWxsKHRoaXMsZSx0LHIpLG4uZW5jcnlwdEJsb2NrKGUsdCksdGhpcy5fcHJldkJsb2NrPWUuc2xpY2UodCx0K3IpfX0pLGYuRGVjcnlwdG9yPWYuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jaXBoZXIscj1uLmJsb2NrU2l6ZSxpPWUuc2xpY2UodCx0K3IpO24uZGVjcnlwdEJsb2NrKGUsdCksaC5jYWxsKHRoaXMsZSx0LHIpLHRoaXMuX3ByZXZCbG9jaz1pfX0pLGw9bC5DQkM9ZixmPSh0LnBhZD17fSkuUGtjczc9e3BhZDpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj00KnQsbj1uLWUuc2lnQnl0ZXMlbixyPW48PDI0fG48PDE2fG48PDh8bixpPVtdLG89MDtvPG47bys9NClpLnB1c2gocik7bj1zLmNyZWF0ZShpLG4pLGUuY29uY2F0KG4pfSx1bnBhZDpmdW5jdGlvbihlKXtlLnNpZ0J5dGVzLT0yNTUmZS53b3Jkc1tlLnNpZ0J5dGVzLTE+Pj4yXX19LHIuQmxvY2tDaXBoZXI9Yy5leHRlbmQoe2NmZzpjLmNmZy5leHRlbmQoe21vZGU6bCxwYWRkaW5nOmZ9KSxyZXNldDpmdW5jdGlvbigpe2MucmVzZXQuY2FsbCh0aGlzKTt2YXIgZT10aGlzLmNmZyx0PWUuaXYsZT1lLm1vZGU7aWYodGhpcy5feGZvcm1Nb2RlPT10aGlzLl9FTkNfWEZPUk1fTU9ERSl2YXIgbj1lLmNyZWF0ZUVuY3J5cHRvcjtlbHNlIG49ZS5jcmVhdGVEZWNyeXB0b3IsdGhpcy5fbWluQnVmZmVyU2l6ZT0xO3RoaXMuX21vZGU9bi5jYWxsKGUsdGhpcyx0JiZ0LndvcmRzKX0sX2RvUHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fbW9kZS5wcm9jZXNzQmxvY2soZSx0KX0sX2RvRmluYWxpemU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmNmZy5wYWRkaW5nO2lmKHRoaXMuX3hmb3JtTW9kZT09dGhpcy5fRU5DX1hGT1JNX01PREUpe2UucGFkKHRoaXMuX2RhdGEsdGhpcy5ibG9ja1NpemUpO3ZhciB0PXRoaXMuX3Byb2Nlc3MoITApfWVsc2UgdD10aGlzLl9wcm9jZXNzKCEwKSxlLnVucGFkKHQpO3JldHVybiB0fSxibG9ja1NpemU6NH0pO3ZhciBkPXIuQ2lwaGVyUGFyYW1zPWkuZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUpe3RoaXMubWl4SW4oZSl9LHRvU3RyaW5nOmZ1bmN0aW9uKGUpe3JldHVybihlfHx0aGlzLmZvcm1hdHRlcikuc3RyaW5naWZ5KHRoaXMpfX0pLGw9KHQuZm9ybWF0PXt9KS5PcGVuU1NMPXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS5jaXBoZXJ0ZXh0O3JldHVybiBlPWUuc2FsdCwoZT9zLmNyZWF0ZShbMTM5ODg5MzY4NCwxNzAxMDc2ODMxXSkuY29uY2F0KGUpLmNvbmNhdCh0KTp0KS50b1N0cmluZyhhKX0scGFyc2U6ZnVuY3Rpb24oZSl7ZT1hLnBhcnNlKGUpO3ZhciB0PWUud29yZHM7aWYoMTM5ODg5MzY4ND09dFswXSYmMTcwMTA3NjgzMT09dFsxXSl7dmFyIG49cy5jcmVhdGUodC5zbGljZSgyLDQpKTt0LnNwbGljZSgwLDQpLGUuc2lnQnl0ZXMtPTE2fXJldHVybiBkLmNyZWF0ZSh7Y2lwaGVydGV4dDplLHNhbHQ6bn0pfX0scD1yLlNlcmlhbGl6YWJsZUNpcGhlcj1pLmV4dGVuZCh7Y2ZnOmkuZXh0ZW5kKHtmb3JtYXQ6bH0pLGVuY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cj10aGlzLmNmZy5leHRlbmQocik7dmFyIGk9ZS5jcmVhdGVFbmNyeXB0b3IobixyKTtyZXR1cm4gdD1pLmZpbmFsaXplKHQpLGk9aS5jZmcsZC5jcmVhdGUoe2NpcGhlcnRleHQ6dCxrZXk6bixpdjppLml2LGFsZ29yaXRobTplLG1vZGU6aS5tb2RlLHBhZGRpbmc6aS5wYWRkaW5nLGJsb2NrU2l6ZTplLmJsb2NrU2l6ZSxmb3JtYXR0ZXI6ci5mb3JtYXR9KX0sZGVjcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcj10aGlzLmNmZy5leHRlbmQociksdD10aGlzLl9wYXJzZSh0LHIuZm9ybWF0KSxlLmNyZWF0ZURlY3J5cHRvcihuLHIpLmZpbmFsaXplKHQuY2lwaGVydGV4dCl9LF9wYXJzZTpmdW5jdGlvbihlLHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlP3QucGFyc2UoZSx0aGlzKTplfX0pLHQ9KHQua2RmPXt9KS5PcGVuU1NMPXtleGVjdXRlOmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByfHwocj1zLnJhbmRvbSg4KSksZT11LmNyZWF0ZSh7a2V5U2l6ZTp0K259KS5jb21wdXRlKGUsciksbj1zLmNyZWF0ZShlLndvcmRzLnNsaWNlKHQpLDQqbiksZS5zaWdCeXRlcz00KnQsZC5jcmVhdGUoe2tleTplLGl2Om4sc2FsdDpyfSl9fSxnPXIuUGFzc3dvcmRCYXNlZENpcGhlcj1wLmV4dGVuZCh7Y2ZnOnAuY2ZnLmV4dGVuZCh7a2RmOnR9KSxlbmNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSxuPXIua2RmLmV4ZWN1dGUobixlLmtleVNpemUsZS5pdlNpemUpLHIuaXY9bi5pdixlPXAuZW5jcnlwdC5jYWxsKHRoaXMsZSx0LG4ua2V5LHIpLGUubWl4SW4obiksZX0sZGVjcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcj10aGlzLmNmZy5leHRlbmQociksdD10aGlzLl9wYXJzZSh0LHIuZm9ybWF0KSxuPXIua2RmLmV4ZWN1dGUobixlLmtleVNpemUsZS5pdlNpemUsdC5zYWx0KSxyLml2PW4uaXYscC5kZWNyeXB0LmNhbGwodGhpcyxlLHQsbi5rZXkscil9fSl9KCksZnVuY3Rpb24oKXtmb3IodmFyIGU9bix0PWUubGliLkJsb2NrQ2lwaGVyLHI9ZS5hbGdvLGk9W10scz1bXSxvPVtdLGE9W10sdT1bXSxjPVtdLGw9W10saD1bXSxmPVtdLGQ9W10scD1bXSxnPTA7MjU2Pmc7ZysrKXBbZ109MTI4Pmc/Zzw8MTpnPDwxXjI4Mztmb3IodmFyIHk9MCx2PTAsZz0wOzI1Nj5nO2crKyl7dmFyIGI9dl52PDwxXnY8PDJedjw8M152PDw0LGI9Yj4+PjheMjU1JmJeOTk7aVt5XT1iLHNbYl09eTt2YXIgXz1wW3ldLG09cFtfXSxrPXBbbV0sUD0yNTcqcFtiXV4xNjg0MzAwOCpiO29beV09UDw8MjR8UD4+PjgsYVt5XT1QPDwxNnxQPj4+MTYsdVt5XT1QPDw4fFA+Pj4yNCxjW3ldPVAsUD0xNjg0MzAwOSprXjY1NTM3Km1eMjU3Kl9eMTY4NDMwMDgqeSxsW2JdPVA8PDI0fFA+Pj44LGhbYl09UDw8MTZ8UD4+PjE2LGZbYl09UDw8OHxQPj4+MjQsZFtiXT1QLHk/KHk9X15wW3BbcFtrXl9dXV0sdl49cFtwW3ZdXSk6eT12PTF9dmFyIFM9WzAsMSwyLDQsOCwxNiwzMiw2NCwxMjgsMjcsNTRdLHI9ci5BRVM9dC5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7Zm9yKHZhciBlPXRoaXMuX2tleSx0PWUud29yZHMsbj1lLnNpZ0J5dGVzLzQsZT00KigodGhpcy5fblJvdW5kcz1uKzYpKzEpLHI9dGhpcy5fa2V5U2NoZWR1bGU9W10scz0wO3M8ZTtzKyspaWYoczxuKXJbc109dFtzXTtlbHNle3ZhciBvPXJbcy0xXTtzJW4/NjxuJiY0PT1zJW4mJihvPWlbbz4+PjI0XTw8MjR8aVtvPj4+MTYmMjU1XTw8MTZ8aVtvPj4+OCYyNTVdPDw4fGlbMjU1Jm9dKToobz1vPDw4fG8+Pj4yNCxvPWlbbz4+PjI0XTw8MjR8aVtvPj4+MTYmMjU1XTw8MTZ8aVtvPj4+OCYyNTVdPDw4fGlbMjU1Jm9dLG9ePVNbcy9ufDBdPDwyNCkscltzXT1yW3Mtbl1eb31mb3IodD10aGlzLl9pbnZLZXlTY2hlZHVsZT1bXSxuPTA7bjxlO24rKylzPWUtbixvPW4lND9yW3NdOnJbcy00XSx0W25dPTQ+bnx8ND49cz9vOmxbaVtvPj4+MjRdXV5oW2lbbz4+PjE2JjI1NV1dXmZbaVtvPj4+OCYyNTVdXV5kW2lbMjU1Jm9dXX0sZW5jcnlwdEJsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fZG9DcnlwdEJsb2NrKGUsdCx0aGlzLl9rZXlTY2hlZHVsZSxvLGEsdSxjLGkpfSxkZWNyeXB0QmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj1lW3QrMV07ZVt0KzFdPWVbdCszXSxlW3QrM109bix0aGlzLl9kb0NyeXB0QmxvY2soZSx0LHRoaXMuX2ludktleVNjaGVkdWxlLGwsaCxmLGQscyksbj1lW3QrMV0sZVt0KzFdPWVbdCszXSxlW3QrM109bn0sX2RvQ3J5cHRCbG9jazpmdW5jdGlvbihlLHQsbixyLGkscyxvLGEpe2Zvcih2YXIgdT10aGlzLl9uUm91bmRzLGM9ZVt0XV5uWzBdLGw9ZVt0KzFdXm5bMV0saD1lW3QrMl1eblsyXSxmPWVbdCszXV5uWzNdLGQ9NCxwPTE7cDx1O3ArKyl2YXIgZz1yW2M+Pj4yNF1eaVtsPj4+MTYmMjU1XV5zW2g+Pj44JjI1NV1eb1syNTUmZl1ebltkKytdLHk9cltsPj4+MjRdXmlbaD4+PjE2JjI1NV1ec1tmPj4+OCYyNTVdXm9bMjU1JmNdXm5bZCsrXSx2PXJbaD4+PjI0XV5pW2Y+Pj4xNiYyNTVdXnNbYz4+PjgmMjU1XV5vWzI1NSZsXV5uW2QrK10sZj1yW2Y+Pj4yNF1eaVtjPj4+MTYmMjU1XV5zW2w+Pj44JjI1NV1eb1syNTUmaF1ebltkKytdLGM9ZyxsPXksaD12O2c9KGFbYz4+PjI0XTw8MjR8YVtsPj4+MTYmMjU1XTw8MTZ8YVtoPj4+OCYyNTVdPDw4fGFbMjU1JmZdKV5uW2QrK10seT0oYVtsPj4+MjRdPDwyNHxhW2g+Pj4xNiYyNTVdPDwxNnxhW2Y+Pj44JjI1NV08PDh8YVsyNTUmY10pXm5bZCsrXSx2PShhW2g+Pj4yNF08PDI0fGFbZj4+PjE2JjI1NV08PDE2fGFbYz4+PjgmMjU1XTw8OHxhWzI1NSZsXSlebltkKytdLGY9KGFbZj4+PjI0XTw8MjR8YVtjPj4+MTYmMjU1XTw8MTZ8YVtsPj4+OCYyNTVdPDw4fGFbMjU1JmhdKV5uW2QrK10sZVt0XT1nLGVbdCsxXT15LGVbdCsyXT12LGVbdCszXT1mfSxrZXlTaXplOjh9KTtlLkFFUz10Ll9jcmVhdGVIZWxwZXIocil9KCksbi5tb2RlLkVDQj1mdW5jdGlvbigpe3ZhciBlPW4ubGliLkJsb2NrQ2lwaGVyTW9kZS5leHRlbmQoKTtyZXR1cm4gZS5FbmNyeXB0b3I9ZS5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3RoaXMuX2NpcGhlci5lbmNyeXB0QmxvY2soZSx0KX19KSxlLkRlY3J5cHRvcj1lLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fY2lwaGVyLmRlY3J5cHRCbG9jayhlLHQpfX0pLGV9KCksZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89big5KSxhPShyKG8pLG4oNykpLHU9KHIoYSksbigxMikpLGM9KHIodSksbigxNCkpLGw9cihjKSxoPW4oMTcpLGY9cihoKSxkPW4oMTgpLHA9cihkKSxnPShuKDgpLG4oMTMpKSx5PXIoZyksdj1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC5zdWJzY3JpYmVFbmRwb2ludCxyPXQubGVhdmVFbmRwb2ludCxzPXQuaGVhcnRiZWF0RW5kcG9pbnQsbz10LnNldFN0YXRlRW5kcG9pbnQsYT10LnRpbWVFbmRwb2ludCx1PXQuY29uZmlnLGM9dC5jcnlwdG8saD10Lmxpc3RlbmVyTWFuYWdlcjtpKHRoaXMsZSksdGhpcy5fbGlzdGVuZXJNYW5hZ2VyPWgsdGhpcy5fY29uZmlnPXUsdGhpcy5fbGVhdmVFbmRwb2ludD1yLHRoaXMuX2hlYXJ0YmVhdEVuZHBvaW50PXMsdGhpcy5fc2V0U3RhdGVFbmRwb2ludD1vLHRoaXMuX3N1YnNjcmliZUVuZHBvaW50PW4sdGhpcy5fY3J5cHRvPWMsdGhpcy5fY2hhbm5lbHM9e30sdGhpcy5fcHJlc2VuY2VDaGFubmVscz17fSx0aGlzLl9jaGFubmVsR3JvdXBzPXt9LHRoaXMuX3ByZXNlbmNlQ2hhbm5lbEdyb3Vwcz17fSx0aGlzLl9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnM9W10sdGhpcy5fcGVuZGluZ0NoYW5uZWxHcm91cFN1YnNjcmlwdGlvbnM9W10sdGhpcy5fY3VycmVudFRpbWV0b2tlbj0wLHRoaXMuX2xhc3RUaW1ldG9rZW49MCx0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCx0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITEsdGhpcy5faXNPbmxpbmU9ITAsdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlcj1uZXcgbC5kZWZhdWx0KHt0aW1lRW5kcG9pbnQ6YX0pLHRoaXMuX2RlZHVwaW5nTWFuYWdlcj1uZXcgZi5kZWZhdWx0KHtjb25maWc6dX0pfXJldHVybiBzKGUsW3trZXk6XCJhZGFwdFN0YXRlQ2hhbmdlXCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLHI9ZS5zdGF0ZSxpPWUuY2hhbm5lbHMscz12b2lkIDA9PT1pP1tdOmksbz1lLmNoYW5uZWxHcm91cHMsYT12b2lkIDA9PT1vP1tdOm87cmV0dXJuIHMuZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxzJiYobi5fY2hhbm5lbHNbZV0uc3RhdGU9cil9KSxhLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVsR3JvdXBzJiYobi5fY2hhbm5lbEdyb3Vwc1tlXS5zdGF0ZT1yKX0pLHRoaXMuX3NldFN0YXRlRW5kcG9pbnQoe3N0YXRlOnIsY2hhbm5lbHM6cyxjaGFubmVsR3JvdXBzOmF9LHQpfX0se2tleTpcImFkYXB0U3Vic2NyaWJlQ2hhbmdlXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxuPWUudGltZXRva2VuLHI9ZS5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPWUuY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PXM/W106cyxhPWUud2l0aFByZXNlbmNlLHU9dm9pZCAwIT09YSYmYTtpZighdGhpcy5fY29uZmlnLnN1YnNjcmliZUtleXx8XCJcIj09PXRoaXMuX2NvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuIHZvaWQoY29uc29sZSYmY29uc29sZS5sb2cmJmNvbnNvbGUubG9nKFwic3Vic2NyaWJlIGtleSBtaXNzaW5nOyBhYm9ydGluZyBzdWJzY3JpYmVcIikpO24mJih0aGlzLl9sYXN0VGltZXRva2VuPXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sdGhpcy5fY3VycmVudFRpbWV0b2tlbj1uKSxcIjBcIiE9PXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4mJih0aGlzLl9zdG9yZWRUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPTApLGkuZm9yRWFjaChmdW5jdGlvbihlKXt0Ll9jaGFubmVsc1tlXT17c3RhdGU6e319LHUmJih0Ll9wcmVzZW5jZUNoYW5uZWxzW2VdPXt9KSx0Ll9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnMucHVzaChlKX0pLFxuby5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuX2NoYW5uZWxHcm91cHNbZV09e3N0YXRlOnt9fSx1JiYodC5fcHJlc2VuY2VDaGFubmVsR3JvdXBzW2VdPXt9KSx0Ll9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucy5wdXNoKGUpfSksdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSExLHRoaXMucmVjb25uZWN0KCl9fSx7a2V5OlwiYWRhcHRVbnN1YnNjcmliZUNoYW5nZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcyxyPWUuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1lLmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1zP1tdOnMsYT1bXSx1PVtdO2kuZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxzJiYoZGVsZXRlIG4uX2NoYW5uZWxzW2VdLGEucHVzaChlKSksZSBpbiBuLl9wcmVzZW5jZUNoYW5uZWxzJiYoZGVsZXRlIG4uX3ByZXNlbmNlQ2hhbm5lbHNbZV0sYS5wdXNoKGUpKX0pLG8uZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxHcm91cHMmJihkZWxldGUgbi5fY2hhbm5lbEdyb3Vwc1tlXSx1LnB1c2goZSkpLGUgaW4gbi5fcHJlc2VuY2VDaGFubmVsR3JvdXBzJiYoZGVsZXRlIG4uX2NoYW5uZWxHcm91cHNbZV0sdS5wdXNoKGUpKX0pLDA9PT1hLmxlbmd0aCYmMD09PXUubGVuZ3RofHwoITEhPT10aGlzLl9jb25maWcuc3VwcHJlc3NMZWF2ZUV2ZW50c3x8dHx8dGhpcy5fbGVhdmVFbmRwb2ludCh7Y2hhbm5lbHM6YSxjaGFubmVsR3JvdXBzOnV9LGZ1bmN0aW9uKGUpe2UuYWZmZWN0ZWRDaGFubmVscz1hLGUuYWZmZWN0ZWRDaGFubmVsR3JvdXBzPXUsZS5jdXJyZW50VGltZXRva2VuPW4uX2N1cnJlbnRUaW1ldG9rZW4sZS5sYXN0VGltZXRva2VuPW4uX2xhc3RUaW1ldG9rZW4sbi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpfSksMD09PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9jaGFubmVsR3JvdXBzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxHcm91cHMpLmxlbmd0aCYmKHRoaXMuX2xhc3RUaW1ldG9rZW49MCx0aGlzLl9jdXJyZW50VGltZXRva2VuPTAsdGhpcy5fc3RvcmVkVGltZXRva2VuPW51bGwsdGhpcy5fcmVnaW9uPW51bGwsdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdG9wUG9sbGluZygpKSx0aGlzLnJlY29ubmVjdCgpKX19LHtrZXk6XCJ1bnN1YnNjcmliZUFsbFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuYWRhcHRVbnN1YnNjcmliZUNoYW5nZSh7Y2hhbm5lbHM6dGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbHMoKSxjaGFubmVsR3JvdXBzOnRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHMoKX0sZSl9fSx7a2V5OlwiZ2V0U3Vic2NyaWJlZENoYW5uZWxzXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpfX0se2tleTpcImdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3Vwcyl9fSx7a2V5OlwicmVjb25uZWN0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdGFydFN1YnNjcmliZUxvb3AoKSx0aGlzLl9yZWdpc3RlckhlYXJ0YmVhdFRpbWVyKCl9fSx7a2V5OlwiZGlzY29ubmVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RvcFN1YnNjcmliZUxvb3AoKSx0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLnN0b3BQb2xsaW5nKCl9fSx7a2V5OlwiX3JlZ2lzdGVySGVhcnRiZWF0VGltZXJcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BIZWFydGJlYXRUaW1lcigpLDAhPT10aGlzLl9jb25maWcuZ2V0SGVhcnRiZWF0SW50ZXJ2YWwoKSYmKHRoaXMuX3BlcmZvcm1IZWFydGJlYXRMb29wKCksdGhpcy5faGVhcnRiZWF0VGltZXI9c2V0SW50ZXJ2YWwodGhpcy5fcGVyZm9ybUhlYXJ0YmVhdExvb3AuYmluZCh0aGlzKSwxZTMqdGhpcy5fY29uZmlnLmdldEhlYXJ0YmVhdEludGVydmFsKCkpKX19LHtrZXk6XCJfc3RvcEhlYXJ0YmVhdFRpbWVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9oZWFydGJlYXRUaW1lciYmKGNsZWFySW50ZXJ2YWwodGhpcy5faGVhcnRiZWF0VGltZXIpLHRoaXMuX2hlYXJ0YmVhdFRpbWVyPW51bGwpfX0se2tleTpcIl9wZXJmb3JtSGVhcnRiZWF0TG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcyx0PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKSxuPU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLHI9e307aWYoMCE9PXQubGVuZ3RofHwwIT09bi5sZW5ndGgpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgbj1lLl9jaGFubmVsc1t0XS5zdGF0ZTtPYmplY3Qua2V5cyhuKS5sZW5ndGgmJihyW3RdPW4pfSksbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBuPWUuX2NoYW5uZWxHcm91cHNbdF0uc3RhdGU7T2JqZWN0LmtleXMobikubGVuZ3RoJiYoclt0XT1uKX0pO3ZhciBpPWZ1bmN0aW9uKHQpe3QuZXJyb3ImJmUuX2NvbmZpZy5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KSx0LmVycm9yJiZlLl9jb25maWcuYXV0b05ldHdvcmtEZXRlY3Rpb24mJmUuX2lzT25saW5lJiYoZS5faXNPbmxpbmU9ITEsZS5kaXNjb25uZWN0KCksZS5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTmV0d29ya0Rvd24oKSxlLnJlY29ubmVjdCgpKSwhdC5lcnJvciYmZS5fY29uZmlnLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KX07dGhpcy5faGVhcnRiZWF0RW5kcG9pbnQoe2NoYW5uZWxzOnQsY2hhbm5lbEdyb3VwczpuLHN0YXRlOnJ9LGkuYmluZCh0aGlzKSl9fX0se2tleTpcIl9zdGFydFN1YnNjcmliZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BTdWJzY3JpYmVMb29wKCk7dmFyIGU9W10sdD1bXTtpZihPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQrXCItcG5wcmVzXCIpfSksT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3VwcykuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZStcIi1wbnByZXNcIil9KSwwIT09ZS5sZW5ndGh8fDAhPT10Lmxlbmd0aCl7dmFyIG49e2NoYW5uZWxzOmUsY2hhbm5lbEdyb3Vwczp0LHRpbWV0b2tlbjp0aGlzLl9jdXJyZW50VGltZXRva2VuLGZpbHRlckV4cHJlc3Npb246dGhpcy5fY29uZmlnLmZpbHRlckV4cHJlc3Npb24scmVnaW9uOnRoaXMuX3JlZ2lvbn07dGhpcy5fc3Vic2NyaWJlQ2FsbD10aGlzLl9zdWJzY3JpYmVFbmRwb2ludChuLHRoaXMuX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZS5iaW5kKHRoaXMpKX19fSx7a2V5OlwiX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcztpZihlLmVycm9yKXJldHVybiB2b2lkKGUuY2F0ZWdvcnk9PT15LmRlZmF1bHQuUE5UaW1lb3V0Q2F0ZWdvcnk/dGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCk6ZS5jYXRlZ29yeT09PXkuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeT8odGhpcy5kaXNjb25uZWN0KCksZS5lcnJvciYmdGhpcy5fY29uZmlnLmF1dG9OZXR3b3JrRGV0ZWN0aW9uJiZ0aGlzLl9pc09ubGluZSYmKHRoaXMuX2lzT25saW5lPSExLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtEb3duKCkpLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIub25SZWNvbm5lY3Rpb24oZnVuY3Rpb24oKXtuLl9jb25maWcuYXV0b05ldHdvcmtEZXRlY3Rpb24mJiFuLl9pc09ubGluZSYmKG4uX2lzT25saW5lPSEwLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtVcCgpKSxuLnJlY29ubmVjdCgpLG4uX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMDt2YXIgdD17Y2F0ZWdvcnk6eS5kZWZhdWx0LlBOUmVjb25uZWN0ZWRDYXRlZ29yeSxvcGVyYXRpb246ZS5vcGVyYXRpb24sbGFzdFRpbWV0b2tlbjpuLl9sYXN0VGltZXRva2VuLGN1cnJlbnRUaW1ldG9rZW46bi5fY3VycmVudFRpbWV0b2tlbn07bi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHQpfSksdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdGFydFBvbGxpbmcoKSx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSkpOmUuY2F0ZWdvcnk9PT15LmRlZmF1bHQuUE5CYWRSZXF1ZXN0Q2F0ZWdvcnk/KHRoaXMuX3N0b3BIZWFydGJlYXRUaW1lcigpLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKSk6dGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpKTtpZih0aGlzLl9zdG9yZWRUaW1ldG9rZW4/KHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49dGhpcy5fc3RvcmVkVGltZXRva2VuLHRoaXMuX3N0b3JlZFRpbWV0b2tlbj1udWxsKToodGhpcy5fbGFzdFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49dC5tZXRhZGF0YS50aW1ldG9rZW4pLCF0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQpe3ZhciByPXt9O3IuY2F0ZWdvcnk9eS5kZWZhdWx0LlBOQ29ubmVjdGVkQ2F0ZWdvcnksci5vcGVyYXRpb249ZS5vcGVyYXRpb24sci5hZmZlY3RlZENoYW5uZWxzPXRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucyxyLnN1YnNjcmliZWRDaGFubmVscz10aGlzLmdldFN1YnNjcmliZWRDaGFubmVscygpLHIuYWZmZWN0ZWRDaGFubmVsR3JvdXBzPXRoaXMuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zLHIubGFzdFRpbWV0b2tlbj10aGlzLl9sYXN0VGltZXRva2VuLHIuY3VycmVudFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMCx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMociksdGhpcy5fcGVuZGluZ0NoYW5uZWxTdWJzY3JpcHRpb25zPVtdLHRoaXMuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zPVtdfXZhciBpPXQubWVzc2FnZXN8fFtdLHM9dGhpcy5fY29uZmlnLG89cy5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkLGE9cy5kZWR1cGVPblN1YnNjcmliZTtpZihvJiZpLmxlbmd0aD49byl7dmFyIHU9e307dS5jYXRlZ29yeT15LmRlZmF1bHQuUE5SZXF1ZXN0TWVzc2FnZUNvdW50RXhjZWVkZWRDYXRlZ29yeSx1Lm9wZXJhdGlvbj1lLm9wZXJhdGlvbix0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXModSl9aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciB0PWUuY2hhbm5lbCxyPWUuc3Vic2NyaXB0aW9uTWF0Y2gsaT1lLnB1Ymxpc2hNZXRhRGF0YTtpZih0PT09ciYmKHI9bnVsbCksYSl7aWYobi5fZGVkdXBpbmdNYW5hZ2VyLmlzRHVwbGljYXRlKGUpKXJldHVybjtuLl9kZWR1cGluZ01hbmFnZXIuYWRkRW50cnkoZSl9aWYocC5kZWZhdWx0LmVuZHNXaXRoKGUuY2hhbm5lbCxcIi1wbnByZXNcIikpe3ZhciBzPXt9O3MuY2hhbm5lbD1udWxsLHMuc3Vic2NyaXB0aW9uPW51bGwscy5hY3R1YWxDaGFubmVsPW51bGwhPXI/dDpudWxsLHMuc3Vic2NyaWJlZENoYW5uZWw9bnVsbCE9cj9yOnQsdCYmKHMuY2hhbm5lbD10LnN1YnN0cmluZygwLHQubGFzdEluZGV4T2YoXCItcG5wcmVzXCIpKSksciYmKHMuc3Vic2NyaXB0aW9uPXIuc3Vic3RyaW5nKDAsci5sYXN0SW5kZXhPZihcIi1wbnByZXNcIikpKSxzLmFjdGlvbj1lLnBheWxvYWQuYWN0aW9uLHMuc3RhdGU9ZS5wYXlsb2FkLmRhdGEscy50aW1ldG9rZW49aS5wdWJsaXNoVGltZXRva2VuLHMub2NjdXBhbmN5PWUucGF5bG9hZC5vY2N1cGFuY3kscy51dWlkPWUucGF5bG9hZC51dWlkLHMudGltZXN0YW1wPWUucGF5bG9hZC50aW1lc3RhbXAsZS5wYXlsb2FkLmpvaW4mJihzLmpvaW49ZS5wYXlsb2FkLmpvaW4pLGUucGF5bG9hZC5sZWF2ZSYmKHMubGVhdmU9ZS5wYXlsb2FkLmxlYXZlKSxlLnBheWxvYWQudGltZW91dCYmKHMudGltZW91dD1lLnBheWxvYWQudGltZW91dCksbi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlUHJlc2VuY2Uocyl9ZWxzZXt2YXIgbz17fTtvLmNoYW5uZWw9bnVsbCxvLnN1YnNjcmlwdGlvbj1udWxsLG8uYWN0dWFsQ2hhbm5lbD1udWxsIT1yP3Q6bnVsbCxvLnN1YnNjcmliZWRDaGFubmVsPW51bGwhPXI/cjp0LG8uY2hhbm5lbD10LG8uc3Vic2NyaXB0aW9uPXIsby50aW1ldG9rZW49aS5wdWJsaXNoVGltZXRva2VuLG8ucHVibGlzaGVyPWUuaXNzdWluZ0NsaWVudElkLGUudXNlck1ldGFkYXRhJiYoby51c2VyTWV0YWRhdGE9ZS51c2VyTWV0YWRhdGEpLG4uX2NvbmZpZy5jaXBoZXJLZXk/by5tZXNzYWdlPW4uX2NyeXB0by5kZWNyeXB0KGUucGF5bG9hZCk6by5tZXNzYWdlPWUucGF5bG9hZCxuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VNZXNzYWdlKG8pfX0pLHRoaXMuX3JlZ2lvbj10Lm1ldGFkYXRhLnJlZ2lvbix0aGlzLl9zdGFydFN1YnNjcmliZUxvb3AoKX19LHtrZXk6XCJfc3RvcFN1YnNjcmliZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N1YnNjcmliZUNhbGwmJih0aGlzLl9zdWJzY3JpYmVDYWxsLmFib3J0KCksdGhpcy5fc3Vic2NyaWJlQ2FsbD1udWxsKX19XSksZX0oKTt0LmRlZmF1bHQ9dixlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPShuKDgpLG4oMTMpKSxvPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0ocyksYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXtyKHRoaXMsZSksdGhpcy5fbGlzdGVuZXJzPVtdfXJldHVybiBpKGUsW3trZXk6XCJhZGRMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5wdXNoKGUpfX0se2tleTpcInJlbW92ZUxpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9W107dGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obil7biE9PWUmJnQucHVzaChuKX0pLHRoaXMuX2xpc3RlbmVycz10fX0se2tleTpcInJlbW92ZUFsbExpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGlzdGVuZXJzPVtdfX0se2tleTpcImFubm91bmNlUHJlc2VuY2VcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0LnByZXNlbmNlJiZ0LnByZXNlbmNlKGUpfSl9fSx7a2V5OlwiYW5ub3VuY2VTdGF0dXNcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0LnN0YXR1cyYmdC5zdGF0dXMoZSl9KX19LHtrZXk6XCJhbm5vdW5jZU1lc3NhZ2VcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0Lm1lc3NhZ2UmJnQubWVzc2FnZShlKX0pfX0se2tleTpcImFubm91bmNlTmV0d29ya1VwXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT17fTtlLmNhdGVnb3J5PW8uZGVmYXVsdC5QTk5ldHdvcmtVcENhdGVnb3J5LHRoaXMuYW5ub3VuY2VTdGF0dXMoZSl9fSx7a2V5OlwiYW5ub3VuY2VOZXR3b3JrRG93blwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9e307ZS5jYXRlZ29yeT1vLmRlZmF1bHQuUE5OZXR3b3JrRG93bkNhdGVnb3J5LHRoaXMuYW5ub3VuY2VTdGF0dXMoZSl9fV0pLGV9KCk7dC5kZWZhdWx0PWEsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9e1BOTmV0d29ya1VwQ2F0ZWdvcnk6XCJQTk5ldHdvcmtVcENhdGVnb3J5XCIsUE5OZXR3b3JrRG93bkNhdGVnb3J5OlwiUE5OZXR3b3JrRG93bkNhdGVnb3J5XCIsUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk6XCJQTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeVwiLFBOVGltZW91dENhdGVnb3J5OlwiUE5UaW1lb3V0Q2F0ZWdvcnlcIixQTkJhZFJlcXVlc3RDYXRlZ29yeTpcIlBOQmFkUmVxdWVzdENhdGVnb3J5XCIsUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeTpcIlBOQWNjZXNzRGVuaWVkQ2F0ZWdvcnlcIixQTlVua25vd25DYXRlZ29yeTpcIlBOVW5rbm93bkNhdGVnb3J5XCIsUE5SZWNvbm5lY3RlZENhdGVnb3J5OlwiUE5SZWNvbm5lY3RlZENhdGVnb3J5XCIsUE5Db25uZWN0ZWRDYXRlZ29yeTpcIlBOQ29ubmVjdGVkQ2F0ZWdvcnlcIixQTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5OlwiUE5SZXF1ZXN0TWVzc2FnZUNvdW50RXhjZWVkZWRDYXRlZ29yeVwifSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oMTUpLG89KGZ1bmN0aW9uKGUpe2UmJmUuX19lc01vZHVsZX0ocyksbig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC50aW1lRW5kcG9pbnQ7cih0aGlzLGUpLHRoaXMuX3RpbWVFbmRwb2ludD1ufXJldHVybiBpKGUsW3trZXk6XCJvblJlY29ubmVjdGlvblwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX3JlY29ubmVjdGlvbkNhbGxiYWNrPWV9fSx7a2V5Olwic3RhcnRQb2xsaW5nXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl90aW1lVGltZXI9c2V0SW50ZXJ2YWwodGhpcy5fcGVyZm9ybVRpbWVMb29wLmJpbmQodGhpcyksM2UzKX19LHtrZXk6XCJzdG9wUG9sbGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lVGltZXIpfX0se2tleTpcIl9wZXJmb3JtVGltZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5fdGltZUVuZHBvaW50KGZ1bmN0aW9uKHQpe3QuZXJyb3J8fChjbGVhckludGVydmFsKGUuX3RpbWVUaW1lciksZS5fcmVjb25uZWN0aW9uQ2FsbGJhY2soKSl9KX19XSksZX0oKSk7dC5kZWZhdWx0PW8sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOVGltZU9wZXJhdGlvbn1mdW5jdGlvbiBpKCl7cmV0dXJuXCIvdGltZS8wXCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gbygpe3JldHVybnt9fWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7cmV0dXJue3RpbWV0b2tlbjp0WzBdfX1mdW5jdGlvbiBjKCl7fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC5nZXRVUkw9aSx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5wcmVwYXJlUGFyYW1zPW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmhhbmRsZVJlc3BvbnNlPXUsdC52YWxpZGF0ZVBhcmFtcz1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXtQTlRpbWVPcGVyYXRpb246XCJQTlRpbWVPcGVyYXRpb25cIixQTkhpc3RvcnlPcGVyYXRpb246XCJQTkhpc3RvcnlPcGVyYXRpb25cIixQTkZldGNoTWVzc2FnZXNPcGVyYXRpb246XCJQTkZldGNoTWVzc2FnZXNPcGVyYXRpb25cIixQTlN1YnNjcmliZU9wZXJhdGlvbjpcIlBOU3Vic2NyaWJlT3BlcmF0aW9uXCIsUE5VbnN1YnNjcmliZU9wZXJhdGlvbjpcIlBOVW5zdWJzY3JpYmVPcGVyYXRpb25cIixQTlB1Ymxpc2hPcGVyYXRpb246XCJQTlB1Ymxpc2hPcGVyYXRpb25cIixQTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb246XCJQTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb25cIixQTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9uOlwiUE5SZW1vdmVBbGxQdXNoTm90aWZpY2F0aW9uc09wZXJhdGlvblwiLFBOV2hlcmVOb3dPcGVyYXRpb246XCJQTldoZXJlTm93T3BlcmF0aW9uXCIsUE5TZXRTdGF0ZU9wZXJhdGlvbjpcIlBOU2V0U3RhdGVPcGVyYXRpb25cIixQTkhlcmVOb3dPcGVyYXRpb246XCJQTkhlcmVOb3dPcGVyYXRpb25cIixQTkdldFN0YXRlT3BlcmF0aW9uOlwiUE5HZXRTdGF0ZU9wZXJhdGlvblwiLFBOSGVhcnRiZWF0T3BlcmF0aW9uOlwiUE5IZWFydGJlYXRPcGVyYXRpb25cIixQTkNoYW5uZWxHcm91cHNPcGVyYXRpb246XCJQTkNoYW5uZWxHcm91cHNPcGVyYXRpb25cIixQTlJlbW92ZUdyb3VwT3BlcmF0aW9uOlwiUE5SZW1vdmVHcm91cE9wZXJhdGlvblwiLFBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvbjpcIlBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvblwiLFBOQWRkQ2hhbm5lbHNUb0dyb3VwT3BlcmF0aW9uOlwiUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb25cIixQTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9uOlwiUE5SZW1vdmVDaGFubmVsc0Zyb21Hcm91cE9wZXJhdGlvblwiLFBOQWNjZXNzTWFuYWdlckdyYW50OlwiUE5BY2Nlc3NNYW5hZ2VyR3JhbnRcIixQTkFjY2Vzc01hbmFnZXJBdWRpdDpcIlBOQWNjZXNzTWFuYWdlckF1ZGl0XCJ9LGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLHM9big3KSxvPShmdW5jdGlvbihlKXtlJiZlLl9fZXNNb2R1bGV9KHMpLGZ1bmN0aW9uKGUpe3ZhciB0PTA7aWYoMD09PWUubGVuZ3RoKXJldHVybiB0O2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bis9MSl7dD0odDw8NSktdCtlLmNoYXJDb2RlQXQobiksdCY9dH1yZXR1cm4gdH0pLGE9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuY29uZmlnO3IodGhpcyxlKSx0aGlzLmhhc2hIaXN0b3J5PVtdLHRoaXMuX2NvbmZpZz1ufXJldHVybiBpKGUsW3trZXk6XCJnZXRLZXlcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1vKEpTT04uc3RyaW5naWZ5KGUucGF5bG9hZCkpLnRvU3RyaW5nKCk7cmV0dXJuIGUucHVibGlzaE1ldGFEYXRhLnB1Ymxpc2hUaW1ldG9rZW4rXCItXCIrdH19LHtrZXk6XCJpc0R1cGxpY2F0ZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmhhc2hIaXN0b3J5LmluY2x1ZGVzKHRoaXMuZ2V0S2V5KGUpKX19LHtrZXk6XCJhZGRFbnRyeVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuaGFzaEhpc3RvcnkubGVuZ3RoPj10aGlzLl9jb25maWcubWF4aW11bUNhY2hlU2l6ZSYmdGhpcy5oYXNoSGlzdG9yeS5zaGlmdCgpLHRoaXMuaGFzaEhpc3RvcnkucHVzaCh0aGlzLmdldEtleShlKSl9fSx7a2V5OlwiY2xlYXJIaXN0b3J5XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmhhc2hIaXN0b3J5PVtdfX1dKSxlfSgpO3QuZGVmYXVsdD1hLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlKXt2YXIgdD1bXTtyZXR1cm4gT2JqZWN0LmtleXMoZSkuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUpfSksdH1mdW5jdGlvbiByKGUpe3JldHVybiBlbmNvZGVVUklDb21wb25lbnQoZSkucmVwbGFjZSgvWyF+KicoKV0vZyxmdW5jdGlvbihlKXtyZXR1cm5cIiVcIitlLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9KX1mdW5jdGlvbiBpKGUpe3JldHVybiBuKGUpLnNvcnQoKX1mdW5jdGlvbiBzKGUpe3JldHVybiBpKGUpLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdCtcIj1cIityKGVbdF0pfSkuam9pbihcIiZcIil9ZnVuY3Rpb24gbyhlLHQpe3JldHVybi0xIT09ZS5pbmRleE9mKHQsdGhpcy5sZW5ndGgtdC5sZW5ndGgpfWZ1bmN0aW9uIGEoKXt2YXIgZT12b2lkIDAsdD12b2lkIDA7cmV0dXJue3Byb21pc2U6bmV3IFByb21pc2UoZnVuY3Rpb24obixyKXtlPW4sdD1yfSkscmVqZWN0OnQsZnVsZmlsbDplfX1lLmV4cG9ydHM9e3NpZ25QYW1Gcm9tUGFyYW1zOnMsZW5kc1dpdGg6byxjcmVhdGVQcm9taXNlOmEsZW5jb2RlU3RyaW5nOnJ9fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gcyhlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIG8oZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1mdW5jdGlvbiBhKGUsdCl7cmV0dXJuIGUudHlwZT10LGUuZXJyb3I9ITAsZX1mdW5jdGlvbiB1KGUpe3JldHVybiBhKHttZXNzYWdlOmV9LFwidmFsaWRhdGlvbkVycm9yXCIpfWZ1bmN0aW9uIGMoZSx0LG4pe3JldHVybiBlLnVzZVBvc3QmJmUudXNlUG9zdCh0LG4pP2UucG9zdFVSTCh0LG4pOmUuZ2V0VVJMKHQsbil9ZnVuY3Rpb24gbChlKXt2YXIgdD1cIlB1Yk51Yi1KUy1cIitlLnNka0ZhbWlseTtyZXR1cm4gZS5wYXJ0bmVySWQmJih0Kz1cIi1cIitlLnBhcnRuZXJJZCksdCs9XCIvXCIrZS5nZXRWZXJzaW9uKCl9ZnVuY3Rpb24gaChlLHQsbil7dmFyIHI9ZS5jb25maWcsaT1lLmNyeXB0bztuLnRpbWVzdGFtcD1NYXRoLmZsb29yKChuZXcgRGF0ZSkuZ2V0VGltZSgpLzFlMyk7dmFyIHM9ci5zdWJzY3JpYmVLZXkrXCJcXG5cIityLnB1Ymxpc2hLZXkrXCJcXG5cIit0K1wiXFxuXCI7cys9Zy5kZWZhdWx0LnNpZ25QYW1Gcm9tUGFyYW1zKG4pO3ZhciBvPWkuSE1BQ1NIQTI1NihzKTtvPW8ucmVwbGFjZSgvXFwrL2csXCItXCIpLG89by5yZXBsYWNlKC9cXC8vZyxcIl9cIiksbi5zaWduYXR1cmU9b31PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj1lLm5ldHdvcmtpbmcscj1lLmNvbmZpZyxpPW51bGwscz1udWxsLG89e307dC5nZXRPcGVyYXRpb24oKT09PWIuZGVmYXVsdC5QTlRpbWVPcGVyYXRpb258fHQuZ2V0T3BlcmF0aW9uKCk9PT1iLmRlZmF1bHQuUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9uP2k9YXJndW1lbnRzLmxlbmd0aDw9Mj92b2lkIDA6YXJndW1lbnRzWzJdOihvPWFyZ3VtZW50cy5sZW5ndGg8PTI/dm9pZCAwOmFyZ3VtZW50c1syXSxpPWFyZ3VtZW50cy5sZW5ndGg8PTM/dm9pZCAwOmFyZ3VtZW50c1szXSksXCJ1bmRlZmluZWRcIj09dHlwZW9mIFByb21pc2V8fGl8fChzPWcuZGVmYXVsdC5jcmVhdGVQcm9taXNlKCkpO3ZhciBhPXQudmFsaWRhdGVQYXJhbXMoZSxvKTtpZighYSl7dmFyIGY9dC5wcmVwYXJlUGFyYW1zKGUsbykscD1jKHQsZSxvKSx5PXZvaWQgMCx2PXt1cmw6cCxvcGVyYXRpb246dC5nZXRPcGVyYXRpb24oKSx0aW1lb3V0OnQuZ2V0UmVxdWVzdFRpbWVvdXQoZSl9O2YudXVpZD1yLlVVSUQsZi5wbnNkaz1sKHIpLHIudXNlSW5zdGFuY2VJZCYmKGYuaW5zdGFuY2VpZD1yLmluc3RhbmNlSWQpLHIudXNlUmVxdWVzdElkJiYoZi5yZXF1ZXN0aWQ9ZC5kZWZhdWx0LnY0KCkpLHQuaXNBdXRoU3VwcG9ydGVkKCkmJnIuZ2V0QXV0aEtleSgpJiYoZi5hdXRoPXIuZ2V0QXV0aEtleSgpKSxyLnNlY3JldEtleSYmaChlLHAsZik7dmFyIG09ZnVuY3Rpb24obixyKXtpZihuLmVycm9yKXJldHVybiB2b2lkKGk/aShuKTpzJiZzLnJlamVjdChuZXcgXyhcIlB1Yk51YiBjYWxsIGZhaWxlZCwgY2hlY2sgc3RhdHVzIGZvciBkZXRhaWxzXCIsbikpKTt2YXIgYT10LmhhbmRsZVJlc3BvbnNlKGUscixvKTtpP2kobixhKTpzJiZzLmZ1bGZpbGwoYSl9O2lmKHQudXNlUG9zdCYmdC51c2VQb3N0KGUsbykpe3ZhciBrPXQucG9zdFBheWxvYWQoZSxvKTt5PW4uUE9TVChmLGssdixtKX1lbHNlIHk9bi5HRVQoZix2LG0pO3JldHVybiB0LmdldE9wZXJhdGlvbigpPT09Yi5kZWZhdWx0LlBOU3Vic2NyaWJlT3BlcmF0aW9uP3k6cz9zLnByb21pc2U6dm9pZCAwfXJldHVybiBpP2kodShhKSk6cz8ocy5yZWplY3QobmV3IF8oXCJWYWxpZGF0aW9uIGZhaWxlZCwgY2hlY2sgc3RhdHVzIGZvciBkZXRhaWxzXCIsdShhKSkpLHMucHJvbWlzZSk6dm9pZCAwfTt2YXIgZj1uKDIpLGQ9cihmKSxwPShuKDgpLG4oMTgpKSxnPXIocCkseT1uKDcpLHY9KHIoeSksbigxNikpLGI9cih2KSxfPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSxuKXtpKHRoaXMsdCk7dmFyIHI9cyh0aGlzLCh0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsKHRoaXMsZSkpO3JldHVybiByLm5hbWU9ci5jb25zdHJ1Y3Rvci5uYW1lLHIuc3RhdHVzPW4sci5tZXNzYWdlPWUscn1yZXR1cm4gbyh0LGUpLHR9KEVycm9yKTtlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj10LmNoYW5uZWxHcm91cCxpPWUuY29uZmlnO3JldHVybiByP24mJjAhPT1uLmxlbmd0aD9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbHNcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxzO3JldHVybnthZGQ6KHZvaWQgMD09PW4/W106bikuam9pbihcIixcIil9fWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxOCkscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5SZW1vdmVDaGFubmVsc0Zyb21Hcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXQuY2hhbm5lbEdyb3VwLGk9ZS5jb25maWc7cmV0dXJuIHI/biYmMCE9PW4ubGVuZ3RoP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbHM7cmV0dXJue3JlbW92ZToodm9pZCAwPT09bj9bXTpuKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE4KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlJlbW92ZUdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cCxyPWUuY29uZmlnO3JldHVybiBuP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKStcIi9yZW1vdmVcIn1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybnt9fWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxOCkscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSl7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cFwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KCl7cmV0dXJue319ZnVuY3Rpb24gYyhlLHQpe3JldHVybntncm91cHM6dC5wYXlsb2FkLmdyb3Vwc319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXAscj1lLmNvbmZpZztyZXR1cm4gbj9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1mdW5jdGlvbiBsKGUsdCl7cmV0dXJue2NoYW5uZWxzOnQucGF5bG9hZC5jaGFubmVsc319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTgpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9dC5jaGFubmVscyxzPWUuY29uZmlnO3JldHVybiBuP3I/aSYmMCE9PWkubGVuZ3RoP3Muc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQucHVzaEdhdGV3YXkscj10LmNoYW5uZWxzO3JldHVybnt0eXBlOm4sYWRkOih2b2lkIDA9PT1yP1tdOnIpLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9dC5jaGFubmVscyxzPWUuY29uZmlnO3JldHVybiBuP3I/aSYmMCE9PWkubGVuZ3RoP3Muc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQucHVzaEdhdGV3YXkscj10LmNoYW5uZWxzO3JldHVybnt0eXBlOm4scmVtb3ZlOih2b2lkIDA9PT1yP1tdOnIpLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9ZS5jb25maWc7cmV0dXJuIG4/cj9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgR1cgVHlwZSAocHVzaEdhdGV3YXk6IGdjbSBvciBhcG5zKVwiOlwiTWlzc2luZyBEZXZpY2UgSUQgKGRldmljZSlcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5kZXZpY2U7cmV0dXJuXCIvdjEvcHVzaC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9kZXZpY2VzL1wiK259ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSx0KXtyZXR1cm57dHlwZTp0LnB1c2hHYXRld2F5fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJue2NoYW5uZWxzOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT1lLmNvbmZpZztyZXR1cm4gbj9yP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbitcIi9yZW1vdmVcIn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3JldHVybnt0eXBlOnQucHVzaEdhdGV3YXl9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5VbnN1YnNjcmliZU9wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpK1wiL2xlYXZlXCJ9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT17fTtyZXR1cm4gci5sZW5ndGg+MCYmKGlbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLGl9ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE4KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTldoZXJlTm93T3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQudXVpZCxpPXZvaWQgMD09PXI/bi5VVUlEOnI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi91dWlkL1wiK2l9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoKXtyZXR1cm57fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJuIHQucGF5bG9hZD97Y2hhbm5lbHM6dC5wYXlsb2FkLmNoYW5uZWxzfTp7Y2hhbm5lbHM6W119fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkhlYXJ0YmVhdE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpK1wiL2hlYXJ0YmVhdFwifWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9dC5zdGF0ZSxzPXZvaWQgMD09PWk/e306aSxvPWUuY29uZmlnLGE9e307cmV0dXJuIHIubGVuZ3RoPjAmJihhW1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSxhLnN0YXRlPUpTT04uc3RyaW5naWZ5KHMpLGEuaGVhcnRiZWF0PW8uZ2V0UHJlc2VuY2VUaW1lb3V0KCksYX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTgpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOR2V0U3RhdGVPcGVyYXRpb259ZnVuY3Rpb24gcyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC51dWlkLGk9dm9pZCAwPT09cj9uLlVVSUQ6cixzPXQuY2hhbm5lbHMsbz12b2lkIDA9PT1zP1tdOnMsYT1vLmxlbmd0aD4wP28uam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcoYSkrXCIvdXVpZC9cIitpfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9e307cmV0dXJuIHIubGVuZ3RoPjAmJihpW1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSxpfWZ1bmN0aW9uIGwoZSx0LG4pe3ZhciByPW4uY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1uLmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1zP1tdOnMsYT17fTtyZXR1cm4gMT09PWkubGVuZ3RoJiYwPT09by5sZW5ndGg/YVtpWzBdXT10LnBheWxvYWQ6YT10LnBheWxvYWQse2NoYW5uZWxzOmF9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE4KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlNldFN0YXRlT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuc3RhdGUsaT10LmNoYW5uZWxzLHM9dm9pZCAwPT09aT9bXTppLG89dC5jaGFubmVsR3JvdXBzLGE9dm9pZCAwPT09bz9bXTpvO3JldHVybiByP24uc3Vic2NyaWJlS2V5PzA9PT1zLmxlbmd0aCYmMD09PWEubGVuZ3RoP1wiUGxlYXNlIHByb3ZpZGUgYSBsaXN0IG9mIGNoYW5uZWxzIGFuZC9vciBjaGFubmVsLWdyb3Vwc1wiOnZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBTdGF0ZVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcocykrXCIvdXVpZC9cIituLlVVSUQrXCIvZGF0YVwifWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5zdGF0ZSxyPXQuY2hhbm5lbEdyb3VwcyxpPXZvaWQgMD09PXI/W106cixzPXt9O3JldHVybiBzLnN0YXRlPUpTT04uc3RyaW5naWZ5KG4pLGkubGVuZ3RoPjAmJihzW1wiY2hhbm5lbC1ncm91cFwiXT1pLmpvaW4oXCIsXCIpKSxzfWZ1bmN0aW9uIGwoZSx0KXtyZXR1cm57c3RhdGU6dC5wYXlsb2FkfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxOCkscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5IZXJlTm93T3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz10LmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1zP1tdOnMsYT1cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5O2lmKGkubGVuZ3RoPjB8fG8ubGVuZ3RoPjApe3ZhciB1PWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjthKz1cIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcodSl9cmV0dXJuIGF9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT10LmluY2x1ZGVVVUlEcyxzPXZvaWQgMD09PWl8fGksbz10LmluY2x1ZGVTdGF0ZSxhPXZvaWQgMCE9PW8mJm8sdT17fTtyZXR1cm4gc3x8KHUuZGlzYWJsZV91dWlkcz0xKSxhJiYodS5zdGF0ZT0xKSxyLmxlbmd0aD4wJiYodVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksdX1mdW5jdGlvbiBsKGUsdCxuKXt2YXIgcj1uLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9bi5jaGFubmVsR3JvdXBzLG89dm9pZCAwPT09cz9bXTpzLGE9bi5pbmNsdWRlVVVJRHMsdT12b2lkIDA9PT1hfHxhLGM9bi5pbmNsdWRlU3RhdGUsbD12b2lkIDAhPT1jJiZjO3JldHVybiBpLmxlbmd0aD4xfHxvLmxlbmd0aD4wfHwwPT09by5sZW5ndGgmJjA9PT1pLmxlbmd0aD9mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiBlLnRvdGFsQ2hhbm5lbHM9dC5wYXlsb2FkLnRvdGFsX2NoYW5uZWxzLGUudG90YWxPY2N1cGFuY3k9dC5wYXlsb2FkLnRvdGFsX29jY3VwYW5jeSxlLmNoYW5uZWxzPXt9LE9iamVjdC5rZXlzKHQucGF5bG9hZC5jaGFubmVscykuZm9yRWFjaChmdW5jdGlvbihuKXt2YXIgcj10LnBheWxvYWQuY2hhbm5lbHNbbl0saT1bXTtyZXR1cm4gZS5jaGFubmVsc1tuXT17b2NjdXBhbnRzOmksbmFtZTpuLG9jY3VwYW5jeTpyLm9jY3VwYW5jeX0sdSYmci51dWlkcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2w/aS5wdXNoKHtzdGF0ZTplLnN0YXRlLHV1aWQ6ZS51dWlkfSk6aS5wdXNoKHtzdGF0ZTpudWxsLHV1aWQ6ZX0pfSksZX0pLGV9KCk6ZnVuY3Rpb24oKXt2YXIgZT17fSxuPVtdO3JldHVybiBlLnRvdGFsQ2hhbm5lbHM9MSxlLnRvdGFsT2NjdXBhbmN5PXQub2NjdXBhbmN5LGUuY2hhbm5lbHM9e30sZS5jaGFubmVsc1tpWzBdXT17b2NjdXBhbnRzOm4sbmFtZTppWzBdLG9jY3VwYW5jeTp0Lm9jY3VwYW5jeX0sdSYmdC51dWlkcyYmdC51dWlkcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2w/bi5wdXNoKHtzdGF0ZTplLnN0YXRlLHV1aWQ6ZS51dWlkfSk6bi5wdXNoKHtzdGF0ZTpudWxsLHV1aWQ6ZX0pfSksZX0oKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxOCkscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5BY2Nlc3NNYW5hZ2VyQXVkaXR9ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm5cIi92Mi9hdXRoL2F1ZGl0L3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5fWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5jaGFubmVsLHI9dC5jaGFubmVsR3JvdXAsaT10LmF1dGhLZXlzLHM9dm9pZCAwPT09aT9bXTppLG89e307cmV0dXJuIG4mJihvLmNoYW5uZWw9biksciYmKG9bXCJjaGFubmVsLWdyb3VwXCJdPXIpLHMubGVuZ3RoPjAmJihvLmF1dGg9cy5qb2luKFwiLFwiKSksb31mdW5jdGlvbiBjKGUsdCl7cmV0dXJuIHQucGF5bG9hZH1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5BY2Nlc3NNYW5hZ2VyR3JhbnR9ZnVuY3Rpb24gaShlKXt2YXIgdD1lLmNvbmZpZztyZXR1cm4gdC5zdWJzY3JpYmVLZXk/dC5wdWJsaXNoS2V5P3Quc2VjcmV0S2V5P3ZvaWQgMDpcIk1pc3NpbmcgU2VjcmV0IEtleVwiOlwiTWlzc2luZyBQdWJsaXNoIEtleVwiOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm5cIi92Mi9hdXRoL2dyYW50L3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5fWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXZvaWQgMD09PW4/W106bixpPXQuY2hhbm5lbEdyb3VwcyxzPXZvaWQgMD09PWk/W106aSxvPXQudHRsLGE9dC5yZWFkLHU9dm9pZCAwIT09YSYmYSxjPXQud3JpdGUsbD12b2lkIDAhPT1jJiZjLGg9dC5tYW5hZ2UsZj12b2lkIDAhPT1oJiZoLGQ9dC5hdXRoS2V5cyxwPXZvaWQgMD09PWQ/W106ZCxnPXt9O3JldHVybiBnLnI9dT9cIjFcIjpcIjBcIixnLnc9bD9cIjFcIjpcIjBcIixnLm09Zj9cIjFcIjpcIjBcIixyLmxlbmd0aD4wJiYoZy5jaGFubmVsPXIuam9pbihcIixcIikpLHMubGVuZ3RoPjAmJihnW1wiY2hhbm5lbC1ncm91cFwiXT1zLmpvaW4oXCIsXCIpKSxwLmxlbmd0aD4wJiYoZy5hdXRoPXAuam9pbihcIixcIikpLChvfHwwPT09bykmJihnLnR0bD1vKSxnfWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe3ZhciBuPWUuY3J5cHRvLHI9ZS5jb25maWcsaT1KU09OLnN0cmluZ2lmeSh0KTtyZXR1cm4gci5jaXBoZXJLZXkmJihpPW4uZW5jcnlwdChpKSxpPUpTT04uc3RyaW5naWZ5KGkpKSxpfWZ1bmN0aW9uIHMoKXtyZXR1cm4gdi5kZWZhdWx0LlBOUHVibGlzaE9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10Lm1lc3NhZ2U7cmV0dXJuIHQuY2hhbm5lbD9yP24uc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBNZXNzYWdlXCI6XCJNaXNzaW5nIENoYW5uZWxcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5zZW5kQnlQb3N0O3JldHVybiB2b2lkIDAhPT1uJiZufWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbCxzPXQubWVzc2FnZSxvPWkoZSxzKTtyZXR1cm5cIi9wdWJsaXNoL1wiK24ucHVibGlzaEtleStcIi9cIituLnN1YnNjcmliZUtleStcIi8wL1wiK18uZGVmYXVsdC5lbmNvZGVTdHJpbmcocikrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG8pfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbDtyZXR1cm5cIi9wdWJsaXNoL1wiK24ucHVibGlzaEtleStcIi9cIituLnN1YnNjcmliZUtleStcIi8wL1wiK18uZGVmYXVsdC5lbmNvZGVTdHJpbmcocikrXCIvMFwifVxuZnVuY3Rpb24gbChlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gaCgpe3JldHVybiEwfWZ1bmN0aW9uIGYoZSx0KXtyZXR1cm4gaShlLHQubWVzc2FnZSl9ZnVuY3Rpb24gZChlLHQpe3ZhciBuPXQubWV0YSxyPXQucmVwbGljYXRlLGk9dm9pZCAwPT09cnx8cixzPXQuc3RvcmVJbkhpc3Rvcnksbz10LnR0bCxhPXt9O3JldHVybiBudWxsIT1zJiYoYS5zdG9yZT1zP1wiMVwiOlwiMFwiKSxvJiYoYS50dGw9byksITE9PT1pJiYoYS5ub3JlcD1cInRydWVcIiksbiYmXCJvYmplY3RcIj09PSh2b2lkIDA9PT1uP1widW5kZWZpbmVkXCI6ZyhuKSkmJihhLm1ldGE9SlNPTi5zdHJpbmdpZnkobikpLGF9ZnVuY3Rpb24gcChlLHQpe3JldHVybnt0aW1ldG9rZW46dFsyXX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGc9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKGUpe3JldHVybiB0eXBlb2YgZX06ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmZS5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmZSE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgZX07dC5nZXRPcGVyYXRpb249cyx0LnZhbGlkYXRlUGFyYW1zPW8sdC51c2VQb3N0PWEsdC5nZXRVUkw9dSx0LnBvc3RVUkw9Yyx0LmdldFJlcXVlc3RUaW1lb3V0PWwsdC5pc0F1dGhTdXBwb3J0ZWQ9aCx0LnBvc3RQYXlsb2FkPWYsdC5wcmVwYXJlUGFyYW1zPWQsdC5oYW5kbGVSZXNwb25zZT1wO3ZhciB5PShuKDgpLG4oMTYpKSx2PXIoeSksYj1uKDE4KSxfPXIoYil9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7dmFyIG49ZS5jb25maWcscj1lLmNyeXB0bztpZighbi5jaXBoZXJLZXkpcmV0dXJuIHQ7dHJ5e3JldHVybiByLmRlY3J5cHQodCl9Y2F0Y2goZSl7cmV0dXJuIHR9fWZ1bmN0aW9uIHMoKXtyZXR1cm4gZC5kZWZhdWx0LlBOSGlzdG9yeU9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVsLHI9ZS5jb25maWc7cmV0dXJuIG4/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIGNoYW5uZWxcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5jaGFubmVsO3JldHVyblwiL3YyL2hpc3Rvcnkvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitnLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoKXtyZXR1cm4hMH1mdW5jdGlvbiBsKGUsdCl7dmFyIG49dC5zdGFydCxyPXQuZW5kLGk9dC5yZXZlcnNlLHM9dC5jb3VudCxvPXZvaWQgMD09PXM/MTAwOnMsYT10LnN0cmluZ2lmaWVkVGltZVRva2VuLHU9dm9pZCAwIT09YSYmYSxjPXtpbmNsdWRlX3Rva2VuOlwidHJ1ZVwifTtyZXR1cm4gYy5jb3VudD1vLG4mJihjLnN0YXJ0PW4pLHImJihjLmVuZD1yKSx1JiYoYy5zdHJpbmdfbWVzc2FnZV90b2tlbj1cInRydWVcIiksbnVsbCE9aSYmKGMucmV2ZXJzZT1pLnRvU3RyaW5nKCkpLGN9ZnVuY3Rpb24gaChlLHQpe3ZhciBuPXttZXNzYWdlczpbXSxzdGFydFRpbWVUb2tlbjp0WzFdLGVuZFRpbWVUb2tlbjp0WzJdfTtyZXR1cm4gdFswXS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciByPXt0aW1ldG9rZW46dC50aW1ldG9rZW4sZW50cnk6aShlLHQubWVzc2FnZSl9O24ubWVzc2FnZXMucHVzaChyKX0pLG59T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cyx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5pc0F1dGhTdXBwb3J0ZWQ9Yyx0LnByZXBhcmVQYXJhbXM9bCx0LmhhbmRsZVJlc3BvbnNlPWg7dmFyIGY9KG4oOCksbigxNikpLGQ9cihmKSxwPW4oMTgpLGc9cihwKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPWUuY3J5cHRvO2lmKCFuLmNpcGhlcktleSlyZXR1cm4gdDt0cnl7cmV0dXJuIHIuZGVjcnlwdCh0KX1jYXRjaChlKXtyZXR1cm4gdH19ZnVuY3Rpb24gcygpe3JldHVybiBkLmRlZmF1bHQuUE5GZXRjaE1lc3NhZ2VzT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9ZS5jb25maWc7cmV0dXJuIG4mJjAhPT1uLmxlbmd0aD9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgY2hhbm5lbHNcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXZvaWQgMD09PW4/W106bixpPWUuY29uZmlnLHM9ci5sZW5ndGg+MD9yLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YzL2hpc3Rvcnkvc3ViLWtleS9cIitpLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK2cuZGVmYXVsdC5lbmNvZGVTdHJpbmcocyl9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybiEwfWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj10LnN0YXJ0LHI9dC5lbmQsaT10LmNvdW50LHM9e307cmV0dXJuIGkmJihzLm1heD1pKSxuJiYocy5zdGFydD1uKSxyJiYocy5lbmQ9ciksc31mdW5jdGlvbiBoKGUsdCl7dmFyIG49e2NoYW5uZWxzOnt9fTtyZXR1cm4gT2JqZWN0LmtleXModC5jaGFubmVsc3x8e30pLmZvckVhY2goZnVuY3Rpb24ocil7bi5jaGFubmVsc1tyXT1bXSwodC5jaGFubmVsc1tyXXx8W10pLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIHM9e307cy5jaGFubmVsPXIscy5zdWJzY3JpcHRpb249bnVsbCxzLnRpbWV0b2tlbj10LnRpbWV0b2tlbixzLm1lc3NhZ2U9aShlLHQubWVzc2FnZSksbi5jaGFubmVsc1tyXS5wdXNoKHMpfSl9KSxufU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXMsdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQuaXNBdXRoU3VwcG9ydGVkPWMsdC5wcmVwYXJlUGFyYW1zPWwsdC5oYW5kbGVSZXNwb25zZT1oO3ZhciBmPShuKDgpLG4oMTYpKSxkPXIoZikscD1uKDE4KSxnPXIocCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlN1YnNjcmliZU9wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3N1YnNjcmliZS9cIituLnN1YnNjcmliZUtleStcIi9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpK1wiLzBcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRTdWJzY3JpYmVUaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbEdyb3VwcyxpPXZvaWQgMD09PXI/W106cixzPXQudGltZXRva2VuLG89dC5maWx0ZXJFeHByZXNzaW9uLGE9dC5yZWdpb24sdT17aGVhcnRiZWF0Om4uZ2V0UHJlc2VuY2VUaW1lb3V0KCl9O3JldHVybiBpLmxlbmd0aD4wJiYodVtcImNoYW5uZWwtZ3JvdXBcIl09aS5qb2luKFwiLFwiKSksbyYmby5sZW5ndGg+MCYmKHVbXCJmaWx0ZXItZXhwclwiXT1vKSxzJiYodS50dD1zKSxhJiYodS50cj1hKSx1fWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj1bXTt0Lm0uZm9yRWFjaChmdW5jdGlvbihlKXt2YXIgdD17cHVibGlzaFRpbWV0b2tlbjplLnAudCxyZWdpb246ZS5wLnJ9LHI9e3NoYXJkOnBhcnNlSW50KGUuYSwxMCksc3Vic2NyaXB0aW9uTWF0Y2g6ZS5iLGNoYW5uZWw6ZS5jLHBheWxvYWQ6ZS5kLGZsYWdzOmUuZixpc3N1aW5nQ2xpZW50SWQ6ZS5pLHN1YnNjcmliZUtleTplLmssb3JpZ2luYXRpb25UaW1ldG9rZW46ZS5vLHVzZXJNZXRhZGF0YTplLnUscHVibGlzaE1ldGFEYXRhOnR9O24ucHVzaChyKX0pO3ZhciByPXt0aW1ldG9rZW46dC50LnQscmVnaW9uOnQudC5yfTtyZXR1cm57bWVzc2FnZXM6bixtZXRhZGF0YTpyfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxOCkscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxvPW4oNyksYT0ocihvKSxuKDEzKSksdT1yKGEpLGM9KG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXRoaXM7aSh0aGlzLGUpLHRoaXMuX21vZHVsZXM9e30sT2JqZWN0LmtleXModCkuZm9yRWFjaChmdW5jdGlvbihlKXtuLl9tb2R1bGVzW2VdPXRbZV0uYmluZChuKX0pfXJldHVybiBzKGUsW3trZXk6XCJpbml0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fY29uZmlnPWUsdGhpcy5fbWF4U3ViRG9tYWluPTIwLHRoaXMuX2N1cnJlbnRTdWJEb21haW49TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRoaXMuX21heFN1YkRvbWFpbiksdGhpcy5fcHJvdmlkZWRGUUROPSh0aGlzLl9jb25maWcuc2VjdXJlP1wiaHR0cHM6Ly9cIjpcImh0dHA6Ly9cIikrdGhpcy5fY29uZmlnLm9yaWdpbix0aGlzLl9jb3JlUGFyYW1zPXt9LHRoaXMuc2hpZnRTdGFuZGFyZE9yaWdpbigpfX0se2tleTpcIm5leHRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe2lmKC0xPT09dGhpcy5fcHJvdmlkZWRGUUROLmluZGV4T2YoXCJwdWJzdWIuXCIpKXJldHVybiB0aGlzLl9wcm92aWRlZEZRRE47dmFyIGU9dm9pZCAwO3JldHVybiB0aGlzLl9jdXJyZW50U3ViRG9tYWluPXRoaXMuX2N1cnJlbnRTdWJEb21haW4rMSx0aGlzLl9jdXJyZW50U3ViRG9tYWluPj10aGlzLl9tYXhTdWJEb21haW4mJih0aGlzLl9jdXJyZW50U3ViRG9tYWluPTEpLGU9dGhpcy5fY3VycmVudFN1YkRvbWFpbi50b1N0cmluZygpLHRoaXMuX3Byb3ZpZGVkRlFETi5yZXBsYWNlKFwicHVic3ViXCIsXCJwc1wiK2UpfX0se2tleTpcInNoaWZ0U3RhbmRhcmRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF07cmV0dXJuIHRoaXMuX3N0YW5kYXJkT3JpZ2luPXRoaXMubmV4dE9yaWdpbihlKSx0aGlzLl9zdGFuZGFyZE9yaWdpbn19LHtrZXk6XCJnZXRTdGFuZGFyZE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N0YW5kYXJkT3JpZ2lufX0se2tleTpcIlBPU1RcIix2YWx1ZTpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gdGhpcy5fbW9kdWxlcy5wb3N0KGUsdCxuLHIpfX0se2tleTpcIkdFVFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fbW9kdWxlcy5nZXQoZSx0LG4pfX0se2tleTpcIl9kZXRlY3RFcnJvckNhdGVnb3J5XCIsdmFsdWU6ZnVuY3Rpb24oZSl7aWYoXCJFTk9URk9VTkRcIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKFwiRUNPTk5SRUZVU0VEXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVDT05OUkVTRVRcIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKFwiRUFJX0FHQUlOXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZigwPT09ZS5zdGF0dXN8fGUuaGFzT3duUHJvcGVydHkoXCJzdGF0dXNcIikmJnZvaWQgMD09PWUuc3RhdHVzKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoZS50aW1lb3V0KXJldHVybiB1LmRlZmF1bHQuUE5UaW1lb3V0Q2F0ZWdvcnk7aWYoZS5yZXNwb25zZSl7aWYoZS5yZXNwb25zZS5iYWRSZXF1ZXN0KXJldHVybiB1LmRlZmF1bHQuUE5CYWRSZXF1ZXN0Q2F0ZWdvcnk7aWYoZS5yZXNwb25zZS5mb3JiaWRkZW4pcmV0dXJuIHUuZGVmYXVsdC5QTkFjY2Vzc0RlbmllZENhdGVnb3J5fXJldHVybiB1LmRlZmF1bHQuUE5Vbmtub3duQ2F0ZWdvcnl9fV0pLGV9KCkpO3QuZGVmYXVsdD1jLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXtnZXQ6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShlKX1jYXRjaChlKXtyZXR1cm4gbnVsbH19LHNldDpmdW5jdGlvbihlLHQpe3RyeXtyZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oZSx0KX1jYXRjaChlKXtyZXR1cm4gbnVsbH19fSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXt2YXIgdD0obmV3IERhdGUpLmdldFRpbWUoKSxuPShuZXcgRGF0ZSkudG9JU09TdHJpbmcoKSxyPWZ1bmN0aW9uKCl7cmV0dXJuIGNvbnNvbGUmJmNvbnNvbGUubG9nP2NvbnNvbGU6d2luZG93JiZ3aW5kb3cuY29uc29sZSYmd2luZG93LmNvbnNvbGUubG9nP3dpbmRvdy5jb25zb2xlOmNvbnNvbGV9KCk7ci5sb2coXCI8PDw8PFwiKSxyLmxvZyhcIltcIituK1wiXVwiLFwiXFxuXCIsZS51cmwsXCJcXG5cIixlLnFzKSxyLmxvZyhcIi0tLS0tXCIpLGUub24oXCJyZXNwb25zZVwiLGZ1bmN0aW9uKG4pe3ZhciBpPShuZXcgRGF0ZSkuZ2V0VGltZSgpLHM9aS10LG89KG5ldyBEYXRlKS50b0lTT1N0cmluZygpO3IubG9nKFwiPj4+Pj4+XCIpLHIubG9nKFwiW1wiK28rXCIgLyBcIitzK1wiXVwiLFwiXFxuXCIsZS51cmwsXCJcXG5cIixlLnFzLFwiXFxuXCIsbi50ZXh0KSxyLmxvZyhcIi0tLS0tXCIpfSl9ZnVuY3Rpb24gaShlLHQsbil7dmFyIGk9dGhpcztyZXR1cm4gdGhpcy5fY29uZmlnLmxvZ1ZlcmJvc2l0eSYmKGU9ZS51c2UocikpLHRoaXMuX2NvbmZpZy5wcm94eSYmdGhpcy5fbW9kdWxlcy5wcm94eSYmKGU9dGhpcy5fbW9kdWxlcy5wcm94eS5jYWxsKHRoaXMsZSkpLHRoaXMuX2NvbmZpZy5rZWVwQWxpdmUmJnRoaXMuX21vZHVsZXMua2VlcEFsaXZlJiYoZT10aGlzLl9tb2R1bGVzLmtlZXBBbGl2ZShlKSksZS50aW1lb3V0KHQudGltZW91dCkuZW5kKGZ1bmN0aW9uKGUscil7dmFyIHM9e307aWYocy5lcnJvcj1udWxsIT09ZSxzLm9wZXJhdGlvbj10Lm9wZXJhdGlvbixyJiZyLnN0YXR1cyYmKHMuc3RhdHVzQ29kZT1yLnN0YXR1cyksZSlyZXR1cm4gcy5lcnJvckRhdGE9ZSxzLmNhdGVnb3J5PWkuX2RldGVjdEVycm9yQ2F0ZWdvcnkoZSksbihzLG51bGwpO3ZhciBvPUpTT04ucGFyc2Uoci50ZXh0KTtyZXR1cm4gby5lcnJvciYmMT09PW8uZXJyb3ImJm8uc3RhdHVzJiZvLm1lc3NhZ2UmJm8uc2VydmljZT8ocy5lcnJvckRhdGE9byxzLnN0YXR1c0NvZGU9by5zdGF0dXMscy5lcnJvcj0hMCxzLmNhdGVnb3J5PWkuX2RldGVjdEVycm9yQ2F0ZWdvcnkocyksbihzLG51bGwpKTpuKHMsbyl9KX1mdW5jdGlvbiBzKGUsdCxuKXt2YXIgcj11LmRlZmF1bHQuZ2V0KHRoaXMuZ2V0U3RhbmRhcmRPcmlnaW4oKSt0LnVybCkucXVlcnkoZSk7cmV0dXJuIGkuY2FsbCh0aGlzLHIsdCxuKX1mdW5jdGlvbiBvKGUsdCxuLHIpe3ZhciBzPXUuZGVmYXVsdC5wb3N0KHRoaXMuZ2V0U3RhbmRhcmRPcmlnaW4oKStuLnVybCkucXVlcnkoZSkuc2VuZCh0KTtyZXR1cm4gaS5jYWxsKHRoaXMscyxuLHIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0PXMsdC5wb3N0PW87dmFyIGE9big0NCksdT1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGEpO24oOCl9LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKCl7fWZ1bmN0aW9uIGkoZSl7aWYoIXYoZSkpcmV0dXJuIGU7dmFyIHQ9W107Zm9yKHZhciBuIGluIGUpcyh0LG4sZVtuXSk7cmV0dXJuIHQuam9pbihcIiZcIil9ZnVuY3Rpb24gcyhlLHQsbil7aWYobnVsbCE9bilpZihBcnJheS5pc0FycmF5KG4pKW4uZm9yRWFjaChmdW5jdGlvbihuKXtzKGUsdCxuKX0pO2Vsc2UgaWYodihuKSlmb3IodmFyIHIgaW4gbilzKGUsdCtcIltcIityK1wiXVwiLG5bcl0pO2Vsc2UgZS5wdXNoKGVuY29kZVVSSUNvbXBvbmVudCh0KStcIj1cIitlbmNvZGVVUklDb21wb25lbnQobikpO2Vsc2UgbnVsbD09PW4mJmUucHVzaChlbmNvZGVVUklDb21wb25lbnQodCkpfWZ1bmN0aW9uIG8oZSl7Zm9yKHZhciB0LG4scj17fSxpPWUuc3BsaXQoXCImXCIpLHM9MCxvPWkubGVuZ3RoO3M8bzsrK3MpdD1pW3NdLG49dC5pbmRleE9mKFwiPVwiKSwtMT09bj9yW2RlY29kZVVSSUNvbXBvbmVudCh0KV09XCJcIjpyW2RlY29kZVVSSUNvbXBvbmVudCh0LnNsaWNlKDAsbikpXT1kZWNvZGVVUklDb21wb25lbnQodC5zbGljZShuKzEpKTtyZXR1cm4gcn1mdW5jdGlvbiBhKGUpe3ZhciB0LG4scixpLHM9ZS5zcGxpdCgvXFxyP1xcbi8pLG89e307cy5wb3AoKTtmb3IodmFyIGE9MCx1PXMubGVuZ3RoO2E8dTsrK2Epbj1zW2FdLHQ9bi5pbmRleE9mKFwiOlwiKSxyPW4uc2xpY2UoMCx0KS50b0xvd2VyQ2FzZSgpLGk9XyhuLnNsaWNlKHQrMSkpLG9bcl09aTtyZXR1cm4gb31mdW5jdGlvbiB1KGUpe3JldHVybi9bXFwvK11qc29uXFxiLy50ZXN0KGUpfWZ1bmN0aW9uIGMoZSl7cmV0dXJuIGUuc3BsaXQoLyAqOyAqLykuc2hpZnQoKX1mdW5jdGlvbiBsKGUpe3JldHVybiBlLnNwbGl0KC8gKjsgKi8pLnJlZHVjZShmdW5jdGlvbihlLHQpe3ZhciBuPXQuc3BsaXQoLyAqPSAqLykscj1uLnNoaWZ0KCksaT1uLnNoaWZ0KCk7cmV0dXJuIHImJmkmJihlW3JdPWkpLGV9LHt9KX1mdW5jdGlvbiBoKGUsdCl7dD10fHx7fSx0aGlzLnJlcT1lLHRoaXMueGhyPXRoaXMucmVxLnhocix0aGlzLnRleHQ9XCJIRUFEXCIhPXRoaXMucmVxLm1ldGhvZCYmKFwiXCI9PT10aGlzLnhoci5yZXNwb25zZVR5cGV8fFwidGV4dFwiPT09dGhpcy54aHIucmVzcG9uc2VUeXBlKXx8dm9pZCAwPT09dGhpcy54aHIucmVzcG9uc2VUeXBlP3RoaXMueGhyLnJlc3BvbnNlVGV4dDpudWxsLHRoaXMuc3RhdHVzVGV4dD10aGlzLnJlcS54aHIuc3RhdHVzVGV4dCx0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyksdGhpcy5oZWFkZXI9dGhpcy5oZWFkZXJzPWEodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpLHRoaXMuaGVhZGVyW1wiY29udGVudC10eXBlXCJdPXRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiY29udGVudC10eXBlXCIpLHRoaXMuX3NldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpLHRoaXMuYm9keT1cIkhFQURcIiE9dGhpcy5yZXEubWV0aG9kP3RoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQ/dGhpcy50ZXh0OnRoaXMueGhyLnJlc3BvbnNlKTpudWxsfWZ1bmN0aW9uIGYoZSx0KXt2YXIgbj10aGlzO3RoaXMuX3F1ZXJ5PXRoaXMuX3F1ZXJ5fHxbXSx0aGlzLm1ldGhvZD1lLHRoaXMudXJsPXQsdGhpcy5oZWFkZXI9e30sdGhpcy5faGVhZGVyPXt9LHRoaXMub24oXCJlbmRcIixmdW5jdGlvbigpe3ZhciBlPW51bGwsdD1udWxsO3RyeXt0PW5ldyBoKG4pfWNhdGNoKHQpe3JldHVybiBlPW5ldyBFcnJvcihcIlBhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlXCIpLGUucGFyc2U9ITAsZS5vcmlnaW5hbD10LGUucmF3UmVzcG9uc2U9bi54aHImJm4ueGhyLnJlc3BvbnNlVGV4dD9uLnhoci5yZXNwb25zZVRleHQ6bnVsbCxlLnN0YXR1c0NvZGU9bi54aHImJm4ueGhyLnN0YXR1cz9uLnhoci5zdGF0dXM6bnVsbCxuLmNhbGxiYWNrKGUpfW4uZW1pdChcInJlc3BvbnNlXCIsdCk7dmFyIHI7dHJ5eyh0LnN0YXR1czwyMDB8fHQuc3RhdHVzPj0zMDApJiYocj1uZXcgRXJyb3IodC5zdGF0dXNUZXh0fHxcIlVuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlXCIpLHIub3JpZ2luYWw9ZSxyLnJlc3BvbnNlPXQsci5zdGF0dXM9dC5zdGF0dXMpfWNhdGNoKGUpe3I9ZX1yP24uY2FsbGJhY2socix0KTpuLmNhbGxiYWNrKG51bGwsdCl9KX1mdW5jdGlvbiBkKGUsdCl7dmFyIG49YihcIkRFTEVURVwiLGUpO3JldHVybiB0JiZuLmVuZCh0KSxufXZhciBwO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/cD13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/cD1zZWxmOihjb25zb2xlLndhcm4oXCJVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpLHA9dGhpcyk7dmFyIGc9big0NSkseT1uKDQ2KSx2PW4oNDcpLGI9ZS5leHBvcnRzPW4oNDgpLmJpbmQobnVsbCxmKTtiLmdldFhIUj1mdW5jdGlvbigpe2lmKCEoIXAuWE1MSHR0cFJlcXVlc3R8fHAubG9jYXRpb24mJlwiZmlsZTpcIj09cC5sb2NhdGlvbi5wcm90b2NvbCYmcC5BY3RpdmVYT2JqZWN0KSlyZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O3RyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjYuMFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjMuMFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQXCIpfWNhdGNoKGUpe310aHJvdyBFcnJvcihcIkJyb3dzZXItb25seSB2ZXJpc29uIG9mIHN1cGVyYWdlbnQgY291bGQgbm90IGZpbmQgWEhSXCIpfTt2YXIgXz1cIlwiLnRyaW0/ZnVuY3Rpb24oZSl7cmV0dXJuIGUudHJpbSgpfTpmdW5jdGlvbihlKXtyZXR1cm4gZS5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csXCJcIil9O2Iuc2VyaWFsaXplT2JqZWN0PWksYi5wYXJzZVN0cmluZz1vLGIudHlwZXM9e2h0bWw6XCJ0ZXh0L2h0bWxcIixqc29uOlwiYXBwbGljYXRpb24vanNvblwiLHhtbDpcImFwcGxpY2F0aW9uL3htbFwiLHVybGVuY29kZWQ6XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixmb3JtOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXCJmb3JtLWRhdGFcIjpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwifSxiLnNlcmlhbGl6ZT17XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjppLFwiYXBwbGljYXRpb24vanNvblwiOkpTT04uc3RyaW5naWZ5fSxiLnBhcnNlPXtcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOm8sXCJhcHBsaWNhdGlvbi9qc29uXCI6SlNPTi5wYXJzZX0saC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmhlYWRlcltlLnRvTG93ZXJDYXNlKCldfSxoLnByb3RvdHlwZS5fc2V0SGVhZGVyUHJvcGVydGllcz1mdW5jdGlvbihlKXt2YXIgdD10aGlzLmhlYWRlcltcImNvbnRlbnQtdHlwZVwiXXx8XCJcIjt0aGlzLnR5cGU9Yyh0KTt2YXIgbj1sKHQpO2Zvcih2YXIgciBpbiBuKXRoaXNbcl09bltyXX0saC5wcm90b3R5cGUuX3BhcnNlQm9keT1mdW5jdGlvbihlKXt2YXIgdD1iLnBhcnNlW3RoaXMudHlwZV07cmV0dXJuIXQmJnUodGhpcy50eXBlKSYmKHQ9Yi5wYXJzZVtcImFwcGxpY2F0aW9uL2pzb25cIl0pLHQmJmUmJihlLmxlbmd0aHx8ZSBpbnN0YW5jZW9mIE9iamVjdCk/dChlKTpudWxsfSxoLnByb3RvdHlwZS5fc2V0U3RhdHVzUHJvcGVydGllcz1mdW5jdGlvbihlKXsxMjIzPT09ZSYmKGU9MjA0KTt2YXIgdD1lLzEwMHwwO3RoaXMuc3RhdHVzPXRoaXMuc3RhdHVzQ29kZT1lLHRoaXMuc3RhdHVzVHlwZT10LHRoaXMuaW5mbz0xPT10LHRoaXMub2s9Mj09dCx0aGlzLmNsaWVudEVycm9yPTQ9PXQsdGhpcy5zZXJ2ZXJFcnJvcj01PT10LHRoaXMuZXJyb3I9KDQ9PXR8fDU9PXQpJiZ0aGlzLnRvRXJyb3IoKSx0aGlzLmFjY2VwdGVkPTIwMj09ZSx0aGlzLm5vQ29udGVudD0yMDQ9PWUsdGhpcy5iYWRSZXF1ZXN0PTQwMD09ZSx0aGlzLnVuYXV0aG9yaXplZD00MDE9PWUsdGhpcy5ub3RBY2NlcHRhYmxlPTQwNj09ZSx0aGlzLm5vdEZvdW5kPTQwND09ZSx0aGlzLmZvcmJpZGRlbj00MDM9PWV9LGgucHJvdG90eXBlLnRvRXJyb3I9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnJlcSx0PWUubWV0aG9kLG49ZS51cmwscj1cImNhbm5vdCBcIit0K1wiIFwiK24rXCIgKFwiK3RoaXMuc3RhdHVzK1wiKVwiLGk9bmV3IEVycm9yKHIpO3JldHVybiBpLnN0YXR1cz10aGlzLnN0YXR1cyxpLm1ldGhvZD10LGkudXJsPW4saX0sYi5SZXNwb25zZT1oLGcoZi5wcm90b3R5cGUpO2Zvcih2YXIgbSBpbiB5KWYucHJvdG90eXBlW21dPXlbbV07Zi5wcm90b3R5cGUudHlwZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5zZXQoXCJDb250ZW50LVR5cGVcIixiLnR5cGVzW2VdfHxlKSx0aGlzfSxmLnByb3RvdHlwZS5yZXNwb25zZVR5cGU9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3Jlc3BvbnNlVHlwZT1lLHRoaXN9LGYucHJvdG90eXBlLmFjY2VwdD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5zZXQoXCJBY2NlcHRcIixiLnR5cGVzW2VdfHxlKSx0aGlzfSxmLnByb3RvdHlwZS5hdXRoPWZ1bmN0aW9uKGUsdCxuKXtzd2l0Y2gobnx8KG49e3R5cGU6XCJiYXNpY1wifSksbi50eXBlKXtjYXNlXCJiYXNpY1wiOnZhciByPWJ0b2EoZStcIjpcIit0KTt0aGlzLnNldChcIkF1dGhvcml6YXRpb25cIixcIkJhc2ljIFwiK3IpO2JyZWFrO2Nhc2VcImF1dG9cIjp0aGlzLnVzZXJuYW1lPWUsdGhpcy5wYXNzd29yZD10fXJldHVybiB0aGlzfSxmLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihlKXtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZSYmKGU9aShlKSksZSYmdGhpcy5fcXVlcnkucHVzaChlKSx0aGlzfSxmLnByb3RvdHlwZS5hdHRhY2g9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChlLHQsbnx8dC5uYW1lKSx0aGlzfSxmLnByb3RvdHlwZS5fZ2V0Rm9ybURhdGE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZm9ybURhdGF8fCh0aGlzLl9mb3JtRGF0YT1uZXcgcC5Gb3JtRGF0YSksdGhpcy5fZm9ybURhdGF9LGYucHJvdG90eXBlLmNhbGxiYWNrPWZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy5fY2FsbGJhY2s7dGhpcy5jbGVhclRpbWVvdXQoKSxuKGUsdCl9LGYucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3I9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgRXJyb3IoXCJSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuXCIpO2UuY3Jvc3NEb21haW49ITAsZS5zdGF0dXM9dGhpcy5zdGF0dXMsZS5tZXRob2Q9dGhpcy5tZXRob2QsZS51cmw9dGhpcy51cmwsdGhpcy5jYWxsYmFjayhlKX0sZi5wcm90b3R5cGUuX3RpbWVvdXRFcnJvcj1mdW5jdGlvbigpe3ZhciBlPXRoaXMuX3RpbWVvdXQsdD1uZXcgRXJyb3IoXCJ0aW1lb3V0IG9mIFwiK2UrXCJtcyBleGNlZWRlZFwiKTt0LnRpbWVvdXQ9ZSx0aGlzLmNhbGxiYWNrKHQpfSxmLnByb3RvdHlwZS5fYXBwZW5kUXVlcnlTdHJpbmc9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLl9xdWVyeS5qb2luKFwiJlwiKTtlJiYodGhpcy51cmwrPX50aGlzLnVybC5pbmRleE9mKFwiP1wiKT9cIiZcIitlOlwiP1wiK2UpfSxmLnByb3RvdHlwZS5lbmQ9ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxuPXRoaXMueGhyPWIuZ2V0WEhSKCksaT10aGlzLl90aW1lb3V0LHM9dGhpcy5fZm9ybURhdGF8fHRoaXMuX2RhdGE7dGhpcy5fY2FsbGJhY2s9ZXx8cixuLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2lmKDQ9PW4ucmVhZHlTdGF0ZSl7dmFyIGU7dHJ5e2U9bi5zdGF0dXN9Y2F0Y2godCl7ZT0wfWlmKDA9PWUpe2lmKHQudGltZWRvdXQpcmV0dXJuIHQuX3RpbWVvdXRFcnJvcigpO2lmKHQuX2Fib3J0ZWQpcmV0dXJuO3JldHVybiB0LmNyb3NzRG9tYWluRXJyb3IoKX10LmVtaXQoXCJlbmRcIil9fTt2YXIgbz1mdW5jdGlvbihlLG4pe24udG90YWw+MCYmKG4ucGVyY2VudD1uLmxvYWRlZC9uLnRvdGFsKjEwMCksbi5kaXJlY3Rpb249ZSx0LmVtaXQoXCJwcm9ncmVzc1wiLG4pfTtpZih0aGlzLmhhc0xpc3RlbmVycyhcInByb2dyZXNzXCIpKXRyeXtuLm9ucHJvZ3Jlc3M9by5iaW5kKG51bGwsXCJkb3dubG9hZFwiKSxuLnVwbG9hZCYmKG4udXBsb2FkLm9ucHJvZ3Jlc3M9by5iaW5kKG51bGwsXCJ1cGxvYWRcIikpfWNhdGNoKGUpe31pZihpJiYhdGhpcy5fdGltZXImJih0aGlzLl90aW1lcj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC50aW1lZG91dD0hMCx0LmFib3J0KCl9LGkpKSx0aGlzLl9hcHBlbmRRdWVyeVN0cmluZygpLHRoaXMudXNlcm5hbWUmJnRoaXMucGFzc3dvcmQ/bi5vcGVuKHRoaXMubWV0aG9kLHRoaXMudXJsLCEwLHRoaXMudXNlcm5hbWUsdGhpcy5wYXNzd29yZCk6bi5vcGVuKHRoaXMubWV0aG9kLHRoaXMudXJsLCEwKSx0aGlzLl93aXRoQ3JlZGVudGlhbHMmJihuLndpdGhDcmVkZW50aWFscz0hMCksXCJHRVRcIiE9dGhpcy5tZXRob2QmJlwiSEVBRFwiIT10aGlzLm1ldGhvZCYmXCJzdHJpbmdcIiE9dHlwZW9mIHMmJiF0aGlzLl9pc0hvc3Qocykpe3ZhciBhPXRoaXMuX2hlYWRlcltcImNvbnRlbnQtdHlwZVwiXSxjPXRoaXMuX3NlcmlhbGl6ZXJ8fGIuc2VyaWFsaXplW2E/YS5zcGxpdChcIjtcIilbMF06XCJcIl07IWMmJnUoYSkmJihjPWIuc2VyaWFsaXplW1wiYXBwbGljYXRpb24vanNvblwiXSksYyYmKHM9YyhzKSl9Zm9yKHZhciBsIGluIHRoaXMuaGVhZGVyKW51bGwhPXRoaXMuaGVhZGVyW2xdJiZuLnNldFJlcXVlc3RIZWFkZXIobCx0aGlzLmhlYWRlcltsXSk7cmV0dXJuIHRoaXMuX3Jlc3BvbnNlVHlwZSYmKG4ucmVzcG9uc2VUeXBlPXRoaXMuX3Jlc3BvbnNlVHlwZSksdGhpcy5lbWl0KFwicmVxdWVzdFwiLHRoaXMpLG4uc2VuZCh2b2lkIDAhPT1zP3M6bnVsbCksdGhpc30sYi5SZXF1ZXN0PWYsYi5nZXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJHRVRcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5xdWVyeSh0KSxuJiZyLmVuZChuKSxyfSxiLmhlYWQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJIRUFEXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLm9wdGlvbnM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJPUFRJT05TXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLmRlbD1kLGIuZGVsZXRlPWQsYi5wYXRjaD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBBVENIXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLnBvc3Q9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJQT1NUXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLnB1dD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBVVFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn19LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKGUpe2lmKGUpcmV0dXJuIGkoZSl9ZnVuY3Rpb24gaShlKXtmb3IodmFyIHQgaW4gci5wcm90b3R5cGUpZVt0XT1yLnByb3RvdHlwZVt0XTtyZXR1cm4gZX1lLmV4cG9ydHM9cixyLnByb3RvdHlwZS5vbj1yLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuX2NhbGxiYWNrcz10aGlzLl9jYWxsYmFja3N8fHt9LCh0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV09dGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdfHxbXSkucHVzaCh0KSx0aGlzfSxyLnByb3RvdHlwZS5vbmNlPWZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbigpe3RoaXMub2ZmKGUsbiksdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIG4uZm49dCx0aGlzLm9uKGUsbiksdGhpc30sci5wcm90b3R5cGUub2ZmPXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyPXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycz1yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGUsdCl7aWYodGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sMD09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXt9LHRoaXM7dmFyIG49dGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdO2lmKCFuKXJldHVybiB0aGlzO2lmKDE9PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV0sdGhpcztmb3IodmFyIHIsaT0wO2k8bi5sZW5ndGg7aSsrKWlmKChyPW5baV0pPT09dHx8ci5mbj09PXQpe24uc3BsaWNlKGksMSk7YnJlYWt9cmV0dXJuIHRoaXN9LHIucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24oZSl7dGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e307dmFyIHQ9W10uc2xpY2UuY2FsbChhcmd1bWVudHMsMSksbj10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV07aWYobil7bj1uLnNsaWNlKDApO2Zvcih2YXIgcj0wLGk9bi5sZW5ndGg7cjxpOysrciluW3JdLmFwcGx5KHRoaXMsdCl9cmV0dXJuIHRoaXN9LHIucHJvdG90eXBlLmxpc3RlbmVycz1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sdGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdfHxbXX0sci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzPWZ1bmN0aW9uKGUpe3JldHVybiEhdGhpcy5saXN0ZW5lcnMoZSkubGVuZ3RofX0sZnVuY3Rpb24oZSx0LG4pe3ZhciByPW4oNDcpO3QuY2xlYXJUaW1lb3V0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3RpbWVvdXQ9MCxjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpLHRoaXN9LHQucGFyc2U9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3BhcnNlcj1lLHRoaXN9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9zZXJpYWxpemVyPWUsdGhpc30sdC50aW1lb3V0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl90aW1lb3V0PWUsdGhpc30sdC50aGVuPWZ1bmN0aW9uKGUsdCl7aWYoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKXt2YXIgbj10aGlzO3RoaXMuX2Z1bGxmaWxsZWRQcm9taXNlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGUsdCl7bi5lbmQoZnVuY3Rpb24obixyKXtuP3Qobik6ZShyKX0pfSl9cmV0dXJuIHRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlLnRoZW4oZSx0KX0sdC5jYXRjaD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy50aGVuKHZvaWQgMCxlKX0sdC51c2U9ZnVuY3Rpb24oZSl7cmV0dXJuIGUodGhpcyksdGhpc30sdC5nZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2hlYWRlcltlLnRvTG93ZXJDYXNlKCldfSx0LmdldEhlYWRlcj10LmdldCx0LnNldD1mdW5jdGlvbihlLHQpe2lmKHIoZSkpe2Zvcih2YXIgbiBpbiBlKXRoaXMuc2V0KG4sZVtuXSk7cmV0dXJuIHRoaXN9cmV0dXJuIHRoaXMuX2hlYWRlcltlLnRvTG93ZXJDYXNlKCldPXQsdGhpcy5oZWFkZXJbZV09dCx0aGlzfSx0LnVuc2V0PWZ1bmN0aW9uKGUpe3JldHVybiBkZWxldGUgdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV0sZGVsZXRlIHRoaXMuaGVhZGVyW2VdLHRoaXN9LHQuZmllbGQ9ZnVuY3Rpb24oZSx0KXtpZihudWxsPT09ZXx8dm9pZCAwPT09ZSl0aHJvdyBuZXcgRXJyb3IoXCIuZmllbGQobmFtZSwgdmFsKSBuYW1lIGNhbiBub3QgYmUgZW1wdHlcIik7aWYocihlKSl7Zm9yKHZhciBuIGluIGUpdGhpcy5maWVsZChuLGVbbl0pO3JldHVybiB0aGlzfWlmKG51bGw9PT10fHx2b2lkIDA9PT10KXRocm93IG5ldyBFcnJvcihcIi5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5XCIpO3JldHVybiB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChlLHQpLHRoaXN9LHQuYWJvcnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYWJvcnRlZD90aGlzOih0aGlzLl9hYm9ydGVkPSEwLHRoaXMueGhyJiZ0aGlzLnhoci5hYm9ydCgpLHRoaXMucmVxJiZ0aGlzLnJlcS5hYm9ydCgpLHRoaXMuY2xlYXJUaW1lb3V0KCksdGhpcy5lbWl0KFwiYWJvcnRcIiksdGhpcyl9LHQud2l0aENyZWRlbnRpYWxzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dpdGhDcmVkZW50aWFscz0hMCx0aGlzfSx0LnJlZGlyZWN0cz1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fbWF4UmVkaXJlY3RzPWUsdGhpc30sdC50b0pTT049ZnVuY3Rpb24oKXtyZXR1cm57bWV0aG9kOnRoaXMubWV0aG9kLHVybDp0aGlzLnVybCxkYXRhOnRoaXMuX2RhdGEsaGVhZGVyczp0aGlzLl9oZWFkZXJ9fSx0Ll9pc0hvc3Q9ZnVuY3Rpb24oZSl7c3dpdGNoKHt9LnRvU3RyaW5nLmNhbGwoZSkpe2Nhc2VcIltvYmplY3QgRmlsZV1cIjpjYXNlXCJbb2JqZWN0IEJsb2JdXCI6Y2FzZVwiW29iamVjdCBGb3JtRGF0YV1cIjpyZXR1cm4hMDtkZWZhdWx0OnJldHVybiExfX0sdC5zZW5kPWZ1bmN0aW9uKGUpe3ZhciB0PXIoZSksbj10aGlzLl9oZWFkZXJbXCJjb250ZW50LXR5cGVcIl07aWYodCYmcih0aGlzLl9kYXRhKSlmb3IodmFyIGkgaW4gZSl0aGlzLl9kYXRhW2ldPWVbaV07ZWxzZVwic3RyaW5nXCI9PXR5cGVvZiBlPyhufHx0aGlzLnR5cGUoXCJmb3JtXCIpLG49dGhpcy5faGVhZGVyW1wiY29udGVudC10eXBlXCJdLHRoaXMuX2RhdGE9XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIj09bj90aGlzLl9kYXRhP3RoaXMuX2RhdGErXCImXCIrZTplOih0aGlzLl9kYXRhfHxcIlwiKStlKTp0aGlzLl9kYXRhPWU7cmV0dXJuIXR8fHRoaXMuX2lzSG9zdChlKT90aGlzOihufHx0aGlzLnR5cGUoXCJqc29uXCIpLHRoaXMpfX0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUpe3JldHVybiBudWxsIT09ZSYmXCJvYmplY3RcIj09dHlwZW9mIGV9ZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlLHQsbil7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uZXcgZShcIkdFVFwiLHQpLmVuZChuKToyPT1hcmd1bWVudHMubGVuZ3RoP25ldyBlKFwiR0VUXCIsdCk6bmV3IGUodCxuKX1lLmV4cG9ydHM9bn1dKX0pOyIsIi8vIEFsbG93cyB1cyB0byBjcmVhdGUgYW5kIGJpbmQgdG8gZXZlbnRzLiBFdmVyeXRoaW5nIGluIENoYXRFbmdpbmUgaXMgYW4gZXZlbnRcbi8vIGVtaXR0ZXJcbmNvbnN0IEV2ZW50RW1pdHRlcjIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIyJykuRXZlbnRFbWl0dGVyMjtcblxuY29uc3QgUHViTnViID0gcmVxdWlyZSgncHVibnViJyk7XG5cbi8vIGFsbG93cyBhc3luY2hyb25vdXMgZXhlY3V0aW9uIGZsb3cuXG5jb25zdCB3YXRlcmZhbGwgPSByZXF1aXJlKCdhc3luYy93YXRlcmZhbGwnKTtcblxuLy8gcmVxdWlyZWQgdG8gbWFrZSBBSkFYIGNhbGxzIGZvciBhdXRoXG5jb25zdCBheGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbi8qKlxuR2xvYmFsIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgQ2hhdEVuZ2luZX0uXG5cbkBhbGlhcyBDaGF0RW5naW5lQ29yZVxuQHBhcmFtIHBuQ29uZmlnIHtPYmplY3R9IENoYXRFbmdpbmUgaXMgYmFzZWQgb2ZmIFB1Yk51Yi4gU3VwcGx5IHlvdXIgUHViTnViIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyBoZXJlLiBTZWUgdGhlIGdldHRpbmcgc3RhcnRlZCB0dXRvcmlhbCBhbmQgW3RoZSBQdWJOdWIgZG9jc10oaHR0cHM6Ly93d3cucHVibnViLmNvbS9kb2NzL2phdmEtc2UtamF2YS9hcGktcmVmZXJlbmNlLWNvbmZpZ3VyYXRpb24pLlxuQHBhcmFtIGNlQ29uZmlnIHtPYmplY3R9IEEgbGlzdCBvZiBjaGF0IGVuZ2luZSBzcGVjaWZpYyBjb25maWcgb3B0aW9ucy5cbkBwYXJhbSBbY2VDb25maWcuZ2xvYmFsQ2hhbm5lbD1jaGF0LWVuZ2luZV0ge1N0cmluZ30gVGhlIHJvb3QgY2hhbm5lbC4gU2VlIHtAbGluayBDaGF0RW5naW5lLmdsb2JhbH1cbkBwYXJhbSBbY2VDb25maWcuYXV0aFVybF0ge1N0cmluZ30gVGhlIHJvb3QgVVJMIHVzZWQgdG8gbWFuYWdlIHBlcm1pc3Npb25zIGZvciBwcml2YXRlIGNoYW5uZWxzLiBPbWl0dGluZyB0aGlzIGZvcmNlcyBpbnNlY3VyZSBtb2RlLlxuQHBhcmFtIFtjZUNvbmZpZy50aHJvd0Vycm9ycz10cnVlXSB7Qm9vbGVhbn0gVGhyb3dzIGVycm9ycyBpbiBKUyBjb25zb2xlLlxuQHBhcmFtIFtjZUNvbmZpZy5pbnNlY3VyZT10cnVlXSB7Qm9vbGVhbn0gRm9yY2UgaW50byBpbnNlY3VyZSBtb2RlLiBXaWxsIGlnbm9yZSBhdXRoVXJsIGFuZCBhbGwgQ2hhdHMgd2lsbCBiZSBwdWJsaWMuXG5AcmV0dXJuIHtDaGF0RW5naW5lfSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIHtAbGluayBDaGF0RW5naW5lfVxuQGV4YW1wbGVcbkNoYXRFbmdpbmUgPSBDaGF0RW5naW5lQ29yZS5jcmVhdGUoe1xuICAgIHB1Ymxpc2hLZXk6ICdkZW1vJyxcbiAgICBzdWJzY3JpYmVLZXk6ICdkZW1vJ1xufSwge1xuICAgIGF1dGhVcmw6ICdodHRwOi8vbG9jYWxob3N0L2F1dGgnLFxuICAgIGdsb2JhbENoYW5uZWw6ICdjaGF0LWVuZ2luZS1nbG9iYWwtY2hhbm5lbCdcbn0pO1xuKi9cbmNvbnN0IGNyZWF0ZSA9IGZ1bmN0aW9uKHBuQ29uZmlnLCBjZUNvbmZpZyA9IHt9KSB7XG5cbiAgICBsZXQgQ2hhdEVuZ2luZSA9IGZhbHNlO1xuXG4gICAgaWYoY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCkge1xuICAgICAgICBjZUNvbmZpZy5nbG9iYWxDaGFubmVsID0gY2VDb25maWcuZ2xvYmFsQ2hhbm5lbC50b1N0cmluZygpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCA9ICdjaGF0LWVuZ2luZSc7XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNlQ29uZmlnLnRocm93RXJyb3JzID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgY2VDb25maWcudGhyb3dFcnJvcnMgPSB0cnVlO1xuICAgIH1cblxuICAgIGNlQ29uZmlnLmluc2VjdXJlID0gY2VDb25maWcuaW5zZWN1cmUgfHwgZmFsc2U7XG4gICAgaWYoIWNlQ29uZmlnLmF1dGhVcmwpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdDaGF0RW5naW5lIGlzIHJ1bm5pbmcgaW4gaW5zZWN1cmUgbW9kZS4gU3VwcGx5IGEgYXV0aFVybCB0byBydW4gaW4gc2VjdXJlIG1vZGUuJyk7XG4gICAgICAgIGNlQ29uZmlnLmluc2VjdXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0aHJvd0Vycm9yID0gZnVuY3Rpb24oc2VsZiwgY2IsIGtleSwgY2VFcnJvciwgcGF5bG9hZCA9IHt9KSB7XG5cbiAgICAgICAgaWYoY2VDb25maWcudGhyb3dFcnJvcnMpIHtcbiAgICAgICAgICAgIC8vIHRocm93IGNlRXJyb3I7XG4gICAgICAgICAgICB0aHJvdyBjZUVycm9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF5bG9hZC5jZUVycm9yID0gY2VFcnJvci50b1N0cmluZygpO1xuXG4gICAgICAgIHNlbGZbY2JdKFsnJCcsICdlcnJvcicsIGtleV0uam9pbignLicpLCBwYXlsb2FkKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICogVGhlIHtAbGluayBDaGF0RW5naW5lfSBvYmplY3QgaXMgYSBSb290RW1pdHRlci4gQ29uZmlndXJlcyBhbiBldmVudCBlbWl0dGVyIHRoYXQgb3RoZXIgQ2hhdEVuZ2luZSBvYmplY3RzIGluaGVyaXQuIEFkZHMgc2hvcnRjdXQgbWV0aG9kcyBmb3JcbiAgICAqIGBgYHRoaXMub24oKWBgYCwgYGBgdGhpcy5lbWl0KClgYGAsIGV0Yy5cbiAgICAqL1xuICAgIGNsYXNzIFJvb3RFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBDcmVhdGUgYSBuZXcgRXZlbnRFbWl0dGVyMiBvYmplY3QgZm9yIHRoaXMgY2xhc3MuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjIoe1xuICAgICAgICAgICAgICB3aWxkY2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgbmV3TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICAgIG1heExpc3RlbmVyczogNTAsXG4gICAgICAgICAgICAgIHZlcmJvc2VNZW1vcnlMZWFrOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gd2UgYmluZCB0byBtYWtlIHN1cmUgd2lsZGNhcmRzIHdvcmtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc3luY2x5L0V2ZW50RW1pdHRlcjIvaXNzdWVzLzE4NlxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFByaXZhdGUgZW1pdCBtZXRob2QgdGhhdCBicm9hZGNhc3RzIHRoZSBldmVudCB0byBsaXN0ZW5lcnMgb24gdGhpcyBwYWdlLlxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gdGhlIGV2ZW50IHBheWxvYWRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9lbWl0ID0gdGhpcy5lbWl0dGVyLmVtaXQuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIExpc3RlbiBmb3IgYSBzcGVjaWZpYyBldmVudCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkLiBUaGlzIGlzIHJlc2VydmVkIGluIGNhc2UgYGBgdGhpcy5vbmBgYCBpcyBvdmVyd3JpdHRlbi5cblxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLl9vbiA9IHRoaXMuZW1pdHRlci5vbi5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGEgc3BlY2lmaWMgZXZlbnQgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZC4gU3VwcG9ydHMgd2lsZGNhcmQgbWF0Y2hpbmcuXG4gICAgICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgZXZlbnQgaXMgZW1pdHRlZFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBHZXQgbm90aWZpZWQgd2hlbmV2ZXIgc29tZW9uZSBqb2lucyB0aGUgcm9vbVxuICAgICAgICAgICAgKiBvYmplY3Qub24oJ2V2ZW50JywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudCB3YXMgZmlyZWQnKS5cbiAgICAgICAgICAgICogfSlcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gR2V0IG5vdGlmaWVkIG9mIGV2ZW50LmEgYW5kIGV2ZW50LmJcbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudC4qJywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudC5hIG9yIGV2ZW50LmIgd2FzIGZpcmVkJykuO1xuICAgICAgICAgICAgKiB9KVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub24gPSB0aGlzLmVtaXR0ZXIub24uYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogU3RvcCBhIGNhbGxiYWNrIGZyb20gbGlzdGVuaW5nIHRvIGFuIGV2ZW50LlxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbihwYXlsb2FkOykge1xuICAgICAgICAgICAgKiAgICBjb25zb2xlLmxvZygnc29tZXRoaW5nIGhhcHBlbmQhJyk7XG4gICAgICAgICAgICAqIH07XG4gICAgICAgICAgICAqIG9iamVjdC5vbignZXZlbnQnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAqIC8vIC4uLlxuICAgICAgICAgICAgKiBvYmplY3Qub2ZmKCdldmVudCcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9mZiA9IHRoaXMuZW1pdHRlci5vZmYuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogTGlzdGVuIGZvciBhbnkgZXZlbnQgb24gdGhpcyBvYmplY3QgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZFxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiBhbnkgZXZlbnQgaXMgZW1pdHRlZC4gRmlyc3QgcGFyYW1ldGVyIGlzIHRoZSBldmVudCBuYW1lIGFuZCBzZWNvbmQgaXMgdGhlIHBheWxvYWQuXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIG9iamVjdC5vbkFueSgoZXZlbnQsIHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdBbGwgZXZlbnRzIHRyaWdnZXIgdGhpcy4nKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbkFueSA9IHRoaXMuZW1pdHRlci5vbkFueS5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGFuIGV2ZW50IGFuZCBvbmx5IGZpcmUgdGhlIGNhbGxiYWNrIGEgc2luZ2xlIHRpbWVcbiAgICAgICAgICAgICogQG1ldGhvZFxuICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biBvbmNlXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIG9iamVjdC5vbmNlKCdtZXNzYWdlJywgPT4gKGV2ZW50LCBwYXlsb2FkKSB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVGhpcyBpcyBvbmx5IGZpcmVkIG9uY2UhJyk7XG4gICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub25jZSA9IHRoaXMuZW1pdHRlci5vbmNlLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBSZXByZXNlbnRzIGFuIGV2ZW50IHRoYXQgbWF5IGJlIGVtaXR0ZWQgb3Igc3Vic2NyaWJlZCB0by5cbiAgICAqL1xuICAgIGNsYXNzIEV2ZW50IHtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjaGF0LCBldmVudCkge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEV2ZW50cyBhcmUgYWx3YXlzIGEgcHJvcGVydHkgb2YgYSB7QGxpbmsgQ2hhdH0uIFJlc3BvbnNpYmxlIGZvclxuICAgICAgICAgICAgbGlzdGVuaW5nIHRvIHNwZWNpZmljIGV2ZW50cyBhbmQgZmlyaW5nIGV2ZW50cyB3aGVuIHRoZXkgb2NjdXIuXG47XG4gICAgICAgICAgICBAcmVhZG9ubHlcbiAgICAgICAgICAgIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgQHNlZSBbUHViTnViIENoYW5uZWxzXShodHRwczovL3N1cHBvcnQucHVibnViLmNvbS9zdXBwb3J0L3NvbHV0aW9ucy9hcnRpY2xlcy8xNDAwMDA0NTE4Mi13aGF0LWlzLWEtY2hhbm5lbC0pXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhdC5jaGFubmVsO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFB1Ymxpc2hlcyB0aGUgZXZlbnQgb3ZlciB0aGUgUHViTnViIG5ldHdvcmsgdG8gdGhlIHtAbGluayBFdmVudH0gY2hhbm5lbFxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoID0gKG0pID0+IHtcblxuICAgICAgICAgICAgICAgIG0uZXZlbnQgPSBldmVudDtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICAgICB9LCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHN0YXR1cy5zdGF0dXNDb2RlID09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKCckLnB1Ymxpc2guc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogVGhlcmUgd2FzIGEgcHJvYmxlbSBwdWJsaXNoaW5nIG92ZXIgdGhlIFB1Yk51YiBuZXR3b3JrLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwicHVibGlzaFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoY2hhdCwgJ3RyaWdnZXInLCAncHVibGlzaCcsIG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBwdWJsaXNoaW5nIG92ZXIgdGhlIFB1Yk51YiBuZXR3b3JrLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBzdGF0dXMuZXJyb3JEYXRhLnJlc3BvbnNlLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvckRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEZvcndhcmRzIGV2ZW50cyB0byB0aGUgQ2hhdCB0aGF0IHJlZ2lzdGVyZWQgdGhlIGV2ZW50IHtAbGluayBDaGF0fVxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UgPSAobSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IG0uY2hhbm5lbCAmJiBtLm1lc3NhZ2UuZXZlbnQgPT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKG0ubWVzc2FnZS5ldmVudCwgbS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2FsbCBvbk1lc3NhZ2Ugd2hlbiBQdWJOdWIgcmVjZWl2ZXMgYW4gZXZlbnRcbiAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm9uTWVzc2FnZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgQW4gQ2hhdEVuZ2luZSBnZW5lcmljIGVtaXR0ZXIgdGhhdCBzdXBwb3J0cyBwbHVnaW5zIGFuZCBmb3J3YXJkc1xuICAgIGV2ZW50cyB0byB0aGUgcm9vdCBlbWl0dGVyLlxuICAgIEBleHRlbmRzIFJvb3RFbWl0dGVyXG4gICAgKi9cbiAgICBjbGFzcyBFbWl0dGVyIGV4dGVuZHMgUm9vdEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEVtaXQgZXZlbnRzIGxvY2FsbHkuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fZW1pdCA9IChldmVudCwgZGF0YSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gYWxsIGV2ZW50cyBhcmUgZm9yd2FyZGVkIHRvIENoYXRFbmdpbmUgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gc28geW91IGNhbiBnbG9iYWxseSBiaW5kIHRvIGV2ZW50cyB3aXRoIENoYXRFbmdpbmUub24oKVxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuX2VtaXQoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gZW1pdCB0aGUgZXZlbnQgZnJvbSB0aGUgb2JqZWN0IHRoYXQgY3JlYXRlZCBpdFxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KGV2ZW50LCBkYXRhKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogTGlzdGVuIGZvciBhIHNwZWNpZmljIGV2ZW50IGFuZCBmaXJlIGEgY2FsbGJhY2sgd2hlbiBpdCdzIGVtaXR0ZWQuIFN1cHBvcnRzIHdpbGRjYXJkIG1hdGNoaW5nLlxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gR2V0IG5vdGlmaWVkIHdoZW5ldmVyIHNvbWVvbmUgam9pbnMgdGhlIHJvb21cbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudCcsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZXZlbnQgd2FzIGZpcmVkJykuXG4gICAgICAgICAgICAqIH0pXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIEdldCBub3RpZmllZCBvZiBldmVudC5hIGFuZCBldmVudC5iXG4gICAgICAgICAgICAqIG9iamVjdC5vbignZXZlbnQuKicsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZXZlbnQuYSBvciBldmVudC5iIHdhcyBmaXJlZCcpLjtcbiAgICAgICAgICAgICogfSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uID0gKGV2ZW50LCBjYikgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBhbGwgZXZlbnRzIG9uIHRoaXMgZW1pdHRlclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBuZXcgRXZlbnQodGhpcywgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgcHJpdmF0ZSBfb24gcHJvcGVydHlcbiAgICAgICAgICAgICAgICB0aGlzLl9vbihldmVudCwgY2IpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFN0b3JlcyBhIGxpc3Qgb2YgcGx1Z2lucyBib3VuZCB0byB0aGlzIG9iamVjdFxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnMgPSBbXTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBCaW5kcyBhIHBsdWdpbiB0byB0aGlzIG9iamVjdFxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IG1vZHVsZSBUaGUgcGx1Z2luIG1vZHVsZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMucGx1Z2luID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgdGhpcyBwbHVnaW4gdG8gYSBsaXN0IG9mIHBsdWdpbnMgZm9yIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zLnB1c2gobW9kdWxlKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIG5hbWUgb2YgdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBzZWUgaWYgdGhlcmUgYXJlIHBsdWdpbnMgdG8gYXR0YWNoIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICBpZihtb2R1bGUuZXh0ZW5kcyAmJiBtb2R1bGUuZXh0ZW5kc1tjbGFzc05hbWVdKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYXR0YWNoIHRoZSBwbHVnaW5zIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgLy8gdW5kZXIgdGhlaXIgbmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuYWRkQ2hpbGQodGhpcywgbW9kdWxlLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBtb2R1bGUuZXh0ZW5kc1tjbGFzc05hbWVdKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzW21vZHVsZS5uYW1lc3BhY2VdLkNoYXRFbmdpbmUgPSBDaGF0RW5naW5lO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBwbHVnaW4gaGFzIGEgc3BlY2lhbCBjb25zdHJ1Y3QgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gcnVuIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uY29uc3RydWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW21vZHVsZS5uYW1lc3BhY2VdLmNvbnN0cnVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgIFRoaXMgaXMgdGhlIHJvb3Qge0BsaW5rIENoYXR9IGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIGNoYXQgcm9vbVxuXG4gICAgQHBhcmFtIHtTdHJpbmd9IFtjaGFubmVsPW5ldyBEYXRlKCkuZ2V0VGltZSgpXSBBIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIGNoYXQge0BsaW5rIENoYXR9LiBUaGUgY2hhbm5lbCBpcyB0aGUgdW5pcXVlIG5hbWUgb2YgYSB7QGxpbmsgQ2hhdH0sIGFuZCBpcyB1c3VhbGx5IHNvbWV0aGluZyBsaWtlIFwiVGhlIFdhdGVyY29vbGVyXCIsIFwiU3VwcG9ydFwiLCBvciBcIk9mZiBUb3BpY1wiLiBTZWUgW1B1Yk51YiBDaGFubmVsc10oaHR0cHM6Ly9zdXBwb3J0LnB1Ym51Yi5jb20vc3VwcG9ydC9zb2x1dGlvbnMvYXJ0aWNsZXMvMTQwMDAwNDUxODItd2hhdC1pcy1hLWNoYW5uZWwtKS5cbiAgICBAcGFyYW0ge0Jvb2xlYW59IFthdXRvQ29ubmVjdD10cnVlXSBDb25uZWN0IHRvIHRoaXMgY2hhdCBhcyBzb29uIGFzIGl0cyBpbml0aWF0ZWQuIElmIHNldCB0byBgYGBmYWxzZWBgYCwgY2FsbCB0aGUge0BsaW5rIENoYXQjY29ubmVjdH0gbWV0aG9kIHRvIGNvbm5lY3QgdG8gdGhpcyB7QGxpbmsgQ2hhdH0uXG4gICAgQHBhcmFtIHtCb29sZWFufSBbbmVlZEdyYW50PXRydWVdIFRoaXMgQ2hhdCBoYXMgcmVzdHJpY3RlZCBwZXJtaXNzaW9ucyBhbmQgd2UgbmVlZCB0byBhdXRoZW50aWNhdGUgb3Vyc2VsdmVzIGluIG9yZGVyIHRvIGNvbm5lY3QuXG4gICAgQGV4dGVuZHMgRW1pdHRlclxuICAgIEBmaXJlcyBDaGF0IyRcIi5cInJlYWR5XG4gICAgQGZpcmVzIENoYXQjJFwiLlwic3RhdGVcbiAgICBAZmlyZXMgQ2hhdCMkXCIuXCJvbmxpbmVcbiAgICBAZmlyZXMgQ2hhdCMkXCIuXCJvZmZsaW5lXG4gICAgKi9cbiAgICBjbGFzcyBDaGF0IGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY2hhbm5lbCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCBuZWVkR3JhbnQgPSB0cnVlLCBhdXRvQ29ubmVjdCA9IHRydWUpIHtcblxuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgaWYoY2VDb25maWcuaW5zZWN1cmUpIHtcbiAgICAgICAgICAgICAgICBuZWVkR3JhbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIHRoZSBDaGF0IHJvb20uXG4gICAgICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICAgICogQHNlZSBbUHViTnViIENoYW5uZWxzXShodHRwczovL3N1cHBvcnQucHVibnViLmNvbS9zdXBwb3J0L3NvbHV0aW9ucy9hcnRpY2xlcy8xNDAwMDA0NTE4Mi13aGF0LWlzLWEtY2hhbm5lbC0pXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBsZXQgY2hhblByaXZTdHJpbmcgPSAncHVibGljLic7XG4gICAgICAgICAgICBpZihuZWVkR3JhbnQpIHtcbiAgICAgICAgICAgICAgICBjaGFuUHJpdlN0cmluZyA9ICdwcml2YXRlLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY2hhbm5lbC5pbmRleE9mKGNlQ29uZmlnLmdsb2JhbENoYW5uZWwpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gW2NlQ29uZmlnLmdsb2JhbENoYW5uZWwsICdjaGF0JywgY2hhblByaXZTdHJpbmcsIGNoYW5uZWxdLmpvaW4oJyMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBBIGxpc3Qgb2YgdXNlcnMgaW4gdGhpcyB7QGxpbmsgQ2hhdH0uIEF1dG9tYXRpY2FsbHkga2VwdCBpbiBzeW5jIGFzIHVzZXJzIGpvaW4gYW5kIGxlYXZlIHRoZSBjaGF0LlxuICAgICAgICAgICAgVXNlIFskLmpvaW5dKC9DaGF0Lmh0bWwjZXZlbnQ6JCUyNTIyLiUyNTIyam9pbikgYW5kIHJlbGF0ZWQgZXZlbnRzIHRvIGdldCBub3RpZmllZCB3aGVuIHRoaXMgY2hhbmdlc1xuXG4gICAgICAgICAgICBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudXNlcnMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBBIG1hcCBvZiB7QGxpbmsgRXZlbnR9IGJvdW5kIHRvIHRoaXMge0BsaW5rIENoYXR9XG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZXZlbnRzID0ge31cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBVcGRhdGVzIGxpc3Qgb2Yge0BsaW5rIFVzZXJ9cyBpbiB0aGlzIHtAbGluayBDaGF0fVxuICAgICAgICAgICAgYmFzZWQgb24gd2hvIGlzIG9ubGluZSBub3cuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gc3RhdHVzIFRoZSByZXNwb25zZSBzdGF0dXNcbiAgICAgICAgICAgIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uSGVyZU5vdyA9IChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZihzdGF0dXMuZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHRoZSBwcmVzZW5jZSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwicHJlc2VuY2VcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcih0aGlzLCAndHJpZ2dlcicsICdwcmVzZW5jZScsIG5ldyBFcnJvcignR2V0dGluZyBwcmVzZW5jZSBvZiB0aGlzIENoYXQuIE1ha2Ugc3VyZSBQdWJOdWIgcHJlc2VuY2UgaXMgZW5hYmxlZCBmb3IgdGhpcyBrZXknKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvckRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHN0YXR1cy5lcnJvckRhdGEucmVzcG9uc2UudGV4dFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9jY3VwYW50cyBpbiB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9jY3VwYW50cyA9IHJlc3BvbnNlLmNoYW5uZWxzW3RoaXMuY2hhbm5lbF0ub2NjdXBhbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCB0aGUgdXNlckxpc3QgZm9yIHJsdG0uanMgc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIG9jY3VwYW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKG9jY3VwYW50c1tpXS51dWlkLCBvY2N1cGFudHNbaV0uc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBHZXQgbWVzc2FnZXMgdGhhdCBoYXZlIGJlZW4gcHVibGlzaGVkIHRvIHRoZSBuZXR3b3JrIGJlZm9yZSB0aGlzIGNsaWVudCB3YXMgY29ubmVjdGVkLlxuICAgICAgICAgICAgKiBFdmVudHMgYXJlIHB1Ymxpc2hlZCB3aXRoIHRoZSBgYGAkaGlzdG9yeWBgYCBwcmVmaXguIFNvIGZvciBleGFtcGxlLCBpZiB5b3UgaGFkIHRoZSBldmVudCBgYGBtZXNzYWdlYGBgLFxuICAgICAgICAgICAgKiB5b3Ugd291bGQgY2FsbCBgYGBDaGF0Lmhpc3RvcnkoJ21lc3NhZ2UnKWBgYCBhbmQgc3Vic2NyaWJlIHRvIGhpc3RvcnkgZXZlbnRzIHZpYSBgYGBjaGF0Lm9uKCckaGlzdG9yeS5tZXNzYWdlJywgKGRhdGEpID0+IHt9KWBgYC5cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudCB3ZSdyZSBnZXR0aW5nIGhpc3RvcnkgZm9yXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnXSBUaGUgUHViTnViIGhpc3RvcnkgY29uZmlnIGZvciB0aGlzIGNhbGxcbiAgICAgICAgICAgICogQHR1dG9yaWFsIGhpc3RvcnlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkgPSAoZXZlbnQsIGNvbmZpZyA9IHt9KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGV2ZW50IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gdGhpcy5ldmVudHNbZXZlbnRdIHx8IG5ldyBFdmVudCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIFB1Yk51YiBjb25maWd1cmVkIGNoYW5uZWwgdG8gdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSB0aGlzLmV2ZW50c1tldmVudF0uY2hhbm5lbDtcblxuICAgICAgICAgICAgICAgIC8vIHJ1biB0aGUgUHViTnViIGhpc3RvcnkgbWV0aG9kIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuaGlzdG9yeShjb25maWcsIChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc3RhdHVzLmVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHRoZSBoaXN0b3J5IG9mIHRoaXMgY2hhdFxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwiaGlzdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnaGlzdG9yeScsIG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB0aGUgaGlzdG9yeS4gTWFrZSBzdXJlIGhpc3RvcnkgaXMgZW5hYmxlZCBmb3IgdGhpcyBQdWJOdWIga2V5LicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBzdGF0dXMuZXJyb3JEYXRhLnJlc3BvbnNlLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLm1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1lc3NhZ2UuZW50cnkuZXZlbnQgPT0gZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlZCBieSB0aGUge0BsaW5rIENoYXQjaGlzdG9yeX0gY2FsbC4gRW1pdHMgb2xkIGV2ZW50cyBhZ2Fpbi4gRXZlbnRzIGFyZSBwcmVwZW5kZWQgd2l0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGBgYCQuaGlzdG9yeS5gYGAgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSB0aGUgb3JpZ2luYWwgbGl2ZSBldmVudHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwiaGlzdG9yeVwiLlwiKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEB0dXRvcmlhbCBoaXN0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnJCcsICdoaXN0b3J5JywgZXZlbnRdLmpvaW4oJy4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZW50cnkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogSW52aXRlIGEgdXNlciB0byB0aGlzIENoYXQuIEF1dGhvcml6ZXMgdGhlIGludml0ZWQgdXNlciBpbiB0aGUgQ2hhdCBhbmQgc2VuZHMgdGhlbSBhbiBpbnZpdGUgdmlhIHtAbGluayBVc2VyI2RpcmVjdH0uXG4gICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gdXNlciBUaGUge0BsaW5rIFVzZXJ9IHRvIGludml0ZSB0byB0aGlzIGNoYXRyb29tLlxuICAgICAgICAgICAgKiBAZmlyZXMgTWUjZXZlbnQ6JFwiLlwiaW52aXRlXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIC8vIG9uZSB1c2VyIHJ1bm5pbmcgQ2hhdEVuZ2luZVxuICAgICAgICAgICAgKiBsZXQgc2VjcmV0Q2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQoJ3NlY3JldC1jaGFubmVsJyk7XG4gICAgICAgICAgICAqIHNlY3JldENoYXQuaW52aXRlKHNvbWVvbmVFbHNlKTtcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gc29tZW9uZUVsc2UgaW4gYW5vdGhlciBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgICAgICAgICAqIG1lLmRpcmVjdC5vbignJC5pbnZpdGUnLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgKiAgICAgbGV0IHNlY3JldENoYXQgPSBuZXcgQ2hhdEVuZ2luZS5DaGF0KHBheWxvYWQuZGF0YS5jaGFubmVsKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbnZpdGUgPSAodXNlcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IGNvbXBsZXRlID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZW5kID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogTm90aWZpZXMge0BsaW5rIE1lfSB0aGF0IHRoZXkndmUgYmVlbiBpbnZpdGVkIHRvIGEgbmV3IHByaXZhdGUge0BsaW5rIENoYXR9LlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlZCBieSB0aGUge0BsaW5rIENoYXQjaW52aXRlfSBtZXRob2QuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBNZSMkXCIuXCJpbnZpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogQHR1dG9yaWFsIHByaXZhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogbWUuZGlyZWN0Lm9uKCckLmludml0ZScsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAqICAgIGxldCBwcml2Q2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQocGF5bG9hZC5kYXRhLmNoYW5uZWwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3QuZW1pdCgnJC5pbnZpdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jaGFubmVsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIXVzZXIuZGlyZWN0LmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3QuY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3Qub24oJyQuY29ubmVjdGVkJywgc2VuZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKGNlQ29uZmlnLmluc2VjdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBheGlvcy5wb3N0KGNlQ29uZmlnLmF1dGhVcmwgKyAnL2ludml0ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhLZXk6IHBuQ29uZmlnLmF1dGhLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiB1c2VyLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBteVVVSUQ6IENoYXRFbmdpbmUubWUudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhEYXRhOiBDaGF0RW5naW5lLm1lLmF1dGhEYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIG1ha2luZyBhIHJlcXVlc3QgdG8gYXV0aGVudGljYXRpb24gc2VydmVyLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgS2VlcCB0cmFjayBvZiB7QGxpbmsgVXNlcn1zIGluIHRoZSByb29tIGJ5IHN1YnNjcmliaW5nIHRvIFB1Yk51YiBwcmVzZW5jZSBldmVudHMuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgUHViTnViIHByZXNlbmNlIHJlc3BvbnNlIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vblByZXNlbmNlID0gKHByZXNlbmNlRXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBjaGFubmVsIG1hdGNoZXMgdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IHByZXNlbmNlRXZlbnQuY2hhbm5lbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgam9pbnMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcImpvaW5cIikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHRoaXMuY3JlYXRlVXNlcihwcmVzZW5jZUV2ZW50LnV1aWQsIHByZXNlbmNlRXZlbnQuc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZWQgd2hlbiBhIHtAbGluayBVc2VyfSBoYXMgam9pbmVkIHRoZSByb29tLlxuICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvbmxpbmVcIi5cImpvaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHBheWxvYWQgcmV0dXJuZWQgYnkgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBjYW1lIG9ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBjaGF0Lm9uKCckLmpvaW4nLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgaGFzIGpvaW5lZCB0aGUgcm9vbSEnLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub25saW5lLmpvaW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgbGVhdmVzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJsZWF2ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJMZWF2ZShwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSB0aW1lc291dFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcInRpbWVvdXRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyRGlzY29ubmVjdChwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSdzIHN0YXRlIGlzIHVwZGF0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJzdGF0ZS1jaGFuZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKHByZXNlbmNlRXZlbnQudXVpZCwgcHJlc2VuY2VFdmVudC5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCb29sZWFuIHZhbHVlIHRoYXQgaW5kaWNhdGVzIG9mIHRoZSBDaGF0IGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yay5cbiAgICAgICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQ29ubmVjdCB0byBQdWJOdWIgc2VydmVycyB0byBpbml0aWFsaXplIHRoZSBjaGF0LlxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiAvLyBjcmVhdGUgYSBuZXcgY2hhdHJvb20sIGJ1dCBkb24ndCBjb25uZWN0IHRvIGl0IGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICogbGV0IGNoYXQgPSBuZXcgQ2hhdCgnc29tZS1jaGF0JywgZmFsc2UpXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIGNvbm5lY3QgdG8gdGhlIGNoYXQgd2hlbiB3ZSBmZWVsIGxpa2UgaXRcbiAgICAgICAgICAgICogY2hhdC5jb25uZWN0KCk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuY29ubmVjdGVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIUNoYXRFbmdpbmUucHVibnViKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ3NldHVwJywgbmV3IEVycm9yKCdZb3UgbXVzdCBjYWxsIENoYXRFbmdpbmUuY29ubmVjdCgpIGFuZCB3YWl0IGZvciB0aGUgJC5yZWFkeSBldmVudCBiZWZvcmUgY3JlYXRpbmcgbmV3IENoYXRzLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpc3RlbiB0byBhbGwgUHViTnViIGV2ZW50cyBmb3IgdGhpcyBDaGF0XG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMub25NZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6IHRoaXMub25QcmVzZW5jZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBzdWJzY3JpYmUgdG8gdGhlIFB1Yk51YiBjaGFubmVsIGZvciB0aGlzIENoYXRcbiAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpdGhQcmVzZW5jZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uUHJlcCA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmKGF1dG9Db25uZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZ3JhbnQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZihjZUNvbmZpZy5pbnNlY3VyZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblByZXAoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGF4aW9zLnBvc3QoY2VDb25maWcuYXV0aFVybCArICcvY2hhdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhLZXk6IHBuQ29uZmlnLmF1dGhLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBwbkNvbmZpZy51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jaGFubmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IENoYXRFbmdpbmUubWUuYXV0aERhdGFcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUHJlcCgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnYXV0aCcsIG5ldyBFcnJvcignU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgbWFraW5nIGEgcmVxdWVzdCB0byBhdXRoZW50aWNhdGlvbiBzZXJ2ZXIuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKG5lZWRHcmFudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhbnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblByZXAoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5jaGF0c1t0aGlzLmNoYW5uZWxdID0gdGhpcztcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogU2VuZCBldmVudHMgdG8gb3RoZXIgY2xpZW50cyBpbiB0aGlzIHtAbGluayBVc2VyfS5cbiAgICAgICAgKiBFdmVudHMgYXJlIHRyaWdnZXIgb3ZlciB0aGUgbmV0d29yayAgYW5kIGFsbCBldmVudHMgYXJlIG1hZGVcbiAgICAgICAgKiBvbiBiZWhhbGYgb2Yge0BsaW5rIE1lfVxuICAgICAgICAqXG4gICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgKiBjaGF0LmVtaXQoJ2N1c3RvbS1ldmVudCcsIHt2YWx1ZTogdHJ1ZX0pO1xuICAgICAgICAqIGNoYXQub24oJ2N1c3RvbS1ldmVudCcsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICogICAgIGNvbnNvbGUubG9nKHBheWxvYWQuc2VuZGVyLnV1aWQsICdlbWl0dGVkIHRoZSB2YWx1ZScsIHBheWxvYWQuZGF0YS52YWx1ZSk7XG4gICAgICAgICogfSk7XG4gICAgICAgICovXG4gICAgICAgIGVtaXQoZXZlbnQsIGRhdGEpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgc3RhbmRhcmRpemVkIHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLCAgICAgICAgICAgIC8vIHRoZSBkYXRhIHN1cHBsaWVkIGZyb20gcGFyYW1zXG4gICAgICAgICAgICAgICAgc2VuZGVyOiBDaGF0RW5naW5lLm1lLnV1aWQsICAgLy8gbXkgb3duIHV1aWRcbiAgICAgICAgICAgICAgICBjaGF0OiB0aGlzLCAgICAgICAgICAgIC8vIGFuIGluc3RhbmNlIG9mIHRoaXMgY2hhdFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gcnVuIHRoZSBwbHVnaW4gcXVldWUgdG8gbW9kaWZ5IHRoZSBldmVudFxuICAgICAgICAgICAgdGhpcy5ydW5QbHVnaW5RdWV1ZSgnZW1pdCcsIGV2ZW50LCAobmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIG5leHQobnVsbCwgcGF5bG9hZCk7XG4gICAgICAgICAgICB9LCAoZXJyLCBwYXlsb2FkKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgY2hhdCBvdGhlcndpc2UgaXQgd291bGQgYmUgc2VyaWFsaXplZFxuICAgICAgICAgICAgICAgIC8vIGluc3RlYWQsIGl0J3MgcmVidWlsdCBvbiB0aGUgb3RoZXIgZW5kLlxuICAgICAgICAgICAgICAgIC8vIHNlZSB0aGlzLnRyaWdnZXJcbiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5jaGF0O1xuXG4gICAgICAgICAgICAgICAgLy8gcHVibGlzaCB0aGUgZXZlbnQgYW5kIGRhdGEgb3ZlciB0aGUgY29uZmlndXJlZCBjaGFubmVsXG5cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIGV2ZW50IGV4aXN0cyB3aXRoaW4gdGhlIGdsb2JhbCBzcGFjZVxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBuZXcgRXZlbnQodGhpcywgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLnB1Ymxpc2gocGF5bG9hZCk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgQnJvYWRjYXN0cyBhbiBldmVudCBsb2NhbGx5IHRvIGFsbCBsaXN0ZW5lcnMuXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBwYXlsb2FkIFRoZSBldmVudCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAqL1xuICAgICAgICB0cmlnZ2VyKGV2ZW50LCBwYXlsb2FkKSB7XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXlsb2FkID09IFwib2JqZWN0XCIpIHtcblxuICAgICAgICAgICAgICAgIC8vIHJlc3RvcmUgY2hhdCBpbiBwYXlsb2FkXG4gICAgICAgICAgICAgICAgaWYoIXBheWxvYWQuY2hhdCkge1xuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmNoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHR1cm4gYSB1dWlkIGZvdW5kIGluIHBheWxvYWQuc2VuZGVyIHRvIGEgcmVhbCB1c2VyXG4gICAgICAgICAgICAgICAgaWYocGF5bG9hZC5zZW5kZXIgJiYgQ2hhdEVuZ2luZS51c2Vyc1twYXlsb2FkLnNlbmRlcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5zZW5kZXIgPSBDaGF0RW5naW5lLnVzZXJzW3BheWxvYWQuc2VuZGVyXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbGV0IHBsdWdpbnMgbW9kaWZ5IHRoZSBldmVudFxuICAgICAgICAgICAgdGhpcy5ydW5QbHVnaW5RdWV1ZSgnb24nLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gZW1pdCB0aGlzIGV2ZW50IHRvIGFueSBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnQsIHBheWxvYWQpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIEFkZCBhIHVzZXIgdG8gdGhlIHtAbGluayBDaGF0fSwgY3JlYXRpbmcgaXQgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0LlxuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB1c2VyIHV1aWRcbiAgICAgICAgQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSB1c2VyIGluaXRpYWwgc3RhdGVcbiAgICAgICAgQHBhcmFtIHtCb29sZWFufSB0cmlnZ2VyIEZvcmNlIGEgdHJpZ2dlciB0aGF0IHRoaXMgdXNlciBpcyBvbmxpbmVcbiAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVXNlcih1dWlkLCBzdGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGlzIHVzZXIgZXhpc3RzIGluIHRoZSBnbG9iYWwgbGlzdFxuICAgICAgICAgICAgLy8gc28gd2UgY2FuIHJlZmVyZW5jZSBpdCBmcm9tIGhlcmUgb3V0XG4gICAgICAgICAgICBDaGF0RW5naW5lLnVzZXJzW3V1aWRdID0gQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSB8fCBuZXcgVXNlcih1dWlkKTtcblxuICAgICAgICAgICAgLy8gQWRkIHRoaXMgY2hhdHJvb20gdG8gdGhlIHVzZXIncyBsaXN0IG9mIGNoYXRzXG4gICAgICAgICAgICBDaGF0RW5naW5lLnVzZXJzW3V1aWRdLmFkZENoYXQodGhpcywgc3RhdGUpO1xuXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBqb2luIGV2ZW50IG92ZXIgdGhpcyBjaGF0cm9vbVxuICAgICAgICAgICAgaWYoIXRoaXMudXNlcnNbdXVpZF0pIHtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7QGxpbmsgVXNlcn0gaGFzIGNvbWUgb25saW5lLiBUaGlzIGlzIHdoZW5cbiAgICAgICAgICAgICAgICAqIHRoZSBmcmFtZXdvcmsgZmlyc3RzIGxlYXJuIG9mIGEgdXNlci4gVGhpcyBjYW4gYmUgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgICAgKiBieSwgYGBgJC5qb2luYGBgLCBvciBvdGhlciBuZXR3b3JrIGV2ZW50cyB0aGF0XG4gICAgICAgICAgICAgICAgKiBub3RpZnkgdGhlIGZyYW1ld29yayBvZiBhIG5ldyB1c2VyLlxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cIm9ubGluZVwiLlwiaGVyZVxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHBheWxvYWQgcmV0dXJuZWQgYnkgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge1VzZXJ9IGRhdGEudXNlciBUaGUge0BsaW5rIFVzZXJ9IHRoYXQgY2FtZSBvbmxpbmVcbiAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgKiBjaGF0Lm9uKCckLm9ubGluZS5oZXJlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVXNlciBoYXMgY29tZSBvbmxpbmU6JywgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLm9ubGluZS5oZXJlJywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiBDaGF0RW5naW5lLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhpcyB1c2VyIGluIHRoZSBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy51c2Vyc1t1dWlkXSA9IENoYXRFbmdpbmUudXNlcnNbdXVpZF07XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgaW5zdGFuY2Ugb2YgdGhpcyB1c2VyXG4gICAgICAgICAgICByZXR1cm4gQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVXBkYXRlIGEgdXNlcidzIHN0YXRlIHdpdGhpbiB0aGlzIHtAbGluayBDaGF0fS5cbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB7QGxpbmsgVXNlcn0gdXVpZFxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBTdGF0ZSB0byB1cGRhdGUgZm9yIHRoZSB1c2VyXG4gICAgICAgICovXG4gICAgICAgIHVzZXJVcGRhdGUodXVpZCwgc3RhdGUpIHtcblxuICAgICAgICAgICAgLy8gZW5zdXJlIHRoZSB1c2VyIGV4aXN0cyB3aXRoaW4gdGhlIGdsb2JhbCBzcGFjZVxuICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IENoYXRFbmdpbmUudXNlcnNbdXVpZF0gfHwgbmV3IFVzZXIodXVpZCk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGRvbid0IGtub3cgYWJvdXQgdGhpcyB1c2VyXG4gICAgICAgICAgICBpZighdGhpcy51c2Vyc1t1dWlkXSkge1xuICAgICAgICAgICAgICAgIC8vIGRvIHRoZSB3aG9sZSBqb2luIHRoaW5nXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVVc2VyKHV1aWQsIHN0YXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoaXMgdXNlcidzIHN0YXRlIGluIHRoaXMgY2hhdHJvb21cbiAgICAgICAgICAgIHRoaXMudXNlcnNbdXVpZF0uYXNzaWduKHN0YXRlLCB0aGlzKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEJyb2FkY2FzdCB0aGF0IGEge0BsaW5rIFVzZXJ9IGhhcyBjaGFuZ2VkIHN0YXRlLlxuICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJzdGF0ZVxuICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgcGF5bG9hZCByZXR1cm5lZCBieSB0aGUgZXZlbnRcbiAgICAgICAgICAgICogQHBhcmFtIHtVc2VyfSBkYXRhLnVzZXIgVGhlIHtAbGluayBVc2VyfSB0aGF0IGNoYW5nZWQgc3RhdGVcbiAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEuc3RhdGUgVGhlIG5ldyB1c2VyIHN0YXRlIGZvciB0aGlzIGBgYENoYXRgYGBcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogY2hhdC5vbignJC5zdGF0ZScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVXNlciBoYXMgY2hhbmdlZCBzdGF0ZTonLCBkYXRhLnVzZXIsICduZXcgc3RhdGU6JywgZGF0YS5zdGF0ZSk7XG4gICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5zdGF0ZScsIHtcbiAgICAgICAgICAgICAgICB1c2VyOiB0aGlzLnVzZXJzW3V1aWRdLFxuICAgICAgICAgICAgICAgIHN0YXRlOiB0aGlzLnVzZXJzW3V1aWRdLnN0YXRlKHRoaXMpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogTGVhdmUgZnJvbSB0aGUge0BsaW5rIENoYXR9IG9uIGJlaGFsZiBvZiB7QGxpbmsgTWV9LlxuICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICogY2hhdC5sZWF2ZSgpO1xuICAgICAgICAqL1xuICAgICAgICBsZWF2ZSgpIHtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIudW5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBQZXJmb3JtIHVwZGF0ZXMgd2hlbiBhIHVzZXIgaGFzIGxlZnQgdGhlIHtAbGluayBDaGF0fS5cblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAqL1xuICAgICAgICB1c2VyTGVhdmUodXVpZCkge1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhpcyBldmVudCBpcyByZWFsLCB1c2VyIG1heSBoYXZlIGFscmVhZHkgbGVmdFxuICAgICAgICAgICAgaWYodGhpcy51c2Vyc1t1dWlkXSkge1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgYSB1c2VyIGxlYXZlcywgdHJpZ2dlciB0aGUgZXZlbnRcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogRmlyZWQgd2hlbiBhIHtAbGluayBVc2VyfSBpbnRlbnRpb25hbGx5IGxlYXZlcyBhIHtAbGluayBDaGF0fS5cbiAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvZmZsaW5lXCIuXCJsZWF2ZVxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgcGF5bG9hZCBmcm9tIHRoZSBldmVudFxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtVc2VyfSB1c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBoYXMgbGVmdCB0aGUgcm9vbVxuICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAqIGNoYXQub24oJyQub2ZmbGluZS5sZWF2ZScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgbGVmdCB0aGUgcm9vbSBtYW51YWxseTonLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub2ZmbGluZS5sZWF2ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdGhpcy51c2Vyc1t1dWlkXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlIGxvY2FsIGxpc3Qgb2YgdXNlcnNcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy51c2Vyc1t1dWlkXTtcblxuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IHJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSBnbG9iYWwgbGlzdCxcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHRoZXkgbWF5IGJlIG9ubGluZSBpbiBvdGhlciBjaGFubmVsc1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB1c2VyIGlzbid0IGluIHRoZSB1c2VyIGxpc3RcbiAgICAgICAgICAgICAgICAvLyB3ZSBuZXZlciBrbmV3IGFib3V0IHRoaXMgdXNlciBvciB0aGV5IGFscmVhZHkgbGVmdFxuXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VzZXIgYWxyZWFkeSBsZWZ0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgRmlyZWQgd2hlbiBhIHVzZXIgZGlzY29ubmVjdHMgZnJvbSB0aGUge0BsaW5rIENoYXR9XG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IHV1aWQgVGhlIHV1aWQgb2YgdGhlIHtAbGluayBDaGF0fSB0aGF0IGxlZnRcbiAgICAgICAgKi9cbiAgICAgICAgdXNlckRpc2Nvbm5lY3QodXVpZCkge1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhpcyBldmVudCBpcyByZWFsLCB1c2VyIG1heSBoYXZlIGFscmVhZHkgbGVmdFxuICAgICAgICAgICAgaWYodGhpcy51c2Vyc1t1dWlkXSkge1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBGaXJlZCBzcGVjaWZpY2FsbHkgd2hlbiBhIHtAbGluayBVc2VyfSBsb29zZXMgbmV0d29yayBjb25uZWN0aW9uXG4gICAgICAgICAgICAgICAgKiB0byB0aGUge0BsaW5rIENoYXR9IGludm9sdW50YXJpbHkuXG4gICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwib2ZmbGluZVwiLlwiZGlzY29ubmVjdFxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHtAbGluayBVc2VyfSB0aGF0IGRpc2Nvbm5lY3RlZFxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEudXNlciBUaGUge0BsaW5rIFVzZXJ9IHRoYXQgZGlzY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICogY2hhdC5vbignJC5vZmZsaW5lLmRpc2Nvbm5lY3QnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdVc2VyIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBuZXR3b3JrOicsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLm9mZmxpbmUuZGlzY29ubmVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdGhpcy51c2Vyc1t1dWlkXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBMb2FkIHBsdWdpbnMgYW5kIGF0dGFjaCBhIHF1ZXVlIG9mIGZ1bmN0aW9ucyB0byBleGVjdXRlIGJlZm9yZSBhbmRcbiAgICAgICAgYWZ0ZXIgZXZlbnRzIGFyZSB0cmlnZ2VyIG9yIHJlY2VpdmVkLlxuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiBXaGVyZSBpbiB0aGUgbWlkZGxlZXdhcmUgdGhlIGV2ZW50IHNob3VsZCBydW4gKGVtaXQsIHRyaWdnZXIpXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZmlyc3QgVGhlIGZpcnN0IGZ1bmN0aW9uIHRvIHJ1biBiZWZvcmUgdGhlIHBsdWdpbnMgaGF2ZSBydW5cbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhc3QgVGhlIGxhc3QgZnVuY3Rpb24gdG8gcnVuIGFmdGVyIHRoZSBwbHVnaW5zIGhhdmUgcnVuXG4gICAgICAgICovXG4gICAgICAgIHJ1blBsdWdpblF1ZXVlKGxvY2F0aW9uLCBldmVudCwgZmlyc3QsIGxhc3QpIHtcblxuICAgICAgICAgICAgLy8gdGhpcyBhc3NlbWJsZXMgYSBxdWV1ZSBvZiBmdW5jdGlvbnMgdG8gcnVuIGFzIG1pZGRsZXdhcmVcbiAgICAgICAgICAgIC8vIGV2ZW50IGlzIGEgdHJpZ2dlcmVkIGV2ZW50IGtleVxuICAgICAgICAgICAgbGV0IHBsdWdpbl9xdWV1ZSA9IFtdO1xuXG4gICAgICAgICAgICAvLyB0aGUgZmlyc3QgZnVuY3Rpb24gaXMgYWx3YXlzIHJlcXVpcmVkXG4gICAgICAgICAgICBwbHVnaW5fcXVldWUucHVzaChmaXJzdCk7XG5cbiAgICAgICAgICAgIC8vIGxvb2sgdGhyb3VnaCB0aGUgY29uZmlndXJlZCBwbHVnaW5zXG4gICAgICAgICAgICBmb3IobGV0IGkgaW4gdGhpcy5wbHVnaW5zKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGV5IGhhdmUgZGVmaW5lZCBhIGZ1bmN0aW9uIHRvIHJ1biBzcGVjaWZpY2FsbHlcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhpcyBldmVudFxuICAgICAgICAgICAgICAgIGlmKHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlXG4gICAgICAgICAgICAgICAgICAgICYmIHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlW2xvY2F0aW9uXVxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVtsb2NhdGlvbl1bZXZlbnRdKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luX3F1ZXVlLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVtsb2NhdGlvbl1bZXZlbnRdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2F0ZXJmYWxsIHJ1bnMgdGhlIGZ1bmN0aW9ucyBpbiBhc3NpZ25lZCBvcmRlclxuICAgICAgICAgICAgLy8gd2FpdGluZyBmb3Igb25lIHRvIGNvbXBsZXRlIGJlZm9yZSBtb3ZpbmcgdG8gdGhlIG5leHRcbiAgICAgICAgICAgIC8vIHdoZW4gaXQncyBkb25lLCB0aGUgYGBgbGFzdGBgYCBwYXJhbWV0ZXIgaXMgY2FsbGVkXG4gICAgICAgICAgICB3YXRlcmZhbGwocGx1Z2luX3F1ZXVlLCBsYXN0KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIFNldCB0aGUgc3RhdGUgZm9yIHtAbGluayBNZX0gd2l0aGluIHRoaXMge0BsaW5rIFVzZXJ9LlxuICAgICAgICBCcm9hZGNhc3RzIHRoZSBgYGAkLnN0YXRlYGBgIGV2ZW50IG9uIG90aGVyIGNsaWVudHNcblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSB7QGxpbmsgTWV9IHdpbGwgaGF2ZSB3aXRoaW4gdGhpcyB7QGxpbmsgVXNlcn1cbiAgICAgICAgKi9cbiAgICAgICAgc2V0U3RhdGUoc3RhdGUpIHtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuc2V0U3RhdGUoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKHN0YXR1cywgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxlIHN0YXR1cywgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBvbkNvbm5lY3Rpb25SZWFkeSgpIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEJyb2FkY2FzdCB0aGF0IHRoZSB7QGxpbmsgQ2hhdH0gaXMgY29ubmVjdGVkIHRvIHRoZSBuZXR3b3JrLlxuICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJjb25uZWN0ZWRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogY2hhdC5vbignJC5jb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnY2hhdCBpcyByZWFkeSB0byBnbyEnKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQuY29ubmVjdGVkJyk7XG5cbiAgICAgICAgICAgIC8vIGdldCBhIGxpc3Qgb2YgdXNlcnMgb25saW5lIG5vd1xuICAgICAgICAgICAgLy8gYXNrIFB1Yk51YiBmb3IgaW5mb3JtYXRpb24gYWJvdXQgY29ubmVjdGVkIHVzZXJzIGluIHRoaXMgY2hhbm5lbFxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuaGVyZU5vdyh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVVVUlEczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU3RhdGU6IHRydWVcbiAgICAgICAgICAgIH0sIHRoaXMub25IZXJlTm93KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgVGhpcyBpcyBvdXIgVXNlciBjbGFzcyB3aGljaCByZXByZXNlbnRzIGEgY29ubmVjdGVkIGNsaWVudC4gVXNlcidzIGFyZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkge0BsaW5rIENoYXR9cywgYnV0IHlvdSBjYW4gYWxzbyBpbnN0YW50aWF0ZSB0aGVtIHlvdXJzZWxmLlxuICAgIElmIGEgVXNlciBoYXMgYmVlbiBjcmVhdGVkIGJ1dCBoYXMgbmV2ZXIgYmVlbiBhdXRoZW50aWNhdGVkLCB5b3Ugd2lsbCByZWNpZXZlIDQwM3Mgd2hlbiBjb25uZWN0aW5nIHRvIHRoZWlyIGZlZWQgb3IgZGlyZWN0IENoYXRzLlxuICAgIEBjbGFzc1xuICAgIEBleHRlbmRzIEVtaXR0ZXJcbiAgICBAcGFyYW0gdXVpZFxuICAgIEBwYXJhbSBzdGF0ZVxuICAgIEBwYXJhbSBjaGF0XG4gICAgKi9cbiAgICBjbGFzcyBVc2VyIGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IodXVpZCwgc3RhdGUgPSB7fSwgY2hhdCA9IENoYXRFbmdpbmUuZ2xvYmFsKSB7XG5cbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgVGhlIFVzZXIncyB1bmlxdWUgaWRlbnRpZmllciwgdXN1YWxseSBhIGRldmljZSB1dWlkLiBUaGlzIGhlbHBzIENoYXRFbmdpbmUgaWRlbnRpZnkgdGhlIHVzZXIgYmV0d2VlbiBldmVudHMuIFRoaXMgaXMgcHVibGljIGlkIGV4cG9zZWQgdG8gdGhlIG5ldHdvcmsuXG4gICAgICAgICAgICBDaGVjayBvdXQgW3RoZSB3aWtpcGVkaWEgcGFnZSBvbiBVVUlEc10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pdmVyc2FsbHlfdW5pcXVlX2lkZW50aWZpZXIpLlxuXG4gICAgICAgICAgICBAcmVhZG9ubHlcbiAgICAgICAgICAgIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudXVpZCA9IHV1aWQ7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgQSBtYXAgb2YgdGhlIFVzZXIncyBzdGF0ZSBpbiBlYWNoIHtAbGluayBDaGF0fS4gU3RheXMgaW4gc3luYyBhdXRvbWF0aWNhbGx5LlxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5zdGF0ZXMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBDaGF0cyB0aGlzIHtAbGluayBVc2VyfSBpcyBjdXJyZW50bHkgaW4uIFRoZSBrZXkgb2YgZWFjaCBpdGVtIGluIHRoZSBvYmplY3QgaXMgdGhlIHtAbGluayBDaGF0LmNoYW5uZWx9IGFuZCB0aGUgdmFsdWUgaXMgdGhlIHtAbGluayBDaGF0fSBvYmplY3QuIE5vdGUgdGhhdCBmb3IgcHJpdmFjeSwgdGhpcyBtYXAgd2lsbCBvbmx5IGNvbnRhaW4ge0BsaW5rIENoYXR9cyB0aGF0IHRoZSBjbGllbnQgKHtAbGluayBNZX0pIGlzIGFsc28gY29ubmVjdGVkIHRvLlxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqe1xuICAgICAgICAgICAgKiAgICBcImdsb2JhbENoYW5uZWxcIjoge1xuICAgICAgICAgICAgKiAgICAgICAgY2hhbm5lbDogXCJnbG9iYWxDaGFubmVsXCIsXG4gICAgICAgICAgICAqICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgKiAgICAgICAgICAgIC8vLi4uXG4gICAgICAgICAgICAqICAgICAgICB9LFxuICAgICAgICAgICAgKiAgICB9LFxuICAgICAgICAgICAgKiAgICAvLyAuLi5cbiAgICAgICAgICAgICogfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hhdHMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZlZWQgaXMgYSBDaGF0IHRoYXQgb25seSBzdHJlYW1zIHRoaW5ncyBhIFVzZXIgZG9lcywgbGlrZVxuICAgICAgICAgICAgKiAnc3RhcnRUeXBpbmcnIG9yICdpZGxlJyBldmVudHMgZm9yIGV4YW1wbGUuIEFueWJvZHkgY2FuIHN1YnNjcmliZVxuICAgICAgICAgICAgKiB0byBhIFVzZXIncyBmZWVkLCBidXQgb25seSB0aGUgVXNlciBjYW4gcHVibGlzaCB0byBpdC4gVXNlcnMgd2lsbFxuICAgICAgICAgICAgKiBub3QgYmUgYWJsZSB0byBjb252ZXJzZSBpbiB0aGlzIGNoYW5uZWwuXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogLy8gbWVcbiAgICAgICAgICAgICogbWUuZmVlZC5lbWl0KCd1cGRhdGUnLCAnSSBtYXkgYmUgYXdheSBmcm9tIG15IGNvbXB1dGVyIHJpZ2h0IG5vdycpO1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBhbm90aGVyIGluc3RhbmNlXG4gICAgICAgICAgICAqIHRoZW0uZmVlZC5jb25uZWN0KCk7XG4gICAgICAgICAgICAqIHRoZW0uZmVlZC5vbigndXBkYXRlJywgKHBheWxvYWQpID0+IHt9KVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgLy8gZ3JhbnRzIGZvciB0aGVzZSBjaGF0cyBhcmUgZG9uZSBvbiBhdXRoLiBFdmVuIHRob3VnaCB0aGV5J3JlIG1hcmtlZCBwcml2YXRlLCB0aGV5IGFyZSBsb2NrZWQgZG93biB2aWEgdGhlIHNlcnZlclxuICAgICAgICAgICAgdGhpcy5mZWVkID0gbmV3IENoYXQoXG4gICAgICAgICAgICAgICAgW0NoYXRFbmdpbmUuZ2xvYmFsLmNoYW5uZWwsICd1c2VyJywgdXVpZCwgJ3JlYWQuJywgJ2ZlZWQnXS5qb2luKCcjJyksIGZhbHNlLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJNZVwiKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIERpcmVjdCBpcyBhIHByaXZhdGUgY2hhbm5lbCB0aGF0IGFueWJvZHkgY2FuIHB1Ymxpc2ggdG8gYnV0IG9ubHlcbiAgICAgICAgICAgICogdGhlIHVzZXIgY2FuIHN1YnNjcmliZSB0by4gR3JlYXQgZm9yIHB1c2hpbmcgbm90aWZpY2F0aW9ucyBvclxuICAgICAgICAgICAgKiBpbnZpdGluZyB0byBvdGhlciBjaGF0cy4gVXNlcnMgd2lsbCBub3QgYmUgYWJsZSB0byBjb21tdW5pY2F0ZVxuICAgICAgICAgICAgKiB3aXRoIG9uZSBhbm90aGVyIGluc2lkZSBvZiB0aGlzIGNoYXQuIENoZWNrIG91dCB0aGVcbiAgICAgICAgICAgICoge0BsaW5rIENoYXQjaW52aXRlfSBtZXRob2QgZm9yIHByaXZhdGUgY2hhdHMgdXRpbGl6aW5nXG4gICAgICAgICAgICAqIHtAbGluayBVc2VyI2RpcmVjdH0uXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogLy8gbWVcbiAgICAgICAgICAgICogbWUuZGlyZWN0Lm9uKCdwcml2YXRlLW1lc3NhZ2UnLCAocGF5bG9hZCkgLT4ge1xuICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2cocGF5bG9hZC5zZW5kZXIudXVpZCwgJ3NlbnQgeW91ciBhIGRpcmVjdCBtZXNzYWdlJyk7XG4gICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBhbm90aGVyIGluc3RhbmNlXG4gICAgICAgICAgICAqIHRoZW0uZGlyZWN0LmNvbm5lY3QoKTtcbiAgICAgICAgICAgICogdGhlbS5kaXJlY3QuZW1pdCgncHJpdmF0ZS1tZXNzYWdlJywge3NlY3JldDogNDJ9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmRpcmVjdCA9IG5ldyBDaGF0KFxuICAgICAgICAgICAgICAgIFtDaGF0RW5naW5lLmdsb2JhbC5jaGFubmVsLCAndXNlcicsIHV1aWQsICd3cml0ZS4nLCAnZGlyZWN0J10uam9pbignIycpLCBmYWxzZSwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lID09IFwiTWVcIik7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGRvZXMgbm90IGV4aXN0IGF0IGFsbCBhbmQgd2UgZ2V0IGVub3VnaFxuICAgICAgICAgICAgLy8gaW5mb3JtYXRpb24gdG8gYnVpbGQgdGhlIHVzZXJcbiAgICAgICAgICAgIGlmKCFDaGF0RW5naW5lLnVzZXJzW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiBpdCdzIGNyZWF0ZWQgY29udGV4dFxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEdldHMgdGhlIHVzZXIgc3RhdGUgaW4gYSB7QGxpbmsgQ2hhdH0uIFNlZSB7QGxpbmsgTWUjdXBkYXRlfSBmb3IgaG93IHRvIGFzc2lnbiBzdGF0ZSB2YWx1ZXMuXG4gICAgICAgICogQHBhcmFtIHtDaGF0fSBjaGF0IENoYXRyb29tIHRvIHJldHJpZXZlIHN0YXRlIGZyb21cbiAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYSBnZW5lcmljIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgc3RhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgKlxuICAgICAgICAqIC8vIEdsb2JhbCBTdGF0ZVxuICAgICAgICAqIGxldCBnbG9iYWxTdGF0ZSA9IHVzZXIuc3RhdGUoKTtcbiAgICAgICAgKlxuICAgICAgICAqIC8vIFN0YXRlIGluIHNvbWUgY2hhbm5lbFxuICAgICAgICAqIGxldCBzb21lQ2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQoJ3NvbWUtY2hhbm5lbCcpO1xuICAgICAgICAqIGxldCBzb21lQ2hhdFN0YXRlID0gdXNlci5zdGF0ZShzb21lQ2hhdCk7c1xuICAgICAgICAqL1xuICAgICAgICBzdGF0ZShjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlc1tjaGF0LmNoYW5uZWxdIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSBmb3IgdGhlIHVzZXJcbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQ2hhdHJvb20gdG8gcmV0cmlldmUgc3RhdGUgZnJvbVxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGUoc3RhdGUsIGNoYXQgPSBDaGF0RW5naW5lLmdsb2JhbCkge1xuICAgICAgICAgICAgbGV0IGNoYXRTdGF0ZSA9IHRoaXMuc3RhdGUoY2hhdCkgfHwge307XG4gICAgICAgICAgICB0aGlzLnN0YXRlc1tjaGF0LmNoYW5uZWxdID0gT2JqZWN0LmFzc2lnbihjaGF0U3RhdGUsIHN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICB0aGlzIGlzIG9ubHkgY2FsbGVkIGZyb20gbmV0d29yayB1cGRhdGVzXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgKi9cbiAgICAgICAgYXNzaWduKHN0YXRlLCBjaGF0KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgYWRkcyBhIGNoYXQgdG8gdGhpcyB1c2VyXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgKi9cbiAgICAgICAgYWRkQ2hhdChjaGF0LCBzdGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2hhdCBpbiB0aGlzIHVzZXIgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLmNoYXRzW2NoYXQuY2hhbm5lbF0gPSBjaGF0O1xuXG4gICAgICAgICAgICAvLyB1cGRhdGVzIHRoZSB1c2VyJ3Mgc3RhdGUgaW4gdGhhdCBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBSZXByZXNlbnRzIHRoZSBjbGllbnQgY29ubmVjdGlvbiBhcyBhIHNwZWNpYWwge0BsaW5rIFVzZXJ9IHdpdGggd3JpdGUgcGVybWlzc2lvbnMuXG4gICAgSGFzIHRoZSBhYmlsaXR5IHRvIHVwZGF0ZSBpdCdzIHN0YXRlIG9uIHRoZSBuZXR3b3JrLiBBbiBpbnN0YW5jZSBvZlxuICAgIHtAbGluayBNZX0gaXMgcmV0dXJuZWQgYnkgdGhlIGBgYENoYXRFbmdpbmUuY29ubmVjdCgpYGBgXG4gICAgbWV0aG9kLlxuXG4gICAgQGNsYXNzIE1lXG4gICAgQHBhcmFtIHtTdHJpbmd9IHV1aWQgVGhlIHV1aWQgb2YgdGhpcyB1c2VyXG4gICAgQGV4dGVuZHMgVXNlclxuICAgICovXG4gICAgY2xhc3MgTWUgZXh0ZW5kcyBVc2VyIHtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih1dWlkLCBhdXRoRGF0YSkge1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBVc2VyIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBzdXBlcih1dWlkKTtcblxuICAgICAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBhc3NpZ24gdXBkYXRlcyBmcm9tIG5ldHdvcmtcbiAgICAgICAgYXNzaWduKHN0YXRlLCBjaGF0KSB7XG4gICAgICAgICAgICAvLyB3ZSBjYWxsIFwidXBkYXRlXCIgYmVjYXVzZSBjYWxsaW5nIFwic3VwZXIuYXNzaWduXCJcbiAgICAgICAgICAgIC8vIHdpbGwgZGlyZWN0IGJhY2sgdG8gXCJ0aGlzLnVwZGF0ZVwiIHdoaWNoIGNyZWF0ZXNcbiAgICAgICAgICAgIC8vIGEgbG9vcCBvZiBuZXR3b3JrIHVwZGF0ZXNcbiAgICAgICAgICAgIHN1cGVyLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFVwZGF0ZSB7QGxpbmsgTWV9J3Mgc3RhdGUgaW4gYSB7QGxpbmsgQ2hhdH0uIEFsbCB7QGxpbmsgVXNlcn1zIGluXG4gICAgICAgICogdGhlIHtAbGluayBDaGF0fSB3aWxsIGJlIG5vdGlmaWVkIG9mIHRoaXMgY2hhbmdlIHZpYSAoJC51cGRhdGUpW0NoYXQuaHRtbCNldmVudDokJTI1MjIuJTI1MjJzdGF0ZV0uXG4gICAgICAgICogUmV0cmlldmUgc3RhdGUgYXQgYW55IHRpbWUgd2l0aCB7QGxpbmsgVXNlciNzdGF0ZX0uXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSBuZXcgc3RhdGUgZm9yIHtAbGluayBNZX1cbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQW4gaW5zdGFuY2Ugb2YgdGhlIHtAbGluayBDaGF0fSB3aGVyZSBzdGF0ZSB3aWxsIGJlIHVwZGF0ZWQuXG4gICAgICAgICogRGVmYXVsdHMgdG8gYGBgQ2hhdEVuZ2luZS5nbG9iYWxgYGAuXG4gICAgICAgICogQGZpcmVzIENoYXQjZXZlbnQ6JFwiLlwic3RhdGVcbiAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAqIC8vIHVwZGF0ZSBnbG9iYWwgc3RhdGVcbiAgICAgICAgKiBtZS51cGRhdGUoe3ZhbHVlOiB0cnVlfSk7XG4gICAgICAgICpcbiAgICAgICAgKiAvLyB1cGRhdGUgc3RhdGUgaW4gc3BlY2lmaWMgY2hhdFxuICAgICAgICAqIGxldCBjaGF0ID0gbmV3IENoYXRFbmdpbmUuQ2hhdCgnc29tZS1jaGF0Jyk7XG4gICAgICAgICogbWUudXBkYXRlKHt2YWx1ZTogdHJ1ZX0sIGNoYXQpO1xuICAgICAgICAqL1xuICAgICAgICB1cGRhdGUoc3RhdGUsIGNoYXQgPSBDaGF0RW5naW5lLmdsb2JhbCkge1xuXG4gICAgICAgICAgICAvLyBydW4gdGhlIHJvb3QgdXBkYXRlIGZ1bmN0aW9uXG4gICAgICAgICAgICBzdXBlci51cGRhdGUoc3RhdGUsIGNoYXQpO1xuXG4gICAgICAgICAgICAvLyBwdWJsaXNoIHRoZSB1cGRhdGUgb3ZlciB0aGUgZ2xvYmFsIGNoYW5uZWxcbiAgICAgICAgICAgIGNoYXQuc2V0U3RhdGUoc3RhdGUpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgIFByb3ZpZGVzIHRoZSBiYXNlIFdpZGdldCBjbGFzcy4uLlxuXG4gICAgQGNsYXNzIENoYXRFbmdpbmVcbiAgICBAZXh0ZW5kcyBSb290RW1pdHRlclxuICAgICAqL1xuICAgIGNvbnN0IGluaXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIHJvb3QgQ2hhdEVuZ2luZSBvYmplY3RcbiAgICAgICAgQ2hhdEVuZ2luZSA9IG5ldyBSb290RW1pdHRlcjtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBBIG1hcCBvZiBhbGwga25vd24ge0BsaW5rIFVzZXJ9cyBpbiB0aGlzIGluc3RhbmNlIG9mIENoYXRFbmdpbmVcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLnVzZXJzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQSBtYXAgb2YgYWxsIGtub3duIHtAbGluayBDaGF0fXMgaW4gdGhpcyBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5jaGF0cyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEEgZ2xvYmFsIHtAbGluayBDaGF0fSB0aGF0IGFsbCB7QGxpbmsgVXNlcn1zIGpvaW4gd2hlbiB0aGV5IGNvbm5lY3QgdG8gQ2hhdEVuZ2luZS4gVXNlZnVsIGZvciBhbm5vdW5jZW1lbnRzLCBhbGVydHMsIGFuZCBnbG9iYWwgZXZlbnRzLlxuICAgICAgICAqIEBtZW1iZXIge0NoYXR9IGdsb2JhbFxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUuZ2xvYmFsID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVGhpcyBpbnN0YW5jZSBvZiBDaGF0RW5naW5lIHJlcHJlc2VudGVkIGFzIGEgc3BlY2lhbCB7QGxpbmsgVXNlcn0ga25vdyBhcyB7QGxpbmsgTWV9XG4gICAgICAgICogQG1lbWJlciB7TWV9IG1lXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5tZSA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEFuIGluc3RhbmNlIG9mIFB1Yk51YiwgdGhlIG5ldHdvcmtpbmcgaW5mcmFzdHJ1Y3R1cmUgdGhhdCBwb3dlcnMgdGhlIHJlYWx0aW1lIGNvbW11bmljYXRpb24gYmV0d2VlbiB7QGxpbmsgVXNlcn1zIGluIHtAbGluayBDaGF0c30uXG4gICAgICAgICogQG1lbWJlciB7T2JqZWN0fSBwdWJudWJcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLnB1Ym51YiA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEluZGljYXRlcyBpZiBDaGF0RW5naW5lIGhhcyBmaXJlZCB0aGUge0BsaW5rIENoYXRFbmdpbmUjJFwiLlwicmVhZHl9IGV2ZW50XG4gICAgICAgICogQG1lbWJlciB7T2JqZWN0fSByZWFkeVxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUucmVhZHkgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBDb25uZWN0IHRvIHJlYWx0aW1lIHNlcnZpY2UgYW5kIGNyZWF0ZSBpbnN0YW5jZSBvZiB7QGxpbmsgTWV9XG4gICAgICAgICogQG1ldGhvZCBDaGF0RW5naW5lI2Nvbm5lY3RcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBBIHVuaXF1ZSBzdHJpbmcgZm9yIHtAbGluayBNZX0uIEl0IGNhbiBiZSBhIGRldmljZSBpZCwgdXNlcm5hbWUsIHVzZXIgaWQsIGVtYWlsLCBldGMuXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgY2xpZW50ICh7QGxpbmsgTWV9KS4gVGhpcyBKU09OIG9iamVjdCBpcyBzZW50IHRvIGFsbCBvdGhlciBjbGllbnRzIG9uIHRoZSBuZXR3b3JrLCBzbyBubyBwYXNzd29yZHMhXG4gICAgICAgICogKiBAcGFyYW0ge1N0cnVuZ30gYXV0aEtleSBBIGF1dGhlbnRpY2F0aW9uIHNlY3JldC4gV2lsbCBiZSBzZW50IHRvIGF1dGhlbnRpY2F0aW9uIGJhY2tlbmQgZm9yIHZhbGlkYXRpb24uIFRoaXMgaXMgdXN1YWxseSBhbiBhY2Nlc3MgdG9rZW4gb3IgcGFzc3dvcmQuIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gVVVJRCBhcyBhIHVzZXIgY2FuIGhhdmUgYSBzaW5nbGUgVVVJRCBidXQgbXVsdGlwbGUgYXV0aCBrZXlzLlxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXV0aERhdGFdIEFkZGl0aW9uYWwgZGF0YSB0byBzZW5kIHRvIHRoZSBhdXRoZW50aWNhdGlvbiBlbmRwb2ludC4gTm90IHVzZWQgYnkgQ2hhdEVuZ2luZSBTREsuXG4gICAgICAgICogQGZpcmVzICRcIi5cImNvbm5lY3RlZFxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLmNvbm5lY3QgPSBmdW5jdGlvbih1dWlkLCBzdGF0ZSA9IHt9LCBhdXRoS2V5ID0gZmFsc2UsIGF1dGhEYXRhKSB7XG5cbiAgICAgICAgICAgIC8vIHRoaXMgY3JlYXRlcyBhIHVzZXIga25vd24gYXMgTWUgYW5kXG4gICAgICAgICAgICAvLyBjb25uZWN0cyB0byB0aGUgZ2xvYmFsIGNoYXRyb29tXG5cbiAgICAgICAgICAgIHBuQ29uZmlnLnV1aWQgPSB1dWlkO1xuXG4gICAgICAgICAgICBsZXQgY29tcGxldGUgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnB1Ym51YiA9IG5ldyBQdWJOdWIocG5Db25maWcpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGNoYXQgdG8gdXNlIGFzIGdsb2JhbCBjaGF0XG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgZG8gYXV0aCBvbiB0aGlzIG9uZSBiZWNhdXNlaXQncyBhc3N1bWVkIHRvIGJlIGRvbmUgd2l0aCB0aGUgL2F1dGggcmVxdWVzdCBiZWxvd1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsID0gbmV3IENoYXQoY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IHVzZXIgdGhhdCByZXByZXNlbnRzIHRoaXMgY2xpZW50XG4gICAgICAgICAgICAgICAgdGhpcy5tZSA9IG5ldyBNZShwbkNvbmZpZy51dWlkLCBhdXRoRGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgTWUgdXNpbmcgaW5wdXQgcGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsLmNyZWF0ZVVzZXIocG5Db25maWcudXVpZCwgc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tZS51cGRhdGUoc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogRmlyZWQgd2hlbiBDaGF0RW5naW5lIGlzIGNvbm5lY3RlZCB0byB0aGUgaW50ZXJuZXQgYW5kIHJlYWR5IHRvIGdvIVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cInJlYWR5XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWwub24oJyQuY29ubmVjdGVkJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoJyQucmVhZHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZTogdGhpcy5tZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG5cblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgIEZpcmVzIHdoZW4gUHViTnViIG5ldHdvcmsgY29ubmVjdGlvbiBjaGFuZ2VzXG5cbiAgICAgICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgICAgIEBwYXJhbSB7T2JqZWN0fSBzdGF0dXNFdmVudCBUaGUgcmVzcG9uc2Ugc3RhdHVzXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnB1Ym51Yi5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogKHN0YXR1c0V2ZW50KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTREsgZGV0ZWN0ZWQgdGhhdCBuZXR3b3JrIGlzIG9ubGluZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwidXBcIi5cIm9ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNESyBkZXRlY3RlZCB0aGF0IG5ldHdvcmsgaXMgZG93bi5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwib2ZmbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEEgc3Vic2NyaWJlIGV2ZW50IGV4cGVyaWVuY2VkIGFuIGV4Y2VwdGlvbiB3aGVuIHJ1bm5pbmcuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cImlzc3VlXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogU0RLIHdhcyBhYmxlIHRvIHJlY29ubmVjdCB0byBwdWJudWIuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cInVwXCIuXCJyZWNvbm5lY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNESyBzdWJzY3JpYmVkIHdpdGggYSBuZXcgbWl4IG9mIGNoYW5uZWxzLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJ1cFwiLlwiY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogSlNPTiBwYXJzaW5nIGNyYXNoZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cIm1hbGZvcm1lZFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNlcnZlciByZWplY3RlZCB0aGUgcmVxdWVzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwiYmFkcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIElmIHVzaW5nIGRlY3J5cHRpb24gc3RyYXRlZ2llcyBhbmQgdGhlIGRlY3J5cHRpb24gZmFpbHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cImRlY3J5cHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBSZXF1ZXN0IHRpbWVkIG91dC5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwidGltZW91dFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFBBTSBwZXJtaXNzaW9uIGZhaWx1cmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cImRlbmllZFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFwIHRoZSBwdWJudWIgZXZlbnRzIGludG8gY2hhdCBlbmdpbmUgZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTk5ldHdvcmtVcENhdGVnb3J5JzogJ3VwLm9ubGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOTmV0d29ya0Rvd25DYXRlZ29yeSc6ICdkb3duLm9mZmxpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeSc6ICdkb3duLmlzc3VlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5SZWNvbm5lY3RlZENhdGVnb3J5JzogJ3VwLnJlY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5Db25uZWN0ZWRDYXRlZ29yeSc6ICd1cC5jb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkFjY2Vzc0RlbmllZENhdGVnb3J5JzogJ2Rvd24uZGVuaWVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5NYWxmb3JtZWRSZXNwb25zZUNhdGVnb3J5JzogJ2Rvd24ubWFsZm9ybWVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5CYWRSZXF1ZXN0Q2F0ZWdvcnknOiAnZG93bi5iYWRyZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5EZWNyeXB0aW9uRXJyb3JDYXRlZ29yeSc6ICdkb3duLmRlY3J5cHRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTlRpbWVvdXRDYXRlZ29yeSc6ICdkb3duLnRpbWVvdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnROYW1lID0gWyckJywgJ25ldHdvcmsnLCBtYXBbc3RhdHVzRXZlbnQuY2F0ZWdvcnldfHwgJ3VuZGVmaW5lZCddLmpvaW4oJy4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RhdHVzRXZlbnQuYWZmZWN0ZWRDaGFubmVscykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzRXZlbnQuYWZmZWN0ZWRDaGFubmVscy5mb3JFYWNoKChjaGFubmVsKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoYXQgPSBDaGF0RW5naW5lLmNoYXRzW2NoYW5uZWxdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNoYXQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29ubmVjdGVkIGNhdGVnb3J5IHRlbGxzIHVzIHRoZSBjaGF0IGlzIHJlYWR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzRXZlbnQuY2F0ZWdvcnkgPT09IFwiUE5Db25uZWN0ZWRDYXRlZ29yeVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC5vbkNvbm5lY3Rpb25SZWFkeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBuZXR3b3JrIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKGV2ZW50TmFtZSwgc3RhdHVzRXZlbnQpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW1pdChldmVudE5hbWUsIHN0YXR1c0V2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnROYW1lLCBzdGF0dXNFdmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihjZUNvbmZpZy5pbnNlY3VyZSkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcG5Db25maWcuYXV0aEtleSA9IGF1dGhLZXk7XG5cblxuXG4gICAgICAgICAgICAgICAgYXhpb3MucG9zdChjZUNvbmZpZy5hdXRoVXJsICsgJy9hdXRoJywge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBwbkNvbmZpZy51dWlkLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiBjZUNvbmZpZy5nbG9iYWxDaGFubmVsLFxuICAgICAgICAgICAgICAgICAgICBhdXRoRGF0YTogdGhpcy5tZS5hdXRoRGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAqIFRoZXJlIHdhcyBhIHByb2JsZW0gbG9nZ2luZyBpblxuICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cImVycm9yXCIuXCJhdXRoXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ19lbWl0JywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gbG9nZ2luZyBpbnRvIHRoZSBhdXRoIHNlcnZlciAoJytjZUNvbmZpZy5hdXRoVXJsKycpLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVGhlIHtAbGluayBDaGF0fSBjbGFzcy5cbiAgICAgICAgKiBAbWVtYmVyIHtDaGF0fSBDaGF0XG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKiBAc2VlIHtAbGluayBDaGF0fVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLkNoYXQgPSBDaGF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoZSB7QGxpbmsgVXNlcn0gY2xhc3MuXG4gICAgICAgICogQG1lbWJlciB7VXNlcn0gVXNlclxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICogQHNlZSB7QGxpbmsgVXNlcn1cbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5Vc2VyID0gVXNlcjtcblxuICAgICAgICAvLyBhZGQgYW4gb2JqZWN0IGFzIGEgc3Vib2JqZWN0IHVuZGVyIGEgbmFtZXNwb2FjZVxuICAgICAgICBDaGF0RW5naW5lLmFkZENoaWxkID0gKG9iLCBjaGlsZE5hbWUsIGNoaWxkT2IpID0+IHtcblxuICAgICAgICAgICAgLy8gYXNzaWduIHRoZSBuZXcgY2hpbGQgb2JqZWN0IGFzIGEgcHJvcGVydHkgb2YgcGFyZW50IHVuZGVyIHRoZVxuICAgICAgICAgICAgLy8gZ2l2ZW4gbmFtZXNwYWNlXG4gICAgICAgICAgICBvYltjaGlsZE5hbWVdID0gY2hpbGRPYjtcblxuICAgICAgICAgICAgLy8gdGhlIG5ldyBvYmplY3QgY2FuIHVzZSBgYGB0aGlzLnBhcmVudGBgYCB0byBhY2Nlc3NcbiAgICAgICAgICAgIC8vIHRoZSByb290IGNsYXNzXG4gICAgICAgICAgICBjaGlsZE9iLnBhcmVudCA9IG9iO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQ2hhdEVuZ2luZTtcblxuICAgIH1cblxuICAgIC8vIHJldHVybiBhbiBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgcmV0dXJuIGluaXQoKTtcblxufVxuXG4vLyBleHBvcnQgdGhlIENoYXRFbmdpbmUgYXBpXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwbHVnaW46IHt9LCAgLy8gbGVhdmUgYSBzcG90IGZvciBwbHVnaW5zIHRvIGV4aXN0XG4gICAgY3JlYXRlOiBjcmVhdGVcbn07XG4iXX0=
