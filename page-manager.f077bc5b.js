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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * PageTransition - WebGL Page Transition System
 * Uses Three.js r128 for brutalist glitch/distortion effects
 * 
 * Transitions:
 * - 'glitch-wipe': Horizontal glitch blocks that wipe across screen
 * - 'chromatic-split': RGB channel separation with noise
 * - 'pixel-sort': Pixel sorting distortion effect
 * - 'noise-reveal': Noise-based dissolve transition
 */
var PageTransition =
/*#__PURE__*/
function () {
  function PageTransition() {
    _classCallCheck(this, PageTransition);

    this.isActive = false;
    this.currentType = 'glitch-wipe';
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.composer = null;
    this.currentTexture = null;
    this.planeMesh = null;
    this.animationId = null;
    this.startTime = 0;
    this.duration = 1200; // ms

    this.destination = null; // Check for reduced motion preference

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Shader uniforms

    this.uniforms = {
      uTime: {
        value: 0
      },
      uProgress: {
        value: 0
      },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      uTexture: {
        value: null
      },
      uGlitchIntensity: {
        value: 0
      },
      uDirection: {
        value: 1
      } // 1 = out, -1 = in

    }; // Bind methods

    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this); // Initialize if not reduced motion

    if (!this.prefersReducedMotion) {
      this.init();
    }
  }

  _createClass(PageTransition, [{
    key: "init",
    value: function init() {
      this.createCanvas();
      this.setupScene();
      this.setupPostProcessing();
      this.addEventListeners();
    }
  }, {
    key: "createCanvas",
    value: function createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'transition-canvas';
      this.canvas.style.cssText = "\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100vw;\n      height: 100vh;\n      z-index: 999999;\n      pointer-events: none;\n      opacity: 0;\n      transition: opacity 0.1s;\n    ";
      document.body.appendChild(this.canvas);
    }
  }, {
    key: "setupScene",
    value: function setupScene() {
      // Scene
      this.scene = new THREE.Scene(); // Camera (orthographic for full-screen quad)

      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      this.camera.position.z = 1; // Renderer

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: false,
        alpha: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }, {
    key: "setupPostProcessing",
    value: function setupPostProcessing() {
      this.composer = new THREE.EffectComposer(this.renderer); // Render pass

      var renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass); // Brutalist transition shader pass

      var transitionPass = new THREE.ShaderPass(this.getTransitionShader());
      transitionPass.uniforms = this.uniforms;
      transitionPass.renderToScreen = true;
      this.composer.addPass(transitionPass);
    }
  }, {
    key: "getTransitionShader",
    value: function getTransitionShader() {
      return {
        uniforms: {
          tDiffuse: {
            value: null
          },
          uTime: {
            value: 0
          },
          uProgress: {
            value: 0
          },
          uResolution: {
            value: new THREE.Vector2(1, 1)
          },
          uTexture: {
            value: null
          },
          uGlitchIntensity: {
            value: 0
          },
          uDirection: {
            value: 1
          },
          uType: {
            value: 0
          } // 0=glitch-wipe, 1=chromatic-split, 2=pixel-sort, 3=noise-reveal

        },
        vertexShader: "\n        varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n      ",
        fragmentShader: "\n        uniform sampler2D tDiffuse;\n        uniform float uTime;\n        uniform float uProgress;\n        uniform vec2 uResolution;\n        uniform sampler2D uTexture;\n        uniform float uGlitchIntensity;\n        uniform float uDirection;\n        uniform int uType;\n        varying vec2 vUv;\n        \n        // Yellow and black color palette\n        vec3 YELLOW = vec3(0.953, 0.804, 0.020); // #f3cd05\n        vec3 BLACK = vec3(0.0, 0.0, 0.0);        // #000000\n        \n        // Pseudo-random function\n        float random(vec2 st) {\n          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);\n        }\n        \n        // Noise function\n        float noise(vec2 st) {\n          vec2 i = floor(st);\n          vec2 f = fract(st);\n          float a = random(i);\n          float b = random(i + vec2(1.0, 0.0));\n          float c = random(i + vec2(0.0, 1.0));\n          float d = random(i + vec2(1.0, 1.0));\n          vec2 u = f * f * (3.0 - 2.0 * f);\n          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n        }\n        \n        // Glitch block effect\n        vec2 glitchWipe(vec2 uv, float progress) {\n          float glitchOffset = 0.0;\n          \n          // Create horizontal glitch blocks\n          float rowIndex = floor(uv.y * 20.0);\n          float rowRandom = random(vec2(rowIndex, floor(uTime * 30.0)));\n          \n          // Block wipe threshold\n          float wipeThreshold = progress;\n          \n          // Glitch intensity increases near the wipe edge\n          float edgeDist = abs(uv.x - wipeThreshold);\n          float edgeIntensity = smoothstep(0.2, 0.0, edgeDist);\n          \n          if (edgeIntensity > 0.0 && rowRandom > 0.4) {\n            float blockOffset = (random(vec2(rowIndex, uTime * 10.0)) - 0.5) * edgeIntensity * 0.3;\n            glitchOffset += blockOffset;\n          }\n          \n          // Wipe transition\n          float mask = step(uv.x, wipeThreshold + glitchOffset * 0.5);\n          \n          return vec2(uv.x + glitchOffset, mask);\n        }\n        \n        // Chromatic split with RGB separation\n        vec3 chromaticSplit(sampler2D tex, vec2 uv, float intensity) {\n          float r = texture2D(tex, uv + vec2(intensity * 0.02, 0.0)).r;\n          float g = texture2D(tex, uv).g;\n          float b = texture2D(tex, uv - vec2(intensity * 0.02, 0.0)).b;\n          return vec3(r, g, b);\n        }\n        \n        // Pixel sort effect\n        vec3 pixelSort(sampler2D tex, vec2 uv, float progress) {\n          float threshold = 0.3 + progress * 0.5;\n          float brightness = dot(texture2D(tex, uv).rgb, vec3(0.299, 0.587, 0.114));\n          \n          vec2 sortedUv = uv;\n          if (brightness > threshold) {\n            float sortOffset = sin(uv.y * 50.0 + uTime * 5.0) * 0.01 * progress;\n            sortedUv.x += sortOffset;\n          }\n          \n          return texture2D(tex, sortedUv).rgb;\n        }\n        \n        // Noise reveal transition\n        float noiseReveal(vec2 uv, float progress) {\n          float n = noise(uv * 10.0 + uTime * 0.5);\n          return smoothstep(progress - 0.1, progress + 0.1, n);\n        }\n        \n        void main() {\n          vec2 uv = vUv;\n          vec3 color = BLACK;\n          float alpha = 1.0;\n          \n          // Current page texture\n          vec3 texColor = texture2D(uTexture, uv).rgb;\n          \n          if (uType == 0) {\n            // Glitch Wipe\n            vec2 result = glitchWipe(uv, uProgress);\n            float mask = result.y;\n            \n            // Add chromatic aberration near the edge\n            float edgeDist = abs(uv.x - uProgress);\n            float caStrength = smoothstep(0.15, 0.0, edgeDist) * 0.03;\n            \n            vec3 caColor = chromaticSplit(uTexture, uv, caStrength + uGlitchIntensity);\n            \n            // Mix based on wipe progress\n            color = mix(caColor, YELLOW * 0.1, mask * 0.3);\n            \n            // Add scanlines\n            float scanline = sin(uv.y * 300.0) * 0.1;\n            color += scanline * (1.0 - mask);\n            \n            // Add noise\n            float n = random(uv + uTime) * 0.1;\n            color += n;\n            \n            // Glitch blocks overlay\n            if (edgeDist < 0.1 && random(vec2(floor(uv.y * 40.0), uTime * 20.0)) > 0.5) {\n              color = mix(color, YELLOW, 0.5);\n            }\n            \n          } else if (uType == 1) {\n            // Chromatic Split\n            float intensity = uProgress * 2.0;\n            \n            // RGB separation\n            vec2 offsetR = vec2(intensity * 0.03 * (random(vec2(uTime)) - 0.5), 0.0);\n            vec2 offsetB = vec2(-intensity * 0.03 * (random(vec2(uTime + 1.0)) - 0.5), 0.0);\n            \n            float r = texture2D(uTexture, uv + offsetR).r;\n            float g = texture2D(uTexture, uv).g;\n            float b = texture2D(uTexture, uv + offsetB).b;\n            \n            color = vec3(r, g, b);\n            \n            // Add noise overlay\n            float n = noise(uv * 20.0 + uTime) * intensity * 0.2;\n            color += n;\n            \n            // Scanlines\n            float scanline = sin(uv.y * 200.0) * 0.15 * intensity;\n            color += scanline;\n            \n            // Yellow tint near completion\n            if (uProgress > 0.7) {\n              color = mix(color, YELLOW, (uProgress - 0.7) * 0.5);\n            }\n            \n          } else if (uType == 2) {\n            // Pixel Sort\n            float sortThreshold = 0.3 + uProgress * 0.6;\n            float rowRandom = random(vec2(floor(uv.y * 30.0), uTime));\n            \n            vec2 sortedUv = uv;\n            \n            // Check brightness\n            float brightness = dot(texColor, vec3(0.299, 0.587, 0.114));\n            \n            if (brightness > sortThreshold || rowRandom > 0.8) {\n              float sortAmount = (brightness - sortThreshold) * uProgress * 0.1;\n              float wave = sin(uv.y * 100.0 + uTime * 10.0) * sortAmount;\n              sortedUv.x += wave + (random(vec2(uv.y * 10.0, uTime)) - 0.5) * 0.05 * uProgress;\n            }\n            \n            color = texture2D(uTexture, sortedUv).rgb;\n            \n            // Pixel block overlay\n            if (rowRandom > 0.9 && brightness > 0.5) {\n              float blockX = floor(uv.x * 40.0) / 40.0;\n              float blockY = floor(uv.y * 30.0) / 30.0;\n              color = mix(color, YELLOW, 0.7);\n            }\n            \n            // Noise\n            color += random(uv + uTime * 0.1) * 0.05;\n            \n          } else if (uType == 3) {\n            // Noise Reveal\n            float n = noise(uv * 8.0);\n            float reveal = smoothstep(uProgress - 0.2, uProgress + 0.2, n);\n            \n            // Dissolve effect\n            float dissolveNoise = noise(uv * 30.0 + uTime * 2.0);\n            float dissolve = step(uProgress, dissolveNoise);\n            \n            // Color distortion during transition\n            float distortion = sin(uv.y * 50.0 + uTime * 5.0) * (1.0 - reveal) * 0.02;\n            vec3 distortedColor = chromaticSplit(uTexture, uv + vec2(distortion, 0.0), 0.02);\n            \n            color = mix(YELLOW * 0.1, distortedColor, dissolve);\n            \n            // Grain\n            float grain = random(uv * 100.0 + uTime) * 0.15;\n            color += grain * (1.0 - dissolve);\n            \n            // Vignette during transition\n            float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.5;\n            vignette = smoothstep(0.0, 0.7, vignette);\n            color *= vignette;\n          }\n          \n          // Global effects applied to all transition types\n          \n          // Additional scanlines\n          float globalScanline = sin(uv.y * 400.0 + uTime * 2.0) * 0.05;\n          color += globalScanline;\n          \n          // Glitch blocks at random positions during active transition\n          if (uProgress > 0.1 && uProgress < 0.9) {\n            float glitchSeed = floor(uTime * 15.0);\n            float blockRow = floor(uv.y * 15.0);\n            float blockRandom = random(vec2(glitchSeed, blockRow));\n            \n            if (blockRandom > 0.85) {\n              float blockIntensity = sin(uProgress * 3.14159) * 0.5;\n              color = mix(color, YELLOW, blockIntensity);\n            }\n          }\n          \n          gl_FragColor = vec4(color, 1.0);\n        }\n      "
      };
    }
  }, {
    key: "addEventListeners",
    value: function addEventListeners() {
      window.addEventListener('resize', this.handleResize); // Intercept link clicks for same-origin navigation

      document.addEventListener('click', this.handleClick);
    }
  }, {
    key: "handleClick",
    value: function handleClick(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return; // Only handle same-origin links

      if (href.startsWith('#') || href.startsWith('javascript:')) return;
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // Don't intercept if modifier keys are pressed

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      this.start(href);
    }
  }, {
    key: "captureScreenshot",
    value: function captureScreenshot() {
      // Use html2canvas approach with canvas
      return new Promise(function (resolve) {
        // Create a temporary canvas to capture the page
        var tempCanvas = document.createElement('canvas');
        var ctx = tempCanvas.getContext('2d');
        tempCanvas.width = window.innerWidth;
        tempCanvas.height = window.innerHeight; // Fill with current background color

        var bgColor = getComputedStyle(document.body).backgroundColor;
        ctx.fillStyle = bgColor || '#000000';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); // Try to capture using modern API

        if (document.documentElement.toDataURL) {
          var img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = function () {
            ctx.drawImage(img, 0, 0);
            resolve(tempCanvas);
          };

          img.onerror = function () {
            return resolve(tempCanvas);
          };

          img.src = document.documentElement.toDataURL();
        } else {
          // Fallback: draw current scroll position
          window.scrollTo(0, 0); // Use html2canvas-like approach - clone the document

          setTimeout(function () {
            resolve(tempCanvas);
          }, 50);
        }
      });
    }
  }, {
    key: "start",
    value: function () {
      var _start = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(destination) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.isActive || this.prefersReducedMotion)) {
                  _context.next = 3;
                  break;
                }

                // Skip animation, navigate directly
                window.location.href = destination;
                return _context.abrupt("return");

              case 3:
                this.isActive = true;
                this.destination = destination;
                this.startTime = performance.now(); // Capture current page

                _context.next = 8;
                return this.capturePageTexture();

              case 8:
                // Show canvas
                this.canvas.style.opacity = '1';
                this.canvas.style.pointerEvents = 'auto'; // Start animation

                this.animate(); // Navigate after animation

                setTimeout(function () {
                  window.location.href = destination;
                }, this.duration);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start(_x) {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "capturePageTexture",
    value: function () {
      var _capturePageTexture = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var captureCanvas, ctx, bodyBg, heroSection, rect;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // Create texture from current page state
                // We'll use a simplified approach - render the body to a canvas
                captureCanvas = document.createElement('canvas');
                captureCanvas.width = window.innerWidth;
                captureCanvas.height = window.innerHeight;
                ctx = captureCanvas.getContext('2d'); // Fill with black background

                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height); // Try to draw the document

                try {
                  // Get computed background
                  bodyBg = getComputedStyle(document.body).backgroundColor;

                  if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
                    ctx.fillStyle = bodyBg;
                    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
                  } // Draw representative content - yellow accent bars


                  ctx.fillStyle = '#f3cd05'; // Hero section bar

                  heroSection = document.querySelector('.hero-brutalist');

                  if (heroSection) {
                    rect = heroSection.getBoundingClientRect();
                    ctx.fillRect(0, 0, captureCanvas.width, rect.height);
                  }
                } catch (e) {
                  console.warn('Page capture failed:', e);
                } // Create Three.js texture


                this.currentTexture = new THREE.CanvasTexture(captureCanvas);
                this.currentTexture.minFilter = THREE.LinearFilter;
                this.currentTexture.magFilter = THREE.LinearFilter;
                this.uniforms.uTexture.value = this.currentTexture;

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function capturePageTexture() {
        return _capturePageTexture.apply(this, arguments);
      }

      return capturePageTexture;
    }()
  }, {
    key: "animate",
    value: function animate(time) {
      if (!this.isActive) return;
      var elapsed = (time || performance.now()) - this.startTime;
      var progress = Math.min(elapsed / this.duration, 1); // Update uniforms

      this.uniforms.uTime.value = elapsed * 0.001;
      this.uniforms.uProgress.value = this.easeInOutCubic(progress);
      this.uniforms.uGlitchIntensity.value = Math.sin(progress * Math.PI) * 2.0; // Render

      this.composer.render();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(this.animate);
      }
    }
  }, {
    key: "easeInOutCubic",
    value: function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }, {
    key: "setTransitionType",
    value: function setTransitionType(type) {
      var types = {
        'glitch-wipe': 0,
        'chromatic-split': 1,
        'pixel-sort': 2,
        'noise-reveal': 3
      };

      if (types.hasOwnProperty(type)) {
        this.currentType = type; // Update shader uniform

        if (this.composer && this.composer.passes[1]) {
          this.composer.passes[1].uniforms.uType.value = types[type];
        }
      }
    }
  }, {
    key: "isTransitioning",
    value: function isTransitioning() {
      return this.isActive;
    }
  }, {
    key: "handleResize",
    value: function handleResize() {
      if (!this.renderer) return;
      var width = window.innerWidth;
      var height = window.innerHeight;
      this.renderer.setSize(width, height);
      this.composer.setSize(width, height);
      this.uniforms.uResolution.value.set(width, height);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.isActive = false;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('click', this.handleClick);

      if (this.currentTexture) {
        this.currentTexture.dispose();
      }

      if (this.renderer) {
        this.renderer.dispose();
      }

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }]);

  return PageTransition;
}(); // Auto-initialize on DOM ready


