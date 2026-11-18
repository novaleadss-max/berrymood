/* =============================================================================
   FRESA REAL EN 2.5D

   Una sola foto de la fresa (el cuadro más nítido del video de Gemini, recortada
   y limpiada a doble resolución) + un mapa de relieve. En la tarjeta gráfica la
   foto se vuelve una superficie con volumen: al girar tiene perspectiva real,
   las hojas tapan al cuerpo y un brillo de estudio se desliza sobre la piel.
   Al caer, la fresa rueda sobre sí misma.

     /public/nuevo/fresa-real/fresa.webp     computadora (842×1119, con transparencia)
     /public/nuevo/fresa-real/fresa-m.webp   celular (560×744)
     /public/nuevo/fresa-real/relieve.png    relieve (blanco = más cerca)

   El canvas mide solo lo que la fresa y se mueve con transform. Sin WebGL se
   dibuja la misma foto en 2D. Ajustes en FRESA_REAL (config.ts).
   ========================================================================== */

import gsap from "gsap";
import { FRESA_REAL } from "./config";

const VS = `
attribute vec2 aPos;    // posición en la foto (-0.5…0.5)
attribute vec2 aUv;
attribute float aDepth; // 0…1
attribute vec3 aNormal;
uniform mat3 uRot;
uniform float uAspect;  // ancho/alto de la foto
uniform float uRelief;
uniform float uFit;     // escala para que quepa al girar
varying vec2 vUv;
varying vec3 vN;
varying vec3 vN0;
void main() {
  vec3 p = vec3(aPos.x * uAspect, aPos.y, aDepth * uRelief);
  vec3 r = uRot * p;
  float w = 1.0 - r.z * 0.28;          // perspectiva
  gl_Position = vec4(r.x * uFit / w, r.y * uFit / w, -r.z * 0.5, 1.0);
  vUv = aUv;
  vN = uRot * aNormal;
  vN0 = aNormal;
}`;

const FS = `
precision mediump float;
uniform sampler2D uTex;
uniform vec3 uLight;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vN0;
void main() {
  vec4 c = texture2D(uTex, vUv);
  if (c.a < 0.01) discard;
  vec3 n = normalize(vN);
  // La foto ya trae su luz: solo se suma la diferencia al girar (en reposo se ve igual).
  float shade = 1.0 + 0.55 * (dot(n, uLight) - dot(normalize(vN0), uLight));
  // Brillo de estudio que se desliza sobre la piel roja (no sobre las hojas).
  vec3 h = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float red = smoothstep(0.05, 0.25, c.r - c.g);
  float spec = pow(max(dot(n, h), 0.0), 48.0) * 0.3 * red;
  vec3 col = c.rgb * clamp(shade, 0.7, 1.25) + spec;
  gl_FragColor = vec4(col * c.a, c.a);
}`;

type GL = WebGLRenderingContext;

function compile(gl: GL, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** ¿Se dibuja por software (sin GPU)? Entonces la fresa no se balancea sola: ahorra procesador. */
function softwareGL(gl: GL) {
  if ((window as { __BM_FORCE_GPU?: boolean }).__BM_FORCE_GPU) return false; // solo para pruebas
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  return /swiftshader|llvmpipe|software|basic render/i.test(name);
}

/** Multiplica matrices 3×3 en orden de columnas (como GLSL). */
function mul3(a: number[], b: number[]) {
  const o = new Array(9).fill(0);
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) o[c * 3 + r] += a[i * 3 + r] * b[c * 3 + i];
  return o;
}

/** La foto ocupa 1/BOX de la caja cuadrada del canvas (deja aire para girar y rodar). */
const BOX = 1.18;

export class BerryReal {
  /** Lo anima el scroll: x / y como fracción de la pantalla, s = alto del cuerpo. */
  state = { x: 0, y: 0, s: 0.5, spin: 0, tilt: 0, opacity: 0 };
  /** Entrada inicial (0→1). */
  intro = { p: 0 };

  private canvas: HTMLCanvasElement;
  private gl: GL | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private img: HTMLImageElement | null = null;
  private aspect = 0.75;
  private count = 0;
  private indexType = 0;
  private uRot: WebGLUniformLocation | null = null;
  private uFit: WebGLUniformLocation | null = null;
  private pointer = { x: 0, y: 0 };
  private look = { x: 0, y: 0 };
  private clock = 0;
  private dpr = 1;
  private last = "";
  private visible = false;
  private still: boolean;
  private mobile: boolean;

