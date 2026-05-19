/**
 * Circular Gallery – Vanilla JS port of the React OGL component.
 * Loaded as an ES module; self-initialises when its container is visible.
 */
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "https://cdn.jsdelivr.net/npm/ogl/+esm";

/* ── configuration ─────────────────────────────────── */
const GALLERY_ITEMS = [
  { image: "photos/1.jpg", text: "" },
  { image: "photos/2.jpg", text: "" },
  { image: "photos/3.jpg", text: "" },
  { image: "photos/4.jpg", text: "" },
  { image: "photos/5.jpg", text: "" },
];

const CONFIG = {
  bend: 3,
  borderRadius: 0.05,
  scrollSpeed: 2,
  scrollEase: 0.05,
  textColor: "#243B35",
  font: '600 24px "Playfair Display", serif',
};

/* ── helpers ────────────────────────────────────────── */
function debounce(fn, wait) {
  let t;
  return function (...a) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, a), wait);
  };
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function autoBind(inst) {
  const proto = Object.getPrototypeOf(inst);
  Object.getOwnPropertyNames(proto).forEach((k) => {
    if (k !== "constructor" && typeof inst[k] === "function")
      inst[k] = inst[k].bind(inst);
  });
}
function createTextTexture(gl, text, font, color) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = font;
  const m = ctx.measureText(text);
  const tw = Math.ceil(m.width);
  const sizeMatch = font.match(/(\d+)px/);
  const fs = sizeMatch ? parseInt(sizeMatch[1], 10) : 24;
  const th = Math.ceil(fs * 1.2);
  c.width = tw + 20;
  c.height = th + 20;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillText(text, c.width / 2, c.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = c;
  return { texture, width: c.width, height: c.height };
}

/* ── Title ──────────────────────────────────────────── */
class Title {
  constructor({ gl, plane, renderer, text, textColor, font }) {
    autoBind(this);
    Object.assign(this, { gl, plane, renderer, text, textColor, font });
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(
      this.gl, this.text, this.font, this.textColor
    );
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `
        precision highp float; uniform sampler2D tMap; varying vec2 vUv;
        void main(){vec4 c=texture2D(tMap,vUv);if(c.a<0.1)discard;gl_FragColor=c;}`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const th = this.plane.scale.y * 0.15;
    this.mesh.scale.set(th * aspect, th, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - th * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

/* ── Media ──────────────────────────────────────────── */
class Media {
  constructor(opts) {
    Object.assign(this, opts);
    this.extra = 0;
    this.widthTotal = 0;
    this.width = 0;
    this.x = 0;
    this.scale = 1;
    this.padding = 2;
    this.speed = 0;
    this.isBefore = false;
    this.isAfter = false;
    this.createShader();
    this.createMesh();
    if (this.text) this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        uniform float uTime; uniform float uSpeed;
        varying vec2 vUv;
        void main(){
          vUv=uv; vec3 p=position;
          p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }`,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes; uniform vec2 uPlaneSizes;
        uniform sampler2D tMap; uniform float uBorderRadius;
        varying vec2 vUv;
        float roundedBoxSDF(vec2 p,vec2 b,float r){
          vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;
        }
        void main(){
          vec2 ratio=vec2(
            min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),
            min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));
          vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);
          vec4 color=texture2D(tMap,uv);
          float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);
          float alpha=1.0-smoothstep(-0.002,0.002,d);
          gl_FragColor=vec4(color.rgb,alpha);
        }`,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl, plane: this.plane, renderer: this.renderer,
      text: this.text, textColor: this.textColor, font: this.font,
    });
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B = Math.abs(this.bend);
      const R = (H * H + B * B) / (2 * B);
      const eX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - eX * eX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(eX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(eX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const po = this.plane.scale.x / 2;
    const vo = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + po < -vo;
    this.isAfter = this.plane.position.x - po > vo;

    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

/* ── App ────────────────────────────────────────────── */
class CircularGalleryApp {
  constructor(container, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase }) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.isDown = false;
    this.start = 0;
    autoBind(this);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() { this.scene = new Transform(); }
  createGeometry() { this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 }); }

  createMedias(items, bend, textColor, borderRadius, font) {
    const list = items && items.length ? items : GALLERY_ITEMS;
    this.mediasImages = [...list, ...list];
    this.medias = this.mediasImages.map((d, i) =>
      new Media({
        geometry: this.planeGeometry, gl: this.gl, image: d.image, index: i,
        length: this.mediasImages.length, renderer: this.renderer, scene: this.scene,
        screen: this.screen, text: d.text, viewport: this.viewport, bend, textColor,
        borderRadius, font,
      })
    );
  }

  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    this.scroll.target = this.scroll.position + (this.start - x) * (this.scrollSpeed * 0.025);
  }
  onTouchUp() { this.isDown = false; this.onCheck(); }

  onWheel(e) {
    const d = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (d > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const w = this.medias[0].width;
    const idx = Math.round(Math.abs(this.scroll.target) / w);
    const item = w * idx;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const h = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: h * this.camera.aspect, height: h };
    if (this.medias) this.medias.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const dir = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) this.medias.forEach((m) => m.update(this.scroll, dir));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  }

  addEventListeners() {
    this._onResize = this.onResize;
    this._onWheel = this.onWheel;
    this._onDown = this.onTouchDown;
    this._onMove = this.onTouchMove;
    this._onUp = this.onTouchUp;
    window.addEventListener("resize", this._onResize);
    window.addEventListener("wheel", this._onWheel, { passive: true });
    this.container.addEventListener("mousedown", this._onDown);
    window.addEventListener("mousemove", this._onMove);
    window.addEventListener("mouseup", this._onUp);
    this.container.addEventListener("touchstart", this._onDown, { passive: true });
    window.addEventListener("touchmove", this._onMove, { passive: true });
    window.addEventListener("touchend", this._onUp);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("wheel", this._onWheel);
    this.container.removeEventListener("mousedown", this._onDown);
    window.removeEventListener("mousemove", this._onMove);
    window.removeEventListener("mouseup", this._onUp);
    this.container.removeEventListener("touchstart", this._onDown);
    window.removeEventListener("touchmove", this._onMove);
    window.removeEventListener("touchend", this._onUp);
    if (this.gl && this.gl.canvas.parentNode) this.gl.canvas.parentNode.removeChild(this.gl.canvas);
  }
}

/* ── Self-init: wait for container to become visible ── */
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("circular-gallery-container");
  if (!el) return;
  let app = null;
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      if (e.contentRect.width > 0 && e.contentRect.height > 0 && !app) {
        app = new CircularGalleryApp(el, {
          items: GALLERY_ITEMS,
          ...CONFIG,
        });
        ro.disconnect();
      }
    }
  });
  ro.observe(el);
});
