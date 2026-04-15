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
})({"main.js":[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// babel-polyfill removed - modern browsers support the needed features natively
var nameNode = document.querySelector('.blade--left > h1');
var subtitleNode = document.querySelector('.blade--right > h1');
var profileHeaderText = document.querySelector('#profile > h1');
var projectsHeaderText = document.querySelector('#projects > h1');
var visitorNameNodes = document.querySelectorAll(".visitorName");
var getInTouch = document.querySelector("#social > h1");
var gridItems = document.querySelectorAll('.grid__item.readme');
var modalTemplate = document.querySelector('.modalTemplate');
var modalCode = document.querySelector('.modalTemplate > div.markdown');

var mastheadScroller = function mastheadScroller(scrollPosition) {
  nameNode.style = "transform: translateX(-".concat(scrollPosition * 7, "px)");
  subtitleNode.style = "transform: translateX(".concat(scrollPosition * 2, "px)");
  profileHeaderText.style = "transform: translateX(-".concat(scrollPosition * 1.2, "px)");
  projectsHeaderText.style = "transform: translateX(-".concat(scrollPosition * 1.2, "px)");
  getInTouch.style = "transform: translateX(-".concat(scrollPosition * 2, "px)");
};

var ticking = false;
window.addEventListener('scroll', function (e) {
  var last_known_scroll_position = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function () {
      mastheadScroller(last_known_scroll_position);
      ticking = false;
    });
    ticking = true;
  }
});

var visitorName = function visitorName(event) {
  var name = event.target.innerHTML;
  name = name.replace('}', '').replace('{', '');
  sessionStorage.setItem('visitorName', name); // visitorNameNodes.forEach(n => n.innerHTML = name)
};

function initVisitorNames() {
  visitorNameNodes.forEach(function (div) {
    var setVisitorName = sessionStorage.getItem('visitorName');

    if (typeof setVisitorName === 'string' && setVisitorName != 'undefined' && setVisitorName != '') {
      div.innerHTML = setVisitorName;
    }

    div.addEventListener("blur", visitorName);
    div.addEventListener("keyup", visitorName);
    div.addEventListener("paste", visitorName);
    div.addEventListener("copy", visitorName);
    div.addEventListener("cut", visitorName);
    div.addEventListener("delete", visitorName);
    div.addEventListener("mouseup", visitorName);
  });
} // Initialize visitor names after DOM is loaded


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorNames);
} else {
  initVisitorNames();
}

var readmes = {};
var reverse = false; // WebGL Hero Background Animation

