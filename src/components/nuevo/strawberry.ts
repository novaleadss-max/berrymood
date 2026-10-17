/* =============================================================================
   FRESA 3D (procedural, sin modelo .glb)

   Cuerpo: un torno (LatheGeometry) con el perfil de una fresa, textura y relieve
   pintados en un canvas (hoyuelos de las semillas, hombros más claros).
   Semillas: instancias reales colocadas dentro de cada hoyuelo.
   Hojas: 8 sépalos doblados a mano sobre los hombros + tallo.

   Un solo canvas fijo dibuja la fresa protagonista y la lluvia de fresas
   (sorpresa). Solo se renderiza cuando hay algo en pantalla.

   Coordenadas de `state`: x / y como fracción de la pantalla (-0.5…0.5, 0 = centro),
   s = alto de la fresa como fracción del alto de la pantalla.
   ========================================================================== */

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { FRESA_3D } from "./config";

const BERRY_HEIGHT = 1.9; // unidades del perfil (punta → hombros)
const FOV = 30;
const CAM_Z = 6;

// Perfil (radio, altura): de la punta (abajo) a la corona (arriba).
const PROFILE: [number, number][] = [
  [0.0, -1.06], [0.1, -1.0], [0.22, -0.88], [0.35, -0.71], [0.47, -0.5], [0.58, -0.27],
  [0.67, -0.03], [0.72, 0.19], [0.735, 0.37], [0.7, 0.53], [0.6, 0.67], [0.45, 0.76],
  [0.28, 0.81], [0.12, 0.83], [0.0, 0.82],
];

type Seed = { u: number; v: number };

function buildProfile() {
  const curve = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
  const pts = curve.getSpacedPoints(70);
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  return pts;
}

/** Radio/altura/tangente a lo largo del perfil, con v continuo (0 punta, 1 corona). */
function sampler(pts: THREE.Vector2[]) {
  return (v: number) => {
    const f = Math.min(Math.max(v, 0), 1) * (pts.length - 1);
    const i = Math.min(Math.floor(f), pts.length - 2);
    const t = f - i;
    const a = pts[i];
    const b = pts[i + 1];
    return {
      r: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      dr: b.x - a.x,
      dy: b.y - a.y,
    };
  };
}

/** Semillas en filas, con la misma separación aunque el radio cambie. */
function placeSeeds(at: ReturnType<typeof sampler>, count: number): Seed[] {
  const seeds: Seed[] = [];
  const rows = Math.round(Math.sqrt(count) * 1.05);
  let total = 0;
  const rowR: number[] = [];
  for (let k = 0; k < rows; k++) {
    const v = 0.07 + (k / (rows - 1)) * 0.72; // sin semillas en la punta ni bajo las hojas
    rowR.push(at(v).r);
    total += at(v).r;
  }
  for (let k = 0; k < rows; k++) {
    const v = 0.07 + (k / (rows - 1)) * 0.72;
    const n = Math.max(4, Math.round((rowR[k] / total) * count));
    const offset = (k % 2) * 0.5;
    for (let j = 0; j < n; j++) {
      const jitter = Math.sin(k * 12.9898 + j * 78.233) * 0.22;
      seeds.push({ u: (j + offset + jitter) / n, v: v + Math.sin(j * 4.1 + k * 1.7) * 0.012 });
    }
  }
  return seeds;
}

/** Textura de color y mapa de relieve pintados a mano en canvas. */
function paintMaps(seeds: Seed[], at: ReturnType<typeof sampler>, size: number) {
  const W = size;
  const H = size / 2;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return [c, c.getContext("2d")!] as const;
  };
  const [colorC, cx] = mk();
  const [bumpC, bx] = mk();

  // Rojo base con la punta un poco más oscura y los hombros aclarando hacia la corona.
  const g = cx.createLinearGradient(0, H, 0, 0); // canvas y=0 es v=1 (flipY)
  g.addColorStop(0, "#8a0710");
  g.addColorStop(0.3, "#b40f19");
  g.addColorStop(0.72, "#c8141e");
  g.addColorStop(0.9, "#cf2f2a");
  g.addColorStop(1, "#d9584a");
  cx.fillStyle = g;
  cx.fillRect(0, 0, W, H);

  // Manchas suaves para que no se vea plástico.
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.9 + H * 0.05;
    const r = 6 + Math.random() * 28;
    cx.fillStyle = `rgba(${Math.random() < 0.5 ? "120,0,10" : "255,90,70"},${0.03 + Math.random() * 0.05})`;
    cx.beginPath();
    cx.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
    cx.fill();
  }

  bx.fillStyle = "rgb(150,150,150)";
  bx.fillRect(0, 0, W, H);

  const spacingU = 0.034; // ancho del hoyuelo en unidades del mundo
  for (const s of seeds) {
    const { r } = at(s.v);
    const du = (spacingU / (Math.PI * 2 * Math.max(r, 0.08))) * W * 0.55;
    const dv = (spacingU / 2.4) * H * 0.95;
    const x = s.u * W;
    const y = (1 - s.v) * H;
    for (const ox of [-W, 0, W]) {
      // hoyuelo oscuro con borde claro
      const rg = bx.createRadialGradient(x + ox, y, 0, x + ox, y, Math.max(du, dv));
      rg.addColorStop(0, "rgb(40,40,40)");
      rg.addColorStop(0.65, "rgb(105,105,105)");
      rg.addColorStop(0.9, "rgb(185,185,185)");
      rg.addColorStop(1, "rgba(150,150,150,0)");
      bx.fillStyle = rg;
      bx.beginPath();
      bx.ellipse(x + ox, y, du, dv, 0, 0, Math.PI * 2);
      bx.fill();

      cx.fillStyle = "rgba(70,0,6,0.3)";
      cx.beginPath();
      cx.ellipse(x + ox, y, du * 0.7, dv * 0.7, 0, 0, Math.PI * 2);
      cx.fill();
    }
  }

  const color = new THREE.CanvasTexture(colorC);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = THREE.RepeatWrapping;
  color.anisotropy = 4;
  const bump = new THREE.CanvasTexture(bumpC);
  bump.wrapS = THREE.RepeatWrapping;
  return { color, bump };
}

