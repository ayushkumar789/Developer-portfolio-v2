/* Hero signature moment: wireframe sphere orbited by code-token sprites.
   Rotation eases toward the pointer; gentle idle drift otherwise.
   Degrades: reduced motion → static frame; no WebGL → CSS glyph fallback;
   small screens → fewer tokens, smaller canvas. */
import * as THREE from "three";

// make sure JetBrains Mono is available before rasterizing token sprites
await document.fonts.ready.catch(() => {});

const mount = document.getElementById("hero-3d");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.matchMedia("(max-width: 960px)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (e) {
  mount.classList.add("no-webgl");
  throw e;
}

const CYAN = new THREE.Color("#53C8FF");
const AMBER = new THREE.Color("#FFB454");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 5.4;

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
mount.prepend(renderer.domElement);

const group = new THREE.Group();
scene.add(group);

/* wireframe icosahedron shell */
const shellGeo = new THREE.IcosahedronGeometry(1.75, 1);
const shell = new THREE.LineSegments(
  new THREE.WireframeGeometry(shellGeo),
  new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22 })
);
group.add(shell);

/* inner, slightly rotated second shell for depth */
const inner = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.15, 0)),
  new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.14 })
);
inner.rotation.set(0.6, 0.4, 0.2);
group.add(inner);

/* vertex points */
const pts = new THREE.Points(
  shellGeo,
  new THREE.PointsMaterial({ color: CYAN, size: 0.045, transparent: true, opacity: 0.85 })
);
group.add(pts);

/* code-token sprites orbiting on the sphere surface */
const TOKENS = small
  ? ["</>", "{ }", "=>", "async", "git push"]
  : ["</>", "{ }", "=>", "async", "await", "git push", "npm run dev", "SELECT *", "useEffect", "php artisan", "@Bean", "pip install"];

function tokenSprite(text, accent) {
  const pad = 18, fs = 44;
  const cv = document.createElement("canvas");
  const c = cv.getContext("2d");
  c.font = `500 ${fs}px "JetBrains Mono", monospace`;
  cv.width = Math.ceil(c.measureText(text).width) + pad * 2;
  cv.height = fs + pad * 2;
  const c2 = cv.getContext("2d");
  c2.font = `500 ${fs}px "JetBrains Mono", monospace`;
  c2.textBaseline = "middle";
  c2.fillStyle = accent ? "#FFB454" : "#53C8FF";
  c2.fillText(text, pad, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0.9, depthTest: false,
  }));
  const scale = 0.0032;
  sp.scale.set(cv.width * scale, cv.height * scale, 1);
  return sp;
}

const orbiters = [];
TOKENS.forEach((t, i) => {
  const sp = tokenSprite(t, i % 4 === 0);
  // distribute on sphere via golden-angle spiral
  const phi = Math.acos(1 - (2 * (i + 0.5)) / TOKENS.length);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const r = 2.0;
  sp.userData = { phi, theta, r, speed: 0.05 + (i % 3) * 0.02 };
  orbiters.push(sp);
  group.add(sp);
});

function placeOrbiter(sp, t) {
  const u = sp.userData;
  const th = u.theta + t * u.speed;
  sp.position.set(
    u.r * Math.sin(u.phi) * Math.cos(th),
    u.r * Math.cos(u.phi),
    u.r * Math.sin(u.phi) * Math.sin(th)
  );
  // fade tokens on the far side of the sphere
  sp.material.opacity = 0.18 + 0.55 * ((sp.position.z + u.r) / (2 * u.r));
}

/* sizing */
function resize() {
  const w = mount.clientWidth, h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

/* pointer-follow rotation with lerp */
const target = { x: 0, y: 0 };
addEventListener("mousemove", (e) => {
  target.x = (e.clientX / innerWidth - 0.5) * 0.7;
  target.y = (e.clientY / innerHeight - 0.5) * 0.5;
}, { passive: true });

const clock = new THREE.Clock();
let running = true;

function frame() {
  const t = clock.getElapsedTime();
  group.rotation.y += ((t * 0.06 + target.x) - group.rotation.y) * 0.045;
  group.rotation.x += (target.y - group.rotation.x) * 0.045;
  inner.rotation.y = -t * 0.12;
  group.position.y = Math.sin(t * 0.7) * 0.07; // idle float
  orbiters.forEach((sp) => placeOrbiter(sp, t));
  renderer.render(scene, camera);
}

function loop() {
  if (!running) return;
  frame();
  requestAnimationFrame(loop);
}

/* only animate while the hero is on screen */
new IntersectionObserver(([en]) => {
  running = en.isIntersecting && !reduced;
  if (running) loop();
}).observe(mount);

if (reduced) {
  // static, composed frame — no motion
  group.rotation.set(0.25, 0.5, 0);
  orbiters.forEach((sp) => placeOrbiter(sp, 4));
  renderer.render(scene, camera);
} else {
  loop();
}