function initHeroWebGL() {
  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return; // Check for touch device - disable on mobile for performance

  var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (isTouchDevice) {
    return;
  }

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a1a');
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Wireframe material - yellow with varying opacity

  var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: '#f3cd05',
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  var shapes = [];
  var shapeCount = 20; // Geometries for variety

  var geometries = [new THREE.BoxGeometry(1, 1, 1), new THREE.IcosahedronGeometry(0.7, 0), new THREE.PlaneGeometry(1.5, 1.5), new THREE.OctahedronGeometry(0.8, 0), new THREE.TetrahedronGeometry(0.9, 0)];

  for (var i = 0; i < shapeCount; i++) {
    var geometry = geometries[Math.floor(Math.random() * geometries.length)];
    var material = wireframeMaterial.clone();
    material.opacity = 0.3 + Math.random() * 0.4;
    var mesh = new THREE.Mesh(geometry, material); // Position at different depths

    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.y = (Math.random() - 0.5) * 15;
    mesh.position.z = -10 - Math.random() * 40; // Random rotation

    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2; // Store rotation speeds for animation

    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005
    };
    scene.add(mesh);
    shapes.push(mesh);
  } // --- Post-Processing Setup ---


  var composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass); // Custom brutalist shader uniforms

  var brutalistUniforms = {
    tDiffuse: {
      value: null
    },
    uTime: {
      value: 0
    },
    uGlitchIntensity: {
      value: 0.0
    },
    uMouseVelocity: {
      value: 0.0
    }
  }; // Brutalist post-processing shader

  var brutalistShader = {
    uniforms: brutalistUniforms,
    vertexShader: "\n      varying vec2 vUv;\n      void main() {\n        vUv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n      }\n    ",
    fragmentShader: "\n      uniform sampler2D tDiffuse;\n      uniform float uTime;\n      uniform float uGlitchIntensity;\n      uniform float uMouseVelocity;\n      varying vec2 vUv;\n\n      // Pseudo-random function\n      float random(vec2 st) {\n        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);\n      }\n\n      void main() {\n        vec2 uv = vUv;\n        float time = uTime;\n        \n        // Base offset strength for chromatic aberration\n        float caStrength = 0.003 + uGlitchIntensity * 0.01;\n        \n        // Glitch block displacement\n        float glitchOffset = 0.0;\n        if (uGlitchIntensity > 0.3) {\n          float glitchSeed = floor(time * 10.0);\n          float rowRandom = random(vec2(glitchSeed, floor(uv.y * 20.0)));\n          if (rowRandom > 0.7) {\n            glitchOffset = (random(vec2(glitchSeed)) - 0.5) * uGlitchIntensity * 0.1;\n          }\n        }\n        \n        vec2 distortedUv = uv + vec2(glitchOffset, 0.0);\n        \n        // Sample RGB channels with offset for chromatic aberration\n        float r = texture2D(tDiffuse, distortedUv + vec2(caStrength, 0.0)).r;\n        float g = texture2D(tDiffuse, distortedUv).g;\n        float b = texture2D(tDiffuse, distortedUv - vec2(caStrength, 0.0)).b;\n        \n        vec3 color = vec3(r, g, b);\n        \n        // Scanlines\n        float scanline = sin(uv.y * 200.0) * 0.1;\n        color += scanline * 0.15;\n        \n        // Noise\n        float noise = random(uv + time * 0.1) * 0.08;\n        color += noise;\n        \n        // Vignette\n        float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.8;\n        vignette = clamp(vignette, 0.0, 1.0);\n        color *= vignette;\n        \n        gl_FragColor = vec4(color, 1.0);\n      }\n    "
  };
  var brutalistPass = new THREE.ShaderPass(brutalistShader);
  brutalistPass.renderToScreen = true;
  composer.addPass(brutalistPass); // Mouse parallax and velocity tracking

  var mouseX = 0;
  var mouseY = 0;
  var lastMouseX = 0;
  var lastMouseY = 0;
  var mouseVelocity = 0;
  var targetCameraX = 0;
  var targetCameraY = 0;
  document.addEventListener('mousemove', function (event) {
    mouseX = event.clientX / window.innerWidth * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1; // Calculate mouse velocity

    var dx = event.clientX - lastMouseX;
    var dy = event.clientY - lastMouseY;
    mouseVelocity = Math.sqrt(dx * dx + dy * dy);
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }); // Animation loop

  var animationId;
  var isVisible = true;
  var lastTime = 0; // Glitch triggers

  var nextGlitchTime = Math.random() * 4 + 3; // 3-7 seconds

  var activeGlitches = new Map(); // shape index -> { startTime, duration }

  function animate(time) {
    if (!isVisible) return;
    animationId = requestAnimationFrame(animate);
    var deltaTime = (time - lastTime) * 0.001;
    lastTime = time; // Update shader uniforms

    brutalistUniforms.uTime.value = time * 0.001; // Smoothly interpolate mouse velocity for glitch intensity

    var targetGlitch = Math.min(mouseVelocity * 0.02, 1.0);
    brutalistUniforms.uGlitchIntensity.value += (targetGlitch - brutalistUniforms.uGlitchIntensity.value) * 0.1;
    brutalistUniforms.uMouseVelocity.value = mouseVelocity; // Decay mouse velocity

    mouseVelocity *= 0.95; // Random glitch triggers

    nextGlitchTime -= deltaTime;

    if (nextGlitchTime <= 0 && activeGlitches.size < 3) {
      // Find a shape that's not already glitching
      var availableShapes = shapes.filter(function (_, i) {
        return !activeGlitches.has(i);
      });

      if (availableShapes.length > 0) {
        var randomIdx = Math.floor(Math.random() * shapes.length);

        if (!activeGlitches.has(randomIdx)) {
          activeGlitches.set(randomIdx, {
            startTime: time * 0.001,
            duration: 0.2 + Math.random() * 0.3
          });
        }
      }

      nextGlitchTime = Math.random() * 4 + 3; // Reset to 3-7 seconds
    } // Update active glitches


    var currentTime = time * 0.001;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = activeGlitches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            idx = _step$value[0],
            glitch = _step$value[1];

        if (currentTime - glitch.startTime > glitch.duration) {
          activeGlitches.delete(idx); // Reset shape position

          shapes[idx].position.x = shapes[idx].userData.originalX || shapes[idx].position.x;
        } else {
          // Apply glitch displacement to shape
          var glitchProgress = (currentTime - glitch.startTime) / glitch.duration;
          var displacement = (Math.random() - 0.5) * 0.5 * (1.0 - glitchProgress);

          if (!shapes[idx].userData.originalX) {
            shapes[idx].userData.originalX = shapes[idx].position.x;
          }

          shapes[idx].position.x = shapes[idx].userData.originalX + displacement;
        }
      } // Rotate shapes

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    shapes.forEach(function (shape) {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
    }); // Smooth camera parallax

    targetCameraX = mouseX * 0.5;
    targetCameraY = mouseY * 0.5;
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
    camera.position.y += (targetCameraY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    composer.render();
  } // Handle window resize


  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize); // Visibility check - pause when hero section is not visible

  var heroSection = document.querySelector('.blade');

  if (heroSection && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting;

        if (isVisible && !animationId) {
          animate(performance.now());
        } else if (!isVisible && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, {
      threshold: 0
    });
    observer.observe(heroSection);
  }

  animate(0);
} // Initialize WebGL after DOM is loaded


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroWebGL);
} else {
  initHeroWebGL();
} // Initialize grid items interactions after DOM is loaded


