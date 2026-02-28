let scene, camera, renderer, controls, building;
let autoRotate = true;
let livingRoomX = 0;

window.addEventListener("DOMContentLoaded", () => {
  init();
  animate();
});

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
  controls.target.set(0, 3, 0);

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
    createMainDoor(baseY, width, depth);
    createExternalStaircase(baseY + 0.2, width);
    createBalcony(baseY, width, depth);
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
  const roomHeight = 3;
  const frontZ = depth/2 - 3;
  const backZ = -depth/2 + 3;

  createRoom({ name:"Living Room", x:0, z:frontZ, w:width-4, d:5, h:roomHeight, color:0x81d4fa, y:baseY });
  createRoom({ name:"Kitchen", x:-4, z:0, w:5, d:5, h:roomHeight, color:0xfff59d, y:baseY });
  createRoom({ name:"Washroom", x:4, z:0, w:5, d:5, h:roomHeight, color:0xb39ddb, y:baseY });

  const totalWidth = width - 4;
  const bedWidth = totalWidth / bedrooms;

  for (let i = 0; i < bedrooms; i++) {
    const xPos = -totalWidth/2 + bedWidth/2 + i * bedWidth;
    createRoom({
      name:`Bedroom ${i+1}`,
      x:xPos, z:backZ,
      w:bedWidth-0.5, d:5,
      h:roomHeight,
      color:0xf8bbd0,
      y:baseY
    });
  }
}

function createRoom({ name, x, y, z, w, d, h, color }) {
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, transparent:true, opacity:0.9 })
  );
  room.position.set(x, y + h/2, z);
  building.add(room);

  const label = createTextLabel(name);
  label.position.set(x, y + h + 0.3, z);
  building.add(label);
}

function createMainDoor(baseY, width, depth) {
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x5d4037 })
  );
  door.position.set(0, baseY + 1.2, depth/2 + 0.2);
  building.add(door);
}

function createExternalStaircase(y, w) {
  for (let i = 0; i < 8; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 1),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
    );
    step.position.set(-w/2 - 2.5, y + i*0.35, -2 + i*0.6);
    building.add(step);
  }
}

function createBalcony(baseY, width, depth) {
  const balcony = new THREE.Mesh(
    new THREE.BoxGeometry(width-4, 0.3, 2),
    new THREE.MeshStandardMaterial({ color: 0x9e9e9e })
  );
  balcony.position.set(0, baseY + 0.2, depth/2 + 1);
  building.add(balcony);
}

function createTextLabel(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 128;
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, 128, 64);

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
  if (building && autoRotate) building.rotation.y += 0.004;
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const c = document.getElementById("viewer");
  camera.aspect = c.clientWidth / c.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(c.clientWidth, c.clientHeight);
});
function updateFloorPlan() {
  const bedrooms = parseInt(document.getElementById("bedrooms").value);
  const container = document.getElementById("floorPlanImage");

  let imgPath = "";

  switch (bedrooms) {
    case 1:
      imgPath = "images/1bhk.png";
      break;
    case 2:
      imgPath = "images/2bhk.png";
      break;
    case 3:
      imgPath = "images/3bhk.png";
      break;
    case 4:
      imgPath = "images/4bhk.png";
      break;
    default:
      container.innerHTML = "<p>No floor plan available</p>";
      return;
  }

  container.innerHTML = `<img src="${imgPath}" alt="Floor Plan">`;
}