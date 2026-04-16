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

class PageTransition {
  constructor() {
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
    this.destination = null;
    
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Shader uniforms
    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTexture: { value: null },
      uGlitchIntensity: { value: 0 },
      uDirection: { value: 1 } // 1 = out, -1 = in
    };
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);
    
    // Initialize if not reduced motion
    if (!this.prefersReducedMotion) {
      this.init();
    }
  }
  
  init() {
    this.createCanvas();
    this.setupScene();
    this.setupPostProcessing();
    this.addEventListeners();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'transition-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.1s;
    `;
    document.body.appendChild(this.canvas);
  }
  
  setupScene() {
    // Scene
    this.scene = new THREE.Scene();
    
    // Camera (orthographic for full-screen quad)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  setupPostProcessing() {
    this.composer = new THREE.EffectComposer(this.renderer);
    
    // Render pass
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Brutalist transition shader pass
    const transitionPass = new THREE.ShaderPass(this.getTransitionShader());
    transitionPass.uniforms = this.uniforms;
    transitionPass.renderToScreen = true;
    this.composer.addPass(transitionPass);
  }
  
  getTransitionShader() {
    return {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTexture: { value: null },
        uGlitchIntensity: { value: 0 },
        uDirection: { value: 1 },
        uType: { value: 0 } // 0=glitch-wipe, 1=chromatic-split, 2=pixel-sort, 3=noise-reveal
      },
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
        uniform float uProgress;
        uniform vec2 uResolution;
        uniform sampler2D uTexture;
        uniform float uGlitchIntensity;
        uniform float uDirection;
        uniform int uType;
        varying vec2 vUv;
        
        // Yellow and black color palette
        vec3 YELLOW = vec3(0.953, 0.804, 0.020); // #f3cd05
        vec3 BLACK = vec3(0.0, 0.0, 0.0);        // #000000
        
        // Pseudo-random function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Noise function
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        // Glitch block effect
        vec2 glitchWipe(vec2 uv, float progress) {
          float glitchOffset = 0.0;
          
          // Create horizontal glitch blocks
          float rowIndex = floor(uv.y * 20.0);
          float rowRandom = random(vec2(rowIndex, floor(uTime * 30.0)));
          
          // Block wipe threshold
          float wipeThreshold = progress;
          
          // Glitch intensity increases near the wipe edge
          float edgeDist = abs(uv.x - wipeThreshold);
          float edgeIntensity = smoothstep(0.2, 0.0, edgeDist);
          
          if (edgeIntensity > 0.0 && rowRandom > 0.4) {
            float blockOffset = (random(vec2(rowIndex, uTime * 10.0)) - 0.5) * edgeIntensity * 0.3;
            glitchOffset += blockOffset;
          }
          
          // Wipe transition
          float mask = step(uv.x, wipeThreshold + glitchOffset * 0.5);
          
          return vec2(uv.x + glitchOffset, mask);
        }
        
        // Chromatic split with RGB separation
        vec3 chromaticSplit(sampler2D tex, vec2 uv, float intensity) {
          float r = texture2D(tex, uv + vec2(intensity * 0.02, 0.0)).r;
          float g = texture2D(tex, uv).g;
          float b = texture2D(tex, uv - vec2(intensity * 0.02, 0.0)).b;
          return vec3(r, g, b);
        }
        
        // Pixel sort effect
        vec3 pixelSort(sampler2D tex, vec2 uv, float progress) {
          float threshold = 0.3 + progress * 0.5;
          float brightness = dot(texture2D(tex, uv).rgb, vec3(0.299, 0.587, 0.114));
          
          vec2 sortedUv = uv;
          if (brightness > threshold) {
            float sortOffset = sin(uv.y * 50.0 + uTime * 5.0) * 0.01 * progress;
            sortedUv.x += sortOffset;
          }
          
          return texture2D(tex, sortedUv).rgb;
        }
        
        // Noise reveal transition
        float noiseReveal(vec2 uv, float progress) {
          float n = noise(uv * 10.0 + uTime * 0.5);
          return smoothstep(progress - 0.1, progress + 0.1, n);
        }
        
        void main() {
          vec2 uv = vUv;
          vec3 color = BLACK;
          float alpha = 1.0;
          
          // Current page texture
          vec3 texColor = texture2D(uTexture, uv).rgb;
          
          if (uType == 0) {
            // Glitch Wipe
            vec2 result = glitchWipe(uv, uProgress);
            float mask = result.y;
            
            // Add chromatic aberration near the edge
            float edgeDist = abs(uv.x - uProgress);
            float caStrength = smoothstep(0.15, 0.0, edgeDist) * 0.03;
            
            vec3 caColor = chromaticSplit(uTexture, uv, caStrength + uGlitchIntensity);
            
            // Mix based on wipe progress
            color = mix(caColor, YELLOW * 0.1, mask * 0.3);
            
            // Add scanlines
            float scanline = sin(uv.y * 300.0) * 0.1;
            color += scanline * (1.0 - mask);
            
            // Add noise
            float n = random(uv + uTime) * 0.1;
            color += n;
            
            // Glitch blocks overlay
            if (edgeDist < 0.1 && random(vec2(floor(uv.y * 40.0), uTime * 20.0)) > 0.5) {
              color = mix(color, YELLOW, 0.5);
            }
            
          } else if (uType == 1) {
            // Chromatic Split
            float intensity = uProgress * 2.0;
            
            // RGB separation
            vec2 offsetR = vec2(intensity * 0.03 * (random(vec2(uTime)) - 0.5), 0.0);
            vec2 offsetB = vec2(-intensity * 0.03 * (random(vec2(uTime + 1.0)) - 0.5), 0.0);
            
            float r = texture2D(uTexture, uv + offsetR).r;
            float g = texture2D(uTexture, uv).g;
            float b = texture2D(uTexture, uv + offsetB).b;
            
            color = vec3(r, g, b);
            
            // Add noise overlay
            float n = noise(uv * 20.0 + uTime) * intensity * 0.2;
            color += n;
            
            // Scanlines
            float scanline = sin(uv.y * 200.0) * 0.15 * intensity;
            color += scanline;
            
            // Yellow tint near completion
            if (uProgress > 0.7) {
              color = mix(color, YELLOW, (uProgress - 0.7) * 0.5);
            }
            
          } else if (uType == 2) {
            // Pixel Sort
            float sortThreshold = 0.3 + uProgress * 0.6;
            float rowRandom = random(vec2(floor(uv.y * 30.0), uTime));
            
            vec2 sortedUv = uv;
            
            // Check brightness
            float brightness = dot(texColor, vec3(0.299, 0.587, 0.114));
            
            if (brightness > sortThreshold || rowRandom > 0.8) {
              float sortAmount = (brightness - sortThreshold) * uProgress * 0.1;
              float wave = sin(uv.y * 100.0 + uTime * 10.0) * sortAmount;
              sortedUv.x += wave + (random(vec2(uv.y * 10.0, uTime)) - 0.5) * 0.05 * uProgress;
            }
            
            color = texture2D(uTexture, sortedUv).rgb;
            
            // Pixel block overlay
            if (rowRandom > 0.9 && brightness > 0.5) {
              float blockX = floor(uv.x * 40.0) / 40.0;
              float blockY = floor(uv.y * 30.0) / 30.0;
              color = mix(color, YELLOW, 0.7);
            }
            
            // Noise
            color += random(uv + uTime * 0.1) * 0.05;
            
          } else if (uType == 3) {
            // Noise Reveal
            float n = noise(uv * 8.0);
            float reveal = smoothstep(uProgress - 0.2, uProgress + 0.2, n);
            
            // Dissolve effect
            float dissolveNoise = noise(uv * 30.0 + uTime * 2.0);
            float dissolve = step(uProgress, dissolveNoise);
            
            // Color distortion during transition
            float distortion = sin(uv.y * 50.0 + uTime * 5.0) * (1.0 - reveal) * 0.02;
            vec3 distortedColor = chromaticSplit(uTexture, uv + vec2(distortion, 0.0), 0.02);
            
            color = mix(YELLOW * 0.1, distortedColor, dissolve);
            
            // Grain
            float grain = random(uv * 100.0 + uTime) * 0.15;
            color += grain * (1.0 - dissolve);
            
            // Vignette during transition
            float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.5;
            vignette = smoothstep(0.0, 0.7, vignette);
            color *= vignette;
          }
          
          // Global effects applied to all transition types
          
          // Additional scanlines
          float globalScanline = sin(uv.y * 400.0 + uTime * 2.0) * 0.05;
          color += globalScanline;
          
          // Glitch blocks at random positions during active transition
          if (uProgress > 0.1 && uProgress < 0.9) {
            float glitchSeed = floor(uTime * 15.0);
            float blockRow = floor(uv.y * 15.0);
            float blockRandom = random(vec2(glitchSeed, blockRow));
            
            if (blockRandom > 0.85) {
              float blockIntensity = sin(uProgress * 3.14159) * 0.5;
              color = mix(color, YELLOW, blockIntensity);
            }
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };
  }
  
  addEventListeners() {
    window.addEventListener('resize', this.handleResize);
    
    // Intercept link clicks for same-origin navigation
    document.addEventListener('click', this.handleClick);
  }
  
  handleClick(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Only handle same-origin links
    if (href.startsWith('#') || href.startsWith('javascript:')) return;
    
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    
    // Don't intercept if modifier keys are pressed
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    
    e.preventDefault();
    this.start(href);
  }
  
  captureScreenshot() {
    // Use html2canvas approach with canvas
    return new Promise((resolve) => {
      // Create a temporary canvas to capture the page
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;
      
      // Fill with current background color
      const bgColor = getComputedStyle(document.body).backgroundColor;
      ctx.fillStyle = bgColor || '#000000';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Try to capture using modern API
      if (document.documentElement.toDataURL) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(tempCanvas);
        };
        img.onerror = () => resolve(tempCanvas);
        img.src = document.documentElement.toDataURL();
      } else {
        // Fallback: draw current scroll position
        window.scrollTo(0, 0);
        
        // Use html2canvas-like approach - clone the document
        setTimeout(() => {
          resolve(tempCanvas);
        }, 50);
      }
    });
  }
  
  async start(destination) {
    if (this.isActive || this.prefersReducedMotion) {
      // Skip animation, navigate directly
      window.location.href = destination;
      return;
    }
    
    this.isActive = true;
    this.destination = destination;
    this.startTime = performance.now();
    
    // Capture current page
    await this.capturePageTexture();
    
    // Show canvas
    this.canvas.style.opacity = '1';
    this.canvas.style.pointerEvents = 'auto';
    
    // Start animation
    this.animate();
    
    // Navigate after animation
    setTimeout(() => {
      window.location.href = destination;
    }, this.duration);
  }
  
  async capturePageTexture() {
    // Create texture from current page state
    // We'll use a simplified approach - render the body to a canvas
    
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = window.innerWidth;
    captureCanvas.height = window.innerHeight;
    const ctx = captureCanvas.getContext('2d');
    
    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    
    // Try to draw the document
    try {
      // Get computed background
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
        ctx.fillStyle = bodyBg;
        ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      }
      
      // Draw representative content - yellow accent bars
      ctx.fillStyle = '#f3cd05';
      
      // Hero section bar
      const heroSection = document.querySelector('.hero-brutalist');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        ctx.fillRect(0, 0, captureCanvas.width, rect.height);
      }
      
    } catch (e) {
      console.warn('Page capture failed:', e);
    }
    
    // Create Three.js texture
    this.currentTexture = new THREE.CanvasTexture(captureCanvas);
    this.currentTexture.minFilter = THREE.LinearFilter;
    this.currentTexture.magFilter = THREE.LinearFilter;
    
    this.uniforms.uTexture.value = this.currentTexture;
  }
  
  animate(time) {
    if (!this.isActive) return;
    
    const elapsed = (time || performance.now()) - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Update uniforms
    this.uniforms.uTime.value = elapsed * 0.001;
    this.uniforms.uProgress.value = this.easeInOutCubic(progress);
    this.uniforms.uGlitchIntensity.value = Math.sin(progress * Math.PI) * 2.0;
    
    // Render
    this.composer.render();
    
    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  setTransitionType(type) {
    const types = {
      'glitch-wipe': 0,
      'chromatic-split': 1,
      'pixel-sort': 2,
      'noise-reveal': 3
    };
    
    if (types.hasOwnProperty(type)) {
      this.currentType = type;
      // Update shader uniform
      if (this.composer && this.composer.passes[1]) {
        this.composer.passes[1].uniforms.uType.value = types[type];
      }
    }
  }
  
  isTransitioning() {
    return this.isActive;
  }
  
  handleResize() {
    if (!this.renderer) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    this.uniforms.uResolution.value.set(width, height);
  }
  
  destroy() {
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
}

// Auto-initialize on DOM ready
function initPageTransitions() {
  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    console.log('[PageTransition] Reduced motion preferred - transitions disabled');
    return null;
  }
  
  // Wait for Three.js to be available
  if (typeof THREE === 'undefined') {
    console.warn('[PageTransition] Three.js not loaded');
    return null;
  }
  
  return new PageTransition();
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageTransitions);
} else {
  window.pageTransition = initPageTransitions();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PageTransition, initPageTransitions };
}
