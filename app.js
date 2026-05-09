const STORAGE_KEY = "movequest-app-v4";

const defaultState = {
  appReady: false,
  name: "林澈",
  school: "杭州大学城",
  dorm: "6-402",
  avatar: "A",
  goal: "stress",
  permissions: {
    gps: true,
    health: true,
    push: true
  },
  level: 1,
  xp: 0,
  coins: 120,
  streak: 0,
  teamScore: 500,
  rankGap: 80,
  completedTasks: [],
  litNodes: [],
  nudged: [],
  joinedChallenges: [],
  purchased: [],
  chestOpened: false,
  feed: [
    { title: "沛雯点亮了操场补给点", text: "小队积分 +24，今晚还差一次助攻。" },
    { title: "子豪还没开始运动", text: "发送轻提醒可完成社交任务。" }
  ],
  run: {
    active: false,
    progress: 0,
    seconds: 0,
    distance: 0,
    combo: 1,
    visited: []
  }
};

const avatarTitles = {
  A: "夜跑新人",
  B: "晨练派",
  C: "组队达人"
};

const quests = [
  {
    id: "warmup",
    icon: "W",
    title: "课间 8 分钟唤醒",
    text: "完成肩颈、髋部和踝关节活动。",
    reward: { xp: 40, coins: 12 },
    action: "complete"
  },
  {
    id: "run",
    icon: "M",
    title: "点亮三处补给点",
    text: "操场、图书馆、宿舍各经过一次。",
    reward: { xp: 120, coins: 40 },
    action: "map"
  },
  {
    id: "squad",
    icon: "S",
    title: "给一位队友助攻",
    text: "推动宿舍队完成今晚集结。",
    reward: { xp: 60, coins: 18 },
    action: "squad"
  },
  {
    id: "chest",
    icon: "B",
    title: "打开新手宝箱",
    text: "领取头像框、金币和赛季 XP。",
    reward: { xp: 70, coins: 35 },
    action: "chest"
  }
];

const routePoints = [
  { left: 62, top: 102, node: "track" },
  { left: 154, top: 54, node: "field" },
  { left: 276, top: 92, node: "library" },
  { left: 286, top: 214, node: "library" },
  { left: 160, top: 262, node: "dorm" },
  { left: 72, top: 190, node: "dorm" },
  { left: 62, top: 102, node: "track" }
];

const teammates = [
  { id: "wen", avatar: "W", name: "沛雯", status: "刚跑完 1.6km", text: "等你补最后一个补给点。" },
  { id: "hao", avatar: "H", name: "子豪", status: "未打卡", text: "轻提醒后通常 10 分钟内上线。" },
  { id: "yi", avatar: "Y", name: "嘉仪", status: "组队中", text: "想约一个图书馆东门出发。" }
];

const challenges = [
  { id: "relay", title: "宿舍接力 4 人局", text: "每人完成 1 个补给点，小队额外 +60。", tag: "缺 1 人" },
  { id: "night", title: "21:30 夜跑冲榜", text: "结算前完成跑图，金币翻倍。", tag: "限时" },
  { id: "club", title: "社团燃脂赛", text: "按社团总分钟数累计赛季声望。", tag: "可加入" }
];

const badges = [
  { id: "start", icon: "GO", title: "开局上路", text: "完成账号创建。", unlocked: (s) => s.appReady },
  { id: "warm", icon: "W", title: "运动开机", text: "完成第一次低门槛任务。", unlocked: (s) => s.completedTasks.includes("warmup") },
  { id: "map", icon: "M", title: "校园跑图者", text: "点亮全部补给点。", unlocked: (s) => s.completedTasks.includes("run") },
  { id: "team", icon: "S", title: "宿舍助攻手", text: "给队友发送一次助攻。", unlocked: (s) => s.completedTasks.includes("squad") },
  { id: "box", icon: "B", title: "宝箱猎手", text: "打开新手宝箱。", unlocked: (s) => s.chestOpened },
  { id: "rank", icon: "TOP", title: "冲榜新人", text: "小队排名进入前三。", unlocked: (s) => s.rankGap <= 0 }
];

