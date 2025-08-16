const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let player = { x: canvas.width / 2, y: canvas.height / 2, size: 30, speed: 4 };
let enemies = [];
let bullets = [];
let joystick = { active: false, dx: 0, dy: 0 };
let gunOffset = { x: 20, y: -10 };

function spawnEnemy() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  enemies.push({ x, y, size: 30, health: 3 });
}

function drawPlayer() {
  ctx.fillStyle = "#0f0";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Gun
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + gunOffset.x, player.y + gunOffset.y, 20, 5);
}

function drawEnemies() {
  enemies.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBullets() {
  bullets.forEach((b) => {
    ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateBullets() {
  bullets.forEach((b, i) => {
    b.x += b.dx * 10;
    b.y += b.dy * 10;

    enemies.forEach((e, j) => {
      const dist = Math.hypot(b.x - e.x, b.y - e.y);
      if (dist < e.size) {
        e.health -= 1;
        bullets.splice(i, 1);
        if (e.health <= 0) {
          enemies.splice(j, 1);
          score++;
          document.getElementById("score").textContent = "Score: " + score;
        }
      }
    });
  });
}

function movePlayer() {
  player.x += joystick.dx * player.speed;
  player.y += joystick.dy * player.speed;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  updateBullets();
  drawPlayer();
  drawEnemies();
  drawBullets();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", (e) => {
  const dx = e.clientX - player.x;
  const dy = e.clientY - player.y;
  const mag = Math.hypot(dx, dy);
  bullets.push({ x: player.x, y: player.y, dx: dx / mag, dy: dy / mag });
});

setInterval(spawnEnemy, 2000);
gameLoop();

// Joystick
const stick = document.getElementById("stick");
const joy = document.getElementById("joystick");

joy.addEventListener("touchstart", (e) => {
  joystick.active = true;
});

joy.addEventListener("touchmove", (e) => {
  const rect = joy.getBoundingClientRect();
  const touch = e.touches[0];
  const dx = touch.clientX - rect.left - 50;
  const dy = touch.clientY - rect.top - 50;
  const mag = Math.hypot(dx, dy);
  joystick.dx = dx / mag;
  joystick.dy = dy / mag;
  stick.style.left = `${dx + 30}px`;
  stick.style.top = `${dy + 30}px`;
});

joy.addEventListener("touchend", () => {
  joystick.active = false;
  joystick.dx = 0;
  joystick.dy = 0;
  stick.style.left = "30px";
  stick.style.top = "30px";
});
