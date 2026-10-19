import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import type { MineProject } from "./projects";
import { journeyAt, nextStation, advanceSceneryTile } from "./journey";
import { clipDisplay } from "./fracture";

export type MineEngine = { advance: () => void; skip: () => void; jump: (index: number) => void; pause: (value: boolean) => void; motion: (reduced: boolean) => void; dispose: () => void };
type Events = { station: (index: number) => void; phase: (phase: string) => void; inspect: () => void; failed: () => void };
const smooth = (v: number) => { const t = THREE.MathUtils.clamp(v, 0, 1); return t * t * (3 - 2 * t); };

export function createMine(host: HTMLElement, events: Events, reduced: boolean, projects: MineProject[], initialStation = 0): MineEngine {
  if (!projects.length) throw new Error("The mine needs at least one project.");
// BEGIN APPROVED ASTRA ENVIRONMENT — b55744c; preserve visual fidelity.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#182327");
  scene.fog = new THREE.FogExp2("#253338", 0.026);
  const camera = new THREE.PerspectiveCamera(56, 1, 0.08, 90);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", "Crystal cave seen from inside a drill minecart. Use the controls to inspect projects or advance.");
  const textures: THREE.Texture[] = [];
  let disposed = false;
  let seed = 620;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const mat = (color: string, roughness = 0.9, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const stone = mat("#737976");
  const darkStone = mat("#48544e");
  const wood = mat("#60452d");
  const iron = mat("#444f50", 0.38, 0.72);
  const brass = mat("#b49158", 0.42, 0.65);
  const moss = mat("#596e36");
  const leafMat = new THREE.MeshStandardMaterial({ color: "#72894b", side: THREE.DoubleSide, roughness: 0.82 });
  const lampMat = new THREE.MeshBasicMaterial({ color: "#ffe2a0" });
  // Small original mineral texture. No external texture requests or asset licensing dependencies.
  const textureCanvas = document.createElement("canvas"); textureCanvas.width = textureCanvas.height = 256;
  const tc = textureCanvas.getContext("2d")!;
  const pixels = tc.createImageData(256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = 100 + random() * 85;
    pixels.data[i] = n; pixels.data[i + 1] = n; pixels.data[i + 2] = n; pixels.data[i + 3] = 255;
  }
  tc.putImageData(pixels, 0, 0);
  tc.strokeStyle = "#555"; tc.lineWidth = 2;
  for (let i = 0; i < 26; i++) { tc.beginPath(); tc.moveTo(random() * 256, 0); tc.bezierCurveTo(random() * 256, 80, random() * 256, 170, random() * 256, 256); tc.stroke(); }
  const grain = new THREE.CanvasTexture(textureCanvas); grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(2, 2); textures.push(grain);
  stone.bumpMap = grain; stone.bumpScale = 0.12; darkStone.bumpMap = grain; darkStone.bumpScale = 0.16; wood.bumpMap = grain; wood.bumpScale = 0.06;
  function mesh(g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o;
  }
  const cube = new THREE.BoxGeometry(1, 1, 1);
  function box(x: number, y: number, z: number, sx: number, sy: number, sz: number, m: THREE.Material, parent: THREE.Object3D = scene) {
    const o = mesh(cube, m, x, y, z, parent); o.scale.set(sx, sy, sz); return o;
  }
  const rockGeometry = mergeVertices(new THREE.IcosahedronGeometry(1, 4));
  const p = rockGeometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = 1 + 0.13 * Math.sin(x * 8 + y * 3) * Math.cos(z * 7) + 0.07 * Math.cos(y * 14 + z * 5);
    p.setXYZ(i, x * d, y * d, z * d);
  }
  rockGeometry.computeVertexNormals();
  stone.map = grain; darkStone.map = grain;
  function rock(x: number, y: number, z: number, sx: number, sy: number, sz: number, material = stone) {
    const o = mesh(rockGeometry, material, x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(random(), random() * 3, random() * 0.3); return o;
  }
  scene.add(new THREE.HemisphereLight("#c7dce1", "#625235", 1.6));
  const daylight = new THREE.DirectionalLight("#bbd6d9", 2.6); daylight.position.set(-5, 9, 6); scene.add(daylight);
  const backlight = new THREE.DirectionalLight("#deb58c", 1.2); backlight.position.set(3, 4, -30); scene.add(backlight);
  function light(color: string, intensity: number, distance: number, x: number, y: number, z: number) { const l = new THREE.PointLight(color, intensity, distance, 1.8); l.position.set(x, y, z); scene.add(l); return l; }
  // Authored bays: wide entrance, narrow stone threshold, then a second garden chamber.
  const bays = [8, 3, -2, -7, -12, -17, -22, -27, -32, -37];
  bays.forEach((z, bay) => {
    const width = bay === 3 || bay === 5 ? 4.8 : 6.5;
    for (const side of [-1, 1]) {
      rock(side * (width + 0.6), 2.5, z, 2.4, 4.4, 3.8, bay % 2 ? stone : darkStone);
      rock(side * (width - 0.25), 0.25, z + 1.8, 2.1, 1.25, 2.5);
      rock(side * (width - 0.5), 6.7, z - 1, 2.7, 1.5, 3.5);
    }
    rock(0.8 * Math.sin(bay), 7.8, z, 5.2, 1.7, 3.6, darkStone);
  });
  const floor = mesh(new THREE.PlaneGeometry(24, 65, 36, 90), darkStone, 0, -0.14, -14); floor.rotation.x = -Math.PI / 2;
  const fp = floor.geometry.attributes.position;
  for (let i = 0; i < fp.count; i++) fp.setZ(i, 0.08 * Math.sin(fp.getX(i) * 3) * Math.cos(fp.getY(i) * 2));
  floor.geometry.computeVertexNormals();
  // Stone strata and gravel collect beside the track, keeping the travel corridor clear.
  for (let i = 0; i < 125; i++) {
    const side = i % 2 ? 1 : -1; const z = 10 - random() * 51;
    const size = 0.12 + random() * 0.55;
    rock(side * (1.7 + random() * 4), size * 0.2, z, size * 1.5, size, size * 1.2, i % 4 ? stone : moss);
  }
  // Track, individual sleepers, rail heads and fastening plates.
  for (let z = 12; z > -43; z -= 1.15) {
    box(0, 0.02, z, 2.65, 0.18, 0.26, wood);
    for (const x of [-0.92, 0.92]) box(x, 0.16, z, 0.28, 0.045, 0.34, iron);
  }
  for (const x of [-0.92, 0.92]) { box(x, 0.18, -15, 0.085, 0.24, 58, iron); box(x, 0.31, -15, 0.16, 0.07, 58, iron); }
  // Timber supports are placed at thresholds, rather than repeated around every rock.
  for (const z of [-6.8, -15, -29]) {
    for (const x of [-4.6, 4.6]) {
      box(x, 2.6, z, 0.36, 5.2, 0.42, wood);
      const brace = box(x * 0.85, 4.8, z, 0.23, 1.7, 0.38, wood); brace.rotation.z = x > 0 ? -0.7 : 0.7;
      for (const y of [0.6, 4.4]) box(x, y, z + 0.23, 0.45, 0.2, 0.04, iron);
    }
    box(0, 5.25, z, 9.7, 0.45, 0.5, wood);
  }
  function lantern(x: number, y: number, z: number) {
    box(x, y + 0.65, z, 0.035, 1.2, 0.035, iron);
    mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.12, 8), brass, x, y + 0.28, z);
    mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 8), lampMat, x, y, z);
    mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.12, 8), iron, x, y - 0.26, z);
    for (const dx of [-0.16, 0.16]) box(x + dx, y, z + 0.05, 0.025, 0.5, 0.025, iron);
    light("#ffd29a", 22, 9, x, y, z);
  }
  lantern(-3.9, 3.8, -3); lantern(3.8, 3.3, -13); lantern(-3.7, 3.7, -27);
  // Purposefully composed mineral seams: amber at SAKIKO, lilac/sea-glass at Jellink.
  const crystalShaft = new THREE.CylinderGeometry(0.23, 0.28, 1.1, 6, 1);
  const crystalTip = new THREE.ConeGeometry(0.23, 0.4, 6); crystalTip.translate(0, 0.75, 0);
  const crystalGeo = mergeGeometries([crystalShaft, crystalTip])!;
  crystalShaft.dispose(); crystalTip.dispose();
  function cluster(x: number, y: number, z: number, color: string, scale: number) {
    const cm = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, metalness: 0.25, roughness: 0.22, flatShading: true });
    rock(x, y - 0.1, z, scale, scale * 0.45, scale * 0.8, darkStone);
    const placements = [[0, 0, 0, 1.5], [-0.45, -0.25, 0.12, 1], [0.38, -0.15, 0.1, 1.2], [0.15, -0.35, 0.5, 0.65], [-0.18, -0.2, -0.35, 0.9]];
    placements.forEach(([dx, dy, dz, s]) => {
      const c = mesh(crystalGeo, cm, x + dx * scale, y + (dy + s * 0.6) * scale, z + dz * scale);
      c.scale.setScalar(s * scale); c.rotation.z = -dx * 0.65; c.rotation.x = dz * 0.6;
    });
    light(color, 10 * scale, 6, x, y + scale, z);
  }
  cluster(-4.3, 0.5, -1, "#e5ac67", 1.5); cluster(4.4, 0.4, -6, "#8fc9c0", 1.15);
  cluster(4.6, 1, 4, "#c0b0d6", 1.4); cluster(-4.9, 1, -22, "#83c7c0", 1.7);
  cluster(4.2, 0.5, -25, "#b9a1cf", 1.7); cluster(-3.2, 0.3, -32, "#e7b67a", 0.9);
  cluster(-2.7, 0.15, -2.4, "#deb26e", 0.6); cluster(2.7, 0.15, -26, "#a8b8d2", 0.65);
  // Fern fronds with paired tapered leaflets, plus hanging vines following the stone.
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.22, 0.15, 0, 0.8); leafShape.quadraticCurveTo(-0.15, 0.25, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const foliage = new THREE.InstancedMesh(leafGeo, leafMat, 1600); let leaves = 0; const dummy = new THREE.Object3D();
  function leaf(x: number, y: number, z: number, rx: number, ry: number, rz: number, size: number) {
    dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, rz); dummy.scale.setScalar(size); dummy.updateMatrix(); foliage.setMatrixAt(leaves++, dummy.matrix);
  }
  for (const [x, z, s] of [[-3.7, 3, 1.4], [3.3, 0, 1.1], [-4, -5, 1], [4.4, -10, 1.3], [-3.3, -19, 1.6], [3.4, -21, 1.5], [-4, -27, 1.1], [4.5, -32, 1.3]]) {
    for (let frond = 0; frond < 7; frond++) {
      const angle = frond * 0.9;
      for (let n = 1; n < 9; n++) {
        const t = n / 9; const r = t * s;
        for (const side of [-1, 1]) leaf(x + Math.cos(angle) * r, 0.2 + Math.sin(t * 2.2) * s, z + Math.sin(angle) * r, -0.5, angle, side * (0.7 + t * 0.4), (1 - t * 0.65) * s * 0.65);
      }
    }
  }
  for (const [x, z, length] of [[-4.4, -1, 3], [4.5, -5, 2.8], [-3, -10, 1.8], [3.8, -19, 3], [-4.4, -25, 3.2]]) {
    const points = Array.from({ length: 15 }, (_, i) => new THREE.Vector3(x + Math.sin(i * 0.4) * 0.25, 6.5 - i / 14 * length, z + Math.sin(i * 0.3) * 0.2));
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.025, 4, false), moss, 0, 0, 0);
    points.forEach((v, i) => leaf(v.x, v.y, v.z, 0.15, i * 0.7, i % 2 ? 2.3 : -2.3, 0.65));
  }
  foliage.count = leaves; foliage.instanceMatrix.needsUpdate = true; scene.add(foliage);
  // Hanging limestone needles have broad eroded roots and irregular lengths.
  for (let i = 0; i < 35; i++) {
    const x = (random() - 0.5) * 10, z = 8 - random() * 48, h = 0.6 + random() * 1.5;
    const s = mesh(new THREE.ConeGeometry(0.24 + h * 0.12, h, 7), stone, x, 6.7 - h * 0.4, z); s.rotation.z = Math.PI + random() * 0.15;
  }
  // Batch immobile scenery by material; interactive walls and the cart remain independent.
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  for (const object of [...scene.children]) {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material)) continue;
    object.updateMatrix();
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrix); geometry.deleteAttribute("uv1");
    const list = batches.get(object.material) ?? []; list.push(geometry); batches.set(object.material, list); scene.remove(object);
  }
  batches.forEach((geometries, material) => { const combined = mergeGeometries(geometries); if (combined) scene.add(new THREE.Mesh(combined, material)); geometries.forEach(g => g.dispose()); });
