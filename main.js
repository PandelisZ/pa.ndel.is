import 'babel-polyfill'
const nameNode = document.querySelector('.blade--left > h1')
const subtitleNode = document.querySelector('.blade--right > h1')
const profileHeaderText = document.querySelector('#profile > h1')
const projectsHeaderText = document.querySelector('#projects > h1')
const visitorNameNodes = document.querySelectorAll(".visitorName")
const getInTouch = document.querySelector("#social > h1")
const gridItems = document.querySelectorAll('.grid__item.readme')
const modalTemplate = document.querySelector('.modalTemplate')
const modalCode = document.querySelector('.modalTemplate > div.markdown')

const mastheadScroller = function(scrollPosition) {

    nameNode.style = `transform: translateX(-${scrollPosition*7}px)`
    subtitleNode.style = `transform: translateX(${scrollPosition*2}px)`

    profileHeaderText.style = `transform: translateX(-${scrollPosition*1.2}px)`
    projectsHeaderText.style = `transform: translateX(-${scrollPosition*1.2}px)`
    getInTouch.style = `transform: translateX(-${scrollPosition*2}px)`

}

let ticking = false;
window.addEventListener('scroll', function(e) {
    let last_known_scroll_position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        mastheadScroller(last_known_scroll_position);
        ticking = false;
      });

      ticking = true;
    }
  });


const visitorName = function(event) {

  let name = event.target.innerHTML
  name = name.replace('}', '').replace('{', '')

  sessionStorage.setItem('visitorName', name)

  // visitorNameNodes.forEach(n => n.innerHTML = name)
}

visitorNameNodes.forEach(div => {
    const setVisitorName = sessionStorage.getItem('visitorName')
    if (typeof setVisitorName === 'string' && setVisitorName != 'undefined' && setVisitorName != '') {
      div.innerHTML = setVisitorName
    }
    div.addEventListener("blur", visitorName);
    div.addEventListener("keyup", visitorName);
    div.addEventListener("paste", visitorName);
    div.addEventListener("copy", visitorName);
    div.addEventListener("cut", visitorName);
    div.addEventListener("delete", visitorName);
    div.addEventListener("mouseup", visitorName);
})


const readmes = {}
let reverse = false

