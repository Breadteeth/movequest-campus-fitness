const STORAGE_KEY = "movequest-pet-v2";

const petTypes = {
  sprout: {
    label: "芽芽兽",
    defaultName: "芽芽",
    trait: "慢热、稳定，适合从课间散步开始。",
    stages: [
      { name: "幼芽期", min: 0, copy: "刚被领养，最需要稳定投喂。" },
      { name: "伸展期", min: 70, copy: "耳朵长出嫩叶，会主动跟着你晃。" },
      { name: "花冠期", min: 170, copy: "连续运动后开出光花，房间也会更亮。" }
    ]
  },
  cloud: {
    label: "云团兽",
    defaultName: "团团",
    trait: "轻盈、爱撒娇，适合碎片化走动。",
    stages: [
      { name: "小云团", min: 0, copy: "像一团软软的云，走一走就会飘起来。" },
      { name: "蓬蓬云", min: 70, copy: "身体变得更蓬松，心情好时会发光。" },
      { name: "晴空云", min: 170, copy: "能把小屋变成晴天，适合连续打卡。" }
    ]
  },
  otter: {
    label: "河狸兽",
    defaultName: "栗栗",
    trait: "活泼、能量高，适合操场挑战。",
    stages: [
      { name: "小河狸", min: 0, copy: "精力很多，但需要你带它出门。" },
      { name: "冲浪狸", min: 70, copy: "尾巴更有力，投喂后会弹起来。" },
      { name: "浪花狸", min: 170, copy: "完成高强度目标后，会解锁浪花纹。" }
    ]
  }
};

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
  bean: { name: "青柠能量豆", symbol: "豆", bond: 14, xp: 22, copy: "适合第一段路后的轻投喂。" },
  berry: { name: "蓝莓冻干", symbol: "莓", bond: 16, xp: 26, copy: "酸甜小零食，宠物会开心摇晃。" },
  toast: { name: "鸡蛋吐司", symbol: "吐", bond: 20, xp: 34, copy: "走到中段后的正餐奖励。" },
  ball: { name: "弹弹球", symbol: "球", bond: 18, xp: 30, copy: "不是食物，但能陪它玩一轮。" },
  milk: { name: "晚安奶昔", symbol: "奶", bond: 24, xp: 42, copy: "今天最后一口，喂完就收工。" },
  friend: { name: "好友蓝莓干", symbol: "友", bond: 10, xp: 0, copy: "好友宠物带来的串门礼物。" }
};

const defaultState = {
  introSeen: false,
  adopted: false,
  activeTab: "home",
  name: "阿澈",
  petType: "sprout",
  petName: "芽芽",
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
  introStart: document.getElementById("intro-start"),
  setupForm: document.getElementById("setup-form"),
  nameInput: document.getElementById("name-input"),
  petInput: document.getElementById("pet-input"),
  goalSelect: document.getElementById("goal-select"),
  petChoices: [...document.querySelectorAll("[data-pet-choice]")],
  goalLabel: document.getElementById("goal-label"),
  petName: document.getElementById("pet-name"),
  streakLabel: document.getElementById("streak-label"),
  stepsLabel: document.getElementById("steps-label"),
  fedLabel: document.getElementById("fed-label"),
  stageLabel: document.getElementById("stage-label"),
  petRoom: document.getElementById("pet-room"),
  petButton: document.getElementById("pet-button"),
  pet3d: document.getElementById("pet-3d"),
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
  growthLabel: document.getElementById("growth-label"),
  evolutionTitle: document.getElementById("evolution-title"),
  evolutionCopy: document.getElementById("evolution-copy"),
  evolutionProgress: document.getElementById("evolution-progress"),
  stageList: document.getElementById("stage-list"),
  tabButtons: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll("[data-panel]")],
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
let selectedPetType = state.petType;
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

function petType() {
  return petTypes[state.petType] || petTypes.sprout;
}

