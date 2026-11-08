/**
 * PageTransition - full-screen 3D page transition system.
 *
 * The transition is intentionally self-contained: PageManager asks it to play
 * the exit phase, then the next document plays the entry phase from
 * sessionStorage. That keeps the writing and article pages as normal static
 * pages, so their page-specific scripts run reliably after navigation.
 */

class PageTransition {
  constructor(options = {}) {
    this.options = {
      outDuration: 980,
      inDuration: 780,
      pixelRatio: 1.5,
      incomingKey: 'pandelis:incoming-transition',
      ...options
    };

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

  init() {
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

  createShell() {
    this.shell = document.createElement('div');
    this.shell.className = 'transition-shell';
    this.shell.setAttribute('aria-hidden', 'true');

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'transition-canvas';

    this.hud = document.createElement('div');
    this.hud.className = 'transition-hud';
    this.hud.innerHTML = [
      '<span class="transition-hud__label">PAGE TRANSFER</span>',
      '<span class="transition-hud__target"></span>',
      '<span class="transition-hud__counter">00</span>'
    ].join('');

    this.shell.appendChild(this.canvas);
    this.shell.appendChild(this.hud);
    document.body.appendChild(this.shell);
  }

  setupScene() {
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

  addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.58);
    const key = new THREE.DirectionalLight(0xf3cd05, 1.45);
    const rim = new THREE.DirectionalLight(0xffffff, 0.8);

    key.position.set(-4, 5, 6);
    rim.position.set(5, -2, 8);

    this.scene.add(ambient, key, rim);
  }

  buildGeometry() {
    const yellow = new THREE.MeshPhongMaterial({ color: 0xf3cd05, shininess: 80 });
    const black = new THREE.MeshPhongMaterial({ color: 0x050505, shininess: 35 });
    const white = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 20 });
    const line = new THREE.LineBasicMaterial({ color: 0xf3cd05, transparent: true, opacity: 0.55 });