// WebGL Hero Background Animation
function initHeroWebGL() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Check for touch device - disable on mobile for performance
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) {
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a1a');

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Wireframe material - yellow with varying opacity
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: '#f3cd05',
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });

  const shapes = [];
  const shapeCount = 20;

  // Geometries for variety
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.IcosahedronGeometry(0.7, 0),
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.OctahedronGeometry(0.8, 0),
    new THREE.TetrahedronGeometry(0.9, 0)
  ];

  for (let i = 0; i < shapeCount; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = wireframeMaterial.clone();
    material.opacity = 0.3 + Math.random() * 0.4;

    const mesh = new THREE.Mesh(geometry, material);

    // Position at different depths
    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.y = (Math.random() - 0.5) * 15;
    mesh.position.z = -10 - Math.random() * 40;

    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;

    // Store rotation speeds for animation
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // --- Post-Processing Setup ---
  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Custom brutalist shader uniforms
  const brutalistUniforms = {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGlitchIntensity: { value: 0.0 },
    uMouseVelocity: { value: 0.0 }
  };

  // Brutalist post-processing shader
  const brutalistShader = {
    uniforms: brutalistUniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uGlitchIntensity;
      uniform float uMouseVelocity;
      varying vec2 vUv;

      // Pseudo-random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;
        float time = uTime;
        
        // Base offset strength for chromatic aberration
        float caStrength = 0.003 + uGlitchIntensity * 0.01;
        
        // Glitch block displacement
        float glitchOffset = 0.0;
        if (uGlitchIntensity > 0.3) {
          float glitchSeed = floor(time * 10.0);
          float rowRandom = random(vec2(glitchSeed, floor(uv.y * 20.0)));
          if (rowRandom > 0.7) {
            glitchOffset = (random(vec2(glitchSeed)) - 0.5) * uGlitchIntensity * 0.1;
          }
        }
        
        vec2 distortedUv = uv + vec2(glitchOffset, 0.0);
        
        // Sample RGB channels with offset for chromatic aberration
        float r = texture2D(tDiffuse, distortedUv + vec2(caStrength, 0.0)).r;
        float g = texture2D(tDiffuse, distortedUv).g;
        float b = texture2D(tDiffuse, distortedUv - vec2(caStrength, 0.0)).b;
        
        vec3 color = vec3(r, g, b);
        
        // Scanlines
        float scanline = sin(uv.y * 200.0) * 0.1;
        color += scanline * 0.15;
        
        // Noise
        float noise = random(uv + time * 0.1) * 0.08;
        color += noise;
        
        // Vignette
        float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.8;
        vignette = clamp(vignette, 0.0, 1.0);
        color *= vignette;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  };

  const brutalistPass = new THREE.ShaderPass(brutalistShader);
  brutalistPass.renderToScreen = true;
  composer.addPass(brutalistPass);

  // Mouse parallax and velocity tracking
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocity = 0;
  let targetCameraX = 0;
  let targetCameraY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Calculate mouse velocity
    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;
    mouseVelocity = Math.sqrt(dx * dx + dy * dy);
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  // Animation loop
  let animationId;
  let isVisible = true;
  let lastTime = 0;
  
  // Glitch triggers
  let nextGlitchTime = Math.random() * 4 + 3; // 3-7 seconds
  const activeGlitches = new Map(); // shape index -> { startTime, duration }

  function animate(time) {
    if (!isVisible) return;

    animationId = requestAnimationFrame(animate);
    
    const deltaTime = (time - lastTime) * 0.001;
    lastTime = time;
    
    // Update shader uniforms
    brutalistUniforms.uTime.value = time * 0.001;
    
    // Smoothly interpolate mouse velocity for glitch intensity
    const targetGlitch = Math.min(mouseVelocity * 0.02, 1.0);
    brutalistUniforms.uGlitchIntensity.value += (targetGlitch - brutalistUniforms.uGlitchIntensity.value) * 0.1;
    brutalistUniforms.uMouseVelocity.value = mouseVelocity;
    
    // Decay mouse velocity
    mouseVelocity *= 0.95;
    
    // Random glitch triggers
    nextGlitchTime -= deltaTime;
    if (nextGlitchTime <= 0 && activeGlitches.size < 3) {
      // Find a shape that's not already glitching
      const availableShapes = shapes.filter((_, i) => !activeGlitches.has(i));
      if (availableShapes.length > 0) {
        const randomIdx = Math.floor(Math.random() * shapes.length);
        if (!activeGlitches.has(randomIdx)) {
          activeGlitches.set(randomIdx, {
            startTime: time * 0.001,
            duration: 0.2 + Math.random() * 0.3
          });
        }
      }
      nextGlitchTime = Math.random() * 4 + 3; // Reset to 3-7 seconds
    }
    
    // Update active glitches
    const currentTime = time * 0.001;
    for (const [idx, glitch] of activeGlitches) {
      if (currentTime - glitch.startTime > glitch.duration) {
        activeGlitches.delete(idx);
        // Reset shape position
        shapes[idx].position.x = shapes[idx].userData.originalX || shapes[idx].position.x;
      } else {
        // Apply glitch displacement to shape
        const glitchProgress = (currentTime - glitch.startTime) / glitch.duration;
        const displacement = (Math.random() - 0.5) * 0.5 * (1.0 - glitchProgress);
        if (!shapes[idx].userData.originalX) {
          shapes[idx].userData.originalX = shapes[idx].position.x;
        }
        shapes[idx].position.x = shapes[idx].userData.originalX + displacement;
      }
    }

    // Rotate shapes
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
    });

    // Smooth camera parallax
    targetCameraX = mouseX * 0.5;
    targetCameraY = mouseY * 0.5;
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
    camera.position.y += (targetCameraY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    composer.render();
  }

  // Handle window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize);

  // Visibility check - pause when hero section is not visible
  const heroSection = document.querySelector('.blade');
  if (heroSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationId) {
          animate(performance.now());
        } else if (!isVisible && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0 });
    observer.observe(heroSection);
  }

  animate(0);
}

// Initialize WebGL after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroWebGL);
} else {
  initHeroWebGL();
}
gridItems.forEach(div => {

  div.addEventListener('mousemove', (e) => {
    let mouseTick = false;
    if (!mouseTick) {
      window.requestAnimationFrame(function() {

        let left = e.pageX + 3

        if (left >= (window.innerWidth - 400) || reverse === true) {
          left = left - 403
          reverse = true
        }

        if (left <= 400 && reverse === true) {
          left = e.pageX + 3
          reverse = false
        }

        modalTemplate.style = `left: ${left}px; top: ${e.pageY+10}px`

      });

    }

    mouseTick = true;

  })

  div.addEventListener('mouseover', async (e) => {

    if (e.target.dataset.readme != 'underfined' && e.target.dataset.readme != '' && typeof e.target.dataset.readme === 'string')
    if (readmes[e.target.dataset.readme]) {
      modalCode.innerHTML = readmes[e.target.dataset.readme]
    } else {
      const readmeResponse = await fetch(e.target.dataset.readme)
      let readme = await readmeResponse.text()
      readmes[modalTemplate.dataset.readme] = readme
      modalCode.innerHTML = readme
    }

  })

  div.addEventListener('mouseout', (e) => {

    modalTemplate.style = 'display: none;'


  })
})