const shopItems = [
  { id: "meal", title: "健康餐 5 元券", price: 180, text: "晚训后可兑换。" },
  { id: "skin", title: "荧光跑道皮肤", price: 260, text: "跑图页展示限定轨迹。" },
  { id: "frame", title: "新手冲榜头像框", price: 220, text: "战队榜单展示。" }
];

const els = {
  shell: document.querySelector(".phone-shell"),
  screens: [...document.querySelectorAll(".screen")],
  tabs: [...document.querySelectorAll(".tab")],
  authForm: document.getElementById("auth-form"),
  nameInput: document.getElementById("name-input"),
  schoolSelect: document.getElementById("school-select"),
  dormSelect: document.getElementById("dorm-select"),
  timeSelect: document.getElementById("time-select"),
  avatarButtons: [...document.querySelectorAll("[data-avatar]")],
  goalButtons: [...document.querySelectorAll("[data-goal]")],
  permissionButtons: [...document.querySelectorAll("[data-permission]")],
  saveProfile: document.getElementById("save-profile"),
  enterApp: document.getElementById("enter-app"),
  homeName: document.getElementById("home-name"),
  homeSchool: document.getElementById("home-school"),
  playerAvatar: document.getElementById("player-avatar"),
  playerTitle: document.getElementById("player-title"),
  levelLabel: document.getElementById("level-label"),
  xpBar: document.getElementById("xp-bar"),
  nextReward: document.getElementById("next-reward"),
  streakLabel: document.getElementById("streak-label"),
  coinLabel: document.getElementById("coin-label"),
  teamRankLabel: document.getElementById("team-rank-label"),
  storyProgress: document.getElementById("story-progress"),
  taskProgress: document.getElementById("task-progress"),
  questList: document.getElementById("quest-list"),
  openChest: document.getElementById("open-chest"),
  chestTitle: document.getElementById("chest-title"),
  chestDesc: document.getElementById("chest-desc"),
  runState: document.getElementById("run-state"),
  distanceLabel: document.getElementById("distance-label"),
  timeLabel: document.getElementById("time-label"),
  comboLabel: document.getElementById("combo-label"),
  runnerDot: document.getElementById("runner-dot"),
  boostTitle: document.getElementById("boost-title"),
  boostCopy: document.getElementById("boost-copy"),
  boostButton: document.getElementById("boost-button"),
  runToggle: document.getElementById("run-toggle"),
  teamName: document.getElementById("team-name"),
  rankGap: document.getElementById("rank-gap"),
  teamProgress: document.getElementById("team-progress"),
  teamFeed: document.getElementById("team-feed"),
  teammateList: document.getElementById("teammate-list"),
  nudgeAll: document.getElementById("nudge-all"),
  challengeList: document.getElementById("challenge-list"),
  seasonLabel: document.getElementById("season-label"),
  passTitle: document.getElementById("pass-title"),
  passXp: document.getElementById("pass-xp"),
  passTrack: document.getElementById("pass-track"),
  badgeCount: document.getElementById("badge-count"),
  badgeGrid: document.getElementById("badge-grid"),
  walletLabel: document.getElementById("wallet-label"),
  shopList: document.getElementById("shop-list"),
  sideRank: document.getElementById("side-rank"),
  sideGap: document.getElementById("side-gap"),
  sideRowRank: document.getElementById("side-row-rank"),
  sideScore: document.getElementById("side-score"),
  rewardModal: document.getElementById("reward-modal"),
  rewardTitle: document.getElementById("reward-title"),
  rewardCopy: document.getElementById("reward-copy"),
  closeReward: document.getElementById("close-reward"),
  toastRegion: document.getElementById("toast-region"),
  confettiLayer: document.getElementById("confetti-layer")
};

let state = loadState();
let runTimer = null;

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? mergeState(JSON.parse(stored)) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(stored) {
  return {
    ...structuredClone(defaultState),
    ...stored,
    permissions: { ...defaultState.permissions, ...(stored.permissions || {}) },
    run: { ...defaultState.run, ...(stored.run || {}) }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function switchScreen(name) {
  els.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
  els.shell.classList.toggle("app-ready", ["home", "map", "squad", "rewards"].includes(name));
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tabTarget === name));
}