function initGridItems() {
  gridItems.forEach(function (div) {
    div.addEventListener('mousemove', function (e) {
      var mouseTick = false;

      if (!mouseTick) {
        window.requestAnimationFrame(function () {
          var left = e.pageX + 3;

          if (left >= window.innerWidth - 400 || reverse === true) {
            left = left - 403;
            reverse = true;
          }

          if (left <= 400 && reverse === true) {
            left = e.pageX + 3;
            reverse = false;
          }

          modalTemplate.style = "left: ".concat(left, "px; top: ").concat(e.pageY + 10, "px");
        });
      }

      mouseTick = true;
    });
    div.addEventListener('mouseover',
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(e) {
        var readmeResponse, readme;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.target.dataset.readme != 'underfined' && e.target.dataset.readme != '' && typeof e.target.dataset.readme === 'string')) {
                  _context.next = 13;
                  break;
                }

                if (!readmes[e.target.dataset.readme]) {
                  _context.next = 5;
                  break;
                }

                modalCode.innerHTML = readmes[e.target.dataset.readme];
                _context.next = 13;
                break;

              case 5:
                _context.next = 7;
                return fetch(e.target.dataset.readme);

              case 7:
                readmeResponse = _context.sent;
                _context.next = 10;
                return readmeResponse.text();

              case 10:
                readme = _context.sent;
                readmes[modalTemplate.dataset.readme] = readme;
                modalCode.innerHTML = readme;

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    div.addEventListener('mouseout', function (e) {
      modalTemplate.style = 'display: none;';
    });
  });
} // Initialize grid items after DOM is loaded


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGridItems);
} else {
  initGridItems();
} // CUSTOM CURSOR - Brutalist yellow circle with hover effects