    this.buildGate(yellow, black);
    this.buildFrames(line);
    this.buildShards(yellow, black, white);
    this.buildCards(yellow, black, white);
  }

  buildGate(yellow, black) {
    const horizontalGeometry = new THREE.BoxGeometry(14, 1.2, 0.7);
    const verticalGeometry = new THREE.BoxGeometry(1.2, 10, 0.7);
    const gateParts = [
      { name: 'left', geometry: verticalGeometry, material: black, open: [-7.2, 0, 0], closed: [-1.95, 0, 1.2] },
      { name: 'right', geometry: verticalGeometry, material: black, open: [7.2, 0, 0], closed: [1.95, 0, 1.2] },
      { name: 'top', geometry: horizontalGeometry, material: yellow, open: [0, 5.2, 0.2], closed: [0, 2.45, 1.5] },
      { name: 'bottom', geometry: horizontalGeometry, material: yellow, open: [0, -5.2, 0.2], closed: [0, -2.45, 1.5] }
    ];

    this.gate = gateParts.map(part => {
      const mesh = new THREE.Mesh(part.geometry, part.material);
      mesh.name = part.name;
      mesh.userData.open = new THREE.Vector3(...part.open);
      mesh.userData.closed = new THREE.Vector3(...part.closed);
      mesh.position.copy(mesh.userData.open);
      this.world.add(mesh);
      return mesh;
    });
  }

  buildFrames(material) {
    for (let index = 0; index < 11; index++) {
      const width = 3.8 + index * 1.1;
      const height = 2.3 + index * 0.72;
      const z = -index * 1.85;
      const points = [
        new THREE.Vector3(-width, -height, z),
        new THREE.Vector3(width, -height, z),
        new THREE.Vector3(width, height, z),
        new THREE.Vector3(-width, height, z),
        new THREE.Vector3(-width, -height, z)
      ];

      const frame = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
      frame.userData.baseZ = z;
      this.frames.push(frame);
      this.world.add(frame);
    }
  }

  buildShards(yellow, black, white) {
    const materials = [yellow, black, white];

    for (let index = 0; index < 34; index++) {
      const width = 0.18 + Math.random() * 0.55;
      const height = 0.16 + Math.random() * 0.8;
      const depth = 0.08 + Math.random() * 0.35;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        materials[index % materials.length]
      );

      mesh.userData.seed = Math.random() * Math.PI * 2;
      mesh.userData.radius = 2.2 + Math.random() * 7.5;
      mesh.userData.speed = 0.6 + Math.random() * 1.6;
      mesh.userData.open = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        -10 - Math.random() * 15
      );
      mesh.userData.closed = new THREE.Vector3(
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 2.1,
        1.2 + Math.random() * 2.5
      );
      mesh.position.copy(mesh.userData.open);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.shards.push(mesh);
      this.world.add(mesh);
    }
  }

  buildCards(yellow, black, white) {
    const cardMaterials = [white, yellow, black, white, yellow];

    for (let index = 0; index < 7; index++) {
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 2.55, 0.08),
        cardMaterials[index % cardMaterials.length]
      );
      card.userData.offset = index;
      card.userData.open = new THREE.Vector3((index - 3) * 0.8, -6, -5 - index);
      card.userData.closed = new THREE.Vector3((index - 3) * 0.38, 0.05, 1.8 + index * 0.07);
      card.position.copy(card.userData.open);
      card.rotation.set(-0.9, 0.2 * (index - 3), 0.08 * (index - 3));
      this.cards.push(card);
      this.world.add(card);
    }
  }

  async transitionTo(url, options = {}) {
    if (!this.ready || this.prefersReducedMotion) {
      window.location.href = url;
      return;
    }

    await this.start({ url, ...options, holdOnComplete: true });
    sessionStorage.setItem(this.options.incomingKey, JSON.stringify({
      from: window.location.pathname,
      to: new URL(url, window.location.href).pathname,
      at: Date.now()
    }));
    window.location.href = url;
  }

  async start(options = {}) {
    if (!this.ready || this.prefersReducedMotion) return;
    return this.playPhase('out', this.options.outDuration, options);
  }

  async end(options = {}) {
    if (!this.ready || this.prefersReducedMotion) return;
    return this.playPhase('in', this.options.inDuration, options);
  }

  playIncomingTransition() {
    const rawState = sessionStorage.getItem(this.options.incomingKey);
    if (!rawState) return;

    sessionStorage.removeItem(this.options.incomingKey);

    try {
      const state = JSON.parse(rawState);
      if (!state.at || Date.now() - state.at > 8000) return;
      setTimeout(() => this.end(state), 80);
    } catch (error) {
      console.warn('[PageTransition] Failed to read incoming transition state', error);
    }
  }

  playPhase(phase, duration, options) {
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

    return new Promise(resolve => {
      this.resolvePhase = resolve;
      this.animatePhase();
    });
  }

  setHud(options = {}) {
    const target = this.hud.querySelector('.transition-hud__target');
    const label = this.hud.querySelector('.transition-hud__label');
    const targetUrl = options.url || options.to || window.location.pathname;

    if (target) {
      target.textContent = new URL(targetUrl, window.location.href).pathname.toUpperCase();
    }
    if (label) {
      label.textContent = this.phase === 'in' ? 'PAGE LOCKED' : 'PAGE TRANSFER';
    }
  }

  animatePhase() {
    const elapsed = performance.now() - this.startedAt;
    const rawProgress = Math.min(elapsed / this.duration, 1);
    const progress = this.phase === 'in' ? 1 - rawProgress : rawProgress;
    const eased = this.easeOutExpo(progress);
    const time = this.clock.getElapsedTime();

    this.updateScene(eased, rawProgress, time);
    this.renderer.render(this.scene, this.camera);
    this.updateHud(rawProgress);

    if (rawProgress < 1) {
      this.animationId = requestAnimationFrame(this.animatePhase);
      return;
    }

    this.completePhase();
  }

  updateScene(progress, rawProgress, time) {
    const pulse = Math.sin(time * 8) * 0.035;
    this.world.rotation.y = (progress - 0.5) * 0.45;
    this.world.rotation.x = (0.5 - progress) * 0.18;
    this.world.rotation.z = Math.sin(progress * Math.PI) * 0.08;

    this.camera.position.z = 9 - progress * 5.7;
    this.camera.position.x = Math.sin(progress * Math.PI) * 0.45;
    this.camera.position.y = Math.cos(progress * Math.PI) * 0.18;
    this.camera.lookAt(0, 0, 0);

    this.gate.forEach(mesh => {
      mesh.position.lerpVectors(mesh.userData.open, mesh.userData.closed, progress);
      mesh.rotation.z = (mesh.name === 'top' || mesh.name === 'bottom') ? pulse : -pulse;
    });

    this.frames.forEach((frame, index) => {
      frame.position.z = progress * 18 + Math.sin(time + index) * 0.15;
      frame.rotation.z = (index % 2 === 0 ? 1 : -1) * progress * 0.12;
      frame.material.opacity = 0.16 + (1 - Math.abs(progress - 0.5) * 2) * 0.55;
    });

    this.shards.forEach((mesh, index) => {
      const stagger = Math.min(1, Math.max(0, progress * 1.25 - index * 0.012));
      const orbit = time * mesh.userData.speed + mesh.userData.seed;
      mesh.position.lerpVectors(mesh.userData.open, mesh.userData.closed, this.easeInOutCubic(stagger));
      mesh.position.x += Math.cos(orbit) * mesh.userData.radius * 0.035;
      mesh.position.y += Math.sin(orbit) * mesh.userData.radius * 0.025;
      mesh.rotation.x += 0.035 + index * 0.0008;
      mesh.rotation.y += 0.025;
      mesh.rotation.z += 0.018;
    });

    this.cards.forEach((card, index) => {
      const cardProgress = Math.min(1, Math.max(0, progress * 1.45 - index * 0.08));
      card.position.lerpVectors(card.userData.open, card.userData.closed, this.easeOutExpo(cardProgress));
      card.rotation.x = -0.9 + cardProgress * 1.08;
      card.rotation.y = (index - 3) * (0.25 - cardProgress * 0.12);
      card.rotation.z = Math.sin(time * 2 + index) * 0.04;
    });

    this.shell.style.setProperty('--transition-progress', rawProgress.toFixed(3));
    this.shell.style.opacity = this.phase === 'in'
      ? String(Math.max(0, 1 - rawProgress * 1.15))
      : String(Math.min(1, 0.12 + rawProgress * 1.18));
  }

  updateHud(progress) {
    const counter = this.hud.querySelector('.transition-hud__counter');
    if (counter) {
      const value = Math.round(progress * 100).toString().padStart(2, '0');
      counter.textContent = value;
    }
  }

  completePhase() {
    const completedPhase = this.phase;
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.isActive = false;
    this.phase = 'idle';

    const holdOverlay = this.activeOptions && this.activeOptions.holdOnComplete && completedPhase === 'out';
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

  handleResize() {
    if (!this.renderer || !this.camera) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.options.pixelRatio));
  }

  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    document.body.classList.remove('is-transitioning');

    if (this.renderer) this.renderer.dispose();
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);

    this.ready = false;
  }
}

function initPageTransitions() {
  if (window.pageTransition) return window.pageTransition;
  if (typeof THREE === 'undefined') return null;

  window.pageTransition = new PageTransition();
  return window.pageTransition.init();
}

function waitForThreeAndInit(attempt = 0) {
  if (typeof THREE === 'undefined') {
    if (attempt < 30) setTimeout(() => waitForThreeAndInit(attempt + 1), 100);
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
