let scene, camera, renderer;
let controls = { forward: false, backward: false, left: false, right: false };
let velocity = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let shootSound = new Audio('assets/sounds/shoot.mp3');

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.y = 1.6;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Skybox
  const skyTexture = new THREE.TextureLoader().load('assets/textures/sky.jpg');
  scene.background = skyTexture;

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: 0x222222 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Enemy
  const enemyTexture = new THREE.TextureLoader().load('assets/textures/enemy.png');
  const enemy = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: enemyTexture, transparent: true })
  );
  enemy.position.set(0, 1, -10);
  scene.add(enemy);

  // Pointer Lock
  document.getElementById('startBtn').addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === renderer.domElement) {
      document.addEventListener('mousemove', onMouseMove, false);
    } else {
      document.removeEventListener('mousemove', onMouseMove, false);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'w') controls.forward = true;
    if (e.key === 's') controls.backward = true;
    if (e.key === 'a') controls.left = true;
    if (e.key === 'd') controls.right = true;
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'w') controls.forward = false;
    if (e.key === 's') controls.backward = false;
    if (e.key === 'a') controls.left = false;
    if (e.key === 'd') controls.right = false;
  });

  document.getElementById('fireBtn').addEventListener('click', shoot);

  animate();
}

function onMouseMove(e) {
  camera.rotation.y -= e.movementX * 0.002;
  camera.rotation.x -= e.movementY * 0.002;
}

function shoot() {
  shootSound.play();
  raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach(obj => {
    if (obj.object.geometry.type === 'PlaneGeometry') {
      scene.remove(obj.object);
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Movement
  const speed = 0.1;
  const dir = new THREE.Vector3();
  if (controls.forward) dir.z -= speed;
  if (controls.backward) dir.z += speed;
  if (controls.left) dir.x -= speed;
  if (controls.right) dir.x += speed;
  dir.applyEuler(camera.rotation);
  camera.position.add(dir);

  renderer.render(scene, camera);
}

init();