// END APPROVED ASTRA ENVIRONMENT
  const practicalLights = scene.children.filter((object): object is THREE.PointLight => object instanceof THREE.PointLight);
  const lampSources = practicalLights.map(light => ({ position: light.position.clone(), color: light.color.clone(), intensity: light.intensity, distance: light.distance }));
  const environment = new THREE.Group();
  for (const object of [...scene.children]) if (object instanceof THREE.Mesh) environment.add(object);
  scene.add(environment);
  const aheadEnvironment = environment.clone(true); aheadEnvironment.position.z = -48; scene.add(aheadEnvironment);
  const scenery = [environment, aheadEnvironment];
  type Wall = { group: THREE.Group; chunks: THREE.Mesh[]; origins: THREE.Vector3[]; triangles: THREE.Vector2[][]; faces: THREE.Mesh[]; cracks: THREE.LineSegments; seams: THREE.LineSegments; mount: THREE.Group; surround: THREE.Group; plaque: THREE.Mesh; title: THREE.CanvasTexture; surface: THREE.CanvasTexture; material: THREE.MeshBasicMaterial; revision: number; coverUrl: string | null };
  const walls: Wall[] = [];
  for (let index = 0; index < 2; index++) {
    const z = -5 - index * 24; const group = new THREE.Group(); group.position.z = z; scene.add(group);
    const chunks: THREE.Mesh[] = []; const origins: THREE.Vector3[] = []; const edges: number[] = []; const triangles: THREE.Vector2[][] = [];
    // Authored pre-fracture: offset triangulated stone cells, animated without a physics engine.
    const cols = 6, rows = 4; const vertices: THREE.Vector2[][] = [];
    for (let row = 0; row <= rows; row++) {
      vertices[row] = [];
      for (let col = 0; col <= cols; col++) vertices[row][col] = new THREE.Vector2(-4.7 + col * 9.4 / cols + (col > 0 && col < cols ? (random() - 0.5) * 0.65 : Math.sin(row * 1.7) * 0.3), row * 5.8 / rows + (row > 0 && row < rows ? (random() - 0.5) * 0.5 : row === rows ? Math.sin(col * 1.3) * 0.35 : 0));
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = vertices[row][col], b = vertices[row][col + 1], c = vertices[row + 1][col + 1], d = vertices[row + 1][col];
      for (const triangle of [[a, b, c], [a, c, d]]) {
        const center = triangle.reduce((v, p) => v.add(p), new THREE.Vector2()).multiplyScalar(1 / 3);
        const shape = new THREE.Shape(triangle.map(v => v.clone().sub(center)));
        const g = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.03, bevelSegments: 1 });
        const relief = Math.sin(chunks.length * 2.4) * 0.065;
        const chunk = mesh(g, stone, center.x, center.y, relief, group); chunks.push(chunk); origins.push(chunk.position.clone()); triangles.push(triangle);
        for (let j = 0; j < 3; j++) { const a = triangle[j], b = triangle[(j + 1) % 3]; edges.push(a.x, a.y, 0.72 + relief, b.x, b.y, 0.72 + relief); }
      }
    }
    const segments = Array.from({ length: edges.length / 6 }, (_, i) => edges.slice(i * 6, i * 6 + 6));
    const distance = (edge: number[]) => Math.hypot((edge[0] + edge[3]) / 2 - 0.3, (edge[1] + edge[4]) / 2 - 1.6);
    segments.sort((a, b) => distance(a) - distance(b));
    const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(segments.flat(), 3));
    const cracks = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: "#efc48d", transparent: true, opacity: 0 })); group.add(cracks);
    const seamGeometry = cg.clone(); seamGeometry.translate(0, 0, -0.08);
    const seams = new THREE.LineSegments(seamGeometry, new THREE.LineBasicMaterial({ color: "#1b2927", transparent: true, opacity: 0.42 })); group.add(seams);
    const mount = new THREE.Group(), surround = new THREE.Group(); group.add(mount); mount.add(surround); surround.position.set(0, 3.15, 0.88);
    // Real stepped rails, rather than a border painted onto the screenshot.
    for (const side of [-1, 1]) {
      box(side * 0.5, 0, 0, 0.045, 1.08, 0.2, wood, surround);
      box(0, side * 0.5, 0, 1.08, 0.045, 0.2, wood, surround);
      box(side * 0.485, 0, 0.09, 0.012, 1, 0.045, brass, surround);
      box(0, side * 0.485, 0.09, 1, 0.012, 0.045, brass, surround);
    }
    const titleCanvas = document.createElement("canvas"); titleCanvas.width = 1024; titleCanvas.height = 180;
    const title = new THREE.CanvasTexture(titleCanvas); title.colorSpace = THREE.SRGBColorSpace; textures.push(title);
    const plaque = mesh(new THREE.PlaneGeometry(3.5, 0.55), new THREE.MeshBasicMaterial({ map: title, toneMapped: false }), 0, 1.1, 1.02, mount);
    box(0, 0, -0.08, 3.65, 0.65, 0.12, iron, plaque);
    const canvas = document.createElement("canvas"); canvas.width = 1280; canvas.height = 1024;
    const surface = new THREE.CanvasTexture(canvas); surface.colorSpace = THREE.SRGBColorSpace; textures.push(surface);
    const material = new THREE.MeshBasicMaterial({ map: surface, side: THREE.DoubleSide, toneMapped: false });
    walls.push({ group, chunks, origins, triangles, faces: [], cracks, seams, mount, surround, plaque, title, surface, material, revision: 0, coverUrl: null });
  }
  // Four decoded covers at most; only the current/next station are requested.
  // Revision checks keep a late image response from replacing a newer selection.
  const coverCache = new Map<string, THREE.Texture>();
  const pendingCovers = new Map<string, Promise<THREE.Texture>>();
  function loadCover(url: string): Promise<THREE.Texture> {
    const existing = coverCache.get(url);
    if (existing) { coverCache.delete(url); coverCache.set(url, existing); return Promise.resolve(existing); }
    const pending = pendingCovers.get(url); if (pending) return pending;
    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      new THREE.TextureLoader().load(url, texture => {
        pendingCovers.delete(url); texture.colorSpace = THREE.SRGBColorSpace;
        if (disposed) { texture.dispose(); resolve(texture); return; }
        coverCache.set(url, texture);
        while (coverCache.size > 4) {
          const oldest = [...coverCache.keys()].find(key => !walls.some(wall => wall.coverUrl === key));
          if (!oldest) break; coverCache.get(oldest)!.dispose(); coverCache.delete(oldest);
        }
        resolve(texture);
      }, undefined, error => { pendingCovers.delete(url); reject(error); });
    });
    pendingCovers.set(url, promise); return promise;
  }
  function display(wall: Wall, project: MineProject, image?: HTMLImageElement) {
    const aspect = image ? image.width / image.height : project.portrait ? 0.6 : 1.72;
    const art = project.kind === "artwork";
    const imageWidth = Math.min(4.4, 2.8 * aspect), imageHeight = imageWidth / aspect;
    const width = imageWidth + (art ? 0.5 : 0.16), height = imageHeight + (art ? 0.5 : 0.16);
    const bottom = 3.15 - height / 2, left = -width / 2;
    const canvas = wall.surface.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const scale = canvas.width / width;
    const drawHeight = height * scale;
    ctx.setTransform(1, 0, 0, canvas.height / drawHeight, 0, 0);
    ctx.fillStyle = art ? "#e5d9bd" : "#212d2c"; ctx.fillRect(0, 0, canvas.width, drawHeight);
    const inset = (width - imageWidth) / 2 * scale;
    if (image) ctx.drawImage(image, inset, inset, imageWidth * scale, imageHeight * scale);
    ctx.fillStyle = art ? "#302c24" : "#f1e6cf"; ctx.textAlign = "center";
    let size = 0.28; ctx.font = `500 ${size * scale}px Arial`;
    while (ctx.measureText(project.title).width > canvas.width - 32 && size > 0.08) { size -= 0.01; ctx.font = `500 ${size * scale}px Arial`; }
    if (!image) ctx.fillText(project.title, canvas.width / 2, drawHeight * 0.48);
    if (!image) { ctx.font = `${0.12 * scale}px Arial`; ctx.fillStyle = "#c4b797"; ctx.fillText(project.category, canvas.width / 2, drawHeight * 0.64); }
    wall.surface.needsUpdate = true;
    wall.surround.scale.set(width + 0.15, height + 0.15, 1);
    wall.plaque.position.y = bottom - 0.46; wall.plaque.visible = Boolean(image);
    const titleCanvas = wall.title.image as HTMLCanvasElement, titleContext = titleCanvas.getContext("2d")!;
    titleContext.fillStyle = "#222e2c"; titleContext.fillRect(0, 0, 1024, 180);
    titleContext.strokeStyle = "#b39b6d"; titleContext.lineWidth = 3; titleContext.strokeRect(8, 8, 1008, 164);
    titleContext.fillStyle = "#efe5cc"; titleContext.textAlign = "center";
    let titleSize = 58; titleContext.font = `500 ${titleSize}px Arial`;
    while (titleContext.measureText(project.title).width > 950 && titleSize > 24) titleContext.font = `500 ${--titleSize}px Arial`;
    titleContext.fillText(project.title, 512, 88); titleContext.font = "26px Arial"; titleContext.fillStyle = "#baa780"; titleContext.fillText(project.category, 512, 140); wall.title.needsUpdate = true;
    wall.faces.forEach(face => { face.removeFromParent(); face.geometry.dispose(); }); wall.faces = [];
    wall.triangles.forEach((triangle, index) => {
      const polygon = clipDisplay(triangle, left, bottom, width, height);
      if (polygon.length < 3) return;
      const position: number[] = [], uv: number[] = [], origin = wall.origins[index];
      for (let i = 1; i < polygon.length - 1; i++) for (const p of [polygon[0], polygon[i], polygon[i + 1]]) {
        position.push(p.x - origin.x, p.y - origin.y, 0.69); uv.push(p.u, p.v);
      }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3)); geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      const face = new THREE.Mesh(geometry, wall.material); wall.chunks[index].add(face); wall.faces.push(face);
    });
  }
  function bindWall(wall: Wall, projectIndex: number, z: number) {
    const project = projects[projectIndex], revision = ++wall.revision;
    wall.group.position.z = z; wall.group.visible = true;
    wall.mount.position.set(0, 0, 0); wall.mount.rotation.set(0, 0, 0); wall.seams.visible = true;
    wall.chunks.forEach((chunk, i) => { chunk.position.copy(wall.origins[i]); chunk.rotation.set(0, 0, 0); });
    wall.cracks.visible = true; (wall.cracks.material as THREE.LineBasicMaterial).opacity = 0; wall.cracks.geometry.setDrawRange(0, 0);
    display(wall, project);
    wall.coverUrl = project.image;
    if (project.image) void loadCover(project.image).then(texture => {
      if (disposed || wall.revision !== revision) return;
      display(wall, project, texture.image as HTMLImageElement);
    }).catch(() => { /* The named project plaque remains usable when a cover cannot load. */ });
  }
  // Cart, drill sled and drive assembly share one moving hierarchy.
  const cart = new THREE.Group(); scene.add(cart);
  box(0, -0.9, -0.3, 2.1, 0.1, 2, iron, cart);
  for (const x of [-1.08, 1.08]) {
    box(x, -0.5, -0.65, 0.12, 0.95, 2.5, iron, cart);
    box(x, -0.02, -0.65, 0.15, 0.09, 2.55, brass, cart);
    for (let z = -1.8; z < 0.7; z += 0.35) mesh(new THREE.SphereGeometry(0.045, 6, 4), brass, x - Math.sign(x) * 0.08, -0.18, z, cart);
  }
  box(0, -0.45, -1.85, 2.2, 0.82, 0.13, iron, cart);
  box(0, -0.02, -1.85, 2.25, 0.1, 0.18, brass, cart);
  // A bolted crossmember carries a cantilever sled, bearing cradle and motor.
  // All parts live under the cart so vibration and travel cannot separate the mount.
  box(0.6, -0.13, -1.85, 1.05, 0.2, 0.3, iron, cart);
  for (const x of [0.27, 0.93]) {
    box(x, -0.17, -2.47, 0.12, 0.18, 1.5, iron, cart);
    const start = new THREE.Vector3(x, -0.65, -1.75);
    const end = new THREE.Vector3(x, -0.17, -3.1);
    const strut = box(0, 0, 0, 0.08, start.distanceTo(end), 0.08, brass, cart);
    strut.position.copy(start).add(end).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    mesh(new THREE.SphereGeometry(0.045, 8, 6), brass, x, -0.01, -1.7, cart);
  }
  box(0.6, -0.17, -2.9, 0.9, 0.17, 0.38, iron, cart);
  box(0.6, -0.12, -2.9, 0.3, 0.3, 0.28, iron, cart);
  const drill = new THREE.Group(); drill.position.set(0.6, 0.02, -2.92); drill.rotation.set(0.12, 0.32, 0); drill.scale.setScalar(0.72); cart.add(drill);
  const drillBody = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.75, 16), iron, 0, 0, 0.3, drill); drillBody.rotation.x = Math.PI / 2;
  const bit = new THREE.Group(); drill.add(bit);
  const cone = mesh(new THREE.ConeGeometry(0.39, 1.25, 24), brass, 0, 0, -0.55, bit); cone.rotation.x = -Math.PI / 2;
  const helix: THREE.Vector3[] = [];
  for (let i = 0; i <= 160; i++) { const t = i / 160; const r = 0.39 * (1 - t) + 0.015; helix.push(new THREE.Vector3(Math.cos(t * Math.PI * 9) * r, Math.sin(t * Math.PI * 9) * r, 0.06 - t * 1.25)); }
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 160, 0.055, 5, false), iron, 0, 0, 0, bit);
  const bearing = mesh(new THREE.TorusGeometry(0.23, 0.065, 8, 20), iron, 0, 0, 0.3, drill);
  bearing.rotation.z = Math.PI / 4;
  const headlight = new THREE.PointLight("#ffe0ad", 10, 10); headlight.position.set(-0.6, 0, -2); cart.add(headlight);
  // Dust uses one draw call. It only becomes dense during fracture.
  const dustPositions = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) { dustPositions[i * 3] = (random() - 0.5) * 12; dustPositions[i * 3 + 1] = random() * 6; dustPositions[i * 3 + 2] = -random() * 36; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustCanvas = document.createElement("canvas"); dustCanvas.width = dustCanvas.height = 32;
  const dc = dustCanvas.getContext("2d")!, fade = dc.createRadialGradient(16, 16, 0, 16, 16, 16);
  fade.addColorStop(0, "#ffffffaa"); fade.addColorStop(1, "#ffffff00"); dc.fillStyle = fade; dc.fillRect(0, 0, 32, 32);
  const dustTexture = new THREE.CanvasTexture(dustCanvas); textures.push(dustTexture);
  const dustMat = new THREE.PointsMaterial({ map: dustTexture, color: "#d0c2a4", size: 0.035, transparent: true, opacity: 0.23, depthWrite: false }); const dust = new THREE.Points(dustGeo, dustMat); scene.add(dust);
  let station = 0, elapsed = 0, moving = false, paused = false, time = 0, last = performance.now(), frame = 0;
  let phase = "", pointerX = 0, pointerY = 0, cameraZ = 7;
  let slowFrames = 0, qualityReduced = false;
  const setPhase = (s: string) => { if (phase !== s) { phase = s; host.dataset.phase = s; events.phase(s); } };
  const finish = () => {
    moving = false; station = nextStation(station, projects.length); cameraZ = 7;
    // Rebase the arriving chamber and camera together: identical framing with no
    // growing world coordinates. Recycle the consumed wall behind the next wall.
    scenery.forEach(tile => { tile.position.z = advanceSceneryTile(tile.position.z); });
    const consumed = walls.shift()!; walls.push(consumed);
    walls[0].group.position.z = -5;
    bindWall(consumed, nextStation(station, projects.length), -29);
    dustMat.opacity = 0.23; dustMat.size = 0.035;
    dustGeo.setDrawRange(0, 90);
    events.station(station); setPhase("ready");
  };
  const jump = (index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= projects.length) return;
    moving = false; elapsed = 0; station = index; cameraZ = 7;
    scenery[0].position.z = index % 2 ? 24 : 0; scenery[1].position.z = index % 2 ? -24 : -48;
    dustMat.opacity = 0.23; dustMat.size = 0.035;
    dustGeo.setDrawRange(0, 90);
    bindWall(walls[0], station, -5); bindWall(walls[1], nextStation(station, projects.length), -29);
    events.station(station); setPhase("ready");
  };
  const advance = () => { if (moving || paused) return; if (reduced) { finish(); return; } elapsed = 0; moving = true; setPhase("drilling"); };
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.fov = w < 650 ? 72 : 56; camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const pointer = (e: PointerEvent) => { if (e.pointerType === "mouse") { pointerX = (e.clientX / host.clientWidth - 0.5) * 0.07; pointerY = (e.clientY / host.clientHeight - 0.5) * 0.025; } };
  const raycaster = new THREE.Raycaster();
  const click = (e: MouseEvent) => { if (moving || paused) return; const rect = renderer.domElement.getBoundingClientRect(); raycaster.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera); if (raycaster.intersectObjects(walls[0].faces).length) events.inspect(); };
  const lost = (e: Event) => { e.preventDefault(); events.failed(); };
  host.addEventListener("pointermove", pointer); renderer.domElement.addEventListener("click", click); renderer.domElement.addEventListener("webglcontextlost", lost);
  function render(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(render); const rawDelta = (now - last) / 1000; const dt = Math.min(rawDelta, 0.05); last = now;
    if (document.hidden || paused) return;
    time += dt;
    if (rawDelta > 0.035) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 80 && !qualityReduced) { renderer.setPixelRatio(1); resize(); qualityReduced = true; }
    if (moving) {
      elapsed += dt; bit.rotation.z += dt * (12 + smooth(elapsed / 0.5) * 24);
      const journey = journeyAt(elapsed);
      cameraZ = journey.cameraZ;
      setPhase(journey.phase);
      const wall = walls[0];
      if (elapsed < 1.2) {
        const pressure = smooth((elapsed - 0.65) / 0.55);
        (wall.cracks.material as THREE.LineBasicMaterial).opacity = pressure * 0.9;
        wall.cracks.geometry.setDrawRange(0, Math.floor(pressure * wall.cracks.geometry.attributes.position.count / 2) * 2);
      } else {
        wall.cracks.visible = false;
        const t = Math.max(0, elapsed - 1.2);
        wall.seams.visible = false; wall.mount.position.y = -t * t * 5; wall.mount.rotation.z = t * 0.16;
        wall.chunks.forEach((c, i) => { const o = wall.origins[i]; c.position.set(o.x + (o.x >= 0 ? 1 : -1) * t * (1.7 + i % 3 * 0.3), o.y + t * (0.2 + i % 3 * 0.15) - t * t * 5, o.z - t * (0.7 + i % 4 * 0.15)); c.rotation.set(t * (i % 3 - 1) * 0.65, t * 0.3, t * (i % 2 ? 0.5 : -0.5)); });
        // One bounded impact cloud, emitted from the actual stone face.
        dustGeo.setDrawRange(0, 180);
        for (let i = 90; i < 180; i++) {
          const angle = i * 2.399, speed = 0.8 + i % 7 * 0.28;
          dustPositions[i * 3] = 0.3 + Math.cos(angle) * t * speed;
          dustPositions[i * 3 + 1] = 1.6 + Math.sin(angle) * t * speed - t * t * 0.9;
          dustPositions[i * 3 + 2] = wall.group.position.z + 0.8 + t * (i % 5 * 0.2);
        }
        dustGeo.attributes.position.needsUpdate = true;
        dustMat.opacity = 0.23 + Math.sin(Math.min(t / 1.4, 1) * Math.PI) * 0.28; dustMat.size = 0.035 + Math.sin(Math.min(t / 1.4, 1) * Math.PI) * 0.075;
      }
      if (journey.complete) finish();
    }
    const vibration = moving && elapsed > 0.75 && elapsed < 1.6 ? Math.sin(time * 65) * 0.009 * Math.sin((elapsed - 0.75) / 0.85 * Math.PI) : 0;
    drill.position.z = -2.92 - (moving ? Math.sin(elapsed * 55) * 0.012 * smooth(elapsed / 0.7) : 0);
    camera.position.set(vibration, 2.25 + vibration, cameraZ);
    camera.rotation.set(0.045 + (reduced ? 0 : -pointerY), reduced ? 0 : -pointerX, vibration * 0.1);
    cart.position.set(0, 1.45 + vibration * 0.4, cameraZ); cart.rotation.z = vibration * 0.3;
    scenery.forEach(tile => { tile.visible = tile.position.z + 12 > cameraZ - 42 && tile.position.z - 43 < cameraZ + 5; });
    // Keep the original light budget while reusing both chambers. A second tile
    // does not double the shader's point-light count.
    const nearestLamps = scenery.flatMap(tile => lampSources.map(source => ({ source, z: source.position.z + tile.position.z }))).sort((a, b) => Math.abs(a.z - cameraZ) - Math.abs(b.z - cameraZ));
    practicalLights.forEach((light, i) => { const lamp = nearestLamps[i]; light.position.copy(lamp.source.position); light.position.z = lamp.z; light.color.copy(lamp.source.color); light.intensity = lamp.source.intensity; light.distance = lamp.source.distance; });
    if (!reduced) dust.position.y = Math.sin(time * 0.2) * 0.2;
    renderer.render(scene, camera);
    host.dataset.drawCalls = String(renderer.info.render.calls); host.dataset.triangles = String(renderer.info.render.triangles); host.dataset.quality = qualityReduced ? "adaptive" : "full";
    host.dataset.station = projects[station].id; host.dataset.wallCount = String(walls.length); host.dataset.tileCount = String(scenery.length); host.dataset.coverCache = String(coverCache.size); host.dataset.textures = String(renderer.info.memory.textures);
    host.dataset.geometries = String(renderer.info.memory.geometries); host.dataset.displayFragments = String(walls[0].faces.length); host.dataset.journeyTime = elapsed.toFixed(2);
  }
  jump(initialStation); frame = requestAnimationFrame(render);
  return { advance, skip: () => { if (moving) finish(); }, jump, pause: v => { paused = v; }, motion: value => { reduced = value; if (reduced && moving) finish(); }, dispose: () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); host.removeEventListener("pointermove", pointer); renderer.domElement.removeEventListener("click", click); renderer.domElement.removeEventListener("webglcontextlost", lost);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    scene.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.LineSegments) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); coverCache.forEach(t => t.dispose()); coverCache.clear(); pendingCovers.clear(); renderer.dispose(); renderer.domElement.remove();
  } };
}
