const STORAGE_KEY = "movequest-pet-v1";

const plans = {
  easy: {
    label: "课间散步",
    target: 600,
    copy: "先走 600 步，分 3 次把宠物喂饱。",
    milestones: [
      { steps: 180, food: "bean" },
      { steps: 360, food: "berry" },
      { steps: 600, food: "milk" }
    ]
  },
  daily: {
    label: "校园快走",
    target: 1200,
    copy: "今天走 1200 步，解锁 4 份食物。",
    milestones: [
      { steps: 250, food: "bean" },
      { steps: 550, food: "berry" },
      { steps: 850, food: "toast" },
      { steps: 1200, food: "milk" }
    ]
  },
  hard: {
    label: "操场一圈",
    target: 2000,
    copy: "走到 2000 步，完成一整套照顾。",
    milestones: [
      { steps: 300, food: "bean" },
      { steps: 700, food: "berry" },
      { steps: 1100, food: "toast" },
      { steps: 1550, food: "ball" },
      { steps: 2000, food: "milk" }
    ]
  }
};

const foods = {
  bean: { name: "青柠能量豆", symbol: "豆", bond: 14, xp: 18, copy: "适合第一段路后的轻投喂。" },
  berry: { name: "蓝莓冻干", symbol: "莓", bond: 16, xp: 22, copy: "酸甜小零食，宠物会开心摇晃。" },
  toast: { name: "鸡蛋吐司", symbol: "吐", bond: 20, xp: 28, copy: "走到中段后的正餐奖励。" },
  ball: { name: "弹弹球", symbol: "球", bond: 18, xp: 26, copy: "不是食物，但能陪它玩一轮。" },
  milk: { name: "晚安奶昔", symbol: "奶", bond: 24, xp: 34, copy: "今天最后一口，喂完就收工。" },
  friend: { name: "好友蓝莓干", symbol: "友", bond: 10, xp: 0, copy: "小雨的团团带来的串门礼物。" }
};

const defaultState = {
  adopted: false,
  name: "阿澈",
  petName: "糯糯",
  plan: "daily",
  steps: 0,
  fed: [],
  bond: 28,
  growth: 0,
  streak: 0,
  friendUsed: false,
  completed: false,
  collecting: false
};