(function initCustomCursor() {
  // Check for touch device - don't show custom cursor on mobile
  var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (isTouchDevice) {
    return;
  } // Check for reduced motion preference


  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  } // Create cursor element and depth layer


  var cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  var cursorDepth = document.createElement('div');
  cursorDepth.className = 'custom-cursor-depth';
  document.body.appendChild(cursorDepth); // Force cursor visibility immediately

  cursor.style.opacity = '1';
  cursor.style.visibility = 'visible';
  cursor.style.display = 'block';
  cursorDepth.style.opacity = '1';
  cursorDepth.style.visibility = 'visible';
  cursorDepth.style.display = 'block'; // Set initial position to center of viewport

  var initialX = window.innerWidth / 2;
  var initialY = window.innerHeight / 2;
  cursor.style.left = initialX + 'px';
  cursor.style.top = initialY + 'px';
  cursorDepth.style.left = initialX + 'px';
  cursorDepth.style.top = initialY + 'px'; // Mouse position tracking

  var mouseX = 0;
  var mouseY = 0;
  var lastMouseX = 0;
  var lastMouseY = 0;
  var cursorX = window.innerWidth / 2;
  var cursorY = window.innerHeight / 2; // Rotation tracking

  var currentRotation = 0;
  var targetRotation = 0;
  var currentTiltX = 0;
  var targetTiltX = 0;
  var currentTiltY = 0;
  var targetTiltY = 0; // Track actual mouse position

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }); // Smooth cursor following with requestAnimationFrame

  function updateCursor() {
    // Calculate velocity for rotation/tilt
    var deltaX = mouseX - lastMouseX;
    var deltaY = mouseY - lastMouseY;
    var velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Calculate movement angle (add 45deg to align cube corner to movement)

    if (velocity > 1) {
      targetRotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 45;
    } // Calculate tilt based on velocity (max 15deg tilt)


    var maxTilt = 15;
    var tiltFactor = Math.min(velocity * 0.3, maxTilt);
    targetTiltX = deltaX / (velocity || 1) * tiltFactor;
    targetTiltY = deltaY / (velocity || 1) * tiltFactor; // Smooth interpolation for position

    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15; // Smooth interpolation for rotation

    currentRotation += (targetRotation - currentRotation) * 0.1;
    currentTiltX += (targetTiltX - currentTiltX) * 0.1;
    currentTiltY += (targetTiltY - currentTiltY) * 0.1; // Apply position

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorDepth.style.left = cursorX + 'px';
    cursorDepth.style.top = cursorY + 'px'; // Apply 3D transforms via CSS custom properties

    cursor.style.setProperty('--rotation', currentRotation.toFixed(2) + 'deg');
    cursor.style.setProperty('--tilt-x', currentTiltX.toFixed(2) + 'deg');
    cursor.style.setProperty('--tilt-y', currentTiltY.toFixed(2) + 'deg'); // Store last position for next frame

    lastMouseX = mouseX;
    lastMouseY = mouseY;
    requestAnimationFrame(updateCursor);
  } // Start the animation loop


  updateCursor(); // Click animation

  document.addEventListener('mousedown', function () {
    cursor.classList.add('clicking');
    cursorDepth.classList.add('clicking');
  });
  document.addEventListener('mouseup', function () {
    cursor.classList.remove('clicking');
    cursorDepth.classList.remove('clicking');
  }); // Elements that trigger hover state

  var hoverSelectors = ['a', 'button', '.grid__item', 'input', 'textarea', '.title']; // Add hover listeners to interactive elements

  hoverSelectors.forEach(function (selector) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('hover');
        cursorDepth.classList.add('hover');
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('hover');
        cursorDepth.classList.remove('hover');
      });
    });
  }); // Support for data-cursor="hover" attribute on any element

  var dataCursorElements = document.querySelectorAll('[data-cursor="hover"]');
  dataCursorElements.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.classList.add('hover');
      cursorDepth.classList.add('hover');
    });
    el.addEventListener('mouseleave', function () {
      cursor.classList.remove('hover');
      cursorDepth.classList.remove('hover');
    });
  }); // Cursor visibility is always on - no hiding when leaving window
  // This prevents issues where cursor starts invisible
})(); // SCROLL PROGRESS INDICATOR - Raw brutalist progress bar


(function initScrollProgress() {
  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  } // Create scroll progress elements


  var progressContainer = document.createElement('div');
  progressContainer.className = 'scroll-progress';
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer); // Scroll progress tracking with performance optimization

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
  }); // Initial update

  updateScrollProgress();
})(); // TEXT REVEAL ANIMATION - Slide in from left on scroll


