const screens = {
  loader: document.querySelector("#loader"),
  hero: document.querySelector("#hero"),
  message: document.querySelector("#message"),
  challenge: document.querySelector("#challenge"),
  riddle: document.querySelector("#riddle"),
  reward: document.querySelector("#reward")
};

const particleCanvas = document.querySelector("#particleCanvas");
const burstCanvas = document.querySelector("#burstCanvas");
const particleContext = particleCanvas.getContext("2d");
const burstContext = burstCanvas.getContext("2d");
const rackButton = document.querySelector("#rackButton");
const barbell = document.querySelector("#barbell");
const typewriterText = document.querySelector("#typewriterText");
const acceptButton = document.querySelector("#acceptButton");
const riddleForm = document.querySelector("#riddleForm");
const answerInput = document.querySelector("#answerInput");
const hintText = document.querySelector("#hintText");
const vaultDoor = document.querySelector("#vaultDoor");
const vaultZone = document.querySelector(".vault-zone");
const achievements = [...document.querySelectorAll("#achievementList li")];

const birthdayMessage = "Another year older.\n\nAnother year stronger.\n\nAnother PR waiting to happen.";
const wrongAnswers = [
  "Think beyond supplements.",
  "Strength begins before the first rep.",
  "Not quite.",
  "Try again."
];

let particles = [];
let bursts = [];
let animationFrame;

// Canvas setup keeps glow particles and celebration bursts crisp on high-density screens.
function setCanvasSize() {
  [particleCanvas, burstCanvas].forEach((canvas) => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  });

  particleContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  burstContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

// The site is one cinematic flow, so only one full-screen section is visible at a time.
function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

// Ambient floating particles sell the smoky gym atmosphere without requiring image assets.
function createParticles() {
  const count = Math.min(110, Math.floor(window.innerWidth / 12));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 2.2 + 0.5,
    speed: Math.random() * 0.45 + 0.12,
    drift: Math.random() * 0.45 - 0.225,
    opacity: Math.random() * 0.55 + 0.12,
    color: Math.random() > 0.72 ? "255, 98, 24" : "213, 216, 220"
  }));
}

function drawParticles() {
  particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -8) {
      particle.y = window.innerHeight + 8;
      particle.x = Math.random() * window.innerWidth;
    }

    particleContext.beginPath();
    particleContext.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
    particleContext.shadowColor = `rgba(${particle.color}, 0.72)`;
    particleContext.shadowBlur = 12;
    particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    particleContext.fill();
  });
  particleContext.shadowBlur = 0;
}

// Celebration shapes are drawn directly on canvas: dumbbells, scoops, and stars.
function drawDumbbell(x, y, size, rotation) {
  burstContext.save();
  burstContext.translate(x, y);
  burstContext.rotate(rotation);
  burstContext.fillRect(-size * 1.1, -size * 0.12, size * 2.2, size * 0.24);
  burstContext.fillRect(-size * 1.35, -size * 0.38, size * 0.28, size * 0.76);
  burstContext.fillRect(size * 1.07, -size * 0.38, size * 0.28, size * 0.76);
  burstContext.restore();
}

function drawScoop(x, y, size, rotation) {
  burstContext.save();
  burstContext.translate(x, y);
  burstContext.rotate(rotation);
  burstContext.beginPath();
  burstContext.arc(0, 0, size * 0.72, 0, Math.PI, true);
  burstContext.lineTo(size * 1.4, -size * 0.08);
  burstContext.lineWidth = Math.max(2, size * 0.18);
  burstContext.stroke();
  burstContext.restore();
}