// CUSTOM CURSOR - Brutalist yellow circle with hover effects
(function initCustomCursor() {
  // Check for touch device - don't show custom cursor on mobile
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) {
    return;
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Create cursor element and depth layer
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  const cursorDepth = document.createElement('div');
  cursorDepth.className = 'custom-cursor-depth';
  document.body.appendChild(cursorDepth);

  // Force cursor visibility immediately
  cursor.style.opacity = '1';
  cursor.style.visibility = 'visible';
  cursor.style.display = 'block';
  cursorDepth.style.opacity = '1';
  cursorDepth.style.visibility = 'visible';
  cursorDepth.style.display = 'block';
  
  // Set initial position to center of viewport
  const initialX = window.innerWidth / 2;
  const initialY = window.innerHeight / 2;
  cursor.style.left = initialX + 'px';
  cursor.style.top = initialY + 'px';
  cursorDepth.style.left = initialX + 'px';
  cursorDepth.style.top = initialY + 'px';

  // Mouse position tracking
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  
  // Rotation tracking
  let currentRotation = 0;
  let targetRotation = 0;
  let currentTiltX = 0;
  let targetTiltX = 0;
  let currentTiltY = 0;
  let targetTiltY = 0;
  
  // Track actual mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor following with requestAnimationFrame
  function updateCursor() {
    // Calculate velocity for rotation/tilt
    const deltaX = mouseX - lastMouseX;
    const deltaY = mouseY - lastMouseY;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calculate movement angle (add 45deg to align cube corner to movement)
    if (velocity > 1) {
      targetRotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 45;
    }
    
    // Calculate tilt based on velocity (max 15deg tilt)
    const maxTilt = 15;
    const tiltFactor = Math.min(velocity * 0.3, maxTilt);
    targetTiltX = (deltaX / (velocity || 1)) * tiltFactor;
    targetTiltY = (deltaY / (velocity || 1)) * tiltFactor;
    
    // Smooth interpolation for position
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Smooth interpolation for rotation
    currentRotation += (targetRotation - currentRotation) * 0.1;
    currentTiltX += (targetTiltX - currentTiltX) * 0.1;
    currentTiltY += (targetTiltY - currentTiltY) * 0.1;

    // Apply position
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorDepth.style.left = cursorX + 'px';
    cursorDepth.style.top = cursorY + 'px';
    
    // Apply 3D transforms via CSS custom properties
    cursor.style.setProperty('--rotation', currentRotation.toFixed(2) + 'deg');
    cursor.style.setProperty('--tilt-x', currentTiltX.toFixed(2) + 'deg');
    cursor.style.setProperty('--tilt-y', currentTiltY.toFixed(2) + 'deg');

    // Store last position for next frame
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    requestAnimationFrame(updateCursor);
  }

  // Start the animation loop
  updateCursor();

  // Click animation
  document.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
    cursorDepth.classList.add('clicking');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
    cursorDepth.classList.remove('clicking');
  });

  // Elements that trigger hover state
  const hoverSelectors = [
    'a',
    'button',
    '.grid__item',
    'input',
    'textarea',
    '.title'
  ];

  // Add hover listeners to interactive elements
  hoverSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorDepth.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorDepth.classList.remove('hover');
      });
    });
  });

  // Support for data-cursor="hover" attribute on any element
  const dataCursorElements = document.querySelectorAll('[data-cursor="hover"]');
  dataCursorElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorDepth.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorDepth.classList.remove('hover');
    });
  });

  // Cursor visibility is always on - no hiding when leaving window
  // This prevents issues where cursor starts invisible
})();

// SCROLL PROGRESS INDICATOR - Raw brutalist progress bar
(function initScrollProgress() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Create scroll progress elements
  const progressContainer = document.createElement('div');
  progressContainer.className = 'scroll-progress';
  
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  // Scroll progress tracking with performance optimization
  let progressTicking = false;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    progressBar.style.width = scrollPercent + '%';
    progressTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      requestAnimationFrame(updateScrollProgress);
      progressTicking = true;
    }
  });

  // Initial update
  updateScrollProgress();
})();

// TEXT REVEAL ANIMATION - Slide in from left on scroll
(function initTextReveal() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  const revealElements = document.querySelectorAll('[data-text-reveal]');
  
  if (!revealElements.length) return;

  // IntersectionObserver to trigger when 50% visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  revealElements.forEach(el => {
    el.classList.add('text-reveal');
    observer.observe(el);
  });
})();

