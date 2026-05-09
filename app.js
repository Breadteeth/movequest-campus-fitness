const STORAGE_KEY = "movequest-orbit-v1";
const SYNC_WINDOW = 0.48;
const ORBIT_SPEED = 0.00082;

const goals = {
  easy: { label: "走路热身", target: 4, stepUnit: 10, copy: "目标：走到约 40 步，点亮 4 个光点。" },
  daily: { label: "课间快走", target: 6, stepUnit: 16, copy: "目标：走到约 96 步，点亮 6 个光点。" },
  hard: { label: "操场挑战", target: 8, stepUnit: 18, copy: "目标：走到约 144 步，点亮 8 个光点。" }
};

const defaultState = {
  started: false,
  name: "阿澈",
  goal: "daily",
  steps: 0,
  pulses: 0,
  lit: [],
  streak: 0,
  friendUsed: false,
  completed: false,
  collecting: false,
  angle: 0,
  score: 0
};

const els = {
  screens: [...document.querySelectorAll(".screen")],
  setupForm: document.getElementById("setup-form"),
  nameInput: document.getElementById("name-input"),
  goalSelect: document.getElementById("goal-select"),
  playerName: document.getElementById("player-name"),
  sessionLabel: document.getElementById("session-label"),
  streakLabel: document.getElementById("streak-label"),
  stepsLabel: document.getElementById("steps-label"),
  pulseLabel: document.getElementById("pulse-label"),
  litLabel: document.getElementById("lit-label"),
  gameCanvas: document.getElementById("game-canvas"),
  introCanvas: document.getElementById("intro-canvas"),
  orbitHint: document.getElementById("orbit-hint"),
  motionButton: document.getElementById("motion-button"),
  motionLabel: document.getElementById("motion-label"),
  motionSubtitle: document.getElementById("motion-subtitle"),
  syncButton: document.getElementById("sync-button"),
  syncSubtitle: document.getElementById("sync-subtitle"),
  friendTitle: document.getElementById("friend-title"),
  friendCopy: document.getElementById("friend-copy"),
  friendButton: document.getElementById("friend-button"),
  badges: {
    motion: document.getElementById("badge-motion"),
    sync: document.getElementById("badge-sync"),
    clear: document.getElementById("badge-clear")
  },
  resultModal: document.getElementById("result-modal"),
  resultSymbol: document.getElementById("result-symbol"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  closeResult: document.getElementById("close-result"),
  toastRegion: document.getElementById("toast-region"),
  confettiLayer: document.getElementById("confetti-layer")
};

const gameCtx = els.gameCanvas.getContext("2d");
const introCtx = els.introCanvas.getContext("2d");
let state = loadState();
let collectTimer = null;
let lastMotionAt = 0;
let lastFrame = performance.now();
let lastHintText = "";
let lastReadyAt = 0;
let lastReadyNode = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...structuredClone(defaultState), ...JSON.parse(raw) } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function goal() {
  return goals[state.goal] || goals.daily;
}

function targetSteps() {
  const g = goal();
  return g.target * g.stepUnit;
}