function initPageTransitions() {
  // Check for reduced motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('[PageTransition] Reduced motion preferred - transitions disabled');
    return null;
  } // Wait for Three.js to be available


  if (typeof THREE === 'undefined') {
    console.warn('[PageTransition] Three.js not loaded');
    return null;
  }

  return new PageTransition();
} // Initialize


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageTransitions);
} else {
  window.pageTransition = initPageTransitions();
} // Export for module use


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PageTransition: PageTransition,
    initPageTransitions: initPageTransitions
  };
}
},{}],"js/page-manager.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PageManager = void 0;

var _transitions = require("./transitions.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PageManager =
/*#__PURE__*/
function () {
  function PageManager() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PageManager);

    this.options = _objectSpread({
      transitionSelector: '[data-transition]',
      internalLinkAttribute: 'data-internal-link',
      contentSelector: '#page-content',
      preserveScroll: false,
      prefetch: true
    }, options);
    this.transition = new _transitions.PageTransition();
    this.currentPage = null;
    this.isNavigating = false;
    this.pages = new Map();
    this.beforeTransitionCallbacks = [];
    this.afterTransitionCallbacks = [];
    this.abortController = null; // Bind methods

    this.handleClick = this.handleClick.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
  }
  /**
   * Initialize the page manager
   */


  _createClass(PageManager, [{
    key: "init",
    value: function init() {
      this.currentPage = {
        url: window.location.href,
        pathname: window.location.pathname,
        title: document.title
      }; // Register current page

      this.pages.set(window.location.pathname, {
        url: window.location.href,
        title: document.title,
        config: {}
      }); // Set up event listeners

      this.setupEventListeners(); // Initialize transition system

      this.transition.init();
      return this;
    }
    /**
     * Set up event delegation for link handling
     */

  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      // Intercept all clicks for internal navigation
      document.addEventListener('click', this.handleClick, {
        capture: true
      }); // Handle browser back/forward

      window.addEventListener('popstate', this.handlePopState);
    }
    /**
     * Remove all event listeners
     */

  }, {
    key: "destroy",
    value: function destroy() {
      document.removeEventListener('click', this.handleClick, {
        capture: true
      });
      window.removeEventListener('popstate', this.handlePopState);

      if (this.abortController) {
        this.abortController.abort();
      }

      this.transition.destroy();
    }
    /**
     * Handle click events for internal navigation
     */

  }, {
    key: "handleClick",
    value: function handleClick(event) {
      var link = event.target.closest('a');
      if (!link) return; // Check if this is an internal link

      if (!this.isInternalLink(link)) return; // Don't intercept if modifier keys are pressed

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // Don't intercept if link has specific attributes

      if (link.hasAttribute('download')) return;
      if (link.getAttribute('target') === '_blank') return;
      event.preventDefault();
      var url = link.href;
      var pathname = new URL(url).pathname; // Get page-specific config if registered

      var pageConfig = this.pages.get(pathname) || {}; // Navigate with transition

      this.navigateTo(url, _objectSpread({
        trigger: 'click',
        element: link
      }, pageConfig.options));
    }
    /**
     * Check if a link is internal (same origin)
     */

  }, {
    key: "isInternalLink",
    value: function isInternalLink(link) {
      // Check explicit internal link attribute
      if (link.hasAttribute(this.options.internalLinkAttribute)) {
        return true;
      }

      var href = link.getAttribute('href');
      if (!href) return false; // Skip anchor-only links (handled separately)

      if (href.startsWith('#')) return false; // Skip external links

      if (href.startsWith('http') || href.startsWith('//')) {
        var linkUrl = new URL(href, window.location.origin);
        return linkUrl.origin === window.location.origin;
      } // Relative links are internal


      return true;
    }
    /**
     * Navigate to a URL with WebGL transition
     */

  }, {
    key: "navigateTo",
    value: function () {
      var _navigateTo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(url) {
        var options,
            urlObj,
            pathname,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};

                if (!this.isNavigating) {
                  _context.next = 4;
                  break;
                }

                console.warn('Navigation already in progress');
                return _context.abrupt("return");

              case 4:
                this.isNavigating = true;
                urlObj = new URL(url, window.location.origin);
                pathname = urlObj.pathname; // Run before transition hooks

                _context.next = 9;
                return this.runBeforeTransitionCallbacks(_objectSpread({
                  from: this.currentPage,
                  to: {
                    url: url,
                    pathname: pathname
                  }
                }, options));

              case 9:
                _context.next = 11;
                return this.transition.start({
                  direction: options.direction || 'forward',
                  intensity: options.intensity || 'normal'
                });

              case 11:
                _context.prev = 11;

                if (!(options.spaMode !== false && this.supportsSPAMode(pathname))) {
                  _context.next = 17;
                  break;
                }

                _context.next = 15;
                return this.loadContentSPA(url, pathname, options);

              case 15:
                _context.next = 19;
                break;

              case 17:
                _context.next = 19;
                return this.loadContentFullPage(url, pathname, options);

              case 19:
                // Update current page reference
                this.currentPage = {
                  url: url,
                  pathname: pathname,
                  title: document.title
                }; // Update history

                if (options.pushState !== false) {
                  window.history.pushState({
                    pathname: pathname,
                    url: url,
                    timestamp: Date.now()
                  }, document.title, url);
                } // Scroll handling


                this.handleScroll(options); // Re-initialize page effects

                _context.next = 24;
                return this.reinitializePage();

              case 24:
                _context.next = 26;
                return this.transition.end();

              case 26:
                _context.next = 28;
                return this.runAfterTransitionCallbacks(_objectSpread({
                  from: {
                    url: url,
                    pathname: pathname
                  },
                  to: this.currentPage
                }, options));

              case 28:
                _context.next = 34;
                break;

              case 30:
                _context.prev = 30;
                _context.t0 = _context["catch"](11);
                console.error('Navigation failed:', _context.t0); // Fallback to standard navigation

                window.location.href = url;

              case 34:
                _context.prev = 34;
                this.isNavigating = false;
                return _context.finish(34);

              case 37:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[11, 30, 34, 37]]);
      }));

      function navigateTo(_x) {
        return _navigateTo.apply(this, arguments);
      }

      return navigateTo;
    }()
    /**
     * Check if SPA mode is supported for a pathname
     */

  }, {
    key: "supportsSPAMode",
    value: function supportsSPAMode(pathname) {
      // Check if page is registered with SPA support
      var pageConfig = this.pages.get(pathname);

      if (pageConfig && pageConfig.config.spaMode === false) {
        return false;
      } // Supported pages


      var supportedPaths = ['/', '/index.html', '/article-list.html', '/article.html'];
      return supportedPaths.some(function (path) {
        return pathname === path || pathname.endsWith(path);
      });
    }
    /**
     * Load content in SPA mode (fetch and swap)
     */

  }, {
    key: "loadContentSPA",
    value: function () {
      var _loadContentSPA = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(url, pathname, options) {
        var response, html, parser, newDoc, contentSelector, newContent, currentContent;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.abortController = new AbortController();
                _context2.prev = 1;
                _context2.next = 4;
                return fetch(url, {
                  signal: this.abortController.signal,
                  headers: {
                    'X-Requested-With': 'PageManager'
                  }
                });

              case 4:
                response = _context2.sent;

                if (response.ok) {
                  _context2.next = 7;
                  break;
                }

                throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));

              case 7:
                _context2.next = 9;
                return response.text();

              case 9:
                html = _context2.sent;
                parser = new DOMParser();
                newDoc = parser.parseFromString(html, 'text/html'); // Extract and update content

                contentSelector = options.contentSelector || this.options.contentSelector;
                newContent = newDoc.querySelector(contentSelector);
                currentContent = document.querySelector(contentSelector);

                if (newContent && currentContent) {
                  currentContent.innerHTML = newContent.innerHTML;
                } else {
                  // Fallback: replace body content
                  document.body.innerHTML = newDoc.body.innerHTML;
                } // Update title


                if (newDoc.title) {
                  document.title = newDoc.title;
                } // Update meta tags


                this.updateMetaTags(newDoc);

              case 18:
                _context2.prev = 18;
                this.abortController = null;
                return _context2.finish(18);

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1,, 18, 21]]);
      }));

      function loadContentSPA(_x2, _x3, _x4) {
        return _loadContentSPA.apply(this, arguments);
      }

      return loadContentSPA;
    }()
    /**
     * Load content via full page navigation (with overlay)
     */

  }, {
    key: "loadContentFullPage",
    value: function () {
      var _loadContentFullPage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(url, pathname, options) {
        var iframe;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // Create a hidden iframe to preload the page
                iframe = document.createElement('iframe');
                iframe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:0;height:0;';
                document.body.appendChild(iframe); // Preload via iframe

                _context3.next = 5;
                return new Promise(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    reject(new Error('Navigation timeout'));
                  }, 10000);

                  iframe.onload = function () {
                    clearTimeout(timeout);
                    resolve();
                  };

                  iframe.onerror = function () {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load page'));
                  };

                  iframe.src = url;
                });

              case 5:
                // Allow browser to navigate
                window.location.href = url; // Cleanup

                document.body.removeChild(iframe);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function loadContentFullPage(_x5, _x6, _x7) {
        return _loadContentFullPage.apply(this, arguments);
      }

      return loadContentFullPage;
    }()
    /**
     * Update meta tags from new document
     */

  }, {
    key: "updateMetaTags",
    value: function updateMetaTags(newDoc) {
      var metaSelectors = ['meta[name="description"]', 'meta[property^="og:"]', 'meta[name="twitter:"]', 'link[rel="canonical"]'];
      metaSelectors.forEach(function (selector) {
        var newMeta = newDoc.querySelector(selector);
        var currentMeta = document.querySelector(selector);

        if (newMeta && currentMeta) {
          currentMeta.content = newMeta.content;
        } else if (newMeta) {
          document.head.appendChild(newMeta.cloneNode(true));
        }
      });
    }
    /**
     * Handle scroll position after navigation
     */

  }, {
    key: "handleScroll",
    value: function handleScroll(options) {
      if (options.preserveScroll || this.options.preserveScroll) {
        return;
      }

      if (options.scrollTo) {
        window.scrollTo({
          top: options.scrollTo,
          behavior: options.scrollBehavior || 'auto'
        });
      } else if (window.location.hash) {
        var target = document.querySelector(window.location.hash);

        if (target) {
          target.scrollIntoView({
            behavior: 'auto'
          });
        }
      } else {
        window.scrollTo(0, 0);
      }
    }
    /**
     * Handle browser back/forward buttons
     */

  }, {
    key: "handlePopState",
    value: function () {
      var _handlePopState = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(event) {
        var _event$state, pathname, url, direction;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (event.state) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                _event$state = event.state, pathname = _event$state.pathname, url = _event$state.url;
                direction = this.getNavigationDirection(pathname);
                _context4.next = 6;
                return this.navigateTo(url, {
                  pushState: false,
                  direction: direction,
                  spaMode: this.supportsSPAMode(pathname)
                });

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function handlePopState(_x8) {
        return _handlePopState.apply(this, arguments);
      }

      return handlePopState;
    }()
    /**
     * Determine navigation direction for transitions
     */

  }, {
    key: "getNavigationDirection",
    value: function getNavigationDirection(newPathname) {
      var _this$currentPage;

      var pageOrder = ['/index.html', '/article-list.html', '/article.html'];
      var currentIndex = pageOrder.indexOf(((_this$currentPage = this.currentPage) === null || _this$currentPage === void 0 ? void 0 : _this$currentPage.pathname) || '/index.html');
      var newIndex = pageOrder.indexOf(newPathname);
      if (newIndex > currentIndex) return 'forward';
      if (newIndex < currentIndex) return 'backward';
      return 'forward';
    }
    /**
     * Re-initialize page effects after navigation
     */

  }, {
    key: "reinitializePage",
    value: function () {
      var _reinitializePage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                // Re-run main.js initializers
                this.reinitializeVisitorNames();
                this.reinitializeGridItems();
                this.reinitializeCustomCursor();
                this.reinitializeScrollProgress();
                this.reinitializeTextReveal();
                this.reinitializeLinkScramble();
                this.reinitializeRandomGlitch();
                this.reinitializeKeyboardNav(); // Re-initialize WebGL hero if present

                this.reinitializeWebGLHero(); // Dispatch custom event for other components

                window.dispatchEvent(new CustomEvent('page:loaded', {
                  detail: {
                    page: this.currentPage
                  }
                }));

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function reinitializePage() {
        return _reinitializePage.apply(this, arguments);
      }

      return reinitializePage;
    }()
    /**
     * Re-initialize visitor name inputs
     */

  }, {
    key: "reinitializeVisitorNames",
    value: function reinitializeVisitorNames() {
      var visitorNameNodes = document.querySelectorAll('.visitorName');
      if (!visitorNameNodes.length) return;
      visitorNameNodes.forEach(function (div) {
        var setVisitorName = sessionStorage.getItem('visitorName');

        if (typeof setVisitorName === 'string' && setVisitorName !== 'undefined' && setVisitorName !== '') {
          div.innerHTML = setVisitorName;
        }
      });
    }
    /**
     * Re-initialize grid items
     */

  }, {
    key: "reinitializeGridItems",
    value: function reinitializeGridItems() {
      var gridItems = document.querySelectorAll('.grid__item.readme');
      var modalTemplate = document.querySelector('.modalTemplate');
      var modalCode = document.querySelector('.modalTemplate > div.markdown');
      if (!gridItems.length || !modalTemplate) return;
      var readmes = {};
      var reverse = false;
      gridItems.forEach(function (div) {
        // Remove old listeners by cloning
        var newDiv = div.cloneNode(true);
        div.parentNode.replaceChild(newDiv, div);
        newDiv.addEventListener('mousemove', function (e) {
          var left = e.pageX + 3;

          if (left >= window.innerWidth - 400 || reverse) {
            left = left - 403;
            reverse = true;
          }

          if (left <= 400 && reverse) {
            left = e.pageX + 3;
            reverse = false;
          }

          modalTemplate.style.left = "".concat(left, "px");
          modalTemplate.style.top = "".concat(e.pageY + 10, "px");
        });
        newDiv.addEventListener('mouseover',
        /*#__PURE__*/
        function () {
          var _ref = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee6(e) {
            var _e$target$closest;

            var readmeUrl, response, readme;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    readmeUrl = (_e$target$closest = e.target.closest('.grid__item')) === null || _e$target$closest === void 0 ? void 0 : _e$target$closest.dataset.readme;

                    if (readmeUrl) {
                      _context6.next = 3;
                      break;
                    }

                    return _context6.abrupt("return");

                  case 3:
                    if (!readmes[readmeUrl]) {
                      _context6.next = 7;
                      break;
                    }

                    modalCode.innerHTML = readmes[readmeUrl];
                    _context6.next = 21;
                    break;

                  case 7:
                    _context6.prev = 7;
                    _context6.next = 10;
                    return fetch(readmeUrl);

                  case 10:
                    response = _context6.sent;
                    _context6.next = 13;
                    return response.text();

                  case 13:
                    readme = _context6.sent;
                    readmes[readmeUrl] = readme;
                    modalCode.innerHTML = readme;
                    _context6.next = 21;
                    break;

                  case 18:
                    _context6.prev = 18;
                    _context6.t0 = _context6["catch"](7);
                    console.error('Failed to load README:', _context6.t0);

                  case 21:
                    modalTemplate.style.display = 'block';

                  case 22:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, null, [[7, 18]]);
          }));

          return function (_x9) {
            return _ref.apply(this, arguments);
          };
        }());
        newDiv.addEventListener('mouseout', function () {
          modalTemplate.style.display = 'none';
        });
      });
    }
    /**
     * Re-initialize custom cursor
     */

  }, {
    key: "reinitializeCustomCursor",
    value: function reinitializeCustomCursor() {
      var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isTouchDevice || prefersReducedMotion) return; // Remove existing cursors

      document.querySelectorAll('.custom-cursor, .custom-cursor-depth').forEach(function (el) {
        return el.remove();
      }); // Re-create cursor elements

      var cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
      var cursorDepth = document.createElement('div');
      cursorDepth.className = 'custom-cursor-depth';
      document.body.appendChild(cursorDepth); // Initialize cursor position

      cursor.style.cssText = 'opacity:1;visibility:visible;display:block;';
      cursorDepth.style.cssText = 'opacity:1;visibility:visible;display:block;'; // Re-attach hover listeners

      var hoverSelectors = ['a', 'button', '.grid__item', 'input', 'textarea', '.title'];
      hoverSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
          el.addEventListener('mouseenter', function () {
            cursor.classList.add('hover');
            cursorDepth.classList.add('hover');
          });
          el.addEventListener('mouseleave', function () {
            cursor.classList.remove('hover');
            cursorDepth.classList.remove('hover');
          });
        });
      });
    }
    /**
     * Re-initialize scroll progress indicator
     */

  }, {
    key: "reinitializeScrollProgress",
    value: function reinitializeScrollProgress() {
      var existing = document.querySelector('.scroll-progress');
      if (existing) existing.remove();
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      var progressContainer = document.createElement('div');
      progressContainer.className = 'scroll-progress';
      var progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      progressContainer.appendChild(progressBar);
      document.body.appendChild(progressContainer);
      var progressTicking = false;

      function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPercent = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
        progressBar.style.width = scrollPercent + '%';
        progressTicking = false;
      }

      window.addEventListener('scroll', function () {
        if (!progressTicking) {
          requestAnimationFrame(updateScrollProgress);
          progressTicking = true;
        }
      });
      updateScrollProgress();
    }
    /**
     * Re-initialize text reveal animations
     */

  }, {
    key: "reinitializeTextReveal",
    value: function reinitializeTextReveal() {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      var revealElements = document.querySelectorAll('[data-text-reveal]');
      revealElements.forEach(function (el) {
        el.classList.remove('visible');
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.5
        });
        observer.observe(el);
      });
    }
    /**
     * Re-initialize link scramble effect
     */

  }, {
    key: "reinitializeLinkScramble",
    value: function reinitializeLinkScramble() {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      var charset = '!<>-_\\/[]{}—=+*^?#________';

      var TextScramble =
      /*#__PURE__*/
      function () {
        function TextScramble(el) {
          _classCallCheck(this, TextScramble);

          this.el = el;
          this.originalText = el.innerText;
          this.frame = 0;
          this.queue = [];
          this.isAnimating = false;
          this.frameRequest = null;
        }

        _createClass(TextScramble, [{
          key: "scramble",
          value: function scramble() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            var length = this.originalText.length;
            this.queue = [];
            var totalFrames = 24;

            for (var i = 0; i < length; i++) {
              var revealFrame = Math.floor(i / length * totalFrames);
              this.queue.push({
                char: this.originalText[i],
                revealFrame: revealFrame,
                currentChar: this.randomChar()
              });
            }

            this.frame = 0;
            this.update();
          }
        }, {
          key: "update",
          value: function update() {
            var _this = this;

            var output = '';
            var complete = 0;

            for (var i = 0; i < this.queue.length; i++) {
              var item = this.queue[i];

              if (this.frame >= item.revealFrame) {
                output += item.char;
                complete++;
              } else {
                if (Math.random() < 0.3) {
                  item.currentChar = this.randomChar();
                }

                output += item.currentChar;
              }
            }

            this.el.innerText = output;

            if (complete === this.queue.length) {
              this.isAnimating = false;
              this.el.innerText = this.originalText;

              if (this.frameRequest) {
                cancelAnimationFrame(this.frameRequest);
                this.frameRequest = null;
              }
            } else {
              this.frame++;
              this.frameRequest = requestAnimationFrame(function () {
                return _this.update();
              });
            }
          }
        }, {
          key: "randomChar",
          value: function randomChar() {
            return charset[Math.floor(Math.random() * charset.length)];
          }
        }]);

        return TextScramble;
      }();

      document.querySelectorAll('a').forEach(function (link) {
        if (!link.innerText.trim()) return;
        var scrambler = new TextScramble(link);
        link.addEventListener('mouseenter', function () {
          return scrambler.scramble();
        });
      });
    }
    /**
     * Re-initialize random glitch effects
     */

  }, {
    key: "reinitializeRandomGlitch",
    value: function reinitializeRandomGlitch() {
      // Clear existing glitch intervals if any
      if (window._glitchInterval) {
        clearInterval(window._glitchInterval);
      }

      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      var glitchSelectors = ['.grid__item', '.title h1', '.profile p', 'a'];

      function getRandomElement() {
        var allElements = [];
        glitchSelectors.forEach(function (selector) {
          document.querySelectorAll(selector).forEach(function (el) {
            return allElements.push(el);
          });
        });
        if (allElements.length === 0) return null;
        return allElements[Math.floor(Math.random() * allElements.length)];
      }

      function triggerGlitch() {
        var numElements = Math.random() < 0.7 ? 1 : 2;

        var _loop = function _loop(i) {
          var element = getRandomElement();
          if (!element) return "continue";
          var isIntense = Math.random() < 0.3;
          element.classList.add('glitch-active');
          if (isIntense) element.classList.add('glitch-intense');
          var duration = isIntense ? 250 : 200;
          setTimeout(function () {
            element.classList.remove('glitch-active', 'glitch-intense');
          }, duration);
        };

        for (var i = 0; i < numElements; i++) {
          var _ret = _loop(i);

          if (_ret === "continue") continue;
        }

        var minDelay = isTouchDevice ? 8000 : 3000;
        var maxDelay = isTouchDevice ? 12000 : 6000;
        var delay = minDelay + Math.random() * (maxDelay - minDelay);
        window._glitchInterval = setTimeout(triggerGlitch, delay);
      }

      window._glitchInterval = setTimeout(triggerGlitch, 2000);
    }
    /**
     * Re-initialize keyboard navigation
     */

  }, {
    key: "reinitializeKeyboardNav",
    value: function reinitializeKeyboardNav() {
      var sections = ['.hero-brutalist', '#profile', '#projects', '#social'];

      function getSectionElements() {
        return sections.map(function (selector) {
          return document.querySelector(selector);
        }).filter(function (el) {
          return el !== null;
        });
      }

      var currentSectionIndex = 0;

      function scrollToSection(index) {
        var sectionElements = getSectionElements();
        if (index < 0 || index >= sectionElements.length) return;
        currentSectionIndex = index;
        var target = sectionElements[index];
        target.scrollIntoView({
          behavior: 'auto'
        });
        target.style.outline = '4px solid #f3cd05';
        setTimeout(function () {
          target.style.outline = '';
        }, 300);
      }

      function findCurrentSection() {
        var sectionElements = getSectionElements();
        var scrollPos = window.scrollY + window.innerHeight / 2;

        for (var i = 0; i < sectionElements.length; i++) {
          var rect = sectionElements[i].getBoundingClientRect();
          var sectionTop = rect.top + window.scrollY;
          var sectionBottom = sectionTop + rect.height;

          if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            return i;
          }
        }

        return 0;
      } // Remove existing listener and add new one


      document.removeEventListener('keydown', this._keyboardNavHandler);

      this._keyboardNavHandler = function (e) {
        var sectionElements = getSectionElements();
        if (sectionElements.length === 0) return;
        currentSectionIndex = findCurrentSection();

        switch (e.key) {
          case 'ArrowDown':
          case 'PageDown':
            e.preventDefault();

            if (currentSectionIndex < sectionElements.length - 1) {
              scrollToSection(currentSectionIndex + 1);
            }

            break;

          case 'ArrowUp':
          case 'PageUp':
            e.preventDefault();

            if (currentSectionIndex > 0) {
              scrollToSection(currentSectionIndex - 1);
            }

            break;

          case 'Home':
            e.preventDefault();
            scrollToSection(0);
            break;

          case 'End':
            e.preventDefault();
            scrollToSection(sectionElements.length - 1);
            break;
        }
      };

      document.addEventListener('keydown', this._keyboardNavHandler);
    }
    /**
     * Re-initialize WebGL hero
     */

  }, {
    key: "reinitializeWebGLHero",
    value: function reinitializeWebGLHero() {
      var canvas = document.getElementById('hero-canvas');
      if (!canvas) return; // Check if THREE is available

      if (typeof THREE === 'undefined') return;
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      if (isTouchDevice) return; // The main.js initialization should handle this
      // We just need to ensure the canvas exists

      if (canvas && typeof initHeroWebGL === 'function') {
        initHeroWebGL();
      }
    }
    /**
     * Register a hook to run before transition starts
     */

  }, {
    key: "onBeforeTransition",
    value: function onBeforeTransition(callback) {
      var _this2 = this;

      this.beforeTransitionCallbacks.push(callback);
      return function () {
        var index = _this2.beforeTransitionCallbacks.indexOf(callback);

        if (index > -1) _this2.beforeTransitionCallbacks.splice(index, 1);
      };
    }
    /**
     * Register a hook to run after transition completes
     */

  }, {
    key: "onAfterTransition",
    value: function onAfterTransition(callback) {
      var _this3 = this;

      this.afterTransitionCallbacks.push(callback);
      return function () {
        var index = _this3.afterTransitionCallbacks.indexOf(callback);

        if (index > -1) _this3.afterTransitionCallbacks.splice(index, 1);
      };
    }
    /**
     * Run before transition callbacks
     */

  }, {
    key: "runBeforeTransitionCallbacks",
    value: function () {
      var _runBeforeTransitionCallbacks = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(context) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, callback;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context7.prev = 3;
                _iterator = this.beforeTransitionCallbacks[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context7.next = 12;
                  break;
                }

                callback = _step.value;
                _context7.next = 9;
                return callback(context);

              case 9:
                _iteratorNormalCompletion = true;
                _context7.next = 5;
                break;

              case 12:
                _context7.next = 18;
                break;

              case 14:
                _context7.prev = 14;
                _context7.t0 = _context7["catch"](3);
                _didIteratorError = true;
                _iteratorError = _context7.t0;

              case 18:
                _context7.prev = 18;
                _context7.prev = 19;

                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }

              case 21:
                _context7.prev = 21;

                if (!_didIteratorError) {
                  _context7.next = 24;
                  break;
                }

                throw _iteratorError;

              case 24:
                return _context7.finish(21);

              case 25:
                return _context7.finish(18);

              case 26:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[3, 14, 18, 26], [19,, 21, 25]]);
      }));

      function runBeforeTransitionCallbacks(_x10) {
        return _runBeforeTransitionCallbacks.apply(this, arguments);
      }

      return runBeforeTransitionCallbacks;
    }()
    /**
     * Run after transition callbacks
     */

  }, {
    key: "runAfterTransitionCallbacks",
    value: function () {
      var _runAfterTransitionCallbacks = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(context) {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, callback;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context8.prev = 3;
                _iterator2 = this.afterTransitionCallbacks[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context8.next = 12;
                  break;
                }

                callback = _step2.value;
                _context8.next = 9;
                return callback(context);

              case 9:
                _iteratorNormalCompletion2 = true;
                _context8.next = 5;
                break;

              case 12:
                _context8.next = 18;
                break;

              case 14:
                _context8.prev = 14;
                _context8.t0 = _context8["catch"](3);
                _didIteratorError2 = true;
                _iteratorError2 = _context8.t0;

              case 18:
                _context8.prev = 18;
                _context8.prev = 19;

                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }

              case 21:
                _context8.prev = 21;

                if (!_didIteratorError2) {
                  _context8.next = 24;
                  break;
                }

                throw _iteratorError2;

              case 24:
                return _context8.finish(21);

              case 25:
                return _context8.finish(18);

              case 26:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[3, 14, 18, 26], [19,, 21, 25]]);
      }));

      function runAfterTransitionCallbacks(_x11) {
        return _runAfterTransitionCallbacks.apply(this, arguments);
      }

      return runAfterTransitionCallbacks;
    }()
    /**
     * Register page-specific configuration
     */

  }, {
    key: "registerPage",
    value: function registerPage(url) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var pathname = new URL(url, window.location.origin).pathname;
      this.pages.set(pathname, {
        url: url,
        config: config,
        options: config.options || {}
      });
      return this;
    }
    /**
     * Unregister a page
     */

  }, {
    key: "unregisterPage",
    value: function unregisterPage(url) {
      var pathname = new URL(url, window.location.origin).pathname;
      this.pages.delete(pathname);
      return this;
    }
    /**
     * Prefetch a page for faster navigation
     */

  }, {
    key: "prefetch",
    value: function () {
      var _prefetch = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(url) {
        var pathname, response;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (this.options.prefetch) {
                  _context9.next = 2;
                  break;
                }

                return _context9.abrupt("return");

              case 2:
                pathname = new URL(url, window.location.origin).pathname;

                if (!this.pages.has(pathname)) {
                  _context9.next = 5;
                  break;
                }

                return _context9.abrupt("return");

              case 5:
                _context9.prev = 5;
                _context9.next = 8;
                return fetch(url, {
                  headers: {
                    'X-Requested-With': 'PageManager-Prefetch'
                  }
                });

              case 8:
                response = _context9.sent;

                if (!response.ok) {
                  _context9.next = 18;
                  break;
                }

                _context9.t0 = this.pages;
                _context9.t1 = pathname;
                _context9.t2 = url;
                _context9.next = 15;
                return response.text();

              case 15:
                _context9.t3 = _context9.sent;
                _context9.t4 = {
                  url: _context9.t2,
                  prefetched: true,
                  html: _context9.t3
                };

                _context9.t0.set.call(_context9.t0, _context9.t1, _context9.t4);

              case 18:
                _context9.next = 22;
                break;

              case 20:
                _context9.prev = 20;
                _context9.t5 = _context9["catch"](5);

              case 22:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[5, 20]]);
      }));

      function prefetch(_x12) {
        return _prefetch.apply(this, arguments);
      }

      return prefetch;
    }()
  }]);

  return PageManager;
}();

exports.PageManager = PageManager;
var _default = PageManager;
exports.default = _default;
},{"./transitions.js":"js/transitions.js"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56294" + '/');

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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","js/page-manager.js"], null)
//# sourceMappingURL=/page-manager.f077bc5b.js.map