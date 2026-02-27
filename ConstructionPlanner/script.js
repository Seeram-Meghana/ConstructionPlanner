let scene, camera, renderer, controls, building;
let autoRotate = true;
let livingRoomX = 0;

init();
animate();

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

  scene.add(new THREE.AmbientLight(0x888888));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(40, 60, 40);
  scene.add(dirLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  scene.add(new THREE.GridHelper(120, 120));
}

function generateBuilding() {
  const floors = parseInt(document.getElementById("floors").value);
  const bedrooms = parseInt(document.getElementById("bedrooms").value);

  if (building) scene.remove(building);
  building = new THREE.Group();

  const floorHeight = 3.2;
  const width = 18;
  const depth = 14;

  for (let f = 0; f < floors; f++) {
    const baseY = f * floorHeight;

    createFloor(baseY, width, depth);
    createLayout(baseY + 0.1, bedrooms, width, depth);

    // Door aligned with Living Room
    createMainDoor(baseY, width, depth);

    createExternalStaircase(baseY + 0.2, width);
  }

  createRoof(floors * floorHeight, width, depth);
  scene.add(building);
}

function createFloor(y, w, d) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.4, d),
    new THREE.MeshStandardMaterial({ color: 0xb0bec5 })
  );
  floor.position.y = y;
  building.add(floor);
}

function createRoof(y, w, d) {
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.5, d),
    new THREE.MeshStandardMaterial({ color: 0x7b1fa2 })
  );
  roof.position.y = y;
  building.add(roof);
}
function createLayout(baseY, bedrooms, width, depth) {

  const margin = 1;
  const roomHeight = 3;

  const frontZ = depth/2 - 3;   // Front side
  const backZ = -depth/2 + 3;   // Back side

  const roomWidth = (width - 4) / 2;
  const roomDepth = 5;

  // ✅ 1. Living Room (FRONT CENTER)
  livingRoomX = 0;

  createRoom({
    name: "Living Room",
    x: 0,
    z: frontZ,
    w: width - 4,
    d: roomDepth,
    h: roomHeight,
    color: 0x81d4fa,
    y: baseY
  });

  // ✅ 2. Kitchen (Back Left)
  createRoom({
    name: "Kitchen",
    x: -roomWidth/2 - 1,
    z: 0,
    w: roomWidth,
    d: roomDepth,
    h: roomHeight,
    color: 0xfff59d,
    y: baseY
  });

  // ✅ 3. Washroom (Back Right)
  createRoom({
    name: "Washroom",
    x: roomWidth/2 + 1,
    z: 0,
    w: roomWidth,
    d: roomDepth,
    h: roomHeight,
    color: 0xb39ddb,
    y: baseY
  });

  // ✅ 4. Bedrooms (Fully Back Row)
  const totalWidth = width - 4;
  const bedWidth = totalWidth / bedrooms;

  for (let i = 0; i < bedrooms; i++) {

    const xPos = -totalWidth/2 + bedWidth/2 + i * bedWidth;

    createRoom({
      name: "Bedroom " + (i + 1),
      x: xPos,
      z: backZ,
      w: bedWidth - 0.5,
      d: roomDepth,
      h: roomHeight,
      color: 0xf8bbd0,
      y: baseY
    });
  }
}
function createRoom({ name, x, y, z, w, d, h, color }) {

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.9
    })
  );

  room.position.set(x, y + h/2, z);
  building.add(room);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
    new THREE.LineBasicMaterial({ color: 0x37474f })
  );

  edges.position.copy(room.position);
  building.add(edges);

  const label = createTextLabel(name);
  label.position.set(x, y + h + 0.3, z);
  building.add(label);
}

// 🚪 Door aligned to Living Room
function createMainDoor(baseY, width, depth) {

  const doorGroup = new THREE.Group();

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x5d4037 })
  );

  door.position.set(livingRoomX, baseY + 1.2, depth/2 + 0.2);
  doorGroup.add(door);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3e2723 })
  );

  frame.position.set(livingRoomX, baseY + 1.3, depth/2 + 0.1);
  doorGroup.add(frame);

  building.add(doorGroup);
}

function createExternalStaircase(y, w) {

  const stairGroup = new THREE.Group();
  const startX = -w/2 - 2.5;
  const startZ = -2;

  for (let i = 0; i < 8; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 1),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
    );

    step.position.set(startX, y + 0.2 + i*0.35, startZ + i*0.6);
    stairGroup.add(step);
  }

  building.add(stairGroup);
}

function createTextLabel(message) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 256;
  canvas.height = 128;

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width/2, canvas.height/2);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));

  sprite.scale.set(4,2,1);
  return sprite;
}

function toggleRotation() {
  autoRotate = !autoRotate;
}

function animate() {
  requestAnimationFrame(animate);

  if (building && autoRotate) {
    building.rotation.y += 0.004;
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const container = document.getElementById("viewer");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});