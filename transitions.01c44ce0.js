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
})({"js/transitions.js":[function(require,module,exports) {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * PageTransition - full-screen 3D page transition system.
 *
 * The transition is intentionally self-contained: PageManager asks it to play
 * the exit phase, then the next document plays the entry phase from
 * sessionStorage. That keeps the writing and article pages as normal static
 * pages, so their page-specific scripts run reliably after navigation.
 */
var PageTransition =
/*#__PURE__*/
function () {
  function PageTransition() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PageTransition);

    this.options = _objectSpread({
      outDuration: 980,
      inDuration: 780,
      pixelRatio: 1.5,
      incomingKey: 'pandelis:incoming-transition'
    }, options);
    this.canvas = null;
    this.shell = null;
    this.hud = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.world = null;
    this.gate = [];
    this.frames = [];
    this.shards = [];
    this.cards = [];
    this.clock = new THREE.Clock();
    this.animationId = null;
    this.phase = 'idle';
    this.ready = false;
    this.isActive = false;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animatePhase = this.animatePhase.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  _createClass(PageTransition, [{
    key: "init",
    value: function init() {
      if (this.ready || this.prefersReducedMotion || typeof THREE === 'undefined') {
        return this;
      }

      this.createShell();
      this.setupScene();
      this.addLights();
      this.buildGeometry();
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
      this.ready = true;
      this.playIncomingTransition();
      return this;
    }
  }, {
    key: "createShell",
    value: function createShell() {
      this.shell = document.createElement('div');
      this.shell.className = 'transition-shell';
      this.shell.setAttribute('aria-hidden', 'true');
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'transition-canvas';
      this.hud = document.createElement('div');
      this.hud.className = 'transition-hud';
      this.hud.innerHTML = ['<span class="transition-hud__label">PAGE TRANSFER</span>', '<span class="transition-hud__target"></span>', '<span class="transition-hud__counter">00</span>'].join('');
      this.shell.appendChild(this.canvas);
      this.shell.appendChild(this.hud);
      document.body.appendChild(this.shell);
    }
  }, {
    key: "setupScene",
    value: function setupScene() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 90);
      this.camera.position.set(0, 0, 8.5);
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.world = new THREE.Group();
      this.scene.add(this.world);
    }
  }, {
    key: "addLights",
    value: function addLights() {
      var ambient = new THREE.AmbientLight(0xffffff, 0.58);
      var key = new THREE.DirectionalLight(0xf3cd05, 1.45);
      var rim = new THREE.DirectionalLight(0xffffff, 0.8);
      key.position.set(-4, 5, 6);
      rim.position.set(5, -2, 8);
      this.scene.add(ambient, key, rim);
    }
  }, {
    key: "buildGeometry",
    value: function buildGeometry() {
      var yellow = new THREE.MeshPhongMaterial({
        color: 0xf3cd05,
        shininess: 80
      });
      var black = new THREE.MeshPhongMaterial({
        color: 0x050505,
        shininess: 35
      });
      var white = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 20
      });
      var line = new THREE.LineBasicMaterial({
        color: 0xf3cd05,
        transparent: true,
        opacity: 0.55
      });
      this.buildGate(yellow, black);
      this.buildFrames(line);
      this.buildShards(yellow, black, white);
      this.buildCards(yellow, black, white);
    }
  }, {
    key: "buildGate",
    value: function buildGate(yellow, black) {
      var _this = this;

      var horizontalGeometry = new THREE.BoxGeometry(14, 1.2, 0.7);
      var verticalGeometry = new THREE.BoxGeometry(1.2, 10, 0.7);
      var gateParts = [{
        name: 'left',
        geometry: verticalGeometry,
        material: black,
        open: [-7.2, 0, 0],
        closed: [-1.95, 0, 1.2]
      }, {
        name: 'right',
        geometry: verticalGeometry,
        material: black,
        open: [7.2, 0, 0],
        closed: [1.95, 0, 1.2]
      }, {
        name: 'top',
        geometry: horizontalGeometry,
        material: yellow,
        open: [0, 5.2, 0.2],
        closed: [0, 2.45, 1.5]
      }, {
        name: 'bottom',
        geometry: horizontalGeometry,
        material: yellow,
        open: [0, -5.2, 0.2],
        closed: [0, -2.45, 1.5]
      }];
      this.gate = gateParts.map(function (part) {
        var mesh = new THREE.Mesh(part.geometry, part.material);
        mesh.name = part.name;
        mesh.userData.open = _construct(THREE.Vector3, _toConsumableArray(part.open));
        mesh.userData.closed = _construct(THREE.Vector3, _toConsumableArray(part.closed));
        mesh.position.copy(mesh.userData.open);

        _this.world.add(mesh);

        return mesh;
      });
    }
  }, {
    key: "buildFrames",
    value: function buildFrames(material) {
      for (var index = 0; index < 11; index++) {
        var width = 3.8 + index * 1.1;
        var height = 2.3 + index * 0.72;
        var z = -index * 1.85;
        var points = [new THREE.Vector3(-width, -height, z), new THREE.Vector3(width, -height, z), new THREE.Vector3(width, height, z), new THREE.Vector3(-width, height, z), new THREE.Vector3(-width, -height, z)];
        var frame = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
        frame.userData.baseZ = z;
        this.frames.push(frame);
        this.world.add(frame);
      }
    }
  }, {
    key: "buildShards",
    value: function buildShards(yellow, black, white) {
      var materials = [yellow, black, white];

      for (var index = 0; index < 34; index++) {
        var width = 0.18 + Math.random() * 0.55;
        var height = 0.16 + Math.random() * 0.8;
        var depth = 0.08 + Math.random() * 0.35;
        var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials[index % materials.length]);
        mesh.userData.seed = Math.random() * Math.PI * 2;
        mesh.userData.radius = 2.2 + Math.random() * 7.5;
        mesh.userData.speed = 0.6 + Math.random() * 1.6;
        mesh.userData.open = new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 9, -10 - Math.random() * 15);
        mesh.userData.closed = new THREE.Vector3((Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 2.1, 1.2 + Math.random() * 2.5);
        mesh.position.copy(mesh.userData.open);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        this.shards.push(mesh);
        this.world.add(mesh);
      }
    }
  }, {
    key: "buildCards",
    value: function buildCards(yellow, black, white) {
      var cardMaterials = [white, yellow, black, white, yellow];

      for (var index = 0; index < 7; index++) {
        var card = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.55, 0.08), cardMaterials[index % cardMaterials.length]);
        card.userData.offset = index;
        card.userData.open = new THREE.Vector3((index - 3) * 0.8, -6, -5 - index);
        card.userData.closed = new THREE.Vector3((index - 3) * 0.38, 0.05, 1.8 + index * 0.07);
        card.position.copy(card.userData.open);
        card.rotation.set(-0.9, 0.2 * (index - 3), 0.08 * (index - 3));
        this.cards.push(card);
        this.world.add(card);
      }
    }
  }, {
    key: "transitionTo",
    value: function () {
      var _transitionTo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(url) {
        var options,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};

                if (!(!this.ready || this.prefersReducedMotion)) {
                  _context.next = 4;
                  break;
                }

                window.location.href = url;
                return _context.abrupt("return");

              case 4:
                _context.next = 6;
                return this.start(_objectSpread({
                  url: url
                }, options, {
                  holdOnComplete: true
                }));

              case 6:
                sessionStorage.setItem(this.options.incomingKey, JSON.stringify({
                  from: window.location.pathname,
                  to: new URL(url, window.location.href).pathname,
                  at: Date.now()
                }));
                window.location.href = url;

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function transitionTo(_x) {
        return _transitionTo.apply(this, arguments);
      }

      return transitionTo;
    }()
  }, {
    key: "start",
    value: function () {
      var _start = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var options,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};

                if (!(!this.ready || this.prefersReducedMotion)) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return");

              case 3:
                return _context2.abrupt("return", this.playPhase('out', this.options.outDuration, options));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function start() {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "end",
    value: function () {
      var _end = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var options,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {};

                if (!(!this.ready || this.prefersReducedMotion)) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return");

              case 3:
                return _context3.abrupt("return", this.playPhase('in', this.options.inDuration, options));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function end() {
        return _end.apply(this, arguments);
      }

      return end;
    }()
  }, {
    key: "playIncomingTransition",
    value: function playIncomingTransition() {
      var _this2 = this;

      var rawState = sessionStorage.getItem(this.options.incomingKey);
      if (!rawState) return;
      sessionStorage.removeItem(this.options.incomingKey);

      try {
        var state = JSON.parse(rawState);
        if (!state.at || Date.now() - state.at > 8000) return;
        setTimeout(function () {
          return _this2.end(state);
        }, 80);
      } catch (error) {
        console.warn('[PageTransition] Failed to read incoming transition state', error);
      }
    }
  }, {
    key: "playPhase",
    value: function playPhase(phase, duration, options) {
      var _this3 = this;

      if (this.isActive) return Promise.resolve();
      this.phase = phase;
      this.isActive = true;
      this.startedAt = performance.now();
      this.duration = duration;
      this.activeOptions = options;
      this.clock.start();
      this.setHud(options);
      this.shell.classList.add('is-active');
      this.shell.dataset.phase = phase;
      document.body.classList.add('is-transitioning');
      return new Promise(function (resolve) {
        _this3.resolvePhase = resolve;

        _this3.animatePhase();
      });
    }
  }, {
    key: "setHud",
    value: function setHud() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var target = this.hud.querySelector('.transition-hud__target');
      var label = this.hud.querySelector('.transition-hud__label');
      var targetUrl = options.url || options.to || window.location.pathname;

      if (target) {
        target.textContent = new URL(targetUrl, window.location.href).pathname.toUpperCase();
      }

      if (label) {
        label.textContent = this.phase === 'in' ? 'PAGE LOCKED' : 'PAGE TRANSFER';
      }
    }
  }, {
    key: "animatePhase",
    value: function animatePhase() {
      var elapsed = performance.now() - this.startedAt;
      var rawProgress = Math.min(elapsed / this.duration, 1);
      var progress = this.phase === 'in' ? 1 - rawProgress : rawProgress;
      var eased = this.easeOutExpo(progress);
      var time = this.clock.getElapsedTime();
      this.updateScene(eased, rawProgress, time);
      this.renderer.render(this.scene, this.camera);
      this.updateHud(rawProgress);

      if (rawProgress < 1) {
        this.animationId = requestAnimationFrame(this.animatePhase);
        return;
      }

      this.completePhase();
    }
  }, {
    key: "updateScene",
    value: function updateScene(progress, rawProgress, time) {
      var _this4 = this;

      var pulse = Math.sin(time * 8) * 0.035;
      this.world.rotation.y = (progress - 0.5) * 0.45;
      this.world.rotation.x = (0.5 - progress) * 0.18;
      this.world.rotation.z = Math.sin(progress * Math.PI) * 0.08;
      this.camera.position.z = 9 - progress * 5.7;
      this.camera.position.x = Math.sin(progress * Math.PI) * 0.45;
      this.camera.position.y = Math.cos(progress * Math.PI) * 0.18;
      this.camera.lookAt(0, 0, 0);
      this.gate.forEach(function (mesh) {
        mesh.position.lerpVectors(mesh.userData.open, mesh.userData.closed, progress);
        mesh.rotation.z = mesh.name === 'top' || mesh.name === 'bottom' ? pulse : -pulse;
      });
      this.frames.forEach(function (frame, index) {
        frame.position.z = progress * 18 + Math.sin(time + index) * 0.15;
        frame.rotation.z = (index % 2 === 0 ? 1 : -1) * progress * 0.12;
        frame.material.opacity = 0.16 + (1 - Math.abs(progress - 0.5) * 2) * 0.55;
      });
      this.shards.forEach(function (mesh, index) {
        var stagger = Math.min(1, Math.max(0, progress * 1.25 - index * 0.012));
        var orbit = time * mesh.userData.speed + mesh.userData.seed;
        mesh.position.lerpVectors(mesh.userData.open, mesh.userData.closed, _this4.easeInOutCubic(stagger));
        mesh.position.x += Math.cos(orbit) * mesh.userData.radius * 0.035;
        mesh.position.y += Math.sin(orbit) * mesh.userData.radius * 0.025;
        mesh.rotation.x += 0.035 + index * 0.0008;
        mesh.rotation.y += 0.025;
        mesh.rotation.z += 0.018;
      });
      this.cards.forEach(function (card, index) {
        var cardProgress = Math.min(1, Math.max(0, progress * 1.45 - index * 0.08));
        card.position.lerpVectors(card.userData.open, card.userData.closed, _this4.easeOutExpo(cardProgress));
        card.rotation.x = -0.9 + cardProgress * 1.08;
        card.rotation.y = (index - 3) * (0.25 - cardProgress * 0.12);
        card.rotation.z = Math.sin(time * 2 + index) * 0.04;
      });
      this.shell.style.setProperty('--transition-progress', rawProgress.toFixed(3));
      this.shell.style.opacity = this.phase === 'in' ? String(Math.max(0, 1 - rawProgress * 1.15)) : String(Math.min(1, 0.12 + rawProgress * 1.18));
    }
  }, {
    key: "updateHud",
    value: function updateHud(progress) {
      var counter = this.hud.querySelector('.transition-hud__counter');

      if (counter) {
        var value = Math.round(progress * 100).toString().padStart(2, '0');
        counter.textContent = value;
      }
    }
  }, {
    key: "completePhase",
    value: function completePhase() {
      var completedPhase = this.phase;
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isActive = false;
      this.phase = 'idle';
      var holdOverlay = this.activeOptions && this.activeOptions.holdOnComplete && completedPhase === 'out';

      if (!holdOverlay) {
        this.shell.classList.remove('is-active');
        this.shell.removeAttribute('data-phase');
        this.shell.style.opacity = '0';
        document.body.classList.remove('is-transitioning');
      }

      if (this.resolvePhase) {
        this.resolvePhase();
        this.resolvePhase = null;
      }
    }
  }, {
    key: "handleResize",
    value: function handleResize() {
      if (!this.renderer || !this.camera) return;
      var width = window.innerWidth;
      var height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.options.pixelRatio));
    }
  }, {
    key: "easeOutExpo",
    value: function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
  }, {
    key: "easeInOutCubic",
    value: function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      cancelAnimationFrame(this.animationId);
      window.removeEventListener('resize', this.handleResize);
      document.body.classList.remove('is-transitioning');
      if (this.renderer) this.renderer.dispose();
      if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
      this.ready = false;
    }
  }]);

  return PageTransition;
}();

function initPageTransitions() {
  if (window.pageTransition) return window.pageTransition;
  if (typeof THREE === 'undefined') return null;
  window.pageTransition = new PageTransition();
  return window.pageTransition.init();
}

function waitForThreeAndInit() {
  var attempt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  if (typeof THREE === 'undefined') {
    if (attempt < 30) setTimeout(function () {
      return waitForThreeAndInit(attempt + 1);
    }, 100);
    return;
  }

  initPageTransitions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForThreeAndInit);
} else {
  waitForThreeAndInit();
}

window.PageTransition = PageTransition;
window.initPageTransitions = initPageTransitions;
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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","js/transitions.js"], null)
//# sourceMappingURL=/transitions.01c44ce0.js.map