/** Altura de la superficie superior (hombros) para un radio dado. */
function shoulder(pts: THREE.Vector2[]) {
  let iMax = 0;
  pts.forEach((p, i) => {
    if (p.x > pts[iMax].x) iMax = i;
  });
  const top = pts.slice(iMax); // radio decreciente hacia la corona
  return (r: number) => {
    if (r >= top[0].x) return top[0].y;
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i];
      const b = top[i + 1];
      if (r <= a.x && r >= b.x) return a.y + ((b.y - a.y) * (a.x - r)) / Math.max(1e-6, a.x - b.x);
    }
    return top[top.length - 1].y;
  };
}

/** Un sépalo: hoja recostada sobre el hombro, con la punta un poco levantada. */
function sepal(length: number, width: number, angle: number, surfaceY: (r: number) => number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.18, 0);
  shape.bezierCurveTo(-width * 0.9, length * 0.25, -width * 0.55, length * 0.75, 0, length);
  shape.bezierCurveTo(width * 0.55, length * 0.75, width * 0.9, length * 0.25, width * 0.18, 0);
  shape.lineTo(-width * 0.18, 0);
  const geo = new THREE.ShapeGeometry(shape, 16);
  const pos = geo.attributes.position;
  const R = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  const T = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
  for (let i = 0; i < pos.count; i++) {
    const w = pos.getX(i);
    const s = pos.getY(i) / length; // 0 base → 1 punta
    const r = 0.03 + s * length * 0.92;
    const lift = 0.022 + Math.pow(s, 2.4) * 0.09 + Math.abs(w) * 0.25; // bordes y punta despegados
    const p = R.clone().multiplyScalar(r).addScaledVector(T, w);
    p.y = surfaceY(Math.min(r, 0.72)) + lift + Math.sin(s * 9 + angle * 5) * 0.006;
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildCalyx(surfaceY: (r: number) => number, topY: number) {
  const parts: THREE.BufferGeometry[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.sin(i * 2.3) * 0.16;
    parts.push(sepal(0.46 + Math.sin(i * 1.7) * 0.09, 0.15 + Math.cos(i * 2.1) * 0.03, a, surfaceY));
  }
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, topY - 0.02, 0),
    new THREE.Vector3(0.01, topY + 0.1, 0.01),
    new THREE.Vector3(0.05, topY + 0.22, 0.04),
  ]);
  parts.push(new THREE.TubeGeometry(stemCurve, 10, 0.03, 8, false));
  const merged = mergeGeometries(
    parts.map((p) => (p.index ? p.toNonIndexed() : p)).map((p) => {
      p.deleteAttribute("uv");
      return p;
    }),
  );
  return merged!;
}

export class BerryScene {
  /** Lo anima el scroll (GSAP). */
  state = { x: 0, y: 0, s: 0.5, spin: 0, tilt: 0, opacity: 0 };
  /** Entrada inicial (0→1), aparte del scroll para que no se peleen. */
  intro = { p: 0 };

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private berry = new THREE.Group();
  private mats: THREE.Material[] = [];
  private pointer = { x: 0, y: 0 };
  private look = { x: 0, y: 0 };
  private clock = 0;
  private baseSpin = 0;
  private wasDrawn = false;
  private reduced: boolean;
  /** Sin GPU (3D por software) o equipo lento: sin flotar y solo se dibuja cuando algo cambia. */
  private lowPower = false;
  private slowFrames = 0;
  private lastSig = "";

