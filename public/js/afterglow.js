(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/index.js":[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/axios.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/adapters/xhr.js":[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa) || require('./../helpers/btoa');

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
      if (request.status === 0) {
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
      reject(createError('Network Error', config));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

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
        if (request.responseType !== 'json') {
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


    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))

},{"../core/createError":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/createError.js","./../core/settle":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/settle.js","./../helpers/btoa":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/btoa.js","./../helpers/buildURL":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/buildURL.js","./../helpers/cookies":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/cookies.js","./../helpers/isURLSameOrigin":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/isURLSameOrigin.js","./../helpers/parseHeaders":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/parseHeaders.js","./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js","_process":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/process/browser.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/axios.js":[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');

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
var axios = createInstance();

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(defaultConfig) {
  return createInstance(defaultConfig);
};

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./core/Axios":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/Axios.js","./helpers/bind":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/bind.js","./helpers/spread":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/spread.js","./utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/Axios.js":[function(require,module,exports){
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
 * @param {Object} defaultConfig The default config for the instance
 */
function Axios(defaultConfig) {
  this.defaults = utils.merge(defaults, defaultConfig);
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
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
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

},{"./../defaults":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/defaults.js","./../helpers/combineURLs":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/combineURLs.js","./../helpers/isAbsoluteURL":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/isAbsoluteURL.js","./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js","./InterceptorManager":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/InterceptorManager.js","./dispatchRequest":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/dispatchRequest.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/InterceptorManager.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/createError.js":[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, response);
};

},{"./enhanceError":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/enhanceError.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/dispatchRequest.js":[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');

/**
 * Dispatch a request to the server using whichever adapter
 * is supported by the current environment.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
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

  var adapter;

  if (typeof config.adapter === 'function') {
    // For custom adapter support
    adapter = config.adapter;
  } else if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('../adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('../adapters/http');
  }

  return Promise.resolve(config)
    // Wrap synchronous adapter errors and pass configuration
    .then(adapter)
    .then(function onFulfilled(response) {
      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onRejected(error) {
      // Transform response data
      if (error && error.response) {
        error.response.data = transformData(
          error.response.data,
          error.response.headers,
          config.transformResponse
        );
      }

      return Promise.reject(error);
    });
};

}).call(this,require('_process'))

},{"../adapters/http":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/adapters/xhr.js","../adapters/xhr":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/adapters/xhr.js","./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js","./transformData":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/transformData.js","_process":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/process/browser.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/enhanceError.js":[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.response = response;
  return error;
};

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/settle.js":[function(require,module,exports){
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
      response
    ));
  }
};

},{"./createError":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/createError.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/core/transformData.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/defaults.js":[function(require,module,exports){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var PROTECTION_PREFIX = /^\)\]\}',?\n/;
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

module.exports = {
  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
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
      data = data.replace(PROTECTION_PREFIX, '');
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    },
    patch: utils.merge(DEFAULT_CONTENT_TYPE),
    post: utils.merge(DEFAULT_CONTENT_TYPE),
    put: utils.merge(DEFAULT_CONTENT_TYPE)
  },

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

},{"./helpers/normalizeHeaderName":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/normalizeHeaderName.js","./utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/bind.js":[function(require,module,exports){
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

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/btoa.js":[function(require,module,exports){
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

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/buildURL.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/combineURLs.js":[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
};

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/cookies.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/isAbsoluteURL.js":[function(require,module,exports){
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

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/isURLSameOrigin.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/normalizeHeaderName.js":[function(require,module,exports){
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

},{"../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/parseHeaders.js":[function(require,module,exports){
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

},{"./../utils":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/spread.js":[function(require,module,exports){
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

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/utils.js":[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');

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
 *  typeof document.createElement -> undefined
 */
function isStandardBrowserEnv() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
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
      if (obj.hasOwnProperty(key)) {
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

},{"./helpers/bind":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/lib/helpers/bind.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/browser-jsonp/lib/jsonp.js":[function(require,module,exports){
(function() {
  var JSONP, computedUrl, createElement, encode, noop, objectToURI, random, randomString;

  createElement = function(tag) {
    return window.document.createElement(tag);
  };

  encode = window.encodeURIComponent;

  random = Math.random;

  JSONP = function(options) {
    var callback, callbackFunc, callbackName, done, head, params, script;
    if (options == null) {
      options = {};
    }
    params = {
      data: options.data || {},
      error: options.error || noop,
      success: options.success || noop,
      beforeSend: options.beforeSend || noop,
      complete: options.complete || noop,
      url: options.url || ''
    };
    params.computedUrl = computedUrl(params);
    if (params.url.length === 0) {
      throw new Error('MissingUrl');
    }
    done = false;
    if (params.beforeSend({}, params) !== false) {
      callbackName = options.callbackName || 'callback';
      callbackFunc = options.callbackFunc || 'jsonp_' + randomString(15);
      callback = params.data[callbackName] = callbackFunc;
      window[callback] = function(data) {
        window[callback] = null;
        params.success(data, params);
        return params.complete(data, params);
      };
      script = createElement('script');
      script.src = computedUrl(params);
      script.async = true;
      script.onerror = function(evt) {
        params.error({
          url: script.src,
          event: evt
        });
        return params.complete({
          url: script.src,
          event: evt
        }, params);
      };
      script.onload = script.onreadystatechange = function() {
        var ref, ref1;
        if (done || ((ref = this.readyState) !== 'loaded' && ref !== 'complete')) {
          return;
        }
        done = true;
        if (script) {
          script.onload = script.onreadystatechange = null;
          if ((ref1 = script.parentNode) != null) {
            ref1.removeChild(script);
          }
          return script = null;
        }
      };
      head = window.document.getElementsByTagName('head')[0] || window.document.documentElement;
      head.insertBefore(script, head.firstChild);
    }
    return {
      abort: function() {
        window[callback] = function() {
          return window[callback] = null;
        };
        done = true;
        if (script != null ? script.parentNode : void 0) {
          script.onload = script.onreadystatechange = null;
          script.parentNode.removeChild(script);
          return script = null;
        }
      }
    };
  };

  noop = function() {
    return void 0;
  };

  computedUrl = function(params) {
    var url;
    url = params.url;
    url += params.url.indexOf('?') < 0 ? '?' : '&';
    url += objectToURI(params.data);
    return url;
  };

  randomString = function(length) {
    var str;
    str = '';
    while (str.length < length) {
      str += random().toString(36).slice(2, 3);
    }
    return str;
  };

  objectToURI = function(obj) {
    var data, key, value;
    data = (function() {
      var results;
      results = [];
      for (key in obj) {
        value = obj[key];
        results.push(encode(key) + '=' + encode(value));
      }
      return results;
    })();
    return data.join('&');
  };

  if (typeof define !== "undefined" && define !== null ? define.amd : void 0) {
    define(function() {
      return JSONP;
    });
  } else if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = JSONP;
  } else {
    this.JSONP = JSONP;
  }

}).call(this);

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-clone/index.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var type;
try {
  type = require('component-type');
} catch (_) {
  type = require('type');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

},{"component-type":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-type/index.js","type":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-type/index.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-emitter/index.js":[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-raf/index.js":[function(require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-tween/index.js":[function(require,module,exports){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var clone = require('clone');
var type = require('type');
var ease = require('ease');

/**
 * Expose `Tween`.
 */

module.exports = Tween;

/**
 * Initialize a new `Tween` with `obj`.
 *
 * @param {Object|Array} obj
 * @api public
 */

function Tween(obj) {
  if (!(this instanceof Tween)) return new Tween(obj);
  this._from = obj;
  this.ease('linear');
  this.duration(500);
}

/**
 * Mixin emitter.
 */

Emitter(Tween.prototype);

/**
 * Reset the tween.
 *
 * @api public
 */

Tween.prototype.reset = function(){
  this.isArray = 'array' === type(this._from);
  this._curr = clone(this._from);
  this._done = false;
  this._start = Date.now();
  return this;
};

/**
 * Tween to `obj` and reset internal state.
 *
 *    tween.to({ x: 50, y: 100 })
 *
 * @param {Object|Array} obj
 * @return {Tween} self
 * @api public
 */

Tween.prototype.to = function(obj){
  this.reset();
  this._to = obj;
  return this;
};

/**
 * Set duration to `ms` [500].
 *
 * @param {Number} ms
 * @return {Tween} self
 * @api public
 */

Tween.prototype.duration = function(ms){
  this._duration = ms;
  return this;
};

/**
 * Set easing function to `fn`.
 *
 *    tween.ease('in-out-sine')
 *
 * @param {String|Function} fn
 * @return {Tween}
 * @api public
 */

Tween.prototype.ease = function(fn){
  fn = 'function' == typeof fn ? fn : ease[fn];
  if (!fn) throw new TypeError('invalid easing function');
  this._ease = fn;
  return this;
};

/**
 * Stop the tween and immediately emit "stop" and "end".
 *
 * @return {Tween}
 * @api public
 */

Tween.prototype.stop = function(){
  this.stopped = true;
  this._done = true;
  this.emit('stop');
  this.emit('end');
  return this;
};

/**
 * Perform a step.
 *
 * @return {Tween} self
 * @api private
 */

Tween.prototype.step = function(){
  if (this._done) return;

  // duration
  var duration = this._duration;
  var now = Date.now();
  var delta = now - this._start;
  var done = delta >= duration;

  // complete
  if (done) {
    this._from = this._to;
    this._update(this._to);
    this._done = true;
    this.emit('end');
    return this;
  }

  // tween
  var from = this._from;
  var to = this._to;
  var curr = this._curr;
  var fn = this._ease;
  var p = (now - this._start) / duration;
  var n = fn(p);

  // array
  if (this.isArray) {
    for (var i = 0; i < from.length; ++i) {
      curr[i] = from[i] + (to[i] - from[i]) * n;
    }

    this._update(curr);
    return this;
  }

  // objech
  for (var k in from) {
    curr[k] = from[k] + (to[k] - from[k]) * n;
  }

  this._update(curr);
  return this;
};

/**
 * Set update function to `fn` or
 * when no argument is given this performs
 * a "step".
 *
 * @param {Function} fn
 * @return {Tween} self
 * @api public
 */

Tween.prototype.update = function(fn){
  if (0 == arguments.length) return this.step();
  this._update = fn;
  return this;
};
},{"clone":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-clone/index.js","ease":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/ease-component/index.js","emitter":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-emitter/index.js","type":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-type/index.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-type/index.js":[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/corslite/corslite.js":[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/ease-component/index.js":[function(require,module,exports){

// easing functions from "Tween.js"

exports.linear = function(n){
  return n;
};

exports.inQuad = function(n){
  return n * n;
};

exports.outQuad = function(n){
  return n * (2 - n);
};

exports.inOutQuad = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return - 0.5 * (--n * (n - 2) - 1);
};

exports.inCube = function(n){
  return n * n * n;
};

exports.outCube = function(n){
  return --n * n * n + 1;
};

exports.inOutCube = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2 ) * n * n + 2);
};

exports.inQuart = function(n){
  return n * n * n * n;
};

exports.outQuart = function(n){
  return 1 - (--n * n * n * n);
};

exports.inOutQuart = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

exports.inQuint = function(n){
  return n * n * n * n * n;
}

exports.outQuint = function(n){
  return --n * n * n * n * n + 1;
}

exports.inOutQuint = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

exports.inSine = function(n){
  return 1 - Math.cos(n * Math.PI / 2 );
};

exports.outSine = function(n){
  return Math.sin(n * Math.PI / 2);
};

exports.inOutSine = function(n){
  return .5 * (1 - Math.cos(Math.PI * n));
};

exports.inExpo = function(n){
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

exports.outExpo = function(n){
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

exports.inOutExpo = function(n){
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

exports.inCirc = function(n){
  return 1 - Math.sqrt(1 - n * n);
};

exports.outCirc = function(n){
  return Math.sqrt(1 - (--n * n));
};

exports.inOutCirc = function(n){
  n *= 2
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

exports.inBack = function(n){
  var s = 1.70158;
  return n * n * (( s + 1 ) * n - s);
};

exports.outBack = function(n){
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

exports.inOutBack = function(n){
  var s = 1.70158 * 1.525;
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );
};

exports.inBounce = function(n){
  return 1 - exports.outBounce(1 - n);
};

exports.outBounce = function(n){
  if ( n < ( 1 / 2.75 ) ) {
    return 7.5625 * n * n;
  } else if ( n < ( 2 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;
  } else if ( n < ( 2.5 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;
  } else {
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;
  }
};

exports.inOutBounce = function(n){
  if (n < .5) return exports.inBounce(n * 2) * .5;
  return exports.outBounce(n * 2 - 1) * .5 + .5;
};

// aliases

exports['in-quad'] = exports.inQuad;
exports['out-quad'] = exports.outQuad;
exports['in-out-quad'] = exports.inOutQuad;
exports['in-cube'] = exports.inCube;
exports['out-cube'] = exports.outCube;
exports['in-out-cube'] = exports.inOutCube;
exports['in-quart'] = exports.inQuart;
exports['out-quart'] = exports.outQuart;
exports['in-out-quart'] = exports.inOutQuart;
exports['in-quint'] = exports.inQuint;
exports['out-quint'] = exports.outQuint;
exports['in-out-quint'] = exports.inOutQuint;
exports['in-sine'] = exports.inSine;
exports['out-sine'] = exports.outSine;
exports['in-out-sine'] = exports.inOutSine;
exports['in-expo'] = exports.inExpo;
exports['out-expo'] = exports.outExpo;
exports['in-out-expo'] = exports.inOutExpo;
exports['in-circ'] = exports.inCirc;
exports['out-circ'] = exports.outCirc;
exports['in-out-circ'] = exports.inOutCirc;
exports['in-back'] = exports.inBack;
exports['out-back'] = exports.outBack;
exports['in-out-back'] = exports.inOutBack;
exports['in-bounce'] = exports.inBounce;
exports['out-bounce'] = exports.outBounce;
exports['in-out-bounce'] = exports.inOutBounce;

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js":[function(require,module,exports){
/*!
 * jQuery JavaScript Library v3.1.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2016-09-22T22:30Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};



	function DOMEval( code, doc ) {
		doc = doc || document;

		var script = doc.createElement( "script" );

		script.text = code;
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.1.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE <=9 - 11, Edge 12 - 13
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Simple selector that can be filtered directly, removing non-Elements
	if ( risSimple.test( qualifier ) ) {
		return jQuery.filter( qualifier, elements, not );
	}

	// Complex selector, compare the two sets, removing non-Elements
	qualifier = jQuery.filter( qualifier, elements );
	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			resolve.call( undefined, value );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.call( undefined, value );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( jQuery.isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								jQuery.isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ jQuery.camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ jQuery.camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( jQuery.camelCase );
			} else {
				key = jQuery.camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && jQuery.nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: jQuery.isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

function manipulationTarget( elem, content ) {
	if ( jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		div.style.cssText =
			"box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";
		div.innerHTML = "";
		documentElement.appendChild( container );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = divStyle.marginLeft === "2px";
		boxSizingReliableVal = divStyle.width === "4px";

		// Support: Android 4.0 - 4.3 only
		// Some styles come back with percentage values, even though they shouldn't
		div.style.marginRight = "50%";
		pixelMarginRightVal = divStyle.marginRight === "4px";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	container.appendChild( div );

	jQuery.extend( support, {
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelMarginRight: function() {
			computeStyleTests();
			return pixelMarginRightVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE <=9 only
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i,
		val = 0;

	// If we already have the right measurement, avoid augmentation
	if ( extra === ( isBorderBox ? "border" : "content" ) ) {
		i = 4;

	// Otherwise initialize for horizontal or vertical properties
	} else {
		i = name === "width" ? 1 : 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val,
		valueIsBorderBox = true,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Support: IE <=11 only
	// Running getBoundingClientRect on a disconnected node
	// in IE throws an error.
	if ( elem.getClientRects().length ) {
		val = elem.getBoundingClientRect()[ name ];
	}

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = extra && getStyles( elem ),
				subtract = extra && augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				);

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ name ] = value;
				value = jQuery.css( elem, name );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function raf() {
	if ( timerId ) {
		window.requestAnimationFrame( raf );
		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 13
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	// Go to the end state if fx are off or if document is hidden
	if ( jQuery.fx.off || document.hidden ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.requestAnimationFrame ?
			window.requestAnimationFrame( raf ) :
			window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	if ( window.cancelAnimationFrame ) {
		window.cancelAnimationFrame( timerId );
	} else {
		window.clearInterval( timerId );
	}

	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnothtmlwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnothtmlwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




support.focusin = "onfocusin" in window;


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = jQuery.isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( jQuery.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 13
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( jQuery.isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win, rect, doc,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		rect = elem.getBoundingClientRect();

		// Make sure element is not hidden (display: none)
		if ( rect.width || rect.height ) {
			doc = elem.ownerDocument;
			win = getWindow( doc );
			docElem = doc.documentElement;

			return {
				top: rect.top + win.pageYOffset - docElem.clientTop,
				left: rect.left + win.pageXOffset - docElem.clientLeft
			};
		}

		// Return zeros for disconnected and hidden elements (gh-2310)
		return rect;
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset = {
				top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
				left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
			};
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

jQuery.parseJSON = JSON.parse;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}





return jQuery;
} );

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/process/browser.js":[function(require,module,exports){
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/scroll-to/index.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var Tween = require('tween');
var raf = require('raf');

/**
 * Expose `scrollTo`.
 */

module.exports = scrollTo;

/**
 * Scroll to `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @api public
 */

function scrollTo(x, y, options) {
  options = options || {};

  // start position
  var start = scroll();

  // setup tween
  var tween = Tween(start)
    .ease(options.ease || 'out-circ')
    .to({ top: y, left: x })
    .duration(options.duration || 1000);

  // scroll
  tween.update(function(o){
    window.scrollTo(o.left | 0, o.top | 0);
  });

  // handle end
  tween.on('end', function(){
    animate = function(){};
  });

  // animate
  function animate() {
    raf(animate);
    tween.update();
  }

  animate();
  
  return tween;
}

/**
 * Return scroll position.
 *
 * @return {Object}
 * @api private
 */

function scroll() {
  var y = window.pageYOffset || document.documentElement.scrollTop;
  var x = window.pageXOffset || document.documentElement.scrollLeft;
  return { top: y, left: x };
}

},{"raf":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-raf/index.js","tween":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/component-tween/index.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud-resolve-jsonp/index.js":[function(require,module,exports){

var qs = require('query-string');
var corslite = require('corslite');
var jsonp = require('browser-jsonp');


var endpoint = 'https://api.soundcloud.com/resolve.json';

module.exports = function(params) {

  var params = params || {};
  var options;
  var callback;

  if (typeof arguments[1] === 'object') {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  var url = endpoint + '?' + qs.stringify(params);

  corslite(url, function(err, res) {
    try {
      if (err) throw err;
      if (!err) {
        res = JSON.parse(res.response) || res;
        callback(err, res);
      }
    } catch(e) {
      jsonp({
        url: url,
        error: function(err) {
          callback(err);
        },
        success: function(res) {
          callback(null, res);
        }
      });
    }
  }, true);

};


},{"browser-jsonp":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/browser-jsonp/lib/jsonp.js","corslite":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/corslite/corslite.js","query-string":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud-resolve-jsonp/node_modules/query-string/query-string.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud-resolve-jsonp/node_modules/query-string/query-string.js":[function(require,module,exports){
/*!
	query-string
	Parse and stringify URL query strings
	https://github.com/sindresorhus/query-string
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';
	var queryString = {};

	queryString.parse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#)/, '');

		if (!str) {
			return {};
		}

		return str.trim().split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);
			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	};

	queryString.stringify = function (obj) {
		return obj ? Object.keys(obj).map(function (key) {
			var val = obj[key];

			if (Array.isArray(val)) {
				return val.map(function (val2) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
				}).join('&');
			}

			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		}).join('&') : '';
	};

	if (typeof define === 'function' && define.amd) {
		define(function() { return queryString; });
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = queryString;
	} else {
		self.queryString = queryString;
	}
})();

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud/sdk.js":[function(require,module,exports){
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n=e();for(var i in n)("object"==typeof exports?exports:t)[i]=n[i]}}(this,function(){return function(t){function e(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return t[i].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){(function(e){"use strict";var i=n(4),r=n(8),o=n(2),s=n(9),a=n(1).Promise,u=n(15),h=n(16);t.exports=e.SC={initialize:function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];o.set("oauth_token",t.oauth_token),o.set("client_id",t.client_id),o.set("redirect_uri",t.redirect_uri),o.set("baseURL",t.baseURL),o.set("connectURL",t.connectURL)},get:function(t,e){return i.request("GET",t,e)},post:function(t,e){return i.request("POST",t,e)},put:function(t,e){return i.request("PUT",t,e)},"delete":function(t){return i.request("DELETE",t)},upload:function(t){return i.upload(t)},connect:function(t){return s(t)},isConnected:function(){return void 0!==o.get("oauth_token")},oEmbed:function(t,e){return i.oEmbed(t,e)},resolve:function(t){return i.resolve(t)},Recorder:u,Promise:a,stream:function(t,e){return h(t,e)},connectCallback:function(){r.notifyDialog(this.location)}}}).call(e,function(){return this}())},function(t,e,n){var i;(function(t,r,o,s){/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   2.3.0
	 */
(function(){"use strict";function a(t){return"function"==typeof t||"object"==typeof t&&null!==t}function u(t){return"function"==typeof t}function h(t){return"object"==typeof t&&null!==t}function c(t){q=t}function l(t){Q=t}function f(){var e=t.nextTick,n=t.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);return Array.isArray(n)&&"0"===n[1]&&"10"===n[2]&&(e=r),function(){e(m)}}function d(){return function(){K(m)}}function p(){var t=0,e=new et(m),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function g(){var t=new MessageChannel;return t.port1.onmessage=m,function(){t.port2.postMessage(0)}}function _(){return function(){setTimeout(m,1)}}function m(){for(var t=0;Z>t;t+=2){var e=rt[t],n=rt[t+1];e(n),rt[t]=void 0,rt[t+1]=void 0}Z=0}function y(){try{var t=n(26);return K=t.runOnLoop||t.runOnContext,d()}catch(e){return _()}}function v(){}function E(){return new TypeError("You cannot resolve a promise with itself")}function S(){return new TypeError("A promises callback cannot return that same promise.")}function A(t){try{return t.then}catch(e){return ut.error=e,ut}}function w(t,e,n,i){try{t.call(e,n,i)}catch(r){return r}}function T(t,e,n){Q(function(t){var i=!1,r=w(n,e,function(n){i||(i=!0,e!==n?I(t,n):O(t,n))},function(e){i||(i=!0,R(t,e))},"Settle: "+(t._label||" unknown promise"));!i&&r&&(i=!0,R(t,r))},t)}function b(t,e){e._state===st?O(t,e._result):e._state===at?R(t,e._result):D(e,void 0,function(e){I(t,e)},function(e){R(t,e)})}function P(t,e){if(e.constructor===t.constructor)b(t,e);else{var n=A(e);n===ut?R(t,ut.error):void 0===n?O(t,e):u(n)?T(t,e,n):O(t,e)}}function I(t,e){t===e?R(t,E()):a(e)?P(t,e):O(t,e)}function L(t){t._onerror&&t._onerror(t._result),M(t)}function O(t,e){t._state===ot&&(t._result=e,t._state=st,0!==t._subscribers.length&&Q(M,t))}function R(t,e){t._state===ot&&(t._state=at,t._result=e,Q(L,t))}function D(t,e,n,i){var r=t._subscribers,o=r.length;t._onerror=null,r[o]=e,r[o+st]=n,r[o+at]=i,0===o&&t._state&&Q(M,t)}function M(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var i,r,o=t._result,s=0;s<e.length;s+=3)i=e[s],r=e[s+n],i?x(n,i,r,o):r(o);t._subscribers.length=0}}function k(){this.error=null}function N(t,e){try{return t(e)}catch(n){return ht.error=n,ht}}function x(t,e,n,i){var r,o,s,a,h=u(n);if(h){if(r=N(n,i),r===ht?(a=!0,o=r.error,r=null):s=!0,e===r)return void R(e,S())}else r=i,s=!0;e._state!==ot||(h&&s?I(e,r):a?R(e,o):t===st?O(e,r):t===at&&R(e,r))}function C(t,e){try{e(function(e){I(t,e)},function(e){R(t,e)})}catch(n){R(t,n)}}function F(t,e){var n=this;n._instanceConstructor=t,n.promise=new t(v),n._validateInput(e)?(n._input=e,n.length=e.length,n._remaining=e.length,n._init(),0===n.length?O(n.promise,n._result):(n.length=n.length||0,n._enumerate(),0===n._remaining&&O(n.promise,n._result))):R(n.promise,n._validationError())}function U(t){return new ct(this,t).promise}function B(t){function e(t){I(r,t)}function n(t){R(r,t)}var i=this,r=new i(v);if(!$(t))return R(r,new TypeError("You must pass an array to race.")),r;for(var o=t.length,s=0;r._state===ot&&o>s;s++)D(i.resolve(t[s]),void 0,e,n);return r}function H(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(v);return I(n,t),n}function j(t){var e=this,n=new e(v);return R(n,t),n}function G(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function Y(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function V(t){this._id=gt++,this._state=void 0,this._result=void 0,this._subscribers=[],v!==t&&(u(t)||G(),this instanceof V||Y(),C(this,t))}function z(){var t;if("undefined"!=typeof o)t=o;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;n&&"[object Promise]"===Object.prototype.toString.call(n.resolve())&&!n.cast||(t.Promise=_t)}var W;W=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var K,q,X,$=W,Z=0,Q=({}.toString,function(t,e){rt[Z]=t,rt[Z+1]=e,Z+=2,2===Z&&(q?q(m):X())}),J="undefined"!=typeof window?window:void 0,tt=J||{},et=tt.MutationObserver||tt.WebKitMutationObserver,nt="undefined"!=typeof t&&"[object process]"==={}.toString.call(t),it="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,rt=new Array(1e3);X=nt?f():et?p():it?g():void 0===J?y():_();var ot=void 0,st=1,at=2,ut=new k,ht=new k;F.prototype._validateInput=function(t){return $(t)},F.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},F.prototype._init=function(){this._result=new Array(this.length)};var ct=F;F.prototype._enumerate=function(){for(var t=this,e=t.length,n=t.promise,i=t._input,r=0;n._state===ot&&e>r;r++)t._eachEntry(i[r],r)},F.prototype._eachEntry=function(t,e){var n=this,i=n._instanceConstructor;h(t)?t.constructor===i&&t._state!==ot?(t._onerror=null,n._settledAt(t._state,e,t._result)):n._willSettleAt(i.resolve(t),e):(n._remaining--,n._result[e]=t)},F.prototype._settledAt=function(t,e,n){var i=this,r=i.promise;r._state===ot&&(i._remaining--,t===at?R(r,n):i._result[e]=n),0===i._remaining&&O(r,i._result)},F.prototype._willSettleAt=function(t,e){var n=this;D(t,void 0,function(t){n._settledAt(st,e,t)},function(t){n._settledAt(at,e,t)})};var lt=U,ft=B,dt=H,pt=j,gt=0,_t=V;V.all=lt,V.race=ft,V.resolve=dt,V.reject=pt,V._setScheduler=c,V._setAsap=l,V._asap=Q,V.prototype={constructor:V,then:function(t,e){var n=this,i=n._state;if(i===st&&!t||i===at&&!e)return this;var r=new this.constructor(v),o=n._result;if(i){var s=arguments[i-1];Q(function(){x(i,r,s,o)})}else D(n,r,t,e);return r},"catch":function(t){return this.then(null,t)}};var mt=z,yt={Promise:_t,polyfill:mt};n(19).amd?(i=function(){return yt}.call(e,n,e,s),!(void 0!==i&&(s.exports=i))):"undefined"!=typeof s&&s.exports?s.exports=yt:"undefined"!=typeof this&&(this.ES6Promise=yt),mt()}).call(this)}).call(e,n(6),n(3).setImmediate,function(){return this}(),n(20)(t))},function(t,e){"use strict";var n={oauth_token:void 0,baseURL:"https://api.soundcloud.com",connectURL:"//connect.soundcloud.com",client_id:void 0,redirect_uri:void 0};t.exports={get:function(t){return n[t]},set:function(t,e){e&&(n[t]=e)}}},function(t,e,n){(function(t,i){function r(t,e){this._id=t,this._clearFn=e}var o=n(6).nextTick,s=Function.prototype.apply,a=Array.prototype.slice,u={},h=0;e.setTimeout=function(){return new r(s.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new r(s.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},e.setImmediate="function"==typeof t?t:function(t){var n=h++,i=arguments.length<2?!1:a.call(arguments,1);return u[n]=!0,o(function(){u[n]&&(i?t.apply(null,i):t.call(null),e.clearImmediate(n))}),n},e.clearImmediate="function"==typeof i?i:function(t){delete u[t]}}).call(e,n(3).setImmediate,n(3).clearImmediate)},function(t,e,n){(function(e){"use strict";var i=n(2),r=n(17),o=n(1).Promise,s=function(t,n,i,r){var s=void 0,a=new o(function(o){var a=e.FormData&&i instanceof FormData;s=new XMLHttpRequest,s.upload&&s.upload.addEventListener("progress",r),s.open(t,n,!0),a||s.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s.onreadystatechange=function(){4===s.readyState&&o({responseText:s.responseText,request:s})},s.send(i)});return a.request=s,a},a=function(t){var e=t.responseText,n=t.request,i=void 0,r=void 0;try{r=JSON.parse(e)}catch(o){}return r?r.errors&&(i={message:""},r.errors[0]&&r.errors[0].error_message&&(i={message:r.errors[0].error_message})):i=n?{message:"HTTP Error: "+n.status}:{message:"Unknown error"},i&&(i.status=n.status),{json:r,error:i}},u=function c(t,e,n,i){var r=s(t,e,n,i),o=r.then(function(t){var e=t.responseText,n=t.request,i=a({responseText:e,request:n});if(i.json&&"302 - Found"===i.json.status)return c("GET",i.json.location,null);if(200!==n.status&&i.error)throw i.error;return i.json});return o.request=r.request,o},h=function(t,e,n){Object.keys(e).forEach(function(i){n?t.append(i,e[i]):t[i]=e[i]})};t.exports={request:function(t,n){var o=arguments.length<=2||void 0===arguments[2]?{}:arguments[2],s=arguments.length<=3||void 0===arguments[3]?function(){}:arguments[3],a=i.get("oauth_token"),c=i.get("client_id"),l={},f=e.FormData&&o instanceof FormData,d=void 0,p=void 0;return l.format="json",a?l.oauth_token=a:l.client_id=c,h(o,l,f),"GET"!==t&&(d=f?o:r.encode(o),o={oauth_token:a}),n="/"!==n[0]?"/"+n:n,p=""+i.get("baseURL")+n+"?"+r.encode(o),u(t,p,d,s)},oEmbed:function(t){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=e.element;delete e.element,e.url=t;var i="https://soundcloud.com/oembed.json?"+r.encode(e);return u("GET",i,null).then(function(t){return n&&t.html&&(n.innerHTML=t.html),t})},upload:function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],e=t.asset_data||t.file,n=i.get("oauth_token")&&t.title&&e;if(!n)return new o(function(t,e){e({status:0,error_message:"oauth_token needs to be present and title and asset_data / file passed as parameters"})});var r=Object.keys(t),s=new FormData;return r.forEach(function(e){var n=t[e];"file"===e&&(e="asset_data",n=t.file),s.append("track["+e+"]",n)}),this.request("POST","/tracks",s,t.progress)},resolve:function(t){return this.request("GET","/resolve",{url:t,_status_code_map:{302:200}})}}}).call(e,function(){return this}())},function(t,e){"use strict";var n={};t.exports={get:function(t){return n[t]},set:function(t,e){n[t]=e}}},function(t,e){function n(){h&&s&&(h=!1,s.length?u=s.concat(u):c=-1,u.length&&i())}function i(){if(!h){var t=setTimeout(n);h=!0;for(var e=u.length;e;){for(s=u,u=[];++c<e;)s&&s[c].run();c=-1,e=u.length}s=null,h=!1,clearTimeout(t)}}function r(t,e){this.fun=t,this.array=e}function o(){}var s,a=t.exports={},u=[],h=!1,c=-1;a.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];u.push(new r(t,e)),1!==u.length||h||setTimeout(i,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=o,a.addListener=o,a.once=o,a.off=o,a.removeListener=o,a.removeAllListeners=o,a.emit=o,a.binding=function(t){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(t){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(t,e,n){"use strict";var i=n(18);e.extract=function(t){return t.split("?")[1]||""},e.parse=function(t){return"string"!=typeof t?{}:(t=t.trim().replace(/^(\?|#|&)/,""),t?t.split("&").reduce(function(t,e){var n=e.replace(/\+/g," ").split("="),i=n.shift(),r=n.length>0?n.join("="):void 0;return i=decodeURIComponent(i),r=void 0===r?null:decodeURIComponent(r),t.hasOwnProperty(i)?Array.isArray(t[i])?t[i].push(r):t[i]=[t[i],r]:t[i]=r,t},{}):{})},e.stringify=function(t){return t?Object.keys(t).sort().map(function(e){var n=t[e];return Array.isArray(n)?n.sort().map(function(t){return i(e)+"="+i(t)}).join("&"):i(e)+"="+i(n)}).filter(function(t){return t.length>0}).join("&"):""}},function(t,e,n){"use strict";var i=n(7),r=n(5);t.exports={notifyDialog:function(t){var e=i.parse(t.search),n=i.parse(t.hash),o={oauth_token:e.access_token||n.access_token,dialog_id:e.state||n.state,error:e.error||n.error,error_description:e.error_description||n.error_description},s=r.get(o.dialog_id);s&&s.handleConnectResponse(o)}}},function(t,e,n){"use strict";var i=n(2),r=n(11),o=n(1).Promise,s=function(t){return i.set("oauth_token",t.oauth_token),t};t.exports=function(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],e=i.get("oauth_token");if(e)return new o(function(t){t({oauth_token:e})});var n={client_id:t.client_id||i.get("client_id"),redirect_uri:t.redirect_uri||i.get("redirect_uri"),response_type:"code_and_token",scope:t.scope||"non-expiring",display:"popup"};if(!n.client_id||!n.redirect_uri)throw new Error("Options client_id and redirect_uri must be passed");var a=new r(n);return a.open().then(s)}},function(t,e,n){"use strict";var i=n(1).Promise;t.exports=function(){var t={};return t.promise=new i(function(e,n){t.resolve=e,t.reject=n}),t}},function(t,e,n){"use strict";function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),o=n(10),s=n(5),a=n(12),u=n(7),h="SoundCloud_Dialog",c=function(){return[h,Math.ceil(1e6*Math.random()).toString(16)].join("_")},l=function(t){return"https://soundcloud.com/connect?"+u.stringify(t)},f=function(){function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];i(this,t),this.id=c(),this.options=e,this.options.state=this.id,this.width=456,this.height=510,this.deferred=o()}return r(t,[{key:"open",value:function(){var t=l(this.options);return this.popup=a.open(t,this.width,this.height),s.set(this.id,this),this.deferred.promise}},{key:"handleConnectResponse",value:function(t){var e=t.error;e?this.deferred.reject(t):this.deferred.resolve(t),this.popup.close()}}]),t}();t.exports=f},function(t,e){"use strict";t.exports={open:function(t,e,n){var i={},r=void 0;return i.location=1,i.width=e,i.height=n,i.left=window.screenX+(window.outerWidth-e)/2,i.top=window.screenY+(window.outerHeight-n)/2,i.toolbar="no",i.scrollbars="yes",r=Object.keys(i).map(function(t){return t+"="+i[t]}).join(", "),window.open(t,i.name,r)}}},function(t,e){(function(e){"use strict";var n=e.AudioContext||e.webkitAudioContext,i=null;t.exports=function(){return i?i:i=new n}}).call(e,function(){return this}())},function(t,e){(function(e){"use strict";var n=e.navigator.getUserMedia||e.navigator.webkitGetUserMedia||e.navigator.mozGetUserMedia;t.exports=function(t,i,r){n.call(e.navigator,t,i,r)}}).call(e,function(){return this}())},function(t,e,n){"use strict";function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),o=n(13),s=n(14),a=n(1).Promise,u=n(24),h=function(){var t=this,e=this.context;return new a(function(n,i){t.source?t.source instanceof AudioNode?n(t.source):i(new Error("source needs to be an instance of AudioNode")):s({audio:!0},function(i){t.stream=i,t.source=e.createMediaStreamSource(i),n(t.source)}.bind(t),i)})},c=function(){function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];i(this,t),this.context=e.context||o(),this._recorder=null,this.source=e.source,this.stream=null}return r(t,[{key:"start",value:function(){var t=this;return h.call(this).then(function(e){return t._recorder=new u(e),t._recorder.record(),e})}},{key:"stop",value:function(){if(this._recorder&&this._recorder.stop(),this.stream)if(this.stream.stop)this.stream.stop();else if(this.stream.getTracks){var t=this.stream.getTracks()[0];t&&t.stop()}}},{key:"getBuffer",value:function(){var t=this;return new a(function(e,n){t._recorder?t._recorder.getBuffer(function(n){var i=t.context.sampleRate,r=t.context.createBuffer(2,n[0].length,i);r.getChannelData(0).set(n[0]),r.getChannelData(1).set(n[1]),e(r)}.bind(t)):n(new Error("Nothing has been recorded yet."))})}},{key:"getWAV",value:function(){var t=this;return new a(function(e,n){t._recorder?t._recorder.exportWAV(function(t){e(t)}):n(new Error("Nothing has been recorded yet."))})}},{key:"play",value:function(){var t=this;return this.getBuffer().then(function(e){var n=t.context.createBufferSource();return n.buffer=e,n.connect(t.context.destination),n.start(0),n})}},{key:"saveAs",value:function(t){return this.getWAV().then(function(e){u.forceDownload(e,t)})}},{key:"delete",value:function(){this._recorder&&(this._recorder.stop(),this._recorder.clear(),this._recorder=null),this.stream&&this.stream.stop()}}]),t}();t.exports=c},function(t,e,n){"use strict";var i=n(4),r=n(23),o=new r({flashAudioPath:"https://connect.soundcloud.com/sdk/flashAudio.swf"}),s=n(2),a=n(25);t.exports=function(t,e){var n=e?{secret_token:e}:{};return i.request("GET",t,n).then(function(t){var n=s.get("baseURL"),i=s.get("client_id"),r=n+"/tracks/"+t.id+"/streams?client_id="+i,u=n+"/tracks/"+t.id+"/plays?client_id="+i;return e&&(r+="&secret_token="+e,u+="&secret_token="+e),new a(o,{soundId:t.id,duration:t.duration,streamUrlsEndpoint:r,registerEndpoint:u})})}},function(t,e){t.exports={encode:function(t,e){function n(t){return t.filter(function(t){return"string"==typeof t&&t.length}).join("&")}function i(t){var e=Object.keys(t);return l?e.sort():e}function r(t,e){var r=":name[:prop]";return n(i(e).map(function(n){return s(r.replace(/:name/,t).replace(/:prop/,n),e[n])}))}function o(t,e){var i=":name[]";return n(e.map(function(e){return s(i.replace(/:name/,t),e)}))}function s(t,e){var n=/%20/g,i=encodeURIComponent,s=typeof e,a=null;return Array.isArray(e)?a=o(t,e):"string"===s?a=i(t)+"="+u(e):"number"===s?a=i(t)+"="+i(e).replace(n,"+"):"boolean"===s?a=i(t)+"="+e:"object"===s&&(null!==e?a=r(t,e):c||(a=i(t)+"=null")),a}function a(t){return"%"+("0"+t.charCodeAt(0).toString(16)).slice(-2).toUpperCase()}function u(t){return t.replace(/[^ !'()~\*]*/g,encodeURIComponent).replace(/ /g,"+").replace(/[!'()~\*]/g,a)}var h="object"==typeof e?e:{},c=h.ignorenull||!1,l=h.sorted||!1;return n(i(t).map(function(e){return s(e,t[e])}))}}},function(t,e){"use strict";t.exports=function(t){return encodeURIComponent(t).replace(/[!'()*]/g,function(t){return"%"+t.charCodeAt(0).toString(16).toUpperCase()})}},function(t,e){t.exports=function(){throw new Error("define cannot be used indirect")}},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children=[],t.webpackPolyfill=1),t}},function(t,e){var n=window.URL||window.webkitURL;t.exports=function(t,e){try{try{var i;try{var r=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;i=new r,i.append(t),i=i.getBlob()}catch(o){i=new Blob([t])}return new Worker(n.createObjectURL(i))}catch(o){return new Worker("data:application/javascript,"+encodeURIComponent(t))}}catch(o){return new Worker(e)}}},function(t,e,n){t.exports=function(){return n(21)('!function(t){function n(r){if(e[r])return e[r].exports;var a=e[r]={exports:{},id:r,loaded:!1};return t[r].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}var e={};return n.m=t,n.c=e,n.p="",n(0)}([function(t,n){(function(t){function n(t){h=t.sampleRate,v=t.numChannels,s()}function e(t){for(var n=0;v>n;n++)p[n].push(t[n]);g+=t[0].length}function r(t){for(var n=[],e=0;v>e;e++)n.push(i(p[e],g));if(2===v)var r=f(n[0],n[1]);else var r=n[0];var a=l(r),o=new Blob([a],{type:t});this.postMessage(o)}function a(){for(var t=[],n=0;v>n;n++)t.push(i(p[n],g));this.postMessage(t)}function o(){g=0,p=[],s()}function s(){for(var t=0;v>t;t++)p[t]=[]}function i(t,n){for(var e=new Float32Array(n),r=0,a=0;a<t.length;a++)e.set(t[a],r),r+=t[a].length;return e}function f(t,n){for(var e=t.length+n.length,r=new Float32Array(e),a=0,o=0;e>a;)r[a++]=t[o],r[a++]=n[o],o++;return r}function c(t,n,e){for(var r=0;r<e.length;r++,n+=2){var a=Math.max(-1,Math.min(1,e[r]));t.setInt16(n,0>a?32768*a:32767*a,!0)}}function u(t,n,e){for(var r=0;r<e.length;r++)t.setUint8(n+r,e.charCodeAt(r))}function l(t){var n=new ArrayBuffer(44+2*t.length),e=new DataView(n);return u(e,0,"RIFF"),e.setUint32(4,36+2*t.length,!0),u(e,8,"WAVE"),u(e,12,"fmt "),e.setUint32(16,16,!0),e.setUint16(20,1,!0),e.setUint16(22,v,!0),e.setUint32(24,h,!0),e.setUint32(28,4*h,!0),e.setUint16(32,2*v,!0),e.setUint16(34,16,!0),u(e,36,"data"),e.setUint32(40,2*t.length,!0),c(e,44,t),e}var h,v,g=0,p=[];t.onmessage=function(t){switch(t.data.command){case"init":n(t.data.config);break;case"record":e(t.data.buffer);break;case"exportWAV":r(t.data.type);break;case"getBuffer":a();break;case"clear":o()}}}).call(n,function(){return this}())}]);\n//# sourceMappingURL=9f9aac32c9a7432b5555.worker.js.map',n.p+"9f9aac32c9a7432b5555.worker.js")}},function(t,e){t.exports=function(t){function e(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return t[i].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}(function(t){for(var e in t)if(Object.prototype.hasOwnProperty.call(t,e))switch(typeof t[e]){case"function":break;case"object":t[e]=function(e){var n=e.slice(1),i=t[e[0]];return function(t,e,r){i.apply(this,[t,e,r].concat(n))}}(t[e]);break;default:t[e]=t[t[e]]}return t}([function(t,e,n){var i,r=n(1),o=n(12),s=n(14),a=n(38),u=n(43),h=n(39),c=n(16),l=n(42),f=n(128),d=n(129);t.exports=i=function(t){t=t||{},this._players={},this._volume=1,this._mute=!1,this.States=a,this.Errors=u,this._settings=o({},t,i.defaults)},i.MimeTypes=d,i.Protocols=f,i.Events=h,i.States=a,i.Errors=u,i.BrowserUtils=c,i.defaults={flashAudioPath:"flashAudio.swf",flashLoadTimeout:2e3,flashObjectID:"flashAudioObject",audioObjectID:"html5AudioObject",updateInterval:300,bufferTime:8e3,bufferingDelay:800,streamUrlProvider:null,debug:!1},i.capabilities=l.names,i.createDefaultMediaDescriptor=function(t,e,n){if(!t||!e||!e.length)throw new Error("invalid input to create media descriptor");return n||(n=0),{id:t,src:e,duration:n,forceSingle:!1,forceFlash:!1,forceHTML5:!1,forceCustomHLS:!1,mimeType:void 0}},i.prototype.getAudioPlayer=function(t){return this._players[t]},i.prototype.hasAudioPlayer=function(t){return void 0!==this._players[t]},i.prototype.removeAudioPlayer=function(t){this.hasAudioPlayer(t)&&delete this._players[t]},i.prototype.setVolume=function(t){t=Math.min(1,t),this._volume=Math.max(0,t);for(var e in this._players)this._players.hasOwnProperty(e)&&this._players[e].setVolume(this._volume)},i.prototype.getVolume=function(){return this._volume},i.prototype.setMute=function(t){this._muted=t;for(var e in this._players)this._players.hasOwnProperty(e)&&this._players[e].setMute(this._muted)},i.prototype.getMute=function(){return this._muted},i.prototype.createAudioPlayer=function(t,e){var n,i=r({},this._settings,e);if(!t)throw"AudioManager: No media descriptor object passed, can`t build any player";if(t.id||(t.id=Math.floor(1e10*Math.random()).toString()+(new Date).getTime().toString()),!t.src)throw new Error("AudioManager: You need to pass a valid media source URL");if(!this._players[t.id]){if(n=s.createAudioPlayer(t,i),!n)throw new Error("AudioManager: No player could be created from the given descriptor");this._players[t.id]=n}return this._players[t.id].setVolume(this._volume),this._players[t.id].setMute(this._muted),this._players[t.id].on(h.STATE_CHANGE,this._onStateChange,this),this._players[t.id]},i.prototype._onStateChange=function(t,e){e.getState()===a.DEAD&&this.removeAudioPlayer(e.getId())}},[130,2,8,4],[131,3,4],function(t,e){function n(t,e,n){n||(n={});for(var i=-1,r=e.length;++i<r;){var o=e[i];n[o]=t[o]}return n}t.exports=n},[132,5,6,7],function(t,e){function n(t){return!!t&&"object"==typeof t}function i(t,e){var n=null==t?void 0:t[e];return s(n)?n:void 0}function r(t){return o(t)&&f.call(t)==a}function o(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function s(t){return null==t?!1:r(t)?d.test(c.call(t)):n(t)&&u.test(t)}var a="[object Function]",u=/^\[object .+?Constructor\]$/,h=Object.prototype,c=Function.prototype.toString,l=h.hasOwnProperty,f=h.toString,d=RegExp("^"+c.call(l).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");t.exports=i},function(t,e){function n(t){return!!t&&"object"==typeof t}function i(t){return function(e){return null==e?void 0:e[t]}}function r(t){return null!=t&&o(l(t))}function o(t){return"number"==typeof t&&t>-1&&t%1==0&&c>=t}function s(t){return n(t)&&r(t)&&u.call(t,"callee")&&!h.call(t,"callee")}var a=Object.prototype,u=a.hasOwnProperty,h=a.propertyIsEnumerable,c=9007199254740991,l=i("length");t.exports=s},function(t,e){function n(t){return!!t&&"object"==typeof t}function i(t,e){var n=null==t?void 0:t[e];return a(n)?n:void 0}function r(t){return"number"==typeof t&&t>-1&&t%1==0&&m>=t}function o(t){return s(t)&&p.call(t)==h}function s(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function a(t){return null==t?!1:o(t)?g.test(f.call(t)):n(t)&&c.test(t)}var u="[object Array]",h="[object Function]",c=/^\[object .+?Constructor\]$/,l=Object.prototype,f=Function.prototype.toString,d=l.hasOwnProperty,p=l.toString,g=RegExp("^"+f.call(d).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),_=i(Array,"isArray"),m=9007199254740991,y=_||function(t){return n(t)&&r(t.length)&&p.call(t)==u};t.exports=y},[133,9,10,11],function(t,e){function n(t,e,n){if("function"!=typeof t)return i;if(void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 3:return function(n,i,r){return t.call(e,n,i,r)};case 4:return function(n,i,r,o){return t.call(e,n,i,r,o)};case 5:return function(n,i,r,o,s){return t.call(e,n,i,r,o,s)}}return function(){return t.apply(e,arguments)}}function i(t){return t}t.exports=n},function(t,e){function n(t){return function(e){return null==e?void 0:e[t]}}function i(t){return null!=t&&s(c(t))}function r(t,e){return t="number"==typeof t||u.test(t)?+t:-1,e=null==e?h:e,t>-1&&t%1==0&&e>t}function o(t,e,n){if(!a(n))return!1;var o=typeof e;if("number"==o?i(n)&&r(e,n.length):"string"==o&&e in n){var s=n[e];return t===t?t===s:s!==s}return!1}function s(t){return"number"==typeof t&&t>-1&&t%1==0&&h>=t}function a(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var u=/^\d+$/,h=9007199254740991,c=n("length");t.exports=o},function(t,e){function n(t,e){if("function"!=typeof t)throw new TypeError(i);return e=r(void 0===e?t.length-1:+e||0,0),function(){for(var n=arguments,i=-1,o=r(n.length-e,0),s=Array(o);++i<o;)s[i]=n[e+i];switch(e){case 0:return t.call(this,s);case 1:return t.call(this,n[0],s);case 2:return t.call(this,n[0],n[1],s)}var a=Array(e+1);for(i=-1;++i<e;)a[i]=n[i];return a[e]=s,t.apply(this,a)}}var i="Expected a function",r=Math.max;t.exports=n},function(t,e,n){function i(t,e){return void 0===t?e:t}function r(t,e){return s(function(n){var i=n[0];return null==i?i:(n.push(e),t.apply(void 0,n))})}var o=n(1),s=n(13),a=r(o,i);t.exports=a},11,function(t,e,n){t.exports=n(15)},function(t,e,n){var i,r=n(16),o=n(17),s=n(45),a=n(49),u=n(46),h=n(48),c=n(50),l=n(129);t.exports=i=function(){},i.createAudioPlayer=function(t,e){var n;if(n=t.src.split(":")[0],("rtmp"===n||"rtmpt"===n||t.forceFlash)&&!t.forceHTML5)return new o(t,e);if(t.mimeType=i.getMimeType(t),t.mimeType===l.M3U8){if(r.isMSESupportMPEG()||r.isMSESupportMP4())return new c(t,e);if(r.isNativeHlsSupported()&&!t.forceCustomHLS)return r.isMobile()||t.forceSingle?new a(t,e):new s(t,e)}else{if(r.supportHTML5Audio()&&r.canPlayType(t.mimeType)||t.forceHTML5)return r.isMobile()||t.forceSingle?new h(t,e):new u(t,e);if(t.mimeType===l.MP3)return new o(t,e)}return null},i.getMimeType=function(t){if(t.mimeType)return t.mimeType;var e=t.src.split("?")[0];return e=e.substring(e.lastIndexOf(".")+1,e.length),l.getTypeByExtension(e)}},function(t,e){function n(){return!(!window.MediaSource&&!window.WebKitMediaSource)}t.exports={supportHTML5Audio:function(){var t;try{if(window.HTMLAudioElement&&"undefined"!=typeof Audio)return t=new Audio,!0}catch(e){return!1}},createAudioElement:function(){var t=document.createElement("audio");return t.setAttribute("msAudioCategory","BackgroundCapableMedia"),t.mozAudioChannelType="content",t},isMobile:function(t){var e=window.navigator.userAgent,n=["mobile","iPhone","iPad","iPod","Android","Skyfire"];return n.some(function(t){return t=new RegExp(t,"i"),t.test(e)})},isIE10Mobile:function(){return/IEmobile\/10\.0/gi.test(navigator.userAgent)},canPlayType:function(t){var e=document.createElement("audio");return!!(e&&e.canPlayType&&e.canPlayType(t).match(/maybe|probably/i))},isNativeHlsSupported:function(){var t,e,n,i=navigator.userAgent,r=["iPhone","iPad","iPod"];return t=function(t){return t.test(i)},e=!t(/chrome/i)&&!t(/opera/i)&&t(/safari/i),n=r.some(function(e){return t(new RegExp(e,"i"))}),n||e},isMSESupported:n,isMSESupportMPEG:function(){return n()&&MediaSource.isTypeSupported("audio/mpeg")},isMSESupportMP4:function(){return n()&&MediaSource.isTypeSupported("audio/mp4")}}},function(t,e,n){function i(t,e){a.call(this,"FlashAudioProxy",t,e),i.players[t.id]=this,this._errorMessage=null,this._errorID=null,this._volume=1,this._muted=!1,i.creatingFlashAudio||(i.flashAudio?this._createFlashAudio():i.createFlashObject(e))}var r=n(1),o=n(18),s=n(29),a=n(35),u=n(39),h=n(43),c=n(38),l=n(44);t.exports=i,r(i.prototype,a.prototype),i.players={},i.createFlashObject=function(t){i.creatingFlashAudio=!0,i.containerElement=document.createElement("div"),i.containerElement.setAttribute("id",t.flashObjectID+"-container"),i.flashElementTarget=document.createElement("div"),i.flashElementTarget.setAttribute("id",t.flashObjectID+"-target"),i.containerElement.appendChild(i.flashElementTarget),document.body.appendChild(i.containerElement);var e=function(e){if(e.success)i.flashAudio=document.getElementById(t.flashObjectID),window.setTimeout(function(){if(i.flashAudio&&!("PercentLoaded"in i.flashAudio))for(var t in i.players)i.players.hasOwnProperty(t)&&(i.players[t]._errorID=h.FLASH_PROXY_FLASH_BLOCKED,i.players[t]._errorMessage="Flash object blocked",i.players[t]._setState(c.ERROR),i.players[t]._logger.type=i.players[t].getType(),i.players[t]._logger.log(i.players[t]._errorMessage))},t.flashLoadTimeout),i.flashAudio.triggerEvent=function(t,e){i.players[t]._triggerEvent(e)},i.flashAudio.onPositionChange=function(t,e,n,r){i.players[t]._onPositionChange(e,n,r)},i.flashAudio.onDebug=function(t,e,n){i.players[t]._logger.type=e,i.players[t]._logger.log(n)},i.flashAudio.onStateChange=function(t,e){i.players[t]._setState(e),e===c.DEAD&&delete i.players[t]},i.flashAudio.onInit=function(t){i.creatingFlashAudio=!1,o(s(i.players),"_createFlashAudio")};else for(var n in i.players)i.players.hasOwnProperty(n)&&(i.players[n]._errorID=h.FLASH_PROXY_CANT_LOAD_FLASH,i.players[n]._errorMessage="Cannot create flash object",i.players[n]._setState(c.ERROR))};document.getElementById(t.flashObjectID)||l.embedSWF(t.flashAudioPath,t.flashObjectID+"-target","1","1","9.0.24","",{json:encodeURIComponent(JSON.stringify(t))},{allowscriptaccess:"always"},{id:t.flashObjectID,tabIndex:"-1"},e)},i._ready=function(){return i.flashAudio&&!i.creatingFlashAudio},i.prototype._createFlashAudio=function(){i.flashAudio.createAudio(this.getDescriptor()),this._state=i.flashAudio.getState(this.getId()),this.setVolume(this._volume),this.setMute(this._muted)},i.prototype._triggerEvent=function(t){this._logger.log("Flash element triggered event: "+t),this.trigger(t,this)},i.prototype._setState=function(t){this._state!==t&&(this._state=t,this.trigger(u.STATE_CHANGE,t,this))},i.prototype._onPositionChange=function(t,e,n){this.trigger(u.POSITION_CHANGE,t,e,n,this)},i.prototype.getType=function(){return i._ready()?i.flashAudio.getType(this.getId()):this._type},i.prototype.getContainerElement=function(){
return i.containerElement},i.prototype.play=function(t){if(i._ready()){if(this.getState()===c.PAUSED)return void this.resume();t=void 0===t?0:t,i.flashAudio.playAudio(this.getId(),t)}},i.prototype.pause=function(){i._ready()&&i.flashAudio.pauseAudio(this.getId())},i.prototype.seek=function(t){i._ready()&&i.flashAudio.seekAudio(this.getId(),t)},i.prototype.resume=function(){i._ready()&&i.flashAudio.resumeAudio(this.getId())},i.prototype.setVolume=function(t){this._volume=t,i._ready()&&i.flashAudio.setVolume(this.getId(),t)},i.prototype.getVolume=function(){return i._ready()?i.flashAudio.getVolume(this.getId()):this._volume},i.prototype.setMute=function(t){this._muted=t,i._ready()&&i.flashAudio.setMute(this.getId(),t)},i.prototype.getMute=function(){return i._ready()?i.flashAudio.getMute(this.getId()):this._muted},i.prototype.getState=function(){return this._state},i.prototype.getCurrentPosition=function(){return i._ready()?i.flashAudio.getCurrentPosition(this.getId()):0},i.prototype.getLoadedPosition=function(){return i._ready()?i.flashAudio.getLoadedPosition(this.getId()):0},i.prototype.getDuration=function(){return i._ready()?i.flashAudio.getDuration(this.getId()):0},i.prototype.kill=function(){return i._ready()?void i.flashAudio.killAudio(this.getId()):0},i.prototype.getErrorMessage=function(){return this._errorMessage?this._errorMessage:i.flashAudio.getErrorMessage(this.getId())},i.prototype.getErrorID=function(){return this._errorID?this._errorID:i.flashAudio.getErrorID(this.getId())},i.prototype.getLevelNum=function(){return i._ready()?i.flashAudio.getLevelNum(this.getId()):0},i.prototype.getLevel=function(){return i._ready()?i.flashAudio.getLevel(this.getId()):0},i.prototype.setLevel=function(t){return i._ready()?i.flashAudio.setLevel(this.getId(),t):0}},function(t,e,n){function i(t){return function(e){return null==e?void 0:e[t]}}function r(t){return null!=t&&s(_(t))}function o(t,e){var n=typeof t;if("string"==n&&p.test(t)||"number"==n)return!0;if(l(t))return!1;var i=!d.test(t);return i||null!=e&&t in a(e)}function s(t){return"number"==typeof t&&t>-1&&t%1==0&&g>=t}function a(t){return u(t)?t:Object(t)}function u(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var h=n(19),c=n(24),l=n(23),f=n(28),d=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,p=/^\w*$/,g=9007199254740991,_=i("length"),m=f(function(t,e,n){var i=-1,s="function"==typeof e,a=o(e),u=r(t)?Array(t.length):[];return h(t,function(t){var r=s?e:a&&null!=t?t[e]:void 0;u[++i]=r?r.apply(t,n):c(t,e,n)}),u});t.exports=m},[134,20],[132,21,22,23],5,6,7,function(t,e,n){function i(t,e,n){null==t||r(e,t)||(e=c(e),t=1==e.length?t:u(t,h(e,0,-1)),e=s(e));var i=null==t?t:t[e];return null==i?void 0:i.apply(t,n)}function r(t,e){var n=typeof t;if("string"==n&&d.test(t)||"number"==n)return!0;if(l(t))return!1;var i=!f.test(t);return i||null!=e&&t in o(e)}function o(t){return a(t)?t:Object(t)}function s(t){var e=t?t.length:0;return e?t[e-1]:void 0}function a(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var u=n(25),h=n(26),c=n(27),l=n(23),f=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,d=/^\w*$/;t.exports=i},function(t,e){function n(t,e,n){if(null!=t){void 0!==n&&n in i(t)&&(e=[n]);for(var r=0,o=e.length;null!=t&&o>r;)t=t[e[r++]];return r&&r==o?t:void 0}}function i(t){return r(t)?t:Object(t)}function r(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}t.exports=n},function(t,e){function n(t,e,n){var i=-1,r=t.length;e=null==e?0:+e||0,0>e&&(e=-e>r?0:r+e),n=void 0===n||n>r?r:+n||0,0>n&&(n+=r),r=e>n?0:n-e>>>0,e>>>=0;for(var o=Array(r);++i<r;)o[i]=t[i+e];return o}t.exports=n},function(t,e,n){function i(t){return null==t?"":t+""}function r(t){if(o(t))return t;var e=[];return i(t).replace(s,function(t,n,i,r){e.push(i?r.replace(a,"$1"):n||t)}),e}var o=n(23),s=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,a=/\\(\\)?/g;t.exports=r},11,function(t,e,n){function i(t){return r(t,o(t))}var r=n(30),o=n(31);t.exports=i},function(t,e){function n(t,e){for(var n=-1,i=e.length,r=Array(i);++n<i;)r[n]=t[e[n]];return r}t.exports=n},[132,32,33,34],5,6,7,function(t,e,n){function i(t,e,n,i){this._type=t,this._id=e.id,this._descriptor=e,this._settings=n,this._currentPosition=this._loadedPosition=this._duration=0,this._capabilities=r({},h.createDefaults(),i),this._logger=new u(this.getType(),this.getId(),e.title,n);try{h.validate(this.getCapabilities())}catch(o){return this.getLogger().log("Bad caps: "+o),void this.updateState(s.ERROR)}this.updateState(s.INITIALIZE)}var r=n(1),o=n(36),s=n(38),a=n(39),u=n(40),h=n(42);t.exports=i,r(i.prototype,o),i.prototype.canPlay=function(){return!1},i.prototype.getCapabilities=function(){return this._capabilities},i.prototype.getLogger=function(){return this._logger},i.prototype.getSettings=function(){return this._settings},i.prototype.getDescriptor=function(){return this._descriptor},i.prototype.getType=function(){return this._type},i.prototype.getId=function(){return this._id+""},i.prototype.beforeStateChange=function(t,e){return!0},i.prototype.notifyStateChange=function(t,e){return!0},i.prototype.afterStateChange=function(t,e){},i.prototype.updateState=function(t){var e=this._state;e!==t&&e!==s.DEAD&&this.beforeStateChange(e,t)&&(this._state=t,this._logger.log('state changed "'+this.getState()+'", position: '+this.getCurrentPosition()+", duration: "+this.getDuration()),this.notifyStateChange(e,t)&&this.trigger(a.STATE_CHANGE,t,this),this.afterStateChange(e,t))},i.prototype.getState=function(){return this._state},i.prototype._isInOneOfStates=function(){for(var t in arguments)if(arguments[t]===this.getState())return!0;return!1},i.prototype.getCurrentPosition=function(){return this._currentPosition},i.prototype.getLoadedPosition=function(){return this._loadedPosition},i.prototype.getDuration=function(){return this._duration}},function(t,e,n){t.exports=n(37)},function(t,e,n){!function(){function n(){return{keys:Object.keys||function(t){if("object"!=typeof t&&"function"!=typeof t||null===t)throw new TypeError("keys() called on a non-object");var e,n=[];for(e in t)t.hasOwnProperty(e)&&(n[n.length]=e);return n},uniqueId:function(t){var e=++a+"";return t?t+e:e},has:function(t,e){return o.call(t,e)},each:function(t,e,n){if(null!=t)if(r&&t.forEach===r)t.forEach(e,n);else if(t.length===+t.length)for(var i=0,o=t.length;o>i;i++)e.call(n,t[i],i,t);else for(var s in t)this.has(t,s)&&e.call(n,t[s],s,t)},once:function(t){var e,n=!1;return function(){return n?e:(n=!0,e=t.apply(this,arguments),t=null,e)}}}}var i,r=Array.prototype.forEach,o=Object.prototype.hasOwnProperty,s=Array.prototype.slice,a=0,u=n();i={on:function(t,e,n){if(!c(this,"on",t,[e,n])||!e)return this;this._events||(this._events={});var i=this._events[t]||(this._events[t]=[]);return i.push({callback:e,context:n,ctx:n||this}),this},once:function(t,e,n){if(!c(this,"once",t,[e,n])||!e)return this;var i=this,r=u.once(function(){i.off(t,r),e.apply(this,arguments)});return r._callback=e,this.on(t,r,n)},off:function(t,e,n){var i,r,o,s,a,h,l,f;if(!this._events||!c(this,"off",t,[e,n]))return this;if(!t&&!e&&!n)return this._events={},this;for(s=t?[t]:u.keys(this._events),a=0,h=s.length;h>a;a++)if(t=s[a],o=this._events[t]){if(this._events[t]=i=[],e||n)for(l=0,f=o.length;f>l;l++)r=o[l],(e&&e!==r.callback&&e!==r.callback._callback||n&&n!==r.context)&&i.push(r);i.length||delete this._events[t]}return this},trigger:function(t){if(!this._events)return this;var e=s.call(arguments,1);if(!c(this,"trigger",t,e))return this;var n=this._events[t],i=this._events.all;return n&&l(n,e),i&&l(i,arguments),this},stopListening:function(t,e,n){var i=this._listeners;if(!i)return this;var r=!e&&!n;"object"==typeof e&&(n=this),t&&((i={})[t._listenerId]=t);for(var o in i)i[o].off(e,n,this),r&&delete this._listeners[o];return this}};var h=/\s+/,c=function(t,e,n,i){if(!n)return!0;if("object"==typeof n){for(var r in n)t[e].apply(t,[r,n[r]].concat(i));return!1}if(h.test(n)){for(var o=n.split(h),s=0,a=o.length;a>s;s++)t[e].apply(t,[o[s]].concat(i));return!1}return!0},l=function(t,e){var n,i=-1,r=t.length,o=e[0],s=e[1],a=e[2];switch(e.length){case 0:for(;++i<r;)(n=t[i]).callback.call(n.ctx);return;case 1:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o);return;case 2:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o,s);return;case 3:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o,s,a);return;default:for(;++i<r;)(n=t[i]).callback.apply(n.ctx,e)}},f={listenTo:"on",listenToOnce:"once"};u.each(f,function(t,e){i[e]=function(e,n,i){var r=this._listeners||(this._listeners={}),o=e._listenerId||(e._listenerId=u.uniqueId("l"));return r[o]=e,"object"==typeof n&&(i=this),e[t](n,i,this),this}}),i.bind=i.on,i.unbind=i.off,i.mixin=function(t){var e=["on","once","off","trigger","stopListening","listenTo","listenToOnce","bind","unbind"];return u.each(e,function(e){t[e]=this[e]},this),t},"undefined"!=typeof t&&t.exports&&(e=t.exports=i),e.BackboneEvents=i}(this)},function(t,e){t.exports={PLAYING:"playing",LOADING:"loading",SEEKING:"seeking",PAUSED:"paused",ERROR:"error",IDLE:"idle",INITIALIZE:"initialize",ENDED:"ended",DEAD:"dead"}},function(t,e){t.exports={POSITION_CHANGE:"position-change",STATE_CHANGE:"state-change",DATA:"data",NETWORK_TIMEOUT:"network-timeout",METADATA:"metadata"}},function(t,e,n){var i,r=n(41),o=null;t.exports=function(t,e,n,s){if(!i&&(i=r(!!s.debug,"audiomanager"),o)){var a=i;i=function(){a(o(arguments[0]+"%s",Array.prototype.slice.call(arguments,1)))}}return n=n&&n.length?" ["+n.replace(/\s/g,"").substr(0,6)+"]":"",{log:i.bind(null,"%s (%s)%s",t,e,n)}}},function(t,e){function n(){function t(t,n){for(var i,r=arguments.length,o=Array(r>2?r-2:0),s=2;r>s;s++)o[s-2]=arguments[s];"string"==typeof n?n=" "+n:(o.unshift(n),n=""),(i=window.console)[t].apply(i,[e()+" |"+c+"%c"+n].concat(l,o))}function e(){var t=new Date,e=null===h?0:t-h;return h=+t,"%c"+r(t.getHours())+":"+r(t.getMinutes())+":"+r(t.getSeconds())+"."+i(t.getMilliseconds(),"0",3)+"%c (%c"+i("+"+e+"ms"," ",8)+"%c)"}var n=arguments.length<=0||void 0===arguments[0]?!0:arguments[0],o=arguments.length<=1||void 0===arguments[1]?"":arguments[1];if(!n)return s;var h=null,c=a(o),l=["color: green","color: grey","color: blue","color: grey",u(o),""],f=t.bind(null,"log");return f.log=f,["info","warn","error"].forEach(function(e){f[e]=t.bind(null,e)}),f}function i(t,e,n){return o(e,n-(""+t).length)+t}function r(t){return i(t,"0",2)}function o(t,e){return e>0?new Array(e+1).join(t):""}function s(){}function a(t){return t?"%c"+t:"%c"}t.exports=n,s.log=s.info=s.warn=s.error=s;var u=function(){var t=["#51613C","#447848","#486E5F","#787444","#6E664E"],e=0;return function(n){return n?"background-color:"+t[e++%t.length]+";color:#fff;border-radius:3px;padding:2px 4px;font-family:sans-serif;text-transform:uppercase;font-size:9px;margin:0 4px":""}}()},function(t,e){function n(t){for(var e in r)if(r.hasOwnProperty(e)&&void 0===t[r[e]])throw new Error("Caps lack required field: "+e);if(!(t[r.PROTOCOLS]instanceof Array))throw new Error("Caps protocols must be an array");if(!(t[r.MIMETYPES]instanceof Array))throw new Error("Caps mimetypes must be an array");return!0}function i(){var t={};return t[r.MIMETYPES]=[],t[r.PROTOCOLS]=[],t[r.AUDIO_ONLY]=!0,t[r.CAN_SEEK_ALWAYS]=!0,t[r.NEEDS_URL_REFRESH]=!0,t}var r={MIMETYPES:"mimetypes",PROTOCOLS:"protocols",AUDIO_ONLY:"audioOnly",CAN_SEEK_ALWAYS:"canSeekAlways",NEEDS_URL_REFRESH:"needsUrlRefresh"},o={createDefaults:i,names:r,validate:n};t.exports=o},function(t,e){t.exports={FLASH_HLS_PLAYLIST_NOT_FOUND:"HLS_PLAYLIST_NOT_FOUND",FLASH_HLS_PLAYLIST_SECURITY_ERROR:"HLS_SECURITY_ERROR",FLASH_HLS_NOT_VALID_PLAYLIST:"HLS_NOT_VALID_PLAYLIST",FLASH_HLS_NO_TS_IN_PLAYLIST:"HLS_NO_TS_IN_PLAYLIST",FLASH_HLS_NO_PLAYLIST_IN_MANIFEST:"HLS_NO_PLAYLIST_IN_MANIFEST",FLASH_HLS_TS_IS_CORRUPT:"HLS_TS_IS_CORRUPT",FLASH_HLS_FLV_TAG_CORRUPT:"HLS_FLV_TAG_CORRUPT",FLASH_HTTP_FILE_NOT_FOUND:"HTTP_FILE_NOT_FOUND",FLASH_RTMP_CONNECT_FAILED:"RTMP_CONNECT_FAILED",FLASH_RTMP_CONNECT_CLOSED:"RTMP_CONNECT_CLOSED",FLASH_RTMP_CANNOT_PLAY_STREAM:"RTMP_CANNOT_PLAY_STREAM",FLASH_PROXY_CANT_LOAD_FLASH:"CANT_LOAD_FLASH",FLASH_PROXY_FLASH_BLOCKED:"FLASH_PROXY_FLASH_BLOCKED",GENERIC_AUDIO_ENDED_EARLY:"GENERIC_AUDIO_ENDED_EARLY",GENERIC_AUDIO_OVERRUN:"GENERIC_AUDIO_OVERRUN",HTML5_AUDIO_ABORTED:"HTML5_AUDIO_ABORTED",HTML5_AUDIO_NETWORK:"HTML5_AUDIO_NETWORK",HTML5_AUDIO_DECODE:"HTML5_AUDIO_DECODE",HTML5_AUDIO_SRC_NOT_SUPPORTED:"HTML5_AUDIO_SRC_NOT_SUPPORTED",MSE_BAD_OBJECT_STATE:"MSE_BAD_OBJECT_STATE",MSE_NOT_SUPPORTED:"MSE_NOT_SUPPORTED",MSE_MP3_NOT_SUPPORTED:"MSE_MP3_NOT_SUPPORTED",MSE_HLS_NOT_VALID_PLAYLIST:"MSE_HLS_NOT_VALID_PLAYLIST",MSE_HLS_PLAYLIST_NOT_FOUND:"MSE_HLS_PLAYLIST_NOT_FOUND",MSE_HLS_SEGMENT_NOT_FOUND:"MSE_HLS_SEGMENT_NOT_FOUND"}},function(t,e){function n(){if(!q&&document.getElementsByTagName("body")[0]){try{var t,e=v("span");e.style.display="none",t=j.getElementsByTagName("body")[0].appendChild(e),t.parentNode.removeChild(t),t=null,e=null}catch(n){return}q=!0;for(var i=V.length,r=0;i>r;r++)V[r]()}}function i(t){q?t():V[V.length]=t}function r(t){if(typeof H.addEventListener!=k)H.addEventListener("load",t,!1);else if(typeof j.addEventListener!=k)j.addEventListener("load",t,!1);else if(typeof H.attachEvent!=k)S(H,"onload",t);else if("function"==typeof H.onload){var e=H.onload;H.onload=function(){e(),t()}}else H.onload=t}function o(){var t=j.getElementsByTagName("body")[0],e=v(N);e.setAttribute("style","visibility: hidden;"),e.setAttribute("type",F);var n=t.appendChild(e);if(n){var i=0;!function r(){if(typeof n.GetVariable!=k)try{var o=n.GetVariable("$version");o&&(o=o.split(" ")[1].split(","),Q.pv=[E(o[0]),E(o[1]),E(o[2])])}catch(a){Q.pv=[8,0,0]}else if(10>i)return i++,void window.setTimeout(r,10);t.removeChild(e),n=null,s()}()}else s()}function s(){var t=z.length;if(t>0)for(var e=0;t>e;e++){var n=z[e].id,i=z[e].callbackFn,r={success:!1,id:n};if(Q.pv[0]>0){var o=y(n);if(o)if(!A(z[e].swfVersion)||Q.wk&&Q.wk<312)if(z[e].expressInstall&&u()){var s={};s.data=z[e].expressInstall,s.width=o.getAttribute("width")||"0",s.height=o.getAttribute("height")||"0",o.getAttribute("class")&&(s.styleclass=o.getAttribute("class")),o.getAttribute("align")&&(s.align=o.getAttribute("align"));for(var l={},f=o.getElementsByTagName("param"),d=f.length,p=0;d>p;p++)"movie"!==f[p].getAttribute("name").toLowerCase()&&(l[f[p].getAttribute("name")]=f[p].getAttribute("value"));h(s,l,n,i)}else c(o),i&&i(r);else T(n,!0),i&&(r.success=!0,r.ref=a(n),r.id=n,i(r))}else if(T(n,!0),i){var g=a(n);g&&typeof g.SetVariable!=k&&(r.success=!0,r.ref=g,r.id=g.id),i(r)}}}function a(t){var e=null,n=y(t);return n&&"OBJECT"===n.nodeName.toUpperCase()&&(e=typeof n.SetVariable!==k?n:n.getElementsByTagName(N)[0]||n),e}function u(){return!X&&A("6.0.65")&&(Q.win||Q.mac)&&!(Q.wk&&Q.wk<312)}function h(t,e,n,i){var r=y(n);if(n=m(n),X=!0,O=i||null,R={success:!1,id:n},r){"OBJECT"===r.nodeName.toUpperCase()?(I=l(r),L=null):(I=r,L=n),t.id=U,(typeof t.width==k||!/%$/.test(t.width)&&E(t.width)<310)&&(t.width="310"),(typeof t.height==k||!/%$/.test(t.height)&&E(t.height)<137)&&(t.height="137");var o=Q.ie?"ActiveX":"PlugIn",s="MMredirectURL="+encodeURIComponent(H.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+o+"&MMdoctitle="+encodeURIComponent(j.title.slice(0,47)+" - Flash Player Installation");if(typeof e.flashvars!=k?e.flashvars+="&"+s:e.flashvars=s,Q.ie&&4!==r.readyState){var a=v("div");n+="SWFObjectNew",a.setAttribute("id",n),r.parentNode.insertBefore(a,r),r.style.display="none",g(r)}d(t,e,n)}}function c(t){if(Q.ie&&4!==t.readyState){t.style.display="none";var e=v("div");t.parentNode.insertBefore(e,t),e.parentNode.replaceChild(l(t),e),g(t)}else t.parentNode.replaceChild(l(t),t)}function l(t){var e=v("div");if(Q.win&&Q.ie)e.innerHTML=t.innerHTML;else{var n=t.getElementsByTagName(N)[0];if(n){var i=n.childNodes;if(i)for(var r=i.length,o=0;r>o;o++)1===i[o].nodeType&&"PARAM"===i[o].nodeName||8===i[o].nodeType||e.appendChild(i[o].cloneNode(!0))}}return e}function f(t,e){var n=v("div");return n.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+t+"'>"+e+"</object>",n.firstChild}function d(t,e,n){var i,r=y(n);if(n=m(n),Q.wk&&Q.wk<312)return i;if(r){var o,s,a,u=v(Q.ie?"div":N);typeof t.id==k&&(t.id=n);for(a in e)e.hasOwnProperty(a)&&"movie"!==a.toLowerCase()&&p(u,a,e[a]);Q.ie&&(u=f(t.data,u.innerHTML));for(o in t)t.hasOwnProperty(o)&&(s=o.toLowerCase(),"styleclass"===s?u.setAttribute("class",t[o]):"classid"!==s&&"data"!==s&&u.setAttribute(o,t[o]));Q.ie?W[W.length]=t.id:(u.setAttribute("type",F),u.setAttribute("data",t.data)),r.parentNode.replaceChild(u,r),i=u}return i}function p(t,e,n){var i=v("param");i.setAttribute("name",e),i.setAttribute("value",n),t.appendChild(i)}function g(t){var e=y(t);e&&"OBJECT"===e.nodeName.toUpperCase()&&(Q.ie?(e.style.display="none",function n(){if(4===e.readyState){for(var t in e)"function"==typeof e[t]&&(e[t]=null);e.parentNode.removeChild(e)}else window.setTimeout(n,10)}()):e.parentNode.removeChild(e))}function _(t){return t&&t.nodeType&&1===t.nodeType}function m(t){return _(t)?t.id:t}function y(t){if(_(t))return t;var e=null;try{e=j.getElementById(t)}catch(n){}return e}function v(t){return j.createElement(t)}function E(t){return parseInt(t,10)}function S(t,e,n){t.attachEvent(e,n),K[K.length]=[t,e,n]}function A(t){t+="";var e=Q.pv,n=t.split(".");return n[0]=E(n[0]),n[1]=E(n[1])||0,n[2]=E(n[2])||0,e[0]>n[0]||e[0]===n[0]&&e[1]>n[1]||e[0]===n[0]&&e[1]===n[1]&&e[2]>=n[2]}function w(t,e,n,i){var r=j.getElementsByTagName("head")[0];if(r){var o="string"==typeof n?n:"screen";if(i&&(D=null,M=null),!D||M!==o){var s=v("style");s.setAttribute("type","text/css"),s.setAttribute("media",o),D=r.appendChild(s),Q.ie&&typeof j.styleSheets!=k&&j.styleSheets.length>0&&(D=j.styleSheets[j.styleSheets.length-1]),M=o}D&&(typeof D.addRule!=k?D.addRule(t,e):typeof j.createTextNode!=k&&D.appendChild(j.createTextNode(t+" {"+e+"}")))}}function T(t,e){if($){var n=e?"visible":"hidden",i=y(t);q&&i?i.style.visibility=n:"string"==typeof t&&w("#"+t,"visibility:"+n)}}function b(t){var e=/[\\\"<>\.;]/,n=null!=e.exec(t);return n&&typeof encodeURIComponent!=k?encodeURIComponent(t):t}/*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
		    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
		*/
var P,I,L,O,R,D,M,k="undefined",N="object",x="Shockwave Flash",C="ShockwaveFlash.ShockwaveFlash",F="application/x-shockwave-flash",U="SWFObjectExprInst",B="onreadystatechange",H=window,j=document,G=navigator,Y=!1,V=[],z=[],W=[],K=[],q=!1,X=!1,$=!0,Z=!1,Q=function(){var t=typeof j.getElementById!=k&&typeof j.getElementsByTagName!=k&&typeof j.createElement!=k,e=G.userAgent.toLowerCase(),n=G.platform.toLowerCase(),i=n?/win/.test(n):/win/.test(e),r=n?/mac/.test(n):/mac/.test(e),o=/webkit/.test(e)?parseFloat(e.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):!1,s="Microsoft Internet Explorer"===G.appName,a=[0,0,0],u=null;if(typeof G.plugins!=k&&typeof G.plugins[x]==N)u=G.plugins[x].description,u&&typeof G.mimeTypes!=k&&G.mimeTypes[F]&&G.mimeTypes[F].enabledPlugin&&(Y=!0,s=!1,u=u.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),a[0]=E(u.replace(/^(.*)\..*$/,"$1")),a[1]=E(u.replace(/^.*\.(.*)\s.*$/,"$1")),a[2]=/[a-zA-Z]/.test(u)?E(u.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0);else if(typeof H.ActiveXObject!=k)try{var h=new ActiveXObject(C);h&&(u=h.GetVariable("$version"),u&&(s=!0,u=u.split(" ")[1].split(","),a=[E(u[0]),E(u[1]),E(u[2])]))}catch(c){}return{w3:t,pv:a,wk:o,ie:s,win:i,mac:r}}();!function(){Q.w3&&((typeof j.readyState!=k&&("complete"===j.readyState||"interactive"===j.readyState)||typeof j.readyState==k&&(j.getElementsByTagName("body")[0]||j.body))&&n(),q||(typeof j.addEventListener!=k&&j.addEventListener("DOMContentLoaded",n,!1),Q.ie&&(j.attachEvent(B,function t(){"complete"===j.readyState&&(j.detachEvent(B,t),n())}),H===top&&!function e(){if(!q){try{j.documentElement.doScroll("left")}catch(t){return void window.setTimeout(e,0)}n()}}()),Q.wk&&!function i(){return q?void 0:/loaded|complete/.test(j.readyState)?void n():void window.setTimeout(i,0)}()))}(),V[0]=function(){Y?o():s()},function(){Q.ie&&window.attachEvent("onunload",function(){for(var t=K.length,e=0;t>e;e++)K[e][0].detachEvent(K[e][1],K[e][2]);for(var n=W.length,i=0;n>i;i++)g(W[i]);for(var r in Q)Q[r]=null;Q=null;for(var o in P)P[o]=null;P=null})}(),t.exports=P={registerObject:function(t,e,n,i){if(Q.w3&&t&&e){var r={};r.id=t,r.swfVersion=e,r.expressInstall=n,r.callbackFn=i,z[z.length]=r,T(t,!1)}else i&&i({success:!1,id:t})},getObjectById:function(t){return Q.w3?a(t):void 0},embedSWF:function(t,e,n,r,o,s,a,c,l,f){var p=m(e),g={success:!1,id:p};Q.w3&&!(Q.wk&&Q.wk<312)&&t&&e&&n&&r&&o?(T(p,!1),i(function(){n+="",r+="";var i={};if(l&&typeof l===N)for(var _ in l)i[_]=l[_];i.data=t,i.width=n,i.height=r;var m={};if(c&&typeof c===N)for(var y in c)m[y]=c[y];if(a&&typeof a===N)for(var v in a)if(a.hasOwnProperty(v)){var E=Z?encodeURIComponent(v):v,S=Z?encodeURIComponent(a[v]):a[v];typeof m.flashvars!=k?m.flashvars+="&"+E+"="+S:m.flashvars=E+"="+S}if(A(o)){var w=d(i,m,e);i.id===p&&T(p,!0),g.success=!0,g.ref=w,g.id=w.id}else{if(s&&u())return i.data=s,void h(i,m,e,f);T(p,!0)}f&&f(g)})):f&&f(g)},switchOffAutoHideShow:function(){$=!1},enableUriEncoding:function(t){Z=typeof t===k?!0:t},ua:Q,getFlashPlayerVersion:function(){return{major:Q.pv[0],minor:Q.pv[1],release:Q.pv[2]}},hasFlashPlayerVersion:A,createSWF:function(t,e,n){return Q.w3?d(t,e,n):void 0},showExpressInstall:function(t,e,n,i){Q.w3&&u()&&h(t,e,n,i)},removeSWF:function(t){Q.w3&&g(t)},createCSS:function(t,e,n,i){Q.w3&&w(t,e,n,i)},addDomLoadEvent:i,addLoadEvent:r,getQueryParamValue:function(t){var e=j.location.search||j.location.hash;if(e){if(/\?/.test(e)&&(e=e.split("?")[1]),null==t)return b(e);for(var n=e.split("&"),i=0;i<n.length;i++)if(n[i].substring(0,n[i].indexOf("="))===t)return b(n[i].substring(n[i].indexOf("=")+1))}return""},expressInstallCallback:function(){if(X){var t=y(U);t&&I&&(t.parentNode.replaceChild(I,t),L&&(T(L,!0),Q.ie&&(I.style.display="block")),O&&O(R)),X=!1}},version:"2.3"}},function(t,e,n){function i(t,e,n,i){if(n!==s&&n!==o&&void 0!==n)throw new Error("Can not use the provided base class");this._baseclass=n||o,this._baseclass.call(this,t,e,i||"HLSAudioPlayer"),this._seekPosition=0}var r=n(1),o=n(46),s=n(48),a=n(38);t.exports=i,r(i.prototype,o.prototype),i.prototype.seek=function(t){this._baseclass.prototype.seek.apply(this,arguments),this._isInOneOfStates(a.LOADING,a.SEEKING)&&(this._seekPosition=t)},i.prototype.getCurrentPosition=function(){if(this._isInOneOfStates(a.LOADING)&&this._seekPosition>0)return this._seekPosition;if(this._isInOneOfStates(a.PLAYING,a.SEEKING)){if(this._seekPosition>=this._currentPosition)return this._seekPosition;this._seekPosition=0}return this._baseclass.prototype.getCurrentPosition.apply(this,arguments)}},function(t,e,n){function i(t,e,n){this._duration=0,this._currentPosition=0,this._loadedPosition=0,h.prototype.constructor.call(this,n||"HTML5AudioPlayer",t,e),this._isLoaded=!1,this._prevCurrentPosition=0,this._prevCheckTime=0,this._positionUpdateTimer=0,this._playRequested=!1,this._startFromPosition=0,this.getDescriptor().duration&&(this._duration=this.getDescriptor().duration),this._bindHandlers(),this._initMediaElement(),this.updateState(s.IDLE)}var r=n(1),o=n(47).bindAll,s=n(38),a=n(39),u=n(43),h=n(35),c=n(16);t.exports=i,r(i.prototype,h.prototype),i.MediaAPIEvents=["ended","play","playing","pause","seeking","waiting","seeked","error","loadeddata","loadedmetadata"],i.prototype.play=function(t){return this._isInOneOfStates(s.ERROR,s.DEAD)?void this._logger.log("play called but state is ERROR or DEAD"):(this._logger.log("play from "+t),this._startFromPosition=t||0,this._playRequested=!0,this._isInOneOfStates(s.PAUSED,s.ENDED)?void this.resume():(this.updateState(s.LOADING),this._html5Audio.readyState>0&&this._onLoadedMetadata(),this._html5Audio.readyState>1&&this._onLoaded(),void(this._isLoaded?this._playAfterLoaded():this.once(a.DATA,this._playAfterLoaded))))},i.prototype.pause=function(){this._isInOneOfStates(s.ERROR,s.DEAD)||(this._logger.log("pause"),this._playRequested=!1,this._html5Audio&&this._html5Audio.pause())},i.prototype.seek=function(t){var e,n=!1,i=t/1e3,r=this._html5Audio.seekable;if(!this._isInOneOfStates(s.ERROR,s.DEAD)){if(!this._isLoaded)return this.once(a.DATA,function(){this.seek(t)}),void this._logger.log("postponing seek for when loaded");if(c.isIE10Mobile)n=!0;else for(e=0;e<r.length;e++)if(i<=r.end(e)&&i>=r.start(e)){n=!0;break}if(!n)return void this._logger.log("can not seek");this._logger.log("seek"),this.updateState(s.SEEKING),this._html5Audio.currentTime=i,this._currentPosition=t,this._lastMediaClockCheck=null}},i.prototype.resume=function(){return this._isInOneOfStates(s.ERROR,s.DEAD)?void this._logger.log("resume called but state is ERROR or DEAD"):(this._logger.log("resume"),void(this.getState()===s.PAUSED?(this.updateState(s.PLAYING),this._html5Audio.play(this._html5Audio.currentTime)):this.getState()===s.ENDED&&this._html5Audio.play(0)))},i.prototype.setVolume=function(t){this._html5Audio&&(this._html5Audio.volume=t)},i.prototype.getVolume=function(){return this._html5Audio?this._html5Audio.volume:1},i.prototype.setMute=function(t){this._html5Audio&&(this._html5Audio.muted=t)},i.prototype.getMute=function(){return this._html5Audio?this._html5Audio.muted:!1},i.prototype.kill=function(){this._state!==s.DEAD&&(this._logger.log("killing ..."),this._resetPositionInterval(!1),this._playRequested=!1,this._toggleEventListeners(!1),this.pause(),delete this._html5Audio,this.updateState(s.DEAD),this._logger.log("dead"))},i.prototype.getErrorMessage=function(){return this._errorMessage},i.prototype.getErrorID=function(){return this._errorID},i.prototype._bindHandlers=function(){o(this,["_onPositionChange","_onHtml5MediaEvent","_onLoaded","_onLoadedMetadata"])},i.prototype._initMediaElement=function(){this._html5Audio=c.createAudioElement(),this._html5Audio.id=this.getSettings().audioObjectID+"_"+this.getId(),this._html5Audio.preload="auto",this._html5Audio.type=this.getDescriptor().mimeType,this._html5Audio.src=this.getDescriptor().src,this._html5Audio.load(),this._toggleEventListeners(!0)},i.prototype._playAfterLoaded=function(){this._playRequested&&(this._trySeekToStartPosition(),this._html5Audio.play())},i.prototype._isInOneOfStates=function(){for(var t in arguments)if(arguments[t]===this._state)return!0;return!1},i.prototype._toggleEventListeners=function(t){if(this._html5Audio){var e=t?"addEventListener":"removeEventListener";i.MediaAPIEvents.forEach(function(t){switch(t){case"loadeddata":this._html5Audio[e]("loadeddata",this._onLoaded);break;case"loadedmetadata":this._html5Audio[e]("loadedmetadata",this._onLoadedMetadata);break;default:this._html5Audio[e](t,this._onHtml5MediaEvent)}},this)}},i.prototype._trySeekToStartPosition=function(){var t;return this._startFromPosition>0&&(this._logger.log("seek to start position: "+this._startFromPosition),t=this._startFromPosition/1e3,this._html5Audio.currentTime=t,this._html5Audio.currentTime===t)?(this._lastMediaClockCheck=null,this._currentPosition=this._startFromPosition,this._startFromPosition=0,!0):!1},i.prototype._onLoaded=function(){this._logger.log("HTML5 media loadeddata event"),this.trigger(a.DATA,this)},i.prototype._onLoadedMetadata=function(){this._logger.log("HTML5 media loadedmetadata event"),(void 0===this._duration||0===this._duration)&&(this._duration=1e3*this._html5Audio.duration),this._loadedPosition=this._duration,this._isLoaded=!0,this.trigger(a.METADATA,this)},i.prototype._resetPositionInterval=function(t){window.clearInterval(this._positionUpdateTimer),t&&(this._positionUpdateTimer=window.setInterval(this._onPositionChange,this.getSettings().updateInterval))},i.prototype._onPositionChange=function(){if(!this._isInOneOfStates(s.DEAD)){var t;return Date.now(),this._currentPosition=1e3*this._html5Audio.currentTime,this.trigger(a.POSITION_CHANGE,this.getCurrentPosition(),this._loadedPosition,this._duration,this),this._isInOneOfStates(s.PLAYING,s.LOADING)?0!==this._duration&&(this._currentPosition>this._duration||this._currentPosition>this._loadedPosition&&!c.isIE10Mobile)?void this._onHtml5MediaEvent({type:"ended"}):this.getState()!==s.PLAYING||this._mediasHasProgressed()?void(this.getState()!==s.PLAYING&&this._mediasHasProgressed()&&this.updateState(s.PLAYING)):(this._logger.log("media clock check failed, playhead is not advancing anymore"),void this.updateState(s.LOADING)):void(this._state===s.SEEKING&&t>0&&this.updateState(s.PLAYING))}},i.prototype._mediasHasProgressed=function(){var t=!1,e=Date.now();if(this._lastMediaClockCheck){var n=e-this._lastMediaClockCheck,i=this._currentPosition-this._lastMediaClockValue;if(.1*n>i){if(0===i&&50>n)return!0;t=!0}}return this._lastMediaClockValue=this._currentPosition,this._lastMediaClockCheck=e,!t},i.prototype._onHtml5MediaEvent=function(t){switch(this._logger.log("HTML5 media event: "+t.type),t.type){case"playing":if(this._trySeekToStartPosition())break;this._onPositionChange(),this._resetPositionInterval(!0),this.updateState(s.PLAYING);break;case"pause":this._onPositionChange(),this._resetPositionInterval(!1),this.updateState(s.PAUSED);break;case"ended":this._currentPosition=this._loadedPosition=this._duration,this._resetPositionInterval(!1),this.updateState(s.ENDED);break;case"waiting":if(this.getState()===s.SEEKING)break;this.updateState(s.LOADING);break;case"seeking":this.updateState(s.SEEKING);break;case"seeked":this._html5Audio.paused?this.updateState(s.PAUSED):this.updateState(s.PLAYING),this._onPositionChange(t);break;case"error":this._error(this._html5AudioErrorCodeToErrorId(),!0)}},i.prototype._html5AudioErrorCodeToErrorId=function(){return{1:u.HTML5_AUDIO_ABORTED,2:u.HTML5_AUDIO_NETWORK,3:u.HTML5_AUDIO_DECODE,4:u.HTML5_AUDIO_SRC_NOT_SUPPORTED}[this._html5Audio.error.code]},i.prototype._error=function(t,e){var n="error: ";e&&(n="error (native): "),this._errorID=t,this._errorMessage=this._getErrorMessage(this._errorID),this._logger.log(n+this._errorID+" "+this._errorMessage),this.updateState(s.ERROR),this._toggleEventListeners(!1)},i.prototype._getErrorMessage=function(t){var e={};return e[u.HTML5_AUDIO_ABORTED]="The fetching process for the media resource was aborted by the user agent at the user's request.",e[u.HTML5_AUDIO_NETWORK]="A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.",e[u.HTML5_AUDIO_DECODE]="An error of some description occurred while decoding the media resource, after the resource was established to be usable.",e[u.HTML5_AUDIO_SRC_NOT_SUPPORTED]="The media resource indicated by the src attribute was not suitable.",e[t]}},function(t,e){function n(t,e){var n=new Uint8Array(t.byteLength+e.byteLength);return n.set(new Uint8Array(t),0),n.set(new Uint8Array(e),t.byteLength),n}t.exports={bindAll:function(t,e){e.forEach(function(e){t[e]=t[e].bind(t)})},concatBuffersToUint8Array:n}},function(t,e,n){function i(t,e,n){u.prototype.constructor.call(this,t,e,n||"HTML5SingleAudioPlayer")}var r,o=n(1),s=n(16),a=n(39),u=n(46),h=n(38),c={};t.exports=i,o(i.prototype,u.prototype),i._onLoaded=function(t){i._pauseOthersAndForwardEvent("_onLoaded",t)},i._onLoadedMetadata=function(t){i._pauseOthersAndForwardEvent("_onLoadedMetadata",t)},i._onHtml5MediaEvent=function(t){i._pauseOthersAndForwardEvent("_onHtml5MediaEvent",t)},i._pauseOthersAndForwardEvent=function(t,e){Object.keys(c).forEach(function(n){var i=c[n];n===r?i[t](e):i.pause()})},i.prototype._initMediaElement=function(){i._html5Audio||(i._html5Audio=s.createAudioElement(),i._html5Audio.id=this.getSettings().audioObjectID+"_Single",u.prototype._toggleEventListeners.call(i,!0)),this._toggleEventListeners(!0),this._html5Audio=i._html5Audio,this._logger.log("initialized player for use with: "+this.getDescriptor().src)},i.prototype._toggleEventListeners=function(t){t?c[this.getId()]=this:delete c[this.getId()]},i.prototype.play=function(t){this._logger.log("singleton play at: "+t),(0===this._html5Audio.readyState||this.getDescriptor().src!==this._html5Audio.src)&&(this._logger.log("setting up audio element for use with: "+this.getDescriptor().src),r=this.getId(),this._isInOneOfStates(h.PAUSED)&&(this._logger.log("state was paused"),t=this._currentPosition||0),this._toggleEventListeners(!0),this._html5Audio.preload="auto",this._html5Audio.type=this.getDescriptor().mimeType,this._html5Audio.src=this.getDescriptor().src,this._html5Audio.load()),u.prototype.play.call(this,t)},i.prototype.resume=function(){return this._isInOneOfStates(h.ERROR,h.DEAD)?void 0:r!==this.getId()?void this.play(this._currentPosition):void u.prototype.resume.apply(this,arguments)},i.prototype.pause=function(){this._isInOneOfStates(h.ERROR,h.DEAD)||(this._logger.log("singleton pause"),r===this.getId()?u.prototype.pause.apply(this,arguments):(this._toggleEventListeners(!1),this._isInOneOfStates(h.PAUSED)||this.updateState(h.PAUSED),this._resetPositionInterval(!1)))},i.prototype.seek=function(t){return r!==this.getId()?(this._currentPosition=t,void this.trigger(a.POSITION_CHANGE,this._currentPosition,this._loadedPosition,this._duration,this)):void u.prototype.seek.apply(this,arguments)}},function(t,e,n){function i(t,e){o.call(this,t,e,s,"HLSSingleAudioPlayer")}var r=n(1),o=n(45),s=n(48);t.exports=i,r(i.prototype,s.prototype,o.prototype)},function(t,e,n){function i(t,e){return u.prototype.constructor.call(this,"HLSMSEPlayer",t,e,w()),o(this,["_onPositionChange","_onPlaylistLoaded","_onPlaylistFailed","_onSegmentLoaded","_onSegmentProgress","_onSegmentFailed","_onHtml5MediaEvent","_onLoadedData","_onLoadedMetadata","_onMediaSourceAppend","_onMediaSourceReady","_onMediaSourceDestroy","_onMediaSourceError"]),this._streamUrlProvider=this.getSettings().streamUrlProvider||null,this._minPreBufferLengthForPlayback=5e3,this._maxBufferLength=3e4,this._streamUrlRetryTimer=null,this._streamUrlTimesFailed=0,this._playlistRetryTimer=null,this._playlistTimesFailed=0,this._playlistRefreshInProgress=!1,this._isPlaylistLoaded=!1,this._loadOnInit=!1,this._schedulingSegmentIndex=-1,this._segmentsDownloading=[],this._nextSchedulingTimeout=null,this._mimeType=T(),this._mimeType?(this._mseToolkit=new l(this._logger,this._mimeType),this._mseToolkit.on(l.Events.SEGMENT_APPENDED,this._onMediaSourceAppend),this._mseToolkit.on(l.Events.SOURCE_READY,this._onMediaSourceReady),this._mseToolkit.on(l.Events.SOURCE_DESTROY,this._onMediaSourceDestroy),this._mseToolkit.on(l.Events.SOURCE_ERROR,this._onMediaSourceError),this._hlsToolkit=new c(this._logger,this.getDescriptor().src),this._hlsToolkit.on(c.Events.SEGMENT_LOADED,this._onSegmentLoaded),this._hlsToolkit.on(c.Events.SEGMENT_PROGRESS,this._onSegmentProgress),this._hlsToolkit.on(c.Events.SEGMENT_FAILED,this._onSegmentFailed),this._hlsToolkit.on(c.Events.PLAYLIST_LOADED,this._onPlaylistLoaded),this._hlsToolkit.on(c.Events.PLAYLIST_FAILED,this._onPlaylistFailed),this._hlsToolkit.on(c.Events.PLAYLIST_PARSE_ERROR,this._onPlaylistFailed),this._html5Audio=this._mseToolkit.media(),void this._toggleEventListeners(!0)):void this._error(a.MSE_NOT_SUPPORTED)}var r=n(1),o=n(47).bindAll,s=n(39),a=n(43),u=n(35),h=n(46),c=n(51),l=n(66),f=n(67),d=n(38),p=n(42),g=n(128),_=n(129),m=n(16),y=200,v=500,E=3,S=1e4,A=function(t){var e=t/E,n=v*(Math.pow(Math.E,e)/Math.E);return n+=Math.random()*y,n>S&&(n=S),n},w=function(){var t={};return t[p.names.PROTOCOLS]=[g.HLS],t[p.names.MIMETYPES]=[_.HLS,_.M3U8,_.MP3],t[p.names.NEEDS_URL_REFRESH]=!1,t},T=function(){return m.isMSESupportMPEG()&&!m.isNativeHlsSupported()?"audio/mpeg":m.isMSESupportMP4()?"audio/mp4":null};t.exports=i,r(i.prototype,u.prototype),i.prototype._onLoadedData=function(){this._logger.log("loadeddata event handler"),this.trigger(s.DATA)},i.prototype._onLoadedMetadata=function(){this._logger.log("loadedmetadata event handler")},i.prototype._mediasHasProgressed=function(){var t=!1,e=Date.now();if(this._lastMediaClockCheck){var n=e-this._lastMediaClockCheck,i=this._currentPosition-this._lastMediaClockValue;if(.1*n>i){if(0===i&&50>n)return!0;t=!0}}return this._lastMediaClockValue=this._currentPosition,this._lastMediaClockCheck=e,!t},i.prototype._onPositionChange=function(){return this._html5Audio&&this.getState()!==d.SEEKING?(this._currentPosition=1e3*this._html5Audio.currentTime,this.getState()!==d.PLAYING||this._mediasHasProgressed()?(this.getState()!==d.PLAYING&&this._mediasHasProgressed()&&this.updateState(d.PLAYING),this._triggerPositionEvent(),this._currentPosition>=this._duration?void this.updateState(d.ENDED):void 0):(this._logger.log("media clock check failed, playhead is not advancing anymore"),void this.updateState(d.LOADING))):void 0},i.prototype._onMediaSourceReady=function(){this.getDescriptor().duration&&(this._setDuration(this.getDescriptor().duration),this._logger.log("duration set from descriptor to "+this._duration)),this.updateState(d.IDLE),this._loadOnInit&&this._loadInitialPlaylist()},i.prototype._onMediaSourceDestroy=function(){this.kill()},i.prototype._onMediaSourceError=function(t){this._logger.log("MediaSource API error: "+t.message),this._error(a.MSE_BAD_OBJECT_STATE),this.kill()},i.prototype._onMediaSourceAppend=function(t){this._logger.log("segment appended: "+t.index),this.trigger(s.DATA,t),this._loadedPosition=t.endPosition,this._playRequested&&(this._logger.log("triggering playback after appending enough segments"),this._html5Audio.play(this._currentPosition))},i.prototype._onSegmentProgress=function(t){var e=Math.round(t.loaded/t.total*100);this._logger.log("segment "+t.index+" loaded "+t.loaded+" of "+t.total+" bytes ("+e+"%)"),this._loadedPosition=t.endPosition-t.duration*(t.loaded/t.total)},i.prototype._onSegmentLoaded=function(t){return this._mseToolkit.sourceIsReady()?void this._appendSegments():void this._logger.log("we have been disposed while loading a segment, noop")},i.prototype._onSegmentFailed=function(t){switch(this._logger.log("segment loading failed handler: "+t.status),t.status){case c.Status.NOT_FOUND:case c.Status.FORBIDDEN:this._cancelNextScheduling(),this._cancelAllInFlightRequests(),this._refreshPlaylist();break;case c.Status.TIMEOUT:this.trigger(s.NETWORK_TIMEOUT);case c.Status.SERVER_ERROR:if(t.aborted){this._logger.log("aborted segment has been prevented from being retried");break}t.scheduleRetry(A(t.timesFailed),this._hlsToolkit.loadSegment,this._hlsToolkit);break;case c.Status.FAILED:this._logger.log("WARNING: segment loading failed for unknown reason!");break;default:throw new Error("Invalid status on failed segment: "+t.status)}},i.prototype._onPlaylistLoaded=function(){return this._logger.log("playlist loaded handler"),this._mseToolkit.sourceIsReady()?(this._playlistRefreshInProgress&&(this._cancelNextScheduling(),this._runScheduling()),this._playlistRefreshInProgress=!1,this._playlistTimesFailed=0,this._isPlaylistLoaded=!0,this._inspectEncryptionData(),this._setDuration(this._hlsToolkit.getDuration()),this._logger.log("duration set from playlist info to "+this._duration),void this.trigger(s.METADATA)):void this._logger.log("we have been disposed while loading the playlist, noop")},i.prototype._onPlaylistFailed=function(t){return this._logger.log("playlist loading failed handler. HTTP status code is "+t),this._mseToolkit.sourceIsReady()?(this._logger.log("Playlist loading failed  "+this._playlistTimesFailed+" times before"),this._playlistTimesFailed++,this._playlistRetryTimer=window.setTimeout(function(){this.hasStreamUrlProvider()?this._refreshPlaylist():this._hlsToolkit.updatePlaylist()}.bind(this),A(this._playlistTimesFailed)),void(0===t&&this.trigger(s.NETWORK_TIMEOUT))):void this._logger.log("we have been disposed while loading the playlist, noop")},i.prototype.afterStateChange=function(t,e){switch(e){case d.PLAYING:this._runScheduling();break;case d.PAUSED:this._cancelNextScheduling()}},i.prototype._onHtml5MediaEvent=function(t){switch(this._logger.log('HTML5 media event "'+t.type+'"'),this._waitingToPause=!1,t.type){case"playing":this._playRequested=!1,this._triggerPositionEvent(),this._resetPositionTimer(!0),this.updateState(d.PLAYING);break;case"pause":this._triggerPositionEvent(),this._resetPositionTimer(!1),this.updateState(d.PAUSED);break;case"ended":this._currentPosition=this._loadedPosition=this._duration,this._triggerPositionEvent(),this._resetPositionTimer(!1),this.updateState(d.ENDED);break;case"waiting":if(this.getState()===d.SEEKING)break;this.updateState(d.LOADING);break;case"seeking":this._triggerPositionEvent(),this.updateState(d.SEEKING);break;case"seeked":this._html5Audio.paused?this.updateState(d.PAUSED):this.updateState(d.PLAYING),this._onPositionChange();break;case"error":this._error(this._html5AudioErrorCodeToErrorId(),!0)}},i.prototype._toggleEventListeners=function(t){if(this._html5Audio){var e=t?"addEventListener":"removeEventListener";h.MediaAPIEvents.forEach(function(t){switch(t){case"loadeddata":this._html5Audio[e]("loadeddata",this._onLoadedData);break;case"loadedmetadata":this._html5Audio[e]("loadedmetadata",this._onLoadedMetadata);break;case"timeupdate":default:this._html5Audio[e](t,this._onHtml5MediaEvent)}},this)}},i.prototype._loadInitialPlaylist=function(){this.updateState(d.LOADING),this._hlsToolkit.updatePlaylist()},i.prototype._refreshPlaylist=function(){this.hasStreamUrlProvider()&&(this._playlistRefreshfInProgress||(this._playlistRefreshInProgress=!0,this._streamUrlProvider().done(function(t){this._logger.log("got new M3u8 URL: "+t),this._streamUrlTimesFailed=0,this._hlsToolkit.setUri(t),this._hlsToolkit.updatePlaylist()}.bind(this)).fail(function(){this._logger.log("failed to retrieve stream URL :("),this._streamUrlRetryTimer=window.setTimeout(function(){this._playlistRefreshInProgress=!1,this._refreshPlaylist()}.bind(this),A(++this._streamUrlTimesFailed))}.bind(this))))},i.prototype._setDuration=function(t){this._duration=t;try{this._mseToolkit.duration(this._duration)}catch(e){this._onMediaSourceError(e)}},i.prototype._resetPositionTimer=function(t){window.clearInterval(this._positionUpdateTimer),t&&(this._positionUpdateTimer=window.setInterval(this._onPositionChange,this.getSettings().updateInterval))},i.prototype._triggerPositionEvent=function(){this.trigger(s.POSITION_CHANGE,this._currentPosition,this._loadedPosition,this._duration,this)},i.prototype._initTransmuxerOnce=function(t,e){if(!this._transmuxer){var n=this._mimeType!==t.mimeType?f.Configs.MP3_TO_FMP4:f.Configs.VOID;this._transmuxer=new f(n),this._transmuxer.on("segment",function(t){this._logger.log("transmuxed data ready, "+t.data.length+" bytes for segment "+t.index),e(t)}.bind(this))}},i.prototype._transmuxSegment=function(t,e){this._logger.log("transmuxing segment "+t.index),this._initTransmuxerOnce(t,e),this._transmuxer.process(t)},i.prototype._appendSegments=function(){var t=!0;this._segmentsDownloading.slice().forEach(function(e){e.isComplete()&&t?(this._decryptSegment(e),this._transmuxSegment(e,function(t){this._mseToolkit.append(t)}.bind(this)),this._segmentsDownloading.shift()):t=!1},this)},i.prototype._cancelNextScheduling=function(){this._logger.log("cancelling next scheduling"),window.clearTimeout(this._nextSchedulingTimeout),this._nextSchedulingTimeout=null},i.prototype._getBufferUntilTime=function(){return this._currentPosition+this._maxBufferLength},i.prototype._getCurrentSegment=function(){return this._schedulingSegmentIndex>0?this._hlsToolkit.getSegment(this._schedulingSegmentIndex):this._hlsToolkit.getSegmentForTime(this._currentPosition)},i.prototype._runScheduling=function(){function t(){var e=!1,n=this._getBufferUntilTime(),i=this._getCurrentSegment(),r=i?i.duration:Math.Infinity;if(this._logger.log("scheduling next requests, current buffer-until time: "+n+" ms"),!i)return void this._logger.log("no segment to schedule, closing loop");for(this._logger.log("current segment index: "+i.index);i.endPosition<=n;){if(this._logger.log("scheduling loop at "+this._currentPosition+" ms, current segment "+i.index),this._requestSegment(i),i.isLast){e=!0,this._logger.log("end of playlist reached");break}this._schedulingSegmentIndex=i.index+1,i=this._hlsToolkit.getSegment(this._schedulingSegmentIndex)}this._isInOneOfStates(d.DEAD,d.PAUSED)||e?(this._logger.log("not re-scheduling"),this._nextSchedulingTimeout=null):(this._logger.log("timing next check for more data in "+r+" ms"),this._nextSchedulingTimeout=window.setTimeout(t.bind(this),r))}this._nextSchedulingTimeout||t.call(this)},i.prototype._cancelAllInFlightRequests=function(){this._schedulingSegmentIndex=-1,this._segmentsDownloading.forEach(function(t){t.isComplete()||t.cancel()}),this._segmentsDownloading=[]},i.prototype._requestSegment=function(t){return this._segmentsDownloading.push(t),t.isComplete()?(this._logger.log("requested data is already loaded from segment "+t.index),void this._onSegmentLoaded(t)):t.hasBeenRequested()||t.hasFailed()?void this._logger.log("segment already in flight or failed (will retry): "+t.timesFailed+" times"):void this._hlsToolkit.loadSegment(t)},i.prototype._decryptSegment=function(t){this._hlsToolkit.isAES128Encrypted()&&this._hlsToolkit.decryptSegmentAES128(t)},i.prototype._inspectEncryptionData=function(){this._hlsToolkit.isAES128Encrypted()&&(this._logger.log("got key of byte length "+this._hlsToolkit.getEncryptionKey().byteLength),this._hlsToolkit.getEncryptionIv()?this._logger.log("got IV of byte length "+this._hlsToolkit.getEncryptionIv().byteLength):this._logger.log("no IV found in header, will use per-segment-index IV"))},i.prototype._html5AudioErrorCodeToErrorId=function(){return{1:a.HTML5_AUDIO_ABORTED,2:a.HTML5_AUDIO_NETWORK,3:a.HTML5_AUDIO_DECODE,4:a.HTML5_AUDIO_SRC_NOT_SUPPORTED}[this._html5Audio.error.code]},i.prototype._error=function(t,e){this._errorID=t,this._errorMessage=this._getErrorMessage(this._errorID),e&&this._html5Audio.error&&(this._errorMessage+=" (native message: "+this._html5Audio.error.message+")"),this._logger.log(this._errorID+" "+this._errorMessage),this.updateState(d.ERROR),this._toggleEventListeners(!1)},i.prototype._getErrorMessage=function(t){var e={};return e[a.MSE_NOT_SUPPORTED]="The browser does not support MediaSource API",e[a.MSE_BAD_OBJECT_STATE]="MediaSource API has thrown an exception",e[t]?"Error: "+t+" ("+e[t]+")":"Error: "+t},i.prototype.setVolume=function(t){this._html5Audio&&(this._html5Audio.volume=t)},i.prototype.getVolume=function(){return this._html5Audio?this._html5Audio.volume:1},i.prototype.setMute=function(t){this._html5Audio&&(this._html5Audio.muted=t)},i.prototype.getMute=function(){return this._html5Audio?this._html5Audio.muted:!1},i.prototype.getErrorID=function(){return this._errorID},i.prototype.play=function(t){return this._isInOneOfStates(d.ERROR,d.DEAD)?void this._logger.log("play called but state is ERROR or DEAD"):this._isInOneOfStates(d.IDLE,d.INITIALIZE)?(t=t||0,this._logger.log("play from "+t),this._playRequested=!0,this.seek(t),this.getState()===d.INITIALIZE?void(this._loadOnInit=!0):void this._loadInitialPlaylist()):void this.resume()},i.prototype.pause=function(){this._html5Audio&&(this._playRequested=!1,this._html5Audio.pause())},i.prototype.seek=function(t){if(!this._isInOneOfStates(d.ERROR,d.DEAD)){if(!this._isPlaylistLoaded)return void this.once(s.METADATA,function(){this.seek(t)}.bind(this));if(t>this._duration)return void this._logger.log("can not seek to position over duration");this._logger.log("seek to "+t+" ms"),this.updateState(d.SEEKING),this._lastMediaClockCheck=null,this._currentPosition=t;try{this._html5Audio.currentTime=t/1e3}catch(e){this._logger.log("error seeking: "+e.message)}this._cancelAllInFlightRequests(),this._cancelNextScheduling(),this._runScheduling()}},i.prototype.resume=function(){this._html5Audio&&(this._logger.log("resume from "+this._currentPosition),this._html5Audio.play(1e3*this._currentPosition))},i.prototype.kill=function(){this.getState()!==d.DEAD&&(this._logger.log("kill"),this._resetPositionTimer(!1),this._cancelNextScheduling(),this._cancelAllInFlightRequests(),window.clearTimeout(this._playlistRetryTimer),window.clearTimeout(this._streamUrlRetryTimer),this._playRequested=!1,this._toggleEventListeners(!1),this._html5Audio.pause(),this.updateState(d.DEAD))},i.prototype.getErrorMessage=function(){return this._errorMessage},i.prototype.hasStreamUrlProvider=function(){return!!this._streamUrlProvider}},function(t,e,n){var i,r=n(1),o=n(52),s=n(58),a=null,u=n(36),h={NEW:"new",REQUESTED:"requested",COMPLETE:"complete",TIMEOUT:"timeout",FORBIDDEN:"forbidden",NOT_FOUND:"not-found",SERVER_ERROR:"server-error",FAILED:"failed"},c={FIRST:"#EXTM3U",PLAYLIST:"#EXT-X-STREAM-INF:",SEGMENT:"#EXTINF:",END_TAG:"#EXT-X-ENDLIST",ENCRYPTION:"#EXT-X-KEY:"};t.exports=i=function(t,e){this._logger=t,this._duration=0,this.setUri(e)},i.Events={PLAYLIST_LOADED:"playlist-loaded",PLAYLIST_PARSE_ERROR:"playlist-parse-error",PLAYLIST_FAILED:"playlist-failed",SEGMENT_LOADED:"segment-loaded",SEGMENT_PROGRESS:"segment-progress",SEGMENT_FAILED:"segment-failed",SEGMENT_CANCELED:"segment-canceled"},i.Status=h,r(i.prototype,u),i.Segment=function(t,e,n,i,o){r(this,{toolkit:t,uri:e,startPosition:n,endPosition:n+i,duration:i,index:o,data:null,status:h.NEW,isLast:!1,timesFailed:0,loaded:0,total:-1,aborted:!1,xhr:null,mimeType:"audio/mpeg"}),this._logger=t._logger},i.Segment.prototype.containsTime=function(t){return t>=this.startPosition&&t<=this.endPosition},i.Segment.prototype.isComplete=function(){return this.status===h.COMPLETE},i.Segment.prototype.hasFailed=function(){return this.status===h.TIMEOUT||this.status===h.FORBIDDEN||this.status===h.NOT_FOUND||this.status===h.SERVER_ERROR||this.status===h.FAILED},i.Segment.prototype.isNew=function(){return this.status===h.NEW},i.Segment.prototype.hasBeenRequested=function(){return this.status===h.REQUESTED},i.Segment.prototype.scheduleRetry=function(t,e,n){var i=this;this._retryTimer=window.setTimeout(function(){e.call(n,i)},t)},i.Segment.prototype.cancel=function(){this._logger.log("segment cancelled, clearing timeout: "+this.index),window.clearTimeout(this._retryTimer),this.xhr&&(this._logger.log("will abort & reset segment: "+this.index),this.status=h.NEW,this.aborted=!0,this.data=null,this.timesFailed=0,this.xhr.abort(),this.xhr=null,this.toolkit.trigger(i.Events.SEGMENT_CANCELED,this));
},i.prototype.setUri=function(t){var e=this._uri=t;e.indexOf("?")>-1&&(e=e.substr(0,e.indexOf("?"))),this._baseURI=e.substr(0,e.lastIndexOf("/")+1)},i.prototype.updatePlaylist=function(){var t=!1,e=new XMLHttpRequest;e.open("GET",this._uri,!0),e.responseType="text",this._logger.log("downloading playlist");var n=function(n){t||(t=!0,this.trigger(i.Events.PLAYLIST_FAILED,e.status))}.bind(this);e.onload=function(t){return 200!==e.status?void n():(this._segments=[],this._duration=0,this._parsePlaylist(e.responseText)?(this.getLastSegment().isLast=!0,this._logger.log("playlist download complete"),void this._retrieveEncryptionKey(function(){this.trigger(i.Events.PLAYLIST_LOADED)})):(this._logger.log("error parsing playlist"),void this.trigger(i.Events.PLAYLIST_PARSE_ERROR)))}.bind(this),e.onerror=function(t){n(t)}.bind(this),e.send()},i.prototype._parsePlaylist=function(t){for(var e,n,r,o=t.split("\n"),s=!1,a=0,u=0;a<o.length;)e=o[a++],0===e.indexOf(c.SEGMENT)?(r=1e3*Number(e.substr(8,e.indexOf(",")-8)),n=this._createSegmentURL(o[a]),this._addSegment(new i.Segment(this,n,this._duration,r,u++)),a++):0===e.indexOf(c.ENCRYPTION)?this._parsePlaylistEncryptionHeader(e):0===e.indexOf(c.END_TAG)&&(s=!0);return!(0===this.getNumSegments()||!s)},i.prototype._addSegment=function(t){this._segments.push(t),this._duration+=t.duration},i.prototype._parsePlaylistEncryptionHeader=function(t){var e,n,i,r=t.substr(c.ENCRYPTION.length).split(",");if(s(r,function(t){t.indexOf("METHOD")>=0?n=t.split("=")[1]:t.indexOf("URI")>=0?e=t.split("=")[1]:t.indexOf("IV")>=0&&(i=t.split("=")[1])}),!(n&&e&&n.length&&e.length))throw new Error("Failed to parse M3U8 encryption header");n=n.trim(),e=e.trim().replace(/"/g,""),this._encryptionMethod=n,this._encryptionKeyUri=e,i&&i.length?(this._encryptionIvHexString=i.trim(),this._parseEncryptionIvHexString()):this._encryptionIv=null},i.prototype._parseEncryptionIvHexString=function(){var t,e=this._encryptionIvHexString.replace("0x",""),n=new Uint16Array(8),i=0;if(e.length%4!==0)throw new Error("Failed to parse M3U8 encryption IV (length is not multiple of 4)");for(;i<e.length;i+=4){if(t=parseInt(e.substr(i,4),16),isNaN(t))throw new Error("Failed to parse hex number in IV string");n[i/4]=t}this._encryptionIv=n},i.prototype._encryptionIvForSegment=function(t){var e=new DataView(new ArrayBuffer(16));return e.setUint32(0,t.index,!0),e.buffer},i.prototype._retrieveEncryptionKey=function(t){if(t){if(!this._encryptionKeyUri)return void t.call(this);var e=this._encryptionKeyUri,n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="arraybuffer",n.onload=o(function(i){200===n.status?this._encryptionKey=new Uint8Array(n.response):this._logger.log("Failed to retrieve encryption key from "+e+", returned status "+n.status),t.call(this)},this),n.send(),this._logger.log("Downloading encryption key from "+e)}},i.prototype._removeEncryptionPaddingBytes=function(t){var e=t.data[t.data.byteLength-1];e?(this._logger.log("Detected PKCS7 padding length of "+e+" bytes, slicing segment."),t.data=t.data.subarray(0,t.data.byteLength-e)):this._logger.log("No padding detected (last byte is zero)")},i.prototype.decryptSegmentAES128=function(t){if(this._logger.log("Decrypting AES-128 cyphered segment ..."),!a)throw new Error("AES decryption not built-in");var e=a.cipher.createDecipher("AES-CBC",a.util.createBuffer(this._encryptionKey)),n=0,i=t.data.byteLength,r=this._encryptionIv||this._encryptionIvForSegment(t);for(this._logger.log("Using IV ->"),e.start({iv:a.util.createBuffer(r)}),e.update(a.util.createBuffer(t.data)),e.finish(),t.data=new Uint8Array(i);i>n;n++)t.data[n]=e.output.getByte();this._removeEncryptionPaddingBytes(t)},i.prototype.isAES128Encrypted=function(){return"AES-128"===this._encryptionMethod},i.prototype.getEncryptionKeyUri=function(){return this._encryptionKeyUri},i.prototype.getEncryptionIv=function(){return this._encryptionIv},i.prototype.getEncryptionKey=function(){return this._encryptionKey},i.prototype._createSegmentURL=function(t){return"http://"===t.substr(0,7)||"https://"===t.substr(0,8)||"/"===t.substr(0,1)?t:this._baseURI+t},i.prototype._handleLoadSegmentFailure=function(t,e,n){t.aborted||(this._logger.log("segment aborted: "+t.aborted),this._logger.log("segment loading failure: HTTP response status: "+e.status),0===e.status?t.status=h.TIMEOUT:403===e.status?t.status=h.FORBIDDEN:404===e.status?t.status=h.NOT_FOUND:e.status>=500?t.status=h.SERVER_ERROR:t.status=h.FAILED,t.timesFailed++,this.trigger(i.Events.SEGMENT_FAILED,t))},i.prototype.loadSegment=function(t){var e=!1,n=new XMLHttpRequest,r=t.uri,o=function(i){e||(e=!0,this._handleLoadSegmentFailure(t,n,i))}.bind(this);(t.hasBeenRequested()||t.isComplete())&&this._logger.log("segment cant be loaded, requested: ",!!t.hasBeenRequested()," complete: ",t.isComplete()),n.open("GET",r,!0),n.responseType="arraybuffer",n.onload=function(){if(!t.aborted){if(200!==n.status)return void o();this._logger.log("download of segment "+t.index+" complete"),t.status=h.COMPLETE,t.data=new Uint8Array(n.response),t.downloadTime=Date.now()-t.downloadStartTime,this.trigger(i.Events.SEGMENT_LOADED,t)}}.bind(this),n.onprogress=function(e){t.aborted||e.loaded&&e.total&&(t.loaded=e.loaded,t.total=e.total,this.trigger(i.Events.SEGMENT_PROGRESS,t))}.bind(this),n.onerror=function(t){o(t)}.bind(this),this._logger.log("requesting segment "+t.index+" from "+r),t.xhr=n,t.aborted=!1,t.downloadStartTime=Date.now(),t.status=h.REQUESTED,n.send()},i.prototype.getSegment=function(t){return this._segments&&this._segments[t]?this._segments[t]:null},i.prototype.getSegmentIndexForTime=function(t){var e,n;if(t>this._duration||0>t||!this._segments||0===this._segments.length)return-1;for(e=Math.floor(this._segments.length*(t/this._duration)),n=this._segments[e];!(n.startPosition<=t&&n.startPosition+n.duration>t);)n.startPosition+n.duration>=t?e--:e++,n=this._segments[e];return e},i.prototype.getSegmentForTime=function(t){var e=this.getSegmentIndexForTime(t);return e>=0?this._segments[e]:null},i.prototype.getDuration=function(){return this._duration},i.prototype.getNumSegments=function(){return this._segments.length},i.prototype.getLastSegment=function(){return this._segments.length?this._segments[this._segments.length-1]:null}},function(t,e,n){var i=n(53),r=n(56),o=n(57),s=1,a=32,u=o(function(t,e,n){var o=s;if(n.length){var h=r(n,u.placeholder);o|=a}return i(t,o,e,n,h)});u.placeholder={},t.exports=u},function(t,e,n){(function(e){function i(t,e,n){for(var i=n.length,r=-1,o=P(t.length-i,0),s=-1,a=e.length,u=Array(a+o);++s<a;)u[s]=e[s];for(;++r<i;)u[n[r]]=t[r];for(;o--;)u[s++]=t[r++];return u}function r(t,e,n){for(var i=-1,r=n.length,o=-1,s=P(t.length-r,0),a=-1,u=e.length,h=Array(s+u);++o<s;)h[o]=t[o];for(var c=o;++a<u;)h[c+a]=e[a];for(;++i<r;)h[c+n[i]]=t[o++];return h}function o(t,n){function i(){var o=this&&this!==e&&this instanceof i?r:t;return o.apply(n,arguments)}var r=s(t);return i}function s(t){return function(){var e=arguments;switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3]);case 5:return new t(e[0],e[1],e[2],e[3],e[4]);case 6:return new t(e[0],e[1],e[2],e[3],e[4],e[5]);case 7:return new t(e[0],e[1],e[2],e[3],e[4],e[5],e[6])}var n=p(t.prototype),i=t.apply(n,e);return f(i)?i:n}}function a(t,n,o,u,h,c,f,p,T,b){function I(){for(var y=arguments.length,v=y,E=Array(y);v--;)E[v]=arguments[v];if(u&&(E=i(E,u,h)),c&&(E=r(E,c,f)),D||k){var w=I.placeholder,x=g(E,w);if(y-=x.length,b>y){var C=p?d(p):void 0,F=P(b-y,0),U=D?x:void 0,B=D?void 0:x,H=D?E:void 0,j=D?void 0:E;n|=D?S:A,n&=~(D?A:S),M||(n&=~(_|m));var G=a(t,n,o,H,U,j,B,C,T,F);return G.placeholder=w,G}}var Y=O?o:this,V=R?Y[t]:t;return p&&(E=l(E,p)),L&&T<E.length&&(E.length=T),this&&this!==e&&this instanceof I&&(V=N||s(t)),V.apply(Y,E)}var L=n&w,O=n&_,R=n&m,D=n&v,M=n&y,k=n&E,N=R?void 0:s(t);return I}function u(t,n,i,r){function o(){for(var n=-1,s=arguments.length,h=-1,c=r.length,l=Array(c+s);++h<c;)l[h]=r[h];for(;s--;)l[h++]=arguments[++n];var f=this&&this!==e&&this instanceof o?u:t;return f.apply(a?i:this,l)}var a=n&_,u=s(t);return o}function h(t,e,n,i,r,s,h,c){var l=e&m;if(!l&&"function"!=typeof t)throw new TypeError(T);var f=i?i.length:0;if(f||(e&=~(S|A),i=r=void 0),f-=r?r.length:0,e&A){var d=i,p=r;i=r=void 0}var g=[t,e,n,i,r,d,p,s,h,c];if(g[9]=null==c?l?0:t.length:P(c-f,0)||0,e==_)var y=o(g[0],g[2]);else y=e!=S&&e!=(_|S)||g[4].length?a.apply(void 0,g):u.apply(void 0,g);return y}function c(t,e){return t="number"==typeof t||b.test(t)?+t:-1,e=null==e?L:e,t>-1&&t%1==0&&e>t}function l(t,e){for(var n=t.length,i=I(e.length,n),r=d(t);i--;){var o=e[i];t[i]=c(o,n)?r[o]:void 0}return t}function f(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var d=n(54),p=n(55),g=n(56),_=1,m=2,y=4,v=8,E=16,S=32,A=64,w=128,T="Expected a function",b=/^\d+$/,P=Math.max,I=Math.min,L=9007199254740991;t.exports=h}).call(e,function(){return this}())},function(t,e){function n(t,e){var n=-1,i=t.length;for(e||(e=Array(i));++n<i;)e[n]=t[n];return e}t.exports=n},function(t,e){function n(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var i=function(){function t(){}return function(e){if(n(e)){t.prototype=e;var i=new t;t.prototype=void 0}return i||{}}}();t.exports=i},function(t,e){function n(t,e){for(var n=-1,r=t.length,o=-1,s=[];++n<r;)t[n]===e&&(t[n]=i,s[++o]=n);return s}var i="__lodash_placeholder__";t.exports=n},11,function(t,e,n){function i(t,e){return function(n,i,r){return"function"==typeof i&&void 0===r&&a(n)?t(n,i):e(n,s(i,r,3))}}var r=n(59),o=n(60),s=n(65),a=n(64),u=i(r,o);t.exports=u},function(t,e){function n(t,e){for(var n=-1,i=t.length;++n<i&&e(t[n],n,t)!==!1;);return t}t.exports=n},[134,61],[132,62,63,64],5,6,7,9,function(t,e,n){var i,r=n(36),o=n(16),s=n(47).bindAll,a=n(1);t.exports=i=function(t,e){s(this,["_onMSEInit","_onMSEDispose","_onSourceBufferUpdate"]),this.mimeType=e,this._logger=t,this._isBufferPrepared=!1,this._sourceBufferPtsOffset=0,this._segmentsAwaitingAppendance=[],this._isNotReady=!0,this._sourceBuffer=null,this._mediaSource=new MediaSource,this._mediaSource.addEventListener("sourceopen",this._onMSEInit,!1),this._mediaSource.addEventListener("sourceclose",this._onMSEDispose,!1),this._mediaElem=o.createAudioElement(),this._mediaElem.src=window.URL.createObjectURL(this._mediaSource)},i.Events={SOURCE_READY:"source-ready",SOURCE_DESTROYED:"source-destroy",SOURCE_ERROR:"source-error",SEGMENT_APPENDED:"segment-appended"},a(i.prototype,r),a(i.prototype,{_onMSEInit:function(){this._logger.log("source open handler"),this._isNotReady=!1,this._mediaSource.removeEventListener("sourceopen",this._onMSEInit,!1),this._sourceBuffer=this._mediaSource.addSourceBuffer(this.mimeType),this._sourceBuffer.addEventListener("update",this._onSourceBufferUpdate),this.trigger(i.Events.SOURCE_READY)},_onMSEDispose:function(){this._isNotReady=!0,this._logger.log("source dispose handler"),this._mediaSource.removeEventListener("sourceclose",this._onMSEDispose,!1)},_appendNextSegment:function(t){try{if(this._sourceBuffer.updating)return this._logger.log("source buffer is busy updating already, enqueuing data for later appending"),void this._segmentsAwaitingAppendance.unshift(t);t.isLast&&this._logger.log("about to append last segment"),this._currentSegmentAppending=t,this._sourceBuffer.timestampOffset=t.startPosition/1e3,this._sourceBuffer.appendBuffer(t.data),this._logger.log("appending segment "+t.index)}catch(e){this._logger.log("error while appending to SourceBuffer: "+e.message+")"),this.trigger(i.Events.SOURCE_ERROR,e)}},_tryAppendEos:function(){this._logger.log("attempting to finalize stream");try{"open"!==this._mediaSource.readyState||this._sourceBuffer.updating?this._logger.log("couldn't call endOfStream because SourceBuffer is still updating, we'll call it once its done"):(this._mediaSource.endOfStream(),this._logger.log("called endOfStream"))}catch(t){this._logger.log("SourceBuffer endOfStream() call failed with error: "+t.message),this.trigger(i.Events.SOURCE_ERROR,t)}},_onSourceBufferUpdate:function(){(this._currentSegmentAppending||this._sourceBuffer.updating)&&(this._logger.log("done updating SourceBuffer with segment "+this._currentSegmentAppending.index),this.trigger(i.Events.SEGMENT_APPENDED,this._currentSegmentAppending),this._currentSegmentAppending.isLast&&(this._logger.log("was last segment, setting on EOS on SourceBuffer"),this._tryAppendEos()),this._segmentsAwaitingAppendance.length&&!this._sourceBuffer.updating&&this._appendNextSegment(this._segmentsAwaitingAppendance.pop()))},append:function(t){if(!this.sourceIsReady())throw new Error("MediaSource is not ready yet");this._appendNextSegment(t)},media:function(){return this._mediaElem},sourceIsReady:function(){return!this._isNotReady},duration:function(t){return this._mediaSource.duration=t/1e3,1e3*this._mediaSource.duration}})},function(t,e,n){var i,r=n(47).concatBuffersToUint8Array,o=n(1),s=n(36),a=n(68);t.exports=i=function(t){this.config=t,this.reset(),this.segments=[],this.pushedInitData=!1},o(i.prototype,s),i.prototype.process=function(t){switch(this.segments.push(t),this.config){case i.Configs.VOID:this.trigger("segment",t);break;case i.Configs.MP3_TO_FMP4:this.src.enqueue(new a.Unit.Transfer(t.data,"binary")),this.src.enqueue(a.Unit.Transfer.Flush());break;default:throw new Error("Config "+this.config+" not supported")}},i.prototype.dequeue=function(){return this.segments.shift()},i.prototype.reset=function(){switch(this.config){case i.Configs.VOID:break;case i.Configs.MP3_TO_FMP4:this.gotInitData=!1,this.src=new a.Unit.BasePushSrc,this.parser=new a.Units.MP3Parser,this.muxer=new a.Units.MP4Mux(a.Units.MP4Mux.Profiles.MP3_AUDIO_ONLY),this.sink=new a.Unit.BaseSink,this.sink._onData=function(){var t,e=this.sink.dequeue().data;return this.gotInitData?(t=this.dequeue(),t.mimeType="audio/mp4",this.gotInitData&&!this.pushedInitData?(t.data=r(this.initData,e),this.pushedInitData=!0):t.data=e,this.trigger("segment",t),void this.reset()):(this.gotInitData=!0,void(this.initData=e))}.bind(this),a.Unit.link(this.src,this.parser,this.muxer,this.sink);break;default:throw new Error("Config "+this.config+" not supported")}},i.Configs={VOID:"VOID",MP3_TO_FMP4:"MP3_TO_FMP4"}},function(t,e,n){var i,r=n(69),o=n(115),s=n(118),a=n(121),u=n(124),h=n(125);t.exports=i={Unit:r,Units:{File:h,MP4Mux:o,MP3Parser:s,MSESink:a,XHR:u}}},function(t,e,n){(function(e){var i,r,o,s,a,u,h,c,l,f,d=n(74),p=n(76),g=n(85),_=n(96),m=n(97);t.exports=i=function(){_.call(this),this.inputs||(this.inputs=[]),this.outputs||(this.outputs=[])},i.create=function(t){return p(i.prototype,t)},i.createBaseSrc=function(t){return p(u.prototype,t)},i.createBasePushSrc=function(t){return p(h.prototype,t)},i.createBaseSink=function(t){return p(c.prototype,t)},i.createBaseTransform=function(t){return p(a.prototype,t)},i.createBaseParser=function(t){return p(l.prototype,t)},i.link=function(t,e){if(arguments.length>2)return i.linkArray(arguments);for(var n=0;n<Math.min(t.numberOfOuts(),e.numberOfIns());n++)t.out(n).pipe(e["in"](n));return e},i.linkArray=function(t){var e,n,r;for(r=0;r<t.length;r++)e=t[r],t.length>r+1&&(n=t[r+1],i.link(e,n));return n};var y=i.Event={CHAIN:"chain",NEED_DATA:"need-data",FINISH:"finish",PIPE:"pipe",UNPIPE:"unpipe",ERROR:"error",END:"end",OPEN:"open",CLOSE:"close"};i.prototype=p(_.prototype,{constructor:i,"in":function(t){return this.inputs[t]},out:function(t){return this.outputs[t]},numberOfIns:function(){return this.inputs.length},numberOfOuts:function(){return this.outputs.length},add:function(t){return t instanceof r?this.addInput(t):t instanceof o&&this.addOutput(t),this},remove:function(t){t instanceof r?this.removeInput(t):t instanceof o&&this.removeOutput(t)},addInput:function(t){this._installEventForwarder(t,y.FINISH),this._installEventForwarder(t,y.OPEN),this._installEventForwarder(t,y.PIPE),this._installEventForwarder(t,y.UNPIPE),this._installEventForwarder(t,y.ERROR),this._installEventForwarder(t,y.CHAIN),this.inputs.push(t)},addOutput:function(t){this._installEventForwarder(t,y.END),this._installEventForwarder(t,y.OPEN),this._installEventForwarder(t,y.CLOSE),this._installEventForwarder(t,y.ERROR),this._installEventForwarder(t,y.NEED_DATA),this.outputs.push(t)},removeInput:function(t){removePut(this.inputs,t)},removeOutput:function(t){removePut(this.outputs,t)},removePut:function(t,e){t.slice().forEach(function(n,i){n==e&&t.splice(i,1)})},_installEventForwarder:function(t,e){t.on(e,function(n){this.emit(e,t,n)}.bind(this))}}),i.Transfer=s=function(t,n,i){n||(n=t instanceof e?"buffer":t instanceof String?"utf8":"object"),this.resolved=!1,this.data=t,this.encoding=n,this.doneCallback=i},s.prototype=p(Object.prototype,{constructor:s,resolve:function(){this.doneCallback&&!this.resolved&&(this.doneCallback(),this.resolved=!0)},setFlushing:function(t){return this.data.flush=t,this},setEmpty:function(t){return this.data.empty=t,this}}),s.Flush=function(){return new s({},"binary").setFlushing(!0).setEmpty(!0)},s.EOS=function(){return new s(null,"binary")},i.Input=r=function(t,e){m.Writable.prototype.constructor.call(this,{objectMode:!0,decodeStrings:!1})},r.prototype=p(m.Writable.prototype,{constructor:r,_write:function(t,e,n){d("_write: "+e),this.emit(i.Event.CHAIN,new s(t,e,n))}}),i.Output=o=function(t){m.Readable.prototype.constructor.call(this,{objectMode:!0}),this._dataRequested=0,this._shouldPushMore=!0},o.eos=function(t){t.push(null,"null")},o.prototype=p(m.Readable.prototype,{constructor:o,_read:function(t){this._dataRequested++,this.emit(y.NEED_DATA,this)},push:function(t,e){return this._dataRequested--,this._shouldPushMore=m.Readable.prototype.push.call(this,t,e),this._shouldPushMore},isPulling:function(){return this._dataRequested>0},eos:function(){m.Readable.prototype.push.call(this,null,"null")}}),i.BaseTransform=a=function(){i.prototype.constructor.apply(this,arguments),this.add(new r).add(new o),this.on(y.CHAIN,this._onChain.bind(this)),this.on(y.FINISH,this._onFinish.bind(this))},a.prototype=p(i.prototype,{constructor:a,_onChain:function(t,e){this._transform(e),this.out(0).push(e.data,e.encoding),e.resolve()},_onFinish:function(t){o.eos(this.out(0))},_transform:function(t){}}),i.BaseSrc=u=function(){i.prototype.constructor.apply(this,arguments),this.add(new o),this.on(y.NEED_DATA,this.squeeze.bind(this))},u.prototype=p(i.prototype,{constructor:u,squeeze:function(){d("squeeze");var t=this._source();t&&(this.out(0).push(t.data,t.encoding),t.resolve())},_source:function(){}}),i.BasePushSrc=h=function(){u.prototype.constructor.apply(this,arguments),this._bufferOut=[]},h.prototype=p(u.prototype,{constructor:h,_source:function(){return this._bufferOut.length?this._bufferOut.shift():null},enqueue:function(t){this._bufferOut.push(t),this.out(0).isPulling&&this.out(0).isPulling()&&this.squeeze()}}),i.BaseSink=c=function(){i.prototype.constructor.apply(this,arguments),this.add(new r),this.on(y.CHAIN,this._onChain.bind(this)),this._bufferIn=[]},c.prototype=p(i.prototype,{constructor:c,_onChain:function(t,e){d("BaseSink._onChain: "+e.encoding),this._bufferIn.push(e),this._onData(),e.resolve()},_onData:function(){},dequeue:function(){return this._bufferIn.length?this._bufferIn.shift():null}}),i.BaseParser=l=function(){h.prototype.constructor.apply(this,arguments),c.prototype.constructor.apply(this,arguments),this.on("finish",this._onFinish.bind(this))},g(l.prototype,i.prototype,_.prototype,u.prototype,h.prototype,c.prototype,{constructor:l,_onData:function(){this._parse(this.dequeue())},_onFinish:function(){d("BaseParser._onFinish"),o.eos(this.out(0))},_parse:function(t){}}),i.InputSelector=f=function(t){for(a.prototype.constructor.apply(this,arguments),t=(t||1)-1;t-- >0;)this.add(new r);this.selectedInputIndex=0},g(f.prototype,a.prototype,{constructor:f,_onChain:function(t,e){var n=this["in"](this.selectedInputIndex);return t!==n?void e.resolve():(this._transform(e),this.out(0).push(e.data,e.encoding),void e.resolve())},_onFinish:function(t){var e=this["in"](this.selectedInputIndex);t===e&&o.eos(this.out(0))}})}).call(e,n(70).Buffer)},function(t,e,n){(function(t,i){function r(){function t(){}try{var e=new Uint8Array(1);return e.foo=function(){return 42},e.constructor=t,42===e.foo()&&e.constructor===t&&"function"==typeof e.subarray&&0===e.subarray(1,1).byteLength}catch(n){return!1}}function o(){return t.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function t(e){return this instanceof t?(this.length=0,this.parent=void 0,"number"==typeof e?s(this,e):"string"==typeof e?a(this,e,arguments.length>1?arguments[1]:"utf8"):u(this,e)):arguments.length>1?new t(e,arguments[1]):new t(e)}function s(e,n){if(e=g(e,0>n?0:0|_(n)),!t.TYPED_ARRAY_SUPPORT)for(var i=0;n>i;i++)e[i]=0;return e}function a(t,e,n){("string"!=typeof n||""===n)&&(n="utf8");var i=0|y(e,n);return t=g(t,i),t.write(e,n),t}function u(e,n){if(t.isBuffer(n))return h(e,n);if($(n))return c(e,n);if(null==n)throw new TypeError("must start with number, buffer, array or string");if("undefined"!=typeof ArrayBuffer){if(n.buffer instanceof ArrayBuffer)return l(e,n);if(n instanceof ArrayBuffer)return f(e,n)}return n.length?d(e,n):p(e,n)}function h(t,e){var n=0|_(e.length);return t=g(t,n),e.copy(t,0,0,n),t}function c(t,e){var n=0|_(e.length);t=g(t,n);for(var i=0;n>i;i+=1)t[i]=255&e[i];return t}function l(t,e){var n=0|_(e.length);t=g(t,n);for(var i=0;n>i;i+=1)t[i]=255&e[i];return t}function f(e,n){return t.TYPED_ARRAY_SUPPORT?(n.byteLength,e=t._augment(new Uint8Array(n))):e=l(e,new Uint8Array(n)),e}function d(t,e){var n=0|_(e.length);t=g(t,n);for(var i=0;n>i;i+=1)t[i]=255&e[i];return t}function p(t,e){var n,i=0;"Buffer"===e.type&&$(e.data)&&(n=e.data,i=0|_(n.length)),t=g(t,i);for(var r=0;i>r;r+=1)t[r]=255&n[r];return t}function g(e,n){t.TYPED_ARRAY_SUPPORT?(e=t._augment(new Uint8Array(n)),e.__proto__=t.prototype):(e.length=n,e._isBuffer=!0);var i=0!==n&&n<=t.poolSize>>>1;return i&&(e.parent=Z),e}function _(t){if(t>=o())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+o().toString(16)+" bytes");return 0|t}function m(e,n){if(!(this instanceof m))return new m(e,n);var i=new t(e,n);return delete i.parent,i}function y(t,e){"string"!=typeof t&&(t=""+t);var n=t.length;if(0===n)return 0;for(var i=!1;;)switch(e){case"ascii":case"binary":case"raw":case"raws":return n;case"utf8":case"utf-8":return Y(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return W(t).length;default:if(i)return Y(t).length;e=(""+e).toLowerCase(),i=!0}}function v(t,e,n){var i=!1;if(e=0|e,n=void 0===n||n===1/0?this.length:0|n,t||(t="utf8"),0>e&&(e=0),n>this.length&&(n=this.length),e>=n)return"";for(;;)switch(t){case"hex":return D(this,e,n);case"utf8":case"utf-8":return I(this,e,n);case"ascii":return O(this,e,n);case"binary":return R(this,e,n);case"base64":return P(this,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return M(this,e,n);default:if(i)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),i=!0}}function E(t,e,n,i){n=Number(n)||0;var r=t.length-n;i?(i=Number(i),i>r&&(i=r)):i=r;var o=e.length;if(o%2!==0)throw new Error("Invalid hex string");i>o/2&&(i=o/2);for(var s=0;i>s;s++){var a=parseInt(e.substr(2*s,2),16);if(isNaN(a))throw new Error("Invalid hex string");t[n+s]=a}return s}function S(t,e,n,i){return K(Y(e,t.length-n),t,n,i)}function A(t,e,n,i){return K(V(e),t,n,i)}function w(t,e,n,i){return A(t,e,n,i)}function T(t,e,n,i){return K(W(e),t,n,i)}function b(t,e,n,i){return K(z(e,t.length-n),t,n,i)}function P(t,e,n){return 0===e&&n===t.length?q.fromByteArray(t):q.fromByteArray(t.slice(e,n))}function I(t,e,n){n=Math.min(t.length,n);for(var i=[],r=e;n>r;){var o=t[r],s=null,a=o>239?4:o>223?3:o>191?2:1;if(n>=r+a){var u,h,c,l;switch(a){case 1:128>o&&(s=o);break;case 2:u=t[r+1],128===(192&u)&&(l=(31&o)<<6|63&u,l>127&&(s=l));break;case 3:u=t[r+1],h=t[r+2],128===(192&u)&&128===(192&h)&&(l=(15&o)<<12|(63&u)<<6|63&h,l>2047&&(55296>l||l>57343)&&(s=l));break;case 4:u=t[r+1],h=t[r+2],c=t[r+3],128===(192&u)&&128===(192&h)&&128===(192&c)&&(l=(15&o)<<18|(63&u)<<12|(63&h)<<6|63&c,l>65535&&1114112>l&&(s=l))}}null===s?(s=65533,a=1):s>65535&&(s-=65536,i.push(s>>>10&1023|55296),s=56320|1023&s),i.push(s),r+=a}return L(i)}function L(t){var e=t.length;if(Q>=e)return String.fromCharCode.apply(String,t);for(var n="",i=0;e>i;)n+=String.fromCharCode.apply(String,t.slice(i,i+=Q));return n}function O(t,e,n){var i="";n=Math.min(t.length,n);for(var r=e;n>r;r++)i+=String.fromCharCode(127&t[r]);return i}function R(t,e,n){var i="";n=Math.min(t.length,n);for(var r=e;n>r;r++)i+=String.fromCharCode(t[r]);return i}function D(t,e,n){var i=t.length;(!e||0>e)&&(e=0),(!n||0>n||n>i)&&(n=i);for(var r="",o=e;n>o;o++)r+=G(t[o]);return r}function M(t,e,n){for(var i=t.slice(e,n),r="",o=0;o<i.length;o+=2)r+=String.fromCharCode(i[o]+256*i[o+1]);return r}function k(t,e,n){if(t%1!==0||0>t)throw new RangeError("offset is not uint");if(t+e>n)throw new RangeError("Trying to access beyond buffer length")}function N(e,n,i,r,o,s){if(!t.isBuffer(e))throw new TypeError("buffer must be a Buffer instance");if(n>o||s>n)throw new RangeError("value is out of bounds");if(i+r>e.length)throw new RangeError("index out of range")}function x(t,e,n,i){0>e&&(e=65535+e+1);for(var r=0,o=Math.min(t.length-n,2);o>r;r++)t[n+r]=(e&255<<8*(i?r:1-r))>>>8*(i?r:1-r)}function C(t,e,n,i){0>e&&(e=4294967295+e+1);for(var r=0,o=Math.min(t.length-n,4);o>r;r++)t[n+r]=e>>>8*(i?r:3-r)&255}function F(t,e,n,i,r,o){if(e>r||o>e)throw new RangeError("value is out of bounds");if(n+i>t.length)throw new RangeError("index out of range");if(0>n)throw new RangeError("index out of range")}function U(t,e,n,i,r){return r||F(t,e,n,4,3.4028234663852886e38,-3.4028234663852886e38),X.write(t,e,n,i,23,4),n+4}function B(t,e,n,i,r){return r||F(t,e,n,8,1.7976931348623157e308,-1.7976931348623157e308),X.write(t,e,n,i,52,8),n+8}function H(t){if(t=j(t).replace(tt,""),t.length<2)return"";for(;t.length%4!==0;)t+="=";return t}function j(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function G(t){return 16>t?"0"+t.toString(16):t.toString(16)}function Y(t,e){e=e||1/0;for(var n,i=t.length,r=null,o=[],s=0;i>s;s++){if(n=t.charCodeAt(s),n>55295&&57344>n){if(!r){if(n>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(s+1===i){(e-=3)>-1&&o.push(239,191,189);continue}r=n;continue}if(56320>n){(e-=3)>-1&&o.push(239,191,189),r=n;continue}n=(r-55296<<10|n-56320)+65536}else r&&(e-=3)>-1&&o.push(239,191,189);if(r=null,128>n){if((e-=1)<0)break;o.push(n)}else if(2048>n){if((e-=2)<0)break;o.push(n>>6|192,63&n|128)}else if(65536>n){if((e-=3)<0)break;o.push(n>>12|224,n>>6&63|128,63&n|128)}else{if(!(1114112>n))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(n>>18|240,n>>12&63|128,n>>6&63|128,63&n|128)}}return o}function V(t){for(var e=[],n=0;n<t.length;n++)e.push(255&t.charCodeAt(n));return e}function z(t,e){for(var n,i,r,o=[],s=0;s<t.length&&!((e-=2)<0);s++)n=t.charCodeAt(s),i=n>>8,r=n%256,o.push(r),o.push(i);return o}function W(t){return q.toByteArray(H(t))}function K(t,e,n,i){for(var r=0;i>r&&!(r+n>=e.length||r>=t.length);r++)e[r+n]=t[r];return r}/*!
		 * The buffer module from node.js, for the browser.
		 *
		 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
		 * @license  MIT
		 */
var q=n(71),X=n(72),$=n(73);e.Buffer=t,e.SlowBuffer=m,e.INSPECT_MAX_BYTES=50,t.poolSize=8192;var Z={};t.TYPED_ARRAY_SUPPORT=void 0!==i.TYPED_ARRAY_SUPPORT?i.TYPED_ARRAY_SUPPORT:r(),t.TYPED_ARRAY_SUPPORT&&(t.prototype.__proto__=Uint8Array.prototype,t.__proto__=Uint8Array),t.isBuffer=function(t){return!(null==t||!t._isBuffer)},t.compare=function(e,n){if(!t.isBuffer(e)||!t.isBuffer(n))throw new TypeError("Arguments must be Buffers");if(e===n)return 0;for(var i=e.length,r=n.length,o=0,s=Math.min(i,r);s>o&&e[o]===n[o];)++o;return o!==s&&(i=e[o],r=n[o]),r>i?-1:i>r?1:0},t.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},t.concat=function(e,n){if(!$(e))throw new TypeError("list argument must be an Array of Buffers.");if(0===e.length)return new t(0);var i;if(void 0===n)for(n=0,i=0;i<e.length;i++)n+=e[i].length;var r=new t(n),o=0;for(i=0;i<e.length;i++){var s=e[i];s.copy(r,o),o+=s.length}return r},t.byteLength=y,t.prototype.length=void 0,t.prototype.parent=void 0,t.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?I(this,0,t):v.apply(this,arguments)},t.prototype.equals=function(e){if(!t.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e?!0:0===t.compare(this,e)},t.prototype.inspect=function(){var t="",n=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,n).match(/.{2}/g).join(" "),this.length>n&&(t+=" ... ")),"<Buffer "+t+">"},t.prototype.compare=function(e){if(!t.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e?0:t.compare(this,e)},t.prototype.indexOf=function(e,n){function i(t,e,n){for(var i=-1,r=0;n+r<t.length;r++)if(t[n+r]===e[-1===i?0:r-i]){if(-1===i&&(i=r),r-i+1===e.length)return n+i}else i=-1;return-1}if(n>2147483647?n=2147483647:-2147483648>n&&(n=-2147483648),n>>=0,0===this.length)return-1;if(n>=this.length)return-1;if(0>n&&(n=Math.max(this.length+n,0)),"string"==typeof e)return 0===e.length?-1:String.prototype.indexOf.call(this,e,n);if(t.isBuffer(e))return i(this,e,n);if("number"==typeof e)return t.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,e,n):i(this,[e],n);throw new TypeError("val must be string, number or Buffer")},t.prototype.get=function(t){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(t)},t.prototype.set=function(t,e){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(t,e)},t.prototype.write=function(t,e,n,i){if(void 0===e)i="utf8",n=this.length,e=0;else if(void 0===n&&"string"==typeof e)i=e,n=this.length,e=0;else if(isFinite(e))e=0|e,isFinite(n)?(n=0|n,void 0===i&&(i="utf8")):(i=n,n=void 0);else{var r=i;i=e,e=0|n,n=r}var o=this.length-e;if((void 0===n||n>o)&&(n=o),t.length>0&&(0>n||0>e)||e>this.length)throw new RangeError("attempt to write outside buffer bounds");i||(i="utf8");for(var s=!1;;)switch(i){case"hex":return E(this,t,e,n);case"utf8":case"utf-8":return S(this,t,e,n);case"ascii":return A(this,t,e,n);case"binary":return w(this,t,e,n);case"base64":return T(this,t,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return b(this,t,e,n);default:if(s)throw new TypeError("Unknown encoding: "+i);i=(""+i).toLowerCase(),s=!0}},t.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var Q=4096;t.prototype.slice=function(e,n){var i=this.length;e=~~e,n=void 0===n?i:~~n,0>e?(e+=i,0>e&&(e=0)):e>i&&(e=i),0>n?(n+=i,0>n&&(n=0)):n>i&&(n=i),e>n&&(n=e);var r;if(t.TYPED_ARRAY_SUPPORT)r=t._augment(this.subarray(e,n));else{var o=n-e;r=new t(o,void 0);for(var s=0;o>s;s++)r[s]=this[s+e]}return r.length&&(r.parent=this.parent||this),r},t.prototype.readUIntLE=function(t,e,n){t=0|t,e=0|e,n||k(t,e,this.length);for(var i=this[t],r=1,o=0;++o<e&&(r*=256);)i+=this[t+o]*r;return i},t.prototype.readUIntBE=function(t,e,n){t=0|t,e=0|e,n||k(t,e,this.length);for(var i=this[t+--e],r=1;e>0&&(r*=256);)i+=this[t+--e]*r;return i},t.prototype.readUInt8=function(t,e){return e||k(t,1,this.length),this[t]},t.prototype.readUInt16LE=function(t,e){return e||k(t,2,this.length),this[t]|this[t+1]<<8},t.prototype.readUInt16BE=function(t,e){return e||k(t,2,this.length),this[t]<<8|this[t+1]},t.prototype.readUInt32LE=function(t,e){return e||k(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},t.prototype.readUInt32BE=function(t,e){return e||k(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},t.prototype.readIntLE=function(t,e,n){t=0|t,e=0|e,n||k(t,e,this.length);for(var i=this[t],r=1,o=0;++o<e&&(r*=256);)i+=this[t+o]*r;return r*=128,i>=r&&(i-=Math.pow(2,8*e)),i},t.prototype.readIntBE=function(t,e,n){t=0|t,e=0|e,n||k(t,e,this.length);for(var i=e,r=1,o=this[t+--i];i>0&&(r*=256);)o+=this[t+--i]*r;return r*=128,o>=r&&(o-=Math.pow(2,8*e)),o},t.prototype.readInt8=function(t,e){return e||k(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},t.prototype.readInt16LE=function(t,e){e||k(t,2,this.length);var n=this[t]|this[t+1]<<8;return 32768&n?4294901760|n:n},t.prototype.readInt16BE=function(t,e){e||k(t,2,this.length);var n=this[t+1]|this[t]<<8;return 32768&n?4294901760|n:n},t.prototype.readInt32LE=function(t,e){return e||k(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},t.prototype.readInt32BE=function(t,e){return e||k(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},t.prototype.readFloatLE=function(t,e){return e||k(t,4,this.length),X.read(this,t,!0,23,4)},t.prototype.readFloatBE=function(t,e){return e||k(t,4,this.length),X.read(this,t,!1,23,4)},t.prototype.readDoubleLE=function(t,e){return e||k(t,8,this.length),X.read(this,t,!0,52,8)},t.prototype.readDoubleBE=function(t,e){return e||k(t,8,this.length),X.read(this,t,!1,52,8)},t.prototype.writeUIntLE=function(t,e,n,i){t=+t,e=0|e,n=0|n,i||N(this,t,e,n,Math.pow(2,8*n),0);var r=1,o=0;for(this[e]=255&t;++o<n&&(r*=256);)this[e+o]=t/r&255;return e+n},t.prototype.writeUIntBE=function(t,e,n,i){t=+t,e=0|e,n=0|n,i||N(this,t,e,n,Math.pow(2,8*n),0);var r=n-1,o=1;for(this[e+r]=255&t;--r>=0&&(o*=256);)this[e+r]=t/o&255;return e+n},t.prototype.writeUInt8=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,1,255,0),t.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[n]=255&e,n+1},t.prototype.writeUInt16LE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,2,65535,0),t.TYPED_ARRAY_SUPPORT?(this[n]=255&e,this[n+1]=e>>>8):x(this,e,n,!0),n+2},t.prototype.writeUInt16BE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,2,65535,0),t.TYPED_ARRAY_SUPPORT?(this[n]=e>>>8,this[n+1]=255&e):x(this,e,n,!1),n+2},t.prototype.writeUInt32LE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,4,4294967295,0),t.TYPED_ARRAY_SUPPORT?(this[n+3]=e>>>24,this[n+2]=e>>>16,this[n+1]=e>>>8,this[n]=255&e):C(this,e,n,!0),n+4},t.prototype.writeUInt32BE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,4,4294967295,0),t.TYPED_ARRAY_SUPPORT?(this[n]=e>>>24,this[n+1]=e>>>16,this[n+2]=e>>>8,this[n+3]=255&e):C(this,e,n,!1),n+4},t.prototype.writeIntLE=function(t,e,n,i){if(t=+t,e=0|e,!i){var r=Math.pow(2,8*n-1);N(this,t,e,n,r-1,-r)}var o=0,s=1,a=0>t?1:0;for(this[e]=255&t;++o<n&&(s*=256);)this[e+o]=(t/s>>0)-a&255;return e+n},t.prototype.writeIntBE=function(t,e,n,i){if(t=+t,e=0|e,!i){var r=Math.pow(2,8*n-1);N(this,t,e,n,r-1,-r)}var o=n-1,s=1,a=0>t?1:0;for(this[e+o]=255&t;--o>=0&&(s*=256);)this[e+o]=(t/s>>0)-a&255;return e+n},t.prototype.writeInt8=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,1,127,-128),t.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),0>e&&(e=255+e+1),this[n]=255&e,n+1},t.prototype.writeInt16LE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,2,32767,-32768),t.TYPED_ARRAY_SUPPORT?(this[n]=255&e,this[n+1]=e>>>8):x(this,e,n,!0),n+2},t.prototype.writeInt16BE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,2,32767,-32768),t.TYPED_ARRAY_SUPPORT?(this[n]=e>>>8,this[n+1]=255&e):x(this,e,n,!1),n+2},t.prototype.writeInt32LE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,4,2147483647,-2147483648),t.TYPED_ARRAY_SUPPORT?(this[n]=255&e,this[n+1]=e>>>8,this[n+2]=e>>>16,this[n+3]=e>>>24):C(this,e,n,!0),n+4},t.prototype.writeInt32BE=function(e,n,i){return e=+e,n=0|n,i||N(this,e,n,4,2147483647,-2147483648),0>e&&(e=4294967295+e+1),t.TYPED_ARRAY_SUPPORT?(this[n]=e>>>24,this[n+1]=e>>>16,this[n+2]=e>>>8,this[n+3]=255&e):C(this,e,n,!1),n+4},t.prototype.writeFloatLE=function(t,e,n){return U(this,t,e,!0,n)},t.prototype.writeFloatBE=function(t,e,n){return U(this,t,e,!1,n)},t.prototype.writeDoubleLE=function(t,e,n){return B(this,t,e,!0,n)},t.prototype.writeDoubleBE=function(t,e,n){return B(this,t,e,!1,n)},t.prototype.copy=function(e,n,i,r){if(i||(i=0),r||0===r||(r=this.length),n>=e.length&&(n=e.length),n||(n=0),r>0&&i>r&&(r=i),r===i)return 0;if(0===e.length||0===this.length)return 0;if(0>n)throw new RangeError("targetStart out of bounds");if(0>i||i>=this.length)throw new RangeError("sourceStart out of bounds");if(0>r)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),e.length-n<r-i&&(r=e.length-n+i);var o,s=r-i;if(this===e&&n>i&&r>n)for(o=s-1;o>=0;o--)e[o+n]=this[o+i];else if(1e3>s||!t.TYPED_ARRAY_SUPPORT)for(o=0;s>o;o++)e[o+n]=this[o+i];else e._set(this.subarray(i,i+s),n);return s},t.prototype.fill=function(t,e,n){if(t||(t=0),e||(e=0),n||(n=this.length),e>n)throw new RangeError("end < start");if(n!==e&&0!==this.length){if(0>e||e>=this.length)throw new RangeError("start out of bounds");if(0>n||n>this.length)throw new RangeError("end out of bounds");var i;if("number"==typeof t)for(i=e;n>i;i++)this[i]=t;else{var r=Y(t.toString()),o=r.length;for(i=e;n>i;i++)this[i]=r[i%o]}return this}},t.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(t.TYPED_ARRAY_SUPPORT)return new t(this).buffer;for(var e=new Uint8Array(this.length),n=0,i=e.length;i>n;n+=1)e[n]=this[n];return e.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var J=t.prototype;t._augment=function(e){return e.constructor=t,e._isBuffer=!0,e._set=e.set,e.get=J.get,e.set=J.set,e.write=J.write,e.toString=J.toString,e.toLocaleString=J.toString,e.toJSON=J.toJSON,e.equals=J.equals,e.compare=J.compare,e.indexOf=J.indexOf,e.copy=J.copy,e.slice=J.slice,e.readUIntLE=J.readUIntLE,e.readUIntBE=J.readUIntBE,e.readUInt8=J.readUInt8,e.readUInt16LE=J.readUInt16LE,e.readUInt16BE=J.readUInt16BE,e.readUInt32LE=J.readUInt32LE,e.readUInt32BE=J.readUInt32BE,e.readIntLE=J.readIntLE,e.readIntBE=J.readIntBE,e.readInt8=J.readInt8,e.readInt16LE=J.readInt16LE,e.readInt16BE=J.readInt16BE,e.readInt32LE=J.readInt32LE,e.readInt32BE=J.readInt32BE,e.readFloatLE=J.readFloatLE,e.readFloatBE=J.readFloatBE,e.readDoubleLE=J.readDoubleLE,e.readDoubleBE=J.readDoubleBE,e.writeUInt8=J.writeUInt8,e.writeUIntLE=J.writeUIntLE,e.writeUIntBE=J.writeUIntBE,e.writeUInt16LE=J.writeUInt16LE,e.writeUInt16BE=J.writeUInt16BE,e.writeUInt32LE=J.writeUInt32LE,e.writeUInt32BE=J.writeUInt32BE,e.writeIntLE=J.writeIntLE,e.writeIntBE=J.writeIntBE,e.writeInt8=J.writeInt8,e.writeInt16LE=J.writeInt16LE,e.writeInt16BE=J.writeInt16BE,e.writeInt32LE=J.writeInt32LE,e.writeInt32BE=J.writeInt32BE,e.writeFloatLE=J.writeFloatLE,e.writeFloatBE=J.writeFloatBE,e.writeDoubleLE=J.writeDoubleLE,e.writeDoubleBE=J.writeDoubleBE,e.fill=J.fill,e.inspect=J.inspect,e.toArrayBuffer=J.toArrayBuffer,e};var tt=/[^+\/0-9A-Za-z-_]/g}).call(e,n(70).Buffer,function(){return this}())},function(t,e,n){var i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(t){"use strict";function e(t){var e=t.charCodeAt(0);return e===s||e===l?62:e===a||e===f?63:u>e?-1:u+10>e?e-u+26+26:c+26>e?e-c:h+26>e?e-h+26:void 0}function n(t){function n(t){h[l++]=t}var i,r,s,a,u,h;if(t.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var c=t.length;u="="===t.charAt(c-2)?2:"="===t.charAt(c-1)?1:0,h=new o(3*t.length/4-u),s=u>0?t.length-4:t.length;var l=0;for(i=0,r=0;s>i;i+=4,r+=3)a=e(t.charAt(i))<<18|e(t.charAt(i+1))<<12|e(t.charAt(i+2))<<6|e(t.charAt(i+3)),n((16711680&a)>>16),n((65280&a)>>8),n(255&a);return 2===u?(a=e(t.charAt(i))<<2|e(t.charAt(i+1))>>4,n(255&a)):1===u&&(a=e(t.charAt(i))<<10|e(t.charAt(i+1))<<4|e(t.charAt(i+2))>>2,n(a>>8&255),n(255&a)),h}function r(t){function e(t){return i.charAt(t)}function n(t){return e(t>>18&63)+e(t>>12&63)+e(t>>6&63)+e(63&t)}var r,o,s,a=t.length%3,u="";for(r=0,s=t.length-a;s>r;r+=3)o=(t[r]<<16)+(t[r+1]<<8)+t[r+2],u+=n(o);switch(a){case 1:o=t[t.length-1],u+=e(o>>2),u+=e(o<<4&63),u+="==";break;case 2:o=(t[t.length-2]<<8)+t[t.length-1],u+=e(o>>10),u+=e(o>>4&63),u+=e(o<<2&63),u+="="}return u}var o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="+".charCodeAt(0),a="/".charCodeAt(0),u="0".charCodeAt(0),h="a".charCodeAt(0),c="A".charCodeAt(0),l="-".charCodeAt(0),f="_".charCodeAt(0);t.toByteArray=n,t.fromByteArray=r}(e)},function(t,e){e.read=function(t,e,n,i,r){var o,s,a=8*r-i-1,u=(1<<a)-1,h=u>>1,c=-7,l=n?r-1:0,f=n?-1:1,d=t[e+l];for(l+=f,o=d&(1<<-c)-1,d>>=-c,c+=a;c>0;o=256*o+t[e+l],l+=f,c-=8);for(s=o&(1<<-c)-1,o>>=-c,c+=i;c>0;s=256*s+t[e+l],l+=f,c-=8);if(0===o)o=1-h;else{if(o===u)return s?NaN:(d?-1:1)*(1/0);s+=Math.pow(2,i),o-=h}return(d?-1:1)*s*Math.pow(2,o-i)},e.write=function(t,e,n,i,r,o){var s,a,u,h=8*o-r-1,c=(1<<h)-1,l=c>>1,f=23===r?Math.pow(2,-24)-Math.pow(2,-77):0,d=i?0:o-1,p=i?1:-1,g=0>e||0===e&&0>1/e?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(a=isNaN(e)?1:0,s=c):(s=Math.floor(Math.log(e)/Math.LN2),e*(u=Math.pow(2,-s))<1&&(s--,u*=2),e+=s+l>=1?f/u:f*Math.pow(2,1-l),e*u>=2&&(s++,u/=2),s+l>=c?(a=0,s=c):s+l>=1?(a=(e*u-1)*Math.pow(2,r),s+=l):(a=e*Math.pow(2,l-1)*Math.pow(2,r),s=0));r>=8;t[n+d]=255&a,d+=p,a/=256,r-=8);for(s=s<<r|a,h+=r;h>0;t[n+d]=255&s,d+=p,s/=256,h-=8);t[n+d-p]|=128*g}},function(t,e){var n=Array.isArray,i=Object.prototype.toString;t.exports=n||function(t){return!!t&&"[object Array]"==i.call(t)}},function(t,e,n){var i=n(75);t.exports=function(){i.loggingEnabled()&&console.log.apply(console,arguments)}},function(t,e){var n=!1;t.exports={loggingEnabled:function(t){return void 0!==t&&(n=t),n}}},function(t,e,n){function i(t,e,n){var i=o(t);return n&&s(t,e,n)&&(e=void 0),e?r(i,e):i}var r=n(77),o=n(83),s=n(84);t.exports=i},[131,78,79],3,[132,80,81,82],5,6,7,55,10,[130,86,92,88],[131,87,88],3,[132,89,90,91],5,6,7,[133,93,94,95],9,10,11,function(t,e){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function i(t){return"function"==typeof t}function r(t){return"number"==typeof t}function o(t){return"object"==typeof t&&null!==t}function s(t){return void 0===t}t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(t){if(!r(t)||0>t||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},n.prototype.emit=function(t){var e,n,r,a,u,h;if(this._events||(this._events={}),"error"===t&&(!this._events.error||o(this._events.error)&&!this._events.error.length)){if(e=arguments[1],e instanceof Error)throw e;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[t],s(n))return!1;if(i(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:a=Array.prototype.slice.call(arguments,1),n.apply(this,a)}else if(o(n))for(a=Array.prototype.slice.call(arguments,1),h=n.slice(),r=h.length,u=0;r>u;u++)h[u].apply(this,a);return!0},n.prototype.addListener=function(t,e){var r;if(!i(e))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,i(e.listener)?e.listener:e),this._events[t]?o(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,o(this._events[t])&&!this._events[t].warned&&(r=s(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,r&&r>0&&this._events[t].length>r&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),"function"==typeof console.trace&&console.trace())),this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(t,e){function n(){this.removeListener(t,n),r||(r=!0,e.apply(this,arguments))}if(!i(e))throw TypeError("listener must be a function");var r=!1;return n.listener=e,this.on(t,n),this},n.prototype.removeListener=function(t,e){var n,r,s,a;if(!i(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(n=this._events[t],s=n.length,r=-1,n===e||i(n.listener)&&n.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(o(n)){for(a=s;a-- >0;)if(n[a]===e||n[a].listener&&n[a].listener===e){r=a;break}if(0>r)return this;1===n.length?(n.length=0,delete this._events[t]):n.splice(r,1),this._events.removeListener&&this.emit("removeListener",t,e)}return this},n.prototype.removeAllListeners=function(t){var e,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[t],i(n))this.removeListener(t,n);else if(n)for(;n.length;)this.removeListener(t,n[n.length-1]);return delete this._events[t],this},n.prototype.listeners=function(t){var e;return e=this._events&&this._events[t]?i(this._events[t])?[this._events[t]]:this._events[t].slice():[]},n.prototype.listenerCount=function(t){if(this._events){var e=this._events[t];if(i(e))return 1;if(e)return e.length}return 0},n.listenerCount=function(t,e){return t.listenerCount(e)}},function(t,e,n){function i(){r.call(this)}t.exports=i;var r=n(96).EventEmitter,o=n(98);o(i,r),i.Readable=n(99),i.Writable=n(111),i.Duplex=n(112),i.Transform=n(113),i.PassThrough=n(114),i.Stream=i,i.prototype.pipe=function(t,e){function n(e){t.writable&&!1===t.write(e)&&h.pause&&h.pause()}function i(){h.readable&&h.resume&&h.resume()}function o(){c||(c=!0,t.end())}function s(){c||(c=!0,"function"==typeof t.destroy&&t.destroy())}function a(t){if(u(),0===r.listenerCount(this,"error"))throw t}function u(){h.removeListener("data",n),t.removeListener("drain",i),h.removeListener("end",o),h.removeListener("close",s),h.removeListener("error",a),t.removeListener("error",a),h.removeListener("end",u),h.removeListener("close",u),t.removeListener("close",u)}var h=this;h.on("data",n),t.on("drain",i),t._isStdio||e&&e.end===!1||(h.on("end",o),h.on("close",s));var c=!1;return h.on("error",a),t.on("error",a),h.on("end",u),h.on("close",u),t.on("close",u),t.emit("pipe",h),t}},function(t,e){"function"==typeof Object.create?t.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:t.exports=function(t,e){t.super_=e;var n=function(){};n.prototype=e.prototype,t.prototype=new n,t.prototype.constructor=t}},function(t,e,n){e=t.exports=n(100),e.Stream=n(97),e.Readable=e,e.Writable=n(107),e.Duplex=n(106),e.Transform=n(109),e.PassThrough=n(110)},function(t,e,n){(function(e){function i(t,e){var i=n(106);t=t||{};var r=t.highWaterMark,o=t.objectMode?16:16384;this.highWaterMark=r||0===r?r:o,this.highWaterMark=~~this.highWaterMark,this.buffer=[],this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.objectMode=!!t.objectMode,e instanceof i&&(this.objectMode=this.objectMode||!!t.readableObjectMode),this.defaultEncoding=t.defaultEncoding||"utf8",this.ranOut=!1,this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(L||(L=n(108).StringDecoder),this.decoder=new L(t.encoding),this.encoding=t.encoding)}function r(t){return n(106),this instanceof r?(this._readableState=new i(t,this),this.readable=!0,void P.call(this)):new r(t)}function o(t,e,n,i,r){var o=h(e,n);if(o)t.emit("error",o);else if(I.isNullOrUndefined(n))e.reading=!1,e.ended||c(t,e);else if(e.objectMode||n&&n.length>0)if(e.ended&&!r){var a=new Error("stream.push() after EOF");t.emit("error",a)}else if(e.endEmitted&&r){var a=new Error("stream.unshift() after end event");t.emit("error",a)}else!e.decoder||r||i||(n=e.decoder.write(n)),r||(e.reading=!1),e.flowing&&0===e.length&&!e.sync?(t.emit("data",n),t.read(0)):(e.length+=e.objectMode?1:n.length,r?e.buffer.unshift(n):e.buffer.push(n),e.needReadable&&l(t)),d(t,e);else r||(e.reading=!1);return s(e)}function s(t){return!t.ended&&(t.needReadable||t.length<t.highWaterMark||0===t.length)}function a(t){if(t>=R)t=R;else{t--;for(var e=1;32>e;e<<=1)t|=t>>e;t++}return t}function u(t,e){return 0===e.length&&e.ended?0:e.objectMode?0===t?0:1:isNaN(t)||I.isNull(t)?e.flowing&&e.buffer.length?e.buffer[0].length:e.length:0>=t?0:(t>e.highWaterMark&&(e.highWaterMark=a(t)),t>e.length?e.ended?e.length:(e.needReadable=!0,0):t)}function h(t,e){var n=null;return I.isBuffer(e)||I.isString(e)||I.isNullOrUndefined(e)||t.objectMode||(n=new TypeError("Invalid non-string/buffer chunk")),n}function c(t,e){if(e.decoder&&!e.ended){var n=e.decoder.end();n&&n.length&&(e.buffer.push(n),e.length+=e.objectMode?1:n.length)}e.ended=!0,l(t)}function l(t){var n=t._readableState;n.needReadable=!1,n.emittedReadable||(O("emitReadable",n.flowing),n.emittedReadable=!0,n.sync?e.nextTick(function(){f(t)}):f(t))}function f(t){O("emit readable"),t.emit("readable"),y(t)}function d(t,n){n.readingMore||(n.readingMore=!0,e.nextTick(function(){p(t,n)}))}function p(t,e){for(var n=e.length;!e.reading&&!e.flowing&&!e.ended&&e.length<e.highWaterMark&&(O("maybeReadMore read 0"),t.read(0),n!==e.length);)n=e.length;e.readingMore=!1}function g(t){return function(){var e=t._readableState;O("pipeOnDrain",e.awaitDrain),e.awaitDrain&&e.awaitDrain--,0===e.awaitDrain&&b.listenerCount(t,"data")&&(e.flowing=!0,y(t))}}function _(t,n){n.resumeScheduled||(n.resumeScheduled=!0,e.nextTick(function(){m(t,n)}))}function m(t,e){e.resumeScheduled=!1,t.emit("resume"),y(t),e.flowing&&!e.reading&&t.read(0)}function y(t){var e=t._readableState;if(O("flow",e.flowing),e.flowing)do var n=t.read();while(null!==n&&e.flowing)}function v(t,e){var n,i=e.buffer,r=e.length,o=!!e.decoder,s=!!e.objectMode;if(0===i.length)return null;if(0===r)n=null;else if(s)n=i.shift();else if(!t||t>=r)n=o?i.join(""):T.concat(i,r),i.length=0;else if(t<i[0].length){var a=i[0];n=a.slice(0,t),i[0]=a.slice(t)}else if(t===i[0].length)n=i.shift();else{n=o?"":new T(t);for(var u=0,h=0,c=i.length;c>h&&t>u;h++){var a=i[0],l=Math.min(t-u,a.length);o?n+=a.slice(0,l):a.copy(n,u,0,l),l<a.length?i[0]=a.slice(l):i.shift(),u+=l}}return n}function E(t){var n=t._readableState;if(n.length>0)throw new Error("endReadable called on non-empty stream");n.endEmitted||(n.ended=!0,e.nextTick(function(){n.endEmitted||0!==n.length||(n.endEmitted=!0,t.readable=!1,t.emit("end"))}))}function S(t,e){for(var n=0,i=t.length;i>n;n++)e(t[n],n)}function A(t,e){for(var n=0,i=t.length;i>n;n++)if(t[n]===e)return n;return-1}t.exports=r;var w=n(102),T=n(70).Buffer;r.ReadableState=i;var b=n(96).EventEmitter;b.listenerCount||(b.listenerCount=function(t,e){return t.listeners(e).length});var P=n(97),I=n(103);I.inherits=n(104);var L,O=n(105);O=O&&O.debuglog?O.debuglog("stream"):function(){},I.inherits(r,P),r.prototype.push=function(t,e){var n=this._readableState;return I.isString(t)&&!n.objectMode&&(e=e||n.defaultEncoding,e!==n.encoding&&(t=new T(t,e),e="")),o(this,n,t,e,!1)},r.prototype.unshift=function(t){var e=this._readableState;return o(this,e,t,"",!0)},r.prototype.setEncoding=function(t){return L||(L=n(108).StringDecoder),this._readableState.decoder=new L(t),this._readableState.encoding=t,this};var R=8388608;r.prototype.read=function(t){O("read",t);var e=this._readableState,n=t;if((!I.isNumber(t)||t>0)&&(e.emittedReadable=!1),0===t&&e.needReadable&&(e.length>=e.highWaterMark||e.ended))return O("read: emitReadable",e.length,e.ended),0===e.length&&e.ended?E(this):l(this),null;if(t=u(t,e),0===t&&e.ended)return 0===e.length&&E(this),null;var i=e.needReadable;O("need readable",i),(0===e.length||e.length-t<e.highWaterMark)&&(i=!0,O("length less than watermark",i)),(e.ended||e.reading)&&(i=!1,O("reading or ended",i)),i&&(O("do read"),e.reading=!0,e.sync=!0,0===e.length&&(e.needReadable=!0),this._read(e.highWaterMark),e.sync=!1),i&&!e.reading&&(t=u(n,e));var r;return r=t>0?v(t,e):null,I.isNull(r)&&(e.needReadable=!0,t=0),e.length-=t,0!==e.length||e.ended||(e.needReadable=!0),n!==t&&e.ended&&0===e.length&&E(this),I.isNull(r)||this.emit("data",r),r},r.prototype._read=function(t){this.emit("error",new Error("not implemented"))},r.prototype.pipe=function(t,n){function i(t){O("onunpipe"),t===l&&o()}function r(){O("onend"),t.end()}function o(){O("cleanup"),t.removeListener("close",u),t.removeListener("finish",h),t.removeListener("drain",_),t.removeListener("error",a),t.removeListener("unpipe",i),l.removeListener("end",r),l.removeListener("end",o),l.removeListener("data",s),!f.awaitDrain||t._writableState&&!t._writableState.needDrain||_()}function s(e){O("ondata");var n=t.write(e);!1===n&&(O("false write response, pause",l._readableState.awaitDrain),l._readableState.awaitDrain++,l.pause())}function a(e){O("onerror",e),c(),t.removeListener("error",a),0===b.listenerCount(t,"error")&&t.emit("error",e)}function u(){t.removeListener("finish",h),c()}function h(){O("onfinish"),t.removeListener("close",u),c()}function c(){O("unpipe"),l.unpipe(t)}var l=this,f=this._readableState;switch(f.pipesCount){case 0:f.pipes=t;break;case 1:f.pipes=[f.pipes,t];break;default:f.pipes.push(t)}f.pipesCount+=1,O("pipe count=%d opts=%j",f.pipesCount,n);var d=(!n||n.end!==!1)&&t!==e.stdout&&t!==e.stderr,p=d?r:o;f.endEmitted?e.nextTick(p):l.once("end",p),t.on("unpipe",i);var _=g(l);return t.on("drain",_),l.on("data",s),t._events&&t._events.error?w(t._events.error)?t._events.error.unshift(a):t._events.error=[a,t._events.error]:t.on("error",a),t.once("close",u),t.once("finish",h),t.emit("pipe",l),f.flowing||(O("pipe resume"),l.resume()),t},r.prototype.unpipe=function(t){var e=this._readableState;if(0===e.pipesCount)return this;if(1===e.pipesCount)return t&&t!==e.pipes?this:(t||(t=e.pipes),e.pipes=null,e.pipesCount=0,e.flowing=!1,t&&t.emit("unpipe",this),this);if(!t){var n=e.pipes,i=e.pipesCount;e.pipes=null,e.pipesCount=0,e.flowing=!1;for(var r=0;i>r;r++)n[r].emit("unpipe",this);return this}var r=A(e.pipes,t);return-1===r?this:(e.pipes.splice(r,1),e.pipesCount-=1,1===e.pipesCount&&(e.pipes=e.pipes[0]),t.emit("unpipe",this),this)},r.prototype.on=function(t,n){var i=P.prototype.on.call(this,t,n);if("data"===t&&!1!==this._readableState.flowing&&this.resume(),"readable"===t&&this.readable){var r=this._readableState;if(!r.readableListening)if(r.readableListening=!0,r.emittedReadable=!1,r.needReadable=!0,r.reading)r.length&&l(this,r);else{var o=this;e.nextTick(function(){O("readable nexttick read 0"),o.read(0)})}}return i},r.prototype.addListener=r.prototype.on,r.prototype.resume=function(){var t=this._readableState;return t.flowing||(O("resume"),t.flowing=!0,t.reading||(O("resume read 0"),this.read(0)),_(this,t)),this},r.prototype.pause=function(){return O("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(O("pause"),this._readableState.flowing=!1,this.emit("pause")),this},r.prototype.wrap=function(t){var e=this._readableState,n=!1,i=this;t.on("end",function(){if(O("wrapped end"),e.decoder&&!e.ended){var t=e.decoder.end();t&&t.length&&i.push(t)}i.push(null)}),t.on("data",function(r){if(O("wrapped data"),e.decoder&&(r=e.decoder.write(r)),r&&(e.objectMode||r.length)){var o=i.push(r);o||(n=!0,t.pause())}});for(var r in t)I.isFunction(t[r])&&I.isUndefined(this[r])&&(this[r]=function(e){return function(){return t[e].apply(t,arguments)}}(r));var o=["error","close","destroy","pause","resume"];return S(o,function(e){t.on(e,i.emit.bind(i,e))}),i._read=function(e){O("wrapped _read",e),n&&(n=!1,t.resume())},i},r._fromList=v}).call(e,n(101))},function(t,e){function n(){h=!1,s.length?u=s.concat(u):c=-1,u.length&&i()}function i(){if(!h){var t=setTimeout(n);h=!0;for(var e=u.length;e;){for(s=u,u=[];++c<e;)s&&s[c].run();c=-1,e=u.length}s=null,h=!1,clearTimeout(t)}}function r(t,e){this.fun=t,this.array=e}function o(){}var s,a=t.exports={},u=[],h=!1,c=-1;a.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];u.push(new r(t,e)),1!==u.length||h||setTimeout(i,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=o,a.addListener=o,a.once=o,a.off=o,a.removeListener=o,a.removeAllListeners=o,a.emit=o,a.binding=function(t){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(t){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(t,e){t.exports=Array.isArray||function(t){return"[object Array]"==Object.prototype.toString.call(t)}},function(t,e,n){(function(t){function n(t){return Array.isArray?Array.isArray(t):"[object Array]"===_(t)}function i(t){return"boolean"==typeof t}function r(t){return null===t}function o(t){return null==t}function s(t){return"number"==typeof t}function a(t){return"string"==typeof t}function u(t){return"symbol"==typeof t}function h(t){return void 0===t}function c(t){return"[object RegExp]"===_(t)}function l(t){return"object"==typeof t&&null!==t}function f(t){return"[object Date]"===_(t)}function d(t){return"[object Error]"===_(t)||t instanceof Error}function p(t){return"function"==typeof t}function g(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||"undefined"==typeof t}function _(t){return Object.prototype.toString.call(t)}e.isArray=n,e.isBoolean=i,e.isNull=r,e.isNullOrUndefined=o,e.isNumber=s,e.isString=a,e.isSymbol=u,e.isUndefined=h,e.isRegExp=c,e.isObject=l,e.isDate=f,e.isError=d,e.isFunction=p,e.isPrimitive=g,e.isBuffer=t.isBuffer}).call(e,n(70).Buffer)},98,function(t,e){},function(t,e,n){(function(e){function i(t){return this instanceof i?(u.call(this,t),h.call(this,t),t&&t.readable===!1&&(this.readable=!1),t&&t.writable===!1&&(this.writable=!1),this.allowHalfOpen=!0,t&&t.allowHalfOpen===!1&&(this.allowHalfOpen=!1),void this.once("end",r)):new i(t)}function r(){this.allowHalfOpen||this._writableState.ended||e.nextTick(this.end.bind(this))}function o(t,e){for(var n=0,i=t.length;i>n;n++)e(t[n],n)}t.exports=i;var s=Object.keys||function(t){var e=[];for(var n in t)e.push(n);return e},a=n(103);a.inherits=n(104);var u=n(100),h=n(107);a.inherits(i,u),o(s(h.prototype),function(t){i.prototype[t]||(i.prototype[t]=h.prototype[t])})}).call(e,n(101))},function(t,e,n){(function(e){function i(t,e,n){this.chunk=t,this.encoding=e,this.callback=n}function r(t,e){var i=n(106);t=t||{};var r=t.highWaterMark,o=t.objectMode?16:16384;this.highWaterMark=r||0===r?r:o,this.objectMode=!!t.objectMode,e instanceof i&&(this.objectMode=this.objectMode||!!t.writableObjectMode),this.highWaterMark=~~this.highWaterMark,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1;var s=t.decodeStrings===!1;this.decodeStrings=!s,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(t){d(e,t)},this.writecb=null,this.writelen=0,this.buffer=[],this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1}function o(t){var e=n(106);return this instanceof o||this instanceof e?(this._writableState=new r(t,this),this.writable=!0,void w.call(this)):new o(t)}function s(t,n,i){var r=new Error("write after end");
t.emit("error",r),e.nextTick(function(){i(r)})}function a(t,n,i,r){var o=!0;if(!(A.isBuffer(i)||A.isString(i)||A.isNullOrUndefined(i)||n.objectMode)){var s=new TypeError("Invalid non-string/buffer chunk");t.emit("error",s),e.nextTick(function(){r(s)}),o=!1}return o}function u(t,e,n){return!t.objectMode&&t.decodeStrings!==!1&&A.isString(e)&&(e=new S(e,n)),e}function h(t,e,n,r,o){n=u(e,n,r),A.isBuffer(n)&&(r="buffer");var s=e.objectMode?1:n.length;e.length+=s;var a=e.length<e.highWaterMark;return a||(e.needDrain=!0),e.writing||e.corked?e.buffer.push(new i(n,r,o)):c(t,e,!1,s,n,r,o),a}function c(t,e,n,i,r,o,s){e.writelen=i,e.writecb=s,e.writing=!0,e.sync=!0,n?t._writev(r,e.onwrite):t._write(r,o,e.onwrite),e.sync=!1}function l(t,n,i,r,o){i?e.nextTick(function(){n.pendingcb--,o(r)}):(n.pendingcb--,o(r)),t._writableState.errorEmitted=!0,t.emit("error",r)}function f(t){t.writing=!1,t.writecb=null,t.length-=t.writelen,t.writelen=0}function d(t,n){var i=t._writableState,r=i.sync,o=i.writecb;if(f(i),n)l(t,i,r,n,o);else{var s=m(t,i);s||i.corked||i.bufferProcessing||!i.buffer.length||_(t,i),r?e.nextTick(function(){p(t,i,s,o)}):p(t,i,s,o)}}function p(t,e,n,i){n||g(t,e),e.pendingcb--,i(),v(t,e)}function g(t,e){0===e.length&&e.needDrain&&(e.needDrain=!1,t.emit("drain"))}function _(t,e){if(e.bufferProcessing=!0,t._writev&&e.buffer.length>1){for(var n=[],i=0;i<e.buffer.length;i++)n.push(e.buffer[i].callback);e.pendingcb++,c(t,e,!0,e.length,e.buffer,"",function(t){for(var i=0;i<n.length;i++)e.pendingcb--,n[i](t)}),e.buffer=[]}else{for(var i=0;i<e.buffer.length;i++){var r=e.buffer[i],o=r.chunk,s=r.encoding,a=r.callback,u=e.objectMode?1:o.length;if(c(t,e,!1,u,o,s,a),e.writing){i++;break}}i<e.buffer.length?e.buffer=e.buffer.slice(i):e.buffer.length=0}e.bufferProcessing=!1}function m(t,e){return e.ending&&0===e.length&&!e.finished&&!e.writing}function y(t,e){e.prefinished||(e.prefinished=!0,t.emit("prefinish"))}function v(t,e){var n=m(t,e);return n&&(0===e.pendingcb?(y(t,e),e.finished=!0,t.emit("finish")):y(t,e)),n}function E(t,n,i){n.ending=!0,v(t,n),i&&(n.finished?e.nextTick(i):t.once("finish",i)),n.ended=!0}t.exports=o;var S=n(70).Buffer;o.WritableState=r;var A=n(103);A.inherits=n(104);var w=n(97);A.inherits(o,w),o.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe. Not readable."))},o.prototype.write=function(t,e,n){var i=this._writableState,r=!1;return A.isFunction(e)&&(n=e,e=null),A.isBuffer(t)?e="buffer":e||(e=i.defaultEncoding),A.isFunction(n)||(n=function(){}),i.ended?s(this,i,n):a(this,i,t,n)&&(i.pendingcb++,r=h(this,i,t,e,n)),r},o.prototype.cork=function(){var t=this._writableState;t.corked++},o.prototype.uncork=function(){var t=this._writableState;t.corked&&(t.corked--,t.writing||t.corked||t.finished||t.bufferProcessing||!t.buffer.length||_(this,t))},o.prototype._write=function(t,e,n){n(new Error("not implemented"))},o.prototype._writev=null,o.prototype.end=function(t,e,n){var i=this._writableState;A.isFunction(t)?(n=t,t=null,e=null):A.isFunction(e)&&(n=e,e=null),A.isNullOrUndefined(t)||this.write(t,e),i.corked&&(i.corked=1,this.uncork()),i.ending||i.finished||E(this,i,n)}}).call(e,n(101))},function(t,e,n){function i(t){if(t&&!u(t))throw new Error("Unknown encoding: "+t)}function r(t){return t.toString(this.encoding)}function o(t){this.charReceived=t.length%2,this.charLength=this.charReceived?2:0}function s(t){this.charReceived=t.length%3,this.charLength=this.charReceived?3:0}var a=n(70).Buffer,u=a.isEncoding||function(t){switch(t&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}},h=e.StringDecoder=function(t){switch(this.encoding=(t||"utf8").toLowerCase().replace(/[-_]/,""),i(t),this.encoding){case"utf8":this.surrogateSize=3;break;case"ucs2":case"utf16le":this.surrogateSize=2,this.detectIncompleteChar=o;break;case"base64":this.surrogateSize=3,this.detectIncompleteChar=s;break;default:return void(this.write=r)}this.charBuffer=new a(6),this.charReceived=0,this.charLength=0};h.prototype.write=function(t){for(var e="";this.charLength;){var n=t.length>=this.charLength-this.charReceived?this.charLength-this.charReceived:t.length;if(t.copy(this.charBuffer,this.charReceived,0,n),this.charReceived+=n,this.charReceived<this.charLength)return"";t=t.slice(n,t.length),e=this.charBuffer.slice(0,this.charLength).toString(this.encoding);var i=e.charCodeAt(e.length-1);if(!(i>=55296&&56319>=i)){if(this.charReceived=this.charLength=0,0===t.length)return e;break}this.charLength+=this.surrogateSize,e=""}this.detectIncompleteChar(t);var r=t.length;this.charLength&&(t.copy(this.charBuffer,0,t.length-this.charReceived,r),r-=this.charReceived),e+=t.toString(this.encoding,0,r);var r=e.length-1,i=e.charCodeAt(r);if(i>=55296&&56319>=i){var o=this.surrogateSize;return this.charLength+=o,this.charReceived+=o,this.charBuffer.copy(this.charBuffer,o,0,o),t.copy(this.charBuffer,0,0,o),e.substring(0,r)}return e},h.prototype.detectIncompleteChar=function(t){for(var e=t.length>=3?3:t.length;e>0;e--){var n=t[t.length-e];if(1==e&&n>>5==6){this.charLength=2;break}if(2>=e&&n>>4==14){this.charLength=3;break}if(3>=e&&n>>3==30){this.charLength=4;break}}this.charReceived=e},h.prototype.end=function(t){var e="";if(t&&t.length&&(e=this.write(t)),this.charReceived){var n=this.charReceived,i=this.charBuffer,r=this.encoding;e+=i.slice(0,n).toString(r)}return e}},function(t,e,n){function i(t,e){this.afterTransform=function(t,n){return r(e,t,n)},this.needTransform=!1,this.transforming=!1,this.writecb=null,this.writechunk=null}function r(t,e,n){var i=t._transformState;i.transforming=!1;var r=i.writecb;if(!r)return t.emit("error",new Error("no writecb in Transform class"));i.writechunk=null,i.writecb=null,u.isNullOrUndefined(n)||t.push(n),r&&r(e);var o=t._readableState;o.reading=!1,(o.needReadable||o.length<o.highWaterMark)&&t._read(o.highWaterMark)}function o(t){if(!(this instanceof o))return new o(t);a.call(this,t),this._transformState=new i(t,this);var e=this;this._readableState.needReadable=!0,this._readableState.sync=!1,this.once("prefinish",function(){u.isFunction(this._flush)?this._flush(function(t){s(e,t)}):s(e)})}function s(t,e){if(e)return t.emit("error",e);var n=t._writableState,i=t._transformState;if(n.length)throw new Error("calling transform done when ws.length != 0");if(i.transforming)throw new Error("calling transform done when still transforming");return t.push(null)}t.exports=o;var a=n(106),u=n(103);u.inherits=n(104),u.inherits(o,a),o.prototype.push=function(t,e){return this._transformState.needTransform=!1,a.prototype.push.call(this,t,e)},o.prototype._transform=function(t,e,n){throw new Error("not implemented")},o.prototype._write=function(t,e,n){var i=this._transformState;if(i.writecb=n,i.writechunk=t,i.writeencoding=e,!i.transforming){var r=this._readableState;(i.needTransform||r.needReadable||r.length<r.highWaterMark)&&this._read(r.highWaterMark)}},o.prototype._read=function(t){var e=this._transformState;u.isNull(e.writechunk)||!e.writecb||e.transforming?e.needTransform=!0:(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform))}},function(t,e,n){function i(t){return this instanceof i?void r.call(this,t):new i(t)}t.exports=i;var r=n(109),o=n(103);o.inherits=n(104),o.inherits(i,r),i.prototype._transform=function(t,e,n){n(null,t)}},function(t,e,n){t.exports=n(107)},function(t,e,n){t.exports=n(106)},function(t,e,n){t.exports=n(109)},function(t,e,n){t.exports=n(110)},function(t,e,n){(function(e){var i,r=n(74),o=n(69),s=(o.BaseTransform,o.BaseParser),a=n(116);t.exports=i=function(t,e){o.BaseParser.prototype.constructor.apply(this,arguments),t||(t={audioTrackId:-1,videoTrackId:-1,tracks:[]}),this.muxer=new a(t),this.muxer.ondata=this._onMp4Data.bind(this),this.muxer.oncodecinfo=this._onCodecInfo.bind(this),this._codecInfo=null,this._timestamp=0,e&&(this.worker="undefined"!=typeof Worker?new Worker("/dist/mp4-mux-worker-bundle.js"):null),this.worker&&(this.worker.onmessage=function(t){this._onMp4Data(t.data)}.bind(this),this.worker.postMessage({mp4MuxProfile:t}))},i.Profiles=a.Profiles,i.prototype=o.createBaseParser({constructor:i,_onMp4Data:function(t){r("_onMp4Data"),this.enqueue(new o.Transfer(new e(t),"buffer"))},_onCodecInfo:function(t){r("Codec info: "+t),this._codecInfo=t},_onFinish:function(t){r("MP4Mux._onFinish"),this.worker?this.worker.postMessage({eos:!0}):this.muxer&&this.muxer.flush(),s.prototype._onFinish.call(this,t)},_parse:function(t){var e;t.data&&(e=this._timestamp=t.data.timestamp),t.data.flush&&(this._needFlush=!0),r("UnitMP4Mux Timestamp: "+this._timestamp),r("UnitMP4Mux._parse: Payload type: "+typeof t.data),this.worker?(t.data.empty||this.worker.postMessage({data:t.data,meta:t.data.meta,timestamp:e,packetType:a.TYPE_AUDIO_PACKET}),this._needFlush&&(this.worker.postMessage({eos:!0}),this._needFlush=!1)):this.muxer&&(t.data.empty||this.muxer.pushPacket(a.TYPE_AUDIO_PACKET,new Uint8Array(t.data),e,t.data.meta),this._needFlush&&(this.muxer.flush(),this._needFlush=!1))}})}).call(e,n(70).Buffer)},function(t,e,n){function i(t){for(var e=t.length>>1,n=new Uint8Array(e),i=0;e>i;i++)n[i]=parseInt(t.substr(2*i,2),16);return n}function r(t,e){var n,i=0,r=s.RAW;switch(e.codecId){case l:var o=t[i++];r=o,n=1024;break;case c:var u=t[i+1]>>3&3,f=t[i+1]>>1&3;n=1===f?3===u?1152:576:3===f?384:1152}return info={codecDescription:h[e.codecId],codecId:e.codecId,data:t.subarray(i),rate:e.sampleRate,size:e.sampleSize,channels:e.channels,samples:n,packetType:r},a("parsed audio packet with %d samples",n),info}function o(t){var e=0,n=t[e]>>4,i=15&t[e];e++;var r={frameType:n,codecId:i,codecDescription:d[i]};switch(i){case g:var o=t[e++];r.packetType=o,r.compositionTime=(t[e]<<24|t[e+1]<<16|t[e+2]<<8)>>8,e+=3;break;case p:r.packetType=_.NALU,r.horizontalOffset=t[e]>>4&15,r.verticalOffset=15&t[e],r.compositionTime=0,e++}return r.data=t.subarray(e),r}var s,a=n(74),u=n(117),h=["PCM","ADPCM","MP3","PCM le","Nellymouser16","Nellymouser8","Nellymouser","G.711 A-law","G.711 mu-law",null,"AAC","Speex","MP3 8khz"],c=2,l=10;!function(t){t[t.HEADER=0]="HEADER",t[t.RAW=1]="RAW"}(s||(s={}));var f,d=[null,"JPEG","Sorenson","Screen","VP6","VP6 alpha","Screen2","AVC"],p=4,g=7;!function(t){t[t.KEY=1]="KEY",t[t.INNER=2]="INNER",t[t.DISPOSABLE=3]="DISPOSABLE",t[t.GENERATED=4]="GENERATED",t[t.INFO=5]="INFO"}(f||(f={}));var _;!function(t){t[t.HEADER=0]="HEADER",t[t.NALU=1]="NALU",t[t.END=2]="END"}(_||(_={}));var m,y=8,v=9,E=!0;!function(t){t[t.CAN_GENERATE_HEADER=0]="CAN_GENERATE_HEADER",t[t.NEED_HEADER_DATA=1]="NEED_HEADER_DATA",t[t.MAIN_PACKETS=2]="MAIN_PACKETS"}(m||(m={}));var S=function(){function t(t){var e=this;this.oncodecinfo=function(t){throw new Error("MP4Mux.oncodecinfo is not set")},this.ondata=function(t){throw new Error("MP4Mux.ondata is not set")},this.metadata=t,this.trackStates=this.metadata.tracks.map(function(t,n){var i={trackId:n+1,trackInfo:t,cachedDuration:0,samplesProcessed:0,initializationData:[]};return e.metadata.audioTrackId===n&&(e.audioTrackState=i),e.metadata.videoTrackId===n&&(e.videoTrackState=i),i},this),this._checkIfNeedHeaderData(),this.filePos=0,this.cachedPackets=[],this.chunkIndex=0}return t.prototype.pushPacket=function(t,e,n,i){switch(this.state===m.CAN_GENERATE_HEADER&&this._tryGenerateHeader(),t){case y:var a=this.audioTrackState,u=r(e,i);if(!a||a.trackInfo.codecId!==u.codecId)throw new Error("Unexpected audio packet codec: "+u.codecDescription);switch(u.codecId){default:throw new Error("Unsupported audio codec: "+u.codecDescription);case c:break;case l:if(u.packetType===s.HEADER)return void a.initializationData.push(u.data)}this.cachedPackets.push({packet:u,timestamp:n,trackId:a.trackId});break;case v:var h=this.videoTrackState,f=o(e);if(!h||h.trackInfo.codecId!==f.codecId)throw new Error("Unexpected video packet codec: "+f.codecDescription);switch(f.codecId){default:throw new Error("unsupported video codec: "+f.codecDescription);case p:break;case g:if(f.packetType===_.HEADER)return void h.initializationData.push(f.data)}this.cachedPackets.push({packet:f,timestamp:n,trackId:h.trackId});break;default:throw new Error("unknown packet type: "+t)}this.state===m.NEED_HEADER_DATA&&this._tryGenerateHeader()},t.prototype.flush=function(){this.cachedPackets.length>0&&this._chunk()},t.prototype._checkIfNeedHeaderData=function(){this.trackStates.some(function(t){return t.trackInfo.codecId===l||t.trackInfo.codecId===g})?this.state=m.NEED_HEADER_DATA:this.state=m.CAN_GENERATE_HEADER},t.prototype._tryGenerateHeader=function(){var t=this.trackStates.every(function(t){switch(t.trackInfo.codecId){case l:case g:return t.initializationData.length>0;default:return!0}});if(t){for(var e=["isom"],n=1,r=1,o=[],s=0;s<this.trackStates.length;s++){var a,h=this.trackStates[s],f=h.trackInfo;switch(f.codecId){case l:var d=h.initializationData[0];a=new u.AudioSampleEntry("mp4a",n,f.channels,f.samplesize,f.samplerate);var _=new Uint8Array(41+d.length);_.set(i("0000000003808080"),0),_[8]=32+d.length,_.set(i("00020004808080"),9),_[16]=18+d.length,_.set(i("40150000000000FA000000000005808080"),17),_[34]=d.length,_.set(d,35),_.set(i("068080800102"),35+d.length),a.otherBoxes=[new u.RawTag("esds",_)];var y=d[0]>>3;h.mimeTypeCodec="mp4a.40."+y;break;case c:a=new u.AudioSampleEntry(".mp3",n,f.channels,f.samplesize,f.samplerate),h.mimeTypeCodec="mp3";break;case g:var v=h.initializationData[0];a=new u.VideoSampleEntry("avc1",r,f.width,f.height),a.otherBoxes=[new u.RawTag("avcC",v)];var E=v[1]<<16|v[2]<<8|v[3];h.mimeTypeCodec="avc1."+(16777216|E).toString(16).substr(1),e.push("iso2","avc1","mp41");break;case p:a=new u.VideoSampleEntry("VP6F",r,f.width,f.height),a.otherBoxes=[new u.RawTag("glbl",i("00"))],h.mimeTypeCodec="avc1.42001E";break;default:throw new Error("not supported track type")}var S,A=u.TrackHeaderFlags.TRACK_ENABLED|u.TrackHeaderFlags.TRACK_IN_MOVIE;h===this.audioTrackState?S=new u.TrackBox(new u.TrackHeaderBox(A,h.trackId,-1,0,0,1,s),new u.MediaBox(new u.MediaHeaderBox(f.timescale,-1,f.language),new u.HandlerBox("soun","SoundHandler"),new u.MediaInformationBox(new u.SoundMediaHeaderBox,new u.DataInformationBox(new u.DataReferenceBox([new u.DataEntryUrlBox(u.SELF_CONTAINED_DATA_REFERENCE_FLAG)])),new u.SampleTableBox(new u.SampleDescriptionBox([a]),new u.RawTag("stts",i("0000000000000000")),new u.RawTag("stsc",i("0000000000000000")),new u.RawTag("stsz",i("000000000000000000000000")),new u.RawTag("stco",i("0000000000000000")))))):h===this.videoTrackState&&(S=new u.TrackBox(new u.TrackHeaderBox(A,h.trackId,-1,f.width,f.height,0,s),new u.MediaBox(new u.MediaHeaderBox(f.timescale,-1,f.language),new u.HandlerBox("vide","VideoHandler"),new u.MediaInformationBox(new u.VideoMediaHeaderBox,new u.DataInformationBox(new u.DataReferenceBox([new u.DataEntryUrlBox(u.SELF_CONTAINED_DATA_REFERENCE_FLAG)])),new u.SampleTableBox(new u.SampleDescriptionBox([a]),new u.RawTag("stts",i("0000000000000000")),new u.RawTag("stsc",i("0000000000000000")),new u.RawTag("stsz",i("000000000000000000000000")),new u.RawTag("stco",i("0000000000000000"))))))),o.push(S)}var w=new u.MovieExtendsBox(null,[new u.TrackExtendsBox(1,1,0,0,0),new u.TrackExtendsBox(2,1,0,0,0)],null),T=new u.BoxContainerBox("udat",[new u.MetaBox(new u.RawTag("hdlr",i("00000000000000006D6469726170706C000000000000000000")),[new u.RawTag("ilst",i("00000025A9746F6F0000001D6461746100000001000000004C61766635342E36332E313034"))])]),b=new u.MovieHeaderBox(1e3,0,this.trackStates.length+1),P=new u.MovieBox(b,o,w,T),I=new u.FileTypeBox("isom",512,e),L=I.layout(0),O=P.layout(L),R=new Uint8Array(L+O);I.write(R),P.write(R),this.oncodecinfo(this.trackStates.map(function(t){return t.mimeTypeCodec})),this.ondata(R),this.filePos+=R.length,this.state=m.MAIN_PACKETS}},t.prototype._chunk=function(){var t=this.cachedPackets;if(E&&this.videoTrackState){for(var e=t.length-1,n=this.videoTrackState.trackId;e>0&&(t[e].trackId!==n||t[e].packet.frameType!==f.KEY);)e--;e>0&&(t=t.slice(0,e))}if(0!==t.length){for(var i=[],r=0,o=[],s=[],a=0;a<this.trackStates.length;a++){var h=this.trackStates[a],d=h.trackInfo,_=h.trackId,m=t.filter(function(t){return t.trackId===_});if(0!==m.length){var y,v,S,A=new u.TrackFragmentBaseMediaDecodeTimeBox(h.cachedDuration);switch(s.push(r),d.codecId){case l:case c:S=[];for(var e=0;e<m.length;e++){var w=m[e].packet,T=Math.round(w.samples*d.timescale/d.samplerate);i.push(w.data),r+=w.data.length,S.push({duration:T,size:w.data.length}),h.samplesProcessed+=w.samples}var b=u.TrackFragmentFlags.DEFAULT_SAMPLE_FLAGS_PRESENT;y=new u.TrackFragmentHeaderBox(b,_,0,0,0,0,u.SampleFlags.SAMPLE_DEPENDS_ON_NO_OTHERS);var P=u.TrackRunFlags.DATA_OFFSET_PRESENT|u.TrackRunFlags.SAMPLE_DURATION_PRESENT|u.TrackRunFlags.SAMPLE_SIZE_PRESENT;v=new u.TrackRunBox(P,S,0,0),h.cachedDuration=Math.round(h.samplesProcessed*d.timescale/d.samplerate);break;case g:case p:S=[];for(var I=h.samplesProcessed,L=I*d.timescale/d.framerate,O=Math.round(L),e=0;e<m.length;e++){var R=m[e].packet;I++;var D=Math.round(I*d.timescale/d.framerate),M=D-O;O=D;var k=Math.round(I*d.timescale/d.framerate+R.compositionTime*d.timescale/1e3);i.push(R.data),r+=R.data.length;var N=R.frameType===f.KEY?u.SampleFlags.SAMPLE_DEPENDS_ON_NO_OTHERS:u.SampleFlags.SAMPLE_DEPENDS_ON_OTHER|u.SampleFlags.SAMPLE_IS_NOT_SYNC;S.push({duration:M,size:R.data.length,flags:N,compositionTimeOffset:k-D})}var b=u.TrackFragmentFlags.DEFAULT_SAMPLE_FLAGS_PRESENT;y=new u.TrackFragmentHeaderBox(b,_,0,0,0,0,u.SampleFlags.SAMPLE_DEPENDS_ON_NO_OTHERS);var P=u.TrackRunFlags.DATA_OFFSET_PRESENT|u.TrackRunFlags.SAMPLE_DURATION_PRESENT|u.TrackRunFlags.SAMPLE_SIZE_PRESENT|u.TrackRunFlags.SAMPLE_FLAGS_PRESENT|u.TrackRunFlags.SAMPLE_COMPOSITION_TIME_OFFSET;v=new u.TrackRunBox(P,S,0,0),h.cachedDuration=O,h.samplesProcessed=I;break;default:throw new Error("Un codec")}var x=new u.TrackFragmentBox(y,A,v);o.push(x)}}this.cachedPackets.splice(0,t.length);for(var C=new u.MovieFragmentHeaderBox(++this.chunkIndex),F=new u.MovieFragmentBox(C,o),U=F.layout(0),B=new u.MediaDataBox(i),H=B.layout(U),j=U+8,a=0;a<o.length;a++)o[a].run.dataOffset=j+s[a];var G=new Uint8Array(U+H);F.write(G),B.write(G),this.ondata(G),this.filePos+=G.length}},t}();t.exports=S,S.MP3_SOUND_CODEC_ID=c,S.AAC_SOUND_CODEC_ID=l,S.TYPE_AUDIO_PACKET=y,S.TYPE_VIDEO_PACKET=v,S.Profiles={MP3_AUDIO_ONLY:{audioTrackId:0,videoTrackId:-1,tracks:[{codecId:S.MP3_SOUND_CODEC_ID,channels:2,samplerate:44100,samplesize:16,timescale:44100}]}}},function(t,e){function n(t){for(var e=new Uint8Array(4*t.length),n=0,i=0,r=t.length;r>i;i++){var o=t.charCodeAt(i);if(127>=o)e[n++]=o;else{if(o>=55296&&56319>=o){var s=t.charCodeAt(i+1);s>=56320&&57343>=s&&(o=((1023&o)<<10)+(1023&s)+65536,++i)}0!==(4292870144&o)?(e[n++]=248|o>>>24&3,e[n++]=128|o>>>18&63,e[n++]=128|o>>>12&63,e[n++]=128|o>>>6&63,e[n++]=128|63&o):0!==(4294901760&o)?(e[n++]=240|o>>>18&7,e[n++]=128|o>>>12&63,e[n++]=128|o>>>6&63,e[n++]=128|63&o):0!==(4294965248&o)?(e[n++]=224|o>>>12&15,e[n++]=128|o>>>6&63,e[n++]=128|63&o):(e[n++]=192|o>>>6&31,e[n++]=128|63&o)}}return e.subarray(0,n)}function i(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];return Array.prototype.concat.apply(t,e)}function r(t,e,n){t[e]=n>>24&255,t[e+1]=n>>16&255,t[e+2]=n>>8&255,t[e+3]=255&n}function o(t){return t.charCodeAt(0)<<24|t.charCodeAt(1)<<16|t.charCodeAt(2)<<8|t.charCodeAt(3)}function s(t){return(t-d)/1e3|0}function a(t){return 65536*t|0}function u(t){return 1073741824*t|0}function h(t){return 256*t|0}function c(t){return(31&t.charCodeAt(0))<<10|(31&t.charCodeAt(1))<<5|31&t.charCodeAt(2)}var l,f=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)};t.exports=l={};var d=-20828448e5,p=[1,0,0,0,1,0,0,0,1],g=[0,0,0],_=function(){function t(t,e){this.boxtype=t,"uuid"===t&&(this.userType=e)}return t.prototype.layout=function(t){this.offset=t;var e=8;return this.userType&&(e+=16),this.size=e,e},t.prototype.write=function(t){return r(t,this.offset,this.size),r(t,this.offset+4,o(this.boxtype)),this.userType?(t.set(this.userType,this.offset+8),24):8},t.prototype.toUint8Array=function(){var t=this.layout(0),e=new Uint8Array(t);return this.write(e),e},t}();l.Box=_;var m=function(t){function e(e,n,i){void 0===n&&(n=0),void 0===i&&(i=0),t.call(this,e),this.version=n,this.flags=i}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.version<<24|this.flags),n+4},e}(_);l.FullBox=m;var y=function(t){function e(e,n,i){t.call(this,"ftype"),this.majorBrand=e,this.minorVersion=n,this.compatibleBrands=i}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+4*(2+this.compatibleBrands.length),this.size},e.prototype.write=function(e){var n=this,i=t.prototype.write.call(this,e);return r(e,this.offset+i,o(this.majorBrand)),r(e,this.offset+i+4,this.minorVersion),i+=8,this.compatibleBrands.forEach(function(t){r(e,n.offset+i,o(t)),i+=4},this),i},e}(_);l.FileTypeBox=y;var v=function(t){function e(e,n){t.call(this,e),this.children=n}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e);return this.children.forEach(function(t){t&&(n+=t.layout(e+n))}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return this.children.forEach(function(t){t&&(n+=t.write(e))}),n},e}(_);l.BoxContainerBox=v;var E=function(t){function e(e,n,r,o){t.call(this,"moov",i([e],n,[r,o])),this.header=e,this.tracks=n,this.extendsBox=r,this.userData=o}return f(e,t),e}(v);l.MovieBox=E;var S=function(t){function e(e,n,i,r,o,s,a,u){void 0===r&&(r=1),void 0===o&&(o=1),void 0===s&&(s=p),void 0===a&&(a=d),void 0===u&&(u=d),t.call(this,"mvhd",0,0),this.timescale=e,this.duration=n,this.nextTrackId=i,this.rate=r,this.volume=o,this.matrix=s,this.creationTime=a,this.modificationTime=u}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+16+4+2+2+8+36+24+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,s(this.creationTime)),r(e,this.offset+n+4,s(this.modificationTime)),r(e,this.offset+n+8,this.timescale),r(e,this.offset+n+12,this.duration),n+=16,r(e,this.offset+n,a(this.rate)),r(e,this.offset+n+4,h(this.volume)<<16),r(e,this.offset+n+8,0),r(e,this.offset+n+12,0),n+=16,r(e,this.offset+n,a(this.matrix[0])),r(e,this.offset+n+4,a(this.matrix[1])),r(e,this.offset+n+8,a(this.matrix[2])),r(e,this.offset+n+12,a(this.matrix[3])),r(e,this.offset+n+16,a(this.matrix[4])),r(e,this.offset+n+20,a(this.matrix[5])),r(e,this.offset+n+24,u(this.matrix[6])),r(e,this.offset+n+28,u(this.matrix[7])),r(e,this.offset+n+32,u(this.matrix[8])),n+=36,r(e,this.offset+n,0),r(e,this.offset+n+4,0),r(e,this.offset+n+8,0),r(e,this.offset+n+12,0),r(e,this.offset+n+16,0),r(e,this.offset+n+20,0),n+=24,r(e,this.offset+n,this.nextTrackId),n+=4},e}(m);l.MovieHeaderBox=S,function(t){t[t.TRACK_ENABLED=1]="TRACK_ENABLED",t[t.TRACK_IN_MOVIE=2]="TRACK_IN_MOVIE",t[t.TRACK_IN_PREVIEW=4]="TRACK_IN_PREVIEW"}(l.TrackHeaderFlags||(l.TrackHeaderFlags={}));var A=(l.TrackHeaderFlags,function(t){function e(e,n,i,r,o,s,a,u,h,c,l){void 0===a&&(a=0),void 0===u&&(u=0),void 0===h&&(h=p),void 0===c&&(c=d),void 0===l&&(l=d),t.call(this,"tkhd",0,e),this.trackId=n,this.duration=i,this.width=r,this.height=o,this.volume=s,this.alternateGroup=a,this.layer=u,this.matrix=h,this.creationTime=c,this.modificationTime=l}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+20+8+6+2+36+8,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,s(this.creationTime)),r(e,this.offset+n+4,s(this.modificationTime)),r(e,this.offset+n+8,this.trackId),r(e,this.offset+n+12,0),r(e,this.offset+n+16,this.duration),n+=20,r(e,this.offset+n,0),r(e,this.offset+n+4,0),r(e,this.offset+n+8,this.layer<<16|this.alternateGroup),r(e,this.offset+n+12,h(this.volume)<<16),n+=16,r(e,this.offset+n,a(this.matrix[0])),r(e,this.offset+n+4,a(this.matrix[1])),r(e,this.offset+n+8,a(this.matrix[2])),r(e,this.offset+n+12,a(this.matrix[3])),r(e,this.offset+n+16,a(this.matrix[4])),r(e,this.offset+n+20,a(this.matrix[5])),r(e,this.offset+n+24,u(this.matrix[6])),r(e,this.offset+n+28,u(this.matrix[7])),r(e,this.offset+n+32,u(this.matrix[8])),n+=36,r(e,this.offset+n,a(this.width)),r(e,this.offset+n+4,a(this.height)),n+=8},e}(m));l.TrackHeaderBox=A;var w=function(t){function e(e,n,i,r,o){void 0===i&&(i="unk"),void 0===r&&(r=d),void 0===o&&(o=d),t.call(this,"mdhd",0,0),this.timescale=e,this.duration=n,this.language=i,this.creationTime=r,this.modificationTime=o}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+16+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,s(this.creationTime)),r(e,this.offset+n+4,s(this.modificationTime)),r(e,this.offset+n+8,this.timescale),r(e,this.offset+n+12,this.duration),r(e,this.offset+n+16,c(this.language)<<16),n+20},e}(m);l.MediaHeaderBox=w;var T=function(t){function e(e,i){t.call(this,"hdlr",0,0),this.handlerType=e,this.name=i,this._encodedName=n(this.name)}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+8+12+(this._encodedName.length+1),this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,0),r(e,this.offset+n+4,o(this.handlerType)),r(e,this.offset+n+8,0),r(e,this.offset+n+12,0),r(e,this.offset+n+16,0),n+=20,e.set(this._encodedName,this.offset+n),e[this.offset+n+this._encodedName.length]=0,n+=this._encodedName.length+1},e}(m);l.HandlerBox=T;var b=function(t){function e(e){void 0===e&&(e=0),t.call(this,"smhd",0,0),this.balance=e}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,h(this.balance)<<16),n+4},e}(m);l.SoundMediaHeaderBox=b;var P=function(t){function e(e,n){void 0===e&&(e=0),void 0===n&&(n=g),t.call(this,"vmhd",0,0),this.graphicsMode=e,this.opColor=n}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+8,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.graphicsMode<<16|this.opColor[0]),r(e,this.offset+n+4,this.opColor[1]<<16|this.opColor[2]),n+8},e}(m);l.VideoMediaHeaderBox=P,l.SELF_CONTAINED_DATA_REFERENCE_FLAG=1;var I=function(t){function e(e,i){void 0===i&&(i=null),t.call(this,"url ",0,e),this.location=i,e&l.SELF_CONTAINED_DATA_REFERENCE_FLAG||(this._encodedLocation=n(i))}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e);return this._encodedLocation&&(n+=this._encodedLocation.length+1),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return this._encodedLocation&&(e.set(this._encodedLocation,this.offset+n),e[this.offset+n+this._encodedLocation.length]=0,n+=this._encodedLocation.length),n},e}(m);l.DataEntryUrlBox=I;var L=function(t){function e(e){t.call(this,"dref",0,0),this.entries=e}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e)+4;return this.entries.forEach(function(t){n+=t.layout(e+n)}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.entries.length),this.entries.forEach(function(t){n+=t.write(e)}),n},e}(m);l.DataReferenceBox=L;var O=function(t){function e(e){t.call(this,"dinf",[e]),this.dataReference=e}return f(e,t),e}(v);l.DataInformationBox=O;var R=function(t){function e(e){t.call(this,"stsd",0,0),this.entries=e}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e);return n+=4,this.entries.forEach(function(t){n+=t.layout(e+n)}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.entries.length),n+=4,this.entries.forEach(function(t){n+=t.write(e)}),n},e}(m);l.SampleDescriptionBox=R;var D=function(t){function e(e,n,i,r,o){t.call(this,"stbl",[e,n,i,r,o]),this.sampleDescriptions=e,this.timeToSample=n,this.sampleToChunk=i,this.sampleSizes=r,this.chunkOffset=o}return f(e,t),e}(v);l.SampleTableBox=D;var M=function(t){function e(e,n,i){t.call(this,"minf",[e,n,i]),this.header=e,this.info=n,this.sampleTable=i}return f(e,t),e}(v);l.MediaInformationBox=M;var k=function(t){function e(e,n,i){t.call(this,"mdia",[e,n,i]),this.header=e,this.handler=n,this.info=i}return f(e,t),e}(v);l.MediaBox=k;var N=function(t){function e(e,n){t.call(this,"trak",[e,n]),this.header=e,this.media=n}return f(e,t),e}(v);l.TrackBox=N;var x=function(t){function e(e,n,i,r,o){t.call(this,"trex",0,0),this.trackId=e,this.defaultSampleDescriptionIndex=n,this.defaultSampleDuration=i,this.defaultSampleSize=r,this.defaultSampleFlags=o}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+20,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.trackId),r(e,this.offset+n+4,this.defaultSampleDescriptionIndex),r(e,this.offset+n+8,this.defaultSampleDuration),r(e,this.offset+n+12,this.defaultSampleSize),r(e,this.offset+n+16,this.defaultSampleFlags),n+20},e}(m);l.TrackExtendsBox=x;var C=function(t){function e(e,n,r){t.call(this,"mvex",i([e],n,[r])),this.header=e,this.tracDefaults=n,this.levels=r}return f(e,t),e}(v);l.MovieExtendsBox=C;var F=function(t){function e(e,n){t.call(this,"meta",0,0),this.handler=e,this.otherBoxes=n}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e);return n+=this.handler.layout(e+n),this.otherBoxes.forEach(function(t){n+=t.layout(e+n)}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return n+=this.handler.write(e),this.otherBoxes.forEach(function(t){n+=t.write(e)}),n},e}(m);l.MetaBox=F;var U=function(t){function e(e){t.call(this,"mfhd",0,0),this.sequenceNumber=e}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.sequenceNumber),n+4},e}(m);l.MovieFragmentHeaderBox=U,function(t){t[t.BASE_DATA_OFFSET_PRESENT=1]="BASE_DATA_OFFSET_PRESENT",t[t.SAMPLE_DESCRIPTION_INDEX_PRESENT=2]="SAMPLE_DESCRIPTION_INDEX_PRESENT",t[t.DEFAULT_SAMPLE_DURATION_PRESENT=8]="DEFAULT_SAMPLE_DURATION_PRESENT",t[t.DEFAULT_SAMPLE_SIZE_PRESENT=16]="DEFAULT_SAMPLE_SIZE_PRESENT",t[t.DEFAULT_SAMPLE_FLAGS_PRESENT=32]="DEFAULT_SAMPLE_FLAGS_PRESENT"}(l.TrackFragmentFlags||(l.TrackFragmentFlags={}));var B=l.TrackFragmentFlags,H=function(t){function e(e,n,i,r,o,s,a){t.call(this,"tfhd",0,e),this.trackId=n,this.baseDataOffset=i,this.sampleDescriptionIndex=r,this.defaultSampleDuration=o,this.defaultSampleSize=s,this.defaultSampleFlags=a}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e)+4,i=this.flags;return i&B.BASE_DATA_OFFSET_PRESENT&&(n+=8),i&B.SAMPLE_DESCRIPTION_INDEX_PRESENT&&(n+=4),i&B.DEFAULT_SAMPLE_DURATION_PRESENT&&(n+=4),i&B.DEFAULT_SAMPLE_SIZE_PRESENT&&(n+=4),i&B.DEFAULT_SAMPLE_FLAGS_PRESENT&&(n+=4),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e),i=this.flags;return r(e,this.offset+n,this.trackId),n+=4,i&B.BASE_DATA_OFFSET_PRESENT&&(r(e,this.offset+n,0),r(e,this.offset+n+4,this.baseDataOffset),n+=8),i&B.SAMPLE_DESCRIPTION_INDEX_PRESENT&&(r(e,this.offset+n,this.sampleDescriptionIndex),n+=4),i&B.DEFAULT_SAMPLE_DURATION_PRESENT&&(r(e,this.offset+n,this.defaultSampleDuration),n+=4),i&B.DEFAULT_SAMPLE_SIZE_PRESENT&&(r(e,this.offset+n,this.defaultSampleSize),n+=4),i&B.DEFAULT_SAMPLE_FLAGS_PRESENT&&(r(e,this.offset+n,this.defaultSampleFlags),n+=4),n},e}(m);l.TrackFragmentHeaderBox=H;
var j=function(t){function e(e){t.call(this,"tfdt",0,0),this.baseMediaDecodeTime=e}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+4,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,this.baseMediaDecodeTime),n+4},e}(m);l.TrackFragmentBaseMediaDecodeTimeBox=j;var G=function(t){function e(e,n,i){t.call(this,"traf",[e,n,i]),this.header=e,this.decodeTime=n,this.run=i}return f(e,t),e}(v);l.TrackFragmentBox=G,function(t){t[t.IS_LEADING_MASK=201326592]="IS_LEADING_MASK",t[t.SAMPLE_DEPENDS_ON_MASK=50331648]="SAMPLE_DEPENDS_ON_MASK",t[t.SAMPLE_DEPENDS_ON_OTHER=16777216]="SAMPLE_DEPENDS_ON_OTHER",t[t.SAMPLE_DEPENDS_ON_NO_OTHERS=33554432]="SAMPLE_DEPENDS_ON_NO_OTHERS",t[t.SAMPLE_IS_DEPENDED_ON_MASK=12582912]="SAMPLE_IS_DEPENDED_ON_MASK",t[t.SAMPLE_HAS_REDUNDANCY_MASK=3145728]="SAMPLE_HAS_REDUNDANCY_MASK",t[t.SAMPLE_PADDING_VALUE_MASK=917504]="SAMPLE_PADDING_VALUE_MASK",t[t.SAMPLE_IS_NOT_SYNC=65536]="SAMPLE_IS_NOT_SYNC",t[t.SAMPLE_DEGRADATION_PRIORITY_MASK=65535]="SAMPLE_DEGRADATION_PRIORITY_MASK"}(l.SampleFlags||(l.SampleFlags={})),l.SampleFlags,!function(t){t[t.DATA_OFFSET_PRESENT=1]="DATA_OFFSET_PRESENT",t[t.FIRST_SAMPLE_FLAGS_PRESENT=4]="FIRST_SAMPLE_FLAGS_PRESENT",t[t.SAMPLE_DURATION_PRESENT=256]="SAMPLE_DURATION_PRESENT",t[t.SAMPLE_SIZE_PRESENT=512]="SAMPLE_SIZE_PRESENT",t[t.SAMPLE_FLAGS_PRESENT=1024]="SAMPLE_FLAGS_PRESENT",t[t.SAMPLE_COMPOSITION_TIME_OFFSET=2048]="SAMPLE_COMPOSITION_TIME_OFFSET"}(l.TrackRunFlags||(l.TrackRunFlags={}));var Y=l.TrackRunFlags,V=function(t){function e(e,n,i,r){t.call(this,"trun",1,e),this.samples=n,this.dataOffset=i,this.firstSampleFlags=r}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e)+4,i=this.samples.length,r=this.flags;return r&Y.DATA_OFFSET_PRESENT&&(n+=4),r&Y.FIRST_SAMPLE_FLAGS_PRESENT&&(n+=4),r&Y.SAMPLE_DURATION_PRESENT&&(n+=4*i),r&Y.SAMPLE_SIZE_PRESENT&&(n+=4*i),r&Y.SAMPLE_FLAGS_PRESENT&&(n+=4*i),r&Y.SAMPLE_COMPOSITION_TIME_OFFSET&&(n+=4*i),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e),i=this.samples.length,o=this.flags;r(e,this.offset+n,i),n+=4,o&Y.DATA_OFFSET_PRESENT&&(r(e,this.offset+n,this.dataOffset),n+=4),o&Y.FIRST_SAMPLE_FLAGS_PRESENT&&(r(e,this.offset+n,this.firstSampleFlags),n+=4);for(var s=0;i>s;s++){var a=this.samples[s];o&Y.SAMPLE_DURATION_PRESENT&&(r(e,this.offset+n,a.duration),n+=4),o&Y.SAMPLE_SIZE_PRESENT&&(r(e,this.offset+n,a.size),n+=4),o&Y.SAMPLE_FLAGS_PRESENT&&(r(e,this.offset+n,a.flags),n+=4),o&Y.SAMPLE_COMPOSITION_TIME_OFFSET&&(r(e,this.offset+n,a.compositionTimeOffset),n+=4)}return n},e}(m);l.TrackRunBox=V;var z=function(t){function e(e,n){t.call(this,"moof",i([e],n)),this.header=e,this.trafs=n}return f(e,t),e}(v);l.MovieFragmentBox=z;var W=function(t){function e(e){t.call(this,"mdat"),this.chunks=e}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e);return this.chunks.forEach(function(t){n+=t.length}),this.size=n},e.prototype.write=function(e){var n=this,i=t.prototype.write.call(this,e);return this.chunks.forEach(function(t){e.set(t,n.offset+i),i+=t.length},this),i},e}(_);l.MediaDataBox=W;var K=function(t){function e(e,n){t.call(this,e),this.dataReferenceIndex=n}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+8,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,0),r(e,this.offset+n+4,this.dataReferenceIndex),n+8},e}(_);l.SampleEntry=K;var q=function(t){function e(e,n,i,r,o,s){void 0===i&&(i=2),void 0===r&&(r=16),void 0===o&&(o=44100),void 0===s&&(s=null),t.call(this,e,n),this.channelCount=i,this.sampleSize=r,this.sampleRate=o,this.otherBoxes=s}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e)+20;return this.otherBoxes&&this.otherBoxes.forEach(function(t){n+=t.layout(e+n)}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return r(e,this.offset+n,0),r(e,this.offset+n+4,0),r(e,this.offset+n+8,this.channelCount<<16|this.sampleSize),r(e,this.offset+n+12,0),r(e,this.offset+n+16,this.sampleRate<<16),n+=20,this.otherBoxes&&this.otherBoxes.forEach(function(t){n+=t.write(e)}),n},e}(K);l.AudioSampleEntry=q,l.COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH=24;var X=function(t){function e(e,n,i,r,o,s,a,u,h,c){if(void 0===o&&(o=""),void 0===s&&(s=72),void 0===a&&(a=72),void 0===u&&(u=1),void 0===h&&(h=l.COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH),void 0===c&&(c=null),t.call(this,e,n),this.width=i,this.height=r,this.compressorName=o,this.horizResolution=s,this.vertResolution=a,this.frameCount=u,this.depth=h,this.otherBoxes=c,o.length>31)throw new Error("invalid compressor name")}return f(e,t),e.prototype.layout=function(e){var n=t.prototype.layout.call(this,e)+16+12+4+2+32+2+2;return this.otherBoxes&&this.otherBoxes.forEach(function(t){n+=t.layout(e+n)}),this.size=n},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);r(e,this.offset+n,0),r(e,this.offset+n+4,0),r(e,this.offset+n+8,0),r(e,this.offset+n+12,0),n+=16,r(e,this.offset+n,this.width<<16|this.height),r(e,this.offset+n+4,a(this.horizResolution)),r(e,this.offset+n+8,a(this.vertResolution)),n+=12,r(e,this.offset+n,0),r(e,this.offset+n+4,this.frameCount<<16),n+=6,e[this.offset+n]=this.compressorName.length;for(var i=0;31>i;i++)e[this.offset+n+i+1]=i<this.compressorName.length?127&this.compressorName.charCodeAt(i):0;return n+=32,r(e,this.offset+n,this.depth<<16|65535),n+=4,this.otherBoxes&&this.otherBoxes.forEach(function(t){n+=t.write(e)}),n},e}(K);l.VideoSampleEntry=X;var $=function(t){function e(e,n){t.call(this,e),this.data=n}return f(e,t),e.prototype.layout=function(e){return this.size=t.prototype.layout.call(this,e)+this.data.length,this.size},e.prototype.write=function(e){var n=t.prototype.write.call(this,e);return e.set(this.data,this.offset+n),n+this.data.length},e}(_);l.RawTag=$},function(t,e,n){(function(e){var i,r=n(74),o=n(69),s=(o.BaseTransform,n(119));n(120),t.exports=i=function(){o.BaseParser.prototype.constructor.apply(this,arguments),this.parser=new s,this.parser.onFrame=this._onMp3Frame.bind(this),this.parser.onNoise=this._onNoise.bind(this),this.parser.onClose=this._onClose.bind(this),this._sampleRate=0,this._bitRate=0,this._timestamp=0},i.prototype=o.createBaseParser({constructor:i,_onMp3Frame:function(t,n,i){r("Found frame length "+t.length+" bitRate="+n+", sampleRate="+i);var s=new e(t),a=1152;s.meta={mimeType:"audio/mpeg",codecId:2,channels:2,bitRate:n,sampleRate:i,sampleSize:16},s.duration=a,s.timestamp=this._timestamp,this.enqueue(new o.Transfer(s,"buffer")),this._bitRate=n,this._timestamp+=a},_onNoise:function(){r("mp3 has noise")},_onClose:function(){r("parser closed")},_parse:function(t){return r("parse called"),t.data.empty?(r("empty transfer"),void this.enqueue(t)):void this.parser.push(new Uint8Array(t.data))}})}).call(e,n(70).Buffer)},function(t,e,n){var i=n(74),r=[32,64,96,128,160,192,224,256,288,320,352,384,416,448,32,48,56,64,80,96,112,128,160,192,224,256,320,384,32,40,48,56,64,80,96,112,128,160,192,224,256,320,32,48,56,64,80,96,112,128,144,160,176,192,224,256,8,16,24,32,40,48,56,64,80,96,112,128,144,160],o=[44100,48e3,32e3,22050,24e3,16e3,11025,12e3,8e3],s=function(){function t(){this.buffer=null,this.bufferSize=0}return t.prototype.push=function(t){var e;if(this.bufferSize>0){var n=t.length+this.bufferSize;if(!this.buffer||this.buffer.length<n){var r=new Uint8Array(n);this.bufferSize>0&&r.set(this.buffer.subarray(0,this.bufferSize)),this.buffer=r}this.buffer.set(t,this.bufferSize),this.bufferSize=n,t=this.buffer,e=n}else e=t.length;i("push "+e);for(var o,s=0;e>s&&(o=this._parse(t,s,e))>0;)s+=o;var a=e-s;a>0&&(!this.buffer||this.buffer.length<a?this.buffer=new Uint8Array(t.subarray(s,e)):this.buffer.set(t.subarray(s,e))),this.bufferSize=a},t.prototype._parse=function(t,e,n){if(i("_parse"),e+2>n)return-1;if(255===t[e]||224===(224&t[e+1])){if(e+24>n)return-1;var s=t[e+1]>>3&3,a=t[e+1]>>1&3,u=t[e+2]>>4&15,h=t[e+2]>>2&3,c=!!(2&t[e+2]);if(1!==s&&0!==u&&15!==u&&3!==h){var l=3===s?3-a:3===a?3:4,f=1e3*r[14*l+u-1],d=3===s?0:2===s?1:2,p=o[3*d+h],g=c?1:0,_=3===a?(3===s?12:6)*f/p+g<<2:(3===s?144:72)*f/p+g|0;return e+_>n?-1:(this.onFrame&&(i("onFrame"),this.onFrame(t.subarray(e,e+_),f,p)),_)}}for(var m=e+2;n>m;){if(255===t[m-1]&&224===(224&t[m]))return this.onNoise&&this.onNoise(t.subarray(e,m-1)),m-e-1;m++}return-1},t.prototype.close=function(){this.bufferSize>0&&this.onNoise&&this.onNoise(this.buffer.subarray(0,this.bufferSize)),this.buffer=null,this.bufferSize=0,this.onClose&&this.onClose()},t}();t.exports=s},function(t,e){var n=1e9;t.exports={TIMESCALE_SECONDS:n}},function(t,e,n){var i,r=n(122),o=n(69),s=o.BaseSink,a=n(123);t.exports=i=function(t){if(s.prototype.constructor.call(this),!r.haveMediaSourceSupportMimeType(t))throw new Error("Local MediaSource doesn't support provided MIME type: "+t);var e;e=arguments.length>1?Array.prototype.slice.call(arguments):t instanceof Array?t:[t],this.mimeTypes=e,this.mediaSource=new MediaSource,this.mseWriter=new a(this.mediaSource),this.dataSources=[],this.selectedDataSourceIndex=0,this.mimeTypes.forEach(function(t){var e={mimeType:t};this.mseWriter.listen(e),this.dataSources.push(e)}.bind(this))},i.prototype=o.createBaseSink({constructor:i,_onData:function(){var t=this.dataSources[this.selectedDataSourceIndex];if(!t||!t.onData)throw new Error("DataSource is not existing or has no onData function defined");var e=this.dequeue();e&&t.onData(e.data)},getMediaSourceUrl:function(){return URL.createObjectURL(this.mediaSource)}})},function(t,e){var n;t.exports=n={haveGlobalWindow:function(){return"undefined"!=typeof window},haveMediaSourceExtensions:function(){return n.haveGlobalWindow()&&window.MediaSource},haveMediaSourceSupportMimeType:function(t){return n.haveMediaSourceExtensions()&&window.MediaSource.isTypeSupported(t)}}},function(t,e){var n=function(){function t(t,e){this.mediaSource=t,this.dataSource=e,this.dataSource.onData=this.pushData.bind(this),this.updateEnabled=!1,this.buffer=[],this.sourceBuffer=null,this.sourceBufferUpdatedBound=null}return t.prototype.allowWriting=function(){this.updateEnabled=!0,this.update()},t.prototype.pushData=function(t){this.buffer.push(t),this.update()},t.prototype.update=function(){if(this.updateEnabled&&0!==this.buffer.length){this.sourceBuffer||(this.sourceBuffer=this.mediaSource.addSourceBuffer(this.dataSource.mimeType),this.sourceBufferUpdatedBound=this._sourceBufferUpdated.bind(this),this.sourceBuffer.addEventListener("update",this.sourceBufferUpdatedBound)),this.updateEnabled=!1;var t=this.buffer.shift();if(null===t)return void this.sourceBuffer.removeEventListener("update",this.sourceBufferUpdatedBound);t.timestamp&&(this.sourceBuffer.timestampOffset=t.timestamp/1e9),this.sourceBuffer.appendBuffer(t)}},t.prototype._sourceBufferUpdated=function(t){this.updateEnabled=!0,this.update()},t.prototype.finish=function(){this.buffer.push(null),this.update()},t}(),i=function(){function t(t){this.bufferWriters=[],this.mediaSource=t,this.mediaSourceOpened=!1,this.mediaSource.addEventListener("sourceopen",function(t){this.mediaSourceOpened=!0,this.bufferWriters.forEach(function(t){t.allowWriting()})}.bind(this)),this.mediaSource.addEventListener("sourceend",function(t){this.mediaSourceOpened=!1}.bind(this))}return t.prototype.listen=function(t){var e=new n(this.mediaSource,t);this.bufferWriters.push(e),this.mediaSourceOpened&&e.allowWriting()},t}();t.exports=i},function(t,e,n){var i,r,o=n(69);r=function(t){o.BasePushSrc.prototype.constructor.call(this);var e=this.req=new XMLHttpRequest;e.open("GET",t,!0),e.responseType="arraybuffer",e.onload=function(t){this.enqueue(new o.Transfer(new Uint8Array(e.response),"binary")),this.enqueue(new o.Transfer(null,"binary"))}.bind(this),e.send()},r.prototype=o.createBasePushSrc({constructor:r}),t.exports=i={Src:r}},function(t,e,n){var i,r,o,s=n(69),a=n(126);n(76),r=function(t,e){s.prototype.constructor.call(this);var n=a.createReadStream(t,e);this.on("end",function(){n.close()}),this.addOutput(n)},r.prototype=s.create({constructor:r}),o=function(t,e){s.prototype.constructor.call(this);var n=a.createWriteStream(t,e);this.on("finish",function(){n.close()}),this.addInput(n)},o.prototype=s.create({constructor:o}),t.exports=i={Src:r,Sink:o}},function(t,e,n){var i=n(122);t.exports=i.haveGlobalWindow()?new(n(127)):n(!function(){var t=new Error('Cannot find module "fs"');throw t.code="MODULE_NOT_FOUND",t}())},function(t,e,n){var i;i=function(){function t(){return!1}function e(t){return!(!(t&&t.data instanceof Object)||n(t))}function n(t){return!!(t&&t.data instanceof ArrayBuffer)}function i(t,n){var i,r=t.length,o=n;for(i=0;r>i;++i){if(!e(o))throw new Error("ENOENT");o=o.data[t[i]]}return o}String.prototype.trim||!function(){var t=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;String.prototype.trim=function(){return this.replace(t,"")}}();var r=function(){var t=Date.now();this.root={mtime:t,ctime:t,atime:t,data:{}}};return r.prototype.join=function(){var t=[],e=arguments||[];return t=this.parse(Array.prototype.slice.call(e).join("/")),("/"===e[0][0]?"/":"")+t.join("/")},r.prototype.parse=function(t){var e=[];return t=t||"/",t.split(/\/+/).forEach(function(t){t=t.trim(),t.length&&"."!==t&&(".."===t?e.pop():e.push(t))}),e},r.prototype.fileSizeSI=function(t,e,n,i,r){return(e=Math,n=e.log,i=1e3,r=n(t)/n(i)|0,t/e.pow(i,r)).toFixed(r?2:0)+" "+(r?"kMGTPEZY"[--r]+"B":"Bytes")},r.prototype.fileSizeIEC=function(t,e,n,i,r){return(e=Math,n=e.log,i=1024,r=n(t)/n(i)|0,t/e.pow(i,r)).toFixed(r?2:0)+" "+(r?"KMGTPEZY"[--r]+"iB":"Bytes")},r.prototype.statSync=function(n){var r=this.parse(n),o=i(r,this.root),s=e(o);if(!o||!o.data)throw new Error("ENOENT");return{size:s?Object.keys(o.data).length:o.data.byteLength,ctime:new Date(o.ctime),mtime:new Date(o.mtime),atime:new Date(o.atime),isFile:function(){return!s},isDirectory:function(){return s},isBlockDevice:t,isCharacterDevice:t,isSymbolicLink:t,isFIFO:t,isSocket:t}},r.prototype.existsSync=function(t){var n,i=this.parse(t),r=i.length,o=this.root;for(n=0;r>n;++n){if(!e(o))return!1;o=o.data[i[n]]}return!!o},r.prototype.mkdirSync=function(t){var n=this.parse(t),r=i(n.slice(0,n.length-1),this.root),o=Date.now();if(!n.length||!e(r))throw new Error("ENODIR");r.data[n[n.length-1]]={data:{},ctime:o,mtime:o,atime:o},r.mtime=o},r.prototype.mkdirpSync=function(t){var r,o,s,a=this.parse(t),u=a.length;if(!a.length)throw new Error("ENODIR");for(o=0;u>o;++o){if(r=a.slice(0,o+1),s=i(r,this.root),n(s))throw new Error("ENODIR");e(s)||this.mkdirSync(r.join("/"))}},r.prototype.readdirSync=function(t){var n=this.parse(t),r=i(n,this.root);if(!e(r))throw new Error("ENODIR");return r.atime=Date.now(),Object.keys(r.data)},r.prototype.rmdirSync=function(t){var n=this.parse(t),r=i(n,this.root);if(dirname=n.pop(),parentDir=i(n,this.root),!e(r))throw new Error("ENODIR");if(Object.keys(r.data).length)throw new Error("ENOTEMPTY");delete parentDir.data[dirname],parentDir.mtime=Date.now()},r.prototype.rmrfSync=function(t){var n=this.parse(t),r=n.pop(),o=i(n,this.root);if(!e(o))throw new Error("ENODIR");r?delete o.data[r]:o.data={},o.mtime=Date.now()},r.prototype.writeFileSync=function(t,n,r){var o,s,a=this.parse(t),u=a.pop(),h=this.existsSync(t),c=i(a,this.root);if(!e(c))throw new Error("ENODIR");if(!u)throw new Error("EINVALIDPATH");if(r=r||{encoding:!0},"string"==typeof n){o=new ArrayBuffer(2*n.length);for(var l=new Uint16Array(o),f=0,d=n.length;d>f;++f)l[f]=n.charCodeAt(f)}else o=n;s=Date.now(),c.data[u]={data:o,ctime:s,mtime:s,atime:s},h||(c.mtime=s),c.atime=s},r.prototype.readFileSync=function(t,e){var r=this.parse(t),o=i(r,this.root),e=e||{encoding:!1};if(!n(o))throw new Error("ENOENT");return o.atime=Date.now(),e.encoding?String.fromCharCode.apply(null,new Uint16Array(o.data)):o.data},r.prototype.renameSync=function(t,n){var r=this.parse(t),o=i(r,this.root),s=i(r.slice(0,r.length-1),this.root),a=r[r.length-1],u=this.parse(n),h=i(u,this.root),c=i(u.slice(0,u.length-1),this.root),l=u[u.length-1],f=Date.now();if(!r.length||!u.length)throw new Error("ENOENT");if(!e(s||!e(c)))throw new Error("ENODIR");if(h)throw new Error("EEXISTS");c.data[l]=h=o,h.ctime=f,c.mtime=f,delete s.data[a],s.mtime=f},["stat","exists","readdir","mkdirp","mkdir","rmdir","rmrf","unlink"].forEach(function(t){r.prototype[t]=function(e,n){try{var i=this[t+"Sync"](e)}catch(r){return n(r)}return n(null,i)}}),["writeFile","readFile"].forEach(function(t){r.prototype[t]=function(e,n,i){i||(i=n,n=void 0);try{var r=this[t+"Sync"](e,n)}catch(o){return i(o)}return i(null,r)}}),["rename"].forEach(function(t){r.prototype[t]=function(e,n,i){try{var r=this[t+"Sync"](e,n)}catch(o){return i(o)}return i(null,r)}}),r}.call(e,n,e,t),!(void 0!==i&&(t.exports=i))},function(t,e){var n={HTTP:"http",RTMP:"rtmp",HLS:"hls"};t.exports=n},function(t,e){t.exports={AAC:"audio/aac",M3U8:"application/x-mpegURL",HLS:"application/vnd.apple.mpegurl",MP4A:"audio/mp4",MP3:"audio/mpeg",OGG:"audio/ogg",WAV:"audio/wav",WEBMA:"audio/webm",getTypeByExtension:function(t){var e={mp3:this.MP3,aac:this.AAC,mp4:this.MP4A,mp4a:this.MP4A,ogg:this.OGG,oga:this.OGG,opus:this.OGG,webm:this.WEBM,wav:this.WAV,m3u8:this.M3U8};return e[t]||null}}},function(t,e,n,i,r,o){function s(t,e,n){for(var i=-1,r=h(e),o=r.length;++i<o;){var s=r[i],a=t[s],u=n(a,e[s],s,t,e);(u===u?u===a:a!==a)&&(void 0!==a||s in t)||(t[s]=u)}return t}var a=n(i),u=n(r),h=n(o),c=u(function(t,e,n){return n?s(t,e,n):a(t,e)});t.exports=c},function(t,e,n,i,r){function o(t,e){return null==e?t:s(e,a(e),t)}var s=n(i),a=n(r);t.exports=o},function(t,e,n,i,r,o){function s(t){return function(e){return null==e?void 0:e[t]}}function a(t){return null!=t&&h(S(t))}function u(t,e){return t="number"==typeof t||_.test(t)?+t:-1,e=null==e?E:e,t>-1&&t%1==0&&e>t}function h(t){return"number"==typeof t&&t>-1&&t%1==0&&E>=t}function c(t){for(var e=f(t),n=e.length,i=n&&t.length,r=!!i&&h(i)&&(g(t)||p(t)),o=-1,s=[];++o<n;){var a=e[o];(r&&u(a,i)||y.call(t,a))&&s.push(a)}return s}function l(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function f(t){if(null==t)return[];l(t)||(t=Object(t));var e=t.length;e=e&&h(e)&&(g(t)||p(t))&&e||0;for(var n=t.constructor,i=-1,r="function"==typeof n&&n.prototype===t,o=Array(e),s=e>0;++i<e;)o[i]=i+"";for(var a in t)s&&u(a,e)||"constructor"==a&&(r||!y.call(t,a))||o.push(a);return o}var d=n(i),p=n(r),g=n(o),_=/^\d+$/,m=Object.prototype,y=m.hasOwnProperty,v=d(Object,"keys"),E=9007199254740991,S=s("length"),A=v?function(t){var e=null==t?void 0:t.constructor;return"function"==typeof e&&e.prototype===t||"function"!=typeof t&&a(t)?c(t):l(t)?v(t):[]}:c;t.exports=A},function(t,e,n,i,r,o){function s(t){return h(function(e,n){var i=-1,r=null==e?0:n.length,o=r>2?n[r-2]:void 0,s=r>2?n[2]:void 0,h=r>1?n[r-1]:void 0;for("function"==typeof o?(o=a(o,h,5),r-=2):(o="function"==typeof h?h:void 0,r-=o?1:0),s&&u(n[0],n[1],s)&&(o=3>r?void 0:o,r=1);++i<r;){var c=n[i];c&&t(e,c,o)}return e})}var a=n(i),u=n(r),h=n(o);t.exports=s},function(t,e,n,i){function r(t,e){return p(t,e,l)}function o(t){return function(e){return null==e?void 0:e[t]}}function s(t,e){return function(n,i){var r=n?g(n):0;if(!u(r))return t(n,i);for(var o=e?r:-1,s=h(n);(e?o--:++o<r)&&i(s[o],o,s)!==!1;);return n}}function a(t){return function(e,n,i){for(var r=h(e),o=i(e),s=o.length,a=t?s:-1;t?a--:++a<s;){var u=o[a];if(n(r[u],u,r)===!1)break}return e}}function u(t){return"number"==typeof t&&t>-1&&t%1==0&&f>=t}function h(t){return c(t)?t:Object(t)}function c(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var l=n(i),f=9007199254740991,d=s(r),p=a(),g=o("length");t.exports=d}]))},function(t,e,n){var i=n(22),r=function(t,e){var n=e||{},r=n.bufferLen||4096,o=n.numChannels||2;this.context=t.context,this.node=(this.context.createScriptProcessor||this.context.createJavaScriptNode).call(this.context,r,o,o);var s=new i;s.postMessage({command:"init",config:{sampleRate:this.context.sampleRate,numChannels:o}});var a,u=!1;this.node.onaudioprocess=function(t){if(u){for(var e=[],n=0;o>n;n++)e.push(t.inputBuffer.getChannelData(n));s.postMessage({command:"record",buffer:e})}},this.configure=function(t){for(var e in t)t.hasOwnProperty(e)&&(n[e]=t[e])},this.record=function(){u=!0},this.stop=function(){u=!1},this.clear=function(){s.postMessage({command:"clear"})},this.getBuffer=function(t){a=t||n.callback,s.postMessage({command:"getBuffer"})},this.exportWAV=function(t,e){if(a=t||n.callback,e=e||n.type||"audio/wav",!a)throw new Error("Callback not set");s.postMessage({command:"exportWAV",type:e})},s.onmessage=function(t){var e=t.data;a(e)},t.connect(this.node),this.node.connect(this.context.destination)};r.forceDownload=function(t,e){var n=(window.URL||window.webkitURL).createObjectURL(t),i=window.document.createElement("a");i.href=n,i.download=e||"output.wav";var r=document.createEvent("Event");r.initEvent("click",!0,!0),i.dispatchEvent(r)},t.exports=r},function(t,e){t.exports=function(t){function e(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return t[i].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){function i(){return this._hooksPause.every(function(t){return t.call()})}function r(t){var e=t.resource_id||t.id||t.cid;if(!e)throw new Error("Your model should have a unique `id`, `cid` or `resource_id` property");return e}function o(t){C=t,t&&(x.AudioManagerStates=t.States)}function s(){var t=G();return p.call(this,!0).done(function(e){t.resolve(e.url)}).fail(function(){t.reject()}),t.promise()}function a(t){var e,n=this.options;return e={id:this.getId(),src:t.url,duration:$.result(n.duration),title:this.options.title,mimeType:t.mimeType,forceSingle:n.useSinglePlayer},C.createAudioPlayer(e,{streamUrlProvider:s.bind(this)})}function u(t,e){var n=e?"on":"off";t[n]("state-change",L,this)[n]("position-change",c,this)[n]("metadata",h,this)}function h(){this.trigger(Y.METADATA)}function c(){this._prevPosition!==this.currentTime()&&(this.trigger(Y.TIME),this._prevPosition=this.currentTime())}function l(){this._initAudioDefer&&(this._initAudioDefer.reject(),this._initAudioDefer=null,this.streamInfo=null)}function f(){l.call(this),this.controller&&(this._storedPosition=this.currentTime(),this.controller.kill(),this.controller=null,this.trigger(Y.RESET))}function d(){this._registerPlays=!0,this.pause(),this.trigger(Y.FINISH)}function p(t){var e=G(),n=this.streamInfo&&!t;return n?e.resolve(this.streamInfo):g.call(this).done(function(t){var n=q.choosePreferredStream(t,this.options);n?e.resolve(n):(this.trigger(Y.NO_PROTOCOL),F.warn("(%s) Could not match a protocol of given media descriptor to one of the supported protocols (%s), aborting attempt to play.",this.getId(),this.options.protocols),e.reject())}.bind(this)).fail(function(t){F.warn("(%s) Stream request failed with status: %d",this.getId(),t.status),_.call(this,t),m.call(this,t),e.reject()}.bind(this)),e.promise()}function g(){if(this.options.streamUrls&&!this._usedPrefetchUrls){var t,e=G();return this._usedPrefetchUrls=!0,t=$.result(this.options.streamUrls),e.resolve(t),e.promise()}return this.ajax({type:"GET",url:$.result(this.options.streamUrlsEndpoint),dataType:"json",async:this.options.asyncFetch,timeout:this.options.asyncFetch?nt:et})}function _(t){var e=t.status>=400&&-1!==(t.responseText||"").indexOf("geo_blocked");e&&this.trigger(Y.GEO_BLOCKED)}function m(t){0===t.status&&this.trigger(Y.NO_CONNECTION)}function y(){return this.controller&&this.controller.getCapabilities&&this.controller.getCapabilities()?this.controller.getCapabilities().needsUrlRefresh:!0}function v(t){if(!y.call(this))return!0;var e=this._initAudioDefer&&this._initAudioDefer.state(),n=q.streamValidForPlayingFrom(this.streamInfo,t);return this.controller&&this.controller.hasStreamUrlProvider&&this.controller.hasStreamUrlProvider()?!0:e&&("pending"===e||"resolved"===e&&n)}function E(t){t&&!this._bufferingTimeout?this._bufferingTimeout=window.setTimeout(function(){this._isBuffering=!0,this.trigger(Y.BUFFERRING_START)}.bind(this),it):t||(this._bufferingTimeout&&(window.clearTimeout(this._bufferingTimeout),this._bufferingTimeout=null),this._isBuffering&&(this._isBuffering=!1,this.trigger(Y.BUFFERRING_END)))}function S(){this.off(Y.TIME,this.seekTimeEventHandler),this.trigger(Y.SEEKED),this.seekTimeEventHandler=null}function A(){this._errorRecoveryFlagsResetTimeout=window.setTimeout(function(){this._errorRecoveryTime=null,this._errorRecoveryCounts=0}.bind(this),at)}function w(){this._errorRecoveryFlagsResetTimeout&&window.clearTimeout(this._errorRecoveryFlagsResetTimeout)}function T(){var t=this.isPlaying(),e=Date.now();return w.call(this),this._errorRecoveryTime&&this._errorRecoveryTime+ot>e&&this._errorRecoveryCounts>st?void this.trigger(Y.AUDIO_ERROR,this):(this._errorRecoveryTime=Date.now(),this._errorRecoveryCounts++,f.call(this),void(t&&this.play({seek:this.currentTime(),userInitiated:!1})))}function b(t){this.logAudioError({error_code:t,protocol:this.streamInfo?this.streamInfo.protocol:void 0,player_type:this.controller?this.controller.getType():void 0,host:this.streamInfo?X.getUrlHost(this.streamInfo.url):void 0,url:this.streamInfo?this.streamInfo.url:void 0})}function P(){var t,e=C.Errors;if(!this.controller)return F.error("(%s) Controller is null, aborting error handler.",this.getId(),this),b.call(this,null),void T.call(this);switch(t=this.controller&&this.controller.getErrorID(),F.error("(%s) %s",this.getId(),this.controller.getErrorMessage?this.controller.getErrorMessage():"Controller does not provide getErrorMessage()"),D(t,"MSE","GENERIC","HTML5_AUDIO_DECODE","HTML5_AUDIO_SRC_NOT_SUPPORTED","FLASH_PROXY","FLASH_RTMP_CONNECT_FAILED","FLASH_RTMP_CANNOT_PLAY_STREAM")&&b.call(this,t),t){case e.FLASH_PROXY_CANT_LOAD_FLASH:this.trigger(Y.FLASH_NOT_LOADED);break;case e.FLASH_PROXY_FLASH_BLOCKED:this.trigger(Y.FLASH_BLOCK);break;case e.FLASH_RTMP_CONNECT_FAILED:$.without(this.options.protocols,W.RTMP);case e.FLASH_RTMP_CANNOT_PLAY_STREAM:case e.FLASH_RTMP_CONNECT_CLOSED:case e.HTML5_AUDIO_NETWORK:case e.HTML5_AUDIO_ABORTED:case e.HTML5_AUDIO_DECODE:case e.HTML5_AUDIO_SRC_NOT_SUPPORTED:case e.GENERIC_AUDIO_ENDED_EARLY:case e.MSE_BAD_OBJECT_STATE:case e.MSE_NOT_SUPPORTED:case e.MSE_MP3_NOT_SUPPORTED:case e.MSE_HLS_NOT_VALID_PLAYLIST:case e.MSE_HLS_PLAYLIST_NOT_FOUND:case e.MSE_HLS_SEGMENT_NOT_FOUND:T.call(this);break;case e.GENERIC_AUDIO_OVERRUN:d.call(this);break;default:F.error("(%s) Unhandled audio error code: %s",this.getId(),t,this)}}function I(t,e){switch(this.options.debug&&O.call(this,t,e),t){case Y.PAUSE:this._isPlaying=!1,this._isPlayActionQueued=!1;break;case Y.PLAY:var n=e;this.toggleMute(J.muted),this.setVolume(J.volume),this._isPlaying=!1,this._isPlayActionQueued=!0,this._userInitiatedPlay=void 0!==n.userInitiated?!!n.userInitiated:!0,M.call(this);break;case Y.PLAY_START:this._isPlaying=!0,this._isPlayActionQueued=!1,this._registerPlays&&this.registerPlay();break;case Y.BUFFERRING_START:case Y.SEEK:this._isPlaying&&(this._isPlaying=!1,this._isPlayActionQueued=!0);break;case Y.BUFFERRING_END:case Y.SEEKED:this._isPlayActionQueued&&(this._isPlaying=!0,this._isPlayActionQueued=!1);break;case Y.NO_CONNECTION:this._hasNoConnection=!0,this._noConnectionSince=Date.now();break;case Y.NO_STREAMS:this.pause(),E.call(this,!1),l.call(this),N.call(this);break;case Y.STREAMS:this._noConnectionSince=null,this._hasNoConnection=!1;break;case Y.ONLINE:k.call(this);break;case Y.OFFLINE:}}function L(t){var e=C.States,n=C.Errors;switch(t){case e.IDLE:R.call(this),this.controller&&this.controller.getErrorID()===n.FLASH_PROXY_FLASH_BLOCKED&&this.trigger(Y.FLASH_UNBLOCK);break;case e.PAUSED:R.call(this),E.call(this,!1),this.seekTimeEventHandler&&this.isPaused()&&S.call(this),this.isPlaying()&&this.trigger(Y.PAUSE,{position:this.currentTime()});break;case e.PLAYING:R.call(this),E.call(this,!1),A.call(this),this.trigger(Y.PLAY_RESUME);break;case e.LOADING:case e.SEEKING:R.call(this),E.call(this,!0);break;case e.ENDED:R.call(this),d.call(this);break;case e.ERROR:E.call(this,!1),P.call(this)}this.trigger(Y.STATE_CHANGE,t)}function O(t,e){var n=this.options.title;n=n&&n.length?" ["+n.replace(/\s/g,"").substr(0,6)+"]":"",t===Y.STATE_CHANGE?F("(%s)%s Event: %s (%s)",this.getId(),n,t,e):t!==Y.TIME||this._loggedTime?t!==Y.TIME&&F("(%s)%s Event: %s",this.getId(),n,t):F("(%s)%s Event: %s %dms",this.getId(),n,t,this.currentTime()),this._loggedTime=t===Y.TIME}function R(){this._initAudioDefer&&this._initAudioDefer.resolve()}function D(t){return void 0===C.Errors[t]?!1:Array.prototype.slice.call(arguments,1).some(function(e){return 0===t.indexOf(e)})}function M(){function t(){var t=window.navigator.onLine;F("Navigator `onLine` status is now: "+t),window.setTimeout(function(){window.navigator.onLine===t&&this.trigger(t?Y.ONLINE:Y.OFFLINE)}.bind(this),500)}this._onlineEventsRegistered||(this._onlineEventsRegistered=!0,window.addEventListener("online",t.bind(this)),window.addEventListener("offline",t.bind(this)))}function k(){if(this.hasNoConnection()&&this._isPlayRetryQueued){var t=Date.now()-this._noConnectionSince;this._isPlayRetryQueued=!0,t<this.options.retryAfterNoConnectionEventTimeout&&this.play({userInitiated:!1})}}function N(){this.hasNoConnection()&&!this._userInitiatedPlay&&(this._isPlayRetryQueued=!0)}var x,C,F,U=n(1),B=n(6),H=n(8),j=n(9),G=n(2).Deferred,Y=n(7),V=n(14),z=n(10),W=n(15),K=n(16),q=n(18),X=n(12),$=n(13),Z=n(19),Q={},J={muted:!1,volume:1},tt={soundId:Q,duration:Q,title:null,registerEndpoint:Q,streamUrlsEndpoint:Q,resourceId:!1,debug:!1,asyncFetch:!0,useSinglePlayer:!0,protocols:[W.HLS,W.RTMP,W.HTTP],extensions:[V.MP3],maxBitrate:1/0,mediaSourceEnabled:!1,mseFirefox:!1,mseSafari:!1,eventLogger:null,logErrors:!0,logPerformance:!0,ajax:null,retryAfterNoConnectionEventTimeout:6e4,fadeOutOnPause:!1,fadeOutAlgo:Z.VolumeAutomator.Algos.EaseInOut},et=6e3,nt=6e3,it=400,rt=6e4,ot=6e3,st=3,at=3e4,ut=[];x=t.exports=function(t,e){if(1===arguments.length?e=t:x.setAudioManager(t),!C)throw new Error("SCAudio: AudioManager instance must be set with `SCAudio.setAudioManager()` or passed via the constructor");this.options=$.extend({},tt,e);var n=Object.keys(this.options).filter(function(t){return this.options[t]===Q},this);if(n.length)throw new Error("SCAudio: pass into constructor the following options: "+n.join(", "));K.prioritizeAndFilter(this.options),this.controller=null,this.streamInfo=null,this._userInitiatedPlay=this._registerPlays=!0,this._registerCounts=this._errorRecoveryCounts=0,this._isPlayActionQueued=this._onlineEventsRegistered=this._usedPrefetchUrls=this._isPlaying=this._isBuffering=this._hasNoConnection=!1,this._initAudioDefer=this._expirationTimeout=this._bufferingTimeout=this._errorRecoveryTime=this._errorRecoveryFlagsResetTimeout=this._storedPosition=this._prevPosition=this._noConnectionSince=null,this.options.debug&&(this._loggedTime=!1),this._modelListeners={},this._hooksPause=[],this.audioPerfMonitor=new H(this,this.logAudioPerformance.bind(this)),this.audioLogger=new B(this),this.volumeAutomator=new Z.VolumeAutomator(this),F=F||j(e.debug,"scaudio")},$.extend(x.prototype,z,{constructor:x,initAudio:function(){return this._initAudioDefer||(this._initAudioDefer=G(),p.call(this).done(function(t){var e=!0;this.streamInfo&&(e=!1),this.streamInfo=t,e&&this.trigger(Y.STREAMS),this.controller=a.call(this,t),u.call(this,this.controller,!0),L.call(this,this.controller.getState())}.bind(this)).fail(function(){this.trigger(Y.NO_STREAMS)}.bind(this)),this._initAudioDefer.done(function(){this.trigger(Y.CREATED)}.bind(this))),this._initAudioDefer.promise()},registerPlay:function(){var t=this.options.soundId,e=!1;return-1===ut.indexOf(t)&&(ut.push(t),window.setTimeout(function(){var e=ut.indexOf(t);e>-1&&ut.splice(e,1)},rt),this.ajax({type:"POST",url:$.result(this.options.registerEndpoint),dataType:"json"}),this._registerCounts++,this._registerPlays=!1,this.trigger(Y.REGISTERED),e=!0),e},toggle:function(){
this[this.isPaused()?"play":"pause"]()},play:function(t){var e;if(t&&null!=t.seek)e=t.seek;else{if(this.isPlaying())return;e=this.currentTime()}t=$.extend({},t,{position:e}),this.trigger(Y.PLAY,t),v.call(this,e)||(f.call(this),this._isPlayActionQueued=!0),this.initAudio().done(function(){this._isPlayActionQueued&&(this._storedPosition=null,this.trigger(Y.PLAY_START,t),this.controller&&this.controller.play(e))}.bind(this)),E.call(this,!0)},pause:function(t){this.isPaused()||(t=$.extend({},t,{position:this.currentTime()}),i.call(this)&&(this.trigger(Y.PAUSE,t),this.controller&&this.controller.pause()))},registerHook:function(t,e){switch(t){case"pause":this._hooksPause.push(e);break;default:throw new Error("can`t register hook for "+t)}},getListenTime:function(){return this.audioLogger?this.audioLogger.getListenTime():0},dispose:function(){this.audioLogger=null,this.audioPerfMonitor=null,$.without(ut,this.options.soundId),window.clearTimeout(this._bufferingTimeout),l.call(this),this.controller&&(this.controller.kill(),this.controller=null),delete this.controller,this.trigger(Y.DESTROYED),this.off()},seek:function(t){return this.controller?t>=$.result(this.options.duration)?void d.call(this):(this.seekTimeEventHandler&&this.off(Y.TIME,this.seekTimeEventHandler),this.seekTimeEventHandler=$.after(2,function(){S.call(this)}.bind(this)),this.on(Y.TIME,this.seekTimeEventHandler),this.trigger(Y.SEEK,{from:this.currentTime(),to:t}),this.isPlaying()&&!v.call(this,t)?(f.call(this),void this.play({seek:t})):void this.controller.seek(t)):void 0},seekRelative:function(t){this.controller&&this.seek(this.currentTime()+t)},currentTime:function(){return this._storedPosition?this._storedPosition:this.controller?this.controller.getCurrentPosition():0},loadProgress:function(){var t=0;return this.controller&&(t=this.controller.getLoadedPosition()/this.controller.getDuration(),t=t>=.99?1:t),t},buffered:function(){return this.controller&&this.controller.getDuration()||0},isPaused:function(){return!this.isPlaying()},isBuffering:function(){return this._isBuffering},isPlaying:function(){return this._isPlayActionQueued||this._isPlaying},isLoading:function(){return!(!this.controller||this.controller.getState()!==C.States.LOADING)},hasNoConnection:function(){return!!this._hasNoConnection},hasStreamInfo:function(){return!!this.streamInfo},toggleMute:function(t){x.toggleMute(t)},isMuted:function(){return x.isMuted()},setVolume:function(t){x.setVolume(t)},getVolume:function(){return x.getVolume()},logAudioPerformance:function(t){this.getEventLogger()&&this.options.logPerformance&&this.getEventLogger().audioPerformance(t)},logAudioError:function(t){this.getEventLogger()&&this.options.logErrors&&this.getEventLogger().audioError(t)},getAudioManagerStates:function(){return C.States},getId:function(){return this.options.resourceId||this.options.soundId},getEventLogger:function(){return this.options.eventLogger},registerModelEventListener:function(t,e){var n=r(t);if(this._modelListeners[n])throw new Error("Data model is already registered (forgot to unregister it or registering twice?)");this._modelListeners[n]=e=e.bind(this,t),this.on("all",e)},unregisterModelEventListener:function(t){var e=r(t);this._modelListeners[e]&&(this.off("all",this._modelListeners[e]),delete this._modelListeners[e])},ajax:function(t){return this.options.ajax?this.options.ajax(t):U(t)},trigger:function(t,e){I.call(this,t,e),z.trigger.call(this,t,e)}}),$.extend(x,{getSettings:function(){return J},setSettings:function(t){$.extend(J,t)},setAudioManager:o,setAudioManagerOnce:$.once(o),toggleMute:function(t){J.muted=void 0===t?!J.muted:!!t,C&&C.setVolume(J.muted?0:1)},isMuted:function(){return J.muted},setVolume:function(t){J.volume=void 0===t?1:t,C&&C.setVolume(J.volume)},getVolume:function(){return J.volume},Extensions:V,Protocols:W,Events:Y,BUFFER_DELAY:it,PLAY_REGISTRATION_TIMEOUT:rt})},function(t,e,n){var i=n(2).Deferred,r=4;t.exports=function(t){var e,n,o,s,a,u,h,c;t&&(o=t.data||null,n=t.url||"",e=t.type||"GET",s=t.dataType||"text",a=t.async,u=t.timeout,h=t.beforeSend||null);var l=i();a=a!==!1;var f=new XMLHttpRequest;return f.open(e,n,a),a&&(f.responseType="text"),h&&h(f),f.onreadystatechange=function(){if(f.readyState===r)if(clearTimeout(c),0!==f.status&&f.status<400){var t=f.responseText;if("json"===s)try{t=JSON.parse(t)}catch(e){return void l.reject(f)}l.resolve(t)}else l.reject(f)},null!=u&&(c=setTimeout(function(){f.readyState!==r&&(f.abort(),l.reject(f))},u)),f.send(o),l.promise()}},function(t,e,n){t.exports=n(3)},function(t,e,n){/*!
		* jquery-deferred
		* Copyright(c) 2011 Hidden <zzdhidden@gmail.com>
		* MIT Licensed
		*/
var i=t.exports=n(4),r=Array.prototype.slice;i.extend({Deferred:function(t){var e=[["resolve","done",i.Callbacks("once memory"),"resolved"],["reject","fail",i.Callbacks("once memory"),"rejected"],["notify","progress",i.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return o.done(arguments).fail(arguments),this},then:function(){var t=arguments;return i.Deferred(function(n){i.each(e,function(e,r){var s=r[0],a=t[e];o[r[1]](i.isFunction(a)?function(){var t=a.apply(this,arguments);t&&i.isFunction(t.promise)?t.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===o?n:this,[t])}:n[s])}),t=null}).promise()},promise:function(t){return null!=t?i.extend(t,r):r}},o={};return r.pipe=r.then,i.each(e,function(t,i){var s=i[2],a=i[3];r[i[1]]=s.add,a&&s.add(function(){n=a},e[1^t][2].disable,e[2][2].lock),o[i[0]]=s.fire,o[i[0]+"With"]=s.fireWith}),r.promise(o),t&&t.call(o,o),o},when:function(t){var e,n,o,s=0,a=r.call(arguments),u=a.length,h=1!==u||t&&i.isFunction(t.promise)?u:0,c=1===h?t:i.Deferred(),l=function(t,n,i){return function(o){n[t]=this,i[t]=arguments.length>1?r.call(arguments):o,i===e?c.notifyWith(n,i):--h||c.resolveWith(n,i)}};if(u>1)for(e=new Array(u),n=new Array(u),o=new Array(u);u>s;s++)a[s]&&i.isFunction(a[s].promise)?a[s].promise().done(l(s,o,a)).fail(c.reject).progress(l(s,n,e)):--h;return h||c.resolveWith(o,a),c.promise()}})},function(t,e,n){function i(t){var e=s[t]={};return r.each(t.split(o),function(t,n){e[n]=!0}),e}var r=t.exports=n(5),o=/\s+/,s={};r.Callbacks=function(t){t="string"==typeof t?s[t]||i(t):r.extend({},t);var e,n,o,a,u,h,c=[],l=!t.once&&[],f=function(i){for(e=t.memory&&i,n=!0,h=a||0,a=0,u=c.length,o=!0;c&&u>h;h++)if(c[h].apply(i[0],i[1])===!1&&t.stopOnFalse){e=!1;break}o=!1,c&&(l?l.length&&f(l.shift()):e?c=[]:d.disable())},d={add:function(){if(c){var n=c.length;!function i(e){r.each(e,function(e,n){var o=r.type(n);"function"===o?t.unique&&d.has(n)||c.push(n):n&&n.length&&"string"!==o&&i(n)})}(arguments),o?u=c.length:e&&(a=n,f(e))}return this},remove:function(){return c&&r.each(arguments,function(t,e){for(var n;(n=r.inArray(e,c,n))>-1;)c.splice(n,1),o&&(u>=n&&u--,h>=n&&h--)}),this},has:function(t){return r.inArray(t,c)>-1},empty:function(){return c=[],this},disable:function(){return c=l=e=void 0,this},disabled:function(){return!c},lock:function(){return l=void 0,e||d.disable(),this},locked:function(){return!l},fireWith:function(t,e){return e=e||[],e=[t,e.slice?e.slice():e],!c||n&&!l||(o?l.push(e):f(e)),this},fire:function(){return d.fireWith(this,arguments),this},fired:function(){return!!n}};return d}},function(t,e){function n(t){return null==t?String(t):c[h.call(t)]||"object"}function i(t){return"function"===u.type(t)}function r(t){return"array"===u.type(t)}function o(t,e,n){var r,o=0,s=t.length,a=void 0===s||i(t);if(n)if(a){for(r in t)if(e.apply(t[r],n)===!1)break}else for(;s>o&&e.apply(t[o++],n)!==!1;);else if(a){for(r in t)if(e.call(t[r],r,t[r])===!1)break}else for(;s>o&&e.call(t[o],o,t[o++])!==!1;);return t}function s(t){return!(!t||"object"!==u.type(t))}function a(){var t,e,n,i,r,o,s=arguments[0]||{},a=1,h=arguments.length,c=!1;for("boolean"==typeof s&&(c=s,s=arguments[1]||{},a=2),"object"==typeof s||u.isFunction(s)||(s={}),h===a&&(s=this,--a);h>a;a++)if(null!=(t=arguments[a]))for(e in t)n=s[e],i=t[e],s!==i&&(c&&i&&(u.isPlainObject(i)||(r=u.isArray(i)))?(r?(r=!1,o=n&&u.isArray(n)?n:[]):o=n&&u.isPlainObject(n)?n:{},s[e]=u.extend(c,o,i)):void 0!==i&&(s[e]=i));return s}var u=t.exports={type:n,isArray:r,isFunction:i,isPlainObject:s,each:o,extend:a,noop:function(){}},h=Object.prototype.toString,c={};"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(t){c["[object "+t+"]"]=t.toLowerCase()})},function(t,e,n){function i(t){this.listenTime+=t.from-this.currentTime,this.currentTime=t.to}function r(t){this.listenTime+=t.position-this.currentTime,this.currentTime=t.position}function o(t){this.currentTime=t.position}var s,a=n(7);s=t.exports=function(t){this.scAudio=t,this.listenTime=0,this.currentTime=0,this.scAudio.on(a.SEEK,i,this).on(a.PLAY_START,o,this).on(a.PAUSE,r,this)},s.prototype={constructor:s,getListenTime:function(){return this.listenTime+this.scAudio.currentTime()-this.currentTime}}},function(t,e){var n={CREATED:"created",STATE_CHANGE:"state-change",DESTROYED:"destroyed",PLAY:"play",PLAY_START:"play-start",PLAY_RESUME:"play-resume",METADATA:"metadata",PAUSE:"pause",FINISH:"finish",RESET:"reset",SEEK:"seek",SEEKED:"seeked",GEO_BLOCKED:"geo_blocked",BUFFERRING_START:"buffering_start",BUFFERRING_END:"buffering_end",FLASH_NOT_LOADED:"flash_not_loaded",FLASH_BLOCK:"flash_blocked",FLASH_UNBLOCK:"flash_unblocked",AUDIO_ERROR:"audio_error",TIME:"time",NO_STREAMS:"no_streams",STREAMS:"streams",NO_PROTOCOL:"no_protocol",NO_CONNECTION:"no_connection",REGISTERED:"registered",ONLINE:"online",OFFLINE:"offline"};t.exports=n},function(t,e,n){function i(){return this.scAudio.controller?this.controller?void m.warn("(%s) Setup was called while it was already initialized (returned with a no-op)",this.scAudio.getId()):(m("(%s) Initialized",this.scAudio.getId()),this.controller=this.scAudio.controller,this.protocol=this.scAudio.streamInfo.protocol,void(this.host=S.getUrlHost(this.scAudio.streamInfo.url))):void m.warn("Can´t initialize when controller is null")}function r(){this.controller&&(m("(%s) Reset",this.scAudio.getId()),this.controller=this.protocol=this.host=null,this.timeToPlayMeasured=!1)}function o(t){var e=this.scAudio.getAudioManagerStates();t===e.LOADING?this.timeToPlayMeasured&&f.call(this):A.isNull(this.bufferingStartTime)||d.call(this)}function s(){this.metadataLoadStartTime=Date.now()}function a(){return A.isNull(this.metadataLoadStartTime)?void m.warn("(%s) onMetadataEnd was called without onMetadataStart being called before.",this.scAudio.getId()):(this.log({type:"metadata",latency:Date.now()-this.metadataLoadStartTime}),void(this.metadataLoadStartTime=null))}function u(){this.playClickTime=Date.now()}function h(){if(!this.timeToPlayMeasured){if(A.isNull(this.playClickTime))return void m.warn("(%s) onPlayResume was called without onPlayStart being called before.",this.scAudio.getId());this.log({type:"play",latency:Date.now()-this.playClickTime}),this.playClickTime=null,this.timeToPlayMeasured=!0}}function c(){this.scAudio.isPaused()||(this.seekStartTime=Date.now())}function l(){if(!this.scAudio.isPaused()){if(A.isNull(this.seekStartTime))return void m.warn("(%s) onSeekEnd was called without onSeekStart being called before.",this.scAudio.getId());this.log({type:"seek",latency:Date.now()-this.seekStartTime}),this.seekStartTime=null}}function f(){this.bufferingStartTime||(this.bufferingStartTime=Date.now())}function d(){return A.isNull(this.bufferingStartTime)?void m.warn("(%s) onBufferingEnd was called without onBufferingStart being called before.",this.scAudio.getId()):(p.call(this),void(this.bufferingStartTime=null))}function p(){A.isNull(this.bufferingStartTime)||(A.isNull(this.bufferingTimeAccumulated)&&(this.bufferingTimeAccumulated=0),this.bufferingTimeAccumulated+=Date.now()-this.bufferingStartTime)}function g(){p.call(this),A.isNull(this.bufferingTimeAccumulated)||(this.log({type:"buffer",latency:this.bufferingTimeAccumulated}),this.bufferingStartTime=this.bufferingTimeAccumulated=null)}var _,m,y=n(9),v=n(7),E=n(10),S=n(12),A=n(13);_=t.exports=function(t,e){this.scAudio=t,this.logFn=e,this.controller=null,this.reset(),m=m||y(t.options.debug,"audioperf"),t.on(v.CREATED,i,this).on(v.RESET,r,this).on(v.DESTROYED,r,this).on(v.SEEK,c,this).on(v.SEEKED,l,this).on(v.PLAY,u,this).on(v.PLAY_START,s,this).on(v.PLAY_RESUME,h,this).on(v.PAUSE,g,this).on(v.FINISH,g,this).on(v.STATE_CHANGE,o,this).on(v.METADATA,a,this)},A.extend(_.prototype,E,{constructor:_,log:function(t){return this.controller?(A.extend(t,{protocol:this.protocol,host:this.host,playertype:this.controller.getType()}),m("(%s) %s latency: %d protocol: %s host: %s playertype: %s",this.scAudio.getId(),t.type,t.latency,t.protocol,t.host,t.playertype),void this.logFn(t)):void m.warn("(%s) Monitor log was called while controller is null (returned with a no-op)",this.scAudio.getId())},reset:function(){this.bufferingStartTime=this.bufferingTimeAccumulated=this.playClickTime=this.seekStartTime=this.metadataLoadStartTime=null,this.timeToPlayMeasured=!1}})},function(t,e){function n(){function t(t,n){for(var i,r=arguments.length,o=Array(r>2?r-2:0),s=2;r>s;s++)o[s-2]=arguments[s];"string"==typeof n?n=" "+n:(o.unshift(n),n=""),(i=window.console)[t].apply(i,[e()+" |"+c+"%c"+n].concat(l,o))}function e(){var t=new Date,e=null===h?0:t-h;return h=+t,"%c"+r(t.getHours())+":"+r(t.getMinutes())+":"+r(t.getSeconds())+"."+i(t.getMilliseconds(),"0",3)+"%c (%c"+i("+"+e+"ms"," ",8)+"%c)"}var n=arguments.length<=0||void 0===arguments[0]?!0:arguments[0],o=arguments.length<=1||void 0===arguments[1]?"":arguments[1];if(!n)return s;var h=null,c=a(o),l=["color: green","color: grey","color: blue","color: grey",u(o),""],f=t.bind(null,"log");return f.log=f,["info","warn","error"].forEach(function(e){f[e]=t.bind(null,e)}),f}function i(t,e,n){return o(e,n-(""+t).length)+t}function r(t){return i(t,"0",2)}function o(t,e){return e>0?new Array(e+1).join(t):""}function s(){}function a(t){return t?"%c"+t:"%c"}t.exports=n,s.log=s.info=s.warn=s.error=s;var u=function(){var t=["#51613C","#447848","#486E5F","#787444","#6E664E"],e=0;return function(n){return n?"background-color:"+t[e++%t.length]+";color:#fff;border-radius:3px;padding:2px 4px;font-family:sans-serif;text-transform:uppercase;font-size:9px;margin:0 4px":""}}()},function(t,e,n){t.exports=n(11)},function(t,e,n){!function(){function n(){return{keys:Object.keys||function(t){if("object"!=typeof t&&"function"!=typeof t||null===t)throw new TypeError("keys() called on a non-object");var e,n=[];for(e in t)t.hasOwnProperty(e)&&(n[n.length]=e);return n},uniqueId:function(t){var e=++a+"";return t?t+e:e},has:function(t,e){return o.call(t,e)},each:function(t,e,n){if(null!=t)if(r&&t.forEach===r)t.forEach(e,n);else if(t.length===+t.length)for(var i=0,o=t.length;o>i;i++)e.call(n,t[i],i,t);else for(var s in t)this.has(t,s)&&e.call(n,t[s],s,t)},once:function(t){var e,n=!1;return function(){return n?e:(n=!0,e=t.apply(this,arguments),t=null,e)}}}}var i,r=Array.prototype.forEach,o=Object.prototype.hasOwnProperty,s=Array.prototype.slice,a=0,u=n();i={on:function(t,e,n){if(!c(this,"on",t,[e,n])||!e)return this;this._events||(this._events={});var i=this._events[t]||(this._events[t]=[]);return i.push({callback:e,context:n,ctx:n||this}),this},once:function(t,e,n){if(!c(this,"once",t,[e,n])||!e)return this;var i=this,r=u.once(function(){i.off(t,r),e.apply(this,arguments)});return r._callback=e,this.on(t,r,n)},off:function(t,e,n){var i,r,o,s,a,h,l,f;if(!this._events||!c(this,"off",t,[e,n]))return this;if(!t&&!e&&!n)return this._events={},this;for(s=t?[t]:u.keys(this._events),a=0,h=s.length;h>a;a++)if(t=s[a],o=this._events[t]){if(this._events[t]=i=[],e||n)for(l=0,f=o.length;f>l;l++)r=o[l],(e&&e!==r.callback&&e!==r.callback._callback||n&&n!==r.context)&&i.push(r);i.length||delete this._events[t]}return this},trigger:function(t){if(!this._events)return this;var e=s.call(arguments,1);if(!c(this,"trigger",t,e))return this;var n=this._events[t],i=this._events.all;return n&&l(n,e),i&&l(i,arguments),this},stopListening:function(t,e,n){var i=this._listeners;if(!i)return this;var r=!e&&!n;"object"==typeof e&&(n=this),t&&((i={})[t._listenerId]=t);for(var o in i)i[o].off(e,n,this),r&&delete this._listeners[o];return this}};var h=/\s+/,c=function(t,e,n,i){if(!n)return!0;if("object"==typeof n){for(var r in n)t[e].apply(t,[r,n[r]].concat(i));return!1}if(h.test(n)){for(var o=n.split(h),s=0,a=o.length;a>s;s++)t[e].apply(t,[o[s]].concat(i));return!1}return!0},l=function(t,e){var n,i=-1,r=t.length,o=e[0],s=e[1],a=e[2];switch(e.length){case 0:for(;++i<r;)(n=t[i]).callback.call(n.ctx);return;case 1:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o);return;case 2:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o,s);return;case 3:for(;++i<r;)(n=t[i]).callback.call(n.ctx,o,s,a);return;default:for(;++i<r;)(n=t[i]).callback.apply(n.ctx,e)}},f={listenTo:"on",listenToOnce:"once"};u.each(f,function(t,e){i[e]=function(e,n,i){var r=this._listeners||(this._listeners={}),o=e._listenerId||(e._listenerId=u.uniqueId("l"));return r[o]=e,"object"==typeof n&&(i=this),e[t](n,i,this),this}}),i.bind=i.on,i.unbind=i.off,i.mixin=function(t){var e=["on","once","off","trigger","stopListening","listenTo","listenToOnce","bind","unbind"];return u.each(e,function(e){t[e]=this[e]},this),t},"undefined"!=typeof t&&t.exports&&(e=t.exports=i),e.BackboneEvents=i}(this)},function(t,e){var n={getUrlParams:function(t){var e={},n=t.indexOf("?");return n>-1&&t.substr(n+1).split("&").forEach(function(t){var n=t.split("=");e[n[0]]=n[1]}),e},getUrlHost:function(t){var e,n=t.split("//");return e=n[0]===t?n[0].split("/")[0]:n[1]?n[1].split("/")[0]:""}};t.exports=n},function(t,e){var n={extend:function(t){var e=Array.prototype.slice.call(arguments,1);return e.forEach(function(e){if(e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])}),t},each:function(t,e,n){Object.keys(t).forEach(function(i){e.call(n||null,t[i],i)})},without:function(t,e){var n=t.indexOf(e);n>-1&&t.splice(n,1)},result:function(t){var e=t;return n.isFunction(e)&&(e=t()),e},isFunction:function(t){return"function"==typeof t},after:function(t,e){return function(){return--t<1?e.apply(this,arguments):void 0}},isNull:function(t){return null===t},once:function(t){var e,n=!1;return function(){return n?e:(n=!0,void(e=t.apply(this,arguments)))}}};t.exports=n},function(t,e){var n={AAC:"aac",MP3:"mp3",OGG:"ogg",OPUS:"opus",WAV:"wav"};t.exports=n},function(t,e){var n={HTTP:"http",RTMP:"rtmp",HLS:"hls"};t.exports=n},function(t,e,n){function i(t){return h.supportsMediaSourceExtensions()&&t.mediaSourceEnabled&&(h.isChrome()&&h.getChromeVersion()>=35||h.isFirefox()&&t.mseFirefox||h.isSafari()&&t.mseSafari)}function r(t){return function(e){var n=!1;switch(e){case u.RTMP:n=h.supportsFlash();break;case u.HTTP:n=h.supportsHTML5Audio()||h.supportsFlash();break;case u.HLS:n=i(t)}return n}}function o(t){return h.isSafari()||h.isFirefox()?[u.HLS,u.HTTP,u.RTMP]:t}function s(t){t.protocols=o(t.protocols).filter(r(t))}var a,u=n(15),h=n(17);a={prioritizeAndFilter:s},t.exports=a},function(t,e){function n(t){return t.test(window.navigator.userAgent.toLowerCase())}function i(t,e){try{return window.navigator.userAgent.toLowerCase().match(t)[e]}catch(n){return null}}function r(){try{return parseInt(i(/chrom(e|ium)\/([0-9]+)\./,2),10)}catch(t){return NaN}}function o(){return!h()&&n(/safari/)}function s(){return o()&&n(/version\/7\.1/)}function a(){return o()&&n(/version\/8/)&&!n(/version\/80/)}function u(){return o()&&n(/version\/9\./)}function h(){return n(/chrom(e|ium)/)}function c(){return n(/firefox/)}function l(){return!!window.MediaSource&&(window.MediaSource.isTypeSupported("audio/mpeg")||window.MediaSource.isTypeSupported("audio/mp4"))}function f(){try{return window.hasOwnProperty("Audio")&&!!(new window.Audio).canPlayType("audio/mpeg")}catch(t){return!1}}function d(){try{var t=o()&&n(/version\/5\.0/),e=window.hasOwnProperty("Audio")&&(!!(new window.Audio).canPlayType('audio/x-mpegURL; codecs="mp3"')||!!(new window.Audio).canPlayType('vnd.apple.mpegURL; codecs="mp3"'));return!t&&e}catch(i){return!1}}function p(){return _(g())>=y}function g(){var t,e,n,i;if("undefined"!=typeof window.ActiveXObject)try{i=new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash"),i&&(t=i.GetVariable("$version"))}catch(r){t=null}else window.navigator&&window.navigator.plugins&&window.navigator.plugins.length>0&&(n="application/x-shockwave-flash",e=window.navigator.mimeTypes,e&&e[n]&&e[n].enabledPlugin&&e[n].enabledPlugin.description&&(t=e[n].enabledPlugin.description));return t}function _(t){if(!t)return 0;var e=t.match(/\d\S+/)[0].replace(/,/g,".").split(".");return parseFloat([e[0],e[1]].join("."))||0}var m,y=9;m={flashPlugin:g,isSafari:o,isSafari71:s,isSafari8:a,isSafari9:u,isChrome:h,getChromeVersion:r,isFirefox:c,supportsNativeHLSAudio:d,supportsHTML5Audio:f,supportsFlash:p,supportsMediaSourceExtensions:l},t.exports=m},function(t,e,n){function i(t){var e=f.getUrlHost(t);return p.every(function(t){return 0!==e.indexOf(t)})}function r(t,e){return!(t===c.HLS&&!i(e))}function o(t,e){if(!t)return!1;var n=t.issuedAt+s(t.protocol,t.duration);return a(t.protocol)?Date.now()+t.duration-(e||0)<n:Date.now()<n}function s(t,e){var n=a(t);return g+(n?l.result(e):0)}function a(t){return t===c.HTTP||t===c.HLS}function u(t,e){function n(t){return-1*t}function i(t,e){return Math.abs(e-m)-Math.abs(t-m)}var o,s,a,u,h,c,f,d,p,g,_={},m=e.maxBitrate,y=e.protocols,v=e.extensions;for(l.each(t,function(t,e){var n=e.split("_"),i=n[0],r=n[1],o=n[2];_[i]=_[i]||{},_[i][r]=_[i][r]||{},_[i][r][o]=t}),h=0,c=y.length;c>h;++h)for(u=y[h],d=0,p=v.length;p>d;++d)if(f=v[d],_[u]&&_[u][f]){if(o=Object.keys(_[u][f]).map(Number).sort(n),s=m===1/0,a=m===-(1/0),m=s||a?o[s?"pop":"shift"]():o.sort(i).pop(),g=_[u][f][m],!r(u,g))continue;return{url:g,bitrate:m,protocol:u,extension:f,issuedAt:Date.now(),duration:l.result(e.duration)}}return null}var h,c=n(15),l=n(13),f=n(12),d=.9,p=[],g=Math.floor(12e4*d);h={choosePreferredStream:u,streamValidForPlayingFrom:o},t.exports=h},function(t,e,n){var i,r,o=n(7),s=n(13),a={Linear:0,EaseOut:1,EaseInOut:2},u=600,h=25;t.exports=i={},i.VolumeAutomator=r=function(t){this.scAudio=t,this.fadeOutAlgo=this.scAudio.options.fadeOutAlgo,this.fadeOutTimer=null,this.initialVolume=void 0,this.scAudio.options.fadeOutOnPause&&r.isSupported()&&(this.scAudio.on(o.PLAY,this.onPlay,this),this.scAudio.registerHook("pause",this.hookPause.bind(this)))},i.VolumeAutomator.isSupported=function(){var t=new window.Audio,e=t.volume,n=0===e?1:e/2;return t.volume=n,t.volume===n},i.VolumeAutomator.Algos=a,s.extend(r.prototype,{fadeOutAndPause:function(){var t=Date.now(),e=function(){var n,i=(Date.now()-t)/u,r=this.initialVolume;if(i>=1)this.scAudio.controller&&this.scAudio.controller.pause(),this.cancelFadeout();else{switch(this.fadeOutAlgo){case a.Linear:n=r*(1-i);break;case a.EaseOut:n=r*(1/(10*(i+.1))-.05);break;case a.EaseInOut:default:n=r*(Math.cos(i*Math.PI)/2+.5)}this.scAudio.setVolume(n),window.clearTimeout(this.fadeOutTimer),this.fadeOutTimer=window.setTimeout(e,h)}}.bind(this);this.initialVolume=this.scAudio.getVolume(),e()},cancelFadeout:function(){this.fadeOutTimer&&(window.clearTimeout(this.fadeOutTimer),this.fadeOutTimer=null,this.scAudio.setVolume(this.initialVolume),this.initialVolume=void 0)},hookPause:function(t){return this.fadeOutAndPause(),!1},onPlay:function(){this.cancelFadeout()}})}])},function(t,e){}])});

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/afterglow.js":[function(require,module,exports){
'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _Scroller = require('./components/Scroller.js');

var _Scroller2 = _interopRequireDefault(_Scroller);

var _ScrollTo = require('./components/ScrollTo.js');

var _ScrollTo2 = _interopRequireDefault(_ScrollTo);

var _Player = require('./components/Player.js');

var _Player2 = _interopRequireDefault(_Player);

var _Mailer = require('./components/Mailer.js');

var _Mailer2 = _interopRequireDefault(_Mailer);

var _pubSub = require('./components/pubSub.js');

var _pubSub2 = _interopRequireDefault(_pubSub);

var _helpers = require('./helpers/helpers');

var h = _interopRequireWildcard(_helpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Warp from './components/Warp.js';
var components = {};
(0, _jquery2.default)('.bg-scroller').map(function (i, el) {
	var scroller = new _Scroller2.default(el, _pubSub2.default);
	if (!components.scrollers) components.scrollers = [];
	components.scrollers.push(scroller);
});

(0, _jquery2.default)('section.player').map(function (i, el) {
	var player = new _Player2.default(el, _pubSub2.default);
	if (!components.players) components.players = [];
	components.players.push(player);
});

(0, _jquery2.default)('.signup').map(function (i, el) {
	var mailer = new _Mailer2.default(el, _pubSub2.default);
	if (!components.mailers) components.mailers = [];
	components.mailers.push(mailer);
});

(0, _jquery2.default)('.scrollTo').map(function (i, el) {
	var scrollTo = new _ScrollTo2.default(el, _pubSub2.default);
	// scrollTo.autoCallback = components.player.play.bind(player);
	scrollTo.setAuto();
	if (!components.scrollTos) components.scrollTos = [];
	components.scrollTos.push(scrollTo);
});

var header = {
	init: function init() {
		var _this = this;

		this.element = (0, _jquery2.default)('header');
		this.button = this.element.find('.header__button');
		this.notified = false;
		this.mailer = this.element.find('.signup');
		this.isMobile = h.isTouchDevice();
		this.lastY = (0, _jquery2.default)(window).scrollTop();
		this.scrollDirectionBuffer = 15;
		this.disabled = false;

		this.inView = this.isInView.bind(this);
		this.calculate = this.calculate.bind(this);

		_pubSub2.default.subscribe('WindowScrolled', this.isInView.bind(this));
		_pubSub2.default.subscribe('HeaderScrollDisabled', this.toggleScroll.bind(this));
		_pubSub2.default.subscribe('EmailSubscribed', function () {
			setTimeout(function () {
				_this.element.removeClass('open in-view');
				_this.emailSubscribed = true;
				_pubSub2.default.unsubscribe('WindowScrolled');
			}, 1300);
		});

		this.calculate();
		// this.button.click(() => this.element.toggleClass('in-view').removeClass('in-view'));
		this.element.mouseenter(function () {
			_this.notified = true;
			_this.element.addClass('in-view');
		}).mouseleave(function () {
			if (!_this.mailer.hasClass('thinking')) {
				setTimeout(function () {
					return _this.element.removeClass('in-view');
				}, 300);
			}
		});

		(0, _jquery2.default)(window).on('load', function () {
			setTimeout(function () {
				if (!_this.notified) _this.element.addClass('in-view');
			}, 8000);
		});
	},
	toggleScroll: function toggleScroll(disabled) {
		this.disabled = disabled;
		console.log(this.disabled);
	},
	calculate: function calculate() {
		this.triggerY = (0, _jquery2.default)('section.deny').offset().top + window.innerHeight;
	},
	isInView: function isInView(ypos) {
		var _this2 = this;

		if (!this.emailSubscribed && !this.disabled) {
			if (this.isMobile) {
				var currentY = ypos;
				this.element.toggleClass('in-view', ypos < this.lastY);
				this.lastY = currentY;
			} else {
				if (!this.triggerY) return false;
				if (ypos > this.triggerY && !this.notified) {
					this.element.toggleClass('in-view', ypos > this.triggerY);
					this.notified = true;
					setTimeout(function () {
						return _this2.element.removeClass('in-view');
					}, 3000);
					_pubSub2.default.unsubscribe('WindowScrolled');
				}
			}
		}
		return true;
	}
};

header.init();

// Manage event emitters

(0, _jquery2.default)(window).on('load', function () {
	(0, _jquery2.default)(document).on('mousemove', function (e) {
		return _pubSub2.default.emit('MouseMoved', e);
	});
	(0, _jquery2.default)(window).on('scroll', function () {
		_pubSub2.default.emit('WindowScrolled', (0, _jquery2.default)(window).scrollTop());
	});
	var skipframe = false;
	function draw() {
		requestAnimationFrame(draw);
		if (skipframe) {
			skipframe = false;
		} else {
			_pubSub2.default.emit('FrameRequested');
			skipframe = false;
		}
	}
	draw();

	(0, _jquery2.default)('.full-height').css('height', window.innerHeight);
});

window.onbeforeunload = function () {
	return window.scrollTo(0, 0);
};

},{"./components/Mailer.js":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Mailer.js","./components/Player.js":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Player.js","./components/ScrollTo.js":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/ScrollTo.js","./components/Scroller.js":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Scroller.js","./components/pubSub.js":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/pubSub.js","./helpers/helpers":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/helpers/helpers.js","jquery":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Mailer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mailer = function () {
	function Mailer(element, publisher) {
		var _this = this;

		_classCallCheck(this, Mailer);

		this.element = (0, _jquery2.default)(element);
		this.publisher = publisher;
		this.form = this.element.find('form.signup__form');
		this.emailInput = this.form.find('input.signup__input')[0];
		this.message = this.element.find('.message');

		this.valid = undefined;

		this.publisher.subscribe('EmailSubscribed', function () {
			return _this.element.addClass('thinking success');
		});

		this.setBindings();
	}

	_createClass(Mailer, [{
		key: 'setBindings',
		value: function setBindings() {
			var _this2 = this;

			var email = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/;

			this.form.submit(function (e) {
				e.preventDefault();
				var address = _this2.emailInput.value;
				var data = _this2.form.serialize();
				if (!email.test(address)) {
					_this2.setMessage('enter a valid email address');
				} else {
					_this2.submitForm(data);
				}
			});
			this.form.on('keyup.mailer change.mailer', function () {
				var wasValid = _this2.valid;
				var address = _this2.emailInput.value;

				_this2.valid = email.test(address);
				_this2.element.toggleClass('valid', _this2.valid);
				if (!wasValid && _this2.valid) _this2.setMessage('');
			});
		}
	}, {
		key: 'setMessage',
		value: function setMessage(string) {
			var _this3 = this;

			if (string === '') {
				this.message.removeClass('visible');
				setTimeout(function () {
					return _this3.message.text('');
				}, 300);
			} else {
				this.message.html(string).addClass('visible');
			}
		}
	}, {
		key: 'submitForm',
		value: function submitForm(data) {
			var _this4 = this;

			this.element.addClass('thinking');
			_axios2.default.post('/mcsubscribe', data).then(function (response) {
				console.log(response);
				if (response.status === 200) {
					_this4.element.addClass('success');
					_this4.publisher.emit('EmailSubscribed');
				} else {
					_this4.element.removeClass('thinking');
					_this4.setMessage('Sorry, it looks like there was an error.<br>Try again or let us know at info@luckyme.net');
				}
			});
		}
	}]);

	return Mailer;
}();

exports.default = Mailer;

},{"axios":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/axios/index.js","jquery":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Player.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _scrollTo = require('scroll-to');

var _scrollTo2 = _interopRequireDefault(_scrollTo);

var _soundcloud = require('soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

var _soundcloudResolveJsonp = require('soundcloud-resolve-jsonp');

var _soundcloudResolveJsonp2 = _interopRequireDefault(_soundcloudResolveJsonp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clientId = '20f6b95488a0ca8f2254e250e6b0b229';
_soundcloud2.default.initialize({ clientId: clientId });

var Player = function () {
	function Player(element, publisher) {
		var _this = this;

		_classCallCheck(this, Player);

		this.play = this.play.bind(this);
		this.pulseBackground = this.pulseBackground.bind(this);
		this.handleFrameRequest = this.handleFrameRequest.bind(this);
		this.snap = this.snap.bind(this);
		this.publisher = publisher;

		this.element = (0, _jquery2.default)(element);
		this.track = this.element.find('.track')[0];
		this.playButton = this.element.find('.player__controls.play');
		this.pauseButton = this.element.find('.player__controls.pause');
		this.scrubber = this.element.find('.player__scrubber');
		// this.background = this.element.find('.player__pulse');
		this.background = this.pauseButton;

		this.debugTime = Date.now();

		this.publisher.subscribe('FrameRequested', this.handleFrameRequest);
		this.publisher.subscribe('WindowScrolled', this.snap);

		this.playing = false;
		this.scrubber.right = 100;
		this.dragging = false;
		this.currentPosition = 0; // 0 - 99.8
		this.fellBack = false;

		// analyser init
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = audioCtx.createAnalyser();
		this.analyser.fftSize = 256;
		this.analyser.source = audioCtx.createMediaElementSource(this.track);
		this.analyser.source.connect(this.analyser);
		this.analyser.connect(audioCtx.destination);
		this.streamData = new Uint8Array(128);
		this.volume = 0;
		this.volumeTracker = [];
		this.volumeTracker = [1176, 2512, 2739, 2873, 3505, 3626, 3686, 3689, 3689, 3756, 3791, 4843, 5450, 5585, 5711, 0, 688, 2394];
		this.track.crossOrigin = 'anonymous';

		var trackUrl = (0, _jquery2.default)(this.element).attr('data-track');

		// this.track.addEventListener('error', (e) => {
		// 	console.log(e, e.error);
		// 	this.ifSCError();
		// });

		(0, _soundcloudResolveJsonp2.default)({ url: trackUrl, client_id: clientId }, function (error, response) {
			if (error) {
				_this.ifSCError();
			} else {
				var QorAmp = response.stream_url.indexOf('?') > -1 ? '&' : '?';
				var stream = '' + response.stream_url + QorAmp + 'client_id=' + clientId;
				_this.track.setAttribute('src', stream);
				_this.element.addClass('ready');
				_this.bindButtons();
			}
		});
	}

	_createClass(Player, [{
		key: 'ifSCError',
		value: function ifSCError() {
			if (this.fellBack) return false;
			this.fellBack = true;
			var fallBack = (0, _jquery2.default)('<iframe/>');
			fallBack.attr('src', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/276705791&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true').attr('scrolling', 'no').attr('frameborder', 'no');
			this.element.addClass('fallback').find('.player__footer').before(fallBack);
			return true;
		}
	}, {
		key: 'bindButtons',
		value: function bindButtons() {
			var _this2 = this;

			this.playButton.click(function () {
				return _this2.play();
			});
			this.pauseButton.click(function () {
				return _this2.pause();
			});
			this.scrubber.mousedown(function (e) {
				return _this2.moveScrubber(e);
			});
			(0, _jquery2.default)(document).mouseup(function (e) {
				return _this2.setNewPosition(e);
			});
		}
	}, {
		key: 'play',
		value: function play() {
			this.track.play();
			this.playing = true;
			this.setClass();
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.track.pause();
			this.playing = false;
			this.setClass();
		}
	}, {
		key: 'togglePlayPause',
		value: function togglePlayPause() {
			this.playing = !this.playing;
			this.setClass();
		}
	}, {
		key: 'setClass',
		value: function setClass() {
			this.element.toggleClass('playing', this.playing);
		}
	}, {
		key: 'snap',
		value: function snap() {
			var _this3 = this;

			clearTimeout(this.snapTimer);
			this.snapTimer = setTimeout(function () {
				var duration = 1000;
				_this3.publisher.emit('HeaderScrollDisabled', true);
				setTimeout(function () {
					return _this3.publisher.emit('HeaderScrollDisabled', false);
				}, duration);
				if (Math.abs((0, _jquery2.default)(window).scrollTop() - _this3.element.offset().top) < window.innerHeight * 0.4) {
					(0, _scrollTo2.default)(0, _this3.element.offset().top, {
						duration: duration
					});
				}
			}, 500);
		}
	}, {
		key: 'handleFrameRequest',
		value: function handleFrameRequest() {
			if (!this.playing || !this.track) return false;
			this.scrub();
			this.pulseBackground();
			return true;
		}
	}, {
		key: 'sampleAudioStream',
		value: function sampleAudioStream() {
			this.analyser.getByteFrequencyData(this.streamData);
			var total = 0;
			for (var i = 0; i < 45; i++) {
				total += this.streamData[i];
			}
			this.volume = total;
		}
	}, {
		key: 'pulseBackground',
		value: function pulseBackground() {
			this.sampleAudioStream();
			if (this.volumeTracker.length < 18) {
				this.volumeTracker.push(this.volume);
			} else {
				this.volumeTracker.shift();
				this.volumeTracker.push(this.volume);
			}

			var min = Math.min.apply(Math, _toConsumableArray(this.volumeTracker));
			var max = Math.max.apply(Math, _toConsumableArray(this.volumeTracker));
			var range = max - min;
			var diff = (this.volume - min) / range;
			var mod = 2;
			var opacity = -(diff * mod - mod / 2);
			var fill = 'rgba(0, 0, 0, ' + opacity + ')';
			this.background.css({ fill: fill });
			return true;
		}
	}, {
		key: 'moveScrubber',
		value: function moveScrubber(e) {
			var _this4 = this;

			this.dragging = true;
			this.scrubber.addClass('dragging');
			var initialX = e.clientX;
			var initialPosition = this.currentPosition;
			(0, _jquery2.default)(document).on('mousemove.scrubber', function (moveE) {
				var newX = moveE.clientX;
				_this4.currentPosition = Math.min(100, (newX - initialX) / window.innerWidth * 100 + initialPosition);
				_this4.scrubber.css({ right: 100 - _this4.currentPosition + '%' });
			});
		}
	}, {
		key: 'setNewPosition',
		value: function setNewPosition() {
			if (!this.dragging) return false;
			this.track.currentTime = this.track.duration * (this.currentPosition / 100);
			(0, _jquery2.default)(document).unbind('.scrubber');
			this.dragging = false;
			this.scrubber.removeClass('dragging');
			return true;
		}
	}, {
		key: 'scrub',
		value: function scrub() {
			if (this.dragging) return false;
			this.currentPosition = this.track.currentTime / this.track.duration * 100;
			this.scrubber.css({ right: 100 - this.currentPosition + '%' });

			if (this.currentPosition >= 99.99) {
				this.pause();
				this.track.currentTime = 0;
			}
			return true;
		}
	}]);

	return Player;
}();

exports.default = Player;

},{"jquery":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js","scroll-to":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/scroll-to/index.js","soundcloud":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud/sdk.js","soundcloud-resolve-jsonp":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/soundcloud-resolve-jsonp/index.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/ScrollTo.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _scrollTo = require('scroll-to');

var _scrollTo2 = _interopRequireDefault(_scrollTo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScrollTo = function () {
	function ScrollTo(element, publisher) {
		_classCallCheck(this, ScrollTo);

		this.element = (0, _jquery2.default)(element);
		this.destination = this.element.attr('data-scrollTo');
		this.bindElement();
		this.publisher = publisher;
		// this.setAuto();
	}

	_createClass(ScrollTo, [{
		key: 'setAuto',
		value: function setAuto() {
			var _this = this;

			var delay = parseInt(this.element.attr('data-scrollTo-auto'), 10);
			if (delay) {
				this.publisher.emit('HeaderScrollDisabled', true);
				setTimeout(function () {
					return _this.publisher.emit('HeaderScrollDisabled', false);
				}, delay);

				this.timer = setTimeout(function () {
					_this.go();
					// this.autoCallback();
				}, delay);
			}
		}
	}, {
		key: 'bindElement',
		value: function bindElement() {
			var _this2 = this;

			this.element.click(function () {
				_this2.go();
				clearTimeout(_this2.timer);
				(0, _jquery2.default)(window).unbind('.scrollToEvents');
			});
			(0, _jquery2.default)(window).on('scroll.scrollToEvents', function () {
				if ((0, _jquery2.default)(window).scrollTop() > 100) {
					clearTimeout(_this2.timer);
					(0, _jquery2.default)(window).unbind('.scrollToEvents');
				}
			});
		}
	}, {
		key: 'go',
		value: function go() {
			var y = (0, _jquery2.default)(this.destination).offset().top;
			(0, _scrollTo2.default)(0, y, {
				duration: 1000
			});
		}
	}]);

	return ScrollTo;
}();

exports.default = ScrollTo;

},{"jquery":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js","scroll-to":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/scroll-to/index.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/Scroller.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import Observer from './Observer';


var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scroller = function () {
	function Scroller(element, publisher) {
		_classCallCheck(this, Scroller);

		this.element = (0, _jquery2.default)(element);
		this.reverse = this.element.attr('data-reverse') === 'true';
		this.velocity = 2;
		this.bgLeft = 0;
		// this.y = 0; // 'current' y as far as setVelocity is concerned
		// this.yd = 0; // 'destination' y

		// this.calculate = this.calculate.bind(this);
		this.setVisibility = this.setVisibility.bind(this);
		// this.setVelocity = this.setVelocity.bind(this);
		this.setBackgroundPosition = this.setBackgroundPosition.bind(this);
		// this.handleMouseMove = this.handleMouseMove.bind(this);

		publisher.subscribe('FrameRequested', this.setBackgroundPosition);
		// publisher.subscribe('MouseMoved', this.handleMouseMove);
		publisher.subscribe('WindowScrolled', this.setVisibility);

		this.calculate();
		this.setVisibility((0, _jquery2.default)(window).scrollTop());
	}

	_createClass(Scroller, [{
		key: 'calculate',
		value: function calculate() {
			this.min = this.element.offset().top;
			this.max = this.min + this.element.outerHeight(true);
			this.windowHeight = window.innerHeight;
		}
	}, {
		key: 'setVisibility',
		value: function setVisibility(ypos) {
			this.inView = ypos < this.max && ypos + this.windowHeight > this.min;
			// console.log(ypos, this.inView);
			return this.inView;
		}

		// delta(a, b) {
		// 	const factor = 0.1;
		// 	return (factor * (b - a)) + a;
		// }

		// handleMouseMove(e) {
		// 	this.yd = e.clientY;
		// }

		// setVelocity(destination = this.yd) {
		// 	if (!this.inView) return false;
		// 	const y = this.delta(this.y, destination);
		// 	const base = 0.2;
		// 	const mod = 1.8;
		// 	const ypos = (this.reverse) ? (y / (this.windowHeight)) : (this.windowHeight - y) / this.windowHeight;
		// 	this.velocity = (ypos * mod) + base;
		// 	this.y = Math.floor(y);
		// 	return true;
		// }

	}, {
		key: 'setBackgroundPosition',
		value: function setBackgroundPosition() {
			if (!this.inView) return false;
			// if (Math.floor(this.y) !== Math.floor(this.yd)) this.setVelocity();
			this.bgLeft = this.reverse ? this.bgLeft - this.velocity : this.bgLeft + this.velocity;
			console.log(this.bgLeft);
			this.element.css({
				'background-position': this.bgLeft + 'px center'
			});
			return true;
		}
	}]);

	return Scroller;
}();

exports.default = Scroller;

},{"jquery":"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/node_modules/jquery/dist/jquery.js"}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/components/pubSub.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PubSubEmitter = function () {
	function PubSubEmitter() {
		_classCallCheck(this, PubSubEmitter);

		// create a new Map to hold all of the topics
		this.listeners = new Map();
	}

	_createClass(PubSubEmitter, [{
		key: 'subscribe',
		value: function subscribe(topic, callback) {
			// if the listener does not hae the topic yet, add it.
			if (!this.listeners.has(topic)) this.listeners.set(topic, []);
			// push the callback to the topic's array
			this.listeners.get(topic).push(callback);
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(topic, callback) {
			var listeners = this.listeners.get(topic);
			var index = void 0;

			if (listeners && listeners.length) {
				// find the index of the callback we're removing
				index = listeners.reduce(function (i, listener, currentIndex) {
					typeof listener === 'function' && listener === callback ? i = currentIndex : i;
				}, -1);

				if (index > -1) {
					// if we found a match, splice it out, and resupply the map with the spliced array
					listeners.splice(index, 1);
					this.listeners.set(topic, listeners);
					return true; // return true if we removed something
				}
			}
			return false; // return false if we didn't
		}
	}, {
		key: 'emit',
		value: function emit(topic) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			// get the listeners subscribed to the topic
			var listeners = this.listeners.get(topic);

			if (listeners && listeners.length) {
				// execute each callback with any supplied arguments
				listeners.forEach(function (listener) {
					listener.apply(undefined, args);
				});
				return true;
			}
			return false;
		}
	}]);

	return PubSubEmitter;
}();

var publisher = new PubSubEmitter();

exports.default = publisher;

},{}],"/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/helpers/helpers.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isTouchDevice = isTouchDevice;
function isTouchDevice() {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

},{}]},{},["/Users/Joseph/Sites/luckyme/jacquesgreene.com/html/src/js/afterglow.js"])


//# sourceMappingURL=afterglow.js.map