function addXp(amount) {
  state.xp += amount;
  const nextLevel = Math.floor(state.xp / 160) + 1;
  if (nextLevel > state.level) {
    state.level = nextLevel;
    showReward("升级了", `你升到 Lv.${state.level}，新的赛季奖励已解锁。`);
  }
}

function completeQuest(id) {
  if (state.completedTasks.includes(id)) return;
  const quest = quests.find((item) => item.id === id);
  state.completedTasks.push(id);
  addXp(quest.reward.xp);
  state.coins += quest.reward.coins;
  state.teamScore += id === "squad" ? 34 : 18;
  state.rankGap = Math.max(0, state.rankGap - (id === "run" ? 38 : 18));
  if (state.completedTasks.length >= 2 && state.streak === 0) state.streak = 1;
  showToast("任务完成", `+${quest.reward.xp} XP，+${quest.reward.coins} 金币。`);
  popConfetti(16);
  saveState();
  render();
}

function canOpenChest() {
  return state.completedTasks.filter((id) => id !== "chest").length >= 2 && !state.chestOpened;
}

function openChest() {
  if (state.chestOpened) {
    showToast("宝箱已开启", "奖励已经放进赛季背包。");
    return;
  }
  if (!canOpenChest()) {
    showToast("还差一点", "先完成任意 2 个任务。");
    return;
  }
  state.chestOpened = true;
  state.coins += 80;
  addXp(90);
  if (!state.completedTasks.includes("chest")) state.completedTasks.push("chest");
  showReward("新手宝箱开启", "获得 80 金币、90 XP 和新手头像框。");
  popConfetti(28);
  saveState();
  render();
}

function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  els.toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function showReward(title, text) {
  els.rewardTitle.textContent = title;
  els.rewardCopy.textContent = text;
  els.rewardModal.classList.add("active");
  els.rewardModal.setAttribute("aria-hidden", "false");
}

function closeReward() {
  els.rewardModal.classList.remove("active");
  els.rewardModal.setAttribute("aria-hidden", "true");
}

function popConfetti(count = 18) {
  const colors = ["#d8ff4f", "#ff6a4a", "#4776ff", "#ffc94a", "#61d9c3"];
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

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function runPoint() {
  const index = Math.min(routePoints.length - 1, Math.floor(state.run.progress * (routePoints.length - 1)));
  return routePoints[index];
}

function visitNode(node) {
  const nodeMap = { field: "操场", library: "图书馆", dorm: "宿舍" };
  if (!nodeMap[node] || state.run.visited.includes(node)) return;
  state.run.visited.push(node);
  if (!state.litNodes.includes(node)) state.litNodes.push(node);
  state.coins += node === "dorm" ? 20 : 12;
  state.teamScore += 18;
  state.rankGap = Math.max(0, state.rankGap - 12);
  showToast(`${nodeMap[node]}已点亮`, "补给奖励已入账，小队积分上升。");
  popConfetti(10);
}

function tickRun() {
  state.run.seconds += 4;
  state.run.progress = Math.min(1, state.run.progress + 0.07);
  state.run.distance = Math.min(1.8, state.run.progress * 1.8);
  state.run.combo = Math.min(5, Math.floor(state.run.progress * 6) + 1);
  visitNode(runPoint().node);
  if (state.run.progress >= 1) {
    stopRun();
    ["field", "library", "dorm"].forEach(visitNode);
    if (!state.completedTasks.includes("run")) completeQuest("run");
    showReward("跑图完成", "三处补给点已点亮，宿舍队排名上升。");
  }
  saveState();
  render();
}

function startRun() {
  if (state.run.progress >= 1) {
    state.run = structuredClone(defaultState.run);
  }
  state.run.active = true;
  runTimer = setInterval(tickRun, 700);
  saveState();
  render();
}

function stopRun() {
  state.run.active = false;
  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }
  saveState();
  render();
}

function boostRun() {
  if (!state.run.active) {
    startRun();
  }
  state.run.progress = Math.min(1, state.run.progress + 0.12);
  state.run.combo = Math.min(5, state.run.combo + 1);
  state.coins += 8;
  showToast("冲刺成功", `连击提升到 x${state.run.combo}。`);
  tickRun();
}