  private bodyGeo: THREE.BufferGeometry;
  private calyxGeo: THREE.BufferGeometry;
  private bodyMat: THREE.MeshStandardMaterial;
  private leafMat: THREE.MeshStandardMaterial;
  private rainBody?: THREE.InstancedMesh;
  private rainLeaf?: THREE.InstancedMesh;
  private drops: { p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; w: THREE.Vector3; s: number }[] = [];
  private dummy = new THREE.Object3D();

  constructor(
    private canvas: HTMLCanvasElement,
    opts: { mobile: boolean; reduced: boolean },
  ) {
    this.reduced = opts.reduced;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.mobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.6 : 2));
    const gl = this.renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    const forceGpu = (window as { __BM_FORCE_GPU?: boolean }).__BM_FORCE_GPU; // solo para generar la imagen de respaldo
    if (!forceGpu && /swiftshader|llvmpipe|software|basic render/i.test(gpu)) this.goLowPower();
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    this.camera.position.set(0, 0, CAM_Z);

    if (!this.lowPower) {
      // Reflejos de estudio (lo más caro de preparar: se omite sin GPU).
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environmentIntensity = 0.7;
      pmrem.dispose();
    } else {
      this.scene.add(new THREE.HemisphereLight("#ffe9d6", "#2a1208", 1.6));
    }

    const key = new THREE.DirectionalLight("#ffe1c2", 2.4);
    key.position.set(-3, 4, 5);
    const rim = new THREE.DirectionalLight("#ff9b6b", 3.2);
    rim.position.set(4, 2, -4);
    const bounce = new THREE.DirectionalLight("#c2883a", 0.7);
    bounce.position.set(0, -4, 2);
    this.scene.add(key, rim, bounce);

    // Cuerpo
    const pts = buildProfile();
    const at = sampler(pts);
    this.bodyGeo = new THREE.LatheGeometry(pts, opts.mobile ? 56 : 84);
    const seeds = placeSeeds(at, opts.mobile ? FRESA_3D.semillas.movil : FRESA_3D.semillas.escritorio);
    const maps = paintMaps(seeds, at, opts.mobile ? 1024 : 2048);
    const BodyMaterial = this.lowPower ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
    this.bodyMat = new BodyMaterial({
      map: maps.color,
      bumpMap: maps.bump,
      bumpScale: 3,
      roughness: this.lowPower ? 0.32 : 0.45,
      ...(this.lowPower ? {} : { clearcoat: 0.85, clearcoatRoughness: 0.08 }),
    });
    this.berry.add(new THREE.Mesh(this.bodyGeo, this.bodyMat));

    // Semillas dentro de cada hoyuelo
    const seedGeo = new THREE.SphereGeometry(1, 8, 6);
    const seedMat = new THREE.MeshStandardMaterial({ color: "#d6a94c", roughness: 0.42 });
    const seedMesh = new THREE.InstancedMesh(seedGeo, seedMat, seeds.length);
    const up = new THREE.Vector3(0, 1, 0);
    seeds.forEach((s, i) => {
      const { r, y, dr, dy } = at(s.v);
      const phi = s.u * Math.PI * 2;
      const sin = Math.sin(phi);
      const cos = Math.cos(phi);
      const len = Math.hypot(dr, dy) || 1;
      const n = new THREE.Vector3((dy / len) * sin, -dr / len, (dy / len) * cos);
      const t = new THREE.Vector3((dr / len) * sin, dy / len, (dr / len) * cos);
      this.dummy.position.set(r * sin, y, r * cos).addScaledVector(n, -0.004);
      this.dummy.quaternion.setFromUnitVectors(up, t);
      this.dummy.scale.set(0.0085, 0.016, 0.007);
      this.dummy.updateMatrix();
      seedMesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.berry.add(seedMesh);

    // Hojas y tallo
    this.calyxGeo = buildCalyx(shoulder(pts), 0.82);
    this.leafMat = new THREE.MeshStandardMaterial({
      color: "#4f8a2a",
      roughness: 0.5,
      side: THREE.DoubleSide,
      emissive: "#13240a",
    });
    this.berry.add(new THREE.Mesh(this.calyxGeo, this.leafMat));

    this.mats = [this.bodyMat, seedMat, this.leafMat];
    this.berry.rotation.z = 0.12;
    this.scene.add(this.berry);

    this.resize();
  }

  private goLowPower() {
    this.lowPower = true;
    this.renderer.setPixelRatio(1);
    this.wasDrawn = false;
  }

  get worldH() {
    return 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.wasDrawn = false;
  }

  /** -1…1 en ambos ejes (mouse o giroscopio). */
  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /** Sorpresa: lluvia de fresas 3D. */
  rain(count: number) {
    if (!this.rainBody) {
      const bodyMat = this.bodyMat.clone();
      bodyMat.transparent = false;
      bodyMat.opacity = 1;
      const leafMat = this.leafMat.clone();
      this.rainBody = new THREE.InstancedMesh(this.bodyGeo, bodyMat, 160);
      this.rainLeaf = new THREE.InstancedMesh(this.calyxGeo, leafMat, 160);
      this.rainBody.count = 0;
      this.rainLeaf.count = 0;
      this.rainBody.frustumCulled = false;
      this.rainLeaf.frustumCulled = false;
      this.scene.add(this.rainBody, this.rainLeaf);
    }
    const H = this.worldH;
    const W = H * this.camera.aspect;
    for (let i = 0; i < count && this.drops.length < 160; i++) {
      this.drops.push({
        p: new THREE.Vector3((Math.random() - 0.5) * W, H * 0.62 + Math.random() * H * 1.4, -Math.random() * 3),
        v: new THREE.Vector3((Math.random() - 0.5) * 0.4, -Math.random() * 1.5, 0),
        r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        w: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
        s: 0.16 + Math.random() * 0.16,
      });
    }
  }

  get raining() {
    return this.drops.length > 0;
  }

  /** Se llama en cada cuadro desde gsap.ticker. */
  tick(dt: number) {
    const st = this.state;
    const intro = this.intro.p;
    const opacity = st.opacity * Math.min(1, intro * 1.4);
    const showBerry = opacity > 0.01;
    if (!showBerry && !this.raining) {
      if (this.wasDrawn) {
        this.renderer.clear();
        this.wasDrawn = false;
      }
      return;
    }
    this.clock += dt;

    // Si los cuadros tardan de más, pasamos a modo ligero (una sola vez).
    if (!this.lowPower) {
      this.slowFrames = dt > 0.034 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
      if (this.slowFrames > 45) {
        this.goLowPower();
        this.resize();
      }
    }
    const still = this.reduced || this.lowPower;

    // Seguir el mouse con amortiguación (se siente como resorte, no pegado).
    const k = 1 - Math.exp(-dt * 5);
    this.look.x += (this.pointer.x - this.look.x) * k;
    this.look.y += (this.pointer.y - this.look.y) * k;

    const H = this.worldH;
    const W = H * this.camera.aspect;
    const float = still ? 0 : Math.sin(this.clock * FRESA_3D.flotar.velocidad * Math.PI) * FRESA_3D.flotar.altura;
    if (!still) this.baseSpin += dt * FRESA_3D.giro * Math.PI * 2 * 0.25;

    // Modo ligero: si nada cambió desde el último dibujo, no se vuelve a dibujar.
    if (still && !this.raining) {
      const sig = [st.x, st.y, st.s, st.spin, st.tilt, opacity, intro, this.look.x, this.look.y]
        .map((v) => v.toFixed(3))
        .join();
      if (sig === this.lastSig && this.wasDrawn) return;
      this.lastSig = sig;
    }

    this.berry.visible = showBerry;
    const scale = ((st.s * H) / BERRY_HEIGHT) * (0.7 + 0.3 * intro);
    this.berry.scale.setScalar(scale);
    this.berry.position.set(
      st.x * W + this.look.x * 0.12,
      st.y * H + float * scale + this.look.y * 0.08 + (1 - intro) * H * 0.18,
      0,
    );
    this.berry.rotation.set(
      -this.look.y * FRESA_3D.inclinacion * 0.6 + st.tilt,
      this.baseSpin + st.spin + this.look.x * FRESA_3D.inclinacion - (1 - intro) * Math.PI * 1.5,
      0.12 - this.look.x * 0.12,
    );

    const transparent = opacity < 0.999;
    for (const m of this.mats) {
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
      m.opacity = opacity;
    }

    if (this.raining && this.rainBody && this.rainLeaf) {
      const g = -9.8 * 0.55;
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        d.v.y += g * dt;
        d.p.addScaledVector(d.v, dt);
        d.r.x += d.w.x * dt;
        d.r.y += d.w.y * dt;
        d.r.z += d.w.z * dt;
        if (d.p.y < -H * 0.8) this.drops.splice(i, 1);
      }
      this.drops.forEach((d, i) => {
        this.dummy.position.copy(d.p);
        this.dummy.rotation.copy(d.r);
        this.dummy.scale.setScalar(d.s);
        this.dummy.updateMatrix();
        this.rainBody!.setMatrixAt(i, this.dummy.matrix);
        this.rainLeaf!.setMatrixAt(i, this.dummy.matrix);
      });
      this.rainBody.count = this.drops.length;
      this.rainLeaf.count = this.drops.length;
      this.rainBody.instanceMatrix.needsUpdate = true;
      this.rainLeaf.instanceMatrix.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.wasDrawn = true;
  }

  dispose() {
    this.renderer.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
    });
  }
}
