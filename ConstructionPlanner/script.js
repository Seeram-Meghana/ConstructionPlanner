let scene, camera, renderer, controls, building;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / 520, 0.1, 1000);
  camera.position.set(30, 25, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, 520);
  document.getElementById("viewer").appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(50, 80, 50);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x666666);
  scene.add(ambient);

  // ground grid
  const grid = new THREE.GridHelper(120, 120);
  scene.add(grid);
}

function generateBuilding() {
  const area = parseFloat(document.getElementById("area").value);
  const floors = parseInt(document.getElementById("floors").value);
  const rooms = parseInt(document.getElementById("rooms").value);

  document.getElementById("msg").innerHTML =
    area >= 0.15 && rooms >= 5
      ? "✅ 3BHK feasible"
      : "⚠️ Only 2BHK feasible";

  if (building) scene.remove(building);
  building = new THREE.Group();

  const floorHeight = 3;
  const width = 18;
  const depth = 14;

  for (let i = 0; i < floors; i++) {
    const y = i * floorHeight;

    createSlab(y, width, depth);
    createColumns(y, width, depth);
  }

  // roof slab
  createSlab(floors * floorHeight, width, depth, true);

  scene.add(building);
}

// 🧱 FLOOR SLAB
function createSlab(y, w, d, isRoof = false) {
  const geo = new THREE.BoxGeometry(w, 0.5, d);
  const mat = new THREE.MeshPhongMaterial({
    color: isRoof ? 0x8e24aa : 0x4dd0e1,
    transparent: true,
    opacity: 0.85,
  });

  const slab = new THREE.Mesh(geo, mat);
  slab.position.y = y;
  building.add(slab);
}

// 🏗 COLUMNS GRID
function createColumns(y, w, d) {
  const positionsX = [-w/2+1, -w/4, w/4, w/2-1];
  const positionsZ = [-d/2+1, 0, d/2-1];

  positionsX.forEach(x => {
    positionsZ.forEach(z => {
      const geo = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
      const mat = new THREE.MeshPhongMaterial({ color: 0x455a64 });
      const col = new THREE.Mesh(geo, mat);
      col.position.set(x, y + 1.5, z);
      building.add(col);
    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / 520;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, 520);
});