function nudgeTeammate(id) {
  if (state.nudged.includes(id)) return;
  state.nudged.push(id);
  state.coins += 14;
  state.teamScore += 26;
  state.rankGap = Math.max(0, state.rankGap - 18);
  state.feed.unshift({ title: "你发起了一次战队集结", text: "队友上线后双方都能获得金币。" });
  if (!state.completedTasks.includes("squad")) completeQuest("squad");
  showToast("助攻已发送", "队友收到轻提醒，小队积分上升。");
  saveState();
  render();
}

function joinChallenge(id) {
  if (state.joinedChallenges.includes(id)) return;
  state.joinedChallenges.push(id);
  state.teamScore += 22;
  state.rankGap = Math.max(0, state.rankGap - 10);
  state.feed.unshift({ title: "你加入了限时挑战", text: "完成跑图后获得额外结算奖励。" });
  showToast("挑战加入", "限时奖励已加入今日任务池。");
  saveState();
  render();
}

function buyItem(id) {
  const item = shopItems.find((entry) => entry.id === id);
  if (state.purchased.includes(id)) {
    showToast("已拥有", "这个奖励已经在背包里。");
    return;
  }
  if (state.coins < item.price) {
    showToast("金币不足", "完成跑图或战队任务可继续获得金币。");
    return;
  }
  state.coins -= item.price;
  state.purchased.push(id);
  showReward("兑换成功", `${item.title} 已加入你的背包。`);
  saveState();
  render();
}

function resetApp() {
  stopRun();
  state = structuredClone(defaultState);
  localStorage.removeItem(STORAGE_KEY);
  render();
  switchScreen("auth");
  showToast("已重新开始", "从创建校园账号开始体验。");
}

function renderProfileSelections() {
  els.avatarButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.avatar === state.avatar);
  });
  els.goalButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.goal === state.goal);
  });
  els.permissionButtons.forEach((button) => {
    button.classList.toggle("active", Boolean(state.permissions[button.dataset.permission]));
  });
}

function renderHome() {
  const completedCount = state.completedTasks.length;
  const storyCount = state.litNodes.filter((node) => ["field", "library", "dorm"].includes(node)).length;
  const xpProgress = Math.min(100, Math.round((state.xp % 160) / 160 * 100));
  els.homeName.textContent = state.name;
  els.homeSchool.textContent = state.school;
  els.playerAvatar.textContent = state.avatar;
  els.playerAvatar.className = `player-avatar avatar-${state.avatar.toLowerCase()}`;
  els.playerTitle.textContent = avatarTitles[state.avatar];
  els.levelLabel.textContent = `Lv.${state.level}`;
  els.xpBar.style.width = `${xpProgress}%`;
  els.nextReward.textContent = state.chestOpened ? "今晚继续跑图，冲击宿舍杯前三。" : "完成 2 个任务，打开新手宝箱。";
  els.streakLabel.textContent = `${state.streak} 天`;
  els.coinLabel.textContent = state.coins;
  els.teamRankLabel.textContent = state.rankGap <= 0 ? "#3" : "#4";
  els.storyProgress.textContent = `${storyCount} / 3 已点亮`;
  els.taskProgress.textContent = `${completedCount}/${quests.length}`;
  els.openChest.classList.toggle("ready", canOpenChest());
  els.chestTitle.textContent = state.chestOpened ? "宝箱已开启" : "新手宝箱";
  els.chestDesc.textContent = state.chestOpened ? "奖励已放进赛季背包。" : canOpenChest() ? "可以开启，领取新手奖励。" : "完成 2 个任务后开启。";
}

