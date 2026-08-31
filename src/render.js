/**
 * Skybound Spring — Three.js presentation layer.
 * Procedural meshes only; consumes immutable sim snapshots each frame.
 * Render layers: 0 environment, 1 gameplay, 2 selection/target, 3 effects.
 */
import * as THREE from 'three';
import { WORLD_WIDTH, CAM_OFFSET, PLAYER_RADIUS, TICK_RATE } from './rules.js';
import { CVD_PALETTES } from './content.js';

/** Exported framing constants (no magic offsets elsewhere). */
export const FRAMING = {
  FOV: 42,
  WORLD_WIDTH,
  VIEW_HEIGHT: 620,       // world units vertically visible at the play plane
  CAM_LOOK_AHEAD: 210,    // camera centers this far above the camera floor
  CAM_Z_BASE: 700,        // adjusted per aspect in resize()
  PLAYER_Z: 0,
};

const LAYER_ENV = 0, LAYER_GAME = 1, LAYER_SELECT = 2, LAYER_FX = 3;

export const QUALITY_TIERS = {
  low: { pixelRatioCap: 1, shadows: false, particles: 12, envDensity: 0.4, cloudCount: 24 },
  medium: { pixelRatioCap: 1.5, shadows: false, particles: 24, envDensity: 0.7, cloudCount: 40 },
  high: { pixelRatioCap: 2, shadows: true, particles: 40, envDensity: 1, cloudCount: 64 },
};

function makeGradientTexture(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- procedural geometry ---------- */

function leafGeometry(w, h, thick) {
  // Authored leaf-pad: flattened, gently curved silhouette (not a box).
  const geo = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  geo.scale(w / 2, thick, h / 2);
  return geo;
}
function petalGeometry(w, h) {
  // Pointed petal silhouette for crumble pads.
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.quadraticCurveTo(-w / 4, h * 0.42, 0, h * 0.3);
  shape.quadraticCurveTo(w / 4, h * 0.42, w / 2, 0);
  shape.quadraticCurveTo(w / 4, -h * 0.42, 0, -h * 0.3);
  shape.quadraticCurveTo(-w / 4, -h * 0.42, -w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function blossomGeometry(r) {
  // Spring blossom: central dome + petal ring.
  const group = [];
  const dome = new THREE.SphereGeometry(r * 0.42, 12, 8);
  dome.translate(0, 6, 0);
  group.push(dome);
  for (let i = 0; i < 5; i++) {
    const petal = new THREE.SphereGeometry(r * 0.3, 8, 6);
    petal.scale(1.4, 0.35, 0.9);
    const a = (i / 5) * Math.PI * 2;
    petal.translate(Math.cos(a) * r * 0.62, 2, Math.sin(a) * r * 0.62);
    group.push(petal);
  }
  return mergeGeos(group);
}
function thornGeometry(w) {
  // Spike cluster — unmistakable hazard silhouette.
  const parts = [];
  const base = new THREE.BoxGeometry(w, 5, 14);
  base.translate(0, -2, 0);
  parts.push(base);
  const n = Math.max(3, Math.floor(w / 16));
  for (let i = 0; i < n; i++) {
    const spike = new THREE.ConeGeometry(6, 22, 6);
    spike.translate(-w / 2 + (i + 0.5) * (w / n), 11, 0);
    parts.push(spike);
  }
  return mergeGeos(parts);
}
function mergeGeos(geos) {
  // minimal merge (positions/normals/uvs) — all BufferGeometry, non-indexed
  const nonIndexed = geos.map(g => g.toNonIndexed ? g.toNonIndexed() : g);
  let total = 0;
  for (const g of nonIndexed) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const norm = new Float32Array(total * 3);
  let off = 0;
  for (const g of nonIndexed) {
    pos.set(g.attributes.position.array, off * 3);
    norm.set(g.attributes.normal.array, off * 3);
    off += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  return out;
}

/** The sprout-hopper: an original little seedling hero. */
function makeHopperMesh(mat, leafMat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(PLAYER_RADIUS, 18, 14), mat);
  body.scale.set(1, 1.15, 0.9);
  g.add(body);
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(7, 16, 8), leafMat);
  leaf.position.set(0, PLAYER_RADIUS + 6, 0);
  leaf.rotation.z = 0.5;
  g.add(leaf);
  const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 8), leafMat);
  leaf2.position.set(-3, PLAYER_RADIUS + 4, 2);
  leaf2.rotation.z = -0.7;
  g.add(leaf2);
  // eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a2030 });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), eyeMat);
    eye.position.set(sx * 4.5, 3, PLAYER_RADIUS * 0.82);
    g.add(eye);
  }
  g.traverse(o => o.layers.set(LAYER_GAME));
  return g;
}