  constructor(
    private layer: HTMLElement,
    opts: { mobile: boolean; reduced: boolean },
  ) {
    this.mobile = opts.mobile;
    this.still = opts.reduced;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "bm-berry-canvas2d";
    layer.append(this.canvas);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }

  /** Carga la foto y el relieve (lo espera el preloader). */
  async loadFirst() {
    const src = this.mobile ? "/nuevo/fresa-real/fresa-m.webp" : "/nuevo/fresa-real/fresa.webp";
    const [img, depth] = await Promise.all([loadImage(src), loadImage("/nuevo/fresa-real/relieve.png")]);
    this.img = img;
    this.aspect = img.naturalWidth / img.naturalHeight;
    const gl = this.canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
    if (gl && !softwareGL(gl) && this.setupGL(gl, img, depth)) {
      this.gl = gl;
    } else {
      // Sin GPU (o sin WebGL): la misma foto en 2D, ligera para el procesador.
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      const flat = document.createElement("canvas");
      flat.className = this.canvas.className;
      this.canvas.replaceWith(flat);
      this.canvas = flat;
      this.ctx2d = flat.getContext("2d");
      this.still = true;
    }
    this.last = "";
  }

  private setupGL(gl: GL, img: HTMLImageElement, depthImg: HTMLImageElement) {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    // Relieve → profundidad y normal por vértice (se calcula una sola vez).
    const dc = document.createElement("canvas");
    dc.width = depthImg.naturalWidth;
    dc.height = depthImg.naturalHeight;
    const dctx = dc.getContext("2d")!;
    dctx.drawImage(depthImg, 0, 0);
    const dd = dctx.getImageData(0, 0, dc.width, dc.height).data;
    const px = (x: number, y: number) => dd[(y * dc.width + x) * 4] / 255;
    // Lectura interpolada (bilineal): sin escalones en la orilla.
    const sample = (u: number, v: number) => {
      const fx = Math.min(dc.width - 1, Math.max(0, u * (dc.width - 1)));
      const fy = Math.min(dc.height - 1, Math.max(0, v * (dc.height - 1)));
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const x1 = Math.min(x0 + 1, dc.width - 1), y1 = Math.min(y0 + 1, dc.height - 1);
      const tx = fx - x0, ty = fy - y0;
      const top = px(x0, y0) * (1 - tx) + px(x1, y0) * tx;
      const bot = px(x0, y1) * (1 - tx) + px(x1, y1) * tx;
      return top * (1 - ty) + bot * ty;
    };

    const relief = FRESA_REAL.relieve;
    const NX = this.mobile ? 56 : 84;
    const NY = Math.round(NX / this.aspect);
    const pos: number[] = [];
    const uv: number[] = [];
    const dep: number[] = [];
    const nor: number[] = [];
    const e = 1.5 / NX;
    for (let j = 0; j <= NY; j++) {
      for (let i = 0; i <= NX; i++) {
        const u = i / NX;
        const v = j / NY;
        pos.push(u - 0.5, 0.5 - v);
        uv.push(u, v);
        dep.push(sample(u, v));
        const nx = -((sample(u + e, v) - sample(u - e, v)) * relief) / (2 * e * this.aspect);
        const ny = -((sample(u, v - e) - sample(u, v + e)) * relief) / (2 * e);
        const l = Math.hypot(nx, ny, 1);
        nor.push(nx / l, ny / l, 1 / l);
      }
    }
    const idx: number[] = [];
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const a = j * (NX + 1) + i;
        idx.push(a, a + 1, a + NX + 1, a + 1, a + NX + 2, a + NX + 1);
      }
    }
    this.count = idx.length;
    const attr = (name: string, data: number[], size: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    attr("aPos", pos, 2);
    attr("aUv", uv, 2);
    attr("aDepth", dep, 1);
    attr("aNormal", nor, 3);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    if ((NX + 1) * (NY + 1) > 65535) return false; // la malla siempre cabe en 16 bits
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    this.indexType = gl.UNSIGNED_SHORT;

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.uRot = gl.getUniformLocation(prog, "uRot");
    this.uFit = gl.getUniformLocation(prog, "uFit");
    gl.uniform1f(gl.getUniformLocation(prog, "uAspect"), this.aspect);
    gl.uniform1f(gl.getUniformLocation(prog, "uRelief"), relief);
    gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);
    const L = [-0.45, 0.55, 0.7];
    const ll = Math.hypot(L[0], L[1], L[2]);
    gl.uniform3f(gl.getUniformLocation(prog, "uLight"), L[0] / ll, L[1] / ll, L[2] / ll);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /** Sorpresa: lluvia de fresas reales. */
  rain(count: number) {
    if (!this.img) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let i = 0; i < count; i++) {
      const d = new Image();
      d.src = this.img.src;
      d.alt = "";
      d.className = "bm-berry-drop";
      this.layer.append(d);
      const size = 0.09 + Math.random() * 0.09;
      gsap.fromTo(
        d,
        { x: Math.random() * vw - vh * size * 0.4, y: -vh * (0.25 + Math.random() * 0.7), rotation: (Math.random() - 0.5) * 120, height: vh * size },
        {
          y: vh * 1.15,
          rotation: `+=${(Math.random() - 0.5) * 300}`,
          duration: 1.5 + Math.random() * 1.1,
          ease: "power1.in", // caída con gravedad
          delay: Math.random() * 0.6,
          onComplete: () => d.remove(),
        },
      );
    }
  }

  tick(dt: number) {
    if (!this.img) return;
    const st = this.state;
    const k = 1 - Math.exp(-dt * 4);
    this.look.x += (this.pointer.x - this.look.x) * k;
    this.look.y += (this.pointer.y - this.look.y) * k;
    if (!this.still) this.clock += dt;

    const intro = this.intro.p;
    const opacity = st.opacity * Math.min(1, intro * 1.4);
    if (opacity < 0.005) {
      if (this.visible) {
        this.canvas.style.opacity = "0";
        this.visible = false;
      }
      return;
    }
    this.visible = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const R = FRESA_REAL;
    const t = this.clock;
    // Giro (yaw) y cabeceo (pitch) con perspectiva; roll = rodar sobre sí misma.
    const yaw =
      this.look.x * R.giroMouse +
      Math.sin(t * R.balanceo.velocidad) * R.balanceo.giro +
      Math.sin(st.spin * 0.5) * R.giroScroll -
      (1 - intro) * 0.6;
    const pitch = -this.look.y * R.giroMouse * 0.6 + st.tilt * 0.35 + Math.sin(t * R.balanceo.velocidad * 0.7) * 0.04;
    const roll = st.spin * R.rodar + Math.sin(t * 0.6) * 0.03 - (1 - intro) * 0.25;
    const float = Math.sin(t * 1.1) * 0.01;

    const h = st.s * R.altoVsCuerpo * (0.7 + 0.3 * intro) * vh; // alto de la foto en pantalla
    const side = h * BOX;
    const x = vw / 2 + st.x * vw + this.look.x * 14;
    const y = vh / 2 - (st.y + float + (1 - intro) * 0.18) * vh - this.look.y * 10;

    this.canvas.style.opacity = String(opacity);
    this.canvas.style.transform = `translate3d(${x - side / 2}px, ${y - side / 2}px, 0)`;
    this.canvas.style.width = `${side}px`;
    this.canvas.style.height = `${side}px`;
    const bs = Math.round(side * this.dpr);
    if (this.canvas.width === 0 || Math.abs(bs - this.canvas.width) > this.canvas.width * 0.04) {
      this.canvas.width = bs;
      this.canvas.height = bs;
      this.last = "";
    }

    const key = `${yaw.toFixed(4)}|${pitch.toFixed(4)}|${roll.toFixed(4)}|${this.canvas.width}`;
    if (key === this.last) return;
    this.last = key;
    if (this.gl) this.drawGL(yaw, pitch, roll);
    else this.draw2D(roll);
  }

  private drawGL(yaw: number, pitch: number, roll: number) {
    const gl = this.gl!;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const cz = Math.cos(roll), sz = Math.sin(roll);
    const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];
    const rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx];
    const rz = [cz, sz, 0, -sz, cz, 0, 0, 0, 1];
    gl.uniformMatrix3fv(this.uRot, false, new Float32Array(mul3(rz, mul3(rx, ry))));
    gl.uniform1f(this.uFit, 2 / BOX);
    gl.drawElements(gl.TRIANGLES, this.count, this.indexType, 0);
  }

  private draw2D(roll: number) {
    const c = this.ctx2d;
    const img = this.img;
    if (!c || !img) return;
    const W = this.canvas.width;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, W);
    const h = W / BOX;
    const w = h * this.aspect;
    c.setTransform(1, 0, 0, 1, W / 2, W / 2);
    c.rotate(-roll);
    c.imageSmoothingQuality = "high";
    c.drawImage(img, -w / 2, -h / 2, w, h);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = 0;
    this.last = "";
  }

  dispose() {
    this.gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this.layer.replaceChildren();
  }
}