(function initTextReveal() {
  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  var revealElements = document.querySelectorAll('[data-text-reveal]');
  if (!revealElements.length) return; // IntersectionObserver to trigger when 50% visible

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible'); // Once revealed, stop observing

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  revealElements.forEach(function (el) {
    el.classList.add('text-reveal');
    observer.observe(el);
  });
})(); // LINK HOVER TEXT SCRAMBLE EFFECT - Glitchy character reveal


(function initLinkScramble() {
  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

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
        this.queue = []; // Build queue of character reveals - gradual from left to right

        var totalFrames = 24; // ~400ms at 60fps

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
            // Character should be revealed
            output += item.char;
            complete++;
          } else {
            // Show random character
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
  }(); // Apply scramble effect to all links


  var links = document.querySelectorAll('a');
  links.forEach(function (link) {
    // Skip empty links or links with only whitespace
    if (!link.innerText.trim()) return;
    var scrambler = new TextScramble(link);
    link.addEventListener('mouseenter', function () {
      scrambler.scramble();
    });
  });
})(); // RGB SPLIT GLITCH EFFECT - Random glitch on elements


(function initRandomGlitch() {
  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  } // Check for touch device - reduce frequency on mobile


  var isTouchDevice = window.matchMedia('(pointer: coarse)').matches; // Selectors for elements that can glitch

  var glitchSelectors = ['.grid__item', '.title h1', '.profile p', 'a'];

  function getRandomElement() {
    var allElements = [];
    glitchSelectors.forEach(function (selector) {
      var elements = document.querySelectorAll(selector);
      elements.forEach(function (el) {
        return allElements.push(el);
      });
    });
    if (allElements.length === 0) return null;
    return allElements[Math.floor(Math.random() * allElements.length)];
  }

  function triggerGlitch() {
    // Pick 1-2 random elements
    var numElements = Math.random() < 0.7 ? 1 : 2;

    var _loop = function _loop(i) {
      var element = getRandomElement();
      if (!element) return "continue"; // Random intensity

      var isIntense = Math.random() < 0.3; // Add glitch class

      element.classList.add('glitch-active');

      if (isIntense) {
        element.classList.add('glitch-intense');
      } // Remove after animation completes


      var duration = isIntense ? 250 : 200;
      setTimeout(function () {
        element.classList.remove('glitch-active', 'glitch-intense');
      }, duration);
    };

    for (var i = 0; i < numElements; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    } // Schedule next glitch


    scheduleNextGlitch();
  }

  function scheduleNextGlitch() {
    // Random interval: 3-6 seconds on desktop, 8-12 on mobile
    var minDelay = isTouchDevice ? 8000 : 3000;
    var maxDelay = isTouchDevice ? 12000 : 6000;
    var delay = minDelay + Math.random() * (maxDelay - minDelay);
    setTimeout(triggerGlitch, delay);
  } // Start the glitch loop after a short initial delay


  setTimeout(scheduleNextGlitch, 2000);
})(); // KEYBOARD NAVIGATION - Arrow keys for section navigation


(function initKeyboardNav() {
  // Section selectors in order of appearance
  var sections = ['.hero-brutalist', '#profile', '#projects', '#social'];
  var currentSectionIndex = 0;

  function getSectionElements() {
    return sections.map(function (selector) {
      return document.querySelector(selector);
    }).filter(function (el) {
      return el !== null;
    });
  }

  function scrollToSection(index) {
    var sectionElements = getSectionElements();
    if (index < 0 || index >= sectionElements.length) return;
    currentSectionIndex = index;
    var target = sectionElements[index]; // Brutalist immediate scroll - no smooth behavior

    target.scrollIntoView({
      behavior: 'auto'
    }); // Brief visual feedback - flash border

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
  }

  document.addEventListener('keydown', function (e) {
    var sectionElements = getSectionElements();
    if (sectionElements.length === 0) return; // Update current index based on scroll position

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
  });
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
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map