function renderQuests() {
  els.questList.innerHTML = quests.map((quest) => {
    const done = state.completedTasks.includes(quest.id);
    const buttonText = done ? "已完成" : quest.action === "map" ? "出发" : quest.action === "squad" ? "助攻" : quest.action === "chest" ? "开启" : "完成";
    return `
      <article class="quest-card ${done ? "done" : ""}">
        <span class="quest-icon">${quest.icon}</span>
        <div>
          <h4>${quest.title}</h4>
          <p>${quest.text}</p>
        </div>
        <button class="quest-claim" type="button" data-quest="${quest.id}" ${done ? "disabled" : ""}>${buttonText}</button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-quest]").forEach((button) => {
    button.addEventListener("click", () => {
      const quest = quests.find((item) => item.id === button.dataset.quest);
      if (quest.action === "complete") completeQuest(quest.id);
      if (quest.action === "map") switchScreen("map");
      if (quest.action === "squad") switchScreen("squad");
      if (quest.action === "chest") openChest();
    });
  });
}

function renderMap() {
  const point = runPoint();
  els.runState.textContent = state.run.active ? "记录中" : state.run.progress >= 1 ? "已完成" : "待出发";
  els.runToggle.textContent = state.run.active ? "暂停" : state.run.progress >= 1 ? "重新跑图" : "开始跑图";
  els.distanceLabel.textContent = `${state.run.distance.toFixed(2)} km`;
  els.timeLabel.textContent = formatTime(state.run.seconds);
  els.comboLabel.textContent = `x${state.run.combo}`;
  els.runnerDot.textContent = state.avatar;
  els.runnerDot.style.left = `${point.left}px`;
  els.runnerDot.style.top = `${point.top}px`;

  document.querySelectorAll(".zone").forEach((zone) => zone.classList.remove("completed"));
  if (state.litNodes.includes("field")) document.querySelector(".zone-a").classList.add("completed");
  if (state.litNodes.includes("library")) document.querySelector(".zone-b").classList.add("completed");
  if (state.litNodes.includes("dorm")) document.querySelector(".zone-c").classList.add("completed");

  const next = ["field", "library", "dorm"].find((node) => !state.litNodes.includes(node));
  const label = { field: "操场补给点", library: "图书馆补给点", dorm: "宿舍补给点" }[next] || "全地图点亮";
  els.boostTitle.textContent = label;
  els.boostCopy.textContent = next ? "冲刺后更快到达，获得金币和小队积分。" : "可以重新跑图刷连击和金币。";
}

function renderSquad() {
  els.teamName.textContent = `${state.dorm} 动量队`;
  els.rankGap.textContent = state.rankGap;
  els.teamProgress.style.width = `${Math.min(100, 68 + (80 - state.rankGap) * 0.38)}%`;
  els.teamFeed.innerHTML = state.feed.slice(0, 3).map((item) => `
    <article class="feed-bubble">
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </article>
  `).join("");

  els.teammateList.innerHTML = teammates.map((mate) => {
    const nudged = state.nudged.includes(mate.id);
    return `
      <article class="teammate-card">
        <span class="teammate-avatar">${mate.avatar}</span>
        <div>
          <h4>${mate.name} · ${mate.status}</h4>
          <p>${mate.text}</p>
        </div>
        <button class="mini-action" type="button" data-nudge="${mate.id}" ${nudged ? "disabled" : ""}>${nudged ? "已助攻" : "助攻"}</button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-nudge]").forEach((button) => {
    button.addEventListener("click", () => nudgeTeammate(button.dataset.nudge));
  });

  els.challengeList.innerHTML = challenges.map((challenge) => {
    const joined = state.joinedChallenges.includes(challenge.id);
    return `
      <article class="challenge-card">
        <div class="challenge-card-top">
          <div>
            <strong>${challenge.title}</strong>
            <p>${challenge.text}</p>
          </div>
          <span class="challenge-tag">${joined ? "进行中" : challenge.tag}</span>
        </div>
        <button class="mini-action" type="button" data-challenge="${challenge.id}" ${joined ? "disabled" : ""}>${joined ? "已加入" : "加入"}</button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-challenge]").forEach((button) => {
    button.addEventListener("click", () => joinChallenge(button.dataset.challenge));
  });
}

function renderRewards() {
  const unlocked = badges.filter((badge) => badge.unlocked(state));
  const passPercent = Math.min(100, Math.round((state.xp / 640) * 100));
  els.seasonLabel.textContent = `Lv.${state.level}`;
  els.passTitle.textContent = state.level >= 3 ? "冲榜段位" : "新手段位";
  els.passXp.textContent = `${state.xp} XP`;
  els.passTrack.style.width = `${passPercent}%`;
  els.badgeCount.textContent = `${unlocked.length}/${badges.length}`;
  els.walletLabel.textContent = `${state.coins} 金币`;
  els.badgeGrid.innerHTML = badges.map((badge) => {
    const has = badge.unlocked(state);
    return `
      <article class="badge-card ${has ? "unlocked" : "locked"}">
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-card-top">
          <h4>${badge.title}</h4>
          <span class="badge-state">${has ? "已解锁" : "未解锁"}</span>
        </div>
        <p>${badge.text}</p>
      </article>
    `;
  }).join("");

  els.shopList.innerHTML = shopItems.map((item) => {
    const bought = state.purchased.includes(item.id);
    return `
      <button class="shop-item" type="button" data-shop="${item.id}">
        <div>
          <span>${item.text}</span>
          <strong>${item.title}</strong>
        </div>
        <strong>${bought ? "已拥有" : `${item.price} 金币`}</strong>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-shop]").forEach((button) => {
    button.addEventListener("click", () => buyItem(button.dataset.shop));
  });
}

