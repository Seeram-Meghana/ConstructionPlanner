let scene, camera, renderer, controls, building;
let autoRotate = true;

init();
animate();

// ================= INIT =================
function init() {
  const container = document.getElementById("viewer");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(28, 22, 28);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(40, 60, 40);
  scene.add(dirLight);

  const amb = new THREE.AmbientLight(0x888888);
  scene.add(amb);

  // ground
  const groundGeo = new THREE.PlaneGeometry(120, 120);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(120, 120);
  scene.add(grid);
}

// ================= MAIN =================
function generateBuilding() {
  const area = parseFloat(document.getElementById("area").value);
  const floors = parseInt(document.getElementById("floors").value);
  const rooms = parseInt(document.getElementById("rooms").value);

  document.getElementById("msg").innerHTML =
    area >= 0.15 && rooms >= 5
      ? "✅ 3BHK feasible"
      : "⚠️ Compact / 2BHK recommended";

  if (building) scene.remove(building);
  building = new THREE.Group();

  const floorHeight = 3.2;
  const width = 18;
  const depth = 14;

  for (let f = 0; f < floors; f++) {
    const baseY = f * floorHeight;

    createFloor(baseY, width, depth);
    createRooms(baseY + 0.1);
    createBalcony(baseY + 0.2, width); // ⭐ balcony added
  }

  createRoof(floors * floorHeight, width, depth);

  scene.add(building);
}

// ================= FLOOR =================
function createFloor(y, w, d) {
  const geo = new THREE.BoxGeometry(w, 0.4, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0xb0bec5 });

  const floor = new THREE.Mesh(geo, mat);
  floor.position.y = y;
  building.add(floor);
}

// ================= ROOF =================
function createRoof(y, w, d) {
  const geo = new THREE.BoxGeometry(w, 0.5, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7b1fa2 });

  const roof = new THREE.Mesh(geo, mat);
  roof.position.y = y;
  building.add(roof);
}

// ================= ROOMS =================
function createRooms(baseY) {
  createRoom({ x: -4, z: 0, w: 8, d: 6, h: 3, color: 0x81d4fa, y: baseY });
  createRoom({ x: 5, z: -3, w: 6, d: 5, h: 3, color: 0xf8bbd0, y: baseY });
  createRoom({ x: 5, z: 4, w: 5, d: 4, h: 3, color: 0xfff59d, y: baseY });
}

// ================= ROOM =================
function createRoom({ x, y, z, w, d, h, color }) {
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });

  const room = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  room.position.set(x, y + h / 2, z);
  building.add(room);

  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x37474f })
  );
  line.position.copy(room.position);
  building.add(line);
}

// ================= BALCONY =================
function createBalcony(y, w) {
  const balcony = new THREE.Group();

  const slabGeo = new THREE.BoxGeometry(5, 0.3, 2);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(-w / 2 - 2.5, y + 0.5, 0);
  balcony.add(slab);

  const railMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });

  for (let i = -2; i <= 2; i += 0.8) {
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
    const pole = new THREE.Mesh(poleGeo, railMat);
    pole.position.set(-w / 2 - 2.5 + i, y + 1.1, -0.9);
    balcony.add(pole);
  }

  const topRailGeo = new THREE.BoxGeometry(5, 0.1, 0.1);
  const topRail = new THREE.Mesh(topRailGeo, railMat);
  topRail.position.set(-w / 2 - 2.5, y + 1.7, -0.9);
  balcony.add(topRail);

  building.add(balcony);
}

// ================= ROTATION =================
function toggleRotation() {
  autoRotate = !autoRotate;
}

// ================= ANIMATE =================
function animate() {
  requestAnimationFrame(animate);

  if (building && autoRotate) {
    building.rotation.y += 0.004; // full 360 continuous
  }

  controls.update();
  renderer.render(scene, camera);
}

// ================= RESPONSIVE =================
window.addEventListener("resize", () => {
  const container = document.getElementById("viewer");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});