// LINK HOVER TEXT SCRAMBLE EFFECT - Glitchy character reveal
(function initLinkScramble() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  const charset = '!<>-_\\/[]{}—=+*^?#________';

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.originalText = el.innerText;
      this.frame = 0;
      this.queue = [];
      this.isAnimating = false;
      this.frameRequest = null;
    }

    scramble() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      
      const length = this.originalText.length;
      this.queue = [];
      
      // Build queue of character reveals - gradual from left to right
      const totalFrames = 24; // ~400ms at 60fps
      
      for (let i = 0; i < length; i++) {
        const revealFrame = Math.floor((i / length) * totalFrames);
        this.queue.push({
          char: this.originalText[i],
          revealFrame: revealFrame,
          currentChar: this.randomChar()
        });
      }
      
      this.frame = 0;
      this.update();
    }

    update() {
      let output = '';
      let complete = 0;
      
      for (let i = 0; i < this.queue.length; i++) {
        const item = this.queue[i];
        
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
        this.frameRequest = requestAnimationFrame(() => this.update());
      }
    }

    randomChar() {
      return charset[Math.floor(Math.random() * charset.length)];
    }
  }

  // Apply scramble effect to all links
  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    // Skip empty links or links with only whitespace
    if (!link.innerText.trim()) return;
    
    const scrambler = new TextScramble(link);
    
    link.addEventListener('mouseenter', () => {
      scrambler.scramble();
    });
  });
})();

// RGB SPLIT GLITCH EFFECT - Random glitch on elements
(function initRandomGlitch() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Check for touch device - reduce frequency on mobile
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  
  // Selectors for elements that can glitch
  const glitchSelectors = [
    '.grid__item',
    '.title h1',
    '.profile p',
    'a'
  ];

  function getRandomElement() {
    const allElements = [];
    glitchSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => allElements.push(el));
    });
    
    if (allElements.length === 0) return null;
    return allElements[Math.floor(Math.random() * allElements.length)];
  }

  function triggerGlitch() {
    // Pick 1-2 random elements
    const numElements = Math.random() < 0.7 ? 1 : 2;
    
    for (let i = 0; i < numElements; i++) {
      const element = getRandomElement();
      if (!element) continue;
      
      // Random intensity
      const isIntense = Math.random() < 0.3;
      
      // Add glitch class
      element.classList.add('glitch-active');
      if (isIntense) {
        element.classList.add('glitch-intense');
      }
      
      // Remove after animation completes
      const duration = isIntense ? 250 : 200;
      setTimeout(() => {
        element.classList.remove('glitch-active', 'glitch-intense');
      }, duration);
    }
    
    // Schedule next glitch
    scheduleNextGlitch();
  }

  function scheduleNextGlitch() {
    // Random interval: 3-6 seconds on desktop, 8-12 on mobile
    const minDelay = isTouchDevice ? 8000 : 3000;
    const maxDelay = isTouchDevice ? 12000 : 6000;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    
    setTimeout(triggerGlitch, delay);
  }

  // Start the glitch loop after a short initial delay
  setTimeout(scheduleNextGlitch, 2000);
})();

// KEYBOARD NAVIGATION - Arrow keys for section navigation
(function initKeyboardNav() {
  // Section selectors in order of appearance
  const sections = [
    '.hero-brutalist',
    '#profile',
    '#projects',
    '#social'
  ];

  let currentSectionIndex = 0;

  function getSectionElements() {
    return sections.map(selector => document.querySelector(selector)).filter(el => el !== null);
  }

  function scrollToSection(index) {
    const sectionElements = getSectionElements();
    if (index < 0 || index >= sectionElements.length) return;
    
    currentSectionIndex = index;
    const target = sectionElements[index];
    
    // Brutalist immediate scroll - no smooth behavior
    target.scrollIntoView({ behavior: 'auto' });
    
    // Brief visual feedback - flash border
    target.style.outline = '4px solid #f3cd05';
    setTimeout(() => {
      target.style.outline = '';
    }, 300);
  }

  function findCurrentSection() {
    const sectionElements = getSectionElements();
    const scrollPos = window.scrollY + window.innerHeight / 2;
    
    for (let i = 0; i < sectionElements.length; i++) {
      const rect = sectionElements[i].getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;
      
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        return i;
      }
    }
    
    return 0;
  }

  document.addEventListener('keydown', (e) => {
    const sectionElements = getSectionElements();
    if (sectionElements.length === 0) return;

    // Update current index based on scroll position
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

