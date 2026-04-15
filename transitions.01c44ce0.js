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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","js/transitions.js"], null)
//# sourceMappingURL=/transitions.01c44ce0.js.map