const els = {
  shell: document.querySelector(".app-shell"),
  screens: [...document.querySelectorAll(".screen")],
  setupForm: document.getElementById("setup-form"),
  nameInput: document.getElementById("name-input"),
  petInput: document.getElementById("pet-input"),
  goalSelect: document.getElementById("goal-select"),
  goalLabel: document.getElementById("goal-label"),
  petName: document.getElementById("pet-name"),
  streakLabel: document.getElementById("streak-label"),
  stepsLabel: document.getElementById("steps-label"),
  fedLabel: document.getElementById("fed-label"),
  bondLabel: document.getElementById("bond-label"),
  petRoom: document.getElementById("pet-room"),
  petButton: document.getElementById("pet-button"),
  pet3d: document.getElementById("pet-3d"),
  petFace: document.getElementById("pet-face"),
  foodPop: document.getElementById("food-pop"),
  moodBubble: document.getElementById("mood-bubble"),
  nextLabel: document.getElementById("next-label"),
  walkTitle: document.getElementById("walk-title"),
  walkProgress: document.getElementById("walk-progress"),
  motionButton: document.getElementById("motion-button"),
  motionLabel: document.getElementById("motion-label"),
  motionSubtitle: document.getElementById("motion-subtitle"),
  foodCount: document.getElementById("food-count"),
  foodList: document.getElementById("food-list"),
  friendTitle: document.getElementById("friend-title"),
  friendCopy: document.getElementById("friend-copy"),
  friendButton: document.getElementById("friend-button"),
  badges: {
    walk: document.getElementById("badge-walk"),
    feed: document.getElementById("badge-feed"),
    full: document.getElementById("badge-full")
  },
  resultModal: document.getElementById("result-modal"),
  resultSymbol: document.getElementById("result-symbol"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  closeResult: document.getElementById("close-result"),
  toastRegion: document.getElementById("toast-region"),
  confettiLayer: document.getElementById("confetti-layer")
};

let state = loadState();
let collectTimer = null;
let lastMotionAt = 0;

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

function plan() {
  return plans[state.plan] || plans.daily;
}

function milestones() {
  return plan().milestones;
}

function switchScreen(name) {
  els.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fedCount() {
  return state.fed.length;
}

function unlockedIndexes() {
  return milestones()
    .map((item, index) => ({ ...item, index }))
    .filter((item) => state.steps >= item.steps);
}

function availableIndexes() {
  return unlockedIndexes().filter((item) => !state.fed.includes(item.index));
}

function nextMilestone() {
  return milestones().find((item, index) => state.steps < item.steps && !state.fed.includes(index));
}

function petMood() {
  if (state.completed) return "full";
  if (availableIndexes().length > 0) return "ready";
  if (state.collecting) return "walking";
  if (fedCount() === 0) return "hungry";
  return state.bond >= 70 ? "happy" : "calm";
}

function moodText() {
  const available = availableIndexes();
  const next = nextMilestone();
  if (state.completed) return `${state.petName}吃饱了，正窝在小屋里打盹。`;
  if (available.length > 0) return `${foods[available[0].food].name}已经解锁，可以投喂。`;
  if (state.collecting) return `${state.petName}在等你走到下一个投喂节点。`;
  if (next) return `再走 ${next.steps - state.steps} 步，解锁下一份食物。`;
  return "食物都解锁了，把它们喂给宠物吧。";
}

function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  els.toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 2300);
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

function confetti(count = 14) {
  const colors = ["#dfff4f", "#ff7a59", "#3f6df6", "#ffd166", "#68e0c2"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 32}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 160}ms`;
    els.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1200);
  }
}

function setPetReaction(className, duration = 720) {
  els.pet3d.classList.remove("pet-fed", "pet-patted", "pet-walk");
  void els.pet3d.offsetWidth;
  els.pet3d.classList.add(className);
  setTimeout(() => els.pet3d.classList.remove(className), duration);
}

function popFood(food) {
  els.foodPop.textContent = food.symbol;
  els.foodPop.classList.remove("active");
  void els.foodPop.offsetWidth;
  els.foodPop.classList.add("active");
  setTimeout(() => els.foodPop.classList.remove("active"), 900);
}

function addSteps(amount) {
  if (state.completed) return;
  const before = unlockedIndexes().length;
  state.steps = clamp(state.steps + amount, 0, plan().target);
  const after = unlockedIndexes().length;

  if (after > before) {
    const unlocked = unlockedIndexes()[after - 1];
    const food = foods[unlocked.food];
    showToast("食物已解锁", `${food.name}可以投喂了。`);
    setPetReaction("pet-walk", 680);
  }

  saveState();
  render();
}

async function toggleCollecting() {
  if (state.collecting) {
    stopCollecting();
    return;
  }

  if (state.completed) {
    showToast("今天已经喂饱", "明天再带它继续散步。");
    return;
  }

  state.collecting = true;
  saveState();
  render();

  if (window.DeviceMotionEvent?.requestPermission) {
    try {
      await window.DeviceMotionEvent.requestPermission();
    } catch {
      // Timed collection keeps the product playable in a browser.
    }
  }

  collectTimer = setInterval(() => {
    addSteps(Math.floor(Math.random() * 55) + 95);
  }, 760);
}

function stopCollecting() {
  state.collecting = false;
  if (collectTimer) {
    clearInterval(collectTimer);
    collectTimer = null;
  }
  saveState();
  render();
}

function handleMotion(event) {
  if (!state.collecting) return;
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
  const power = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
  const now = Date.now();
  if (power > 24 && now - lastMotionAt > 420) {
    lastMotionAt = now;
    addSteps(22);
  }
}

function feed(index) {
  const milestone = milestones()[index];
  if (!milestone || state.fed.includes(index)) return;
  if (state.steps < milestone.steps) {
    showToast("还没解锁", `再走 ${milestone.steps - state.steps} 步才能投喂。`);
    return;
  }

  const food = foods[milestone.food];
  state.fed.push(index);
  state.bond = clamp(state.bond + food.bond, 0, 100);
  state.growth += food.xp;
  popFood(food);
  setPetReaction("pet-fed", 900);
  showResult(food.symbol, `喂了${food.name}`, `${state.petName}亲密度 +${food.bond}，成长值 +${food.xp}。`);
  confetti(16);

  if (state.fed.length >= milestones().length && !state.completed) {
    state.completed = true;
    state.streak += 1;
    stopCollecting();
    setTimeout(() => {
      showResult("饱", "今日喂饱了", `${state.name}完成了${plan().label}，${state.petName}明天还会等你。`);
      confetti(34);
    }, 260);
  }

  saveState();
  render();
}

function patPet() {
  state.bond = clamp(state.bond + 2, 0, 100);
  setPetReaction("pet-patted", 620);
  showToast("摸摸成功", `${state.petName}蹭了蹭你的手。`);
  saveState();
  render();
}

function useFriendSnack() {
  if (state.friendUsed) return;
  const food = foods.friend;
  state.friendUsed = true;
  state.bond = clamp(state.bond + food.bond, 0, 100);
  popFood(food);
  setPetReaction("pet-fed", 850);
  showResult(food.symbol, "小雨送来蓝莓干", `这份串门礼物只加心情，不替代你的步数目标。`);
  confetti(12);
  saveState();
  render();
}

function renderFoodList() {
  els.foodList.innerHTML = milestones().map((item, index) => {
    const food = foods[item.food];
    const done = state.fed.includes(index);
    const ready = state.steps >= item.steps && !done;
    const left = Math.max(0, item.steps - state.steps);
    const status = done ? "已投喂" : ready ? "可以投喂" : `还差 ${left} 步`;
    const button = done ? "已吃掉" : ready ? "投喂" : `${item.steps} 步`;
    return `
      <article class="food-card ${ready ? "ready" : ""} ${done ? "done" : ""}">
        <div class="food-symbol">${food.symbol}</div>
        <div>
          <strong>${food.name}</strong>
          <p>${food.copy}</p>
          <span>${status}</span>
        </div>
        <button type="button" data-feed="${index}" ${ready ? "" : "disabled"}>${button}</button>
      </article>
    `;
  }).join("");

  els.foodList.querySelectorAll("[data-feed]").forEach((button) => {
    button.addEventListener("click", () => feed(Number(button.dataset.feed)));
  });
}

function renderBadges() {
  const walked = state.steps > 0;
  const fed = fedCount() > 0;
  const full = state.completed;
  els.badges.walk.classList.toggle("done", walked);
  els.badges.feed.classList.toggle("done", fed);
  els.badges.full.classList.toggle("done", full);
  els.badges.walk.querySelector("strong").textContent = `${walked ? 1 : 0}/1`;
  els.badges.feed.querySelector("strong").textContent = `${fed ? 1 : 0}/1`;
  els.badges.full.querySelector("strong").textContent = `${full ? 1 : 0}/1`;
}

function render() {
  const currentPlan = plan();
  const available = availableIndexes();
  const next = nextMilestone();
  const progress = clamp((state.steps / currentPlan.target) * 100, 0, 100);
  const mood = petMood();

  els.shell.dataset.mood = mood;
  els.shell.classList.toggle("walking", state.collecting);
  els.pet3d.style.setProperty("--growth", `${Math.min(1.14, 1 + state.growth / 420)}`);
  els.nameInput.value = state.name;
  els.petInput.value = state.petName;
  els.goalSelect.value = state.plan;
  els.goalLabel.textContent = currentPlan.label;
  els.petName.textContent = state.petName;
  els.streakLabel.textContent = state.streak;
  els.stepsLabel.textContent = state.steps;
  els.fedLabel.textContent = `${fedCount()}/${milestones().length}`;
  els.bondLabel.textContent = state.bond;
  els.walkProgress.style.width = `${progress}%`;
  els.nextLabel.textContent = state.completed ? "今天已经喂饱" : next ? `下个投喂：${next.steps} 步` : "食物已全部解锁";
  els.walkTitle.textContent = state.completed ? "宠物进入满足状态" : available.length ? "有食物可以投喂" : currentPlan.copy;
  els.motionLabel.textContent = state.collecting ? "暂停采集" : "开始走动";
  els.motionSubtitle.textContent = state.completed ? "明天继续" : available.length ? "先喂一口" : "走到节点解锁食物";
  els.motionButton.disabled = state.completed;
  els.foodCount.textContent = `${available.length} 份可喂`;
  els.moodBubble.textContent = moodText();
  els.friendButton.disabled = state.friendUsed;
  els.friendButton.textContent = state.friendUsed ? "已收下" : "收下";
  els.friendTitle.textContent = state.friendUsed ? "团团已经回家" : "小雨的团团在门口";
  els.friendCopy.textContent = state.friendUsed ? "糯糯心情变好了，但步数还要自己走。" : "收下蓝莓干，给糯糯加一点心情。";

  renderFoodList();
  renderBadges();
}

function tiltPet(event) {
  const rect = els.petRoom.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
  els.petRoom.style.setProperty("--tilt-x", `${y}deg`);
  els.petRoom.style.setProperty("--tilt-y", `${x}deg`);
}

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state = {
    ...structuredClone(defaultState),
    adopted: true,
    name: els.nameInput.value.trim() || "阿澈",
    petName: els.petInput.value.trim() || "糯糯",
    plan: els.goalSelect.value
  };
  saveState();
  switchScreen("play");
  render();
  showResult("蛋", "领养成功", `${state.petName}住进小屋了。先走到第一个步数节点，再回来投喂。`);
});

els.motionButton.addEventListener("click", toggleCollecting);
els.petButton.addEventListener("click", patPet);
els.friendButton.addEventListener("click", useFriendSnack);
els.petRoom.addEventListener("pointermove", tiltPet);
els.petRoom.addEventListener("pointerleave", () => {
  els.petRoom.style.setProperty("--tilt-x", "0deg");
  els.petRoom.style.setProperty("--tilt-y", "0deg");
});
els.closeResult.addEventListener("click", closeResult);
els.resultModal.addEventListener("click", (event) => {
  if (event.target === els.resultModal) closeResult();
});
window.addEventListener("devicemotion", handleMotion);

els.nameInput.value = state.name;
els.petInput.value = state.petName;
els.goalSelect.value = state.plan;
switchScreen(state.adopted ? "play" : "start");
render();