function renderSidePanel() {
  const rank = state.rankGap <= 0 ? 3 : 4;
  els.sideRank.textContent = `#${rank}`;
  els.sideRowRank.textContent = rank;
  els.sideGap.textContent = state.rankGap <= 0 ? "已进入前三" : `差 ${state.rankGap} 分进前三`;
  els.sideScore.textContent = state.teamScore;
}

function render() {
  renderProfileSelections();
  renderHome();
  renderQuests();
  renderMap();
  renderSquad();
  renderRewards();
  renderSidePanel();
}

els.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.name = els.nameInput.value.trim() || "林澈";
  state.school = els.schoolSelect.value;
  saveState();
  switchScreen("profile");
});

els.avatarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.avatar = button.dataset.avatar;
    saveState();
    renderProfileSelections();
  });
});

els.goalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.goal = button.dataset.goal;
    saveState();
    renderProfileSelections();
  });
});

els.saveProfile.addEventListener("click", () => {
  state.dorm = els.dormSelect.value;
  saveState();
  switchScreen("permission");
});

els.permissionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.permission;
    state.permissions[key] = !state.permissions[key];
    saveState();
    renderProfileSelections();
  });
});

els.enterApp.addEventListener("click", () => {
  state.appReady = true;
  state.feed.unshift({ title: `${state.name} 加入了 ${state.dorm} 动量队`, text: "新手主线已开启，今晚目标是点亮三处补给点。" });
  saveState();
  render();
  switchScreen("home");
  showReward("账号创建成功", "新手任务已解锁，先完成今晚第一关。");
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchScreen(tab.dataset.tabTarget));
});

document.querySelectorAll("[data-tab-target]").forEach((button) => {
  if (!button.classList.contains("tab")) {
    button.addEventListener("click", () => switchScreen(button.dataset.tabTarget));
  }
});

els.openChest.addEventListener("click", openChest);
els.closeReward.addEventListener("click", closeReward);
els.rewardModal.addEventListener("click", (event) => {
  if (event.target === els.rewardModal) closeReward();
});

els.runToggle.addEventListener("click", () => {
  state.run.active ? stopRun() : startRun();
});

els.boostButton.addEventListener("click", boostRun);

els.nudgeAll.addEventListener("click", () => {
  teammates.forEach((mate) => {
    if (!state.nudged.includes(mate.id)) {
      state.nudged.push(mate.id);
    }
  });
  state.teamScore += 48;
  state.rankGap = Math.max(0, state.rankGap - 28);
  state.coins += 30;
  state.feed.unshift({ title: "全队集结成功", text: "队友状态刷新，小队获得集结奖励。" });
  if (!state.completedTasks.includes("squad")) completeQuest("squad");
  showReward("集结成功", "全队收到提醒，金币和小队积分已结算。");
  saveState();
  render();
});

if (state.run.active) startRun();
render();
switchScreen(state.appReady ? "home" : "auth");
