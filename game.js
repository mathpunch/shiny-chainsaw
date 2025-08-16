const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: canvas.width / 2, y: canvas.height / 2, size: 40 };
let bullets = [];
let enemies = [];
let keys = {};
let touch = { x: 0, y: 0, active: false };

function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 30,
    speed: 1 + Math.random() * 2
  });
}

function drawPlayer() {
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemies() {
  ctx.fillStyle = '#f00';
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBullets() {
  ctx.fillStyle = '#fff';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateBullets() {
  bullets.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
  });
  bullets = bullets.filter(b => b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height);
}

function updateEnemies() {
  enemies.forEach(e => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;
  });
}

function checkCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      let dx = b.x - e.x;
      let dy = b.y - e.y;
      if (Math.sqrt(dx * dx + dy * dy) < e.size) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        spawnEnemy();
      }
    });
  });
}

function shoot(x, y) {
  let angle = Math.atan2(y - player.y, x - player.x);
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * 10,
    dy: Math.sin(angle) * 10
  });
  // play sound
  new Audio('assets/sounds/shoot.mp3').play();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawEnemies();
  drawBullets();
  updateBullets();
  updateEnemies();
  checkCollisions();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('click', e => shoot(e.clientX, e.clientY));

document.getElementById('fireBtn').addEventListener('click', () => shoot(player.x + 100, player.y));
document.getElementById('reloadBtn').addEventListener('click', () => {
  new Audio('assets/sounds/bruh.mp3').play();
});

document.getElementById('joystick').addEventListener('touchstart', e => {
  touch.active = true;
  touch.x = e.touches[0].clientX;
  touch.y = e.touches[0].clientY;
});

document.getElementById('joystick').addEventListener('touchmove', e => {
  let dx = e.touches[0].clientX - touch.x;
  let dy = e.touches[0].clientY - touch.y;
  player.x += dx * 0.1;
  player.y += dy * 0.1;
  touch.x = e.touches[0].clientX;
  touch.y = e.touches[0].clientY;
});

document.getElementById('joystick').addEventListener('touchend', () => {
  touch.active = false;
});

for (let i = 0; i < 5; i++) spawnEnemy();
gameLoop();