function switchScreen(name) {
  els.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  els.toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function showResult(symbol, title, copy) {
  els.resultSymbol.textContent = symbol;
  els.resultTitle.textContent = title;
  els.resultCopy.textContent = copy;
  els.resultModal.classList.add("active");
  els.resultModal.setAttribute("aria-hidden", "false");
}

function closeResult() {
  els.resultModal.classList.remove("active");
  els.resultModal.setAttribute("aria-hidden", "true");
}

function confetti(count = 16) {
  const colors = ["#dfff4f", "#ff6a4d", "#4b77ff", "#ffc94d", "#65dcc3"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 28}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 140}ms`;
    els.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1100);
  }
}

function addSteps(amount) {
  if (state.completed) return;
  const before = Math.floor(state.steps / goal().stepUnit);
  state.steps += amount;
  const after = Math.floor(state.steps / goal().stepUnit);
  if (after > before) {
    const gained = after - before;
    state.pulses += gained;
    showToast(`同步次数 +${gained}`, "角色靠近光点时，点一下同步。");
  }
  saveState();
  renderHud();
}

async function toggleCollecting() {
  if (state.collecting) {
    stopCollecting();
    return;
  }

  state.collecting = true;
  saveState();
  renderHud();

  if (window.DeviceMotionEvent?.requestPermission) {
    try {
      await window.DeviceMotionEvent.requestPermission();
    } catch {
      // Timed collection keeps the app playable when motion permission is unavailable.
    }
  }

  collectTimer = setInterval(() => {
    addSteps(Math.floor(Math.random() * 5) + 5);
  }, 760);
}

function stopCollecting() {
  state.collecting = false;
  if (collectTimer) {
    clearInterval(collectTimer);
    collectTimer = null;
  }
  saveState();
  renderHud();
}

function handleMotion(event) {
  if (!state.collecting) return;
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
  const power = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
  const now = Date.now();
  if (power > 24 && now - lastMotionAt > 420) {
    lastMotionAt = now;
    addSteps(2);
  }
}

function nodes() {
  const target = goal().target;
  return Array.from({ length: target }, (_, index) => {
    const angle = (Math.PI * 2 * index) / target - Math.PI / 2;
    return { index, angle };
  });
}

function angleDistance(a, b) {
  const diff = Math.abs(((a - b + Math.PI) % (Math.PI * 2)) - Math.PI);
  return diff;
}

function nearestNode() {
  return nodes()
    .filter((node) => !state.lit.includes(node.index))
    .map((node) => ({ ...node, distance: angleDistance(state.angle, node.angle) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function syncPulse() {
  if (state.completed) return;
  if (state.pulses <= 0) {
    showToast("还没有同步次数", "先开始走动，走几步再回来点。");
    return;
  }

  const node = nearestNode();
  if (!node) return;
  const graceHit = lastReadyNode === node.index && Date.now() - lastReadyAt < 1800;
  const inWindow = node.distance < SYNC_WINDOW || graceHit;

  if (inWindow) {
    state.pulses -= 1;
    state.lit.push(node.index);
    lastReadyNode = null;
    const perfect = node.distance < 0.18;
    state.score += perfect ? 140 : 100;
    if (navigator.vibrate) navigator.vibrate(perfect ? 24 : 12);
    showResult("光", perfect ? "准点命中" : "点亮成功", `已点亮 ${state.lit.length}/${goal().target} 个光点。`);
    confetti(14);
    if (state.lit.length >= goal().target) {
      state.completed = true;
      state.streak += 1;
      stopCollecting();
      setTimeout(() => {
        showResult("星", "今日星轨完成", "你用现实走动完成了今天的运动。");
        confetti(30);
      }, 240);
    }
  } else {
    showToast("再等一下", "光点靠近角色时再点，不会扣次数。");
  }

  saveState();
  renderHud();
}

function useFriend() {
  if (state.friendUsed) return;
  state.friendUsed = true;
  state.pulses += 2;
  showResult("友", "小雨送来 2 次同步", "她开始走动时，也会收到你的提醒。");
  confetti(10);
  saveState();
  renderHud();
}

function updateOrbitHint() {
  const near = nearestNode();
  const g = goal();
  const ready = !state.completed && state.pulses > 0 && near && near.distance < SYNC_WINDOW;
  if (ready) {
    lastReadyAt = Date.now();
    lastReadyNode = near.index;
  }
  els.syncButton.classList.toggle("ready", Boolean(ready));

  let hint = "开始走动，让星轨亮起来";
  if (state.completed) {
    hint = "今日星轨已完成，明天继续";
  } else if (state.pulses <= 0) {
    hint = `先走满 ${g.stepUnit} 步，获得 1 次同步`;
  } else if (ready) {
    hint = "现在点同步";
  } else {
    hint = "等角色靠近光点再点";
  }

  if (hint !== lastHintText) {
    els.orbitHint.textContent = hint;
    lastHintText = hint;
  }
}

function renderHud() {
  const g = goal();
  els.playerName.textContent = state.name;
  els.sessionLabel.textContent = g.label;
  els.streakLabel.textContent = state.streak;
  els.stepsLabel.textContent = state.steps;
  els.pulseLabel.textContent = state.pulses;
  els.litLabel.textContent = `${state.lit.length}/${g.target}`;
  els.motionLabel.textContent = state.collecting ? "正在采集" : "开始走动";
  els.motionSubtitle.textContent = `目标约 ${targetSteps()} 步`;
  els.syncButton.disabled = state.pulses <= 0 || state.completed;
  els.syncSubtitle.textContent = state.pulses > 0 ? "踩准时机点亮" : "先走动获取";
  els.friendButton.disabled = state.friendUsed;
  els.friendButton.textContent = state.friendUsed ? "已领" : "领取";
  els.friendTitle.textContent = state.friendUsed ? "小雨已助攻" : "小雨在线";
  els.friendCopy.textContent = state.friendUsed ? "好友送来的同步次数已加入。" : "送你 2 次同步，不聊天也能互相拉一把。";

  const motionDone = state.steps > 0;
  const syncDone = state.lit.length >= Math.min(3, g.target);
  els.badges.motion.classList.toggle("done", motionDone);
  els.badges.sync.classList.toggle("done", syncDone);
  els.badges.clear.classList.toggle("done", state.completed);
  els.badges.motion.querySelector("strong").textContent = `${motionDone ? 1 : 0}/1`;
  els.badges.sync.querySelector("strong").textContent = `${Math.min(state.lit.length, 3)}/3`;
  els.badges.clear.querySelector("strong").textContent = `${state.completed ? 1 : 0}/1`;

  updateOrbitHint();
}

function setupCanvas(canvas, ctx) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function pointOnOrbit(centerX, centerY, radiusX, radiusY, angle) {
  return {
    x: centerX + Math.cos(angle) * radiusX,
    y: centerY + Math.sin(angle) * radiusY
  };
}

function drawOrbitScene(ctx, canvas, time, preview = false) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.32;
  const ry = height * 0.26;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1;
  for (let i = -8; i < 9; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-width, i * 28);
    ctx.lineTo(width, i * 28);
    ctx.stroke();
  }
  ctx.restore();

  const pulse = 0.5 + Math.sin(time / 650) * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(223,255,79,${0.35 + pulse * 0.18})`;
  ctx.lineWidth = 8;
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(223,255,79,0.55)";
  ctx.stroke();
  ctx.restore();

  const list = preview ? Array.from({ length: 6 }, (_, index) => ({ index, angle: (Math.PI * 2 * index) / 6 - Math.PI / 2 })) : nodes();
  list.forEach((node) => {
    const p = pointOnOrbit(cx, cy, rx, ry, node.angle - 0.18);
    const lit = preview || state.lit.includes(node.index);
    const near = !preview && !lit && angleDistance(state.angle, node.angle) < SYNC_WINDOW;
    ctx.beginPath();
    ctx.arc(p.x, p.y, near ? 14 : 10, 0, Math.PI * 2);
    ctx.fillStyle = lit ? "#dfff4f" : near ? "#ff6a4d" : "rgba(255,255,255,0.72)";
    ctx.shadowBlur = near || lit ? 22 : 0;
    ctx.shadowColor = lit ? "rgba(223,255,79,0.7)" : "rgba(255,106,77,0.7)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.stroke();
  });

  const runnerAngle = preview ? time / 1300 : state.angle;
  const runner = pointOnOrbit(cx, cy, rx, ry, runnerAngle - 0.18);
  ctx.beginPath();
  ctx.arc(runner.x, runner.y, preview ? 22 : 18, 0, Math.PI * 2);
  ctx.fillStyle = "#ff6a4d";
  ctx.shadowBlur = 26;
  ctx.shadowColor = "rgba(255,106,77,0.65)";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = "900 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(preview ? "MQ" : "我", runner.x, runner.y);
  ctx.restore();
}