/* ---------- renderer ---------- */

export class GameRenderer {
  /**
   * container: HTMLElement. opts: { settings, onContextLost, onContextRestored }
   */
  constructor(container, opts = {}) {
    this.container = container;
    this.opts = opts;
    this.settings = opts.settings || { quality: 'medium', reducedMotion: false, cvdPalette: 'default' };
    this.theme = null;
    this.disposables = [];
    this.padViews = new Map();
    this.tokenViews = new Map();
    this.camY = 0;          // spring-smoothed camera floor
    this.camVel = 0;
    this.shake = 0;
    this.time = 0;
    this.playerSquash = 0;
    this.ok = false;

    let canvas;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      this.ok = false;
      return;
    }
    canvas = this.renderer.domElement;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(FRAMING.FOV, 1, 10, 12000);
    this.camera.position.set(WORLD_WIDTH / 2, 300, FRAMING.CAM_Z_BASE);
    this.camera.lookAt(WORLD_WIDTH / 2, 300, 0);

    // Layers: camera sees environment + gameplay + selection + effects.
    this.camera.layers.enable(LAYER_ENV);
    this.camera.layers.enable(LAYER_GAME);
    this.camera.layers.enable(LAYER_SELECT);
    this.camera.layers.enable(LAYER_FX);

    this.key = new THREE.DirectionalLight(0xffffff, 1.6);
    this.key.position.set(300, 800, 600);
    this.hemi = new THREE.HemisphereLight(0xbfd9ff, 0x8a9a6a, 0.9);
    this.scene.add(this.key, this.hemi);

    // Sky dome (procedural gradient, deterministic per theme).
    this.skyGeo = new THREE.SphereGeometry(6000, 16, 12);
    this.sky = null;

    // Shared assets
    this.geoPad = leafGeometry(1, 0.55, 0.35);
    this.geoPetal = petalGeometry(1, 1);
    this.geoToken = new THREE.OctahedronGeometry(9);
    this.geoCloud = new THREE.IcosahedronGeometry(1, 1);
    this.geoTower = new THREE.CylinderGeometry(0.35, 0.6, 1, 7);
    this.geoParticle = new THREE.PlaneGeometry(6, 6);

    // Player
    this.playerMat = new THREE.MeshStandardMaterial({ color: 0x8ed06a, roughness: 0.6 });
    this.playerLeafMat = new THREE.MeshStandardMaterial({ color: 0x4f9e4f, roughness: 0.55 });
    this.player = makeHopperMesh(this.playerMat, this.playerLeafMat);
    this.scene.add(this.player);