function drawStar(x, y, size, rotation) {
  burstContext.save();
  burstContext.translate(x, y);
  burstContext.rotate(rotation);
  burstContext.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? size : size * 0.42;
    const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    burstContext[i === 0 ? "moveTo" : "lineTo"](Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  burstContext.closePath();
  burstContext.fill();
  burstContext.restore();
}

function drawBursts() {
  burstContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  bursts = bursts.filter((item) => item.life > 0);

  bursts.forEach((item) => {
    item.x += item.vx;
    item.y += item.vy;
    item.vy += 0.045;
    item.rotation += item.spin;
    item.life -= 1;

    burstContext.globalAlpha = Math.max(item.life / item.maxLife, 0);
    burstContext.fillStyle = item.color;
    burstContext.strokeStyle = item.color;

    if (item.shape === "dumbbell") drawDumbbell(item.x, item.y, item.size, item.rotation);
    if (item.shape === "scoop") drawScoop(item.x, item.y, item.size, item.rotation);
    if (item.shape === "star") drawStar(item.x, item.y, item.size, item.rotation);
  });

  burstContext.globalAlpha = 1;
}

function animateEffects() {
  drawParticles();
  drawBursts();
  animationFrame = requestAnimationFrame(animateEffects);
}

// One burst function supports both the barbell confetti and the vault fireworks.
function burstConfetti(amount = 90, firework = false) {
  const shapes = ["dumbbell", "scoop", "star"];
  const colors = ["#ff6a1a", "#ff2638", "#d5d8dc", "#ffb079"];
  const originY = firework ? window.innerHeight * 0.36 : window.innerHeight * 0.52;

  for (let i = 0; i < amount; i += 1) {
    const angle = firework ? (Math.PI * 2 * i) / amount : Math.random() * Math.PI * 2;
    const speed = firework ? Math.random() * 4 + 3 : Math.random() * 6 + 2;
    bursts.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: originY + (Math.random() - 0.5) * 80,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (firework ? 1.2 : 3.4),
      size: Math.random() * 8 + 5,
      spin: Math.random() * 0.22 - 0.11,
      rotation: Math.random() * Math.PI,
      life: firework ? 120 : 95,
      maxLife: firework ? 120 : 95,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    });
  }
}

function flashScreen() {
  document.body.classList.add("glow-blast");
  window.setTimeout(() => document.body.classList.remove("glow-blast"), 850);
}

function shakeScreen() {
  document.body.classList.add("shake");
  window.setTimeout(() => document.body.classList.remove("shake"), 430);
}

// Synthesized clank placeholder: no external audio file required, no missing asset request.
function playMetalSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(0.28, context.currentTime + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
  master.connect(context.destination);

  [170, 285, 440].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 0 ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.62, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.18 / (index + 1), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.34);
  });
}

// Typewriter pacing gives the birthday message its own beat before the challenge appears.
function typeMessage(text, onComplete) {
  let index = 0;
  typewriterText.textContent = "";

  const timer = window.setInterval(() => {
    typewriterText.textContent += text[index] === "\n" ? "\n" : text[index];
    typewriterText.style.whiteSpace = "pre-line";
    index += 1;

    if (index >= text.length) {
      window.clearInterval(timer);
      window.setTimeout(onComplete, 1800);
    }
  }, 44);
}

// Achievements unlock one at a time after the reward reveal.
function unlockAchievements() {
  achievements.forEach((achievement, index) => {
    window.setTimeout(() => achievement.classList.add("unlocked"), index * 330);
  });
}

// Main interaction: load the bar, hit the glow/confetti, then advance the story.
function handleRackClick() {
  rackButton.disabled = true;
  barbell.classList.add("loaded");
  playMetalSound();
  shakeScreen();
  flashScreen();
  burstConfetti(95);

  window.setTimeout(() => {
    showScreen("message");
    typeMessage(birthdayMessage, () => showScreen("challenge"));
  }, 1850);
}

// The answer is intentionally checked without capitalization sensitivity.
function handleRiddleSubmit(event) {
  event.preventDefault();
  const answer = answerInput.value.trim().toLowerCase();

  if (answer !== "consistency") {
    hintText.textContent = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    answerInput.select();
    shakeScreen();
    return;
  }

  hintText.textContent = "";
  vaultDoor.classList.add("unlocked");
  vaultZone.classList.add("open");
  flashScreen();
  burstConfetti(150, true);
  window.setTimeout(() => burstConfetti(120, true), 520);

  window.setTimeout(() => {
    showScreen("reward");
    unlockAchievements();
  }, 1900);
}

// Boot sequence.
function init() {
  setCanvasSize();
  createParticles();
  animateEffects();

  window.setTimeout(() => showScreen("hero"), 2600);
  rackButton.addEventListener("click", handleRackClick);
  acceptButton.addEventListener("click", () => {
    showScreen("riddle");
    answerInput.focus();
  });
  riddleForm.addEventListener("submit", handleRiddleSubmit);
  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    setCanvasSize();
    createParticles();
    animateEffects();
  });
}

init();