function animate(time) {
  const delta = Math.min(32, time - lastFrame);
  lastFrame = time;
  if (!state.completed) {
    state.angle = (state.angle + delta * ORBIT_SPEED) % (Math.PI * 2);
  }
  drawOrbitScene(gameCtx, els.gameCanvas, time, false);
  drawOrbitScene(introCtx, els.introCanvas, time, true);
  if (state.started) updateOrbitHint();
  requestAnimationFrame(animate);
}

function resize() {
  setupCanvas(els.gameCanvas, gameCtx);
  setupCanvas(els.introCanvas, introCtx);
}

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.name = els.nameInput.value.trim() || "阿澈";
  state.goal = els.goalSelect.value;
  state.started = true;
  saveState();
  switchScreen("play");
  resize();
  renderHud();
  showResult("光", "今日星轨已开启", goals[state.goal].copy);
});

els.motionButton.addEventListener("click", toggleCollecting);
els.syncButton.addEventListener("click", syncPulse);
els.friendButton.addEventListener("click", useFriend);
els.closeResult.addEventListener("click", closeResult);
els.resultModal.addEventListener("click", (event) => {
  if (event.target === els.resultModal) closeResult();
});

window.addEventListener("devicemotion", handleMotion);
window.addEventListener("resize", resize);

els.nameInput.value = state.name;
els.goalSelect.value = state.goal;
switchScreen(state.started ? "play" : "start");
resize();
renderHud();
requestAnimationFrame(animate);