function selectedPet() {
  return petTypes[selectedPetType] || petTypes.sprout;
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

function currentStage() {
  const stages = petType().stages;
  return stages.reduce((current, stage, index) => {
    return state.growth >= stage.min ? { ...stage, index } : current;
  }, { ...stages[0], index: 0 });
}

function nextStage() {
  return petType().stages.find((stage) => state.growth < stage.min);
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
  if (state.completed) return `${state.petName}吃饱了，正在小屋里打盹。`;
  if (available.length > 0) return `${foods[available[0].food].name}已经解锁，可以去投喂页喂它。`;
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
  els.pet3d.classList.remove("pet-fed", "pet-patted", "pet-walk", "pet-evolve");
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
      // Timed collection keeps the product playable in a browser demo.
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

  const beforeStage = currentStage().index;
  const food = foods[milestone.food];
  state.fed.push(index);
  state.bond = clamp(state.bond + food.bond, 0, 100);
  state.growth += food.xp;
  const afterStage = currentStage();
  popFood(food);
  confetti(afterStage.index > beforeStage ? 30 : 16);

  if (afterStage.index > beforeStage) {
    setPetReaction("pet-evolve", 1100);
    showResult("进", `${state.petName}进化到${afterStage.name}`, afterStage.copy);
  } else {
    setPetReaction("pet-fed", 900);
    showResult(food.symbol, `喂了${food.name}`, `${state.petName}亲密度 +${food.bond}，成长值 +${food.xp}。`);
  }

  if (state.fed.length >= milestones().length && !state.completed) {
    state.completed = true;
    state.streak += 1;
    stopCollecting();
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
  showResult(food.symbol, "小雨送来蓝莓干", "串门礼物只加心情，不替代你的步数目标。");
  confetti(12);
  saveState();
  render();
}

function setTab(tab) {
  state.activeTab = tab;
  els.tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  saveState();
}

function selectPet(type) {
  selectedPetType = type;
  const pet = selectedPet();
  els.petChoices.forEach((button) => button.classList.toggle("selected", button.dataset.petChoice === type));
  els.shell.dataset.pet = type;
  els.petInput.value = pet.defaultName;
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

function renderStages() {
  const current = currentStage();
  els.stageList.innerHTML = petType().stages.map((stage, index) => {
    const reached = state.growth >= stage.min;
    const active = current.index === index;
    return `
      <article class="${reached ? "reached" : ""} ${active ? "active" : ""}">
        <strong>${stage.name}</strong>
        <span>${stage.min} 成长值</span>
        <p>${stage.copy}</p>
      </article>
    `;
  }).join("");
}

function renderEvolution() {
  const current = currentStage();
  const next = nextStage();
  const nextMin = next ? next.min : current.min + 100;
  const prevMin = current.min;
  const progress = next ? clamp(((state.growth - prevMin) / (nextMin - prevMin)) * 100, 0, 100) : 100;
  els.stageLabel.textContent = current.name;
  els.growthLabel.textContent = state.growth;
  els.evolutionTitle.textContent = `${petType().label} · ${current.name}`;
  els.evolutionCopy.textContent = next ? `再获得 ${next.min - state.growth} 成长值，进化到${next.name}。` : "已达到当前演示的最高进化形态。";
  els.evolutionProgress.style.width = `${progress}%`;
  renderStages();
}

function render() {
  const currentPlan = plan();
  const available = availableIndexes();
  const next = nextMilestone();
  const progress = clamp((state.steps / currentPlan.target) * 100, 0, 100);
  const mood = petMood();
  const stage = currentStage();

  els.shell.dataset.pet = state.adopted ? state.petType : selectedPetType;
  els.shell.dataset.mood = mood;
  els.shell.dataset.stage = String(stage.index);
  els.shell.classList.toggle("walking", state.collecting);
  els.pet3d.style.setProperty("--growth", `${Math.min(1.16, 1 + state.growth / 520)}`);
  els.nameInput.value = state.name;
  els.goalSelect.value = state.plan;
  if (state.adopted) els.petInput.value = state.petName;
  els.goalLabel.textContent = currentPlan.label;
  els.petName.textContent = state.petName;
  els.streakLabel.textContent = state.streak;
  els.stepsLabel.textContent = state.steps;
  els.fedLabel.textContent = `${fedCount()}/${milestones().length}`;
  els.walkProgress.style.width = `${progress}%`;
  els.nextLabel.textContent = state.completed ? "今天已经喂饱" : next ? `下个投喂：${next.steps} 步` : "食物已全部解锁";
  els.walkTitle.textContent = state.completed ? "宠物进入满足状态" : available.length ? "有食物可以投喂" : currentPlan.copy;
  els.motionLabel.textContent = state.collecting ? "暂停采集" : "开始走动";
  els.motionSubtitle.textContent = state.completed ? "明天继续" : available.length ? "去投喂页喂一口" : "走到节点解锁食物";
  els.motionButton.disabled = state.completed;
  els.foodCount.textContent = `${available.length} 份可喂`;
  els.moodBubble.textContent = moodText();
  els.friendButton.disabled = state.friendUsed;
  els.friendButton.textContent = state.friendUsed ? "已收下" : "收下";
  els.friendTitle.textContent = state.friendUsed ? "团团已经回家" : "小雨的团团在门口";
  els.friendCopy.textContent = state.friendUsed ? `${state.petName}心情变好了，但步数还要自己走。` : "收下蓝莓干，给宠物加一点心情。";

  renderFoodList();
  renderBadges();
  renderEvolution();
  setTab(state.activeTab);
}

function tiltPet(event) {
  const rect = els.petRoom.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
  els.petRoom.style.setProperty("--tilt-x", `${y}deg`);
  els.petRoom.style.setProperty("--tilt-y", `${x}deg`);
}

els.introStart.addEventListener("click", () => {
  state.introSeen = true;
  saveState();
  switchScreen("adopt");
});

els.petChoices.forEach((button) => {
  button.addEventListener("click", () => selectPet(button.dataset.petChoice));
});

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state = {
    ...structuredClone(defaultState),
    introSeen: true,
    adopted: true,
    activeTab: "home",
    name: els.nameInput.value.trim() || "阿澈",
    petType: selectedPetType,
    petName: els.petInput.value.trim() || selectedPet().defaultName,
    plan: els.goalSelect.value
  };
  saveState();
  switchScreen("app");
  render();
  showResult("蛋", "领养成功", `${state.petName}住进小屋了。先走到第一个步数节点，再去投喂页喂它。`);
});

els.motionButton.addEventListener("click", toggleCollecting);
els.petButton.addEventListener("click", patPet);
els.friendButton.addEventListener("click", useFriendSnack);
els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});
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

selectedPetType = state.petType;
selectPet(selectedPetType);
switchScreen(state.adopted ? "app" : state.introSeen ? "adopt" : "intro");
render();
