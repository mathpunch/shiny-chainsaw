let scene, camera, renderer;
let enemies = [];
let score = 0;
let health = 100;
let moveDir = { x: 0, z: 0 };
let touchStart = null;

function createEmojiTexture(emoji, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, size, size);
  ctx.font = `${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(emoji, size / 2, size / 2);
  return new THREE.CanvasTexture(canvas);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Sky gradient
  const skyGeo = new THREE.SphereGeometry(500, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x222244, side: THREE.BackSide });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Buildings
  for (let i = 0; i < 30; i++) {
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(2, Math.random() * 5 + 3, 2),
      new THREE.MeshBasicMaterial({ map: createEmojiTexture('🏢') })
    );
    building.position.set(
      Math.random() * 80 - 40,
      building.geometry.parameters.height / 2,
      Math.random() * 80 - 40
    );
    scene.add(building);
  }

  // Enemies
  for (let i = 0; i < 10; i++) spawnEnemy();

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

  // Touch aiming
  renderer.domElement.addEventListener('touchstart', e => {
    touchStart = e.touches[0];
  });

  renderer.domElement.addEventListener('touchmove', e => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.clientX;
    const dy = e.touches[0].clientY - touchStart.clientY;
    camera.rotation.y -= dx * 0.002;
    camera.rotation.x -= dy * 0.002;
    touchStart = e.touches[0];
  });

  // Joystick
  const joystick = document.getElementById('joystick');
  joystick.addEventListener('touchstart', e => {
    const rect = joystick.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joystick.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - center.x;
      const dy = e.touches[0].clientY - center.y;
      moveDir.x = dx * 0.01;
      moveDir.z = dy * 0.01;
    });
    joystick.addEventListener('touchend', () => {
      moveDir.x = 0;
      moveDir.z = 0;
    });
  });

  // Fire button
  document.getElementById('fireBtn').addEventListener('click', shoot);

  animate();
}

function spawnEnemy() {
  const enemy = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ map: createEmojiTexture('😈') })
  );
  enemy.position.set(Math.random() * 80 - 40, 0.5, Math.random() * 80 - 40);
  enemy.userData = { alive: true };
  enemies.push(enemy);
  scene.add(enemy);
}

function shoot() {
  const raycaster = new THREE.Raycaster();
  raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
  const hits = raycaster.intersectObjects(enemies);
  hits.forEach(hit => {
    if (hit.object.userData.alive) {
      hit.object.userData.alive = false;
      scene.remove(hit.object);
      score += 10;
      document.getElementById('score').textContent = `Score: ${score}`;
      spawnEnemy();
    }
  });
}

function onMouseMove(e) {
  camera.rotation.y -= e.movementX * 0.002;
  camera.rotation.x -= e.movementY * 0.002;
}

function animate() {
  requestAnimationFrame(animate);

  // Move camera
  const dir = new THREE.Vector3(moveDir.x, 0, moveDir.z);
  dir.applyEuler(camera.rotation);
  camera.position.add(dir);

  // Enemy AI
  enemies.forEach(enemy => {
    if (!enemy.userData.alive) return;
    const dx = camera.position.x - enemy.position.x;
    const dz = camera.position.z - enemy.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.5) {
      health -= 1;
      document.getElementById('health').textContent = `Health: ${health}`;
    } else {
      enemy.position.x += dx / dist * 0.01;
      enemy.position.z += dz / dist * 0.01;
    }
  });

  renderer.render(scene, camera);
}

init();
