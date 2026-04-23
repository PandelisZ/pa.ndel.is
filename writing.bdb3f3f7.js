// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/writing.js":[function(require,module,exports) {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(function initWritingPageRenderer() {
  var ARTICLE_DATA_URL = './articles.json';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function formatDate(dateString) {
    var date = new Date("".concat(dateString, "T00:00:00"));
    if (Number.isNaN(date.getTime())) return escapeHtml(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '').toUpperCase();
    } catch (error) {
      return 'EXTERNAL';
    }
  }

  function getArticleHref(article) {
    if (article.externalLink) return article.externalLink;
    return "article.html?id=".concat(encodeURIComponent(article.slug));
  }

  function renderTags() {
    var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return tags.slice(0, 3).map(function (tag) {
      return "<span class=\"writing-card__tag\">".concat(escapeHtml(tag), "</span>");
    }).join('');
  }

  function renderArticleCard(article, index) {
    var href = getArticleHref(article);
    var isExternal = Boolean(article.externalLink);
    var linkAttributes = isExternal ? 'target="_blank" rel="noopener"' : 'data-internal-link';
    var linkLabel = isExternal ? "READ ON ".concat(getDomain(article.externalLink)) : 'READ PIECE';
    return "\n      <article class=\"article-card writing-card glitch-target\" data-cursor=\"hover\" style=\"--card-index: ".concat(index, "\">\n        <div class=\"writing-card__rail\">\n          <span>").concat(String(index + 1).padStart(2, '0'), "</span>\n          <span>").concat(escapeHtml(article.readTime || article.category || 'WRITING'), "</span>\n        </div>\n        <div class=\"writing-card__meta\">\n          <span class=\"article-date\">").concat(formatDate(article.date), "</span>\n          <div class=\"article-tags\">").concat(renderTags(article.tags), "</div>\n        </div>\n        <h2 class=\"writing-card__title\">\n          <a href=\"").concat(escapeHtml(href), "\" ").concat(linkAttributes, ">").concat(escapeHtml(article.title), "</a>\n        </h2>\n        <p class=\"writing-card__excerpt\">").concat(escapeHtml(article.excerpt), "</p>\n        <a href=\"").concat(escapeHtml(href), "\" ").concat(linkAttributes, " class=\"read-more writing-card__link\" data-cursor=\"hover\">\n          ").concat(linkLabel, " &rarr;\n        </a>\n      </article>\n    ");
  }

  function renderWritingPage() {
    return _renderWritingPage.apply(this, arguments);
  }

  function _renderWritingPage() {
    _renderWritingPage = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var root,
          articleGrid,
          pageInfo,
          response,
          data,
          articles,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              root = _args.length > 0 && _args[0] !== undefined ? _args[0] : document;
              articleGrid = root.querySelector('#article-grid');
              pageInfo = root.querySelector('#page-info');

              if (articleGrid) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return");

            case 5:
              articleGrid.dataset.state = 'loading';
              articleGrid.innerHTML = '<div class="writing-state">LOADING WRITING INDEX</div>';
              _context.prev = 7;
              _context.next = 10;
              return fetch(ARTICLE_DATA_URL);

            case 10:
              response = _context.sent;

              if (response.ok) {
                _context.next = 13;
                break;
              }

              throw new Error("HTTP ".concat(response.status));

            case 13:
              _context.next = 15;
              return response.json();

            case 15:
              data = _context.sent;
              articles = (data.articles || []).filter(function (article) {
                return article && article.title && (article.slug || article.externalLink);
              }).sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
              });

              if (articles.length) {
                _context.next = 22;
                break;
              }

              articleGrid.dataset.state = 'empty';
              articleGrid.innerHTML = '<div class="writing-state">NO WRITING FOUND</div>';
              if (pageInfo) pageInfo.textContent = 'SHOWING 0 OF 0';
              return _context.abrupt("return");

            case 22:
              articleGrid.dataset.state = 'ready';
              articleGrid.innerHTML = articles.map(renderArticleCard).join('');

              if (pageInfo) {
                pageInfo.textContent = "SHOWING 1-".concat(articles.length, " OF ").concat(articles.length);
              }

              document.dispatchEvent(new CustomEvent('contentloaded', {
                detail: {
                  type: 'writing',
                  count: articles.length
                }
              }));
              _context.next = 34;
              break;

            case 28:
              _context.prev = 28;
              _context.t0 = _context["catch"](7);
              console.error('[Writing] Error loading articles', _context.t0);
              articleGrid.dataset.state = 'error';
              articleGrid.innerHTML = '<div class="writing-state">ERROR LOADING WRITING</div>';
              if (pageInfo) pageInfo.textContent = 'WRITING INDEX UNAVAILABLE';

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[7, 28]]);
    }));
    return _renderWritingPage.apply(this, arguments);
  }

  window.renderWritingPage = renderWritingPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      return renderWritingPage();
    });
  } else {
    renderWritingPage();
  }
})();
},{}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55625" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","js/writing.js"], null)
//# sourceMappingURL=/writing.bdb3f3f7.js.map