    // Instanced clouds
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.85 });
    this.clouds = null;

    // Instanced distant towers/vines
    this.towerMat = new THREE.MeshStandardMaterial({ color: 0x6a8a6a, roughness: 0.9 });
    this.towers = null;

    // Pooled particles (event-tiered bursts)
    this.particlePool = [];
    this.particleMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    this.particleGroup = new THREE.Group();
    this.particleGroup.traverse(o => o.layers.set(LAYER_FX));
    this.scene.add(this.particleGroup);

    // Ghost/selection marker layer (used for tutorial target hints)
    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(14, 18, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.layers.set(LAYER_SELECT);
    this.marker.visible = false;
    this.scene.add(this.marker);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.ok = false;
      if (this.opts.onContextLost) this.opts.onContextLost();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.ok = true;
      this.rebuildGpuResources();
      if (this.opts.onContextRestored) this.opts.onContextRestored();
    });

    container.appendChild(canvas);
    this.ok = true;
    this.setQuality(this.settings.quality);
    this.resize();
  }

  rebuildGpuResources() {
    // All geometry/material CPU descriptors are retained on this object;
    // three re-uploads on next render. Nothing else to rebuild.
    this.resize();
  }

  resize() {
    if (!this.ok) return;
    const w = this.container.clientWidth || 320;
    const h = this.container.clientHeight || 480;
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Fit world width horizontally; camera distance derives from FOV+aspect.
    const halfH = (WORLD_WIDTH / 2) / aspect;
    const fitZ = halfH / Math.tan(THREE.MathUtils.degToRad(FRAMING.FOV / 2));
    this.camZ = Math.max(FRAMING.CAM_Z_BASE * 0.7, fitZ * 1.02);
    this.camera.updateProjectionMatrix();
    const cap = QUALITY_TIERS[this.settings.quality].pixelRatioCap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    this.renderer.setSize(w, h, false);
  }

  setQuality(tier) {
    this.settings.quality = QUALITY_TIERS[tier] ? tier : 'medium';
    const q = QUALITY_TIERS[this.settings.quality];
    this.renderer.shadowMap.enabled = q.shadows;
    this.key.castShadow = q.shadows;
    this.buildEnvironment();
    this.resize();
  }

  setTheme(theme) {
    this.theme = theme;
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    if (this.sky) {
      this.scene.remove(this.sky);
      this.sky.material.map.dispose();
      this.sky.material.dispose();
    }
    const tex = makeGradientTexture(hex(theme.skyTop), hex(theme.skyBottom));
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false });
    this.sky = new THREE.Mesh(this.skyGeo, mat);
    this.sky.layers.set(LAYER_ENV);
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);
    this.key.color.setHex(theme.keyLight);
    this.hemi.color.setHex(theme.hemiSky);
    this.hemi.groundColor.setHex(theme.hemiGround);
    this.cloudMat.color.setHex(theme.cloud);
    this.buildEnvironment();
  }

  palette() {
    return CVD_PALETTES[this.settings.cvdPalette] || CVD_PALETTES.default;
  }

  buildEnvironment() {
    if (!this.theme) return;
    const q = QUALITY_TIERS[this.settings.quality];
    // Clouds
    if (this.clouds) { this.scene.remove(this.clouds); this.clouds.dispose(); }
    const rng = mulberry(0xc10d5);
    const count = q.cloudCount;
    this.clouds = new THREE.InstancedMesh(this.geoCloud, this.cloudMat, count);
    this.clouds.layers.set(LAYER_ENV);
    const m = new THREE.Matrix4();
    this.cloudData = [];
    for (let i = 0; i < count; i++) {
      const d = {
        x: rng() * 1600 - 560, y: rng() * 4000 - 400, z: -500 - rng() * 1800,
        s: 40 + rng() * 120, speed: 2 + rng() * 6, phase: rng() * Math.PI * 2,
      };
      this.cloudData.push(d);
      m.makeScale(d.s, d.s * 0.45, d.s * 0.7);
      m.setPosition(d.x, d.y, d.z);
      this.clouds.setMatrixAt(i, m);
    }
    this.clouds.instanceMatrix.needsUpdate = true;
    this.scene.add(this.clouds);
    // Distant garden towers / vines
    if (this.towers) { this.scene.remove(this.towers); this.towers.dispose(); }
    const tCount = Math.floor(10 * q.envDensity) + 3;
    this.towers = new THREE.InstancedMesh(this.geoTower, this.towerMat, tCount);
    this.towers.layers.set(LAYER_ENV);
    for (let i = 0; i < tCount; i++) {
      const hgt = 500 + rng() * 1200;
      m.makeScale(60 + rng() * 60, hgt, 60 + rng() * 40);
      m.setPosition(rng() * 1400 - 460, hgt * 0.1 + rng() * 2600 - 300, -900 - rng() * 1600);
      this.towers.setMatrixAt(i, m);
    }
    this.towers.instanceMatrix.needsUpdate = true;
    this.scene.add(this.towers);
  }

  /* ---------- pad / token views ---------- */

  materialFor(type) {
    const pal = this.palette();
    const key = type + ':' + this.settings.cvdPalette;
    if (!this._mats) this._mats = {};
    if (!this._mats[key]) {
      const opts = { color: pal[type] || pal.bud, roughness: 0.65 };
      if (type === 'wisp') { opts.transparent = true; opts.opacity = 0.65; }
      if (type === 'thorn') { opts.color = pal.thorn; opts.roughness = 0.4; }
      this._mats[key] = new THREE.MeshStandardMaterial(opts);
    }
    return this._mats[key];
  }

  /** Geometry cache: one geometry per (type, rounded width), shared by all
   * pad views — avoids per-pad allocation churn during long climbs. */
  padGeometry(type, w) {
    if (!this._geoCache) this._geoCache = {};
    const key = type + ':' + Math.round(w / 4);
    if (!this._geoCache[key]) {
      const qw = Math.round(w / 4) * 4;
      if (type === 'crumb') {
        const g = petalGeometry(qw, qw * 0.5);
        this._geoCache[key] = g;
      } else if (type === 'spring') {
        this._geoCache[key] = blossomGeometry(qw * 0.55);
      } else if (type === 'thorn') {
        this._geoCache[key] = thornGeometry(qw);
      } else {
        this._geoCache[key] = leafGeometry(qw, 26, qw * 0.45);
      }
    }
    return this._geoCache[key];
  }

  makePadView(p) {
    const mesh = new THREE.Mesh(this.padGeometry(p.type, p.w), this.materialFor(p.type));
    if (p.type === 'wisp') mesh.scale.setScalar(0.92);
    mesh.position.set(p.x, p.y, 0);
    mesh.traverse(o => o.layers.set(LAYER_GAME));
    return mesh;
  }

  syncViews(state) {
    // Platforms: create new, update, remove dead/culled.
    const seen = new Set();
    for (const p of state.platforms) {
      if (!p.alive || p.y < state.camY - 120 || p.y > state.camY + FRAMING.VIEW_HEIGHT + 250) continue;
      seen.add(p.id);
      let v = this.padViews.get(p.id);
      if (!v) {
        v = this.makePadView(p);
        this.padViews.set(p.id, v);
        this.scene.add(v);
      }
      v.position.x = p.x;
      v.position.y = p.y;
    }
    for (const [id, v] of this.padViews) {
      if (!seen.has(id)) {
        this.scene.remove(v);
        this.padViews.delete(id);
      }
    }
    // Tokens
    const seenT = new Set();
    const pal = this.palette();
    for (const k of state.tokens) {
      if (k.taken || k.y < state.camY - 60 || k.y > state.camY + FRAMING.VIEW_HEIGHT + 200) continue;
      seenT.add(k.id);
      let v = this.tokenViews.get(k.id);
      if (!v) {
        v = new THREE.Mesh(this.geoToken, new THREE.MeshBasicMaterial({ color: pal.token }));
        v.layers.set(LAYER_GAME);
        this.tokenViews.set(k.id, v);
        this.scene.add(v);
      }
      v.position.set(k.x, k.y + Math.sin(this.time * 2 + k.id) * 4, 0);
      v.rotation.y = this.time * 2 + k.id;
    }
    for (const [id, v] of this.tokenViews) {
      if (!seenT.has(id)) {
        this.scene.remove(v);
        v.material.dispose();
        this.tokenViews.delete(id);
      }
    }
  }

  /* ---------- effects ---------- */

  burst(x, y, color, count, spread = 60) {
    if (this.settings.reducedMotion) return;
    const q = QUALITY_TIERS[this.settings.quality];
    const n = Math.min(count, q.particles);
    for (let i = 0; i < n; i++) {
      let pt = this.particlePool.find(p => !p.userData.active);
      if (!pt) {
        pt = new THREE.Mesh(this.geoParticle, this.particleMat.clone());
        pt.layers.set(LAYER_FX);
        this.particleGroup.add(pt);
        this.particlePool.push(pt);
      }
      pt.userData.active = true;
      pt.userData.vx = (Math.random() - 0.5) * spread * 2;
      pt.userData.vy = Math.random() * spread * 1.6;
      pt.userData.life = 0.5 + Math.random() * 0.3;
      pt.material.color.setHex(color);
      pt.material.opacity = 0.9;
      pt.position.set(x, y, 10);
      pt.visible = true;
    }
  }

  shakeCamera(amount) {
    if (this.settings.reducedMotion) return;
    this.shake = Math.max(this.shake, amount);
  }

  /** Event hierarchy: input ack < legal move < combo/goal < round completion. */
  handleEvents(events, state) {
    for (const e of events) {
      switch (e.type) {
        case 'land':
          this.playerSquash = 1;
          this.burst(state.player.x, e.y + 4, 0xdfffc8, 6, 40);
          if (e.chain >= 8) { this.burst(state.player.x, e.y + 10, 0xffe066, 16, 90); this.shakeCamera(3); }
          break;
        case 'spring':
          this.playerSquash = 1.4;
          this.burst(state.player.x, e.y + 6, 0xffc0dd, 18, 100);
          this.shakeCamera(2);
          break;
        case 'token':
          this.burst(state.player.x, state.player.y, 0xfff09a, 12, 70);
          break;
        case 'thorn':
          this.burst(state.player.x, state.player.y, 0xff6a6a, 24, 120);
          this.shakeCamera(8);
          break;
        case 'terminal':
          if (e.reason === 'goal-reached') this.burst(state.player.x, state.player.y, 0xa0ffd8, 40, 160);
          if (e.reason === 'fell') this.shakeCamera(5);
          break;
      }
    }
  }

  /* ---------- per-frame render ---------- */

  render(state, dt, hidden) {
    if (!this.ok) return;
    if (hidden) return; // decorative animation paused while hidden
    this.time += dt;

    // Player from sim state (120 Hz sim is fine without interpolation).
    if (state) {
      const px = state.player.x;
      this.player.position.set(px, state.player.y + PLAYER_RADIUS, FRAMING.PLAYER_Z);
      // Screen-wrap ghost: duplicate player near opposite edge when close.
      this.player.rotation.z = -state.player.vx * 0.0006;
      this.playerSquash = Math.max(0, this.playerSquash - dt * 6);
      const squash = this.settings.reducedMotion ? 0 : this.playerSquash;
      this.player.scale.set(1 + squash * 0.25, 1 - squash * 0.3, 1);
      this.syncViews(state);
    }

    // Particles
    for (const pt of this.particlePool) {
      if (!pt.userData.active) continue;
      pt.userData.life -= dt;
      if (pt.userData.life <= 0) { pt.userData.active = false; pt.visible = false; continue; }
      pt.position.x += pt.userData.vx * dt;
      pt.position.y += pt.userData.vy * dt;
      pt.userData.vy -= 300 * dt;
      pt.material.opacity = Math.min(0.9, pt.userData.life * 2);
    }

    // Clouds drift (deterministic phases; cosmetic only).
    if (this.clouds && !this.settings.reducedMotion) {
      const m = new THREE.Matrix4();
      for (let i = 0; i < this.cloudData.length; i++) {
        const d = this.cloudData[i];
        const x = d.x + Math.sin(this.time * 0.05 * d.speed + d.phase) * 60;
        m.makeScale(d.s, d.s * 0.45, d.s * 0.7);
        m.setPosition(x, d.y + this.camY * 0.85, d.z);
        this.clouds.setMatrixAt(i, m);
      }
      this.clouds.instanceMatrix.needsUpdate = true;
    }

    // Camera: critically damped spring toward the sim's camera floor
    // (position+velocity state, never cumulative per-frame lerp).
    if (state) {
      const target = state.camY + FRAMING.CAM_LOOK_AHEAD;
      const omega = 6;
      this.camVel += (-omega * omega * (this.camY - target) - 2 * omega * this.camVel) * dt;
      this.camY += this.camVel * dt;
    }
    this.shake = Math.max(0, this.shake - dt * 26);
    const shakeX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    this.camera.position.set(WORLD_WIDTH / 2 + shakeX, this.camY + shakeY, this.camZ);
    this.camera.lookAt(WORLD_WIDTH / 2 + shakeX, this.camY + shakeY, 0);
    if (this.sky) this.sky.position.set(WORLD_WIDTH / 2, this.camY, 0);

    this.renderer.render(this.scene, this.camera);
  }

  /** Concise navigable text mirror of the board for screen readers. */
  static boardMirror(state) {
    if (!state) return '';
    if (state.terminal) return `Run over: ${state.terminal.reason}. Altitude ${state.score.altitude}.`;
    const above = state.platforms
      .filter(p => p.alive && p.y > state.player.y + 20 && p.y < state.player.y + 400)
      .sort((a, b) => a.y - b.y)
      .slice(0, 3)
      .map(p => {
        const side = p.x < state.player.x - 30 ? 'left' : p.x > state.player.x + 30 ? 'right' : 'above';
        const names = { bud: 'leaf pad', drift: 'moving leaf', crumb: 'brittle petal', spring: 'spring blossom', wisp: 'wisp pad', thorn: 'THORN hazard' };
        return `${names[p.type] || p.type} ${side}`;
      });
    return `Altitude ${state.score.altitude}, chain ${state.chain}. Next: ${above.join(', ') || 'none in range'}.`;
  }

  dispose() {
    if (!this.ok) return;
    this.ok = false;
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.map) m.map.dispose(); m.dispose(); }
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
